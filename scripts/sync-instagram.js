#!/usr/bin/env node
'use strict';

/**
 * Pulls Ganji's Instagram posts into src/data/instagram.json and downloads
 * their images into public/ig/.
 *
 * This runs at build time, never in the browser. Two reasons:
 *
 *   1. The access token can post and delete on the account. Anything in a CRA
 *      bundle is public -- REACT_APP_* values are baked into the compiled JS
 *      in plain text -- so the token can never go near the client.
 *   2. Instagram's media_url is a signed CDN URL that expires within days.
 *      Caching the API response would leave the site full of broken images, so
 *      the bytes are pulled into the repo instead. Only permalink is durable.
 *
 * Usage:
 *   node scripts/sync-instagram.js --fixture     # offline, no token needed
 *   node scripts/sync-instagram.js               # live, needs IG_ACCESS_TOKEN
 *   node scripts/sync-instagram.js --no-images   # metadata only
 *   node scripts/sync-instagram.js --prune       # drop images for deleted posts
 */

const fs = require('node:fs');
const path = require('node:path');

const { parseCaption } = require('./lib/parse-caption.js');
const {
  fetchAllMedia,
  fetchProfile,
  refreshToken,
  downloadImage,
} = require('./lib/instagram-api.js');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'src', 'data', 'instagram.json');
const IMAGE_DIR = path.join(ROOT, 'public', 'ig');
const FIXTURE_FILE = path.join(__dirname, 'fixtures', 'media.sample.json');

/** Public URL prefix for downloaded images; public/ is served at the site root. */
const IMAGE_URL_PREFIX = '/ig';

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    fixture: args.has('--fixture'),
    noImages: args.has('--no-images'),
    prune: args.has('--prune'),
    skipRefresh: args.has('--no-refresh'),
  };
}

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

/**
 * Picks the still image for a media object. Videos and reels expose the frame
 * as thumbnail_url; media_url on those is the video file itself.
 */
function stillImageUrl(media) {
  if (media.media_type === 'VIDEO') return media.thumbnail_url || null;
  return media.media_url || media.thumbnail_url || null;
}

/**
 * Collapses one API media object into the shape the site consumes.
 * Image paths are filled in later, once the downloads have run.
 */
function normalise(media) {
  const parsed = parseCaption(media.caption, media.timestamp);
  const timestamp = new Date(media.timestamp).toISOString();

  const children = media.children && Array.isArray(media.children.data)
    ? media.children.data
    : [];

  return {
    id: media.id,
    permalink: media.permalink,
    timestamp,
    // The month the post belongs to, used for the Archive accordion. Events
    // with a parsed date are regrouped onto that date further down.
    postedMonth: timestamp.slice(0, 7),
    mediaType: media.media_type,
    caption: media.caption || '',
    image: null,
    images: [],
    sourceImageUrl: stillImageUrl(media),
    sourceChildUrls: children.map(stillImageUrl).filter(Boolean),
    ...parsed,
  };
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

function imageFileName(postId, index) {
  return index === null ? `${postId}.jpg` : `${postId}-${index}.jpg`;
}

/**
 * Downloads every image a post needs, skipping any already on disk.
 *
 * Skipping is what keeps the daily commits small: once a post's image is in
 * the repo it never gets re-fetched, even though its CDN URL has long expired.
 */
async function downloadPostImages(post, { noImages }) {
  if (noImages) return { downloaded: 0, failed: 0 };

  let downloaded = 0;
  let failed = 0;

  const jobs = [];
  if (post.sourceImageUrl) jobs.push({ url: post.sourceImageUrl, index: null });
  post.sourceChildUrls.forEach((url, i) => jobs.push({ url, index: i }));

  for (const job of jobs) {
    const fileName = imageFileName(post.id, job.index);
    const destPath = path.join(IMAGE_DIR, fileName);
    const publicPath = `${IMAGE_URL_PREFIX}/${fileName}`;

    if (!fs.existsSync(destPath)) {
      try {
        await downloadImage(job.url, destPath);
        downloaded += 1;
      } catch (error) {
        // One dead image must not sink the whole sync; the post still renders
        // with its caption and a placeholder.
        console.warn(`  ! image failed for ${post.id}: ${error.message}`);
        failed += 1;
        continue;
      }
    }

    if (job.index === null) post.image = publicPath;
    else post.images.push(publicPath);
  }

  // A carousel has no top-level media_url, so its first slide stands in.
  if (!post.image && post.images.length > 0) [post.image] = post.images;

  return { downloaded, failed };
}

/** Deletes images in public/ig that no longer belong to any known post. */
function pruneImages(posts) {
  if (!fs.existsSync(IMAGE_DIR)) return 0;

  const keep = new Set();
  for (const post of posts) {
    if (post.image) keep.add(path.basename(post.image));
    for (const img of post.images) keep.add(path.basename(img));
  }

  let removed = 0;
  for (const file of fs.readdirSync(IMAGE_DIR)) {
    if (file.startsWith('.')) continue;
    if (keep.has(file)) continue;
    fs.unlinkSync(path.join(IMAGE_DIR, file));
    removed += 1;
  }

  return removed;
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

/**
 * Renews the 60-day token on every run rather than near its deadline.
 *
 * Refreshing daily collapses two failure modes into one: the token can only
 * die if the sync itself has not run for 60 straight days, so keeping the
 * schedule alive is the only thing anyone has to care about.
 */
async function renewToken(token) {
  try {
    const result = await refreshToken({ token });
    console.log(`Token refreshed, valid until ${result.expiresAt.slice(0, 10)}`);

    // Hand the new value to the workflow so it can write it back to the secret.
    if (process.env.GITHUB_OUTPUT) {
      // Registered as a secret first: Actions does not mask step outputs on its
      // own, and an unmasked token in a public build log is a live credential.
      console.log(`::add-mask::${result.token}`);
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `refreshed_token=${result.token}\ntoken_expires_at=${result.expiresAt}\n`
      );
    }

    return result;
  } catch (error) {
    // A failed refresh is not fatal for this run -- the current token still
    // works -- but it is the early warning that the 60-day clock is running.
    console.warn(`! Token refresh failed: ${error.message}`);
    console.warn('  The current token still works, but renew it before it expires.');
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const options = parseArgs(process.argv);
  const token = process.env.IG_ACCESS_TOKEN;

  if (!options.fixture && !token) {
    console.error('IG_ACCESS_TOKEN is not set.');
    console.error('Run with --fixture to work offline, or see docs/instagram-sync.md.');
    process.exit(1);
  }

  let rawMedia;
  let account = null;

  if (options.fixture) {
    console.log('Running against fixtures (no network, no token).');
    rawMedia = JSON.parse(fs.readFileSync(FIXTURE_FILE, 'utf8')).data;
    account = { username: 'ganjiumd', id: 'fixture', account_type: 'MEDIA_CREATOR' };
  } else {
    account = await fetchProfile({ token });
    console.log(`Authenticated as @${account.username} (${account.account_type})`);
    rawMedia = await fetchAllMedia({ token });
  }

  console.log(`Fetched ${rawMedia.length} posts.`);

  const posts = rawMedia
    .map(normalise)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  let downloaded = 0;
  let failed = 0;

  // Fixture image URLs point at example.invalid on purpose: there is nothing
  // to download, and the UI falls back to its placeholder.
  const skipImages = options.noImages || options.fixture;

  for (const post of posts) {
    const result = await downloadPostImages(post, { noImages: skipImages });
    downloaded += result.downloaded;
    failed += result.failed;
  }

  if (downloaded > 0 || failed > 0) {
    console.log(`Images: ${downloaded} downloaded, ${failed} failed.`);
  }

  if (options.prune && !skipImages) {
    const removed = pruneImages(posts);
    if (removed > 0) console.log(`Pruned ${removed} orphaned image(s).`);
  }

  // The source URLs are expiring CDN links with no value once downloaded, so
  // they are dropped rather than committed as dead links.
  const cleaned = posts.map(({ sourceImageUrl, sourceChildUrls, ...rest }) => rest);

  const payload = {
    syncedAt: new Date().toISOString(),
    account: { username: account.username, id: account.id },
    fixture: options.fixture || undefined,
    postCount: cleaned.length,
    eventCount: cleaned.filter((p) => p.isEvent).length,
    posts: cleaned,
  };

  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(
    `Wrote ${path.relative(ROOT, DATA_FILE)} ` +
      `(${payload.postCount} posts, ${payload.eventCount} events).`
  );

  const undated = cleaned.filter((p) => p.isEvent && !p.date);
  if (undated.length > 0) {
    console.log(`\n${undated.length} event(s) had no parseable date:`);
    for (const post of undated) {
      console.log(`  ${post.id}  ${JSON.stringify((post.title || '').slice(0, 48))}`);
    }
    console.log('Add a date in src/data/overrides.js to place them on the calendar.');
  }

  if (!options.fixture && !options.skipRefresh) {
    await renewToken(token);
  }
}

main().catch((error) => {
  console.error(`\nSync failed: ${error.message}`);
  // A non-zero exit fails the workflow, which is what makes GitHub email the
  // repo owner. Silent staleness is the failure mode worth avoiding.
  process.exit(1);
});

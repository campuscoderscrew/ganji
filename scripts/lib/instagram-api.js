'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const { Readable } = require('node:stream');

/**
 * Thin client for the Instagram API with Instagram Login.
 *
 * This is the Instagram-Login flavour, not Facebook Login: the account only
 * needs to be a Professional account, with no linked Facebook Page. The
 * tradeoff is that the token expires after 60 days, so refreshToken() is
 * called on every sync rather than near the deadline -- see docs/instagram-sync.md.
 */

const API_BASE = 'https://graph.instagram.com';
const DEFAULT_VERSION = process.env.IG_API_VERSION || 'v23.0';

/**
 * media_url on a VIDEO is the video file, so thumbnail_url is what gets
 * downloaded for those. children{} covers carousels.
 */
const MEDIA_FIELDS = [
  'id',
  'caption',
  'media_type',
  'media_url',
  'permalink',
  'thumbnail_url',
  'timestamp',
  'username',
  'children{id,media_type,media_url,thumbnail_url}',
].join(',');

const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Keeps tokens out of anything that might end up in a CI log. */
function redact(value) {
  return String(value).replace(/access_token=[^&\s]+/g, 'access_token=REDACTED');
}

async function requestJson(url, { attempts = 4 } = {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
    } catch (cause) {
      lastError = new Error(`Network error calling ${redact(url)}: ${redact(cause.message)}`);
      if (attempt < attempts) {
        await sleep(2 ** attempt * 500);
        continue;
      }
      throw lastError;
    }

    if (RETRY_STATUSES.has(response.status) && attempt < attempts) {
      await sleep(2 ** attempt * 500);
      continue;
    }

    const body = await response.json().catch(() => null);

    if (!response.ok || (body && body.error)) {
      const apiError = body && body.error ? body.error : {};
      const detail = [
        apiError.message || `HTTP ${response.status}`,
        apiError.type ? `type=${apiError.type}` : null,
        apiError.code ? `code=${apiError.code}` : null,
        apiError.error_subcode ? `subcode=${apiError.error_subcode}` : null,
      ]
        .filter(Boolean)
        .join(' ');

      throw new Error(`Instagram API error: ${redact(detail)}`);
    }

    return body;
  }

  throw lastError || new Error('Request failed');
}

/**
 * Walks the /me/media edge, following cursors until exhausted.
 *
 * @param {object}  options
 * @param {string}  options.token     Long-lived access token.
 * @param {number}  options.limit     Page size (max 100).
 * @param {number}  options.maxPages  Safety stop so a bad cursor cannot loop.
 * @returns {Promise<object[]>} Raw media objects, newest first.
 */
async function fetchAllMedia({ token, limit = 50, maxPages = 20, version = DEFAULT_VERSION }) {
  const posts = [];
  let url =
    `${API_BASE}/${version}/me/media` +
    `?fields=${encodeURIComponent(MEDIA_FIELDS)}` +
    `&limit=${limit}&access_token=${encodeURIComponent(token)}`;

  for (let page = 0; page < maxPages && url; page += 1) {
    const body = await requestJson(url);
    if (Array.isArray(body.data)) posts.push(...body.data);
    url = body.paging && body.paging.next ? body.paging.next : null;
  }

  return posts;
}

/** Fetches the authenticated account's own profile. */
async function fetchProfile({ token, version = DEFAULT_VERSION }) {
  return requestJson(
    `${API_BASE}/${version}/me` +
      `?fields=id,username&access_token=${encodeURIComponent(token)}`
  );
}

/**
 * Exchanges a still-valid long-lived token for a fresh 60-day one.
 *
 * An expired token cannot be refreshed -- recovery means redoing the OAuth
 * flow by hand. The token must also be at least 24 hours old, so a refresh
 * right after minting one is a no-op failure, not a bug.
 */
async function refreshToken({ token, version = DEFAULT_VERSION }) {
  const body = await requestJson(
    `${API_BASE}/refresh_access_token` +
      `?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`
  );

  return {
    token: body.access_token,
    expiresInSeconds: body.expires_in,
    expiresAt: new Date(Date.now() + body.expires_in * 1000).toISOString(),
  };
}

/**
 * Downloads one image to disk.
 *
 * Instagram's CDN hands out signed URLs that expire within days, so the bytes
 * have to be pulled into the repo at sync time. Only permalink is durable.
 */
async function downloadImage(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${redact(url)}: HTTP ${response.status}`);
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  // Written to a temp path first so an interrupted run cannot leave a
  // half-written file that the next run would treat as already downloaded.
  const tempPath = `${destPath}.part`;
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(tempPath));
  fs.renameSync(tempPath, destPath);

  return destPath;
}

module.exports = {
  API_BASE,
  DEFAULT_VERSION,
  MEDIA_FIELDS,
  fetchAllMedia,
  fetchProfile,
  refreshToken,
  downloadImage,
  redact,
};

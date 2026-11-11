# Instagram sync

The Events and Archive pages are generated from Ganji's Instagram posts. A
GitHub Action pulls new posts once a day, parses the captions, downloads the
images, and redeploys the site. Nobody has to copy anything across by hand.

**If you are the next person maintaining this, read the
[When it breaks](#when-it-breaks) section first.** There is one failure mode
that is annoying to recover from, and it is easy to prevent.

---

## How it works

```
GitHub Action (daily, 09:00 UTC)
  -> GET /me/media                       Instagram Graph API
  -> parse captions                      scripts/lib/parse-caption.js
  -> download images  -> public/ig/
  -> write            -> src/data/instagram.json
  -> commit, build, deploy to Pages
```

Everything happens at **build time**, never in the browser. Two reasons, both
of which rule out the "just call the API from React" approach:

1. **The token is a credential.** It can post and delete on the account.
   Anything in a Create React App bundle is public -- `REACT_APP_*` values are
   compiled into the JavaScript in plain text -- so it can never go near the
   client.
2. **Instagram image URLs expire.** `media_url` is a signed CDN link that dies
   within days. Only `permalink` is durable. So the image bytes are pulled into
   the repo, which is why `public/ig/` is committed rather than ignored.

A useful consequence: if the sync stops working, **the site does not break**.
It keeps serving the last successful sync. It just stops learning about new
posts, which is why the "Updated from Instagram on ..." line exists at the
bottom of the Events and Archive pages.

---

## Files

| Path | What it is |
| --- | --- |
| `scripts/sync-instagram.js` | The sync. Fetches, parses, downloads, writes. |
| `scripts/lib/parse-caption.js` | Turns a caption into a structured event. |
| `scripts/lib/instagram-api.js` | API client and token refresh. |
| `scripts/fixtures/media.sample.json` | Fake API response for offline work. |
| `scripts/__tests__/` | Parser tests. Run with `npm run test:parser`. |
| `src/data/instagram.json` | **Generated.** Never edit; the next sync overwrites it. |
| `src/data/admin-data.json` | **Hand-edited / written by /admin.** Corrections and manual events. Always wins. |
| `src/data/events.js` | Derives the Archive and calendar from the two above. |
| `src/pages/Admin.js` | The admin dashboard. See admin-dashboard.md. |
| `.github/workflows/sync-instagram.yml` | The scheduled job. |

---

## Working on it without a token

Everything runs offline against fixtures:

```bash
npm run sync:fixture
```

This writes `src/data/instagram.json` from `scripts/fixtures/media.sample.json`
without touching the network. Images are skipped, so the UI falls back to its
placeholder, and the footer says "Showing sample data" so nobody mistakes it
for the real feed.

Adding a caption to the fixture file is the fastest way to check how the parser
handles a new caption style.

---

## First-time setup

### 1. Make the account Professional

Instagram -> Settings -> Account type and tools -> Switch to professional
account. Creator or Business both work. This is free and takes about two
minutes.

The API cannot read personal accounts at all, so this step is not optional. It
does **not** require a Facebook Page -- see
[Why Instagram Login](#why-instagram-login-and-not-facebook-login) below.

### 2. Create a Meta app

At <https://developers.facebook.com/apps>, create an app and add the
**Instagram** product with **Instagram Login**. Under API setup, add the
Instagram account as a tester and accept the invite from the Instagram account's
settings.

Leave the app in **Development mode**. App Review is only needed to act on
*other people's* accounts; reading your own with your own token does not require
it.

### 3. Get a long-lived token

Generate a token from the app dashboard, then exchange it for a 60-day one. The
dashboard's "Generate token" button does this for you; the scope needed is
`instagram_business_basic`.

### 4. Add it to the repository

GitHub -> Settings -> Secrets and variables -> Actions -> New repository secret:

| Secret | Required | What it does |
| --- | --- | --- |
| `IG_ACCESS_TOKEN` | yes | The long-lived Instagram token. |
| `GH_PAT` | recommended | A personal access token with **Secrets: write**, so the workflow can store each renewed token. Without it the token must be renewed by hand every 60 days. |

Then run the workflow once by hand: Actions -> "Sync Instagram and deploy" ->
Run workflow.

### 5. Check the result

The run should log `Authenticated as @ganjiumd`, the number of posts fetched,
and `Token refreshed, valid until ...`. The site's footer should show today's
date.

---

## Writing captions the parser understands

The parser reads the emoji-keyed detail block that Ganji already writes:

```
WORKSHOP DETAILS
[calendar]: Tuesday, July 1st
[clock]: 7-8PM
[pin]: Activities Room near Terpzone (STAMP)
```

| Emoji | Field | Notes |
| --- | --- | --- |
| calendar | date | The only thing that puts an event on the calendar. |
| alarm clock | time | Free text, shown as written. |
| round pin | location | Free text, shown as written. |
| money / ticket | cost | Optional. |

Two things worth knowing:

- **Prose dates are ignored on purpose.** A real caption once read "THIS
  THURSDAY" two lines above a date line saying "Tuesday, July 1st". Only the
  keyed line is trusted.
- **Years are inferred** from when the post went up, so captions never need
  one. A December post about a January event resolves to the next year.

Song titles are picked up from phrasings like "come learn X by Y" or
"performing X by Y". Event type comes from keywords: *workshop*, *taught by*
and *come learn* mean WORKSHOP; *competing*, *prelims* and *finals* mean
COMPETITION; *performing* and *showcase* mean PERFORMANCE.

A post with no date **and** no type keyword -- a recap, an e-board
announcement -- is treated as ordinary content and stays off both pages.

---

## Fixing what the parser gets wrong

Captions are written by humans in a hurry, so the parser will sometimes be
wrong. Nobody needs to edit code to fix it -- use the admin dashboard at
**`/admin`**, which is documented in [admin-dashboard.md](admin-dashboard.md).

Everything it saves lands in `src/data/admin-data.json`, which is safe to edit
by hand as well:

```json
{
  "overrides": {
    "17999000000000003": { "title": "Ultimate Showcase" },
    "17999000000000007": { "hidden": true },
    "17999000000000008": { "date": "2026-03-14" }
  },
  "manualEvents": []
}
```

Keys are Instagram post ids -- find them in `src/data/instagram.json`. These
values always win and are never overwritten by a sync.

The sync prints any event it could not date, so those are easy to spot.

---

## When it breaks

### Nothing is updating, but the site looks fine

That is the expected failure. The site serves the last good sync forever. Check
Actions -> "Sync Instagram and deploy" and look at the most recent run.

### "This scheduled workflow was disabled"

**GitHub disables scheduled workflows after 60 days of repository inactivity.**
For a student club that lands squarely in summer break.

Fix: open the Actions tab and press **Enable workflow**. One click.

Prevention: have one officer run the workflow by hand once over the summer, or
point an external scheduler at the `repository_dispatch` trigger -- the
inactivity rule does not apply to those.

### The token expired

This is the expensive one. **An expired token cannot be refreshed** -- the
refresh endpoint only accepts a token that is still valid. Past 60 days it is
permanently dead and the only way back is redoing
[First-time setup](#3-get-a-long-lived-token) steps 3 and 4 by hand.

The workflow renews the token on **every run** rather than waiting for the
deadline, so the token can only die if the sync has not run for 60 straight
days. In practice that means: **keep the schedule alive and the token takes
care of itself.** The two failure modes above are really one.

If `GH_PAT` is not configured, the renewed token is not stored and the clock
keeps running regardless of whether the sync works. Set it.

### Images are missing

A post's image download can fail without sinking the sync -- the run logs
`! image failed for <id>` and the post still renders with a placeholder.
Re-running the workflow retries only the missing files, since anything already
in `public/ig/` is skipped.

---

## Why Instagram Login and not Facebook Login

Meta offers two ways in. This project uses **Instagram API with Instagram
Login**:

| | Facebook Login | Instagram Login (this project) |
| --- | --- | --- |
| Facebook Page required | yes | **no** |
| Token lifetime | Page token effectively non-expiring | 60 days, refreshable |
| Setup burden | create a Page, grant admin | switch account to Professional |

For a club that rotates officers every year, "switch your account to
Professional" is a much easier handover than "someone still has admin on a
Facebook Page nobody remembers creating". The 60-day token is the tradeoff, and
automatic renewal on every sync neutralises it.

If Ganji ever does end up with a Facebook Page, switching is mostly a change of
base URL and token handling in `scripts/lib/instagram-api.js`; the caption
parsing and everything downstream is unaffected.

---

## Commands

```bash
npm run sync:fixture      # offline, no token, no network
npm run sync:instagram    # live, needs IG_ACCESS_TOKEN in the environment
npm run test:parser       # parser test suite
```

Useful flags on `scripts/sync-instagram.js`:

| Flag | Effect |
| --- | --- |
| `--fixture` | Read the fixture file instead of the API. |
| `--no-images` | Metadata only, skip downloads. |
| `--prune` | Delete images belonging to posts that no longer exist. |
| `--no-refresh` | Skip the token renewal step. |


### Workflow validation and manual content

Secret-dependent step conditions now reference job environment variables, rather than reading the `secrets` context directly in `if:`. Token updates pass through environment variables instead of shell interpolation. The pipeline also runs the site model/GitHub-save tests before syncing and deploying. Parser/workflow tests use explicit expanded file paths so the command works on the workflow's Node 20 runtime and Windows.

The sync continues to write only generated Instagram metadata and downloaded Instagram images. Photo uploads, officer details, About content, performance entries, and manual event corrections are stored separately in `src/data/admin-data.json` and `public/uploads/`.


### Local account connection screen

`npm start` now starts the existing React site plus a loopback-only Instagram connection helper at http://127.0.0.1:4317. A link is available on the local Admin screen. Alternatively run `npm run instagram:connect` alongside an already-running site.

Enter a test handle and authorize it once using that account’s Instagram Login API access token. The helper checks the profile username and media-read permission before saving anything. Credentials are saved in `.instagram.local.json`, which is ignored by Git and is never imported into the frontend. Each account requires its own authorization. Public handle-only lookup is not supported by this authenticated API.

After that first connection, enter the handle and press **Sync posts**, or run `npm run sync:instagram -- --handle @your_account --no-refresh`. No token needs to be pasted again. Syncing validates the authorized username before writing the feed, and the local helper does not publish or push to GitHub. A saved token must be renewed or reconnected when it expires; the GitHub Actions secret remains separately configured for scheduled production syncs.

Meta account registration, sign-in verification, account permissions, and token generation require action by the account owner. A local helper cannot replace those Meta authorization steps.

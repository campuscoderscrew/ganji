# Admin dashboard

The dashboard at **`/admin`** lets the e-board add events and fix anything the
Instagram sync got wrong, without touching code.

- **Fix an Instagram post.** The sync reads event details out of captions and
  sometimes gets one wrong. Correcting it here sticks: the correction is
  reapplied after every future sync, so it is never flattened.
- **Add an event that was never posted.** Auditions, a practice, anything
  announced in the group chat instead of on Instagram.
- **Hide something.** A cancelled event, or a post that should not be listed.

---

## Signing in

There is no separate password for the website. **GitHub is the login.** Whoever
has write access to the repository can edit the site; everyone else cannot.
Nothing to hand over at the end of the year beyond repository access.

The first time, each officer makes a token:

1. Go to <https://github.com/settings/personal-access-tokens/new>.
2. **Resource owner**: `campuscoderscrew`.
3. **Repository access**: Only select repositories &rarr; `ganji`.
4. **Repository permissions**: **Contents** &rarr; **Read and write**. Nothing
   else.
5. Choose an expiry, generate it, and paste it into `/admin`.

A token made this way can do exactly one thing: change files in the website
repository. It cannot read private repositories, cannot touch the rest of the
GitHub account, and cannot act as that person anywhere else. If it ever leaked,
the worst case is an unwanted edit to the club website, which is visible in the
commit history and revertable.

The token is kept in the browser tab's `sessionStorage`, so closing the tab
forgets it. It is sent to `api.github.com` and nowhere else.

### Why not a normal username and password?

The site is static files with no server behind it. A password check written in
the page's JavaScript is visible to anyone who opens developer tools, so it
would protect nothing. Delegating to GitHub means there is no password for this
site to get wrong, and no list of accounts for anyone to maintain.

---

## Making changes

Edits are collected locally and written in a single commit when you press
**Save to site**. Until then, nothing has changed for visitors -- and the
browser warns you if you try to close the tab with unsaved work.

| Button | What it does |
| --- | --- |
| **+ New event** | Creates an event that has no Instagram post. |
| **Edit** | Opens the details form. |
| **Hide** | Removes it from the site but keeps it in this list. |
| **Reset** | On an Instagram post, throws away your corrections and goes back to what the caption says. |
| **Delete** | On a hand-added event, removes it permanently. |

After saving, GitHub rebuilds the site. It is live in a few minutes -- give it
that long before worrying that something did not work.

### Editing an Instagram post

Only the fields you actually change are stored. If you fix a title and leave
the date alone, the date keeps coming from the caption, so a later fix to the
caption still reaches the site. **Reset** undoes all corrections to that post.

### Dates

An event needs a date to show on the Events calendar. Without one it still
appears in the Archive. The Archive only lists events that have already
happened; upcoming ones live on the calendar and move across on their own once
the date passes.

---

## If something goes wrong

**"GitHub rejected that token."** It has expired or was mistyped. Make a new
one.

**"That token is missing permission."** It was created without **Contents:
Read and write**, or for the wrong repository. Check steps 3 and 4 above.

**"... does not have write access."** That GitHub account is not a
collaborator on the repository. An existing officer can add them under the
repository's Settings &rarr; Collaborators.

**"Someone else saved while you were editing."** Two people had the dashboard
open. Reload to pick up their changes, then redo yours. Nothing was
overwritten -- the save was refused precisely so that could not happen.

**A change did not appear on the site.** Builds take a few minutes. If it has
been longer, check the Actions tab for a failed run.

---

## For developers

| Path | Purpose |
| --- | --- |
| `src/pages/Admin.js` | The dashboard. Lazy-loaded, so it stays out of the main bundle. |
| `src/lib/github.js` | GitHub Contents API client. Full security model is documented at the top. |
| `src/config.js` | Repository and event-type configuration. |
| `src/data/admin-data.json` | What the dashboard writes. Never touched by a sync. |

Design notes worth knowing before changing any of it:

- **The data file is JSON, not JavaScript.** An earlier version wrote
  `overrides.js`. A dashboard that generates source code is an injection
  vector; `JSON.stringify` cannot emit anything executable, whatever an officer
  types into a text field.
- **Saves are conflict-checked.** Every write sends the file's `sha`, so a
  concurrent edit fails with a 409 instead of silently clobbering someone.
- **`sessionStorage`, never `localStorage`.** E-board laptops get shared; a
  token that survives until someone clears site data is a token nobody
  remembers is there.
- **Nothing secret is in `src/`.** Create React App inlines everything there,
  including `REACT_APP_*` variables, into public JavaScript. The same rule that
  keeps the Instagram token server-side applies here.
- **`/admin` is public and unlisted.** `robots.txt` keeps it out of search
  results, which is housekeeping. The actual protection is that the page can do
  nothing at all without a token GitHub accepts.

/**
 * Site-wide configuration.
 *
 * Nothing secret belongs in this file, or in any file under src/. Create React
 * App compiles everything here into public JavaScript that anyone can read --
 * including REACT_APP_* environment variables, which are inlined as plain text
 * at build time. Credentials live in GitHub Actions secrets and never reach
 * the browser.
 */

/** The repository the admin dashboard commits to. */
export const REPO = {
  owner: 'campuscoderscrew',
  name: 'ganji',
  branch: 'main',
};

/** Path, within the repo, of the file the admin dashboard edits. */
export const ADMIN_DATA_PATH = 'src/data/admin-data.json';

/** Event types the Archive has badge styles for. */
export const EVENT_TYPES = ['PERFORMANCE', 'WORKSHOP', 'COMPETITION'];

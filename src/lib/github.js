/**
 * Minimal GitHub Contents API client for the admin dashboard.
 *
 * Security model, in full:
 *
 *   - This file contains no credentials. The site is a static bundle that
 *     anyone can read, so a secret here would be a public secret.
 *   - Authentication is the officer's own GitHub token, pasted at the start of
 *     a session. GitHub decides whether they may write to the repo; the site
 *     stores no passwords and makes no authorisation decisions of its own.
 *   - The token is held in sessionStorage, so it is dropped when the tab
 *     closes and is never shared with other tabs or origins. localStorage
 *     would survive indefinitely on a shared e-board laptop.
 *   - The token is only ever sent to api.github.com, over HTTPS, in an
 *     Authorization header. It is never put in a URL, logged, or committed.
 *   - /admin being public is fine and intended. It is inert without a token,
 *     and it exposes nothing that the public site does not already show.
 */

import { REPO, ADMIN_DATA_PATH } from '../config.js';

const API = 'https://api.github.com';
const STORAGE_KEY = 'ganji.admin.token';

/** Marker for a save that lost a race, so the UI can offer to reload. */
export class ConflictError extends Error {}

// ---------------------------------------------------------------------------
// Token handling
// ---------------------------------------------------------------------------

export function getToken() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || '';
  } catch {
    // Private browsing and blocked site data both throw here.
    return '';
  }
}

export function setToken(token) {
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do -- the session simply will not be remembered on reload.
  }
}

export function clearToken() {
  setToken('');
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : null),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    throw new Error('GitHub rejected that token. It may be expired or mistyped.');
  }
  if (response.status === 403) {
    throw new Error(
      'That token is missing permission. It needs Contents: Read and write on this repository.'
    );
  }
  if (response.status === 404) {
    throw new Error(
      `Could not find ${REPO.owner}/${REPO.name}. Check the token has access to this repository.`
    );
  }
  if (response.status === 409) {
    throw new ConflictError('Someone else saved changes first.');
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && payload.message ? payload.message : `HTTP ${response.status}`;
    const error = new Error(`GitHub: ${message}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}

/**
 * Confirms the token works and reports who it belongs to and whether it can
 * actually write. Called before the dashboard will let anyone edit, so that
 * permission problems surface up front rather than on save.
 */
export async function verifyAccess(token) {
  const user = await request('/user', { token });
  const repo = await request(`/repos/${REPO.owner}/${REPO.name}`, { token });

  if (!repo.permissions || !repo.permissions.push) {
    throw new Error(
      `${user.login} does not have write access to ${REPO.owner}/${REPO.name}.`
    );
  }

  return { login: user.login, avatarUrl: user.avatar_url };
}

// ---------------------------------------------------------------------------
// Reading and writing the data file
// ---------------------------------------------------------------------------

/** UTF-8 safe base64, since btoa alone mangles anything non-ASCII. */
function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decodeBase64(base64) {
  const binary = atob(base64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Reads the live admin data file.
 *
 * The sha comes back too: GitHub requires it on update, and it is what makes a
 * concurrent edit fail loudly instead of silently overwriting someone.
 */
export async function fetchAdminData(token) {
  const file = await request(
    `/repos/${REPO.owner}/${REPO.name}/contents/${ADMIN_DATA_PATH}?ref=${REPO.branch}`,
    { token }
  );

  return {
    sha: file.sha,
    data: JSON.parse(decodeBase64(file.content)),
  };
}

/**
 * Commits new admin data.
 *
 * The payload is serialised with JSON.stringify, never assembled as source
 * text. That is deliberate: the dashboard writes a data file, so no value an
 * officer types -- however odd -- can become executable code in the build.
 */
export async function saveAdminData({ token, data, sha, login, files = [] }) {
  const body = {
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: login,
  };

  const message = `Update site via admin dashboard (${login})`;
  if (files.length) {
    const repo = `/repos/${REPO.owner}/${REPO.name}`;
    const branch = encodeURIComponent(REPO.branch);
    const head = await request(`${repo}/git/ref/heads/${branch}`, { token });
    const base = head.object.sha;
    // Read at the captured commit, not the moving branch, to avoid a check/write race.
    const existing = await request(`${repo}/contents/${ADMIN_DATA_PATH}?ref=${base}`, { token });
    if (existing.sha !== sha) throw new ConflictError('Someone else saved changes first.');
    const commit = await request(`${repo}/git/commits/${base}`, { token });
    const tree = [];
    for (const file of files) {
      if (!/^public\/uploads\/[a-zA-Z0-9-]+\.(png|jpg|webp)$/.test(file.path)) throw new Error('Invalid photo path.');
      const blob = await request(`${repo}/git/blobs`, { token, method:'POST', body:{content:file.content,encoding:'base64'} });
      tree.push({path:file.path,mode:'100644',type:'blob',sha:blob.sha});
    }
    const jsonBlob = await request(`${repo}/git/blobs`, { token, method:'POST', body:{content:encodeBase64(JSON.stringify(body,null,2)+'\n'),encoding:'base64'} });
    tree.push({path:ADMIN_DATA_PATH,mode:'100644',type:'blob',sha:jsonBlob.sha});
    const nextTree = await request(`${repo}/git/trees`, { token, method:'POST', body:{base_tree:commit.tree.sha,tree} });
    const nextCommit = await request(`${repo}/git/commits`, { token, method:'POST', body:{message,tree:nextTree.sha,parents:[base]} });
    try {
      await request(`${repo}/git/refs/heads/${branch}`, { token, method:'PATCH', body:{sha:nextCommit.sha,force:false} });
    } catch (error) {
      if (error.status === 422) throw new ConflictError('The branch changed while saving. Reload before trying again.');
      throw error;
    }
    return {sha:jsonBlob.sha,data:body};
  }
  const result = await request(
    `/repos/${REPO.owner}/${REPO.name}/contents/${ADMIN_DATA_PATH}`,
    { token, method:'PUT', body:{message,content:encodeBase64(JSON.stringify(body,null,2)+'\n'),sha,branch:REPO.branch} }
  );
  return {sha:result.content.sha,data:body};
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './admin.css';
import instagramData from '../data/instagram.json';
import { EVENT_TYPES, REPO } from '../config.js';
import committedData from '../data/admin-data.json';
import { resolveContent, validateContent } from '../data/site-content';
import { usePreview, getPreview, savePreview, clearPreview, localPreviewAvailable } from '../lib/preview';
import { preparePhoto } from '../lib/photos';
import PhotoPicker from '../components/PhotoPicker';
import AdminContent from '../components/AdminContent';
import PreviewNotice from '../components/PreviewNotice';
import {
  ConflictError,
  clearToken,
  fetchAdminData,
  getToken,
  saveAdminData,
  setToken,
  verifyAccess,
} from '../lib/github.js';

/**
 * Admin dashboard for the e-board.
 *
 * Two kinds of event live here. Posts pulled from Instagram can be corrected
 * -- the correction is stored as an override and reapplied after every future
 * sync, so it never gets flattened. Events with no Instagram post at all are
 * created here from scratch.
 *
 * Nothing on this page is secret. It is inert until someone supplies their own
 * GitHub token, and GitHub decides whether that person may write. See
 * src/lib/github.js for the full security model.
 */

const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new';

const EMPTY_EVENT = {
  title: '',
  type: 'PERFORMANCE',
  artist: '',
  date: '',
  time: '',
  location: '',
  caption: '',
  image: '',
};

/** Strips blank strings so they do not override a parsed value with nothing. */
function compact(draft) {
  const out = {};
  for (const [key, value] of Object.entries(draft)) {
    if (typeof value === 'string' && value.trim() === '') continue;
    out[key] = typeof value === 'string' ? value.trim() : value;
  }
  return out;
}

/**
 * Narrows an edit down to the fields that actually changed.
 *
 * Storing every field the form displayed would pin all of them, so a later
 * improvement to the Instagram caption could never reach the site. Keeping
 * only genuine differences means an override stays a correction to one or two
 * fields rather than a frozen snapshot of the whole event.
 */
function changedFieldsOnly(draft, original) {
  if (!original) return draft;
  const out = {};
  for (const [key, value] of Object.entries(draft)) {
    const before = original[key];
    if (value === before) continue;
    if (before == null && value === '') continue;
    out[key] = value;
  }
  return out;
}

function formatDate(iso) {
  if (!iso) return 'No date';
  const date = new Date(`${iso}T12:00:00Z`);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Sign-in
// ---------------------------------------------------------------------------

function SignIn({ onConnect, onPreview, error, busy }) {
  const [value, setValue] = useState('');

  return (
    <div className="admin-card admin-signin">
      <h2>Sign in with GitHub</h2>
      <p className="admin-lede">
        Changes you make here are saved straight to the website's repository, so
        you need a GitHub account with access to it.
      </p>

      <ol className="admin-steps">
        <li>
          <a href={TOKEN_URL} target="_blank" rel="noreferrer">
            Open GitHub's token page
          </a>{' '}
          (you may need to sign in first).
        </li>
        <li>
          Set <strong>Resource owner</strong> to <code>{REPO.owner}</code> and
          pick <strong>Only select repositories</strong> &rarr;{' '}
          <code>{REPO.name}</code>.
        </li>
        <li>
          Under <strong>Repository permissions</strong>, set{' '}
          <strong>Contents</strong> to <strong>Read and write</strong>. Leave
          everything else alone.
        </li>
        <li>
          Set an expiry you are comfortable with, generate the token, and paste
          it below.
        </li>
      </ol>

      <form
        className="admin-signin-form"
        onSubmit={(e) => {
          e.preventDefault();
          onConnect(value.trim());
        }}
      >
        <label className="admin-field">
          <span>Access token</span>
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="github_pat_..."
            autoComplete="off"
            spellCheck="false"
          />
        </label>
        <button type="submit" className="admin-button" disabled={busy || !value.trim()}>
          {busy ? 'Checking...' : 'Connect'}
        </button>
      </form>

      {localPreviewAvailable() && <p><a href="http://127.0.0.1:4317/" target="_blank" rel="noreferrer">Connect a test Instagram account ↗</a></p>}
      {error && <p role="alert" className="admin-error">{error}</p>}
      {localPreviewAvailable() && <div className="admin-local-option"><button className="admin-button-ghost" disabled={busy} onClick={onPreview}>Try local preview</button><p>Try all controls without a token. Changes stay in this tab and are never sent to GitHub.</p></div>}

      <p className="admin-note">
        The token is kept only for this browser tab and is forgotten when you
        close it. It is sent to GitHub and nowhere else. Because it is limited
        to this one repository with only Contents access, it cannot touch the
        rest of your GitHub account.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Editor
// ---------------------------------------------------------------------------

function EventEditor({ event, onSave, onCancel, photos, uploadPhoto, pending }) {
  const [draft, setDraft] = useState(() => ({
    ...EMPTY_EVENT,
    ...Object.fromEntries(
      Object.keys(EMPTY_EVENT).map((key) => [key, event[key] ?? ''])
    ),
  }));

  const update = (key) => (e) => setDraft({ ...draft, [key]: e.target.value });
  const isInstagram = event.source === 'instagram';

  return (
    <div
      className="admin-modal"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      role="presentation"
    >
      <div className="admin-card admin-modal-card">
        <h2>{event.isNew ? 'New event' : 'Edit event'}</h2>

        {isInstagram && (
          <p className="admin-lede">
            This came from Instagram. Anything you change is kept as a
            correction and reapplied after every sync, so it will not be undone.
            Leave a field blank to keep what the caption said.
          </p>
        )}

        <div className="admin-form-grid">
          <label className="admin-field admin-field-wide">
            <span>Title</span>
            <input value={draft.title} onChange={update('title')} />
          </label>

          <label className="admin-field">
            <span>Type</span>
            <select value={draft.type} onChange={update('type')}>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span>Artist</span>
            <input value={draft.artist} onChange={update('artist')} placeholder="Optional" />
          </label>

          <label className="admin-field">
            <span>Date</span>
            <input type="date" value={draft.date} onChange={update('date')} />
          </label>

          <label className="admin-field">
            <span>Time</span>
            <input value={draft.time} onChange={update('time')} placeholder="7-8PM" />
          </label>

          <label className="admin-field admin-field-wide">
            <span>Location</span>
            <input
              value={draft.location}
              onChange={update('location')}
              placeholder="Activities Room, STAMP"
            />
          </label>

          <label className="admin-field admin-field-wide">
            <span>Description</span>
            <textarea rows={4} value={draft.caption} onChange={update('caption')} />
          </label>
        </div>

        <fieldset className="admin-image-field"><legend>Event photo</legend><PhotoPicker value={draft.image} onChange={value=>setDraft(current=>({...current,image:value}))} photos={photos} uploadPhoto={uploadPhoto} pending={pending}/></fieldset>
        <p className="admin-hint">
          An event needs a date to appear on the calendar. Without one it still
          shows in the Archive.
        </p>

        <div className="admin-modal-actions">
          <button type="button" className="admin-button-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-button"
            onClick={() => onSave(compact(draft))}
            disabled={!draft.title.trim()}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function AdminPage() {
  const [token, setTokenState] = useState(getToken);
  const preview = usePreview();
  const [user, setUser] = useState(() => getPreview() ? {login:'Local preview',preview:true} : null);
  const [signInError, setSignInError] = useState('');
  const [busy, setBusy] = useState(false);

  const [adminData, setAdminData] = useState(() => getPreview()?.data || null);
  const [sha, setSha] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null);
  const [section, setSection] = useState('events');
  const [pending, setPending] = useState([]);
  const [uploadCount, setUploadCount] = useState(0);
  const content = resolveContent(adminData || {});

  const connect = useCallback(async (candidate) => {
    setBusy(true);
    setSignInError('');
    try {
      const profile = await verifyAccess(candidate);
      const file = await fetchAdminData(candidate);
      setToken(candidate);
      setTokenState(candidate);
      setUser(profile);
      clearPreview();
      setAdminData(file.data);
      setPending([]);
      setSha(file.sha);
    } catch (error) {
      setSignInError(error.message);
      clearToken();
      setTokenState('');
    } finally {
      setBusy(false);
    }
  }, []);

  // Restores a session after a reload while the tab is still open.
  useEffect(() => {
    const existing = getToken();
    if (existing && !user) connect(existing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Losing unsaved edits to a stray tab close is the most annoying thing a
  // dashboard like this can do, so the browser is asked to confirm.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    if (user?.preview && !preview) { setUser(null); setAdminData(null); setPending([]); setDirty(false); }
  }, [preview, user]);

  const startPreview = () => {
    const data = {...committedData,content:resolveContent(committedData)};
    try { savePreview(data); clearToken(); setTokenState(''); setUser({login:'Local preview',preview:true}); setAdminData(data); setPending([]); setStatus(''); }
    catch(error) { setSignInError(error.message); }
  };
  const changeContent = value => {setAdminData(current=>({...current,content:value}));setDirty(true);};
  const uploadPhoto = async file => {
    setUploadCount(count=>count+1);
    try {
      const photo = await preparePhoto(file);
      if (pending.length >= 20 || pending.reduce((total,item)=>total+item.size,0)+photo.size>10*1024*1024) throw new Error('Save these photos before adding more (maximum 10 MB per save).');
      setPending(files=>[...files,photo]);
      setAdminData(current=>{const content=resolveContent(current);return {...current,content:{...content,photos:[...content.photos,{id:photo.id,title:photo.title,image:photo.image}]}};});
      setDirty(true);return photo.image;
    } finally {setUploadCount(count=>count-1);}
  };
  const signOut = () => {
    clearToken();
    if(user?.preview) clearPreview();
    setPending([]);
    setEditing(null);
    setTokenState('');
    setUser(null);
    setAdminData(null);
    setDirty(false);
  };

  /**
   * Every event, Instagram and manual, with pending overrides already applied
   * so the list shows what the site will actually look like once saved.
   */
  const rows = useMemo(() => {
    if (!adminData) return [];

    const overrides = adminData.overrides || {};

    const fromInstagram = instagramData.posts.map((post) => ({
      ...post,
      ...(overrides[post.id] || {}),
      source: 'instagram',
      hasOverride: Boolean(overrides[post.id]),
    }));

    const manual = (adminData.manualEvents || []).map((event) => ({
      ...event,
      source: 'manual',
    }));

    return [...fromInstagram, ...manual].sort((a, b) =>
      (b.date || b.timestamp || '').localeCompare(a.date || a.timestamp || '')
    );
  }, [adminData]);

  const applyEdit = (patch) => {
    const target = editing;
    setEditing(null);
    setDirty(true);

    if (target.source === 'manual') {
      setAdminData((current) => ({
        ...current,
        manualEvents: target.isNew
          ? [...(current.manualEvents || []), { id: target.id, ...patch }]
          : (current.manualEvents || []).map((event) =>
              event.id === target.id ? { id: event.id, ...patch } : event
            ),
      }));
    } else {
      const original = instagramData.posts.find((post) => post.id === target.id);
      const diff = changedFieldsOnly(patch, original);
      if (!original.isEvent && (patch.date || patch.type)) diff.isEvent = true;

      setAdminData((current) => {
        const existing = current.overrides[target.id] || {};
        // hidden is set by the Hide button, not the form, so it is carried
        // across rather than dropped by an unrelated edit.
        const next = existing.hidden ? { hidden: true, ...diff } : diff;

        if (Object.keys(next).length === 0) {
          // The edit put everything back to what the caption says, so the
          // override has nothing left to do.
          const remaining = { ...current.overrides };
          delete remaining[target.id];
          return { ...current, overrides: remaining };
        }

        return { ...current, overrides: { ...current.overrides, [target.id]: next } };
      });
    }
  };

  const toggleHidden = (row) => {
    setDirty(true);
    if (row.source === 'manual') {
      setAdminData((current) => ({
        ...current,
        manualEvents: current.manualEvents.map((event) =>
          event.id === row.id ? { ...event, hidden: !row.hidden } : event
        ),
      }));
    } else {
      setAdminData((current) => ({
        ...current,
        overrides: {
          ...current.overrides,
          [row.id]: { ...(current.overrides[row.id] || {}), hidden: !row.hidden },
        },
      }));
    }
  };

  const removeRow = (row) => {
    const label = row.title || 'this event';
    if (row.source === 'instagram') {
      // Deleting cannot reach Instagram, so the override is reset instead and
      // the post falls back to whatever its caption says.
      if (!window.confirm(`Undo all corrections to "${label}"?`)) return;
      setAdminData((current) => {
        const next = { ...current.overrides };
        delete next[row.id];
        return { ...current, overrides: next };
      });
    } else {
      if (!window.confirm(`Delete "${label}" permanently?`)) return;
      setAdminData((current) => ({
        ...current,
        manualEvents: current.manualEvents.filter((event) => event.id !== row.id),
      }));
    }
    setDirty(true);
  };

  const save = async () => {
    setBusy(true);
    setStatus('');
    try {
      const data = {...adminData,content:validateContent(resolveContent(adminData)),overrides:adminData.overrides || {},manualEvents:adminData.manualEvents || []};
      if (user.preview) {
        savePreview(data,pending);setAdminData(data);setPending([]);setDirty(false);setStatus('Preview saved in this tab. Open the website to see your changes.');return;
      }
      const result = await saveAdminData({
        token,
        data,
        files:pending,
        sha,
        login: user.login,
      });
      setSha(result.sha);
      setPending([]);
      setAdminData(result.data);
      setDirty(false);
      setStatus('Saved. The site rebuilds automatically in a few minutes.');
    } catch (error) {
      setStatus(
        error instanceof ConflictError
          ? 'Someone else saved while you were editing. Reload to get their changes, then redo yours.'
          : error.message
      );
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="admin-page">
        <header className="admin-header">
          <h1>Ganji Admin</h1>
        </header>
        <SignIn onConnect={connect} onPreview={startPreview} error={signInError} busy={busy} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>Ganji Admin</h1>
        <div className="admin-user">
          {user.avatarUrl && <img src={user.avatarUrl} alt="" />}
          <span>{user.login}</span>
          <button type="button" className="admin-button-ghost" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <PreviewNotice />
      {localPreviewAvailable() && <div className="admin-context"><a href="http://127.0.0.1:4317/" target="_blank" rel="noreferrer">Connect or sync test Instagram ↗</a></div>}
      <div className="admin-context"><a href="/">View website ↗</a><p>{user.preview ? 'Local preview: no repository writes.' : `Save to site publishes to ${REPO.owner}/${REPO.name}, branch ${REPO.branch}.`}</p></div>
      <nav className="admin-sections" aria-label="Admin sections">{[['events','Events'],['photos','Photos'],['officers','Officers'],['about','About'],['performances','Performances']].map(([key,label])=><button type="button" key={key} aria-current={section===key?'page':undefined} className={section===key?'is-active':''} disabled={busy || uploadCount>0} onClick={()=>{setSection(key);setEditing(null);}}>{label}</button>)}</nav>
      <div className="admin-toolbar">
        {section==='events' && <button
          type="button"
          className="admin-button"
          onClick={() =>
            setEditing({
              ...EMPTY_EVENT,
              id: `manual-${Date.now()}`,
              source: 'manual',
              isNew: true,
            })
          }
        >
          + New event
        </button>}

        <div className="admin-toolbar-right">
          {dirty && <span className="admin-dirty">Unsaved changes</span>}
          <button
            type="button"
            className="admin-button"
            onClick={save}
            disabled={!dirty || busy || uploadCount>0}
          >
            {busy ? 'Saving...' : user.preview ? 'Save preview' : 'Save to site'}
          </button>
        </div>
      </div>

      {status && <p className="admin-status" role="status">{status}</p>}

      {section !== 'events' && <AdminContent key={section} section={section} content={content} onChange={changeContent} uploadPhoto={uploadPhoto} pending={pending} busy={busy || uploadCount>0} />}
      {section === 'events' && <div className="admin-list">
        {rows.length === 0 && <p className="admin-empty">No events yet.</p>}

        {rows.map((row) => (
          <div
            className={`admin-row${row.hidden ? ' admin-row-hidden' : ''}`}
            key={row.id}
          >
            <div className="admin-row-main">
              <span className={`admin-badge admin-badge-${(row.type || 'performance').toLowerCase()}`}>
                {row.type || 'POST'}
              </span>
              <div className="admin-row-text">
                <p className="admin-row-title">
                  {row.title || <em>Untitled</em>}
                  {row.artist && <span className="admin-row-artist"> — {row.artist}</span>}
                </p>
                <p className="admin-row-meta">
                  {formatDate(row.date)}
                  {row.time && ` · ${row.time}`}
                  {row.location && ` · ${row.location}`}
                </p>
              </div>
            </div>

            <div className="admin-row-tags">
              {row.source === 'instagram' ? (
                <span className="admin-tag">Instagram</span>
              ) : (
                <span className="admin-tag admin-tag-manual">Added by hand</span>
              )}
              {row.hasOverride && <span className="admin-tag admin-tag-edited">Edited</span>}
            </div>

            <div className="admin-row-actions">
              <button type="button" className="admin-button-ghost" onClick={() => setEditing(row)}>
                Edit
              </button>
              <button type="button" className="admin-button-ghost" onClick={() => toggleHidden(row)}>
                {row.hidden ? 'Show' : 'Hide'}
              </button>
              <button
                type="button"
                className="admin-button-ghost admin-button-danger"
                onClick={() => removeRow(row)}
                disabled={row.source === 'instagram' && !row.hasOverride}
              >
                {row.source === 'instagram' ? 'Reset' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>}

      {editing && (
        <EventEditor
          event={editing}
          photos={content.photos}
          uploadPhoto={uploadPhoto}
          pending={pending}
          onSave={applyEdit}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

export default AdminPage;

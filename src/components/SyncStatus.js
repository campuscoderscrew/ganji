import React from 'react';
import './syncStatus.css';
import { syncedAt, isFixtureData } from '../data/events.js';

/**
 * Shows when the Instagram sync last ran.
 *
 * This is the only thing on the site that reveals a dead sync. A disabled
 * GitHub Actions schedule does not fail -- it simply stops running, sending no
 * error and triggering no build -- so nothing else would ever say that the
 * page has quietly stopped updating. A visible date means someone notices.
 */
function SyncStatus() {
  if (!syncedAt) return null;

  const synced = new Date(syncedAt);
  const daysAgo = Math.floor((Date.now() - synced.getTime()) / 86400000);
  const isStale = daysAgo > 10;

  const formatted = synced.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <p className={`sync-status${isStale ? ' sync-status-stale' : ''}`}>
      {isFixtureData ? (
        <>Showing sample data &mdash; Instagram sync is not connected yet</>
      ) : (
        <>Updated from Instagram on {formatted}</>
      )}
    </p>
  );
}

export default SyncStatus;

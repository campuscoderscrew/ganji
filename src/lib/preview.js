import { useSyncExternalStore } from 'react';
import committed from '../data/admin-data.json';
const KEY = 'ganji.local.preview.v1';
export const localPreviewAvailable = () => ['localhost','127.0.0.1','[::1]'].includes(window.location.hostname);
function readPreview() {
  if (!localPreviewAvailable()) return null;
  try { return JSON.parse(sessionStorage.getItem(KEY)) || null; } catch { return null; }
}
let preview = readPreview();
const listeners = new Set();
export function usePreview() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, () => preview);
}
export function getSiteData() { return preview?.data || committed; }
export function getPreview() { return preview; }
export function savePreview(data, files = []) {
  if (!localPreviewAvailable()) throw new Error('Local preview is only available on this computer.');
  const images = { ...preview?.images };
  for (const file of files) images['/' + file.path.replace(/^public\//,'')] = `data:${file.mime};base64,${file.content}`;
  const next = { data, images };
  try { sessionStorage.setItem(KEY,JSON.stringify(next)); }
  catch { throw new Error('This tab’s preview storage is full. Use a smaller photo or reset the preview.'); }
  preview = next; listeners.forEach(listener => listener());
}
export function clearPreview() { sessionStorage.removeItem(KEY); preview = null; listeners.forEach(listener => listener()); }

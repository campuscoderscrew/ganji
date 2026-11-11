import React, { useState } from 'react';
import { imageUrl } from '../content';
export default function PhotoPicker({ value, onChange, photos, uploadPhoto, pending = [] }) {
  const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  const custom=value && !['','icon','group','chungha','coming-soon'].includes(value) && !photos.some(photo=>photo.image===value);
  const preview=pending.find(file=>file.image===value)?.preview || imageUrl(value);
  return <div className="admin-photo-picker">
    <img src={preview} alt="Selected preview" />
    <div><label className="admin-field"><span>Choose photo</span><select value={value || ''} onChange={e=>onChange(e.target.value)}>
      <option value="">Default / none</option><option value="icon">Ganji logo</option><option value="group">Group photo</option><option value="chungha">Chung Ha poster</option><option value="coming-soon">Coming soon</option>
      {custom && <option value={value}>Current photo</option>}{photos.map(photo=><option key={photo.id} value={photo.image}>{photo.title || 'Uploaded photo'}</option>)}
    </select></label>
    <label className="admin-field admin-upload"><span>{busy?'Preparing photo…':'Upload a photo'}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async e=>{const file=e.target.files[0];if(!file)return;setBusy(true);setError('');try{onChange(await uploadPhoto(file));}catch(error){setError(error.message);}finally{setBusy(false);}}} /></label>
    <small>Up to 4 MB. Published with your other changes when you save.</small>{error && <p role="alert" className="admin-error">{error}</p>}</div>
  </div>;
}

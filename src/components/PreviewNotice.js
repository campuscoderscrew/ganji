import React from 'react';
import { usePreview, clearPreview } from '../lib/preview';
export default function PreviewNotice() {
  const preview = usePreview();
  return preview ? <div className="preview-notice" role="status">Local preview — changes are only in this tab. <button onClick={clearPreview}>Reset preview</button></div> : null;
}

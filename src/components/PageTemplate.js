import React from 'react';
import './pageTemplate.css';
import '../site.css';
import PageBackground from './PageBackground';
import PreviewNotice from './PreviewNotice';

/**
 * Content wrapper for a page's main body.
 *
 * The navbar is deliberately NOT rendered here: it lives in the router so a
 * single instance persists across navigations. Rendering it per-page made it
 * unmount/remount on every route change, which replayed its entrance and
 * flashed.
 */
function PageTemplate({ children, contentClassName = '', contentTag: ContentTag = 'div' }) {
  const contentClasses = ['page-template-outlet', contentClassName]
    .filter(Boolean)
    .join(' ');

  return <><PageBackground /><ContentTag className={contentClasses}><PreviewNotice />{children}</ContentTag></>;
}

export default PageTemplate;

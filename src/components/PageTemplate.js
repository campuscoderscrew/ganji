import React from 'react';
import SiteNavbar from './SiteNavbar';
import './pageTemplate.css';

function PageTemplate({
  activePath,
  children,
  contentClassName = '',
  contentTag: ContentTag = 'div',
}) {
  const contentClasses = ['page-template-outlet', contentClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <SiteNavbar activePath={activePath} />
      <ContentTag className={contentClasses}>{children}</ContentTag>
    </>
  );
}

export default PageTemplate;

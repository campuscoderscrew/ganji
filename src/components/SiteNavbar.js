import React from 'react';
import { motion } from 'motion/react';
import './siteNavbar.css';
import logo from '../icon.jpg';

const navItems = [
  { href: '/#about', label: 'About', match: null },
  { href: '/officers', label: 'Officers', match: '/officers' },
  { href: '/', label: 'Events', match: '/' },
  { href: '/workshops', label: 'Workshops', match: '/workshops' },
  { href: '/performances', label: 'Performances', match: '/performances' },
  { href: '/archive', label: 'Archive', match: '/archive' },
];

function SiteNavbar({ activePath }) {
  const navigate = (href) => (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const targetUrl = new URL(href, window.location.origin);
    const currentUrl = new URL(window.location.href);

    if (targetUrl.origin !== currentUrl.origin) {
      return;
    }

    event.preventDefault();

    const nextPath = `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
    const currentPath = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

    if (nextPath === currentPath) {
      return;
    }

    window.history.pushState({}, '', nextPath);
    window.dispatchEvent(new Event('codex:navigate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.nav
      className="site-nav"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <a className="site-nav-brand" href="/" onClick={navigate('/')}>
        <span className="site-nav-brand-mark">
          <img src={logo} alt="" />
        </span>
        <span className="site-nav-brand-copy">
          <span>Ganji</span>
          <small>Performance Team</small>
        </span>
      </a>

      <div className="site-nav-links">
        {navItems.map((item) => {
          const isActive = item.match === activePath;

          return (
            <a
              key={item.label}
              href={item.href}
              onClick={navigate(item.href)}
              className={isActive ? 'is-active' : undefined}
            >
              {isActive && (
                <motion.span
                  className="site-nav-active-pill"
                  layoutId="site-nav-active-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="site-nav-link-label">{item.label}</span>
            </a>
          );
        })}
      </div>
    </motion.nav>
  );
}

export default SiteNavbar;

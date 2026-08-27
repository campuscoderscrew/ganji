import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

const pillSpring = { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 };

function SiteNavbar({ activePath }) {
  const [hovered, setHovered] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

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

    const target = new URL(href, window.location.origin);
    const current = new URL(window.location.href);

    if (target.origin !== current.origin) return;

    event.preventDefault();
    setMenuOpen(false);

    const nextPath = `${target.pathname}${target.search}${target.hash}`;
    const currentPath = `${current.pathname}${current.search}${current.hash}`;

    if (nextPath === currentPath) return;

    window.history.pushState({}, '', nextPath);
    window.dispatchEvent(new Event('codex:navigate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="gnav-wrap">
      {/* No entrance animation, and no transform on this element: a transform
          here would distort the viewport-box measurements the pills' layout
          animation depends on, making the active pill slide from the wrong
          spot. The navbar simply renders in place. */}
      <nav className="gnav">
        <a className="gnav-brand" href="/" onClick={navigate('/')}>
          <span className="gnav-brand-mark">
            <img src={logo} alt="" />
          </span>
          <span className="gnav-brand-copy">
            <span className="gnav-brand-name">Ganji</span>
            <span className="gnav-brand-sub">Performance Team</span>
          </span>
          <span className="gnav-brand-sparkle" aria-hidden="true">
            ✦
          </span>
        </a>

        <div className="gnav-links" onMouseLeave={() => setHovered(null)}>
          {navItems.map((item, index) => {
            const isActive = item.match === activePath;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={navigate(item.href)}
                onMouseEnter={() => setHovered(index)}
                onFocus={() => setHovered(index)}
                className={`gnav-link ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {hovered === index && !isActive && (
                  <motion.span
                    layoutId="gnav-hover"
                    className="gnav-hover-pill"
                    initial={false}
                    transition={pillSpring}
                  />
                )}
                {isActive && (
                  <motion.span
                    layoutId="gnav-active"
                    className="gnav-active-pill"
                    initial={false}
                    transition={pillSpring}
                  />
                )}
                <span className="gnav-label">{item.label}</span>
              </a>
            );
          })}
        </div>

        <button
          type="button"
          className={`gnav-menu-btn ${menuOpen ? 'is-open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="gnav-menu-glyph">
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.svg
                  key="chevron"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  <polyline
                    points="5 15 12 8 19 15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              ) : (
                <motion.svg
                  key="lines"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  initial={{ opacity: 0, rotate: 60, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: -60, scale: 0.6 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                >
                  <line
                    x1="4"
                    y1="8.5"
                    x2="20"
                    y2="8.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="4"
                    y1="15.5"
                    x2="14"
                    y2="15.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </motion.svg>
              )}
            </AnimatePresence>
          </span>
          <span className="gnav-menu-label">{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="gnav-panel"
            className="gnav-panel"
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.97 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            {navItems.map((item, index) => {
              const isActive = item.match === activePath;

              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={navigate(item.href)}
                  className={`gnav-panel-link ${isActive ? 'is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.045, duration: 0.28 }}
                >
                  <span>{item.label}</span>
                  <span className="gnav-panel-arrow" aria-hidden="true">
                    →
                  </span>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="gnav-scrim"
            className="gnav-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default SiteNavbar;

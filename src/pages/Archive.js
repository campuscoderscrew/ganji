import React, { useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import './archive.css';
import PageTemplate from '../components/PageTemplate';

const archiveData = [
  {
    month: 'April 2025',
    events: [
      { type: 'PERFORMANCE', title: 'Daydream', artist: 'ENHYPEN', link: '#' },
      { type: 'PERFORMANCE', title: 'Pandora', artist: 'MAVE', link: '#' },
      { type: 'WORKSHOP', title: 'Gnarly', artist: 'KATSEYE', link: '#' },
      { type: 'COMPETITION', title: 'Ultimate Showcase', artist: null, link: '#' },
    ],
  },
  { month: 'May 2025', events: [] },
  { month: 'June 2025', events: [] },
];

function ArchivePage() {
  const [expandedMonth, setExpandedMonth] = useState(archiveData[0].month);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 60, damping: 20 };
  const parallaxX = useSpring(useTransform(mouseX, [-1, 1], [-24, 24]), springConfig);
  const parallaxY = useSpring(useTransform(mouseY, [-1, 1], [-24, 24]), springConfig);
  const parallaxXSlow = useSpring(useTransform(mouseX, [-1, 1], [14, -14]), springConfig);
  const parallaxYSlow = useSpring(useTransform(mouseY, [-1, 1], [14, -14]), springConfig);

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    mouseX.set((e.clientX / innerWidth - 0.5) * 2);
    mouseY.set((e.clientY / innerHeight - 0.5) * 2);
  };

  const toggleMonth = (month) => {
    setExpandedMonth((current) => (current === month ? null : month));
  };

  return (
    <div className="archive-page" onMouseMove={handleMouseMove}>
      <motion.div
        className="archive-bubble archive-bubble-1"
        animate={{ y: [0, -22, 0], x: [0, 12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="archive-bubble archive-bubble-2"
        animate={{ y: [0, 18, 0], x: [0, -14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="archive-bubble archive-bubble-fg-1"
        style={{ x: parallaxX, y: parallaxY }}
      />
      <motion.div
        className="archive-bubble archive-bubble-fg-2"
        style={{ x: parallaxXSlow, y: parallaxYSlow }}
      />

      <span className="archive-sparkle archive-sparkle-1">✦</span>
      <span className="archive-sparkle archive-sparkle-2">✧</span>
      <span className="archive-sparkle archive-sparkle-3">✦</span>

      <PageTemplate>
        <header className="archive-header">
          <motion.p
            className="archive-kicker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Past Events
          </motion.p>
          <motion.h1
            className="archive-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          >
            Archive
          </motion.h1>
        </header>

        <div className="archive-accordion">
          {archiveData.map(({ month, events }, i) => {
            const isOpen = expandedMonth === month;
            return (
              <motion.div
                className="archive-month-card"
                key={month}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: i * 0.08 }}
              >
                <motion.button
                  className="archive-month-header"
                  onClick={() => toggleMonth(month)}
                  aria-expanded={isOpen}
                  whileHover={{ backgroundColor: 'rgba(124, 108, 246, 0.18)' }}
                  whileTap={{ backgroundColor: 'rgba(124, 108, 246, 0.3)' }}
                >
                  <span className="archive-month-name">{month} Events</span>
                  <motion.span
                    className="archive-chevron"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <polyline
                        points="6 9 12 15 18 9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.span>
                </motion.button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      className="archive-month-events-wrapper"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <div className="archive-month-events">
                        {events.length === 0 ? (
                          <p className="archive-empty">No events recorded yet.</p>
                        ) : (
                          events.map((event, index) => (
                            <motion.a
                              className="archive-event-row"
                              href={event.link}
                              key={index}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.25 }}
                              whileHover={{ x: 6 }}
                            >
                              <span
                                className={`archive-badge archive-badge-${event.type.toLowerCase()}`}
                              >
                                {event.type}
                              </span>
                              <span className="archive-event-title">
                                {event.title}
                                {event.artist && (
                                  <span className="archive-event-artist"> — {event.artist}</span>
                                )}
                              </span>
                              <span className="archive-event-arrow">→</span>
                            </motion.a>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </PageTemplate>
    </div>
  );
}

export default ArchivePage;

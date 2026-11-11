import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './archive.css';
import PageTemplate from '../components/PageTemplate';
import { useEventData } from '../data/events.js';
import SyncStatus from '../components/SyncStatus';

function ArchivePage() {
  const { archiveMonths: archiveData } = useEventData();
  // The newest month is listed first and opens by default. An empty archive
  // leaves nothing expanded rather than crashing on archiveData[0].
  const [expandedMonth, setExpandedMonth] = useState(
    archiveData.length > 0 ? archiveData[0].month : null
  );

  const toggleMonth = (month) => {
    setExpandedMonth((current) => (current === month ? null : month));
  };

  return (
    // The page's own orbs and sparkles used to live here. Their styles were
    // removed when the shared background moved into PageBackground (rendered
    // by PageTemplate), which left this markup unstyled -- the sparkle spans
    // fell back to static position and rendered as literal characters in the
    // top-left corner.
    <div className="archive-page">
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
                  <span className="archive-month-name">{month === 'Undated events' ? month : `${month} Events`}</span>
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
                              // Rows link out to the original Instagram post.
                              target="_blank"
                              rel="noreferrer"
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

        <SyncStatus />
      </PageTemplate>
    </div>
  );
}

export default ArchivePage;

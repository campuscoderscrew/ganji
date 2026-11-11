import React, { useState } from 'react';
import { motion } from 'motion/react';
import './performances.css';
import { useContent, imageUrl, videoSearch } from '../content';
import PageTemplate from '../components/PageTemplate';

function PerformancesPage() {
  const { content } = useContent();
  const performanceMonths = Object.entries(content.performances.reduce((months, entry) => {
    (months[entry.date.slice(0, 7)] ||= []).push(entry); return months;
  }, {})).sort(([a], [b]) => b.localeCompare(a)).map(([month, entries]) => ({
    month: new Date(`${month}-01T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    spotlight: entries[0], entries,
  }));
  if (!performanceMonths.length) performanceMonths.push({ month: 'Performances', spotlight: { title: 'Coming soon', artist: 'Ganji', description: 'New performances will appear here.', image: 'coming-soon' }, entries: [] });
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);


  const currentMonth = performanceMonths[Math.min(currentMonthIndex, performanceMonths.length - 1)];

  const goToPreviousMonth = () => {
    setCurrentMonthIndex((index) =>
      index === 0 ? performanceMonths.length - 1 : index - 1
    );
  };

  const goToNextMonth = () => {
    setCurrentMonthIndex((index) =>
      index === performanceMonths.length - 1 ? 0 : index + 1
    );
  };

  const scrollToList = () => {
    document.getElementById('performances-list')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="performances-page site-page">
      <PageTemplate>
        <header className="performances-header page-heading">
          <motion.p
            className="performances-kicker page-kicker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            On Stage
          </motion.p>
          <motion.h1
            className="performances-title page-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          >
            Performances
          </motion.h1>
          <motion.p
            className="performances-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Find Ganji performances on YouTube{' '}
            <a href="https://www.youtube.com/results?search_query=Ganji+UMD" target="_blank" rel="noreferrer">
              here
            </a>
            .
          </motion.p>
        </header>

        <div className="performances-spotlight-wrap">
          <motion.section
            className="performances-spotlight"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
          >
            <div className="performances-spotlight-copy">
              <p className="performances-spotlight-label">Featured Performance</p>
              <h2>
                {currentMonth.spotlight.title}
                <span>{currentMonth.spotlight.artist}</span>
              </h2>
              <p>{currentMonth.spotlight.description}</p>
            </div>

            <a
              className="performances-spotlight-media"
              href={videoSearch(currentMonth.spotlight)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Search YouTube for ${currentMonth.spotlight.title}`}
            >
              <img src={imageUrl(currentMonth.spotlight.image)} alt={currentMonth.spotlight.title} />
              <span className="performances-play-badge">Find video</span>
            </a>
          </motion.section>
        </div>

        <div className="performances-list-cta-wrap">
          <motion.button
            className="performances-list-cta"
            onClick={scrollToList}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ y: 0, scale: 0.98 }}
          >
            List of Performances
          </motion.button>
        </div>

        <section className="performances-list-section" id="performances-list">
          <motion.div
            className="performances-month-switcher"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            <button type="button" onClick={goToPreviousMonth} aria-label="Previous month" disabled={performanceMonths.length < 2}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <polyline
                  points="15 5 8 12 15 19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h2>{currentMonth.month}</h2>
            <button type="button" onClick={goToNextMonth} aria-label="Next month" disabled={performanceMonths.length < 2}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <polyline
                  points="9 5 16 12 9 19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </motion.div>

          <div className="performances-list">
            {currentMonth.entries.length === 0 ? (
              <motion.div
                className="performances-empty-state"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4 }}
              >
                No performances recorded for this month yet.
              </motion.div>
            ) : (
              currentMonth.entries.map((entry, index) => (
                <motion.a
                  className="performances-entry"
                  href={videoSearch(entry)}
                  target="_blank"
                  rel="noreferrer"
                  key={entry.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="performances-entry-thumb">
                    <img src={imageUrl(entry.image)} alt={entry.title} />
                    <span className="performances-entry-chip">YouTube</span>
                  </div>

                  <div className="performances-entry-copy">
                    <h3>
                      {entry.title} <span>{entry.artist}</span>
                    </h3>
                    <p>
                      Come watch us perform {entry.title} by {entry.artist} on stage during{' '}
                      {currentMonth.month}.
                    </p>
                    <ul>
                      <li>Where: {entry.venue}</li>
                      <li>When: {entry.time}</li>
                      <li>Who: {entry.dancers}</li>
                    </ul>
                  </div>
                </motion.a>
              ))
            )}
          </div>
        </section>
      </PageTemplate>
    </div>
  );
}

export default PerformancesPage;

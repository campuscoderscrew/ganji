import React, { useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import './performances.css';
import heroImage from '../ComingSoon.png';
import daydreamImage from '../Chungha.png';
import logo from '../icon.jpg';

const performanceMonths = [
  {
    month: 'April 2025',
    spotlight: {
      title: 'Daydream',
      artist: 'ENHYPEN',
      description:
        'Ganji brought Daydream to UMD Maryland Day with a bright, high-energy stage that leaned into clean formations and expressive transitions.',
      image: daydreamImage,
      link: 'https://www.youtube.com/',
    },
    entries: [
      {
        title: 'Daydream',
        artist: 'ENHYPEN',
        venue: 'McKeldin Mall stage',
        time: '2 P.M.',
        dancers: 'Rachel, Mariel, Coral, Emma, Ije, Basia, Jelly',
        image: daydreamImage,
        videoLink: 'https://www.youtube.com/',
      },
      {
        title: 'Pandora',
        artist: 'MAVE',
        venue: 'McKeldin Mall stage',
        time: '2:45 P.M.',
        dancers: 'Nandini, Shuan, Meg, Madi',
        image: heroImage,
        videoLink: 'https://www.youtube.com/',
      },
    ],
  },
  {
    month: 'May 2025',
    spotlight: {
      title: 'Campus Spring Showcase',
      artist: 'Ganji Performance Team',
      description:
        'A mix-set performance built for an end-of-semester crowd, blending sharp musical changes with a bigger ensemble look.',
      image: heroImage,
      link: 'https://www.youtube.com/',
    },
    entries: [
      {
        title: 'Campus Spring Showcase',
        artist: 'Ganji Performance Team',
        venue: 'Student Union ballroom',
        time: '7 P.M.',
        dancers: 'Full performance team',
        image: heroImage,
        videoLink: 'https://www.youtube.com/',
      },
    ],
  },
  {
    month: 'June 2025',
    spotlight: {
      title: 'Summer Cover Stage',
      artist: 'Special Unit',
      description:
        'A smaller summer unit stage focused on performance texture, transitions, and close-up camera-friendly choreography.',
      image: heroImage,
      link: 'https://www.youtube.com/',
    },
    entries: [],
  },
];

function PerformancesPage() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

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

  const currentMonth = useMemo(
    () => performanceMonths[currentMonthIndex],
    [currentMonthIndex]
  );

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
    <div className="performances-page" onMouseMove={handleMouseMove}>
      <div className="performances-dots" />

      <motion.div
        className="performances-bubble performances-bubble-1"
        animate={{ y: [0, -22, 0], x: [0, 12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="performances-bubble performances-bubble-2"
        animate={{ y: [0, 18, 0], x: [0, -14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="performances-bubble performances-bubble-fg-1"
        style={{ x: parallaxX, y: parallaxY }}
      />
      <motion.div
        className="performances-bubble performances-bubble-fg-2"
        style={{ x: parallaxXSlow, y: parallaxYSlow }}
      />

      <span className="performances-sparkle performances-sparkle-1">✦</span>
      <span className="performances-sparkle performances-sparkle-2">✧</span>
      <span className="performances-sparkle performances-sparkle-3">✦</span>

      <motion.nav
        className="performances-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <a className="performances-nav-brand" href="/">
          <span className="performances-nav-brand-mark">
            <img src={logo} alt="" />
          </span>
          <span className="performances-nav-brand-copy">
            <span>Ganji</span>
            <small>Performance Team</small>
          </span>
        </a>

        <div className="performances-nav-links">
          <a href="/#about">About</a>
          <a href="/officers">Officers</a>
          <a href="/">Events</a>
          <a href="/workshops">Workshops</a>
          <a className="is-active" href="/performances">
            Performances
          </a>
          <a href="/archive">Archive</a>
        </div>
      </motion.nav>

      <header className="performances-header">
        <motion.p
          className="performances-kicker"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          On Stage
        </motion.p>
        <motion.h1
          className="performances-title"
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
          Want to see more? Check out our YouTube channel{' '}
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">
            here
          </a>
          .
        </motion.p>
      </header>

      <motion.section
        className="performances-spotlight"
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
      >
        <div className="performances-spotlight-copy">
          <p className="performances-spotlight-label">Most Recent Performance</p>
          <h2>
            {currentMonth.spotlight.title}
            <span>{currentMonth.spotlight.artist}</span>
          </h2>
          <p>{currentMonth.spotlight.description}</p>
        </div>

        <a
          className="performances-spotlight-media"
          href={currentMonth.spotlight.link}
          target="_blank"
          rel="noreferrer"
          aria-label={`Watch ${currentMonth.spotlight.title} on YouTube`}
        >
          <img src={currentMonth.spotlight.image} alt={currentMonth.spotlight.title} />
          <span className="performances-play-badge">Watch</span>
        </a>
      </motion.section>

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
          <button type="button" onClick={goToPreviousMonth} aria-label="Previous month">
            ←
          </button>
          <h2>{currentMonth.month}</h2>
          <button type="button" onClick={goToNextMonth} aria-label="Next month">
            →
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
                href={entry.videoLink}
                target="_blank"
                rel="noreferrer"
                key={`${entry.title}-${entry.artist}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -3 }}
              >
                <div className="performances-entry-thumb">
                  <img src={entry.image} alt={entry.title} />
                  <span className="performances-entry-chip">YouTube</span>
                </div>

                <div className="performances-entry-copy">
                  <h3>
                    {entry.title} <span>{entry.artist}</span>
                  </h3>
                  <p>Come watch us perform {entry.title} by {entry.artist} on stage during {currentMonth.month}.</p>
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
    </div>
  );
}

export default PerformancesPage;

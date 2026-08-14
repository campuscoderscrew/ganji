import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import './notfound.css';
import PageTemplate from '../components/PageTemplate';

function NotFoundPage() {
  const handleHomeClick = () => {
    window.location.href = '/';
  };

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

  return (
    <div className="notfound-page" onMouseMove={handleMouseMove}>
      <div className="notfound-dots" />

      <motion.div
        className="notfound-bubble notfound-bubble-1"
        animate={{ y: [0, -22, 0], x: [0, 12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="notfound-bubble notfound-bubble-2"
        animate={{ y: [0, 18, 0], x: [0, -14, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="notfound-bubble notfound-bubble-fg-1"
        style={{ x: parallaxX, y: parallaxY }}
      />
      <motion.div
        className="notfound-bubble notfound-bubble-fg-2"
        style={{ x: parallaxXSlow, y: parallaxYSlow }}
      />

      <span className="notfound-sparkle notfound-sparkle-1">âœ¦</span>
      <span className="notfound-sparkle notfound-sparkle-2">âœ§</span>
      <span className="notfound-sparkle notfound-sparkle-3">âœ¦</span>

      <PageTemplate>
        <div className="notfound-shell">
          <div className="notfound-content">
            <motion.p
              className="notfound-kicker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Page Not Found
            </motion.p>
            <motion.h1
              className="notfound-code"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            >
              404
            </motion.h1>
            <motion.p
              className="notfound-message"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Looks like this page missed the choreo...
            </motion.p>
            <motion.button
              className="notfound-home-button"
              onClick={handleHomeClick}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.3 } }}
              whileHover={{
                scale: 1.05,
                y: -2,
                transition: { type: 'spring', stiffness: 800, damping: 20 },
              }}
              whileTap={{
                scale: 0.98,
                y: 0,
                transition: { type: 'spring', stiffness: 800, damping: 20 },
              }}
            >
              Back to Home
            </motion.button>
          </div>
        </div>
      </PageTemplate>
    </div>
  );
}

export default NotFoundPage;

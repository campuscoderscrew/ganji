import React from 'react';
import { motion } from 'motion/react';
import PageTemplate from '../components/PageTemplate';
import './notfound.css';

function NotFoundPage() {
  const handleHomeClick = () => {
    window.location.href = '/';
  };

  return (
    <div className="notfound-page site-page">
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

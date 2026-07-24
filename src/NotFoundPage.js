import React from 'react';
import { motion } from 'motion/react';
import './notfound.css';

function NotFoundPage() {
  const handleHomeClick = () => {};

  return (
    <div className="notfound-page">
      <div className="notfound-dots" />
      <div className="notfound-bubble notfound-bubble-1" />
      <div className="notfound-bubble notfound-bubble-2" />
      <div className="notfound-bubble notfound-bubble-3" />
      <span className="notfound-sparkle notfound-sparkle-1">✦</span>
      <span className="notfound-sparkle notfound-sparkle-2">✧</span>
      <span className="notfound-sparkle notfound-sparkle-3">✦</span>
      <div className="notfound-card">
        <p className="notfound-code">404</p>
        <h1 className="notfound-title">Looks like this page missed the choreo...</h1>
        <motion.button
          className="notfound-home-button"
          onClick={handleHomeClick}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98, y: 0 }}
          transition={{ type: 'spring', stiffness: 800, damping: 20 }}
        >
          Back to Home
        </motion.button>
      </div>
    </div>
  );
}

export default NotFoundPage;

import React from 'react';
import './workshops.css';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import placeholder from '../icon.jpg';
import PageTemplate from '../components/PageTemplate';

function WorkshopsPage() {
  const workshops = [
    { name: 'Workshop 1', link: '[Details]' },
    { name: 'Workshop 2', link: '[Details]' },
    { name: 'Workshop 3', link: '[Details]' },
  ];

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

  const scrollToList = () => {
    document.getElementById('workshops-list')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="workshop-page" onMouseMove={handleMouseMove}>
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
      
      <PageTemplate>

        <div className="ws-title-section">
          <motion.p 
          className="ws-title-p"
          initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
          >come learn</motion.p>

          <motion.h1 
          initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
          className="ws-title">Workshops</motion.h1>
        </div>

        <div className="ws-description-section-wrap">

        <motion.div className="ws-description-section"
        initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}>
          <div>
            <h1 className="what-ws"> What are workshops? </h1>
            <p className="ws-description">
              Workshops are how we engage with our student body, meaning everyone is
              welcome! Learn today&apos;s K-POP hit dances with Ganji members! See our upcoming 
              workshops below!
            </p>
          </div>
          <img src={placeholder} alt="Most Recent Workshop" className="ws-image" />
        </motion.div>
        </div>

        <div className="workshop-list">
          <div className='list-title-wrap'>
          <motion.button
            className="list-title"
            onClick={scrollToList}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ y: 0, scale: 0.98 }}
          >
            List of Workshops
          </motion.button>
          </div>

          <div className="workshops-list">
          {workshops.map((ws, index) => (
            <div className="ws-wrap">
            <div className="ws" key={index}>
              <p className="ws-name">
                {ws.name} <a href="Events.js" className="ws-link">{ws.link}</a>
              </p>
            </div>
            </div>
          ))}
          </div>
        </div>
      </PageTemplate>
    </div>
  );
}

export default WorkshopsPage;

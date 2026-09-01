import React from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import './officers.css';
import icon from '../icon.jpg';
import PageTemplate from '../components/PageTemplate';

function OfficersPage() {
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

  const boardMembers = [
    { name: 'First Last', position: 'President', image: icon },
    { name: 'First Last', position: 'Vice President', image: icon },
    { name: 'First Last', position: 'Treasurer', image: icon },
    { name: 'First Last', position: 'Secretary', image: icon },
    { name: 'First Last', position: 'Position', image: icon },
    { name: 'First Last', position: 'Position', image: icon },
    { name: 'First Last', position: 'Position', image: icon },
    { name: 'First Last', position: 'Position', image: icon },
  ];

  return (
    <div className="officers-page" onMouseMove={handleMouseMove}>
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
        <main className="heading-officers">
          <motion.p
            className="h2-officers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
           2025-2026
          </motion.p>
          <motion.h1
            className="h1-officers"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          >
            Meet the Ganji E-Board
          </motion.h1>
          
        </main>

        <div className="icons-and-positions">
          {boardMembers.map((member, index) => (
            <div className="board-member" key={index}>
              <div className="officer-text-box">
              <motion.img 
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
              src={member.image} alt={member.name} className="board-circle" />
              
              
              <motion.p 
              initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
            className="board-name">{member.name}</motion.p>
             
              <motion.p 
              initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
              className="board-position">{member.position}</motion.p>
            </div>
            </div>
          ))}
        </div>
      </PageTemplate>
    </div>
  );
}

export default OfficersPage;

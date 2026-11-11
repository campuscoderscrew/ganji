import React from 'react';
import { motion } from 'motion/react';
import './officers.css';
import { useContent, imageUrl } from '../content';
import PageTemplate from '../components/PageTemplate';

function OfficersPage() {

  const { content } = useContent();
  const boardMembers = content.officers;

  return (
    <div className="officers-page site-page">
      <PageTemplate>
        <main className="heading-officers page-heading">
          <motion.p
            className="h2-officers page-kicker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
           {content.about.officerYear}
          </motion.p>
          <motion.h1
            className="h1-officers page-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          >
            Meet the Ganji E-Board
          </motion.h1>

        </main>

        <div className="icons-and-positions">
          {boardMembers.length === 0 && <p className="site-empty">Our board will be announced soon.</p>}
          {boardMembers.map((member) => (
            <div className="board-member" key={member.id}>
              <div className="officer-text-box">
              <motion.img
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
              src={imageUrl(member.image)} alt={member.name} className="board-circle" />


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

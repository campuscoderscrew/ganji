import React from 'react';
import './workshops.css';
import { motion } from 'motion/react';
import { useContent, imageUrl } from '../content';
import PageTemplate from '../components/PageTemplate';
import { useEventData } from '../data/events';

function WorkshopsPage() {
  const { content } = useContent();
  const { events } = useEventData();
  const workshops = events.filter(event => event.type === 'WORKSHOP');

  const scrollToList = () => {
    document.getElementById('workshops-list')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="workshop-page site-page">
      <PageTemplate>

        <div className="ws-title-section page-heading">
          <motion.p
          className="ws-title-p page-kicker"
          initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
          >come learn</motion.p>

          <motion.h1
          initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}
          className="ws-title page-title">Workshops</motion.h1>
        </div>

        <div className="ws-description-section-wrap">

        <motion.div className="ws-description-section"
        initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.18 }}>
          <div>
            <h2 className="what-ws"> What are workshops? </h2>
            <p className="ws-description">
              Workshops are how we engage with our student body, meaning everyone is
              welcome! Learn today&apos;s K-POP hit dances with Ganji members! Browse our
              workshops below!
            </p>
          </div>
          <img src={imageUrl(content.about.workshopImage)} alt="Most Recent Workshop" className="ws-image" />
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

          <div className="workshops-list" id="workshops-list">
          {workshops.length === 0 && <p className="site-empty">No workshops posted yet. Check back soon!</p>}
          {workshops.map((ws) => (
            <div className="ws-wrap" key={ws.id}>
            <div className="ws">
              <p className="ws-name">
                {ws.title} <a href={ws.permalink || "/"} className="ws-link">View event</a>
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

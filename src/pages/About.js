import React from 'react';
import { motion } from 'motion/react';
import './about.css';
import PageTemplate from '../components/PageTemplate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';

import { useContent, imageUrl } from '../content';

function AboutPage() {
  const { content: { about } } = useContent();

  return (
    <div
      className="about-page site-page"
    >
      <PageTemplate>

        {/* Hero */}

        <header className="about-header page-heading">
          <motion.p
            className="about-kicker page-kicker"
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            Get to Know Us
          </motion.p>

          <motion.h1
            className="about-title page-title"
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
              delay: 0.1,
            }}
          >
            About Us
          </motion.h1>
        </header>

        {/* ---------- Intro ---------- */}

        {/* ---------- Who We Are ---------- */}

        <motion.section
          className="about-section"
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <div className="about-card">
            <div className="about-card-content">
              <p className="about-card-kicker">
                Who We Are
              </p>
              <p>
                {about.description}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ---------- Group Photo ---------- */}

        <motion.section
          className="about-photo-section"
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <div className="about-photo">
            <img src={imageUrl(about.image)} alt="Ganji group" />
          </div>
        </motion.section>

        {/* ---------- Contact/Socials ---------- */}

        <motion.section
          className="about-contact"
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <div className="about-contact-card">
            <p className="about-card-kicker">
              Keep in Touch
            </p>

            <div className="about-socials">
              <a
                href={about.instagram || 'https://www.instagram.com/ganjiumd/'}
                className="about-social-link"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faInstagram} /><span>Message us on Instagram</span>
              </a>
              {about.discord && <a className="about-social-link" href={about.discord} target="_blank" rel="noreferrer">Discord</a>}
              {about.email && <a className="about-social-link" href={`mailto:${about.email}`}>Email us</a>}
            </div>
          </div>
        </motion.section>

      </PageTemplate>
    </div>
  );
}

export default AboutPage;

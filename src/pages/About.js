import React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import './about.css';
import PageTemplate from '../components/PageTemplate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import groupPhoto from "../groupPhoto.png"

function AboutPage() {
  // ---------- Mouse Parallax ----------

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = {
    stiffness: 60,
    damping: 20,
  };

  const parallaxX = useSpring(
    useTransform(mouseX, [-1, 1], [-24, 24]),
    springConfig
  );

  const parallaxY = useSpring(
    useTransform(mouseY, [-1, 1], [-24, 24]),
    springConfig
  );

  const parallaxXSlow = useSpring(
    useTransform(mouseX, [-1, 1], [14, -14]),
    springConfig
  );

  const parallaxYSlow = useSpring(
    useTransform(mouseY, [-1, 1], [14, -14]),
    springConfig
  );

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;

    mouseX.set((e.clientX / innerWidth - 0.5) * 2);
    mouseY.set((e.clientY / innerHeight - 0.5) * 2);
  };

  return (
    <div
      className="about-page"
      onMouseMove={handleMouseMove}
    >
      {/* ---------- Background ---------- */}

      <div className="about-dots" />

      {/* Large floating bubbles */}

      <motion.div
        className="about-bubble about-bubble-1"
        animate={{
          y: [0, -22, 0],
          x: [0, 12, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="about-bubble about-bubble-2"
        animate={{
          y: [0, 18, 0],
          x: [0, -14, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Foreground glass bubbles */}

      <motion.div
        className="about-bubble about-bubble-fg-1"
        style={{
          x: parallaxX,
          y: parallaxY,
        }}
      />

      <motion.div
        className="about-bubble about-bubble-fg-2"
        style={{
          x: parallaxXSlow,
          y: parallaxYSlow,
        }}
      />

      {/* ---------- Sparkles ---------- */}

      <span className="about-sparkle about-sparkle-1">
        ✦
      </span>

      <span className="about-sparkle about-sparkle-2">
        ✧
      </span>

      <span className="about-sparkle about-sparkle-3">
        ✦
      </span>

      {/* ---------- Page ---------- */}

      <PageTemplate activePath="/about">

        {/* Hero */}

        <header className="about-header">
          <motion.p
            className="about-kicker"
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
            className="about-title"
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

        <motion.section
          className="about-intro"
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.3,
          }}
          transition={{
            duration: 0.6,
          }}
        >
        </motion.section>

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
                "Korean Pop Dance Club" (otherwise known as Ganji) was established for 
                the purpose of exploring Korean Culture and learning K-Pop choreography 
                in a relaxed, non-judgmental environment. We hold weekly workshops that 
                are open to anyone in the UMD community and no prior dance experience is 
                required! We also perform at various events across campus like TASA's 
                Night Market, JASA's Taste of Japan, and more!
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
            <img src={groupPhoto} alt="Ganji group" />
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
              Contact Us!
            </p>
            
            <div className="about-socials">
              <a
                href="https://www.instagram.com/ganjiumd"
                className="about-social-link"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"  
              >
                <FontAwesomeIcon icon={faInstagram} />
              </a>

              <a
                href="#"
                className="about-social-link"
                aria-label="Discord"
                target="_blank"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faDiscord} />
              </a>

              <a
                href="mailto:your-email@example.com"
                className="about-social-link"
                aria-label="Email"
              >
                <FontAwesomeIcon icon={faEnvelope} />
              </a>
            </div>
          </div>
        </motion.section>

      </PageTemplate>
    </div>
  );
}

export default AboutPage;
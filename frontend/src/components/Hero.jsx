import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from '../api';
import './Hero.css';

const Hero = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/public/heros`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setProfile(data[0]);
        }
      })
      .catch(err => console.error('Failed to fetch Hero data:', err));
  }, []);

  // Helper to neatly render multiline strings saved via textarea
  const renderText = (text, fallback) => {
    const content = text || fallback;
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i !== content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <section id="home" className="hero-section section-container">
      <div className="hero-content">
        <motion.div
          className="hero-name-container"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="hero-name" style={{ fontSize: '6rem' }}>
            {renderText(profile?.heroName, 'Satvic\nReddy')}
          </h1>
        </motion.div>



        <div className="hero-right-content">
          <motion.div
            className="hero-titles"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="title-group hover-magnetic">
              <h2 className="title-outline">{profile?.heroTitle1 ? profile.heroTitle1.toUpperCase() : 'ANDROID'}</h2>
              <h2 className="title-outline text-dim">{profile?.heroSubtitle1 ? profile.heroSubtitle1.toUpperCase() : 'DEVELOPER'}</h2>
            </div>
            <div className="ampersand">&</div>
            <div className="title-group hover-magnetic">
              <h2 className="title-filled">{profile?.heroTitle2 ? profile.heroTitle2.toUpperCase() : 'ML/AI'}</h2>
              <h2 className="title-outline text-dim">{profile?.heroSubtitle2 ? profile.heroSubtitle2.toUpperCase() : 'ENGINEER'}</h2>
            </div>
          </motion.div>

          <motion.div
            className="hero-description"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mono-text desc-text">
              {renderText(profile?.heroDescription, 'Crafting immersive digital experiences with\nprecision and performant code.')}
            </p>
            <div className="desc-line"></div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mouse">
          <div className="wheel"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;

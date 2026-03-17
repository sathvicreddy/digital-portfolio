import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, GraduationCap, Code2, Heart } from 'lucide-react';
import { API_BASE } from '../api';
import './AboutMe.css';

const AboutMe = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/public/abouts`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          setProfile(data[0]);
        }
      })
      .catch(err => console.error('Failed to fetch AboutMe data:', err));
  }, []);

  const renderText = (text, fallback) => {
    const content = text || fallback;
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i !== content.split('\n').length - 1 && <br/>}
      </React.Fragment>
    ));
  };

  return (
    <section id="about" className="about-section section-container">
      <div className="about-content">
        {/* Left: Portrait Card */}
        <motion.div 
          className="about-image-card"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="about-image-inner">
            <img 
              src={profile?.aboutImage || "/assets/about-portrait.png"} 
              alt="Satvic Reddy" 
              className="about-portrait" 
            />
          </div>
        </motion.div>

        {/* Right: Info */}
        <motion.div 
          className="about-info"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="about-label">ABOUT ME</span>
          <h2 className="about-heading">
            {profile?.aboutHeading ? renderText(profile.aboutHeading, '') : (
              <>Passionate about <span className="accent-text">Data & Code</span></>
            )}
          </h2>

          <p className="about-description">
            {renderText(profile?.aboutDescription1, 'I am a Computer Science Engineering student passionate about Data Analytics, Web Development, and AI-based applications. I enjoy building interactive dashboards, intelligent systems, and full-stack applications.')}
          </p>

          <p className="about-description-secondary">
            {renderText(profile?.aboutDescription2, "I focus on problem-solving, automation, and creating user-friendly digital experiences. Whether it's analyzing complex datasets or building a responsive web app, I love turning ideas into reality.")}
          </p>

          <div className="about-info-grid">
            <div className="info-card">
              <MapPin size={18} className="info-card-icon" />
              <div>
                <span className="info-card-label">LOCATION</span>
                <span className="info-card-value">{profile?.aboutLocation || 'India'}</span>
              </div>
            </div>
            <div className="info-card">
              <GraduationCap size={18} className="info-card-icon" />
              <div>
                <span className="info-card-label">DEGREE</span>
                <span className="info-card-value">{profile?.aboutDegree || 'B.Tech CSE'}</span>
              </div>
            </div>
            <div className="info-card">
              <Code2 size={18} className="info-card-icon" />
              <div>
                <span className="info-card-label">FOCUS</span>
                <span className="info-card-value">{profile?.aboutFocus || 'Full-Stack & AI'}</span>
              </div>
            </div>
            <div className="info-card">
              <Heart size={18} className="info-card-icon" />
              <div>
                <span className="info-card-label">PASSION</span>
                <span className="info-card-value">{profile?.aboutPassion || 'Problem Solving'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutMe;

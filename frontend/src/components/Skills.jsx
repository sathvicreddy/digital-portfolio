import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from '../api';
import './Skills.css';

const Skills = () => {
  const [skillsRows, setSkillsRows] = useState([[], [], []]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/skills`);
        if (res.ok) {
          const data = await res.json();
          // Distribute skills into 3 rows for the marquee effect
          const rows = [[], [], []];
          data.forEach((skill, i) => {
            rows[i % 3].push(skill.name);
          });
          setSkillsRows(rows);
        }
      } catch (err) {
        console.error('Failed to fetch skills', err);
      }
    };
    fetchSkills();
  }, []);

  return (
    <section id="skills" className="skills-section section-container">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="section-header">
          <span className="mono-text">SKILLS</span>
          <h2 className="section-title">CAPABILITIES</h2>
        </div>

        <div className="marquee-container">
          {skillsRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`marquee-row ${rowIndex % 2 !== 0 ? 'reverse' : ''}`}
            >
              <div className="marquee-content">
                {row.map((skill, index) => (
                  <span key={index} className="skill-item">{skill}</span>
                ))}
                {/* Duplicate for seamless infinite scrolling */}
                {row.map((skill, index) => (
                  <span key={`dup-${index}`} className="skill-item">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="fade-overlay left"></div>
        <div className="fade-overlay right"></div>
      </motion.div>
    </section>
  );
};

export default Skills;

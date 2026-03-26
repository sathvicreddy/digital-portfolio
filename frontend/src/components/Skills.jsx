import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from '../api';
import './Skills.css';

// react-icons imports
import {
  FaPython, FaJava, FaJs, FaReact, FaNodeJs,
  FaHtml5, FaCss3Alt, FaGitAlt, FaGithub, FaDocker,
  FaAws, FaDatabase, FaLinux, FaFigma, FaAndroid,
} from 'react-icons/fa';

import {
  SiCplusplus, SiC, SiMongodb, SiPostgresql, SiMysql,
  SiRedis, SiTailwindcss, SiNextdotjs, SiTypescript,
  SiTensorflow, SiPytorch, SiScikitlearn, SiPandas,
  SiNumpy, SiOpencv, SiFlask, SiDjango, SiFastapi,
  SiKubernetes, SiFirebase, SiGraphql, SiExpress,
  SiVercel, SiPostman, SiJupyter, SiAnaconda,
  SiSelenium, SiSqlite,
} from 'react-icons/si';

import { BiCodeBlock } from 'react-icons/bi';

// Map skill names (lowercase) to icon components
const SKILL_ICON_MAP = {
  // Languages
  python: <FaPython />,
  java: <FaJava />,
  javascript: <FaJs />,
  typescript: <SiTypescript />,
  'c++': <SiCplusplus />,
  cpp: <SiCplusplus />,
  c: <SiC />,
  html: <FaHtml5 />,
  css: <FaCss3Alt />,
  html5: <FaHtml5 />,
  css3: <FaCss3Alt />,

  // Frameworks & Libraries
  react: <FaReact />,
  'react.js': <FaReact />,
  'node.js': <FaNodeJs />,
  nodejs: <FaNodeJs />,
  'next.js': <SiNextdotjs />,
  nextjs: <SiNextdotjs />,
  'tailwind css': <SiTailwindcss />,
  tailwindcss: <SiTailwindcss />,
  tailwind: <SiTailwindcss />,
  flask: <SiFlask />,
  django: <SiDjango />,
  fastapi: <SiFastapi />,
  express: <SiExpress />,
  'express.js': <SiExpress />,
  graphql: <SiGraphql />,

  // AI / ML
  tensorflow: <SiTensorflow />,
  pytorch: <SiPytorch />,
  'scikit-learn': <SiScikitlearn />,
  sklearn: <SiScikitlearn />,
  pandas: <SiPandas />,
  numpy: <SiNumpy />,
  opencv: <SiOpencv />,
  'machine learning': <SiScikitlearn />,
  'deep learning': <SiPytorch />,

  // Databases
  mongodb: <SiMongodb />,
  postgresql: <SiPostgresql />,
  postgres: <SiPostgresql />,
  mysql: <SiMysql />,
  redis: <SiRedis />,
  sqlite: <SiSqlite />,
  firebase: <SiFirebase />,

  // DevOps & Cloud
  git: <FaGitAlt />,
  github: <FaGithub />,
  docker: <FaDocker />,
  kubernetes: <SiKubernetes />,
  aws: <FaAws />,
  vercel: <SiVercel />,
  linux: <FaLinux />,

  // Tools
  figma: <FaFigma />,
  postman: <SiPostman />,
  jupyter: <SiJupyter />,
  anaconda: <SiAnaconda />,
  selenium: <SiSelenium />,
  android: <FaAndroid />,
};

const getSkillIcon = (skillName) => {
  const key = skillName.toLowerCase().trim();
  return SKILL_ICON_MAP[key] || <BiCodeBlock />;
};

const Skills = () => {
  const [skillsRows, setSkillsRows] = useState([[], [], []]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/skills`);
        if (res.ok) {
          const data = await res.json();
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
        viewport={{ once: true, margin: '-100px' }}
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
                  <span key={index} className="skill-item">
                    <span className="skill-icon">{getSkillIcon(skill)}</span>
                    {skill}
                  </span>
                ))}
                {row.map((skill, index) => (
                  <span key={`dup-${index}`} className="skill-item">
                    <span className="skill-icon">{getSkillIcon(skill)}</span>
                    {skill}
                  </span>
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

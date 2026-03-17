import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Rocket, Mail, Github, Code, Download, BookOpen, Award, FileBadge, Linkedin } from 'lucide-react';
import { API_BASE } from '../api';
import './Navbar.css';

const Navbar = () => {
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
      .catch(err => console.error('Failed to fetch profile for navbar:', err));
  }, []);
  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="nav-logo">
        <a href="#home">S</a>
      </div>

      <div className="nav-links">
        <a href="#skills" className="nav-link">
          <Cpu className="nav-icon" /> SKILLS
        </a>
        <a href="#projects" className="nav-link">
          <Rocket className="nav-icon" /> PROJ
        </a>
        <a href="#training" className="nav-link">
          <Code className="nav-icon" /> TRAIN
        </a>
        <a href="#achievements" className="nav-link">
          <Award className="nav-icon" /> ACHV
        </a>
        <a href="#certificates" className="nav-link">
          <FileBadge className="nav-icon" /> CERT
        </a>
        <a href="#education" className="nav-link">
          <BookOpen className="nav-icon" /> EDU
        </a>
        <a href="#social" className="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg> SOCIAL
        </a>
        <a href="#contact" className="nav-link">
          <Mail className="nav-icon" /> CONTACT
        </a>
      </div>

      <div className="nav-socials">
        <a href={profile?.githubLink || "https://github.com/"} target="_blank" rel="noopener noreferrer" className="social-link">
          <Github className="social-icon" />
        </a>
        <a href={profile?.linkedinLink || "https://www.linkedin.com/"} target="_blank" rel="noopener noreferrer" className="social-link">
          <Linkedin className="social-icon" />
        </a>
        <a href={profile?.leetcodeLink || "https://leetcode.com/"} target="_blank" rel="noopener noreferrer" className="social-link" title="LeetCode">
          <Code className="social-icon" />
        </a>
        <a href={profile?.resumeLink || "#"} target={profile?.resumeLink ? "_blank" : "_self"} rel="noopener noreferrer" className="social-link" title="Resume">
          <Download className="social-icon" />
        </a>
      </div>
    </motion.nav>
  );
};

export default Navbar;

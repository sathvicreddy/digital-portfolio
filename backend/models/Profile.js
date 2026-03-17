const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  // Hero Section
  heroName: { type: String, default: 'Satvic\nReddy' },
  heroTitle1: { type: String, default: 'ANDROID' },
  heroSubtitle1: { type: String, default: 'DEVELOPER' },
  heroTitle2: { type: String, default: 'ML/AI' },
  heroSubtitle2: { type: String, default: 'ENGINEER' },
  heroDescription: { type: String, default: 'Crafting immersive digital experiences with\nprecision and performant code.' },
  
  // About Section
  aboutHeading: { type: String, default: 'Passionate about Data & Code' },
  aboutDescription1: { type: String, default: 'I am a Computer Science Engineering student passionate about Data Analytics, Web Development, and AI-based applications. I enjoy building interactive dashboards, intelligent systems, and full-stack applications.' },
  aboutDescription2: { type: String, default: 'I focus on problem-solving, automation, and creating user-friendly digital experiences. Whether it\'s analyzing complex datasets or building a responsive web app, I love turning ideas into reality.' },
  aboutImage: { type: String, default: '/assets/about-portrait.png' },
  
  // About - Info Grid
  aboutLocation: { type: String, default: 'India' },
  aboutDegree: { type: String, default: 'B.Tech CSE' },
  aboutFocus: { type: String, default: 'Full-Stack & AI' },
  aboutPassion: { type: String, default: 'Problem Solving' },

  // Contact & Social Links
  contactEmail: { type: String, default: 'satvicreddyc@gmail.com' },
  contactPhone: { type: String, default: '+91-9398659814' },
  contactLocation: { type: String, default: 'India' },
  
  // Resumes & URLs
  resumeLink: { type: String, default: '' },
  githubLink: { type: String, default: 'https://github.com/sathvicreddy' },
  linkedinLink: { type: String, default: 'https://www.linkedin.com/in/chennamreddy-gnana-satvic-reddy/' },
  leetcodeLink: { type: String, default: 'https://leetcode.com/u/kNewy9Y6c4/' }

}, { timestamps: true });

// Check if a model is already compiled to prevent overwrite errors in hot-reloading
module.exports = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

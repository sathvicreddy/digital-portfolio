const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
  // Hero Section
  heroName: { type: String, default: 'Satvic\nReddy' },
  heroTitle1: { type: String, default: 'ANDROID' },
  heroSubtitle1: { type: String, default: 'DEVELOPER' },
  heroTitle2: { type: String, default: 'ML/AI' },
  heroSubtitle2: { type: String, default: 'ENGINEER' },
  heroDescription: { type: String, default: 'Crafting immersive digital experiences with\nprecision and performant code.' },
  
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

module.exports = mongoose.models.Hero || mongoose.model('Hero', heroSchema);

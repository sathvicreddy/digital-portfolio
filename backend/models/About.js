const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
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
}, { timestamps: true });

module.exports = mongoose.models.About || mongoose.model('About', aboutSchema);

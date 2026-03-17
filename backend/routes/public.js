const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models
const Project = require('../models/Project');
const Achievement = require('../models/Achievement');
const Certification = require('../models/Certification');
const Skill = require('../models/Skill');
const Training = require('../models/Training');
const Experience = require('../models/Experience');
const SocialPost = require('../models/SocialPost');
const Hero = require('../models/Hero');
const About = require('../models/About');
const models = {
  projects: Project,
  achievements: Achievement,
  certifications: Certification,
  skills: Skill,
  trainings: Training,
  experiences: Experience,
  socialposts: SocialPost,
  heros: Hero,
  abouts: About
};

// Helper: sanitize text to prevent HTML injection in emails
const sanitizeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Helper: validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const nodemailer = require('nodemailer');
// Handle contact form submissions and send real emails
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: 'Please provide a valid email address' });
    }

    // Enforce reasonable length limits
    if (name.length > 100) {
      return res.status(400).json({ msg: 'Name is too long (max 100 characters)' });
    }
    if (message.length > 5000) {
      return res.status(400).json({ msg: 'Message is too long (max 5000 characters)' });
    }

    // Sanitize inputs for HTML email
    const safeName = sanitizeHtml(name);
    const safeEmail = sanitizeHtml(email);
    const safeMessage = sanitizeHtml(message);

    // Check if email credentials exist
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Missing EMAIL_USER or EMAIL_PASS in .env. Faking success for now.');
      console.log('📬 Simulated Email Received:', { name: safeName, email: safeEmail, message: safeMessage });
      return res.json({ msg: 'Message received successfully (simulated)' });
    }

    // Configure the Google SMTP transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Setup email data — use sanitized content
    const mailOptions = {
      from: `"${safeName}" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: 'satvicreddyc@gmail.com',
      subject: `New Portfolio Message from ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #0a66c2;">New Message from Portfolio</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email Address:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; color: #333; line-height: 1.5;">${safeMessage}</p>
        </div>
      `
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email successfully sent from ${safeName}`);
    
    res.json({ msg: 'Message sent successfully' });
  } catch (err) {
    console.error('❌ Email sending error:', err.message);
    res.status(500).json({ msg: 'Server Error: Failed to send email' });
  }
});

// Generic GET route for any model
// e.g. /api/public/projects
router.get('/:model', async (req, res) => {
  try {
    const modelName = req.params.model.toLowerCase();
    const Model = models[modelName];

    if (!Model) return res.status(400).json({ msg: 'Invalid model type' });

    const records = await Model.find().sort({ createdAt: -1 }); // Newest first
    res.json(records);
  } catch (err) {
    console.error(`GET /public/${req.params.model} error:`, err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Like a social post
router.post('/socialposts/:id/like', async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid post ID format' });
    }

    const post = await SocialPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    post.likes += 1;
    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    console.error('Like post error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Comment on a social post
router.post('/socialposts/:id/comment', async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Invalid post ID format' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Comment text is required' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ msg: 'Comment is too long (max 1000 characters)' });
    }

    const post = await SocialPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    const newComment = { text: text.trim() };
    post.comments.push(newComment);
    await post.save();
    
    res.json(post.comments);
  } catch (err) {
    console.error('Comment post error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;

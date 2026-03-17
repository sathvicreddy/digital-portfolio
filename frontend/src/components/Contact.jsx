import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Mail, Linkedin, Github, Code, Send } from 'lucide-react';
import { API_BASE } from '../api';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState('');
  const [profile, setProfile] = useState(null);

  React.useEffect(() => {
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
      .catch(err => console.error('Failed to fetch profile for contact:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus('Please fill in all fields.');
      return;
    }
    setFormStatus('Sending...');
    try {
      const res = await fetch(`${API_BASE}/api/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormStatus('Message sent successfully! ✓');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setFormStatus('Failed to send. Please try again.');
      }
    } catch (err) {
      setFormStatus('Failed to send. Please try again.');
    }
  };

  return (
    <footer id="contact" className="contact-section section-container">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
      {/* Hero Row: Title + Form */}
      <div className="contact-hero">
        {/* Left Side: Title and Info Grid */}
        <div className="contact-info-left">
          <div className="contact-header">
            <span className="mono-text">[ CONTACT ]</span>
            <h2 className="contact-title">
              Let's Build<br />
              <span className="text-dim">Something Cool</span><br />
              Together.
            </h2>
          </div>

          <div className="contact-grid">
            <div className="contact-column">
              <h4 className="column-title mono-text">CONNECT</h4>
              <div className="contact-links">
                <a href={`mailto:${profile?.contactEmail || 'satvicreddyc@gmail.com'}`} className="contact-item">
                  <Mail size={16} /> {profile?.contactEmail || 'satvicreddyc@gmail.com'}
                </a>
                <a href={profile?.linkedinLink || 'https://www.linkedin.com/'} target="_blank" rel="noopener noreferrer" className="contact-item">
                  <Linkedin size={16} /> LinkedIn <ExternalLink size={12} />
                </a>
                <a href={profile?.githubLink || 'https://github.com/'} target="_blank" rel="noopener noreferrer" className="contact-item">
                  <Github size={16} /> GitHub <ExternalLink size={12} />
                </a>
                <a href={profile?.leetcodeLink || 'https://leetcode.com/'} target="_blank" rel="noopener noreferrer" className="contact-item">
                  <Code size={16} /> LeetCode <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="contact-column">
              <h4 className="column-title mono-text">MORE</h4>
              <div className="contact-info">
                <p><strong>Mobile:</strong><br />{profile?.contactPhone || '+91-9398659814'}</p>
              </div>
            </div>

            <div className="contact-column">
              <h4 className="column-title mono-text">LOCATION</h4>
              <div className="contact-info">
                <p>{profile?.contactLocation || 'India'}</p>
                <p className="remote-status">
                  <span className="status-dot"></span> Remote Available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="contact-form-card">
          <h3 className="form-card-heading">Send a Message</h3>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label>Message</label>
              <textarea
                name="message"
                placeholder="How can I help you?"
                rows="4"
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="send-message-btn">
              <Send size={16} /> Send Message
            </button>
            {formStatus && <p className="form-status-msg">{formStatus}</p>}
          </form>
        </div>
      </div>

      <div className="contact-footer">
        <p className="copyright mono-text">© {new Date().getFullYear()} Sathvic Reddy.</p>
        <button className="back-to-top mono-text" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          BACK TO START ↑
        </button>
      </div>
      </motion.div>
    </footer>
  );
};

export default Contact;

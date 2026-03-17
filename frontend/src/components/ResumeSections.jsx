import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from '../api';

// Helper to convert Google Drive share links into direct image links
const getImageUrl = (url) => {
  if (!url) return null;
  const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
  const match = url.match(driveRegex);
  if (match && match[1]) {
    return `https://drive.google.com/uc?id=${match[1]}`;
  }
  return url;
};
import { Award, BookOpen, FileBadge, Code } from 'lucide-react';
import './ResumeSections.css';

const ResumeSections = () => {
  const [trainings, setTrainings] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [socialPosts, setSocialPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Experience', 'Training'
  const certScrollRef = useRef(null);
  const socialScrollRef = useRef(null);
  const achScrollRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainRes, expRes, achRes, certRes, socialRes] = await Promise.all([
          fetch(`${API_BASE}/api/public/trainings`),
          fetch(`${API_BASE}/api/public/experiences`),
          fetch(`${API_BASE}/api/public/achievements`),
          fetch(`${API_BASE}/api/public/certifications`),
          fetch(`${API_BASE}/api/public/socialposts`)
        ]);

        if (trainRes.ok) setTrainings(await trainRes.json());
        if (expRes.ok) setExperiences(await expRes.json());
        if (achRes.ok) setAchievements(await achRes.json());
        if (certRes.ok) setCertifications(await certRes.json());
        if (socialRes.ok) setSocialPosts(await socialRes.json());
      } catch (err) {
        console.error('Failed to fetch resume data', err);
      }
    };
    fetchData();
  }, []);

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/api/public/socialposts/${postId}/like`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setSocialPosts(posts => posts.map(p => p._id === postId ? { ...p, likes: data.likes } : p));
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost(prev => ({ ...prev, likes: data.likes }));
        }
      }
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/public/socialposts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const updatedComments = await res.json();
        setSocialPosts(posts => posts.map(p => p._id === postId ? { ...p, comments: updatedComments } : p));
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost(prev => ({ ...prev, comments: updatedComments }));
        }
        setCommentInputs(prev => ({ ...prev, [postId]: '' })); // clear input
      }
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  // Combine and sort trainings and experiences
  const combinedTimeline = [
    ...trainings.map(t => ({ ...t, type: 'Training' })),
    ...experiences.map(e => ({ ...e, type: 'Experience' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort newest first

  const filteredTimeline = combinedTimeline.filter(item =>
    activeFilter === 'All' ? true : item.type === activeFilter
  );

  return (
    <>
      {/* Training & Experience Section */}
      <section id="training" className="training-section section-container">
        <motion.div 
          className="section-header" style={{ alignItems: 'center', textAlign: 'center' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="mono-text">MY JOURNEY</span>
          <h2 className="section-title timeline-section-title">Training <span className="title-ampersand">&</span> <span className="title-outline">Experience</span></h2>
        </motion.div>

        <div className="timeline-filters">
          <button
            className={`filter-pill ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All
          </button>
          <button
            className={`filter-pill ${activeFilter === 'Experience' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Experience')}
          >
            Experience
          </button>
          <button
            className={`filter-pill ${activeFilter === 'Training' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Training')}
          >
            Training
          </button>
        </div>

        <div className="timeline-container">
          <div className="vertical-timeline-line"></div>
          {filteredTimeline.length > 0 ? filteredTimeline.map((item, index) => (
            <motion.div
              key={item._id}
              className="timeline-item"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="timeline-dot">
                <div className="timeline-dot-inner"></div>
              </div>
              <div className="timeline-card">
                <div className="timeline-card-header">
                  <h4 className="timeline-title">{item.title}</h4>
                  <div className={`timeline-badge ${item.type.toLowerCase()}`}>
                    {item.type === 'Training' ? <BookOpen size={14} /> : <FileBadge size={14} />}
                    <span>{item.type}</span>
                  </div>
                </div>
                <span className="timeline-org">{item.type === 'Training' ? item.organization : item.company}</span>
                <p className="timeline-desc">{item.description}</p>
                {item.date && (
                  <div className="timeline-date-row">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{item.date}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )) : (
            <p className="text-dim text-center" style={{ width: '100%', padding: '2rem 0' }}>No items found for {activeFilter.toLowerCase()}.</p>
          )}
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="achievements-section section-container">
        <motion.div 
          className="section-header" style={{ textAlign: 'center' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="mono-text" style={{ display: 'block', marginBottom: '0.5rem' }}>RECOGNITION</span>
          <h2 className="section-title" style={{ justifyContent: 'center' }}>
            <Award className="inline-icon" /> ACHIEVEMENTS
          </h2>
        </motion.div>

        <div className="scroll-section-wrapper">
          <button className="scroll-arrow scroll-arrow-left" onClick={() => scroll(achScrollRef, 'left')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="horizontal-scroll-track" ref={achScrollRef}>
          {achievements.length > 0 ? achievements.map((achievement, index) => (
            <motion.div
              key={achievement._id}
              className="ach-card-new scroll-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <div className="ach-card-top-row">
                <span className="ach-category-badge">
                  {achievement.category === 'Hackathon' ? '🏆' :
                    achievement.category === 'Challenge' ? '🏅' :
                      achievement.category === 'DSA' ? '🏅' : '🏆'} {achievement.category || 'Achievement'}
                </span>
                <div className="ach-card-icon">
                  {achievement.category === 'Hackathon' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                  ) : achievement.category === 'Challenge' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
                  ) : achievement.category === 'DSA' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
                  ) : (
                    <Award size={28} />
                  )}
                </div>
              </div>
              <h4 className="ach-card-title">{achievement.title}</h4>
              <p className="ach-card-desc">{achievement.description}</p>
            </motion.div>
          )) : (
            <p className="text-dim text-center" style={{ width: '100%' }}>Loading achievements...</p>
          )}
          </div>
          <button className="scroll-arrow scroll-arrow-right" onClick={() => scroll(achScrollRef, 'right')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </section>

      {/* Certificates Section */}
      <section id="certificates" className="resume-section section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="mono-text">QUALIFICATIONS</span>
          <h2 className="section-title"><FileBadge className="inline-icon" /> CERTIFICATIONS</h2>
        </motion.div>

        <div className="scroll-section-wrapper">
          <button className="scroll-arrow scroll-arrow-left" onClick={() => scroll(certScrollRef, 'left')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="horizontal-scroll-track" ref={certScrollRef}>
            {certifications.length > 0 ? certifications.map((cert) => (
              <div key={cert._id} className="card-item hover-magnetic cert-card scroll-card">
                {cert.image && (
                  <div className="cert-image-wrapper">
                    <img src={cert.image} alt={`${cert.issuer} Certificate`} className="cert-image" />
                  </div>
                )}
                <h4 className="cert-title mt-2">{cert.title}</h4>
                <div className="desc-line" style={{ width: '50px', margin: '1rem 0' }}></div>
                <p className="cert-issuer text-dim">{cert.issuer} {cert.date ? `| ${cert.date}` : ''}</p>
              </div>
            )) : (
              <p className="text-dim">Loading certifications...</p>
            )}
          </div>
          <button className="scroll-arrow scroll-arrow-right" onClick={() => scroll(certScrollRef, 'right')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="resume-section section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="mono-text">BACKGROUND</span>
          <h2 className="section-title"><BookOpen className="inline-icon" /> EDUCATION</h2>
        </motion.div>

        <div className="edu-timeline">
          {/* Timeline Line */}
          <div className="edu-timeline-line" />

          {/* LPU */}
          <div className="edu-timeline-item">
            <div className="edu-dot-wrapper">
              <div className="edu-dot active" />
              <div className="edu-dot-ring" />
            </div>
            <div className="edu-card edu-card-active">
              <div className="edu-card-header">
                <div>
                  <h4 className="edu-institution">Lovely Professional University</h4>
                  <p className="edu-degree">Bachelor of Technology — Computer Science & Engineering</p>
                </div>
                <span className="edu-badge">CGPA: 7.5</span>
              </div>
              <div className="edu-card-footer">
                <span className="edu-date mono-text">Aug '23 — Present</span>
                <span className="edu-location">📍 Phagwara, Punjab</span>
              </div>
            </div>
          </div>

          {/* Edify */}
          <div className="edu-timeline-item">
            <div className="edu-dot-wrapper">
              <div className="edu-dot" />
            </div>
            <div className="edu-card">
              <div className="edu-card-header">
                <div>
                  <h4 className="edu-institution">Edify School</h4>
                  <p className="edu-degree">Intermediate (12th Grade)</p>
                </div>
                <span className="edu-badge">81%</span>
              </div>
              <div className="edu-card-footer">
                <span className="edu-date mono-text">Aug '21 — Mar '23</span>
                <span className="edu-location">📍 Tirupati, Andhra Pradesh</span>
              </div>
            </div>
          </div>

          {/* Sri Chaitanya */}
          <div className="edu-timeline-item">
            <div className="edu-dot-wrapper">
              <div className="edu-dot" />
            </div>
            <div className="edu-card">
              <div className="edu-card-header">
                <div>
                  <h4 className="edu-institution">Sri Chaitanya School</h4>
                  <p className="edu-degree">Matriculation (10th Grade)</p>
                </div>
                <span className="edu-badge gold">100%</span>
              </div>
              <div className="edu-card-footer">
                <span className="edu-date mono-text">Apr '20 — Jun '21</span>
                <span className="edu-location">📍 Tirupati, Andhra Pradesh</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Footprints Section */}
      <section id="social" className="resume-section section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="mono-text">NETWORKING</span>
          <h2 className="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#00e5ff" stroke="none" className="inline-icon" style={{ marginRight: '8px', verticalAlign: 'middle', transform: 'translateY(-2px)' }}>
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            SOCIAL POSTS
          </h2>
        </motion.div>

        <div className="scroll-section-wrapper">
          <button className="scroll-arrow scroll-arrow-left" onClick={() => scroll(socialScrollRef, 'left')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="social-scroll-wrapper" ref={socialScrollRef}>
            {socialPosts.length > 0 ? socialPosts.map((post, index) => (
              <motion.div
                key={post._id}
                className="pro-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedPost(post)}
                style={{ cursor: 'pointer' }}
              >
                <div className="pro-card-header">
                  <span className="pro-card-author">{post.authorName}</span>
                  <span className="pro-card-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="pro-content">
                  <p>{post.content}</p>
                </div>

                {post.image && (
                  <div className="pro-image">
                    <img src={getImageUrl(post.image)} alt="Attachment" />
                  </div>
                )}

                <div className="pro-engagement">
                  <div className="pro-stats">
                    <div className="pro-reactions">
                      <span className="reaction-icon like">👍</span>
                      <span className="reaction-icon heart">❤️</span>
                      <span className="reaction-text">{post.likes || 0} Likes</span>
                    </div>
                    <span className="pro-comments">{post.comments ? post.comments.length : 0} comments</span>
                  </div>

                  <div className="pro-actions">
                    <button onClick={(e) => { e.stopPropagation(); handleLike(post._id); }} className="pro-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                      Like
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }} className="pro-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      Comment
                    </button>
                  </div>
                </div>
              </motion.div>
            )) : (
              <p className="text-dim" style={{ textAlign: 'center', width: '100%' }}>No footprints shared yet.</p>
            )}
          </div>
          <button className="scroll-arrow scroll-arrow-right" onClick={() => scroll(socialScrollRef, 'right')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </section>

      {/* ===== POST DETAIL MODAL (LinkedIn-Style) ===== */}
      {selectedPost && (
        <div className="post-modal-overlay" onClick={() => setSelectedPost(null)}>
          <motion.div
            className="post-modal-linkedin"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Close Button */}
            <button className="linkedin-modal-close" onClick={() => setSelectedPost(null)}>✕</button>

            <div className="linkedin-modal-layout">
              {/* Left Panel — Image or Text Fallback */}
              <div className={`linkedin-modal-left ${selectedPost.image ? '' : 'no-image'}`}>
                {selectedPost.image ? (
                  <img src={getImageUrl(selectedPost.image)} alt="Post attachment" />
                ) : (
                  <div className="linkedin-text-fallback">
                    <p>{selectedPost.content}</p>
                  </div>
                )}
              </div>

              {/* Right Panel — Author, Content, Actions, Comments */}
              <div className="linkedin-modal-right">
                {/* Author Header (no profile image) */}
                <div className="linkedin-modal-author">
                  <div>
                    <h4 className="linkedin-author-name">{selectedPost.authorName}</h4>
                    <span className="linkedin-post-time">{new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="linkedin-modal-content">
                  <p>{selectedPost.content}</p>
                </div>

                {/* Engagement Stats */}
                <div className="linkedin-modal-stats">
                  <div className="pro-reactions">
                    <span className="reaction-icon like">👍</span>
                    <span className="reaction-icon heart">❤️</span>
                    <span className="reaction-text">{selectedPost.likes || 0}</span>
                  </div>
                  <span className="linkedin-comment-count">{selectedPost.comments ? selectedPost.comments.length : 0} comments</span>
                </div>

                {/* Action Buttons */}
                <div className="linkedin-modal-actions">
                  <button onClick={() => handleLike(selectedPost._id)} className="linkedin-action-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    Like
                  </button>
                  <button className="linkedin-action-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Comment
                  </button>
                </div>

                {/* Comment Input */}
                <form className="linkedin-comment-input" onSubmit={(e) => handleCommentSubmit(e, selectedPost._id)}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInputs[selectedPost._id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [selectedPost._id]: e.target.value })}
                  />
                  <button type="submit" disabled={!commentInputs[selectedPost._id]}>Post</button>
                </form>

                {/* Comments List */}
                <div className="linkedin-comments-section">
                  {selectedPost.comments && selectedPost.comments.length > 0 ? (
                    selectedPost.comments.map((c, idx) => (
                      <div key={idx} className="linkedin-comment-item">
                        <div className="linkedin-comment-body">
                          <span className="linkedin-comment-author">User</span>
                          <span className="linkedin-comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                          <p>{c.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="linkedin-no-comments">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ResumeSections;

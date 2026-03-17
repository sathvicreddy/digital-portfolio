import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE } from '../api';
import './Projects.css';

const Projects = () => {
  const scrollRef = useRef(null);
  const [projectsData, setProjectsData] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/projects`);
        if (res.ok) {
          const data = await res.json();
          setProjectsData(data);
        }
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };
    fetchProjects();
  }, []);

  const checkScrollability = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollability();
    el.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);
    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [projectsData]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 400;
    el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  };

  return (
    <section id="projects" className="projects-section">
      <motion.div 
        className="projects-header-wrapper"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="section-header-left">
          <span className="mono-text">WORK</span>
          <h2 className="section-title">PROJECTS</h2>
        </div>
        <div className="projects-nav-arrows">
          <button
            className={`arrow-btn ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous project"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className={`arrow-btn ${!canScrollRight ? 'disabled' : ''}`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Next project"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </motion.div>

      <div className="projects-carousel-wrapper" ref={scrollRef}>
        <div className="projects-grid">
          {projectsData.map((project, index) => (
            <motion.div
              key={project._id || index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="project-card-wrapper"
            >
              <div className="project-card">
                <div
                  className="project-bg"
                  style={{ backgroundImage: `url(${project.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop'})` }}
                ></div>
                <div className="project-overlay"></div>

                <div className="project-content">
                  <div className="project-top">
                    <div className="project-id">{index < 9 ? `0${index + 1}` : index + 1}</div>
                  </div>

                  <div className="project-bottom">
                    <p className="project-category mono-text">{project.category || 'PROJECT'}</p>
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description text-dim">{project.description}</p>

                    <div className="project-tags">
                      {project.tech && project.tech.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))}
                    </div>

                    <div className="project-links">
                      {project.githubLink && (
                        <a href={project.githubLink} className="project-link" target="_blank" rel="noreferrer">
                          SOURCE <ExternalLink size={14} />
                        </a>
                      )}
                      {project.liveLink && (
                        <a href={project.liveLink} className="project-link primary" target="_blank" rel="noreferrer">
                          LIVE DEMO <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;

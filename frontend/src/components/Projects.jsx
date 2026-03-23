import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE } from '../api';
import './Projects.css';

const Projects = () => {
  const [projectsData, setProjectsData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const isAnimating = useRef(false);

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

  const navigate = (dir) => {
    if (isAnimating.current) return;
    const next = activeIndex + dir;
    if (next < 0 || next >= projectsData.length) return;
    isAnimating.current = true;
    setActiveIndex(next);
    setTimeout(() => { isAnimating.current = false; }, 550);
  };

  // Attach wheel listener only to the card viewport, not the whole section
  const viewportRef = useRef(null);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 30) return;
      const goingDown = e.deltaY > 0;
      if (goingDown && activeIndex === projectsData.length - 1) return;
      if (!goingDown && activeIndex === 0) return;
      e.preventDefault();
      navigate(goingDown ? 1 : -1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeIndex, projectsData.length]);

  // Touch swipe → navigate on mobile
  useEffect(() => {
    let touchStartX = 0;
    const onTouchStart = (e) => { touchStartX = e.touches[0].clientX; };
    const onTouchEnd = (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 40) return; // ignore tiny taps
      navigate(diff > 0 ? 1 : -1);
    };
    const section = document.getElementById('projects');
    if (!section) return;
    section.addEventListener('touchstart', onTouchStart, { passive: true });
    section.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      section.removeEventListener('touchstart', onTouchStart);
      section.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeIndex, projectsData.length]);


  const total = projectsData.length;

  if (total === 0) return null;

  return (
    <section id="projects" className="projects-section">
      {/* Section label */}
      <div className="proj-section-label">
        <span className="proj-label-dot" />
        <span className="mono-text">SELECTED WORK</span>
      </div>

      {/* Header row: title + counter */}
      <div className="proj-header-row">
        <h2 className="proj-heading">Projects</h2>
        <div className="proj-counter">
          <Eye size={14} />
          <span className="proj-counter-num">
            {String(activeIndex + 1).padStart(2, '0')}
            <span className="proj-counter-total"> / {String(total).padStart(2, '0')}</span>
          </span>
        </div>
      </div>

      {/* Peek carousel stage */}
      <div className="proj-stage">
        {/* Arrow left */}
        <button
          className={`proj-arrow proj-arrow-left ${activeIndex === 0 ? 'hidden' : ''}`}
          onClick={() => navigate(-1)}
          aria-label="Previous"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Sliding track — wheel listener scoped to this element only */}
        <div className="proj-track-viewport" ref={viewportRef}>
          <div
            className="proj-track"
            style={{ transform: `translateX(calc(${activeIndex} * -85%))` }}
          >
            {projectsData.map((project, index) => (
              <div
                key={project._id || index}
                className={`proj-card ${index === activeIndex ? 'active' : ''}`}
                onClick={() => {
                  if (index !== activeIndex) {
                    navigate(index > activeIndex ? 1 : -1);
                  }
                }}
              >
                {/* Left text panel */}
                <div className="proj-card-left">
                  <p className="proj-cat mono-text">{project.category || 'PROJECT'}</p>
                  <h3 className="proj-card-title">{project.title}</h3>
                  <p className="proj-card-desc">{project.description}</p>

                  {/* Stats */}
                  {project.stats && project.stats.length > 0 && (
                    <div className="proj-stats">
                      {project.stats.map((s, i) => (
                        <div key={i} className="proj-stat">
                          <span className="proj-stat-val">{s.value}</span>
                          <span className="proj-stat-lbl mono-text">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {project.tech && project.tech.length > 0 && (
                    <div className="proj-tags">
                      {project.tech.map((t, i) => (
                        <span key={i} className="proj-tag">{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Links */}
                  <div className="proj-links">
                    {project.liveLink && (
                      <a href={project.liveLink} className="proj-btn-red" target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}>
                        VIEW PROJECT <ExternalLink size={13} />
                      </a>
                    )}
                    {project.githubLink && (
                      <a href={project.githubLink} className="proj-btn-ghost" target="_blank" rel="noreferrer"
                        onClick={e => e.stopPropagation()}>
                        SOURCE <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Right image panel */}
                <div className="proj-card-image">
                  <img
                    src={project.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1400&auto=format&fit=crop'}
                    alt={project.title}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arrow right */}
        <button
          className={`proj-arrow proj-arrow-right ${activeIndex === total - 1 ? 'hidden' : ''}`}
          onClick={() => navigate(1)}
          aria-label="Next"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dot navigation */}
      <div className="proj-dots">
        {projectsData.map((_, i) => (
          <button
            key={i}
            className={`proj-dot-btn ${i === activeIndex ? 'active' : ''}`}
            onClick={() => {
              if (i === activeIndex || isAnimating.current) return;
              isAnimating.current = true;
              setActiveIndex(i);
              setTimeout(() => { isAnimating.current = false; }, 550);
            }}
            aria-label={`Project ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Projects;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Code2, FolderKanban, GraduationCap, Award, FileBadge,
  LogOut, Eye, Plus, Pencil, Trash2, MessageSquareShare, User, Home,
  Link as LinkIcon, Briefcase, Activity, Database, Zap, TrendingUp
} from 'lucide-react';
import { API_BASE } from '../../api';
import './AdminDashboard.css';

// Helper to convert Google Drive share links into direct image links
const getImageUrl = (url) => {
  if (!url) return null;
  const driveRegex1 = /drive\.google\.com\/file\/d\/([^\/\&\?]+)/;
  const driveRegex2 = /drive\.google\.com\/.*[?\&]id=([^\/\&\?]+)/;
  const match1 = url.match(driveRegex1);
  const match2 = url.match(driveRegex2);
  const fileId = (match1 && match1[1]) || (match2 && match2[1]);
  if (fileId) return `https://drive.google.com/uc?id=${fileId}`;
  return url;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin');
  }, [navigate]);

  // Load dashboard stats once on mount
  useEffect(() => {
    const fetchStats = async () => {
      const endpoints = [
        'projects', 'achievements', 'certifications', 'skills',
        'trainings', 'experiences', 'socialposts'
      ];
      try {
        const results = await Promise.all(
          endpoints.map(ep =>
            fetch(`${API_BASE}/api/public/${ep}`).then(r => r.json()).catch(() => [])
          )
        );
        setDashboardStats({
          projects: results[0].length,
          achievements: results[1].length,
          certifications: results[2].length,
          skills: results[3].length,
          trainings: results[4].length,
          experiences: results[5].length,
          socialposts: results[6].length,
          totalLikes: results[6].reduce((sum, p) => sum + (p.likes || 0), 0),
        });
      } catch (e) {
        console.error('Failed to load dashboard stats', e);
      }
    };
    fetchStats();
  }, []);

  const fetchItems = async () => {
    try {
      const fetchTab = (activeTab === 'contact') ? 'hero' : activeTab;
      const res = await fetch(`${API_BASE}/api/public/${fetchTab}s`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        if (activeTab === 'hero' || activeTab === 'about' || activeTab === 'contact') {
          if (data.length > 0) {
            setFormData(data[0]);
            setEditingId(data[0]._id);
          } else {
            setFormData({});
            setEditingId(null);
          }
          setShowForm(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch items', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') return;
    fetchItems();
    if (activeTab !== 'hero' && activeTab !== 'about' && activeTab !== 'contact') {
      setFormData({});
      setEditingId(null);
      setShowForm(false);
    }
    setMessage('');
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const submitData = { ...formData };
    delete submitData._id;
    delete submitData.__v;
    delete submitData.createdAt;
    delete submitData.updatedAt;

    if (activeTab === 'project' && submitData.tech && typeof submitData.tech === 'string') {
      submitData.tech = submitData.tech.split(',').map(s => s.trim());
    }
    if (activeTab === 'project') {
      const stats = [];
      if (submitData.stat1Value || submitData.stat1Label) stats.push({ value: submitData.stat1Value || '', label: submitData.stat1Label || '' });
      if (submitData.stat2Value || submitData.stat2Label) stats.push({ value: submitData.stat2Value || '', label: submitData.stat2Label || '' });
      submitData.stats = stats;
      delete submitData.stat1Value; delete submitData.stat1Label;
      delete submitData.stat2Value; delete submitData.stat2Label;
    }

    try {
      const backendTab = (activeTab === 'contact') ? 'hero' : activeTab;
      const url = editingId
        ? `${API_BASE}/api/admin/${backendTab}/${editingId}`
        : `${API_BASE}/api/admin/${backendTab}`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('adminToken') },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        setMessage(`Successfully ${editingId ? 'updated' : 'added'} ${activeTab}!`);
        setFormData({});
        setEditingId(null);
        setShowForm(false);
        fetchItems();
      } else if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessage(`Error: ${errData.msg || 'Failed to save'}`);
      }
    } catch (err) {
      setMessage('Server error. Is the backend running?');
    }
  };

  const handleEdit = (item) => {
    let populatedData = { ...item };
    if (activeTab === 'project' && Array.isArray(item.tech)) populatedData.tech = item.tech.join(', ');
    if (activeTab === 'project' && Array.isArray(item.stats)) {
      populatedData.stat1Value = item.stats[0]?.value || '';
      populatedData.stat1Label = item.stats[0]?.label || '';
      populatedData.stat2Value = item.stats[1]?.value || '';
      populatedData.stat2Label = item.stats[1]?.label || '';
    }
    setFormData(populatedData);
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${activeTab}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': localStorage.getItem('adminToken') }
      });
      if (res.ok) { setMessage('Deleted successfully.'); fetchItems(); }
      else if (res.status === 401) { localStorage.removeItem('adminToken'); navigate('/admin'); }
      else setMessage('Failed to delete.');
    } catch (err) {
      setMessage('Server error during deletion.');
    }
  };

  const renderFormFields = () => {
    switch (activeTab) {
      case 'hero':
        return (
          <>
            <h4 style={{ marginBottom: '1rem', color: '#fff', borderBottom: '1px solid #1a1a1a', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>Hero Section</h4>
            <div className="form-group">
              <label>Hero Name</label>
              <textarea name="heroName" placeholder="e.g. Satvic\nReddy" value={formData.heroName || ''} onChange={handleInputChange} rows="2" />
            </div>
            <div className="form-row">
              <div className="form-group"><label>Title 1</label><input type="text" name="heroTitle1" placeholder="e.g. ANDROID" value={formData.heroTitle1 || ''} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Subtitle 1</label><input type="text" name="heroSubtitle1" placeholder="e.g. DEVELOPER" value={formData.heroSubtitle1 || ''} onChange={handleInputChange} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Title 2</label><input type="text" name="heroTitle2" placeholder="e.g. ML/AI" value={formData.heroTitle2 || ''} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Subtitle 2</label><input type="text" name="heroSubtitle2" placeholder="e.g. ENGINEER" value={formData.heroSubtitle2 || ''} onChange={handleInputChange} /></div>
            </div>
            <div className="form-group">
              <label>Hero Description</label>
              <textarea name="heroDescription" placeholder="Crafting immersive digital experiences..." value={formData.heroDescription || ''} onChange={handleInputChange} rows="2" />
            </div>
          </>
        );
      case 'about':
        return (
          <>
            <h4 style={{ marginBottom: '1rem', color: '#fff', borderBottom: '1px solid #1a1a1a', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>About Me Section</h4>
            <div className="form-group"><label>Portrait Image URL</label><input type="text" name="aboutImage" placeholder="Leave empty for default" value={formData.aboutImage || ''} onChange={handleInputChange} /></div>
            <div className="form-group"><label>About Heading</label><input type="text" name="aboutHeading" placeholder="e.g. Passionate about Data & Code" value={formData.aboutHeading || ''} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Summary Paragraph 1</label><textarea name="aboutDescription1" placeholder="I am a Computer Science Engineering student..." value={formData.aboutDescription1 || ''} onChange={handleInputChange} rows="3" /></div>
            <div className="form-group"><label>Summary Paragraph 2</label><textarea name="aboutDescription2" placeholder="I focus on problem-solving..." value={formData.aboutDescription2 || ''} onChange={handleInputChange} rows="3" /></div>
            <div className="form-row">
              <div className="form-group"><label>Location</label><input type="text" name="aboutLocation" placeholder="e.g. India" value={formData.aboutLocation || ''} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Degree</label><input type="text" name="aboutDegree" placeholder="e.g. B.Tech CSE" value={formData.aboutDegree || ''} onChange={handleInputChange} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Focus</label><input type="text" name="aboutFocus" placeholder="e.g. Full-Stack & AI" value={formData.aboutFocus || ''} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Passion</label><input type="text" name="aboutPassion" placeholder="e.g. Problem Solving" value={formData.aboutPassion || ''} onChange={handleInputChange} /></div>
            </div>
          </>
        );
      case 'contact':
        return (
          <>
            <h4 style={{ marginBottom: '1rem', color: '#fff', borderBottom: '1px solid #1a1a1a', paddingBottom: '0.5rem', fontSize: '0.85rem' }}>Contact & Links</h4>
            <div className="form-row">
              <div className="form-group"><label>Email</label><input type="email" name="contactEmail" placeholder="email@example.com" value={formData.contactEmail || ''} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Phone</label><input type="text" name="contactPhone" placeholder="+91-9999999999" value={formData.contactPhone || ''} onChange={handleInputChange} /></div>
            </div>
            <div className="form-group"><label>Location Text</label><input type="text" name="contactLocation" placeholder="e.g. India" value={formData.contactLocation || ''} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Resume Link</label><input type="text" name="resumeLink" placeholder="https://..." value={formData.resumeLink || ''} onChange={handleInputChange} /></div>
            <div className="form-group"><label>LinkedIn URL</label><input type="text" name="linkedinLink" placeholder="https://linkedin.com/in/..." value={formData.linkedinLink || ''} onChange={handleInputChange} /></div>
            <div className="form-group"><label>GitHub URL</label><input type="text" name="githubLink" placeholder="https://github.com/..." value={formData.githubLink || ''} onChange={handleInputChange} /></div>
            <div className="form-group"><label>LeetCode URL</label><input type="text" name="leetcodeLink" placeholder="https://leetcode.com/u/..." value={formData.leetcodeLink || ''} onChange={handleInputChange} /></div>
          </>
        );
      case 'project':
        return (
          <>
            <div className="form-group"><label>Project Title *</label><input type="text" name="title" placeholder="e.g. Hostel Mess App" value={formData.title || ''} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Description *</label><textarea name="description" placeholder="Brief description of the project" value={formData.description || ''} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Technologies (comma separated)</label><input type="text" name="tech" placeholder="e.g. React, Node.js, MongoDB" value={formData.tech || ''} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Image URL</label><input type="text" name="image" placeholder="https://..." value={formData.image || ''} onChange={handleInputChange} /></div>
            <div className="form-row">
              <div className="form-group"><label>Live Link</label><input type="text" name="liveLink" placeholder="https://..." value={formData.liveLink || ''} onChange={handleInputChange} /></div>
              <div className="form-group"><label>GitHub Link</label><input type="text" name="githubLink" placeholder="https://github.com/..." value={formData.githubLink || ''} onChange={handleInputChange} /></div>
            </div>
            <h4 style={{ marginTop: '1rem', marginBottom: '0.75rem', color: '#555', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project Stats (Optional)</h4>
            <div className="form-row">
              <div className="form-group"><label>Stat 1 — Value</label><input type="text" name="stat1Value" placeholder="e.g. +150%" value={formData.stat1Value || ''} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Stat 1 — Label</label><input type="text" name="stat1Label" placeholder="e.g. TRAFFIC INCREASE" value={formData.stat1Label || ''} onChange={handleInputChange} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Stat 2 — Value</label><input type="text" name="stat2Value" placeholder="e.g. 300+/mo" value={formData.stat2Value || ''} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Stat 2 — Label</label><input type="text" name="stat2Label" placeholder="e.g. ONLINE ORDERS" value={formData.stat2Label || ''} onChange={handleInputChange} /></div>
            </div>
          </>
        );
      case 'achievement':
        return (
          <>
            <div className="form-row">
              <div className="form-group"><label>Achievement Title *</label><input type="text" name="title" placeholder="e.g. Adobe India Hackathon" value={formData.title || ''} onChange={handleInputChange} required /></div>
              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category || ''} onChange={handleInputChange} required>
                  <option value="">Select Category</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Challenge">Challenge</option>
                  <option value="DSA">DSA</option>
                  <option value="Competition">Competition</option>
                  <option value="Award">Award</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Description</label><textarea name="description" placeholder="Describe the achievement" value={formData.description || ''} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Date</label><input type="text" name="date" placeholder="e.g. Mar 2024" value={formData.date || ''} onChange={handleInputChange} /></div>
          </>
        );
      case 'certification':
        return (
          <>
            <div className="form-group"><label>Certification Title *</label><input type="text" name="title" placeholder="e.g. Data Structures and Algorithms" value={formData.title || ''} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Issuer *</label><input type="text" name="issuer" placeholder="e.g. Coursera" value={formData.issuer || ''} onChange={handleInputChange} required /></div>
            <div className="form-row">
              <div className="form-group"><label>Date</label><input type="text" name="date" placeholder="e.g. Sep '24" value={formData.date || ''} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Credential Link</label><input type="text" name="link" placeholder="https://..." value={formData.link || ''} onChange={handleInputChange} /></div>
            </div>
            <div className="form-group">
              <label>Certificate Image URL</label>
              <input type="text" name="image" placeholder="Paste an image URL or Google Drive link here" value={formData.image || ''} onChange={handleInputChange} style={{ marginBottom: '0.8rem' }} />
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#333', marginBottom: '0.8rem' }}>— OR UPLOAD LOCAL FILE —</div>
              <div className="file-upload-wrapper">
                <input type="file" accept="image/*" id="cert-image-upload"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('image', file);
                    try {
                      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: { 'x-auth-token': localStorage.getItem('adminToken') }, body: fd });
                      if (res.ok) { const data = await res.json(); setFormData(prev => ({ ...prev, image: `${API_BASE}${data.imageUrl}` })); setMessage('Image uploaded!'); }
                      else setMessage('Error: Failed to upload image');
                    } catch { setMessage('Error: Could not upload image'); }
                  }} />
                <label htmlFor="cert-image-upload" className="file-upload-btn">Choose Image from Device</label>
              </div>
              {formData.image && (<img src={getImageUrl(formData.image)} alt="Certificate preview" style={{ marginTop: '0.75rem', maxHeight: '150px', borderRadius: '8px', border: '1px solid #1a1a1a' }} />)}
            </div>
          </>
        );
      case 'skill':
        return (
          <>
            <div className="form-row">
              <div className="form-group"><label>Skill Name *</label><input type="text" name="name" placeholder="e.g. React" value={formData.name || ''} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Category</label><input type="text" name="category" placeholder="e.g. Frontend" value={formData.category || ''} onChange={handleInputChange} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Proficiency (1-100)</label><input type="number" name="level" placeholder="e.g. 85" value={formData.level || ''} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Icon URL or Class</label><input type="text" name="icon" placeholder="e.g. react-icon" value={formData.icon || ''} onChange={handleInputChange} /></div>
            </div>
          </>
        );
      case 'training':
        return (
          <>
            <div className="form-group"><label>Training Title *</label><input type="text" name="title" placeholder="e.g. Java and MySQL" value={formData.title || ''} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Organization *</label><input type="text" name="organization" placeholder="e.g. LPU" value={formData.organization || ''} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Description</label><textarea name="description" placeholder="Describe the training experience" value={formData.description || ''} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Date / Duration</label><input type="text" name="date" placeholder="e.g. Jul '25" value={formData.date || ''} onChange={handleInputChange} /></div>
          </>
        );
      case 'experience':
        return (
          <>
            <div className="form-group"><label>Experience Title *</label><input type="text" name="title" placeholder="e.g. Frontend Developer" value={formData.title || ''} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Company *</label><input type="text" name="company" placeholder="e.g. Google" value={formData.company || ''} onChange={handleInputChange} required /></div>
            <div className="form-group"><label>Description</label><textarea name="description" placeholder="Describe the work experience" value={formData.description || ''} onChange={handleInputChange} /></div>
            <div className="form-group"><label>Date / Duration</label><input type="text" name="date" placeholder="e.g. Jan '24 - Present" value={formData.date || ''} onChange={handleInputChange} /></div>
          </>
        );
      case 'socialpost':
        return (
          <>
            <div className="form-row">
              <div className="form-group"><label>Author Name *</label><input type="text" name="authorName" placeholder="e.g. John Doe" value={formData.authorName || ''} onChange={handleInputChange} required /></div>
              <div className="form-group"><label>Author Headline *</label><input type="text" name="authorHeadline" placeholder="e.g. Software Engineer" value={formData.authorHeadline || ''} onChange={handleInputChange} required /></div>
            </div>
            <div className="form-group"><label>Post Content *</label><textarea name="content" placeholder="What do you want to share?" value={formData.content || ''} onChange={handleInputChange} rows="4" required /></div>
            <div className="form-group">
              <label>Post Image (Optional)</label>
              <input type="text" name="image" placeholder="Paste an image URL or Google Drive link here" value={formData.image || ''} onChange={handleInputChange} style={{ marginBottom: '0.8rem' }} />
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#333', marginBottom: '0.8rem' }}>— OR UPLOAD LOCAL FILE —</div>
              <div className="file-upload-wrapper">
                <input type="file" accept="image/*" id="social-image-upload"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('image', file);
                    try {
                      const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', headers: { 'x-auth-token': localStorage.getItem('adminToken') }, body: fd });
                      if (res.ok) { const data = await res.json(); setFormData(prev => ({ ...prev, image: `${API_BASE}${data.imageUrl}` })); setMessage('Image uploaded!'); }
                      else setMessage('Error: Failed to upload image');
                    } catch { setMessage('Error: Could not upload image'); }
                  }} />
                <label htmlFor="social-image-upload" className="file-upload-btn">Choose Image from Device</label>
              </div>
              {formData.image && (<img src={getImageUrl(formData.image)} alt="Post preview" style={{ marginTop: '0.75rem', maxHeight: '150px', borderRadius: '8px', border: '1px solid #1a1a1a' }} />)}
            </div>
            {editingId && formData.comments && formData.comments.length > 0 && (
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Post Comments</label>
                <div style={{ background: '#111', padding: '1rem', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #1a1a1a' }}>
                  {formData.comments.map((c, i) => (
                    <div key={i} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1a1a1a' }}>
                      <p style={{ fontSize: '0.85rem', color: '#ccc', margin: 0 }}>{c.text}</p>
                      <span style={{ fontSize: '0.7rem', color: '#333' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const tabConfig = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'overview' },
    { key: 'hero', label: 'Hero Section', icon: Home, section: 'content' },
    { key: 'about', label: 'About Me', icon: User, section: 'content' },
    { key: 'contact', label: 'Contact / Links', icon: LinkIcon, section: 'content' },
    { key: 'skill', label: 'Skills', icon: Code2, section: 'content' },
    { key: 'project', label: 'Projects', icon: FolderKanban, section: 'content' },
    { key: 'experience', label: 'Experience', icon: Briefcase, section: 'content' },
    { key: 'training', label: 'Training', icon: GraduationCap, section: 'content' },
    { key: 'certification', label: 'Certificates', icon: FileBadge, section: 'content' },
    { key: 'achievement', label: 'Achievements', icon: Award, section: 'content' },
    { key: 'socialpost', label: 'Social Posts', icon: MessageSquareShare, section: 'content' },
  ];

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'project': return ['TITLE', 'TECHNOLOGIES', 'ACTIONS'];
      case 'skill': return ['NAME', 'CATEGORY', 'LEVEL', 'ACTIONS'];
      case 'training': return ['TITLE', 'ORGANIZATION', 'DATE', 'ACTIONS'];
      case 'experience': return ['TITLE', 'COMPANY', 'DATE', 'ACTIONS'];
      case 'certification': return ['TITLE', 'ISSUER', 'DATE', 'ACTIONS'];
      case 'achievement': return ['TITLE', 'CATEGORY', 'DATE', 'ACTIONS'];
      case 'socialpost': return ['AUTHOR', 'PREVIEW', 'ENGAGEMENT', 'ACTIONS'];
      default: return [];
    }
  };

  const renderTableRow = (item) => {
    switch (activeTab) {
      case 'project':
        return (<>
          <td className="td-title">{item.title}</td>
          <td><div className="tech-tags">{item.tech && item.tech.slice(0, 3).map((t, i) => (<span key={i} className="tech-tag">{t}</span>))}{item.tech && item.tech.length > 3 && <span className="tech-more">+{item.tech.length - 3}</span>}</div></td>
        </>);
      case 'skill':
        return (<><td className="td-title">{item.name}</td><td>{item.category || '—'}</td><td>{item.level || '—'}</td></>);
      case 'training':
        return (<><td className="td-title">{item.title}</td><td>{item.organization || '—'}</td><td>{item.date || '—'}</td></>);
      case 'experience':
        return (<><td className="td-title">{item.title}</td><td>{item.company || '—'}</td><td>{item.date || '—'}</td></>);
      case 'certification':
        return (<><td className="td-title">{item.title}</td><td>{item.issuer || '—'}</td><td>{item.date || '—'}</td></>);
      case 'achievement':
        return (<><td className="td-title">{item.title}</td><td>{item.category || '—'}</td><td>{item.date || '—'}</td></>);
      case 'socialpost':
        return (<><td className="td-title">{item.authorName}</td><td>{item.content ? item.content.substring(0, 40) + '...' : '—'}</td><td>👍 {item.likes || 0} | 💬 {item.comments ? item.comments.length : 0}</td></>);
      default:
        return null;
    }
  };

  const renderDashboard = () => {
    const s = dashboardStats;
    const statCards = [
      { label: 'Projects', value: s?.projects ?? '—', icon: FolderKanban, color: '#fff' },
      { label: 'Skills', value: s?.skills ?? '—', icon: Code2, color: '#fff' },
      { label: 'Certifications', value: s?.certifications ?? '—', icon: FileBadge, color: '#fff' },
      { label: 'Achievements', value: s?.achievements ?? '—', icon: Award, color: '#fff' },
      { label: 'Social Posts', value: s?.socialposts ?? '—', icon: MessageSquareShare, color: '#fff' },
      { label: 'Total Likes', value: s?.totalLikes ?? '—', icon: TrendingUp, color: '#fff' },
      { label: 'Trainings', value: s?.trainings ?? '—', icon: GraduationCap, color: '#fff' },
      { label: 'Experiences', value: s?.experiences ?? '—', icon: Briefcase, color: '#fff' },
    ];

    return (
      <div>
        {/* Stat Grid */}
        <div className="dashboard-grid">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div className="stat-card" key={card.label}>
                <div className="stat-card-icon" style={{ background: '#111' }}>
                  <Icon size={16} color="#555" />
                </div>
                <div className="stat-card-value">{card.value}</div>
                <div className="stat-card-label">{card.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions + System Status */}
        <div className="dashboard-row">
          <div className="dashboard-card">
            <p className="dashboard-card-title">Quick Actions</p>
            <div className="quick-action-grid">
              {[
                { label: 'Add Project', tab: 'project', icon: FolderKanban },
                { label: 'Add Skill', tab: 'skill', icon: Code2 },
                { label: 'Add Achievement', tab: 'achievement', icon: Award },
                { label: 'Add Certificate', tab: 'certification', icon: FileBadge },
                { label: 'Edit Hero', tab: 'hero', icon: Home },
                { label: 'Add Social Post', tab: 'socialpost', icon: MessageSquareShare },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <button key={a.tab} className="quick-action-btn"
                    onClick={() => { setActiveTab(a.tab); setFormData({}); setEditingId(null); setShowForm(true); setMessage(''); }}>
                    <Icon size={14} />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="dashboard-card">
            <p className="dashboard-card-title">System Status</p>
            <div className="system-status-list">
              {[
                { label: 'Backend Server', status: 'Online', ok: true },
                { label: 'MongoDB Atlas', status: 'Connected', ok: true },
                { label: 'Auth (JWT)', status: 'Active', ok: true },
                { label: 'File Uploads', status: 'Ready', ok: true },
                { label: 'Email Service', status: 'Configured', ok: true },
                { label: 'Experiences', status: s?.experiences === 0 ? 'Empty' : 'OK', ok: s?.experiences > 0 },
              ].map((row) => (
                <div className="status-row" key={row.label}>
                  <span className="status-label">{row.label}</span>
                  <span className={`status-badge ${row.ok ? 'ok' : 'warn'}`}>{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Overview */}
        <div className="dashboard-card">
          <p className="dashboard-card-title">Content Overview</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {[
              ['Projects', s?.projects],
              ['Skills', s?.skills],
              ['Certifications', s?.certifications],
              ['Achievements', s?.achievements],
              ['Trainings', s?.trainings],
              ['Experiences', s?.experiences],
              ['Social Posts', s?.socialposts],
              ['Total Likes', s?.totalLikes],
            ].map(([label, val]) => (
              <div key={label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>{val ?? '—'}</div>
                <div style={{ fontSize: '0.7rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const isConfigTab = activeTab === 'hero' || activeTab === 'about' || activeTab === 'contact';

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">A</div>
          <div>
            <h2 className="sidebar-title">Admin Panel</h2>
            <p className="sidebar-subtitle">Portfolio Manager</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Overview</div>
          <button key="dashboard" className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setFormData({}); setMessage(''); }}>
            <LayoutDashboard size={16} /><span>Dashboard</span>
          </button>

          <div className="nav-section-label" style={{ marginTop: '0.5rem' }}>Content</div>
          {tabConfig.filter(t => t.section === 'content').map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} className={`sidebar-link ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab.key); setFormData({}); setMessage(''); }}>
                <Icon size={16} /><span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="sidebar-link footer-link" target="_blank" rel="noopener noreferrer">
            <Eye size={16} /><span>View Portfolio</span>
          </a>
          <button onClick={handleLogout} className="sidebar-link footer-link logout">
            <LogOut size={16} /><span>Logout</span>
          </button>
          <p className="sidebar-user">Logged in as <span className="user-highlight">admin</span></p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {activeTab === 'dashboard' ? 'Dashboard' :
               activeTab === 'hero' ? 'Hero Configuration' :
               activeTab === 'about' ? 'About Me' :
               activeTab === 'contact' ? 'Contact & Links' :
               activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + 's'}
            </h1>
            {activeTab === 'dashboard' && <p className="page-subtitle">Portfolio overview & quick actions</p>}
            {(!isConfigTab && activeTab !== 'dashboard') && (
              <p className="page-count">{items.length} {items.length === 1 ? 'entry' : 'entries'}</p>
            )}
          </div>
          {(!isConfigTab && activeTab !== 'dashboard') && (
            <button className="add-btn" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({}); }}>
              <Plus size={16} /> {showForm ? 'Close Form' : `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            </button>
          )}
        </div>

        {message && (
          <div className={`toast-message ${message.includes('Error') || message.includes('Failed') || message.includes('error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Dashboard View */}
        {activeTab === 'dashboard' && renderDashboard()}

        {/* Add/Edit Form */}
        {activeTab !== 'dashboard' && showForm && (
          <div className="form-card">
            <h3 className="form-card-title">{editingId ? 'Edit' : 'Add New'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              {renderFormFields()}
              <div className="form-actions">
                <button type="submit" className="save-btn">{editingId ? 'Update' : 'Save'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</button>
                <button type="button" className="cancel-btn" onClick={() => { setShowForm(false); setEditingId(null); setFormData({}); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Data Table */}
        {!isConfigTab && activeTab !== 'dashboard' && (
          <div className="data-table-card">
            {items.length === 0 ? (
              <div className="empty-state">
                <p>No {activeTab}s found. Click <strong>"Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}"</strong> to create one.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>{getTableHeaders().map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id}>
                      {renderTableRow(item)}
                      <td className="td-actions">
                        <button onClick={() => handleEdit(item)} className="action-btn edit" title="Edit"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(item._id)} className="action-btn delete" title="Delete"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

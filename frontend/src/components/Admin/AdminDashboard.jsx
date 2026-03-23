import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Code2, FolderKanban, GraduationCap, Award, FileBadge, LogOut, Eye, Plus, Pencil, Trash2, MessageSquareShare, User, Home, Link as LinkIcon } from 'lucide-react';
import { API_BASE } from '../../api';
import './AdminDashboard.css';

// Helper to convert Google Drive share links into direct image links
const getImageUrl = (url) => {
  if (!url) return null;
  
  // Handle /file/d/ID/ format
  const driveRegex1 = /drive\.google\.com\/file\/d\/([^\/&\?]+)/;
  // Handle ?id=ID format
  const driveRegex2 = /drive\.google\.com\/.*[?&]id=([^\/&\?]+)/;
  
  const match1 = url.match(driveRegex1);
  const match2 = url.match(driveRegex2);
  const fileId = (match1 && match1[1]) || (match2 && match2[1]);
  
  if (fileId) {
    return `https://drive.google.com/uc?id=${fileId}`;
  }
  return url;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('project');
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    }
  }, [navigate]);

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
    // Remove internal Mongoose fields that shouldn't be sent in updates
    delete submitData._id;
    delete submitData.__v;
    delete submitData.createdAt;
    delete submitData.updatedAt;
    
    if (activeTab === 'project' && submitData.tech && typeof submitData.tech === 'string') {
      submitData.tech = submitData.tech.split(',').map(s => s.trim());
    }
    // Parse stats from flat stat1Value/stat1Label fields into [{value, label}] array
    if (activeTab === 'project') {
      const stats = [];
      if (submitData.stat1Value || submitData.stat1Label) {
        stats.push({ value: submitData.stat1Value || '', label: submitData.stat1Label || '' });
      }
      if (submitData.stat2Value || submitData.stat2Label) {
        stats.push({ value: submitData.stat2Value || '', label: submitData.stat2Label || '' });
      }
      submitData.stats = stats;
      delete submitData.stat1Value;
      delete submitData.stat1Label;
      delete submitData.stat2Value;
      delete submitData.stat2Label;
    }

    try {
      // route 'contact' all save to the 'hero' (Profile) model backend 
      // 'about' has its own model 'about'.
      const backendTab = (activeTab === 'contact') ? 'hero' : activeTab;
      
      const url = editingId 
        ? `${API_BASE}/api/admin/${backendTab}/${editingId}`
        : `${API_BASE}/api/admin/${backendTab}`;
        
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('adminToken')
        },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        setMessage(`Successfully ${editingId ? 'updated' : 'added new'} ${activeTab}!`);
        setFormData({});
        setEditingId(null);
        setShowForm(false);
        fetchItems();
      } else if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
        return;
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
    if (activeTab === 'project' && Array.isArray(item.tech)) {
      populatedData.tech = item.tech.join(', ');
    }
    // Expand stats array into flat fields for editing
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
    if (!window.confirm(`Are you sure you want to delete this ${activeTab}?`)) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': localStorage.getItem('adminToken')
        }
      });
      if (res.ok) {
        setMessage('Item deleted successfully.');
        fetchItems();
      } else if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin');
        return;
      } else {
        setMessage('Failed to delete item.');
      }
    } catch (err) {
      setMessage('Server error during deletion.');
    }
  };

  const renderFormFields = () => {
    switch(activeTab) {
      case 'hero':
        return (
          <>
            <h4 style={{marginBottom: '1rem', color: '#00e5ff', borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: '0.5rem'}}>Hero Section Configuration</h4>
            <div className="form-group">
              <label>Hero Name</label>
              <textarea name="heroName" placeholder="e.g. Satvic\nReddy" value={formData.heroName || ''} onChange={handleInputChange} rows="2" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Title 1</label>
                <input type="text" name="heroTitle1" placeholder="e.g. ANDROID" value={formData.heroTitle1 || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Subtitle 1</label>
                <input type="text" name="heroSubtitle1" placeholder="e.g. DEVELOPER" value={formData.heroSubtitle1 || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Title 2</label>
                <input type="text" name="heroTitle2" placeholder="e.g. ML/AI" value={formData.heroTitle2 || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Subtitle 2</label>
                <input type="text" name="heroSubtitle2" placeholder="e.g. ENGINEER" value={formData.heroSubtitle2 || ''} onChange={handleInputChange} />
              </div>
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
            <h4 style={{marginBottom: '1rem', color: '#00e5ff', borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: '0.5rem'}}>About Me Section Configuration</h4>
            <div className="form-group">
              <label>Portrait Image URL</label>
              <input type="text" name="aboutImage" placeholder="Leave empty for default" value={formData.aboutImage || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>About Heading</label>
              <input type="text" name="aboutHeading" placeholder="e.g. Passionate about Data & Code" value={formData.aboutHeading || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Summary Paragraph 1</label>
              <textarea name="aboutDescription1" placeholder="I am a Computer Science Engineering student..." value={formData.aboutDescription1 || ''} onChange={handleInputChange} rows="3" />
            </div>
            <div className="form-group">
              <label>Summary Paragraph 2</label>
              <textarea name="aboutDescription2" placeholder="I focus on problem-solving..." value={formData.aboutDescription2 || ''} onChange={handleInputChange} rows="3" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Info Grid: Location</label>
                <input type="text" name="aboutLocation" placeholder="e.g. India" value={formData.aboutLocation || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Info Grid: Degree</label>
                <input type="text" name="aboutDegree" placeholder="e.g. B.Tech CSE" value={formData.aboutDegree || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Info Grid: Focus</label>
                <input type="text" name="aboutFocus" placeholder="e.g. Full-Stack & AI" value={formData.aboutFocus || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Info Grid: Passion</label>
                <input type="text" name="aboutPassion" placeholder="e.g. Problem Solving" value={formData.aboutPassion || ''} onChange={handleInputChange} />
              </div>
            </div>
          </>
        );
      case 'contact':
        return (
          <>
            <h4 style={{marginBottom: '1rem', color: '#00e5ff', borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: '0.5rem'}}>Contact & Links Configuration</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Email</label>
                <input type="email" name="contactEmail" placeholder="e.g. email@example.com" value={formData.contactEmail || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input type="text" name="contactPhone" placeholder="e.g. +91-9999999999" value={formData.contactPhone || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Location Text (Footer)</label>
              <input type="text" name="contactLocation" placeholder="e.g. India" value={formData.contactLocation || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Resume Link (Google Drive / PDF URL)</label>
              <input type="text" name="resumeLink" placeholder="https://..." value={formData.resumeLink || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>LinkedIn URL</label>
              <input type="text" name="linkedinLink" placeholder="https://linkedin.com/in/..." value={formData.linkedinLink || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>GitHub URL</label>
              <input type="text" name="githubLink" placeholder="https://github.com/..." value={formData.githubLink || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>LeetCode URL</label>
              <input type="text" name="leetcodeLink" placeholder="https://leetcode.com/u/..." value={formData.leetcodeLink || ''} onChange={handleInputChange} />
            </div>
          </>
        );
      case 'project':
        return (
          <>
            <div className="form-group">
              <label>Project Title *</label>
              <input type="text" name="title" placeholder="e.g. Hostel Mess App" value={formData.title || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" placeholder="Brief description of the project" value={formData.description || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Technologies (comma separated)</label>
              <input type="text" name="tech" placeholder="e.g. React, Node.js, MongoDB" value={formData.tech || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input type="text" name="image" placeholder="https://..." value={formData.image || ''} onChange={handleInputChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Live Link</label>
                <input type="text" name="liveLink" placeholder="https://..." value={formData.liveLink || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>GitHub Link</label>
                <input type="text" name="githubLink" placeholder="https://github.com/..." value={formData.githubLink || ''} onChange={handleInputChange} />
              </div>
            </div>
            <h4 style={{marginTop:'1.2rem',marginBottom:'0.75rem',color:'#00e5ff',fontSize:'0.9rem'}}>Project Stats (Optional — shown as metrics on project card)</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Stat 1 — Value</label>
                <input type="text" name="stat1Value" placeholder="e.g. +150%" value={formData.stat1Value || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Stat 1 — Label</label>
                <input type="text" name="stat1Label" placeholder="e.g. TRAFFIC INCREASE" value={formData.stat1Label || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Stat 2 — Value</label>
                <input type="text" name="stat2Value" placeholder="e.g. 300+/mo" value={formData.stat2Value || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Stat 2 — Label</label>
                <input type="text" name="stat2Label" placeholder="e.g. ONLINE ORDERS" value={formData.stat2Label || ''} onChange={handleInputChange} />
              </div>
            </div>
          </>
        );
      case 'achievement':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Achievement Title *</label>
                <input type="text" name="title" placeholder="e.g. Adobe India Hackathon" value={formData.title || ''} onChange={handleInputChange} required />
              </div>
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
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" placeholder="Describe the achievement" value={formData.description || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="text" name="date" placeholder="e.g. Mar 2024" value={formData.date || ''} onChange={handleInputChange} />
            </div>
          </>
        );
      case 'certification':
        return (
          <>
            <div className="form-group">
              <label>Certification Title *</label>
              <input type="text" name="title" placeholder="e.g. Data Structures and Algorithms" value={formData.title || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Issuer *</label>
              <input type="text" name="issuer" placeholder="e.g. Coursera" value={formData.issuer || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input type="text" name="date" placeholder="e.g. Sep '24" value={formData.date || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Credential Link</label>
                <input type="text" name="link" placeholder="https://..." value={formData.link || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Certificate Image URL</label>
              <input 
                type="text" 
                name="image" 
                placeholder="Paste an image URL or Google Drive link here" 
                value={formData.image || ''} 
                onChange={handleInputChange} 
                style={{ marginBottom: '0.8rem' }}
              />
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#8892b0', marginBottom: '0.8rem', fontWeight: 'bold' }}>
                — OR UPLOAD LOCAL FILE —
              </div>
              <div className="file-upload-wrapper">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="cert-image-upload"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('image', file);
                    try {
                      const res = await fetch(`${API_BASE}/api/upload`, {
                        method: 'POST',
                        headers: { 'x-auth-token': localStorage.getItem('adminToken') },
                        body: fd
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setFormData(prev => ({ ...prev, image: `${API_BASE}${data.imageUrl}` }));
                        setMessage('Image uploaded successfully!');
                      } else {
                        setMessage('Error: Failed to upload image');
                      }
                    } catch (err) {
                      setMessage('Error: Could not upload image');
                    }
                  }} 
                />
                <label htmlFor="cert-image-upload" className="file-upload-btn">
                  Choose Image from Device
                </label>
              </div>
              {formData.image && (
                <img src={getImageUrl(formData.image)} alt="Certificate preview" style={{ marginTop: '0.75rem', maxHeight: '150px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }} />
              )}
            </div>
          </>
        );
      case 'skill':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Skill Name *</label>
                <input type="text" name="name" placeholder="e.g. React" value={formData.name || ''} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" name="category" placeholder="e.g. Frontend" value={formData.category || ''} onChange={handleInputChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Proficiency (1-100)</label>
                <input type="number" name="level" placeholder="e.g. 85" value={formData.level || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Icon URL or Class</label>
                <input type="text" name="icon" placeholder="e.g. react-icon" value={formData.icon || ''} onChange={handleInputChange} />
              </div>
            </div>
          </>
        );
      case 'training':
        return (
          <>
            <div className="form-group">
              <label>Training Title *</label>
              <input type="text" name="title" placeholder="e.g. Java and MySQL" value={formData.title || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Organization *</label>
              <input type="text" name="organization" placeholder="e.g. LPU" value={formData.organization || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" placeholder="Describe the training experience" value={formData.description || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Date / Duration</label>
              <input type="text" name="date" placeholder="e.g. Jul '25" value={formData.date || ''} onChange={handleInputChange} />
            </div>
          </>
        );
      case 'experience':
        return (
          <>
            <div className="form-group">
              <label>Experience Title *</label>
              <input type="text" name="title" placeholder="e.g. Frontend Developer" value={formData.title || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Company *</label>
              <input type="text" name="company" placeholder="e.g. Google" value={formData.company || ''} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" placeholder="Describe the work experience" value={formData.description || ''} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Date / Duration</label>
              <input type="text" name="date" placeholder="e.g. Jan '24 - Present" value={formData.date || ''} onChange={handleInputChange} />
            </div>
          </>
        );
      case 'socialpost':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Author Name *</label>
                <input type="text" name="authorName" placeholder="e.g. John Doe" value={formData.authorName || ''} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Author Headline *</label>
                <input type="text" name="authorHeadline" placeholder="e.g. Software Engineer" value={formData.authorHeadline || ''} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Post Content *</label>
              <textarea name="content" placeholder="What do you want to share?" value={formData.content || ''} onChange={handleInputChange} rows="4" required />
            </div>
            <div className="form-group">
              <label>Post Image (Optional)</label>
              <input 
                type="text" 
                name="image" 
                placeholder="Paste an image URL or Google Drive link here" 
                value={formData.image || ''} 
                onChange={handleInputChange} 
                style={{ marginBottom: '0.8rem' }}
              />
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#8892b0', marginBottom: '0.8rem', fontWeight: 'bold' }}>
                — OR UPLOAD LOCAL FILE —
              </div>
              <div className="file-upload-wrapper">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="social-image-upload"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('image', file);
                    try {
                      const res = await fetch(`${API_BASE}/api/upload`, {
                        method: 'POST',
                        headers: { 'x-auth-token': localStorage.getItem('adminToken') },
                        body: fd
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setFormData(prev => ({ ...prev, image: `${API_BASE}${data.imageUrl}` }));
                        setMessage('Image uploaded successfully!');
                      } else {
                        setMessage('Error: Failed to upload image');
                      }
                    } catch (err) {
                      setMessage('Error: Could not upload image');
                    }
                  }} 
                />
                <label htmlFor="social-image-upload" className="file-upload-btn">
                  Choose Image from Device
                </label>
              </div>
              {formData.image && (
                <img src={getImageUrl(formData.image)} alt="Post preview" style={{ marginTop: '0.75rem', maxHeight: '150px', borderRadius: '8px', border: '1px solid rgba(0,229,255,0.1)' }} />
              )}
            </div>
            
            {/* Display comments in edit mode */}
            {editingId && formData.comments && formData.comments.length > 0 && (
              <div className="form-group" style={{marginTop: '2rem'}}>
                <label>Post Comments</label>
                <div style={{background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto'}}>
                  {formData.comments.map((c, i) => (
                    <div key={i} style={{marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                      <p style={{fontSize: '0.9rem', color: '#fff'}}>{c.text}</p>
                      <span style={{fontSize: '0.7rem', color: '#8892b0'}}>{new Date(c.createdAt).toLocaleDateString()}</span>
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
    { key: 'hero', label: 'Hero Section', icon: Home },
    { key: 'about', label: 'About Me', icon: User },
    { key: 'contact', label: 'Contact / Links', icon: LinkIcon },
    { key: 'skill', label: 'Skills', icon: Code2 },
    { key: 'project', label: 'Projects', icon: FolderKanban },
    { key: 'experience', label: 'Experience', icon: FolderKanban }, // Reusing an icon for now, ideally Briefcase but using available lucide icon
    { key: 'training', label: 'Training', icon: GraduationCap },
    { key: 'certification', label: 'Certificates', icon: FileBadge },
    { key: 'achievement', label: 'Achievements', icon: Award },
    { key: 'socialpost', label: 'Social Posts', icon: MessageSquareShare },
  ];

  const getTableHeaders = () => {
    switch(activeTab) {
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
    switch(activeTab) {
      case 'project':
        return (
          <>
            <td className="td-title">{item.title}</td>
            <td>
              <div className="tech-tags">
                {item.tech && item.tech.slice(0,3).map((t, i) => (
                  <span key={i} className="tech-tag">{t}</span>
                ))}
                {item.tech && item.tech.length > 3 && <span className="tech-more">+{item.tech.length - 3}</span>}
              </div>
            </td>
          </>
        );
      case 'skill':
        return (
          <>
            <td className="td-title">{item.name}</td>
            <td>{item.category || '—'}</td>
            <td>{item.level || '—'}</td>
          </>
        );
      case 'training':
        return (
          <>
            <td className="td-title">{item.title}</td>
            <td>{item.organization || '—'}</td>
            <td>{item.date || '—'}</td>
          </>
        );
      case 'experience':
        return (
          <>
            <td className="td-title">{item.title}</td>
            <td>{item.company || '—'}</td>
            <td>{item.date || '—'}</td>
          </>
        );
      case 'certification':
        return (
          <>
            <td className="td-title">{item.title}</td>
            <td>{item.issuer || '—'}</td>
            <td>{item.date || '—'}</td>
          </>
        );
      case 'achievement':
        return (
          <>
            <td className="td-title">{item.title}</td>
            <td>{item.category || '—'}</td>
            <td>{item.date || '—'}</td>
          </>
        );
      case 'socialpost':
        return (
          <>
            <td className="td-title">{item.authorName}</td>
            <td>{item.content ? item.content.substring(0, 40) + '...' : '—'}</td>
            <td>👍 {item.likes || 0} | 💬 {item.comments ? item.comments.length : 0}</td>
          </>
        );
      default:
        return null;
    }
  };

  const tabLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + 's';

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Admin Panel</h2>
          <p className="sidebar-subtitle">Portfolio Manager</p>
        </div>
        
        <nav className="sidebar-nav">
          {tabConfig.map(tab => {
            const Icon = tab.icon;
            return (
              <button 
                key={tab.key} 
                className={`sidebar-link ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab.key); setFormData({}); setMessage(''); }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="sidebar-link footer-link" target="_blank" rel="noopener noreferrer">
            <Eye size={18} />
            <span>View Portfolio</span>
          </a>
          <button onClick={handleLogout} className="sidebar-link footer-link logout">
            <LogOut size={18} />
            <span>Logout</span>
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
              {activeTab === 'hero' ? 'Hero Configuration' : 
               activeTab === 'about' ? 'About Configuration' : 
               activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + 's'}
            </h1>
            {(activeTab !== 'hero' && activeTab !== 'about' && activeTab !== 'contact') && (
              <p className="page-count">{items.length} {items.length === 1 ? 'entry' : 'entries'}</p>
            )}
          </div>
          {(activeTab !== 'hero' && activeTab !== 'about' && activeTab !== 'contact') && (
            <button 
              className="add-btn" 
              onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({}); }}
            >
              <Plus size={18} /> {showForm ? 'Close Form' : `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            </button>
          )}
        </div>

        {message && (
          <div className={`toast-message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* Add/Edit Form (collapsible) */}
        {showForm && (
          <div className="form-card">
            <h3 className="form-card-title">{editingId ? 'Edit' : 'Add New'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            <form onSubmit={handleSubmit} className="admin-form">
              {renderFormFields()}
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingId ? 'Update' : 'Save'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
                <button type="button" className="cancel-btn" onClick={() => { setShowForm(false); setEditingId(null); setFormData({}); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Table */}
        {(activeTab !== 'hero' && activeTab !== 'about' && activeTab !== 'contact') && (
          <div className="data-table-card">
            {items.length === 0 ? (
              <div className="empty-state">
                <p>No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} found. Click <strong>"Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}"</strong> to create one.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    {getTableHeaders().map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id}>
                      {renderTableRow(item)}
                      <td className="td-actions">
                        <button onClick={() => handleEdit(item)} className="action-btn edit" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="action-btn delete" title="Delete">
                          <Trash2 size={16} />
                        </button>
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

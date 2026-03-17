import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Skills from './components/Skills';
import ResumeSections from './components/ResumeSections';
import Projects from './components/Projects';
import Contact from './components/Contact';
import AboutMe from './components/AboutMe';
import CustomCursor from './components/CustomCursor';
import ParticleBackground from './components/ParticleBackground';

// Admin Components (To be created)
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';

function PortfolioLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AboutMe />
        <Skills />
        <Projects />
        <ResumeSections />
      </main>
      <Contact />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Backgrounds */}
        <div className="grid-background"></div>
        <ParticleBackground />

        {/* Interactive Elements */}
        <CustomCursor />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<PortfolioLayout />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

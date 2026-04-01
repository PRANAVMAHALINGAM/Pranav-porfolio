import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import ProjectDetail from './pages/ProjectDetail';
import VolunteeringPage from './pages/VolunteeringPage';
import AwardsPage from './pages/AwardsPage';
import BlogPage from './pages/BlogPage';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/awards" element={<AwardsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/volunteering" element={<VolunteeringPage />} />
        </Routes>
      </main>
      <Analytics />
      <SpeedInsights />
    </Router>
  );
}

export default App;

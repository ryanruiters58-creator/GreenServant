import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <main className="home-page">
      <div className="hero">
        <div className="hero-content">
          <h1>🌿 GreenServant</h1>
          <p className="hero-subtitle">Service Delivery for Ward 46, Buffalo City</p>
          <p className="hero-description">
            Report municipal issues directly to your community leadership. 
            Help us serve Ward 46 better by reporting potholes, water leaks, 
            illegal dumping, and other service delivery problems.
          </p>
          <div className="hero-actions">
            <Link to="/log-complaint" className="btn btn-primary btn-large">Report a Problem</Link>
            <Link to="/emergency" className="btn btn-danger btn-large">Emergency Contacts</Link>
          </div>
        </div>
      </div>

      <div className="container">
        <section className="features">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Capture Evidence</h3>
              <p>Take or upload photos of the issue to provide clear evidence of the problem.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Log Complaints</h3>
              <p>Fill out a simple form with details about the issue and its location.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Track Progress</h3>
              <p>Monitor your complaint status from submission to resolution.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>Emergency Access</h3>
              <p>Quick access to Buffalo City Municipality emergency contact numbers.</p>
            </div>
          </div>
        </section>

        <section className="categories">
          <h2>Report These Issues</h2>
          <div className="categories-grid">
            <div className="category-item">💧 Water & Sanitation</div>
            <div className="category-item">⚡ Electricity</div>
            <div className="category-item">🛣️ Roads & Potholes</div>
            <div className="category-item">🗑️ Refuse</div>
            <div className="category-item">🌳 Sanitation</div>
            <div className="category-item">💡 Street Lights</div>
          </div>
        </section>

        <section className="about">
          <h2>About GreenServant</h2>
          <p>
            GreenServant is a community-driven platform developed by the Buffalo City Patriotic Alliance Ward 46 
            to empower residents to report service delivery issues directly to local leadership. 
            By providing evidence through photos and detailed descriptions, residents help the municipality 
            prioritize and address critical infrastructure and service issues.
          </p>
          <p>
            All complaints are logged and tracked to ensure accountability and timely resolution.
          </p>
        </section>
      </div>
    </main>
  );
}

export default Home;

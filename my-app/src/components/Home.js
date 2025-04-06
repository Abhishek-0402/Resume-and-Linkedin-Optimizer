import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>✨ Resume & LinkedIn Optimizer</h1>
          <p>
            Upload your resume or LinkedIn export PDF with a job description,<br />
            and let AI tell you how to improve and stand out 🔍
          </p>
          <img
            src="/images/hero-jobhunt.svg"
            alt="Job Hunt"
            className="hero-image"
          />
          <Link to="/resume" className="hero-button">🚀 Get Started</Link>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="feature-cards">
          <div className="feature">
            <img src="/icons/ai.png" alt="AI Feedback" />
            <h4>AI-Powered Feedback</h4>
            <p>Get smart suggestions tailored to your dream job using advanced AI.</p>
          </div>
          <div className="feature">
            <img src="/icons/resume.png" alt="Resume Analysis" />
            <h4>Resume & LinkedIn Review</h4>
            <p>Upload resumes or LinkedIn exports and get actionable insights instantly.</p>
          </div>
          <div className="feature">
            <img src="/icons/target.png" alt="Target Match" />
            <h4>Job-Focused Optimization</h4>
            <p>We align your profile with specific job descriptions for maximum impact.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

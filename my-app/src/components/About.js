import React from "react";
import { FaInfoCircle, FaReact, FaRobot, FaHeart, FaGithub, FaLaptopCode } from "react-icons/fa";
import "../components/About.css"; // Make sure this path matches your folder structure

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container glass-card">
        <h1 className="about-heading">
          <FaInfoCircle className="about-icon" /> About This Tool
        </h1>
        <p className="about-subtitle">
          This platform uses AI to help you tailor your resume and LinkedIn profile to job descriptions, giving you a competitive edge in the job market.
        </p>

        <hr className="divider" />

        <h3 className="about-subheading">🚀 What It Does</h3>
        <ul className="about-list">
          <li>📄 Analyze and rewrite your resume to better match job descriptions</li>
          <li>🔗 Optimize your LinkedIn export for keyword alignment</li>
          <li>🧠 Get AI-generated improvement suggestions and job-targeted feedback</li>
          <li>📌 Explore jobs by title and location with an integrated search tool</li>
        </ul>

        <hr className="divider" />

        <h3 className="about-subheading">🛠 Built With</h3>
        <div className="tech-stack">
          <span><FaReact className="tech-icon" /> React</span>
          <span><FaLaptopCode className="tech-icon" /> FastAPI</span>
          <span><FaRobot className="tech-icon" /> OpenAI API</span>
        </div>

        <p className="crafted-line">
          Crafted with <FaHeart color="red" /> to help job seekers win more interviews and stand out 💼
        </p>

        <hr className="divider" />

        <p className="about-footer">
          Source code on <a href="https://github.com" target="_blank" rel="noopener noreferrer"><FaGithub /> GitHub</a>
        </p>
      </div>
    </div>
  );
};

export default About;

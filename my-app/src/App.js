import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Resume from "./components/Resume";
import ResumeResult from "./components/ResumeResult";
import LinkedIn from "./components/LinkedIn";
import LinkedInResult from "./components/LinkedInResult";
import About from "./components/About";
import "./App.css";
import JobSearch from './components/JobSearch';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/resume/result" element={<ResumeResult />} />
        <Route path="/linkedin" element={<LinkedIn />} />
        <Route path="/linkedin/result" element={<LinkedInResult />} />
        <Route path="/job_search" element={<JobSearch />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;

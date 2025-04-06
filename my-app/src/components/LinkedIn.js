import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBriefcase } from "react-icons/fa";
import "../components/Linkedin.css";

const LinkedIn = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) {
      alert("Please upload a file and enter job description.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      setLoading(true);
      const response = await axios.post("https://resume-and-linkedin-optimizer.onrender.com/linkedin/optimize", formData, {
        withCredentials: true,
      });

      const feedback = response.data["LinkedIn Feedback"];
      const downloadLink = response.data["Download PDF"];

      localStorage.setItem("linkedinFeedback", feedback);
      localStorage.setItem("linkedinDownloadURL", downloadLink);

      navigate("/linkedin/result");
    } catch (error) {
      console.error("LinkedIn analysis failed:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="linkedin-page">
      <h1 className="linkedin-heading">
        <FaBriefcase className="header-icon" /> LinkedIn Profile Optimization
      </h1>
      <p className="linkedin-subtitle">
        Upload your resume and job description to get AI-powered LinkedIn suggestions!
      </p>

      <form className="linkedin-form glass-card" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Upload Resume (PDF only)</label>
          <input
            type="file"
            className="form-control"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Paste Job Description</label>
          <textarea
            className="form-control"
            rows={6}
            value={jobDescription}
            onChange={handleDescriptionChange}
            required
            placeholder="Paste job description here..."
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "⏳ Analyzing..." : "⚡ Analyze LinkedIn"}
        </button>
      </form>
    </div>
  );
};

export default LinkedIn;

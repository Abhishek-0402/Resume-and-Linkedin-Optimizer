import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "./Resume.css";

const Resume = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile || !jobDesc) {
      alert("Please upload a resume and enter the job description.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", resumeFile);
    formData.append("job_description", jobDesc);

    try {
      const response = await fetch("https://resume-and-linkedin-optimizer.onrender.com/...", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Resume processing failed.");
      }

      localStorage.setItem("resumeFeedback", data["AI Feedback Summary"]);
      localStorage.setItem("updatedResume", data["Updated Resume Text"]);
      localStorage.setItem("session_id", data["session_id"]);

      navigate("/resume/result");
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-bg resume-container">
      <h1 className="resume-heading">📄 Resume Analyzer</h1>
      <p className="resume-subtitle">
        Upload your resume and job description to receive a full analysis and a professionally rewritten version.
      </p>

      <form className="resume-form glass-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="resume" className="form-label">
            Upload Resume
          </label>
          <input
            type="file"
            id="resume"
            className="form-control"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobDesc" className="form-label">
            Paste Job Description
          </label>
          <textarea
            id="jobDesc"
            className="form-control"
            rows={6}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste job description here..."
            required
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "⏳ Processing..." : "🚀 Analyze and Rewrite Resume"}
        </button>
      </form>
    </div>
  );
};

export default Resume;

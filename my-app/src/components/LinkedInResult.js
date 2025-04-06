import React, { useEffect, useState } from "react";
import { FaLinkedin } from "react-icons/fa";
import "../App.css";

const LinkedInResult = () => {
  const [feedback, setFeedback] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    const storedFeedback = localStorage.getItem("linkedinFeedback");
    const storedDownload = localStorage.getItem("linkedinDownloadURL");

    if (!storedFeedback) {
      alert("No LinkedIn feedback found. Please analyze your profile first.");
      window.location.href = "/linkedin";
    } else {
      setFeedback(storedFeedback);
      setDownloadUrl(storedDownload);
    }
  }, []);

  return (
    <div className="linkedin-result-bg">
      <div className="result-container">
        <div className="linkedin-result-header">
          <h1>
            <FaLinkedin className="linkedin-header-icon" /> LinkedIn Feedback
          </h1>
          <p>Optimize your professional presence with this feedback 🚀</p>
        </div>

        <div className="feedback-box markdown-content">
          {feedback ? (
            <div dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, "<br/>") }} />
          ) : (
            <p className="placeholder-text">No feedback available.</p>
          )}
        </div>

        {downloadUrl && (
          <a
            className="download-btn"
            href={`https://resume-and-linkedin-optimizer.onrender.com${downloadUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            📥 Download LinkedIn Summary PDF
          </a>
        )}
      </div>
    </div>
  );
};

export default LinkedInResult;

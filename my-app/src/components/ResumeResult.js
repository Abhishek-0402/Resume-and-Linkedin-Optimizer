import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResumeResult.css";


const ResumeResult = () => {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatedResume, setUpdatedResume] = useState("");
  const [sessionId, setSessionId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedFeedback = localStorage.getItem("resumeFeedback");
    const storedUpdated = localStorage.getItem("updatedResume");
    const storedSessionId = localStorage.getItem("session_id");

    if (!storedFeedback || !storedUpdated || !storedSessionId) {
      alert("Session expired or data missing. Please start again.");
      navigate("/resume");
      return;
    }

    setFeedback(storedFeedback);
    setUpdatedResume(storedUpdated);
    setSessionId(storedSessionId);
  }, [navigate]);

  const downloadPDF = (type) => {
    if (!sessionId) {
      alert("Session missing. Re-analyze first.");
      return;
    }

    const url =
      type === "summary"
        ? `https://resume-and-linkedin-optimizer.onrender.com/resume/download-summary/pdf?session_id=${sessionId}`
        : `https://resume-and-linkedin-optimizer.onrender.com/resume/download-updated-resume/pdf?session_id=${sessionId}`;

    window.open(url, "_blank");
  };

  return (
    <div className="result-bg">
      <div className="result-container">
        <div className="result-header">
          <h1>✨ AI Resume Feedback</h1>
          <p>Your resume was analyzed and rewritten based on the job description.</p>
        </div>

        <div className="feedback-box markdown-content">
          {feedback ? (
            <div dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, "<br/>") }} />
          ) : (
            <p className="placeholder-text">No feedback available.</p>
          )}
        </div>

        <div className="download-container">
  <button className="download-btn" onClick={() => downloadPDF("summary")}>
    📥 Download Summary PDF
  </button>
  <button className="download-btn" onClick={() => downloadPDF("updated")}>
    📥 Download Updated Resume PDF
  </button>
</div>
      </div>
    </div>
  );
};

export default ResumeResult;

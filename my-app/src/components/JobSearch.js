import React, { useState } from 'react';
import './JobSearch.css';

function JobSearch() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query || !location) return;

    setLoading(true);
    setResults([]); // Clear previous results

    try {
      const res = await fetch(`https://resume-and-linkedin-optimizer.onrender.com/api/jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
      const data = await res.json();
      console.log("Fetched data:", data);
      setResults(data?.data ?? []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-search-page">
      <h1 className="job-title">🔍 Job Search</h1>

      <form className="job-search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Job title (e.g., Data Intern)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location (e.g., Montreal)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="job-results">
        {results.length === 0 && !loading ? (
          <p className="no-results">No jobs to show. Try a search above. 👆</p>
        ) : (
          <div className="job-grid">
            {results.map((job, index) => (
              <div className="job-card" key={index}>
                <h2>{job.job_title}</h2>
                <p><strong>{job.employer_name}</strong> — {job.job_location}</p>
                <p>{job.job_description?.slice(0, 250)}...</p>
                <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobSearch;

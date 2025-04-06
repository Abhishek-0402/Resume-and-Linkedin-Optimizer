import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
    <Link to="/" className="navbar-brand rocket-brand">
  🚀 <span>BoostCraft</span>
</Link>
    <div className="navbar-nav ms-auto">
      <Link className="nav-link" to="/resume">Resume Analysis</Link>
      <Link className="nav-link" to="/linkedin">LinkedIn Optimization</Link>
      <Link className="nav-link" to="/job_search">Job Search</Link>
      <Link className="nav-link" to="/about">About</Link>
    </div>
  </nav>
);

export default Navbar;

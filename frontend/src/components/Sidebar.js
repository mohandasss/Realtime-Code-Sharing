import React from 'react';
import { Link } from 'react-router-dom';
import codeicon from "./DevCaster1.png"
const Sidebar = ({ onLogout }) => {
  return (
    <div className="sidebar">
  <div className="logo-container">
    <img src={codeicon} alt="Logo" className="logo" />
    <span className='texthead' >DevCaster</span>
  </div>
  <a href="/" className="nav-link">Home</a>
  <a href="/AboutUs" className="nav-link">About Us</a>
  <a href="/Login" className="nav-link">Login</a>
  <a href="/Register" className="nav-link">Register</a>
  <a href="/Logout" className="nav-link">Logout</a>
</div>

  );
};

export default Sidebar;

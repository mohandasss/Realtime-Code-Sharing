import React from 'react';
import { Link } from 'react-router-dom';
import codeicon from "./DevCaster1.png";

const Sidebar = ({ onLogout, isAuthenticated }) => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={codeicon} alt="Logo" className="logo" />
        <span className='texthead'>DevCaster</span>
      </div>
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/AboutUs" className="nav-link">About Us</Link>
      {!isAuthenticated ? (
        <>
          <Link to="/Login" className="nav-link">Login</Link>
          <Link to="/Register" className="nav-link">Register</Link>
        </>
      ) : (
        <Link to="/Logout" className="nav-link" onClick={onLogout}>Logout</Link>
      )}
    </div>
  );
};

export default Sidebar;

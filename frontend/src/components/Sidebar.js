import React from 'react';
import { Link } from 'react-router-dom';
import codeicon from "./DevCaster1.png";
import toast from 'react-hot-toast';

const Sidebar = ({ isAuthenticated, onLogout }) => {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={codeicon} alt="Logo" className="logo" />
        <span className='texthead'>DevCaster</span>
      </div>
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/AboutUs" className="nav-link">About Us</Link>
      {isAuthenticated ? (
        <Link to onClick={onLogout} className="nav-link">Logout</Link>
      ) : (
        <>
          <Link to="/Login" className="nav-link">Login</Link>
          <Link to="/Register" className="nav-link">Register</Link>
        </>
      )}
    </div>
  );
};

export default Sidebar;

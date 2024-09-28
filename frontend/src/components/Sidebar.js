import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import codeicon from "./DevCaster1.png";
import toast from 'react-hot-toast';

const Sidebar = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/"); // Navigate to the home page
  };

  return (
    <div className="sidebar">
      <div onClick={handleLogoClick} style={{ cursor: "pointer" }} className="logo-container">
        <img src={codeicon} alt="Logo" className="logo" />
        <span className='texthead'>DevCaster</span>
      </div>
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/AboutUs" className="nav-link">About Us</Link>
      {isAuthenticated ? (
        <span onClick={onLogout} className="nav-link" style={{ cursor: 'pointer' }}>
          Logout
        </span>
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

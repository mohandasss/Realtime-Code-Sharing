import React from 'react';
import './Aboutus.css'; // Import CSS for styling
import aboutImage from './md.jpg'; // Replace with your image path
import { FaGithub, FaInstagram, FaLinkedin,FaWhatsapp,FaAddressBook  } from 'react-icons/fa';

const Aboutus = () => {
  return (
    <div className="about-section">
      <div style={{ fontFamily: "Urbanist" }} className="text-container">
        <h1>About Us</h1>
        <p>
          <span style={{ fontSize: "30px", color: "orange" }}>R</span>ealtime Code Sharing Tool is a full-stack application developed by 
          <span style={{ color: "orange", fontSize: "30px", fontWeight: "700" }}> Mohan Das </span>
          between February and March 2024. This innovative tool enables real-time code collaboration, allowing users to work simultaneously in the same room and enhancing team productivity by 25%. Changes made by one user are instantly reflected on all connected clients, ensuring seamless communication and collaboration. The application features code highlighting, which improves readability and makes coding easier for all participants, contributing to a 20% increase in user satisfaction. Additionally, DevCaster offers editor customization options that provide users with the flexibility to tailor their coding environment, further enhancing usability and engagement. Built with a robust tech stack that includes HTML, CSS, JavaScript, Node.js, Socket.IO, React, and CodeMirror, DevCaster is designed to empower developers and streamline their collaborative coding experiences.
        </p>
        <p>
          Join us in our journey to make coding accessible, enjoyable, and rewarding. Whether you're a beginner or a seasoned professional, you'll find valuable insights and tools here at  
          <span  style={{ color: "orange", fontSize: "30px", fontWeight: "700" }}> DevCaster</span>.
        </p>
        <div className="social-icons">
        <a href="https://mohandevfolioo.netlify.app/" target="_blank" rel="noopener noreferrer">
            <FaAddressBook size={30} color="#ffffff" />
          </a>
          <a href="https://www.instagram.com/mohandas00007/" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={30} color="#E1306C" />
          </a>
          <a href="https://www.linkedin.com/in/mdas004/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin size={30} color="#0077B5" />
          </a>
          <a href="https://github.com/mohandasss" target="_blank" rel="noopener noreferrer">
            <FaGithub size={30} color="#ffffff" />
          </a>
          <a href="http://surl.li/jjyynf" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp size={30} color="#42ff00 " />
          </a>
        </div>
      </div>
      <div className="image-container">
        <img src={aboutImage} alt="About Us" />
      </div>
    </div>
  );
};

export default Aboutus;

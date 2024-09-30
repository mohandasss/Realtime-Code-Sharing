import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from './Modal';
import LoginModal from './LoginModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if username is passed from login
    if (location.state && location.state.username) {
      setUsername(location.state.username);
    }
  }, [location.state]);

  const generateRoomId = () => {
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room ID generated");
  };

  const joinRoom = () => {
    if (!roomId) {
      toast.error("Room ID cannot be empty.");
      return;
    }
    
    if (!token) {
      navigate("/register")
    } else {
      navigate(`/editor/${roomId}`, { state: { username } });
    }
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  const handleRegisterSuccess = async (username, password) => {
    if (!validateUsername(username) || !validatePassword(password)) {
      return;
    }

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      setUsername(username);
      setIsRegisterModalOpen(false);
      setIsLoginModalOpen(true);
      toast.success("Registration successful! Please log in.");
    } else {
      const data = await response.json();
      toast.error(data.message || "Registration failed.");
    }
  };

  const handleLoginSuccess = async (username, password) => {
    if (!validateUsername(username) || !validatePassword(password)) {
      return;
    }

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setUsername(username);
      setIsLoginModalOpen(false);
      toast.success("Login successful!");
    } else {
      const data = await response.json();
      toast.error(data.message || "Login failed.");
    }
  };

  const createNewRoom = () => {
    if (token) {
      generateRoomId(); // Generate and display the new room ID
    } else {
      navigate("/register") // Open registration if not authenticated
    }
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/; // 3 to 20 alphanumeric characters
    if (!usernameRegex.test(username)) {
      toast.error("Username must be 3-20 characters long and can only contain letters and numbers.");
      return false;
    }
    return true;
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#1e1e2f" }}>
      <div style={{ maxWidth: "600px", width: "100%", padding: "40px", backgroundColor: "#2c2c3e", borderRadius: "12px", boxShadow: "0px 6px 25px rgba(0, 0, 0, 0.3)" }}>
        <div style={{ textAlign: "center" }}>
          <img
            src="/images/DevCaster1.png"
            alt="Logo"
            style={{
              maxWidth: "200px",
              marginBottom: "30px",
              borderRadius: "10px",
            }}
          />
          <h4 style={{ color: "#fff", fontFamily: "Urbanist, sans-serif", marginBottom: "30px", fontSize: "28px" }}>
            Dev<span style={{ color: "#ff6800" }}>Caster</span>
          </h4>
  
          <h5 style={{ color: "#fff", fontFamily: "Urbanist, sans-serif", marginBottom: "30px", fontSize: "22px" }}>Enter the ROOM ID</h5>
  
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="ROOM ID"
            style={{
              fontFamily:"urbanist",
              width: "100%",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
            onKeyUp={handleInputEnter}
          />
  
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="USERNAME"
            disabled={!token}
            style={{
              fontFamily:"urbanist",
              width: "100%",
              padding: "15px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              backgroundColor:"#f0000"
            }}
          />
  
          <button
            onClick={joinRoom}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontFamily: "Urbanist, sans-serif",
              fontSize: "18px",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
          >
            JOIN
          </button>
  
          <p style={{ fontFamily: "Urbanist, sans-serif", color: "#fff", marginTop: "30px", fontSize: "16px" }}>
            Don't have a room ID? create
            <span
              onClick={createNewRoom}
              style={{ color: "#28a745", paddingLeft: "5px", cursor: "pointer" }}
            >
              New Room
            </span>
          </p>
        </div>
      </div>
  
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegisterSuccess}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLoginSuccess}
      />
    </div>
  );
  
}

export default Home;

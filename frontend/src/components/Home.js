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
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm p-2 mb-5 bg-secondary rounded">
            <div className="card-body text-center bg-dark">
              <img
                src="/images/DevCaster1.png"
                alt="Logo"
                className="img-fluid mx-auto mt-2 mb-2 rounded-lg d-block"
                style={{ maxWidth: "150px" }}
              />
              <h4 className="card-title text-light mb-4">
                Dev<span className="text-orange">Caster</span>
              </h4>

              <h5 className="card-title text-light mb-4">Enter the ROOM ID</h5>

              <div className="form-group">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="form-control mb-2"
                  placeholder="ROOM ID"
                  onKeyUp={handleInputEnter}
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control mb-2"
                  placeholder="USERNAME"
                  disabled={!token} // Disable input if logged in
                />
              </div>
              <button onClick={joinRoom} className="btn btn-success btn-lg btn-block">
                JOIN
              </button>
              <p className="mt-3 text-light">
                Don't have a room ID? create{" "}
                <span
                  onClick={createNewRoom}
                  className="text-success p-2"
                  style={{ cursor: "pointer" }}
                >
                  New Room
                </span>
              </p>
            </div>
          </div>
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

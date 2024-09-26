import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Modal from './Modal'; // Adjust the path as necessary
import LoginModal from './LoginModal'; // Adjust the path as necessary

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both fields are required");
      return;
    }
    navigate(`/editor/${roomId}`, { state: { username } });
    toast.success("Room is created");
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  const handleRegisterSuccess = (username) => {
    setUsername(username); // Set the username from registration
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true); // Open login modal after successful registration
  };

  const handleLoginSuccess = (username) => {
    setUsername(username); // Update username on successful login
    setIsLoginModalOpen(false);
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
                  onKeyUp={handleInputEnter}
                />
              </div>
              <button onClick={joinRoom} className="btn btn-success btn-lg btn-block">
                JOIN
              </button>
              <p className="mt-3 text-light">
                Don't have a room ID? create{" "}
                <span
                  onClick={() => setIsRegisterModalOpen(true)}
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

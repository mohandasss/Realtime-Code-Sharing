import React from 'react';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
    if (!isOpen) return null;

    const handleSubmit = async (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const password = e.target.password.value;

      await onLogin(username, password); // Login and handle success
    };

    return (
      <div className="modal-overlay">
        <div className="modal-card">
          <button className="close-btn" onClick={onClose}>&times;</button>
          <h3>Login</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit" className="btn btn-success">Login</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Close</button>
          </form>
        </div>
      </div>
    );
};

export default LoginModal;

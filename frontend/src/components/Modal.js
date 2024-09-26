import React from 'react';

const Modal = ({ isOpen, onClose, onRegister, onSwitchToLogin }) => {
    if (!isOpen) return null;
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const password = e.target.password.value;
  
      // Assuming you have a function to handle registration
      const success = await onRegister(username, password); // Modify this if needed
      if (success) {
        onClose(); // Close the modal after registration
      }
    };
  
    return (
      <div className="modal-overlay">
        <div className="modal-card">
          <button className="close-btn" onClick={onClose}>&times;</button>
          <h3>Register</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit" className="btn btn-success">Register</button>
            <button type="button" onClick={onClose} className="btn btn-secondary">Close</button>
          </form>
          <p className='white-text' style={{ marginTop: '10px' }}>
            Already have an account? 
            <span onClick={onSwitchToLogin} className="text-success" style={{ cursor: 'pointer' }}> Login</span>
          </p>
        </div>
      </div>
    );
  };
  
  export default Modal;
  

import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/register`, { username, password });
      toast.success(response.data.message);
      navigate('/login'); // Redirect to login page
    } catch (error) {
      toast.error(error.response ? error.response.data.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0000'
    }}>
      <div style={{
        maxWidth: '600px', // Increased width
        padding: '40px',   // Increased padding
        border: '1px solid #ccc',
        borderRadius: '12px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
        backgroundColor: '#fff'
      }}>
        <h2 style={{ textAlign: 'center', fontFamily: "Urbanist, sans-serif", fontSize: "28px", marginBottom: '30px' }}>Register</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ fontFamily: "Urbanist, sans-serif", marginBottom: '20px' }}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '15px', 
                borderRadius: '8px', 
                border: '1px solid #ccc',
                marginBottom: '15px'
              }}
            />
          </div>
          <div style={{ fontFamily: "Urbanist, sans-serif", marginBottom: '20px' }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '15px', 
                borderRadius: '8px', 
                border: '1px solid #ccc',
                marginBottom: '15px'
              }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%',
            padding: '15px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#28a745',
            color: 'white',
            cursor: 'pointer',
            fontFamily: "Urbanist, sans-serif",
            fontSize: "18px",
            transition: 'background-color 0.3s ease',
          }}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ fontFamily: "Urbanist, sans-serif", textAlign: 'center', marginTop: '30px', fontSize: '16px' }}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: '#28a745', cursor: 'pointer' }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;

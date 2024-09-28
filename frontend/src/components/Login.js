import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, { username, password });
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Update authentication state
      setIsAuthenticated(true);
      toast.success("Welcome to DevCaster") // Update here to reflect the change immediately

      // Redirect to home with username
      navigate('/', { state: { username } });
      
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
      backgroundColor: '#0000'
    }}>
      <div style={{
        maxWidth: '800px', 
        padding: '60px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: '#fff'
      }}>
        <h2 style={{ textAlign: 'center' }}>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{  fontFamily:"urbanist", marginBottom: '15px' }}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{  fontFamily:"urbanist", marginBottom: '15px' }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
             fontFamily:"urbanist",
            width: '100%',
            padding: '12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#4CAF50',
            color: 'white',
            cursor: 'pointer'
          }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ fontFamily:"urbanist", textAlign: 'center', marginTop: '20px' }}>
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            style={{ color: '#4CAF50', cursor: 'pointer' }}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;

import './App.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from './components/Home';
import EditorPage from './components/EditorPage';
import Sidebar from './components/Sidebar'; 
import { toast, Toaster } from 'react-hot-toast'; // Import Toaster
import Register from './components/Register';
import Login from './components/Login';
import { useEffect, useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate(); // useNavigate hook for redirection

  useEffect(() => {
    // Check authentication status on token change
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from local storage
    setIsAuthenticated(false); // Update authentication status
    toast.success("Successfully logged out!");
    navigate('/'); // Redirect to the home page
  };

  return (
    <div className="app-container">
      <Sidebar isAuthenticated={isAuthenticated} onLogout={handleLogout} />

      <div className="content">
        <Toaster position='top-center' /> {/* Add Toaster here */}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/editor/:roomId' element={<EditorPage />} />
          <Route path='/Register' element={<Register />} />
          <Route path='/Login' element={<Login setIsAuthenticated={setIsAuthenticated} />} /> {/* Pass prop here */}
          <Route path='*' element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

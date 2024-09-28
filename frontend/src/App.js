import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './components/Home';
import EditorPage from './components/EditorPage';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';
import Register from './components/Register';
import Login from './components/Login';
import { useState } from 'react';

function App() {
  // State to manage user authentication
  const [user, setUser] = useState({ isAuthenticated: false }); // Adjust this based on your authentication logic

  // Logout handler
  const handleLogout = () => {
    // Perform logout logic here (e.g., API call, clearing local storage)
    setUser({ isAuthenticated: false }); // Set user state to unauthenticated
  };

  return (
    <div className="app-container">
      <Sidebar onLogout={handleLogout} isAuthenticated={user.isAuthenticated} />

      <div className="content">
        <Toaster position='top-center' />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/editor/:roomId' element={<EditorPage />} />
          <Route path='/Register' element={<Register />} />
          <Route path='/Login' element={<Login />} />
          <Route path='*' element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

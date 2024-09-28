import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './components/Home';
import EditorPage from './components/EditorPage';
 // Import the About component
import Sidebar from './components/Sidebar'; // Import the Sidebar
import { Toaster } from 'react-hot-toast';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  return (
    <div className="app-container">
      <Sidebar /> {/* Add the Sidebar component */}
      <div className="content">
        <Toaster position='top-center' />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/editor/:roomId' element={<EditorPage />} />
          
          <Route path='/Register' element={<Register />} />
          <Route path='/Login' element={<Login/>} />
          <Route path='*' element={<div>404 Not Found</div>} />

        </Routes>
      </div>
    </div>
  );
}

export default App;

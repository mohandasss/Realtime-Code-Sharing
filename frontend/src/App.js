import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './components/Home';
import EditorPage from './components/EditorPage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="app-container">
      <Toaster position='top-center' />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/editor/:roomId' element={<EditorPage />} />
        {/* Fallback route for 404 */}
        <Route path='*' element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;

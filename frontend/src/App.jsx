import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VoiceDemo from './pages/VoiceDemo';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import './index.css'; // ensure tailwind is loaded

function App() {
  return (
    <BrowserRouter>
      <div className="App font-sans">
        <Routes>
          <Route path="/" element={<VoiceDemo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/conversations" element={<Conversations />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

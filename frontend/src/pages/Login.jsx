import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/admin/login`, { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex-1 bg-grid-pattern flex flex-col items-center justify-center p-4 min-h-[calc(100vh-64px)] md:min-h-screen w-full">
      
      {/* Branding inside login since it might be standalone or in layout */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-shayak-yellow)] flex items-center justify-center text-[var(--color-shayak-sidebar)] font-bold text-3xl shadow-lg mb-4">
          श
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--color-shayak-sidebar)] tracking-tight">shayak</h1>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 max-w-sm w-full animate-slide-up">
        <div className="text-center mb-8">
          <ShieldCheck size={40} className="mx-auto text-[var(--color-shayak-rust)] mb-4" />
          <h2 className="text-xl font-bold text-[var(--color-shayak-sidebar)]">Officer Login</h2>
          <p className="text-gray-500 font-medium text-sm mt-1">PM-AJAY Livelihood Mapping</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium text-center border border-red-100">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-shayak-rust)] focus:ring-2 focus:ring-[var(--color-shayak-rust-light)] transition-all font-medium text-gray-700"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-shayak-rust)] focus:ring-2 focus:ring-[var(--color-shayak-rust-light)] transition-all font-medium text-gray-700"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-[var(--color-shayak-sidebar)] hover:bg-[var(--color-shayak-sidebar-hover)] text-white rounded-xl py-3 font-semibold transition-colors mt-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

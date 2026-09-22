import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const API_BASE = 'http://localhost:5000/api';

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchConvos = async () => {
      try {
        const res = await axios.get(`${API_BASE}/admin/conversations?limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchConvos();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 transition-colors duration-300 font-['Outfit'] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      {/* Top Navbar */}
      <nav className="glass sticky top-0 z-20 px-8 py-4 shadow-sm flex items-center gap-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <Link to="/dashboard" className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Recent Conversations</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Officer Dashboard / Logs</p>
        </div>
        <ThemeToggle />
      </nav>

      <main className="p-8 max-w-[1400px] mx-auto animate-slide-up">
        
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input type="text" placeholder="Search conversations..." className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 dark:focus:border-indigo-400 shadow-sm text-sm font-medium w-64 text-slate-700 dark:text-slate-200" />
          </div>
          <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm font-medium text-sm transition-colors">
            <Filter size={16} /> Filter
          </button>
        </div>

        {/* Data Table */}
        <div className="glass rounded-3xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700/50">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-4"></div>
              <p className="font-medium">Loading records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="py-5 px-8">Date</th>
                    <th className="py-5 px-8">Channel</th>
                    <th className="py-5 px-8">Location</th>
                    <th className="py-5 px-8">Profile Details</th>
                    <th className="py-5 px-8 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {conversations.map((c) => (
                    <tr key={c._id} className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="py-4 px-8 text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(c.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-8">
                        <span className="capitalize font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                          {c.channel}
                        </span>
                      </td>
                      <td className="py-4 px-8 text-slate-700 dark:text-slate-300 font-medium">
                        {c.beneficiary.district || <span className="text-slate-400 dark:text-slate-500 italic">Unknown</span>}
                      </td>
                      <td className="py-4 px-8">
                        <div className="text-slate-800 dark:text-slate-200 font-bold">{c.beneficiary.education} <span className="text-slate-400 dark:text-slate-600 font-normal mx-1">•</span> {c.beneficiary.currentWork}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">Skills: {(c.beneficiary.skills || []).join(', ') || '-'}</div>
                      </td>
                      <td className="py-4 px-8 text-right">
                        {c.status === 'completed' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">Completed</span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{c.state}</span>
                        )}
                        {c.isDemo && (
                          <span className="ml-2 inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">DEMO</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

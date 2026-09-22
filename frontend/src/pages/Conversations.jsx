import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-slide-up w-full overflow-x-hidden">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 bg-[var(--color-sahayak-beige)] hover:bg-[var(--color-sahayak-rust-light)] rounded-xl text-[var(--color-sahayak-sidebar)] transition-colors hidden sm:block">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold text-[var(--color-sahayak-sidebar)] tracking-tight">Recent Conversations</h1>
            <p className="text-gray-500 font-medium mt-1">Officer Dashboard / Logs</p>
          </div>
        </div>
      </div>

      <main className="w-full">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search conversations..." className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[var(--color-sahayak-rust)] focus:ring-2 focus:ring-[var(--color-sahayak-rust-light)] shadow-sm text-sm font-medium w-full sm:w-72 text-gray-700 transition-all" />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 shadow-sm font-medium text-sm transition-colors w-full sm:w-auto justify-center">
            <Filter size={16} /> Filter
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--color-sahayak-rust)] rounded-full animate-spin mb-4"></div>
              <p className="font-medium text-gray-500">Loading records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--color-sahayak-bg)] border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Channel</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Profile Details</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {conversations.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6 text-gray-500 font-medium text-[13px]">
                        {new Date(c.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize font-semibold text-[var(--color-sahayak-sidebar)] bg-[var(--color-sahayak-beige)] px-3 py-1 rounded-lg text-xs">
                          {c.channel}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-medium text-[13px]">
                        {c.beneficiary.district || <span className="text-gray-400 italic">Unknown</span>}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-[var(--color-sahayak-sidebar)] font-bold text-[14px]">
                          {c.beneficiary.education} <span className="text-gray-300 mx-1">•</span> {c.beneficiary.currentWork}
                        </div>
                        <div className="text-gray-500 text-[12px] mt-1 font-medium">
                          Skills: {(c.beneficiary.skills || []).join(', ') || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {c.status === 'completed' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Completed</span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-[var(--color-sahayak-yellow)]/10 text-amber-700 border border-[var(--color-sahayak-yellow)]/30">{c.state}</span>
                        )}
                        {c.isDemo && (
                          <span className="ml-2 inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100">DEMO</span>
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

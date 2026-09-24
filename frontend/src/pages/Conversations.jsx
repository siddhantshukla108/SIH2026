import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, RefreshCw, Globe, Phone, Mic, MapPin, Clock, CheckCircle2, UserCircle2, Briefcase } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchConvos = async (isManualRefresh = false) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConvos();
  }, [navigate]);

  const getChannelIcon = (channel) => {
    switch(channel?.toLowerCase()) {
      case 'web': return <Globe size={14} className="text-blue-500" />;
      case 'whatsapp': return <Phone size={14} className="text-emerald-500" />;
      case 'ivr': return <Mic size={14} className="text-purple-500" />;
      default: return <Globe size={14} className="text-gray-400" />;
    }
  };

  const getChannelStyle = (channel) => {
    switch(channel?.toLowerCase()) {
      case 'web': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'whatsapp': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ivr': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

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
            <p className="text-gray-500 font-medium mt-1">Officer Dashboard / Activity Logs</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchConvos(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition-colors border border-gray-200"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-[var(--color-sahayak-rust)]' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <main className="w-full">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search by location, skills..." className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-[var(--color-sahayak-rust)] focus:ring-4 focus:ring-[var(--color-sahayak-rust-light)]/30 shadow-sm text-sm font-medium w-full sm:w-80 text-gray-700 transition-all placeholder:text-gray-400" />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl text-gray-700 hover:bg-gray-50 shadow-sm font-semibold text-sm transition-colors w-full sm:w-auto justify-center">
            <Filter size={16} /> Filter Results
          </button>
        </div>

        {/* Data Grid / Cards */}
        {loading && !isRefreshing ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex gap-6 items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <UserCircle2 size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">No conversations yet</h3>
            <p className="text-gray-500 mt-1">Wait for users to interact with Sahayak.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {conversations.map((c) => {
              const isCompleted = c.status === 'completed';
              const ben = c.beneficiary || {};
              const hasProfileData = (ben.education && ben.education !== 'unknown') || (ben.currentWork && ben.currentWork !== 'unknown') || (ben.skills && ben.skills.length > 0);
              
              return (
                <div key={c._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex flex-col md:flex-row gap-6 md:items-center relative group">
                  
                  {/* Avatar & Channel */}
                  <div className="flex items-center gap-4 md:w-[22%] shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-sahayak-beige)] to-[var(--color-sahayak-yellow)] flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                      <UserCircle2 size={24} className="text-[var(--color-sahayak-sidebar)] opacity-70" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[var(--color-sahayak-sidebar)] text-[15px]">
                          {ben.name && ben.name !== 'unknown' ? ben.name : 'Anonymous User'}
                        </span>
                        {c.isDemo && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-wider rounded-md">Demo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${getChannelStyle(c.channel)}`}>
                          {getChannelIcon(c.channel)}
                          <span className="capitalize">{c.channel || 'Web'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Time */}
                  <div className="md:w-[15%] flex flex-col gap-2 border-l border-gray-100 pl-6 shrink-0 hidden md:flex">
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-[var(--color-sahayak-rust)] opacity-70" />
                      <div>
                        {ben.district && ben.district !== 'unknown' ? (
                          <p className="text-sm font-semibold text-gray-700 leading-tight">{ben.district}</p>
                        ) : (
                          <p className="text-sm font-medium text-gray-400 italic leading-tight">Location unknown</p>
                        )}
                        {ben.state && ben.state !== 'unknown' && <p className="text-[11px] text-gray-500 mt-0.5">{ben.state}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Profile Highlights */}
                  <div className="flex-1 flex flex-wrap gap-2 md:border-l md:border-gray-100 md:pl-6">
                    {hasProfileData ? (
                      <>
                        {ben.education && ben.education !== 'unknown' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold">
                            🎓 {ben.education}
                          </span>
                        )}
                        {ben.currentWork && ben.currentWork !== 'unknown' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold">
                            <Briefcase size={12} className="text-gray-400" /> {ben.currentWork}
                          </span>
                        )}
                        {ben.skills && ben.skills.slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                            {skill}
                          </span>
                        ))}
                        {ben.skills && ben.skills.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold">
                            +{ben.skills.length - 2} more
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="text-[13px] text-gray-400 italic flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-200"></div> No profile details collected yet
                      </div>
                    )}
                  </div>

                  {/* Status & Date */}
                  <div className="md:w-[15%] flex flex-col md:items-end justify-center gap-2 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                        <CheckCircle2 size={14} className="text-emerald-500" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                        <Clock size={14} className="text-amber-500" /> {c.state === 'START' ? 'Just Started' : 'In Progress'}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}

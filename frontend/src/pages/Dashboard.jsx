import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Users, GraduationCap, Map, LogOut, ChevronRight } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${BACKEND_URL}/api`;
const COLORS = ['#d35b40', '#f8c058', '#1a1c29', '#2a2c3d', '#fbe6dd', '#eae6df'];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  const [educationData, setEducationData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [sumRes, distRes, eduRes] = await Promise.all([
          axios.get(`${API_BASE}/dashboard/summary`, { headers }),
          axios.get(`${API_BASE}/dashboard/by-district`, { headers }),
          axios.get(`${API_BASE}/dashboard/education`, { headers })
        ]);
        setSummary(sumRes.data);
        setDistrictData(distRes.data);
        setEducationData(eduRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/login');
        }
      }
    };
    fetchData();
  }, [navigate]);

  if (!summary) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex items-center gap-3 text-[var(--color-sahayak-sidebar)]">
        <div className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-lg">Loading Dashboard...</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-slide-up w-full overflow-x-hidden">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-sahayak-sidebar)] tracking-tight">Officer Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">PM-AJAY Insights & Analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/conversations" className="flex items-center gap-1 text-[var(--color-sahayak-sidebar)] font-semibold hover:text-[var(--color-sahayak-rust)] transition-colors px-4 py-2 bg-[var(--color-sahayak-beige)] rounded-xl">
            Conversations <ChevronRight size={18} />
          </Link>
          <button 
            onClick={() => { localStorage.removeItem('adminToken'); navigate('/login'); }}
            className="flex items-center gap-2 text-rose-600 font-semibold hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors border border-rose-100"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[var(--color-sahayak-beige)] p-3 rounded-xl group-hover:bg-[var(--color-sahayak-yellow)] transition-colors">
              <Users className="text-[var(--color-sahayak-sidebar)]" size={24} />
            </div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Total Conversations</p>
          </div>
          <h2 className="text-4xl font-bold text-[var(--color-sahayak-sidebar)]">{summary.totalConversations}</h2>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform cursor-pointer group relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-[var(--color-sahayak-rust-light)] p-3 rounded-xl group-hover:bg-[var(--color-sahayak-rust)] group-hover:text-white transition-colors">
                <GraduationCap className="text-[var(--color-sahayak-rust)] group-hover:text-white" size={24} />
              </div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Completed Profiles</p>
            </div>
            {summary.totalConversations > 0 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                {((summary.completedProfiles / summary.totalConversations) * 100).toFixed(1)}% Rate
              </span>
            )}
          </div>
          <h2 className="text-4xl font-bold text-[var(--color-sahayak-sidebar)] relative z-10">{summary.completedProfiles}</h2>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Map className="text-emerald-600 group-hover:text-white" size={24} />
            </div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Districts Reached</p>
          </div>
          <h2 className="text-4xl font-bold text-[var(--color-sahayak-sidebar)]">{districtData.length}</h2>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* District Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 group">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[var(--color-sahayak-sidebar)]">Beneficiaries by District</h3>
              <p className="text-sm text-gray-500 mt-1">Geographical distribution of users</p>
            </div>
            {districtData.length > 0 && (
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
                Top: {districtData[0]._id} ({districtData[0].count})
              </div>
            )}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                  contentStyle={{
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#fff',
                    color: '#1a1c29',
                    fontWeight: 500
                  }}
                />
                <Bar dataKey="count" fill="var(--color-sahayak-sidebar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Split Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-[var(--color-sahayak-sidebar)] mb-1">Channel Split</h3>
            <p className="text-sm text-gray-500 mb-2">Where users interact</p>
          </div>
          <div className="h-48 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.channelSplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                >
                  {summary.channelSplit?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, name ? String(name).toUpperCase() : 'Unknown']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {summary.channelSplit?.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                {entry._id?.toUpperCase() || 'UNKNOWN'}
              </div>
            ))}
          </div>
        </div>

        {/* Education Chart (Horizontal) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-3 flex flex-col md:flex-row gap-8 items-center group">
          <div className="w-full md:w-1/3">
            <h3 className="font-serif text-xl font-bold text-[var(--color-sahayak-sidebar)] mb-2">Education Distribution</h3>
            <p className="text-sm text-gray-500 mb-4">Educational background of all registered beneficiaries.</p>
            {educationData.length > 0 && summary.totalConversations > 0 && (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100">
                <p className="text-sm font-semibold text-emerald-700">Most Common</p>
                <p className="text-2xl font-bold mt-1 text-emerald-900">{educationData[0]._id}</p>
                <p className="text-xs mt-1 font-semibold text-emerald-600 opacity-80">{Math.round((educationData[0].count / summary.totalConversations) * 100)}% of total users</p>
              </div>
            )}
          </div>
          <div className="h-64 w-full md:w-2/3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={educationData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#4b5563', fontWeight: 500}} />
                <Tooltip 
                  cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="var(--color-sahayak-rust)" radius={[0, 6, 6, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}

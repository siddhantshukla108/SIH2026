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
      <div className="flex items-center gap-3 text-[var(--color-shayak-sidebar)]">
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
          <h1 className="font-serif text-3xl font-bold text-[var(--color-shayak-sidebar)] tracking-tight">Officer Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">PM-AJAY Insights & Analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/conversations" className="flex items-center gap-1 text-[var(--color-shayak-sidebar)] font-semibold hover:text-[var(--color-shayak-rust)] transition-colors px-4 py-2 bg-[var(--color-shayak-beige)] rounded-xl">
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
            <div className="bg-[var(--color-shayak-beige)] p-3 rounded-xl group-hover:bg-[var(--color-shayak-yellow)] transition-colors">
              <Users className="text-[var(--color-shayak-sidebar)]" size={24} />
            </div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Total Conversations</p>
          </div>
          <h2 className="text-4xl font-bold text-[var(--color-shayak-sidebar)]">{summary.totalConversations}</h2>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[var(--color-shayak-rust-light)] p-3 rounded-xl group-hover:bg-[var(--color-shayak-rust)] group-hover:text-white transition-colors">
              <GraduationCap className="text-[var(--color-shayak-rust)] group-hover:text-white" size={24} />
            </div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Completed Profiles</p>
          </div>
          <h2 className="text-4xl font-bold text-[var(--color-shayak-sidebar)]">{summary.completedProfiles}</h2>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-50 p-3 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Map className="text-emerald-600 group-hover:text-white" size={24} />
            </div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Districts Reached</p>
          </div>
          <h2 className="text-4xl font-bold text-[var(--color-shayak-sidebar)]">{districtData.length}</h2>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* District Chart */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-serif text-xl font-bold text-[var(--color-shayak-sidebar)] mb-6">Beneficiaries by District</h3>
          <div className="h-72">
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
                <Bar dataKey="count" fill="var(--color-shayak-sidebar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Education Chart */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-serif text-xl font-bold text-[var(--color-shayak-sidebar)] mb-6">Education Distribution</h3>
          <div className="h-72 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={educationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="_id"
                  label={({_id, percent}) => `${_id} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {educationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    backgroundColor: '#fff',
                    color: '#1a1c29',
                    fontWeight: 500
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}

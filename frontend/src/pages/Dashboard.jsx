import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Users, GraduationCap, Map, LogOut, ChevronRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const API_BASE = 'http://localhost:5000/api';
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-['Outfit']">
      <div className="flex items-center gap-3 text-indigo-600">
        <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-lg">Loading Dashboard...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 transition-colors duration-300 font-['Outfit'] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      {/* Top Navbar */}
      <nav className="glass sticky top-0 z-20 px-8 py-4 shadow-sm flex justify-between items-center border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-2.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Officer Dashboard</h1>
            <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">PM-AJAY Insights</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link to="/conversations" className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            View Conversations <ChevronRight size={18} />
          </Link>
          <button 
            onClick={() => { localStorage.removeItem('adminToken'); navigate('/login'); }}
            className="flex items-center gap-2 text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <main className="p-8 max-w-[1400px] mx-auto space-y-8 animate-slide-up">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
            <div className="bg-indigo-100/50 dark:bg-indigo-900/30 p-4 rounded-2xl"><Users className="text-indigo-600 dark:text-indigo-400" size={32} /></div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Total Conversations</p>
              <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-1">{summary.totalConversations}</h2>
            </div>
          </div>
          
          <div className="glass p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
            <div className="bg-emerald-100/50 dark:bg-emerald-900/30 p-4 rounded-2xl"><GraduationCap className="text-emerald-600 dark:text-emerald-400" size={32} /></div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Completed Profiles</p>
              <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-1">{summary.completedProfiles}</h2>
            </div>
          </div>
          
          <div className="glass p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
            <div className="bg-amber-100/50 dark:bg-amber-900/30 p-4 rounded-2xl"><Map className="text-amber-600 dark:text-amber-400" size={32} /></div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Districts Reached</p>
              <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mt-1">{districtData.length}</h2>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* District Chart */}
          <div className="glass p-8 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Beneficiaries by District</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="_id" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                    contentStyle={{
                      borderRadius: '12px', 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#f1f5f9'
                    }}
                  />
                  <Bar dataKey="count" fill="url(#colorIndigo)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Education Chart */}
          <div className="glass p-8 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Education Distribution</h3>
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
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      color: '#f1f5f9'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Compass, MessageSquare, BookOpen, Star, HelpCircle, ArrowRight, Menu, X, LayoutDashboard, Lock } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: 'Home', path: '/', icon: <Compass size={18} /> },
    { name: 'Talk to Shayak', path: '/talk', icon: <MessageSquare size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <>
      {/* Mobile Header / Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[var(--color-shayak-sidebar)] text-white w-full sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-shayak-yellow)] flex items-center justify-center text-[var(--color-shayak-sidebar)] font-bold text-sm">
            श
          </div>
          <span className="font-bold tracking-wide">shayak</span>
        </div>
        <button onClick={toggleSidebar} className="text-white hover:text-[var(--color-shayak-yellow)] transition-colors">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[var(--color-shayak-sidebar)] text-white flex flex-col 
        transition-transform duration-300 ease-in-out font-sans shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0
      `}>
        {/* Logo Section */}
        <div className="p-8 pb-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-shayak-yellow)] flex items-center justify-center text-[var(--color-shayak-sidebar)] font-bold text-2xl shadow-lg">
            श
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-wide leading-none">shayak</span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase mt-2">A BETTER NEXT STEP</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4">
          <p className="px-4 text-xs font-semibold text-gray-500 tracking-widest mb-4">YOUR PATH</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-sm group
                    ${isActive 
                      ? 'bg-[var(--color-shayak-sidebar-hover)] text-white relative' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}
                  `}
                >
                  <span className={isActive ? 'text-[var(--color-shayak-yellow)]' : 'group-hover:text-[var(--color-shayak-yellow)] transition-colors'}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[var(--color-shayak-yellow)] shadow-[0_0_8px_var(--color-shayak-yellow)]"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 space-y-4">
          {/* Need a human card */}
          <div className="bg-[var(--color-shayak-sidebar-hover)] rounded-xl p-5 shadow-inner border border-white/5 cursor-pointer hover:bg-[#343648] transition-colors">
            <div className="flex items-center gap-2 text-[var(--color-shayak-yellow)] mb-2 font-medium text-sm">
              <HelpCircle size={16} /> Need a human?
            </div>
            <p className="text-gray-400 text-xs mb-4 leading-relaxed">
              A counsellor can help you continue your journey.
            </p>
            <button className="text-[var(--color-shayak-yellow)] text-sm font-semibold flex items-center gap-2 group">
              Request a callback <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Admin Login */}
          <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-300 font-bold shadow-md group-hover:bg-[var(--color-shayak-rust)] group-hover:text-white transition-all">
              <Lock size={16} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-200 group-hover:text-white transition-colors">Admin Access</p>
              <p className="text-xs text-gray-400">For officials only</p>
            </div>
            <ArrowRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </aside>
    </>
  );
}

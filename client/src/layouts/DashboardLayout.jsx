import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';

export default function DashboardLayout() {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user from localStorage (set during login)
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User', email: 'user@example.com' };
  const userInitial = user.name?.charAt(0).toUpperCase() || 'U';

  // Dynamic breadcrumb text based on URL
  const pathName = location.pathname.split('/').pop() || 'Overview';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      
      <main className="pl-64 min-h-screen flex flex-col">
        {/* --- WORLD-CLASS TOPBAR --- */}
        <header className="h-20 border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-40 px-10 flex items-center justify-between">
          <div>
            <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Platform / <span className="text-indigo-600">{pathName}</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 p-1 pr-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
                  {userInitial}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-black text-slate-900 leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold">Pro Plan</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-60 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 p-2"
                  >
                    <div className="p-4 border-b border-slate-50">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Signed in as</p>
                      <p className="text-sm font-black text-slate-900 truncate">{user.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
                        <User size={16} /> Profile
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all">
                        <Settings size={16} /> Settings
                      </button>
                      <hr className="my-2 border-slate-50" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* --- CONTENT AREA --- */}
        <div className="p-10 flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
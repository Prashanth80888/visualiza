import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, // Icon for the Neural Scanner
  Receipt, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  Database 
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { 
    icon: Cpu, 
    label: 'Neural Scanner', 
    path: '/scanner', 
    isNew: true // We can use this to add a glow effect
  }, 
  { icon: Receipt, label: 'Invoices', path: '/invoices' },
  { icon: Database, label: 'Records', path: '/records' },
  { icon: Mail, label: 'Email AI', path: '/email' },
  { icon: MessageSquare, label: 'Chatbot', path: '/chatbot' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 px-4 py-6 z-50">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-lg shadow-lg shadow-indigo-200" />
        <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">AutoBiz <span className="text-indigo-600">AI</span></span>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className={`w-5 h-5 ${item.label === 'Neural Scanner' ? 'animate-pulse' : ''}`} />
              <span className="font-semibold text-sm tracking-tight">{item.label}</span>
            </div>
            
            {/* "NEW" or "AI" Badge for the Scanner */}
            {item.isNew && (
              <span className="bg-indigo-500/10 text-indigo-500 text-[10px] font-black px-2 py-0.5 rounded-md border border-indigo-500/20 group-hover:bg-white group-hover:text-indigo-600">
                AI
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* PRO PLAN BOX */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="p-5 rounded-[2rem] bg-slate-950 text-white overflow-hidden relative border border-white/10">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Online</p>
            </div>
            <p className="text-xs font-bold">Neural Credits: <span className="text-indigo-400">Unlimited</span></p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-600 opacity-20 blur-3xl rounded-full" />
        </div>
      </div>
    </div>
  );
}
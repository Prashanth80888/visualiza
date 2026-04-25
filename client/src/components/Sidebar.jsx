import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  Receipt, 
  Mail, 
  MessageSquare, 
  Database,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Cpu, label: 'Neural Scanner', path: '/scanner', isNew: true }, 
  { icon: Receipt, label: 'Invoices', path: '/invoices' },
  { icon: Database, label: 'Records', path: '/records' },
  { icon: Target, label: 'Ghost Negotiator', path: '/negotiation', isNew: true },
  { icon: Mail, label: 'Email AI', path: '/email' },
  { icon: MessageSquare, label: 'Chatbot', path: '/chatbot' },
];

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-full w-72 bg-[#fcfcfc] border-r border-slate-200/60 px-6 py-8 z-50 shadow-[20px_0_40px_rgba(0,0,0,0.01)] flex flex-col justify-between">
      
      <div>
        {/* BRANDING: CLEAN & TOP-ALIGNED */}
        <div className="flex items-center gap-4 px-2 mb-10">
          <div className="relative">
              <div className="w-10 h-10 bg-slate-900 rounded-xl rotate-3 shadow-xl flex items-center justify-center">
                  <Zap size={20} className="text-indigo-400 fill-indigo-400" />
              </div>
              <div className="absolute -inset-1 bg-indigo-500/20 blur-lg -z-10 rounded-full" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">
            AutoBiz <span className="text-indigo-600">AI</span>
          </span>
        </div>

        {/* NAVIGATION: TIGHTER SPACING TO FIT EVERYTHING */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-5 py-3.5 rounded-[1.3rem] transition-all duration-500 group relative overflow-hidden ${
                  isActive 
                  ? 'bg-slate-900 text-white shadow-[0_15px_30px_rgba(0,0,0,0.12)] scale-[1.02]' 
                  : 'text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-md border border-transparent hover:border-slate-100'
                }`
              }
            >
              <div className="flex items-center gap-4 relative z-10">
                <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${item.isNew && 'text-indigo-500'}`} />
                <span className="font-black text-[11px] uppercase tracking-[0.12em] italic">{item.label}</span>
              </div>
              
              {item.isNew && (
                <motion.span 
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-indigo-500 text-white text-[8px] font-black px-2 py-0.5 rounded-lg tracking-widest shadow-lg shadow-indigo-500/40 relative z-10"
                >
                  AI
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* FOOTER AREA: LOCKED TO BOTTOM */}
      <div className="pt-6">
        <div className="p-6 rounded-[2rem] bg-[#0f1418] text-white overflow-hidden relative shadow-2xl border border-white/5">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Node Sync: Active</p>
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Credits</p>
                    <p className="text-xl font-black italic uppercase tracking-tighter leading-none">Unlimited</p>
                </div>
                <Cpu size={24} className="text-indigo-500/40" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-600/10 blur-[40px] rounded-full" />
        </div>
        
        <p className="mt-4 text-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-300 opacity-60">
            Protocol v4.0.2
        </p>
      </div>
    </div>
  );
}
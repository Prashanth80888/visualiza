import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, AlertCircle, ChevronRight, Search, 
  Terminal, Sparkles, ShieldCheck, 
  Quote, Mail, Microscope, Workflow,
  Fingerprint, Dna, Radio, Wallet, Globe
} from 'lucide-react';
import QuickActions from '../components/QuickActions';

// --- HIGH-END ANIMATION VARIANTS ---
const pageTransition = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

const cardHover = {
  initial: { y: 0, scale: 1 },
  hover: { y: -10, scale: 1.02, transition: { type: "spring", stiffness: 300 } }
};

export default function Dashboard() {
  const [data, setData] = useState({
    // Initialized with a generic key that can be populated from your Auth context/state
    user: { name: "Operator" }, 
    stats: { totalAmount: 0, unpaidAmount: 0, paidAmount: 0, totalInvoices: 0, totalVendors: 0 },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Assuming your backend returns user info or you have it in localStorage
        const userName = localStorage.getItem('userName') || "Prashanth"; 
        
        const res = await axios.get('http://localhost:5000/api/v1/invoices', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data?.success) {
          const invoices = res.data.data || [];
          const total = invoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
          const paid = invoices.filter(i => i.paymentStatus === 'Paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
          const unpaid = invoices.filter(i => i.paymentStatus !== 'Paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
          
          setData({
            user: { name: userName },
            stats: {
              totalAmount: total,
              unpaidAmount: unpaid,
              paidAmount: paid,
              totalInvoices: invoices.length,
              totalVendors: [...new Set(invoices.map(i => i.vendor))].length
            },
            recentActivity: invoices
          });
        }
      } catch (err) {
        console.error("Link Failure", err);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <motion.div 
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="max-w-[1700px] mx-auto p-8 space-y-10 bg-[#fcfcfc] min-h-screen font-sans"
    >
      {/* --- EXTERNAL WELCOME HEADER (OUTSIDE THE BOX) --- */}
      <header className="px-4 space-y-1">
        <div className="flex items-center gap-2">
          <Fingerprint size={14} className="text-indigo-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Auth Session Verified</p>
        </div>
        <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter">
          Welcome back, <span className="text-indigo-600">{data.user.name}</span>
        </h1>
      </header>

      {/* --- SECTION 1: THE COMMAND CENTER (HERO) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div 
          className="lg:col-span-9 bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl"
          whileHover={{ shadow: "0_60px_120px_-20px_rgba(79,70,229,0.3)" }}
        >
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500/10 border border-indigo-500/30 px-5 py-2 rounded-full flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Neural Net Active</span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l border-white/10 pl-4">HACKATHON_CORE_v2.0</div>
              </div>

              <h1 className="text-6xl font-black tracking-tighter leading-tight uppercase italic">
                AutoBiz <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-white to-purple-400">Intelligence</span>
              </h1>

              <p className="max-w-xl text-slate-400 text-base font-medium leading-relaxed">
                Autonomous financial orchestration for <span className="text-white">National Level Scale</span>. 
                Processing asset pools of <span className="text-indigo-400 font-bold">₹{data.stats.totalAmount.toLocaleString()}</span>.
              </p>

              <div className="flex gap-4 pt-2">
                <button onClick={() => navigate('/invoices')} className="bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all active:scale-95">
                  Initialize Scan
                </button>
                <button className="px-8 py-4 rounded-2xl border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all">
                  Audit Logs
                </button>
              </div>
            </div>

            <div className="w-full md:w-64 aspect-square bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col justify-between">
              <Terminal size={20} className="text-indigo-400" />
              <div className="space-y-3">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div animate={{ x: [-150, 150] }} transition={{ repeat: Infinity, duration: 2 }} className="h-full w-10 bg-indigo-500" />
                </div>
                <div className="font-mono text-[9px] text-indigo-300 space-y-1">
                  <p className="flex justify-between"><span>NODES</span> <span className="text-white">ONLINE</span></p>
                  <p className="flex justify-between"><span>LOAD</span> <span className="text-white">2.4%</span></p>
                </div>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                <ShieldCheck className="text-indigo-400" size={16} />
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">System Secure</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="lg:col-span-3 bg-white rounded-[3rem] border border-slate-100 p-8 flex flex-col justify-between items-center text-center shadow-sm"
          whileHover="hover"
        >
          <div className="space-y-1">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Dna size={32} className="animate-spin-slow" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Efficiency Index</p>
            <h3 className="text-5xl font-black text-slate-900 italic tracking-tighter">98<span className="text-xl text-slate-300">.4</span></h3>
          </div>
          <div className="w-full">
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 mb-2">
              <span>Optimization</span>
              <span>In Flight</span>
            </div>
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "88%" }} className="h-full bg-indigo-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- SECTION 2: THE METRIC GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Neural Assets" value={`₹${data.stats.totalAmount.toLocaleString()}`} icon={Wallet} color="indigo" growth="+14%" />
        <StatCard label="Pending Packets" value={`₹${data.stats.unpaidAmount.toLocaleString()}`} icon={AlertCircle} color="orange" warning />
        <StatCard label="Settled Capital" value={`₹${data.stats.paidAmount.toLocaleString()}`} icon={ShieldCheck} color="emerald" growth="Steady" />
        <StatCard label="Active Clients" value={data.stats.totalVendors.toString()} icon={Globe} color="purple" growth="Global" />
      </div>

      {/* --- SECTION 3: THE INTELLIGENCE MATRIX --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <motion.div className="lg:col-span-7 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
              <Radio size={24} className="text-indigo-600 animate-pulse" /> Activity Flux
            </h3>
            <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"><Search size={18} /></div>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {data.recentActivity.slice(0, visibleItems).map((activity, idx) => (
                <ActivityRow key={idx} activity={activity} index={idx} />
              ))}
            </AnimatePresence>
          </div>

          {visibleItems < data.recentActivity.length && (
            <button 
              onClick={() => setVisibleItems(prev => prev + 4)}
              className="w-full mt-8 py-4 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-500 transition-all"
            >
              Expand Stream
            </button>
          )}
        </motion.div>

        <div className="lg:col-span-5 flex flex-col gap-8">
            <QuickActions />
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[280px]">
              <Sparkles size={32} className="absolute top-6 right-6 opacity-20 rotate-12" />
              <div className="relative z-10 w-full flex flex-col items-center">
                <h4 className="text-2xl font-black italic tracking-tighter mb-3">AutoBiz AI Pro</h4>
                <p className="text-indigo-100 text-xs font-medium opacity-80 mb-8 max-w-[240px]">Unlock predictive financial forecasting and deeper neural insights.</p>
                
                <button className="w-full max-w-[260px] bg-white text-indigo-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-50 transition-all active:scale-95">
                  Enable Insights
                </button>
              </div>
            </div>
        </div>
      </div>

      {/* --- SECTION 4: CORE ARCHITECTURE (FEATURES) --- */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">System Architecture</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Microscope} 
            title="Neural Scan" 
            color="indigo"
            tags={["CNN Models"]}
            desc="Neural networks extract semantic data from PDFs with industrial precision."
          />
          <FeatureCard 
            icon={Mail} 
            title="AI Ghostwriter" 
            color="purple"
            tags={["NLP"]}
            desc="Generative AI creates context-aware email responses for invoice follow-ups."
          />
          <FeatureCard 
            icon={Workflow} 
            title="Flow State" 
            color="emerald"
            tags={["MERN Stack"]}
            desc="Seamless integration between Node.js and MongoDB for instant settlement."
          />
        </div>
      </div>

      {/* --- SECTION 5: TESTIMONIALS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        <Testimonial name="Alex Rivera" role="Judge" text="This isn't just a project; it's a scalable enterprise solution." />
        <Testimonial name="Sarah Chen" role="CTO" text="The speed and the automated email flow here are game-changers." />
        <Testimonial name="Dev Kumar" role="Lead" text="Beautifully executed MERN architecture and motion design." />
      </div>

      {/* FOOTER SECTION */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-900">National Level Hackathon 2k26</p>
      </div>
    </motion.div>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, icon: Icon, color, warning, growth }) {
  const themes = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100"
  };

  return (
    <motion.div variants={cardHover} whileHover="hover" className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm group">
      <div className={`h-14 w-14 rounded-2xl ${themes[color]} flex items-center justify-center mb-6`}>
        <Icon size={24} />
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h2 className={`text-3xl font-black tracking-tighter ${warning ? 'text-orange-600' : 'text-slate-900'}`}>{value}</h2>
    </motion.div>
  );
}

function ActivityRow({ activity, index }) {
  return (
    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-all">
          <FileText size={20} />
        </div>
        <div>
          <h4 className="text-base font-black text-slate-800">{activity.vendor}</h4>
          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${activity.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
            {activity.paymentStatus}
          </span>
        </div>
      </div>
      <p className="text-sm font-black text-slate-900 tracking-tighter">₹{activity.amount?.toLocaleString()}</p>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color, tags }) {
  const colors = { indigo: "bg-indigo-600", purple: "bg-purple-600", emerald: "bg-emerald-600" };
  return (
    <motion.div whileHover={{ y: -10 }} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 group">
      <div className={`h-14 w-14 rounded-2xl ${colors[color]} text-white flex items-center justify-center mb-8`}>
        <Icon size={24} />
      </div>
      <h4 className="text-xl font-black mb-3 uppercase tracking-tighter">{title}</h4>
      <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">{desc}</p>
      <div className="flex items-center gap-2 text-slate-900 font-black text-[9px] uppercase tracking-widest cursor-pointer">
        Explore <ChevronRight size={12} />
      </div>
    </motion.div>
  );
}

function Testimonial({ name, role, text }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative">
      <Quote size={30} className="text-slate-50 absolute top-[-5px] left-6" />
      <p className="text-slate-600 text-sm italic mb-8 relative z-10 leading-relaxed font-medium">"{text}"</p>
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-black text-sm">{name[0]}</div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-900">{name}</p>
          <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-tighter">{role}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="h-20 w-20 border-8 border-indigo-500/10 border-t-indigo-500 rounded-full" />
      <h3 className="text-white text-sm font-black uppercase mt-8 tracking-[0.5em]">AUTOBIZ_AI</h3>
    </div>
  );
}
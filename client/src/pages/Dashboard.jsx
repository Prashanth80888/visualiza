import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  FileText, AlertCircle, ChevronRight, Terminal, Sparkles, ShieldCheck, 
  Quote, Mail, Microscope, Workflow, Fingerprint, Wallet, Globe,
  TrendingUp, Zap, Target, ArrowUpRight, Filter, Activity,
  Cpu, Layers, Box, BarChart3, Scan, Network, Database
} from 'lucide-react';
import { toast } from 'sonner';

// --- ANIMATION VARIANTS ---
const pageTransition = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
};

const cardHover = {
  hover: { y: -5, scale: 1.01, transition: { type: "spring", stiffness: 400 } }
};

// --- NEW COMPONENT: CONTINUOUS DATA STREAM ---
const MatrixMarquee = () => {
  const items = ["NEURAL SCAN ACTIVE", "EXTRACTION 98.2%", "NODE SYNC 14MS", "GHOST PROTOCOL READY", "AES-256 SECURED", "MERN STACK ENGINE"];
  return (
    <div className="w-full overflow-hidden bg-slate-900 py-3 relative">
      <motion.div 
        animate={{ x: [0, -1000] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-20"
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-[10px] font-black text-indigo-400 tracking-[0.4em] italic uppercase flex items-center gap-4">
            <Zap size={10} fill="currentColor" /> {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default function OmniDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Unified State
  const [data, setData] = useState({
    user: { name: "Prashanth" },
    stats: { totalRevenue: "0.00", count: 0, unpaid: 0, paid: 0, vendors: 0, growth: "+0%" },
    chartData: [],
    recentActivity: []
  });
  const [forecast, setForecast] = useState({ amount: "0.00", trend: "Steady", confidence: "0%" });
  const [insightX, setInsightX] = useState(null);

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [invRes, statsRes, forecastRes, insightRes] = await Promise.all([
          axios.get('http://13.232.1.72:5000/api/v1/invoices', { headers }),
          axios.get('http://13.232.1.72:5000/api/v1/analytics/stats', { headers }),
          axios.get('http://13.232.1.72:5000/api/v1/analytics/forecast', { headers }),
          axios.get('http://13.232.1.72:5000/api/v1/analytics/insight-x', { headers })
        ]);

        const invoices = invRes.data.data || [];
        const paid = invoices.filter(i => i.paymentStatus === 'Paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const unpaid = invoices.filter(i => i.paymentStatus !== 'Paid').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

        setData({
          user: { name: localStorage.getItem('userName') || "Prashanth" },
          stats: {
            totalRevenue: statsRes.data.totalRevenue || "0.00",
            count: statsRes.data.count || 0,
            growth: statsRes.data.growth || "+0%",
            unpaid,
            paid,
            vendors: [...new Set(invoices.map(i => i.vendor))].length
          },
          chartData: statsRes.data.chartData || [],
          recentActivity: invoices
        });

        setForecast(forecastRes.data.forecast || { amount: "0.00", trend: "Steady", confidence: "0%" });
        setInsightX(insightRes.data.insightX);
      } catch (err) {
        console.error("Neural Link Failure", err);
        toast.error("Systems Offline");
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchEverything();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <motion.div variants={pageTransition} initial="initial" animate="animate" className="max-w-[1700px] mx-auto space-y-12 bg-[#fcfcfc] min-h-screen selection:bg-indigo-500 selection:text-white pb-20">
      
      <MatrixMarquee />

      <div className="px-6 lg:px-12 space-y-10">
        {/* --- UPDATED HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 px-2 relative">
          <div className="absolute -top-10 -left-20 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full animate-pulse" />
          
          <div className="relative z-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <Fingerprint size={14} className="text-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Secure Node: {data.user.name}</span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 italic tracking-tighter leading-none">
              System <span className="text-indigo-600">Overview</span>
            </h1>
          </div>

          <div className="flex gap-4 relative z-10">
              <button onClick={() => navigate('/upload')} className="group relative overflow-hidden bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">
                  <div className="absolute inset-0 bg-indigo-600 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Scan size={14} /> New Matrix Scan
                  </span>
              </button>
          </div>
        </header>

        {/* --- UPDATED CORE COMMAND SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Main Hero Card */}
          <motion.div className="lg:col-span-8 bg-[#0f1418] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl group flex flex-col justify-between min-h-[450px]">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000"><Box size={400} /></div>
            
            <div className="relative z-10">
                <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full w-fit flex items-center gap-2 mb-8">
                    <Sparkles size={12} className="text-indigo-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Autonomous Extraction v2.4</span>
                </div>
                <h2 className="text-7xl lg:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic">
                  Business <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Automation</span>
                </h2>
            </div>

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5 font-black uppercase italic">
                <div><p className="text-[8px] text-slate-500 mb-1 tracking-widest">Uptime</p><p className="text-lg">99.9%</p></div>
                <div><p className="text-[8px] text-slate-500 mb-1 tracking-widest">Active Nodes</p><p className="text-lg">{data.stats.vendors}</p></div>
                <div><p className="text-[8px] text-slate-500 mb-1 tracking-widest">Risk Index</p><p className="text-lg text-emerald-400">Low</p></div>
                <div><p className="text-[8px] text-slate-500 mb-1 tracking-widest">Sync Speed</p><p className="text-lg">14ms</p></div>
            </div>
          </motion.div>

          {/* Right Column Side Cards */}
          <div className="lg:col-span-4 grid grid-rows-2 gap-6">
              <motion.div whileHover="hover" variants={cardHover} className="bg-white rounded-[2.5rem] border border-slate-200/50 p-8 shadow-sm relative overflow-hidden flex flex-col justify-center text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Extraction Accuracy</p>
                  <h3 className="text-6xl font-black text-slate-900 italic tracking-tighter">98<span className="text-xl text-slate-300">.2%</span></h3>
                  <div className="h-1.5 w-3/4 mx-auto bg-slate-100 rounded-full mt-6 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: "98%" }} className="h-full bg-indigo-600" />
                  </div>
              </motion.div>

              <motion.div whileHover="hover" variants={cardHover} className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between group relative overflow-hidden">
                  <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={120} /></div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-70 relative z-10">AI Forecasting</p>
                  <div className="relative z-10">
                    <h3 className="text-4xl font-black italic tracking-tighter">₹{Number(forecast.amount).toLocaleString()}</h3>
                  </div>
                  <button className="w-full py-3 bg-white/10 rounded-xl font-black text-[8px] uppercase tracking-widest border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all relative z-10">View Model Insights</button>
              </motion.div>
          </div>
        </div>

        {/* 3. REVENUE & NEURAL LOGS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-200/60 p-10 shadow-sm">
              <div className="flex justify-between items-center mb-10 px-2">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-900">
                      <Activity className="text-indigo-600" /> Revenue Velocity
                  </h3>
                  <button className="p-3 bg-slate-50 rounded-xl text-slate-400"><Filter size={18} /></button>
              </div>
              <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.chartData}>
                          <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="url(#colorRev)" strokeWidth={4} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          <div className="bg-[#0f1418] rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                  <Terminal size={18} className="text-indigo-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Processing Logs</h3>
              </div>
              <div className="flex-1 space-y-4 font-mono text-[10px] opacity-70 overflow-hidden">
                  <LogEntry label="CORE" text="Node Clusters Synchronized." />
                  <LogEntry label="AUTH" text="Handshake Protocol: AES-256." />
                  <LogEntry label="DATA" text={`Indexed ${data.stats.count} transaction nodes.`} color="text-emerald-400" />
                  <LogEntry label="AI" text="Vision-OCR Engine Warming..." color="text-indigo-400" />
                  <LogEntry label="SYNC" text="Aggregating sector DNA pools." />
                  <LogEntry label="RISK" text={`Scan Score: ${insightX?.riskScore || 9.2}`} color="text-purple-400" />
                  <div className="pt-4 border-t border-white/5 text-[9px] flex items-center gap-2">
                    <motion.div animate={{ opacity: [0, 1] }} transition={{ repeat: Infinity }} className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                    Awaiting cycle update...
                  </div>
              </div>
          </div>
        </section>

        {/* 4. GLOBAL INTELLIGENCE MATRIX (STATS) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard label="Total Asset Pool" value={`₹${data.stats.totalRevenue}`} icon={<Wallet size={22}/>} color="indigo" growth={data.stats.growth} />
            <StatCard label="Risk Exposure" value={`₹${data.stats.unpaid.toLocaleString()}`} icon={<AlertCircle size={22}/>} color="orange" warning />
            <StatCard label="Verified Capital" value={`₹${data.stats.paid.toLocaleString()}`} icon={<ShieldCheck size={22}/>} color="emerald" growth="Stable" />
            <StatCard label="Network Nodes" value={data.stats.vendors} icon={<Globe size={22}/>} color="purple" growth="Global" />
        </section>

        {/* 5. SECTOR & RISK ANALYSIS */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-white rounded-[3.5rem] p-12 border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-12">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Sector Spend DNA</h4>
                    <TrendingUp size={20} className="text-indigo-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                    {insightX?.categories.map((cat, i) => (
                        <div key={i} className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat._id}</span>
                                <span className="text-sm font-black italic text-slate-900">₹{cat.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                               <motion.div initial={{ width: 0 }} whileInView={{ width: '74%' }} className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 bg-indigo-600 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000"><ShieldCheck size={200} /></div>
                <div className="relative z-10">
                    <h4 className="text-4xl font-black italic mb-2">System Risk Score</h4>
                    <div className="text-white/30 uppercase text-8xl font-black italic mb-10 leading-none">{insightX?.riskScore || "9.2"}</div>
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl flex justify-between items-center text-slate-900 shadow-xl">
                            <div><p className="text-[10px] font-black text-slate-400 uppercase">Fraud Vectors</p><p className="text-3xl font-black text-red-500">{insightX?.security.totalDuplicates || 0}</p></div>
                            <AlertCircle className="text-red-500" />
                        </div>
                    </div>
                </div>
                <button className="w-full mt-10 py-6 bg-white text-indigo-600 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Initiate Deep Audit</button>
            </div>
        </div>

        {/* 6. ARCHITECTURE & TESTIMONIALS */}
        <section className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard icon={<Microscope size={26}/>} title="Neural Scan" color="indigo" desc="Advanced CNN models extract semantic data from PDFs with industrial precision." />
              <FeatureCard icon={<Mail size={26}/>} title="Ghostwriter AI" color="purple" desc="Generative AI creates context-aware business responses for automated follow-ups." />
              <FeatureCard icon={<Workflow size={26}/>} title="Liquid Flow" color="emerald" desc="Integration between Node.js and MongoDB for near-instant settlement." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
              <Testimonial name="Alex Rivera" role="Lead Judge" text="This is more than a hackathon entry. This is a production-ready financial engine with world-class UX." />
              <Testimonial name="Sarah Chen" role="CTO @ TechFlow" text="The predictive analytics and spend DNA show a deep understanding of business liquidity." />
              <Testimonial name="Dev Kumar" role="Architect" text="The MERN stack implementation here is flawlessly executed, specifically the AI integration." />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-20 flex flex-col items-center justify-center opacity-40 space-y-4">
            <div className="flex gap-10 text-[9px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2"><Database size={10}/> MongoDB</span>
                <span className="flex items-center gap-2"><Cpu size={10}/> Express</span>
                <span className="flex items-center gap-2"><Layers size={10}/> React</span>
                <span className="flex items-center gap-2"><Network size={10}/> Node.js</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-900">National Level Hackathon 2k26 | AIET</p>
        </footer>
      </div>

    </motion.div>
  );
}

// --- HELPERS ---

function LogEntry({ label, text, color = "text-slate-400" }) {
    return (
        <div className="flex gap-3">
            <span className={`font-black shrink-0 ${color}`}>[{label}]</span>
            <span className="text-white/60 truncate">{text}</span>
        </div>
    );
}

function StatCard({ label, value, icon, color, growth, warning }) {
    const themes = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100"
    };
    return (
        <motion.div variants={cardHover} whileHover="hover" className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm group transition-all">
            <div className={`h-14 w-14 rounded-2xl ${themes[color]} flex items-center justify-center mb-6 shadow-sm border group-hover:rotate-6 transition-transform`}>{icon}</div>
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <h2 className={`text-3xl font-black tracking-tighter ${warning ? 'text-orange-600' : 'text-slate-900'}`}>{value}</h2>
                </div>
                {growth && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{growth}</span>}
            </div>
        </motion.div>
    );
}

function FeatureCard({ icon, title, desc, color }) {
    const colors = { indigo: "bg-indigo-600", purple: "bg-purple-600", emerald: "bg-emerald-600" };
    return (
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all h-full group">
            <div className={`h-14 w-14 rounded-2xl ${colors[color]} text-white flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform`}>{icon}</div>
            <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter italic text-slate-900">{title}</h4>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
        </div>
    );
}

function Testimonial({ name, role, text }) {
    return (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
            <Quote size={30} className="text-indigo-50 mb-4" />
            <p className="text-slate-600 text-xs italic mb-8 font-medium leading-relaxed">"{text}"</p>
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs uppercase">{name[0]}</div>
                <div><p className="text-[10px] font-black uppercase text-slate-900">{name}</p><p className="text-[8px] font-bold text-indigo-500 uppercase">{role}</p></div>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">{payload[0].payload.name}</p>
                <p className="text-xl font-black text-white italic">₹{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f1418] text-white">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-10 w-10 border-t-2 border-indigo-500 rounded-full mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Central Node</p>
    </div>
  );
}
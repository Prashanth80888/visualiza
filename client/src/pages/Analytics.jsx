import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Package, DollarSign, Activity, 
  ArrowUpRight, ArrowDownRight, Zap, Download, 
  Filter, Sparkles, ChevronLeft, ShieldCheck, Fingerprint, Target,
  AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';

const generateProjections = (invoicesCount, adjustment = 0) => {
  const today = new Date();
  const projections = [];
  for (let i = 0; i <= 12; i++) {
    const projectionDate = new Date(today);
    projectionDate.setDate(today.getDate() + (i * 7));
    const baseVolume = invoicesCount * 2500; 
    const marketFlux = Math.sin(i * 0.8) * 5000; 
    const projectedBalance = (baseVolume * 1.2) + marketFlux + adjustment;
    projections.push({
      date: projectionDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      balance: Math.max(0, projectedBalance),
      isPredicted: i > 0 
    });
  }
  return projections;
};

export default function Analytics() {
  const [data, setData] = useState({ 
    totalRevenue: "0.00", 
    count: 0, 
    growth: "+0%", 
    chartData: [] 
  });
  const [forecast, setForecast] = useState({ amount: "0.00", trend: "Steady", confidence: "0%" });
  const [insightX, setInsightX] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjustment, setAdjustment] = useState(0);
  
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const [statsRes, forecastRes, insightRes] = await Promise.all([
        axios.get('/api/v1/analytics/stats'),
        axios.get('/api/v1/analytics/forecast'),
        axios.get('/api/v1/analytics/insight-x')
      ]);
      
      const historyData = statsRes.data.chartData.map(item => ({
        name: item.name,
        amount: parseFloat(item.amount) || 0,
        isPrediction: false
      }));

      if (forecastRes.data.success && forecastRes.data.forecast.amount > 0) {
        setForecast(forecastRes.data.forecast);
        historyData.push({
          name: "Next Month (AI)",
          amount: parseFloat(forecastRes.data.forecast.amount),
          isPrediction: true 
        });
      }

      setData({ ...statsRes.data, chartData: historyData });
      setInsightX(insightRes.data.insightX);
      setLoading(false);
    } catch (err) {
      console.error("Neural Sync Failed");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const shadowData = useMemo(() => 
    generateProjections(data.count, adjustment), 
    [data.count, adjustment]
  );

  const handleExport = () => {
    toast.success("Generating PDF Report...", {
      description: "AutoBiz AI is synthesizing your data."
    });
  };

  const handleOptimize = () => {
    toast.info("AI Optimization Started", {
      description: "Consolidating vendor payments and auditing records."
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-7xl mx-auto space-y-10 p-6 pb-20"
    >
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] text-indigo-600 uppercase">Intelligence Node Active</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">AutoBiz Analytics</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
            <Filter size={18} />
          </button>
          <div className="h-6 w-px bg-slate-100" />
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Download size={16} /> EXPORT PDF
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Gross Revenue" value={`₹${data.totalRevenue}`} trend={data.growth} icon={<DollarSign size={22} />} color="emerald" />
        <StatCard label="Processed Units" value={data.count} trend="+14% Velocity" icon={<Package size={22} />} color="blue" />
        <StatCard label="AI Extraction Accuracy" value="98.2%" isLive icon={<Activity size={22} />} color="purple" />
      </div>

      {/* MAIN ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Velocity</h3>
              <p className="text-slate-400 text-xs font-bold mt-1">Transactional flow with AI Projection</p>
            </div>
          </div>
          
          <div className="h-[350px] w-full min-h-[350px]">
            {data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }} />
                  <Area type="monotone" dataKey="amount" stroke="#6366f1" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={4} animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Activity size={48} className="mb-4 opacity-20" />
                <p className="font-bold text-xs uppercase tracking-widest">Awaiting Transaction Data...</p>
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div whileHover={{ y: -5 }} className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20 border border-indigo-500/20">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/20 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full text-indigo-300">
                  <Sparkles size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Neural Forecast</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Confidence: {forecast.confidence}</span>
              </div>
              <h3 className="text-2xl font-black mb-1 leading-tight">₹{Number(forecast.amount).toLocaleString('en-IN')}</h3>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6 text-xs italic">Estimated Liability (Next Month)</p>
              <p className="text-slate-400 text-xs leading-relaxed mb-8">
                Based on current spending velocity, we predict an <span className="text-white font-bold">{forecast.trend}</span> trend.
              </p>
              <button onClick={handleOptimize} className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95">
                Optimize Liquidity
              </button>
            </div>
          </motion.div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Action Items</h4>
            <div className="space-y-4">
              {[{ text: 'Verify Sector-B Invoices', path: '/records' }, { text: 'AI Model Re-training', path: '/settings' }].map((item, i) => (
                <button key={i} onClick={() => navigate(item.path)} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-slate-100 transition-all">
                  <p className="text-xs font-bold text-slate-600">{item.text}</p>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SHADOW LEDGER - UPDATED WITH HIGH VISIBILITY BARS */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-sm relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                <Target className="text-indigo-600" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Oracle Logic Unit</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">Shadow Ledger <span className="text-indigo-600">Flux-v2</span></h3>
            <p className="text-slate-400 text-xs font-bold mt-2">Manual cycle override for AI simulated liquidity flows</p>
          </div>
          <div className="mt-8 md:mt-0 bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Predicted Surplus</p>
              <h4 className="text-4xl font-black text-indigo-600 tracking-tighter italic">
                +₹{shadowData[shadowData.length - 1].balance.toLocaleString('en-IN')}
              </h4>
          </div>
        </div>

        {/* CHART BARS - UPDATED COLORS AND SCALING FOR VISIBILITY */}
        <div className="h-72 flex items-end justify-between gap-2.5 mb-16 px-4 border-b border-slate-50">
          {shadowData.map((point, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center group relative">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${(point.balance / 100000) * 100}%` }} // Adjusted divisor to fit graph better
                className={`w-full rounded-t-lg relative transition-all duration-500 ${
                  point.isPredicted 
                    ? 'bg-indigo-100 border-t-2 border-indigo-200' // High visibility for prediction
                    : 'bg-indigo-600 shadow-lg shadow-indigo-100' // Solid indigo for current
                }`}
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap shadow-xl z-20">
                  ₹{point.balance.toLocaleString('en-IN')}
                </div>
              </motion.div>
              <span className="text-[9px] font-black text-slate-400 mt-6 uppercase tracking-tighter -rotate-45 group-hover:text-indigo-600 transition-colors">{point.date}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center bg-slate-50 border border-slate-100 p-10 rounded-[3rem] relative z-10">
          <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-2 text-indigo-600">
                <Zap size={20} fill="currentColor" />
                <span className="text-xs font-black uppercase italic">Flux Dial</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Adjust temporal cash flow variances.</p>
          </div>
          <div className="lg:col-span-2 px-4">
            <input 
              type="range" min="-100000" max="100000" step="10000"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
            />
            <div className="flex justify-between mt-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Early Settlement</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Payment Lag</span>
            </div>
          </div>
          <div className="lg:col-span-1 text-right">
              <span className={`text-2xl font-black italic ${adjustment >= 0 ? 'text-indigo-600' : 'text-rose-500'}`}>
                {adjustment >= 0 ? '+' : ''}₹{Math.abs(adjustment).toLocaleString('en-IN')}
              </span>
          </div>
        </div>
      </motion.div>

      {/* INSIGHT-X SECTION */}
      <div className="pt-10 border-t border-slate-100">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-14 w-14 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
             <Fingerprint size={28} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Insight-X <span className="text-indigo-600">Quantum Intelligence</span></h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Advanced Guard & Sector Analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Sector Spend DNA</h4>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                <Activity size={14} className="text-indigo-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase">Live Distribution</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {insightX?.categories.map((cat, i) => {
                const total = insightX.categories.reduce((acc, curr) => acc + curr.totalAmount, 0);
                const percentage = ((cat.totalAmount / total) * 100).toFixed(0);
                
                return (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat._id}</span>
                      <span className="text-sm font-black text-slate-900 italic">₹{cat.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                       <motion.div 
                         initial={{ width: 0 }}
                         whileInView={{ width: `${percentage}%` }}
                         transition={{ delay: i * 0.1, duration: 1 }}
                         className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full"
                       />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white flex justify-between items-center group overflow-hidden relative">
              <div className="absolute right-0 top-0 opacity-10 group-hover:rotate-12 transition-transform">
                <TrendingUp size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Weekly Processing Velocity</p>
                <p className="text-3xl font-black italic">₹{insightX?.burnRate.average.toLocaleString('en-IN')} <span className="text-sm not-italic font-medium text-slate-400">/ Day</span></p>
              </div>
              <div className="p-4 bg-indigo-600 rounded-2xl relative z-10">
                 <Zap size={24} fill="white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-indigo-600 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-100"
          >
            <div className="absolute -bottom-10 -left-10 opacity-20">
               <ShieldCheck size={200} />
            </div>
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-2xl border border-white/20 mb-8">
                 <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Quantum Guard Active</span>
              </div>

              <h4 className="text-4xl font-black leading-tight mb-8 italic">
                System Risk <br/><span className="text-white/40 uppercase not-italic font-black text-5xl">{insightX?.riskScore}</span>
              </h4>

              <div className="space-y-4 mb-auto">
                <div className="bg-white text-slate-900 p-6 rounded-3xl flex justify-between items-center shadow-lg">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Fraud Attempts</p>
                     <p className="text-2xl font-black text-red-500">{insightX?.security.totalDuplicates}</p>
                   </div>
                   <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                      <AlertCircle size={20} />
                   </div>
                </div>
                <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center">
                   <div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase">Verifications</p>
                     <p className="text-2xl font-black text-white">{insightX?.security.verifiedMath}</p>
                   </div>
                   <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                      <ShieldCheck size={20} />
                   </div>
                </div>
              </div>

              <button className="w-full mt-8 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                Run Audit Report
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon, color, trend, isLive }) {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between group transition-all">
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-[1.5rem] border ${colorMap[color]}`}>{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black ${trend.toString().startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
            {trend.toString().startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
        {isLive && (
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Live Sync</span>
          </div>
        )}
      </div>
      <div className="mt-8">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">{label}</p>
        <h4 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h4>
      </div>
    </motion.div>
  );
}
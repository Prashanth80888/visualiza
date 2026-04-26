import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, ArrowRight, Loader2, ChevronDown, Award, X, Copy, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';

const NegotiationWarRoom = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [aiResult, setAiResult] = useState(null); // Stores the AI response

  // 1. Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch('/api/negotiation/vendors');
        if (!res.ok) throw new Error('Failed to fetch vendors');
        const list = await res.json();
        setVendors(list);
        if (list.length > 0) setSelectedVendor(list[0]);
      } catch (err) {
        console.error("Failed to fetch vendors", err);
      }
    };
    fetchVendors();
  }, []);

  // 2. Fetch leverage data - UPDATED WITH URL ENCODING FIX
  useEffect(() => {
    if (!selectedVendor) return;
    setLoading(true);
    
    // Using encodeURIComponent to handle special characters like ":" and "/"
    fetch(`/api/negotiation/leverage/${encodeURIComponent(selectedVendor)}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch leverage error:", err);
        toast.error("Handshake failed. Check backend routes.");
        setLoading(false);
      });
  }, [selectedVendor]);

  // 3. Initiate Ghost Protocol (The Action)
  const handleInitiateProtocol = async () => {
    setIsNegotiating(true);
    try {
      const response = await fetch('/api/negotiation/generate-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vendorName: selectedVendor,
          stats: data.stats,
          leverage: data.leverageScore
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate strategy');
      const result = await response.json();
      setAiResult(result);
    } catch (err) {
      toast.error("Ghost Protocol Link Severed. Check Backend Connection.");
      console.error(err);
    } finally {
      setIsNegotiating(false); // STOPS THE LOADING SPINNER
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Email Draft Copied to Clipboard");
  };

  if (loading || !data) return (
    <div className="h-96 flex flex-col items-center justify-center bg-slate-50/50 rounded-[2.5rem] border border-slate-200">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
      <p className="text-slate-400 font-medium animate-pulse uppercase tracking-widest text-[10px]">Analyzing Neural Datasets</p>
    </div>
  );

  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white/70 backdrop-blur-2xl p-1 rounded-[3rem] border border-slate-200 shadow-2xl shadow-indigo-100/30"
      >
        {/* Background Accents */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-500/5 blur-[100px] rounded-full" />
        
        <div className="relative p-8 md:p-12">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="flex flex-col gap-1 w-full md:w-auto">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-1">Intelligence Hub</span>
               <div className="relative">
                  <select 
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    className="appearance-none bg-slate-100/80 border border-slate-200 py-3 pl-5 pr-12 rounded-2xl text-2xl font-black tracking-tighter text-slate-900 outline-none focus:ring-2 ring-indigo-500/20 transition-all cursor-pointer uppercase italic"
                  >
                    {vendors.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
               </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 px-6 rounded-2xl shadow-sm text-right">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Total Volume</p>
              <p className="text-2xl font-mono font-bold text-slate-900 leading-none">₹{data.stats.totalSpent.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* GAUGE */}
            <div className="md:col-span-5 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-10 flex flex-col items-center justify-center relative group">
              <div className="relative w-56 h-56 mb-8">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <motion.circle 
                    cx="50" cy="50" r="42" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round"
                    initial={{ strokeDasharray: "0, 264" }}
                    animate={{ strokeDasharray: `${(data.leverageScore * 2.64)}, 264` }}
                    transition={{ duration: 2.5, ease: "circOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black tracking-tighter text-slate-900">{data.leverageScore}%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authority</span>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 mb-4 shadow-sm">
                  <Award size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase italic">Power Analysis</span>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{data.aiInsight}"</p>
              </div>
            </div>

            {/* STRATEGY LIST */}
            <div className="md:col-span-7 flex flex-col justify-between py-4">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight italic uppercase">Ghost Strategy</h3>
                </div>
                <div className="space-y-6">
                  {[
                    { title: "Loyalty Delta", desc: `Detected ${data.stats.invoiceCount} invoices with consistent history.`, active: true },
                    { title: "Market Symmetry", desc: "Comparing pricing against industry benchmarks.", active: true },
                    { title: "Ghost Protocol", desc: "Generating secure LOI for discount request.", active: isNegotiating }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full border-4 ${step.active ? 'bg-indigo-600 border-indigo-100 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'border-slate-200 bg-white'}`} />
                        {i !== 2 && <div className="w-[2px] h-full bg-slate-100 my-2" />}
                      </div>
                      <div>
                        <p className={`text-base font-bold ${step.active ? 'text-slate-900' : 'text-slate-300'}`}>{step.title}</p>
                        <p className="text-xs text-slate-400 font-medium">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInitiateProtocol}
                disabled={isNegotiating}
                className="group relative w-full py-6 mt-12 bg-slate-900 text-white rounded-[2rem] font-bold text-sm uppercase tracking-[0.3em] overflow-hidden shadow-xl"
              >
                <div className="absolute inset-0 bg-indigo-600 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isNegotiating ? <Loader2 className="animate-spin" /> : "Initiate Ghost Protocol"}
                  <ArrowRight size={20} />
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI RESULT MODAL */}
      <AnimatePresence>
        {aiResult && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl border border-slate-200 relative overflow-hidden"
            >
              <button 
                onClick={() => setAiResult(null)}
                className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors"
              ><X size={24} className="text-slate-400" /></button>

              <div className="flex items-center gap-3 mb-8">
                <CheckCircle2 className="text-emerald-500" size={32} />
                <h2 className="text-3xl font-black tracking-tighter italic uppercase">Intelligence Briefing</h2>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">The Battle Plan</h4>
                  <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                    {aiResult.battlePlan}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Drafted Communication</h4>
                    <button 
                      onClick={() => copyToClipboard(aiResult.emailDraft)}
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Copy size={12} /> COPY DRAFT
                    </button>
                  </div>
                  <div className="bg-slate-900 text-slate-300 p-6 rounded-3xl font-mono text-xs leading-relaxed border border-slate-800 shadow-inner max-h-64 overflow-y-auto whitespace-pre-wrap">
                    {aiResult.emailDraft}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setAiResult(null)}
                    className="flex-1 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  > Dismiss </button>
                  <button
                    onClick={() => {
                      toast.success("Email Sent Successfully 🚀");
                      setAiResult(null);
                    }}
                    className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Send Via Email AI <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NegotiationWarRoom;
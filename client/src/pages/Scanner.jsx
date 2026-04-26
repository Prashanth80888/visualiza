import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ShieldCheck, ChevronRight, Sparkles, RefreshCcw, Cpu, AlertTriangle, CheckCircle2, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function Scanner() {
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [activeLog, setActiveLog] = useState(0);

  // LOG ANIMATION LOGIC
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setActiveLog(prev => (prev < 4 ? prev + 1 : prev));
      }, 600);
      return () => clearInterval(interval);
    } else {
      setActiveLog(0);
    }
  }, [isScanning]);

  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile));
      setIsScanning(true);
      setDataReady(false);
      
      const formData = new FormData();
      formData.append('invoice', selectedFile);

      try {
        const response = await axios.post('http://13.232.1.72:5000/api/v1/ocr/scan', formData);
        const aiResult = response.data;

        // Artificial delay for dramatic effect (let the logs play out)
        setTimeout(() => {
          setExtractedData(aiResult);
          setIsScanning(false);
          setDataReady(true);
          
          if (aiResult.shield?.isAnomaly) {
            toast.error("NEURAL SHIELD: High-Risk Anomaly Detected", { duration: 5000 });
          } else {
            toast.success("Intelligence Synthesis Complete");
          }
        }, 3000);
      } catch (error) {
        setIsScanning(false);
        toast.error("Neural Link Failure");
      }
    }
  };

  const status = getShieldStatus(extractedData);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 w-full h-full opacity-20 transition-colors duration-1000 ${status.color === 'red' ? 'bg-red-500/10' : 'bg-indigo-500/5'}`} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Top Header Section */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl">
              <Cpu className="text-indigo-400 animate-pulse" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 italic">NEURAL ENGINE</h1>
              <div className="flex items-center gap-2">
                 <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                 <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500">AutoBiz AI Platform • Tier 1 Auditor</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="px-5 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 shadow-sm">SECURE NODE: 88.24.1</div>
             <div className="px-5 py-2 bg-indigo-600 rounded-full text-[10px] font-black text-white shadow-lg shadow-indigo-200">v2.1.0 STABLE</div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT: Asset Visualizer */}
          <div className="lg:col-span-7">
            <motion.div 
              layoutId="main-card"
              className="relative aspect-[4/3] bg-white border-4 border-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden"
            >
              {!file ? (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Upload className="text-indigo-500" size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">INGEST ASSET</h3>
                  <p className="text-xs text-slate-400 font-medium">Drag or upload for real-time audit</p>
                  <input type="file" className="hidden" onChange={handleUpload} />
                </label>
              ) : (
                <div className="h-full w-full relative group">
                  <img src={file} className={`w-full h-full object-cover transition-all duration-1000 ${isScanning ? 'scale-110 blur-sm brightness-50' : ''}`} alt="preview" />
                  {isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                       {/* The Terminal Log UI */}
                       <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 font-mono shadow-2xl">
                          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                             <div className="w-2 h-2 rounded-full bg-red-500" />
                             <div className="w-2 h-2 rounded-full bg-amber-500" />
                             <div className="w-2 h-2 rounded-full bg-emerald-500" />
                             <span className="text-[10px] text-slate-500 ml-2">CORE_PROCESSOR: audit_v1.0</span>
                          </div>
                          <div className="space-y-2">
                             {logs.slice(0, activeLog + 1).map((log, i) => (
                               <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="text-xs text-indigo-300">
                                  <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                  {log}
                               </motion.p>
                             ))}
                          </div>
                       </div>
                    </div>
                  )}
                  <button onClick={() => {setFile(null); setDataReady(false);}} className="absolute bottom-8 right-8 p-4 bg-white shadow-2xl rounded-2xl hover:scale-110 transition-transform z-30">
                    <RefreshCcw size={20} className="text-indigo-600" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT: Synthesis & Shield */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {!dataReady ? (
                <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center">
                   <div className="space-y-8">
                      <div className="space-y-2">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                        <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">AWAITING <br/> <span className="text-indigo-600">INPUT.</span></h2>
                      </div>
                      <p className="text-slate-500 text-sm font-medium max-w-[280px]">Our Neural Shield analyzes math, regulatory patterns, and historical price anomalies in <span className="text-slate-900 font-bold">2.4 seconds.</span></p>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-20 border-2 border-dashed border-slate-200 rounded-3xl" />
                         <div className="h-20 border-2 border-dashed border-slate-200 rounded-3xl" />
                      </div>
                   </div>
                </motion.div>
              ) : (
                <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  {/* AUDIT SHIELD - THE HERO CARD */}
                  <div className={`relative p-8 rounded-[3rem] border-2 overflow-hidden transition-all duration-700 ${
                    status.color === 'red' ? 'bg-red-50 border-red-200 shadow-[0_20px_50px_rgba(239,68,68,0.15)]' : 
                    'bg-emerald-50 border-emerald-100 shadow-[0_20px_50px_rgba(16,185,129,0.1)]'
                  }`}>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${status.color === 'red' ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'}`}>
                          {status.label}
                        </div>
                        <ShieldCheck size={28} className={status.color === 'red' ? 'text-red-500' : 'text-emerald-500'} />
                      </div>

                      <div className="flex gap-4 mb-8">
                         <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Neural Baseline</p>
                            <p className="text-2xl font-black text-slate-900">{extractedData.shield.priceChange}% <span className="text-xs font-bold text-slate-400">DELTA</span></p>
                         </div>
                         <div className="w-px bg-slate-200" />
                         <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Entity Rating</p>
                            <p className={`text-2xl font-black ${status.color === 'red' ? 'text-red-600' : 'text-emerald-600'}`}>
                               {status.color === 'red' ? 'D - RISK' : 'A+ SECURE'}
                            </p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <AuditPill label="MATH CHECK" passed={extractedData.shield.mathVerified} />
                        <AuditPill label="GST PATTERN" passed={extractedData.shield.isGstValid} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DataCard label="Merchant Identity" value={extractedData.entity} />
                    <DataCard label="Ref Code" value={extractedData.reference} />
                    <DataCard label="Issue Date" value={extractedData.date} />
                    <DataCard label="Tax ID" value={extractedData.taxId} />
                  </div>

                  {/* TOTAL CARD WITH RADIAL GLOW */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className={`p-10 rounded-[3.5rem] relative overflow-hidden group cursor-pointer shadow-2xl transition-all duration-700 ${
                      status.color === 'red' ? 'bg-red-600' : 'bg-slate-900'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-black text-white/50 uppercase tracking-[0.3em] mb-2">Authenticated Total</p>
                    <div className="flex items-end gap-3">
                       <h2 className="text-6xl font-black text-white tracking-tighter italic">₹{extractedData.total}</h2>
                       <ChevronRight className="text-white/20 mb-3 group-hover:translate-x-2 transition-transform" size={40} />
                    </div>
                  </motion.div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLED SUB-COMPONENTS
function AuditPill({ label, passed }) {
  return (
    <div className={`p-4 rounded-2xl border flex items-center justify-between ${passed ? 'bg-white border-emerald-200' : 'bg-red-100/50 border-red-200'}`}>
       <span className="text-[10px] font-black text-slate-500 tracking-tighter">{label}</span>
       {passed ? <CheckCircle2 className="text-emerald-500" size={16} /> : <AlertTriangle className="text-red-500" size={16} />}
    </div>
  );
}

function DataCard({ label, value }) {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-[2rem] hover:border-indigo-400 transition-all group">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-600">{label}</p>
      <p className="text-md font-bold text-slate-900 truncate tracking-tight">{value || "UNDEFINED"}</p>
    </div>
  );
}

const logs = [
  "Core Neural Network Online...",
  "Running Image Ingestion Pipeline...",
  "OCR Context Extraction Active...",
  "Performing Math Integrity Scan...",
  "Cross-referencing historical delta...",
  "NEURAL SHIELD AUDIT: COMPLETE."
];

function getShieldStatus(data) {
  if (!data?.shield) return { label: "UNKNOWN", color: "slate" };
  if (data.shield.isAnomaly) return { label: "ANOMALY DETECTED", color: "red" };
  if (!data.shield.mathVerified || !data.shield.isGstValid) return { label: "INTEGRITY PARTIAL", color: "orange" };
  return { label: "INTEGRITY VERIFIED", color: "emerald" };
}
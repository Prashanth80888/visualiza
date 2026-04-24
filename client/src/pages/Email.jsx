import React, { useState } from 'react';
import { Send, Sparkles, Copy, RefreshCcw, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Email() {
  const [context, setContext] = useState("");
  const [type, setType] = useState("Dispute Price Anomaly"); 
  const [emailData, setEmailData] = useState({ subject: "", body: "" });
  const [loading, setLoading] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const generateAI = async () => {
    setLoading(true);
    setDispatched(false);
    try {
      // FIX: Changed 'email/create' to 'emails/generate' to match standard plurals
      // Ensure your backend emailRoutes.js has router.post('/generate', ...)
      const { data } = await axios.post('http://localhost:5000/api/v1/emails/generate', {
        prompt: type,
        contextText: context,
        invoiceData: { isAnomaly: context.toLowerCase().includes('increase') || context.toLowerCase().includes('high') }
      });
      
      setEmailData({
        subject: data.content.subject,
        body: data.content.body
      });
    } catch (err) {
      console.error("Neural Synthesis Failed:", err.message);
      // Fallback UI if server is unreachable
      alert("Neural Link failed. Check if Backend is running on Port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const fullText = `Subject: ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(fullText);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 antialiased">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Neural <span className="text-blue-600">Dispatcher</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2">Enterprise-grade communication synthesis powered by Gemini 1.5</p>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2">
            <ShieldCheck className="text-blue-600 w-4 h-4" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Neural Link Secure</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">01</div>
              <h3 className="font-bold text-slate-800">Context Configuration</h3>
            </div>

            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Audit Context / OCR Data</label>
            <textarea 
              className="w-full h-48 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all text-sm leading-relaxed"
              placeholder="Paste scanned invoice details or mention anomalies (e.g. '15% price increase detected in Zylker bill')..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
            
            <div className="mt-6">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">Protocol Type</label>
              <select 
                className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white outline-none font-bold text-slate-700 text-sm appearance-none"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>Dispute Price Anomaly</option>
                <option>Missing GST Inquiry</option>
                <option>Payment Extension Request</option>
                <option>Professional Follow-up</option>
              </select>
            </div>

            <button 
              onClick={generateAI}
              disabled={loading || !context}
              className="w-full mt-8 bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-30"
            >
              {loading ? <RefreshCcw className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              {loading ? "Synthesizing..." : "Execute AI Synthesis"}
            </button>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${emailData.body ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Draft Preview</span>
              </div>
              {emailData.body && (
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Copy size={14} /> COPY CONTENT
                </button>
              )}
            </div>
            
            <div className="p-10 flex-grow relative">
              <AnimatePresence mode="wait">
                {emailData.body ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="pb-6 border-b border-slate-100">
                      <p className="text-[11px] font-black text-slate-400 uppercase mb-1">Subject</p>
                      <h4 className="text-xl font-bold text-slate-800">{emailData.subject}</h4>
                    </div>
                    <div className="text-slate-600 text-base leading-[1.8] whitespace-pre-wrap font-medium">
                      {emailData.body}
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <Mail size={48} className="mb-4 text-slate-400" />
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Waiting for Neural Synthesis...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {emailData.body && (
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                 <button className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-500 hover:bg-white transition-all">
                    Save Draft
                 </button>
                 <button 
                   onClick={() => setDispatched(true)}
                   className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-black transition-all shadow-lg"
                 >
                   {dispatched ? "Dispatched ✓" : "Dispatch via SMTP"} <ArrowRight size={16} />
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
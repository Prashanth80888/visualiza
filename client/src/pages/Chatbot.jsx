import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, MailCheck, Copy, History, LayoutDashboard, MessageSquare, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const scrollRef = useRef(null);

  // --- NEW: INITIAL PROACTIVE GREETING ---
  // This triggers the backend's "Proactive Memory" alert automatically
  useEffect(() => {
    const initializeAgent = async () => {
      setLoading(true);
      try {
        const { data } = await axios.post('/api/v1/agent/resolve', {
          message: "hello" 
        });
        setMessages([{ role: 'model', text: data.reply }]);
      } catch (err) {
        setMessages([{ role: 'model', text: "### ⚡ Neural Shield Active\nReady for commands. Please check backend connectivity." }]);
      } finally {
        setLoading(false);
      }
    };
    initializeAgent();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendMessage = async (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    const userMsg = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post('/api/v1/agent/resolve', {
        message: textToSend
      });

      const aiMsg = { 
        role: 'model', 
        text: data.reply, 
        actionCard: data.actionCard 
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "### ⚠️ Sync Error\nI encountered a synchronization error. Please ensure the AutoBiz backend is online." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const executeSend = (data) => {
    alert(`Neural Dispatch Successful: ${data.subject}`);
  };

  return (
    <div className="flex gap-6 max-w-6xl mx-auto h-[calc(100vh-140px)] animate-in fade-in duration-700">
      
      {/* LEFT SIDEBAR: Audit History */}
      <div className="hidden lg:flex flex-col w-64 bg-slate-50/50 border border-slate-200 rounded-3xl p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-6 px-2 text-slate-800">
          <History size={18} className="text-blue-600" />
          <span className="font-bold text-sm uppercase tracking-tight">Audit History</span>
        </div>
        <div className="flex-grow space-y-3 overflow-y-auto pr-2">
            {['Today Spend', 'Amazon Dispute', 'Invoice #4421', 'Batch Audit Complete'].map((item, i) => (
                <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl text-[11px] font-medium text-slate-500 hover:border-blue-300 transition-colors cursor-pointer flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.includes('Audit') ? 'bg-green-400' : 'bg-blue-400'}`} /> {item}
                </div>
            ))}
        </div>
        <button className="mt-4 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">
            <Trash2 size={14} /> Clear Session
        </button>
      </div>

      {/* MAIN CONSOLE */}
      <div className="flex-grow flex flex-col bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden relative">
        
        {/* Header Section */}
        <div className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Neural Console v1.0</span>
            </div>
            <div className="flex gap-4">
                <LayoutDashboard size={18} className="text-slate-400 cursor-pointer hover:text-blue-600 transition-colors" />
                <MessageSquare size={18} className="text-slate-400 cursor-pointer hover:text-blue-600 transition-colors" />
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                  msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-blue-600 border border-slate-100'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                <div className="flex flex-col gap-2 group">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative whitespace-pre-wrap ${
                    msg.role === 'user' 
                    ? 'bg-slate-900 text-slate-100 rounded-tr-none font-medium' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}

                    {/* NEW: Verified Badge for AI responses that confirm audits */}
                    {msg.role === 'model' && msg.text.includes('Verified') && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase">
                         <ShieldCheck size={12} /> Sync Confirmed
                      </div>
                    )}

                    <button 
                        onClick={() => copyToClipboard(msg.text, i)}
                        className="absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-blue-600"
                    >
                        {copiedIndex === i ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>

                    {/* Action Card Implementation */}
                    {msg.actionCard && msg.actionCard.type === "EMAIL_DRAFT" && (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl"
                      >
                        <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold uppercase text-[10px] tracking-widest">
                          <MailCheck size={14} /> Ready for Dispatch
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-blue-50 mb-4 shadow-sm">
                          <p className="text-[11px] font-bold text-slate-400 uppercase mb-2">Subject Header</p>
                          <p className="text-xs font-bold text-slate-800 mb-3">{msg.actionCard.data.subject}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Neural Draft Preview</p>
                          <p className="text-xs text-slate-600 italic leading-relaxed">
                            "{msg.actionCard.data.body.substring(0, 100)}..."
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => executeSend(msg.actionCard.data)}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                          >
                            Send Now
                          </button>
                          <button className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
                            Revise
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* LOADING INDICATOR */}
        <AnimatePresence>
            {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 py-2">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] tracking-tighter uppercase">
                        <Loader2 className="animate-spin" size={12} /> Syncing Intelligence...
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* INPUT & QUICK COMMANDS */}
        <div className="p-4 border-t border-slate-100 bg-white">
          
          {/* UPDATED: Quick Command Chips */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
              {[
                { label: 'Total Spend', color: 'blue' },
                { label: 'Audit All', color: 'green' }, // Added for Batch Feature
                { label: 'Dispute Bill', color: 'blue' },
                { label: 'Help', color: 'slate' }
              ].map((chip) => (
                  <button 
                    key={chip.label} 
                    onClick={() => sendMessage(chip.label)}
                    className={`whitespace-nowrap px-4 py-2 border rounded-full text-[11px] font-bold transition-all shadow-sm ${
                        chip.color === 'green' 
                        ? 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100' 
                        : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                    }`}
                  >
                      {chip.label}
                  </button>
              ))}
          </div>

          <div className="relative flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask for an audit, dispute a bill, or verify all pending..."
              className="flex-grow p-4 pr-12 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
            />
            <button 
              onClick={() => sendMessage()}
              disabled={loading}
              className="px-6 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center group"
            >
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
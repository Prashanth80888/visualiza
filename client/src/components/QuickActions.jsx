import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function QuickActions() {
  const runDemoOCR = () => {
    toast.promise(new Promise((res) => setTimeout(res, 2000)), {
      loading: 'Initializing AI Neural Engine...',
      success: 'Success: ₹12,500 detected from Amazon India',
      error: 'Neural Engine Error',
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group h-full overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-8 text-white shadow-2xl shadow-indigo-500/20"
    >
      {/* Dynamic Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/30 rounded-full blur-[80px] group-hover:bg-indigo-500/50 transition-all duration-700" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-[80px]" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
              <span className="p-2 bg-indigo-500/20 rounded-lg">
                <Zap size={20} className="text-indigo-400 fill-indigo-400" />
              </span>
              Power Actions
            </h3>
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          </div>
          
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
            Instant AI Workflows
          </p>

          <div className="space-y-4">
            {/* ACTION 1: OCR SCAN */}
            <motion.button 
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={runDemoOCR}
              className="w-full group/btn p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 rounded-2xl transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-xl group-hover/btn:text-indigo-400 transition-colors">
                  <FileText size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Fast Scan Demo</p>
                  <p className="text-[10px] text-slate-500">Analyze sample invoice</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover/btn:text-indigo-400 group-hover/btn:translate-x-1 transition-all" />
            </motion.button>

            {/* ACTION 2: GENERATE REPORTS */}
            <motion.button 
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full group/btn p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 rounded-2xl transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-xl group-hover/btn:text-purple-400 transition-colors">
                  <Mail size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Auto-Reports</p>
                  <p className="text-[10px] text-slate-500">Generate weekly digest</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover/btn:text-purple-400 group-hover/btn:translate-x-1 transition-all" />
            </motion.button>
          </div>
        </div>

        {/* BOTTOM PROMOTIONAL CTA */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-8 relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-900/40 group/main"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Unlock Enterprise Suite <Sparkles size={16} />
          </span>
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/main:translate-x-[100%] transition-transform duration-700 italic" />
        </motion.button>
      </div>
    </motion.div>
  );
}
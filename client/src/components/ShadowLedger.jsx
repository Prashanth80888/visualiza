import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { generateProjections } from '../utils/oracleEngine';
import { Target, Zap } from 'lucide-react';

export default function ShadowLedger({ invoices }) {
  const [adjustment, setAdjustment] = useState(0);

  const projectionData = useMemo(() => 
    generateProjections(invoices, adjustment), 
    [invoices, adjustment]
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      // FLIPPED TO CLEAN WHITE WITH SOFT SLATE BORDER
      className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden relative"
    >
      {/* SOFT PURPLE RADIANCE (LIGHT VERSION) */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-50 blur-[120px] pointer-events-none opacity-50" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-xl border border-purple-100">
              <Target className="text-purple-600" size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400">AutoBiz Oracle v2.0</span>
          </div>
          {/* DARK TEXT FOR LIGHT BACKGROUND */}
          <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">
            Shadow Ledger <span className="text-purple-600">Flux-v2</span>
          </h3>
          <p className="text-slate-400 text-xs font-bold mt-2">Manual cycle override for AI simulated liquidity flows</p>
        </div>

        {/* SURPLUS CARD - CLEAN & VIBRANT */}
        <div className="mt-8 md:mt-0 bg-slate-50 border border-slate-100 p-6 rounded-3xl">
           <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Predicted Surplus</p>
           <h4 className="text-4xl font-black text-purple-600 tracking-tighter italic">
             +₹{projectionData[projectionData.length - 1].balance.toLocaleString('en-IN')}
           </h4>
        </div>
      </div>

      {/* CHART BARS - VIBRANT PURPLE ON WHITE */}
      <div className="h-72 flex items-end justify-between gap-2.5 mb-16 px-4">
        {projectionData.map((point, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center group relative">
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${(point.balance / 40000) * 100}%` }}
              className={`w-full rounded-t-xl relative transition-all duration-500 ${
                point.isPredicted 
                  ? 'bg-purple-100 border-t-2 border-dashed border-purple-400' 
                  : 'bg-purple-600 shadow-[0_10px_20px_rgba(147,51,234,0.2)]'
              }`}
            >
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-20">
                ₹{point.balance.toLocaleString('en-IN')}
              </div>
            </motion.div>
            <span className="text-[9px] font-black text-slate-400 mt-6 uppercase tracking-tighter -rotate-45 group-hover:text-purple-600 transition-colors">
              {point.date}
            </span>
          </div>
        ))}
      </div>

      {/* CONTROL DIAL - CLEAN SLATE DESIGN */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center bg-slate-50 border border-slate-100 p-10 rounded-[3rem] relative z-10">
        <div className="lg:col-span-1">
           <div className="flex items-center gap-3 mb-2 text-purple-600">
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
            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-600 transition-all"
          />
        </div>
        <div className="lg:col-span-1 text-right">
           <span className={`text-2xl font-black italic ${adjustment >= 0 ? 'text-purple-600' : 'text-rose-500'}`}>
             {adjustment >= 0 ? '+' : ''}₹{Math.abs(adjustment).toLocaleString('en-IN')}
           </span>
        </div>
      </div>
    </motion.div>
  );
}
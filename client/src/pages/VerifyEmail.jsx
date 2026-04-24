import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const navigate = useNavigate();
  const hasCalled = useRef(false); 

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const verify = async () => {
      try {
        await axios.get(`http://localhost:5000/api/v1/auth/verify/${token}`);
        setStatus('success');
        setTimeout(() => navigate('/login'), 3500);
      } catch (err) {
        setStatus('error');
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 text-center relative overflow-hidden"
      >
        {/* Subtle Decorative Gradient Top */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

        {status === 'loading' && (
          <div className="py-8">
            <div className="relative w-20 h-20 mx-auto mb-8">
               <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
               <Loader2 className="w-20 h-20 text-indigo-600 animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verifying Account</h2>
            <p className="text-slate-500 mt-3 text-lg">We are securing your terminal access...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </motion.div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Identity Confirmed</h2>
            <p className="text-slate-500 mt-3 text-lg leading-relaxed">Your email is verified. Preparing your dashboard...</p>
            
            {/* Progress Bar for redirection */}
            <div className="mt-10 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3.5 }}
                className="h-full bg-emerald-500" 
               />
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Link Expired</h2>
            <p className="text-slate-500 mt-3 text-lg leading-relaxed">This verification link is no longer valid or has already been used.</p>
            
            <Link 
              to="/register" 
              className="mt-10 inline-flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Try Registering Again <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </motion.div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-10 flex items-center gap-2 text-slate-400 font-medium">
        <ShieldCheck size={18} />
        <span className="text-sm tracking-widest uppercase">AutoBiz AI Security</span>
      </div>
    </div>
  );
}
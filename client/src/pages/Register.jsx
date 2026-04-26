import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, ShieldCheck, Loader2, KeyRound } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [step, setStep] = useState(1); // 1: Register Form, 2: OTP Entry
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/v1/auth/register', formData);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/v1/auth/verify-otp', { 
        email: formData.email, 
        otp 
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-[450px] w-full bg-white p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden"
      >
        {/* Design Accents */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600" />
        
        <div className="flex justify-center mb-8">
           <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <ShieldCheck size={32} strokeWidth={2.5} />
           </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
                <p className="text-slate-500 mt-2 font-medium">Join the AutoBiz AI ecosystem</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required type="email" placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required type="password" placeholder="Password"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                <button 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Get OTP Code <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} /></>}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                   <KeyRound className="text-indigo-600 animate-pulse" size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Verify Email</h2>
                <p className="text-slate-500 mt-2 px-4">Enter the 6-digit code we sent to <br/><span className="text-slate-900 font-bold">{formData.email}</span></p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <input 
                  required
                  maxLength={6}
                  placeholder="· · · · · ·"
                  className="w-full text-center text-4xl tracking-[0.75rem] font-black py-6 bg-slate-50 border-none rounded-3xl focus:ring-2 focus:ring-indigo-600/20 outline-none placeholder:text-slate-300"
                  onChange={e => setOtp(e.target.value)}
                />

                {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                <button 
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>Verify & Finish <ShieldCheck size={20} /></>}
                </button>

                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                >
                  Edit Email Address
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 font-medium">
              Already have an account? <Link to="/login" className="text-slate-900 font-bold hover:underline underline-offset-4">Sign In</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
}
import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/v1/auth/forgot-password', { email });
      setMessage("Check your inbox for reset instructions.");
    } catch (err) {
      setMessage("Failed to send reset email.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl">
        <Link to="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </Link>
        <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
        <p className="text-slate-500 mt-2 mb-8">Enter your email and we'll send you a reset link.</p>
        
        {message && <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl text-sm mb-6 font-medium text-center">{message}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input type="email" required placeholder="Email Address" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { 
  Upload, FileText, Loader2, CheckCircle, 
  ShieldCheck, ShieldAlert, CreditCard, Receipt, 
  Calculator, AlertTriangle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Invoices() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post(
        '/api/v1/invoices/upload',
        formData
      );
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Make sure your backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
            AutoBiz <span className="text-blue-600">AI Auditor</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Extract data, verify GST math compliance, and track payment status.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT: UPLOAD BOX */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white border border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center shadow-sm h-fit"
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <label htmlFor="file-upload" className="cursor-pointer text-center group">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                <Upload className="w-7 h-7 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-gray-800 font-bold text-lg">
                {file ? file.name : "Inject Invoice Asset"}
              </p>
              <p className="text-sm text-gray-400 mt-1">Supports PNG, JPG, or PDF</p>
            </label>

            {file && !loading && (
              <button
                onClick={handleUpload}
                className="mt-8 bg-black text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg"
              >
                Analyze Invoice
              </button>
            )}

            {loading && (
              <div className="mt-8 flex items-center gap-3 text-gray-600 font-bold italic uppercase text-xs">
                <Loader2 className="animate-spin w-5 h-5 text-blue-600" />
                Neural Processing...
              </div>
            )}

            {result && !loading && (
              <div className="mt-8 flex items-center gap-2 text-green-600 text-xs font-black uppercase tracking-widest">
                <CheckCircle className="w-4 h-4" />
                Audit Secured
              </div>
            )}
          </motion.div>

          {/* RIGHT: RESULT BOX */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Extracted Intelligence
                </p>
              </div>
              
              {/* NEW: DYNAMIC PAYMENT STATUS BADGE */}
              {result && (
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                  result.data.paymentStatus === 'Paid' 
                  ? 'bg-green-500 text-white border-green-600' 
                  : 'bg-amber-500 text-white border-amber-600'
                }`}>
                  {result.data.paymentStatus}
                </div>
              )}
            </div>

            {result && result.data ? (
              <div className="space-y-5">

                {/* NEW: MATH VERIFICATION PANEL */}
                <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  result.data.isVerified 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-red-50 border-red-200 animate-pulse'
                }`}>
                   {result.data.isVerified ? <ShieldCheck className="w-8 h-8 text-blue-600" /> : <ShieldAlert className="w-8 h-8 text-red-600" />}
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Calculated Integrity</p>
                      <p className={`font-bold leading-none mt-1 ${result.data.isVerified ? 'text-gray-900' : 'text-red-700'}`}>
                        {result.data.isVerified ? "Math Matches Total" : "Tax Calculation Mismatch"}
                      </p>
                   </div>
                   <div className="ml-auto flex flex-col items-end">
                      <span className="text-[9px] font-black opacity-40 uppercase tracking-tighter">GSTIN</span>
                      <span className="text-[11px] font-bold text-gray-600 font-mono">{result.data.taxId || "N/A"}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference No</p>
                    <p className="font-bold text-gray-800 mt-1">{result.data.reference || "-"}</p>
                  </div>

                  <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                    <p className="font-bold text-gray-800 mt-1">
                      {result.data.date ? new Date(result.data.date).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </div>

                {/* NEW: VENDOR & BREAKDOWN SECTION */}
                <div className="border border-gray-100 rounded-2xl p-5 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Receipt className="w-3 h-3 text-gray-400" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Entity & Breakdown</p>
                  </div>
                  <p className="font-black text-gray-900 text-xl uppercase italic mb-4">
                    {result.data.vendor || "Unknown Vendor"}
                  </p>
                  
                  {/* MINI MATH TABLE */}
                  <div className="space-y-2 border-t border-gray-50 pt-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase">Subtotal</span>
                      <span className="text-gray-700 font-bold">₹{result.data.subtotal || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 font-bold uppercase">Tax / GST</span>
                      <span className="text-blue-600 font-black">+ ₹{result.data.taxAmount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* TOTAL AMOUNT PANEL */}
                <div className="bg-black text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                  <CreditCard className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:rotate-12 transition-transform" />
                  <div className="flex justify-between items-start relative z-10">
                    <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Payable Total</p>
                    {!result.data.isVerified && (
                       <AlertTriangle className="text-red-500 w-5 h-5 animate-bounce" />
                    )}
                  </div>
                  <p className="text-4xl font-black mt-2 italic flex items-baseline relative z-10">
                    <span className="text-lg mr-1 text-blue-500 font-bold">₹</span>
                    {result.data.amount || "0"}
                  </p>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
                <FileText className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-gray-300 text-[10px] font-black uppercase tracking-[0.4em]">Awaiting Injection</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
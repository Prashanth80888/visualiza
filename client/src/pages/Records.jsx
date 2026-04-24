import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Download, Trash2, Calendar, User, CreditCard, 
  Search, Filter, CheckCircle, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Records() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // --- FILTERS STATE ---
  const [activeTab, setActiveTab] = useState('All'); // All, Paid, Unpaid
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Build query string based on filters
      let url = `http://localhost:5000/api/v1/invoices?search=${searchTerm}`;
      if (activeTab !== 'All') url += `&status=${activeTab}`;
      if (selectedDate) {
        url += `&startDate=${selectedDate}&endDate=${selectedDate}`;
      }

      const res = await axios.get(url);
      setInvoices(res.data.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchInvoices();
  }, [activeTab, searchTerm, selectedDate]);

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    try {
      await axios.patch(`http://localhost:5000/api/v1/invoices/${id}/status`, {
        paymentStatus: newStatus
      });
      fetchInvoices(); // Refresh list
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this record permanently?")) {
      await axios.delete(`http://localhost:5000/api/v1/invoices/${id}`);
      fetchInvoices();
    }
  };

  const exportCSV = () => {
    const csvRows = [
      ["Vendor", "Amount", "Invoice Date", "Processing Date", "Status"],
      ...invoices.map(i => [
        i.vendor, 
        i.amount, 
        new Date(i.date).toLocaleDateString(), 
        new Date(i.createdAt).toLocaleDateString(), 
        i.paymentStatus
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AutoBiz_Report_${activeTab}_${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 min-h-screen bg-slate-50/30">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase">Audit <span className="text-indigo-600">Archive</span></h2>
          <p className="text-slate-500 font-medium">Manage, filter, and export your verified financial assets.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl hover:bg-indigo-600 shadow-xl transition-all active:scale-95 font-bold text-sm uppercase tracking-widest">
          <Download size={18} /> Export {activeTab}
        </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search vendor or reference..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex bg-slate-50 p-1 rounded-2xl">
          {['All', 'Paid', 'Unpaid'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="date" 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vendor / Entity</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice Date</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Processed</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence>
              {invoices.map((inv) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={inv._id} 
                  className="hover:bg-indigo-50/30 transition-colors group"
                >
                  <td className="p-6 font-black text-slate-800 uppercase italic text-sm">{inv.vendor}</td>
                  <td className="p-6 text-slate-500 font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} /> {new Date(inv.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6 text-slate-400 font-medium text-xs">
                    <div className="flex items-center gap-2">
                      <Clock size={14} /> {new Date(inv.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-black text-slate-900">₹{inv.amount}</span>
                  </td>
                  <td className="p-6">
                    <button 
                      onClick={() => handleUpdateStatus(inv._id, inv.paymentStatus)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all ${
                        inv.paymentStatus === 'Paid' 
                        ? 'bg-green-50 text-green-600 border-green-200' 
                        : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {inv.paymentStatus || 'Unpaid'}
                    </button>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDelete(inv._id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        
        {invoices.length === 0 && !loading && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Filter size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
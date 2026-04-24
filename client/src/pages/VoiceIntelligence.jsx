import React, { useState } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function VoiceIntelligence() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();

  const toggleMic = () => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) return toast.error("Intelligence Node: Browser not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true; // Shows text while you speak
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const resultText = event.results[current][0].transcript.toLowerCase();
      setTranscript(resultText);

      if (event.results[current].isFinal) {
        // --- COMMAND ENGINE ---
        if (resultText.includes('dashboard')) navigate('/');
        else if (resultText.includes('analytics')) navigate('/analytics');
        else if (resultText.includes('scanner')) navigate('/scanner');
        else if (resultText.includes('invoice')) navigate('/invoices');
        else if (resultText.includes('email')) navigate('/email');
        
        toast.success(`AI Executed: ${resultText}`, {
          icon: <Sparkles className="text-indigo-400" size={16} />
        });
      }
    };

    recognition.start();
  };

  return (
    // Positioned Bottom-Right to avoid Sidebar overlap
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
      
      {/* --- FLOATING TRANSCRIPT BUBBLE --- */}
      <AnimatePresence>
        {isListening && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl w-64 text-center"
          >
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((bar) => (
                <motion.div
                  key={bar}
                  animate={{ height: [10, 25, 10] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: bar * 0.1 }}
                  className="w-1 bg-indigo-500 rounded-full"
                />
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Neural Capture</p>
            <p className="text-white text-xs font-medium italic">
              {transcript || "Waiting for audio..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN ACTION BUTTON --- */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMic}
        className={`pointer-events-auto relative p-6 rounded-3xl shadow-2xl transition-all border-4 flex items-center justify-center ${
          isListening 
          ? 'bg-rose-600 border-rose-400 shadow-rose-500/40' 
          : 'bg-indigo-600 border-indigo-400 shadow-indigo-500/40'
        } text-white`}
      >
        {isListening ? (
          <MicOff size={28} className="animate-pulse" />
        ) : (
          <Mic size={28} />
        )}

        {/* Ambient Glow Aura */}
        {!isListening && (
          <span className="absolute inset-0 rounded-3xl bg-indigo-500 animate-ping opacity-20 -z-10" />
        )}
      </motion.button>
    </div>
  );
}
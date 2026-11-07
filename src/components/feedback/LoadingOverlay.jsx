import React from 'react';
import { motion } from 'framer-motion';

const LoadingOverlay = ({ message = "Memproses..." }) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[999] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-24 h-24 mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 border-4 border-indigo-100 border-t-indigo-600 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-4 bg-indigo-600 rounded-full"
        />
      </div>
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{message}</h2>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Mohon Tunggu Sebentar</p>
    </div>
  );
};

export default LoadingOverlay;

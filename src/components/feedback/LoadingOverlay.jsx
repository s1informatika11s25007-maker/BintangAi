import React from 'react';

const LoadingOverlay = ({ message = "Memproses..." }) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[999] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{message}</h2>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Mohon Tunggu Sebentar</p>
    </div>
  );
};

export default LoadingOverlay;

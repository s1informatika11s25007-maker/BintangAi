import React from 'react';
import { motion } from 'framer-motion';

const AILoadingSkeleton = () => {
  return (
    <div className="space-y-4 p-6 bg-white rounded-3xl border border-purple-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin shrink-0" />
        <div className="h-4 w-32 bg-slate-100 rounded-full animate-pulse" />
      </div>

      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-50 rounded-full animate-pulse" />
        <div className="h-4 w-[90%] bg-slate-50 rounded-full animate-pulse" />
        <div className="h-4 w-[95%] bg-slate-50 rounded-full animate-pulse" />
        <div className="h-4 w-[70%] bg-slate-50 rounded-full animate-pulse" />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="text-[10px] font-bold text-purple-400 uppercase tracking-widest text-center mt-4"
      >
        AI sedang membaca modul kamu...
      </motion.p>
    </div>
  );
};

export default AILoadingSkeleton;

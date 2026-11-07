import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../hooks/useNotification';

const NotificationContainer = () => {
  const { toast, hideToast } = useNotification();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -40, x: '-50%', scale: 0.8 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: -40, x: '-50%', scale: 0.8 }}
          className="fixed top-10 left-1/2 z-[9999] flex items-center gap-4 bg-white/90 backdrop-blur-xl px-6 py-4 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-white min-w-[340px]"
        >
          <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center text-white text-xl shadow-lg transition-transform ${toast.type === 'success' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200' : 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-200'}`}>
            {toast.type === 'success' ? '✨' : '⚠️'}
          </div>
          <div className="flex flex-col pr-4">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 leading-none mb-1.5">
              {toast.type === 'success' ? 'BintangAi System' : 'System Alert'}
            </span>
            <span className="text-sm font-bold text-slate-800 tracking-tight leading-snug">
              {toast.message}
            </span>
          </div>
          <button
            onClick={hideToast}
            className="ml-auto w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationContainer;

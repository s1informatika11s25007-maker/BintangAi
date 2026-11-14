import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../hooks/useNotification';
import { HiCheckCircle, HiExclamation, HiX } from 'react-icons/hi';

const NotificationContainer = () => {
  const { toast, hideToast } = useNotification();

  const isSuccess = toast?.type === 'success';

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -40, x: '-50%', scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: -40, x: '-50%', scale: 0.9 }}
          className="fixed top-8 left-1/2 z-[9999] flex items-center gap-4 bg-white/95 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] border border-slate-100 min-w-[340px] max-w-md"
        >
          {/* Professional BintangAi Logo Icon Badge */}
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xl shrink-0 shadow-md ${
            isSuccess
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-100'
              : 'bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-100'
          }`}>
            {isSuccess ? <HiCheckCircle className="text-xl" /> : <HiExclamation className="text-xl" />}
          </div>

          <div className="flex flex-col pr-2 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-4 h-4 bg-indigo-600 text-white font-black text-[9px] rounded-md flex items-center justify-center leading-none">
                B
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
                Bintang<span className="text-indigo-600">Ai</span>
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-tight leading-snug truncate">
              {toast.message}
            </span>
          </div>

          <button
            onClick={hideToast}
            className="ml-auto p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all shrink-0"
          >
            <HiX className="text-sm" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationContainer;

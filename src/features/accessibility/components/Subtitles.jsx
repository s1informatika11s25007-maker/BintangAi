import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '../hooks/useAccessibility';

let subtitleListeners = [];

export const subtitleBus = {
  emit: (text, type = 'info') => {
    subtitleListeners.forEach(fn => fn(text, type));
  }
};

export const useSubtitle = () => {
  return {
    showSubtitle: (text, type = 'info') => subtitleBus.emit(text, type)
  };
};

const TYPE_STYLES = {
  info: 'bg-indigo-600/90 text-white border-indigo-400/50',
  success: 'bg-emerald-600/90 text-white border-emerald-400/50',
  error: 'bg-rose-600/90 text-white border-rose-400/50',
  warning: 'bg-amber-500/90 text-slate-900 border-amber-600/50 animate-pulse',
  ai: 'bg-slate-900/90 text-indigo-300 border-indigo-500/50',
};

const Subtitles = () => {
  const { isSubtitleActive } = useAccessibility();
  const [entries, setEntries] = useState([]);
  const idRef = useRef(0);
  const flashRef = useRef(null);

  useEffect(() => {
    if (!isSubtitleActive) return;

    const handler = (text, type) => {
      const id = ++idRef.current;
      if (!text) return;

      // Keep only 1 message at a time to reduce clutter
      setEntries([{ id, text, type }]);

      // Visual flash for alerts
      if (type === 'warning' || type === 'error') {
        if (flashRef.current) {
          flashRef.current.style.opacity = '0.3';
          setTimeout(() => {
            if (flashRef.current) flashRef.current.style.opacity = '0';
          }, 300);
        }
      }

      // Dynamic duration based on text length
      const duration = Math.max(3000, text.length * 80);
      setTimeout(() => {
        setEntries(prev => prev.filter(e => e.id !== id));
      }, duration);
    };

    subtitleListeners.push(handler);
    return () => {
      subtitleListeners = subtitleListeners.filter(fn => fn !== handler);
    };
  }, [isSubtitleActive]);

  if (!isSubtitleActive) return null;

  return (
    <>
      {/* Alert Flash Layer */}
      <div
        ref={flashRef}
        className="fixed inset-0 pointer-events-none z-[999] transition-opacity duration-300 opacity-0 bg-rose-600"
      />

      {/* REFINED SUBTITLE HUD - TOP POSITIONED */}
      <div className="fixed top-6 left-0 right-0 z-[1000] flex flex-col items-center p-4 pointer-events-none">
        <AnimatePresence mode="wait">
          {entries.map(e => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }}
              className={`
                px-6 py-3 md:px-8 md:py-4 rounded-[1.5rem] md:rounded-[2rem]
                shadow-[0_15px_40px_rgba(0,0,0,0.2)] backdrop-blur-2xl border-2
                flex items-center gap-3 md:gap-4 max-w-[90vw] md:max-w-2xl
                ${TYPE_STYLES[e.type] || TYPE_STYLES.info}
              `}
            >
              <div className="shrink-0">
                {e.type === 'ai' && <span className="text-xl md:text-2xl">🤖</span>}
                {e.type === 'warning' && <span className="text-xl md:text-2xl animate-pulse">⚠️</span>}
                {e.type === 'error' && <span className="text-xl md:text-2xl">🚫</span>}
                {e.type === 'success' && <span className="text-xl md:text-2xl">✅</span>}
                {e.type === 'info' && <span className="text-xl md:text-2xl">ℹ️</span>}
              </div>

              <p className="text-sm md:text-lg font-black tracking-tight leading-tight md:leading-normal">
                {e.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Subtitles;

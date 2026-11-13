import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BintangAvatar = ({ state = 'idle', size = 'md' }) => {
  // states: idle, thinking, happy, speaking

  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  };

  return (
    <div className={`relative ${sizes[size] || sizes.md} flex items-center justify-center`}>
      {/* Glow Effect */}
      <motion.div
        animate={{
          scale: state === 'thinking' ? [1, 1.15, 1] : 1,
          opacity: state === 'thinking' ? [0.2, 0.4, 0.2] : 0.1,
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute inset-0 bg-indigo-400 rounded-full blur-2xl"
      />

      {/* Character Body */}
      <motion.div
        animate={{
          y: state === 'speaking' ? [0, -6, 0] : [0, -2, 0],
        }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="relative z-10 w-full h-full"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bodyGradient" x1="50" y1="20" x2="50" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="4" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.25" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Academic Badge Body (Friendly Rounded Shield/Badge) */}
          <motion.rect
            x="20" y="25" width="60" height="60" rx="28"
            fill="url(#bodyGradient)"
            filter="url(#shadow)"
            animate={{
              scale: state === 'happy' ? [1, 1.08, 1] : 1
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Academic Cap / Toga Hat on Top */}
          <path d="M50 12L80 23L50 34L20 23L50 12Z" fill="#1E1B4B" />
          <path d="M32 28.5V36C32 40 68 40 68 36V28.5" fill="#312E81" />
          <path d="M74 25V37" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="74" cy="38" r="2.5" fill="#F59E0B" />

          {/* Eyes */}
          <motion.circle
            cx="38" cy="50" r="4.5" fill="#FFFFFF"
            animate={{ scaleY: state === 'thinking' ? 0.2 : 1 }}
          />
          <motion.circle
            cx="38" cy="50" r="2.5" fill="#0F172A"
          />
          <motion.circle
            cx="62" cy="50" r="4.5" fill="#FFFFFF"
            animate={{ scaleY: state === 'thinking' ? 0.2 : 1 }}
          />
          <motion.circle
            cx="62" cy="50" r="2.5" fill="#0F172A"
          />

          {/* Mouth */}
          <AnimatePresence mode="wait">
            {state === 'speaking' ? (
              <motion.path
                key="speaking"
                d="M42 66 Q50 76 58 66"
                stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round"
                animate={{ d: ["M42 66 Q50 70 58 66", "M42 66 Q50 82 58 66", "M42 66 Q50 70 58 66"] }}
                transition={{ repeat: Infinity, duration: 0.4 }}
              />
            ) : state === 'happy' ? (
              <motion.path
                key="happy"
                d="M36 62 Q50 80 64 62"
                stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round"
              />
            ) : (
              <motion.path
                key="idle"
                d="M43 66 L57 66"
                stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"
              />
            )}
          </AnimatePresence>
        </svg>
      </motion.div>
    </div>
  );
};

export default BintangAvatar;

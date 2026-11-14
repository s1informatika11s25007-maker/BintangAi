import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BintangAvatar = ({ state = 'idle', size = 'md' }) => {
  // states: idle, thinking, happy, speaking

  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12 md:w-14 md:h-14',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48'
  };

  return (
    <div className={`relative ${sizes[size] || sizes.md} flex items-center justify-center shrink-0`}>
      {/* Radiant Blue Glow Aura */}
      <motion.div
        animate={{
          scale: state === 'thinking' ? [1, 1.25, 1] : [1, 1.1, 1],
          opacity: state === 'thinking' ? [0.4, 0.7, 0.4] : [0.25, 0.45, 0.25],
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute inset-0 bg-sky-400/50 rounded-full blur-2xl"
      />

      {/* Floating Animated Character Body */}
      <motion.div
        animate={{
          y: state === 'speaking' ? [0, -8, 0] : state === 'happy' ? [0, -10, 0] : [0, -4, 0],
          rotate: state === 'happy' ? [-6, 6, -6] : [-2, 2, -2],
        }}
        transition={{ repeat: Infinity, duration: state === 'speaking' ? 0.6 : 3, ease: "easeInOut" }}
        className="relative z-10 w-full h-full"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
          <defs>
            {/* Cute Vibrant Ocean Blue Gradient */}
            <linearGradient id="blueStarGradient" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="0.5" stopColor="#3B82F6" />
              <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>

            <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
              <feOffset dx="0" dy="4" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 🌟 Rounded 5-Pointed Blue Star Body */}
          <motion.path
            d="M 50,10 C 51.5,10 54,24 57,28 C 60,32 75,34 76.5,35.5 C 78,37 68,48 66,52 C 64,56 70,72 68.5,73.5 C 67,75 53,67 50,67 C 47,67 33,75 31.5,73.5 C 30,72 36,56 34,52 C 32,48 22,37 23.5,35.5 C 25,34 40,32 43,28 C 46,24 48.5,10 50,10 Z"
            fill="url(#blueStarGradient)"
            stroke="#93C5FD"
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#starShadow)"
            animate={{
              scale: state === 'happy' ? [1, 1.08, 1] : 1
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Mini Academic Cap (Toga Hat) on top star tip */}
          <g transform="translate(0, -2)">
            <path d="M50 8L74 17L50 26L26 17L50 8Z" fill="#1E293B" />
            <path d="M36 21.5V26.5C36 29.5 64 29.5 64 26.5V21.5" fill="#0F172A" />
            <path d="M68 18.5V28" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            <circle cx="68" cy="29" r="2" fill="#F59E0B" />
          </g>

          {/* Rosy Cheeks */}
          <circle cx="33" cy="53" r="4.5" fill="#FB7185" opacity="0.6" />
          <circle cx="67" cy="53" r="4.5" fill="#FB7185" opacity="0.6" />

          {/* Cute Anime Eyes (Left & Right) */}
          <g>
            {/* Left Eye */}
            <motion.ellipse
              cx="39" cy="46" rx="4.5" ry="5.5" fill="#0F172A"
              animate={{
                scaleY: state === 'thinking' ? [1, 0.1, 1] : [1, 1, 0.1, 1, 1]
              }}
              transition={{ repeat: Infinity, duration: state === 'thinking' ? 1.2 : 4, repeatDelay: 2 }}
            />
            {/* Left Eye Sparkle Highlights */}
            <circle cx="37.5" cy="44" r="1.8" fill="#FFFFFF" />
            <circle cx="40.5" cy="48" r="0.8" fill="#FFFFFF" />

            {/* Right Eye */}
            <motion.ellipse
              cx="61" cy="46" rx="4.5" ry="5.5" fill="#0F172A"
              animate={{
                scaleY: state === 'thinking' ? [1, 0.1, 1] : [1, 1, 0.1, 1, 1]
              }}
              transition={{ repeat: Infinity, duration: state === 'thinking' ? 1.2 : 4, repeatDelay: 2 }}
            />
            {/* Right Eye Sparkle Highlights */}
            <circle cx="59.5" cy="44" r="1.8" fill="#FFFFFF" />
            <circle cx="62.5" cy="48" r="0.8" fill="#FFFFFF" />
          </g>

          {/* Cheerful Mouth */}
          <AnimatePresence mode="wait">
            {state === 'speaking' ? (
              <motion.path
                key="speaking"
                d="M42 59 Q50 68 58 59"
                stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="#F43F5E"
                animate={{ d: ["M42 59 Q50 63 58 59", "M42 59 Q50 72 58 59", "M42 59 Q50 63 58 59"] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
              />
            ) : state === 'happy' ? (
              <motion.path
                key="happy"
                d="M38 57 Q50 72 62 57"
                stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="#F43F5E"
              />
            ) : (
              <motion.path
                key="idle"
                d="M42 58 Q50 65 58 58"
                stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none"
              />
            )}
          </AnimatePresence>
        </svg>
      </motion.div>
    </div>
  );
};

export default BintangAvatar;

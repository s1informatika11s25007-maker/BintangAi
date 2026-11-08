// pages/student/Playground.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAI } from '@/features/ai-tutor';
import StudentSidebar from '@/components/layout/StudentSidebar';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { useAudioRecorder } from '@/features/accessibility/hooks/useAudioRecorder';
import { HiMicrophone, HiX } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const Playground = () => {
  const { profile } = useAuthStore();
  const { smartVoiceAssistant } = useAI();
  const { isBlind } = useAccessibility();
  const { speak, stopSpeaking } = useVoice();
  const { isRecording, startRecording, stopRecording, audioBlob } = useAudioRecorder();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const timerRef = useRef(null);

  const studentName = profile?.full_name?.split(' ')[0] || "Teman";

  // Pure Voice Greeting
  useEffect(() => {
    if (profile?.id && !initialized) {
      const welcome = `Halo ${studentName}! Aku asisten pintarmu. Ketuk layar atau tekan Spasi untuk mulai bicara ya!`;
      if (isBlind) speak(welcome);
      setInitialized(true);
    }
  }, [profile?.id, initialized, studentName, isBlind, speak]);

  const handleVoiceProcess = useCallback(async (blob) => {
    setIsProcessing(true);
    try {
      const response = await smartVoiceAssistant(blob, studentName, "Playground Voice Mode");
      if (response && response.success && !response.isNoise) {
        speak(response.answer);
        if (response.navigateTo) {
          const navMap = {
            'modules': '/student/modules',
            'tasks': '/student/tasks',
            'profile': '/profile',
            'dashboard': '/student/dashboard'
          };
          if (navMap[response.navigateTo]) {
            setTimeout(() => navigate(navMap[response.navigateTo]), 2500);
          }
        }
      }
    } catch (err) {
      speak("Maaf, ada gangguan teknis.");
    } finally {
      setIsProcessing(false);
    }
  }, [smartVoiceAssistant, studentName, speak, navigate]);

  useEffect(() => {
    if (audioBlob) handleVoiceProcess(audioBlob);
  }, [audioBlob, handleVoiceProcess]);

  const toggleMic = useCallback(() => {
    // Lock interaction during processing or preparation to avoid double triggers
    if (isProcessing || isPreparing) return;

    if (isRecording) {
      if (timerRef.current) clearTimeout(timerRef.current);
      stopRecording();
    } else {
      setIsPreparing(true);
      stopSpeaking();
      speak("Nay siap.");

      timerRef.current = setTimeout(() => {
        startRecording();
        setIsPreparing(false);
      }, 800);
    }
  }, [isRecording, isProcessing, isPreparing, startRecording, stopRecording, stopSpeaking, speak]);

  // Desktop Space & Android Tap Logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && (e.target === document.body || e.target.tagName === 'MAIN')) {
        e.preventDefault();
        toggleMic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMic]);

  return (
    <div className="h-[100dvh] w-full bg-[#020617] flex font-sans overflow-hidden touch-none select-none">
      <StudentSidebar />

      <main
        className="flex-1 flex flex-col items-center justify-center relative cursor-pointer"
        onClick={toggleMic}
      >
        {/* Professional Core Animation - Abstract Pulsing Orb */}
        <div className="relative flex items-center justify-center">

          {/* Ambient Background Glows */}
          <div className={`absolute w-[80vw] h-[80vw] rounded-full blur-[120px] transition-all duration-1000 ${
            isRecording ? 'bg-rose-600/20' :
            isProcessing || isPreparing ? 'bg-indigo-600/20' : 'bg-blue-600/10'
          }`} />

          {/* Central Visualizer Orb */}
          <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">

            {/* Outer Rings */}
            <AnimatePresence>
              {(isRecording || isProcessing || isPreparing) && (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`absolute inset-0 rounded-full border-2 ${isRecording ? 'border-rose-500' : 'border-indigo-500'}`}
                  />
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 2, opacity: [0, 0.3, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    className={`absolute inset-0 rounded-full border border-dashed ${isRecording ? 'border-rose-400' : 'border-indigo-400'}`}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Core Mic Sphere */}
            <motion.div
              animate={isRecording ? {
                scale: [1, 1.1, 1],
                boxShadow: ["0 0 20px rgba(244,63,94,0.3)", "0 0 60px rgba(244,63,94,0.6)", "0 0 20px rgba(244,63,94,0.3)"]
              } : (isProcessing || isPreparing) ? {
                rotate: 360,
                boxShadow: "0 0 40px rgba(79,70,229,0.5)"
              } : {
                scale: 1,
                boxShadow: "0 0 20px rgba(59,130,246,0.2)"
              }}
              transition={(isProcessing || isPreparing) ? { repeat: Infinity, duration: 3, ease: "linear" } : { repeat: Infinity, duration: 1.5 }}
              className={`
                w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center relative z-20 transition-colors duration-700
                ${isRecording ? 'bg-rose-500' : (isProcessing || isPreparing) ? 'bg-indigo-600' : 'bg-slate-800'}
                border-4 border-white/10
              `}
            >
              {(isProcessing || isPreparing) ? (
                <div className="relative w-full h-full flex items-center justify-center">
                   <motion.div
                     animate={{ rotate: -360 }}
                     transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                     className="absolute inset-2 border-t-4 border-white/40 rounded-full"
                   />
                   <HiMicrophone className="text-4xl md:text-6xl text-white opacity-40" />
                </div>
              ) : isRecording ? (
                <HiX className="text-4xl md:text-6xl text-white" />
              ) : (
                <HiMicrophone className="text-4xl md:text-6xl text-white" />
              )}
            </motion.div>
          </div>
        </div>

        {/* Minimalist Sound Wave Indicator */}
        <div className="mt-20 flex gap-2.5 items-center h-12">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
            <motion.div
              key={i}
              animate={isRecording ? {
                height: [8, 48, 8],
                backgroundColor: ['#6366f1', '#f43f5e', '#6366f1']
              } : (isProcessing || isPreparing) ? {
                height: [20, 20, 20],
                opacity: [0.2, 0.6, 0.2]
              } : {
                height: 4,
                backgroundColor: '#1e293b'
              }}
              transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
              className="w-1.5 md:w-2 rounded-full transition-all"
            />
          ))}
        </div>

        {/* Interaction Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          className="absolute bottom-16 text-center"
        >
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-white/60">
            {isRecording ? "Sedang Mendengar..." : (isProcessing || isPreparing) ? "Sedang Berpikir..." : "Ketuk Layar / Spasi"}
          </p>
        </motion.div>

      </main>

      <style>{`
        @media (max-width: 768px) {
          main { height: 100dvh; }
        }
      `}</style>
    </div>
  );
};

export default Playground;

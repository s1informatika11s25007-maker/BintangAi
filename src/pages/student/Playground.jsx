// pages/student/Playground.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAI } from '@/features/ai-tutor';
import StudentSidebar from '@/components/layout/StudentSidebar';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { useAudioRecorder } from '@/features/accessibility/hooks/useAudioRecorder';
import VoiceSettingsPanel from '@/features/accessibility/components/VoiceSettingsPanel';
import { HiMicrophone, HiX, HiVolumeUp, HiRefresh } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const Playground = () => {
  const { profile } = useAuthStore();
  const { smartVoiceAssistant } = useAI();
  const { isBlind } = useAccessibility();
  const { speak, stopSpeaking, replayLastSpoken, lastSpokenText } = useVoice();
  const { isRecording, startRecording, stopRecording, audioBlob } = useAudioRecorder();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
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
            'dashboard': '/student/dashboard',
            'beranda': '/student/dashboard',
            'modules': '/student/modules',
            'materi': '/student/modules',
            'tasks': '/student/tasks',
            'quiz': '/student/tasks',
            'profile': '/profile',
            'profil': '/profile',
            'collaboration': '/student/collaboration',
            'grup': '/student/collaboration',
            'inbox': '/student/inbox',
            'pesan': '/student/inbox',
            'live-captions': '/student/live-captions',
            'mata-pintar': '/student/live-captions',
          };
          if (navMap[response.navigateTo]) {
            setTimeout(() => navigate(navMap[response.navigateTo]), 300);
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
    <div className="h-[100dvh] w-full bg-[#020617] flex font-sans overflow-hidden touch-none select-none relative">
      <StudentSidebar />

      {/* Quick Sound Control Buttons overlay on Playground */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {lastSpokenText && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              replayLastSpoken();
            }}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white rounded-2xl flex items-center gap-2 text-xs font-bold transition-all"
            title="Ulangi Suara Terakhir"
          >
            <HiRefresh className="text-base" />
            <span className="hidden sm:inline">Ulangi Suara</span>
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowVoiceModal(true);
          }}
          className="p-3 bg-indigo-600/80 hover:bg-indigo-600 backdrop-blur border border-indigo-400/30 text-white rounded-2xl flex items-center gap-2 text-xs font-bold transition-all shadow-lg"
          title="Pengaturan Suara"
        >
          <HiVolumeUp className="text-lg" />
          <span className="hidden sm:inline">Pengaturan Suara</span>
        </button>
      </div>

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

        {/* Interaction Hint & Keyboard Spacebar Shortcut Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-12 flex flex-col items-center gap-2.5 text-center pointer-events-none"
        >
          <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white text-xs font-bold shadow-2xl flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg border border-indigo-400 font-mono text-xs font-black uppercase tracking-wider shadow-inner">
                SPASI ␣
              </kbd>
            </span>
            <span className="text-white/90">Laptop: Tekan Spasi</span>
            <span className="text-white/40">|</span>
            <span className="text-white/90">Sentuh Layar</span>
          </div>

          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-white/60">
            {isRecording ? "Sedang Mendengar..." : (isProcessing || isPreparing) ? "Sedang Berpikir..." : "Nay Siap Mendengar"}
          </p>
        </motion.div>

      </main>

      {/* VOICE SETTINGS MODAL */}
      <AnimatePresence>
        {showVoiceModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={(e) => {
              e.stopPropagation();
              setShowVoiceModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md">
                    <HiVolumeUp />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base">Pengaturan Suara Kak Bintang</h3>
                    <p className="text-xs font-medium text-slate-500">Sesuaikan kecepatan, volume & pengulangan suara</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVoiceModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-all"
                >
                  <HiX className="text-xl" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <VoiceSettingsPanel compact={false} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          main { height: 100dvh; }
        }
      `}</style>
    </div>
  );
};

export default Playground;

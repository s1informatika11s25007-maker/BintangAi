import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoice } from '../hooks/useVoice';
import { useAccessibility } from '../hooks/useAccessibility';
import { useAI } from '@/features/ai-tutor';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiMicrophone, HiX, HiOutlineLightningBolt, HiOutlineVolumeUp } from 'react-icons/hi';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

const BlindAIAssistant = () => {
  const { isBlind } = useAccessibility();
  const { profile } = useAuthStore();
  const { speak, stopSpeaking, startListening, stopListening } = useVoice();
  const { isRecording, startRecording, stopRecording, audioBlob, clearAudio } = useAudioRecorder();
  const { smartVoiceAssistant } = useAI();
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const lastProcessedBlobRef = useRef(null);
  const lastTranscriptRef = useRef("");

  const isPlaygroundPage = location.pathname.includes('/student/playground');

  const navMap = {
    'dashboard': '/student/dashboard',
    'playground': '/student/playground',
    'tasks': '/student/tasks',
    'modules': '/student/modules',
    'profile': '/profile',
    'community': '/student/community',
    'groups': '/student/community'
  };

  // Improved context gathering - detect items on page
  const getPageContent = () => {
    const main = document.querySelector('main');
    if (!main) return "Beranda Utama";

    const headings = Array.from(main.querySelectorAll('h1, h2, h3')).map(h => h.innerText).join(', ');

    // Find list items (like modules or tasks) using generic selectors
    // We look for anything that looks like a title or clickable item
    const listItems = Array.from(main.querySelectorAll('[data-gesture-item="true"], h3, button, a'))
      .map(el => ({
        text: (el.innerText || el.getAttribute('aria-label') || "").trim(),
        id: el.id || el.getAttribute('data-id')
      }))
      .filter(item => item.text.length > 2 && item.text.length < 100)
      .slice(0, 50) // Capture more items for search
      .map(item => item.text)
      .join('|');

    return `Halaman Aktif: ${headings}. Item di layar: ${listItems}.`;
  };

  const handleAction = useCallback((action, actionData) => {
    console.log("Nay executing action:", action, actionData);

    switch (action) {
      case 'NAVIGATE_TO':
        if (navMap[actionData]) {
          navigate(navMap[actionData]);
        }
        break;
      case 'OPEN_ITEM':
        if (!actionData) break;
        const query = actionData.toLowerCase();

        // Strategy 1: Find by exact text or partial match in clickable elements
        const elements = Array.from(document.querySelectorAll('button, a, [role="button"], [data-gesture-item="true"], h3'));

        let targetElement = elements.find(el => {
          const text = (el.innerText || el.getAttribute('aria-label') || "").toLowerCase();
          return text === query || (text.length > 3 && text.includes(query));
        });

        // Strategy 2: If found a heading (h3), try to find a link/button inside or near it
        if (targetElement && targetElement.tagName === 'H3') {
           const parentLink = targetElement.closest('a') || targetElement.closest('button');
           if (parentLink) targetElement = parentLink;
        }

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => targetElement.click(), 500);
          return true;
        }
        return false;

      case 'ASK_TUTOR':
        if (!actionData) break;
        const playgroundInput = document.querySelector('input[placeholder*="Tulis pesan"]');
        if (playgroundInput) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          nativeInputValueSetter.call(playgroundInput, actionData);
          playgroundInput.dispatchEvent(new Event('input', { bubbles: true }));
          setTimeout(() => {
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
            playgroundInput.dispatchEvent(enterEvent);
          }, 500);
        }
        break;
      case 'SCROLL_DOWN':
        window.scrollBy({ top: window.innerHeight / 1.5, behavior: 'smooth' });
        break;
      case 'SCROLL_UP':
        window.scrollBy({ top: -window.innerHeight / 1.5, behavior: 'smooth' });
        break;
      default:
        console.warn("Unknown action:", action);
    }
  }, [navigate]);

  const handleProcessAudio = useCallback(async (blob) => {
    if (isProcessing || !blob) return;
    setIsProcessing(true);
    setAiResponse("Nay sedang memproses...");

    try {
      const context = getPageContent();
      const studentName = profile?.full_name?.split(' ')[0] || "Teman";
      const response = await smartVoiceAssistant(blob, studentName, context);

      if (response.success) {
        lastTranscriptRef.current = response.transcript;
        setLiveTranscript(response.transcript);
        setAiResponse(response.answer);
        speak(response.answer);

        // DELAYED ACTION FOR BETTER UX
        setTimeout(() => {
          let actionSuccess = false;

          if (response.action) {
            actionSuccess = handleAction(response.action, response.actionData);
          }

          if (response.navigateTo && navMap[response.navigateTo]) {
            const targetPath = navMap[response.navigateTo];
            if (location.pathname !== targetPath) {
              navigate(targetPath);
              actionSuccess = true;
            }
          }

          // Cleanup display after action
          setTimeout(() => {
             setIsProcessing(false);
             setLiveTranscript("");
             setAiResponse("");
          }, 4000);
        }, 1500);
      } else {
        setIsProcessing(false);
        speak("Maaf, Nay kurang jelas mendengar.");
      }
    } catch (err) {
      console.error("Nay process error:", err);
      setIsProcessing(false);
      speak("Waduh, Nay sedang gangguan.");
    } finally {
      clearAudio();
    }
  }, [smartVoiceAssistant, profile, navigate, speak, handleAction, location.pathname, clearAudio, isProcessing]);

  useEffect(() => {
    if (audioBlob && audioBlob !== lastProcessedBlobRef.current) {
      lastProcessedBlobRef.current = audioBlob;
      handleProcessAudio(audioBlob);
    }
  }, [audioBlob, handleProcessAudio]);

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      stopRecording();
      stopListening();
    } else if (!isProcessing) {
      stopSpeaking();
      setAiResponse("");
      setLiveTranscript("Mendengarkan...");
      speak("Ya?", 1.5, true);

      setTimeout(() => {
        startRecording();
        startListening((text) => setLiveTranscript(text));
      }, 400);
    }
  }, [isRecording, isProcessing, startRecording, stopRecording, startListening, stopListening, speak, stopSpeaking]);

  useEffect(() => {
    if (!isBlind) return;
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleMicClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlind, handleMicClick]);

  if (!isBlind || !profile || isPlaygroundPage) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[500] flex flex-col items-center pointer-events-none pb-6 md:pb-12">
      {/* PROFESSIONAL SUBTITLES & FEEDBACK */}
      <AnimatePresence>
        {(isRecording || isProcessing || aiResponse) && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[90%] max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 pointer-events-auto mb-6"
          >
            {/* Visualizer */}
            <div className="flex justify-center gap-1.5 h-8 items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                <motion.div
                  key={i}
                  animate={isRecording ? {
                    height: [8, Math.random() * 32 + 8, 8],
                    backgroundColor: ['#6366f1', '#f43f5e', '#6366f1']
                  } : isProcessing ? {
                    height: [16, 24, 16],
                    backgroundColor: '#818cf8',
                    opacity: [0.5, 1, 0.5]
                  } : { height: 4, backgroundColor: '#475569' }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                  className="w-1.5 rounded-full"
                />
              ))}
            </div>

            <div className="space-y-3">
               {/* User Transcript Subtitle */}
              {liveTranscript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center text-center"
                >
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">
                    {isRecording ? "Suara Kamu" : "Transkrip"}
                  </span>
                  <p className="text-white text-lg md:text-xl font-medium leading-relaxed italic">
                    "{liveTranscript}"
                  </p>
                </motion.div>
              )}

              {/* AI Response Subtitle */}
              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="pt-3 border-t border-white/5 flex flex-col items-center text-center"
                >
                  <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                    <HiOutlineLightningBolt className="animate-pulse" /> Nay Berkata
                  </span>
                  <p className="text-indigo-100 text-base md:text-lg font-bold leading-relaxed">
                    {aiResponse}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="text-center mt-2">
              <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isRecording ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`}>
                {isRecording ? "Mendengarkan..." : isProcessing ? "Berpikir..." : "Nay Selesai"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON */}
      <div className="relative pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMicClick}
          className={`
            w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl
            relative overflow-hidden transition-all duration-500
            ${isRecording ? 'bg-rose-600' : isProcessing ? 'bg-amber-500' : 'bg-indigo-600'}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />

          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 2 }} exit={{ scale: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 bg-rose-400/30 rounded-full"
              />
            )}
          </AnimatePresence>

          <div className="relative z-20 text-white text-4xl md:text-5xl">
            {isProcessing ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                <HiOutlineLightningBolt />
              </motion.div>
            ) : isRecording ? (
              <HiX />
            ) : (
              <HiMicrophone />
            )}
          </div>
        </motion.button>

        {!isRecording && !isProcessing && !aiResponse && (
           <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap shadow-xl"
          >
            Tekan Spasi
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlindAIAssistant;

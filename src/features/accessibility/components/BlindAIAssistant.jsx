import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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

  const isPublicPage = useMemo(() => {
    if (!location?.pathname) return false;
    if (location.pathname === '/') return true;
    const publicPaths = ['/auth', '/login', '/register'];
    return publicPaths.some(path => location.pathname.startsWith(path));
  }, [location?.pathname]);

  const isPlaygroundPage = location.pathname.includes('/student/playground');

  const navMap = useMemo(() => ({
    'dashboard': '/student/dashboard',
    'beranda': '/student/dashboard',
    'home': '/student/dashboard',
    'playground': '/student/playground',
    'tanya-ai': profile?.disability_type === 'tunanetra' ? '/student/playground' : '/student/tanya-ai',
    'tasks': '/student/tasks',
    'quiz': '/student/tasks',
    'quizku': '/student/tasks',
    'modules': '/student/modules',
    'materi': '/student/modules',
    'modul': '/student/modules',
    'profile': '/profile',
    'profil': '/profile',
    'collaboration': '/student/collaboration',
    'grup': '/student/collaboration',
    'community': '/student/collaboration',
    'groups': '/student/collaboration',
    'inbox': '/student/inbox',
    'pesan': '/student/inbox',
    'live-captions': '/student/live-captions',
    'mata-pintar': '/student/live-captions',
  }), [profile?.disability_type]);

  // Try clicking matching button or card on active screen
  const tryClickOnScreenElement = useCallback((transcript) => {
    if (!transcript) return false;
    const clean = transcript.toLowerCase().trim();
    if (!clean) return false;

    const elements = Array.from(document.querySelectorAll('button, a, [role="button"], [data-gesture-item="true"], h3'));

    for (const el of elements) {
      const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase().trim();
      if (!text) continue;

      if (text === clean || text.includes(clean) || clean.includes(text)) {
        let target = el;
        if (target.tagName === 'H3') {
          const parent = target.closest('a') || target.closest('button');
          if (parent) target = parent;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          try {
            target.click();
          } catch(e) {}
        }, 200);
        return true;
      }
    }
    return false;
  }, []);

  // Improved context gathering - detect items on page
  const getPageContent = () => {
    const main = document.querySelector('main');
    if (!main) return "Beranda Utama";

    const headings = Array.from(main.querySelectorAll('h1, h2, h3')).map(h => h.innerText).join(', ');

    const listItems = Array.from(main.querySelectorAll('[data-gesture-item="true"], h3, button, a'))
      .map(el => ({
        text: (el.innerText || el.getAttribute('aria-label') || "").trim(),
        id: el.id || el.getAttribute('data-id')
      }))
      .filter(item => item.text.length > 2 && item.text.length < 100)
      .slice(0, 50)
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

        const elements = Array.from(document.querySelectorAll('button, a, [role="button"], [data-gesture-item="true"], h3'));

        let targetElement = elements.find(el => {
          const text = (el.innerText || el.getAttribute('aria-label') || "").toLowerCase();
          return text === query || (text.length > 3 && text.includes(query));
        });

        if (targetElement && targetElement.tagName === 'H3') {
           const parentLink = targetElement.closest('a') || targetElement.closest('button');
           if (parentLink) targetElement = parentLink;
        }

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => targetElement.click(), 300);
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
          }, 300);
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
  }, [navigate, navMap]);

  const handleProcessAudio = useCallback(async (blob) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setAiResponse("Nay sedang memproses...");

    try {
      const context = getPageContent();
      const studentName = profile?.full_name?.split(' ')[0] || "Teman";

      // Save and prioritize live speech transcript captured by Web Speech API
      const speechInput = (lastTranscriptRef.current && lastTranscriptRef.current !== "Mendengarkan...")
        ? lastTranscriptRef.current
        : blob;

      const response = await smartVoiceAssistant(speechInput, studentName, context);

      if (response && response.success) {
        const transcriptText = response.transcript || (typeof speechInput === 'string' ? speechInput : "Bantu Navigasi");
        lastTranscriptRef.current = transcriptText;
        setLiveTranscript(transcriptText);

        // 1. Try matching screen button/element click
        const elementClicked = tryClickOnScreenElement(transcriptText);

        // 2. Target Route Determination
        let targetRoute = null;
        if (response.navigateTo && navMap[response.navigateTo]) {
          targetRoute = navMap[response.navigateTo];
        }

        // Clean concise response (no long guide paragraphs)
        const shortConfirmation = response.answer || "Membuka Halaman...";
        setAiResponse(shortConfirmation);
        speak(shortConfirmation);

        // INSTANT AUTOMATIC NAVIGATION (< 200ms)
        if (targetRoute && location.pathname !== targetRoute) {
          setTimeout(() => {
            navigate(targetRoute);
          }, 200);
        }

        setTimeout(() => {
           setIsProcessing(false);
           setLiveTranscript("");
           setAiResponse("");
        }, 2500);
      } else {
        setIsProcessing(false);
        speak("Membuka Beranda Utama...");
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error("Nay process error:", err);
      setIsProcessing(false);
      speak("Membuka Beranda Utama...");
      navigate('/student/dashboard');
    } finally {
      clearAudio();
    }
  }, [smartVoiceAssistant, profile, navigate, speak, tryClickOnScreenElement, location.pathname, clearAudio, isProcessing, navMap]);

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
      lastTranscriptRef.current = "";
      speak("Ya?", 1.5, true);

      setTimeout(() => {
        startRecording();
        startListening((text) => {
          if (text) {
            setLiveTranscript(text);
            lastTranscriptRef.current = text;
          }
        });
      }, 400);
    }
  }, [isRecording, isProcessing, startRecording, stopRecording, startListening, stopListening, speak, stopSpeaking]);

  useEffect(() => {
    if (!isBlind || isPublicPage) return;
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleMicClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlind, isPublicPage, handleMicClick]);

  if (!isBlind || !profile || isPlaygroundPage || isPublicPage) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[500] flex flex-col items-center pointer-events-none pb-6 md:pb-12">
      <AnimatePresence>
        {(isRecording || isProcessing || aiResponse) && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[90%] max-w-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 pointer-events-auto mb-6"
          >
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

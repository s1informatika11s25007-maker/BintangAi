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
  const { smartVoiceAssistant, transcribeAudio } = useAI();
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

  // Smart Screen & Quiz Option Clicker
  const tryClickOnScreenElement = useCallback((transcript) => {
    if (!transcript) return false;
    const raw = transcript.toLowerCase().trim();
    if (!raw) return false;

    // Clean common Indonesian voice prefixes
    let clean = raw
      .replace(/^(jawaban|pilihan|opsi|pilih|jawab|nomor|no|saya pilih|pilihkan|jawabannya|pilihannya)\s+/gi, '')
      .trim();

    // Quiz Option Mapping (A=0, B=1, C=2, D=3 / 1=0, 2=1, 3=2, 4=3)
    let optionIndex = -1;

    const isOptionA = ['a', 'satu', '1', 'alfa', 'alpha'].some(k => clean === k || raw.includes('pilihan a') || raw.includes('jawaban a') || raw.includes('opsi a') || raw.includes('pilih a'));
    const isOptionB = ['b', 'dua', '2', 'bravo'].some(k => clean === k || raw.includes('pilihan b') || raw.includes('jawaban b') || raw.includes('opsi b') || raw.includes('pilih b'));
    const isOptionC = ['c', 'tiga', '3', 'charlie'].some(k => clean === k || raw.includes('pilihan c') || raw.includes('jawaban c') || raw.includes('opsi c') || raw.includes('pilih c'));
    const isOptionD = ['d', 'empat', '4', 'delta'].some(k => clean === k || raw.includes('pilihan d') || raw.includes('jawaban d') || raw.includes('opsi d') || raw.includes('pilih d'));

    if (isOptionA) optionIndex = 0;
    else if (isOptionB) optionIndex = 1;
    else if (isOptionC) optionIndex = 2;
    else if (isOptionD) optionIndex = 3;

    const elements = Array.from(document.querySelectorAll('button, a, [role="button"], [data-gesture-item="true"], [data-option-index], h3'));

    // 1. If option index is matched, find the option button by index or data-option-index or aria-label
    if (optionIndex !== -1) {
      const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
      const targetOptionBtn = elements.find(el => {
        const aria = (el.getAttribute('aria-label') || '').toLowerCase();
        const text = (el.innerText || '').toLowerCase();
        const optIndexAttr = el.getAttribute('data-option-index');
        return optIndexAttr === String(optionIndex) ||
               aria.startsWith(`pilihan ${optionLetter.toLowerCase()}`) ||
               text.startsWith(optionLetter.toLowerCase());
      });

      if (targetOptionBtn) {
        targetOptionBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          try { targetOptionBtn.click(); } catch(e) {}
        }, 100);
        return true;
      }
    }

    // 2. Check quiz option texts directly if on quiz page
    const quizOptionButtons = Array.from(document.querySelectorAll('[data-option-index]'));
    if (quizOptionButtons.length > 0) {
      for (const btn of quizOptionButtons) {
        const optText = (btn.getAttribute('data-option-text') || btn.innerText || '').toLowerCase().trim();
        if (optText && (optText === clean || raw.includes(optText) || optText.includes(clean))) {
          btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            try { btn.click(); } catch(e) {}
          }, 100);
          return true;
        }
      }
    }

    // 3. Fuzzy text match across interactive elements
    for (const el of elements) {
      const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase().trim();
      if (!text || text.length < 1) continue;

      if (text === clean || text === raw || text.includes(clean) || clean.includes(text)) {
        let target = el;
        if (target.tagName === 'H3') {
          const parent = target.closest('a') || target.closest('button');
          if (parent) target = parent;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          try { target.click(); } catch(e) {}
        }, 100);
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
      const isQuizPage = location.pathname.includes('/student/quiz/');
      const context = getPageContent();
      const studentName = profile?.full_name?.split(' ')[0] || "Teman";

      // Resolve actual transcript text from Speech Recognition or Audio Blob transcription
      let transcriptText = "";
      if (lastTranscriptRef.current && lastTranscriptRef.current !== "Mendengarkan...") {
        transcriptText = lastTranscriptRef.current.trim();
      } else if (typeof blob === 'string' && blob.trim() !== '') {
        transcriptText = blob.trim();
      } else if (blob) {
        const transRes = await transcribeAudio(blob);
        if (transRes?.success && transRes?.text) {
          transcriptText = transRes.text.trim();
        }
      }

      if (transcriptText) {
        setLiveTranscript(transcriptText);
      }

      const elementClicked = tryClickOnScreenElement(transcriptText);

      if (elementClicked) {
        setAiResponse("Memilih jawaban...");
        speak("Memilih jawaban...", 1.0, true);
        setTimeout(() => {
          setIsProcessing(false);
          setLiveTranscript("");
          setAiResponse("");
        }, 2000);
        return;
      }

      // ON QUIZ PAGE: Focus ONLY on quiz answers! Never run AI navigation or redirect!
      if (isQuizPage) {
        const lower = transcriptText.toLowerCase();
        const isExitCommand = lower.includes('keluar') || lower.includes('beranda') || lower.includes('tutup kuis') || lower.includes('dashboard');

        if (isExitCommand) {
          setAiResponse("Kembali ke Beranda...");
          speak("Kembali ke Beranda Utama.", 1.0, true);
          setTimeout(() => {
            navigate('/student/dashboard');
          }, 300);
        } else {
          const notFoundText = "Pilihan tidak dikenali. Katakan pilihan A, B, C, atau D.";
          setAiResponse(notFoundText);
          speak(notFoundText, 1.0, true);
        }

        setTimeout(() => {
          setIsProcessing(false);
          setLiveTranscript("");
          setAiResponse("");
        }, 2500);
        return;
      }

      const response = await smartVoiceAssistant(transcriptText || blob, studentName, context);

      if (response && response.success) {
        const finalTranscript = response.transcript || transcriptText;
        lastTranscriptRef.current = finalTranscript;
        setLiveTranscript(finalTranscript);

        const secondaryClick = tryClickOnScreenElement(finalTranscript);

        let targetRoute = null;
        if (response.navigateTo && navMap[response.navigateTo]) {
          targetRoute = navMap[response.navigateTo];
        }

        const shortConfirmation = response.answer || (secondaryClick ? "Aksi dilaksanakan..." : "Baik.");
        setAiResponse(shortConfirmation);
        speak(shortConfirmation);

        if (targetRoute && location.pathname !== targetRoute && !secondaryClick) {
          setTimeout(() => {
            navigate(targetRoute);
          }, 300);
        }

        setTimeout(() => {
           setIsProcessing(false);
           setLiveTranscript("");
           setAiResponse("");
        }, 2500);
      } else {
        setIsProcessing(false);
        speak("Maaf, Nay kurang jelas mendengarnya. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Nay process error:", err);
      setIsProcessing(false);
      speak("Maaf, terjadi kendala. Silakan coba lagi.");
    } finally {
      clearAudio();
    }
  }, [isProcessing, location.pathname, profile, tryClickOnScreenElement, transcribeAudio, smartVoiceAssistant, navMap, speak, navigate, clearAudio]);

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
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
      if (e.code === 'Space' && !isInput) {
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
              <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isRecording ? "Mendengarkan..." : isProcessing ? "Berpikir..." : "Nay Selesai"}`}>
                {isRecording ? "Mendengarkan..." : isProcessing ? "Berpikir..." : "Nay Selesai"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative pointer-events-auto">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            handleMicClick();
          }}
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

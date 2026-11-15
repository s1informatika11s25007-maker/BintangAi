import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoice } from '../hooks/useVoice';
import { useAccessibility } from '../hooks/useAccessibility';
import { useAI } from '@/features/ai-tutor';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HiMicrophone, HiX, HiOutlineLightningBolt,
  HiOutlineVolumeUp, HiMinus, HiChevronUp, HiChevronDown
} from 'react-icons/hi';
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

  // Widget States for Minimize / Close / Restore
  const [isWidgetClosed, setIsWidgetClosed] = useState(false);
  const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);

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
    'beranda': '/',
    'landing': '/',
    'home': '/',
    'utama': '/',
    'masuk': '/auth/login',
    'login': '/auth/login',
    'daftar': '/auth/register',
    'register': '/auth/register',
    'buat akun': '/auth/register',
    'pendaftaran': '/auth/register',
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

    let clean = raw
      .replace(/^(jawaban|pilihan|opsi|pilih|jawab|nomor|no|saya pilih|pilihkan|jawabannya|pilihannya)\s+/gi, '')
      .trim();

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

    if (optionIndex !== -1) {
      const optionLetter = String.fromCharCode(65 + optionIndex);
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
        return { clicked: true, label: `pilihan ${optionLetter}` };
      }
    }

    // Fuzzy text match across interactive elements
    for (const el of elements) {
      const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase().trim();
      if (!text || text.length < 1) continue;

      if (text === clean || text === raw || text.includes(clean) || clean.includes(text)) {
        let target = el;
        if (target.tagName === 'H3') {
          const parent = target.closest('a') || target.closest('button');
          if (parent) target = parent;
        }

        const href = target.getAttribute('href') || target.getAttribute('data-nav-target');
        if (href && href.startsWith('/')) {
          navigate(href);
          return { clicked: true, label: text };
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          try { target.click(); } catch(e) {}
        }, 100);
        return { clicked: true, label: text };
      }
    }
    return false;
  }, [navigate]);

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

  const handleProcessAudio = useCallback(async (blob) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setAiResponse("Nay sedang memproses...");

    try {
      const isQuizPage = location.pathname.includes('/student/quiz/');
      const context = getPageContent();
      const studentName = profile?.full_name?.split(' ')[0] || "Teman";

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

      const rawText = (transcriptText || "").toLowerCase().trim();

      // 1. FAST NAVIGATION MATCH (< 50ms Direct Routing)
      if (rawText.includes('masuk') || rawText.includes('login') || rawText.includes('halaman masuk')) {
        setAiResponse("Membuka halaman masuk...");
        speak("Membuka halaman masuk akun.", 1.0, true);
        setTimeout(() => {
          navigate('/auth/login');
          setIsProcessing(false);
          setLiveTranscript("");
          setAiResponse("");
        }, 300);
        return;
      }

      if (rawText.includes('daftar') || rawText.includes('register') || rawText.includes('buat akun') || rawText.includes('pendaftaran')) {
        setAiResponse("Membuka pendaftaran...");
        speak("Membuka halaman pendaftaran akun baru.", 1.0, true);
        setTimeout(() => {
          navigate('/auth/register');
          setIsProcessing(false);
          setLiveTranscript("");
          setAiResponse("");
        }, 300);
        return;
      }

      if (rawText.includes('beranda') || rawText.includes('landing') || rawText.includes('home') || rawText.includes('utama')) {
        setAiResponse("Membuka halaman utama...");
        speak("Membuka halaman utama SambungJaga.", 1.0, true);
        setTimeout(() => {
          navigate('/');
          setIsProcessing(false);
          setLiveTranscript("");
          setAiResponse("");
        }, 300);
        return;
      }

      // 2. SCREEN ELEMENT CLICK MATCH
      const elementClicked = tryClickOnScreenElement(transcriptText);

      if (elementClicked && elementClicked.clicked) {
        const confirmMsg = isQuizPage ? "Memilih jawaban..." : `Membuka ${elementClicked.label || 'pilihan'}...`;
        setAiResponse(confirmMsg);
        speak(confirmMsg, 1.0, true);
        setTimeout(() => {
          setIsProcessing(false);
          setLiveTranscript("");
          setAiResponse("");
        }, 2000);
        return;
      }

      // ON QUIZ PAGE: Focus ONLY on quiz answers
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

            // ⚡ REALTIME INSTANT VOICE COMMAND STREAM MATCH (< 50ms Direct Routing)
            const clean = text.toLowerCase().trim();
            if (clean.includes('masuk') || clean.includes('login') || clean.includes('halaman masuk')) {
              stopRecording();
              stopListening();
              speak("Membuka halaman masuk akun.", 1.0, true);
              navigate('/auth/login');
            } else if (clean.includes('daftar') || clean.includes('register') || clean.includes('buat akun') || clean.includes('pendaftaran')) {
              stopRecording();
              stopListening();
              speak("Membuka halaman pendaftaran akun baru.", 1.0, true);
              navigate('/auth/register');
            } else if (clean.includes('beranda') || clean.includes('landing') || clean.includes('home') || clean.includes('utama')) {
              stopRecording();
              stopListening();
              speak("Membuka halaman utama SambungJaga.", 1.0, true);
              navigate('/');
            }
          }
        });
      }, 400);
    }
  }, [isRecording, isProcessing, startRecording, stopRecording, startListening, stopListening, speak, stopSpeaking, navigate]);

  // Handle Widget Minimize / Close / Restore
  const handleCloseWidget = () => {
    stopSpeaking();
    if (isRecording) {
      stopRecording();
      stopListening();
    }
    setIsWidgetClosed(true);
    speak("Asisten Suara ditutup. Tekan tombol aktifkan mikrofon di kanan bawah atau tekan Spasi untuk membuka kembali.", 1.0, true);
  };

  const handleMinimizeWidget = () => {
    setIsWidgetMinimized(true);
    speak("Tampilan Asisten Suara diminimalkan.", 1.0, true);
  };

  const handleRestoreWidget = () => {
    setIsWidgetClosed(false);
    setIsWidgetMinimized(false);
    speak("Asisten Suara diaktifkan kembali.", 1.0, true);
    setTimeout(() => handleMicClick(), 300);
  };

  useEffect(() => {
    if (!isBlind) return;
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        if (isWidgetClosed || isWidgetMinimized) {
          setIsWidgetClosed(false);
          setIsWidgetMinimized(false);
        }
        handleMicClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBlind, handleMicClick, isWidgetClosed, isWidgetMinimized]);

  if (!isBlind || isPlaygroundPage) return null;

  // 1. STATE 1: WIDGET CLOSED -> Render neat floating activation button
  if (isWidgetClosed) {
    return (
      <div className="fixed bottom-6 right-6 z-[600] pointer-events-auto">
        <motion.button
          type="button"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={handleRestoreWidget}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-full shadow-2xl border-2 border-amber-400/80 font-extrabold text-xs flex items-center gap-3 transition-all active:scale-95"
          title="Aktifkan Mikrofon Navigasi Suara (Tekan Spasi)"
        >
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <HiMicrophone className="text-lg text-amber-300" />
          <span>Aktifkan Mikrofon Navigasi</span>
        </motion.button>
      </div>
    );
  }

  // 2. STATE 2: WIDGET MINIMIZED -> Render compact pill button + control icons
  if (isWidgetMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[600] flex items-center gap-2 pointer-events-auto">
        <motion.button
          type="button"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={handleMicClick}
          className={`
            px-4 py-2.5 rounded-full shadow-2xl font-extrabold text-xs flex items-center gap-2 transition-all active:scale-95 border
            ${isRecording ? 'bg-rose-600 text-white border-rose-400 animate-pulse' : 'bg-slate-900 text-white border-amber-400/60'}
          `}
        >
          <HiMicrophone className="text-base text-amber-300" />
          <span>{isRecording ? "Mendengarkan..." : "Bicara Navigasi (Spasi)"}</span>
        </motion.button>

        <button
          type="button"
          onClick={() => setIsWidgetMinimized(false)}
          className="w-9 h-9 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full flex items-center justify-center border border-slate-700 shadow-md transition-all active:scale-90"
          title="Perbesar Tampilan Asisten Suara"
        >
          <HiChevronUp className="text-base" />
        </button>

        <button
          type="button"
          onClick={handleCloseWidget}
          className="w-9 h-9 bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-400 rounded-full flex items-center justify-center border border-slate-700 shadow-md transition-all active:scale-90"
          title="Tutup Asisten Suara"
        >
          <HiX className="text-base" />
        </button>
      </div>
    );
  }

  // 3. STATE 3: FULL FLOATING ASSISTANT WIDGET
  return (
    <div className="fixed inset-x-0 bottom-0 z-[500] flex flex-col items-center pointer-events-none pb-6 md:pb-10">
      <AnimatePresence>
        {(isRecording || isProcessing || aiResponse || true) && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[92%] max-w-xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 p-5 sm:p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-3 pointer-events-auto mb-4 relative"
          >
            {/* Top Control Bar: Title & Minimize / Close Buttons */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  🎤 Nay Asisten Navigasi Suara
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleMinimizeWidget}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition-all"
                  title="Kecilkan Tampilan"
                >
                  <HiMinus className="text-sm" />
                </button>
                <button
                  type="button"
                  onClick={handleCloseWidget}
                  className="p-1.5 bg-white/10 hover:bg-rose-500/30 text-slate-300 hover:text-rose-400 rounded-xl transition-all"
                  title="Tutup Asisten Suara"
                >
                  <HiX className="text-sm" />
                </button>
              </div>
            </div>

            {/* Quick Action Hints on Public Pages */}
            {isPublicPage && !isRecording && !isProcessing && !aiResponse && (
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 text-center space-y-1">
                <p className="text-[11px] font-bold text-amber-300">
                  💡 Katakan <strong className="text-white">"Masuk"</strong> untuk ke Halaman Login, atau <strong className="text-white">"Daftar Gratis"</strong> untuk Pendaftaran Akun Baru.
                </p>
              </div>
            )}

            {/* Waveform Equalizer Bar */}
            <div className="flex justify-center gap-1.5 h-6 items-center my-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                <motion.div
                  key={i}
                  animate={isRecording ? {
                    height: [8, Math.random() * 28 + 8, 8],
                    backgroundColor: ['#6366f1', '#f43f5e', '#6366f1']
                  } : isProcessing ? {
                    height: [12, 20, 12],
                    backgroundColor: '#818cf8',
                    opacity: [0.5, 1, 0.5]
                  } : { height: 4, backgroundColor: '#475569' }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                  className="w-1.5 rounded-full"
                />
              ))}
            </div>

            {/* Live Transcript & Response Display */}
            <div className="space-y-2">
              {liveTranscript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center text-center"
                >
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mb-0.5">
                    {isRecording ? "Suara Kamu" : "Transkrip"}
                  </span>
                  <p className="text-white text-base md:text-lg font-medium italic">
                    "{liveTranscript}"
                  </p>
                </motion.div>
              )}

              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="pt-2 border-t border-white/5 flex flex-col items-center text-center"
                >
                  <span className="text-[9px] text-rose-400 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                    <HiOutlineLightningBolt className="animate-pulse" /> Respon Navigasi
                  </span>
                  <p className="text-indigo-100 text-sm md:text-base font-bold">
                    {aiResponse}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="text-center mt-1">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isRecording ? "text-rose-400 animate-pulse" : isProcessing ? "text-amber-400" : "text-slate-400"}`}>
                {isRecording ? "Mendengarkan..." : isProcessing ? "Berpikir..." : "Siap Mendengarkan"}
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
            w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl
            relative overflow-hidden transition-all duration-500
            ${isRecording ? 'bg-rose-600 ring-8 ring-rose-500/30' : isProcessing ? 'bg-amber-500' : 'bg-indigo-600'}
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

          <div className="relative z-20 text-white text-3xl sm:text-4xl">
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
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-xl border border-indigo-400/40"
          >
            Tekan Spasi
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlindAIAssistant;

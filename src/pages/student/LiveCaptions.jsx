import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '@/features/ai-tutor/hooks/useAI';
import StudentSidebar from '@/components/layout/StudentSidebar';
import { HiMicrophone, HiStop, HiTrash, HiDocumentText, HiSparkles, HiExclamation } from 'react-icons/hi';

const LiveCaptions = () => {
  const { transcribeAudio, loading: isTranscribing } = useAI();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [fullText, setFullText] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const startRecording = () => {
    setError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Browser Anda tidak mendukung pengenalan suara. Gunakan Chrome atau Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';
      recognition.maxAlternatives = 3; // Mendapatkan alternatif untuk akurasi lebih baik

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += transcriptSegment;
          } else {
            currentInterim += transcriptSegment;
          }
        }

        setInterimText(currentInterim);

        if (currentFinal) {
          const cleanText = currentFinal.trim();
          setTranscript(prev => [...prev, { id: Date.now(), text: cleanText }]);
          setFullText(prev => prev + " " + cleanText);
          setInterimText(''); // Clear interim when final arrives
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setError("Akses Mikrofon Ditolak. Harap izinkan di pengaturan browser Anda.");
        } else if (event.error === 'network') {
          setError("Masalah Jaringan. Periksa koneksi internet Anda.");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        // Jangan otomatis set false jika error atau tidak sengaja terputus
        // Kecuali jika memang sengaja dihentikan
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Start Error:", err);
      setError("Gagal memulai Mata Pintar: " + err.message);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const clearTranscript = () => {
    setTranscript([]);
    setFullText('');
  };

  const saveTranscript = async () => {
    if (!fullText) return;
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Transkrip-BintangAi-${new Date().toLocaleDateString()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Mencegah scrolling saat tekan spasi
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording]);

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans selection:bg-indigo-500/30 overflow-hidden text-white">
      <StudentSidebar />

      <main className="flex-1 flex flex-col h-[100dvh] relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        </div>

        {/* Header - Modern Glassmorphism */}
        <header className="px-4 md:px-10 py-4 md:py-6 border-b border-white/5 flex items-center justify-between bg-slate-950/40 backdrop-blur-2xl shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="relative group">
               <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-500 ${isRecording ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse' : 'bg-slate-700'}`} />
               {isRecording && <div className="absolute inset-0 w-3 h-3 md:w-4 md:h-4 rounded-full bg-rose-500 animate-ping opacity-75" />}
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-black text-white tracking-tighter flex items-center gap-2 md:gap-3">
                MATA PINTAR <span className="px-2 md:px-3 py-0.5 md:py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-[8px] md:text-[10px] rounded-full uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20">Ultra Live</span>
              </h1>
              <p className="hidden md:block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">AI-Powered Real-Time Assistive Transcription</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             {fullText && (
               <>
                 <button
                   onClick={saveTranscript}
                   className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] md:text-[11px] font-black uppercase tracking-widest rounded-xl md:rounded-2xl transition-all active:scale-95"
                 >
                   <HiDocumentText className="text-sm md:text-xl" /> <span className="hidden sm:inline">Simpan Laporan</span>
                 </button>
                 <button
                   onClick={clearTranscript}
                   className="p-2 md:p-3.5 bg-rose-500/5 hover:bg-rose-500/20 text-rose-500/40 hover:text-rose-500 rounded-xl md:rounded-2xl border border-rose-500/10 transition-all active:scale-95"
                   title="Bersihkan"
                 >
                   <HiTrash className="text-sm md:text-xl" />
                 </button>
               </>
             )}
          </div>
        </header>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mx-4 md:mx-10 mt-4 md:mt-8 p-4 md:p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl md:rounded-[2rem] flex items-start gap-4 md:gap-6 z-40 backdrop-blur-xl"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 bg-rose-500/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                <HiExclamation className="text-rose-500 text-xl md:text-3xl" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-rose-500 mb-1">Peringatan Sistem</h4>
                <p className="text-[10px] md:text-xs font-bold text-rose-100/70 leading-relaxed">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-400 font-black text-[10px] md:text-xs uppercase tracking-widest p-2">Tutup</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption Display Area - Immersive Typography */}
        <div className="flex-1 overflow-y-auto px-4 md:px-20 lg:px-40 py-8 md:py-20 space-y-8 md:space-y-16 no-scrollbar z-10 scroll-smooth">
          <AnimatePresence mode="popLayout" initial={false}>
            {transcript.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                className={`relative group ${index === transcript.length - 1 ? 'mb-4' : ''}`}
              >
                <div className="absolute -left-4 md:-left-12 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] hidden md:block" />
                <p className="text-3xl md:text-6xl lg:text-8xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-all duration-700 hover:text-indigo-200 uppercase">
                  {item.text}
                </p>
                <div className="mt-4 flex items-center gap-4 opacity-30">
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">{new Date(item.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </motion.div>
            ))}

            {interimText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.8, y: 0 }}
                className="relative"
              >
                <p className="text-3xl md:text-6xl lg:text-8xl font-black text-indigo-400 leading-[1.1] tracking-tighter italic uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]">
                  {interimText}
                  <span className="inline-block w-3 md:w-6 h-10 md:h-20 bg-indigo-500/60 ml-3 animate-pulse rounded-full align-middle shadow-[0_0_20px_rgba(99,102,241,0.4)]" />
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isRecording && transcript.length === 0 && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-10 md:space-y-16 mt-10 md:mt-20 px-6">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0],
                  boxShadow: [
                    "0 0 40px rgba(79, 70, 229, 0.2)",
                    "0 0 80px rgba(79, 70, 229, 0.4)",
                    "0 0 40px rgba(79, 70, 229, 0.2)"
                  ]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-40 h-40 md:w-64 md:h-64 rounded-[4rem] bg-indigo-600/10 flex items-center justify-center text-6xl md:text-8xl text-indigo-500 border border-indigo-500/20"
              >
                <HiMicrophone />
              </motion.div>
              <div className="space-y-4 md:space-y-6 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">Siap Mendengar</h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs leading-loose">Tekan tombol di bawah untuk mengaktifkan kecerdasan buatan penangkap suara tercanggih.</p>
              </div>
            </div>
          )}
          <div ref={scrollRef} className="h-40 md:h-64" />
        </div>

        {/* Dynamic Controls - Bottom Dock */}
        <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[90%] md:max-w-xl z-50">
          <motion.div
            layout
            className="bg-white/5 backdrop-blur-3xl border border-white/10 p-3 md:p-5 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex items-center justify-between gap-4"
          >
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 px-6 md:px-12 py-5 md:py-7 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[1.8rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 group"
              >
                <div className="flex items-center gap-3">
                  <HiMicrophone className="text-xl md:text-2xl group-hover:rotate-12 transition-transform" />
                  <span className="text-xs md:text-sm">Mulai Mendengar</span>
                </div>
                <span className="hidden md:block text-[9px] opacity-60 font-medium bg-white/10 px-2 py-1 rounded-lg">TEKAN SPASI</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 px-6 md:px-12 py-5 md:py-7 bg-rose-500 text-white rounded-[1.8rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-rose-500/20 group"
              >
                <div className="flex items-center gap-3">
                  <HiStop className="text-xl md:text-2xl" />
                  <span className="text-xs md:text-sm">Berhenti</span>
                </div>
                <span className="hidden md:block text-[9px] opacity-60 font-medium bg-black/10 px-2 py-1 rounded-lg">TEKAN SPASI</span>
              </button>
            )}

            <div className={`flex items-center gap-3 px-4 md:px-8 border-l border-white/5 transition-opacity duration-500 ${isRecording ? 'opacity-100' : 'opacity-30'}`}>
               <div className="flex gap-1.5">
                  <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isRecording ? 'bg-emerald-500 animate-bounce [animation-delay:-0.3s]' : 'bg-slate-700'}`} />
                  <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isRecording ? 'bg-emerald-500 animate-bounce [animation-delay:-0.15s]' : 'bg-slate-700'}`} />
                  <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isRecording ? 'bg-emerald-500 animate-bounce' : 'bg-slate-700'}`} />
               </div>
               <span className="hidden sm:inline text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                 {isRecording ? 'Sistem Aktif' : 'Standby'}
               </span>
            </div>
          </motion.div>
        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @media (max-width: 768px) {
          .text-huge {
            font-size: 2rem;
            line-height: 1.2;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveCaptions;

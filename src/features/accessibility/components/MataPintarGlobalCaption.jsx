import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { HiMicrophone, HiStop, HiAdjustments, HiX, HiPencilAlt, HiCheck, HiChevronDown, HiChevronUp, HiMinus } from 'react-icons/hi';

let globalCaptionListeners = [];

export const globalCaptionBus = {
  emit: (text, speaker = 'Guru', type = 'speech') => {
    globalCaptionListeners.forEach(fn => fn(text, speaker, type));
  }
};

export default function MataPintarGlobalCaption() {
  const location = useLocation();
  const { profile } = useAuthStore();
  const {
    mode,
    isLiveCaptionActive,
    captionFontSize,
    captionBgColor,
    captionPosition,
    setCaptionSettings
  } = useAccessibilityStore();

  const isDeaf = mode === 'tunarungu' || isLiveCaptionActive;

  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState('Guru');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const recognitionRef = useRef(null);
  const idRef = useRef(0);

  const isPublicPage = useMemo(() => {
    if (!location?.pathname) return false;
    if (location.pathname === '/') return true;
    const publicPaths = ['/auth', '/login', '/register'];
    return publicPaths.some(path => location.pathname.startsWith(path));
  }, [location?.pathname]);

  const isLiveCaptionsPage = location.pathname.includes('/student/live-captions');

  // Handle external caption events (e.g. AI Tutor replies or Ambient Sounds)
  useEffect(() => {
    if (!isDeaf || isPublicPage) return;

    const handler = (text, speaker = 'Guru', type = 'speech') => {
      if (!text) return;
      const id = ++idRef.current;
      setCaptions(prev => [...prev.slice(-8), { id, text, speaker, type, timestamp: new Date() }]);
    };

    globalCaptionListeners.push(handler);
    return () => {
      globalCaptionListeners = globalCaptionListeners.filter(fn => fn !== handler);
    };
  }, [isDeaf, isPublicPage]);

  // 🎯 100% BROWSER BUILT-IN WEB SPEECH API (SpeechRecognition)
  const startCapturing = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += text;
          } else {
            currentInterim += text;
          }
        }

        setInterimText(currentInterim);

        if (currentFinal.trim()) {
          const clean = currentFinal.trim();

          let speaker = activeSpeaker;
          let type = 'speech';

          if (/bel|lonceng|istirahat|pergantian/i.test(clean)) {
            speaker = 'Suara Lingkungan';
            type = 'ambient';
          } else if (/tepuk tangan|sorak/i.test(clean)) {
            speaker = 'Suara Lingkungan';
            type = 'ambient';
          }

          const id = ++idRef.current;
          setCaptions(prev => [...prev.slice(-8), { id, text: clean, speaker, type, timestamp: new Date() }]);
          setInterimText('');
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        if (isListening) {
          try { recognition.start(); } catch(e) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch(e) {
      setIsListening(false);
    }
  }, [activeSpeaker, isListening]);

  const stopCapturing = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    setIsListening(false);
  }, []);

  const toggleCapturing = useCallback(() => {
    if (isListening) stopCapturing();
    else startCapturing();
  }, [isListening, startCapturing, stopCapturing]);

  // 🎯 SHORTCUT SPASI UNTUK LAPTOP / DESKTOP (Space Key to toggle mic)
  useEffect(() => {
    if (!isDeaf || isPublicPage || isLiveCaptionsPage) return;

    const handleKeyDown = (e) => {
      const tag = e.target ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleCapturing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeaf, isPublicPage, isLiveCaptionsPage, toggleCapturing]);

  const handleSaveEdit = (id) => {
    setCaptions(prev => prev.map(c => c.id === id ? { ...c, text: editingText } : c));
    setEditingId(null);
    setEditingText('');
  };

  // Font Size Classes
  const fontSizeClasses = {
    small: 'text-xs',
    medium: 'text-xs md:text-sm',
    large: 'text-sm md:text-base font-bold',
    xlarge: 'text-base md:text-lg font-black'
  };

  // Background Theme Classes
  const bgThemeClasses = {
    dark: 'bg-slate-900/90 border-slate-700/60 text-white backdrop-blur-xl',
    black: 'bg-black border-zinc-800 text-white',
    indigo: 'bg-indigo-950/95 border-indigo-700/60 text-indigo-100 backdrop-blur-xl',
    amber: 'bg-amber-950/95 border-amber-600/60 text-amber-100 backdrop-blur-xl'
  };

  if (!isDeaf || !profile || isPublicPage || isLiveCaptionsPage) return null;

  if (isMinimized) {
    return (
      <div
        className={`fixed left-4 right-4 z-[350] flex flex-col items-end pointer-events-none transition-all duration-500 ${
          captionPosition === 'bottom' ? 'bottom-4' : 'top-3'
        }`}
      >
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsMinimized(false)}
          className="pointer-events-auto px-4 py-2 bg-slate-950/95 border border-white/20 text-emerald-400 font-black text-xs rounded-full shadow-2xl backdrop-blur-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
        >
          <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
          <span>👁️ Mata Pintar - Caption</span>
          <span className="text-[9px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full uppercase">Perbesar ↗</span>
        </motion.button>
      </div>
    );
  }

  return (
    <>
      {/* 🛡️ UNOBTRUSIVE FLOATING CAPTION DOCK (POINTER EVENTS NONE ON WRAPPER TO NEVER BLOCK MAIN CONTENT/BUTTONS) */}
      <div
        className={`fixed left-4 right-4 z-[350] flex flex-col items-end pointer-events-none transition-all duration-500 ${
          captionPosition === 'bottom' ? 'bottom-4' : 'top-3'
        }`}
      >
        <div className="w-full max-w-2xl pointer-events-auto flex flex-col gap-1">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-xl text-white text-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
              <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                Mata Pintar – Caption
              </h4>

              {/* Speaker Select */}
              <select
                value={activeSpeaker}
                onChange={(e) => setActiveSpeaker(e.target.value)}
                className="bg-white/10 text-white border border-white/20 rounded-md px-1.5 py-0.5 text-[9px] font-bold outline-none cursor-pointer"
              >
                <option value="Guru" className="bg-slate-900 text-white">👨‍🏫 Guru</option>
                <option value="Siswa" className="bg-slate-900 text-white">👦 Siswa</option>
                <option value="Kak Bintang AI" className="bg-slate-900 text-white">🤖 AI Tutor</option>
                <option value="Suara Lingkungan" className="bg-slate-900 text-white">🔔 Suara</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Touch & Click Friendly Mic Toggle Button (Laptop: Spasi / Android: Sentuh Tombol) */}
              <button
                onClick={toggleCapturing}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 touch-manipulation ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                title="Laptop: Tekan Spasi | Android: Sentuh Tombol"
              >
                {isListening ? <HiStop /> : <HiMicrophone />}
                <span>{isListening ? 'Mendengar' : 'Mic (Spasi/Sentuh)'}</span>
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs transition-all text-slate-300"
                title="Pengaturan Subtitle"
              >
                <HiAdjustments />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs transition-all text-slate-300"
                title={isExpanded ? 'Kecilkan Tampilan' : 'Besarkan Tampilan'}
              >
                {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs transition-all text-slate-300"
                title="Minimize ke Tombol Kecil"
              >
                <HiMinus />
              </button>
            </div>
          </div>

          {/* Captions Display Box - Compact & Non-Obstructive */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className={`p-3 rounded-2xl border shadow-xl space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar ${
                  bgThemeClasses[captionBgColor] || bgThemeClasses.dark
                }`}
              >
                {captions.length === 0 && !interimText && (
                  <div className="text-center py-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider italic">
                    Belum ada percakapan. Sentuh tombol Mic / tekan Spasi di laptop.
                  </div>
                )}

                {captions.map((c) => (
                  <div key={c.id} className="group relative border-b border-white/10 pb-1.5 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        c.speaker === 'Guru' ? 'bg-indigo-600 text-white' :
                        c.speaker === 'Kak Bintang AI' ? 'bg-purple-600 text-white' :
                        c.speaker === 'Suara Lingkungan' ? 'bg-amber-500 text-slate-900' :
                        'bg-emerald-600 text-white'
                      }`}>
                        {c.speaker === 'Guru' ? '👨‍🏫 Guru' :
                         c.speaker === 'Kak Bintang AI' ? '🤖 Kak Bintang AI' :
                         c.speaker === 'Suara Lingkungan' ? '🔔 Suara' : '👦 Siswa'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] text-slate-400 font-bold">
                          {c.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => {
                            setEditingId(c.id);
                            setEditingText(c.text);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-white transition-all text-xs"
                          title="Koreksi Transkrip Guru"
                        >
                          <HiPencilAlt />
                        </button>
                      </div>
                    </div>

                    {editingId === c.id ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 px-2 py-0.5 bg-white/20 text-white font-bold text-xs rounded outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(c.id)}
                          className="p-1 bg-emerald-500 text-white rounded text-xs"
                        >
                          <HiCheck />
                        </button>
                      </div>
                    ) : (
                      <p className={`font-bold leading-relaxed tracking-tight ${fontSizeClasses[captionFontSize] || fontSizeClasses.medium}`}>
                        "{c.text}"
                      </p>
                    )}
                  </div>
                ))}

                {interimText && (
                  <div className="pt-1 border-t border-indigo-500/30">
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-0.5">
                      🎤 {activeSpeaker} sedang bicara...
                    </span>
                    <p className={`font-bold text-indigo-300 italic animate-pulse ${fontSizeClasses[captionFontSize] || fontSizeClasses.medium}`}>
                      "{interimText}"
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CAPTION SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white text-slate-800 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 space-y-6 pointer-events-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-800 text-base uppercase tracking-tight flex items-center gap-2">
                  <HiAdjustments className="text-indigo-600" /> Pengaturan Subtitle & Caption
                </h3>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                  <HiX className="text-xl" />
                </button>
              </div>

              {/* Ukuran Teks Subtitle */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Ukuran Teks</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Kecil', val: 'small' },
                    { label: 'Sedang', val: 'medium' },
                    { label: 'Besar', val: 'large' },
                    { label: 'Jumbo', val: 'xlarge' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => setCaptionSettings({ fontSize: s.val })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        captionFontSize === s.val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warna Latar Subtitle */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Warna Tema Latar</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Gelap', val: 'dark', bg: 'bg-slate-900 text-white' },
                    { label: 'Hitam', val: 'black', bg: 'bg-black text-white' },
                    { label: 'Indigo', val: 'indigo', bg: 'bg-indigo-900 text-white' },
                    { label: 'Amber', val: 'amber', bg: 'bg-amber-900 text-amber-100' },
                  ].map((b) => (
                    <button
                      key={b.val}
                      onClick={() => setCaptionSettings({ bgColor: b.val })}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${b.bg} ${
                        captionBgColor === b.val ? 'ring-2 ring-indigo-500 scale-105' : 'opacity-80'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posisi Subtitle */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Posisi Tampilan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCaptionSettings({ position: 'top' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      captionPosition === 'top' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Atas Layar
                  </button>
                  <button
                    onClick={() => setCaptionSettings({ position: 'bottom' })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      captionPosition === 'bottom' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Bawah Layar
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all text-xs uppercase tracking-widest"
              >
                Simpan & Selesai
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

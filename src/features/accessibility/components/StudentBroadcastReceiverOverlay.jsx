import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassVoiceBroadcast } from '../hooks/useClassVoiceBroadcast';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibility } from '../hooks/useAccessibility';
import {
  HiVolumeUp, HiX, HiMicrophone, HiPaperAirplane,
  HiRefresh, HiAnnotation, HiCheckCircle, HiStop
} from 'react-icons/hi';

export default function StudentBroadcastReceiverOverlay() {
  const { profile } = useAuthStore();
  const { isBlind, isDeaf, isMute } = useAccessibility();
  const {
    activeTeacherMessage,
    replayTeacherVoice,
    dismissTeacherMessage,
    sendStudentReply,
    classCode
  } = useClassVoiceBroadcast();

  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isMicRecording, setIsMicRecording] = useState(false);
  const [liveMicTranscript, setLiveMicTranscript] = useState('');

  const micRecognitionRef = useRef(null);

  const isStudent = profile?.role === 'siswa';

  // Dedicated microphone for Siswa Tunanetra / Tunarungu voice reply
  const startMicReply = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    try {
      if (micRecognitionRef.current) {
        try { micRecognitionRef.current.stop(); } catch (e) {}
      }

      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onstart = () => {
        setIsMicRecording(true);
        setLiveMicTranscript('Mendengarkan ucapan...');
      };

      recognition.onresult = (event) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        if (text.trim()) {
          setLiveMicTranscript(text.trim());
          setReplyText(text.trim());
        }
      };

      recognition.onend = () => {
        setIsMicRecording(false);
      };

      micRecognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsMicRecording(false);
    }
  }, []);

  const stopMicReply = useCallback(() => {
    if (micRecognitionRef.current) {
      try { micRecognitionRef.current.stop(); } catch (e) {}
    }
    setIsMicRecording(false);
  }, []);

  const handleSendReply = (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;

    sendStudentReply(replyText.trim());
    setReplyText('');
    setLiveMicTranscript('');
    setIsReplying(false);
  };

  if (!isStudent || !profile || !classCode || !activeTeacherMessage) return null;

  return (
    <div className="fixed left-3 right-3 sm:left-6 sm:right-6 top-16 lg:top-4 z-[400] flex flex-col items-center pointer-events-none transition-all">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="w-full max-w-2xl bg-slate-950/95 backdrop-blur-2xl text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-indigo-500/30 pointer-events-auto relative overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0">
              👨‍🏫 Siaran Suara Guru
            </span>
            <span className="text-xs font-bold text-indigo-200 truncate">
              {activeTeacherMessage.teacherName}
            </span>
          </div>

          <button
            onClick={dismissTeacherMessage}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all shrink-0"
            title="Selesai & Tutup Pesan"
          >
            <HiX className="text-lg" />
          </button>
        </div>

        {/* Teacher Speech Content */}
        <div className="mb-4 bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="text-sm sm:text-base font-bold text-indigo-50 leading-relaxed">
            "{activeTeacherMessage.text}"
          </p>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-2">
            Pesan diterima • {new Date(activeTeacherMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Action Buttons & Reply Box tailored by Disability Role */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap justify-between">
            {/* Tunanetra Replay Voice Button */}
            {isBlind && (
              <button
                onClick={replayTeacherVoice}
                className="px-3.5 py-2 bg-indigo-600/90 hover:bg-indigo-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                title="Dengarkan Ulang Suara Guru"
              >
                <HiRefresh className="text-sm animate-spin-slow" />
                <span>Ulangi Suara Guru</span>
              </button>
            )}

            {/* Toggle Reply Interface Button */}
            {!isReplying ? (
              <button
                onClick={() => setIsReplying(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 ml-auto"
              >
                <HiAnnotation className="text-sm" />
                <span>
                  {isBlind ? '🎤 Balas Suara ke Guru' : '💬 Balas Pesan Guru'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsReplying(false)}
                className="px-3 py-1.5 bg-white/10 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all ml-auto"
              >
                Batal
              </button>
            )}
          </div>

          {/* Interactive Student Reply Box */}
          <AnimatePresence>
            {isReplying && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSendReply}
                className="p-3.5 bg-white/10 rounded-2xl border border-white/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    {isBlind ? '👁️ Balas Suara (Siswa Tunanetra)' :
                     isDeaf ? '🧏 Balas Teks / Suara (Siswa Tunarungu)' :
                     '🖐️ Balas Teks (Siswa Tunawicara)'}
                  </span>

                  {/* Mic toggle for Tunanetra & Tunarungu */}
                  {(isBlind || isDeaf) && (
                    <button
                      type="button"
                      onClick={isMicRecording ? stopMicReply : startMicReply}
                      className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-lg flex items-center gap-1 transition-all ${
                        isMicRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {isMicRecording ? <HiStop /> : <HiMicrophone />}
                      <span>{isMicRecording ? 'Merekam...' : 'Rekam Suara'}</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isMicRecording ? liveMicTranscript || 'Bicara sekarang...' : 'Ketik ucapan balasan untuk guru...'}
                    className="w-full px-4 py-2.5 bg-slate-900/90 text-white text-xs font-bold rounded-xl outline-none border border-white/20 focus:border-indigo-400 transition-all pr-12"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg transition-all"
                  >
                    <HiPaperAirplane className="text-xs rotate-45" />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

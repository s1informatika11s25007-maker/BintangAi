import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAI } from '@/features/ai-tutor/hooks/useAI';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { supabase } from '@/lib/supabaseClient';
import { getCleanFirstName } from '@/utils';
import StudentSidebar from '@/components/layout/StudentSidebar';
import VoiceSettingsPanel from '@/features/accessibility/components/VoiceSettingsPanel';
import BintangAvatar from '@/features/ai-tutor/components/BintangAvatar';
import {
  HiPaperAirplane, HiTrash, HiUser,
  HiChevronLeft, HiVolumeUp, HiX, HiArrowDown
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const TanyaAI = () => {
  const { profile } = useAuthStore();
  const { askTutor, loading } = useAI();
  const { isDeaf, isMute } = useAccessibility();
  const { speak, isSpeaking, stopSpeaking } = useVoice();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [showVoiceSettingsModal, setShowVoiceSettingsModal] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  const firstName = getCleanFirstName(profile?.full_name) || 'Teman';

  const [messages, setMessages] = useState([
    {
      id: 'welcome-init',
      role: 'ai',
      content: `Halo ${firstName}! 👋 Aku Kak Bintang. Ada yang bisa aku bantu hari ini?`,
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // Consider scrolled up if more than 120px away from bottom
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsScrolledUp(distanceFromBottom > 120);
  };

  // Restore chat history on page load
  useEffect(() => {
    if (!profile?.id) return;

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('student_ai_chat_history')
          .select('*')
          .eq('student_id', profile.id)
          .order('created_at', { ascending: true })
          .limit(100);

        if (!error && data && data.length > 0) {
          const formatted = [
            {
              id: 'welcome-init',
              role: 'ai',
              content: `Halo ${firstName}! 👋 Aku Kak Bintang. Ada yang bisa aku bantu hari ini?`,
              timestamp: data[0].created_at ? new Date(data[0].created_at) : new Date()
            }
          ];

          data.forEach((item, index) => {
            const itemTime = item.created_at ? new Date(item.created_at) : new Date();

            if (item.question) {
              formatted.push({
                id: `hist-user-${item.id || index}`,
                role: 'user',
                content: item.question,
                timestamp: itemTime
              });
            } else if (item.role === 'user' && item.content) {
              formatted.push({
                id: `hist-user-${item.id || index}`,
                role: 'user',
                content: item.content,
                timestamp: itemTime
              });
            }

            if (item.answer) {
              formatted.push({
                id: `hist-ai-${item.id || index}`,
                role: 'ai',
                content: item.answer,
                timestamp: itemTime
              });
            } else if ((item.role === 'assistant' || item.role === 'ai') && item.content) {
              formatted.push({
                id: `hist-ai-${item.id || index}`,
                role: 'ai',
                content: item.content,
                timestamp: itemTime
              });
            }
          });

          setMessages(formatted);

          // Scroll to bottom once after history loads
          setTimeout(() => {
            scrollToBottom(false);
          }, 150);
        }
      } catch (err) {
        console.warn("Error restoring chat history:", err);
      }
    };

    fetchHistory();
  }, [profile?.id, firstName]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    const userMsgObj = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsgObj]);
    setTimeout(() => scrollToBottom(true), 50);

    let aiMessageAdded = false;

    try {
      const response = await askTutor(userMessage, profile?.id, [], {
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      if (response && response.answer) {
        aiMessageAdded = true;
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          role: 'ai',
          content: response.answer,
          timestamp: new Date()
        }]);

        setTimeout(() => scrollToBottom(true), 50);

        // Permanently record Q&A interaction in student_ai_chat_history
        if (profile?.id) {
          try {
            await supabase.from('student_ai_chat_history').insert({
              student_id: profile.id,
              role: 'user',
              content: userMessage,
              question: userMessage,
              answer: response.answer,
              topic: response.detectedTopic || 'Tanya Kak Bintang',
              class_code: profile.class_code || null,
              student_name: profile.full_name || null,
              created_at: new Date().toISOString()
            });
          } catch (logErr) {
            console.warn("Background chat log error:", logErr);
          }
        }

        try {
          speak(response.answer);
        } catch (speakErr) {
          console.warn("Audio speech error:", speakErr);
        }
      } else if (!aiMessageAdded) {
        aiMessageAdded = true;
        const errorMsg = "Halo! Kak Bintang siap membantu. Coba tanyakan lagi ya! 😊";
        setMessages(prev => [...prev, {
          id: `ai-err-${Date.now()}`,
          role: 'ai',
          content: errorMsg,
          timestamp: new Date()
        }]);
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch (err) {
      console.error("handleSend Error:", err);
      if (!aiMessageAdded) {
        aiMessageAdded = true;
        const failMsg = `Halo ${firstName}! Kak Bintang selalu siap membantumu belajar. Mari tanyakan lagi ya! 😊`;
        setMessages(prev => [...prev, {
          id: `ai-fail-${Date.now()}`,
          role: 'ai',
          content: failMsg,
          timestamp: new Date()
        }]);
        setTimeout(() => scrollToBottom(true), 50);
      }
    }
  };

  const clearChat = async () => {
    stopSpeaking();
    if (profile?.id) {
      try {
        await supabase.from('student_ai_chat_history').delete().eq('student_id', profile.id);
      } catch (e) {
        console.warn("Clear chat history error:", e);
      }
    }
    setMessages([
      {
        id: `welcome-cleared-${Date.now()}`,
        role: 'ai',
        content: `Halo ${firstName}! 👋 Chat sudah dibersihkan. Ada lagi yang mau ditanyakan?`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="h-screen max-h-screen flex bg-slate-50 font-sans overflow-hidden">
      <StudentSidebar />

      <main className="flex-1 flex flex-col relative min-w-0 bg-white overflow-hidden shadow-none border-0">
        {/* TOP HEADER BAR */}
        <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-100 flex items-center justify-between z-20 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden transition-all"
              title="Kembali ke Beranda"
            >
              <HiChevronLeft className="text-xl" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <BintangAvatar
                  size="xs"
                  state={loading ? 'thinking' : isSpeaking ? 'speaking' : 'idle'}
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5 leading-tight">
                  <span>Kak Bintang</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-full tracking-wider border border-indigo-100 hidden sm:inline-block">
                    AI Tutor
                  </span>
                </h1>
                <p className="text-[11px] font-medium text-slate-400">
                  {loading ? 'Sedang berpikir...' : isSpeaking ? 'Sedang berbicara...' : 'Online • Sahabat Belajar Inklusif'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoiceSettingsModal(true)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all border border-indigo-100 flex items-center gap-1.5"
              title="Pengaturan Suara"
            >
              <HiVolumeUp className="text-base text-indigo-600" />
              <span className="hidden sm:inline">Suara Kak Bintang</span>
            </button>

            <button
              onClick={clearChat}
              className="p-2 sm:px-3 sm:py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-bold transition-all border border-slate-200/60 hover:border-rose-100 flex items-center gap-1.5"
              title="Bersihkan Percakapan Chat"
            >
              <HiTrash className="text-base" />
              <span className="hidden sm:inline">Bersihkan</span>
            </button>
          </div>
        </header>

        {/* MESSAGES AREA */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 bg-slate-50/50 relative"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full items-end gap-2.5 sm:gap-3`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mb-1 shadow-sm">
                    <BintangAvatar size="xs" state="idle" />
                  </div>
                )}

                <div
                  data-message={msg.role === 'ai' ? 'Kak Bintang' : 'Saya'}
                  tabIndex={0}
                  className={`
                  max-w-[88%] sm:max-w-[78%] md:max-w-[70%] p-3.5 sm:p-5 rounded-2xl shadow-sm relative transition-all focus:ring-2 focus:ring-indigo-400 focus:outline-none
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'}
                `}>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap tracking-normal">
                    {msg.content}
                  </p>
                  <div className={`
                    flex items-center gap-2 mt-2.5
                    ${msg.role === 'user' ? 'justify-end' : 'justify-between'}
                  `}>
                    {msg.role === 'ai' && (
                      <button
                        onClick={() => speak(msg.content, 1.0, true)}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all border border-indigo-100"
                        title="Dengarkan / Ulangi Suara"
                      >
                        <HiVolumeUp className="text-xs text-indigo-600" />
                        <span>Dengarkan</span>
                      </button>
                    )}

                    <span className={`
                      text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-50
                      ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'}
                    `}>
                      {(() => {
                        try {
                          const d = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
                          return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch {
                          return '';
                        }
                      })()}
                    </span>
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 mb-1 font-bold text-xs">
                    {profile?.full_name?.[0]?.toUpperCase() || <HiUser className="text-sm" />}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <BintangAvatar size="xs" state="thinking" />
              </div>
              <div className="bg-white border border-slate-200/80 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-3">
                <div className="flex gap-1">
                  <motion.span animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <motion.span animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <motion.span animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                </div>
                <span className="text-xs font-bold text-indigo-600">Kak Bintang sedang mengetik...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* FLOATING SCROLL TO BOTTOM BUTTON */}
        <AnimatePresence>
          {isScrolledUp && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-20 right-6 z-30 px-3.5 py-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all text-xs font-bold flex items-center gap-2 border border-indigo-400/30"
            >
              <HiArrowDown className="text-sm" />
              <span>Pesan Terbaru</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* INPUT AREA */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 relative z-20 shrink-0">
          {(isDeaf || isMute) && messages.length < 3 && (
            <div className="mb-2 flex gap-2 overflow-x-auto no-scrollbar">
              {["Bantu aku belajar", "Apa itu BintangAi?", "Cara kerjakan tugas"].map((text, i) => (
                <button
                  key={i}
                  onClick={() => setInput(text)}
                  className="whitespace-nowrap px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full hover:bg-indigo-100 transition-all border border-indigo-100"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="relative flex items-center gap-2 max-w-4xl mx-auto w-full"
          >
            <div className="flex-1 relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Tanyakan sesuatu pada Kak Bintang..."
                className="w-full pl-4 pr-10 py-2.5 bg-slate-100 border border-slate-200/60 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all resize-none min-h-[42px] max-h-[100px] custom-scrollbar"
                rows={1}
              />
              {input && (
                <button
                  type="button"
                  className="absolute right-3 text-slate-400 hover:text-slate-600"
                  onClick={() => setInput('')}
                >
                  <HiX className="text-sm" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`
                h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 text-xs font-bold
                ${!input.trim() || loading
                  ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed border border-slate-200/50'
                  : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 active:scale-95'}
              `}
            >
              <span>Kirim</span>
              <HiPaperAirplane className={`text-sm ${input.trim() && !loading ? 'rotate-45 -translate-y-0.5' : ''}`} />
            </button>
          </form>
        </div>

      </main>

      {/* VOICE SETTINGS MODAL */}
      <AnimatePresence>
        {showVoiceSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md">
                    <HiVolumeUp />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">Pengaturan Suara Kak Bintang</h3>
                    <p className="text-xs text-slate-500">Sesuaikan kecepatan, volume & pengulangan suara</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVoiceSettingsModal(false)}
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
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.4); }
      `}</style>
    </div>
  );
};

export default TanyaAI;


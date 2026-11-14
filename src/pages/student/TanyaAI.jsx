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
import {
  HiPaperAirplane, HiAcademicCap, HiTrash, HiPlus,
  HiDotsVertical, HiUser, HiChatAlt2, HiChevronLeft,
  HiVolumeUp, HiX
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
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `Halo ${profile?.full_name?.split(' ')[0] || 'Teman'}! 👋 Aku Kak Bintang. Ada yang bisa aku bantu hari ini?`,
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Restore chat history on page refresh
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
              role: 'ai',
              content: `Halo ${getCleanFirstName(profile?.full_name) || 'Teman'}! 👋 Aku Kak Bintang. Ada yang bisa aku bantu hari ini?`,
              timestamp: data[0].created_at ? new Date(data[0].created_at) : new Date()
            }
          ];

          data.forEach(item => {
            const itemTime = item.created_at ? new Date(item.created_at) : new Date();

            if (item.question) {
              formatted.push({
                role: 'user',
                content: item.question,
                timestamp: itemTime
              });
            } else if (item.role === 'user' && item.content) {
              formatted.push({
                role: 'user',
                content: item.content,
                timestamp: itemTime
              });
            }

            if (item.answer) {
              formatted.push({
                role: 'ai',
                content: item.answer,
                timestamp: itemTime
              });
            } else if (item.role === 'assistant' && item.content) {
              formatted.push({
                role: 'ai',
                content: item.content,
                timestamp: itemTime
              });
            }
          });

          setMessages(formatted);
        }
      } catch (err) {
        console.warn("Error restoring chat history:", err);
      }
    };

    fetchHistory();
  }, [profile?.id]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    let aiMessageAdded = false;

    try {
      const response = await askTutor(userMessage, profile?.id, [], {
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      if (response && response.answer) {
        aiMessageAdded = true;
        setMessages(prev => [...prev, {
          role: 'ai',
          content: response.answer,
          timestamp: new Date()
        }]);

        // Permanently record Q&A interaction in student_ai_chat_history for Teacher Monitoring (isolated try-catch)
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

        // Speak response out loud using user's voice speed, volume, and voice selection
        try {
          speak(response.answer);
        } catch (speakErr) {
          console.warn("Audio speech error:", speakErr);
        }
      } else if (!aiMessageAdded) {
        aiMessageAdded = true;
        const errorMsg = "Halo! Kak Bintang siap membantu. Coba tanyakan lagi ya! 😊";
        setMessages(prev => [...prev, {
          role: 'ai',
          content: errorMsg,
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      console.error("handleSend Error:", err);
      if (!aiMessageAdded) {
        aiMessageAdded = true;
        const failMsg = `Halo ${profile?.full_name ? profile.full_name.split(' ')[0] : 'Teman'}! Kak Bintang selalu siap membantumu belajar. Mari tanyakan lagi ya! 😊`;
        setMessages(prev => [...prev, {
          role: 'ai',
          content: failMsg,
          timestamp: new Date()
        }]);
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
        role: 'ai',
        content: `Halo ${getCleanFirstName(profile?.full_name) || 'Teman'}! 👋 Chat sudah dibersihkan. Ada lagi yang mau ditanyakan?`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="h-screen max-h-screen flex bg-white font-sans overflow-hidden">
      <StudentSidebar />

      <main className="flex-1 flex flex-col relative min-w-0 bg-white overflow-hidden rounded-none m-0 shadow-none border-0">
        {/* Background Decorations */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[100px] pointer-events-none opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px] pointer-events-none opacity-50" />

        {/* HEADER */}
        <header className="px-4 py-4 md:px-8 md:py-6 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-xl sticky top-0 z-[40] shadow-sm">
          <div className="flex items-center gap-4">
             <button
               onClick={() => navigate('/student/dashboard')}
               className="p-2 hover:bg-slate-100 rounded-xl lg:hidden text-slate-500"
             >
               <HiChevronLeft className="text-2xl" />
             </button>
             <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 ring-2 ring-indigo-50/50">
                  <HiChatAlt2 className="text-xl md:text-2xl" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
             </div>
             <div>
                <h2 className="text-sm md:text-base font-black text-slate-800 tracking-tight leading-tight">Tanya Kak Bintang</h2>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online • Asisten AI</p>
             </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Voice Settings Button */}
            <button
              onClick={() => setShowVoiceSettingsModal(true)}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm border border-indigo-100"
              title="Pengaturan Suara"
            >
              <HiVolumeUp className="text-base text-indigo-600" />
              <span className="hidden sm:inline">Pengaturan Suara</span>
            </button>

            <button
              onClick={clearChat}
              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Bersihkan Chat"
            >
              <HiTrash className="text-xl" />
            </button>
            <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-all lg:hidden">
              <HiDotsVertical className="text-xl" />
            </button>
          </div>
        </header>

        {/* MESSAGES AREA - EXPANDED VERTICAL ROOM */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 space-y-3 sm:space-y-4 no-scrollbar bg-slate-50/30 relative">

          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 100,
                  delay: idx === 0 ? 0.2 : 0
                }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full items-end gap-2 md:gap-4`}
              >
                {msg.role === 'ai' && (
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mb-1 hidden md:flex shadow-lg shadow-indigo-100"
                  >
                    <HiAcademicCap className="text-sm" />
                  </motion.div>
                )}

                <div className={`
                  max-w-[90%] md:max-w-[75%] p-4 md:p-6 rounded-[2.2rem] shadow-sm relative group transition-all hover:shadow-md
                  ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-br-none'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}
                `}>
                  <p className="text-[14px] md:text-base font-medium leading-relaxed whitespace-pre-wrap tracking-tight">
                    {msg.content}
                  </p>
                  <div className={`
                    flex items-center gap-2 mt-3
                    ${msg.role === 'user' ? 'justify-end' : 'justify-between'}
                  `}>
                    {msg.role === 'ai' && (
                      <button
                        onClick={() => speak(msg.content, 1.0, true)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all border border-indigo-100"
                        title="Dengarkan / Ulangi Suara"
                      >
                        <HiVolumeUp className="text-xs text-indigo-600" />
                        <span>Dengarkan / Ulangi</span>
                      </button>
                    )}

                    <span className={`
                      text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] opacity-40
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
                  <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 mb-1 hidden md:flex">
                    <HiUser className="text-xs" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex justify-start items-center gap-3"
            >
               <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white hidden md:flex animate-bounce">
                  <HiAcademicCap className="text-sm" />
               </div>
               <div className="bg-white border border-slate-100 p-4 rounded-[1.5rem] rounded-bl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Bintang sedang mengetik...</span>
               </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white border-t border-slate-100 relative z-30 shrink-0"
        >
          {/* Animated Suggestions for Tunarungu/Tunawicara */}
          {(isDeaf || isMute) && messages.length < 3 && (
            <div className="absolute -top-10 left-0 right-0 flex gap-2 px-4 overflow-x-auto no-scrollbar pb-1">
               {["Bantu aku belajar", "Apa itu BintangAi?", "Cara kerjakan tugas"].map((text, i) => (
                 <motion.button
                   key={i}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.5 + (i * 0.1) }}
                   onClick={() => setInput(text)}
                   className="whitespace-nowrap px-3 py-1 bg-white/95 border border-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-wider rounded-full shadow-sm hover:bg-indigo-50 transition-all"
                 >
                   {text}
                 </motion.button>
               ))}
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="relative flex items-center gap-2 max-w-4xl mx-auto w-full"
          >
            <div className="flex-1 relative">
               <textarea
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSend();
                   }
                 }}
                 placeholder="Ketik pesan..."
                 className="w-full pl-4 pr-9 py-2 bg-slate-100 border-none rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none min-h-[38px] max-h-[90px] custom-scrollbar"
                 rows={1}
               />
               {input && (
                 <button
                   type="button"
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                   onClick={() => setInput('')}
                 >
                   <HiTrash className="text-xs" />
                 </button>
               )}
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`
                w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all shadow-md shrink-0
                ${!input.trim() || loading
                  ? 'bg-slate-100 text-slate-300 shadow-none'
                  : 'bg-indigo-600 text-white shadow-indigo-200 hover:scale-105 active:scale-95'}
              `}
            >
              <HiPaperAirplane className={`text-base ${input.trim() && !loading ? 'rotate-45 -translate-y-0.5 translate-x-0.5' : ''}`} />
            </button>
          </form>
        </motion.div>

        {/* VOICE SETTINGS MODAL */}
        <AnimatePresence>
          {showVoiceSettingsModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
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

      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TanyaAI;

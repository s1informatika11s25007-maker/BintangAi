import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAI } from '@/features/ai-tutor/hooks/useAI';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import StudentSidebar from '@/components/layout/StudentSidebar';
import {
  HiPaperAirplane, HiSparkles, HiTrash, HiPlus,
  HiDotsVertical, HiUser, HiChatAlt2, HiChevronLeft
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const TanyaAI = () => {
  const { profile } = useAuthStore();
  const { askTutor, loading } = useAI();
  const { isDeaf, isMute } = useAccessibility();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
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

    try {
      const response = await askTutor(userMessage, profile.id, [], {
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      if (response.success) {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: response.answer,
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: "Maaf, ada kendala koneksi. Coba lagi ya!",
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "Waduh, Kak Bintang lagi istirahat. Nanti tanya lagi ya!",
        timestamp: new Date()
      }]);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'ai',
        content: `Halo ${profile?.full_name?.split(' ')[0] || 'Teman'}! 👋 Chat sudah dibersihkan. Ada lagi yang mau ditanyakan?`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="h-[100dvh] flex bg-white font-sans overflow-hidden">
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
                  <HiSparkles className="text-xl md:text-2xl animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
             </div>
             <div>
                <h2 className="text-sm md:text-base font-black text-slate-800 tracking-tight leading-tight">Tanya Kak Bintang</h2>
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online • Asisten AI</p>
             </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-16 pb-10 md:pt-24 md:pb-12 space-y-8 no-scrollbar bg-slate-50/30 relative">

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
                    <HiSparkles className="text-xs" />
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
                    ${msg.role === 'user' ? 'justify-end' : 'justify-start'}
                  `}>
                    <span className={`
                      text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] opacity-40
                      ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'}
                    `}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  <HiSparkles className="text-xs" />
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
          className="p-4 md:p-8 bg-white/80 backdrop-blur-xl border-t border-slate-100 relative z-30"
        >
          {/* Animated Suggestions for Tunarungu/Tunawicara */}
          {(isDeaf || isMute) && messages.length < 3 && (
            <div className="absolute -top-12 left-0 right-0 flex gap-2 px-4 overflow-x-auto no-scrollbar pb-2">
               {["Bantu aku belajar", "Apa itu BintangAi?", "Cara kerjakan tugas"].map((text, i) => (
                 <motion.button
                   key={i}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.5 + (i * 0.1) }}
                   onClick={() => setInput(text)}
                   className="whitespace-nowrap px-3 py-1.5 bg-white/90 backdrop-blur border border-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm hover:bg-indigo-50 transition-all"
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
                 className="w-full pl-4 pr-10 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none min-h-[48px] max-h-[120px] custom-scrollbar"
                 rows={1}
               />
               {input && (
                 <button
                   type="button"
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                   onClick={() => setInput('')}
                 >
                   <HiTrash className="text-sm" />
                 </button>
               )}
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={`
                w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg
                ${!input.trim() || loading
                  ? 'bg-slate-100 text-slate-300 shadow-none'
                  : 'bg-indigo-600 text-white shadow-indigo-200 hover:scale-105 active:scale-95'}
              `}
            >
              <HiPaperAirplane className={`text-xl ${input.trim() && !loading ? 'rotate-45 -translate-y-0.5 translate-x-0.5' : ''}`} />
            </button>
          </form>

          <p className="text-center text-[7px] font-black text-slate-300 uppercase tracking-[0.2em] mt-3">
            BintangAi dapat membuat kesalahan.
          </p>
        </motion.div>

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

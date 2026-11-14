import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import StudentSidebar from '@/components/layout/StudentSidebar';
import Footer from '@/components/layout/Footer';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { HiMail, HiVolumeUp, HiClock, HiPaperAirplane, HiChatAlt2 } from 'react-icons/hi';

const StudentInbox = () => {
  const { profile } = useAuthStore();
  const { speak } = useVoice();
  const { showSubtitle } = useSubtitle();
  const { isBlind } = useAccessibility();

  const [conversations, setConversations] = useState([]);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (profile?.id) {
      fetchConversations();
    }
  }, [profile?.id]);

  useEffect(() => {
    let channel;
    if (selectedConvo?.id) {
      fetchMessages(selectedConvo.id);

      const channelName = `inbox_chat_${selectedConvo.id}_${Date.now()}`;
      channel = supabase.channel(channelName);

      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `conversation_id=eq.${selectedConvo.id}`
          },
          (payload) => {
            fetchMessages(selectedConvo.id);
          }
        )
        .subscribe();
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedConvo?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const { data: convs, error } = await supabase
        .from('direct_conversations')
        .select('*, teacher:profiles!teacher_id(id, full_name, slb_name)')
        .eq('student_id', profile.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setConversations(convs || []);
      if (convs && convs.length > 0) {
        setSelectedConvo(convs[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Fetch Conversations Error:', err);
      setLoading(false);
    }
  };

  const fetchMessages = async (convoId) => {
    try {
      const { data: msgs, error } = await supabase
        .from('direct_messages')
        .select('*, sender:profiles!sender_id(full_name, role)')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(msgs || []);
    } catch (err) {
      console.error('Fetch Messages Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedConvo?.id || sending) return;

    setSending(true);
    try {
      const text = replyText.trim();
      const { error } = await supabase.from('direct_messages').insert({
        conversation_id: selectedConvo.id,
        sender_id: profile.id,
        sender_role: 'siswa',
        content: text,
        is_read: false
      });

      if (error) throw error;

      setReplyText('');
      showSubtitle('Pesan terkirim', 'success');
      await fetchMessages(selectedConvo.id);
    } catch (err) {
      console.error('Send reply error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden text-slate-800">
      <StudentSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-white">
        {/* Header Rapi & Edge-to-Edge */}
        <header className="px-6 md:px-10 py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-100 shrink-0">
              <HiMail />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Pesan Guru</h1>
              <p className="text-xs font-bold text-slate-400">Diskusi dan bimbingan langsung bersama Guru Anda</p>
            </div>
          </div>

          {conversations.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
              {conversations.map((c) => {
                const isSelected = selectedConvo?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setLoading(true);
                      setSelectedConvo(c);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    👨‍🏫 {c.teacher?.full_name?.split(',')[0] || 'Guru'}
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {/* Chat Content Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memuat Pesan...</p>
          </div>
        ) : selectedConvo ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
            {/* Active Teacher Banner */}
            <div className="px-6 md:px-10 py-3 bg-indigo-50/70 border-b border-indigo-100/50 flex items-center justify-between text-xs font-bold text-indigo-900 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Terhubung dengan Guru: <strong>{selectedConvo.teacher?.full_name || 'Guru BintangAi'}</strong></span>
              </div>
              <span className="text-[10px] text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-100 font-bold">
                {selectedConvo.teacher?.slb_name || 'SLB Inklusi'}
              </span>
            </div>

            {/* Chat Stream Area (Oldest to Newest) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-4">
              {messages.map((m) => {
                const isGuru = m.sender_role === 'guru' || m.sender_id !== profile.id;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isGuru ? 'justify-start' : 'justify-end'} w-full`}
                  >
                    <div className={`w-full max-w-[88%] md:max-w-[80%] rounded-2xl p-4 md:p-5 shadow-sm border transition-all ${
                      isGuru
                        ? 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                        : 'bg-indigo-600 text-white border-indigo-600 rounded-tr-none'
                    }`}>
                      {/* Bubble Header */}
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{isGuru ? '👨‍🏫' : '👦'}</span>
                          <span className={`text-xs font-black ${isGuru ? 'text-slate-900' : 'text-white'}`}>
                            {isGuru ? (m.sender?.full_name || selectedConvo.teacher?.full_name || 'Guru') : 'Saya'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold ${isGuru ? 'text-slate-400' : 'text-indigo-200'}`}>
                            {new Date(m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isGuru && (
                            <button
                              onClick={() => speak(m.content, 1.0, true)}
                              className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs transition-all"
                              title="Dengarkan Suara Pesan"
                            >
                              <HiVolumeUp className="text-sm" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bubble Content */}
                      <p className={`text-xs font-bold leading-relaxed whitespace-pre-wrap ${
                        isGuru ? 'text-slate-700' : 'text-white'
                      }`}>
                        {m.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {messages.length === 0 && (
                <div className="py-16 text-center space-y-2 bg-white rounded-2xl border border-slate-100 p-8 max-w-lg mx-auto my-12">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto">
                    <HiChatAlt2 />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">Belum Ada Percakapan</h4>
                  <p className="text-xs text-slate-400 font-bold">Kirim pesan di bawah untuk mulai berdiskusi dengan Guru.</p>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Single Input Bar at Bottom */}
            <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleSendReply} className="w-full flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ketik balasan untuk Guru..."
                  className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-40 disabled:shadow-none shrink-0"
                >
                  <HiPaperAirplane className="rotate-45 text-xs" /> Balas
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#F8FAFC]">
            <div className="w-16 h-16 bg-white text-slate-400 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm border border-slate-100">
              <HiMail />
            </div>
            <h3 className="text-base font-black text-slate-800">Belum Ada Pesan Guru</h3>
            <p className="text-xs text-slate-400 font-bold mt-1 max-w-sm">
              Apabila Guru mengirimkan instruksi atau pesan, pesan akan otomatis muncul di halaman ini.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentInbox;

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import StudentSidebar from '@/components/layout/StudentSidebar';
import Footer from '@/components/layout/Footer';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { HiMail, HiVolumeUp, HiClock, HiPaperAirplane, HiCheckCircle } from 'react-icons/hi';

const StudentInbox = () => {
  const { profile } = useAuthStore();
  const { speak } = useVoice();
  const { showSubtitle } = useSubtitle();
  const { isBlind } = useAccessibility();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    let unsubscribe;
    if (profile?.id) {
      fetchMessages();
      unsubscribe = subscribeToMessages();
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [profile?.id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Find conversations for this student
      const { data: convs } = await supabase
        .from('direct_conversations')
        .select('id, teacher_id, profiles!teacher_id(full_name)')
        .eq('student_id', profile.id);

      if (!convs || convs.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      const convIds = convs.map(c => c.id);
      const { data: msgs, error } = await supabase
        .from('direct_messages')
        .select('*, profiles!sender_id(full_name, role)')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(msgs || []);
    } catch (err) {
      console.error('Fetch Inbox Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!profile?.id) return;
    const channelName = `student_inbox_${profile.id}_${Date.now()}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendReply = async (convId, teacherId) => {
    const text = replyText[convId];
    if (!text || !text.trim() || sendingId) return;

    setSendingId(convId);
    try {
      const { error } = await supabase.from('direct_messages').insert({
        conversation_id: convId,
        sender_id: profile.id,
        sender_role: 'siswa',
        content: text.trim(),
        is_read: false
      });

      if (error) throw error;

      setReplyText(prev => ({ ...prev, [convId]: '' }));
      showSubtitle('Pesan balasan terkirim ke Guru', 'success');
      fetchMessages();
    } catch (err) {
      console.error('Send reply error:', err);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden text-slate-800">
      <StudentSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12">
          {/* Header Rapi & Fokus */}
          <header className="mb-8 flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-100 shrink-0">
                <HiMail />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pesan Guru</h1>
                <p className="text-xs font-bold text-slate-400">Pesan dan instruksi langsung dari Guru Anda</p>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memuat Pesan...</p>
            </div>
          ) : (
            <div className="space-y-5 w-full">
              {messages.map((m) => {
                const isGuru = m.sender_role === 'guru';
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 md:p-7 rounded-2xl border transition-all ${
                      isGuru ? 'bg-white border-indigo-100 shadow-sm' : 'bg-slate-50/80 border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white ${
                          isGuru ? 'bg-indigo-600' : 'bg-slate-600'
                        }`}>
                          {isGuru ? '👨‍🏫' : '👦'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">
                            {isGuru ? (m.profiles?.full_name || 'Guru BintangAi') : 'Saya (Balasan)'}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {isGuru ? 'Pesan dari Guru' : 'Balasan Siswa'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <HiClock className="text-xs" />
                          {new Date(m.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {isGuru && (
                          <button
                            onClick={() => speak(m.content, 1.0, true)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-all"
                            title="Dengarkan Suara Pesan"
                          >
                            <HiVolumeUp className="text-sm" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-700 font-bold text-xs leading-relaxed whitespace-pre-wrap pl-12">
                      "{m.content}"
                    </p>

                    {isGuru && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex gap-2">
                        <input
                          type="text"
                          value={replyText[m.conversation_id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [m.conversation_id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendReply(m.conversation_id, m.sender_id)}
                          placeholder="Ketik balasan untuk Guru..."
                          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleSendReply(m.conversation_id, m.sender_id)}
                          disabled={!replyText[m.conversation_id]?.trim() || sendingId === m.conversation_id}
                          className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1 disabled:opacity-40"
                        >
                          <HiPaperAirplane className="rotate-45 text-xs" /> Balas
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {messages.length === 0 && (
                <div className="py-16 text-center space-y-2 bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center text-2xl mx-auto">
                    <HiMail />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">Kotak Masuk Kosong</h4>
                  <p className="text-xs text-slate-400 font-bold">Belum ada pesan masuk dari Guru.</p>
                </div>
              )}
            </div>
          )}

          <div className="-mx-6 md:-mx-10 lg:-mx-12 -mb-6 md:-mb-10 lg:-mb-12 mt-12">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentInbox;

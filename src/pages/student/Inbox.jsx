import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import StudentSidebar from '@/components/layout/StudentSidebar';
import Footer from '@/components/layout/Footer';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { HiMail, HiVolumeUp, HiClock, HiUser, HiPaperAirplane, HiCheckCircle } from 'react-icons/hi';

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
    if (profile?.id) {
      fetchMessages();
      subscribeToMessages();
    }
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
    const channel = supabase
      .channel(`student_inbox_${profile.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 lg:p-16">
          <header className="mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-100">
                <HiMail />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pesan Guru</h1>
                <p className="text-xs font-bold text-slate-400">Kotak masuk instruksi dan pesan dari Guru Anda</p>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Pesan...</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl">
              {messages.map((m) => {
                const isGuru = m.sender_role === 'guru';
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 md:p-8 rounded-[2rem] border transition-all ${
                      isGuru ? 'bg-white border-indigo-100 shadow-md' : 'bg-slate-50 border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white ${
                          isGuru ? 'bg-indigo-600' : 'bg-slate-600'
                        }`}>
                          {isGuru ? '👨‍🏫' : '👦'}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">
                            {isGuru ? (m.profiles?.full_name || 'Guru BintangAi') : 'Saya (Balasan)'}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {isGuru ? 'Pesan dari Guru' : 'Balasan Siswa'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <HiClock />
                          {new Date(m.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {isGuru && (
                          <button
                            onClick={() => speak(m.content, 1.0, true)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all"
                            title="Dengarkan Suara Pesan"
                          >
                            <HiVolumeUp className="text-base" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-700 font-bold text-sm leading-relaxed whitespace-pre-wrap pl-13">
                      "{m.content}"
                    </p>

                    {isGuru && (
                      <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                        <input
                          type="text"
                          value={replyText[m.conversation_id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [m.conversation_id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendReply(m.conversation_id, m.sender_id)}
                          placeholder="Ketik balasan untuk Guru..."
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleSendReply(m.conversation_id, m.sender_id)}
                          disabled={!replyText[m.conversation_id]?.trim() || sendingId === m.conversation_id}
                          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <HiPaperAirplane className="rotate-45" /> Balas
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {messages.length === 0 && (
                <div className="py-20 text-center space-y-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                    <HiMail />
                  </div>
                  <h4 className="text-base font-black text-slate-800">Kotak Masuk Kosong</h4>
                  <p className="text-xs text-slate-400 font-bold">Belum ada pesan masuk dari Guru.</p>
                </div>
              )}
            </div>
          )}

          <div className="-mx-6 md:-mx-12 lg:-mx-16 -mb-6 md:-mb-12 lg:-mb-16 mt-16">
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentInbox;

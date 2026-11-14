import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import TeacherSidebar from '@/components/layout/TeacherSidebar';
import { HiSearch, HiUserGroup, HiAcademicCap, HiPaperAirplane, HiClock, HiChatAlt2, HiUser } from 'react-icons/hi';

const TeacherChat = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetStudentId = searchParams.get('studentId');

  const [conversations, setConversations] = useState([]);
  const [tabFilter, setTabFilter] = useState('semua'); // 'semua' | 'siswa' | 'ortu'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile?.id]);

  useEffect(() => {
    let channel;
    if (selectedConvo?.id && !selectedConvo.is_new) {
      fetchMessages(selectedConvo.id);

      const channelName = `teacher_chat_${selectedConvo.id}_${Date.now()}`;
      channel = supabase
        .channel(channelName)
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
    } else if (selectedConvo?.is_new) {
      setMessages([]);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [selectedConvo?.id, selectedConvo?.is_new]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Ambil semua percakapan yang dimiliki Guru ini
      const { data: convos, error: convErr } = await supabase
        .from('direct_conversations')
        .select(`
          *,
          parent:profiles!direct_conversations_parent_id_fkey(id, full_name, role),
          student:profiles!direct_conversations_student_id_fkey(id, full_name, role, disability_type, class_level)
        `)
        .eq('teacher_id', profile.id)
        .order('updated_at', { ascending: false });

      if (convErr) throw convErr;

      // 2. Ambil semua Siswa di kelas guru ini
      const { data: classStudents } = await supabase
        .from('profiles')
        .select('id, full_name, role, disability_type, class_level')
        .eq('role', 'siswa')
        .eq('class_code', profile.class_code);

      // 3. Ambil Orang Tua yang terhubung
      const studentIds = classStudents?.map(s => s.id) || [];
      const { data: allParents } = await supabase
        .from('profiles')
        .select('id, full_name, role, linked_student_id')
        .eq('role', 'ortu')
        .in('linked_student_id', studentIds.length > 0 ? studentIds : ['00000000-0000-0000-0000-000000000000']);

      const list = [];

      // A. Masukkan Percakapan Siswa (Direct Student Chat)
      (classStudents || []).forEach(s => {
        const existing = convos?.find(c => c.student_id === s.id && !c.parent_id);
        list.push({
          id: existing?.id || `new-student-${s.id}`,
          type: 'siswa',
          target_id: s.id,
          student_id: s.id,
          name: s.full_name,
          role: 'siswa',
          disability_type: s.disability_type || 'Umum',
          class_level: s.class_level || '-',
          is_new: !existing,
          updated_at: existing?.updated_at || s.created_at
        });
      });

      // B. Masukkan Percakapan Orang Tua (Parent Chat)
      (allParents || []).forEach(p => {
        const existing = convos?.find(c => c.parent_id === p.id);
        const studentInfo = classStudents?.find(s => s.id === p.linked_student_id);
        list.push({
          id: existing?.id || `new-parent-${p.id}`,
          type: 'ortu',
          target_id: p.id,
          parent_id: p.id,
          student_id: p.linked_student_id,
          name: p.full_name,
          role: 'ortu',
          student_name: studentInfo?.full_name || 'Siswa',
          is_new: !existing,
          updated_at: existing?.updated_at || p.created_at
        });
      });

      setConversations(list);

      // Auto select target student if query param present or select first conversation
      if (targetStudentId) {
        const targetConvo = list.find(c => c.student_id === targetStudentId);
        if (targetConvo) {
          setSelectedConvo(targetConvo);
        } else if (list.length > 0) {
          setSelectedConvo(list[0]);
        }
      } else if (list.length > 0 && !selectedConvo) {
        setSelectedConvo(list[0]);
      }
    } catch (err) {
      console.error("Fetch Teacher Chat Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convoId) => {
    try {
      const { data } = await supabase
        .from('direct_messages')
        .select('*, sender:profiles!sender_id(full_name, role)')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);
    } catch (err) {
      console.error("Fetch Messages Error:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvo || sending) return;

    setSending(true);
    try {
      let convoId = selectedConvo.id;

      if (selectedConvo.is_new) {
        const payload = {
          teacher_id: profile.id,
          student_id: selectedConvo.student_id,
          participant_one: profile.id,
          participant_two: selectedConvo.target_id
        };

        if (selectedConvo.type === 'ortu') {
          payload.parent_id = selectedConvo.parent_id;
        }

        const { data: newConvo, error: convoErr } = await supabase
          .from('direct_conversations')
          .insert(payload)
          .select('id')
          .single();

        if (convoErr) throw convoErr;
        convoId = newConvo.id;
        setSelectedConvo(prev => ({ ...prev, id: convoId, is_new: false }));
        setConversations(prev => prev.map(c => (c.target_id === selectedConvo.target_id ? { ...c, id: convoId, is_new: false } : c)));
      }

      const { error: msgErr } = await supabase.from('direct_messages').insert({
        conversation_id: convoId,
        sender_id: profile.id,
        sender_role: 'guru',
        content: newMessage.trim(),
        is_read: false
      });

      if (msgErr) throw msgErr;

      setNewMessage('');
      await fetchMessages(convoId);
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.student_name && c.student_name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (tabFilter === 'siswa') return matchesSearch && c.type === 'siswa';
    if (tabFilter === 'ortu') return matchesSearch && c.type === 'ortu';
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden text-slate-800">
      <TeacherSidebar activeTab="" />

      {/* Left Sidebar: Conversation List */}
      <aside className="w-80 md:w-96 bg-white border-r border-slate-100 flex flex-col h-screen overflow-hidden shrink-0">
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Pesan & Bimbingan</h1>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              {filteredConversations.length} Kontak
            </span>
          </div>

          {/* Filter Tabs: Semua / Siswa / Orang Tua */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTabFilter('semua')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${tabFilter === 'semua' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setTabFilter('siswa')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${tabFilter === 'siswa' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              👦 Siswa
            </button>
            <button
              onClick={() => setTabFilter('ortu')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${tabFilter === 'ortu' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              👪 Ortu
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Cari nama siswa atau ortu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Contact List Scroll */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Memuat Kontak...</div>
          ) : (
            filteredConversations.map(convo => {
              const isSelected = selectedConvo?.target_id === convo.target_id;
              const isSiswa = convo.type === 'siswa';

              return (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConvo(convo)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center gap-3 border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                      : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : isSiswa ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {isSiswa ? '👦' : '👪'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-black truncate text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>{convo.name}</p>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : isSiswa ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isSiswa ? convo.disability_type : 'Ortu'}
                      </span>
                    </div>
                    <p className={`text-[10px] font-bold truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      {isSiswa ? `Kelas: ${convo.class_level}` : `Ortu dari ${convo.student_name}`}
                    </p>
                  </div>
                </button>
              );
            })
          )}

          {!loading && filteredConversations.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">Tidak ada kontak ditemukan.</div>
          )}
        </div>
      </aside>

      {/* Right Main Chat Section */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        {selectedConvo ? (
          <>
            {/* Header */}
            <header className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md ${
                  selectedConvo.type === 'siswa' ? 'bg-emerald-600' : 'bg-indigo-600'
                }`}>
                  {selectedConvo.type === 'siswa' ? '👦' : '👪'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">{selectedConvo.name}</h2>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-md border border-slate-200">
                      {selectedConvo.type === 'siswa' ? `Siswa (${selectedConvo.disability_type})` : `Orang Tua ${selectedConvo.student_name}`}
                    </span>
                  </div>
                  <p className="text-slate-400 font-bold text-[10px] mt-0.5">
                    {selectedConvo.type === 'siswa' ? `Siswa Aktif Kelas ${profile.class_code || 'DEMO01'}` : `Wali murid terhubung`}
                  </p>
                </div>
              </div>
            </header>

            {/* Messages Thread (Chronological) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 bg-[#F8FAFC]">
              {messages.map((msg) => {
                const isMe = msg.sender_id === profile.id || msg.sender_role === 'guru';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                  >
                    <div className={`w-full max-w-[88%] md:max-w-[80%] rounded-2xl p-4 shadow-sm border transition-all ${
                      isMe
                        ? 'bg-indigo-600 text-white border-indigo-600 rounded-tr-none'
                        : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                    }`}>
                      <div className="flex items-center justify-between gap-4 mb-1.5">
                        <span className={`text-[10px] font-black ${isMe ? 'text-white/90' : 'text-slate-900'}`}>
                          {isMe ? 'Saya (Guru)' : (msg.sender?.full_name || selectedConvo.name)}
                        </span>
                        <span className={`text-[9px] font-bold ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {messages.length === 0 && (
                <div className="py-16 text-center space-y-2 bg-white rounded-2xl border border-slate-100 p-8 max-w-md mx-auto my-10">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl mx-auto">
                    <HiChatAlt2 />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">Belum Ada Percakapan</h4>
                  <p className="text-xs text-slate-400 font-bold">Kirim pesan di bawah untuk memulai bimbingan bersama {selectedConvo.name}.</p>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Bottom Single Input Bar */}
            <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleSendMessage} className="w-full flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Ketik pesan bimbingan untuk ${selectedConvo.name}...`}
                  className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-40 disabled:shadow-none shrink-0"
                >
                  <HiPaperAirplane className="rotate-45 text-xs" /> Kirim
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#F8FAFC]">
            <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm border border-slate-100">
              <HiChatAlt2 />
            </div>
            <h3 className="text-base font-black text-slate-800">Pilih Kontak Bimbingan</h3>
            <p className="text-xs text-slate-400 font-bold mt-1 max-w-sm">
              Pilih salah satu Siswa atau Orang Tua di panel sebelah kiri untuk melihat dan membalas pesan.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherChat;

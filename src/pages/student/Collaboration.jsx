import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import StudentSidebar from '@/components/layout/StudentSidebar';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import {
  HiChatAlt2, HiUsers, HiLockClosed, HiLockOpen,
  HiPaperAirplane, HiX, HiSearch, HiCheckCircle,
  HiInformationCircle, HiChevronLeft, HiDotsVertical,
  HiSparkles, HiChatAlt, HiClock, HiCheck
} from 'react-icons/hi';

const StudentCollaboration = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { groupId } = useParams(); // Ambil ID dari URL
  const { isBlind, isMute } = useAccessibility();
  const { speak } = useVoice();
  const { showSubtitle } = useSubtitle();

  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('mine');
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // State untuk Join Modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joiningGroup, setJoiningGroup] = useState(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const scrollRef = useRef(null);

  // 1. Sinkronisasi URL dengan State SelectedGroup
  useEffect(() => {
    if (groupId && myGroups.length > 0) {
      const group = myGroups.find(g => g.id === groupId);
      if (group) setSelectedGroup(group);
    } else if (!groupId) {
      setSelectedGroup(null);
    }
  }, [groupId, myGroups]);

  // 2. Initial Load & Global Listeners
  useEffect(() => {
    if (!profile?.id) return;

    loadInitialData();

    const channel = supabase.channel('student-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `student_id=eq.${profile.id}` }, () => {
        fetchMyGroups();
        fetchAllGroups();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_join_requests', filter: `student_id=eq.${profile.id}` }, () => {
        fetchMyRequests();
        fetchMyGroups();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchMyGroups(), fetchAllGroups(), fetchMyRequests()]);
    setLoading(false);
  };

  // 3. Chat Real-time Listener
  useEffect(() => {
    if (!selectedGroup) return;

    fetchMessages(selectedGroup.id);
    fetchMembers(selectedGroup.id);
    checkRole(selectedGroup.id);

    const chatChannel = supabase.channel(`chat-${selectedGroup.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${selectedGroup.id}` }, () => {
        fetchMessages(selectedGroup.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(chatChannel); };
  }, [selectedGroup?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const fetchMyGroups = async () => {
    const { data } = await supabase.from('group_members').select('study_groups(*)').eq('student_id', profile.id);
    const groups = data?.map(d => d.study_groups).filter(Boolean) || [];
    setMyGroups(groups);
  };

  const fetchAllGroups = async () => {
    const { data } = await supabase.from('study_groups').select('*').order('created_at', { ascending: false });
    setAllGroups(data || []);
  };

  const fetchMyRequests = async () => {
    const { data } = await supabase.from('group_join_requests').select('group_id, status').eq('student_id', profile.id).eq('status', 'pending');
    setMyRequests(data || []);
  };

  const fetchMessages = async (id) => {
    const { data } = await supabase.from('group_messages').select('*, profiles!sender_id(id, full_name, role)').eq('group_id', id).order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const fetchMembers = async (id) => {
    const { data } = await supabase.from('group_members').select('*, profiles!student_id(id, full_name, disability_type)').eq('group_id', id);
    setMembers(data || []);
  };

  const checkRole = async (id) => {
    const { data } = await supabase.from('group_members').select('role').eq('group_id', id).eq('student_id', profile.id).maybeSingle();
    setIsAdmin(data?.role === 'leader' || profile.role === 'guru' || profile.role === 'admin');
  };

  const filteredGroups = useMemo(() => {
    const source = activeTab === 'mine' ? myGroups : allGroups.filter(g => !myGroups.some(m => m.id === g.id));
    if (!searchQuery.trim()) return source;
    return source.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeTab, myGroups, allGroups, searchQuery]);

  // SMART SOLUTION FOR 100+ GROUPS
  const smartGroups = useMemo(() => {
    let source = filteredGroups;
    if (activeTab === 'discover' && source.length > 100 && !searchQuery) {
      // Solusi Cerdas: Filter berdasarkan jenjang kelas siswa jika tersedia
      const recommended = source.filter(g =>
        g.name.toLowerCase().includes(profile?.class_level?.toLowerCase()) ||
        g.description?.toLowerCase().includes(profile?.class_level?.toLowerCase())
      );
      if (recommended.length > 0) return recommended.slice(0, 20);
      return source.slice(0, 20);
    }
    return source;
  }, [filteredGroups, activeTab, searchQuery, profile?.class_level]);

  const listRef = useRef(null);

  // GESTURE CONTROL FOR TUNAWICARA
  useEffect(() => {
    const handleGesture = (e) => {
      if (!isMute) return;
      const { fingers } = e.detail;

      if (fingers === 1) {
        // Scroll Down / Select Group One by One
        setSelectedIndex(prev => {
          const next = (prev + 1) % smartGroups.length;
          showSubtitle(`🧐 Memilih: ${smartGroups[next]?.name}`, 'info');

          // Auto-scroll to selected item
          setTimeout(() => {
            const el = document.querySelector(`[data-idx="${next}"]`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);

          return next;
        });
      } else if (fingers === 2) {
        if (showJoinModal) {
          // Confirm Join if Modal is open
          submitJoin();
          return;
        }

        if (activeTab === 'mine') {
          // Open Cari Grup
          setActiveTab('discover');
          setSelectedIndex(-1);
          showSubtitle("🔍 Membuka Cari Grup", "success");
        } else {
          // Join Group
          if (selectedIndex >= 0 && smartGroups[selectedIndex]) {
            handleJoinGroup(smartGroups[selectedIndex]);
            showSubtitle(`🤝 Bergabung ke ${smartGroups[selectedIndex].name}`, "success");
          } else {
            showSubtitle("⚠️ Pilih grup dengan 1 jari dulu!", "warning");
          }
        }
      } else if (fingers === 5) {
        if (showJoinModal) {
          setShowJoinModal(false);
          showSubtitle("🔙 Batal Bergabung", "info");
          return;
        }
        // Switch to My Groups
        setActiveTab('mine');
        setSelectedIndex(-1);
        showSubtitle("🏠 Kembali ke Grup Saya", "info");
      }
    };

    window.addEventListener('gesture-detected', handleGesture);
    return () => window.removeEventListener('gesture-detected', handleGesture);
  }, [isMute, activeTab, smartGroups, selectedIndex, showJoinModal, joiningGroup]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;
    const content = newMessage;
    setNewMessage('');
    await supabase.from('group_messages').insert({ group_id: selectedGroup.id, sender_id: profile.id, content });
  };

  const handleSelectGroup = (group) => {
    navigate(`/student/collaboration/${group.id}`);
  };

  const handleJoinGroup = async (group) => {
    setJoiningGroup(group);
    setShowJoinModal(true);
  };

  const submitJoin = async (e) => {
    if (e) e.preventDefault();
    if (isJoining || !joiningGroup) return;
    setIsJoining(true);
    try {
      if (joiningGroup.password && joinPassword !== joinPassword) {
        setJoinError('Sandi salah!');
        setIsJoining(false);
        return;
      }

      if (joiningGroup.requires_approval) {
        await supabase.from('group_join_requests').insert({ group_id: joiningGroup.id, student_id: profile.id });
        alert("Permintaan dikirim!");
        fetchMyRequests();
      } else {
        await supabase.from('group_members').insert({ group_id: joiningGroup.id, student_id: profile.id, role: 'member' });
        fetchMyGroups();
        navigate(`/student/collaboration/${joiningGroup.id}`);
      }
      setShowJoinModal(false);
    } catch (err) { console.error(err); } finally { setIsJoining(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden font-sans text-slate-800">
      <StudentSidebar />
      <main className="flex-1 flex flex-col h-screen relative bg-white">
        <header className="h-20 bg-white/90 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-30 border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            {selectedGroup && <button onClick={() => navigate('/student/collaboration')} className="md:hidden p-2 text-indigo-600 bg-indigo-50 rounded-full"><HiChevronLeft className="text-2xl" /></button>}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg transition-all duration-500 ${selectedGroup ? 'bg-indigo-600 rotate-6' : 'bg-slate-200'}`}>{selectedGroup?.name ? selectedGroup.name[0].toUpperCase() : <HiUsers />}</div>
              <div className="overflow-hidden">
                <h2 className="font-black text-slate-900 truncate text-lg">{selectedGroup?.name || 'Grup Belajar'}</h2>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{selectedGroup ? `${members.length} Teman Belajar` : 'Pilih grup untuk memulai'}</span>
              </div>
            </div>
          </div>
          {selectedGroup && <button onClick={() => setShowMemberPanel(!showMemberPanel)} className="p-3 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"><HiDotsVertical className="text-xl" /></button>}
        </header>

        <div className="flex-1 flex overflow-hidden">
          <motion.div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-100 flex flex-col shrink-0 z-20 ${selectedGroup ? 'hidden md:flex' : 'flex'}`}>
             <div className="p-6 space-y-6">
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 relative">
                    {['mine', 'discover'].map((tab) => (
                      <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(''); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all relative z-10 ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {tab === 'mine' ? 'Grup Saya' : 'Cari Grup'}
                        {activeTab === tab && <motion.div layoutId="tab-active" className="absolute inset-0 bg-white shadow-sm border border-slate-100 rounded-xl -z-10" />}
                      </button>
                    ))}
                </div>
                <div className="relative group">
                   <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari kelompok..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl text-xs font-bold transition-all outline-none" />
                </div>
                {activeTab === 'discover' && filteredGroups.length > 100 && (
                   <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                      <p className="text-[10px] font-black text-amber-600 uppercase leading-tight">
                         ⚠️ Solusi Cerdas: Ada {filteredGroups.length} grup! Kak Bintang menyarankan ketik nama grup agar lebih cepat ditemukan.
                      </p>
                   </div>
                )}
             </div>
             <div ref={listRef} className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 custom-scrollbar">
                {smartGroups.map((g, idx) => {
                  const isPending = myRequests.some(r => r.group_id === g.id);
                  const isGestureSelected = selectedIndex === idx;
                  return (
                    <motion.button key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      onClick={() => isPending ? null : (activeTab === 'mine' ? handleSelectGroup(g) : handleJoinGroup(g))}
                      data-idx={idx}
                      className={`w-full p-4 text-left flex items-center gap-4 transition-all rounded-3xl group ${selectedGroup?.id === g.id ? 'bg-indigo-600 text-white shadow-xl' : (isGestureSelected ? 'bg-indigo-50 border-2 border-indigo-200 shadow-md' : 'hover:bg-slate-50')} ${isPending ? 'opacity-50' : ''}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${selectedGroup?.id === g.id ? 'bg-white/20' : (isGestureSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100')}`}>{g.name[0].toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center"><p className="font-black text-sm truncate">{g.name}</p>{isPending && <span className="bg-amber-100 text-amber-600 text-[7px] px-2 py-0.5 rounded-full font-black">PENDING</span>}</div>
                         <p className={`text-[11px] truncate ${selectedGroup?.id === g.id ? 'text-indigo-100' : 'text-slate-400'}`}>{isPending ? 'Menunggu izin' : g.description || 'Yuk kolaborasi!'}</p>
                      </div>
                      {isGestureSelected && isMute && (
                         <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black animate-bounce">
                            JARI 2
                         </div>
                      )}
                    </motion.button>
                  );
                })}
             </div>
          </motion.div>

          <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden transition-all">
            {selectedGroup ? (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 pb-28 custom-scrollbar">
                   {messages.map((msg, i) => {
                     const isMe = msg.sender_id === profile.id;
                     return (
                       <motion.div key={msg.id || i} initial={{ opacity: 0, scale: 0.9, x: isMe ? 20 : -20 }} animate={{ opacity: 1, scale: 1, x: 0 }} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-[2rem] shadow-sm relative ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none'}`}>
                             {!isMe && <p className="text-[10px] font-black text-indigo-600 mb-2">{msg.profiles?.full_name}</p>}
                             <p className="text-sm font-bold">{msg.content}</p>
                             <div className={`flex items-center gap-2 mt-2 ${isMe ? 'justify-end text-indigo-200' : 'text-slate-400'}`}><p className="text-[9px] font-black uppercase">{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>{isMe && <HiCheck />}</div>
                          </div>
                       </motion.div>
                     );
                   })}
                </div>
                <div className="absolute bottom-6 inset-x-6 z-10">
                   {selectedGroup.is_chat_disabled && !isAdmin ? (
                     <div className="bg-white/90 p-5 rounded-3xl text-center text-[10px] font-black text-slate-400 shadow-xl flex items-center justify-center gap-3"><HiLockClosed className="text-rose-500" /> Chat dikunci</div>
                   ) : (
                     <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex gap-3 items-center">
                        <div className="flex-1 flex items-center bg-white rounded-[2.5rem] px-6 py-1 shadow-2xl border border-slate-100">
                           <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Tulis pesan..." className="flex-1 py-4 bg-transparent outline-none text-sm font-bold" />
                        </div>
                        <button type="submit" disabled={!newMessage.trim()} className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl disabled:opacity-50"><HiPaperAirplane className="text-2xl rotate-45 -mt-1 -ml-1" /></button>
                     </form>
                   )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-48 h-48 bg-indigo-50 rounded-[3rem] flex items-center justify-center mb-10 border border-indigo-100/50 relative"><HiChatAlt className="text-8xl text-indigo-600/20" /><div className="absolute inset-0 flex items-center justify-center"><HiSparkles className="text-4xl text-indigo-600 animate-pulse" /></div></motion.div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Grup Belajar & Kolaborasi</h3>
                <p className="text-sm font-bold text-slate-400 max-w-sm uppercase tracking-widest">Bergabunglah dalam komunitas belajar interaktif.</p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showJoinModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-indigo-600 shadow-lg" />
                <h2 className="text-2xl font-black text-slate-900 mb-2 text-center">Gabung Komunitas</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center mb-6">Bergabung ke <span className="text-indigo-600">{joiningGroup?.name}</span></p>
                <form onSubmit={submitJoin} className="space-y-6">
                  {joiningGroup?.password && <input type="password" value={joinPassword} onChange={e => setJoinPassword(e.target.value)} placeholder="Sandi Kelompok" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2rem] outline-none font-bold" autoFocus />}
                  {joinError && <p className="text-[10px] font-black text-rose-600 uppercase text-center">{joinError}</p>}
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowJoinModal(false)} className="flex-1 py-5 font-black text-[10px] uppercase bg-slate-100 text-slate-400 rounded-[2rem]">Batal</button>
                    <button type="submit" disabled={isJoining} className="flex-1 py-5 font-black text-[10px] uppercase bg-indigo-600 text-white rounded-[2rem] shadow-xl">{isJoining ? '...' : 'Gabung'}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Navigation Info for Tunawicara */}
        {isMute && (
          <div className="bg-slate-900 text-white py-4 px-10 flex items-center justify-between shrink-0 z-[120] border-t border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.1em]">
                  {selectedGroup ? `AKTIF DI GRUP: ${selectedGroup.name}` : (activeTab === 'mine' ? 'PILIH GRUP SAYA' : 'CARI & GABUNG GRUP')}
                </p>
             </div>
             <div className="flex gap-10 items-center">
                <div className="flex gap-6">
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest"><span className="text-white bg-indigo-600 px-2 py-0.5 rounded mr-1">1</span> Pilih Satu-Satu</p>
                   {activeTab === 'mine' ? (
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest"><span className="text-white bg-emerald-600 px-2 py-0.5 rounded mr-1">2</span> Cari Grup</p>
                   ) : (
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest"><span className="text-white bg-emerald-600 px-2 py-0.5 rounded mr-1">2</span> Gabung Grup</p>
                   )}
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest"><span className="text-white bg-slate-700 px-2 py-0.5 rounded mr-1">5</span> Grup Saya</p>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentCollaboration;

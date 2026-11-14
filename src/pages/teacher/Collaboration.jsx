import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import TeacherSidebar from '@/components/layout/TeacherSidebar';
import {
  HiCheck, HiX, HiUserAdd, HiUserRemove, HiLogout, HiChatAlt2, HiTrash,
  HiLockClosed, HiLockOpen, HiUsers, HiUserGroup, HiAcademicCap, HiSearch, HiBell,
  HiBookOpen, HiGlobe, HiLightningBolt, HiCube, HiColorSwatch, HiBeaker
} from 'react-icons/hi';

const ICON_OPTIONS = [
  { id: 'book', label: 'Buku', icon: <HiBookOpen className="text-xl" /> },
  { id: 'academic', label: 'Sains', icon: <HiAcademicCap className="text-xl" /> },
  { id: 'users', label: 'Diskusi', icon: <HiUserGroup className="text-xl" /> },
  { id: 'globe', label: 'Bahasa', icon: <HiGlobe className="text-xl" /> },
  { id: 'lightning', label: 'Kreatif', icon: <HiLightningBolt className="text-xl" /> },
  { id: 'puzzle', label: 'Logika', icon: <HiCube className="text-xl" /> },
  { id: 'art', label: 'Seni', icon: <HiColorSwatch className="text-xl" /> },
  { id: 'beaker', label: 'Lab', icon: <HiBeaker className="text-xl" /> },
];

export const renderGroupIcon = (iconName, className = "text-xl") => {
  switch (iconName) {
    case 'academic': return <HiAcademicCap className={className} />;
    case 'users': return <HiUserGroup className={className} />;
    case 'globe': return <HiGlobe className={className} />;
    case 'lightning': return <HiLightningBolt className={className} />;
    case 'puzzle': return <HiCube className={className} />;
    case 'art': return <HiColorSwatch className={className} />;
    case 'beaker': return <HiBeaker className={className} />;
    case 'book':
    default: return <HiBookOpen className={className} />;
  }
};

const TeacherCollaboration = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { groupId } = useParams(); // Ambil ID dari URL

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    description: '',
    confirmText: '',
    type: 'danger',
    icon: '❓',
    onConfirm: null
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    password: '',
    requires_approval: false,
    icon: 'book'
  });

  const handleCreateOrUpdateGroup = async (e) => {
    if (e) e.preventDefault();
    if (!groupForm.name.trim()) return;

    try {
      const payload = {
        name: groupForm.name.trim(),
        description: groupForm.description.trim(),
        requires_approval: groupForm.requires_approval,
        icon: groupForm.icon || 'book',
        created_by: profile.id,
        class_code: profile?.class_code || 'DEMO01'
      };

      if (isEditing && selectedGroup) {
        await supabase.from('study_groups').update(payload).eq('id', selectedGroup.id);
      } else {
        await supabase.from('study_groups').insert(payload);
      }

      setShowCreateModal(false);
      setGroupForm({ name: '', description: '', password: '', requires_approval: false, icon: 'book' });
      fetchGroups();
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  const scrollRef = useRef(null);

  // 1. Sinkronisasi URL dengan State SelectedGroup
  useEffect(() => {
    if (groupId && groups.length > 0) {
      const group = groups.find(g => g.id === groupId);
      if (group) setSelectedGroup(group);
    } else if (!groupId) {
      setSelectedGroup(null);
    }
  }, [groupId, groups]);

  // 2. Initial Data & Global Sync
  const fetchGroups = async () => {
    setLoading(true);
    const { data: groupsData } = await supabase.from('study_groups').select('*').eq('created_by', profile.id).order('created_at', { ascending: false });
    if (groupsData) {
      const { data: reqs } = await supabase.from('group_join_requests').select('group_id').eq('status', 'pending');
      const enriched = groupsData.map(g => ({ ...g, requestCount: reqs?.filter(r => r.group_id === g.id).length || 0 }));
      setGroups(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
    const requestsSub = supabase.channel('teacher-notif')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_join_requests' }, () => fetchGroups())
      .subscribe();
    return () => { supabase.removeChannel(requestsSub); };
  }, [profile.id]);

  // 3. Area Chat Real-time
  useEffect(() => {
    if (!selectedGroup) return;

    const loadData = async () => {
      const { data: msgs } = await supabase.from('group_messages').select('*, profiles!sender_id(full_name, role)').eq('group_id', selectedGroup.id).order('created_at', { ascending: true });
      if (msgs) setMessages(msgs);
      const { data: mems } = await supabase.from('group_members').select('*, profiles!student_id(full_name, disability_type)').eq('group_id', selectedGroup.id);
      if (mems) setMembers(mems);
      const { data: reqs } = await supabase.from('group_join_requests').select('*, profiles!student_id(full_name)').eq('group_id', selectedGroup.id).eq('status', 'pending');
      if (reqs) setRequests(reqs);
    };

    loadData();

    const channel = supabase.channel(`mgmt-${selectedGroup.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${selectedGroup.id}` }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${selectedGroup.id}` }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_join_requests', filter: `group_id=eq.${selectedGroup.id}` }, () => loadData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedGroup?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Handlers
  const handleApprove = async (requestId, studentId) => {
    await supabase.from('group_members').insert([{ group_id: selectedGroup.id, student_id: studentId, role: 'member' }]);
    await supabase.from('group_join_requests').delete().eq('id', requestId);
    fetchGroups();
  };

  const handleReject = (requestId, studentName = '') => {
    setConfirmModal({
      show: true,
      title: 'Tolak Permintaan Siswa?',
      description: `Apakah Anda yakin ingin menolak permintaan bergabung ${studentName ? `dari ${studentName}` : 'siswa ini'} ke kelompok belajar?`,
      confirmText: 'Tolak Permintaan',
      type: 'danger',
      icon: '🚫',
      onConfirm: async () => {
        await supabase.from('group_join_requests').delete().eq('id', requestId);
        fetchGroups();
      }
    });
  };

  const handleDeleteGroup = () => {
    if (!selectedGroup) return;
    setConfirmModal({
      show: true,
      title: 'Hapus Kelompok Belajar?',
      description: `Kelompok "${selectedGroup.name}" beserta seluruh riwayat percakapan di dalamnya akan dihapus secara permanen.`,
      confirmText: 'Hapus Permanen',
      type: 'danger',
      icon: '🗑️',
      onConfirm: async () => {
        await supabase.from('study_groups').delete().eq('id', selectedGroup.id);
        navigate('/teacher/collaboration');
        fetchGroups();
      }
    });
  };

  const handleRemoveMember = (memberId, studentId, studentName = '') => {
    setConfirmModal({
      show: true,
      title: 'Keluarkan Siswa dari Kelompok?',
      description: `Apakah Anda yakin ingin mengeluarkan ${studentName ? `"${studentName}"` : 'siswa ini'} dari kelompok belajar "${selectedGroup?.name}"?`,
      confirmText: 'Keluarkan Siswa',
      type: 'danger',
      icon: <HiUserRemove className="text-3xl text-rose-500" />,
      onConfirm: async () => {
        const { error } = await supabase.from('group_members').delete().eq('id', memberId);
        if (!error) {
          setMembers(prev => prev.filter(m => m.id !== memberId));
          fetchGroups();
        }
      }
    });
  };

  const toggleChat = async () => {
    const newVal = !selectedGroup.is_chat_disabled;
    await supabase.from('study_groups').update({ is_chat_disabled: newVal }).eq('id', selectedGroup.id);
    setSelectedGroup({ ...selectedGroup, is_chat_disabled: newVal });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const content = newMessage;
    setNewMessage('');
    await supabase.from('group_messages').insert({ group_id: selectedGroup.id, sender_id: profile.id, content });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <TeacherSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        <header className="px-10 py-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Kolaborasi</h2></div>
          <button onClick={() => { setIsEditing(false); setShowCreateModal(true); }} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl">+ Buat Kelompok</button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-85 border-r border-slate-100 bg-white overflow-y-auto shrink-0 p-6 space-y-4 custom-scrollbar">
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => navigate(`/teacher/collaboration/${group.id}`)}
                className={`w-full p-4 text-left rounded-[2rem] transition-all relative overflow-hidden group flex items-center gap-4 ${
                  selectedGroup?.id === group.id ? 'bg-indigo-600 text-white shadow-2xl' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-all ${
                  selectedGroup?.id === group.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                }`}>
                  {renderGroupIcon(group.icon)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-black text-sm truncate">{group.name}</p>
                    {group.requestCount > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 animate-bounce">
                        <HiBell /> {group.requestCount}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${selectedGroup?.id === group.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {group.description || 'Kelompok Belajar'}
                  </p>
                </div>

                {selectedGroup?.id === group.id && <motion.div layoutId="bg-glow-t" className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 -z-10" />}
              </button>
            ))}
          </div>

          <div className="flex-1 flex overflow-hidden">
            {selectedGroup ? (
              <>
                <div className="flex-1 flex flex-col bg-slate-50 border-r border-slate-100 overflow-hidden">
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.sender_id === profile.id ? 'items-end' : 'items-start'}`}>
                        <span className="text-[9px] font-black text-slate-400 mb-2 ml-2 uppercase">{msg.profiles?.full_name}</span>
                        <div className={`max-w-[80%] p-5 rounded-[2rem] text-sm shadow-sm font-bold ${msg.sender_id === profile.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}`}>{msg.content}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-8 bg-white border-t border-slate-100">
                    <form onSubmit={sendMessage} className="flex gap-4 max-w-4xl mx-auto"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Tulis pengumuman..." className="flex-1 px-8 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none text-sm font-bold" /><button type="submit" className="px-10 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl">Kirim</button></form>
                  </div>
                </div>

                <div className="w-100 bg-white overflow-y-auto p-10 space-y-12 custom-scrollbar">
                  {requests.length > 0 && (
                    <div className="p-8 bg-rose-50 rounded-[3rem] border border-rose-100 shadow-xl shadow-rose-100/50">
                      <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-3"><HiUserAdd className="text-xl" /> Permintaan Masuk</h3>
                      <div className="space-y-4">
                        {requests.map(req => (
                          <div key={req.id} className="p-5 bg-white rounded-[2rem] flex items-center justify-between shadow-sm">
                            <span className="text-xs font-black text-slate-700 truncate mr-4">{req.profiles?.full_name}</span>
                            <div className="flex gap-2"><button onClick={() => handleApprove(req.id, req.student_id)} className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><HiCheck /></button><button onClick={() => handleReject(req.id, req.profiles?.full_name)} className="w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><HiX /></button></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={toggleChat} className={`py-5 rounded-[2rem] font-black text-[9px] uppercase tracking-widest ${selectedGroup.is_chat_disabled ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{selectedGroup.is_chat_disabled ? 'Buka Chat' : 'Kunci Chat'}</button>
                    <button onClick={handleDeleteGroup} className="py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[9px] uppercase tracking-widest">Hapus Grup</button>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Anggota ({members.length})</h3>
                    <div className="space-y-3">
                      {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100/60 transition-all group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs font-black uppercase shrink-0 shadow-sm">
                              {m.profiles?.full_name?.[0] || 'S'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-800 truncate">{m.profiles?.full_name}</p>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                {m.profiles?.disability_type || 'Umum'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveMember(m.id, m.student_id, m.profiles?.full_name)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 text-[10px] font-bold rounded-xl border border-rose-100 transition-all shrink-0 flex items-center gap-1.5"
                            title="Keluarkan Siswa dari Grup"
                          >
                            <HiUserRemove className="text-sm" /> Keluarkan
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30"><HiUserGroup className="text-8xl mb-6 text-indigo-400" /><p className="font-black uppercase tracking-[0.4em] text-xs text-slate-500">Pilih Manajemen Kelompok</p></div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-indigo-600 shadow-lg" />
              <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight text-center">Buat Komunitas</h2>
              <form onSubmit={handleCreateOrUpdateGroup} className="space-y-6">
                <input type="text" required value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} placeholder="Nama Kelompok" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2rem] outline-none font-bold shadow-inner text-sm" />
                <textarea value={groupForm.description} onChange={e => setGroupForm({...groupForm, description: e.target.value})} placeholder="Deskripsi Singkat" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2rem] outline-none font-bold min-h-[100px] shadow-inner text-sm" />

                {/* Icon Picker for Group */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-3">Pilih Ikon Kelompok</label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {ICON_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGroupForm({ ...groupForm, icon: opt.id })}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                          groupForm.icon === opt.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                            : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                        }`}
                        title={opt.label}
                      >
                        {opt.icon}
                        <span className="text-[9px] font-black uppercase truncate w-full text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-4 p-4 bg-indigo-50 rounded-3xl border border-indigo-100 cursor-pointer">
                  <input type="checkbox" checked={groupForm.requires_approval} onChange={e => setGroupForm({...groupForm, requires_approval: e.target.checked})} className="w-5 h-5 rounded-xl border-slate-300 text-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Sistem Persetujuan</span>
                </label>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-black text-[10px] uppercase bg-slate-100 text-slate-400 rounded-[2rem]">Batal</button>
                  <button type="submit" className="flex-1 py-4 font-black text-[10px] uppercase bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-200">Buat Sekarang</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Custom Clean & Elegant Confirmation Card Modal */}
        {confirmModal.show && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ ...confirmModal, show: false })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm md:max-w-md rounded-[2.5rem] shadow-2xl p-7 md:p-8 border border-slate-100 flex flex-col items-center text-center overflow-hidden z-10"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg ${
                confirmModal.type === 'danger'
                  ? 'bg-rose-50 text-rose-500 shadow-rose-100 border border-rose-100'
                  : 'bg-indigo-50 text-indigo-600 shadow-indigo-100 border border-indigo-100'
              }`}>
                {confirmModal.icon}
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                {confirmModal.title}
              </h3>

              <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8 px-2">
                {confirmModal.description}
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, show: false });
                  }}
                  className={`flex-1 py-3.5 text-white rounded-2xl font-bold text-xs shadow-lg transition-all ${
                    confirmModal.type === 'danger'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .w-85 { width: 340px; } .w-100 { width: 400px; }
      `}</style>
    </div>
  );
};

export default TeacherCollaboration;

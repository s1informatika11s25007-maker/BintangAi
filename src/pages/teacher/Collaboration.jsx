import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import TeacherSidebar from '@/components/layout/TeacherSidebar';
import { HiCheck, HiX, HiUserAdd, HiChatAlt2, HiTrash, HiLockClosed, HiLockOpen, HiUsers, HiSparkles, HiSearch, HiBell } from 'react-icons/hi';

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

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    password: '',
    requires_approval: false
  });

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

  const handleReject = async (requestId) => {
    if (window.confirm('Tolak permintaan?')) {
      await supabase.from('group_join_requests').delete().eq('id', requestId);
      fetchGroups();
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup || !window.confirm('Hapus grup permanen?')) return;
    await supabase.from('study_groups').delete().eq('id', selectedGroup.id);
    navigate('/teacher/collaboration');
    fetchGroups();
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
              <button key={group.id} onClick={() => navigate(`/teacher/collaboration/${group.id}`)} className={`w-full p-6 text-left rounded-[2rem] transition-all relative overflow-hidden group ${selectedGroup?.id === group.id ? 'bg-indigo-600 text-white shadow-2xl' : 'hover:bg-slate-50 text-slate-700'}`}>
                <div className="flex justify-between items-start relative z-10">
                   <p className="font-black text-sm truncate pr-4">{group.name}</p>
                   {group.requestCount > 0 && <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-lg flex items-center gap-1 animate-bounce"><HiBell /> {group.requestCount}</span>}
                </div>
                {selectedGroup?.id === group.id && <motion.div layoutId="bg-glow-t" className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 -z-0" />}
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
                            <div className="flex gap-2"><button onClick={() => handleApprove(req.id, req.student_id)} className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><HiCheck /></button><button onClick={() => handleReject(req.id)} className="w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><HiX /></button></div>
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
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Anggota ({members.length})</h3>
                    <div className="space-y-6">
                      {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xs font-black uppercase text-slate-400">{m.profiles?.full_name[0]}</div>
                            <div><p className="text-xs font-black text-slate-800">{m.profiles?.full_name}</p><p className="text-[8px] text-slate-400 font-black uppercase">{m.profiles?.disability_type || 'Umum'}</p></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-20"><HiSparkles className="text-9xl mb-6 text-indigo-200" /><p className="font-black uppercase tracking-[0.4em] text-xs">Pilih Manajemen Kelompok</p></div>
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
                <input type="text" required value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} placeholder="Nama Kelompok" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2rem] outline-none font-bold shadow-inner" />
                <textarea value={groupForm.description} onChange={e => setGroupForm({...groupForm, description: e.target.value})} placeholder="Deskripsi Singkat" className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2rem] outline-none font-bold min-h-[120px] shadow-inner" />
                <label className="flex items-center gap-4 p-4 bg-indigo-50 rounded-3xl border border-indigo-100 cursor-pointer"><input type="checkbox" checked={groupForm.requires_approval} onChange={e => setGroupForm({...groupForm, requires_approval: e.target.checked})} className="w-6 h-6 rounded-xl border-slate-300 text-indigo-600" /><span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Sistem Persetujuan</span></label>
                <div className="flex gap-4 pt-6"><button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-5 font-black text-[10px] uppercase bg-slate-100 text-slate-400 rounded-[2rem]">Batal</button><button type="submit" className="flex-1 py-5 font-black text-[10px] uppercase bg-indigo-600 text-white rounded-[2rem] shadow-xl shadow-indigo-200">Buat Sekarang</button></div>
              </form>
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

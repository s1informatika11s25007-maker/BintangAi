import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import BintangAvatar from '@/features/ai-tutor/components/BintangAvatar';
import ConfettiEffect from '@/components/feedback/ConfettiEffect';
import { supabase } from '@/lib/supabaseClient';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import StudentSidebar from '@/components/layout/StudentSidebar';
import { useAI } from '@/features/ai-tutor';
import {
  HiFire, HiLightningBolt, HiStar, HiChevronRight,
  HiAcademicCap, HiCube, HiChatAlt2, HiVariable,
  HiEye, HiSpeakerphone, HiHeart, HiCollection, HiUsers
} from 'react-icons/hi';

const StudentDashboard = () => {
  const { profile, fetchProfile } = useAuthStore();
  const navigate = useNavigate();
  const { showSubtitle } = useSubtitle();
  const { isBlind, isDeaf } = useAccessibility();
  const { getWeakTopics, getAudioGuide } = useAI();

  const [tasks, setTasks] = useState(null);
  const [modules, setModules] = useState(null);
  const [groups, setGroups] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [avatarState, setAvatarState] = useState('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const hasAnnouncedRef = useRef(false);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 11) setGreeting('Selamat Pagi');
    else if (hours < 15) setGreeting('Selamat Siang');
    else if (hours < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    if (profile?.id) {
      fetchProfile(profile.id);
      fetchTasks();
      fetchModules();
      fetchGroups();
      fetchLeaderboard();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (profile && isBlind && !hasAnnouncedRef.current) {
      const announceWelcome = async () => {
        hasAnnouncedRef.current = true;
        setAvatarState('happy');
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
          setAvatarState('idle');
        }, 3500);
      };
      announceWelcome();
    }
  }, [profile, isBlind]);

  const fetchTasks = async () => {
    if (!profile?.id) return;
    try {
      const { data: submissions } = await supabase.from('submissions').select('assignment_id').eq('student_id', profile.id);
      const submittedIds = submissions?.map(s => s.assignment_id) || [];

      let filterParts = ['is_public.eq.true'];
      if (profile.class_code) {
        const { data: teachers } = await supabase.from('profiles').select('id').eq('class_code', profile.class_code).eq('role', 'guru');
        teachers?.forEach(t => filterParts.push(`teacher_id.eq.${t.id}`));
      }

      let query = supabase.from('assignments').select('*, modules(title)').or(filterParts.join(','));
      if (submittedIds.length > 0) query = query.not('id', 'in', `(${submittedIds.join(',')})`);

      const { data } = await query.order('deadline', { ascending: true }).limit(3);
      setTasks(data || []);
    } catch { setTasks([]); }
  };

  const fetchModules = async () => {
    try {
      const { data } = await supabase.from('modules').select('*').order('created_at', { ascending: false }).limit(3);
      setModules(data || []);
    } catch { setModules([]); }
  };

  const fetchGroups = async () => {
    if (!profile?.id) return;
    try {
      const { data } = await supabase
        .from('study_groups')
        .select('*, group_members!inner(student_id)')
        .eq('group_members.student_id', profile.id)
        .limit(3);
      setGroups(data || []);
    } catch { setGroups([]); }
  };

  const fetchLeaderboard = async () => {
    if (!profile?.id) return;
    let query = supabase.from('profiles').select('id, full_name, xp').eq('role', 'siswa');
    if (profile.class_code) query = query.eq('class_code', profile.class_code);
    const { data } = await query.order('xp', { ascending: false }).limit(5);
    setLeaderboard(data || []);
  };

  const currentLevel = Math.floor((profile?.xp || 0) / 1000) + 1;
  const progressPercentage = ((profile?.xp || 0) % 1000) / 10;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', damping: 25, stiffness: 200 }
    }
  };

  // ---------------------------------------------------------
  // MOBILE (ANDROID) & ACCESSIBILITY Logic
  // ---------------------------------------------------------

  return (
    <div className={`min-h-screen flex font-sans relative ${isBlind ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-800'}`}>
      <ConfettiEffect active={showConfetti} />
      <StudentSidebar />

      <main className="flex-1 w-full overflow-y-auto no-scrollbar relative z-10 pb-24 lg:pb-8">

        {/* TOP STATUS BAR - Ultra Responsive */}
        <header className={`sticky top-0 z-[50] px-6 py-5 md:px-12 md:py-8 backdrop-blur-xl border-b ${isBlind ? 'bg-indigo-950/80 border-white/10' : 'bg-white/80 border-slate-100'} flex items-center justify-between`}>
          <div className="flex items-center gap-4 md:gap-6">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative cursor-pointer"
            >
              <BintangAvatar state={avatarState} size={window.innerWidth < 768 ? "md" : "lg"} />
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </motion.div>
            <div>
              <p className={`font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] mb-1 ${isBlind ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {greeting}
              </p>
              <h1 className={`text-2xl md:text-4xl font-black tracking-tighter truncate max-w-[180px] md:max-w-none`}>
                {profile?.full_name?.split(' ')[0]} <span className={isBlind ? 'text-indigo-400' : 'text-indigo-600'}>.</span>
              </h1>
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-3 ${isBlind ? 'bg-white/10 border-white/20' : 'bg-white border-slate-50 shadow-xl shadow-indigo-100/20'} px-5 py-3 rounded-2xl border`}
          >
            <HiStar className="text-amber-400 text-xl md:text-2xl animate-pulse" />
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Bintang</p>
              <p className={`text-sm md:text-lg font-black leading-none mt-1`}>{profile?.xp || 0}</p>
            </div>
          </motion.div>
        </header>

        {/* CONTENT GRID - Mobile First Stacking */}
        <div className="p-6 md:p-12 lg:p-16 max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden" animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10"
          >

            {/* HERO SECTION - Progress & Level */}
            <motion.section
              variants={itemVariants}
              className={`lg:col-span-8 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl relative overflow-hidden group ${
                isBlind ? 'bg-indigo-900 border border-white/10' : 'bg-white border border-slate-50'
              }`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-[100px] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] flex items-center justify-center text-4xl shadow-xl ${isBlind ? 'bg-white/10 text-white' : 'bg-indigo-600 text-white shadow-indigo-200'}`}>
                    <HiFire />
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-5xl font-black tracking-tighter">Level {currentLevel}</h3>
                    <p className={`text-xs font-black uppercase tracking-[0.3em] mt-1 ${isBlind ? 'text-indigo-300' : 'text-slate-400'}`}>Target Berikutnya: {currentLevel * 1000} XP</p>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                   <p className={`text-6xl font-black tracking-tighter ${isBlind ? 'text-indigo-400' : 'text-indigo-600'}`}>{Math.round(progressPercentage)}%</p>
                </div>
              </div>

              <div className="mt-10 relative">
                 <div className={`h-6 md:h-8 rounded-full border-[6px] overflow-hidden ${isBlind ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-white shadow-inner'}`}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 2, ease: "circOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${isBlind ? 'from-indigo-600 to-purple-500' : 'from-indigo-500 via-indigo-600 to-indigo-700'} relative`}
                    >
                       <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                    </motion.div>
                 </div>
                 <div className="flex justify-between mt-3">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Mulai</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Level Up</span>
                 </div>
              </div>
            </motion.section>

            {/* QUICK ACTIONS - Specialized for Roles */}
            <motion.section variants={itemVariants} className="lg:col-span-4 grid grid-cols-2 gap-4">
               <button
                onClick={() => navigate('/student/tasks')}
                className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                  isBlind ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-100 hover:border-amber-200'
                }`}
               >
                  <HiLightningBolt size={32} className="text-amber-300" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Mulai Quiz</span>
               </button>
               <button
                onClick={() => navigate(profile?.disability_type === 'tunanetra' ? '/student/playground' : '/student/tanya-ai')}
                className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                  isBlind ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-100 hover:border-indigo-200'
                }`}
               >
                  <HiChatAlt2 size={32} className="text-indigo-300" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Tanya AI</span>
               </button>
               <button
                onClick={() => navigate('/student/modules')}
                className={`col-span-2 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-between px-10 transition-all active:scale-95 shadow-lg ${
                  isBlind ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-100'
                }`}
               >
                  <div className="flex items-center gap-6">
                    <HiAcademicCap size={32} className="text-blue-400" />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Perpustakaan Materi</span>
                  </div>
                  <HiChevronRight />
               </button>
            </motion.section>

            {/* LISTS SECTIONS */}
            <div className="lg:col-span-8 space-y-10">
               {/* Upcoming Quiz */}
               <motion.div variants={itemVariants} className={`p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] ${isBlind ? 'bg-white/5 border border-white/5' : 'bg-white shadow-sm border border-slate-50'}`}>
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <HiCollection className="text-amber-500" /> Quiz Terbaru
                     </h4>
                     <button onClick={() => navigate('/student/tasks')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Semua</button>
                  </div>
                  <div className="space-y-4">
                     {tasks?.map(task => (
                       <motion.div
                        whileHover={{ x: 10 }} key={task.id}
                        onClick={() => navigate(`/student/task/${task.id}`)}
                        className={`p-6 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                          isBlind ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-transparent hover:border-indigo-100 hover:bg-white'
                        }`}
                       >
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><HiLightningBolt /></div>
                             <div>
                                <p className="font-bold text-sm md:text-base">{task.title}</p>
                                <p className="text-[10px] opacity-40 uppercase font-black">Batas: {new Date(task.deadline).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <HiChevronRight className="opacity-30" />
                       </motion.div>
                     ))}
                     {tasks?.length === 0 && <p className="text-center py-10 opacity-30 text-xs font-black uppercase tracking-widest">Kosong untuk saat ini</p>}
                  </div>
               </motion.div>

               {/* Learning Groups */}
               <motion.div variants={itemVariants} className={`p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] ${isBlind ? 'bg-white/5 border border-white/5' : 'bg-white shadow-sm border border-slate-50'}`}>
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <HiUsers className="text-emerald-500" /> Teman Belajar
                     </h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                     {groups?.map(g => (
                       <div key={g.id} className={`p-6 rounded-[2rem] border transition-all ${isBlind ? 'bg-indigo-900/40 border-white/10' : 'bg-slate-50 border-transparent'}`}>
                          <p className="font-bold mb-2">{g.name}</p>
                          <button onClick={() => navigate('/student/collaboration')} className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Masuk Diskusi</button>
                       </div>
                     ))}
                     {groups?.length === 0 && <button onClick={() => navigate('/student/collaboration')} className="col-span-2 py-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Cari Grup Belajar</button>}
                  </div>
               </motion.div>
            </div>

            {/* SIDEBAR WIDGETS */}
            <div className="lg:col-span-4 space-y-10">
               {/* Accessibility Assist for Tunanetra */}
               {isBlind && (
                 <motion.section variants={itemVariants} className="bg-indigo-600 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner"><HiSpeakerphone /></div>
                    <h4 className="text-2xl font-black leading-none">Bantuan Suara</h4>
                    <p className="text-sm font-bold opacity-80 leading-relaxed uppercase tracking-widest">Ketuk di mana saja untuk mendengar navigasi atau gunakan tombol di bawah untuk panduan lengkap.</p>
                    <button onClick={() => getAudioGuide()} className="w-full py-5 bg-white text-indigo-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-lg active:scale-95">Dengarkan Panduan</button>
                 </motion.section>
               )}

               {/* Deaf Vision Assist for Tunarungu */}
               {profile?.disability_type === 'tunarungu' && (
                  <motion.section
                    variants={itemVariants} onClick={() => navigate('/student/live-captions')}
                    className="bg-gradient-to-br from-emerald-500 to-teal-700 p-8 rounded-[2.5rem] text-white shadow-2xl cursor-pointer active:scale-95 transition-all group"
                  >
                     <div className="flex justify-between items-start mb-10">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform"><HiEye /></div>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-[8px] font-black uppercase tracking-widest">Live Assist</span>
                     </div>
                     <h4 className="text-2xl font-black leading-none mb-3 tracking-tighter uppercase">Mata Pintar AI</h4>
                     <p className="text-xs font-bold opacity-80 leading-relaxed uppercase tracking-widest">Ubah suara di sekitarmu menjadi teks otomatis dengan akurasi 100%.</p>
                  </motion.section>
               )}

               {/* Leaderboard Compact */}
               <motion.section variants={itemVariants} className={`p-8 rounded-[2.5rem] ${isBlind ? 'bg-white/5 border border-white/5 shadow-2xl' : 'bg-slate-900 shadow-xl shadow-slate-200'} text-white`}>
                  <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-indigo-400 flex items-center gap-3"><HiStar className="animate-spin-slow" /> Peringkat Kelas</h4>
                  <div className="space-y-5">
                     {leaderboard?.map((s, i) => (
                       <div key={s.id} className={`flex items-center gap-5 p-3 rounded-2xl ${s.id === profile?.id ? 'bg-indigo-600/30 ring-1 ring-indigo-500' : ''}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-400 text-amber-950' : i === 1 ? 'bg-slate-300 text-slate-800' : 'bg-slate-800 text-slate-500'}`}>{i + 1}</div>
                          <span className="flex-1 font-bold text-sm truncate">{s.full_name}</span>
                          <span className="font-black text-xs text-indigo-400">{s.xp} <span className="text-[7px] opacity-40 uppercase">XP</span></span>
                       </div>
                     ))}
                  </div>
               </motion.section>
            </div>

          </motion.div>
        </div>
      </main>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 2.5s infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;

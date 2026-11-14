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
import Footer from '@/components/layout/Footer';
import { useAI } from '@/features/ai-tutor';
import { getAvailableAssignments } from '@/features/quiz/api/getAssignmentsApi';
import { getCleanFirstName } from '@/utils';
import {
  HiFire, HiLightningBolt, HiAcademicCap, HiChevronRight,
  HiCube, HiChatAlt2, HiVariable,
  HiEye, HiSpeakerphone, HiHeart, HiCollection, HiUsers, HiBookOpen, HiStar
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
  const [isKamusOpen, setIsKamusOpen] = useState(false);
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

      // Realtime listener (< 1s auto appear when teacher creates new QuizKu)
      const channelName = `student_dash_assignments_${profile.id}_${Date.now()}`;
      const channel = supabase.channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'assignments' },
          () => {
            fetchTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
      const data = await getAvailableAssignments(profile.id);
      setTasks(data.slice(0, 3));
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

  return (
    <div className={`w-full min-h-screen flex font-sans relative ${isBlind ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-800'}`}>
      <ConfettiEffect active={showConfetti} />
      <StudentSidebar />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-start">

        {/* CONTENT GRID - FULLY RESPONSIVE FOR ANDROID & ALL DEVICES */}
        <div className="px-4 pt-4 pb-8 sm:px-6 md:px-8 lg:px-10 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden" animate="visible"
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 md:gap-8"
          >
            {/* HERO BINTANG LOGO & WELCOME BANNER */}
            <motion.section
              variants={itemVariants}
              className={`lg:col-span-12 p-5 sm:p-8 md:p-10 rounded-3xl sm:rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 md:gap-8 ${
                isBlind ? 'bg-indigo-950 border border-white/10 text-white' : 'bg-white border border-slate-100 text-slate-800'
              }`}
            >
              <div className="absolute top-0 right-0 w-80 h-80 sm:w-96 sm:h-96 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-[120px] pointer-events-none" />

              {/* ANIMATED BINTANG STAR AVATAR */}
              <div className="flex items-center gap-4 sm:gap-6 md:gap-10 relative z-10 min-w-0 w-full sm:w-auto">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/student/tanya-ai')}
                  className="cursor-pointer shrink-0 scale-90 sm:scale-100"
                  title="Tanya Kak Bintang AI"
                >
                  <BintangAvatar state={avatarState} size="md" />
                </motion.div>

                <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 inline-block">
                    {greeting} 👋
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight truncate">
                    {getCleanFirstName(profile?.full_name)} <span className="text-indigo-600">.</span>
                  </h2>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">
                    Kelas: {profile?.class_level || 'SD'} • Kode: {profile?.class_code || 'DEMO01'}
                  </p>
                </div>
              </div>

              {/* XP BADGE & STATUS */}
              <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl border border-slate-100 shrink-0 relative z-10 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl sm:text-2xl shadow-md shadow-amber-200 shrink-0">
                    <HiAcademicCap />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Poin XP Kamu</p>
                    <p className="text-lg sm:text-xl font-black text-slate-900 leading-none mt-1">{profile?.xp || 0} XP</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* HERO SECTION - Progress & Level */}
            <motion.section
              variants={itemVariants}
              className={`lg:col-span-8 p-5 sm:p-8 md:p-12 rounded-3xl sm:rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl md:shadow-2xl relative overflow-hidden group ${
                isBlind ? 'bg-indigo-900 border border-white/10' : 'bg-white border border-slate-100 sm:border-slate-50'
              }`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-[100px] pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-[1.8rem] flex items-center justify-center text-3xl sm:text-4xl shadow-lg shrink-0 ${isBlind ? 'bg-white/10 text-white' : 'bg-indigo-600 text-white shadow-indigo-200'}`}>
                    <HiFire />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter">Level {currentLevel}</h3>
                    <p className={`text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-[0.3em] mt-0.5 sm:mt-1 ${isBlind ? 'text-indigo-300' : 'text-slate-400'}`}>Target: {currentLevel * 1000} XP</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className={`text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter ${isBlind ? 'text-indigo-400' : 'text-indigo-600'}`}>{Math.round(progressPercentage)}%</p>
                </div>
              </div>

              <div className="mt-6 sm:mt-10 relative">
                 <div className={`h-4 sm:h-6 md:h-8 rounded-full border-2 sm:border-[6px] overflow-hidden ${isBlind ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-white shadow-inner'}`}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 2, ease: "circOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${isBlind ? 'from-indigo-600 to-purple-500' : 'from-indigo-500 via-indigo-600 to-indigo-700'} relative`}
                    >
                       <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                    </motion.div>
                 </div>
                 <div className="flex justify-between mt-2 sm:mt-3">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-40">Mulai</span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-40">Level Up</span>
                 </div>
              </div>
            </motion.section>

            {/* QUICK ACTIONS */}
            <motion.section variants={itemVariants} className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
               <button
                onClick={() => navigate('/student/tasks')}
                className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 shadow-md hover:shadow-xl ${
                  isBlind ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 border border-slate-100 hover:border-amber-200'
                }`}
               >
                  <HiLightningBolt className="text-amber-400 text-2xl sm:text-3xl" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-center">Mulai Quiz</span>
               </button>
               <button
                onClick={() => navigate(profile?.disability_type === 'tunanetra' ? '/student/playground' : '/student/tanya-ai')}
                className={`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 shadow-md hover:shadow-xl ${
                  isBlind ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-100 hover:border-indigo-200'
                }`}
               >
                  <HiChatAlt2 className="text-indigo-400 text-2xl sm:text-3xl" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-center">Tanya AI</span>
               </button>
               <button
                onClick={() => navigate('/student/modules')}
                className={`col-span-2 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-between px-5 sm:px-8 transition-all active:scale-95 shadow-md hover:shadow-xl ${
                  isBlind ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-100'
                }`}
               >
                  <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                    <HiAcademicCap className="text-blue-500 text-2xl sm:text-3xl shrink-0" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider truncate">Perpustakaan Materi</span>
                  </div>
                  <HiChevronRight className="shrink-0" />
               </button>
            </motion.section>

            {/* LISTS SECTIONS */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8 md:space-y-10">
               {/* Upcoming Quiz */}
               <motion.div variants={itemVariants} className={`p-5 sm:p-8 md:p-10 rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] ${isBlind ? 'bg-white/5 border border-white/5' : 'bg-white shadow-sm border border-slate-100 sm:border-slate-50'}`}>
                  <div className="flex items-center justify-between mb-5 sm:mb-8">
                     <h4 className="text-base sm:text-xl font-black uppercase tracking-tight flex items-center gap-2 sm:gap-3">
                        <HiCollection className="text-amber-500" /> Quiz Terbaru
                     </h4>
                     <button onClick={() => navigate('/student/tasks')} className="text-[10px] sm:text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Semua</button>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                     {tasks?.map(task => (
                       <motion.div
                        whileHover={{ x: 6 }} key={task.id}
                        onClick={() => navigate(`/student/task/${task.id}`)}
                        className={`p-4 sm:p-6 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${
                          isBlind ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-transparent hover:border-indigo-100 hover:bg-white'
                        }`}
                       >
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0"><HiLightningBolt /></div>
                             <div className="min-w-0">
                                <p className="font-bold text-xs sm:text-base truncate">{task.title}</p>
                                <p className="text-[9px] sm:text-[10px] opacity-50 uppercase font-black truncate">Batas: {new Date(task.deadline).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <HiChevronRight className="opacity-30 shrink-0 ml-2" />
                       </motion.div>
                     ))}
                     {tasks?.length === 0 && <p className="text-center py-8 opacity-40 text-xs font-black uppercase tracking-widest">Kosong untuk saat ini</p>}
                  </div>
               </motion.div>

               {/* Learning Groups */}
               <motion.div variants={itemVariants} className={`p-5 sm:p-8 md:p-10 rounded-3xl sm:rounded-[2.5rem] md:rounded-[3rem] ${isBlind ? 'bg-white/5 border border-white/5' : 'bg-white shadow-sm border border-slate-100 sm:border-slate-50'}`}>
                  <div className="flex items-center justify-between mb-5 sm:mb-8">
                     <h4 className="text-base sm:text-xl font-black uppercase tracking-tight flex items-center gap-2 sm:gap-3">
                        <HiUsers className="text-emerald-500" /> Teman Belajar
                     </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                     {groups?.map(g => (
                       <div key={g.id} className={`p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border transition-all ${isBlind ? 'bg-indigo-900/40 border-white/10' : 'bg-slate-50 border-slate-100/50'}`}>
                          <p className="font-bold text-xs sm:text-sm mb-2 truncate">{g.name}</p>
                          <button onClick={() => navigate('/student/collaboration')} className="text-[9px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest">Masuk Diskusi</button>
                       </div>
                     ))}
                     {groups?.length === 0 && <button onClick={() => navigate('/student/collaboration')} className="col-span-full py-6 sm:py-8 border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Cari Grup Belajar</button>}
                  </div>
               </motion.div>
            </div>

            {/* SIDEBAR WIDGETS */}
            <div className="lg:col-span-4 space-y-6 sm:space-y-8 md:space-y-10">
               {/* Accessibility Assist for Tunanetra */}
               {isBlind && (
                 <motion.section variants={itemVariants} className="bg-indigo-600 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] text-white space-y-4 sm:space-y-6 shadow-2xl">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-inner"><HiSpeakerphone /></div>
                    <h4 className="text-xl sm:text-2xl font-black leading-none">Bantuan Suara</h4>
                    <p className="text-xs sm:text-sm font-bold opacity-80 leading-relaxed uppercase tracking-wider">Ketuk di mana saja untuk mendengar navigasi atau gunakan tombol di bawah untuk panduan lengkap.</p>
                    <button onClick={() => getAudioGuide()} className="w-full py-4 sm:py-5 bg-white text-indigo-600 rounded-xl sm:rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95">Dengarkan Panduan</button>
                 </motion.section>
               )}

               {/* Deaf Vision Assist for Tunarungu */}
               {profile?.disability_type === 'tunarungu' && (
                  <motion.section
                    variants={itemVariants} onClick={() => navigate('/student/live-captions')}
                    className="bg-gradient-to-br from-emerald-500 to-teal-700 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] text-white shadow-xl cursor-pointer active:scale-95 transition-all group"
                  >
                     <div className="flex justify-between items-start mb-6 sm:mb-10">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform"><HiEye /></div>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-[8px] font-black uppercase tracking-widest">Live Assist</span>
                     </div>
                     <h4 className="text-xl sm:text-2xl font-black leading-none mb-2 sm:mb-3 tracking-tighter uppercase">Mata Pintar AI</h4>
                     <p className="text-[10px] sm:text-xs font-bold opacity-80 leading-relaxed uppercase tracking-wider">Ubah suara di sekitarmu menjadi teks otomatis dengan akurasi 100%.</p>
                  </motion.section>
               )}

               {/* Leaderboard Compact */}
               <motion.section variants={itemVariants} className={`p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] ${isBlind ? 'bg-white/5 border border-white/5 shadow-2xl' : 'bg-slate-900 shadow-xl shadow-slate-200'} text-white`}>
                  <h4 className="text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-6 sm:mb-8 text-indigo-400 flex items-center gap-2 sm:gap-3"><HiAcademicCap className="text-amber-400 text-lg" /> Peringkat Kelas</h4>
                  <div className="space-y-3 sm:space-y-4">
                     {leaderboard?.map((s, i) => (
                       <div key={s.id} className={`flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl ${s.id === profile?.id ? 'bg-indigo-600/30 ring-1 ring-indigo-500' : ''}`}>
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${i === 0 ? 'bg-amber-400 text-amber-950' : i === 1 ? 'bg-slate-300 text-slate-800' : 'bg-slate-800 text-slate-500'}`}>{i + 1}</div>
                          <span className="flex-1 font-bold text-xs sm:text-sm truncate">{s.full_name}</span>
                          <span className="font-black text-xs text-indigo-400 shrink-0">{s.xp} <span className="text-[7px] opacity-40 uppercase">XP</span></span>
                       </div>
                     ))}
                  </div>
               </motion.section>
            </div>

          </motion.div>
        </div>

        {/* Unified Professional Edge-to-Edge Footer */}
        <Footer />
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

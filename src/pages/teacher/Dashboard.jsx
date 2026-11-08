import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAI } from '@/features/ai-tutor/hooks/useAI';
import TeacherSidebar from '@/components/layout/TeacherSidebar';
import {
  HiChartBar, HiUsers, HiBookOpen, HiBell,
  HiSparkles, HiChevronRight, HiCheckCircle, HiExclamation,
  HiTrash, HiExternalLink, HiPlus, HiArrowLeft,
  HiDocumentReport, HiClock
} from 'react-icons/hi';

const TeacherDashboard = () => {
  const { profile, fetchProfile } = useAuthStore();
  const { generateAndSaveReport } = useAI();
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalModul: 0,
    tugasPending: 0,
    avgScore: 0,
    activeToday: 0,
    inactive3Days: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [myModules, setMyModules] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [xpModal, setXpModal] = useState({ show: false, student: null, amount: 10 });
  const [toast, setToast] = useState(null);

  // Monitoring & Report State
  const [students, setStudents] = useState([]);
  const [filterDisability, setFilterDisability] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentInteractions, setStudentInteractions] = useState([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [studentDetail, setStudentDetail] = useState(null);
  const [reportStudentId, setReportStudentId] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [chatSearch, setChatSearch] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'summary';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
      fetchMyModules();
      fetchMyAssignments();
      fetchStudents();
    }
  }, [profile, activeTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // REALTIME SYNC - MONITORING TAB
  useEffect(() => {
    if (!profile?.class_code) return;

    const channel = supabase
      .channel('teacher_dashboard_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `class_code=eq.${profile.class_code}`
        },
        () => {
          fetchStudents();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions'
        },
        () => {
          fetchStats();
          fetchStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.class_code]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: classStudents, count: siswaCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'siswa')
        .eq('class_code', profile?.class_code);

      const today = new Date().toISOString().split('T')[0];
      const activeToday = classStudents?.filter(s => s.last_active === today).length || 0;

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const inactive3Days = classStudents?.filter(s => new Date(s.last_active) < threeDaysAgo).length || 0;

      const { count: modulCount } = await supabase.from('modules').select('*', { count: 'exact', head: true }).eq('teacher_id', profile?.id);

      const { data: subs, error: subsError } = await supabase
        .from('submissions')
        .select('*, profiles!inner(id, full_name, xp, class_code), assignments!inner(id, title, teacher_id)')
        .eq('assignments.teacher_id', profile.id)
        .eq('profiles.class_code', profile?.class_code)
        .order('submitted_at', { ascending: false });

      if (subsError) throw subsError;

      const totalScore = subs?.reduce((acc, curr) => acc + (curr.total_score || 0), 0) || 0;
      const avg = subs?.length > 0 ? (totalScore / subs.length).toFixed(1) : 0;

      setStats({
        totalSiswa: siswaCount || 0,
        totalModul: modulCount || 0,
        tugasPending: subs?.filter(s => s.status !== 'graded').length || 0,
        avgScore: avg,
        activeToday,
        inactive3Days
      });

      setRecentSubmissions(subs?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          submissions(id, total_score, submitted_at, assignment_id)
        `)
        .eq('role', 'siswa')
        .eq('class_code', profile?.class_code);

      if (error) throw error;

      const processedStudents = data.map(s => {
        const completed = s.submissions?.length || 0;
        const status = new Date(s.last_active) >= new Date(new Date().setDate(new Date().getDate() - 1)) ? 'aktif' : 'tidak aktif';
        return { ...s, completed, status };
      });

      setStudents(processedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchStudentDetail = async (student) => {
    setSelectedStudent(student);
    setSubLoading(true);
    try {
      // Fetch AI Interactions history
      const { data: interactions, error: intError } = await supabase
        .from('student_ai_chat_history')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });

      if (intError) throw intError;

      setStudentInteractions(interactions || []);

      // Also fetch some basic stats for the report
      const { data: submissions } = await supabase
        .from('submissions')
        .select('total_score, submitted_at')
        .eq('student_id', student.id);

      setStudentDetail({
        submissions: submissions || [],
        totalInteractions: interactions?.length || 0
      });

      setIsReportOpen(true);
    } catch (error) {
      console.error("Error fetching student details:", error);
      showToast("Gagal mengambil data monitoring", "error");
    } finally {
      setSubLoading(false);
    }
  };

  const fetchMyModules = async () => {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false });

    if (!error) setMyModules(data);
  };

  const fetchMyAssignments = async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*, assignment_questions(count)')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false });

    if (!error) setMyAssignments(data);
  };

  const fetchAssignmentDetails = async (assignment) => {
    if (!assignment?.id) return;
    setSelectedAssignment(assignment);
    setSubLoading(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, profiles(id, full_name, xp), submission_answers(id, is_correct, points_earned)')
        .eq('assignment_id', assignment.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setAssignmentSubmissions(data || []);
      setActiveTab('assignment_detail');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubLoading(false);
    }
  };

  const handleManualXP = async () => {
    if (!xpModal.student) return;
    try {
      const { error } = await supabase.rpc('add_bonus_xp', {
        target_student_id: xpModal.student.id,
        amount: parseInt(xpModal.amount)
      });

      if (error) throw error;

      const newXP = (xpModal.student.xp || 0) + parseInt(xpModal.amount);
      setAssignmentSubmissions(prev => prev.map(s =>
        s.profiles.id === xpModal.student.id
        ? { ...s, profiles: { ...s.profiles, xp: newXP } }
        : s
      ));

      showToast(`Berhasil menambah ${xpModal.amount} XP untuk ${xpModal.student.full_name}`);
      setXpModal({ show: false, student: null, amount: 10 });
    } catch (err) {
      showToast("Gagal menambah XP: " + err.message, 'error');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus modul ini?')) return;
    setDeleteLoading(moduleId);
    try {
      const { error: dbError } = await supabase.from('modules').delete().eq('id', moduleId);
      if (dbError) throw dbError;
      setMyModules(prev => prev.filter(m => m.id !== moduleId));
      showToast("Modul berhasil dihapus.");
    } catch (error) {
      showToast('Gagal menghapus: ' + error.message, 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Hapus QuizKu ini? Semua data jawaban siswa juga akan terhapus.')) return;
    setDeleteLoading(id);
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
      setMyAssignments(prev => prev.filter(a => a.id !== id));
      fetchStats();
      showToast("QuizKu berhasil dihapus.");
    } catch (error) {
      showToast('Gagal menghapus QuizKu: ' + error.message, 'error');
    } finally {
      setDeleteLoading(null);
    }
  };

  const generateReport = async (type, targetId) => {
    if (type === 'Siswa' && !reportStudentId) {
      showToast("Pilih siswa terlebih dahulu!", 'error');
      return;
    }

    setIsGeneratingReport(true);
    try {
      const target = type === 'Siswa' ? reportStudentId : targetId;
      const studentName = students.find(s => s.id === target)?.full_name || 'Seluruh Kelas';
      const result = await generateAndSaveReport(target, profile.id);

      if (result.success) {
        showToast(`Laporan untuk ${studentName} telah dibuat.`);
      } else {
        throw new Error(result.message || "Gagal membuat laporan");
      }
    } catch (error) {
      showToast(`Gagal: ${error.message}`, 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Layout Animation Config
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
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <TeacherSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Premium Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%', scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: -20, x: '-50%', scale: 0.9 }}
            className="fixed top-8 left-1/2 z-[1000] flex items-center gap-4 bg-white/90 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl border border-white min-w-[350px]"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg ${toast.type === 'success' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-rose-500 shadow-rose-100'}`}>
              {toast.type === 'success' ? <HiCheckCircle /> : <HiExclamation />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1.5">Sistem Pemberitahuan</span>
              <span className="text-sm font-bold text-slate-800">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Dynamic Abstract Background Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-50/50 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 lg:p-16">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] leading-none">Dashboard Pengajar</h4>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Halo, Pak/Bu {profile?.full_name?.split(' ')[0]} <span className="text-indigo-600">.</span>
              </h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Mata Pelajaran: {profile?.subject || 'Umum'} • Kode Kelas: {profile?.class_code}</p>
            </motion.div>

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="flex gap-4">
              <button
                onClick={() => navigate('/teacher/upload')}
                className="group px-8 py-4 bg-white text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 hover:shadow-md transition-all flex items-center gap-3"
              >
                <HiPlus className="text-lg text-indigo-600 group-hover:rotate-90 transition-transform" /> Modul Baru
              </button>
              <button
                onClick={() => navigate('/teacher/create-task')}
                className="px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                <HiSparkles className="text-lg animate-pulse" /> Buat QuizKu
              </button>
            </motion.div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-12"
              >
                {/* AI INSIGHT CARD */}
                <motion.section variants={itemVariants} className="bg-slate-900 p-10 md:p-14 rounded-[3.5rem] text-white relative overflow-hidden group shadow-2xl shadow-indigo-100/20">
                    <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                       <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner border border-white/5 group-hover:rotate-12 transition-transform duration-700">🤖</div>
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-full">AI Insight</span>
                            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.2em]">Real-time Analysis</span>
                          </div>
                          <p className="text-2xl md:text-3xl font-bold leading-[1.4] text-indigo-50">
                             {stats.inactive3Days > 0
                               ? `Perhatian! Ada ${stats.inactive3Days} siswa yang tidak aktif selama 3 hari. Segera lakukan monitoring untuk menjaga semangat belajar mereka.`
                               : `Kelas berjalan sangat baik. Rata-rata nilai kelas saat ini stabil di angka ${stats.avgScore}. Tetap pertahankan kualitas materi Anda.`
                             }
                          </p>
                       </div>
                    </div>
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500 opacity-20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
                </motion.section>

                {/* STATS GRID */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {[
                     { label: 'Siswa Aktif', value: stats.activeToday, icon: <HiUsers />, color: 'text-blue-500', bg: 'bg-blue-50' },
                     { label: 'Rata Nilai', value: stats.avgScore, icon: <HiChartBar />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                     { label: 'Tugas Pending', value: stats.tugasPending, icon: <HiBell />, color: 'text-amber-500', bg: 'bg-amber-50' },
                     { label: 'Butuh Atensi', value: stats.inactive3Days, icon: <HiExclamation />, color: 'text-rose-500', bg: 'bg-rose-50' },
                   ].map((s, i) => (
                     <div key={i} className="p-10 bg-white rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                        <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center text-2xl mb-8 shadow-sm`}>
                          {s.icon}
                        </div>
                        <p className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">{s.value}</p>
                        <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">{s.label}</p>
                     </div>
                   ))}
                </motion.div>

                {/* RECENT SUBMISSIONS TABLE */}
                <motion.section variants={itemVariants} className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
                   <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Pengumpulan Tugas Terbaru</h3>
                      <button onClick={() => setActiveTab('monitoring')} className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] hover:underline">Lihat Semua</button>
                   </div>
                   <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="bg-slate-50/50">
                               <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Siswa</th>
                               <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Judul QuizKu</th>
                               <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Skor</th>
                               <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Aksi</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {recentSubmissions.map(sub => (
                              <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors group">
                                 <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">{sub.profiles?.full_name?.charAt(0)}</div>
                                       <span className="font-bold text-slate-800">{sub.profiles?.full_name}</span>
                                    </div>
                                 </td>
                                 <td className="px-10 py-8 text-slate-500 font-bold text-sm">{sub.assignments?.title}</td>
                                 <td className="px-10 py-8 text-center">
                                    <div className={`inline-flex px-5 py-2 rounded-full font-black text-xs ${sub.total_score >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                      {sub.total_score || 0}
                                    </div>
                                 </td>
                                 <td className="px-10 py-8 text-right">
                                    <button onClick={() => fetchAssignmentDetails(sub.assignments)} className="p-3 rounded-xl bg-indigo-50 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"><HiChevronRight /></button>
                                 </td>
                              </tr>
                            ))}
                            {recentSubmissions.length === 0 && (
                              <tr>
                                <td colSpan="4" className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-[0.4em] text-[10px]">Belum ada pengumpulan data</td>
                              </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </motion.section>
              </motion.div>
            )}

            {activeTab === 'monitoring' && (
              <motion.div key="monitoring" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="space-y-12">
                {/* STUDENT ROSTER */}
                <motion.section variants={itemVariants} className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Roster Aktivitas Siswa</h3>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                       <span className="pl-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
                       <select
                        value={filterDisability}
                        onChange={(e) => setFilterDisability(e.target.value)}
                        className="p-3 bg-slate-50 border-none rounded-xl font-black text-[10px] uppercase tracking-widest outline-none text-indigo-600"
                      >
                        <option value="all">Semua Disabilitas</option>
                        <option value="tunanetra">Tunanetra</option>
                        <option value="tunarungu">Tunarungu</option>
                        <option value="tunawicara">Tunawicara</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Nama Siswa</th>
                          <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Tipe</th>
                          <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">XP Total</th>
                          <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {students.filter(s => filterDisability === 'all' || s.disability_type === filterDisability).map(student => (
                          <tr key={student.id} onClick={() => fetchStudentDetail(student)} className="hover:bg-indigo-50/30 cursor-pointer transition-all duration-300 group">
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">{student.full_name?.charAt(0)}</div>
                                  <span className="font-black text-slate-800 text-base">{student.full_name}</span>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-center">
                               <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-widest">{student.disability_type || 'Umum'}</span>
                            </td>
                            <td className="px-10 py-8 text-center">
                               <div className="flex items-center justify-center gap-2">
                                  <span className="text-xl font-black text-indigo-600">{student.xp}</span>
                                  <HiSparkles className="text-amber-400" />
                               </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${student.status === 'aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'aktif' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.section>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div key="reports" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="flex flex-col items-center justify-center py-20">
                <motion.div variants={itemVariants} className="bg-white p-14 rounded-[4rem] border border-slate-100 shadow-2xl max-w-2xl w-full relative overflow-hidden">
                    <div className="relative z-10 text-center space-y-8">
                      <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto shadow-sm">
                         <HiDocumentReport />
                      </div>
                      <div>
                         <h4 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Laporan Intelegensi Siswa</h4>
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] leading-relaxed">Sistem akan melakukan kompilasi data aktivitas dan analisis AI untuk dikirimkan secara otomatis kepada Orang Tua.</p>
                      </div>

                      <div className="space-y-4">
                         <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-4">Pilih Siswa Target</label>
                            <select
                              value={reportStudentId}
                              onChange={(e) => setReportStudentId(e.target.value)}
                              className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-purple-600/10 focus:bg-white rounded-[2rem] font-black text-sm outline-none transition-all shadow-inner"
                            >
                              <option value="">-- Pilih Nama Siswa --</option>
                              {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                            </select>
                         </div>

                         <button
                          onClick={() => generateReport('Siswa', reportStudentId)}
                          disabled={isGeneratingReport || !reportStudentId}
                          className="w-full py-6 bg-purple-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-purple-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                          {isGeneratingReport ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sedang Memproses...</>
                          ) : 'GENERATE & KIRIM SEKARANG'}
                        </button>
                      </div>
                    </div>
                    {/* Background Accents */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'assignments' && (
              <motion.div key="assignments" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="grid grid-cols-1 gap-6">
                 {myAssignments.map((a, idx) => (
                   <motion.div
                    key={a.id}
                    variants={itemVariants}
                    className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-10 hover:shadow-xl hover:border-indigo-100 transition-all duration-500 group"
                   >
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-inner border border-indigo-100/50 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                           <HiBookOpen />
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-lg">ID: {a.short_id || 'Global'}</span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dibuat: {new Date(a.created_at).toLocaleDateString('id-ID')}</span>
                           </div>
                           <h4 className="text-2xl font-black text-slate-800 tracking-tight">{a.title}</h4>
                           <div className="flex items-center gap-3 mt-3">
                              <HiClock className="text-amber-500" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tenggat: {new Date(a.deadline).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <button
                          onClick={() => fetchAssignmentDetails(a)}
                          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-100 transition-all flex items-center gap-3"
                         >
                           Hasil Kelas <HiChevronRight />
                         </button>
                         <button
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                         >
                           <HiTrash className="text-xl" />
                         </button>
                      </div>
                   </motion.div>
                 ))}
                 {myAssignments.length === 0 && (
                   <div className="py-20 text-center">
                      <p className="text-slate-300 font-black uppercase tracking-[0.5em] text-[10px]">Anda Belum Membuat QuizKu</p>
                   </div>
                 )}
              </motion.div>
            )}

            {activeTab === 'assignment_detail' && selectedAssignment && (
              <motion.div key="assign_detail" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                   <div className="flex items-center gap-6">
                      <button onClick={() => setActiveTab('assignments')} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm group">
                         <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                      </button>
                      <div>
                         <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{selectedAssignment.title}</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Manajemen Pengumpulan & Penilaian</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 bg-indigo-50 px-6 py-4 rounded-3xl border border-indigo-100">
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pengumpulan</p>
                         <p className="text-xl font-black text-indigo-600 leading-none mt-1">{assignmentSubmissions.length} Siswa</p>
                      </div>
                   </div>
                </header>

                <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-slate-50/50">
                            <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Nama Siswa</th>
                            <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Skor Akhir</th>
                            <th className="px-10 py-6 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Apresiasi</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {assignmentSubmissions.map(sub => (
                             <tr key={sub.id} className="hover:bg-slate-50/30 transition-all duration-300">
                                <td className="px-10 py-8 font-black text-slate-800 text-base">{sub.profiles?.full_name}</td>
                                <td className="px-10 py-8 text-center">
                                   <div className={`inline-flex px-6 py-2 rounded-full font-black text-xl tracking-tighter ${sub.total_score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                      {sub.total_score}
                                   </div>
                                </td>
                                <td className="px-10 py-8 text-right">
                                      <button
                                        onClick={() => setXpModal({ show: true, student: sub.profiles, amount: 10 })}
                                        className="px-6 py-3 bg-amber-50 text-amber-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2 ml-auto"
                                      >
                                        <HiSparkles /> Bonus XP
                                      </button>
                                </td>
                             </tr>
                         ))}
                         {assignmentSubmissions.length === 0 && (
                            <tr>
                               <td colSpan="3" className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-[0.4em] text-[10px]">Belum ada siswa yang mengumpulkan</td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'modules' && (
              <motion.div key="modules" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {myModules.map((m, idx) => (
                   <motion.div
                    key={m.id}
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                    className="p-10 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative group"
                   >
                      <div className="flex justify-between items-start mb-10">
                         <div className="w-16 h-16 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <HiBookOpen />
                         </div>
                         <button onClick={() => handleDeleteModule(m.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                            <HiTrash size={22} />
                         </button>
                      </div>
                      <h4 className="text-xl font-black text-slate-800 leading-tight mb-4 group-hover:text-indigo-600 transition-colors">{m.title}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Kapasitas: Full Access</p>

                      <a
                        href={m.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-5 bg-slate-50 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        Pratinjau Modul <HiExternalLink />
                      </a>
                   </motion.div>
                 ))}
                 {myModules.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                       <p className="text-slate-300 font-black uppercase tracking-[0.5em] text-[10px]">Anda Belum Mengunggah Modul</p>
                    </div>
                 )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Professional XP Modal */}
        <AnimatePresence>
          {xpModal.show && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
               <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setXpModal({ show: false, student: null, amount: 10 })}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
               />
               <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white p-12 rounded-[4rem] shadow-2xl max-w-sm w-full space-y-10 border border-white"
               >
                  <div className="text-center space-y-4">
                     <div className="w-20 h-20 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-5xl mx-auto shadow-sm">✨</div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Bonus Apresiasi</h3>
                     <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Berikan XP Tambahan Untuk <br /><span className="text-indigo-600">{xpModal.student?.full_name}</span></p>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      value={xpModal.amount}
                      onChange={e => setXpModal({...xpModal, amount: e.target.value})}
                      className="w-full p-8 bg-slate-50 border-2 border-transparent focus:border-indigo-100 rounded-[2rem] font-black text-4xl text-center text-indigo-600 outline-none shadow-inner"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase tracking-widest">XP</span>
                  </div>

                  <button
                    onClick={handleManualXP}
                    className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    KIRIM APRESIASI
                  </button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Professional AI Chat Monitoring Report Modal */}
        <AnimatePresence>
          {isReportOpen && selectedStudent && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
               <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsReportOpen(false)}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
               />
               <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 40 }}
                className="relative bg-[#F8FAFC] w-full max-w-5xl h-[90vh] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
               >
                  {/* Modal Header */}
                  <div className="p-8 md:p-12 bg-white border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-200">
                           {selectedStudent.full_name?.charAt(0)}
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                             <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">Laporan Aktivitas</span>
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedStudent.status === 'aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {selectedStudent.status}
                             </span>
                           </div>
                           <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedStudent.full_name}</h3>
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Disabilitas: {selectedStudent.disability_type || 'Umum'} • Level: {selectedStudent.class_level || '-'}</p>
                        </div>
                     </div>
                     <button
                        onClick={() => setIsReportOpen(false)}
                        className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-slate-900 transition-all"
                     >
                        <HiPlus className="rotate-45 text-2xl" />
                     </button>
                  </div>

                  {/* Modal Content - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar space-y-12">
                     {/* Stats Quick View */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-50 shadow-sm">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total XP</p>
                           <p className="text-3xl font-black text-indigo-600">{selectedStudent.xp} ✨</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-50 shadow-sm">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Interaksi AI</p>
                           <p className="text-3xl font-black text-purple-600">{studentInteractions.length} 💬</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl border border-slate-50 shadow-sm">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rata-rata QuizKu</p>
                           <p className="text-3xl font-black text-emerald-600">
                              {studentDetail?.submissions?.length > 0
                                ? (studentDetail.submissions.reduce((a, b) => a + (b.total_score || 0), 0) / studentDetail.submissions.length).toFixed(1)
                                : '0'
                              }
                           </p>
                        </div>
                     </div>

                     {/* Chat History Section */}
                     <div className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-20 py-4 border-b border-slate-200/50 -mx-4 px-4">
                           <div className="flex items-center gap-3">
                              <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Riwayat Chat Lengkap</h4>
                           </div>
                           <div className="flex-1 max-w-xl relative">
                              <HiSparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 z-10" />
                              <input
                                 type="text"
                                 placeholder="Cari ribuan riwayat chat berdasarkan topik atau isi pertanyaan..."
                                 value={chatSearch}
                                 onChange={(e) => setChatSearch(e.target.value)}
                                 className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-300 outline-none transition-all shadow-sm"
                              />
                              {chatSearch && (
                                 <button
                                    onClick={() => setChatSearch('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-800"
                                 >
                                    Bersihkan
                                 </button>
                              )}
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                 {studentInteractions.length} Total
                              </span>
                           </div>
                        </div>

                        {studentInteractions.length > 0 ? (
                           <motion.div
                              className="space-y-8 pb-20"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                           >
                              {studentInteractions
                                 .filter(chat =>
                                    chat.question?.toLowerCase().includes(chatSearch.toLowerCase()) ||
                                    chat.answer?.toLowerCase().includes(chatSearch.toLowerCase()) ||
                                    chat.topic?.toLowerCase().includes(chatSearch.toLowerCase())
                                 )
                                 .map((chat, idx, filteredArray) => (
                                 <motion.div
                                    key={chat.id}
                                    variants={itemVariants}
                                    className="group"
                                 >
                                    <div className="flex items-center gap-4 mb-4 px-4">
                                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Percakapan #{filteredArray.length - idx}</span>
                                       <div className="h-px flex-1 bg-slate-100" />
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                          <HiClock className="text-indigo-400" /> {new Date(chat.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                       </span>
                                    </div>

                                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group-hover:shadow-xl group-hover:border-indigo-100 transition-all duration-500 hover:scale-[1.01]">
                                       {/* Student Question */}
                                       <div className="p-8 bg-slate-50/30 border-b border-slate-50">
                                          <div className="flex gap-5">
                                             <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shrink-0 shadow-sm">Q</div>
                                             <div className="space-y-3">
                                                <p className="text-slate-800 font-bold leading-relaxed italic text-lg">"{chat.question}"</p>
                                                {chat.topic && chat.topic !== 'Umum' && (
                                                   <div className="flex flex-wrap gap-2">
                                                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-indigo-100/50">
                                                         📌 Topik: {chat.topic}
                                                      </span>
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                       </div>

                                       {/* AI Answer */}
                                       <div className="p-8 bg-white">
                                          <div className="flex gap-5">
                                             <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xl shadow-indigo-100">B</div>
                                             <div className="space-y-4 flex-1">
                                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-50">
                                                   <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{chat.answer || '(Tanpa jawaban)'}</p>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </motion.div>
                              ))}

                              {studentInteractions.filter(chat =>
                                 chat.question?.toLowerCase().includes(chatSearch.toLowerCase()) ||
                                 chat.answer?.toLowerCase().includes(chatSearch.toLowerCase()) ||
                                 chat.topic?.toLowerCase().includes(chatSearch.toLowerCase())
                              ).length === 0 && (
                                 <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-100">
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Pencarian tidak ditemukan</p>
                                 </div>
                              )}
                           </motion.div>
                        ) : (
                           <div className="py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center text-4xl mb-6">💬</div>
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Belum Ada Riwayat Percakapan</p>
                           </div>
                        )}
                     </div>

                  </div>

                  {/* Modal Footer */}
                  <div className="p-8 md:p-10 bg-white border-t border-slate-100 flex justify-end shrink-0">
                     <button
                        onClick={() => setIsReportOpen(false)}
                        className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                     >
                        Tutup Laporan
                     </button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        <footer className="shrink-0 py-12 border-t border-slate-100 text-center bg-white/50 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 opacity-60">
            Sistem Manajemen Ekosistem BintangAi • © 2026 Inovasi Tanpa Batas
          </p>
        </footer>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(79, 70, 229, 0.1); border-radius: 20px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;

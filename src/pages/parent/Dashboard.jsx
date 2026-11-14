import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAI, cleanReportText } from '@/features/ai-tutor/hooks/useAI';
import XPBar from '@/features/gamification/components/XPBar';
import StreakBadge from '@/features/gamification/components/StreakBadge';
import ParentSidebar from '@/components/layout/ParentSidebar';
import Footer from '@/components/layout/Footer';
import { getCleanFirstName } from '@/utils';
import { HiSparkles } from 'react-icons/hi';

const ParentDashboard = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [childData, setChildData] = useState(null);
  const [childSubmissions, setChildSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsList, setReportsList] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const lastSpokenRef = useRef("");

  const activeTab = searchParams.get('tab') || 'overview';

  // 1. Data Loading
  useEffect(() => {
    if (profile?.id) {
      fetchChildData();
      fetchReports();
    }
  }, [profile]);

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const fetchChildSubmissions = async (targetStudentId) => {
    const studentIdToFetch = targetStudentId || profile?.linked_student_id;
    if (!studentIdToFetch) return;

    try {
      const { data: subs, error } = await supabase
        .from('submissions')
        .select('*, assignments(id, title, subject)')
        .eq('student_id', studentIdToFetch)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setChildSubmissions(subs || []);
    } catch (err) {
      console.error("Error fetching child submissions:", err);
    }
  };

  const fetchReports = async (targetStudentId) => {
    const studentIdToFetch = targetStudentId || profile?.linked_student_id;
    if (!studentIdToFetch) return;

    setReportLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_reports')
        .select('*, profiles!teacher_id(full_name)')
        .eq('student_id', studentIdToFetch)
        .order('created_at', { ascending: false });

      if (!error) setReportsList(data || []);
    } catch (err) {
      console.error("Error fetching child reports:", err);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchChildData = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      let linkedStudentId = profile?.linked_student_id;

      // Auto-resolve student if profile does not have linked_student_id set yet
      if (!linkedStudentId && profile?.role === 'ortu') {
        const { data: matchedStudent } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'siswa')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (matchedStudent) {
          linkedStudentId = matchedStudent.id;
          await supabase
            .from('profiles')
            .update({ linked_student_id: linkedStudentId })
            .eq('id', profile.id);
        }
      }

      if (linkedStudentId) {
        const { data: student } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', linkedStudentId)
          .maybeSingle();

        if (student) setChildData(student);
        await fetchChildSubmissions(linkedStudentId);
        await fetchReports(linkedStudentId);
      }
    } catch (err) {
      console.error("Error in fetchChildData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchChildData();

      const activeStudentId = profile?.linked_student_id;
      if (activeStudentId) {
        const profileChannel = supabase
          .channel(`child-profile-${activeStudentId}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${activeStudentId}` },
          (payload) => setChildData(payload.new))
          .subscribe();

        const submissionChannel = supabase
          .channel(`child-submissions-${activeStudentId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions', filter: `student_id=eq.${activeStudentId}` },
          () => fetchChildSubmissions(activeStudentId))
          .subscribe();

        return () => {
          supabase.removeChannel(profileChannel);
          supabase.removeChannel(submissionChannel);
        };
      }
    }
  }, [profile?.id, profile?.linked_student_id]);

  const handleDownloadPdf = () => window.print();
  const onTabChange = (tabId) => setSearchParams({ tab: tabId });

  const renderReportFormatted = (rawText) => {
    if (!rawText) return null;
    const cleanText = cleanReportText(rawText);
    const blocks = cleanText.split(/\n\s*\n/);

    return (
      <div className="space-y-4 text-slate-800 font-sans">
        {blocks.map((block, idx) => {
          const lines = block.split('\n').filter(l => l.trim().length > 0);
          if (lines.length === 0) return null;

          const firstLine = lines[0].trim();
          const isHeader = /^#+|^[\*\#\s]*[A-Z0-9\s—–\-:]{3,}[\*\#\s]*$/i.test(firstLine) || firstLine.startsWith('**');

          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
              {lines.map((line, lIdx) => {
                const cleanLine = line
                  .replaceAll('*', '')
                  .replaceAll('#', '')
                  .replace(/^[•\-\s]+/, '')
                  .trim();
                if (!cleanLine) return null;

                if (lIdx === 0 && (isHeader || line.startsWith('###') || line.startsWith('**'))) {
                  return (
                    <div key={lIdx} className="flex items-center gap-2 pb-2 border-b border-indigo-100/80 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0"></span>
                      <h4 className="font-extrabold text-base text-indigo-950 tracking-tight">
                        {cleanLine}
                      </h4>
                    </div>
                  );
                }

                if (line.trim().startsWith('*') || line.trim().startsWith('•') || line.trim().startsWith('-')) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      <span className="text-emerald-600 font-bold text-sm shrink-0 mt-0.5">✓</span>
                      <p className="text-xs md:text-sm font-medium text-slate-700 leading-relaxed">
                        {cleanLine}
                      </p>
                    </div>
                  );
                }

                return (
                  <p key={lIdx} className="text-xs md:text-sm font-medium text-slate-700 leading-relaxed">
                    {cleanLine}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  if (!profile?.linked_student_id) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-xl text-center border border-slate-200">
           <div className="text-5xl mb-6">🔗</div>
           <h2 className="text-2xl font-bold text-slate-900">Akun Anak Belum Terhubung</h2>
           <p className="text-slate-600 mt-4 mb-8 text-base">Hubungkan profil anak Anda di halaman pengaturan untuk melihat laporan belajar.</p>
           <button onClick={() => navigate('/profile')} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Atur Sekarang</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex font-sans selection:bg-indigo-100">
      <ParentSidebar activeTab={activeTab} onTabChange={onTabChange} />

      <main className="flex-1 overflow-y-auto h-screen flex flex-col justify-between print:p-0">
        <div className="p-6 md:p-10 lg:p-14 space-y-10 print:hidden">
          <header className="mb-12">
             <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Halo, Pak/Bu {getCleanFirstName(profile?.full_name)}!</h2>
             <p className="text-slate-600 font-medium text-lg mt-2">Memantau progres belajar <span className="text-indigo-600 font-bold">{childData?.full_name}</span></p>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                       <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Pencapaian XP</h3>
                       <XPBar current={childData?.xp || 0} nextLevel={1000} level={Math.floor((childData?.xp || 0) / 1000) + 1} />
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                       <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Konsistensi Belajar</h3>
                       <StreakBadge days={childData?.streak || 0} />
                    </div>
                 </div>

                 <section className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                       <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                         <HiSparkles className="text-3xl text-white" />
                       </div>
                       <div>
                          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2">Analisis Sistem BintangAi</h4>
                          <p className="text-xl font-medium leading-relaxed italic text-indigo-50">
                             "{childData?.full_name} saat ini memiliki {childData?.xp || 0} XP. Terus pantau aktivitasnya untuk hasil yang maksimal!"
                          </p>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900">Nilai Quiz Terbaru</h3>
                      <button onClick={() => onTabChange('history')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 underline">Lihat Semua</button>
                    </div>
                    {childSubmissions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {childSubmissions.slice(0, 3).map((sub) => {
                          const scoreVal = sub.total_score ?? sub.score ?? 0;
                          const title = sub.assignments?.title || 'QuizKu Pilihan';
                          return (
                            <div key={sub.id} className="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
                               <h4 className="font-bold text-slate-800 text-lg leading-snug h-14 line-clamp-2">{title}</h4>
                               <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                                  <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Skor Akhir</p>
                                    <p className="text-4xl font-black text-slate-900">{scoreVal}</p>
                                  </div>
                                  <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${scoreVal >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {scoreVal >= 70 ? 'Berhasil ✅' : 'Tinjauan'}
                                  </span>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-10 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                        Belum Ada Hasil QuizKu Dari Anak
                      </div>
                    )}
                 </section>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div key="reports" variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Arsip Laporan Belajar</h3>
                {reportsList.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {reportsList.map((report) => (
                      <div key={report.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-indigo-400 transition-all">
                        <div className="flex items-center gap-6 w-full">
                          <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all">📄</div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">Laporan {report.report_type}</p>
                            <p className="text-sm text-slate-500 font-semibold mt-1">
                              📅 {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelectedReport(report); setShowPdfPreview(true); }}
                          className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 transition-all"
                        >
                          Buka Laporan
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-500 font-medium">Belum ada laporan dari guru.</div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
             <motion.div key="history" variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xl font-bold text-slate-900">Riwayat Quiz Lengkap</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-white border-b border-slate-100">
                           <th className="px-8 py-5 font-bold text-sm text-slate-500 uppercase tracking-widest">Judul Materi</th>
                           <th className="px-8 py-5 font-bold text-sm text-slate-500 uppercase tracking-widest text-center">Skor</th>
                           <th className="px-8 py-5 font-bold text-sm text-slate-500 uppercase tracking-widest text-right">Tanggal</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {childSubmissions.length > 0 ? (
                          childSubmissions.map(sub => {
                            const scoreVal = sub.total_score ?? sub.score ?? 0;
                            const title = sub.assignments?.title || 'QuizKu Pilihan';
                            return (
                              <tr key={sub.id} className="hover:bg-indigo-50/30 transition-colors">
                                 <td className="px-8 py-6 font-bold text-slate-800 text-base">{title}</td>
                                 <td className="px-8 py-6 text-center font-black text-2xl text-slate-900">{scoreVal}</td>
                                 <td className="px-8 py-6 text-right text-sm font-bold text-slate-500">
                                   {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                 </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                              Belum Ada Riwayat QuizKu
                            </td>
                          </tr>
                        )}
                     </tbody>
                  </table>
                </div>
             </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Formal Raport Modal View for Parents */}
        <AnimatePresence>
          {showPdfPreview && selectedReport && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPdfPreview(false)}
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col border border-slate-100"
              >
                {/* Modal Header Kop Raport */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md">
                      B
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-300 text-[9px] font-black uppercase tracking-widest rounded-full border border-indigo-400/20">
                          Dokumen Resmi
                        </span>
                        <span className="text-xs text-slate-300 font-bold">BintangAi Raport System</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mt-0.5">
                        RAPOR KEMAJUAN BELAJAR SISWA
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPdfPreview(false)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body - Scrollable Formal Raport Document */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-[#F8FAFC]">

                  {/* Kop Identitas Siswa */}
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Identitas Siswa</p>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                          {childData?.full_name || 'Bintang (Siswa SD)'}
                        </h4>
                        <p className="text-xs font-bold text-slate-500 mt-1">
                          {childData?.class_level || 'Kelas 4 SD'} • Kode Kelas: <span className="text-slate-800">{childData?.class_code || 'SD-4A'}</span>
                        </p>
                      </div>
                      <div className="sm:text-right bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100/80 shrink-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apresiasi & Keaktifan</p>
                        <p className="text-xl font-black text-indigo-600 mt-0.5">{childData?.xp || 0} XP ✨</p>
                        <p className="text-[10px] font-bold text-emerald-600">🔥 {childData?.streak || 0} Hari Belajar Rutin</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Jenis Rapor</p>
                        <p className="font-bold text-slate-800 mt-0.5">Laporan {selectedReport.report_type}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Wali Kelas / Guru</p>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedReport.profiles?.full_name || 'Guru BintangAi'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Periode Cetak</p>
                        <p className="font-bold text-slate-800 mt-0.5">{new Date(selectedReport.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Metode Bimbingan</p>
                        <p className="font-bold text-slate-800 mt-0.5">Inklusif BintangAi</p>
                      </div>
                    </div>
                  </div>

                  {/* Rekapitulasi Nilai Tugas & QuizKu */}
                  {childSubmissions.length > 0 && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                          <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
                            Rekapitulasi Nilai Tugas & QuizKu
                          </h4>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {childSubmissions.length} Tugas
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/60">
                              <th className="p-3 font-bold text-slate-500 uppercase">Mata Pelajaran / Judul Tugas</th>
                              <th className="p-3 font-bold text-slate-500 uppercase text-center">Tanggal Selesai</th>
                              <th className="p-3 font-bold text-slate-500 uppercase text-center">Nilai</th>
                              <th className="p-3 font-bold text-slate-500 uppercase text-right">Predikat</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {childSubmissions.slice(0, 5).map(sub => {
                              const score = sub.total_score || 0;
                              const grade = score >= 85 ? 'Sangat Baik (A)' : score >= 75 ? 'Baik (B)' : 'Cukup (C)';
                              const gradeColor = score >= 85 ? 'text-emerald-600 bg-emerald-50' : score >= 75 ? 'text-indigo-600 bg-indigo-50' : 'text-amber-600 bg-amber-50';

                              return (
                                <tr key={sub.id} className="hover:bg-slate-50/50">
                                  <td className="p-3 font-bold text-slate-800">{sub.assignments?.title || 'QuizKu Pilihan'}</td>
                                  <td className="p-3 text-center text-slate-500">{new Date(sub.submitted_at).toLocaleDateString('id-ID')}</td>
                                  <td className="p-3 text-center font-extrabold text-slate-900 text-sm">{score}</td>
                                  <td className="p-3 text-right">
                                    <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] ${gradeColor}`}>
                                      {grade}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Evaluasi & Analisis Kualitatif AI */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Evaluasi Kualitatif & Rekomendasi Pendampingan
                      </h4>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        AI Verified Analysis
                      </span>
                    </div>
                    {renderReportFormatted(selectedReport.content)}
                  </div>

                  {/* Lembar Tanda Tangan & Pengesahan */}
                  <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs pt-8 mt-8">
                    <div className="grid grid-cols-2 gap-8 text-center text-xs">
                      <div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-12">Orang Tua / Wali Siswa</p>
                        <p className="font-black text-slate-900 border-t border-slate-200 pt-2 max-w-[200px] mx-auto">
                          ({profile?.full_name || 'Orang Tua / Wali'})
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-12">Wali Kelas / Pengajar</p>
                        <p className="font-black text-slate-900 border-t border-slate-200 pt-2 max-w-[200px] mx-auto">
                          ({selectedReport.profiles?.full_name || 'Guru BintangAi'})
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="p-6 md:p-8 border-t border-slate-100 flex justify-end gap-4 bg-white shrink-0">
                  <button
                    onClick={handleDownloadPdf}
                    className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    🖨️ Cetak Raport Resmi
                  </button>
                  <button
                    onClick={() => setShowPdfPreview(false)}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
                  >
                    Selesai Membaca
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="hidden print:block p-10 bg-white min-h-screen">
          {selectedReport && (
            <div className="max-w-4xl mx-auto space-y-8">
              <header className="border-b-4 border-indigo-600 pb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">RAPOR KEMAJUAN BELAJAR SISWA</h1>
                  <p className="text-lg font-bold text-indigo-600">Sistem Pendidikan Inklusif BintangAi</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Tanggal Laporan</p>
                  <p className="text-base font-bold">{new Date(selectedReport.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </header>

              <section className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nama Siswa</h4>
                  <p className="text-lg font-bold text-slate-900">{childData?.full_name || 'Bintang'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tingkat / Kode Kelas</h4>
                  <p className="text-lg font-bold text-slate-900">{childData?.class_level || 'Kelas 4 SD'} • {childData?.class_code || 'SD-4A'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Wali Kelas / Pengajar</h4>
                  <p className="text-lg font-bold text-slate-900">{selectedReport.profiles?.full_name || 'Guru BintangAi'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">XP & Aktivitas Belajar</h4>
                  <p className="text-lg font-bold text-indigo-600">{childData?.xp || 0} XP</p>
                </div>
              </section>

              <div className="p-6 bg-white border border-slate-200 rounded-2xl">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Evaluasi Kualitatif AI</h3>
                {renderReportFormatted(selectedReport.content)}
              </div>

              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-12">Orang Tua / Wali Siswa</p>
                  <p className="font-black text-slate-900 border-t border-slate-200 pt-2 max-w-[200px] mx-auto">
                    ({profile?.full_name || 'Orang Tua / Wali'})
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-12">Wali Kelas / Pengajar</p>
                  <p className="font-black text-slate-900 border-t border-slate-200 pt-2 max-w-[200px] mx-auto">
                    ({selectedReport.profiles?.full_name || 'Guru BintangAi'})
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default ParentDashboard;

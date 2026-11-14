import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { StudentSidebar } from '@/components/layout';
import { useTasks } from '@/features/quiz/hooks/useTasks';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import {
  HiChevronLeft, HiChevronRight, HiCollection, HiLightningBolt,
  HiAcademicCap, HiCheckCircle, HiLockClosed, HiClock, HiEye
} from 'react-icons/hi';

const StudentTasks = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { showSubtitle } = useSubtitle();
  const { isMute, isBlind } = useAccessibility();

  const [tabFilter, setTabFilter] = useState('active'); // 'active' | 'completed'
  const { tasks, completedTasks, loading } = useTasks(profile?.id);

  const displayList = tabFilter === 'active' ? tasks : completedTasks;

  // SMART PAGINATION FOR ACCESSIBILITY (TUNAWICARA)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMute ? 5 : 12;

  const totalPages = Math.ceil((displayList?.length || 0) / itemsPerPage);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayList.slice(start, start + itemsPerPage);
  }, [displayList, currentPage, itemsPerPage]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      if (isMute) showSubtitle(`Halaman ${currentPage + 1} dari ${totalPages}`, 'info');
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      if (isMute) showSubtitle(`Kembali ke Halaman ${currentPage - 1}`, 'info');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [tabFilter]);

  // Auto-announce for Tunawicara
  useEffect(() => {
    if (isMute && tasks.length > 0) {
      showSubtitle(`Ditemukan ${tasks.length} Quiz Aktif. Menampilkan 5 teratas. Gunakan 1-5 jari untuk memilih.`, 'success');
    }
  }, [isMute, tasks.length]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <StudentSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        <header className="p-6 md:p-10 shrink-0 border-b border-slate-100 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <HiLightningBolt className="text-amber-500" /> QuizKu <span className="text-indigo-600">Siswa</span>
              </h1>
              <p className="text-slate-400 font-bold mt-1 text-xs">
                {tabFilter === 'active' ? `${tasks.length} QuizKu Aktif Tersedia` : `${completedTasks.length} QuizKu Telah Selesai`} • Halaman {currentPage} dari {totalPages || 1}
              </p>
            </div>

            {/* Filter Tabs & Pagination */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setTabFilter('active')}
                  data-tab-active="true"
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    tabFilter === 'active'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HiLightningBolt /> Aktif ({tasks.length})
                </button>
                <button
                  onClick={() => setTabFilter('completed')}
                  data-tab-completed="true"
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                    tabFilter === 'completed'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HiCheckCircle /> Riwayat & Kunci ({completedTasks.length})
                </button>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <HiChevronLeft />
                  </button>
                  <span className="text-xs font-bold text-slate-700 px-2">{currentPage} / {totalPages}</span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm"
                  >
                    <HiChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-20 custom-scrollbar">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-52 bg-white rounded-3xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : tabFilter === 'active' ? (
            /* TAB 1: ACTIVE QUIZZES */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentItems.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/student/task/${task.id}`)}
                  className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner shrink-0">
                        <HiCollection />
                      </div>
                      <span className="px-3 py-1 bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {task.subject || 'Materi SD'}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {task.title}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Modul: {task.modules?.title || 'Umum'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100 text-[10px] font-bold uppercase">
                      <HiAcademicCap className="text-amber-500" />
                      <span>{task.duration_minutes || 30} Mins</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-indigo-600 group-hover:scale-105 transition-all shadow-md">
                      <HiChevronRight size={20} />
                    </div>
                  </div>
                </motion.div>
              ))}

              {tasks.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-3xl border border-slate-100 p-8 max-w-xl mx-auto my-6 shadow-sm">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
                    <HiCheckCircle />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Semua QuizKu Aktif Selesai!</h3>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-md mx-auto">
                    Hebat! Kamu telah menyelesaikan seluruh QuizKu aktif hari ini. Buka tab <strong>Riwayat & Kunci Jawaban</strong> di atas untuk melihat nilai, pembahasan Kak Bintang, dan skor akhir.
                  </p>
                  <button
                    onClick={() => setTabFilter('completed')}
                    className="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                  >
                    🏆 Lihat Riwayat & Kunci Jawaban
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: COMPLETED QUIZZES & ANSWER KEYS */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentItems.map((sub, idx) => {
                const assignment = sub.assignment || {};
                const score = sub.total_score || 0;
                const isPassed = score >= 80;

                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/student/task/${sub.assignment_id}`)}
                    className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between min-h-[240px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${
                          isPassed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          Skor: {score}
                        </span>

                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <HiClock />
                          {new Date(sub.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {assignment.title || 'Kuis Matematika'}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Status: Selesai (1x Pengerjaan)
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <HiLockClosed className="text-amber-500" />
                        <span>Terkunci</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/student/task/${sub.assignment_id}`);
                        }}
                        data-btn-pembahasan="true"
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-100"
                      >
                        <HiEye className="text-sm" /> Lihat Pembahasan
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {completedTasks.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-100 p-8 max-w-md mx-auto my-6 shadow-sm">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-2xl mx-auto">
                    <HiCheckCircle />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">Belum Ada Riwayat Kuis</h4>
                  <p className="text-xs font-bold text-slate-400">Kerjakan kuis aktif terlebih dahulu untuk melihat kunci jawaban.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Info for Tunawicara */}
        {isMute && (
          <div className="bg-indigo-600 text-white py-3 px-8 flex items-center justify-between shrink-0 text-xs font-bold">
            <div className="flex items-center gap-3">
              <HiLightningBolt className="text-amber-400" />
              <span>Navigasi Jari Aktif</span>
            </div>
            <div className="flex gap-6">
              <span><strong className="bg-white/20 px-2 py-0.5 rounded">1-5</strong> Pilih Quiz</span>
              <span><strong className="bg-white/20 px-2 py-0.5 rounded">6</strong> Lanjut</span>
              <span><strong className="bg-white/20 px-2 py-0.5 rounded">7</strong> Kembali</span>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default StudentTasks;

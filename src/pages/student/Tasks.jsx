import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { StudentSidebar } from '@/components/layout';
import { useTasks } from '@/features/quiz/hooks/useTasks';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { HiChevronLeft, HiChevronRight, HiCollection, HiLightningBolt, HiStar, HiSparkles } from 'react-icons/hi';

const StudentTasks = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const { showSubtitle } = useSubtitle();
  const { isMute, isBlind } = useAccessibility();

  const { tasks, loading } = useTasks(profile?.id);

  // SMART PAGINATION FOR ACCESSIBILITY (TUNAWICARA)
  // We show only 5 items at a time so they can be selected with 1-5 fingers
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = isMute ? 5 : 12; // 5 for mute users, more for others

  const totalPages = Math.ceil((tasks?.length || 0) / itemsPerPage);

  const currentTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tasks.slice(start, start + itemsPerPage);
  }, [tasks, currentPage, itemsPerPage]);

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

  // Auto-announce for Tunawicara
  useEffect(() => {
    if (isMute && tasks.length > 0) {
      showSubtitle(`Ditemukan ${tasks.length} Quiz. Menampilkan 5 teratas. Gunakan 1-5 jari untuk memilih, atau 6 jari untuk halaman berikutnya.`, 'success');
    }
  }, [isMute, tasks.length]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      <StudentSidebar />
      <main className="flex-1 flex flex-col h-screen">

        <header className="p-8 md:p-12 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                <HiLightningBolt className="text-amber-500" /> QuizKu <span className="text-indigo-600">Aktif</span>
              </h1>
              <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">
                {tasks.length} Materi Tersedia • Halaman {currentPage} dari {totalPages || 1}
              </p>
            </div>

            {/* Pagination Controls - Smart & Professional */}
            {totalPages > 1 && (
              <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  data-gesture-prev="true"
                  className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-20 transition-all"
                >
                  <HiChevronLeft size={24} />
                </button>
                <div className="px-4 text-center min-w-[80px]">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Page</p>
                   <p className="text-lg font-black text-indigo-600 leading-none">{currentPage}</p>
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  data-gesture-next="true"
                  className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-20 transition-all"
                >
                  <HiChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-20 custom-scrollbar">
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
               {[1,2,3].map(i => <div key={i} className="h-56 bg-white rounded-[3rem] animate-pulse border border-slate-100" />)}
            </div>
          ) : (
            <>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                <AnimatePresence mode="wait">
                  {currentTasks.map((task, idx) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => navigate(`/student/task/${task.id}`)}
                      data-gesture-item="true"
                      className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                    >
                      {/* Gesture Rank Indicator for Tunawicara */}
                      {isMute && (
                        <div className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-200 z-10 scale-110 border-4 border-white">
                           {idx + 1}
                        </div>
                      )}

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                              <HiCollection />
                           </div>
                           <span className="px-4 py-1.5 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors">
                              {task.subject || 'Materi'}
                           </span>
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 leading-tight mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">{task.title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Modul: {task.modules?.title || 'Umum'}</p>
                      </div>

                      <div className="flex items-center justify-between mt-4 relative z-10">
                        <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100">
                          <HiStar className="text-amber-500" />
                          <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">200 XP</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-indigo-600 group-hover:scale-110 transition-all shadow-xl">
                          <HiChevronRight size={24} />
                        </div>
                      </div>

                      {/* Background Decoration */}
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-50/30 rounded-full blur-2xl group-hover:bg-indigo-100/50 transition-all" />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {tasks.length === 0 && (
                  <div className="col-span-full py-32 text-center">
                    <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="text-8xl mb-8 opacity-20">🎉</motion.div>
                    <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Semua Tugas Selesai!</h3>
                    <p className="text-slate-400 font-bold mt-4 uppercase tracking-[0.3em] text-xs leading-loose">Hebat! Kamu sudah menyelesaikan <br /> seluruh kuis yang tersedia hari ini.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Navigation Info for Tunawicara */}
        {isMute && (
          <div className="bg-indigo-600 text-white py-4 px-10 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <HiSparkles className="animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Navigasi Jari Aktif</p>
             </div>
             <div className="flex gap-8">
                <p className="text-[9px] font-bold uppercase"><span className="bg-white/20 px-2 py-1 rounded-lg mr-2">1-5</span> Pilih Quiz</p>
                <p className="text-[9px] font-bold uppercase"><span className="bg-white/20 px-2 py-1 rounded-lg mr-2">6</span> Lanjut</p>
                <p className="text-[9px] font-bold uppercase"><span className="bg-white/20 px-2 py-1 rounded-lg mr-2">7</span> Kembali</p>
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

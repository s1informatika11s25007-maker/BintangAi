import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassVoiceBroadcast } from '../hooks/useClassVoiceBroadcast';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { supabase } from '@/lib/supabaseClient';
import {
  HiMicrophone, HiStop, HiVolumeUp, HiChatAlt2, HiUserGroup,
  HiSearch, HiX, HiCheck, HiChevronDown, HiChevronUp
} from 'react-icons/hi';

export default function TeacherVoiceBroadcastWidget() {
  const { profile } = useAuthStore();
  const {
    isBroadcasting,
    latestBroadcast,
    toggleBroadcasting,
    studentReplies,
    targetStudentIds,
    setTargetStudentIds,
    classCode
  } = useClassVoiceBroadcast();

  const [classStudents, setClassStudents] = useState([]);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false); // Default compact/minimized so it never blocks page content

  // Fetch all students in the teacher's class
  useEffect(() => {
    if (!classCode) return;
    const fetchClassStudents = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, disability_type, class_level, is_online')
          .eq('role', 'siswa')
          .eq('class_code', classCode)
          .order('full_name', { ascending: true });
        setClassStudents(data || []);
      } catch (e) {
        console.error('Error fetching class students:', e);
      }
    };
    fetchClassStudents();
  }, [classCode]);

  // Filtered student list by search query and disability role
  const filteredStudents = useMemo(() => {
    return classStudents.filter((s) => {
      const matchSearch = s.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === 'all' || (s.disability_type || 'umum') === roleFilter;
      return matchSearch && matchRole;
    });
  }, [classStudents, searchQuery, roleFilter]);

  const handleSelectAll = () => setTargetStudentIds('all');
  const handleSelectNone = () => setTargetStudentIds([]);

  const handleSelectRole = (role) => {
    const matchingIds = classStudents
      .filter((s) => (s.disability_type || 'umum') === role)
      .map((s) => s.id);
    setTargetStudentIds(matchingIds);
  };

  const toggleStudentSelection = (studentId) => {
    if (targetStudentIds === 'all') {
      const allIds = classStudents.map((s) => s.id);
      setTargetStudentIds(allIds.filter((id) => id !== studentId));
    } else if (Array.isArray(targetStudentIds)) {
      if (targetStudentIds.includes(studentId)) {
        setTargetStudentIds(targetStudentIds.filter((id) => id !== studentId));
      } else {
        setTargetStudentIds([...targetStudentIds, studentId]);
      }
    }
  };

  // Human friendly target description
  const targetDescription = useMemo(() => {
    if (targetStudentIds === 'all') return `Semua Siswa (${classStudents.length})`;
    if (Array.isArray(targetStudentIds)) {
      if (targetStudentIds.length === 0) return 'Belum Ada (Pilih)';
      if (targetStudentIds.length === classStudents.length && classStudents.length > 0) return `Semua Siswa (${classStudents.length})`;
      return `${targetStudentIds.length} Siswa Terpilih`;
    }
    return 'Semua Siswa';
  }, [targetStudentIds, classStudents]);

  if (profile?.role !== 'guru' || !classCode) return null;

  return (
    <>
      {/* 🛡️ NON-INTRUSIVE FLOATING / COMPACT BROADCAST DOCK (NEVER PUSHES PAGE CONTENT) */}
      <div className="fixed right-3 sm:right-6 top-16 lg:top-4 z-[250] flex flex-col items-end pointer-events-none transition-all duration-300 max-w-[92vw] sm:max-w-xl">
        <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-2xl text-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl border border-indigo-500/30 w-full flex flex-col gap-2">

          {/* Compact Main Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-xl shrink-0 transition-all ${
                isBroadcasting ? 'bg-rose-500 text-white animate-pulse shadow-md' : 'bg-indigo-600 text-white'
              }`}>
                <HiMicrophone />
              </div>

              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`w-2 h-2 rounded-full ${isBroadcasting ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-300 truncate">
                    Siaran Suara Guru
                  </span>
                  <span className="px-1.5 py-0.5 bg-white/10 text-[8px] sm:text-[9px] font-extrabold rounded uppercase tracking-wider text-amber-300">
                    Kelas: {classCode}
                  </span>
                </div>

                {/* Target Student Pill */}
                <button
                  onClick={() => setShowSelectModal(true)}
                  className="text-[9px] sm:text-[10px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-all text-left truncate mt-0.5"
                  title="Klik untuk Atur Siswa Penerima"
                >
                  <HiUserGroup className="text-indigo-400 shrink-0" />
                  <span className="truncate">👥 {targetDescription}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                onClick={toggleBroadcasting}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
                  isBroadcasting
                    ? 'bg-rose-500 hover:bg-rose-600 text-white animate-bounce'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isBroadcasting ? <HiStop /> : <HiVolumeUp />}
                <span>{isBroadcasting ? 'Stop' : 'Siaran'}</span>
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 text-xs transition-all"
                title={isExpanded ? 'Kecilkan Tampilan' : 'Buka Detail Siaran'}
              >
                {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
              </button>
            </div>
          </div>

          {/* Expanded Detail Panel & Realtime Student Replies */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-white/10 space-y-3"
              >
                {/* Status or Latest Speech */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                  <span className="text-[9px] font-black uppercase text-indigo-400 block mb-1">
                    Status Siaran:
                  </span>
                  <p className="font-bold text-slate-200 italic leading-relaxed">
                    {isBroadcasting
                      ? (latestBroadcast ? `"${latestBroadcast}"` : 'Sedang mendengarkan suara Anda...')
                      : 'Siaran nonaktif. Klik tombol "Siaran" untuk mengirim instruksi suara.'}
                  </p>
                </div>

                {/* Realtime Student Replies List */}
                {studentReplies && studentReplies.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <HiChatAlt2 /> Balasan Siswa ({studentReplies.length})
                      </span>
                    </div>

                    <div className="max-h-32 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                      {studentReplies.map((reply) => {
                        const roleIcon = reply.role === 'tunanetra' ? '👁️ Tunanetra' : reply.role === 'tunarungu' ? '🧏 Tunarungu' : '🖐️ Tunawicara';
                        return (
                          <div key={reply.id} className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-xs">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="font-bold text-white text-[11px]">{reply.studentName}</span>
                              <span className="text-[8px] font-black text-indigo-300 uppercase">{roleIcon}</span>
                            </div>
                            <p className="text-slate-300 font-medium italic text-[11px]">"{reply.text}"</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SELECT TARGET STUDENTS MODAL (HANDLES 100+ STUDENTS EASILY) */}
      <AnimatePresence>
        {showSelectModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white text-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col font-sans pointer-events-auto"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md">
                    <HiUserGroup />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">Atur Target Penerima Siaran Suara</h3>
                    <p className="text-xs text-slate-400 font-bold">Kode Kelas: {classCode} • Total: {classStudents.length} Siswa</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSelectModal(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  <HiX className="text-xl" />
                </button>
              </div>

              {/* Quick Preset Buttons & Role Filter */}
              <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3 shrink-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-wider">Pilih Cepat:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={handleSelectAll}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        targetStudentIds === 'all'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Semua Siswa
                    </button>
                    <button
                      onClick={() => handleSelectRole('tunanetra')}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all"
                    >
                      👁️ Hanya Tunanetra
                    </button>
                    <button
                      onClick={() => handleSelectRole('tunarungu')}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all"
                    >
                      🧏 Hanya Tunarungu
                    </button>
                    <button
                      onClick={() => handleSelectRole('tunawicara')}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all"
                    >
                      🖐️ Hanya Tunawicara
                    </button>
                    <button
                      onClick={handleSelectNone}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama siswa di kelas ini..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Student Checkbox List */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
                {filteredStudents.map((student) => {
                  const isSelected = targetStudentIds === 'all' || (Array.isArray(targetStudentIds) && targetStudentIds.includes(student.id));
                  const roleBadge = student.disability_type === 'tunanetra' ? '👁️ Tunanetra' : student.disability_type === 'tunarungu' ? '🧏 Tunarungu' : student.disability_type === 'tunawicara' ? '🖐️ Tunawicara' : '👦 Umum';

                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudentSelection(student.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-sm'
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-transparent'
                        }`}>
                          <HiCheck />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-800 truncate">{student.full_name}</p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {roleBadge}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shrink-0 ${
                        student.is_online ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {student.is_online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <div className="py-12 text-center text-slate-400 font-bold text-xs">
                    Tidak ada siswa yang cocok dengan pencarian.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                  Target Aktif: {targetDescription}
                </span>
                <button
                  onClick={() => setShowSelectModal(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-md"
                >
                  Selesai & Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

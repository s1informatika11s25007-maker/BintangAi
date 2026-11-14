import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassVoiceBroadcast } from '../hooks/useClassVoiceBroadcast';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { supabase } from '@/lib/supabaseClient';
import {
  HiMicrophone, HiStop, HiVolumeUp, HiChatAlt2, HiUserGroup,
  HiSearch, HiX, HiCheck, HiFilter, HiUser
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

  // Handle Select All / Unselect All / Group Selection
  const handleSelectAll = () => {
    setTargetStudentIds('all');
  };

  const handleSelectNone = () => {
    setTargetStudentIds([]);
  };

  const handleSelectRole = (role) => {
    const matchingIds = classStudents
      .filter((s) => (s.disability_type || 'umum') === role)
      .map((s) => s.id);
    setTargetStudentIds(matchingIds);
  };

  const toggleStudentSelection = (studentId) => {
    if (targetStudentIds === 'all') {
      // Switch from 'all' to all IDs minus this one
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
      if (targetStudentIds.length === 0) return 'Belum Ada (Pilih Siswa)';
      if (targetStudentIds.length === classStudents.length && classStudents.length > 0) return `Semua Siswa (${classStudents.length})`;
      return `${targetStudentIds.length} Siswa Terpilih`;
    }
    return 'Semua Siswa';
  }, [targetStudentIds, classStudents]);

  if (profile?.role !== 'guru' || !classCode) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-indigo-500/20 shadow-xl relative overflow-hidden mb-8 space-y-4">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all ${
              isBroadcasting ? 'bg-rose-500 shadow-lg shadow-rose-500/30 animate-pulse' : 'bg-indigo-600 shadow-lg shadow-indigo-600/30'
            }`}>
              <HiMicrophone />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`w-2 h-2 rounded-full ${isBroadcasting ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  Siaran Suara Guru Realtime
                </h4>
                <span className="px-2 py-0.5 bg-white/10 text-[9px] font-extrabold rounded-md uppercase tracking-wider text-amber-300 border border-white/10">
                  Kelas: {classCode}
                </span>

                {/* Target Student Pill */}
                <button
                  onClick={() => setShowSelectModal(true)}
                  className="px-2.5 py-0.5 bg-indigo-600/80 hover:bg-indigo-500 text-white text-[9px] font-black uppercase rounded-md border border-indigo-400/40 flex items-center gap-1 transition-all"
                  title="Atur Siswa Penerima Siaran"
                >
                  <HiUserGroup className="text-xs" />
                  <span>👥 {targetDescription}</span>
                </button>
              </div>

              <p className="text-xs font-medium text-slate-300 truncate">
                {isBroadcasting
                  ? (latestBroadcast ? `"${latestBroadcast}"` : 'Sedang mendengarkan suara Anda...')
                  : 'Ucapkan instruksi untuk disiarkan langsung ke siswa yang dipilih di kelas Anda'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowSelectModal(true)}
              className="px-3.5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all border border-white/10 shrink-0"
              title="Pilih Target Siswa"
            >
              <HiUserGroup className="text-base text-indigo-300" />
              <span className="hidden sm:inline">Pilih Siswa</span>
            </button>

            <button
              onClick={toggleBroadcasting}
              className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all active:scale-95 shadow-lg ${
                isBroadcasting
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 animate-bounce'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {isBroadcasting ? <HiStop className="text-lg" /> : <HiVolumeUp className="text-lg" />}
              <span>{isBroadcasting ? 'Hentikan Siaran' : 'Mulai Siaran'}</span>
            </button>
          </div>
        </div>

        {/* Realtime Student Replies List Section */}
        {studentReplies && studentReplies.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <HiChatAlt2 className="text-sm" /> Balasan Siswa Realtime ({studentReplies.length})
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Terhubung Langsung</span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {studentReplies.map((reply) => {
                const roleIcon = reply.role === 'tunanetra' ? '👁️ Tunanetra' : reply.role === 'tunarungu' ? '🧏 Tunarungu' : '🖐️ Tunawicara';
                const roleBadgeColor = reply.role === 'tunanetra' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : reply.role === 'tunarungu' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

                return (
                  <div key={reply.id} className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{reply.studentName}</span>
                        <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md border ${roleBadgeColor}`}>
                          {roleIcon}
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold">
                          {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-200 font-medium italic leading-relaxed">
                        "{reply.text}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SELECT TARGET STUDENTS MODAL (HANDLES 100+ STUDENTS EASILY) */}
      <AnimatePresence>
        {showSelectModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white text-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col font-sans"
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

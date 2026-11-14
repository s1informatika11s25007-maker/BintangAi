import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassVoiceBroadcast } from '../hooks/useClassVoiceBroadcast';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { HiMicrophone, HiStop, HiVolumeUp, HiChatAlt2, HiUser } from 'react-icons/hi';

export default function TeacherVoiceBroadcastWidget() {
  const { profile } = useAuthStore();
  const {
    isBroadcasting,
    latestBroadcast,
    toggleBroadcasting,
    studentReplies,
    classCode
  } = useClassVoiceBroadcast();

  if (profile?.role !== 'guru' || !classCode) return null;

  return (
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
                Kode Kelas: {classCode}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-300 truncate">
              {isBroadcasting
                ? (latestBroadcast ? `"${latestBroadcast}"` : 'Sedang mendengarkan suara Anda...')
                : 'Ucapkan instruksi untuk disiarkan langsung ke semua siswa terhubung di kelas Anda'}
            </p>
          </div>
        </div>

        <button
          onClick={toggleBroadcasting}
          className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all active:scale-95 shadow-lg ${
            isBroadcasting
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 animate-bounce'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
          }`}
        >
          {isBroadcasting ? <HiStop className="text-lg" /> : <HiVolumeUp className="text-lg" />}
          <span>{isBroadcasting ? 'Hentikan Siaran' : 'Mulai Siaran Suara'}</span>
        </button>
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
  );
}

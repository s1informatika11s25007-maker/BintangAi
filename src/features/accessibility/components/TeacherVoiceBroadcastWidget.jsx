import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassVoiceBroadcast } from '../hooks/useClassVoiceBroadcast';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { HiMicrophone, HiStop, HiVolumeUp, HiShieldCheck } from 'react-icons/hi';

export default function TeacherVoiceBroadcastWidget() {
  const { profile } = useAuthStore();
  const {
    isBroadcasting,
    latestBroadcast,
    toggleBroadcasting,
    classCode
  } = useClassVoiceBroadcast();

  if (profile?.role !== 'guru' || !classCode) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-indigo-500/20 shadow-xl relative overflow-hidden mb-8">
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
    </div>
  );
}

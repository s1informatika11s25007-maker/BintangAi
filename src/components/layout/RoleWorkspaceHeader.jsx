import React from 'react';
import { Smartphone, LayoutDashboard, Users, Cpu, ShieldCheck, Clock, AlertTriangle, UserCheck, Heart, Sparkles, Award } from 'lucide-react';
import { ACTORS } from '../../types/architecture';

export default function RoleWorkspaceHeader({ activeRole, obligations, epistemicFacts, staff }) {
  const openObsCount = obligations.filter(o => o.status !== 'verified_closed').length;
  const criticalObsCount = obligations.filter(o => (o.priority === 'critical' || o.priority === 'emergency') && o.status !== 'verified_closed').length;

  if (activeRole === 'caregiver') {
    return (
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Smartphone className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black tracking-wide">Workspace Pengasuh Mobile (Shift Pagi)</h2>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 font-bold">
                  On Duty
                </span>
              </div>
              <p className="text-xs text-sky-100 opacity-90 mt-0.5">
                Suster Dewi Pertiwi, Amd.Kep | Jadwal Shift: 07:00 – 15:00 WIB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-black/20 p-2.5 rounded-xl border border-white/10 shrink-0">
            <div>
              <span className="text-[10px] text-sky-200 block font-medium">Tugas Anda Aktif</span>
              <span className="font-mono font-bold text-amber-300 text-sm">2 Obligation Hari Ini</span>
            </div>
            <div className="border-l border-white/20 pl-3">
              <span className="text-[10px] text-sky-200 block font-medium">PWA Offline Ledger</span>
              <span className="font-mono font-bold text-emerald-300 text-xs">P5 Hash Ready</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'supervisor') {
    return (
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-sky-500/20 text-sky-400 rounded-2xl border border-sky-500/30">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black tracking-wide">Pusat Kontrol Supervisor & Triage Klinis</h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                  A3 Approval Authority
                </span>
              </div>
              <p className="text-xs text-slate-300 opacity-90 mt-0.5">
                Ns. Ratna Sari, M.Kep | Penanggung Jawab Panti Dahlia & Mawar
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Obligation Terbuka</span>
              <span className="font-mono font-bold text-sky-400 text-sm">{openObsCount} Misi</span>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <span className="text-[10px] text-slate-400 block font-medium">Tugas Kritis</span>
              <span className="font-mono font-bold text-rose-400 text-sm">{criticalObsCount} Perlu Pengawasan</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'family') {
    return (
      <div className="bg-gradient-to-r from-purple-700 via-rose-600 to-pink-700 text-white rounded-2xl p-5 shadow-lg space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Heart className="w-6 h-6 text-pink-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black tracking-wide">Portal Wali & Keluarga Pasien</h2>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 font-bold">
                  PDP Consent Active
                </span>
              </div>
              <p className="text-xs text-pink-100 opacity-90 mt-0.5">
                Wali Pasien: Ibu Hj. Aminah (Kamar 102 — Dahlia)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-black/20 p-2.5 rounded-xl border border-white/10 shrink-0">
            <div>
              <span className="text-[10px] text-pink-200 block font-medium">Status Kesehatan</span>
              <span className="font-mono font-bold text-emerald-300 text-xs">Stabil & Terawat Baik</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin HR
  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-800 text-white rounded-2xl p-5 shadow-lg space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <Cpu className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black tracking-wide">Konsol Administrasi Panti & Manajemen SDM</h2>
              <span className="text-[10px] bg-amber-300/20 text-amber-100 px-2 py-0.5 rounded-full border border-amber-300/30 font-bold">
                P4 Simulator Active
              </span>
            </div>
            <p className="text-xs text-amber-100 opacity-90 mt-0.5">
              Admin HR & Fasilitas Panti SambungJaga
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-black/20 p-2.5 rounded-xl border border-white/10 shrink-0">
          <div>
            <span className="text-[10px] text-amber-200 block font-medium">Staf Aktif Duty</span>
            <span className="font-mono font-bold text-white text-sm">{staff.length} Perawat</span>
          </div>
        </div>
      </div>
    </div>
  );
}

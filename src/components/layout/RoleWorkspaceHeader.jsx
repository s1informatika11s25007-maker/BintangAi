import React from 'react';
import { Smartphone, LayoutDashboard, Heart, Cpu, ShieldCheck } from 'lucide-react';

export default function RoleWorkspaceHeader({ activeRole, obligations, epistemicFacts, staff }) {
  const openObsCount = obligations.filter(o => o.status !== 'verified_closed').length;
  const criticalObsCount = obligations.filter(o => (o.priority === 'critical' || o.priority === 'emergency') && o.status !== 'verified_closed').length;

  if (activeRole === 'caregiver') {
    return (
      <div className="bg-gradient-to-r from-sky-50/80 via-blue-50/50 to-sky-100/60 border border-sky-200/90 text-slate-900 rounded-3xl p-6 shadow-xl shadow-sky-100/50 space-y-2 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-md shadow-sky-600/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">Workspace Pengasuh Mobile (Shift Pagi)</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 font-bold">
                  On Duty
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Suster Dewi Pertiwi, Amd.Kep | Jadwal Shift: 07:00 – 15:00 WIB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-white p-3 rounded-2xl border border-sky-200/80 shadow-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">Tugas Aktif</span>
              <span className="font-mono font-black text-amber-700 text-sm">2 Obligation Hari Ini</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-slate-500 block font-semibold">PWA Offline Ledger</span>
              <span className="font-mono font-bold text-emerald-700 text-xs">P5 Hash Ready</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'supervisor') {
    return (
      <div className="bg-gradient-to-r from-sky-50/80 via-blue-50/50 to-sky-100/60 border border-sky-200/90 text-slate-900 rounded-3xl p-6 shadow-xl shadow-sky-100/50 space-y-2 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-md shadow-sky-600/20">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">Pusat Kontrol Supervisor & Triage Klinis</h2>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold">
                  A3 Approval Authority
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Ns. Ratna Sari, M.Kep | Penanggung Jawab Panti Dahlia & Mawar
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-white p-3 rounded-2xl border border-sky-200/80 shadow-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">Obligation Terbuka</span>
              <span className="font-mono font-black text-sky-700 text-sm">{openObsCount} Misi</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-slate-500 block font-semibold">Tugas Kritis</span>
              <span className="font-mono font-black text-rose-700 text-sm">{criticalObsCount} Perlu Pengawasan</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeRole === 'family') {
    return (
      <div className="bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-purple-50/60 border border-pink-200/90 text-slate-900 rounded-3xl p-6 shadow-xl shadow-pink-100/50 space-y-2 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-md shadow-rose-600/20">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">Portal Wali & Keluarga Pasien</h2>
                <span className="text-[10px] bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-300 font-bold">
                  PDP Consent Active
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Wali Pasien: Ibu Hj. Aminah (Kamar 102 — Dahlia)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-white p-3 rounded-2xl border border-pink-200/80 shadow-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 block font-semibold">Status Kesehatan</span>
              <span className="font-mono font-black text-emerald-700 text-xs">Stabil & Terawat Baik</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin HR
  return (
    <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-indigo-50/60 border border-amber-200/90 text-slate-900 rounded-3xl p-6 shadow-xl shadow-amber-100/50 space-y-2 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-md shadow-amber-600/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Konsol Administrasi Panti & Manajemen SDM</h2>
              <span className="text-[10px] bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full border border-indigo-300 font-bold">
                P4 Simulator Active
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Admin HR & Fasilitas Panti SambungJaga
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-white p-3 rounded-2xl border border-amber-200/80 shadow-xs shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 block font-semibold">Staf Aktif Duty</span>
            <span className="font-mono font-black text-slate-900 text-sm">{staff.length} Perawat</span>
          </div>
        </div>
      </div>
    </div>
  );
}

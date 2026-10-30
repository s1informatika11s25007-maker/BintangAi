import React from 'react';
import { ShieldCheck, Sparkles, Activity, Clock, AlertCircle } from 'lucide-react';
import { calculateCareDebt } from '../../services/rule/obligationEngine';

export default function RoleWorkspaceHeader({ activeRole, obligations = [], epistemicFacts = [], staff = [] }) {
  const { totalDebtMinutes, healthScore } = calculateCareDebt(obligations);

  const roleBanners = {
    supervisor: {
      title: 'Selamat pagi, Ns. Ratna Sari, M.Kep (Supervisor)',
      badge: 'Supervisor Klinis',
      color: 'from-sky-600 via-sky-500 to-indigo-600',
      description: 'Pusat Kontrol & Triage Klinis Multi-Lansia. Memantau Care Debt, persetujuan envelope A3, dan verifikasi bukti E0-E3.'
    },
    caregiver: {
      title: 'Selamat bertugas, Suster Dewi Pertiwi, Amd.Kep',
      badge: 'Pengasuh / Perawat',
      color: 'from-teal-600 via-emerald-600 to-teal-700',
      description: 'PWA Mobile Care Capture. Rekam laporan suara (STT), unggah bukti E1-E3, dan jalankan misi perawatan otonom.'
    },
    family: {
      title: 'Selamat datang, Rina Wijaya (Wali Ibu Hj. Aminah)',
      badge: 'Portal Keluarga Pasien',
      color: 'from-purple-600 via-indigo-600 to-purple-700',
      description: 'Ringkasan perkembangan medis transparan & aman. Informasi disaring otomatis oleh Consent-Aware Disclosure Agent (UU PDP).'
    },
    admin_hr: {
      title: 'Selamat datang, Budi Santoso (Admin HR & Panti)',
      badge: 'Admin HR & Simulator Lab',
      color: 'from-slate-800 via-slate-700 to-slate-900',
      description: 'Simulasi P4 Failure-Set Search, evaluasi cakupan kompetensi perawat, dan retroaktif rule replay.'
    }
  };

  const currentBanner = roleBanners[activeRole] || roleBanners.supervisor;

  return (
    <div className={`bg-gradient-to-r ${currentBanner.color} rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-3 relative overflow-hidden`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white">
              {currentBanner.badge}
            </span>
            <span className="text-[10px] text-white/80 font-mono flex items-center">
              <Sparkles className="w-3 h-3 mr-1 text-amber-300" /> Auto-Orchestrated
            </span>
          </div>
          <h2 className="font-extrabold text-base sm:text-xl tracking-tight leading-snug">
            {currentBanner.title}
          </h2>
          <p className="text-xs text-white/80 leading-relaxed font-medium">
            {currentBanner.description}
          </p>
        </div>

        {/* Live System Metrics Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex items-center space-x-4 shrink-0 text-xs">
          <div>
            <p className="text-[10px] text-white/70 font-semibold">Care Health Score</p>
            <p className="font-extrabold text-sm text-emerald-300">{healthScore}%</p>
          </div>
          <div className="border-l border-white/20 pl-4">
            <p className="text-[10px] text-white/70 font-semibold">Care Debt Kumulatif</p>
            <p className="font-extrabold text-sm text-amber-300">{totalDebtMinutes} mnt</p>
          </div>
        </div>
      </div>
    </div>
  );
}

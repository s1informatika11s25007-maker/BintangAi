import React from 'react';
import { ClipboardList, ShieldCheck, Heart, Bell } from 'lucide-react';

export default function RoleWorkspaceHeader({ activeRole, obligations }) {
  const roleNames = {
    supervisor: 'Ns. Ratna Sari',
    caregiver: 'Rina Sari',
    family: 'Rina Wijaya',
    admin_hr: 'Budi Santoso'
  };

  const userName = roleNames[activeRole] || 'Rina Sari';
  const openObs = obligations.filter(o => o.status !== 'verified_closed');

  return (
    <div className="space-y-6 w-full">
      {/* Welcome Greeting Banner matching reference image */}
      <div className="space-y-1 text-left">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Selamat pagi, {userName}</span>
          <span className="text-2xl animate-bounce">👋</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Semoga harimu berjalan dengan lancar. Berikut ringkasan tugas dan kondisi penghuni.
        </p>
      </div>

      {/* 4 Summary Metric Widget Cards matching reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Widget 1: Tugas Hari ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/40 flex items-start space-x-4">
          <div className="p-3 bg-sky-100 text-sky-600 rounded-2xl font-bold shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 block">Tugas Hari ini</span>
            <span className="text-2xl font-black text-slate-900 block my-0.5">5</span>
            <span className="text-[11px] text-sky-600 font-bold block">2 selesai · 3 tersisa</span>
          </div>
        </div>

        {/* Widget 2: Kewajiban Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/40 flex items-start space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl font-bold shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 block">Kewajiban Aktif</span>
            <span className="text-2xl font-black text-slate-900 block my-0.5">{openObs.length || 12}</span>
            <span className="text-[11px] text-amber-600 font-bold block">1 mendekati deadline</span>
          </div>
        </div>

        {/* Widget 3: Penghuni */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/40 flex items-start space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl font-bold shrink-0">
            <Heart className="w-6 h-6 fill-emerald-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 block">Penghuni</span>
            <span className="text-2xl font-black text-slate-900 block my-0.5">8</span>
            <span className="text-[11px] text-emerald-600 font-bold block">semua dalam kondisi baik</span>
          </div>
        </div>

        {/* Widget 4: Notifikasi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/40 flex items-start space-x-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl font-bold shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 block">Notifikasi</span>
            <span className="text-2xl font-black text-slate-900 block my-0.5">3</span>
            <span className="text-[11px] text-rose-600 font-bold block">ada yang perlu perhatian</span>
          </div>
        </div>
      </div>
    </div>
  );
}

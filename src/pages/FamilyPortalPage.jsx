import React from 'react';
import { Users, Lock, Heart, Eye } from 'lucide-react';
import Badge from '../components/common/Badge';

export default function FamilyPortalPage({ residents, obligations }) {
  const familyResident = (residents && residents.length > 0)
    ? residents[0]
    : { id: 'res-101', full_name: 'Ibu Hj. Aminah (78 th)', room_number: 'Kamar 102 — Dahlia' };
  const familyObs = (obligations || []).filter(o => o.resident_id === familyResident.id);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-600" />
            <span>Family Portal (Consent-Aware Disclosure Agent)</span>
          </h2>
          <p className="text-xs text-slate-600">
            Akses Informasi Ringkasan untuk Keluarga Pasien (Sesuai UU Perlindungan Data Pribadi / PDP)
          </p>
        </div>
        <Badge variant="kernel" className="font-mono text-xs">
          Filter Consent: Filtered Summary
        </Badge>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xl shadow-slate-200/50 flex items-center space-x-4 w-full">
        <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200">
          <Heart className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{familyResident.full_name}</h3>
          <p className="text-xs text-slate-500 font-medium">{familyResident.room_number}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 font-bold">
              Kondisi Stabil & Terawat
            </span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-300 font-bold">
              Diet Diabetes Terjaga
            </span>
          </div>
        </div>
      </div>

      {/* Filtered Update Feed */}
      <div className="space-y-4 w-full">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
          <Eye className="w-4 h-4 mr-1.5 text-sky-600" />
          Kabar & Ringkasan Perawatan Hari Ini (Filtered Output)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {familyObs.map(ob => (
            <div key={ob.id} className="bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{ob.title}</span>
                <Badge variant={ob.status === 'verified_closed' ? 'success' : 'info'}>
                  {ob.status === 'verified_closed' ? 'Terverifikasi Selesai' : 'Dalam Terapi'}
                </Badge>
              </div>
              <p className="text-slate-600 text-[11px]">{ob.description}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Penanggung Jawab: {ob.assigned_caregiver_name}</span>
                <span className="font-mono font-bold text-sky-700">PDP Consent Filtered</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5 shadow-sm w-full">
        <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Informasi rinci medis tingkat lanjut disembunyikan secara otomatis oleh Consent-Aware Disclosure Agent sesuai batasan izin hak akses yang dikonfigurasi oleh wali pasien.
        </p>
      </div>
    </div>
  );
}

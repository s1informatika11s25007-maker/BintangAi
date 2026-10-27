import React, { useState } from 'react';
import { Smartphone, Mic, Plus, ShieldCheck, WifiOff, Clock } from 'lucide-react';
import ObligationGraphCard from '../components/dashboard/ObligationGraphCard';
import CaregiverCaptureModal from '../components/pwa/CaregiverCaptureModal';
import EvidenceUploadModal from '../components/pwa/EvidenceUploadModal';
import Badge from '../components/common/Badge';

export default function CaregiverMobilePage({
  residents,
  obligations,
  onCaptureSubmit,
  onSubmitEvidence,
  onOpenTraceModal,
  isOffline,
  offlineQueue
}) {
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [selectedObligationForEvidence, setSelectedObligationForEvidence] = useState(null);

  const caregiverObs = obligations.filter(o => o.assigned_caregiver_id === 'staff-01' || o.assigned_caregiver_id === 'staff-02');

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12 pt-2 px-2 sm:px-0">
      {/* Mobile PWA Card Container Simulated Phone View */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xl shadow-slate-200/60 space-y-4">

        {/* Header PWA */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl border border-sky-200">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Suster Dewi Pertiwi</h2>
              <p className="text-[10px] text-slate-500 font-medium">Shift Pagi (07:00 - 15:00 WIB)</p>
            </div>
          </div>

          <Badge variant={isOffline ? 'warning' : 'success'} className="text-[10px]">
            {isOffline ? `P5 Offline (${offlineQueue.length})` : 'Online Supabase'}
          </Badge>
        </div>

        {/* P5 Offline Ledger Status Notice */}
        {isOffline && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start space-x-2">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Mode Offline-First Aktif (P5 Ledger)</p>
              <p className="text-[11px] opacity-90 mt-0.5">Laporan di-hash & disimpan secara lokal dengan atestasi perangkat anti-backdate. Otomatis sinkronisasi saat terhubung internet.</p>
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setIsCaptureOpen(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white p-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/20 transition"
          >
            <Mic className="w-4 h-4 animate-bounce text-sky-100" />
            <span>Rekam Suara / Teks</span>
          </button>

          <button
            onClick={() => setIsCaptureOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 p-3 rounded-2xl font-semibold text-xs flex items-center justify-center space-x-1.5 border border-slate-200 transition"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Klarifikasi Minimal</span>
          </button>
        </div>

        {/* My Active Obligations Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
              Tugas & Kewajiban Saya ({caregiverObs.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Bitemporal Ledger</span>
          </div>

          <div className="space-y-3">
            {caregiverObs.map(ob => (
              <ObligationGraphCard
                key={ob.id}
                obligation={ob}
                currentUserRole="caregiver"
                onOpenEvidenceModal={(o) => setSelectedObligationForEvidence(o)}
                onOpenTraceModal={onOpenTraceModal}
                onApproveAction={() => {}}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Capture Modal */}
      <CaregiverCaptureModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        residents={residents}
        onCaptureSubmit={onCaptureSubmit}
      />

      {/* Evidence Upload Modal */}
      <EvidenceUploadModal
        isOpen={!!selectedObligationForEvidence}
        onClose={() => setSelectedObligationForEvidence(null)}
        obligation={selectedObligationForEvidence}
        onSubmitEvidence={onSubmitEvidence}
      />
    </div>
  );
}

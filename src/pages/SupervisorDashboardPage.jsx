import React, { useState } from 'react';
import { LayoutDashboard, Plus, Activity, ShieldAlert } from 'lucide-react';
import ObligationGraphCard from '../components/dashboard/ObligationGraphCard';
import EpistemicLedgerBadge from '../components/dashboard/EpistemicLedgerBadge';
import CareDebtAlert from '../components/dashboard/CareDebtAlert';
import EvidenceUploadModal from '../components/pwa/EvidenceUploadModal';
import Modal from '../components/common/Modal';

export default function SupervisorDashboardPage({
  obligations,
  epistemicFacts,
  residents,
  spotChallenges,
  onSubmitEvidence,
  onApproveAction,
  onCreateObligation,
  onOpenTraceModal
}) {
  const [selectedObligationForEvidence, setSelectedObligationForEvidence] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newResidentId, setNewResidentId] = useState(residents[0]?.id || '');
  const [newPriority, setNewPriority] = useState('critical');
  const [newEvidenceGrade, setNewEvidenceGrade] = useState('E1');

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle) return;

    const res = residents.find(r => r.id === newResidentId);
    onCreateObligation({
      resident_id: newResidentId,
      resident_name: res?.full_name || 'Penghuni',
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      required_evidence_grade: newEvidenceGrade,
      assigned_caregiver_id: 'staff-01',
      assigned_caregiver_name: 'Suster Dewi Pertiwi'
    }, 'Ns. Ratna Sari (Supervisor)');

    setNewTitle('');
    setNewDesc('');
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Care Debt & Cascade Detector Bar */}
      <CareDebtAlert obligations={obligations} />

      {/* Top Controls & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <LayoutDashboard className="w-5 h-5 text-sky-600" />
            <span>Care Obligation Graph & Bitemporal Ledger (P1)</span>
          </h2>
          <p className="text-xs text-slate-600">
            Penjejakan real-time kewajiban perawatan terverifikasi evidence-grade
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kewajiban Baru</span>
        </button>
      </div>

      {/* Main Grid: Obligation Graph + Epistemic Fact Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Obligation Graph */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar Kewajiban Aktif ({obligations.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono font-medium">Realtime Supabase Channel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {obligations.map(ob => (
              <ObligationGraphCard
                key={ob.id}
                obligation={ob}
                currentUserRole="supervisor"
                onOpenEvidenceModal={(o) => setSelectedObligationForEvidence(o)}
                onOpenTraceModal={onOpenTraceModal}
                onApproveAction={onApproveAction}
              />
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): P3 Epistemic Facts & Spot Challenge Engine */}
        <div className="space-y-6">
          {/* P3 Epistemic Fact Ledger Widget */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xl shadow-slate-200/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center">
                <Activity className="w-4 h-4 mr-1.5 text-emerald-600" />
                P3 · Epistemic Fact Ledger
              </h3>
              <span className="text-[10px] text-emerald-700 font-bold font-mono">5 Status Data</span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {epistemicFacts.map(fact => (
                <div key={fact.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{fact.resident_name}</span>
                    <EpistemicLedgerBadge status={fact.status} confidence={fact.confidence_score} />
                  </div>
                  <p className="text-[11px] font-mono font-semibold text-sky-700">
                    {fact.fact_key}: {JSON.stringify(fact.fact_value)}
                  </p>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Sumber: {fact.source_type}</span>
                    <span>{new Date(fact.observed_at).toLocaleTimeString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spot Challenge Engine Widget */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xl shadow-slate-200/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
                P2 · Spot Challenge Engine
              </h3>
              <span className="text-[10px] text-amber-700 font-bold font-mono">Audit Acak</span>
            </div>

            {spotChallenges.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Belum ada sampel audit spot challenge aktif.</p>
            ) : (
              <div className="space-y-2">
                {spotChallenges.map(sc => (
                  <div key={sc.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">Spot Challenge Audit</span>
                      <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">PENDING</span>
                    </div>
                    <p className="text-[11px] text-slate-700">{sc.challenge_reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Evidence */}
      <EvidenceUploadModal
        isOpen={!!selectedObligationForEvidence}
        onClose={() => setSelectedObligationForEvidence(null)}
        obligation={selectedObligationForEvidence}
        onSubmitEvidence={onSubmitEvidence}
      />

      {/* Modal Create Obligation */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tambah Care Obligation Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-600 font-semibold mb-1">Penghuni / Pasien</label>
            <select
              value={newResidentId}
              onChange={(e) => setNewResidentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
            >
              {residents.map(r => (
                <option key={r.id} value={r.id}>{r.full_name} ({r.room_number})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 font-semibold mb-1">Judul Kewajiban Perawatan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemberian Obat Hipertensi Amlodipine 5mg"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 font-semibold mb-1">Deskripsi & Catatan Klinis</label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-600 font-semibold mb-1">Tingkat Prioritas</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
              >
                <option value="routine">Routine</option>
                <option value="important">Important</option>
                <option value="critical">Critical (Perlu A3 Approval)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-600 font-semibold mb-1">Wajib Bukti (Evidence Grade)</label>
              <select
                value={newEvidenceGrade}
                onChange={(e) => setNewEvidenceGrade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
              >
                <option value="E0">E0 - Klaim Verbal</option>
                <option value="E1">E1 - Artefak Foto/QR</option>
                <option value="E2">E2 - Konfirmasi Orang Kedua</option>
                <option value="E3">E3 - Sensor System</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="bg-slate-100 text-slate-700 text-xs px-4 py-2 rounded-xl font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-4 py-2 rounded-xl font-bold shadow-md shadow-sky-600/20"
            >
              Simpan & Terbitkan Obligation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

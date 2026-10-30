import React, { useState } from 'react';
import { LayoutDashboard, Plus, Search, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import CareDebtAlert from '../../components/dashboard/CareDebtAlert';
import EpistemicLedgerBadge from '../../components/dashboard/EpistemicLedgerBadge';
import ObligationGraphCard from '../../components/dashboard/ObligationGraphCard';
import FloatingVoiceMic from '../../components/common/FloatingVoiceMic';
import { calculateCareDebt } from '../../services/rule/obligationEngine';
import { OBLIGATION_STATUS, AUTHORITY_ENVELOPE } from '../../types/core/architecture';

export default function SupervisorDashboardPage({
  obligations = [],
  epistemicFacts = [],
  residents = [],
  staff = [],
  currentUser,
  spotChallenges = [],
  onSubmitEvidence,
  onApproveAction,
  onCreateObligation,
  onOpenTraceModal,
  setActiveTab
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('critical');
  const [newGrade, setNewGrade] = useState('E1');
  const [selectedResidentId, setSelectedResidentId] = useState(residents[0]?.id || '');

  const openObs = obligations.filter(o => o.status !== OBLIGATION_STATUS.VERIFIED_CLOSED);
  const closedObs = obligations.filter(o => o.status === OBLIGATION_STATUS.VERIFIED_CLOSED);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onCreateObligation({
      title: newTitle,
      description: newDescription,
      priority: newPriority,
      required_evidence_grade: newGrade,
      resident_id: selectedResidentId || residents[0]?.id,
      assigned_caregiver_id: staff.find(s => s.role === 'caregiver')?.id
    }, currentUser?.name || currentUser?.full_name || 'Supervisor');

    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Care Debt Alert Banner */}
      <CareDebtAlert
        obligations={obligations}
        onOpenTraceModal={onOpenTraceModal}
        onGoToCaregiverPwa={() => setActiveTab?.('caregiver_pwa')}
      />

      {/* Main Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">Tugas Prioritas & Care Obligation Graph</h3>
          <p className="text-xs text-slate-500 font-medium">Bitemporal Ledger Active Graph ({openObs.length} Terbuka / {closedObs.length} Ditutup)</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-600/30 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas</span>
        </button>
      </div>

      {/* Obligations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {obligations.map((ob) => (
          <ObligationGraphCard
            key={ob.id}
            obligation={ob}
            onSubmitEvidence={onSubmitEvidence}
            onApproveAction={onApproveAction}
            onOpenTraceModal={onOpenTraceModal}
          />
        ))}
      </div>

      {/* Epistemic Facts Summary Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm">Fakta Medis Terbaru (P3 Epistemic Fact Ledger)</h4>
          <span className="text-[10px] text-slate-500 font-mono">Total {epistemicFacts.length} Recorded</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {epistemicFacts.map((fact) => (
            <div key={fact.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{fact.fact_key}</span>
                <EpistemicLedgerBadge status={fact.status} />
              </div>
              <p className="text-slate-600 text-[11px] line-clamp-1">
                {typeof fact.fact_value === 'object' ? JSON.stringify(fact.fact_value) : fact.fact_value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Obligation */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 text-slate-900">
            <h3 className="font-bold text-sm text-slate-900">Tambah Care Obligation Baru</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Lansia</label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                  className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold"
                >
                  {residents.map(r => (
                    <option key={r.id} value={r.id}>{r.full_name} ({r.room_number})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Judul Tugas / Instruksi Medis</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Pemberian Obat Hipertensi Amlodipine 5mg"
                  className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi & Prosedur Ringkas</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Catatan tambahan..."
                  className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Prioritas</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold"
                  >
                    <option value="routine">Routine</option>
                    <option value="important">Important</option>
                    <option value="critical">Critical</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Standar Bukti (Grade)</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold"
                  >
                    <option value="E0">E0 - Verbal</option>
                    <option value="E1">E1 - Foto/QR</option>
                    <option value="E2">E2 - Dual Signoff</option>
                    <option value="E3">E3 - Sensor IoT</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold shadow-md shadow-sky-600/30"
                >
                  Simpan & Terbitkan Obligation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FloatingVoiceMic onOpenCaptureModal={() => {}} />
    </div>
  );
}

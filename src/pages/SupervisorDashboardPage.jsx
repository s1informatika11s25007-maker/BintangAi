import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  Bot,
  Heart,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import ObligationGraphCard from '../components/dashboard/ObligationGraphCard';
import CareDebtAlert from '../components/dashboard/CareDebtAlert';
import EvidenceUploadModal from '../components/pwa/EvidenceUploadModal';
import Modal from '../components/common/Modal';

export default function SupervisorDashboardPage({
  obligations,
  residents,
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

  // Reference image priority tasks
  const priorityTasks = [
    { id: 'task-1', title: 'Pemberian obat pagi - Bapak Wijaya', time: '08:00', status: 'Sedang berlangsung', statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { id: 'task-2', title: 'Cek tekanan darah - Ibu Sari', time: '09:00', status: 'Menunggu', statusColor: 'bg-amber-100 text-amber-800 border-amber-300' },
    { id: 'task-3', title: 'Pembersihan kamar - Ibu Rini', time: '10:00', status: 'Belum mulai', statusColor: 'bg-rose-100 text-rose-800 border-rose-300' },
    { id: 'task-4', title: 'Observasi pola makan - Bapak Santoso', time: '11:00', status: 'Belum mulai', statusColor: 'bg-rose-100 text-rose-800 border-rose-300' },
    { id: 'task-5', title: 'Update catatan harian - Semua penghuni', time: '16:00', status: 'Belum mulai', statusColor: 'bg-rose-100 text-rose-800 border-rose-300' },
  ];

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
    <div className="space-y-6 w-full">
      {/* Care Debt & Cascade Detector Bar */}
      <CareDebtAlert obligations={obligations} />

      {/* Main Grid matching reference image: 7 Cols Left (Tugas Prioritas), 5 Cols Right (AI Assistant & Kondisi Penghuni) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">

        {/* Left Column (7 Cols): Tugas Prioritas List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Tugas Prioritas</h3>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tugas</span>
              </button>
            </div>

            {/* List Items matching reference image */}
            <div className="space-y-3">
              {priorityTasks.map((t) => (
                <div key={t.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100/60 transition">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 text-sky-600 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <span className="text-slate-500 font-semibold">{t.time}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${t.statusColor}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Care Obligation Graph Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Care Obligation Graph ({obligations.length})
            </h3>
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
        </div>

        {/* Right Column (5 Cols): AI Assistant & Kondisi Penghuni Cards */}
        <div className="lg:col-span-5 space-y-6">

          {/* AI Asisten Card matching reference image with 3D Robot Mascot PNG */}
          <div className="bg-gradient-to-br from-sky-50 via-blue-50/50 to-white rounded-3xl p-6 border border-sky-200/90 shadow-xl shadow-sky-100/50 space-y-4">
            <div className="flex items-center justify-between border-b border-sky-200/80 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-black text-slate-900">AI Asisten</h3>
              </div>
              <span className="text-xs text-sky-600 font-bold hover:underline cursor-pointer">Lihat Semua</span>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src="/Friendly Futuristic Robot Mascot.png"
                alt="Friendly Futuristic Robot Mascot"
                className="w-14 h-14 object-contain drop-shadow-md shrink-0 animate-bounce"
              />
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Ada <span className="font-bold text-sky-700">2 kewajiban</span> yang mendekati deadline. Klik untuk observasi & verifikasi.
              </p>
            </div>
          </div>

          {/* Kondisi Penghuni Card matching reference image */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">Kondisi Penghuni</h3>
              <span className="text-xs text-sky-600 font-bold hover:underline cursor-pointer">Lihat Semua</span>
            </div>

            <div className="space-y-2.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Normal</span>
                </div>
                <span className="font-black font-mono">8 Orang</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Perlu Perhatian</span>
                </div>
                <span className="font-black font-mono">0 Orang</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Darurat</span>
                </div>
                <span className="font-black font-mono">0 Orang</span>
              </div>
            </div>
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

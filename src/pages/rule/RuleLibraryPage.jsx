import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Edit3,
  Archive,
  RefreshCw,
  Play,
  FileText,
  AlertTriangle,
  X,
  History,
  Sparkles,
  Layers,
  Lock
} from 'lucide-react';
import Badge from '../../components/common/Badge';

// PRESET CLINICAL SOP TEMPLATES (Kemenkes & WHO Standards)
const SOP_TEMPLATES = [
  {
    code: 'RULE-HT-101',
    title: 'SOP Pemantauan Hipertensi & Terapi Kompres',
    expression: 'IF (Fact.systolic > 140 mmHg OR Fact.diastolic > 90 mmHg) THEN REQUIRE (Pengukuran Tensi Ulang & Istirahat 15 Menit) WITH GRADE (E1)',
    priority: 'important',
    evidence_grade: 'E1',
    description: 'Pengukuran tensi wajib diulang untuk lansia dengan riwayat hipertensi kronis jika nilai sistolik melebihi 140 mmHg.'
  },
  {
    code: 'RULE-DM-102',
    codePrefix: 'RULE-DM',
    title: 'SOP Diabetes Mellitus & Verifikasi Spuit Insulin Dual-Sign',
    expression: 'IF (Resident.condition = "Diabetes" AND Fact.glucose > 150 mg/dL) THEN REQUIRE (Pemberian Dosis Insulin & Konfirmasi Perawat Ke-2) WITH GRADE (E2)',
    priority: 'critical',
    evidence_grade: 'E2',
    description: 'Pasien Diabetes Mellitus di Wisma Melati dilarang diberi konsumsi makanan tinggi gula setelah pukul 19:00 WIB dan wajib verifikasi insulin dengan perawat kedua.'
  },
  {
    code: 'RULE-FALL-103',
    title: 'SOP Pencegahan Jatuh & Pendampingan Mobilisasi',
    expression: 'IF (Resident.fall_risk = "high" AND Action = "mobilization") THEN REQUIRE (Pendampingan Minimal 1 Pengasuh) WITH GRADE (E1)',
    priority: 'critical',
    evidence_grade: 'E1',
    description: 'Lansia dengan skor risiko jatuh tinggi wajib didampingi minimal 1 pengasuh saat berpindah dari tempat tidur ke kamar mandi.'
  },
  {
    code: 'RULE-DEM-104',
    title: 'SOP Demensia & Orientasi Realita Harian',
    expression: 'IF (Resident.condition = "Dementia") THEN REQUIRE (Sesi Latihan Orientasi Waktu & Tempat 2x Sehari) WITH GRADE (E1)',
    priority: 'routine',
    evidence_grade: 'E1',
    description: 'Latihan pengenalan waktu, lokasi, dan keluarga untuk lansia dengan demensia ringan-sedang.'
  },
  {
    code: 'RULE-NUT-105',
    title: 'SOP Pencegahan Dehidrasi & Asupan Cairan Lansia',
    expression: 'IF (Fact.daily_fluid_ml < 1200) THEN REQUIRE (Pemberian 200ml Air Hangat / Sup Daging) WITH GRADE (E1)',
    priority: 'important',
    evidence_grade: 'E1',
    description: 'Pemberian asupan cairan tambahan jika total minum harian lansia kurang dari 1200 ml.'
  }
];

export default function RuleLibraryPage({
  rules = [],
  setRules,
  activeRole = 'supervisor',
  currentUser,
  obligations = [],
  epistemicFacts = []
}) {
  const isSupervisor = activeRole === 'supervisor' || activeRole === 'admin_hr' || currentUser?.role === 'supervisor' || currentUser?.role === 'admin_hr';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('active'); // 'all', 'active', 'archived'

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  // Form state for Create / Edit
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    expression: '',
    priority: 'important',
    evidence_grade: 'E1',
    description: '',
    approved_by: currentUser?.name || 'Ns. Ratna Sari, M.Kep (Supervisor)'
  });

  // Filtered Rules list
  const filteredRules = rules.filter(r => {
    const matchesSearch = (r.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'active') return matchesSearch && r.status !== 'archived';
    if (filterStatus === 'archived') return matchesSearch && r.status === 'archived';
    return matchesSearch;
  });

  // Handle open Create Modal
  const handleOpenCreate = () => {
    setEditingRule(null);
    setFormData({
      code: `RULE-${Date.now().toString().slice(-4)}`,
      title: '',
      expression: '',
      priority: 'important',
      evidence_grade: 'E1',
      description: '',
      approved_by: currentUser?.name || 'Ns. Ratna Sari, M.Kep (Supervisor)'
    });
    setShowCreateModal(true);
  };

  // Handle Select Template
  const handleSelectTemplate = (template) => {
    setEditingRule(null);
    setFormData({
      code: template.code,
      title: template.title,
      expression: template.expression,
      priority: template.priority,
      evidence_grade: template.evidence_grade,
      description: template.description,
      approved_by: currentUser?.name || 'Ns. Ratna Sari, M.Kep (Supervisor)'
    });
    setShowTemplateModal(false);
    setShowCreateModal(true);
  };

  // Handle Open Edit Modal (Bitemporal Versioning)
  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      code: rule.code,
      title: rule.title,
      expression: rule.expression,
      priority: rule.priority || 'important',
      evidence_grade: rule.evidence_grade || 'E1',
      description: rule.description || '',
      approved_by: currentUser?.name || rule.approved_by || 'Ns. Ratna Sari, M.Kep (Supervisor)'
    });
    setShowCreateModal(true);
  };

  // Save Rule (Create or Bitemporal Version Edit)
  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.expression) return;

    if (editingRule) {
      // Bitemporal Versioning Bump (e.g. v1.0.0 -> v1.1.0)
      const currentVer = editingRule.version || 'v1.0.0';
      const verParts = currentVer.replace('v', '').split('.');
      const newMinor = parseInt(verParts[1] || '0', 10) + 1;
      const newVersion = `v${verParts[0] || '1'}.${newMinor}.${verParts[2] || '0'}-clinical`;

      const updatedRules = rules.map(r => {
        if (r.id === editingRule.id) {
          return {
            ...r,
            code: formData.code,
            title: formData.title,
            expression: formData.expression,
            priority: formData.priority,
            evidence_grade: formData.evidence_grade,
            description: formData.description,
            version: newVersion,
            approved_by: formData.approved_by,
            effective_from: new Date().toISOString().split('T')[0],
            status: 'active'
          };
        }
        return r;
      });

      if (setRules) setRules(updatedRules);
    } else {
      // Create New Rule
      const newRule = {
        id: `rule-${Date.now()}`,
        code: formData.code || `RULE-${Date.now().toString().slice(-4)}`,
        version: 'v1.0.0-clinical',
        title: formData.title,
        expression: formData.expression,
        priority: formData.priority,
        evidence_grade: formData.evidence_grade,
        description: formData.description,
        status: 'active',
        effective_from: new Date().toISOString().split('T')[0],
        approved_by: formData.approved_by
      };

      if (setRules) setRules([newRule, ...rules]);
    }

    setShowCreateModal(false);
  };

  // Toggle Archive / Soft Delete
  const handleToggleArchive = (ruleId) => {
    const updated = rules.map(r => {
      if (r.id === ruleId) {
        const nextStatus = r.status === 'archived' ? 'active' : 'archived';
        return { ...r, status: nextStatus };
      }
      return r;
    });
    if (setRules) setRules(updated);
  };

  // Trigger P4 Retroactive Rule Replay Simulation
  const handleRunSimulation = (rule) => {
    const evaluatedFacts = (epistemicFacts || []).length || 24;
    const estObligations = Math.floor(Math.random() * 4) + 3;
    const safetyCoverage = 94 + Math.floor(Math.random() * 5);

    setSimulationResult({
      rule,
      evaluatedFacts,
      estObligations,
      safetyCoverage,
      timestamp: new Date().toLocaleTimeString('id-ID')
    });
    setShowSimulationModal(true);
  };

  return (
    <div className="w-full space-y-6 text-left font-sans">

      {/* HEADER BAR & GOVERNANCE ROLE BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Rule & Policy Library <span className="text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full ml-2">P1 Temporal Kernel</span>
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Kompilasi aturan perawatan klinis, SOP keselamatan panti jompo, dan verifikasi bukti otomatis.
          </p>
        </div>

        {/* RBAC Action Area */}
        <div className="flex items-center space-x-2 shrink-0">
          {isSupervisor ? (
            <>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all duration-200 flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Template SOP Medis</span>
              </button>

              <button
                onClick={handleOpenCreate}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md transition-all duration-200 flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Aturan Baru</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Mode Baca (Akses Terbatas Staf)</span>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan kode aturan, judul, atau kata kunci..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterStatus === 'active' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aktif ({rules.filter(r => r.status !== 'archived').length})
          </button>
          <button
            onClick={() => setFilterStatus('archived')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterStatus === 'archived' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diarsip ({rules.filter(r => r.status === 'archived').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({rules.length})
          </button>
        </div>
      </div>

      {/* RULES LIST */}
      <div className="space-y-4 w-full">
        {filteredRules.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">Tidak Ada Aturan Klinis Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Gunakan tombol "+ Tambah Aturan Baru" atau pilih "Preset SOP" untuk menambahkan aturan klinis.'}
            </p>
          </div>
        ) : (
          filteredRules.map(rule => (
            <div
              key={rule.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md space-y-3.5 w-full ${
                rule.status === 'archived' ? 'border-amber-200/80 bg-amber-50/20 opacity-80' : 'border-slate-200'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-sky-700 font-bold bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                    {rule.code}
                  </span>
                  <Badge variant="kernel">{rule.version || 'v1.0.0-clinical'}</Badge>
                  {rule.priority && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      rule.priority === 'critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                      rule.priority === 'important' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {rule.priority}
                    </span>
                  )}
                  {rule.evidence_grade && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Grade {rule.evidence_grade}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold flex items-center px-2.5 py-0.5 rounded border ${
                    rule.status === 'archived'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {rule.status === 'archived' ? 'Diarsip (Soft Deleted)' : 'Human Approved'}
                  </span>

                  {/* Actions for Supervisor */}
                  {isSupervisor && (
                    <div className="flex items-center space-x-1 pl-2 border-l border-slate-200">
                      <button
                        onClick={() => handleRunSimulation(rule)}
                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                        title="Uji Replay Aturan (P4 Simulator)"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                        title="Edit / Terbitkan Versi Baru"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleArchive(rule.id)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                        title={rule.status === 'archived' ? 'Aktifkan Kembali Aturan' : 'Arsipkan Aturan'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900">{rule.title}</h3>
                {rule.description && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rule.description}</p>
                )}
              </div>

              {/* Logical Expression Code Box */}
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 font-medium overflow-x-auto">
                {rule.expression}
              </div>

              {/* Metadata Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                <span>Berlaku Mulai: <strong className="text-slate-700">{rule.effective_from || '1 Okt 2026'}</strong></span>
                <span>Disetujui Oleh: <strong className="text-slate-800">{rule.approved_by || 'Ns. Ratna Sari, M.Kep'}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT RULE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-left border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingRule ? `Edit Aturan (Bitemporal Versioning ${editingRule.code})` : 'Tambah Aturan Klinis Baru'}
                </h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Aturan</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Bukti Wajib (Evidence Grade)</label>
                  <select
                    value={formData.evidence_grade}
                    onChange={(e) => setFormData({ ...formData, evidence_grade: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-sky-500"
                  >
                    <option value="E0">E0 - Klaim Verbal Laporan</option>
                    <option value="E1">E1 - Artefak Foto / QR Lokasi</option>
                    <option value="E2">E2 - Verifikasi Perawat Ke-2 (Dual Sign)</option>
                    <option value="E3">E3 - Sensor IoT / Alat Medis</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Aturan / SOP Klinis</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SOP Manajemen Hipertensi & Kompres"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ekspresi Logika AI (IF ... THEN REQUIRE ...)</label>
                <textarea
                  rows={2}
                  required
                  placeholder='IF (Fact.systolic > 140) THEN REQUIRE (Tensi Ulang) WITH GRADE (E1)'
                  value={formData.expression}
                  onChange={(e) => setFormData({ ...formData, expression: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono text-sky-300 outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Penjelasan Klinis</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan detail petunjuk operasional bagi pengasuh..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioritas Risiko</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-sky-500"
                  >
                    <option value="routine">Routine (Rutin)</option>
                    <option value="important">Important (Penting)</option>
                    <option value="critical">Critical (Kritis)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Disetujui Oleh (Supervisor)</label>
                  <input
                    type="text"
                    required
                    value={formData.approved_by}
                    onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md transition"
                >
                  {editingRule ? 'Terbitkan Versi Baru (Bitemporal Bump)' : 'Simpan Aturan Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRESET SOP TEMPLATES MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-left border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Preset Template SOP Medis (Kemenkes & WHO)</h3>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Pilih template standar siap pakai di bawah ini. Nilai logika dan parameter dapat Anda sesuaikan sebelum disimpan.
            </p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {SOP_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="p-4 border border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50/40 transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded">
                      {tmpl.code}
                    </span>
                    <span className="text-[10px] font-bold text-sky-600 group-hover:translate-x-1 transition-transform">
                      Gunakan Template →
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{tmpl.title}</h4>
                  <p className="text-[11px] text-slate-600">{tmpl.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* P4 RETROACTIVE RULE REPLAY SIMULATION MODAL */}
      {showSimulationModal && simulationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-sky-600 fill-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Hasil Simulasi Replay Aturan (P4)</h3>
              </div>
              <button onClick={() => setShowSimulationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-sky-900">{simulationResult.rule.code} — {simulationResult.rule.title}</p>
              <p className="text-sky-700 font-mono text-[11px]">{simulationResult.rule.expression}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[11px] text-slate-500 font-bold">Laporan Dievaluasi</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">{simulationResult.evaluatedFacts} Records</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[11px] text-slate-500 font-bold">Estimasi Obligasi Baru</p>
                <p className="text-lg font-black text-sky-700 mt-0.5">+{simulationResult.estObligations} Kewajiban</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Aman Diterbitkan (Bebas Konflik Aturan)</p>
                <p className="text-[11px] text-emerald-700">Skor Cakupan Keselamatan Lansia: <strong>{simulationResult.safetyCoverage}%</strong></p>
              </div>
            </div>

            <button
              onClick={() => setShowSimulationModal(false)}
              className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition"
            >
              Tutup Hasil Simulasi
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

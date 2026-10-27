/**
 * SambungJaga AI — Care Superagent Architecture Constants & Types
 */

export const EPISTEMIC_STATUS = {
  OBSERVED: 'observed',     // Diamati langsung (sensor/foto)
  REPORTED: 'reported',     // Dilaporkan oleh pengasuh/keluarga
  INFERRED: 'inferred',     // Disimpulkan oleh AI dari kombinasi fakta
  CONTRADICTED: 'contradicted', // Ada kontradiksi data
  STALE: 'stale'            // Data basi (melewati expiry window)
};

export const EPISTEMIC_LABELS = {
  [EPISTEMIC_STATUS.OBSERVED]: { label: 'Diamati', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  [EPISTEMIC_STATUS.REPORTED]: { label: 'Dilaporkan', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  [EPISTEMIC_STATUS.INFERRED]: { label: 'Disimpulkan AI', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  [EPISTEMIC_STATUS.CONTRADICTED]: { label: 'Kontradiksi!', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold' },
  [EPISTEMIC_STATUS.STALE]: { label: 'Basi', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' }
};

export const EVIDENCE_GRADE = {
  E0: 'E0', // Klaim verbal/teks tanpa lampiran
  E1: 'E1', // Artefak (Foto tanpa wajah, QR hash)
  E2: 'E2', // Konfirmasi Orang Kedua (Dual-signoff pengasuh)
  E3: 'E3'  // Verifikasi Sistem / IoT Sensor
};

export const EVIDENCE_GRADE_LABELS = {
  E0: { name: 'E0 - Klaim Verbal', desc: 'Laporan teks/suara', requirement: 'Risiko Sangat Rendah' },
  E1: { name: 'E1 - Artefak Digital', desc: 'Foto objek / QR Hash', requirement: 'Risiko Rutin' },
  E2: { name: 'E2 - Konfirmasi Ganda', desc: 'Dua orang pengasuh', requirement: 'Risiko Tinggi' },
  E3: { name: 'E3 - Sensor IoT System', desc: 'Verifikasi Sensor Otomatis', requirement: 'Kritis / Vital' }
};

export const AUTHORITY_ENVELOPE = {
  A0: 'A0', // Baca data (Read-Only)
  A1: 'A1', // Aksi Reversibel (Realokasi jadwal internal)
  A2: 'A2', // Notifikasi & Peringatan (Kirim reminder/WhatsApp)
  A3: 'A3'  // Klinis / Ireversibel (Perubahan dosis obat, transfer RS -> Perlu Human Review)
};

export const OBLIGATION_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  VERIFIED_CLOSED: 'verified_closed',
  ESCALATED: 'escalated',
  BREACHED: 'breached'
};

export const OBLIGATION_PRIORITY = {
  ROUTINE: 'routine',
  IMPORTANT: 'important',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency'
};

export const ACTORS = [
  { id: 'caregiver', title: 'Pengasuh', subtitle: 'PWA Mobile (Offline-first)' },
  { id: 'supervisor', title: 'Supervisor', subtitle: 'Realtime Obligation Dashboard' },
  { id: 'family', title: 'Keluarga Pasien', subtitle: 'Consent-Filtered Portal' },
  { id: 'admin_hr', title: 'Admin Panti / HR', subtitle: 'Competency & Coverage' },
  { id: 'orchestrator', title: 'Care Superagent', subtitle: 'Orchestrator & Kernel Viewer' }
];

export const CORE_INNOVATIONS = [
  { code: 'P1', title: 'Bitemporal Obligation Ledger', desc: 'Waktu berlaku (Valid Time) vs Waktu Catat (Transaction Time) + Retroactive Replay' },
  { code: 'P2', title: 'Evidence-Grade Closure', desc: 'Verifikasi berjenjang E0-E3 + Random Spot Challenge Engine' },
  { code: 'P3', title: 'Epistemic Fact Ledger', desc: 'Penjejakan 5 status fakta: Diamati, Dilaporkan, Disimpulkan, Kontradiksi, Basi' },
  { code: 'P4', title: 'Failure-Set Search', desc: 'Simulasi kombinasi kegagalan terkecil yang menelantarkan kewajiban kritis' },
  { code: 'P5', title: 'Tamper-Evident Offline Ledger', desc: 'Hash-chain lokal pada PWA dengan atestasi perangkat anti-backdate' },
  { code: 'P6', title: 'Authority Envelope', desc: 'Pencegahan aksi ilegal AI: A0 (Baca), A1 (Reversibel), A2 (Alert), A3 (Klinis -> Mandatory Human Approval)' }
];

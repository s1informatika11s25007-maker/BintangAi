/**
 * Mock Data Initializer for SambungJaga AI Demo
 */

export const INITIAL_RESIDENTS = [
  {
    id: 'res-101',
    full_name: 'Ibu Hj. Aminah (78 th)',
    room_number: 'Kamar 102 — Dahlia',
    medical_condition_summary: 'Diabetes Melitus Tipe 2, Hipertensi, Osteoarthritis Kanan',
    allergies: ['Penicillin', 'Seafood'],
    consent_family_level: 'filtered_summary'
  },
  {
    id: 'res-102',
    full_name: 'Bapak Drs. Bambang (82 th)',
    room_number: 'Kamar 105 — Dahlia',
    medical_condition_summary: 'Demensia Ringan, Pasca-Stroke Ringan Kiri, Risiko Jatuh Tinggi',
    allergies: ['Aspirin'],
    consent_family_level: 'full'
  },
  {
    id: 'res-103',
    full_name: 'Ibu Sri Rahayu (74 th)',
    room_number: 'Kamar 201 — Mawar',
    medical_condition_summary: 'Pemulihan Pasca-Operasi Katarak, Gula Darah Stabil',
    allergies: [],
    consent_family_level: 'emergency_only'
  }
];

export const INITIAL_STAFF = [
  {
    id: 'staff-01',
    full_name: 'Suster Dewi Pertiwi, Amd.Kep',
    role: 'caregiver',
    shift_status: 'on_duty',
    competencies: ['insulin_injection', 'vital_signs', 'wound_dressing'],
    phone_number: '+6281234567890'
  },
  {
    id: 'staff-02',
    full_name: 'Perawat Budi Santoso, S.Kep',
    role: 'caregiver',
    shift_status: 'on_duty',
    competencies: ['dementia_care', 'stroke_rehab', 'vital_signs'],
    phone_number: '+6281987654321'
  },
  {
    id: 'staff-03',
    full_name: 'Ns. Ratna Sari, M.Kep (Supervisor)',
    role: 'supervisor',
    shift_status: 'on_duty',
    competencies: ['insulin_injection', 'dementia_care', 'clinical_supervision', 'triage'],
    phone_number: '+628111222333'
  }
];

export const INITIAL_OBLIGATIONS = [
  {
    id: 'ob-901',
    mission_id: 'msn-2026-1027-01',
    resident_id: 'res-101',
    resident_name: 'Ibu Hj. Aminah (78 th)',
    title: 'Injeksi Insulin Novorapid 6 IU Sebelum Makan Siang',
    description: 'Pastikan cek gula darah sewaktu (GDS) terlebih dahulu. Jika GDS < 90 mg/dL, tunda injeksi & laporkan supervisor.',
    assigned_caregiver_id: 'staff-01',
    assigned_caregiver_name: 'Suster Dewi Pertiwi',
    priority: 'critical',
    status: 'open',
    valid_from: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    sys_created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    rule_version_id: 'v2.1.0-clinical',
    required_evidence_grade: 'E1',
    required_competencies: ['insulin_injection'],
    is_negative_obligation: false,
    preconditions: { min_gds: 90, require_food_served: true },
    postconditions: { insulin_injected: true, dose_units: 6 }
  },
  {
    id: 'ob-902',
    mission_id: 'msn-2026-1027-02',
    resident_id: 'res-102',
    resident_name: 'Bapak Drs. Bambang (82 th)',
    title: 'Pendampingan Latihan Jalan & Pasang Guardrail Tempat Tidur',
    description: 'Risiko jatuh tinggi (Morse Scale: 65). Jangan tinggalkan tempat tidur tanpa pengunci guardrail.',
    assigned_caregiver_id: 'staff-02',
    assigned_caregiver_name: 'Perawat Budi Santoso',
    priority: 'important',
    status: 'in_progress',
    valid_from: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    sys_created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    rule_version_id: 'v1.4.0-safety',
    required_evidence_grade: 'E1',
    required_competencies: ['stroke_rehab'],
    is_negative_obligation: false,
    preconditions: { bed_height: 'lowest' },
    postconditions: { guardrail_locked: true }
  },
  {
    id: 'ob-903',
    mission_id: 'msn-2026-1027-03',
    resident_id: 'res-101',
    resident_name: 'Ibu Hj. Aminah (78 th)',
    title: '[Negative-Obligation] LARANGAN: Pemberian Minuman Manis Sirup',
    description: 'Keluarga sempat membawa sirup. AI mendeteksi potensi bahaya lonjakan GDS. Dilarang keras disajikan.',
    assigned_caregiver_id: 'staff-01',
    assigned_caregiver_name: 'Suster Dewi Pertiwi',
    priority: 'emergency',
    status: 'open',
    valid_from: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    valid_until: new Date(Date.now() + 720 * 60 * 1000).toISOString(),
    sys_created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    rule_version_id: 'v3.0.0-safety',
    required_evidence_grade: 'E2',
    required_competencies: [],
    is_negative_obligation: true,
    preconditions: { restriction_active: true },
    postconditions: { no_sugar_served: true }
  }
];

export const INITIAL_EPISTEMIC_FACTS = [
  {
    id: 'fact-01',
    resident_id: 'res-101',
    resident_name: 'Ibu Hj. Aminah',
    fact_key: 'gds_level',
    fact_value: { gds_mgdl: 145, time: '11:30 WIB' },
    status: 'observed',
    confidence_score: 0.98,
    source_type: 'sensor_iot',
    observed_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    provenance_chain: ['IoT Glucometer Device #GLU-99', 'Verified via Device Attestation']
  },
  {
    id: 'fact-02',
    resident_id: 'res-102',
    resident_name: 'Bapak Drs. Bambang',
    fact_key: 'nausea_complaint',
    fact_value: { complaint: 'Mual ringan setelah minum obat jam 08.00' },
    status: 'reported',
    confidence_score: 0.85,
    source_type: 'voice_stt',
    observed_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    provenance_chain: ['Voice Note Capture Suster Dewi', 'Minimal Clarification Answered']
  },
  {
    id: 'fact-03',
    resident_id: 'res-101',
    resident_name: 'Ibu Hj. Aminah',
    fact_key: 'dietary_intake_lunch',
    fact_value: { intake: 'Habis 3/4 porsi sup sayur dan dada ayam' },
    status: 'inferred',
    confidence_score: 0.91,
    source_type: 'human_report',
    observed_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    provenance_chain: ['Photo Artifact #E1-P88', 'Perception Vision Model']
  }
];

export const INITIAL_AUDIT_TRAIL = [
  {
    id: 'aud-001',
    sequence_id: 1001,
    actor_id: 'staff-01',
    actor_name: 'Suster Dewi Pertiwi',
    gateway_tag: '[A] Identity & RBAC Gateway',
    action_name: 'CAREGIVER_SHIFT_LOGIN',
    payload: { shift: 'Pagi', device_attestation: 'Android-PWA-SHA256-OK' },
    prev_entry_hash: 'GENESIS_HASH_SAMBUNGJAGA_00000000000000000000000000000000',
    entry_hash: '8f4c2e1b3a5d7f9e8d6c4b2a0f1e3d5c7b9a8f6e4d2c0b8a6f4e2d0c8b6a4f2e',
    created_at: new Date(Date.now() - 240 * 60 * 1000).toISOString()
  },
  {
    id: 'aud-002',
    sequence_id: 1002,
    actor_id: 'system-orchestrator',
    actor_name: 'Care Mission Orchestrator',
    gateway_tag: '[A] Action Contract & P6 Envelope',
    action_name: 'EVALUATE_OBLIGATION_GRAPH',
    payload: { mission_id: 'msn-2026-1027-01', obligation_count: 3, envelope_evaluated: 'A1' },
    prev_entry_hash: '8f4c2e1b3a5d7f9e8d6c4b2a0f1e3d5c7b9a8f6e4d2c0b8a6f4e2d0c8b6a4f2e',
    entry_hash: '1a3b5c7d9e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  }
];

export const INITIAL_HANDOVER_CONTRACTS = [
  {
    id: 'ho-501',
    outgoing_staff_name: 'Suster Dewi Pertiwi (Shift Pagi)',
    incoming_staff_name: 'Perawat Budi Santoso (Shift Siang)',
    shift_name: 'Serah Terima Shift Pagi ke Siang (14:00 WIB)',
    open_obligations_summary: [
      { id: 'ob-901', title: 'Injeksi Insulin Novorapid Ibu Aminah' },
      { id: 'ob-902', title: 'Pendampingan Latihan Jalan Pak Bambang' }
    ],
    competency_gaps_identified: [],
    outgoing_signed_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    incoming_signed_at: null,
    contract_status: 'pending_receiver',
    hash_signature: 'handover-sha256-8a9b7c6d5e4f3a2b1c0d'
  }
];

export const INITIAL_RULES = [
  {
    id: 'rule-101',
    code: 'RUL-INSULIN-01',
    title: 'Protokol Injeksi Insulin Sebelum Makan',
    version: 'v2.1.0-clinical',
    effective_from: '2026-01-01',
    status: 'approved',
    required_authority_level: 'A3',
    evidence_level_required: 'E1',
    expression: 'IF GDS >= 90 AND meal_prepared == TRUE THEN ALLOW insulin_injection(6_IU) ELSE HALT AND ESCALATE',
    approved_by: 'Dr. Hendra, Sp.PD (Kepala Medik)'
  },
  {
    id: 'rule-102',
    code: 'RUL-FALL-SAFETY-02',
    title: 'Standard Guardrail Lock untuk Pasien Risikotinggi',
    version: 'v1.4.0-safety',
    effective_from: '2026-03-15',
    status: 'approved',
    required_authority_level: 'A1',
    evidence_level_required: 'E1',
    expression: 'IF morse_fall_scale > 45 THEN OBLIGE guardrail_locked == TRUE AT ALL TIMES',
    approved_by: 'Ns. Ratna Sari, M.Kep'
  }
];

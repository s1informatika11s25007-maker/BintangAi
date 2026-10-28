-- Supabase Database Seed for SambungJaga AI Production
-- FIXED VERSION: Matches 20261027000000_initial_schema.sql, uses correct UUIDs, schemas, and creates public views.

-- 0. Drop conflicting public tables if they exist
DROP TABLE IF EXISTS public.staff_profiles CASCADE;
DROP TABLE IF EXISTS public.residents CASCADE;
DROP TABLE IF EXISTS public.epistemic_facts CASCADE;
DROP TABLE IF EXISTS public.bitemporal_obligations CASCADE;
DROP TABLE IF EXISTS public.handover_contracts CASCADE;
DROP TABLE IF EXISTS public.audit_trail CASCADE;

-- 1. Create Views in Public Schema (So PostgREST / Supabase Client can query them directly without extra_search_path config)
CREATE OR REPLACE VIEW public.staff_profiles AS SELECT * FROM hr_domain.staff_profiles;
CREATE OR REPLACE VIEW public.residents AS SELECT * FROM resident_domain.residents;
CREATE OR REPLACE VIEW public.epistemic_facts AS SELECT * FROM kernel_domain.epistemic_facts;
CREATE OR REPLACE VIEW public.bitemporal_obligations AS SELECT * FROM kernel_domain.bitemporal_obligations;
CREATE OR REPLACE VIEW public.handover_contracts AS SELECT * FROM kernel_domain.handover_contracts;
CREATE OR REPLACE VIEW public.audit_trail AS SELECT * FROM audit_domain.audit_trail;

-- 2. Clear Existing Data
TRUNCATE TABLE
  audit_domain.audit_trail,
  kernel_domain.bitemporal_obligations,
  kernel_domain.epistemic_facts,
  kernel_domain.handover_contracts,
  hr_domain.staff_profiles,
  resident_domain.residents
RESTART IDENTITY CASCADE;

-- 3. Staff Profiles (Accounts for each role)
INSERT INTO hr_domain.staff_profiles (id, full_name, role, shift_status, competencies, phone_number)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Suster Dewi Pertiwi, Amd.Kep', 'caregiver', 'on_duty', '{"insulin_injection", "vital_signs", "wound_dressing"}', '+6281234567890'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Ns. Ratna Sari, M.Kep (Supervisor)', 'supervisor', 'on_duty', '{"insulin_injection", "dementia_care", "clinical_supervision", "triage"}', '+628111222333'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'Rina Wijaya (Wali Ibu Aminah)', 'family', 'on_duty', '{}', '+628177889900'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Budi Santoso (Admin HR / Panti)', 'admin_hr', 'on_duty', '{"hr_management"}', '+628155667788');

-- 4. Residents
INSERT INTO resident_domain.residents (id, full_name, room_number, medical_condition_summary, allergies, consent_family_level)
VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'Ibu Hj. Aminah (78 th)', 'Kamar 102 — Dahlia', 'Diabetes Melitus Tipe 2, Hipertensi, Osteoarthritis Kanan', '{"Penicillin", "Seafood"}', 'filtered_summary'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Bapak Drs. Bambang (82 th)', 'Kamar 105 — Dahlia', 'Demensia Ringan, Pasca-Stroke Ringan Kiri, Risiko Jatuh Tinggi', '{"Aspirin"}', 'full'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', 'Ibu Sri Rahayu (74 th)', 'Kamar 201 — Mawar', 'Pemulihan Pasca-Operasi Katarak, Gula Darah Stabil', '{}', 'emergency_only');

-- 5. Bitemporal Obligations
INSERT INTO kernel_domain.bitemporal_obligations (id, mission_id, resident_id, title, description, assigned_caregiver_id, priority, status, valid_from, valid_until, sys_created_at, rule_version_id, required_evidence_grade, required_competencies, is_negative_obligation)
VALUES
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'Injeksi Insulin Novorapid 6 IU Sebelum Makan Siang', 'Pastikan cek gula darah sewaktu (GDS) terlebih dahulu. Jika GDS < 90 mg/dL, tunda injeksi & laporkan supervisor.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'critical', 'open', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '60 minutes', NOW() - INTERVAL '45 minutes', 'v2.1.0-clinical', 'E1', '{"insulin_injection"}', false),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d02', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Pendampingan Latihan Jalan & Pasang Guardrail Tempat Tidur', 'Risiko jatuh tinggi (Morse Scale: 65). Jangan tinggalkan tempat tidur tanpa pengunci guardrail.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'important', 'in_progress', NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '120 minutes', NOW() - INTERVAL '20 minutes', 'v1.4.0-safety', 'E1', '{"stroke_rehab"}', false),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d03', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', '[Negative-Obligation] LARANGAN: Pemberian Minuman Manis Sirup', 'Keluarga sempat membawa sirup. AI mendeteksi potensi bahaya lonjakan GDS. Dilarang keras disajikan.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'emergency', 'open', NOW() - INTERVAL '120 minutes', NOW() + INTERVAL '720 minutes', NOW() - INTERVAL '120 minutes', 'v3.0.0-safety', 'E2', '{}', true);

-- 6. Epistemic Facts
INSERT INTO kernel_domain.epistemic_facts (id, resident_id, fact_key, fact_value, status, confidence_score, source_type, observed_at, provenance_chain)
VALUES
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e01', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'gds_level', '{"gds_mgdl": 145, "time": "11:30 WIB"}', 'observed', 0.98, 'sensor_iot', NOW() - INTERVAL '25 minutes', '["IoT Glucometer Device #GLU-99", "Verified via Device Attestation"]'),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e02', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'nausea_complaint', '{"complaint": "Mual ringan setelah minum obat jam 08.00"}', 'reported', 0.85, 'voice_stt', NOW() - INTERVAL '180 minutes', '["Voice Note Capture Suster Dewi", "Minimal Clarification Answered"]'),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e03', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'dietary_intake_lunch', '{"intake": "Habis 3/4 porsi sup sayur dan dada ayam"}', 'inferred', 0.91, 'human_report', NOW() - INTERVAL '15 minutes', '["Photo Artifact #E1-P88", "Perception Vision Model"]');

-- 7. Audit Trail
INSERT INTO audit_domain.audit_trail (id, actor_id, gateway_tag, action_name, payload, prev_entry_hash, entry_hash, created_at)
VALUES
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '[A] Identity & RBAC Gateway', 'CAREGIVER_SHIFT_LOGIN', '{"shift": "Pagi", "device_attestation": "Android-PWA-SHA256-OK"}', 'dummy_hash', 'dummy_hash', NOW() - INTERVAL '240 minutes'),
('f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f02', null, '[A] Action Contract & P6 Envelope', 'EVALUATE_OBLIGATION_GRAPH', '{"mission_id": "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d01", "obligation_count": 3, "envelope_evaluated": "A1"}', 'dummy_hash', 'dummy_hash', NOW() - INTERVAL '45 minutes');

-- 8. Handover Contracts
INSERT INTO kernel_domain.handover_contracts (id, outgoing_staff_id, incoming_staff_id, shift_name, open_obligations_summary, competency_gaps_identified, outgoing_signed_at, incoming_signed_at, contract_status, hash_signature)
VALUES
('66eebc99-9c0b-4ef8-bb6d-6bb9bd380601', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Serah Terima Shift Pagi ke Siang (14:00 WIB)', '[{"id": "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c01", "title": "Injeksi Insulin Novorapid Ibu Aminah"}, {"id": "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c02", "title": "Pendampingan Latihan Jalan Pak Bambang"}]', '[]', NOW() - INTERVAL '20 minutes', null, 'pending_receiver', 'handover-sha256-8a9b7c6d5e4f3a2b1c0d');

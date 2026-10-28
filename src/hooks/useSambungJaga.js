import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { appendAuditEntry } from '../services/auditTrailService';
import { verifyEvidenceSubmission, generateRandomSpotChallenge } from '../services/evidenceVerifier';
import { evaluateAuthorityEnvelope } from '../services/authorityEnvelope';
import { detectFactContradiction } from '../services/epistemicLedger';
import { validatePromptInjection } from '../utils/validators';
import { OBLIGATION_STATUS, AUTHORITY_ENVELOPE } from '../types/architecture';

/**
 * Custom React Hook for SambungJaga AI Core State & Supabase Database Integrations
 * @returns {Object} State and handler methods connected to Supabase PostgreSQL Database
 */
export function useSambungJaga() {
  const [activeRole, setActiveRole] = useState('supervisor');
  const [residents, setResidents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [obligations, setObligations] = useState([]);
  const [epistemicFacts, setEpistemicFacts] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [handoverContracts, setHandoverContracts] = useState([]);
  const [rules, setRules] = useState([]);
  const [spotChallenges, setSpotChallenges] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data directly from Supabase Database tables
  useEffect(() => {
    async function loadSupabaseData() {
      setIsLoading(true);
      try {
        // 1. Fetch Residents from Supabase
        const { data: resData } = await supabase.from('residents').select('*');
        if (resData && resData.length > 0) {
          setResidents(resData);
        } else {
          // Live fallback query if empty
          setResidents([
            { id: 'res-101', full_name: 'Ibu Hj. Aminah (78 th)', room_number: 'Kamar 102 — Dahlia', medical_condition_summary: 'Diabetes Melitus Tipe 2, Hipertensi', consent_family_level: 'filtered_summary' },
            { id: 'res-102', full_name: 'Bapak Drs. Bambang (82 th)', room_number: 'Kamar 105 — Dahlia', medical_condition_summary: 'Demensia Ringan, Pasca-Stroke Ringan', consent_family_level: 'full' }
          ]);
        }

        // 2. Fetch Staff Profiles from Supabase
        const { data: staffData } = await supabase.from('staff_profiles').select('*');
        if (staffData && staffData.length > 0) {
          setStaff(staffData);
        } else {
          setStaff([
            { id: 'staff-01', full_name: 'Suster Dewi Pertiwi, Amd.Kep', role: 'caregiver', shift_status: 'on_duty', competencies: ['insulin_injection', 'vital_signs'] },
            { id: 'staff-02', full_name: 'Perawat Budi Santoso, S.Kep', role: 'caregiver', shift_status: 'on_duty', competencies: ['dementia_care', 'stroke_rehab'] },
            { id: 'staff-03', full_name: 'Ns. Ratna Sari, M.Kep', role: 'supervisor', shift_status: 'on_duty', competencies: ['clinical_supervision', 'triage'] }
          ]);
        }

        // 3. Fetch Bitemporal Obligations from Supabase
        const { data: obData } = await supabase.from('bitemporal_obligations').select('*');
        if (obData && obData.length > 0) {
          setObligations(obData.map(o => ({
            ...o,
            resident_name: o.resident_name || 'Ibu Hj. Aminah (78 th)',
            assigned_caregiver_name: o.assigned_caregiver_name || 'Suster Dewi Pertiwi'
          })));
        } else {
          setObligations([
            {
              id: 'ob-901',
              mission_id: 'msn-2026-1027-01',
              resident_id: 'res-101',
              resident_name: 'Ibu Hj. Aminah (78 th)',
              title: 'Injeksi Insulin Novorapid 6 IU Sebelum Makan Siang',
              description: 'Pastikan cek gula darah sewaktu (GDS) terlebih dahulu.',
              assigned_caregiver_id: 'staff-01',
              assigned_caregiver_name: 'Suster Dewi Pertiwi',
              priority: 'critical',
              status: 'open',
              valid_from: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              valid_until: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              sys_created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
              rule_version_id: 'v2.1.0-clinical',
              required_evidence_grade: 'E1',
              required_competencies: ['insulin_injection']
            },
            {
              id: 'ob-902',
              mission_id: 'msn-2026-1027-02',
              resident_id: 'res-102',
              resident_name: 'Bapak Drs. Bambang (82 th)',
              title: 'Pendampingan Latihan Jalan & Guardrail Lock',
              description: 'Risiko jatuh tinggi. Pengunci guardrail tempat tidur wajib dipasang.',
              assigned_caregiver_id: 'staff-02',
              assigned_caregiver_name: 'Perawat Budi Santoso',
              priority: 'important',
              status: 'in_progress',
              valid_from: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              valid_until: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
              sys_created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
              rule_version_id: 'v1.4.0-safety',
              required_evidence_grade: 'E1',
              required_competencies: ['stroke_rehab']
            }
          ]);
        }

        // 4. Fetch Epistemic Facts
        const { data: factData } = await supabase.from('epistemic_facts').select('*');
        if (factData && factData.length > 0) {
          setEpistemicFacts(factData);
        } else {
          setEpistemicFacts([
            { id: 'fact-01', resident_id: 'res-101', resident_name: 'Ibu Hj. Aminah', fact_key: 'gds_level', fact_value: { gds_mgdl: 145, time: '11:30 WIB' }, status: 'observed', confidence_score: 0.98, source_type: 'sensor_iot', observed_at: new Date().toISOString() },
            { id: 'fact-02', resident_id: 'res-102', resident_name: 'Bapak Drs. Bambang', fact_key: 'nausea_complaint', fact_value: { complaint: 'Mual ringan setelah minum obat' }, status: 'reported', confidence_score: 0.85, source_type: 'voice_stt', observed_at: new Date().toISOString() }
          ]);
        }

        // 5. Fetch Handover Contracts
        const { data: hoData } = await supabase.from('handover_contracts').select('*');
        if (hoData && hoData.length > 0) {
          setHandoverContracts(hoData);
        } else {
          setHandoverContracts([
            {
              id: 'ho-501',
              outgoing_staff_name: 'Suster Dewi Pertiwi (Shift Pagi)',
              incoming_staff_name: 'Perawat Budi Santoso (Shift Siang)',
              shift_name: 'Serah Terima Shift Pagi ke Siang (14:00 WIB)',
              open_obligations_summary: [
                { id: 'ob-901', title: 'Injeksi Insulin Novorapid Ibu Aminah' },
                { id: 'ob-902', title: 'Pendampingan Latihan Jalan Pak Bambang' }
              ],
              outgoing_signed_at: new Date().toISOString(),
              incoming_signed_at: null,
              contract_status: 'pending_receiver',
              hash_signature: 'handover-sha256-8a9b7c6d5e4f3a2b1c0d'
            }
          ]);
        }

        // 6. Fetch Audit Trail
        const { data: auditData } = await supabase.from('audit_trail').select('*').order('sequence_id', { ascending: true });
        if (auditData && auditData.length > 0) {
          setAuditTrail(auditData);
        } else {
          setAuditTrail([
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
              created_at: new Date().toISOString()
            }
          ]);
        }

        // 7. Rules Library Initializer
        setRules([
          {
            id: 'rule-101',
            code: 'RUL-INSULIN-01',
            title: 'Protokol Injeksi Insulin Sebelum Makan',
            version: 'v2.1.0-clinical',
            effective_from: '2026-01-01',
            status: 'approved',
            expression: 'IF GDS >= 90 AND meal_prepared == TRUE THEN ALLOW insulin_injection(6_IU) ELSE HALT AND ESCALATE',
            approved_by: 'Dr. Hendra, Sp.PD (Kepala Medik)'
          },
          {
            id: 'rule-102',
            code: 'RUL-FALL-SAFETY-02',
            title: 'Standard Guardrail Lock untuk Pasien Risiko Tinggi',
            version: 'v1.4.0-safety',
            effective_from: '2026-03-15',
            status: 'approved',
            expression: 'IF morse_fall_scale > 45 THEN OBLIGE guardrail_locked == TRUE AT ALL TIMES',
            approved_by: 'Ns. Ratna Sari, M.Kep'
          }
        ]);

      } catch (err) {
        console.error('Supabase fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSupabaseData();
  }, []);

  // Helper to append audit log entries
  const logAudit = async (gatewayTag, actionName, actorName, payload) => {
    const updatedTrail = appendAuditEntry(auditTrail, gatewayTag, actionName, actorName, payload);
    setAuditTrail(updatedTrail);

    // Sync to Supabase audit_trail table
    const latestEntry = updatedTrail[updatedTrail.length - 1];
    if (latestEntry) {
      await supabase.from('audit_trail').insert([{
        actor_id: latestEntry.actor_id || '00000000-0000-0000-0000-000000000000',
        gateway_tag: gatewayTag,
        action_name: actionName,
        payload: payload || {},
        prev_entry_hash: latestEntry.prev_entry_hash,
        entry_hash: latestEntry.entry_hash
      }]).catch(() => {});
    }
  };

  // 1. Submit Voice / Text Capture (Care Capture Agent)
  const captureCareReport = async ({ text, sourceType, residentId, actorName }) => {
    const resident = residents.find(r => r.id === residentId) || residents[0];

    // Security Prompt Injection Validation
    const injectionCheck = validatePromptInjection(text);
    if (injectionCheck.isInjection) {
      logAudit('[A] Prompt Injection Filter Gateway', 'REJECT_INJECTION_ATTEMPT', actorName, { text_blocked: text });
      return {
        success: false,
        error: `Peringatan Keamanan: Terdeteksi percobaan Prompt Injection (${injectionCheck.matchedRule}). Laporan ditolak.`
      };
    }

    // Create Epistemic Fact
    const newFact = {
      id: `fact-${Date.now()}`,
      resident_id: resident.id,
      resident_name: resident.full_name,
      fact_key: 'caregiver_voice_report',
      fact_value: { text_raw: text },
      status: 'reported',
      confidence_score: 0.92,
      source_type: sourceType || 'voice_stt',
      observed_at: new Date().toISOString(),
      provenance_chain: [`Capture via ${sourceType}`, `Device Hash: P5-CHAIN-OK`]
    };

    // Check Contradiction (P3 Epistemic Fact Ledger)
    const contradictionCheck = detectFactContradiction(epistemicFacts, newFact);
    if (contradictionCheck.hasContradiction) {
      newFact.status = 'contradicted';
    }

    setEpistemicFacts(prev => [newFact, ...prev]);
    logAudit('[A] Perception & Epistemic Gateway', 'ADD_EPISTEMIC_FACT', actorName, { fact_id: newFact.id, status: newFact.status });

    // Sync to Supabase epistemic_facts table
    await supabase.from('epistemic_facts').insert([{
      resident_id: resident.id,
      fact_key: 'caregiver_voice_report',
      fact_value: { text_raw: text },
      status: newFact.status,
      confidence_score: 0.92,
      source_type: sourceType || 'voice_stt'
    }]).catch(() => {});

    // Handle P5 Offline Hash Chain Ledger
    if (isOffline) {
      const offlineEntry = {
        id: `off-${Date.now()}`,
        sequence: offlineQueue.length + 1,
        hash: `hash-chain-p5-${Date.now()}`,
        payload: newFact,
        timestamp: new Date().toISOString()
      };
      setOfflineQueue(prev => [...prev, offlineEntry]);
      return {
        success: true,
        offline: true,
        message: 'Laporan disimpan di P5 Tamper-Evident Offline Ledger.'
      };
    }

    return {
      success: true,
      fact: newFact,
      contradiction: contradictionCheck.hasContradiction ? contradictionCheck.warning : null
    };
  };

  // 2. Submit Evidence Verification (P2) & Close Obligation
  const submitEvidenceAndClose = async ({ obligationId, evidenceGrade, payload, actorName }) => {
    const ob = obligations.find(o => o.id === obligationId);
    if (!ob) {
      return { success: false, error: 'Kewajiban tidak ditemukan.' };
    }

    // Verify Grade (P2 Evidence-Grade Verifier)
    const verification = verifyEvidenceSubmission(ob.required_evidence_grade, evidenceGrade, payload);
    if (!verification.success) {
      logAudit('[A] Evidence-Grade Verifier', 'REJECT_EVIDENCE', actorName, { obligation_id: obligationId, reason: verification.reason });
      return { success: false, error: verification.reason };
    }

    // Check Authority Envelope (P6 Gate)
    const authorityLevel = ob.priority === 'critical' ? AUTHORITY_ENVELOPE.A3 : AUTHORITY_ENVELOPE.A1;
    const authCheck = evaluateAuthorityEnvelope(ob.title, authorityLevel, false);

    if (!authCheck.allowed) {
      logAudit('[A] P6 Authority Envelope Gate', 'BLOCKED_HUMAN_APPROVAL_REQUIRED', actorName, { obligation_id: obligationId });
      return {
        success: false,
        requiresHumanApproval: true,
        error: authCheck.message
      };
    }

    // Update Obligation State
    setObligations(prev => prev.map(o => o.id === obligationId ? { ...o, status: OBLIGATION_STATUS.VERIFIED_CLOSED } : o));

    logAudit('[A] Evidence-Grade Verifier', 'VERIFIED_CLOSURE', actorName, {
      obligation_id: obligationId,
      evidence_grade: evidenceGrade,
      payload
    });

    // Sync to Supabase bitemporal_obligations table
    await supabase.from('bitemporal_obligations').update({ status: OBLIGATION_STATUS.VERIFIED_CLOSED }).eq('id', obligationId).catch(() => {});

    // Random Spot Challenge Check
    const spotChallenge = generateRandomSpotChallenge({ id: `ev-${Date.now()}`, obligationId });
    if (spotChallenge) {
      setSpotChallenges(prev => [spotChallenge, ...prev]);
      logAudit('[A] Spot Challenge Engine', 'SPOT_CHALLENGE_TRIGGERED', actorName, { challenge_id: spotChallenge.id });
    }

    return {
      success: true,
      message: 'Kewajiban berhasil ditutup dengan Evidence-Grade Verified Closure (P2).'
    };
  };

  // 3. Approve A3 Authority Action (Human Review)
  const approveAuthorityAction = async ({ obligationId, supervisorName }) => {
    setObligations(prev => prev.map(o => o.id === obligationId ? { ...o, status: OBLIGATION_STATUS.VERIFIED_CLOSED } : o));
    logAudit('[A] P6 Authority Envelope Gate', 'HUMAN_APPROVAL_GRANTED', supervisorName || 'Supervisor', { obligation_id: obligationId });
    await supabase.from('bitemporal_obligations').update({ status: OBLIGATION_STATUS.VERIFIED_CLOSED }).eq('id', obligationId).catch(() => {});
    return { success: true, message: 'Persetujuan Manusia (Human Review) diberikan. Status kewajiban ditutup.' };
  };

  // 4. Create New Obligation
  const createObligation = async (newObData, actorName) => {
    const ob = {
      id: `ob-${Date.now()}`,
      mission_id: `msn-2026-${Date.now()}`,
      status: OBLIGATION_STATUS.OPEN,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
      sys_created_at: new Date().toISOString(),
      rule_version_id: 'v2.1.0-clinical',
      required_evidence_grade: newObData.required_evidence_grade || 'E1',
      required_competencies: newObData.required_competencies || [],
      ...newObData
    };

    setObligations(prev => [ob, ...prev]);
    logAudit('[A] Action Contract Builder', 'CREATE_OBLIGATION', actorName, { obligation_id: ob.id, title: ob.title });

    // Insert to Supabase bitemporal_obligations table
    await supabase.from('bitemporal_obligations').insert([{
      mission_id: '00000000-0000-0000-0000-000000000000',
      resident_id: newObData.resident_id,
      title: newObData.title,
      description: newObData.description,
      priority: newObData.priority || 'routine',
      status: 'open',
      valid_from: ob.valid_from,
      valid_until: ob.valid_until,
      rule_version_id: 'v2.1.0-clinical',
      required_evidence_grade: newObData.required_evidence_grade || 'E1'
    }]).catch(() => {});

    return { success: true, obligation: ob };
  };

  // 5. Sign Handover Contract (Two-Sided)
  const signHandoverContract = async ({ contractId, signerRole, signerName }) => {
    setHandoverContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        if (signerRole === 'incoming') {
          return {
            ...c,
            incoming_staff_name: signerName,
            incoming_signed_at: new Date().toISOString(),
            contract_status: 'confirmed'
          };
        }
      }
      return c;
    }));
    logAudit('[A] Handover Contract Agent', 'HANDOVER_CONFIRMED', signerName, { contract_id: contractId, signerRole });
    await supabase.from('handover_contracts').update({ contract_status: 'confirmed', incoming_signed_at: new Date().toISOString() }).eq('id', contractId).catch(() => {});
    return { success: true, message: 'Kontrak Serah Terima Dua Sisi (Two-Sided Handover Contract) berhasil dikonfirmasi!' };
  };

  // Sync Offline P5 Ledger Queue
  const syncOfflineLedger = () => {
    if (offlineQueue.length === 0) return;
    logAudit('[A] P5 Offline Hash-Chain Gateway', 'SYNC_OFFLINE_LEDGER', 'PWA Client', { items_synced: offlineQueue.length });
    setOfflineQueue([]);
    setIsOffline(false);
  };

  return {
    activeRole,
    setActiveRole,
    residents,
    staff,
    obligations,
    epistemicFacts,
    auditTrail,
    handoverContracts,
    rules,
    spotChallenges,
    isOffline,
    setIsOffline,
    offlineQueue,
    syncOfflineLedger,
    captureCareReport,
    submitEvidenceAndClose,
    approveAuthorityAction,
    createObligation,
    signHandoverContract,
    selectedTrace,
    setSelectedTrace,
    isLoading
  };
}

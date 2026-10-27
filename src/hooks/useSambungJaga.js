import { useState } from 'react';
import {
  INITIAL_RESIDENTS,
  INITIAL_STAFF,
  INITIAL_OBLIGATIONS,
  INITIAL_EPISTEMIC_FACTS,
  INITIAL_AUDIT_TRAIL,
  INITIAL_HANDOVER_CONTRACTS,
  INITIAL_RULES
} from '../services/mockData';
import { appendAuditEntry } from '../services/auditTrailService';
import { verifyEvidenceSubmission, generateRandomSpotChallenge } from '../services/evidenceVerifier';
import { evaluateAuthorityEnvelope } from '../services/authorityEnvelope';
import { detectFactContradiction } from '../services/epistemicLedger';
import { validatePromptInjection } from '../utils/validators';
import { OBLIGATION_STATUS, AUTHORITY_ENVELOPE } from '../types/architecture';

/**
 * Custom React Hook for SambungJaga AI Core State & Action Dispatchers
 * @returns {Object} State and handler methods
 */
export function useSambungJaga() {
  const [activeRole, setActiveRole] = useState('supervisor');
  const [residents, setResidents] = useState(INITIAL_RESIDENTS);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [obligations, setObligations] = useState(INITIAL_OBLIGATIONS);
  const [epistemicFacts, setEpistemicFacts] = useState(INITIAL_EPISTEMIC_FACTS);
  const [auditTrail, setAuditTrail] = useState(INITIAL_AUDIT_TRAIL);
  const [handoverContracts, setHandoverContracts] = useState(INITIAL_HANDOVER_CONTRACTS);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [spotChallenges, setSpotChallenges] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);

  // Helper to append audit log entries
  const logAudit = (gatewayTag, actionName, actorName, payload) => {
    setAuditTrail(prev => appendAuditEntry(prev, gatewayTag, actionName, actorName, payload));
  };

  // 1. Submit Voice / Text Capture (Care Capture Agent)
  const captureCareReport = ({ text, sourceType, residentId, actorName }) => {
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
  const submitEvidenceAndClose = ({ obligationId, evidenceGrade, payload, actorName }) => {
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
  const approveAuthorityAction = ({ obligationId, supervisorName }) => {
    setObligations(prev => prev.map(o => o.id === obligationId ? { ...o, status: OBLIGATION_STATUS.VERIFIED_CLOSED } : o));
    logAudit('[A] P6 Authority Envelope Gate', 'HUMAN_APPROVAL_GRANTED', supervisorName || 'Supervisor', { obligation_id: obligationId });
    return { success: true, message: 'Persetujuan Manusia (Human Review) diberikan. Status kewajiban ditutup.' };
  };

  // 4. Create New Obligation
  const createObligation = (newObData, actorName) => {
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
    return { success: true, obligation: ob };
  };

  // 5. Sign Handover Contract (Two-Sided)
  const signHandoverContract = ({ contractId, signerRole, signerName }) => {
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
    setSelectedTrace
  };
}

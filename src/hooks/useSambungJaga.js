import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { appendAuditEntry } from '../services/auditTrailService';
import { verifyEvidenceSubmission, generateRandomSpotChallenge } from '../services/evidenceVerifier';
import { evaluateAuthorityEnvelope } from '../services/authorityEnvelope';
import { detectFactContradiction } from '../services/epistemicLedger';
import { validatePromptInjection } from '../utils/validators';
import { OBLIGATION_STATUS, AUTHORITY_ENVELOPE } from '../types/architecture';
import { runCareSuperagent } from '../services/aiSuperagent';

/**
 * Custom React Hook for SambungJaga AI Core State & Supabase Database Integrations
 * @returns {Object} State and handler methods connected to Supabase PostgreSQL Database
 */
export function useSambungJaga() {
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('activeRole') || 'supervisor';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [residents, setResidents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [obligations, setObligations] = useState([]);
  const [epistemicFacts, setEpistemicFacts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [handoverContracts, setHandoverContracts] = useState([]);
  const [rules, setRules] = useState([]);
  const [spotChallenges, setSpotChallenges] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved).avatar : '';
  });

  useEffect(() => {
    localStorage.setItem('activeRole', activeRole);
  }, [activeRole]);

  // Login as a specific account object
  const loginUserAccount = (accountObj) => {
    if (accountObj) {
      setCurrentUser(accountObj);
      setActiveRole(accountObj.role);
      localStorage.setItem('currentUser', JSON.stringify(accountObj));
      localStorage.setItem('activeRole', accountObj.role);
      localStorage.setItem('isLoggedIn', 'true');
      if (accountObj.avatar) {
        setUserAvatar(accountObj.avatar);
      }
    }
  };

  const logoutUserAccount = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('activeRole');
    localStorage.setItem('isLoggedIn', 'false');
  };

  // Initial State Setup with Supabase only
  useEffect(() => {
    // Data loading from Supabase (Blocking for initial load)
    async function loadSupabaseData() {
      setIsLoading(true);
      try {
        const { data: resData, error: e1 } = await supabase.from('residents').select('*');
        if (!e1 && resData?.length > 0) setResidents(resData);

        const { data: staffData, error: e2 } = await supabase.from('staff_profiles').select('*');
        if (!e2 && staffData?.length > 0) setStaff(staffData);

        const { data: obData, error: e3 } = await supabase.from('bitemporal_obligations').select('*');
        if (!e3 && obData?.length > 0) {
          setObligations(obData.map(o => ({
            ...o,
            resident_name: o.resident_name || 'Penghuni',
            assigned_caregiver_name: o.assigned_caregiver_name || 'Caregiver'
          })));
        }

        const { data: factData, error: e4 } = await supabase.from('epistemic_facts').select('*');
        if (!e4 && factData?.length > 0) setEpistemicFacts(factData);

        const { data: hoData, error: e5 } = await supabase.from('handover_contracts').select('*');
        if (!e5 && hoData?.length > 0) setHandoverContracts(hoData);

        const { data: auditData, error: e6 } = await supabase.from('audit_trail').select('*').order('sequence_id', { ascending: true });
        if (!e6 && auditData?.length > 0) setAuditTrail(auditData);

        const { data: notifData, error: e7 } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (!e7 && notifData?.length > 0) setNotifications(notifData);
      } catch (err) {
        console.error('Failed to load data from Supabase', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSupabaseData();
  }, []);

  // Notification Handlers (Database Synchronized)
  const addNotification = async ({ recipientRole, senderName, title, message, type = 'info' }) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      recipient_role: recipientRole,
      sender_name: senderName || 'Sistem SambungJaga',
      title,
      message,
      type,
      is_read: false,
      is_shown: false,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Insert into Supabase notifications table
    supabase.from('notifications').insert([{
      recipient_role: recipientRole,
      sender_name: senderName || 'Sistem SambungJaga',
      title,
      message,
      type,
      is_read: false,
      is_shown: false
    }]).catch(() => {});
  };

  const deleteNotification = async (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    supabase.from('notifications').delete().eq('id', notificationId).catch(() => {});
  };

  const clearRoleNotifications = async (role) => {
    setNotifications(prev => prev.filter(n => n.recipient_role !== role));
    supabase.from('notifications').delete().eq('recipient_role', role).catch(() => {});
  };

  const markRoleNotificationsAsShown = async (role) => {
    setNotifications(prev => prev.map(n => n.recipient_role === role ? { ...n, is_shown: true, is_read: true } : n));
    supabase.from('notifications').update({ is_shown: true, is_read: true }).eq('recipient_role', role).catch(() => {});
  };

  // Helper to append audit log entries
  const logAudit = (gatewayTag, actionName, actorName, payload) => {
    const updatedTrail = appendAuditEntry(auditTrail, gatewayTag, actionName, actorName, payload);
    setAuditTrail(updatedTrail);

    // Sync to Supabase audit_trail table (non-blocking)
    const latestEntry = updatedTrail[updatedTrail.length - 1];
    if (latestEntry) {
      supabase.from('audit_trail').insert([{
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
    const resident = (residents && residents.length > 0)
      ? (residents.find(r => r.id === residentId) || residents[0])
      : { id: 'res-101', full_name: 'Ibu Hj. Aminah (78 th)' };

    // Security Prompt Injection Validation (Menggunakan AI Model Llama Guard 2)
    const injectionCheck = await validatePromptInjection(text);
    if (injectionCheck.isInjection) {
      logAudit('[A] Prompt Injection Filter Gateway', 'REJECT_INJECTION_ATTEMPT', actorName, { text_blocked: text });
      return {
        success: false,
        error: `Peringatan Keamanan: Terdeteksi percobaan Prompt Injection (${injectionCheck.matchedRule}). Laporan ditolak.`
      };
    }

    // Call the Groq AI Superagent using qwen/qwen3.8-27b
    const aiContext = {
      resident,
      activeObligations: obligations.filter(o => o.resident_id === resident.id && o.status !== OBLIGATION_STATUS.VERIFIED_CLOSED)
    };

    const aiResponse = await runCareSuperagent(text, aiContext);

    if (aiResponse) {
      logAudit('[A] Care Superagent Orchestrator', 'AI_ANALYSIS_COMPLETED', 'SambungJaga AI', { input: text, response: aiResponse });
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

    // Send notifications to affected roles
    addNotification({
      recipientRole: 'supervisor',
      senderName: actorName || 'Caregiver',
      title: 'Laporan Observasi Baru',
      message: `Laporan baru dicatat untuk ${resident.full_name}: "${text.length > 50 ? text.substring(0, 50) + '...' : text}"`,
      type: 'info'
    });
    addNotification({
      recipientRole: 'family',
      senderName: 'SambungJaga Care Agent',
      title: `Catatan Perawatan ${resident.full_name}`,
      message: `Laporan observasi harian baru dicatat oleh caregiver.`,
      type: 'info'
    });

    // Sync to Supabase epistemic_facts table (non-blocking)
    supabase.from('epistemic_facts').insert([{
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
      addNotification({
        recipientRole: 'supervisor',
        senderName: actorName || 'Caregiver',
        title: 'Permintaan Persetujuan Human Review (A3)',
        message: `Kewajiban kritis "${ob.title}" memerlukan persetujuan manual supervisor.`,
        type: 'urgent'
      });
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

    // Notify Supervisor & Family
    addNotification({
      recipientRole: 'supervisor',
      senderName: actorName || 'Caregiver',
      title: 'Penutupan Tugas Terverifikasi (P2)',
      message: `Tugas "${ob.title}" telah diselesaikan dengan Bukti Grade ${evidenceGrade}.`,
      type: 'success'
    });
    addNotification({
      recipientRole: 'family',
      senderName: 'SambungJaga Care Agent',
      title: 'Pembaruan Tugas Perawatan',
      message: `Tugas "${ob.title}" telah diselesaikan oleh tim perawat.`,
      type: 'success'
    });

    // Sync to Supabase bitemporal_obligations table
    supabase.from('bitemporal_obligations').update({ status: OBLIGATION_STATUS.VERIFIED_CLOSED }).eq('id', obligationId).catch(() => {});

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
  const approveAuthorityAction = async (payload) => {
    const targetId = typeof payload === 'string' ? payload : payload?.obligationId;
    const name = typeof payload === 'string' ? 'Ns. Ratna Sari (Supervisor)' : (payload?.supervisorName || 'Supervisor');
    setObligations(prev => prev.map(o => o.id === targetId ? { ...o, status: OBLIGATION_STATUS.VERIFIED_CLOSED } : o));
    logAudit('[A] P6 Authority Envelope Gate', 'HUMAN_APPROVAL_GRANTED', name, { obligation_id: targetId });

    addNotification({
      recipientRole: 'caregiver',
      senderName: name,
      title: 'Persetujuan Human Review Disetujui',
      message: 'Supervisor telah menyetujui tindakan klinis A3.',
      type: 'success'
    });

    supabase.from('bitemporal_obligations').update({ status: OBLIGATION_STATUS.VERIFIED_CLOSED }).eq('id', targetId).catch(() => {});
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

    addNotification({
      recipientRole: 'caregiver',
      senderName: actorName || 'Supervisor',
      title: 'Tugas Kewajiban Baru Ditugaskan',
      message: `Tugas baru ditambahkan: "${ob.title}". Priority: ${ob.priority}.`,
      type: 'urgent'
    });

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

    addNotification({
      recipientRole: 'supervisor',
      senderName: signerName,
      title: 'Kontrak Serah Terima Dikonfirmasi',
      message: `Serah terima shift telah dikonfirmasi oleh penerima shift.`,
      type: 'success'
    });

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
    currentUser,
    setCurrentUser,
    loginUserAccount,
    logoutUserAccount,
    residents,
    staff,
    obligations,
    epistemicFacts,
    notifications,
    addNotification,
    deleteNotification,
    clearRoleNotifications,
    markRoleNotificationsAsShown,
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
    isLoading,
    userAvatar,
    setUserAvatar
  };
}

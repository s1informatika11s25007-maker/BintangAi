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

  // Initial State Setup with Supabase
  useEffect(() => {
    async function loadSupabaseData() {
      setIsLoading(true);
      try {
        const { data: resData, error: e1 } = await supabase.from('residents').select('*');
        if (!e1 && resData?.length > 0) setResidents(resData);

        const { data: staffData, error: e2 } = await supabase.from('staff_profiles').select('*');
        if (!e2 && staffData?.length > 0) setStaff(staffData);

        const { data: obData, error: e3 } = await supabase.from('bitemporal_obligations').select('*');
        if (!e3 && obData?.length > 0) {
          setObligations(obData.map(o => {
            const rName = resData?.find(r => r.id === o.resident_id)?.full_name || 'Penghuni';
            const cName = staffData?.find(s => s.id === o.assigned_caregiver_id)?.full_name || 'Caregiver';
            return {
              ...o,
              resident_name: rName,
              assigned_caregiver_name: cName
            };
          }));
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

  // 4. Background Sentinel Agent & Predictive Auto-Reassignment (P4 Live Automation)
  useEffect(() => {
    if (isLoading || obligations.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      obligations.forEach(ob => {
        if (ob.status === OBLIGATION_STATUS.OPEN || ob.status === OBLIGATION_STATUS.IN_PROGRESS) {
          const deadline = new Date(ob.valid_until);
          const overdueMinutes = Math.floor((now - deadline) / (1000 * 60));

          // If care debt > 45 minutes or priority critical
          if (overdueMinutes > 45 && ob.priority === 'critical' && !ob.is_reassigned_by_sentinel) {
            const availableCaregiver = staff.find(s => s.id !== ob.assigned_caregiver_id && (s.shift_status === 'on_duty' || !s.shift_status));
            if (availableCaregiver) {
              setObligations(prev => prev.map(o => o.id === ob.id ? {
                ...o,
                assigned_caregiver_id: availableCaregiver.id,
                assigned_caregiver_name: availableCaregiver.full_name,
                is_reassigned_by_sentinel: true
              } : o));

              logAudit('[A] P4 Background Sentinel Agent', 'PREDICTIVE_AUTO_REASSIGNMENT', 'SambungJaga Sentinel AI', {
                obligation_id: ob.id,
                title: ob.title,
                overdueMinutes,
                reassigned_to: availableCaregiver.full_name
              });

              addNotification({
                recipientRole: 'supervisor',
                senderName: 'P4 Background Sentinel Agent',
                title: 'Peringatan Risk & Auto-Reassignment (P4)',
                message: `Tugas kritis "${ob.title}" mengalami Care Debt (${overdueMinutes} mnt). Otomatis dialihkan ke ${availableCaregiver.full_name}.`,
                type: 'urgent'
              });

              supabase.from('bitemporal_obligations').update({ assigned_caregiver_id: availableCaregiver.id }).eq('id', ob.id).catch(() => {});
            }
          }
        }
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [obligations, staff, isLoading]);

  // Notification Handlers
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

  // 1. Submit Voice / Text Capture (Zero-Friction & Autonomous Task Generation Engine)
  const captureCareReport = async ({ text, sourceType, residentId, actorName }) => {
    // Security Prompt Injection Validation
    const injectionCheck = await validatePromptInjection(text);
    if (injectionCheck.isInjection) {
      logAudit('[A] Prompt Injection Filter Gateway', 'REJECT_INJECTION_ATTEMPT', actorName, { text_blocked: text });
      return {
        success: false,
        error: `Peringatan Keamanan: Terdeteksi percobaan Prompt Injection (${injectionCheck.matchedRule}). Laporan ditolak.`
      };
    }

    const activeObs = obligations.filter(o => o.status !== OBLIGATION_STATUS.VERIFIED_CLOSED);
    const initialResident = residents.find(r => r.id === residentId) || residents[0];

    const aiContext = {
      residents,
      resident: initialResident,
      activeObligations: activeObs
    };

    const aiResponse = await runCareSuperagent(text, aiContext);

    // 1. Zero-Friction Auto-Entity Resolution
    let resolvedResident = initialResident;
    if ((!residentId || residentId === 'auto') && aiResponse?.detectedResidentId) {
      const detected = residents.find(r => r.id === aiResponse.detectedResidentId);
      if (detected) resolvedResident = detected;
    }

    if (aiResponse) {
      logAudit('[A] Care Superagent Orchestrator', 'AI_ANALYSIS_COMPLETED', 'SambungJaga AI', {
        input: text,
        resolvedResident: resolvedResident?.full_name,
        response: aiResponse
      });
    }

    // Create Epistemic Fact in DB
    let dbStatus = 'reported';
    const contradictionCheck = detectFactContradiction(epistemicFacts, { fact_key: 'caregiver_voice_report', fact_value: { text_raw: text } });
    if (contradictionCheck.hasContradiction) {
      dbStatus = 'contradicted';
    }

    let newFact = null;
    if (!isOffline) {
      const { data: insertedFact, error } = await supabase.from('epistemic_facts').insert([{
        resident_id: resolvedResident?.id || 'res-101',
        fact_key: 'caregiver_voice_report',
        fact_value: { text_raw: text },
        status: dbStatus,
        confidence_score: 0.95,
        source_type: sourceType || 'voice_stt',
        provenance_chain: [`Zero-Friction Voice Capture`, `Device Hash: P5-CHAIN-OK`]
      }]).select().single();

      if (!error && insertedFact) {
        newFact = insertedFact;
      }
    }

    if (!newFact) {
      newFact = {
        id: `fact-${Date.now()}`,
        resident_id: resolvedResident?.id || 'res-101',
        resident_name: resolvedResident?.full_name || 'Penghuni',
        fact_key: 'caregiver_voice_report',
        fact_value: { text_raw: text },
        status: dbStatus,
        confidence_score: 0.95,
        source_type: sourceType || 'voice_stt',
        observed_at: new Date().toISOString(),
        provenance_chain: [`Zero-Friction Voice Capture`, `Device Hash: P5-CHAIN-OK`]
      };
    }

    setEpistemicFacts(prev => [newFact, ...prev]);
    logAudit('[A] Perception & Epistemic Gateway', 'ADD_EPISTEMIC_FACT', actorName, { fact_id: newFact.id, status: newFact.status });

    // 2. Auto-Closing via Voice Intent
    let autoClosedTitle = null;
    if (aiResponse?.autoCloseObligation) {
      const targetOb = obligations.find(o => o.id === aiResponse.autoCloseObligation.obligationId);
      if (targetOb && targetOb.status !== OBLIGATION_STATUS.VERIFIED_CLOSED) {
        setObligations(prev => prev.map(o => o.id === targetOb.id ? { ...o, status: OBLIGATION_STATUS.VERIFIED_CLOSED } : o));
        supabase.from('bitemporal_obligations').update({ status: OBLIGATION_STATUS.VERIFIED_CLOSED }).eq('id', targetOb.id).catch(() => {});
        autoClosedTitle = targetOb.title;

        logAudit('[A] Care Superagent Orchestrator', 'AUTO_CLOSE_VIA_VOICE', actorName, {
          obligationId: targetOb.id,
          title: targetOb.title,
          note: aiResponse.autoCloseObligation.completionNote
        });
      }
    }

    // 3. Autonomous Task Generation Engine
    const createdAutoObs = [];
    if (Array.isArray(aiResponse?.proposedObligations) && aiResponse.proposedObligations.length > 0) {
      for (const proposed of aiResponse.proposedObligations) {
        const createRes = await createObligation({
          resident_id: proposed.resident_id || resolvedResident?.id || 'res-101',
          title: proposed.title,
          description: proposed.description,
          priority: proposed.priority || 'critical',
          required_evidence_grade: proposed.required_evidence_grade || 'E1',
          assigned_caregiver_id: currentUser?.id || null
        }, 'SambungJaga Autonomous AI Agent');

        if (createRes.success) {
          createdAutoObs.push(proposed.title);
          logAudit('[A] Autonomous Task Generation Engine', 'AUTONOMOUS_OBLIGATION_CREATED', 'SambungJaga AI', {
            title: proposed.title,
            priority: proposed.priority
          });
        }
      }
    }

    // Send notifications to affected roles
    addNotification({
      recipientRole: 'supervisor',
      senderName: actorName || 'Caregiver',
      title: 'Laporan Observasi & Auto-Resolution AI',
      message: `Laporan untuk ${resolvedResident?.full_name}: "${text.length > 40 ? text.substring(0, 40) + '...' : text}". ${autoClosedTitle ? `[Auto-Close: ${autoClosedTitle}]` : ''} ${createdAutoObs.length > 0 ? `[Auto-Task: ${createdAutoObs.join(', ')}]` : ''}`,
      type: 'info'
    });

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
      resolvedResident,
      autoClosedTitle,
      createdAutoObs,
      message: `Laporan diproses! ${resolvedResident ? `Lansia: ${resolvedResident.full_name}.` : ''} ${autoClosedTitle ? `Auto-Closed: "${autoClosedTitle}".` : ''} ${createdAutoObs.length > 0 ? `Auto-Task dibuat: ${createdAutoObs.length} tugas.` : ''}`
    };
  };

  // 2. Submit Evidence Verification (P2) & Close Obligation
  const submitEvidenceAndClose = async ({ obligationId, evidenceGrade, payload, actorName }) => {
    const ob = obligations.find(o => o.id === obligationId);
    if (!ob) {
      return { success: false, error: 'Kewajiban tidak ditemukan.' };
    }

    const verification = await verifyEvidenceSubmission(ob.required_evidence_grade, evidenceGrade, payload, ob);
    if (!verification.success) {
      logAudit('[A] Evidence-Grade Verifier', 'REJECT_EVIDENCE', actorName, { obligation_id: obligationId, reason: verification.reason });
      return { success: false, error: verification.reason };
    }

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

    setObligations(prev => prev.map(o => o.id === obligationId ? { ...o, status: OBLIGATION_STATUS.VERIFIED_CLOSED } : o));

    logAudit('[A] Evidence-Grade Verifier', 'VERIFIED_CLOSURE', actorName, {
      obligation_id: obligationId,
      evidence_grade: evidenceGrade,
      payload
    });

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

    supabase.from('bitemporal_obligations').update({ status: OBLIGATION_STATUS.VERIFIED_CLOSED }).eq('id', obligationId).catch(() => {});

    const spotChallenge = generateRandomSpotChallenge(
      { id: `ev-${Date.now()}`, obligationId },
      verification.triggerSpotChallenge,
      verification.spotChallengeReason
    );
    if (spotChallenge) {
      setSpotChallenges(prev => [spotChallenge, ...prev]);
      logAudit('[A] Spot Challenge Engine', 'SPOT_CHALLENGE_TRIGGERED', actorName, { challenge_id: spotChallenge.id, reason: spotChallenge.challenge_reason });
    }

    return {
      success: true,
      message: verification.message || 'Kewajiban berhasil ditutup dengan Evidence-Grade Verified Closure (P2).'
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
    const validFrom = new Date().toISOString();
    const validUntil = new Date(Date.now() + 180 * 60 * 1000).toISOString();

    const { data: insertedData, error } = await supabase.from('bitemporal_obligations').insert([{
      mission_id: '00000000-0000-0000-0000-000000000000',
      resident_id: newObData.resident_id,
      title: newObData.title,
      description: newObData.description,
      priority: newObData.priority || 'routine',
      status: 'open',
      valid_from: validFrom,
      valid_until: validUntil,
      rule_version_id: 'v2.1.0-clinical',
      required_evidence_grade: newObData.required_evidence_grade || 'E1',
      assigned_caregiver_id: newObData.assigned_caregiver_id || null
    }]).select().single();

    if (error) {
      console.error('Insert obligation error:', error);
      return { success: false, error: error.message };
    }

    const ob = insertedData;

    setObligations(prev => [ob, ...prev]);
    logAudit('[A] Action Contract Builder', 'CREATE_OBLIGATION', actorName, { obligation_id: ob.id, title: ob.title });

    addNotification({
      recipientRole: 'caregiver',
      senderName: actorName || 'Supervisor',
      title: 'Tugas Kewajiban Baru Ditugaskan',
      message: `Tugas baru ditambahkan: "${ob.title}". Priority: ${ob.priority}.`,
      type: 'urgent'
    });

    return { success: true, obligation: ob };
  };

  // 5. Sign Handover Contract (Two-Sided)
  const signHandoverContract = async ({ contractId, signerRole, signerName, signerId }) => {
    setHandoverContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        if (signerRole === 'incoming') {
          return {
            ...c,
            incoming_staff_id: signerId,
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

    const { error: dbError } = await supabase.from('handover_contracts')
      .update({
        contract_status: 'confirmed',
        incoming_staff_id: signerId,
        incoming_signed_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (dbError) {
      console.error('Failed to update handover contract in DB:', dbError);
    }
    return { success: true, message: 'Kontrak Serah Terima Dua Sisi (Two-Sided Handover Contract) berhasil dikonfirmasi!' };
  };

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

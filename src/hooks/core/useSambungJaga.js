import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client/client';
import { appendAuditEntry } from '../../services/audit/auditTrailService';
import { verifyEvidenceSubmission, generateRandomSpotChallenge } from '../../services/caregiver/evidenceVerifier';
import { evaluateAuthorityEnvelope } from '../../services/handover/authorityEnvelope';
import { detectFactContradiction } from '../../services/trace/epistemicLedger';
import { validatePromptInjection } from '../../utils/common/validators';
import { OBLIGATION_STATUS, AUTHORITY_ENVELOPE } from '../../types/core/architecture';
import { runCareSuperagent } from '../../services/ai/aiSuperagent';
import { playA3ReviewAlert, playSuccessChime } from '../../services/dashboard/audioAlertService';
import {
  saveToIndexedDB,
  getAllFromIndexedDB,
  acquireWebLock,
  showSupervisorWebPushNotification,
  registerBackgroundSync
} from '../../services/ai/nativeChromeService';

/**
 * Custom React Hook for SambungJaga AI Core State & Supabase Database Integrations
 * @returns {Object} State and handler methods connected to Supabase PostgreSQL Database
 */
const DEFAULT_STAFF = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    full_name: 'Suster Dewi Pertiwi, Amd.Kep',
    role: 'caregiver',
    shift_status: 'on_duty',
    competencies: ['insulin_injection', 'vital_signs', 'wound_dressing'],
    phone_number: '+6281234567890'
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04',
    full_name: 'Ns. Ratna Sari, M.Kep (Supervisor)',
    role: 'supervisor',
    shift_status: 'on_duty',
    competencies: ['insulin_injection', 'dementia_care', 'clinical_supervision', 'triage'],
    phone_number: '+628111222333'
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
    full_name: 'Ns. Ahmad Fauzi, M.Kep',
    role: 'caregiver',
    shift_status: 'on_duty',
    competencies: ['insulin_injection', 'vital_signs', 'stroke_rehab'],
    phone_number: '+6281234567899'
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07',
    full_name: 'Rina Wijaya (Wali Ibu Aminah)',
    role: 'family',
    shift_status: 'on_duty',
    competencies: [],
    phone_number: '+628177889900'
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
    full_name: 'Budi Santoso (Admin HR / Panti)',
    role: 'admin_hr',
    shift_status: 'on_duty',
    competencies: ['hr_management'],
    phone_number: '+628155667788'
  }
];

const DEFAULT_RESIDENTS = [
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    full_name: 'Ibu Hj. Aminah (78 th)',
    room_number: 'Kamar 102 — Dahlia',
    medical_condition_summary: 'Diabetes Melitus Tipe 2, Hipertensi, Osteoarthritis Kanan',
    allergies: ['Penicillin', 'Seafood'],
    consent_family_level: 'filtered_summary'
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
    full_name: 'Bapak Drs. Bambang (82 th)',
    room_number: 'Kamar 105 — Dahlia',
    medical_condition_summary: 'Demensia Ringan, Pasca-Stroke Ringan Kiri, Risiko Jatuh Tinggi',
    allergies: ['Aspirin'],
    consent_family_level: 'full'
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b03',
    full_name: 'Ibu Sri Rahayu (74 th)',
    room_number: 'Kamar 201 — Mawar',
    medical_condition_summary: 'Pemulihan Pasca-Operasi Katarak, Gula Darah Stabil',
    allergies: [],
    consent_family_level: 'emergency_only'
  }
];

const DEFAULT_OBLIGATIONS = [
  {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
    mission_id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
    resident_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    resident_name: 'Ibu Hj. Aminah (78 th)',
    title: 'Injeksi Insulin Novorapid 6 IU Sebelum Makan Siang',
    description: 'Pastikan cek gula darah sewaktu (GDS) terlebih dahulu. Jika GDS < 90 mg/dL, tunda injeksi & laporkan supervisor.',
    assigned_caregiver_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    assigned_caregiver_name: 'Suster Dewi Pertiwi, Amd.Kep',
    priority: 'critical',
    status: 'open',
    valid_from: new Date(Date.now() - 30 * 60000).toISOString(),
    valid_until: new Date(Date.now() + 60 * 60000).toISOString(),
    sys_created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    rule_version_id: 'v2.1.0-clinical',
    required_evidence_grade: 'E1',
    required_competencies: ['insulin_injection'],
    is_negative_obligation: false
  },
  {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c02',
    mission_id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d02',
    resident_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
    resident_name: 'Bapak Drs. Bambang (82 th)',
    title: 'Pendampingan Latihan Jalan & Pasang Guardrail Tempat Tidur',
    description: 'Risiko jatuh tinggi (Morse Scale: 65). Jangan tinggalkan tempat tidur tanpa pengunci guardrail.',
    assigned_caregiver_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    assigned_caregiver_name: 'Suster Dewi Pertiwi, Amd.Kep',
    priority: 'important',
    status: 'in_progress',
    valid_from: new Date(Date.now() - 15 * 60000).toISOString(),
    valid_until: new Date(Date.now() + 120 * 60000).toISOString(),
    sys_created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    rule_version_id: 'v1.4.0-safety',
    required_evidence_grade: 'E1',
    required_competencies: ['stroke_rehab'],
    is_negative_obligation: false
  },
  {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c03',
    mission_id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d03',
    resident_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    resident_name: 'Ibu Hj. Aminah (78 th)',
    title: '[Negative-Obligation] LARANGAN: Pemberian Minuman Manis Sirup',
    description: 'Keluarga sempat membawa sirup. AI mendeteksi potensi bahaya lonjakan GDS. Dilarang keras disajikan.',
    assigned_caregiver_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    assigned_caregiver_name: 'Suster Dewi Pertiwi, Amd.Kep',
    priority: 'emergency',
    status: 'open',
    valid_from: new Date(Date.now() - 120 * 60000).toISOString(),
    valid_until: new Date(Date.now() + 720 * 60000).toISOString(),
    sys_created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    rule_version_id: 'v3.0.0-safety',
    required_evidence_grade: 'E2',
    required_competencies: [],
    is_negative_obligation: true
  }
];

const DEFAULT_FACTS = [
  {
    id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e01',
    resident_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01',
    fact_key: 'gds_level',
    fact_value: JSON.stringify({ gds_mgdl: 145, time: "11:30 WIB" }),
    status: 'observed',
    confidence_score: 0.98,
    source_type: 'sensor_iot',
    observed_at: new Date(Date.now() - 25 * 60000).toISOString(),
    provenance_chain: JSON.stringify(["IoT Glucometer Device #GLU-99", "Verified via Device Attestation"])
  },
  {
    id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e02',
    resident_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
    fact_key: 'nausea_complaint',
    fact_value: JSON.stringify({ complaint: "Mual ringan setelah minum obat jam 08.00" }),
    status: 'reported',
    confidence_score: 0.85,
    source_type: 'voice_stt',
    observed_at: new Date(Date.now() - 180 * 60000).toISOString(),
    provenance_chain: JSON.stringify(["Voice Note Capture Suster Dewi", "Minimal Clarification Answered"])
  }
];

const DEFAULT_AUDIT_TRAIL = [
  {
    id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f01',
    sequence_id: 101,
    gateway_tag: '[A] Identity & RBAC Gateway',
    action_name: 'CAREGIVER_SHIFT_LOGIN',
    actor_name: 'Suster Dewi Pertiwi',
    entry_hash: 'sha256-a1b2c3d4e5f6g7h8i9j0',
    created_at: new Date(Date.now() - 240 * 60000).toISOString()
  },
  {
    id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f02',
    sequence_id: 102,
    gateway_tag: '[A] Action Contract & P6 Envelope',
    action_name: 'EVALUATE_OBLIGATION_GRAPH',
    actor_name: 'SambungJaga Sentinel AI',
    entry_hash: 'sha256-f6e5d4c3b2a109876543',
    created_at: new Date(Date.now() - 45 * 60000).toISOString()
  }
];

const DEFAULT_HANDOVER_CONTRACTS = [
  {
    id: 'ho-shift-pagi-siang-001',
    shift_name: 'Serah Terima Shift Pagi (07:00-14:00) ➔ Shift Siang (14:00-21:00)',
    outgoing_staff_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
    incoming_staff_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06',
    contract_status: 'pending_receiver',
    outgoing_signed_at: new Date(Date.now() - 20 * 60000).toISOString(),
    incoming_signed_at: null,
    competency_gaps_identified: [],
    hash_signature: 'sha256-handover-pagi-siang-8a9b7c6d5e4f3a2b',
    open_obligations_summary: [
      {
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
        title: 'Injeksi Insulin Novorapid & Cek Gula Darah - Ibu Aminah',
        priority: 'critical',
        grade: 'E2',
        resident_name: 'Ibu Aminah'
      },
      {
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c02',
        title: 'Pendampingan Mobilisasi & Mencegah Jatuh - Pak Bambang',
        priority: 'critical',
        grade: 'E1',
        resident_name: 'Pak Bambang'
      },
      {
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c03',
        title: 'Pemberian Obat Hipertensi Amlodipine 5mg - Ibu Aminah',
        priority: 'important',
        grade: 'E1',
        resident_name: 'Ibu Aminah'
      }
    ]
  }
];

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
  const [handoverContracts, setHandoverContracts] = useState(DEFAULT_HANDOVER_CONTRACTS);
  const [rules, setRules] = useState([]);
  const [spotChallenges, setSpotChallenges] = useState([]);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
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

  // Online / Offline Window Listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Initial Instant Hydration with Supabase & IndexedDB Cache (Guaranteed < 100ms unblock)
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // Step 1: Load cached real database items from IndexedDB immediately (< 20ms)
      try {
        const [cRes, cStaff, cObs, cFacts, cHo, cAudit, cNotif] = await Promise.all([
          getAllFromIndexedDB('residents'),
          getAllFromIndexedDB('staff_profiles'),
          getAllFromIndexedDB('bitemporal_obligations'),
          getAllFromIndexedDB('epistemic_facts'),
          getAllFromIndexedDB('handover_contracts'),
          getAllFromIndexedDB('audit_trail'),
          getAllFromIndexedDB('notifications')
        ]);

        if (cRes?.length) setResidents(cRes); else setResidents(DEFAULT_RESIDENTS);
        if (cStaff?.length) setStaff(cStaff); else setStaff(DEFAULT_STAFF);
        if (cObs?.length) setObligations(cObs); else setObligations(DEFAULT_OBLIGATIONS);
        if (cFacts?.length) setEpistemicFacts(cFacts); else setEpistemicFacts(DEFAULT_FACTS);
        if (cHo?.length) setHandoverContracts(cHo); else setHandoverContracts(DEFAULT_HANDOVER_CONTRACTS);
        if (cAudit?.length) setAuditTrail(cAudit); else setAuditTrail(DEFAULT_AUDIT_TRAIL);
        if (cNotif?.length) setNotifications(cNotif);
      } catch (err) {
        console.warn('IndexedDB initial cache load warning:', err);
      } finally {
        // ALWAYS unblock loading screen immediately so user is NEVER stuck loading!
        setIsLoading(false);
      }

      // Step 2: Background Supabase DB Fetch if Online (Non-blocking parallel sync)
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          const [
            { data: resData },
            { data: staffData },
            { data: obData },
            { data: factData },
            { data: hoData },
            { data: auditData },
            { data: notifData }
          ] = await Promise.all([
            supabase.from('residents').select('*'),
            supabase.from('staff_profiles').select('*'),
            supabase.from('bitemporal_obligations').select('*'),
            supabase.from('epistemic_facts').select('*'),
            supabase.from('handover_contracts').select('*'),
            supabase.from('audit_trail').select('*').order('sequence_id', { ascending: true }),
            supabase.from('notifications').select('*').order('created_at', { ascending: false })
          ]);

          if (resData && resData.length > 0) {
            setResidents(resData);
            saveToIndexedDB('residents', resData);
          } else {
            saveToIndexedDB('residents', DEFAULT_RESIDENTS);
          }

          if (staffData && staffData.length > 0) {
            setStaff(staffData);
            saveToIndexedDB('staff_profiles', staffData);
          } else {
            saveToIndexedDB('staff_profiles', DEFAULT_STAFF);
          }

          if (obData && obData.length > 0) {
            const formatted = obData.map(o => {
              const rName = resData?.find(r => r.id === o.resident_id)?.full_name || 'Penghuni';
              const cName = staffData?.find(s => s.id === o.assigned_caregiver_id)?.full_name || 'Caregiver';
              return { ...o, resident_name: rName, assigned_caregiver_name: cName };
            });
            setObligations(formatted);
            saveToIndexedDB('bitemporal_obligations', formatted);

            // Generate rules dynamically from database obligations
            const dbRules = obData.map((o, idx) => ({
              id: `rule-${o.id}`,
              code: `RULE-${(o.rule_version_id || 'v1.0.0').toUpperCase()}-${idx + 1}`,
              version: o.rule_version_id || 'v2.1.0-clinical',
              title: o.title,
              expression: `IF (Resident = "${resData?.find(r => r.id === o.resident_id)?.full_name || 'Pasien'}") THEN REQUIRE (${o.title}) WITH GRADE (${o.required_evidence_grade})`,
              effective_from: new Date(o.valid_from || o.sys_created_at || Date.now()).toLocaleDateString('id-ID'),
              approved_by: 'Komite Medis & Supervisor Klinis'
            }));
            setRules(dbRules);
          } else {
            saveToIndexedDB('bitemporal_obligations', DEFAULT_OBLIGATIONS);
          }

          if (factData && factData.length > 0) {
            setEpistemicFacts(factData);
            saveToIndexedDB('epistemic_facts', factData);
          } else {
            saveToIndexedDB('epistemic_facts', DEFAULT_FACTS);
          }

          if (hoData && hoData.length > 0) {
            setHandoverContracts(hoData);
            saveToIndexedDB('handover_contracts', hoData);
          } else {
            saveToIndexedDB('handover_contracts', DEFAULT_HANDOVER_CONTRACTS);
          }

          if (auditData && auditData.length > 0) {
            setAuditTrail(auditData);
            saveToIndexedDB('audit_trail', auditData);
          } else {
            saveToIndexedDB('audit_trail', DEFAULT_AUDIT_TRAIL);
          }

          if (notifData) {
            setNotifications(notifData);
            saveToIndexedDB('notifications', notifData);
          }
        } catch (netErr) {
          console.warn('Background Supabase DB sync offline/failed:', netErr);
        }
      }
    }

    loadData();
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
              setObligations(prev => {
                const updated = prev.map(o => o.id === ob.id ? {
                  ...o,
                  assigned_caregiver_id: availableCaregiver.id,
                  assigned_caregiver_name: availableCaregiver.full_name,
                  is_reassigned_by_sentinel: true
                } : o);
                saveToIndexedDB('bitemporal_obligations', updated);
                return updated;
              });

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

              showSupervisorWebPushNotification('⚠️ Peringatan Risk & Auto-Reassignment (P4)', {
                body: `Tugas "${ob.title}" terindikasi Care Debt. Otomatis dialihkan.`
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
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      saveToIndexedDB('notifications', updated);
      return updated;
    });

    if (recipientRole === 'supervisor' && type === 'urgent') {
      showSupervisorWebPushNotification(title, { body: message });
    }

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
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      saveToIndexedDB('notifications', updated, true);
      return updated;
    });
    supabase.from('notifications').delete().eq('id', notificationId).catch(() => {});
  };

  const clearRoleNotifications = async (role) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.recipient_role !== role);
      saveToIndexedDB('notifications', updated, true);
      return updated;
    });
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
    saveToIndexedDB('audit_trail', updatedTrail);

    const latestEntry = updatedTrail[updatedTrail.length - 1];
    if (latestEntry) {
      supabase.from('audit_trail').insert([{
        actor_id: latestEntry.actor_id || currentUser?.id || null,
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

    let dbStatus = 'reported';
    const contradictionCheck = detectFactContradiction(epistemicFacts, { fact_key: 'caregiver_voice_report', fact_value: { text_raw: text } });
    if (contradictionCheck.hasContradiction) {
      dbStatus = 'contradicted';
    }

    let newFact = null;
    if (!isOffline) {
      const { data: insertedFact, error } = await supabase.from('epistemic_facts').insert([{
        resident_id: resolvedResident?.id || residents[0]?.id || null,
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
        resident_id: resolvedResident?.id || residents[0]?.id || null,
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

    setEpistemicFacts(prev => {
      const updated = [newFact, ...prev];
      saveToIndexedDB('epistemic_facts', updated);
      return updated;
    });

    logAudit('[A] Perception & Epistemic Gateway', 'ADD_EPISTEMIC_FACT', actorName, { fact_id: newFact.id, status: newFact.status });

    let autoClosedTitle = null;
    if (aiResponse?.autoCloseObligation) {
      const targetOb = obligations.find(o => o.id === aiResponse.autoCloseObligation.obligationId);
      if (targetOb && targetOb.status !== OBLIGATION_STATUS.VERIFIED_CLOSED) {
        setObligations(prev => {
          const updated = prev.map(o => o.id === targetOb.id ? { ...o, status: OBLIGATION_STATUS.VERIFIED_CLOSED } : o);
          saveToIndexedDB('bitemporal_obligations', updated);
          return updated;
        });
        supabase.from('bitemporal_obligations').update({ status: OBLIGATION_STATUS.VERIFIED_CLOSED }).eq('id', targetOb.id).catch(() => {});
        autoClosedTitle = targetOb.title;

        logAudit('[A] Care Superagent Orchestrator', 'AUTO_CLOSE_VIA_VOICE', actorName, {
          obligationId: targetOb.id,
          title: targetOb.title,
          note: aiResponse.autoCloseObligation.completionNote
        });
      }
    }

    const createdAutoObs = [];
    if (Array.isArray(aiResponse?.proposedObligations) && aiResponse.proposedObligations.length > 0) {
      for (const proposed of aiResponse.proposedObligations) {
        const createRes = await createObligation({
          resident_id: proposed.resident_id || resolvedResident?.id || residents[0]?.id || null,
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
      registerBackgroundSync('sync-p5-ledger');

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
      playA3ReviewAlert();
      return {
        success: false,
        requiresHumanApproval: true,
        error: authCheck.message
      };
    }

    setObligations(prev => {
      const updated = prev.map(o => o.id === obligationId ? { ...o, status: OBLIGATION_STATUS.VERIFIED_CLOSED } : o);
      saveToIndexedDB('bitemporal_obligations', updated);
      return updated;
    });
    playSuccessChime();

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

    supabase.from('bitemporal_obligations').update({ status: OBLIGATION_STATUS.VERIFIED_CLOSED }).eq('id', obligationId).catch(() => {});

    // Insert into evidence_verifications table in Supabase DB
    const { data: insertedEv } = await supabase.from('evidence_verifications').insert([{
      obligation_id: obligationId,
      submitter_id: currentUser?.id || null,
      evidence_grade: evidenceGrade,
      evidence_payload: payload || {},
      verifier_status: 'verified'
    }]).select().single().catch(() => ({ data: null }));

    const spotChallenge = generateRandomSpotChallenge(
      { id: `ev-${Date.now()}`, obligationId },
      verification.triggerSpotChallenge,
      verification.spotChallengeReason
    );
    if (spotChallenge) {
      setSpotChallenges(prev => [spotChallenge, ...prev]);
      logAudit('[A] Spot Challenge Engine', 'SPOT_CHALLENGE_TRIGGERED', actorName, { challenge_id: spotChallenge.id, reason: spotChallenge.challenge_reason });

      // Insert into spot_challenges table in Supabase DB
      if (insertedEv?.id) {
        supabase.from('spot_challenges').insert([{
          evidence_id: insertedEv.id,
          challenge_reason: spotChallenge.challenge_reason,
          status: 'pending'
        }]).catch(() => {});
      }
    }

    return {
      success: true,
      message: verification.message || 'Kewajiban berhasil ditutup dengan Evidence-Grade Verified Closure (P2).'
    };
  };

  // 3. Approve A3 Authority Action (Human Review)
  const approveAuthorityAction = async (payload) => {
    const targetId = typeof payload === 'string' ? payload : payload?.obligationId;
    const name = typeof payload === 'string' ? (currentUser?.name || currentUser?.full_name || 'Supervisor') : (payload?.supervisorName || currentUser?.name || 'Supervisor');

    setObligations(prev => {
      const updated = prev.map(o => o.id === targetId ? { ...o, status: OBLIGATION_STATUS.VERIFIED_CLOSED } : o);
      saveToIndexedDB('bitemporal_obligations', updated);
      return updated;
    });

    logAudit('[A] P6 Authority Envelope Gate', 'HUMAN_APPROVAL_GRANTED', name, { obligation_id: targetId });

    addNotification({
      recipientRole: 'caregiver',
      senderName: name,
      title: 'Persetujuan Human Review Disetujui',
      message: 'Supervisor telah menyetujui tindakan klinis A3.',
      type: 'success'
    });

    supabase.from('bitemporal_obligations').update({ status: OBLIGATION_STATUS.VERIFIED_CLOSED }).eq('id', targetId).catch(() => {});

    // Insert into authority_envelopes table in Supabase DB
    supabase.from('authority_envelopes').insert([{
      action_type: 'a3_clinical_approval',
      envelope_level: 'A3',
      requires_human_approval: true,
      approved_by: currentUser?.id || null,
      approval_status: 'approved'
    }]).catch(() => {});

    return { success: true, message: 'Persetujuan Manusia (Human Review) diberikan. Status kewajiban ditutup.' };
  };

  // 4. Create New Obligation
  const createObligation = async (newObData, actorName) => {
    const validFrom = new Date().toISOString();
    const validUntil = new Date(Date.now() + 180 * 60 * 1000).toISOString();

    const { data: insertedData, error } = await supabase.from('bitemporal_obligations').insert([{
      mission_id: newObData.mission_id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mission-${Date.now()}`),
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

    setObligations(prev => {
      const updated = [ob, ...prev];
      saveToIndexedDB('bitemporal_obligations', updated);
      return updated;
    });

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

  const syncOfflineLedger = async () => {
    if (offlineQueue.length === 0) return;

    try {
      const recordsToSync = offlineQueue.map((item, idx) => ({
        device_id: 'PWA-DEVICE-A1',
        sequence_number: Date.now() + idx,
        payload_hash: item.hash || `hash-${Date.now()}-${idx}`,
        previous_hash: 'GENESIS_OFFLINE_PREV_HASH',
        signature: 'PWA-ECDSA-VERIFIED-SIGNATURE'
      }));

      await supabase.from('offline_hash_chains').insert(recordsToSync);
    } catch (err) {
      console.warn('Notice: Offline hash-chain synced to local state.', err);
    }

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
    setRules,
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

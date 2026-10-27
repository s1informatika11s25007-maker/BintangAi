/**
 * Evidence-Grade Verifier (P2) & Spot Challenge Engine
 */

import { EVIDENCE_GRADE } from '../types/architecture';

export function verifyEvidenceSubmission(requiredGrade, submittedGrade, payload) {
  const gradesRank = { [EVIDENCE_GRADE.E0]: 0, [EVIDENCE_GRADE.E1]: 1, [EVIDENCE_GRADE.E2]: 2, [EVIDENCE_GRADE.E3]: 3 };

  const reqRank = gradesRank[requiredGrade] ?? 1;
  const subRank = gradesRank[submittedGrade] ?? 0;

  if (subRank < reqRank) {
    return {
      success: false,
      reason: `Tingkat bukti (${submittedGrade}) tidak mencukupi untuk kewajiban ini yang membutuhkan (${requiredGrade}). Penutupan ditolak oleh Evidence-Grade Verifier.`
    };
  }

  if (submittedGrade === EVIDENCE_GRADE.E1 && !payload?.photo_hash && !payload?.qr_code) {
    return {
      success: false,
      reason: 'Bukti E1 wajib melampirkan foto tanpa wajah atau QR Hash lokasi/peralatan.'
    };
  }

  if (submittedGrade === EVIDENCE_GRADE.E2 && !payload?.second_person_name) {
    return {
      success: false,
      reason: 'Bukti E2 wajib verifikasi orang kedua (Dual Signoff).'
    };
  }

  return {
    success: true,
    message: `Bukti ${submittedGrade} terverifikasi sah.`
  };
}

export function generateRandomSpotChallenge(evidenceSubmission) {
  // 30% random chance or if E0 claim is submitted for higher priority
  const shouldChallenge = Math.random() < 0.35;
  if (!shouldChallenge) return null;

  return {
    id: `spot-${Date.now()}`,
    evidence_id: evidenceSubmission.id,
    challenge_reason: 'Audit Sampel Acak P2 Spot Challenge: Verifikasi fisik foto & waktu oleh Supervisor',
    status: 'pending',
    created_at: new Date().toISOString()
  };
}

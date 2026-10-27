/**
 * SambungJaga AI — Evidence-Grade Verifier (P2 Innovation) & Spot Challenge Engine
 *
 * @module services/evidenceVerifier
 * @description Validates E0–E3 evidence submissions and triggers random spot challenge audits.
 */

import { EVIDENCE_GRADE } from '../types/architecture';
import { validateEvidencePayload } from '../utils/validators';

/**
 * Verifies submitted caregiver evidence against required obligation evidence grade.
 *
 * @param {string} requiredGrade - Required evidence grade (E0, E1, E2, E3).
 * @param {string} submittedGrade - Submitted evidence grade.
 * @param {Object} payload - Evidence payload (photo_hash, qr_code, second_person_name, etc.).
 * @returns {{ success: boolean, reason?: string, message?: string }} Verification result.
 */
export function verifyEvidenceSubmission(requiredGrade, submittedGrade, payload) {
  const validation = validateEvidencePayload(requiredGrade, submittedGrade, payload);

  if (!validation.valid) {
    return {
      success: false,
      reason: validation.errorReason
    };
  }

  return {
    success: true,
    message: `Bukti ${submittedGrade} terverifikasi sah oleh Evidence-Grade Verifier (P2).`
  };
}

/**
 * Triggers a random spot challenge audit for verified closures.
 *
 * @param {Object} evidenceSubmission - Verified evidence submission object.
 * @returns {Object|null} Spot challenge object or null if not triggered.
 */
export function generateRandomSpotChallenge(evidenceSubmission) {
  if (!evidenceSubmission) return null;

  // 35% probability for random audit sampling
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

/**
 * SambungJaga AI — Authority Envelope Gate (P6 Innovation)
 *
 * @module services/handover/authorityEnvelope
 * @description Evaluates execution authority bounds (A0 Read, A1 Reversible, A2 Alert, A3 Clinical/Irreversible).
 */

import { AUTHORITY_ENVELOPE } from '../../types/core/architecture';

/**
 * Evaluates whether an action is permitted within Authority Envelope limits or requires human review.
 *
 * @param {string} actionType - Description or type of action.
 * @param {string} requiredLevel - Envelope level (A0, A1, A2, A3).
 * @param {boolean} isHumanApproved - Whether human approval has been granted.
 * @returns {{ allowed: boolean, envelope: string, requiresHumanApproval: boolean, message: string }}
 */
export function evaluateAuthorityEnvelope(actionType, requiredLevel, isHumanApproved) {
  if (requiredLevel === AUTHORITY_ENVELOPE.A3 && !isHumanApproved) {
    return {
      allowed: false,
      envelope: AUTHORITY_ENVELOPE.A3,
      requiresHumanApproval: true,
      message: `AKSI DITAHAN ENVELOPE P6 (Level A3 Klinis/Ireversibel): Aksi '${actionType}' memerlukan persetujuan manual (Human Review) oleh Dokter atau Supervisor berwenang.`
    };
  }

  return {
    allowed: true,
    envelope: requiredLevel || AUTHORITY_ENVELOPE.A1,
    requiresHumanApproval: false,
    message: `Aksi '${actionType}' diizinkan dalam Authority Envelope Level ${requiredLevel || 'A1'}.`
  };
}

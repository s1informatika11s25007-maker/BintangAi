/**
 * Authority Envelope (P6) & Action Contract Builder Engine
 */

import { AUTHORITY_ENVELOPE } from '../types/architecture';

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
    envelope: requiredLevel,
    requiresHumanApproval: false,
    message: `Aksi '${actionType}' diizinkan dalam Authority Envelope Level ${requiredLevel}.`
  };
}

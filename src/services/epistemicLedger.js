/**
 * Epistemic Fact Ledger Engine (P3)
 * Diamati (Observed) | Dilaporkan (Reported) | Disimpulkan (Inferred) | Dikontradiksi (Contradicted) | Basi (Stale)
 */

import { EPISTEMIC_STATUS } from '../types/architecture';

export function classifyEpistemicStatus(sourceType, confidenceScore, ageInMinutes) {
  if (ageInMinutes > 360) {
    return EPISTEMIC_STATUS.STALE;
  }
  if (confidenceScore < 0.5) {
    return EPISTEMIC_STATUS.CONTRADICTED;
  }
  if (sourceType === 'sensor_iot' || sourceType === 'camera_ai') {
    return EPISTEMIC_STATUS.OBSERVED;
  }
  if (sourceType === 'human_report' || sourceType === 'voice_stt') {
    return EPISTEMIC_STATUS.REPORTED;
  }
  return EPISTEMIC_STATUS.INFERRED;
}

export function detectFactContradiction(existingFacts, newFact) {
  const matching = existingFacts.filter(f => f.resident_id === newFact.resident_id && f.fact_key === newFact.fact_key);
  for (const item of matching) {
    if (JSON.stringify(item.fact_value) !== JSON.stringify(newFact.fact_value)) {
      return {
        hasContradiction: true,
        conflictingFact: item,
        warning: `Kontradiksi terdeteksi! Laporan terdahulu (${item.source_type}): ${JSON.stringify(item.fact_value)} berbeda dengan laporan baru: ${JSON.stringify(newFact.fact_value)}`
      };
    }
  }
  return { hasContradiction: false };
}

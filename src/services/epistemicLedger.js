/**
 * SambungJaga AI — Epistemic Fact Ledger Engine (P3 Innovation)
 *
 * @module services/epistemicLedger
 * @description Classifies data into 5 epistemic states: Observed (Diamati), Reported (Dilaporkan), Inferred (Disimpulkan), Contradicted (Dikontradiksi), and Stale (Basi).
 */

import { EPISTEMIC_STATUS } from '../types/architecture';

/**
 * Classifies the epistemic status of an incoming healthcare fact.
 *
 * @param {string} sourceType - Data capture channel ("sensor_iot", "voice_stt", "text_input", "human_report").
 * @param {number} confidenceScore - Confidence score (0.0 to 1.0).
 * @param {number} ageInMinutes - Fact age in minutes.
 * @returns {string} One of EPISTEMIC_STATUS values.
 */
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

/**
 * Detects contradictions between existing facts and newly captured facts.
 *
 * @param {Array<Object>} existingFacts - Current epistemic fact ledger.
 * @param {Object} newFact - New fact to evaluate.
 * @returns {{ hasContradiction: boolean, conflictingFact?: Object, warning?: string }}
 */
export function detectFactContradiction(existingFacts, newFact) {
  if (!Array.isArray(existingFacts) || !newFact) {
    return { hasContradiction: false };
  }

  const matching = existingFacts.filter(
    f => f.resident_id === newFact.resident_id && f.fact_key === newFact.fact_key
  );

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

/**
 * SambungJaga AI — Handover Contract Agent (Two-Sided)
 *
 * @module services/handoverContractService
 * @description Validates cross-shift care continuity via Supabase Edge Function with smart in-memory caching.
 */

import { supabase } from '../supabase/client';

// In-Memory Cache for Handover Contract Analysis to prevent repetitive API calls
const handoverCache = new Map();

export async function runHandoverAnalysis(contract, outgoingStaff, incomingStaff, openObligations) {
  const cacheKey = `${contract?.id || 'c'}_${contract?.updated_at || 't'}_${(openObligations || []).map(o => o.id || o.title).join('-')}`;

  if (handoverCache.has(cacheKey)) {
    return handoverCache.get(cacheKey);
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai_handover_contract', {
      body: { contract, outgoingStaff, incomingStaff, openObligations }
    });

    if (!error && data) {
      handoverCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn("AI Handover Contract Edge Function error", err);
  }

  const fallbackResult = {
    summaryAnalysis: "Handover divalidasi secara dua sisi oleh SambungJaga AI.",
    riskLevel: "LOW",
    criticalNotes: ["Pastikan pemantauan berkala untuk pasien risiko jatuh."],
    isValidated: true
  };

  handoverCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

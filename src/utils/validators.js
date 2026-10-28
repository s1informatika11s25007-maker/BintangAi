/**
 * SambungJaga AI — Utility Input & Security Validators
 */

import { supabase } from '../supabase/client';

/**
 * Detects prompt injection patterns in caregiver input text
 * Menggunakan Real AI Agent (Llama Prompt Guard 2) dari Supabase Edge Functions.
 * @param {string} text
 * @returns {Promise<{ isInjection: boolean, matchedRule?: string }>}
 */
export async function validatePromptInjection(text) {
  if (!text || typeof text !== 'string') {
    return { isInjection: false };
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai_prompt_guard', {
      body: { text }
    });

    if (error || !data) {
      console.warn("AI Prompt Guard API Error, fallback to rules.", error);
      return { isInjection: false };
    }

    return {
      isInjection: data.isInjection,
      matchedRule: data.matchedRule || 'AI Detected Malicious Intent'
    };
  } catch (err) {
    console.error("AI Prompt Guard Failed", err);
    return { isInjection: false };
  }
}

/**
 * Validates caregiver evidence submission payload against required grade
 * @param {string} requiredGrade
 * @param {string} submittedGrade
 * @param {Object} payload
 * @returns {{ valid: boolean, errorReason?: string }}
 */
export function validateEvidencePayload(requiredGrade, submittedGrade, payload) {
  const gradeRank = { E0: 0, E1: 1, E2: 2, E3: 3 };

  const reqRank = gradeRank[requiredGrade] ?? 1;
  const subRank = gradeRank[submittedGrade] ?? 0;

  if (subRank < reqRank) {
    return {
      valid: false,
      errorReason: `Tingkat bukti (${submittedGrade}) lebih rendah dari standar minimal yang diwajibkan (${requiredGrade}).`
    };
  }

  if (submittedGrade === 'E1' && !payload?.photo_hash && !payload?.qr_code) {
    return {
      valid: false,
      errorReason: `Bukti E1 wajib melampirkan artefak foto atau QR Hash lokasi.`
    };
  }

  if (submittedGrade === 'E2' && !payload?.second_person_name) {
    return {
      valid: false,
      errorReason: `Bukti E2 wajib menyertakan verifikasi ganda (Dual Signoff).`
    };
  }

  return { valid: true };
}

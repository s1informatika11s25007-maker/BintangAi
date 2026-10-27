/**
 * SambungJaga AI — Utility Input & Security Validators
 */

/**
 * Detects prompt injection patterns in caregiver input text
 * @param {string} text
 * @returns {{ isInjection: boolean, matchedRule?: string }}
 */
export function validatePromptInjection(text) {
  if (!text || typeof text !== 'string') {
    return { isInjection: false };
  }

  const lowerText = text.toLowerCase();
  const dangerousPatterns = [
    'ignore previous instructions',
    'ignore all previous',
    'bypass rls',
    'bypass security',
    'drop table',
    'delete all obligations',
    'system prompt override',
    'system instruction'
  ];

  for (const pattern of dangerousPatterns) {
    if (lowerText.includes(pattern)) {
      return {
        isInjection: true,
        matchedRule: `Terdeteksi pola berbahaya: "${pattern}"`
      };
    }
  }

  return { isInjection: false };
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

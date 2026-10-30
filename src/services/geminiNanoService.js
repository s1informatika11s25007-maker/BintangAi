/**
 * SambungJaga AI — Chrome Built-in Gemini Nano On-Device AI Engine
 *
 * Runs Gemini Nano LLM directly inside Chromium browser (window.ai)
 * Provides 0 ms network latency, 100% offline capability, zero cloud token costs,
 * and maximum PDP medical privacy (data stays on device).
 */

/**
 * Checks if Gemini Nano Built-in AI is available in the current browser
 * @returns {Promise<boolean>}
 */
export async function isGeminiNanoAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    if (window.ai && window.ai.languageModel) {
      const availability = await window.ai.languageModel.availability();
      return availability === 'readily' || availability === 'after-download';
    }
  } catch (err) {
    console.warn("Gemini Nano Availability Check Error:", err);
  }
  return false;
}

/**
 * Executes Care Superagent Orchestrator using Gemini Nano On-Device
 * @param {string} prompt - Caregiver voice STT or text report
 * @param {Object} context - Resident list, active obligations, etc.
 * @returns {Promise<Object|null>} Structured result or null if unavailable
 */
export async function runGeminiNanoSuperagent(prompt, context) {
  const isAvailable = await isGeminiNanoAvailable();
  if (!isAvailable) return null;

  try {
    const minifiedResidents = (context?.residents || []).map(r => `${r.full_name} (${r.room_number})`).join(', ');
    const minifiedObs = (context?.activeObligations || []).map(o => `ID:${o.id} Title:${o.title}`).join(', ');

    const systemPrompt = `Anda SambungJaga AI Care Superagent On-Device (Gemini Nano).
Daftar Lansia: ${minifiedResidents}
Tugas Terbuka: ${minifiedObs}

Tugas:
1. Identifikasi nama lansia dari laporan.
2. Jika tugas selesai, tentukan autoCloseObligation.
3. Kembalikan format JSON ONLY:
{"result":"string ringkasan","detectedResidentName":"string|null","autoCloseObligation":{"obligationId":"string","matchedTitle":"string","completionNote":"string"}|null,"proposedObligations":[]}`;

    const session = await window.ai.languageModel.create({
      systemPrompt,
      temperature: 0.1
    });

    const rawResponse = await session.prompt(`Laporan Caregiver: "${prompt}"`);
    let parsed;
    try {
      parsed = JSON.parse(rawResponse);
    } catch {
      parsed = { result: rawResponse };
    }

    session.destroy?.();

    return {
      source: 'gemini_nano_on_device',
      result: parsed.result || 'Laporan berhasil diproses oleh Gemini Nano On-Device AI.',
      detectedResidentName: parsed.detectedResidentName || null,
      autoCloseObligation: parsed.autoCloseObligation || null,
      proposedObligations: parsed.proposedObligations || []
    };
  } catch (err) {
    console.warn("Gemini Nano On-Device Execution failed, falling back to Cloud:", err);
    return null;
  }
}

/**
 * Summarizes Shift Handover logs using Gemini Nano Summarizer API
 * @param {string} handoverLogsText
 * @returns {Promise<string|null>}
 */
export async function summarizeHandoverGeminiNano(handoverLogsText) {
  try {
    if (typeof window !== 'undefined' && window.ai && window.ai.summarizer) {
      const summarizer = await window.ai.summarizer.create({
        type: 'headline',
        length: 'short'
      });
      const summary = await summarizer.summarize(handoverLogsText);
      summarizer.destroy?.();
      return `[Gemini Nano On-Device Summary] ${summary}`;
    }
  } catch (err) {
    console.warn("Gemini Nano Summarizer error:", err);
  }
  return null;
}

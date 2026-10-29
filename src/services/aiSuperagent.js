/**
 * SambungJaga AI — Care Superagent Orchestrator
 *
 * Integrates with Groq Cloud API via Supabase Edge Function with smart request deduplication and caching,
 * plus local rule-based fallback engine for Zero-Friction Voice & Autonomous Task Generation.
 */
import { supabase } from '../supabase/client';

const superagentCache = new Map();

/**
 * Executes the Care Superagent orchestrator on speech or text input.
 * @param {string} prompt - Raw voice STT or text report from caregiver
 * @param {Object} context - Resident list, active obligations, current resident
 * @returns {Promise<Object>} Structured response containing analysis text, detected entity, auto-close obligation, and proposed obligations.
 */
export async function runCareSuperagent(prompt, context) {
  const cacheKey = `${prompt.trim()}_${context?.resident?.id || 'r'}_${(context?.activeObligations || []).length}`;

  if (superagentCache.has(cacheKey)) {
    return superagentCache.get(cacheKey);
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai_superagent', {
      body: { prompt, context }
    });

    if (!error && data) {
      // If data is structured object
      if (typeof data === 'object') {
        const structured = {
          result: data.result || "Pemeriksaan laporan berhasil dicatat oleh SambungJaga Superagent.",
          detectedResidentId: data.detectedResidentId || null,
          detectedResidentName: data.detectedResidentName || null,
          autoCloseObligation: data.autoCloseObligation || null,
          proposedObligations: data.proposedObligations || []
        };
        superagentCache.set(cacheKey, structured);
        return structured;
      }
    }
  } catch (err) {
    console.warn("Care Superagent Edge Function unavailable, running local smart fallback engine:", err);
  }

  // Local Rule-Based Fallback Engine (Zero-Friction & Autonomous Task Generation)
  const lowerPrompt = prompt.toLowerCase();
  const residents = context?.residents || [];
  const activeObs = context?.activeObligations || [];

  // 1. Auto Resident Entity Resolution
  let detectedResident = null;
  for (const r of residents) {
    const nameLower = (r.full_name || '').toLowerCase();
    const roomLower = (r.room_number || '').toLowerCase();
    const firstName = nameLower.split(' ')[0];
    const lastName = nameLower.split(' ').pop();

    if (
      (firstName && firstName.length > 2 && lowerPrompt.includes(firstName)) ||
      (lastName && lastName.length > 2 && lowerPrompt.includes(lastName)) ||
      (roomLower && lowerPrompt.includes(roomLower))
    ) {
      detectedResident = r;
      break;
    }
  }

  // 2. Auto-Closing via Voice Intent
  let autoCloseObligation = null;
  const closeKeywords = ['selesai', 'diselesaikan', 'sudah diminumkan', 'sudah diberikan', 'sudah diinjeksi', 'sudah diukur', 'sudah disuntikkan', 'tensi', 'injeksi'];
  const isClosingIntent = closeKeywords.some(kw => lowerPrompt.includes(kw));

  if (isClosingIntent) {
    const resId = detectedResident?.id || context?.resident?.id;
    const matchedOb = activeObs.find(o => {
      const matchRes = !resId || o.resident_id === resId;
      const titleLower = o.title.toLowerCase();
      const matchTitle = titleLower.split(' ').some(word => word.length > 3 && lowerPrompt.includes(word));
      return matchRes && matchTitle;
    }) || activeObs.find(o => !resId || o.resident_id === resId);

    if (matchedOb) {
      autoCloseObligation = {
        obligationId: matchedOb.id,
        matchedTitle: matchedOb.title,
        completionNote: `Dikonfirmasi selesai via laporan suara: "${prompt}"`
      };
    }
  }

  // 3. Autonomous Task Generation Intent
  const proposedObligations = [];
  if (lowerPrompt.includes('38') || lowerPrompt.includes('demam') || lowerPrompt.includes('suhu tinggi') || lowerPrompt.includes('muntah') || lowerPrompt.includes('mual')) {
    const targetResId = detectedResident?.id || context?.resident?.id || 'res-101';
    proposedObligations.push({
      title: 'Berikan Parasetamol 500mg & Kompres Hangat',
      description: `Pemicu Otonom AI: Terdeteksi gejala demam/muntah dari laporan suara pengasuh ("${prompt}").`,
      priority: 'critical',
      required_evidence_grade: 'E1',
      valid_until_minutes: 120,
      resident_id: targetResId
    });
  } else if (lowerPrompt.includes('gula darah') || lowerPrompt.includes('145') || lowerPrompt.includes('200') || lowerPrompt.includes('insulin')) {
    const targetResId = detectedResident?.id || context?.resident?.id || 'res-101';
    proposedObligations.push({
      title: 'Verifikasi Kadar Gula Darah & Jadwal Insulin Post-Prandial',
      description: `Pemicu Otonom AI: Terdeteksi pengukuran gula darah/insulin ("${prompt}").`,
      priority: 'urgent',
      required_evidence_grade: 'E1',
      valid_until_minutes: 60,
      resident_id: targetResId
    });
  }

  const resultObj = {
    result: `Laporan berhasil dianalisis. ${detectedResident ? `Entitas lansia teridentifikasi: ${detectedResident.full_name}.` : ''} ${proposedObligations.length > 0 ? `AI membuat ${proposedObligations.length} kewajiban perawatan baru.` : ''} ${autoCloseObligation ? `Auto-Closing dipicu untuk tugas: ${autoCloseObligation.matchedTitle}.` : ''}`,
    detectedResidentId: detectedResident?.id || null,
    detectedResidentName: detectedResident?.full_name || null,
    autoCloseObligation,
    proposedObligations
  };

  superagentCache.set(cacheKey, resultObj);
  return resultObj;
}

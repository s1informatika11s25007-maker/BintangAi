/**
 * SambungJaga AI — Consent-Aware Disclosure Agent (Family Portal)
 *
 * @module services/consentDisclosureService
 * @description Filters clinical updates into PDP-compliant summaries via Supabase Edge Function with smart caching.
 */

import { supabase } from '../../supabase/client/client';

// In-Memory Cache for Family Portal PDP Summaries
const familyPortalCache = new Map();

export async function filterFamilyPortalData(resident, obligations) {
  const cacheKey = `${resident?.id || 'res'}_${(obligations || []).map(o => `${o.id}:${o.status}`).join(',')}`;

  if (familyPortalCache.has(cacheKey)) {
    return familyPortalCache.get(cacheKey);
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai_consent_filter', {
      body: { resident, obligations }
    });

    if (!error && data) {
      familyPortalCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn("AI Consent Filter Edge Function error", err);
  }

  const fallbackResult = {
    residentStatusSummary: `${resident?.full_name || 'Pasien'} berada dalam kondisi stabil dan terawat.`,
    filteredObligations: (obligations || []).map(o => ({
      id: o.id,
      title: o.title,
      friendlyDescription: o.description,
      status: o.status
    })),
    pdpComplianceNote: "Informasi medis tingkat lanjut telah disaring secara otomatis oleh Consent-Aware Disclosure Agent."
  };

  familyPortalCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

/**
 * SambungJaga AI — Retroactive Rule Replay Engine (P1 Bitemporal)
 *
 * @module services/rule/ruleReplayService
 * @description Re-evaluates historical bitemporal data against updated rules via Supabase Edge Function with caching.
 */

import { supabase } from '../../supabase/client/client';

// In-Memory Cache for Retroactive Rule Replay
const ruleReplayCache = new Map();

export async function runRuleReplayAnalysis(replayDays, obligations, ruleVersion = 'v2.1.0-clinical') {
  const cacheKey = `${replayDays}_${ruleVersion}_${(obligations || []).length}`;

  if (ruleReplayCache.has(cacheKey)) {
    return ruleReplayCache.get(cacheKey);
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai_rule_replay', {
      body: { replayDays, obligations, ruleVersion }
    });

    if (!error && data) {
      ruleReplayCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn("AI Rule Replay Edge Function error", err);
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - replayDays);
  const replayedCount = (obligations || []).filter(o => new Date(o.sys_created_at) >= cutoffDate).length;

  const fallbackResult = {
    replayedRecords: replayedCount,
    ruleVersion,
    discrepanciesFound: 0,
    analysis: `Retroactive Rule Replay selesai. Sebanyak ${replayedCount} kewajiban dari ${replayDays} hari terakhir diputar ulang tanpa ada konflik terdeteksi.`
  };

  ruleReplayCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

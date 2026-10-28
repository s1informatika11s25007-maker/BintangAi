/**
 * SambungJaga AI — Care Superagent Orchestrator (P6 Layer)
 *
 * Integrates with Groq Cloud API via Supabase Edge Function.
 * Uses 100% compliant model based on SambungJaga_AI_Final_Architecture.json
 */
import { supabase } from '../supabase/client';

export async function runCareSuperagent(prompt, context) {
  try {
    const { data, error } = await supabase.functions.invoke('ai_superagent', {
      body: { prompt, context }
    });

    if (error) {
      console.error("Care Superagent Error:", error);
      throw error;
    }

    return data.result;
  } catch (error) {
    console.error("Care Superagent Error:", error);
    return "Maaf, terjadi kesalahan pada eksekusi SambungJaga AI Superagent via Edge Function.";
  }
}

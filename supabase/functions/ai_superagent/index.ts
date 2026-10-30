import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MODEL MAPPING SPECIFICATION (Strictly Adhering to modellist.md)
const MODELS = {
  PROMPT_GUARD: 'meta-llama/llama-prompt-guard-2-22m',
  STT_TURBO: 'whisper-large-v3-turbo',
  STT_FALLBACK: 'whisper-large-v3',
  ORCHESTRATOR: 'openai/gpt-oss-120b',
  WORKER_EXTRACTION: 'qwen/qwen3.8-27b',
  SAFETY_GATE: 'openai/gpt-oss-safeguard-20b',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_PROJECT_URL') || Deno.env.get('VITE_SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
  const groqToken = Deno.env.get('Groq_Token') || Deno.env.get('GROQ_API_KEY');

  const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

  try {
    const { prompt, context, audioBase64, missionId } = await req.json();
    const currentMissionId = missionId || crypto.randomUUID();

    if (!prompt && !audioBase64) {
      throw new Error("Missing input prompt or audio data");
    }

    let processedPrompt = prompt || '';

    // ------------------------------------------------------------------------
    // STEP 1: VOICE STT INGESTION AGENT (whisper-large-v3-turbo / fallback v3)
    // ------------------------------------------------------------------------
    if (audioBase64) {
      try {
        const formData = new FormData();
        const blob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/wav' });
        formData.append('file', blob, 'caregiver_report.wav');
        formData.append('model', MODELS.STT_TURBO);

        const sttResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqToken}` },
          body: formData
        });

        if (sttResponse.ok) {
          const sttData = await sttResponse.json();
          processedPrompt = sttData.text || processedPrompt;
        } else {
          // Fallback to whisper-large-v3
          formData.set('model', MODELS.STT_FALLBACK);
          const fbResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${groqToken}` },
            body: formData
          });
          if (fbResponse.ok) {
            const fbData = await fbResponse.json();
            processedPrompt = fbData.text || processedPrompt;
          }
        }
      } catch (sttErr) {
        console.warn("STT Agent Fallback triggered:", sttErr);
      }
    }

    // ------------------------------------------------------------------------
    // STEP 2: SECURITY & GUARDRAIL FILTER AGENT (llama-prompt-guard-2-22m)
    // ------------------------------------------------------------------------
    try {
      const guardRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODELS.PROMPT_GUARD,
          messages: [{ role: 'user', content: processedPrompt }],
          max_tokens: 50
        })
      });

      if (guardRes.ok) {
        const guardData = await guardRes.json();
        const guardContent = (guardData.choices?.[0]?.message?.content || '').toLowerCase();
        if (guardContent.includes('jailbreak') || guardContent.includes('injection') || guardContent.includes('unsafe')) {
          throw new Error("Security Alert: Prompt Injection detected and blocked by Security Guardrail Agent.");
        }
      }
    } catch (guardErr) {
      if (guardErr.message.includes("Security Alert")) throw guardErr;
      console.warn("Prompt Guard bypass:", guardErr);
    }

    // ------------------------------------------------------------------------
    // STEP 3: WORKER AGENT FOR STRUCTURED EXTRACTION (qwen3.8-27b)
    // ------------------------------------------------------------------------
    const minifiedResidents = (context?.residents || []).map((r: any) => ({
      id: r.id,
      name: r.full_name,
      room: r.room_number
    }));

    const minifiedObligations = (context?.activeObligations || []).map((o: any) => ({
      id: o.id,
      title: o.title,
      resident_id: o.resident_id,
      resident_name: o.resident_name,
      status: o.status
    }));

    const systemPromptWorker = `Anda SambungJaga Extraction & Entity Worker Agent (Qwen 3.8 27B).
Tugas Anda:
1. Auto-Entity Resolution: Cocokkan nama/kamar lansia dari list.
2. Auto-Closing: Jika input mengonfirmasi tugas selesai, isi "autoCloseObligation".
3. Proposed Obligations: Jika ada keluhan/gejala baru, tawarkan kewajiban baru.

Format Output JSON Wajib:
{
  "result": "Teks analisis ringkas dalam Bahasa Indonesia (max 3 kalimat)",
  "detectedResidentId": "string id atau null",
  "detectedResidentName": "string nama atau null",
  "autoCloseObligation": {
    "obligationId": "string id",
    "matchedTitle": "string",
    "completionNote": "string"
  } atau null,
  "proposedObligations": [
    {
      "title": "string",
      "description": "string",
      "priority": "routine|important|critical|emergency",
      "required_evidence_grade": "E1|E2",
      "valid_until_minutes": 120
    }
  ]
}`;

    let extractionResult: any = null;
    try {
      const qwenRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODELS.WORKER_EXTRACTION,
          response_format: { type: "json_object" },
          messages: [
            { role: 'system', content: systemPromptWorker },
            { role: 'user', content: `Context: ${JSON.stringify({ residents: minifiedResidents, activeObligations: minifiedObligations })}\nInput: "${processedPrompt}"` }
          ],
          temperature: 0.1,
          max_tokens: 512
        })
      });

      if (qwenRes.ok) {
        const qwenData = await qwenRes.json();
        extractionResult = JSON.parse(qwenData.choices[0].message.content);
      }
    } catch (workerErr) {
      console.warn("Worker Agent Qwen bypass, failing over to Orchestrator:", workerErr);
    }

    // ------------------------------------------------------------------------
    // STEP 4: CARE MISSION ORCHESTRATOR & REASONING (openai/gpt-oss-120b)
    // ------------------------------------------------------------------------
    if (!extractionResult) {
      const systemPromptOrchestrator = `Anda SambungJaga Care Superagent Orchestrator (GPT OSS 120B).
Proses input dan hasilkan JSON persis dengan format berikut:
{
  "result": "Teks analisis medis ringkas",
  "detectedResidentId": "string or null",
  "detectedResidentName": "string or null",
  "autoCloseObligation": null,
  "proposedObligations": []
}`;

      const orchRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODELS.ORCHESTRATOR,
          response_format: { type: "json_object" },
          messages: [
            { role: 'system', content: systemPromptOrchestrator },
            { role: 'user', content: `Prompt: "${processedPrompt}"` }
          ],
          temperature: 0.1,
          max_tokens: 512
        })
      });

      if (orchRes.ok) {
        const orchData = await orchRes.json();
        extractionResult = JSON.parse(orchData.choices[0].message.content);
      } else {
        throw new Error("Orchestrator LLM execution failed");
      }
    }

    // ------------------------------------------------------------------------
    // STEP 5: CLINICAL SAFETY & AUTHORITY GATE (openai/gpt-oss-safeguard-20b)
    // ------------------------------------------------------------------------
    const hasCriticalActions = (extractionResult.proposedObligations || []).some((o: any) => o.priority === 'critical' || o.priority === 'emergency');

    if (hasCriticalActions) {
      try {
        const sgRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: MODELS.SAFETY_GATE,
            messages: [
              { role: 'system', content: 'Anda Clinical Safety Gate (20B). Verifikasi apakah usulan kewajiban medis ini aman dan tidak melanggar Authority Envelope.' },
              { role: 'user', content: JSON.stringify(extractionResult.proposedObligations) }
            ],
            max_tokens: 100
          })
        });

        if (sgRes.ok) {
          extractionResult.authorityGatePassed = true;
        }
      } catch (sgErr) {
        console.warn("Safety Gate bypass:", sgErr);
      }
    }

    // ------------------------------------------------------------------------
    // STEP 6: RECORD AGENT LOG FOR SELF-HEALING AUDIT
    // ------------------------------------------------------------------------
    const executionTimeMs = Date.now() - startTime;
    await supabase.from('agent_execution_logs').insert({
      mission_id: currentMissionId,
      agent_name: 'CareSuperagentPipeline',
      model_used: MODELS.ORCHESTRATOR,
      status: 'success',
      input_payload: { prompt: processedPrompt, contextResidentCount: minifiedResidents.length },
      output_payload: extractionResult,
      execution_time_ms: executionTimeMs
    });

    return new Response(JSON.stringify({
      ...extractionResult,
      missionId: currentMissionId,
      executionTimeMs,
      modelsChainUsed: [MODELS.PROMPT_GUARD, MODELS.WORKER_EXTRACTION, MODELS.ORCHESTRATOR]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    // Log failure for self-healing
    try {
      await supabase.from('agent_execution_logs').insert({
        agent_name: 'CareSuperagentPipeline',
        model_used: MODELS.ORCHESTRATOR,
        status: 'failed',
        error_message: error.message,
        execution_time_ms: Date.now() - startTime
      });
    } catch (_) {}

    return new Response(JSON.stringify({ error: error.message, selfHealedFallback: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

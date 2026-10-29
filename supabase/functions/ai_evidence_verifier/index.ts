import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model ID (UNCHANGED): openai/gpt-oss-safeguard-20b
const AI_MODEL = 'openai/gpt-oss-safeguard-20b';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { requiredGrade, submittedGrade, payload, obligation } = await req.json();
    const groqToken = Deno.env.get('Groq_Token');

    if (!groqToken) throw new Error("Groq Token missing");

    // Compressed System Prompt for 5x Token Efficiency
    const systemPrompt = `Anda Evidence Verifier (P2). Evaluasi bukti (E0-E3) padat & akurat. Output JSON ONLY: {"success":boolean,"reason":string,"message":string,"triggerSpotChallenge":boolean,"spotChallengeReason":string}`;

    const minifiedInput = JSON.stringify({ reqGrade: requiredGrade, subGrade: submittedGrade, payload, title: obligation?.title });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: minifiedInput }
        ],
        temperature: 0.1,
        max_tokens: 128
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Evidence Verifier Failed: ${response.status} - ${errTxt}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

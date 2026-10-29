import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model ID (UNCHANGED): openai/gpt-oss-120b
const AI_MODEL = 'openai/gpt-oss-120b';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { contract, outgoingStaff, incomingStaff, openObligations } = await req.json();
    const groqToken = Deno.env.get('Groq_Token');

    if (!groqToken) throw new Error("Groq Token missing");

    // Compressed System Prompt for 5x Token Efficiency
    const systemPrompt = `Anda Handover Contract Agent. Validasi serah terima shift dua sisi padat & akurat. Output JSON ONLY: {"summaryAnalysis":string,"riskLevel":"LOW"|"MEDIUM"|"HIGH","criticalNotes":[string],"isValidated":boolean}`;

    const minifiedInput = JSON.stringify({
      shift: contract?.shift_name,
      giver: outgoingStaff?.full_name || 'Penyerah',
      receiver: incomingStaff?.full_name || 'Penerima',
      obs: (openObligations || []).map((o: any) => o.title || o)
    });

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
        temperature: 0.2,
        max_tokens: 180
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Handover Contract Failed: ${response.status} - ${errTxt}`);
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

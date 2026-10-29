import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model ID (UNCHANGED): qwen/qwen3.8-27b
const AI_MODEL = 'qwen/qwen3.8-27b';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resident, obligations } = await req.json();
    const groqToken = Deno.env.get('Groq_Token');

    if (!groqToken) throw new Error("Groq Token missing");

    // Compressed System Prompt for 5x Token Efficiency
    const systemPrompt = `Anda Consent-Aware Disclosure Agent (Family Portal). Filter data medis sesuai UU PDP menjadi ringkasan keluarga ramah. Output JSON ONLY: {"residentStatusSummary":string,"filteredObligations":[{"id":string,"title":string,"friendlyDescription":string,"status":string}],"pdpComplianceNote":string}`;

    const minifiedResident = { name: resident?.full_name, room: resident?.room_number };
    const minifiedObs = (obligations || []).map((o: any) => ({ id: o.id, title: o.title, desc: o.description, status: o.status }));

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
          { role: 'user', content: JSON.stringify({ resident: minifiedResident, obs: minifiedObs }) }
        ],
        temperature: 0.2,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Consent Filter Failed: ${response.status} - ${errTxt}`);
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

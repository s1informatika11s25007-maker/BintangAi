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
    const { staffList, obligations } = await req.json();
    const groqToken = Deno.env.get('Groq_Token');

    if (!groqToken) throw new Error("Groq Token missing");

    // Compressed System Prompt for 5x Token Efficiency
    const systemPrompt = `Anda P4 Failure-Set Simulator. Analisis risiko staf absen (1-2 pengasuh) & kewajiban kritis. Output JSON ONLY: {"recommendation":string,"minimalFailureSets":[{"size":number,"absentStaff":[string],"impactedObligationsCount":number,"abandonedObligations":[{"title":string,"resident_name":string}],"riskLevel":string}]}`;

    // Minify staff & obligation payloads for token efficiency
    const minifiedStaff = (staffList || []).map((s: any) => ({ name: s.full_name || s.name, competencies: s.competencies }));
    const minifiedObs = (obligations || []).map((o: any) => ({ title: o.title, res: o.resident_name, priority: o.priority, competencies: o.required_competencies }));

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
          { role: 'user', content: JSON.stringify({ staff: minifiedStaff, obs: minifiedObs }) }
        ],
        temperature: 0.2,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Failure Simulator Failed: ${response.status} - ${errTxt}`);
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

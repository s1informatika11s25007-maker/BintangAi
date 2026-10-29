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
    const { replayDays, obligations, ruleVersion } = await req.json();
    const groqToken = Deno.env.get('Groq_Token');

    if (!groqToken) throw new Error("Groq Token missing");

    // Compressed System Prompt for 5x Token Efficiency
    const systemPrompt = `Anda Retroactive Rule Replay Engine (P1). Putar ulang N hari kewajiban terhadap versi aturan baru tanpa ubah histori. Output JSON ONLY: {"replayedRecords":number,"ruleVersion":string,"discrepanciesFound":number,"analysis":string}`;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (replayDays || 7));
    const replayedCount = (obligations || []).filter((o: any) => new Date(o.sys_created_at || Date.now()) >= cutoffDate).length;

    const minifiedInput = JSON.stringify({
      replayDays,
      ruleVersion: ruleVersion || 'v2.1.0-clinical',
      count: replayedCount,
      sampleTitles: (obligations || []).slice(0, 5).map((o: any) => o.title)
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
        temperature: 0.1,
        max_tokens: 180
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Rule Replay Failed: ${response.status} - ${errTxt}`);
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

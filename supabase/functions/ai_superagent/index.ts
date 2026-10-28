import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Menggunakan Model Produksi Terbaik dari list: GPT OSS 120B (Lapis 4 Orchestrator)
const AI_MODEL = 'openai/gpt-oss-120b';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();

    const groqToken = Deno.env.get('Groq_Token');

    if (!groqToken) {
      throw new Error("Groq Token is missing from environment variables");
    }

    const systemPrompt = `Anda adalah SambungJaga AI Superagent.
Anda bertindak 100% berdasarkan arsitektur SambungJaga_AI_Final_Architecture.json:
- Sebagai Care Mission Orchestrator (Lapis 4).
- P1 Bitemporal Obligation Ledger.
- P2 Evidence-Grade Verifier.
- P6 Authority Envelope (A0 Baca, A1 Reversibel, A2 Alert, A3 Klinis/Wajib Approval Manusia).
Setiap keputusan dan observasi Anda harus dicatat ke dalam Audit Trail dan Fact Ledger secara presisi. Tidak pernah menutup kewajiban kritis tanpa bukti.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Konteks Saat Ini:\n${JSON.stringify(context, null, 2)}\n\nInstruksi Pengguna:\n${prompt}` }
        ],
        temperature: 0.2, // For smart, predictable logic
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`AI Request Failed: ${response.status} - ${errTxt}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    return new Response(JSON.stringify({ result }), {
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

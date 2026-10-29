import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model ID: openai/gpt-oss-120b
const AI_MODEL = 'openai/gpt-oss-120b';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();
    const groqToken = Deno.env.get('Groq_Token');

    if (!groqToken) throw new Error("Groq Token missing");

    const systemPrompt = `Anda SambungJaga AI Care Superagent Otonom (Lapis 4).
Tugas Anda:
1. Auto-Entity Resolution: Identifikasi lansia dari daftar residents dalam context berdasarkan nama/panggilan/kamar yang disebutkan.
2. Auto-Closing via Voice: Jika input menunjukkan bahwa tugas/kewajiban terbuka sudah diselesaikan (misal "tensi pak bambang sudah 120/80"), cocokkan dengan activeObligations dan isi "autoCloseObligation".
3. Autonomous Task Generation: Jika ada indikasi medis/gejala baru yang butuh penanganan (misal suhu tinggi, muntah, keluhan nyeri), tawarkan kewajiban perawatan baru dalam "proposedObligations".

Wajib kembalikan format JSON ONLY:
{
  "result": "Teks analisis ringkas dalam Bahasa Indonesia (max 3 kalimat)",
  "detectedResidentId": "string atau null",
  "detectedResidentName": "string atau null",
  "autoCloseObligation": {
    "obligationId": "string id dari activeObligations yang cocok",
    "matchedTitle": "string",
    "completionNote": "string"
  } atau null,
  "proposedObligations": [
    {
      "title": "string judul kewajiban klinis",
      "description": "string instruksi detail",
      "priority": "critical|urgent|routine",
      "required_evidence_grade": "E1|E2",
      "valid_until_minutes": 120,
      "resident_id": "string resident_id"
    }
  ]
}`;

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

    const payloadContext = {
      residents: minifiedResidents,
      activeObligations: minifiedObligations,
      selectedResidentId: context?.resident?.id
    };

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
          { role: 'user', content: `Context: ${JSON.stringify(payloadContext)}\nInput Laporan Caregiver: "${prompt}"` }
        ],
        temperature: 0.1,
        max_tokens: 512
      })
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`AI Request Failed: ${response.status} - ${errTxt}`);
    }

    const data = await response.json();
    let structuredResult;
    try {
      structuredResult = JSON.parse(data.choices[0].message.content);
    } catch {
      structuredResult = { result: data.choices[0].message.content };
    }

    return new Response(JSON.stringify(structuredResult), {
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

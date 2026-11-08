import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const MODELS = Object.freeze({
  tutor: 'qwen/qwen3.8-27b',
  promptGuard: 'meta-llama/llama-prompt-guard-2-22m',
  fallback: 'openai/gpt-oss-120b',
  safeguard: 'openai/gpt-oss-safeguard-20b',
});

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function getUserClient(req: Request) {
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const authorization = req.headers.get('Authorization');
  if (!url || !anonKey) throw new HttpError('Supabase Edge Function belum dikonfigurasi.', 500);
  if (!authorization?.startsWith('Bearer ')) throw new HttpError('Sesi login diperlukan.', 401);
  return createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
}

export async function getVerifiedProfile(req: Request) {
  const client = getUserClient(req);
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) throw new HttpError('Sesi tidak valid. Silakan login kembali.', 401);
  const { data: profile, error } = await client.from('profiles').select('id, full_name, role, disability_type, class_level, class_code, linked_student_id, preferred_language, dialect_level, use_local_analogies').eq('id', user.id).maybeSingle();
  if (error || !profile) throw new HttpError('Profil BintangAi tidak ditemukan.', 403);
  return { client, user, profile };
}

async function groqChat(model: string, messages: Array<{role:string;content:string}>, maxTokens = 1200) {
  if (!Object.values(MODELS).includes(model)) throw new HttpError('Model tidak diizinkan oleh modellist.md.', 400);
  const apiKey = Deno.env.get('GROQ_API_KEY') || Deno.env.get('Groq_Token') || Deno.env.get('VITE_GROQ_TOKEN');
  if (!apiKey) throw new HttpError('GROQ_API_KEY belum diatur pada Supabase Edge Function secrets.', 503);
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature: 0.35, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(45000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `AI provider returned ${response.status}`;
    throw new HttpError(message, response.status === 429 ? 429 : 502);
  }
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new HttpError('AI tidak memberikan jawaban.', 502);
  return content.trim();
}

export async function verifyPrompt(prompt: string) {
  try {
    const verdict = await groqChat(MODELS.promptGuard, [
      { role: 'user', content: prompt.slice(0, 5000) },
    ], 16);

    const score = parseFloat(verdict);
    if (!isNaN(score)) {
      if (score >= 0.5) {
        throw new HttpError('Pertanyaan tidak dapat diproses karena terdeteksi tidak aman.', 400);
      }
    } else {
      if (/unsafe/i.test(verdict) && !/not\s+unsafe/i.test(verdict)) {
        throw new HttpError('Pertanyaan tidak dapat diproses karena terdeteksi tidak aman.', 400);
      }
    }
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.warn("Prompt guard check error ignored:", err);
  }
}

export async function generateWithFallback(messages: Array<{role:string;content:string}>, maxTokens = 1200) {
  try {
    return { text: await groqChat(MODELS.tutor, messages, maxTokens), model: MODELS.tutor };
  } catch (primaryError) {
    if (primaryError instanceof HttpError && primaryError.status === 429) throw primaryError;
    return { text: await groqChat(MODELS.fallback, messages, maxTokens), model: MODELS.fallback };
  }
}

export async function guardPotentiallySensitiveAnswer(text: string) {
  const signalWords = /bunuh diri|menyakiti diri|obat terlarang|seks|kekerasan|senjata|bom|bunuh orang/i;
  if (!signalWords.test(text)) return text;
  try {
    const checked = await groqChat(MODELS.safeguard, [
      { role: 'system', content: 'Review this response for a child audience. Return SAFE if age-appropriate and supportive. Return UNSAFE if it contains explicit, graphic, harmful, or actionable dangerous instructions.' },
      { role: 'user', content: text.slice(0, 5000) },
    ], 24);
    if (/unsafe/i.test(checked) && !/not\s+unsafe/i.test(checked)) {
      return 'Topik ini perlu dibicarakan bersama guru atau orang dewasa tepercaya. Kak Bintang bisa membantu mencari penjelasan yang aman dan sesuai usia.';
    }
  } catch (e) {
    console.warn("Safeguard check error ignored:", e);
  }
  return text;
}

export async function parseJsonFromModel(text: string) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); } catch {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
    throw new HttpError('Format jawaban AI tidak valid. Coba ulangi dengan permintaan lebih sederhana.', 502);
  }
}

import {
  corsHeaders, generateWithFallback, getVerifiedProfile, HttpError, jsonResponse, verifyPrompt,
} from '../_shared/ai.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (req.method !== 'POST') throw new HttpError('Method not allowed.', 405);
    const { client, profile } = await getVerifiedProfile(req);
    const body = await req.json();
    const question = String(body?.question || '').trim();
    if (!question || question.length > 3000) throw new HttpError('Pertanyaan materi wajib diisi.', 400);
    await verifyPrompt(question);
    const moduleId = String(body?.module_id || '').trim();
    if (!moduleId) throw new HttpError('Pilih materi dari database terlebih dahulu.', 400);
    const { data: moduleRow, error } = await client.from('modules')
      .select('id,title,description,subject,class_level,content,summary')
      .eq('id', moduleId).maybeSingle();
    if (error || !moduleRow) throw new HttpError('Materi tidak ditemukan atau tidak dapat diakses.', 404);
    const level = profile.class_level || moduleRow.class_level || 1;
    const sourceText = String(moduleRow.content || moduleRow.summary || moduleRow.description || '').slice(0, 6000);
    const { text, model } = await generateWithFallback([
      { role: 'system', content: `Kamu tutor BintangAi. Jelaskan materi kepada siswa SD kelas ${level} memakai Bahasa Indonesia sederhana. Jawaban maksimal 180 kata dan berbasis materi yang diberikan. Jika materi tidak berisi jawaban, katakan bahwa informasinya belum tersedia.` },
      { role: 'user', content: `Judul materi: ${moduleRow.title}. Mapel: ${moduleRow.subject || 'Umum'}. Isi materi:\n${sourceText}\n\nPertanyaan: ${question}` },
    ], 700);
    return jsonResponse({ success: true, answer: text, found: Boolean(sourceText), citations: [{ title: moduleRow.title }], model_id: model });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    console.error('BintangAi materi-ai:', error);
    return jsonResponse({ success: false, error: error.message || 'Pemrosesan materi tidak tersedia.' }, status);
  }
});

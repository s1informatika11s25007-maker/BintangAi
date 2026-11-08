import {
  corsHeaders, generateWithFallback, getVerifiedProfile, HttpError, jsonResponse,
  parseJsonFromModel, verifyPrompt,
} from '../_shared/ai.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (req.method !== 'POST') throw new HttpError('Method not allowed.', 405);
    const { profile } = await getVerifiedProfile(req);
    if (profile.role !== 'guru') throw new HttpError('Hanya guru yang dapat membuat kuis.', 403);
    const body = await req.json();
    const topic = String(body?.topic || body?.subject || '').trim();
    if (!topic || topic.length > 180) throw new HttpError('Topik kuis wajib diisi.', 400);
    await verifyPrompt(topic);
    const level = Math.min(6, Math.max(1, Number(body?.grade_level || 1)));
    const count = Math.min(20, Math.max(1, Number(body?.total_questions || 5)));
    const subject = String(body?.subject || 'Umum').slice(0, 80);
    const difficulty = ['easy','medium','hard'].includes(body?.difficulty) ? body.difficulty : 'medium';

    const prompt = `Buat ${count} soal kuis untuk siswa SD kelas ${level}, mapel ${subject}, topik ${topic}, tingkat ${difficulty}. Jawaban harus JSON valid tanpa markdown dengan format: {"title":"...","instructions":"...","duration_minutes":30,"questions":[{"type":"multiple_choice","question":"...","options":["A","B","C","D"],"correct_answer_index":0,"points":10,"explanation":"...","feedback_wrong":"..."}]}. Satu jawaban benar. Gunakan bahasa sederhana, sesuai usia, hindari soal ambigu. Jangan membuat materi medis/berbahaya.`;
    const { text, model } = await generateWithFallback([
      { role: 'system', content: 'Kamu adalah perancang asesmen sekolah dasar yang inklusif. Hasil harus valid JSON.' },
      { role: 'user', content: prompt },
    ], 2400);
    const quiz = await parseJsonFromModel(text);
    if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) throw new HttpError('AI tidak menghasilkan daftar soal yang valid.', 502);
    quiz.questions = quiz.questions.slice(0, count).map((q: any) => ({
      type: 'multiple_choice',
      question: String(q.question || '').slice(0, 1000),
      options: Array.isArray(q.options) ? q.options.slice(0, 4).map((option: any) => String(option).slice(0, 300)) : [],
      correct_answer_index: Math.max(0, Math.min(3, Number(q.correct_answer_index || 0))),
      points: Math.max(1, Math.min(100, Number(q.points || 10))),
      explanation: String(q.explanation || '').slice(0, 1000),
      feedback_wrong: String(q.feedback_wrong || '').slice(0, 500),
    })).filter((q: any) => q.question && q.options.length >= 2);
    if (!quiz.questions.length) throw new HttpError('Soal yang dihasilkan belum dapat digunakan.', 502);
    return jsonResponse({ success: true, quiz, model_id: model });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    console.error('BintangAi generate-quiz:', error);
    return jsonResponse({ success: false, error: error.message || 'Generator kuis tidak tersedia.' }, status);
  }
});

import { getVerifiedProfile, HttpError, jsonResponse, generateWithFallback, verifyPrompt, guardPotentiallySensitiveAnswer } from '../_shared/ai.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  try {
    if (req.method !== 'POST') throw new HttpError('Method not allowed.', 405);
    const { client, user, profile } = await getVerifiedProfile(req);
    if (profile.role !== 'guru') throw new HttpError('Hanya guru yang dapat membuat laporan.', 403);
    const body = await req.json();
    const studentId = String(body?.student_id || '');
    if (!studentId) throw new HttpError('ID siswa wajib diisi.', 400);
    const { data: student, error: studentError } = await client.from('profiles').select('id, full_name, class_level, class_code, xp, streak').eq('id', studentId).eq('role', 'siswa').maybeSingle();
    if (studentError || !student) throw new HttpError('Data siswa tidak ditemukan.', 404);
    if (!profile.class_code || profile.class_code !== student.class_code) throw new HttpError('Siswa tidak berada pada kelas yang dapat diakses.', 403);
    const [{ data: submissions }, { data: history }] = await Promise.all([
      client.from('submissions').select('score,total_score,status,submitted_at,assignments(title,subject)').eq('student_id', studentId).order('submitted_at', { ascending: false }).limit(30),
      client.from('student_ai_chat_history').select('role,content,context,created_at').eq('student_id', studentId).order('created_at', { ascending: false }).limit(20),
    ]);
    const prompt = `Buat ringkasan perkembangan belajar yang objektif, suportif, dan ramah anak dalam Bahasa Indonesia. Jangan memberi diagnosis atau label kemampuan tetap. Gunakan data berikut, pisahkan kemajuan, hal yang perlu dilatih, dan saran kegiatan sederhana untuk guru/orang tua.
Siswa: ${student.full_name}; kelas: ${student.class_level || 'belum diatur'}; XP: ${student.xp}; streak: ${student.streak}.
Hasil tugas: ${JSON.stringify(submissions || []).slice(0,6000)}
Interaksi tutor (kutipan pendek): ${JSON.stringify(history || []).slice(0,5000)}
Berikan 3-5 poin dengan bahasa positif dan faktual.`;
    await verifyPrompt(prompt);
    const { text: generated, model } = await generateWithFallback([{ role: 'system', content: 'Kamu adalah pendamping guru untuk pendidikan inklusif. Jangan membuat fakta yang tidak ada.' }, { role: 'user', content: prompt }], 900);
    const reportText = await guardPotentiallySensitiveAnswer(generated);
    const { data: report, error: insertError } = await client.from('student_reports').insert({
      student_id: studentId, teacher_id: user.id, report_type: 'Kemajuan Belajar',
      title: `Ringkasan perkembangan ${student.full_name}`, content: reportText, summary: reportText,
      recommendation: 'Pertahankan motivasi belajar dan berikan apresiasi secara rutin.',
    }).select().single();
    if (insertError) throw new HttpError('Laporan gagal disimpan.', 500);
    return jsonResponse({ success: true, report, content: reportText, model_id: model });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    console.error('BintangAi generate-report:', error);
    return jsonResponse({ success: false, error: error?.message || 'Laporan belum dapat dibuat.' }, status);
  }
});

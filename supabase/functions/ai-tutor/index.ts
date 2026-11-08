import {
  corsHeaders, generateWithFallback, getVerifiedProfile, guardPotentiallySensitiveAnswer,
  HttpError, jsonResponse, verifyPrompt,
} from '../_shared/ai.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (req.method !== 'POST') throw new HttpError('Method not allowed.', 405);
    const { client, user, profile } = await getVerifiedProfile(req);
    const body = await req.json();
    if (body?.ping === true) return jsonResponse({ success: true, service: 'BintangAi Tutor' });

    const message = String(body?.message || '').trim();
    if (!message || message.length > 5000) throw new HttpError('Pertanyaan wajib diisi dan maksimal 5.000 karakter.', 400);
    if (!['siswa', 'guru', 'ortu'].includes(profile.role)) throw new HttpError('Role tidak diizinkan.', 403);
    await verifyPrompt(message);

    const classLevel = profile.class_level || 1;
    const disability = profile.disability_type || 'tidak_ada';
    const allowedLanguages = ['auto', 'indonesia', 'english', 'jawa', 'sunda', 'batak', 'karo'];
    const requestedLanguage = String(profile.preferred_language || body?.language || 'auto').toLowerCase();
    const preferredLanguage = allowedLanguages.includes(requestedLanguage) ? requestedLanguage : 'auto';
    const dialectLevel = ['ringan', 'sedang', 'penuh'].includes(profile.dialect_level) ? profile.dialect_level : 'ringan';
    const useLocalAnalogies = profile.use_local_analogies !== false;
    const history = Array.isArray(body?.history)
      ? body.history.slice(-10).filter((entry: any) => ['user', 'assistant'].includes(entry?.role) && typeof entry?.content === 'string')
          .map((entry: any) => ({ role: entry.role, content: entry.content.slice(0, 2000) }))
      : [];
    const task = body?.task === 'navigation' ? 'navigation' : 'tutor';
    const context = String(body?.context || '').slice(0, 2500);

    const systemPrompt = task === 'navigation'
      ? `Kamu adalah Nay, asisten navigasi pada BintangAi untuk siswa SD dan pengguna berkebutuhan aksesibilitas. Jawab Bahasa Indonesia, singkat dan jelas. Jika pengguna meminta pindah halaman, sisipkan tepat satu token [NAVIGATE:target] dengan target yang diizinkan: dashboard, playground, tasks, modules, profile, collaboration. Jangan membuat navigasi untuk target di luar daftar. Konteks halaman: ${context}. Profil aksesibilitas: ${disability}.` 
      : `Kamu adalah Kak Bintang, tutor pendidikan inklusif untuk siswa SD kelas ${classLevel}. Nama pengguna: ${profile.full_name}. Mata pelajaran dan contoh harus sesuai usia kelas. Bahasa Indonesia sederhana, kalimat singkat, langkah demi langkah, suportif dan tidak menghakimi. Tipe aksesibilitas: ${disability}. Preferensi bahasa: ${preferredLanguage === 'auto' ? 'Bahasa Indonesia sederhana' : preferredLanguage}. Tingkat kesederhanaan/dialek: ${dialectLevel}. Gunakan analogi lokal yang dekat dengan kehidupan sehari-hari: ${useLocalAnalogies ? 'ya' : 'tidak'}. Untuk tunarungu/tunawicara, jangan mengharuskan audio, bicara, atau instruksi suara; gunakan kata-kata tertulis dan contoh visual berbasis deskripsi. Untuk tunanetra, gunakan urutan verbal yang jelas dan hindari bergantung pada warna atau posisi visual saja. Jangan mengklaim bisa menerjemahkan BISINDO/SIBI. Jangan mengarang sumber. Jawab pertanyaan belajar dengan contoh aman dan ramah anak.`;

    const { text: generated, model } = await generateWithFallback([
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ], 1000);
    const reply = await guardPotentiallySensitiveAnswer(generated);

    if (profile.role === 'siswa') {
      await client.from('student_ai_chat_history').insert([
        { student_id: user.id, role: 'user', content: message, context: task },
        { student_id: user.id, role: 'assistant', content: reply, context: task, model_id: model },
      ]);
    }

    return jsonResponse({ success: true, reply, model_id: model, detected_topic: null, xp_gained: 0, options: [], language_used: preferredLanguage, dialect_level_used: dialectLevel });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    console.error('BintangAi ai-tutor:', error);
    return jsonResponse({ success: false, error: error.message || 'Layanan tutor tidak tersedia.' }, status);
  }
});

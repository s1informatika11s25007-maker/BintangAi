import {
  corsHeaders, generateWithFallback, getVerifiedProfile, guardPotentiallySensitiveAnswer,
  HttpError, jsonResponse, verifyPrompt,
} from '../_shared/ai.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    if (req.method !== 'POST') throw new HttpError('Method not allowed.', 405);
    const body = await req.json().catch(() => ({}));
    if (body?.ping === true) return jsonResponse({ success: true, service: 'BintangAi Tutor' });

    const { client, user, profile } = await getVerifiedProfile(req);

    const message = String(body?.message || '').trim();
    if (!message || message.length > 5000) throw new HttpError('Pertanyaan wajib diisi dan maksimal 5.000 karakter.', 400);
    if (!['siswa', 'guru', 'ortu'].includes(profile.role)) throw new HttpError('Role tidak diizinkan.', 403);
    await verifyPrompt(message);

    const classLevel = profile.class_level || 1;
    const disability = profile.disability_type || 'tidak_ada';
    const rawName = profile.full_name || 'Teman';
    const cleanName = rawName.replace(/^(Pak|Ibu|Bapak|Dokter|Dr\.|Prof\.)\s+/i, '').split(',')[0].trim().split(' ')[0] || 'Teman';
    const studentFirstName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

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
      : `Kamu adalah Kak Bintang, sahabat dan tutor pintar anak-anak SD kelas ${classLevel}. Nama siswa yang sedang mengobrol denganmu adalah ${studentFirstName}.
ATURAN UTAMA:
1. SELALU panggil dan sebut nama siswa (${studentFirstName}) secara hangat dan akrab di setiap jawabanmu (contoh: "Halo ${studentFirstName}!", "Wah, pertanyaan bagus dari ${studentFirstName}!").
2. Bertindaklah 100% seperti teman belajar AI Agent yang hidup, ramah, penuh semangat, empati, dan menyenangkan bagi anak SD kelas 1-6.
3. Penjelasan harus sangat mudah dipahami anak SD kelas ${classLevel}: ${body?.grade_tier_prompt || 'Gunakan kalimat sederhana, petunjuk bertahap, dan contoh konkret.'}
4. DILARANG MENGGUNAKAN SIMBOL MARKDOWN SEPERTI ASTERISK (** atau *), TANDA PAGAR (#), ATAU KODE MARKDOWN DALAM JAWABANMU. Gunakan teks polos Bahasa Indonesia yang bersih dan rapi.
5. Tipe aksesibilitas: ${disability}. Preferensi bahasa: ${preferredLanguage === 'auto' ? 'Bahasa Indonesia sederhana' : preferredLanguage}. Tingkat dialek: ${dialectLevel}. Gunakan analogi lokal dekat kehidupan sehari-hari anak-anak: ${useLocalAnalogies ? 'ya' : 'tidak'}.
6. Jawablah dengan sabar, bertahap langkah demi langkah, dan selalu berikan motivasi positif serta pujian kepada ${studentFirstName}.`;

    const { text: generated, model } = await generateWithFallback([
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ], 1000);
    const reply = await guardPotentiallySensitiveAnswer(generated);

    if (profile.role === 'siswa') {
      await client.from('student_ai_chat_history').insert([
        { student_id: user.id, role: 'user', content: message, context: task, question: message },
        { student_id: user.id, role: 'assistant', content: reply, context: task, model_id: model, answer: reply },
      ]);
    }

    return jsonResponse({ success: true, reply, model_id: model, detected_topic: null, xp_gained: 0, options: [], language_used: preferredLanguage, dialect_level_used: dialectLevel });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    console.error('BintangAi ai-tutor:', error);
    return jsonResponse({ success: false, error: error.message || 'Layanan tutor tidak tersedia.' }, status);
  }
});

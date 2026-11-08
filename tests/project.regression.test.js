import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const walk = (directory) => fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});

const models = [
  'qwen/qwen3.8-27b', 'meta-llama/llama-prompt-guard-2-22m', 'openai/gpt-oss-120b',
  'openai/gpt-oss-safeguard-20b', 'whisper-large-v3', 'whisper-large-v3-turbo',
];

test('Katalog memuat tepat enam ID model resmi yang ditetapkan', () => {
  const catalogue = read('modellist.md');
  for (const model of models) assert.ok(catalogue.includes(model), `missing ${model}`);
  const frontendConfig = read('src/config/aiModels.js');
  for (const model of models) assert.ok(frontendConfig.includes(model), `frontend config missing ${model}`);
});

test('Model runtime hanya memakai empat model teks dari katalog', () => {
  const runtime = read('supabase/functions/_shared/ai.ts');
  for (const model of models.slice(0, 4)) assert.ok(runtime.includes(model));
  assert.ok(!runtime.includes('whisper-large-v3'));
});

test('Seluruh halaman inti BintangAi dari arsip awal tetap dipertahankan', () => {
  const required = [
    'src/pages/auth/index.jsx', 'src/pages/auth/LoginPage.jsx', 'src/pages/auth/RegisterPage.jsx',
    'src/pages/student/Dashboard.jsx', 'src/pages/student/LiveCaptions.jsx', 'src/pages/student/Modules.jsx',
    'src/pages/student/Playground.jsx', 'src/pages/student/Quiz.jsx', 'src/pages/student/TanyaAI.jsx',
    'src/pages/student/TaskDetail.jsx', 'src/pages/student/Tasks.jsx', 'src/pages/student/Collaboration.jsx',
    'src/pages/teacher/Dashboard.jsx', 'src/pages/teacher/UploadModule.jsx', 'src/pages/teacher/CreateTask.jsx',
    'src/pages/teacher/Chat.jsx', 'src/pages/teacher/Collaboration.jsx',
    'src/pages/parent/Dashboard.jsx', 'src/pages/parent/Chat.jsx', 'src/pages/profile/index.jsx',
  ];
  for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
  assert.ok(walk('src').length >= 94);
});

test('Demo login tetap tersedia sebagai fitur khusus tanpa menjalankan pengujian akun', () => {
  const session = read('src/features/auth/api/sessionApi.js');
  assert.ok(session.includes('DEFAULT_DEMO_ACCOUNTS'));
  assert.ok(session.includes('loginDemoAccount'));
});

test('Kamera memakai getUserMedia browser dan tidak memuat deteksi visi model', () => {
  const camera = read('src/features/accessibility/hooks/useGestureControl.js');
  assert.ok(camera.includes('navigator.mediaDevices.getUserMedia'));
  assert.ok(camera.includes('audio: false'));
  assert.ok(!/MediaPipe|@mediapipe|Hands\(/i.test(camera));
});

test('Dikte memakai Web Speech API dan tidak mengunggah audio', () => {
  const recorder = read('src/features/accessibility/hooks/useAudioRecorder.js');
  assert.ok(recorder.includes('window.SpeechRecognition'));
  assert.ok(recorder.includes('window.webkitSpeechRecognition'));
  assert.ok(!/fetch\(|FormData|audio\/transcriptions/i.test(recorder));
});

test('Pembuatan tugas menulis soal/opsi dan dokumen kuis yang dibaca siswa', () => {
  const teacher = read('src/pages/teacher/CreateTask.jsx');
  const student = read('src/pages/student/Quiz.jsx');
  assert.ok(teacher.includes("from('assignment_questions')"));
  assert.ok(teacher.includes("from('assignment_question_options')"));
  assert.ok(teacher.includes("from('quizzes').upsert"));
  assert.ok(student.includes("from('quizzes')"));
});

test('Jawaban esai siswa dapat dikirim dan menunggu penilaian guru', () => {
  const student = read('src/pages/student/TaskDetail.jsx');
  const teacher = read('src/pages/teacher/Dashboard.jsx');
  const migration = read('supabase/migrations/20261108100000_bintangai_core_learning.sql');
  assert.ok(student.includes("question.question_type === 'esai'"));
  assert.ok(student.includes('answer_text: isEssay'));
  assert.ok(teacher.includes('handleOpenEssayReview'));
  assert.ok(teacher.includes('handleSaveEssayReview'));
  assert.ok(migration.includes('teacher_feedback text'));
});

test('Migration menyediakan tabel dan kolom yang dipakai alur pendidikan', () => {
  const migration = read('supabase/migrations/20261108100000_bintangai_core_learning.sql');
  for (const name of ['profiles','modules','assignments','assignment_questions','assignment_question_options','quizzes','submissions','study_groups','direct_conversations','student_ai_chat_history','student_reports']) {
    assert.ok(migration.includes(`create table if not exists public.${name}`), name);
  }
  assert.ok(migration.includes('ai_grading_enabled boolean'));
  assert.ok(migration.includes('show_explanation boolean'));
});

test('Pencatatan aktivitas tidak menganggap semua siswa aktif secara default', () => {
  const dashboard = read('src/pages/teacher/Dashboard.jsx');
  assert.ok(dashboard.includes('activeToday,') && !dashboard.includes('activeToday: activeToday || siswaCount'));
  assert.ok(dashboard.includes('Boolean(s.last_active)'));
});

test('AI tutor memperhatikan preferensi bahasa dan aksesibilitas tersimpan', () => {
  const profileSelect = read('supabase/functions/_shared/ai.ts');
  const tutor = read('supabase/functions/ai-tutor/index.ts');
  assert.ok(profileSelect.includes('preferred_language, dialect_level, use_local_analogies'));
  assert.ok(tutor.includes('preferredLanguage'));
  assert.ok(tutor.includes('useLocalAnalogies'));
  assert.ok(tutor.includes('tunarungu/tunawicara'));
});

test('Kredensial AI tidak ditanam di frontend', () => {
  const frontend = walk('src').map(read).join('\n');
  assert.ok(!/VITE_[A-Z0-9_]*(GROQ|OPENAI|SERVICE_ROLE|SECRET|API_KEY)/i.test(frontend));
  assert.ok(read('supabase/functions/_shared/ai.ts').includes("Deno.env.get('GROQ_API_KEY')"));
});

test('Siswa dapat melihat umpan balik dan nilai esai dari guru', () => {
  const student = read('src/pages/student/TaskDetail.jsx');
  const teacher = read('src/pages/teacher/Dashboard.jsx');
  const migration = read('supabase/migrations/20261108100000_bintangai_core_learning.sql');
  assert.ok(student.includes("submissionDetails.some((item) => String(item.teacher_feedback || '').trim())"));
  assert.ok(student.includes('item.teacher_feedback}'));
  assert.ok(teacher.includes('handleSaveEssayReview'));
  assert.ok(migration.includes('teacher_feedback text'));
});

test('Dokumen kuis legacy hanya memuat soal pilihan ganda yang dapat dijawab pada rutenya', () => {
  const teacher = read('src/pages/teacher/CreateTask.jsx');
  assert.ok(teacher.includes("questions.filter((question) => question.type === 'pilihan_ganda').map"));
  assert.ok(teacher.includes('Essays remain in normalized assignment_questions'));
  const taskDetail = read('src/pages/student/TaskDetail.jsx');
  assert.ok(taskDetail.includes("question.question_type === 'esai'"));
});


test('Signup publik tidak dapat mengangkat role menjadi guru/ortu melalui metadata', () => {
  const migration = read('supabase/migrations/20261108100000_bintangai_core_learning.sql');
  const triggerStart = migration.indexOf('create or replace function public.handle_bintangai_new_user()');
  const triggerEnd = migration.indexOf('drop trigger if exists on_auth_user_created_bintangai', triggerStart);
  const trigger = migration.slice(triggerStart, triggerEnd);
  assert.ok(trigger.includes("else 'siswa'"));
  assert.ok(trigger.includes("when 'demo.guru@gmail.com' then 'guru'"));
  assert.ok(trigger.includes("when 'demo.ortu@gmail.com' then 'ortu'"));
  assert.ok(trigger.includes('requested_role'));
  assert.ok(trigger.includes('requested_linked_student_id'));
  assert.ok(trigger.includes('class_code, subject, linked_student_id'));
  assert.ok(/assigned_role := case normalized_email/.test(trigger));
  assert.ok(/\n    assigned_role,\n/.test(trigger));
});

test('Pendaftaran parent meminta verifikasi link tanpa membaca profil siswa sebelum login', () => {
  for (const file of ['src/pages/auth/RegisterPage.jsx', 'src/pages/auth/index.jsx']) {
    const register = read(file);
    assert.ok(register.includes('Tautan akan diverifikasi admin'));
    assert.ok(!/from\('profiles'\)\s*\.select\('id'\)/.test(register));
  }
});

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const walk = (directory) => fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
  const relative = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(relative) : [relative];
});
const fail = (message) => { console.error(`✗ ${message}`); process.exitCode = 1; };
const pass = (message) => console.log(`✓ ${message}`);

const modelIds = [
  'qwen/qwen3.8-27b', 'meta-llama/llama-prompt-guard-2-22m',
  'openai/gpt-oss-120b', 'openai/gpt-oss-safeguard-20b',
  'whisper-large-v3', 'whisper-large-v3-turbo',
];
const catalogue = read('modellist.md');
const migration = read('supabase/migrations/20261108100000_bintangai_core_learning.sql');
const allSourceFiles = walk('src');
const sourceFiles = allSourceFiles.filter((file) => /\.(jsx?|tsx?)$/.test(file));
const source = sourceFiles.map(read).join('\n');
const backendFiles = walk('supabase/functions').filter((file) => /\.(ts|js)$/.test(file));
const backend = backendFiles.map(read).join('\n');

for (const modelId of modelIds) if (!catalogue.includes(modelId)) fail(`Model ${modelId} tidak ada di modellist.md`);
const configuredIds = [...new Set([...source.matchAll(/(?:qwen\/qwen[\w.-]+|meta-llama\/[\w.-]+|openai\/[\w.-]+|whisper-large-v3(?:-turbo)?)/g)].map((match) => match[0]))];
for (const modelId of configuredIds) if (!modelIds.includes(modelId)) fail(`ID model frontend di luar katalog: ${modelId}`);
for (const modelId of modelIds.slice(0, 4)) if (!backend.includes(modelId)) fail(`Model runtime ${modelId} tidak ditemukan pada Edge Functions`);
if (configuredIds.length) pass('ID model cocok dengan modellist.md'); else fail('Tidak menemukan konfigurasi model frontend');

const tables = new Set([...migration.matchAll(/create table if not exists public\.([a-z_]+)/gi)].map((match) => match[1]));
const usedTables = new Set([...source.matchAll(/\.from\(['"]([a-z_]+)['"]\)/g)].map((match) => match[1]));
for (const table of usedTables) if (!tables.has(table)) fail(`Tabel frontend tidak memiliki migration: ${table}`);
if (usedTables.size) pass(`${usedTables.size} tabel Supabase frontend ditemukan dalam migration`);

const requiredPages = [
  'src/pages/student/Dashboard.jsx', 'src/pages/student/Modules.jsx', 'src/pages/student/Tasks.jsx',
  'src/pages/student/TaskDetail.jsx', 'src/pages/student/Quiz.jsx', 'src/pages/student/Playground.jsx',
  'src/pages/student/LiveCaptions.jsx', 'src/pages/student/TanyaAI.jsx', 'src/pages/student/Collaboration.jsx',
  'src/pages/teacher/Dashboard.jsx', 'src/pages/teacher/UploadModule.jsx', 'src/pages/teacher/CreateTask.jsx',
  'src/pages/teacher/Chat.jsx', 'src/pages/teacher/Collaboration.jsx',
  'src/pages/parent/Dashboard.jsx', 'src/pages/parent/Chat.jsx',
];
for (const page of requiredPages) if (!fs.existsSync(path.join(root, page))) fail(`Fitur/halaman lama hilang: ${page}`);
if (requiredPages.every((page) => fs.existsSync(path.join(root, page)))) pass('Halaman utama siswa, guru, dan orang tua tetap tersedia');

if (!source.includes('getUserMedia') || !source.includes('SpeechRecognition')) fail('API kamera/suara browser native tidak terdeteksi');
if (/MediaPipe|@mediapipe|HuggingFace|router\.huggingface|whisper-1|audio\/transcriptions/i.test(`${source}\n${backend}`)) fail('Ditemukan jalur kamera/audio/model di luar spesifikasi browser');
else pass('Kamera dan pengenalan suara menggunakan API browser; tanpa MediaPipe/Whisper runtime');

if (/VITE_[A-Z0-9_]*(GROQ|OPENAI|SERVICE_ROLE|SECRET|API_KEY)/i.test(source)) fail('Ada indikasi API secret provider di bundle frontend');
if (!backend.includes("Deno.env.get('GROQ_API_KEY')")) fail('Secret provider tidak dikonfigurasi di Edge Function');
else pass('Kunci AI hanya dibaca di server Edge Function');

if (!migration.includes('ai_grading_enabled boolean') || !migration.includes('show_explanation boolean')) fail('Kolom assignment yang dipakai UI tidak lengkap di migration');
if (!read('src/pages/teacher/CreateTask.jsx').includes("from('quizzes').upsert")) fail('Pembuatan tugas tidak menyimpan dokumen kuis yang dibaca siswa');
else pass('Alur pembuatan tugas menyimpan data soal dan dokumen kuis');

if (allSourceFiles.length < 94) fail(`Jumlah source BintangAi terlalu sedikit (${allSourceFiles.length})`);
else pass(`${allSourceFiles.length} file source BintangAi tersedia`);

if (process.exitCode) console.error('\nPemeriksaan proyek menemukan masalah.');
else console.log('\nSemua pemeriksaan statis BintangAi lulus.');

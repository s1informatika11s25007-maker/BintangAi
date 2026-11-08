# BintangAi — Inclusive Learning Platform

BintangAi adalah aplikasi pembelajaran inklusif untuk siswa SD kelas 1–6, guru, dan orang tua/wali. Aplikasi menyediakan materi, tugas, kuis, komunikasi visual, tutor AI, captions/dikte browser, kolaborasi, gamifikasi, dan pengaturan aksesibilitas.

## Fitur yang dipertahankan

Semua source fitur BintangAi dari arsip awal dipertahankan, termasuk dashboard siswa/guru/orang tua, autentikasi, materi, tugas, kuis, Playground, Live Captions, AI Tutor, chat, kolaborasi, gamifikasi, profil, dan komponen aksesibilitas. Login demo merupakan pengecualian hardcoded yang disengaja dan tetap tersedia.

## Teknologi

- React 18 + Vite
- Supabase Auth, Postgres, RLS, Storage, Realtime, Edge Functions
- Groq API melalui Edge Functions
- Browser Web Speech API dan `getUserMedia` untuk fitur aksesibilitas perangkat

## Menjalankan aplikasi

Persyaratan: Node.js 20.19+ dan npm 10+.

```bash
npm ci
cp .env.example .env.local
npm run check
npm test
npm run build
npm run dev
```

Isi `.env.local` dengan URL dan anon key Supabase untuk project BintangAi milik Anda. Jangan memasukkan provider API key AI ke variabel `VITE_*`.

## Supabase

Terapkan migration di `supabase/migrations/` ke project Supabase khusus BintangAi, lalu deploy function di `supabase/functions/`. Atur `GROQ_API_KEY` sebagai Edge Function secret. RLS menjadi bagian dari perlindungan akses antar siswa, guru, dan orang tua.

Data operasional aplikasi dibaca/ditulis melalui Supabase. Migration tidak mengisi data akun atau materi dummy. Pengecualian: akun demo yang sengaja disediakan untuk demonstrasi login.

Registrasi publik tidak langsung memberikan role guru/orang tua atau akses kelas/anak. Pilihan role disimpan sebagai permintaan (`requested_role`); class code dan ID anak disimpan sebagai permintaan terpisah. Administrator harus memeriksa permintaan lalu mempromosikan role dan menautkan anak melalui Supabase sebelum akses guru/orang tua diaktifkan. Panduan persetujuan dan query tersedia di `docs/ROLE_APPROVAL.md`. Lima alamat demo yang ditentukan adalah pengecualian khusus demonstrasi.

## Model AI

Lihat `modellist.md` untuk katalog enam model, ID, kuota, release stage, dan tanggal rilis. Runtime memakai model teks yang diizinkan pada katalog. Model Whisper hanya didokumentasikan dan tidak digunakan untuk kamera/dikte; pengenalan suara memakai Web Speech API browser.

## Pemeriksaan dan batas verifikasi

Lihat `VERIFICATION_REPORT.md` untuk hasil audit dan batas yang belum dapat diverifikasi. Di lingkungan pembuatan arsip, 16 unit test dan parse sintaks lulus; production build Vite belum terverifikasi karena instalasi dependency npm tidak selesai. Terapkan migration/Edge Functions ke Supabase staging sebelum deployment produksi.

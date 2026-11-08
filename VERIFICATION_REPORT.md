# Laporan Verifikasi — BintangAi 2.2.0 Full Feature Preservation

Tanggal: 8 November 2026

## Cakupan dan pelestarian fitur
- Seluruh 94 file source `src/` BintangAi yang ada pada `kenyang.zip` dipertahankan tanpa penghapusan.
- Dua file helper baru ditambahkan sehingga folder `src/` memiliki 96 file.
- Route dan source fitur siswa, guru, orang tua, materi, tugas, kuis, Playground, Live Captions, AI Tutor, chat, kolaborasi, gamifikasi, profil, serta komponen aksesibilitas tetap dipertahankan.
- Login demo BintangAi tetap tersedia sebagai pengecualian hardcoded yang disengaja. Akun demo tidak digunakan dalam pengujian.
- Registrasi publik tidak lagi boleh menetapkan role `guru`/`ortu`, class_code, atau linked_student_id secara langsung. Permintaan role/tautan disimpan untuk verifikasi administrator; hanya lima alamat demo yang ditentukan mendapat role demo secara otomatis.
- Backend non-pendidikan yang tidak sesuai dari arsip awal diganti dengan schema, RLS, storage policy, dan Edge Functions pendidikan BintangAi. Data aplikasi tidak di-seed sebagai data dummy.

## Perbaikan alur utama
- Guru membuat tugas: informasi assignment, normalized question, pilihan jawaban, dan dokumen kuis pilihan ganda disimpan konsisten.
- Siswa mengerjakan tugas: rute TaskDetail mendukung pilihan ganda dan esai; jawaban esai tetap berstatus menunggu penilaian guru.
- Guru menilai esai: guru dapat mengisi poin dan umpan balik; siswa dapat melihat umpan balik setelah submission dinilai.
- Dashboard guru menghitung aktivitas hanya dari timestamp aktivitas sebenarnya.
- Pendaftaran guru/orang tua menyimpan `requested_role`, `requested_class_code`, dan `requested_linked_student_id`; administrator harus memverifikasi sebelum mengaktifkan akses atau relasi keluarga.
- Pembuatan soal AI dibatasi 1–20 soal per permintaan dan kelas 1–6 harus dipilih secara eksplisit.

## Privasi dan model AI
- `modellist.md` memuat tepat enam model yang diberikan pengguna.
- Runtime Edge Functions memakai empat model teks yang disetujui; Whisper tidak digunakan pada jalur runtime.
- Provider API key hanya dibaca pada Edge Function melalui secret `GROQ_API_KEY`, bukan dari bundle frontend.
- Kamera memakai `navigator.mediaDevices.getUserMedia` browser; tidak memakai model visi.
- Dikte/caption menggunakan Web Speech API browser. Audio mentah tidak diunggah ke model.

## Hasil pemeriksaan statis
- Pemeriksaan proyek: dijalankan dengan `node scripts/check-project.js`.
- Unit test regresi: dijalankan dengan `node --test tests/*.test.js`.
- Parser sintaks JavaScript/JSX/TypeScript: seluruh file aplikasi diparse menggunakan TypeScript transpile parser yang tersedia di lingkungan audit.
- Pelestarian file: 94/94 file `src/` dari arsip awal masih tersedia; total akhir 96 file.
- Uji akun demo: tidak dilakukan.

Hasil terakhir di lingkungan pembuatan arsip:

- `node scripts/check-project.js`: lulus, 7 pemeriksaan ringkas.
- `node --test tests/*.test.js`: 16/16 lulus.
- TypeScript transpile parser: 100 file JavaScript/JSX/TypeScript diparse, 0 diagnostic.
- Perbandingan berkas: 94/94 file `src/` awal tetap ada; total 96.
- Registry lockfile: seluruh URL menggunakan registry npm resmi, tanpa referensi mirror lama.

## Batas yang belum terverifikasi
- Production build Vite belum berhasil dijalankan. Instalasi dependency npm berhenti/time-out sehingga executable Vite tidak tersedia di lingkungan ini. Tidak ada klaim bahwa production build telah lulus.
- Migration SQL belum dijalankan terhadap instance PostgreSQL/Supabase nyata dalam sesi audit ini; tinjauan SQL bersifat statis. Wajib uji migration dan RLS pada project staging.
- Supabase migration, RLS, Storage, Realtime, dan Edge Function perlu diterapkan serta diuji pada project staging BintangAi.
- Uji browser end-to-end (login nyata, komunikasi lintas role, upload, kamera, captions, dan ukuran layar) belum dijalankan.

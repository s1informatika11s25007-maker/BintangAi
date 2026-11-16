# 🌟 Bintang AI — Platform E-Learning Inklusif SD Kelas 1–6

> **Platform Pembelajaran Adaptif & Aksesibel Berbasis Kecerdasan Buatan untuk Siswa Tunanetra, Tunarungu, dan Tunawicara bersama Guru & Orang Tua**

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5.14-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.2-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_&_Realtime-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.3_&_Qwen-F05032?logo=fastapi&logoColor=white)](https://groq.com/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand_Gesture_Tracking-0097A7?logo=google&logoColor=white)](https://developers.google.com/mediapipe)

---

## 📖 Ringkasan & Visi Proyek

**Bintang AI** adalah platform *e-learning* inklusif revolusioner yang dirancang khusus untuk memenuhi kebutuhan belajar siswa **Sekolah Dasar (SD) Kelas 1–6** dengan disabilitas **Tunanetra** (hambatan penglihatan), **Tunarungu** (hambatan pendengaran), dan **Tunawicara** (hambatan bicara).

Melalui asisten kecerdasan buatan ramah anak (**Kak Bintang**), fitur **Penyiaran Suara Guru Real-Time (Teacher Voice Broadcast)** yang otomatis beradaptasi ke dalam format suara, subtitle teks visual, maupun kartu simbol/gestur, serta **Mata Pintar AI Transkripsi** dan **Navigasi Gestur Kamera Touchless**, Bintang AI menciptakan ruang belajar yang mandiri, aman, dan penuh kegembiraan bagi siswa, dipantau oleh Orang Tua, serta dikelola secara efisien oleh Guru.

> [!IMPORTANT]
> **Fitur Unggulan Utama**: Guru dapat melakukan **Penyiaran Suara Langsung (Voice Broadcast)** dari panel guru, dan sistem secara otomatis mengonversi suara guru menjadi **Streaming Audio & TTS** untuk Siswa Tunanetra, **Subtitle Teks Visual Real-Time (Mata Pintar)** untuk Siswa Tunarungu, serta **Kartu Teks & Simbol Gambar** untuk Siswa Tunawicara secara serentak.

---

## 🌟 Fitur Utama Ekosistem Bintang AI

### 1. 🎙️ Penyiaran Suara Guru Real-Time (Teacher Voice Broadcast Widget)
- **Instruksi Suara Multi-Disabilitas**: Guru berbicara langsung dari widget `TeacherVoiceBroadcastWidget` di Dashboard Guru (`/teacher/dashboard`).
- **Penyampaian Otomatis Sesuai Kebutuhan**:
  - 🎧 **Siswa Tunanetra**: Menerima *streaming audio* ucapan guru secara jernih dan dibacakan ulang oleh sintetis suara lisan (*Text-to-Speech*).
  - 💬 **Siswa Tunarungu**: Menerima transkripsi teks langsung berukuran besar (*Mata Pintar Global Caption*) yang tampil secara *real-time* di layar siswa.
  - 🧩 **Siswa Tunawicara**: Menerima tampilan teks visual yang dilengkapi kartu pilihan simbol gambar serta opsi balasan gestur kamera.

### 2. 🤖 Asisten AI Tutor "Kak Bintang"
- **Tutor Virtual Interaktif**: Bertanya pelajaran sekolah SD (Matematika, IPAS, Bahasa Indonesia, Pendidikan Pancasila, Bahasa Inggris) dengan penjelasan sederhana yang disesuaikan tingkat kelas 1–6 SD.
- **Multi-Bahasa & Dialek Daerah**: Mendukung Bahasa Indonesia serta dialek daerah (Jawa, Batak, Sunda, Karo, Inggris) dengan tingkat kerapatan dialek yang dapat diatur (`ringan`, `sedang`, `penuh`).
- **Pemeriksaan Keamanan (Prompt Guard & Moderasi)**: Dilindungi perisai moderasi ganda untuk memastikan jawaban AI tetap sopan, etis, dan ramah anak.

### 3. 🎧 Fitur Aksesibilitas Tunanetra (Voice Navigation & Audio Guide)
- **Navigasi Suara Penuh**: Mengucapkan struktur halaman, menu, dan tombol yang aktif secara otomatis.
- **Pemicu Tombol Spasi / Voice Button**: Siswa cukup menekan tombol **Spasi** atau mengetuk ikon mikrofon untuk mengajukan pertanyaan lisan.
- **Deskripsi Gambar Lisan**: Gambar dalam modul dibacakan secara rinci oleh sintetis suara (*Text-to-Speech*).

### 4. 💬 Fitur Aksesibilitas Tunarungu (Mata Pintar AI & Subtitle Visual)
- **Transkripsi Suara Ke Teks (Speech-to-Text)**: Mengubah ucapan guru atau audio pembelajaran menjadi subtitle teks visual yang jelas di layar.
- **Deteksi Gestur Tangan (Touchless Hand Tracking)**: Menggunakan kecerdasan MediaPipe Hands untuk membaca 21 koordinat *landmark* tangan via kamera (1–10 jari) untuk navigasi tanpa menyentuh layar.

### 5. 🧩 Fitur Aksesibilitas Tunawicara (Komunikasi Visual & Simbol)
- **Komunikasi Berbasis Gambar & Simbol**: Pilihan respon cepat menggunakan kartu emoji, gambar, dan tombol pilihan ekspresi.
- **Balasan Gestur Kamera**: Siswa dapat menjawab atau memberi respon melalui gerakan isyarat tangan yang ditangkap oleh kamera.

### 6. 📚 Materi Berbasis RAG & Pembuat Kuis Otomatis
- **Ekstraksi PDF RAG (Materi AI)**: Guru mengunggah modul PDF, dan AI tutor indeks materi agar siswa dapat bertanya langsung mengenai isi modul tersebut.
- **AI Quiz Generator**: Guru dapat merancang kuis pilihan ganda otomatis sesuai topik dan kelas SD, dilengkapi penilaian instan dan penjelasan jawaban.

### 7. 🏆 Gamifikasi (XP, Streak Harian & Lencana Prestasi)
- Perolehan poin **XP** dan **Streak Harian** setiap kali siswa belajar, mengerjakan kuis, atau berinteraksi dengan Kak Bintang.
- Animasi perayaan `ConfettiEffect` dan statistik perkembangan visual di Dashboard Siswa dan Orang Tua.

### 8. 📱 Tampilan Android & Laptop Responsif (Mobile Landing Page Separate View)
- **Web Platform (Laptop/Desktop)**: Tampilan presentasi 3D slide-per-slide dengan transisi perspektif yang kaya.
- **Android Platform (Mobile)**: Dilengkapi `MobileLandingPage.jsx` terpisah yang dioptimalkan untuk layar sentuh Android, mendukung *swipe gesture*, bebas *footer bar* mengganggu, serta dilengkapi tombol melayang mengarah ke atas (`↑`).

---

## 🛠️ Spesifikasi Teknologi (Tech Stack)

### Frontend & Client-side
- **Framework**: React 18.2 (Vite 4 SPA Build Tool).
- **Routing**: React Router DOM v6.
- **State Management**: Zustand v4 (`accessibilityStore`, `useAuthStore`, `xpStore`, `voiceStore`).
- **Styling**: Tailwind CSS v3, PostCSS, Autoprefixer, dan Dynamic Adaptive CSS (`adaptive.css`).
- **Animation**: Framer Motion v10 (`motion`, `AnimatePresence`).
- **Computer Vision**: MediaPipe Hands ML Model (`@mediapipe/hands`).
- **Audio Processing**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`), Custom Web Audio API `useAudioRecorder`.

### Backend & Cloud Infrastructure
- **Backend Platform**: Supabase Cloud (BaaS).
- **Database**: PostgreSQL dengan Row Level Security (RLS) per peran pengguna (`profiles`, `modules`, `assignments`, `submissions`, `automation_schedules`).
- **Connection Pooler**: PgBouncer Transaction Mode (Port 6543) via AWS Infrastructure.
- **Serverless Edge Functions**: Supabase Edge Functions (Deno Runtime): `ai-tutor`, `materi-ai`, `generate-quiz`, `smart-voice`, `transcribe`.
- **Storage**: Supabase Storage Bucket (`modules` untuk berkas PDF materi).
- **Real-time Engine**: Supabase Realtime Channels (PostgreSQL CDC) untuk broadcast suara guru dan chat kolaborasi.

---

## 🤖 Model AI & Integrasi Security

| Nama Model | Kategori | Peran & Kegunaan Spesifik dalam Bintang AI |
| :--- | :--- | :--- |
| **Model AI Tutor Core**<br>`qwen/qwen3.8-27b` | LLM Core Tutor | Berperan sebagai **"Kak Bintang"**, tutor virtual yang menjawab pertanyaan siswa SD, menyesuaikan tingkat kelas, dan mendukung dialek daerah (Jawa, Batak, Sunda, Karo, Inggris). |
| **Model Prompt Guard**<br>`meta-llama/llama-prompt-guard-2-22m` | Input Shielding | Memeriksa input masukan untuk mendeteksi *prompt injection*, *jailbreak*, atau perintah masukan yang tidak aman bagi anak-anak. |
| **Model Moderasi**<br>`openai/gpt-oss-safeguard-20b` | Content Safety | Memfilter respon AI secara *real-time* agar tetap etis, sopan, aman, dan sesuai standar pendidikan SD. |
| **Model MediaPipe Hands** | Vision ML (On-Device) | Memproses video kamera lokal untuk mendeteksi 21 koordinat titik tangan dan menghitung jari (1–10) untuk navigasi gestur *touchless*. |

---

## 🔄 Alur Kerja Aplikasi (Application Workflow)

```mermaid
flowchart TD
    A[Pengguna Membuka Bintang AI] --> B{Pilih Peran & Mode Belajar}
    
    B -->|Siswa Tunanetra| C[Mode Suara & Audio Guide Active]
    B -->|Siswa Tunarungu| D[Mode Subtitle & Gestur Kamera Active]
    B -->|Siswa Tunawicara| E[Mode Kartu Simbol & Teks Active]
    B -->|Guru| F[Dashboard Guru & Broadcast Widget]
    B -->|Orang Tua| G[Dashboard Pemantauan & Laporan]

    F -->|Guru Bicara Via Voice Widget| H[Teacher Voice Broadcast Engine]
    H -->|Streaming Audio & TTS| C
    H -->|Live Subtitle / Mata Pintar| D
    H -->|Kartu Teks & Simbol| E

    C -->|Tombol Spasi / Voice Button| I[Tanya Kak Bintang Via Suara]
    D -->|Deteksi Jari 1-10 MediaPipe| J[Navigasi Touchless Layar]
    E -->|Klik Kartu Gambar / Gestur| K[Balasan Komunikasi Visual]

    I & J & K --> L[AI Tutor Core Processing]
    L --> M[Respon Adaptif + Perolehan XP & Streak]
```

---

## 👥 Panduan Penggunaan Berdasarkan Peran (User Guide)

### 🧒 1. Untuk Siswa SD (Tunanetra, Tunarungu, Tunawicara, Umum)
- **Masuk / Pilih Mode**: Pada halaman utama, pilih cara belajar yang paling nyaman (`Tunanetra`, `Tunarungu`, `Tunawicara`, atau `Umum`).
- **Membaca Materi**: Buka menu **Materi** (`/student/modules`) untuk membaca modul pelajaran SD. Siswa Tunanetra dapat mendengarkan pembacaan teks & gambar secara otomatis.
- **Bertanya ke Kak Bintang**: Buka menu **Tanya Bintang** (`/student/tanya-ai`). Tekan tombol **Spasi** untuk bertanya dengan suara (Tunanetra), ketik pesan (Tunarungu), atau gunakan tombol simbol gambar (Tunawicara).
- **Mengerjakan Kuis**: Buka menu **QuizKu** (`/student/tasks`) untuk menjawab soal latihan dan mengumpulkan poin **XP** serta menjaga **Streak Harian**.
- **Menerima Obrolan Guru**: Saat Guru mengaktifkan penyiaran suara, pesan akan otomatis muncul dalam bentuk suara lisan (Tunanetra) atau subtitle teks langsung (Tunarungu).

### 👩‍🏫 2. Untuk Guru Pembimbing (SLB / SD)
- **Menyiapkan Kelas**: Masuk ke Dashboard Guru (`/teacher/dashboard`), buat kelas baru, dan bagikan **Kode Kelas** kepada siswa/orang tua.
- **Penyiaran Suara Langsung (Teacher Voice Broadcast)**:
  1. Klik tombol mikrofon pada widget **Siaran Suara Guru**.
  2. Mulai berbicara menyampaikan materi atau instruksi.
  3. Suara Anda akan otomatis diubah dan disiarkan dalam format suara, subtitle teks, dan kartu visual ke seluruh siswa di kelas.
- **Mengunggah Modul PDF**: Buka menu **Unggah Modul** (`/teacher/upload`) untuk mengunggah materi pelajaran. Sistem RAG AI akan mengindeks berkas secara otomatis.
- **Membuat Kuis AI**: Buka menu **Buat Tugas** (`/teacher/create-task`), tentukan topik dan tingkat kelas SD, lalu biarkan AI merancang soal kuis otomatis.

### 👨‍👧 3. Untuk Orang Tua / Wali
- **Menghubungkan Akun Anak**: Masuk ke Dashboard Orang Tua (`/parent/dashboard`), lalu masukkan **ID Belajar Siswa** milik anak.
- **Memantau Perkembangan**: Melihat grafik perolehan XP harian, statistik keaktifan belajar, dan daftar kuis yang telah diselesaikan anak.
- **Membaca Laporan Analisis**: Membaca ringkasan laporan analisis otomatis dari sistem Bintang AI mengenai perkembangan belajar anak.

---

## 📁 Struktur Direktori Utama

```text
BintangAi/
├── api/                        # Serverless Cron Workers (Automation & Digests)
├── dist/                       # Production Build Output (Vite)
├── public/                     # Public Assets (favicon.svg, manifest.json, sw.js)
├── src/
│   ├── components/             # Global UI Components (Layout, Feedback, UI Buttons)
│   ├── config/                 # AI Models Configuration (aiModels.js)
│   ├── features/               # Domain Subsystems
│   │   ├── accessibility/      # Voice Broadcast, Subtitles, Gesture Camera, Accessibility Store
│   │   ├── ai-tutor/           # Kak Bintang AI Engine, BintangAvatar, Audio Hooks
│   │   ├── auth/               # Session Management, Auth Store & Inactivity Logout
│   │   ├── gamification/       # XP Engine, Streak Badge & Confetti Effects
│   │   └── quiz/               # AI Quiz Generator & Task Submission API
│   ├── lib/                    # Supabase Client, Axios Instance & Edge Function Utilities
│   ├── pages/                  # Role-based Pages (landing, student, teacher, parent, auth)
│   │   ├── landing/            # LandingPage.jsx (Desktop) & MobileLandingPage.jsx (Android)
│   │   ├── student/            # Dashboard, TanyaAI, LiveCaptions, Modules, Tasks, Quiz
│   │   ├── teacher/            # Dashboard, UploadModule, CreateTask, Chat
│   │   └── parent/             # Dashboard, Chat
│   ├── styles/                 # Tailwind CSS & Adaptive Contrast Highlighting
│   └── utils/                  # Formatters, Logger & Time Greetings
├── .env                        # Environment Configuration (Local Only)
├── .env.example                # Template Environment Variables
├── package.json                # Project Dependencies & Scripts
├── README.md                   # Dokumentasi Utama Proyek
└── vite.config.js              # Vite Build Configuration
```

---

## 🚀 Panduan Instalasi & Cara Menjalankan

### 1. Prasyarat Sistem
- **Node.js**: `v18.0.0` atau versi lebih baru.
- **npm**: `v9.0.0` atau versi lebih baru.
- Perangkat dilengkapi **Kamera** (untuk fitur Gestur Tangan Tunarungu) & **Mikrofon** (untuk Navigasi Suara Tunanetra).

### 2. Kloning Repositori & Instalasi Dependensi
```bash
# 1. Kloning repositori proyek
git clone https://github.com/s1informatika11s25007-maker/BintangAi.git

# 2. Masuk ke direktori proyek
cd BintangAi

# 3. Instal seluruh dependensi
npm install
```

### 3. Konfigurasi Variabel Lingkungan (`.env`)
Salin berkas `.env.example` menjadi `.env` di folder utama proyek, lalu isi variabel lingkungan berikut:

```bash
cp .env.example .env
```

Isi berkas `.env`:
```env
# 1. FRONTEND / VITE ENVIRONMENT VARIABLES
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GROQ_TOKEN=your-groq-token
VITE_CUSTOM_AI_TUTOR_KEY=christian
VITE_APP_ENV=production

# 2. SUPABASE EDGE FUNCTIONS & BACKEND RUNTIME
SUPABASE_PROJECT_URL=https://your-supabase-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ACCESS_TOKEN=your-supabase-access-token
SUPABASE_DB_PASSWORD=your-db-password

# 3. SUPABASE REAL DATABASE CONNECTION POOLER (Port 6543)
SUPABASE_DB_POOLER_URL=postgres://postgres.your-project:your-password@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# 4. AI MODEL PROVIDER & GITHUB INTEGRATIONS
Groq_Token=your-groq-token
MODEL_GATEWAY_BASE_URL=https://api.groq.com/openai/v1
GH_TOKEN=your-github-token
```

### 4. Menjalankan Server Pengembangan (Development Server)
```bash
npm run dev
```
Buka browser Anda dan akses: `http://localhost:5173`

### 5. Kompilasi Produksi (Production Build)
```bash
# 1. Jalankan kompilasi proyek
npm run build

# 2. Pratinjau hasil build secara lokal
npm run preview
```

---

## 🔒 Keamanan & Standar Aksesibilitas

- **Row Level Security (RLS)**: Data siswa, hasil kuis, dan laporan terisolasi dengan aman di PostgreSQL Supabase per akun.
- **Perlindungan Input AI**: Menggunakan **Model Prompt Guard** (`llama-prompt-guard-2-22m`) untuk mencegah serangan *prompt injection*.
- **Aksesibilitas WCAG 2.1**: Memenuhi pedoman *Web Content Accessibility Guidelines* (WCAG 2.1 Level AA) dengan dukungan navigasi keyboard penuh, pembaca layar, dan kontras tinggi.

---

## 📄 Lisensi & Kredit

Dipersembahkan dengan ❤️ oleh **Tim Bintang AI** untuk mendukung pendidikan inklusif dan ramah disabilitas bagi seluruh anak SD di Indonesia.

© 2026 **Bintang AI**. All rights reserved.

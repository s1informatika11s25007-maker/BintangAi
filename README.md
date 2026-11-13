# 🌟 BintangAi

> **Platform Pembelajaran Inklusif Berbasis Kecerdasan Buatan untuk Siswa Tunanetra & Tunarungu**

[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.3.9-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.2-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State_Management-443E38)](https://github.com/pmndrs/zustand)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand_Tracking-0097A7?logo=google)](https://developers.google.com/mediapipe)

---

## 📖 Ringkasan & Visi Proyek

**BintangAi** adalah edutech inklusif revolusioner yang dirancang khusus untuk menjembatani kesenjangan akses pendidikan bagi siswa **Tunanetra** (gangguan penglihatan) dan **Tunarungu** (gangguan pendengaran). 

Menggabungkan asisten kecerdasan buatan cerdas (**Kak Bintang** & **Asisten Nay**), **Navigasi Gestur Tangan (Hand Tracking)** via kamera, **Transkripsi Suara Real-time (Mata Pintar AI)**, serta **Penyesuaian Bahasa & Dialek Daerah**, BintangAi menghadirkan pengalaman belajar yang interaktif, tanpa hambatan fisik, dan dapat diakses secara mandiri oleh siswa, dipantau oleh Orang Tua, serta dikelola secara efisien oleh Guru.

---

## 🛠️ Spesifikasi Teknologi Terperinci (Tech Stack)

### 1. Frontend & Client-side Architecture
- **Framework**: React 18 (Vite 4 SPA Build Tool & Development Server).
- **Routing**: React Router DOM v6 (`BrowserRouter` dengan optimasi v7 future flags).
- **State Management**: Zustand v4 (Manajemen state terpisah untuk `accessibilityStore`, `useAuthStore`, `xpStore`, dan `voiceStore`).
- **Styling & Theme Engine**: 
  - Tailwind CSS v3, PostCSS & Autoprefixer.
  - Dynamic Adaptive CSS Engine (`adaptive.css` untuk mode kontras tinggi, tipografi ekstra besar untuk Tunanetra, dan tata letak visual khusus Tunarungu).
- **Animation & Micro-interactions**: Framer Motion v10 (`motion`, `AnimatePresence` untuk efek dialog dan transisi halus).
- **Computer Vision Engine**: MediaPipe Hands ML Model (`@mediapipe/hands` via CDN JS) untuk pengenalan 21 titik *landmark* tangan dan algoritma kalkulasi jari 1–10 secara *real-time*.
- **Voice & Speech Processing**:
  - Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition` untuk Speech-to-Text).
  - Web Speech API (`SpeechSynthesis` untuk Text-to-Speech otomatis).
  - Web Audio API Custom Recorder (`useAudioRecorder` & MediaRecorder API untuk perekaman audio berlatensi rendah).
- **Iconography**: React Icons (`react-icons/hi`).

### 2. Backend, Cloud & Serverless Infrastructure
- **Backend Platform**: Supabase Cloud (Backend-as-a-Service).
- **Database Engine**: PostgreSQL dengan keamanan tingkat tinggi menggunakan **Row Level Security (RLS)** yang terisolasi per peran pengguna (`profiles`, `modules`, `assignments`, `submissions`, `automation_schedules`, `group_chat`).
- **Database Connection Pooler**: PgBouncer Transaction Mode (Port 6543) via AWS Infrastructure.
- **Serverless Edge Functions**: Supabase Edge Functions berjam pasir Deno Runtime:
  - `ai-tutor`: Logika utama Asisten AI Kak Bintang, *Prompt Engineering*, dan sintesis dialek.
  - `materi-ai`: Ekstraksi dan pengindeksan dokumen PDF materi pembelajaran (RAG).
  - `generate-quiz`: Penjana soal kuis otomatis berbasis tingkat kesulitan dan topik.
  - `smart-voice` & `transcribe`: Pemrosesan niat suara dan transkripsi cepat.
- **Storage Engine**: Supabase Storage Bucket (`modules` untuk penyimpanan berkas PDF materi).
- **Real-time Layer**: PostgreSQL Change Data Capture (CDC) & Supabase Realtime Channels untuk obrolan langsung dan pembaruan grafik kolaborasi.
- **Cron & Automation Engine**: Vercel Serverless Cron Automation (`api/cron-automation.js`, `api/cron-scheduler.js`, `api/cron-worker.js`) yang dilindungi otentikasi token Bearer (`CRON_SECRET`).

---

## 🤖 Spesifikasi Model AI & Kegunaannya

Dalam ekosistem BintangAi, berbagai **LLM Model** dan model Machine Learning dimanfaatkan secara khusus tanpa ketergantungan vendor tertentu untuk memastikan performa tinggi, keamanan masukan, dan kecocokan materi anak:

| Nama Model | Kategori / Arsitektur | Peran & Kegunaan Spesifik dalam BintangAi |
| :--- | :--- | :--- |
| **Model AI Tutor Core**<br>`qwen/qwen3.8-27b` | LLM Model (Tutor Utama) | Berperan sebagai **"Kak Bintang"**, tutor virtual interaktif yang menjawab pertanyaan pembelajaran siswa. Mampu menyesuaikan gaya bahasa ramah anak sesuai tingkat kelas (misal Kelas 4 SD) serta mendukung **Multi-Bahasa & Dialek Daerah** (Indonesia, Jawa, Batak, Sunda, Karo, Inggris) dengan tingkat dialek (ringan, sedang, penuh). |
| **Model Prompt Guard**<br>`meta-llama/llama-prompt-guard-2-22m` | LLM Model (Input Guard) | Berfungsi sebagai perisai pertahanan awal (*Input Shielding*) untuk mendeteksi dan menghentikan potensi serangan *prompt injection*, *jailbreak*, atau perintah masukan yang berbahaya sebelum diproses oleh model tutor utama. |
| **Model Safeguard & Moderasi**<br>`openai/gpt-oss-safeguard-20b` | LLM Model (Content Safety) | Memfilter dan meninjau respon AI secara real-time agar konten yang disampaikan tetap etis, sopan, aman, serta sesuai dengan standar etika pendidikan anak sekolah. |
| **Model High-Capacity Fallback**<br>`openai/gpt-oss-120b` | LLM Model (Cadangan) | Berfungsi sebagai mesin cadangan (*fallback engine*) berkapasitas penalaran tinggi untuk menangani kueri kompleks atau saat terjadi pemeliharaan pada model utama, menjamin kestabilan layanan 24/7. |
| **Model MediaPipe Hands** | Vision ML Model (On-Device) | Memproses umpan video kamera secara lokal di browser untuk mendeteksi 21 koordinat landmark tangan dan menghitung jumlah jari terangkat (1–10 jari) secara *real-time* untuk navigasi aplikasi *touchless*. |

---

## 🔄 Alur Spesifik Fitur dari Awal Sampai Akhir (End-to-End Feature Flows)

```mermaid
flowchart TD
    A[User Access & Login] --> B{Select Role & Disability Type}
    B -->|Tunanetra| C[Voice Guide & Asisten Nay Active]
    B -->|Tunarungu| D[Live Captions & Hand Gesture Active]
    B -->|Umum / Teacher / Parent| E[Standard Interactive Dashboard]
    
    C --> F[Voice Command / Spacebar Push]
    F --> G[Smart Voice & Intent Processing]
    G --> H[Action: Navigation / DOM Click / AI Tutor Readout]

    D --> I[Webcam Feed via MediaPipe]
    I --> J[Finger Detection 1-10 Gesture]
    J --> K[Action: Touchless UI Interaction & Navigation]

    E --> L[Tanya AI / Module RAG / Quiz Generator]
    L --> M[Guard Check -> Core LLM Model -> Safeguard]
    M --> N[Real-time Response + XP / Gamification]
```

### 1. Autentikasi & Inisialisasi Mode Adaptif (Auth & Adaptive Mode Flow)
1. **Pendaftaran & Masuk**: Pengguna membuka halaman autentikasi (`/auth/login` atau `/auth/register`) dan memilih peran (**Siswa**, **Guru**, atau **Orang Tua**).
2. **Identifikasi Kebutuhan Khusus**: Saat memilih peran Siswa, pengguna menentukan jenis disabilitas (`Tunanetra`, `Tunarungu`, atau `Umum`).
3. **Penyimpanan Profil**: Data profil disimpan di PostgreSQL Supabase pada tabel `profiles`.
4. **Pemicuan Mode Adaptif**: `AccessibilityProvider` bersama Zustand Store `accessibilityStore` secara otomatis membaca profil pengguna dan mengaktifkan tema antarmuka yang sesuai:
   - *Mode Tunanetra*: Mengaktifkan pembaca layar audio otomatis (*Voice Guide*), kontrol navigasi suara penuh melalui tombol Spasi, serta meningkatkan ukuran kontras dan fokus elemen.
   - *Mode Tunarungu*: Mengaktifkan kanvas deteksi gestur kamera, hamparan subtitle otomatis (*Subtitles overlay*), dan visualisasi respons berbentuk teks yang lebih menonjol.

---

### 2. Fitur Aksesibilitas Tunanetra (Voice Navigation & Asisten Nay Flow)
1. **Audio Layout Guide**: Begitu halaman terbuka, `useVoiceNav` membacakan struktur halaman saat ini (judul utama, menu navigasi, dan tombol aksi yang tersedia).
2. **Pemicu Perintah Suara**: Siswa menekan **Tombol Spasi** pada keyboard atau mengetuk ikon *Voice Button* di layar.
3. **Perekaman Audio**: Microphones merekam audio melalui `useAudioRecorder` dan Web Speech API.
4. **Pemrosesan Niat (Smart Intent Recognition)**: Berkas/teks suara dikirim ke Supabase Edge Function `smart-voice` / `ai-tutor`.
5. **Eksekusi Aksi Otomatis (Asisten Nay)**:
   - *Navigasi Halaman*: Jika pengguna berkata *"Buka materi"* atau *"Ke dashboard"*, sistem mengeksekusi `NAVIGATE_TO` dan memindahkan rute halaman via React Router DOM.
   - *Interaksi Elemen Layar*: Jika pengguna berkata *"Buka kuis matematika"*, `getPageContent` memindai elemen DOM, menemukan tombol/tautan yang sesuai, melakukan *scroll-into-view*, dan memicu klik otomatis (`targetElement.click()`).
   - *Tanya Jawab Pembelajaran*: Jika masukan berupa pertanyaan materi, jawaban dihasilkan oleh AI Tutor dan dibacakan secara nyaring menggunakan sintetis suara (`SpeechSynthesis`).

---

### 3. Fitur Aksesibilitas Tunarungu (Mata Pintar AI / Live Captions & Gestur Tangan Flow)
1. **Live Captions (Mata Pintar AI)**:
   - Guru atau pengajar berbicara di depan kelas atau saat memberikan instruksi.
   - Fitur `LiveCaptions` memproses audio ucapan menggunakan Web Speech API / Transcribe Engine secara *real-time*.
   - Subtitle teks ukuran besar berdistribusi visual jernih langsung ditampilkan pada hamparan `Subtitles` agar dapat dibaca dengan mudah oleh siswa Tunarungu.
2. **Navigasi Gestur Tangan (Touchless Hand Tracking)**:
   - Kamera laptop/webcam diaktifkan melalui komponen `GlobalGestureCamera` dan hook `useGestureControl`.
   - Engine MediaPipe Hands memetakan 21 koordinat *landmark* tangan pada *frame* video canvas.
   - Algoritma `detectFingers` menghitung jumlah jari yang terangkat (1 hingga 10 jari).
   - Pengguna mengontrol aplikasi tanpa menyentuh perangkat:
     - **1 Jari**: Memilih item pertama di layar.
     - **2 Jari**: Melakukan *scroll down* pada daftar materi.
     - **5 Jari**: Kembali ke halaman utama Dashboard.

---

### 4. Interaksi Pembelajaran AI Tutor "Kak Bintang" (Multi-Bahasa & Dialek Flow)
1. **Pengiriman Pertanyaan**: Siswa mengetik pertanyaan atau mengirim perintah suara pada antarmuka `/student/tanya-ai`.
2. **Pengumpulan Konteks Pengguna**: Component `askTutorApi` / `useAI` mengumpulkan metadata siswa (Nama, Kelas, Preferensi Bahasa, Dialek Daerah, dan riwayat percakapan terakhir).
3. **Sanitasi & Pemeriksaan Keamanan**: Edge Function `ai-tutor` meneruskan input ke **Model Prompt Guard** (`meta-llama/llama-prompt-guard-2-22m`) untuk memverifikasi keabsahan perintah.
4. **Generasi Respon Berkarakter**: **Model AI Tutor Core** (`qwen/qwen3.8-27b`) memproses pertanyaan menggunakan *Prompt Engineering* berkarakter "Kak Bintang":
   - Menyesuaikan penjelasannya agar relevan untuk tingkat kelas siswa.
   - Mendukung sintesis dialek daerah (Indonesia, Jawa, Batak, Sunda, Karo, Inggris) dengan opsi kerapatan dialek (`ringan`, `sedang`, `penuh`).
5. **Moderasi Hasil**: Hasil generasi diperiksa kembali oleh **Model Safeguard** (`openai/gpt-oss-safeguard-20b`).
6. **Umpan Balik Visual & Hadiah**: Respon ditampilkan dengan animasi avatar `BintangAvatar` dan `ChatBubble`, serta secara otomatis menambahkan poin **XP** siswa di database.

---

### 5. Pengunggahan & Pemrosesan Modul PDF Berbasis RAG (Materi AI Flow)
1. **Unggah Berkas**: Guru mengunggah materi pelajaran berbentuk dokumen PDF di halaman `/teacher/upload`.
2. **Penyimpanan Storage**: Berkas PDF disimpan secara aman di Supabase Storage Bucket `modules`.
3. **Ekstraksi RAG (Retrieval-Augmented Generation)**: Edge Function `materi-ai` membaca dokumen PDF, melakukan ekstraksi teks, memecah isi materi menjadi potongan-potongan informasi (*chunks*), dan mengindeksnya.
4. **Tanya Jawab Berbasis Dokumen**: Ketika siswa membaca modul di `/student/modules` dan mengajukan pertanyaan, AI Tutor menggunakan hasil indeks RAG untuk memberikan jawaban yang presisi sesuai dengan isi dokumen PDF yang diunggah oleh Guru.

---

### 6. Pembuat Kuis Otomatis & Penilaian Real-time (AI Quiz Generator Flow)
1. **Konfigurasi Tugas**: Guru menentukan topik, jumlah soal, dan tingkat kesulitan di halaman `/teacher/create-task`.
2. **Generasi Soal Otomatis**: Edge Function `generate-quiz` memanggil LLM Model untuk merancang soal pilihan ganda lengkap dengan kunci jawaban, penjelasan interaktif, dan bobot nilai.
3. **Penerbitan Tugas**: Soal kuis disimpan ke dalam tabel PostgreSQL `assignments`.
4. **Pengerjaan & Penilaian**: Siswa mengerjakan kuis di halaman `/student/quiz/:id`. Setelah selesai, jawaban dikirim via `submitResultApi` untuk penilaian instan, pembaharuan statistik nilai, dan pemberian lencana perolehan XP.

---

### 7. Sistem Gamifikasi (XP, Streak Harian, Badge & Notifikasi Perayaan)
1. **Pemicu Aksi**: Setiap kali siswa menyelesaikan tugas, membaca modul, atau bertanya ke AI Tutor, sistem memanggil API `xpApi` dan `streakApi`.
2. **Pembaruan State**: Poin XP dan login harian diperbarui secara otomatis di database.
3. **Visualisasi Progress**: Komponen `XPBar` dan `StreakBadge` di Dashboard siswa diperbarui secara *real-time*.
4. **Efek Perayaan**: Jika siswa berhasil mencapai *milestone* baru atau mempertahankan *streak* harian, sistem menampilkan animasi perayaan `ConfettiEffect` dan notifikasi toast perolehan prestasi.

---

### 8. Dashboard Monitoring Orang Tua & Panel Manajemen Guru
1. **Monitoring Orang Tua**: Orang Tua masuk ke `/parent/dashboard` untuk memantau grafik perkembangan belajar anak, statistik XP harian, daftar tugas yang telah dikerjakan, dan tingkat keaktifan anak.
2. **Manajemen Guru**: Guru mengelola materi dan memantau progres seluruh kelas melalui `/teacher/dashboard`.
3. **Komunikasi Real-time**: Guru dan Orang Tua dapat saling berkomunikasi melalui `/teacher/chat` dan `/parent/chat` yang terhubung langsung melalui Supabase Realtime Channels (PostgreSQL CDC).

---

### 9. Otomatisasi Background & Cron Scheduler Engine
1. **Pemicuan Periodik**: Layanan Vercel Cron atau pemanggil eksternal memanggil titik akhir `api/cron-automation.js` secara terjadwal dengan header `Authorization: Bearer <CRON_SECRET>`.
2. **Eksekusi Tugas Otomatis**:
   - `SLA_WATCHDOG_SWEEP`: Memeriksa dan memulihkan eksekusi tugas yang tertunda (*stuck process recovery*).
   - `DAILY_MAINTENANCE_AND_DIGESTS`: Menyusun ringkasan laporan perkembangan harian anak dan mengirimkan pengingat otomatis ke keluarga.
   - Rekonsiliasi data dan pembersihan penyimpanan berkas sementara untuk menjaga efisiensi database.

---

## 📁 Struktur Proyek (Comprehensive File Tree)

```text
BintangAi/
├── api/                        # Backend Vercel Serverless Cron Workers
│   ├── cron-automation.js      # Main Cron Gateway & Sweeper Manager
│   ├── cron-scheduler.js       # Outbox Event Scheduler & Queue
│   └── cron-worker.js         # Dedicated Outbox Worker Dispatcher
├── dist/                       # Production Build Output (Generated by Vite)
├── docs/                       # Project Documentation & Architecture Guides
├── src/
│   ├── components/             # Reusable Global UI Components
│   │   ├── feedback/           # ConfettiEffect, LoadingOverlay, NotificationContainer
│   │   ├── layout/             # AppLayout, StudentSidebar, TeacherSidebar, ParentSidebar
│   │   └── ui/                 # AudioPlayer, Button, Card
│   ├── config/
│   │   └── aiModels.js         # Configuration for Core AI Models & Safeguards
│   ├── features/               # Modular Feature Subsystems (Domain-Driven Design)
│   │   ├── accessibility/      # Accessibility Subsystem
│   │   │   ├── components/     # BlindAIAssistant, Subtitles, GestureCameraOverlay, GlobalGestureCamera
│   │   │   ├── hooks/          # useAccessibility, useGestureControl, useGlobalVoiceNav, useVoice, useAudioRecorder
│   │   │   └── store/          # accessibilityStore, voiceStore
│   │   ├── ai-tutor/           # AI Tutor Subsystem (Kak Bintang)
│   │   │   ├── api/            # askTutorApi, textToSpeechApi, visionApi
│   │   │   ├── components/     # BintangAvatar, ChatBubble, AILoadingSkeleton
│   │   │   └── hooks/          # useAI, useAIPrompt, useBintangVoice
│   │   ├── auth/               # Authentication & Inactivity Protection
│   │   │   ├── api/            # sessionApi
│   │   │   ├── components/     # InactivityLogout
│   │   │   └── store/          # useAuthStore
│   │   ├── gamification/       # Gamification Subsystem (XP & Streak)
│   │   │   ├── api/            # xpApi, streakApi
│   │   │   ├── components/     # XPBar, StreakBadge
│   │   │   └── store/          # xpStore
│   │   └── quiz/               # Quiz Subsystem
│   │       ├── api/            # generateQuizApi, getAssignmentsApi, submitResultApi
│   │       └── hooks/          # useTasks
│   ├── hooks/                  # Global Utility Hooks (useNotification)
│   ├── lib/                    # SDK Clients & Utilities (supabaseClient, fuzzyMatcher, edgeFunctions)
│   ├── pages/                  # Views grouped by User Role
│   │   ├── auth/               # Login, Register
│   │   ├── landing/            # LandingPage
│   │   ├── parent/             # Dashboard, Chat
│   │   ├── profile/            # User Profile Settings & Accessibility Switcher
│   │   ├── student/            # Dashboard, TanyaAI, LiveCaptions, Modules, Quiz, Tasks, Playground, Collaboration
│   │   └── teacher/            # Dashboard, UploadModule, CreateTask, Chat, Collaboration
│   ├── styles/                 # Tailwind CSS & Adaptive High-Contrast Styling Rules
│   └── utils/                  # Formatters, Validators
├── .env                        # Environment Variables Configuration
├── .gitignore                  # Git Ignore Rules
├── eslint.config.js            # Code Formatting & Quality Rules
├── index.html                  # HTML5 Entry Point
├── package.json                # Project Dependencies & Scripts
├── README.md                   # Complete Documentation
└── vite.config.js              # Vite Build & Server Configurations
```

---

## 🚀 Panduan Instalasi & Pengoperasian

### 1. Prasyarat Sistem
- **Node.js**: v18.0.0 atau versi yang lebih baru.
- **npm**: v9.0.0 atau Yarn / pnpm.
- Perangkat dengan **Kamera** (untuk fitur Gestur Tangan Tunarungu) dan **Mikrofon** (untuk Navigasi Suara Tunanetra).

### 2. Kloning Repositori & Instalasi Dependensi
```bash
# Kloning repositori proyek
git clone https://github.com/s1informatika11s25007-maker/BintangAi.git

# Masuk ke direktori proyek
cd BintangAi

# Instal seluruh dependensi
npm install
```

### 3. Konfigurasi Variabel Lingkungan (`.env`)
Buat file `.env` di direktori utama proyek dan sesuaikan nilai variabel lingkungan berikut:

```env
# 1. FRONTEND / VITE ENVIRONMENT VARIABLES
VITE_SUPABASE_URL=https://qepfuqlnkofzfhfzahpr.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CUSTOM_AI_TUTOR_KEY=christian
VITE_APP_ENV=production

# 2. TARGET SUPABASE EDGE FUNCTIONS & BACKEND RUNTIME
SUPABASE_PROJECT_URL=https://qepfuqlnkofzfhfzahpr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
SUPABASE_DB_PASSWORD=your_database_password

# 3. SUPABASE REAL DATABASE CONNECTION POOLER (Port 6543)
SUPABASE_DB_POOLER_URL=postgres://postgres.qepfuqlnkofzfhfzahpr:your_password@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# 4. AI MODEL PROVIDER GATEWAY & GITHUB INTEGRATION
MODEL_GATEWAY_BASE_URL=https://api.llm-gateway.com/v1
GH_TOKEN=your_github_personal_access_token
```

### 4. Menjalankan Aplikasi
```bash
# Jalankan server pengembangan lokal (Vite Dev Server)
npm run dev

# Aplikasi dapat diakses di browser pada: http://localhost:5173
```

### 5. Build untuk Produksi
```bash
# Kompilasi proyek untuk rilis produksi
npm run build

# Pratinjau hasil kompilasi produksi secara lokal
npm run preview
```

---

## 🔒 Keamanan, Aksesibilitas & Performa

- **Keamanan Data (Row Level Security)**: Setiap tabel pada PostgreSQL Supabase dilindungi dengan aturan RLS sehingga data pribadi siswa hanya dapat diakses oleh Siswa bersangkutan, Orang Tua yang terhubung, dan Guru pengajar.
- **Perlindungan Input AI**: Menggunakan **Model Prompt Guard** untuk mencegah teknik manipulasi masukan (*prompt injection*).
- **Aksesibilitas Standar WCAG 2.1**: Antarmuka dirancang memenuhi pedoman *Web Content Accessibility Guidelines* (WCAG 2.1 Level AA) dengan dukungan penuh untuk navigasi keyboard, kontrast warna tinggi, serta sintetis suara.
- **Pemuatan Halaman Berkecepatan Tinggi**: Vite memproses modul aplikasi dengan *code-splitting* otomatis sehingga pengunggahan komponen UI berlangsung kurang dari 1 detik.

---

## 📄 Lisensi & Kredit

Dipersembahkan dengan ❤️ oleh **Tim BintangAi** untuk mendukung pendidikan inklusif dan ramah disabilitas di Indonesia.

© 2026 **BintangAi**. All rights reserved.

# BintangAi 🌟

**BintangAi** adalah platform belajar inklusif berbasis AI yang dirancang untuk siswa **Tunanetra dan Tunarungu**. Project ini berfokus pada kemudahan akses melalui **Navigasi Suara** dan **Deteksi Gestur Tangan**, serta bantuan asisten belajar cerdas (**AI Tutor**).

---

## 🛠️ Arsitektur Teknologi

### Frontend
- **Framework**: React 18 dengan Vite sebagai build tool.
- **State Management**: Zustand untuk manajemen state yang ringan dan efisien.
- **Styling**: Tailwind CSS untuk desain antarmuka yang modern dan responsif.
- **Animation**: Framer Motion untuk transisi dan interaksi yang halus.
- **Routing**: React Router DOM v6.

### Backend (BintangAi Core)
- **Platform**: Supabase (Backend as a Service).
- **Edge Functions**: Deno-based serverless functions untuk logika AI.
- **Database**: PostgreSQL dengan Row Level Security (RLS) yang ketat.
- **Storage**: Supabase Storage untuk penyimpanan modul pembelajaran (PDF).
- **Realtime**: PostgreSQL CDC untuk fitur kolaborasi grup belajar.

---

## 📁 Struktur Proyek (Comprehensive)

### 🖥️ Frontend Structure (`/src`)
```text
src/
├── components/             # Komponen UI Reusable
│   ├── feedback/           # Toast, Notification, Confetti
│   ├── layout/             # Sidebar, Navbar, AppLayout
│   └── common/             # Button, Input, Card khusus
├── features/               # Modul Fitur (Domain Driven)
│   ├── accessibility/      # Hooks & Components khusus aksesibilitas
│   │   ├── hooks/          # useGesture, useVoice, useAudioRecorder
│   │   └── components/     # BlindAIAssistant, Subtitles, GestureCamera
│   ├── ai-tutor/           # Otak AI Kak Bintang
│   │   ├── api/            # Wrapper API Supabase Functions
│   │   └── hooks/          # useAI, useAIPrompt
│   └── auth/               # Sistem Keamanan & User Session
├── pages/                  # Views berdasarkan User Role
│   ├── student/            # Dashboard, Tanya AI (Chat), QuizKu, Modules
│   ├── teacher/            # Management Panel (Upload, Task Creation)
│   └── parent/             # Monitoring Dashboard
├── lib/                    # SDK Configuration (Supabase Client)
└── styles/                 # Tailwind & Global CSS
```

### ⚙️ Backend Structure (`/backend` / Supabase Cloud)
```text
backend/ (Logic & Database Schema)
├── supabase/
│   ├── functions/          # Edge Functions (Deno Runtime)
│   │   ├── ai-tutor/       # Main Brain (Integrasi LLM & Prompt Engineering)
│   │   ├── materi-ai/      # RAG (Retrieval Augmented Generation) untuk PDF
│   │   ├── smart-voice/    # Speech-to-Intent & Voice Interaction
│   │   └── transcribe/     # Real-time Voice Transcription
│   ├── migrations/         # Database Schema & Version Control
│   └── seed.sql            # Data awal untuk pengembangan
├── database_schema/        # Dokumentasi Relasi Tabel
│   ├── profiles            # Data User (Role & Tipe Disabilitas)
│   ├── modules             # Repository Materi (PDF Metadata)
│   ├── assignments         # Quiz & Tugas dari Guru
│   └── submissions         # Jawaban & Progress Siswa
└── security/               # RLS (Row Level Security) Policies
```

---

## 🌟 Fitur Utama Berbasis Peran

### 1. Siswa Tunawicara & Tunarungu
- **Tanya AI (Chat Mode)**: Antarmuka chat teks full-screen yang responsif dengan animasi profesional.
- **Mata Pintar AI**: Transkripsi suara guru secara real-time menjadi teks subtitle.
- **Gesture Navigation**: Mengontrol aplikasi menggunakan 1-10 jari melalui kamera (Hand Tracking).

### 2. Siswa Tunanetra
- **Asisten Nay**: Navigasi berbasis suara penuh. Pengguna cukup menekan Spasi dan berbicara.
- **Audio Guide**: Panduan suara otomatis yang menjelaskan struktur halaman saat ini.
- **Voice-to-Action**: Pindah halaman atau membuka materi cukup dengan perintah suara.

---

## 🚀 Instalasi & Pengembangan

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/bintangainya/bintangainya.git
    cd bintangainya
    npm install
    ```

2.  **Environment Variables**:
    Buat file `.env` dan masukkan kredensial Supabase Anda:
    ```env
    VITE_SUPABASE_URL=your_url
    VITE_SUPABASE_ANON_KEY=your_key
    VITE_CUSTOM_AI_TUTOR_KEY=christian
    ```

3.  **Run Application**:
    ```bash
    npm run dev
    ```

---

## 🔒 Keamanan & Performa
- **Optimasi Vite**: Code-splitting otomatis untuk pemuatan halaman yang instan.
- **Supabase RLS**: Memastikan data siswa hanya dapat diakses oleh guru atau orang tua yang bersangkutan.
- **Edge Runtime**: Logika AI dijalankan di lokasi server terdekat dari pengguna untuk latensi rendah.

---

© 2024 **BintangAi Team**. Built with ❤️ for inclusive education.

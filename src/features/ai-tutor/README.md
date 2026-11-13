# AI Tutor Feature

Fitur ini menangani komunikasi dengan LLM Model (LLM / Llama) untuk membantu siswa belajar.

## Struktur
- `api/`: Endpoint untuk fetch ke Supabase Edge Functions.
- `hooks/`: `useAI.js` untuk mengelola state chat dan ping.
- `components/`: UI khusus Chat AI (BintangAi).

## Cara Penggunaan
Gunakan hook `useAI` untuk mendapatkan fungsi `sendMessage` dan status loading.

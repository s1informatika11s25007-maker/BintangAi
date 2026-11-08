# BintangAi — Katalog Model AI yang Diizinkan

Dokumen ini adalah satu-satunya daftar model AI yang boleh dipanggil oleh BintangAi. Model untuk kamera dan mikrofon tidak digunakan; akses kamera, pengenalan ucapan, dan pembacaan teks memakai API bawaan browser (Chrome/Web Speech API, getUserMedia, dan SpeechSynthesis).

## 1. Qwen 3.8 27B
- **Provider:** Alibaba Cloud (akses model melalui gateway Groq)
- **Model ID:** `qwen/qwen3.8-27b`
- **Limits:** 30 requests/minute | 1K/day; 8K tokens/minute | 200K/day
- **Release stage:** preview
- **Released:** August 17, 2026
- **Penggunaan:** tutor belajar, penjelasan materi, pembuatan kuis.

## 2. Llama Prompt Guard 2 22M
- **Provider:** Meta (akses model melalui gateway Groq)
- **Model ID:** `meta-llama/llama-prompt-guard-2-22m`
- **Limits:** 30 requests/minute | 14.4K/day; 15K tokens/minute | 500K/day
- **Release stage:** preview
- **Released:** May 31, 2025
- **Penggunaan:** pemeriksaan prompt masuk.

## 3. GPT OSS 120B
- **Provider:** OpenAI (akses model melalui gateway Groq)
- **Model ID:** `openai/gpt-oss-120b`
- **Limits:** 30 requests/minute | 1K/day; 8K tokens/minute | 200K/day
- **Release stage:** production
- **Released:** August 5, 2025
- **Penggunaan:** fallback untuk tutor dan generator kuis ketika model utama gagal tersedia.

## 4. Safety GPT OSS 20B
- **Provider:** OpenAI (akses model melalui gateway Groq)
- **Model ID:** `openai/gpt-oss-safeguard-20b`
- **Limits:** 3 requests/minute | 1K/day; 2K tokens/minute | 200K/day
- **Release stage:** preview
- **Released:** October 29, 2025
- **Penggunaan:** pemeriksaan tambahan saat jawaban berpotensi sensitif/tidak sesuai usia.

## 5. Whisper Large V3
- **Provider:** OpenAI
- **Model ID:** `whisper-large-v3`
- **Limits:** 20 requests/minute | 2K/day
- **Release stage:** production
- **Released:** September 3, 2023
- **Penggunaan:** tidak dipanggil oleh aplikasi. Transkripsi memanfaatkan Web Speech API browser.

## 6. Whisper Large V3 Turbo
- **Provider:** OpenAI
- **Model ID:** `whisper-large-v3-turbo`
- **Limits:** 20 requests/minute | 2K/day
- **Release stage:** production
- **Released:** October 9, 2024
- **Penggunaan:** tidak dipanggil oleh aplikasi. Transkripsi memanfaatkan Web Speech API browser.

---

**Aturan penting:** Jangan menambahkan model lain tanpa memperbarui dokumen ini dan `src/config/aiModels.js`. API key provider hanya boleh berada di environment server/Edge Functions, tidak boleh menggunakan prefix `VITE_`.

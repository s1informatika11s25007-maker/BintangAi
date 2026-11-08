# AI Tutor BintangAi

Seluruh pemanggilan model melewati Supabase Edge Functions. Browser tidak menyimpan API key provider. Model dibatasi oleh `modellist.md` dan `src/config/aiModels.js`.

- Tutor dan navigasi: Qwen 3.8 27B; fallback GPT OSS 120B.
- Prompt safety: Llama Prompt Guard 2 22M.
- Safety review jawaban sensitif: Safety GPT OSS 20B (hanya bila diperlukan).
- Dikte, subtitle dan speech output: API bawaan browser. Whisper tidak dipanggil.

Endpoint: `ai-tutor`, `generate-quiz`, `materi-ai`, dan `generate-report`. Semua endpoint memvalidasi JWT Supabase dan role/profil yang tersimpan di database.

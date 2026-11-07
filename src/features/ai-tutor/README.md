# 🤖 Kak Bintang AI Tutor Module (Edition 2026)

Modul **AI Tutor (Kak Bintang)** adalah otak kecerdasan buatan utama pada platform **BintangAi 2026**. Modul ini menyediakan pendampingan belajar interaktif berbasis **Kecerdasan Buatan Multi-Modal (Text, Voice, and Vision)** untuk siswa Tunanetra, Tunarungu, dan Tunawicara.

---

## 🛠️ Arsitektur Modul

```text
src/features/ai-tutor/
├── api/
│   ├── askTutorApi.js        # Integrasi Supabase Edge Functions LLM
│   ├── textToSpeechApi.js    # Sintesis Suara Natural (Text-to-Speech)
│   └── visionApi.js          # Pemrosesan OCR & Visual Understanding
├── components/
│   ├── AILoadingSkeleton.jsx # Skeleton UI saat AI merespons
│   ├── BintangAvatar.jsx     # Avatar animasi interaktif Kak Bintang
│   └── ChatBubble.jsx        # Gelembung pesan chat adaptif
├── hooks/
│   ├── useAI.js              # Hook utama pengelola state chat & Supabase ping
│   ├── useAIPrompt.js        # Formatter prompt & penyesuaian konteks belajar
│   └── useBintangVoice.js    # Interaksi suara natural (Speech-to-Intent)
└── index.js                  # Module Exporter
```

---

## 🌟 Kemampuan Utama (2026 Features)

1. **Multimodal Reasoning**: Memahami pertanyaan berbasis teks, perintah suara, maupun gambar materi PDF.
2. **Personalized Context Tuning**: Mengadaptasi gaya bahasa sesuai tipe disabilitas dan peran siswa.
3. **Voice-First Interactivity**: Integrasi langsung dengan sintesis audio untuk kemandirian siswa Tunanetra.
4. **Realtime Availability Check**: Fitur pinger otomatis untuk memastikan konektivitas Supabase AI Service selalu aktif.

---

© 2026 **BintangAi Digital Ecosystem**. Built with ❤️ for inclusive education.

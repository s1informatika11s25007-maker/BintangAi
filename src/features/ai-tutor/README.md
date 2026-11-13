# AI Tutor & Voice Feature

Fitur ini menangani komunikasi dengan AI Model (BintangAi) serta pengisian suara (Text-to-Speech) untuk membantu siswa SD belajar secara inklusif.

## Fitur Pengaturan Suara (Sound Settings)

| Fitur | Status | Saran Peningkatan | Manfaat untuk Siswa SD |
| :--- | :--- | :--- | :--- |
| **Pengaturan Suara** | **Sudah Dikembangkan** | Pengaturan kecepatan suara (0.5x - 2.0x), volume (0% - 100%), pengulangan (1x, 2x, 3x), dan pilihan suara Bahasa Indonesia dengan uji suara & ulangi suara. | Menyesuaikan kemampuan mendengar dan memahami informasi masing-masing siswa SD. |

## Detail Peningkatan:
1. **Kecepatan Suara (Voice Speed Rate)**: Menyediakan slider dan preset kecepatan (`0.5x`, `0.8x - Ideal SD`, `1.0x - Normal`, `1.2x`, `1.5x`) untuk mengatur tempo bicara Kak Bintang.
2. **Volume Suara (Voice Volume)**: Slider dan tombol mute/unmute untuk mengatur keras/lembutnya suara.
3. **Pengulangan Pembacaan (Voice Repeat)**: Opsi otomatis mengulangi pesan pembacaan (1x, 2x, 3x) dan tombol instan "Ulangi Suara Terakhir".
4. **Pilihan Suara Bahasa Indonesia**: Otomatis mendeteksi dan memilih modul suara (TTS) Bahasa Indonesia pada perangkat siswa.
5. **Uji Coba Suara (Test Voice)**: Tombol preview untuk mendengarkan hasil pengaturan secara langsung.

## Struktur
- `api/`: Endpoint untuk fetch ke Supabase Edge Functions (`textToSpeechApi.js`, `askTutorApi.js`).
- `hooks/`: `useAI.js`, `useBintangVoice.js`, `useVoice.js` untuk mengelola suara, kuis, dan chat.
- `components/`: UI Chat AI, `VoiceSettingsPanel.jsx` (Panel Pengaturan Suara & Bicara).
- `store/`: `voiceStore.js` (State ter-persist via Zustand).

## Cara Penggunaan
Gunakan hook `useVoice()` untuk memanggil fungsi `speak(text)`, `replayLastSpoken()`, `testVoice()`, atau komponen `<VoiceSettingsPanel />` di halaman profil dan modal chat.

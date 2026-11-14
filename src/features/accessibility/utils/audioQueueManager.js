/**
 * BintangAi Audio Queue Manager
 *
 * Mengelola antrean instruksi dan siaran suara Text-to-Speech (TTS) untuk siswa Tunanetra.
 * Mencegah suara terputus, garbled, atau tumpang tindih ketika ada beberapa notifikasi
 * dan pesan siaran guru yang masuk secara bersamaan.
 */

class AudioQueueManager {
  constructor() {
    this.queue = [];
    this.isPlaying = false;
    this.currentUtterance = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  }

  /**
   * Mengambil daftar suara Bahasa Indonesia terbaik
   */
  getIndonesianVoice() {
    if (!this.synth) return null;
    const voices = this.synth.getVoices() || [];
    return voices.find(
      v => v.lang.startsWith('id') || v.lang.includes('ID') || (v.name && v.name.toLowerCase().includes('indonesia'))
    ) || null;
  }

  /**
   * Menambahkan pesan suara ke antrean dan memulai pemutaran berurutan
   * @param {string} text Teks yang akan dibacakan
   * @param {Object} options Options tambahan (priority, rate, pitch, onEnd)
   */
  speak(text, options = {}) {
    if (!text || typeof text !== 'string' || !text.trim()) return;

    const cleanText = text.trim();
    const priority = options.priority || 'normal'; // 'high' | 'normal'

    const item = {
      id: Date.now() + Math.random(),
      text: cleanText,
      options,
      priority
    };

    if (priority === 'high') {
      // Sisipkan di depan antrean untuk siaran penting guru
      this.queue.unshift(item);
    } else {
      this.queue.push(item);
    }

    if (!this.isPlaying) {
      this.processQueue();
    }
  }

  /**
   * Memproses antrean satu per satu secara berurutan
   */
  processQueue() {
    if (!this.synth || this.queue.length === 0) {
      this.isPlaying = false;
      this.currentUtterance = null;
      return;
    }

    this.isPlaying = true;
    const item = this.queue.shift();

    try {
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = 'id-ID';
      utterance.rate = item.options.rate || 1.0;
      utterance.pitch = item.options.pitch || 1.0;
      utterance.volume = item.options.volume || 1.0;

      const idVoice = this.getIndonesianVoice();
      if (idVoice) utterance.voice = idVoice;

      utterance.onend = () => {
        if (item.options.onEnd) item.options.onEnd();
        this.processQueue();
      };

      utterance.onerror = (err) => {
        console.warn('AudioQueueManager error:', err);
        if (item.options.onError) item.options.onError(err);
        this.processQueue();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch (e) {
      console.error('AudioQueueManager speak exception:', e);
      this.processQueue();
    }
  }

  /**
   * Menghentikan suara saat ini dan mengosongkan seluruh antrean
   */
  stopAll() {
    this.queue = [];
    this.isPlaying = false;
    this.currentUtterance = null;
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }
}

export const audioQueueManager = new AudioQueueManager();
export default audioQueueManager;

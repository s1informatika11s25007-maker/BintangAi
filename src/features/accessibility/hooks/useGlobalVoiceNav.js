import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useVoiceStore } from '../store/voiceStore';
import { useSubtitle } from '../components/Subtitles';

let sharedRecognition = null;
let isRecognitionActive = false;

export function useGlobalVoiceNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, isVoiceActive } = useAccessibilityStore();
  const { showSubtitle } = useSubtitle();
  const isBlind = mode === 'tunanetra';
  const activeRef = useRef(false);
  const synthRef = useRef(window.speechSynthesis);
  const lastSpokenRef = useRef('');
  const menuAnnouncedRef = useRef(false);
  const [aiListening, setAiListening] = useState(false);
  const [aiTranscript, setAiTranscript] = useState('');
  const aiRecognitionRef = useRef(null);

  const speak = useCallback((text, rateMultiplier = 1.0) => {
    if (!text || !isBlind) return;
    try {
      synthRef.current.cancel();
      const { voiceSpeed, voiceVolume, selectedVoiceURI, setLastSpokenText } = useVoiceStore.getState();
      const utt = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();

      let chosenVoice = null;
      if (selectedVoiceURI) {
        chosenVoice = voices.find(v => v.voiceURI === selectedVoiceURI || v.name === selectedVoiceURI);
      }
      if (!chosenVoice) {
        chosenVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID') || (v.name && v.name.toLowerCase().includes('indonesia')));
      }
      if (chosenVoice) utt.voice = chosenVoice;

      utt.lang = 'id-ID';
      utt.rate = Math.max(0.5, Math.min(2.0, (voiceSpeed || 1.0) * rateMultiplier));
      utt.volume = Math.max(0.0, Math.min(1.0, voiceVolume ?? 1.0));
      utt.pitch = 1.0;

      synthRef.current.speak(utt);
      lastSpokenRef.current = text;
      setLastSpokenText(text);
    } catch (e) {
      console.error('speak error:', e);
    }
  }, [isBlind]);

  const startAIMicrophone = useCallback((onResult, onStop) => {
    if (!isBlind) return;

    if (aiRecognitionRef.current) {
      try {
        aiRecognitionRef.current.stop();
      } catch(e) {}
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      speak('Browser tidak mendukung pengenalan suara');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID';
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onstart = () => {
      setAiListening(true);
      speak('Mikrofon aktif. Silakan bicara sekarang. Untuk mengirim pertanyaan, katakan OK');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          const t = transcript.toLowerCase();
          if (t.includes('ok') || t.includes('oke') || t.includes('kirim') || t.includes('selesai')) {
            recognition.stop();
            if (onStop) onStop();
            return;
          }
        } else {
          interimTranscript += transcript;
        }
      }

      const combined = (finalTranscript + interimTranscript).trim();
      setAiTranscript(combined);
      showSubtitle(`🎤 Mendengar: ${combined}`, 'info');
    };

    recognition.onerror = (event) => {
      console.error('AI recognition error:', event.error);
      if (event.error === 'network') speak('Masalah jaringan, periksa koneksi internet Anda.');
      setAiListening(false);
    };

    recognition.onend = () => {
      setAiListening(false);
      const cleanedResult = finalTranscript.replace(/ok|oke|kirim|selesai/gi, '').trim();
      if (cleanedResult.length > 1) {
        if (onResult) onResult(cleanedResult);
      }
      speak('Mikrofon dimatikan');
    };

    aiRecognitionRef.current = recognition;
    recognition.start();
  }, [isBlind, speak, showSubtitle]);

  const stopAIMicrophone = useCallback(() => {
    if (aiRecognitionRef.current) {
      try {
        aiRecognitionRef.current.stop();
      } catch(e) {}
    }
    setAiListening(false);
  }, []);

  const readPageContent = useCallback(() => {
    const mainText = document.querySelector('main')?.innerText || '';
    if (!mainText.trim()) {
      speak('Halaman ini belum memiliki konten teks.');
      return;
    }
    speak(`Membacakan konten halaman: ${mainText.slice(0, 1000)}`);
  }, [speak]);

  // Voice Command Processing for Siswa Tunanetra
  const processCommand = useCallback((transcript) => {
    const t = transcript.toLowerCase().trim();
    if (!t) return;

    const isQuizPage = location.pathname.includes('/student/quiz/');
    if (isQuizPage) {
      if (t.includes('keluar') || t.includes('tutup kuis') || t.includes('kembali ke beranda')) {
        navigate('/student/dashboard');
        speak('Kembali ke Beranda Utama');
      }
      return;
    }

    // Navigation Commands - Auto Direct Routing (< 300ms)
    if (t.includes('kembali') || t.includes('back')) {
      navigate(-1);
      speak('Kembali ke halaman sebelumnya');
      return;
    }

    if (t.includes('beranda') || t.includes('dashboard') || t.includes('bantu navigasi') || t.includes('navigasi')) {
      navigate('/student/dashboard');
      speak('Membuka Beranda Utama');
      return;
    }

    if (t.includes('tugas') || t.includes('kuis') || t.includes('quiz') || t.includes('mulai quiz') || t.includes('mulai kuis')) {
      navigate('/student/tasks');
      speak('Membuka Halaman QuizKu');
      return;
    }

    if (t.includes('materi') || t.includes('modul') || t.includes('perpustakaan') || t.includes('pelajaran') || t.includes('buku')) {
      navigate('/student/modules');
      speak('Membuka Halaman Materi Belajar');
      return;
    }

    if (t.includes('grup') || t.includes('kolaborasi') || t.includes('mabar') || t.includes('diskusi') || t.includes('teman')) {
      navigate('/student/collaboration');
      speak('Membuka Grup Belajar');
      return;
    }

    if (t.includes('pesan') || t.includes('inbox') || t.includes('guru')) {
      navigate('/student/inbox');
      speak('Membuka Pesan Guru');
      return;
    }

    if (t.includes('tanya') || t.includes('playground') || t.includes('obrol') || t.includes('bintang') || t.includes('asisten')) {
      const target = isBlind ? '/student/playground' : '/student/tanya-ai';
      navigate(target);
      speak('Membuka Tanya Kak Bintang');
      return;
    }

    if (t.includes('mata pintar') || t.includes('caption') || t.includes('subtitle')) {
      navigate('/student/live-captions');
      speak('Membuka Mata Pintar');
      return;
    }

    if (t.includes('profil') || t.includes('pengaturan') || t.includes('akun')) {
      navigate('/profile');
      speak('Membuka Halaman Profil Saya');
      return;
    }

    // Page Reader & Sound Controls for Tunanetra
    if (t.includes('baca halaman') || t.includes('baca isi') || t.includes('baca teks')) { readPageContent(); return; }

    if (t.includes('ulangi') || t.includes('baca lagi')) {
      const lastText = useVoiceStore.getState().lastSpokenText;
      if (lastText) {
        speak(lastText, 1.0, true);
      } else {
        speak('Belum ada panduan suara yang dapat diulangi.');
      }
      return;
    }

    if (t.includes('suara lambat') || t.includes('kecepatan lambat')) {
      useVoiceStore.getState().setVoiceSpeed(0.8);
      speak('Kecepatan suara diubah ke 0.8 kali, ideal untuk siswa Sekolah Dasar.', 1.0, true);
      return;
    }

    if (t.includes('suara normal') || t.includes('kecepatan normal')) {
      useVoiceStore.getState().setVoiceSpeed(1.0);
      speak('Kecepatan suara diubah ke normal 1.0 kali.', 1.0, true);
      return;
    }

    if (t.includes('volume keras') || t.includes('volume 100')) {
      useVoiceStore.getState().setVoiceVolume(1.0);
      speak('Volume suara diatur penuh 100 persen.', 1.0, true);
      return;
    }

    if (t.includes('volume pelan') || t.includes('volume 50')) {
      useVoiceStore.getState().setVoiceVolume(0.5);
      speak('Volume suara diatur ke 50 persen.', 1.0, true);
      return;
    }
  }, [navigate, speak, readPageContent, location.pathname]);

  const startGlobalListening = useCallback(() => {
    const isQuizPage = location.pathname.includes('/student/quiz/');
    if (!isBlind || !isVoiceActive || activeRef.current || aiListening || isQuizPage) return;

    if (!sharedRecognition) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      sharedRecognition = new SR();
      sharedRecognition.continuous = true;
      sharedRecognition.interimResults = false;
      sharedRecognition.lang = 'id-ID';
    }

    sharedRecognition.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          processCommand(e.results[i][0].transcript);
        }
      }
    };

    sharedRecognition.onend = () => {
      isRecognitionActive = false;
      if (activeRef.current && !aiListening) {
        setTimeout(() => {
          if (activeRef.current && !aiListening) {
            try { sharedRecognition.start(); isRecognitionActive = true; } catch (e) {}
          }
        }, 500);
      }
    };

    if (!isRecognitionActive) {
      try { sharedRecognition.start(); isRecognitionActive = true; activeRef.current = true; } catch (e) {}
    } else {
      activeRef.current = true;
    }
  }, [isBlind, isVoiceActive, processCommand, aiListening]);

  const stopGlobalListening = useCallback(() => {
    activeRef.current = false;
    if (sharedRecognition && isRecognitionActive) {
      try { sharedRecognition.stop(); isRecognitionActive = false; } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isBlind && isVoiceActive) {
      startGlobalListening();
      return () => stopGlobalListening();
    }
  }, [isBlind, isVoiceActive, startGlobalListening, stopGlobalListening]);

  return {
    speak,
    startAIMicrophone,
    stopAIMicrophone,
    aiListening,
    aiTranscript
  };
}

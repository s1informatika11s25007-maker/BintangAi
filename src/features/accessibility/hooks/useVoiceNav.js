import { useEffect, useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { useSubtitle } from '@/features/accessibility/components/Subtitles';

let sharedRecognition = null;
let isRecognitionActive = false;

export function useVoiceNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, isVoiceActive } = useAccessibilityStore();
  const { showSubtitle } = useSubtitle();
  const isBlind = mode === 'tunanetra';
  const activeRef = useRef(false);
  const synthRef = useRef(window.speechSynthesis);
  const lastSpokenRef = useRef('');
  const [aiListening, setAiListening] = useState(false);
  const [aiTranscript, setAiTranscript] = useState('');
  const aiRecognitionRef = useRef(null);

  const speak = useCallback((text, rate = 1.0) => {
    if (!text || !isBlind) return;
    try {
      synthRef.current.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      const voices = synthRef.current.getVoices();
      const idVoice = voices.find(v => v.lang.includes('id-ID')) || voices[0];
      if (idVoice) utt.voice = idVoice;
      utt.lang = 'id-ID';
      utt.rate = rate;
      synthRef.current.speak(utt);
      lastSpokenRef.current = text;
    } catch (e) {
      console.error('speak error:', e);
    }
  }, [isBlind]);

  const startAIMicrophone = useCallback((onResult, onStop) => {
    if (!isBlind) return;

    if (aiRecognitionRef.current) {
      try { aiRecognitionRef.current.stop(); } catch(e) {}
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

    recognition.onend = () => {
      setAiListening(false);
      const cleanedResult = finalTranscript.replace(/ok|oke|kirim|selesai/gi, '').trim();
      if (cleanedResult.length > 1 && onResult) onResult(cleanedResult);
      speak('Mikrofon dimatikan');
    };

    aiRecognitionRef.current = recognition;
    recognition.start();
  }, [isBlind, speak, showSubtitle]);

  return {
    speak,
    startAIMicrophone,
    aiListening,
    aiTranscript
  };
}

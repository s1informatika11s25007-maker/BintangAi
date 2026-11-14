import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useVoiceStore } from '../store/voiceStore';

// Singleton instance for Speech Recognition
let sharedRecognition = null;

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const isMounted = useRef(true);
  const location = useLocation();

  const {
    voiceSpeed,
    voiceVolume,
    voiceRepeat,
    selectedVoiceURI,
    lastSpokenText,
    setVoiceSpeed,
    setVoiceVolume,
    setVoiceRepeat,
    setSelectedVoiceURI,
    setLastSpokenText
  } = useVoiceStore();

  const isPublicPage = useMemo(() => {
    if (!location?.pathname) return false;
    if (location.pathname === '/') return true;
    const publicPaths = ['/auth', '/login', '/register'];
    return publicPaths.some(path => location.pathname.startsWith(path));
  }, [location?.pathname]);

  // Load available speech synthesis voices (especially Indonesian voices)
  const updateVoices = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices || []);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    return () => {
      isMounted.current = false;
    };
  }, [updateVoices]);

  const getIndonesianVoices = useCallback(() => {
    if (!availableVoices || availableVoices.length === 0) return [];
    const indonesian = availableVoices.filter(v =>
      (v.lang && (v.lang.toLowerCase().startsWith('id') || v.lang.toLowerCase().includes('id'))) ||
      (v.name && (v.name.toLowerCase().includes('indonesia') || v.name.toLowerCase().includes('bahasa')))
    );
    return indonesian.length > 0 ? indonesian : availableVoices;
  }, [availableVoices]);

  const playSound = useCallback((type = 'click') => {
    return;
  }, []);

  const startListening = useCallback((onResult) => {
    if (isPublicPage) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!sharedRecognition) {
      sharedRecognition = new SpeechRecognition();
      sharedRecognition.lang = 'id-ID';
      sharedRecognition.maxAlternatives = 3;
    }

    sharedRecognition.continuous = true;
    sharedRecognition.interimResults = true;

    setIsListening(true);

    sharedRecognition.onstart = () => {
      setIsListening(true);
    };

    sharedRecognition.onresult = (event) => {
      let fullTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }
      if (onResult) onResult(fullTranscript);
    };

    sharedRecognition.onend = () => {
      setIsListening(false);
    };

    sharedRecognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    try {
      sharedRecognition.start();
    } catch (e) {
      // If already started, let it be
    }
  }, [isPublicPage]);

  const stopListening = useCallback(() => {
    if (sharedRecognition) {
      try {
        sharedRecognition.stop();
      } catch (e) {}
      setIsListening(false);
    }
  }, []);

  /**
   * Speak text with configurable voice speed, volume, voice selection, and repeat capability.
   */
  const speak = useCallback((text, rateMultiplier = 1.0, force = false, options = {}) => {
    if (!text || !window.speechSynthesis) return;

    if (typeof text === 'string' && text.trim()) {
      setLastSpokenText(text);
    }

    const {
      overrideVoiceURI,
      overrideSpeed,
      overrideVolume,
      overrideRepeat
    } = options;

    const storeState = useVoiceStore.getState();
    const currentSpeed = overrideSpeed ?? storeState.voiceSpeed ?? 1.0;
    const currentVolume = overrideVolume ?? storeState.voiceVolume ?? 1.0;
    const currentVoiceURI = overrideVoiceURI ?? storeState.selectedVoiceURI ?? '';
    const currentRepeat = overrideRepeat ?? storeState.voiceRepeat ?? 1;

    // Calculate rate (clamped between 0.5x and 2.0x)
    const effectiveRate = Math.max(0.5, Math.min(2.0, (currentSpeed * rateMultiplier)));
    const effectiveVolume = Math.max(0.0, Math.min(1.0, currentVolume));

    const performSpeak = () => {
      if (force) {
        window.speechSynthesis.cancel();
      }

      const voices = window.speechSynthesis.getVoices();

      // Find matching voice with enhanced Indonesian detection
      let selectedVoice = null;
      if (currentVoiceURI) {
        selectedVoice = voices.find(v => v.voiceURI === currentVoiceURI || v.name === currentVoiceURI);
      }

      if (!selectedVoice) {
        selectedVoice = voices.find(v => {
          const lang = (v.lang || '').toLowerCase().replace('_', '-');
          const name = (v.name || '').toLowerCase();
          return lang === 'id-id' || lang === 'id' || name.includes('indonesia') || name.includes('bahasa') || name.includes('damayanti') || name.includes('siti') || name.includes('andika') || name.includes('gadis');
        });
      }

      if (!selectedVoice) {
        selectedVoice = voices.find(v => (v.lang || '').toLowerCase().includes('id'));
      }

      const speakRound = (remaining) => {
        if (!isMounted.current || remaining <= 0) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = effectiveRate;
        utterance.volume = effectiveVolume;
        utterance.pitch = 1.0;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
          if (remaining > 1 && isMounted.current) {
            setTimeout(() => speakRound(remaining - 1), 350);
          }
        };

        utterance.onerror = (e) => {
          console.error("SpeechSynthesis error:", e);
        };

        window.speechSynthesis.speak(utterance);
      };

      if (isMounted.current) {
        if (force) {
          setTimeout(() => {
            if (isMounted.current) speakRound(currentRepeat);
          }, 50);
        } else {
          speakRound(currentRepeat);
        }
      }
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      const handleVoicesChanged = () => {
        performSpeak();
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    } else {
      performSpeak();
    }
  }, [setLastSpokenText]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const replayLastSpoken = useCallback(() => {
    const textToReplay = useVoiceStore.getState().lastSpokenText;
    if (textToReplay) {
      speak(textToReplay, 1.0, true);
    }
  }, [speak]);

  /**
   * 🎯 PEMBACA SOAL KUIS OTOMATIS (Sequential Quiz Reader for Tunanetra)
   */
  const speakQuestionAndOptions = useCallback(({ questionNumber, questionText, options = [], instructions = '' }) => {
    if (!questionText) return;

    const cleanQuestion = String(questionText).replace(/\s+/g, ' ').trim();
    let formattedText = `Soal nomor ${questionNumber}. ${cleanQuestion}. `;

    if (Array.isArray(options) && options.length > 0) {
      options.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx); // A, B, C, D
        let optText = '';

        if (typeof opt === 'string' || typeof opt === 'number') {
          optText = String(opt);
        } else if (typeof opt === 'object' && opt !== null) {
          optText = opt.option_text || opt.text || opt.content || opt.label || opt.value || String(opt);
        }

        optText = String(optText).replace(/\s+/g, ' ').trim();
        if (optText && optText !== '[object Object]') {
          formattedText += `Pilihan ${letter}: ${optText}. `;
        }
      });
    }

    if (instructions) {
      formattedText += `${instructions} `;
    } else {
      formattedText += `Silakan pilih jawaban. Kamu bisa menekan A, B, C, atau D pada keyboard untuk menjawab. Tekan R untuk mendengarkan ulang soal.`;
    }

    speak(formattedText, 1.0, true);
  }, [speak]);

  /**
   * 🎯 PEMBACA HASIL JAWABAN KUIS (Quiz Result Reader)
   */
  const speakQuizResult = useCallback(({ isCorrect, correctLetter, correctText, explanation = '' }) => {
    let resultSpeech = '';
    if (isCorrect) {
      resultSpeech = `Hebat! Jawaban kamu Benar! Pilihan ${correctLetter}, ${correctText} adalah jawaban yang tepat. `;
    } else {
      resultSpeech = `Jawaban kurang tepat. Jawaban yang benar adalah Pilihan ${correctLetter}, ${correctText}. `;
    }

    if (explanation) {
      resultSpeech += `Penjelasan: ${explanation}`;
    }

    speak(resultSpeech, 1.0, true);
  }, [speak]);

  /**
   * 🎯 W3C DESKRIPSI GAMBAR DAN DIAGRAM (Image & Diagram Alt Text Reader)
   */
  const speakImageDescription = useCallback((altText, titleText = '') => {
    const textToRead = altText || titleText || 'Gambar ilustrasi materi';
    speak(`Gambar atau Diagram: ${textToRead}`, 1.0, true);
  }, [speak]);

  const testVoice = useCallback((testVoiceURI, testSpeed, testVolume) => {
    const sampleText = "Halo! Ini adalah contoh suara Kak Bintang dalam Bahasa Indonesia. Selamat belajar dan tetap semangat ya!";
    speak(sampleText, 1.0, true, {
      overrideVoiceURI: testVoiceURI,
      overrideSpeed: testSpeed,
      overrideVolume: testVolume,
      overrideRepeat: 1
    });
  }, [speak]);

  return {
    isListening,
    isSpeaking: typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.speaking : false,
    speak,
    stopSpeaking,
    replayLastSpoken,
    speakQuestionAndOptions,
    speakQuizResult,
    speakImageDescription,
    testVoice,
    getIndonesianVoices,
    availableVoices,
    playSound,
    startListening,
    stopListening,
    // Store settings & state
    voiceSpeed,
    setVoiceSpeed,
    voiceVolume,
    setVoiceVolume,
    voiceRepeat,
    setVoiceRepeat,
    selectedVoiceURI,
    setSelectedVoiceURI,
    lastSpokenText
  };
}

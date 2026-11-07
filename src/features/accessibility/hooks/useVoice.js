import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom';

// Singleton instance for Speech Recognition
let sharedRecognition = null;

export function useVoice() {
  const [isListening, setIsListening] = useState(false)
  const isMounted = useRef(true)
  const location = useLocation();

  const isPublicPage = useMemo(() => {
    if (location.pathname === '/') return true;
    const publicPaths = ['/auth', '/login', '/register'];
    return publicPaths.some(path => location.pathname.startsWith(path));
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Jangan cancel di sini agar suara navigasi antar halaman tidak terputus
    };
  }, []);

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

    // Set config for real-time and continuous capture
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
      // If already started, we just let it be
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

  const speak = useCallback((text, rate = 1.1, force = false) => {
    if (!text || !window.speechSynthesis) return;

    const performSpeak = () => {
      if (force) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      if (isMounted.current) {
        // Berikan sedikit delay jika force=true agar cancel() selesai diproses browser
        if (force) {
          setTimeout(() => {
            if (isMounted.current) window.speechSynthesis.speak(utterance);
          }, 50);
        } else {
          window.speechSynthesis.speak(utterance);
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
  }, []);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    isListening,
    isSpeaking: window.speechSynthesis ? window.speechSynthesis.speaking : false,
    speak,
    playSound,
    startListening,
    stopListening,
    stopSpeaking
  }
}

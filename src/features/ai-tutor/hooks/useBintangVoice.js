import { useCallback, useState } from 'react';

export const useBintangVoice = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speak = useCallback((text, options = {}) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = options.lang || 'id-ID';
    utterance.rate = options.rate || 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    return true;
  }, []);
  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);
  return { speak, stop, isSpeaking };
};

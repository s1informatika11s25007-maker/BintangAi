import { useState, useCallback } from 'react';
import { textToSpeechApi } from '../api/textToSpeechApi';

export const useBintangVoice = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text) => {
    if (!text) return;
    setIsSpeaking(true);
    try {
      const data = await textToSpeechApi(text);
      if (data?.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      } else {
        // Fallback to window.speechSynthesis if API fails
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Bintang Voice Error:", err);
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
};

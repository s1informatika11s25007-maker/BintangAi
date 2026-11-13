import { useState, useCallback, useRef } from 'react';
import { textToSpeechApi } from '../api/textToSpeechApi';
import { useVoiceStore } from '@/features/accessibility/store/voiceStore';
import { useVoice } from '@/features/accessibility/hooks/useVoice';

export const useBintangVoice = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentAudioRef = useRef(null);
  const { speak: voiceSpeak, stopSpeaking: voiceStop, replayLastSpoken } = useVoice();

  const speak = useCallback(async (text) => {
    if (!text) return;    setIsSpeaking(true);

    const storeState = useVoiceStore.getState();
    const { voiceSpeed, voiceVolume, voiceRepeat, selectedVoiceURI } = storeState;

    try {
      const data = await textToSpeechApi(text);
      if (data?.audioUrl) {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }

        const audio = new Audio(data.audioUrl);
        audio.playbackRate = Math.max(0.5, Math.min(2.0, voiceSpeed || 1.0));
        audio.volume = Math.max(0.0, Math.min(1.0, voiceVolume || 1.0));

        let repeatLeft = voiceRepeat || 1;
        audio.onended = () => {
          repeatLeft -= 1;
          if (repeatLeft > 0) {
            audio.currentTime = 0;
            audio.play().catch(() => setIsSpeaking(false));
          } else {
            setIsSpeaking(false);
          }
        };

        audio.onerror = () => {
          // Fallback to Web Speech Synthesis if audio URL fails to play
          voiceSpeak(text, 1.0, true);
          setIsSpeaking(false);
        };

        currentAudioRef.current = audio;
        await audio.play();
      } else {
        // Fallback to Web Speech API with full voice settings
        voiceSpeak(text, 1.0, true);
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error("Bintang Voice Error:", err);
      voiceSpeak(text, 1.0, true);
      setIsSpeaking(false);
    }
  }, [voiceSpeak]);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    voiceStop();
    setIsSpeaking(false);
  }, [voiceStop]);

  return {
    speak,
    stop,
    isSpeaking,
    replayLastSpoken
  };
};

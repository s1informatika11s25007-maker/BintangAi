import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Browser-native speech input. This keeps the existing audio-recorder hook API
 * for BintangAi screens while returning text transcripts instead of audio blobs.
 * No microphone recording is uploaded and no Whisper/model endpoint is called.
 */
export const useAudioRecorder = ({ lang = 'id-ID', onTranscript } = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const finalTextRef = useRef('');

  const startRecording = useCallback(() => {
    const Recognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    if (!Recognition) {
      setError('Browser ini belum mendukung Web Speech API. Gunakan Chrome atau Edge terbaru.');
      return false;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
    }
    setError('');
    setTranscript('');
    finalTextRef.current = '';

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      let interim = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const part = event.results[index][0]?.transcript || '';
        if (event.results[index].isFinal) finalTextRef.current += `${part} `;
        else interim += part;
      }
      const nextText = `${finalTextRef.current} ${interim}`.trim();
      setTranscript(nextText);
      onTranscript?.(nextText, false);
    };
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Izin mikrofon ditolak. Aktifkan izin mikrofon pada pengaturan browser.');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(`Pengenalan suara gagal: ${event.error}`);
      }
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
      const finalText = finalTextRef.current.trim();
      if (finalText) {
        setTranscript(finalText);
        onTranscript?.(finalText, true);
      }
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      return true;
    } catch (startError) {
      setIsRecording(false);
      setError(startError.message || 'Tidak dapat memulai mikrofon.');
      recognitionRef.current = null;
      return false;
    }
  }, [lang, onTranscript]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { setIsRecording(false); }
    } else setIsRecording(false);
  }, []);

  const clearAudio = useCallback(() => {
    setTranscript('');
    finalTextRef.current = '';
    setError('');
  }, []);

  useEffect(() => () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* no-op */ }
      recognitionRef.current = null;
    }
  }, []);

  return { isRecording, transcript, error, startRecording, stopRecording, clearAudio };
};

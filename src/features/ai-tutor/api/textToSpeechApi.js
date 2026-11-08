/** Browser-native speech synthesis. No TTS provider or model is called. */
export const textToSpeechApi = async (text, options = {}) => {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
    return { success: false, error: 'Browser tidak mendukung SpeechSynthesis.' };
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(String(text));
  utterance.lang = options.lang || 'id-ID';
  utterance.rate = options.rate || 1;
  window.speechSynthesis.speak(utterance);
  return { success: true };
};

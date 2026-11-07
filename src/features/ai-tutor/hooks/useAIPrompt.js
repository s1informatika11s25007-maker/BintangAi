import { useState } from 'react';
import { askTutorApi } from '../api/askTutorApi';

export const useAIPrompt = () => {
  const [loading, setLoading] = useState(false);

  const getAIResponse = async (prompt, userId, context = []) => {
    setLoading(true);
    try {
      const response = await askTutorApi(prompt, userId, context);
      return response;
    } catch (err) {
      console.error("AI Prompt Error:", err);
      return { success: false, answer: "Maaf, ada gangguan koneksi ke otak AI Kak Bintang." };
    } finally {
      setLoading(false);
    }
  };

  return { getAIResponse, loading };
};

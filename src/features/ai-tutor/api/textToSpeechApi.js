import { supabase } from '../../../lib/supabaseClient';

export const textToSpeechApi = async (text) => {
  try {
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: { text },
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("TTS API Error:", err);
    return null;
  }
};

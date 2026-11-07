import { supabase } from '../../../lib/supabase';

export const generateQuizApi = async (config) => {
  try {
    const { data, error: invokeError } = await supabase.functions.invoke('generate-quiz', {
      body: config,
      headers: {
        'x-api-key': import.meta.env.VITE_CUSTOM_AI_TUTOR_KEY || 'christian'
      }
    });

    if (invokeError) throw invokeError;
    return { success: true, quiz: data };
  } catch (err) {
    console.error("Generate AI Quiz Error:", err);
    return { success: false, message: err.message };
  }
};

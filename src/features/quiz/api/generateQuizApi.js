import { supabase } from '../../../lib/supabase';

export const generateQuizApi = async (config = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-quiz', { body: config });
    if (error) throw error;
    if (!data) throw new Error('Server tidak mengembalikan kuis.');
    return { success: true, quiz: data.quiz || data };
  } catch (error) {
    console.error('Generate BintangAi Quiz Error:', error);
    return { success: false, message: error?.message || 'Kuis belum dapat dibuat.' };
  }
};

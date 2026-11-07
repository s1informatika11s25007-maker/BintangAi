import { supabase } from '../../../lib/supabaseClient';

export const visionApi = async (imageData) => {
  try {
    const { data, error } = await supabase.functions.invoke('vision-api', {
      body: { image: imageData },
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Vision API Error:", err);
    return null;
  }
};

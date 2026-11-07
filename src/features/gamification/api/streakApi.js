import { supabase } from '../../../lib/supabaseClient';

export const updateStreakApi = async (userId) => {
  const { data, error } = await supabase.rpc('update_user_streak', { user_id: userId });
  if (error) throw error;
  return data;
};

export const getStreakApi = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('streak')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data.streak;
};

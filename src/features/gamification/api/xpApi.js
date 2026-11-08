import { supabase } from '../../../lib/supabaseClient';

export const updateXPApi = async (points) => {
  const { data, error } = await supabase.rpc('add_xp', { points });
  if (error) throw error;
  return data;
};

import { supabase } from '../../../lib/supabaseClient';

export const updateXPApi = async (amount) => {
  const value = Math.max(0, Math.min(500, Math.floor(Number(amount) || 0)));
  if (!value) return 0;
  const { data, error } = await supabase.rpc('add_xp', { amount: value });
  if (error) throw error;
  return data;
};

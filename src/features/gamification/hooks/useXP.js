import { supabase } from '../../../lib/supabaseClient';
import { useXPStore } from '../store/xpStore';

export function useXP() {
  const { xp, streak, addXP } = useXPStore();
  const awardXP = async (points) => {
    const value = Math.max(0, Math.min(500, Math.floor(Number(points) || 0)));
    if (!value) return;
    const { error } = await supabase.rpc('add_xp', { amount: value });
    if (error) throw error;
    addXP(value);
  };
  return { xp, streak, awardXP };
}

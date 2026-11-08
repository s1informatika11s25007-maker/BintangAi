import { useAuthStore } from '../../auth/store/useAuthStore';
import { updateXPApi } from '../api/xpApi';

export const useGamification = () => {
  const { profile, fetchProfile } = useAuthStore();
  const addXP = async (points) => {
    if (!profile?.id || !Number.isFinite(Number(points)) || Number(points) <= 0) return;
    try {
      await updateXPApi(Number(points));
      await fetchProfile(profile.id);
    } catch (err) {
      console.error('Failed to add XP:', err);
    }
  };
  const currentLevel = Math.floor((profile?.xp || 0) / 1000) + 1;
  const progressToNextLevel = ((profile?.xp || 0) % 1000) / 10;
  return { xp: profile?.xp || 0, streak: profile?.streak || 0, level: currentLevel, progress: progressToNextLevel, addXP };
};

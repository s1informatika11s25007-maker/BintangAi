import { useAuthStore } from '../../../store/useAuthStore';
import { updateXPApi } from '../../../api/gamification/xpApi';

export const useGamification = () => {
  const { profile, fetchProfile } = useAuthStore();

  const addXP = async (points) => {
    if (!profile?.id) return;
    try {
      await updateXPApi(points);
      await fetchProfile(profile.id);
    } catch (err) {
      console.error("Failed to add XP:", err);
    }
  };

  const currentLevel = Math.floor((profile?.xp || 0) / 1000) + 1;
  const progressToNextLevel = ((profile?.xp || 0) % 1000) / 10;

  return {
    xp: profile?.xp || 0,
    streak: profile?.streak || 0,
    level: currentLevel,
    progress: progressToNextLevel,
    addXP
  };
};

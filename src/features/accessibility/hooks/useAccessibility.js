import { useEffect } from 'react';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useAuthStore } from '../../auth/store/useAuthStore';

export function useAccessibility() {
  const { profile: authProfile } = useAuthStore();
  const {
    mode,
    modes = [],
    isBlind: storeBlind,
    isDeaf: storeDeaf,
    isMute: storeMute,
    isVoiceActive,
    isSubtitleActive,
    isGestureActive,
    setModeFromProfile
  } = useAccessibilityStore();

  useEffect(() => {
    if (authProfile) {
      setModeFromProfile(authProfile);
    }
  }, [authProfile, setModeFromProfile]);

  const activeMode = mode || null;
  const isBlind = storeBlind || activeMode === 'tunanetra';
  const isDeaf = storeDeaf || activeMode === 'tunarungu';
  const isMute = storeMute || activeMode === 'tunawicara';

  return {
    mode: activeMode,
    modes: modes.length > 0 ? modes : (activeMode ? [activeMode] : []),
    isBlind,
    isDeaf,
    isMute,
    isVoiceActive: isBlind ? (isVoiceActive !== undefined ? isVoiceActive : true) : false,
    isSubtitleActive: (isDeaf || isMute) ? (isSubtitleActive !== undefined ? isSubtitleActive : true) : false,
    isGestureActive: isMute ? (isGestureActive !== undefined ? isGestureActive : true) : false
  };
}

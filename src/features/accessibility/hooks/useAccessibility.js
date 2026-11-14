import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useAuthStore } from '../../auth/store/useAuthStore';

export function useAccessibility() {
  const { profile: authProfile } = useAuthStore();
  const { mode, modes = [], isBlind: storeBlind, isDeaf: storeDeaf, isMute: storeMute, isVoiceActive, isSubtitleActive, isGestureActive, setModeFromProfile, isManualSelection } = useAccessibilityStore();
  const location = useLocation();

  useEffect(() => {
    if (authProfile) {
      setModeFromProfile(authProfile);
    }
  }, [authProfile, setModeFromProfile]);

  const isSiswa = authProfile?.role === 'siswa';

  // Disable accessibility features on public/landing pages or for non-student roles unless manually selected
  const isPublicPage = useMemo(() => {
    const publicPaths = ['/', '/auth/login', '/auth/register'];
    return publicPaths.includes(location.pathname) || location.pathname.startsWith('/auth/');
  }, [location.pathname]);

  const isDisabled = (isPublicPage && !isManualSelection) || (!isSiswa && !isManualSelection);

  const effectiveMode = isDisabled ? null : mode;
  const effectiveModes = isDisabled ? [] : modes;
  const isBlind = isDisabled ? false : storeBlind;
  const isDeaf = isDisabled ? false : storeDeaf;
  const isMute = isDisabled ? false : storeMute;

  return {
    mode: effectiveMode,
    modes: effectiveModes,
    isBlind,
    isDeaf,
    isMute,
    isVoiceActive: isBlind ? isVoiceActive : false,
    isSubtitleActive: (isDeaf || isMute) ? isSubtitleActive : false,
    isGestureActive: isMute ? isGestureActive : false
  };
}

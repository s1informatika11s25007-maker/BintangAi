import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useAuthStore } from '../../auth/store/useAuthStore';

export function useAccessibility() {
  const { profile: authProfile } = useAuthStore();
  const { mode, isVoiceActive, isSubtitleActive, isGestureActive, setModeFromProfile } = useAccessibilityStore();
  const location = useLocation();

  useEffect(() => {
    if (authProfile) {
      setModeFromProfile(authProfile);
    }
  }, [authProfile, setModeFromProfile]);

  // Disable accessibility features on public/landing pages to avoid "contamination"
  const isPublicPage = useMemo(() => {
    const publicPaths = ['/', '/auth/login', '/auth/register'];
    return publicPaths.includes(location.pathname) || location.pathname.startsWith('/auth/');
  }, [location.pathname]);

  const effectiveMode = isPublicPage ? null : mode;

  const isBlind = effectiveMode === 'tunanetra';
  const isDeaf = effectiveMode === 'tunarungu';
  const isMute = effectiveMode === 'tunawicara';

  return {
    mode: effectiveMode,
    isBlind,
    isDeaf,
    isMute,
    isVoiceActive: isPublicPage ? false : isVoiceActive,
    isSubtitleActive: isPublicPage ? false : isSubtitleActive,
    isGestureActive: isPublicPage ? false : isGestureActive
  };
}

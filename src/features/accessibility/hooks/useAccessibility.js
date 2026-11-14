import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useAuthStore } from '../../auth/store/useAuthStore';

export function useAccessibility() {
  const { profile: authProfile } = useAuthStore();
  const { mode, isVoiceActive, isSubtitleActive, isGestureActive, setModeFromProfile, isManualSelection } = useAccessibilityStore();
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

  const effectiveMode = (isPublicPage && !isManualSelection) || (!isSiswa && !isManualSelection) ? null : mode;

  const isBlind = effectiveMode === 'tunanetra';
  const isDeaf = effectiveMode === 'tunarungu';
  const isMute = effectiveMode === 'tunawicara';

  return {
    mode: effectiveMode,
    isBlind,
    isDeaf,
    isMute,
    isVoiceActive: effectiveMode === 'tunanetra' ? isVoiceActive : false,
    isSubtitleActive: (effectiveMode === 'tunarungu' || effectiveMode === 'tunawicara') ? isSubtitleActive : false,
    isGestureActive: effectiveMode === 'tunawicara' ? isGestureActive : false
  };
}

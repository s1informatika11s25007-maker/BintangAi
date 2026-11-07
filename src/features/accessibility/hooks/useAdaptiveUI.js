import { useEffect } from 'react';
import { useAuthStore } from '../../auth/store/useAuthStore';

export function useAdaptiveUI() {
  const { profile } = useAuthStore();
  const disability = profile?.disability_type || 'tidak_ada';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-disability', disability);

    if (disability === 'tunanetra') {
      root.classList.add('high-contrast');
      root.style.fontSize = '125%';
    } else {
      root.classList.remove('high-contrast');
      root.style.fontSize = '100%';
    }

    if (disability === 'tunarungu') {
      root.classList.add('visual-only');
    } else {
      root.classList.remove('visual-only');
    }

    return () => {
      root.removeAttribute('data-disability');
    };
  }, [disability]);

  return { disability };
}

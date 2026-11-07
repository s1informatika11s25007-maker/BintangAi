import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAccessibilityStore = create(
  persist(
    (set, get) => ({
      mode: null, // 'tunanetra', 'tunarungu', 'tunawicara'
      isVoiceActive: false,
      isSubtitleActive: false,
      isGestureActive: false,
      profile: null,

      setModeFromProfile: (profile) => {
        if (!profile) {
          get().reset();
          return;
        }

        const mode = profile.disability_type;
        set({
          mode,
          isVoiceActive: mode === 'tunanetra',
          isSubtitleActive: mode === 'tunawicara', // Tunawicara uses subtitles for gesture feedback
          isGestureActive: mode === 'tunawicara',
          profile
        });

        get().reapplyMode();
      },

      // Reapply mode on page load and route changes
      reapplyMode: (forceOff = false) => {
        const { mode } = get();
        const root = document.documentElement;

        if (mode && !forceOff) {
          root.setAttribute('data-disability', mode);

          // Clear existing classes
          root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
          root.classList.add(`${mode}-mode`);

          if (mode === 'tunanetra') {
            root.style.fontSize = '125%';
          } else if (mode === 'tunarungu') {
            root.style.fontSize = '115%';
          } else {
            root.style.fontSize = '100%';
          }

          // Save simple key for main.jsx early access
          localStorage.setItem('bintangai-mode-simple', mode);
        } else {
          // Clear visuals if no mode or forced off
          root.setAttribute('data-disability', 'none');
          root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
          root.style.fontSize = '100%';
          if (forceOff) {
             // Keep mode in state but disable visuals for landing/auth
          } else {
             localStorage.removeItem('bintangai-mode-simple');
          }
        }
      },

      reset: () => {
        const root = document.documentElement;
        root.setAttribute('data-disability', 'none');
        root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
        root.style.fontSize = '100%';
        localStorage.removeItem('bintangai-mode-simple');

        set({
          mode: null,
          isVoiceActive: false,
          isSubtitleActive: false,
          isGestureActive: false,
          profile: null
        });
      }
    }),
    {
      name: 'bintangai-accessibility',
      partialize: (state) => ({ mode: state.mode })
    }
  )
);

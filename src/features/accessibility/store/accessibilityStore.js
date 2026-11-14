import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAccessibilityStore = create(
  persist(
    (set, get) => ({
      mode: null, // 'tunanetra', 'tunarungu', 'tunawicara'
      isVoiceActive: false,
      isSubtitleActive: false,
      isLiveCaptionActive: false,
      isTeacherBroadcastActive: false,
      isGestureActive: false,
      profile: null,

      // Caption customization settings for Tunarungu (Deaf) students
      captionFontSize: 'medium', // 'small', 'medium', 'large', 'xlarge'
      captionBgColor: 'dark',     // 'dark', 'black', 'indigo', 'amber'
      captionPosition: 'top',    // 'top', 'bottom'

      setModeFromProfile: (profile) => {
        if (!profile) {
          get().reset();
          return;
        }

        const mode = profile.disability_type;
        set((state) => ({
          mode,
          isVoiceActive: mode === 'tunanetra',
          isSubtitleActive: mode === 'tunarungu' || mode === 'tunawicara',
          // Preserve user's manual close state if explicitly set
          isLiveCaptionActive: state.isLiveCaptionActive !== undefined ? state.isLiveCaptionActive : (mode === 'tunarungu'),
          isGestureActive: mode === 'tunawicara',
          profile
        }));

        get().reapplyMode();
      },

      setIsLiveCaptionActive: (active) => set({ isLiveCaptionActive: active }),
      setIsTeacherBroadcastActive: (active) => set({ isTeacherBroadcastActive: active }),

      setCaptionSettings: (settings) => {
        set((state) => ({
          captionFontSize: settings.fontSize || state.captionFontSize,
          captionBgColor: settings.bgColor || state.captionBgColor,
          captionPosition: settings.position || state.captionPosition
        }));
      },

      // Reapply mode on page load and route changes
      reapplyMode: (forceOff = false) => {
        const { mode } = get();
        const root = document.documentElement;

        if (mode && !forceOff) {
          root.setAttribute('data-disability', mode);

          // Clear existing classes and add current mode class
          root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
          root.classList.add(`${mode}-mode`);

          if (mode === 'tunanetra') {
            root.style.fontSize = '125%';
          } else if (mode === 'tunarungu') {
            root.style.fontSize = '115%';
          } else {
            root.style.fontSize = '100%';
          }

          localStorage.setItem('bintangai-mode-simple', mode);
        } else {
          // Clear all accessibility visual effects & audio when forceOff is true (Landing/Login/Register)
          root.setAttribute('data-disability', 'none');
          root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
          root.style.fontSize = '100%';

          if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }

          if (!forceOff) {
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

        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }

        set({
          mode: null,
          isVoiceActive: false,
          isSubtitleActive: false,
          isLiveCaptionActive: false,
          isGestureActive: false,
          profile: null,
          captionFontSize: 'medium',
          captionBgColor: 'dark',
          captionPosition: 'top'
        });
      }
    }),
    {
      name: 'bintangai-accessibility',
      partialize: (state) => ({
        mode: state.mode,
        isLiveCaptionActive: state.isLiveCaptionActive,
        captionFontSize: state.captionFontSize,
        captionBgColor: state.captionBgColor,
        captionPosition: state.captionPosition
      })
    }
  )
);

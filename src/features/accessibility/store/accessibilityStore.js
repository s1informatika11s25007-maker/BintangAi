import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAccessibilityStore = create(
  persist(
    (set, get) => ({
      mode: null, // primary mode for legacy string compatibility
      modes: [], // ['tunanetra', 'tunarungu', 'tunawicara'] for multi-disability
      isBlind: false,
      isDeaf: false,
      isMute: false,
      isManualSelection: false,
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

        const isSiswa = profile.role === 'siswa';

        let rawDisabilities = [];
        if (Array.isArray(profile.disabilities) && profile.disabilities.length > 0) {
          rawDisabilities = profile.disabilities;
        } else if (profile.disability_type && profile.disability_type !== 'tidak_ada') {
          rawDisabilities = [profile.disability_type];
        }

        const validTypes = ['tunanetra', 'tunarungu', 'tunawicara'];
        const modes = isSiswa ? rawDisabilities.filter(d => validTypes.includes(d)) : [];

        const isBlind = isSiswa && modes.includes('tunanetra');
        const isDeaf = isSiswa && modes.includes('tunarungu');
        const isMute = isSiswa && modes.includes('tunawicara');
        const primaryMode = modes[0] || null;

        set((state) => ({
          mode: primaryMode,
          modes,
          isBlind,
          isDeaf,
          isMute,
          isManualSelection: false,
          isVoiceActive: isBlind,
          isSubtitleActive: isDeaf || isMute,
          isLiveCaptionActive: isSiswa && (state.isLiveCaptionActive !== undefined ? state.isLiveCaptionActive : isDeaf),
          isGestureActive: isMute,
          profile
        }));

        get().reapplyMode();
      },

      setManualMode: (newMode) => {
        const validModes = ['tunanetra', 'tunarungu', 'tunawicara'];
        const cleanMode = (newMode && newMode !== 'tidak_ada' && validModes.includes(newMode)) ? newMode : null;
        const modes = cleanMode ? [cleanMode] : [];
        const isBlind = cleanMode === 'tunanetra';
        const isDeaf = cleanMode === 'tunarungu';
        const isMute = cleanMode === 'tunawicara';

        set(() => ({
          mode: cleanMode,
          modes,
          isBlind,
          isDeaf,
          isMute,
          isManualSelection: true,
          isVoiceActive: isBlind,
          isSubtitleActive: isDeaf || isMute,
          isLiveCaptionActive: isDeaf,
          isGestureActive: isMute
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

      // Reapply modes on page load and route changes
      reapplyMode: (forceOff = false) => {
        const { modes = [], mode, profile, isManualSelection, isBlind, isDeaf, isMute } = get();
        const root = document.documentElement;

        const activeModes = (modes && modes.length > 0) ? modes : (mode && mode !== 'tidak_ada' ? [mode] : []);
        const activeBlind = isBlind || activeModes.includes('tunanetra');
        const activeDeaf = isDeaf || activeModes.includes('tunarungu');
        const activeMute = isMute || activeModes.includes('tunawicara');

        const shouldApply = !forceOff && activeModes.length > 0;

        if (shouldApply) {
          root.setAttribute('data-disability', activeModes[0] || 'none');
          root.setAttribute('data-disabilities', activeModes.join(','));

          root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
          activeModes.forEach(m => root.classList.add(`${m}-mode`));

          if (activeBlind) {
            root.style.fontSize = '125%';
          } else if (activeDeaf) {
            root.style.fontSize = '115%';
          } else {
            root.style.fontSize = '100%';
          }

          localStorage.setItem('bintangai-mode-simple', activeModes.join(','));
        } else if (forceOff || activeModes.length === 0) {
          // Clear visual effects only when explicitly forced off or when no disability mode is active
          root.setAttribute('data-disability', 'none');
          root.setAttribute('data-disabilities', 'none');
          root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
          root.style.fontSize = '100%';

          if (forceOff && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }

          localStorage.removeItem('bintangai-mode-simple');
        }
      },

      reset: () => {
        const root = document.documentElement;
        root.setAttribute('data-disability', 'none');
        root.setAttribute('data-disabilities', 'none');
        root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
        root.style.fontSize = '100%';

        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }

        set({
          mode: null,
          modes: [],
          isBlind: false,
          isDeaf: false,
          isMute: false,
          isManualSelection: false,
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
        modes: state.modes,
        isBlind: state.isBlind,
        isDeaf: state.isDeaf,
        isMute: state.isMute,
        isManualSelection: state.isManualSelection,
        isVoiceActive: state.isVoiceActive,
        isSubtitleActive: state.isSubtitleActive,
        isLiveCaptionActive: state.isLiveCaptionActive,
        isGestureActive: state.isGestureActive,
        captionFontSize: state.captionFontSize,
        captionBgColor: state.captionBgColor,
        captionPosition: state.captionPosition
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.mode && state.mode !== 'tidak_ada' && (!state.modes || state.modes.length === 0)) {
            state.modes = [state.mode];
          }
          if (state.mode === 'tunanetra') {
            state.isBlind = true;
            state.isVoiceActive = true;
          } else if (state.mode === 'tunarungu') {
            state.isDeaf = true;
            state.isSubtitleActive = true;
            state.isLiveCaptionActive = true;
          } else if (state.mode === 'tunawicara') {
            state.isMute = true;
            state.isSubtitleActive = true;
            state.isGestureActive = true;
          }
          state.reapplyMode();
        }
      }
    }
  )
);

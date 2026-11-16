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

      // Custom font size, contrast, and auto-mode settings
      fontSize: 100, // 80 to 150 (%)
      highContrast: false,
      autoMode: true,

      // Caption customization settings for Tunarungu (Deaf) students
      captionFontSize: 'medium', // 'small', 'medium', 'large', 'xlarge'
      captionBgColor: 'dark',     // 'dark', 'black', 'indigo', 'amber'
      captionPosition: 'top',    // 'top', 'bottom'

      setFontSize: (val) => {
        const num = Math.max(80, Math.min(150, parseInt(val) || 100));
        set({ fontSize: num });
        get().reapplyMode();
      },

      setHighContrast: (active) => {
        set({ highContrast: Boolean(active) });
        get().reapplyMode();
      },

      setAutoMode: (active) => {
        set({ autoMode: Boolean(active) });
        get().reapplyMode();
      },

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
          isLiveCaptionActive: Boolean(state.isLiveCaptionActive),
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

        set((state) => ({
          mode: cleanMode,
          modes,
          isBlind,
          isDeaf,
          isMute,
          isManualSelection: true,
          isVoiceActive: isBlind,
          isSubtitleActive: isDeaf || isMute,
          isLiveCaptionActive: Boolean(state.isLiveCaptionActive),
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

      // Reapply modes and custom settings on page load and route changes
      reapplyMode: (forceOff = false) => {
        const { modes = [], mode, isBlind, isDeaf, isMute, fontSize, highContrast } = get();
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

          localStorage.setItem('bintangai-mode-simple', activeModes.join(','));
        } else if (forceOff || activeModes.length === 0) {
          root.setAttribute('data-disability', 'none');
          root.setAttribute('data-disabilities', 'none');
          root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');

          if (forceOff && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }

          localStorage.removeItem('bintangai-mode-simple');
        }

        // Apply Font Size: user custom fontSize takes priority if set away from default
        if (fontSize && fontSize !== 100) {
          root.style.fontSize = `${fontSize}%`;
        } else if (activeBlind) {
          root.style.fontSize = '125%';
        } else if (activeDeaf) {
          root.style.fontSize = '115%';
        } else {
          root.style.fontSize = '100%';
        }

        // Apply High Contrast / Dark Mode class globally
        if (highContrast) {
          root.classList.add('high-contrast-mode');
          root.setAttribute('data-contrast', 'high');
        } else {
          root.classList.remove('high-contrast-mode');
          root.setAttribute('data-contrast', 'normal');
        }
      },

      reset: () => {
        const root = document.documentElement;
        root.setAttribute('data-disability', 'none');
        root.setAttribute('data-disabilities', 'none');
        root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode', 'high-contrast-mode');
        root.removeAttribute('data-contrast');
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
          fontSize: 100,
          highContrast: false,
          autoMode: true,
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
        fontSize: state.fontSize,
        highContrast: state.highContrast,
        autoMode: state.autoMode,
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


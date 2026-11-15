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
        const modes = validModes.includes(newMode) ? [newMode] : [];
        const isBlind = modes.includes('tunanetra');
        const isDeaf = modes.includes('tunarungu');
        const isMute = modes.includes('tunawicara');

        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('bintangai_session_manual_mode', newMode || 'tidak_ada');
          }
        } catch (e) {}

        set(() => ({
          mode: newMode || null,
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
        const { modes = [], profile, isManualSelection, isBlind, isDeaf } = get();
        const root = document.documentElement;
        const isSiswa = profile?.role === 'siswa';

        const shouldApply = (modes.length > 0) && ((isSiswa && !forceOff) || isManualSelection);

        if (shouldApply) {
          root.setAttribute('data-disability', modes[0] || 'none');
          root.setAttribute('data-disabilities', modes.join(','));

          root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
          modes.forEach(m => root.classList.add(`${m}-mode`));

          if (isBlind) {
            root.style.fontSize = '125%';
          } else if (isDeaf) {
            root.style.fontSize = '115%';
          } else {
            root.style.fontSize = '100%';
          }

          localStorage.setItem('bintangai-mode-simple', modes.join(','));
        } else {
          // Clear all accessibility visual effects & audio when forceOff is true or non-student role
          root.setAttribute('data-disability', 'none');
          root.setAttribute('data-disabilities', 'none');
          root.classList.remove('blind-mode', 'deaf-mode', 'mute-mode');
          root.style.fontSize = '100%';

          if (typeof window !== 'undefined' && window.speechSynthesis) {
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
        try {
          localStorage.removeItem('bintangai-mode-simple');
          localStorage.removeItem('gesture_camera_disabled');
          sessionStorage.removeItem('bintangai_session_manual_mode');
        } catch (e) {}

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
        isManualSelection: state.isManualSelection,
        isLiveCaptionActive: state.isLiveCaptionActive,
        captionFontSize: state.captionFontSize,
        captionBgColor: state.captionBgColor,
        captionPosition: state.captionPosition
      })
    }
  )
);

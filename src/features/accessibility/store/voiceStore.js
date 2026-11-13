import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useVoiceStore = create(
  persist(
    (set, get) => ({
      isListening: false,
      transcript: '',
      // Sound Settings
      voiceSpeed: 1.0,      // 0.5 to 2.0 (1.0 = Normal)
      voiceVolume: 1.0,     // 0.0 to 1.0 (1.0 = 100%)
      voiceRepeat: 1,       // 1 (normal), 2 (repeat 1x), 3 (repeat 2x)
      selectedVoiceURI: '', // Unique identifier or name for selected Indonesian TTS voice
      lastSpokenText: '',   // Caches last spoken text for instant audio replaying

      toggleListening: () => set((state) => ({ isListening: !state.isListening })),
      setTranscript: (text) => set({ transcript: text }),

      setVoiceSpeed: (speed) => {
        const val = Math.max(0.5, Math.min(2.0, parseFloat(speed) || 1.0));
        set({ voiceSpeed: parseFloat(val.toFixed(1)) });
        // Sync to legacy accessibility_settings if present
        try {
          const acc = JSON.parse(localStorage.getItem('accessibility_settings') || '{}');
          acc.voiceSpeed = parseFloat(val.toFixed(1));
          localStorage.setItem('accessibility_settings', JSON.stringify(acc));
        } catch (e) {}
      },

      setVoiceVolume: (volume) => {
        const val = Math.max(0.0, Math.min(1.0, parseFloat(volume) ?? 1.0));
        set({ voiceVolume: parseFloat(val.toFixed(2)) });
      },

      setVoiceRepeat: (repeat) => {
        const val = Math.max(1, Math.min(3, parseInt(repeat) || 1));
        set({ voiceRepeat: val });
      },

      setSelectedVoiceURI: (voiceURI) => set({ selectedVoiceURI: voiceURI }),

      setLastSpokenText: (text) => {
        if (text && typeof text === 'string') {
          set({ lastSpokenText: text });
        }
      },

      resetVoiceSettings: () => set({
        voiceSpeed: 1.0,
        voiceVolume: 1.0,
        voiceRepeat: 1,
        selectedVoiceURI: ''
      })
    }),
    {
      name: 'bintangai-sound-settings',
      partialize: (state) => ({
        voiceSpeed: state.voiceSpeed,
        voiceVolume: state.voiceVolume,
        voiceRepeat: state.voiceRepeat,
        selectedVoiceURI: state.selectedVoiceURI
      })
    }
  )
);

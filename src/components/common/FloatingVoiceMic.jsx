import React, { useState } from 'react';
import { Mic, Volume2 } from 'lucide-react';
import { speakTextNative } from '../../services/ai/nativeChromeService';

export default function FloatingVoiceMic({ onOpenCaptureModal, label = "Voice Capture AI" }) {
  const [isPlayingWelcome, setIsPlayingWelcome] = useState(false);

  const handleSpeakGuidance = (e) => {
    e.stopPropagation();
    setIsPlayingWelcome(true);
    speakTextNative("Halo Suster. Silakan tekan tombol rekam untuk melaporkan observasi perawatan lansia hari ini.");
    setTimeout(() => setIsPlayingWelcome(false), 3000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-2 animate-bounce-slow">
      <div className="flex items-center space-x-1">
        <button
          onClick={handleSpeakGuidance}
          title="Dengarkan Petunjuk Suara (TTS Native)"
          className="p-2 bg-white/90 hover:bg-white text-sky-700 rounded-full shadow-md border border-sky-200 transition text-xs font-bold flex items-center space-x-1"
        >
          <Volume2 className={`w-3.5 h-3.5 ${isPlayingWelcome ? 'animate-pulse text-sky-600' : ''}`} />
        </button>

        <button
          onClick={onOpenCaptureModal}
          className="group flex items-center space-x-2 bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white px-4 py-3 rounded-full shadow-2xl shadow-sky-500/40 border border-white/20 transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="relative flex items-center justify-center">
            <Mic className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="font-bold text-xs tracking-wide">{label}</span>
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import {
  HiVolumeUp,
  HiChevronDown,
  HiCheck,
  HiAdjustments
} from 'react-icons/hi';

export const AuthHeaderAccessibilityBar = ({
  spokenTitle = '',
  spokenText = '',
  onReadPage = null
}) => {
  const { speak, stopSpeaking, isSpeaking } = useVoice();
  const { mode, setManualMode } = useAccessibilityStore();

  const [selectedDisability, setSelectedDisability] = useState(mode || 'tidak_ada');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(100);
  const [isHighContrast, setIsHighContrast] = useState(false);

  const dropdownRef = useRef(null);

  // Sync with global store mode
  useEffect(() => {
    setSelectedDisability(mode || 'tidak_ada');
  }, [mode]);

  // Sync high contrast status from DOM
  useEffect(() => {
    const root = document.documentElement;
    const currentDisability = root.getAttribute('data-disability');
    if (currentDisability === 'tunanetra' || root.classList.contains('blind-mode')) {
      setIsHighContrast(true);
    } else {
      setIsHighContrast(false);
    }
  }, [mode, selectedDisability]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDisability = (newMode) => {
    setSelectedDisability(newMode);
    setIsDropdownOpen(false);

    setManualMode(newMode);

    if (newMode === 'tunanetra') {
      setIsHighContrast(true);
      speak('Mode Tunanetra dipilih. Fitur Suara Pembaca dan Kontras Tinggi diaktifkan.', 1.0, true);
    } else {
      setIsHighContrast(false);

      const labels = {
        tunarungu: 'Mode Tunarungu dipilih. Fitur Teks Visual dan Subtitle diaktifkan.',
        tunawicara: 'Mode Tunawicara dipilih. Fitur Gambar Isyarat dan Pilihan Cepat diaktifkan.',
        tidak_ada: 'Mode Umum disesuaikan.'
      };
      speak(labels[newMode] || 'Mode disesuaikan.', 1.0, true);
    }
  };

  const handleToggleHighContrast = () => {
    const root = document.documentElement;
    const nextState = !isHighContrast;
    setIsHighContrast(nextState);

    if (nextState) {
      root.setAttribute('data-disability', 'tunanetra');
      root.classList.add('blind-mode');
      speak('Mode Kontras Tinggi diaktifkan.', 1.0, true);
    } else {
      root.setAttribute('data-disability', 'none');
      root.classList.remove('blind-mode');
      speak('Mode Kontras Standar diaktifkan.', 1.0, true);
    }
  };

  const handleCycleFontSize = () => {
    const root = document.documentElement;
    let nextSize = 100;
    if (fontSizeLevel === 100) nextSize = 120;
    else if (fontSizeLevel === 120) nextSize = 135;
    else nextSize = 100;

    setFontSizeLevel(nextSize);
    root.style.fontSize = `${nextSize}%`;

    const label = nextSize === 100 ? 'Ukuran teks normal 100%' : nextSize === 120 ? 'Ukuran teks besar 120%' : 'Ukuran teks sangat besar 135%';
    speak(label, 1.0, true);
  };

  const handleSpeakPageInfo = () => {
    if (onReadPage) {
      onReadPage();
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    const fullMessage = spokenText || `${spokenTitle}. Selamat datang di BintangAi, platform pembelajaran inklusif kelas 1 sampai 6 SD. Silakan pilih mode kebutuhan belajar Anda.`;
    speak(fullMessage, 1.0, true);
  };

  const disabilityOptions = [
    { id: 'tidak_ada', label: 'Umum (Standar SD)' },
    { id: 'tunanetra', label: 'Tunanetra (Hambatan Penglihatan)' },
    { id: 'tunarungu', label: 'Tunarungu (Hambatan Pendengaran)' },
    { id: 'tunawicara', label: 'Tunawicara (Hambatan Bicara)' },
  ];

  const currentOption = disabilityOptions.find(opt => opt.id === selectedDisability) || disabilityOptions[0];

  return (
    <div className="w-full bg-slate-900 text-white border-b border-slate-800 px-4 py-2 shadow-sm flex flex-wrap items-center justify-end gap-3 text-xs font-semibold relative z-50">
      {/* Right: Clean Dropdown & Contextual Tools */}
      <div className="flex flex-wrap items-center gap-2.5 ml-auto">
        {/* DISABILITY SELECTOR DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold border border-amber-400/30 transition-all focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-expanded={isDropdownOpen}
            aria-label="Pilih Mode Aksesibilitas Disabilitas"
          >
            <span>Mode: <strong>{currentOption.label}</strong></span>
            <HiChevronDown className={`text-base transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 space-y-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Pilih Kebutuhan Belajar:
              </div>
              {disabilityOptions.map((opt) => {
                const isSelected = selectedDisability === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectDisability(opt.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : 'text-slate-200 hover:bg-slate-800 font-bold'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    {isSelected && <HiCheck className="text-base text-slate-950" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CONTEXTUAL ACCESSIBILITY TOOLS (DYNAMICALLY SHOWN ONLY BASED ON SELECTED DISABILITY) */}

        {/* 1. TUNANETRA TOOLS */}
        {selectedDisability === 'tunanetra' && (
          <div className="flex items-center gap-2 animate-fadeIn">
            {/* Audio Reader Button */}
            <button
              type="button"
              onClick={handleSpeakPageInfo}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                isSpeaking
                  ? 'bg-amber-400 text-slate-900 shadow-md'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400/40'
              }`}
              aria-label={isSpeaking ? 'Hentikan Suara Pembaca' : 'Dengarkan Halaman'}
            >
              <HiVolumeUp className="text-base" />
              <span>{isSpeaking ? 'Membaca...' : 'Bacakan Halaman'}</span>
            </button>

            {/* High Contrast Button */}
            <button
              type="button"
              onClick={handleToggleHighContrast}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                isHighContrast
                  ? 'bg-yellow-400 text-black border-2 border-yellow-300 shadow-md'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
              }`}
              aria-label="Alihkan Mode Kontras Tinggi"
            >
              <span>{isHighContrast ? 'Kontras Tinggi [ON]' : 'Kontras Tinggi'}</span>
            </button>
          </div>
        )}

        {/* 2. TUNARUNGU TOOLS */}
        {selectedDisability === 'tunarungu' && (
          <div className="flex items-center gap-2 animate-fadeIn">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-900/80 text-cyan-200 font-extrabold border border-cyan-500/30">
              Teks Visual & Subtitle
            </span>
          </div>
        )}

        {/* 3. TUNAWICARA TOOLS */}
        {selectedDisability === 'tunawicara' && (
          <div className="flex items-center gap-2 animate-fadeIn">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/80 text-emerald-200 font-extrabold border border-emerald-500/30">
              Isyarat & Pilihan Gambar
            </span>
          </div>
        )}

        {/* Font Size Adjuster */}
        {selectedDisability !== 'tidak_ada' && (
          <button
            type="button"
            onClick={handleCycleFontSize}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all"
            aria-label="Ubah Ukuran Teks"
          >
            <HiAdjustments className="text-base text-sky-400" />
            <span>Ukuran Teks: <strong className="text-white">{fontSizeLevel}%</strong></span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthHeaderAccessibilityBar;

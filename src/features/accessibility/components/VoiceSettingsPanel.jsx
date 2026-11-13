import React from 'react';
import { useVoice } from '../hooks/useVoice';
import {
  HiVolumeUp, HiVolumeOff, HiPlay, HiRefresh,
  HiAdjustments, HiSparkles, HiCheck, HiAcademicCap
} from 'react-icons/hi';

export default function VoiceSettingsPanel({ compact = false }) {
  const {
    voiceSpeed,
    setVoiceSpeed,
    voiceVolume,
    setVoiceVolume,
    voiceRepeat,
    setVoiceRepeat,
    selectedVoiceURI,
    setSelectedVoiceURI,
    getIndonesianVoices,
    testVoice,
    replayLastSpoken,
    lastSpokenText,
    isSpeaking
  } = useVoice();

  const indonesianVoices = getIndonesianVoices();

  const speedPresets = [
    { label: '0.5x', value: 0.5, desc: 'Sangat Lambat' },
    { label: '0.8x', value: 0.8, desc: 'Ideal SD (Fokus)' },
    { label: '1.0x', value: 1.0, desc: 'Normal' },
    { label: '1.2x', value: 1.2, desc: 'Sedang' },
    { label: '1.5x', value: 1.5, desc: 'Cepat' },
  ];

  const repeatPresets = [
    { label: '1x', value: 1, desc: 'Bicara 1 Kali' },
    { label: '2x', value: 2, desc: 'Ulangi 1x' },
    { label: '3x', value: 3, desc: 'Ulangi 2x' },
  ];

  return (
    <div className={`space-y-6 ${compact ? 'p-2' : 'p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm'}`}>
      {/* Header Info */}
      {!compact && (
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl">
              <HiVolumeUp />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Pengaturan Suara & Bicara</h3>
              <p className="text-xs font-medium text-slate-500">Sesuaikan audio Kak Bintang dengan pendengaran siswa SD</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold">
            <HiAcademicCap className="text-sm" /> Khusus Pembelajaran SD
          </div>
        </div>
      )}

      {/* Benefit Banner for Elementary School Students */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-100 flex items-center gap-3 text-xs font-semibold text-indigo-900">
        <HiSparkles className="text-indigo-600 text-xl shrink-0 animate-pulse" />
        <span>
          <strong>Manfaat Siswa SD:</strong> Pengaturan kecepatan, volume, dan pengulangan membantu menyesuaikan daya tangkap & konsentrasi mendengar setiap siswa.
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 1. KECEPATAN SUARA (VOICE SPEED) */}
        <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <HiAdjustments className="text-indigo-600" /> Kecepatan Suara
            </label>
            <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-black">
              {voiceSpeed.toFixed(1)}x
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={voiceSpeed}
            onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />

          {/* Quick Presets */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {speedPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setVoiceSpeed(preset.value)}
                className={`py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
                  Math.abs(voiceSpeed - preset.value) < 0.05
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-105'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200'
                }`}
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 italic">
            * 0.8x disarankan untuk siswa SD agar kata demi kata lebih jelas.
          </p>
        </div>

        {/* 2. VOLUME SUARA (VOICE VOLUME) */}
        <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              {voiceVolume === 0 ? <HiVolumeOff className="text-rose-500" /> : <HiVolumeUp className="text-indigo-600" />} Volume Suara
            </label>
            <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-black">
              {Math.round(voiceVolume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setVoiceVolume(voiceVolume > 0 ? 0 : 1.0)}
              className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                voiceVolume === 0 ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {voiceVolume === 0 ? <HiVolumeOff className="text-base" /> : <HiVolumeUp className="text-base" />}
            </button>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={voiceVolume}
              onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Mute (0%)</span>
            <span>Sedang (50%)</span>
            <span>Maks (100%)</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 3. PENGULANGAN SUARA (VOICE REPEAT) */}
        <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
            Pengulangan Pembacaan
          </label>
          <div className="grid grid-cols-3 gap-2">
            {repeatPresets.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setVoiceRepeat(p.value)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  voiceRepeat === p.value
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-200'
                }`}
              >
                {voiceRepeat === p.value && <HiCheck className="text-sm" />}
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 italic">
            Pilih berapa kali Kak Bintang mengulangi penjelasan penting secara otomatis.
          </p>
        </div>

        {/* 4. SUARA BAHASA INDONESIA (INDONESIAN VOICE SELECTION) */}
        <div className="space-y-3 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
            Pilihan Suara Bahasa Indonesia
          </label>
          <select
            value={selectedVoiceURI}
            onChange={(e) => setSelectedVoiceURI(e.target.value)}
            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Otomatis (Suara Indonesia Terbaik)</option>
            {indonesianVoices.map((v, i) => (
              <option key={v.voiceURI || i} value={v.voiceURI || v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 italic">
            {indonesianVoices.length > 0
              ? `Tersedia ${indonesianVoices.length} pilihan suara Bahasa Indonesia di perangkat Anda.`
              : 'Menggunakan suara bawaan sistem Bahasa Indonesia.'}
          </p>
        </div>
      </div>

      {/* AUDIO ACTION BUTTONS: TEST VOICE & REPLAY */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => testVoice(selectedVoiceURI, voiceSpeed, voiceVolume)}
          disabled={isSpeaking}
          className="flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <HiPlay className="text-base" />
          {isSpeaking ? 'Sedang Membaca...' : 'Uji Coba Suara Kak Bintang'}
        </button>

        <button
          type="button"
          onClick={replayLastSpoken}
          disabled={!lastSpokenText || isSpeaking}
          className="py-3.5 px-6 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          title={lastSpokenText ? `Ulangi: "${lastSpokenText.slice(0, 30)}..."` : 'Belum ada suara yang diputar'}
        >
          <HiRefresh className={`text-base ${isSpeaking ? 'animate-spin' : ''}`} />
          Ulangi Suara Terakhir
        </button>
      </div>
    </div>
  );
}

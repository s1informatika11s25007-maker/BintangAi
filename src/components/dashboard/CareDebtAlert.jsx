import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Clock, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { calculateCareDebt } from '../../services/obligationEngine';
import { playUrgentCareDebtAlarm, setAudioMuted, getAudioMuted } from '../../services/audioAlertService';

export default function CareDebtAlert({ obligations }) {
  const careDebt = calculateCareDebt(obligations);
  const [isMuted, setIsMuted] = useState(getAudioMuted());

  useEffect(() => {
    // If critical breach exists and care debt > 30 mins, trigger audio alarm automatically
    if (careDebt.criticalBreaches > 0 || careDebt.totalDebtMinutes > 30) {
      playUrgentCareDebtAlarm();
    }
  }, [careDebt.criticalBreaches, careDebt.totalDebtMinutes]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setAudioMuted(nextMuted);
    if (!nextMuted) {
      playUrgentCareDebtAlarm();
    }
  };

  return (
    <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md ${
      careDebt.criticalBreaches > 0
        ? 'bg-rose-50 border-rose-300 shadow-rose-100'
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-2xl ${
          careDebt.criticalBreaches > 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
        }`}>
          {careDebt.criticalBreaches > 0 ? (
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          ) : (
            <ShieldCheck className="w-6 h-6" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 flex-wrap gap-1">
            <span>Cascade & Care Debt Detector (P1 Bitemporal)</span>
            <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
              careDebt.healthScore > 80 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              Skor Kesehatan: {careDebt.healthScore}/100
            </span>
            <button
              onClick={toggleMute}
              title={isMuted ? 'Aktifkan Alarm Suara Supervisor' : 'Matikan Alarm Suara'}
              className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center space-x-1 ${
                isMuted
                  ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                  : 'bg-rose-600 text-white border-rose-500 animate-pulse'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{isMuted ? 'Mute Alarm' : 'Live Alarm On'}</span>
            </button>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            {careDebt.criticalBreaches > 0
              ? `Terdeteksi ${careDebt.criticalBreaches} pelanggaran tenggat kritis! Risiko penumpukan kewajiban (Care Debt).`
              : 'Seluruh kewajiban terlaksana sesuai tenggat bitemporal. Tidak ada tunggakan kewajiban.'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-xs shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0">
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-medium">Tunggakan Waktu</div>
          <div className="font-mono font-black text-amber-700 flex items-center justify-end">
            <Clock className="w-3.5 h-3.5 mr-1" /> {careDebt.totalDebtMinutes} Menit
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-medium">Kritis Breached</div>
          <div className="font-mono font-black text-rose-700 flex items-center justify-end">
            <TrendingDown className="w-3.5 h-3.5 mr-1" /> {careDebt.criticalBreaches} Tugas
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { AlertCircle, Clock, Volume2, VolumeX, ShieldAlert, ChevronRight } from 'lucide-react';
import { calculateCareDebt } from '../../services/rule/obligationEngine';
import { playUrgentCareDebtAlarm, setAudioMuted, getAudioMuted } from '../../services/dashboard/audioAlertService';

export default function CareDebtAlert({ obligations, onOpenTraceModal, onGoToCaregiverPwa }) {
  const { totalDebtMinutes, criticalBreaches, healthScore } = calculateCareDebt(obligations);
  const [isMuted, setIsMuted] = React.useState(getAudioMuted());

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    setAudioMuted(nextState);
  };

  // Play audio alarm whenever care debt > 30 minutes and critical breach occurs
  useEffect(() => {
    if (totalDebtMinutes > 30 && criticalBreaches > 0 && !isMuted) {
      playUrgentCareDebtAlarm();
    }
  }, [totalDebtMinutes, criticalBreaches, isMuted]);

  if (totalDebtMinutes === 0 && criticalBreaches === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-sm">
            100
          </div>
          <div>
            <h4 className="font-bold text-emerald-900 text-xs sm:text-sm">Care Debt Terkendali (0 Menit Tertunda)</h4>
            <p className="text-slate-500 text-[11px] font-medium">
              Seluruh kewajiban medis berada dalam batas tenggat waktu aman (Health Score: {healthScore}%).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-300/80 rounded-2xl p-4 shadow-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs sm:text-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
          <span>Cascade & Care Debt Detector (P1 Bitemporal Alert)</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center space-x-1"
            title={isMuted ? "Nyalakan Alarm Suara" : "Matikan Alarm Suara"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-rose-600 animate-pulse" />}
            <span className="text-[10px] hidden sm:inline">{isMuted ? 'Muted' : 'Alarm Audio ON'}</span>
          </button>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
            Health Score: {healthScore}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-rose-200 flex items-center space-x-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-slate-500 text-[11px] font-semibold">Total Care Debt Kumulatif</p>
            <p className="font-extrabold text-slate-900 text-sm">{totalDebtMinutes} Menit Keterlambatan</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur p-3 rounded-xl border border-rose-200 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="text-slate-500 text-[11px] font-semibold">Pelanggaran Tenggat Kritis</p>
            <p className="font-extrabold text-rose-700 text-sm">{criticalBreaches} Tugas Kritis Overdue</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-rose-200/60">
        <p className="text-slate-600 font-medium text-[11px]">
          Saran AI: Lakukan eskalasi penugasan atau panggil perawat cadangan melalui P4 Failure-Set Search.
        </p>
        <button
          onClick={() => onOpenTraceModal?.(obligations[0])}
          className="text-sky-700 hover:text-sky-800 font-bold flex items-center space-x-1 shrink-0 ml-2"
        >
          <span>Buka Trace Traceability</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

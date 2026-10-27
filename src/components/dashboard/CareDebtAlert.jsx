import React from 'react';
import { AlertTriangle, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { calculateCareDebt } from '../../services/obligationEngine';

export default function CareDebtAlert({ obligations }) {
  const careDebt = calculateCareDebt(obligations);

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
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>Cascade & Care Debt Detector (P1 Kernel)</span>
            <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
              careDebt.healthScore > 80 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}>
              Skor Kesehatan: {careDebt.healthScore}/100
            </span>
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

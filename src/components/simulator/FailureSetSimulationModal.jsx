import React, { useState } from 'react';
import { Cpu, AlertTriangle, ShieldCheck, Play, RefreshCw } from 'lucide-react';
import { runFailureSetSimulation } from '../../services/failureSetSimulator';
import Modal from '../common/Modal';

export default function FailureSetSimulationModal({ isOpen, onClose, staff, obligations }) {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runFailureSetSimulation(staff, obligations);
      setResults(res);
      setIsRunning(false);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="P4 · Failure-Set Search Simulator">
      <div className="space-y-4">
        <p className="text-xs text-slate-300">
          Simulasi asinkron ini mencari kombinasi kegagalan pengasuh terkecil (minimal failure combination) yang dapat menyebabkan kewajiban kritis terelakkan/terlantarkan.
        </p>

        <button
          onClick={handleRunSimulation}
          disabled={isRunning}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs py-2.5 rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-amber-600/20"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Menjalankan Simulasi Failure-Set...' : 'Jalankan Simulasi Pencarian Kegagalan'}</span>
        </button>

        {results && (
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px]">Rekomendasi Simulator P4:</span>
              <p className="font-semibold text-amber-300 mt-0.5">{results.recommendation}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Skenario Kerentanan Terdeteksi:</h4>
              {results.minimalFailureSets.length === 0 ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Aman. Tidak ditemukan kombinasi 1 atau 2 pengasuh absen yang menelantarkan kewajiban kritis.</span>
                </div>
              ) : (
                results.minimalFailureSets.map((set, idx) => (
                  <div key={idx} className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Ukuran Kegagalan: {set.size} Pengasuh Absen
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        {set.riskLevel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300">
                      Pengasuh Absen: <span className="font-semibold text-white">{set.absentStaff.join(', ')}</span>
                    </p>

                    <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                      Tugas Kritis Terancam:
                      <ul className="list-disc list-inside mt-1 text-slate-300">
                        {set.abandonedObligations.map((ob, obIdx) => (
                          <li key={obIdx}>{ob.title} ({ob.resident_name})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

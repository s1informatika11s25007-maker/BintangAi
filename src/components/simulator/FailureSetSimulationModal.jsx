import React, { useState } from 'react';
import { Play, ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { runFailureSetSimulation } from '../../services/simulator/failureSetSimulator';
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
      <div className="space-y-4 text-slate-900">
        <p className="text-xs text-slate-600 font-medium">
          Simulasi asinkron ini mencari kombinasi kegagalan pengasuh terkecil (minimal failure combination) yang dapat menyebabkan kewajiban kritis terelakkan/terlantarkan.
        </p>

        <button
          onClick={handleRunSimulation}
          disabled={isRunning}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs py-2.5 rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-amber-600/20"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Memproses Simulasi Failure-Set...' : 'Jalankan Simulasi Pencarian Kegagalan'}</span>
        </button>

        {results && (
          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-xs">
              <span className="text-amber-900 font-bold block text-[10px]">Rekomendasi Simulator P4:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{results.recommendation}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Skenario Kerentanan Terdeteksi:</h4>
              {results.minimalFailureSets.length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Aman. Tidak ditemukan kombinasi 1 atau 2 pengasuh absen yang menelantarkan kewajiban kritis.</span>
                </div>
              ) : (
                results.minimalFailureSets.map((set, idx) => (
                  <div key={idx} className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" /> Ukuran Kegagalan: {set.size} Pengasuh Absen
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                        {set.riskLevel}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700">
                      Pengasuh Absen: <span className="font-bold text-slate-900">{set.absentStaff.join(', ')}</span>
                    </p>

                    <div className="text-[10px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                      Tugas Kritis Terancam:
                      <ul className="list-disc list-inside mt-1 text-slate-800 font-semibold">
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

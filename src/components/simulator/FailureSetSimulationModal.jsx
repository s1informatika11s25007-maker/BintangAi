import React, { useState } from 'react';
import { AlertOctagon, Cpu, Play, CheckCircle2, Users, ShieldAlert, X } from 'lucide-react';
import { runFailureSetSimulation } from '../../services/simulator/failureSetSimulator';

export default function FailureSetSimulationModal({ isOpen, onClose, staff = [], obligations = [] }) {
  const [simulationResult, setSimulationResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunSimulation = async () => {
    setIsRunning(true);
    const result = await runFailureSetSimulation(staff, obligations);
    setSimulationResult(result);
    setIsRunning(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 text-slate-900"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-900 text-sm">P4 · Failure-Set Search Simulator</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          Algoritma P4 Failure-Set Search secara otonom mensimulasikan kombinasi ketidakhadiran pengasuh (1 s/d 3 staf absen) untuk mendeteksi potensi penelantaran kewajiban kritis.
        </p>

        <button
          onClick={handleRunSimulation}
          disabled={isRunning}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-md shadow-purple-600/20"
        >
          {isRunning ? (
            <span>Menjalankan Simulasi Kombinasi P4...</span>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Jalankan Simulasi Pencarian Kegagalan</span>
            </>
          )}
        </button>

        {simulationResult && (
          <div className="space-y-3 bg-purple-50/60 border border-purple-200 p-4 rounded-xl text-xs">
            <div className="flex items-center justify-between font-bold text-purple-950">
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-purple-600 mr-1.5" /> Hasil Simulasi
              </span>
              <span className="text-[10px] font-mono text-purple-700">
                {new Date(simulationResult.simulationTimestamp).toLocaleTimeString('id-ID')} WIB
              </span>
            </div>

            <p className="font-medium text-purple-900">{simulationResult.recommendation}</p>

            {simulationResult.minimalFailureSets?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-purple-200">
                <p className="font-bold text-rose-900 text-[11px] uppercase tracking-wider">Minimal Failure Sets Terdeteksi:</p>
                {simulationResult.minimalFailureSets.map((set, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-rose-200 space-y-1 text-slate-800">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-rose-700">Jika Absen: {set.absentStaff?.join(', ')}</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono">
                        {set.impactedObligationsCount} Tugas Terganggu
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

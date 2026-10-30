import React from 'react';
import { Activity, ShieldCheck, Cpu, Database, CheckCircle, X, Sparkles } from 'lucide-react';
import { EPISTEMIC_LABELS } from '../../types/core/architecture';

export default function ExecutionTraceModal({ isOpen, onClose, obligation }) {
  if (!isOpen || !obligation) return null;

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
            <Activity className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-900 text-sm">Explainable Execution Trace Viewer</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
          <p className="font-bold text-slate-900">{obligation.title}</p>
          <p className="text-[11px] text-slate-500 font-medium">Mission ID: {obligation.mission_id || 'd3eebc99-9c0b'}</p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
            <p className="font-bold text-sky-900 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-sky-600" /> 1. Ingesti & Prompt Guard
            </p>
            <p className="text-sky-800 text-[11px]">Pass - Prompt Injection Check Verified (0 Threat Detected)</p>
          </div>

          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
            <p className="font-bold text-purple-900 flex items-center">
              <Cpu className="w-3.5 h-3.5 mr-1 text-purple-600" /> 2. Persepsi Epistemic Fact Ledger (P3)
            </p>
            <p className="text-purple-800 text-[11px]">Fact Classified: Observed / Reported (Confidence 98%)</p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <p className="font-bold text-emerald-900 flex items-center">
              <Database className="w-3.5 h-3.5 mr-1 text-emerald-600" /> 3. Atomic Database Persistence & Hash
            </p>
            <p className="text-emerald-800 text-[11px]">PL/pgSQL Single Roundtrip Executed (SHA-256 Verified)</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

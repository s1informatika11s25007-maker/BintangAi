import React, { useState } from 'react';
import ExecutionTraceModal from '../../components/trace/ExecutionTraceModal';
import { EPISTEMIC_LABELS } from '../../types/core/architecture';

export default function ExecutionTracePage({ obligations = [], onOpenTraceModal }) {
  const [selectedTraceOb, setSelectedTraceOb] = useState(null);

  const handlePopTrace = (ob) => {
    setSelectedTraceOb(ob);
    onOpenTraceModal?.(ob);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-black text-slate-900">Explainable Execution Trace Viewer</h2>
        <p className="text-xs text-slate-500 font-medium">
          Transparansi penelusuran keputusan AI dari Ingesti, Prompt Guard, Epistemic Fact Ledger, hingga Atomic RPC.
        </p>
      </div>

      <div className="space-y-3">
        {obligations.map((ob) => (
          <div key={ob.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-xs sm:text-sm">{ob.title}</p>
              <p className="text-[11px] text-slate-500">{ob.resident_name} &bull; Mission ID: {ob.mission_id || 'd3eebc99-9c0b'}</p>
            </div>
            <button
              onClick={() => handlePopTrace(ob)}
              className="px-3 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20"
            >
              Pop-up Full Modal
            </button>
          </div>
        ))}
      </div>

      <ExecutionTraceModal
        isOpen={!!selectedTraceOb}
        onClose={() => setSelectedTraceOb(null)}
        obligation={selectedTraceOb}
      />
    </div>
  );
}

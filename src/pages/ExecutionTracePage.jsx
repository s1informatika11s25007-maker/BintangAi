import React, { useState } from 'react';
import { GitPullRequest } from 'lucide-react';
import ExecutionTraceModal from '../components/trace/ExecutionTraceModal';

export default function ExecutionTracePage({ obligations, onOpenTraceModal }) {
  const [selectedOb, setSelectedOb] = useState(obligations[0] || null);

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <GitPullRequest className="w-5 h-5 text-sky-600" />
          <span>Explainable Execution Trace Viewer (P1 - P6 Auditability)</span>
        </h2>
        <p className="text-xs text-slate-600">
          Inspeksi transparan alur eksekusi AI: Input -&gt; Filter Prompt Injection -&gt; Facts (P3) -&gt; Rules Compiler -&gt; Obligation Graph (P1) -&gt; Authority Envelope Gate (P6) -&gt; DB Execution -&gt; Verifier (P2) -&gt; Audit Trail [A].
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {obligations.map(ob => (
          <div
            key={ob.id}
            onClick={() => setSelectedOb(ob)}
            className={`p-4 rounded-2xl border cursor-pointer transition shadow-sm ${
              selectedOb?.id === ob.id
                ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-400/30'
                : 'bg-white border-slate-200/90 hover:border-sky-300'
            }`}
          >
            <span className="text-[10px] font-mono text-sky-700 font-bold block mb-1">ID: {ob.mission_id}</span>
            <h4 className="text-xs font-bold text-slate-900 truncate">{ob.title}</h4>
            <p className="text-[11px] text-slate-600 mt-1 font-medium">{ob.resident_name}</p>
          </div>
        ))}
      </div>

      {selectedOb && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl shadow-slate-200/50 space-y-4 w-full">
          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>Detail Trace Misi: {selectedOb.title}</span>
            <span className="text-xs font-mono font-bold text-amber-700">Rule: {selectedOb.rule_version_id}</span>
          </h3>

          <ExecutionTraceModal
            isOpen={true}
            onClose={() => {}}
            obligation={selectedOb}
          />
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import Badge from '../components/common/Badge';

export default function RuleLibraryPage({ rules }) {
  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-sky-600" />
          <span>Rule & Policy Library (Versi Berpemilik & Disetujui Manusia)</span>
        </h2>
        <p className="text-xs text-slate-600">
          Aturan perawatan klinis dan keselamatan panti yang dikompilasi secara temporal oleh Temporal Rules Compiler.
        </p>
      </div>

      <div className="space-y-4 w-full">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xl shadow-slate-200/50 space-y-3 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-sky-700 font-bold">{rule.code}</span>
                <Badge variant="kernel">{rule.version}</Badge>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold flex items-center bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Human Approved
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900">{rule.title}</h3>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-xs text-amber-900 font-bold">
              {rule.expression}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
              <span>Berlaku Mulai: {rule.effective_from}</span>
              <span>Disetujui Oleh: <strong className="text-slate-800">{rule.approved_by}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

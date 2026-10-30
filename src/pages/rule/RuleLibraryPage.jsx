import React from 'react';
import { filterBitemporalObligations } from '../../services/rule/obligationEngine';

export default function RuleLibraryPage({ rules = [], obligations = [] }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-lg font-black text-slate-900">Rule & Policy Library</h2>
        <p className="text-xs text-slate-500 font-medium">Perpustakaan Aturan & Kebijakan Klinis Terverifikasi</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <p className="font-bold text-slate-900">RUL-INSULIN-01 (v2.1.0-clinical)</p>
          <p className="text-slate-600 mt-1 font-mono text-[11px]">
            IF (GDS &gt; 140 mg/dL) THEN REQUIRE (Novorapid Injection 6 IU) WITH GRADE (E1)
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { EPISTEMIC_LABELS, EPISTEMIC_STATUS } from '../../types/core/architecture';

export default function EpistemicLedgerBadge({ status }) {
  const config = EPISTEMIC_LABELS[status] || { label: status || 'Tak Diketahui', color: 'bg-slate-100 text-slate-700 border-slate-300' };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border tracking-tight ${config.color}`}
      title={`Status Ledger Fakta Epistemik P3: ${config.label}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {config.label}
    </span>
  );
}

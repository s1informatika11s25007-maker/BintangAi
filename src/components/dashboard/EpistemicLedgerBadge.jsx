import React from 'react';
import { EPISTEMIC_LABELS } from '../../types/core/architecture';

export default function EpistemicLedgerBadge({ status, confidence }) {
  const config = EPISTEMIC_LABELS[status] || EPISTEMIC_LABELS.reported;

  return (
    <div className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.color}`}>
      <span>{config.label}</span>
      {confidence && (
        <span className="font-mono text-[10px] opacity-90">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </div>
  );
}

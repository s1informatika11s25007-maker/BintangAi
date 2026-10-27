import React from 'react';
import { EPISTEMIC_LABELS } from '../../types/architecture';

export default function EpistemicLedgerBadge({ status, confidence }) {
  const config = EPISTEMIC_LABELS[status] || EPISTEMIC_LABELS.reported;

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.color}`}>
      <span>{config.label}</span>
      {confidence && (
        <span className="font-mono text-[10px] opacity-80">
          ({Math.round(confidence * 100)}%)
        </span>
      )}
    </div>
  );
}

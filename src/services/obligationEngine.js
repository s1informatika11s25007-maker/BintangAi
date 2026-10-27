/**
 * Obligation Kernel Engine (P1 Bitemporal Obligation Ledger & Care Graph)
 */

import { OBLIGATION_STATUS } from '../types/architecture';

export function calculateCareDebt(obligations) {
  const now = new Date();
  let totalDebtMinutes = 0;
  let criticalBreaches = 0;

  obligations.forEach(ob => {
    if (ob.status === OBLIGATION_STATUS.OPEN || ob.status === OBLIGATION_STATUS.IN_PROGRESS) {
      const deadline = new Date(ob.valid_until);
      if (now > deadline) {
        const diffMins = Math.floor((now - deadline) / (1000 * 60));
        totalDebtMinutes += diffMins;
        if (ob.priority === 'critical' || ob.priority === 'emergency') {
          criticalBreaches += 1;
        }
      }
    }
  });

  return {
    totalDebtMinutes,
    criticalBreaches,
    healthScore: Math.max(0, 100 - (criticalBreaches * 25 + Math.floor(totalDebtMinutes / 10)))
  };
}

export function checkNegativeObligationViolation(obligation, proposedAction) {
  if (!obligation.is_negative_obligation) return { violated: false };

  // Example restriction check
  if (proposedAction.type === 'SERVE_BEVERAGE' && proposedAction.sugar_content > 0) {
    return {
      violated: true,
      reason: `Pelanggaran Negative-Obligation: ${obligation.title}. Akses ditolak oleh Backend Policy Gate.`
    };
  }

  return { violated: false };
}

export function filterBitemporalObligations(obligations, validAtTime, transactionAtTime) {
  const validTarget = validAtTime ? new Date(validAtTime) : new Date();
  const txTarget = transactionAtTime ? new Date(transactionAtTime) : new Date();

  return obligations.filter(ob => {
    const vFrom = new Date(ob.valid_from);
    const vUntil = new Date(ob.valid_until);
    const txCreated = new Date(ob.sys_created_at);
    const txSuperseded = ob.sys_superseded_at ? new Date(ob.sys_superseded_at) : null;

    const isValidInTime = validTarget >= vFrom && validTarget <= vUntil;
    const isRecordedInTx = txCreated <= txTarget && (!txSuperseded || txSuperseded > txTarget);

    return isValidInTime && isRecordedInTx;
  });
}

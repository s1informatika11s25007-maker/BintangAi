/**
 * SambungJaga AI — Obligation Kernel Engine (P1 Bitemporal Obligation Ledger & Care Graph)
 *
 * @module services/obligationEngine
 * @description Core engine for bitemporal obligation calculations, care debt accumulation, negative-obligation checking, and temporal filtering.
 */

import { OBLIGATION_STATUS } from '../../types/core/architecture';

/**
 * Calculates current Care Debt and Health Score based on bitemporal obligation deadlines.
 *
 * @param {Array<Object>} obligations - List of active obligations in the Care Obligation Graph.
 * @returns {{ totalDebtMinutes: number, criticalBreaches: number, healthScore: number }} Care debt calculation summary.
 */
export function calculateCareDebt(obligations) {
  if (!Array.isArray(obligations)) {
    return { totalDebtMinutes: 0, criticalBreaches: 0, healthScore: 100 };
  }

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

  const healthScore = Math.max(0, 100 - (criticalBreaches * 25 + Math.floor(totalDebtMinutes / 10)));

  return {
    totalDebtMinutes,
    criticalBreaches,
    healthScore
  };
}

/**
 * Checks if a proposed caregiver action violates a negative obligation (restriction).
 *
 * @param {Object} obligation - Obligation item to evaluate.
 * @param {Object} proposedAction - Proposed action payload.
 * @returns {{ violated: boolean, reason?: string }} Result of negative obligation check.
 */
export function checkNegativeObligationViolation(obligation, proposedAction) {
  if (!obligation?.is_negative_obligation) {
    return { violated: false };
  }

  if (proposedAction?.type === 'SERVE_BEVERAGE' && proposedAction?.sugar_content > 0) {
    return {
      violated: true,
      reason: `Pelanggaran Negative-Obligation: ${obligation.title}. Akses ditolak oleh Backend Policy Gate.`
    };
  }

  return { violated: false };
}

/**
 * Filters bitemporal obligations at a specific point in Valid Time and Transaction Time.
 *
 * @param {Array<Object>} obligations - List of obligations.
 * @param {string|Date} validAtTime - Target point in Valid Time.
 * @param {string|Date} transactionAtTime - Target point in Transaction Time.
 * @returns {Array<Object>} Filtered list of obligations active at the given bitemporal coordinates.
 */
export function filterBitemporalObligations(obligations, validAtTime, transactionAtTime) {
  if (!Array.isArray(obligations)) return [];

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

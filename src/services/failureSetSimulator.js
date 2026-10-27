/**
 * SambungJaga AI — P4 Failure-Set Search Simulator Engine
 *
 * @module services/failureSetSimulator
 * @description Simulates caregiver absence combinations to identify minimal failure sets that threaten critical obligations.
 */

/**
 * Runs the P4 Failure-Set Search algorithm against active staff and care obligations.
 *
 * @param {Array<Object>} staffList - List of staff profiles.
 * @param {Array<Object>} obligations - List of active obligations.
 * @returns {{ simulationTimestamp: string, minimalFailureSets: Array<Object>, recommendation: string }}
 */
export function runFailureSetSimulation(staffList, obligations) {
  if (!Array.isArray(staffList) || !Array.isArray(obligations)) {
    return {
      simulationTimestamp: new Date().toISOString(),
      minimalFailureSets: [],
      recommendation: 'Data staf atau obligation tidak valid.'
    };
  }

  const activeStaff = staffList.filter(s => s.shift_status === 'on_duty');
  const criticalObs = obligations.filter(o => o.priority === 'critical' || o.priority === 'emergency');

  const combinations = [];

  // 1-Staff Absence Combinations
  for (const staff of activeStaff) {
    const remainingStaff = activeStaff.filter(s => s.id !== staff.id);
    const coveredCompetencies = new Set(remainingStaff.flatMap(s => s.competencies || []));

    const abandoned = criticalObs.filter(ob => {
      const needsComp = ob.required_competencies || [];
      return needsComp.length > 0 && !needsComp.some(c => coveredCompetencies.has(c));
    });

    if (abandoned.length > 0) {
      combinations.push({
        size: 1,
        absentStaff: [staff.full_name],
        impactedObligationsCount: abandoned.length,
        abandonedObligations: abandoned,
        riskLevel: 'HIGH_CRITICAL_GAP'
      });
    }
  }

  // 2-Staff Absence Combinations
  if (combinations.length === 0 && activeStaff.length >= 2) {
    for (let i = 0; i < activeStaff.length; i++) {
      for (let j = i + 1; j < activeStaff.length; j++) {
        const staffA = activeStaff[i];
        const staffB = activeStaff[j];
        const remainingStaff = activeStaff.filter(s => s.id !== staffA.id && s.id !== staffB.id);
        const coveredCompetencies = new Set(remainingStaff.flatMap(s => s.competencies || []));

        const abandoned = criticalObs.filter(ob => {
          const needsComp = ob.required_competencies || [];
          return needsComp.length > 0 && !needsComp.some(c => coveredCompetencies.has(c));
        });

        if (abandoned.length > 0) {
          combinations.push({
            size: 2,
            absentStaff: [staffA.full_name, staffB.full_name],
            impactedObligationsCount: abandoned.length,
            abandonedObligations: abandoned,
            riskLevel: 'MEDIUM_DOUBLE_ABSENCE'
          });
        }
      }
    }
  }

  return {
    simulationTimestamp: new Date().toISOString(),
    minimalFailureSets: combinations,
    recommendation: combinations.length > 0
      ? `Terdeteksi ${combinations.length} skenario kegagalan kritis! Disarankan pemanggilan perawat pengganti (on-call) untuk kompetensi yang hilang.`
      : 'Cakupan kompetensi aman untuk semua skenario 1 & 2 pengasuh absen.'
  };
}

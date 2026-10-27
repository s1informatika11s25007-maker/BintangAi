/**
 * P4 Failure-Set Search Simulator Engine
 * Mencari kombinasi kegagalan pengasuh / absen terkecil yang menyebabkan penelantaran kewajiban kritis.
 */

export function runFailureSetSimulation(staffList, obligations) {
  const activeStaff = staffList.filter(s => s.shift_status === 'on_duty');
  const criticalObs = obligations.filter(o => o.priority === 'critical' || o.priority === 'emergency');

  const combinations = [];

  // Simulate 1 staff missing
  for (const staff of activeStaff) {
    const remainingStaff = activeStaff.filter(s => s.id !== staff.id);
    const coveredCompetencies = new Set(remainingStaff.flatMap(s => s.competencies));

    const abandoned = [];
    for (const ob of criticalObs) {
      const needsComp = ob.required_competencies || [];
      const hasCoverage = needsComp.length === 0 || needsComp.some(c => coveredCompetencies.has(c));
      if (!hasCoverage) {
        abandoned.push(ob);
      }
    }

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

  // If no 1-staff combination causes failure, simulate 2 staff missing
  if (combinations.length === 0 && activeStaff.length >= 2) {
    for (let i = 0; i < activeStaff.length; i++) {
      for (let j = i + 1; j < activeStaff.length; j++) {
        const staffA = activeStaff[i];
        const staffB = activeStaff[j];
        const remainingStaff = activeStaff.filter(s => s.id !== staffA.id && s.id !== staffB.id);
        const coveredCompetencies = new Set(remainingStaff.flatMap(s => s.competencies));

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

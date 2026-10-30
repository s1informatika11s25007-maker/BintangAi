import React from 'react';
import { verifyAuditChainIntegrity } from '../../services/audit/auditTrailService';
import { exportCareEvidencePackNative } from '../../services/ai/nativeChromeService';

export default function AuditTrailPage({ auditTrail = [] }) {
  const integrity = verifyAuditChainIntegrity(auditTrail);

  const handleExportJsonPack = async () => {
    await exportCareEvidencePackNative(auditTrail, 'care_evidence_pack.json');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Append-Only Hash-Chained Audit Trail [A]</h2>
          <p className="text-xs text-slate-500 font-medium">Integritas Hash Chain Audit: {integrity.valid ? 'OK VERIFIED' : 'TAMPERED'}</p>
        </div>

        <button
          onClick={handleExportJsonPack}
          className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20"
        >
          Ekspor Care Evidence Pack (.json)
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        {auditTrail.map((entry) => (
          <div key={entry.id || entry.sequence_id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 font-mono">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>#{entry.sequence_id || 101} {entry.gateway_tag}</span>
              <span className="text-[10px] text-slate-500">{entry.action_name}</span>
            </div>
            <p className="text-[10px] text-slate-600">Hash: {entry.entry_hash}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

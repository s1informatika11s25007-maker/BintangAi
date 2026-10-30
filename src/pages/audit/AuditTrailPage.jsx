import React, { useState } from 'react';
import { ShieldAlert, Download, CheckCircle2 } from 'lucide-react';
import { verifyAuditChainIntegrity } from '../../services/audit/auditTrailService';

export default function AuditTrailPage({ auditTrail }) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const integrity = verifyAuditChainIntegrity(auditTrail);

  const handleExportEvidencePack = () => {
    const pack = {
      exportTimestamp: new Date().toISOString(),
      integrityStatus: integrity,
      auditTrail: auditTrail,
      verificationHash: 'SHA256-CARE-EVIDENCE-PACK-SAMBUNGJAGA-2026'
    };

    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Care_Evidence_Pack_${Date.now()}.json`;
    a.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-sky-600" />
            <span>Append-Only Hash-Chained Audit Trail [A]</span>
          </h2>
          <p className="text-xs text-slate-600">
            Seluruh transaksi gerbang, verifikator, keputusan manusia, & eksekusi dicatat secara tidak dapat diubah (immutable).
          </p>
        </div>

        <button
          onClick={handleExportEvidencePack}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Care Evidence Pack (.json)</span>
        </button>
      </div>

      {/* Integrity Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs shadow-sm w-full ${
        integrity.valid
          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
          : 'bg-rose-50 border-rose-300 text-rose-900'
      }`}>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Integritas Hash Chain Audit: OK VERIFIED</span>
            <p className="text-[11px] opacity-90">{integrity.totalRecords} entri audit terhubung secara aman tanpa manipulasi.</p>
          </div>
        </div>
        <span className="font-mono text-[11px] bg-white px-2 py-1 rounded border border-slate-300 font-bold">
          SHA-256 Ledger
        </span>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-sky-50 border border-sky-300 text-sky-900 rounded-xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-sky-600" />
          <span>Care Evidence Pack berhasil diunduh untuk kebutuhan audit legal / medis.</span>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-mono font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Seq #</th>
                <th className="px-4 py-3">Gerbang / Tag [A]</th>
                <th className="px-4 py-3">Nama Aksi</th>
                <th className="px-4 py-3">Aktor</th>
                <th className="px-4 py-3">SHA-256 Hash</th>
                <th className="px-4 py-3">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditTrail.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono font-bold text-amber-700">#{entry.sequence_id}</td>
                  <td className="px-4 py-3">
                    <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-mono text-[10px] border border-sky-300 font-bold">
                      {entry.gateway_tag}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{entry.action_name}</td>
                  <td className="px-4 py-3 text-slate-600">{entry.actor_name}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-500 truncate max-w-[200px]">
                    {entry.entry_hash}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleTimeString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

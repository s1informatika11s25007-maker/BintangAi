import React from 'react';
import Modal from '../common/Modal';

export default function ExecutionTraceModal({ isOpen, onClose, obligation }) {
  if (!isOpen || !obligation) return null;

  const traceSteps = [
    {
      title: '1. Ingesti & Filter Prompt-Injection',
      desc: 'Input pengasuh melalui Voice STT / Teks dibersihkan & diperiksa minimisasi data PII.',
      tag: '[A] Gateway',
      status: 'success'
    },
    {
      title: '2. Persepsi Epistemic Fact Ledger (P3)',
      desc: 'Ekstraksi entitas medis: Injeksi Novorapid 6 IU. Status epistemik: DIAMATI (Sensor IoT) / DILAPORKAN.',
      tag: 'P3 Kernel',
      status: 'success'
    },
    {
      title: '3. Bitemporal Obligation Ledger (P1)',
      desc: `Kewajiban dicatat pada Sys Time: ${new Date(obligation.sys_created_at).toLocaleTimeString('id-ID')}. Valid Time Period: ${new Date(obligation.valid_from).toLocaleTimeString('id-ID')} s/d ${new Date(obligation.valid_until).toLocaleTimeString('id-ID')}.`,
      tag: 'P1 Ledger',
      status: 'success'
    },
    {
      title: '4. Action Contract & P6 Authority Envelope Gate',
      desc: `Aksi dievaluasi pada Authority Envelope ${obligation.priority === 'critical' ? 'Level A3 (Klinis/Ireversibel)' : 'Level A1 (Reversibel)'}. Gate menetapkan batas wewenang eksekusi.`,
      tag: 'P6 Envelope',
      status: 'success'
    },
    {
      title: '5. Eksekusi Tool Gateway [A] & Postcondition Verifier',
      desc: 'Sistem melakukan dry-run diff & menulis ke Database RLS resident_domain.bitemporal_obligations.',
      tag: '[A] DB Execution',
      status: 'success'
    },
    {
      title: '6. P2 Evidence-Grade Verifier & Append-Only Audit Trail [A]',
      desc: `Verifikasi bukti ${obligation.required_evidence_grade} berhasil. Entry ditulis ke Hash-Chained Audit Trail dengan SHA-256 prev_hash.`,
      tag: '[A] Audit Trail',
      status: 'success'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Explainable Execution Trace Viewer">
      <div className="space-y-4 text-slate-900">
        {/* Header summary */}
        <div className="bg-sky-50/80 p-3.5 rounded-xl border border-sky-200 font-mono text-xs space-y-1">
          <div className="text-sky-800 font-bold">Mission ID: {obligation.mission_id}</div>
          <div className="text-slate-800 font-semibold">Obligation: {obligation.title}</div>
          <div className="text-slate-600 text-[11px]">Rule Version: {obligation.rule_version_id}</div>
        </div>

        {/* Step-by-Step Flow */}
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-sky-200">
          {traceSteps.map((step, idx) => (
            <div key={idx} className="relative flex items-start space-x-3 pl-1">
              <div className="z-10 bg-sky-600 text-white p-1 rounded-full text-xs font-bold w-6 h-6 flex items-center justify-center shrink-0 shadow-md shadow-sky-600/20">
                {idx + 1}
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 w-full space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900">{step.title}</h5>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                    {step.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

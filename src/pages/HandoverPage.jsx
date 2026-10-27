import React from 'react';
import { FileSignature, ShieldCheck, AlertCircle } from 'lucide-react';
import HandoverContractCard from '../components/handover/HandoverContractCard';

export default function HandoverPage({ handoverContracts, onSignContract, currentUserRole }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <FileSignature className="w-5 h-5 text-sky-400" />
          <span>Two-Sided Handover Contract Agent (Serah Terima Shift Dua Sisi)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Penjaminan keberlanjutan perawatan tanpa celah: Serah dan terima dikonfirmasi oleh dua belah pihak. Tanpa konfirmasi penerima = Otomatis Eskalasi Supervisor.
        </p>
      </div>

      <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 text-xs text-sky-300 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Prinsip Aksioloi SambungJaga AI:</p>
          <p className="text-[11px] opacity-90 mt-0.5">
            Tidak ada pengasuh yang diperbolehkan mengabaikan kewajiban terbuka saat pergantian shift. Kontrak ini mengunci daftar kewajiban terbuka dan memvalidasi cakupan kompetensi shift berikutnya secara kriptografis.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {handoverContracts.map(contract => (
          <HandoverContractCard
            key={contract.id}
            contract={contract}
            onSignContract={onSignContract}
            currentUserRole={currentUserRole}
          />
        ))}
      </div>
    </div>
  );
}

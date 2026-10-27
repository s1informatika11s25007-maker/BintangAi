import React from 'react';
import { FileSignature, ShieldCheck } from 'lucide-react';
import HandoverContractCard from '../components/handover/HandoverContractCard';

export default function HandoverPage({ handoverContracts, onSignContract, currentUserRole }) {
  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <FileSignature className="w-5 h-5 text-sky-600" />
          <span>Two-Sided Handover Contract Agent (Serah Terima Shift Dua Sisi)</span>
        </h2>
        <p className="text-xs text-slate-600">
          Penjaminan keberlanjutan perawatan tanpa celah: Serah dan terima dikonfirmasi oleh dua belah pihak. Tanpa konfirmasi penerima = Otomatis Eskalasi Supervisor.
        </p>
      </div>

      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 flex items-start space-x-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Prinsip Aksiologi SambungJaga AI:</p>
          <p className="text-[11px] opacity-90 mt-0.5">
            Tidak ada pengasuh yang diperbolehkan mengabaikan kewajiban terbuka saat pergantian shift. Kontrak ini mengunci daftar kewajiban terbuka dan memvalidasi cakupan kompetensi shift berikutnya secara kriptografis.
          </p>
        </div>
      </div>

      <div className="space-y-4 w-full">
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

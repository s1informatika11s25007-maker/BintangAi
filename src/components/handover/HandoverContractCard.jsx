import React from 'react';
import { FileCheck, ShieldAlert, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import Badge from '../common/Badge';

export default function HandoverContractCard({ contract, onSignContract, currentUserRole, currentUser, staff }) {
  const isConfirmed = contract.contract_status === 'confirmed';

  // Resolve staff names from IDs
  const outgoingStaff = staff?.find(s => s.id === contract.outgoing_staff_id);
  const incomingStaff = staff?.find(s => s.id === contract.incoming_staff_id);

  const outgoingName = outgoingStaff ? outgoingStaff.full_name : 'Pengasuh Shift Sebelumnya';
  const incomingName = incomingStaff ? incomingStaff.full_name : 'Belum Dikonfirmasi...';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xl shadow-slate-200/50 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-900 text-sm">{contract.shift_name}</h3>
        </div>
        <Badge variant={isConfirmed ? 'success' : 'warning'}>
          {isConfirmed ? 'Dua Sisi Terdokumentasi (CONFIRMED)' : 'Menunggu Konfirmasi Penerima (PENDING)'}
        </Badge>
      </div>

      {/* Two-Sided Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Pengasuh Penyerah (Giver)</span>
          <p className="text-xs font-bold text-slate-800">{outgoingName}</p>
          <span className="text-[10px] text-emerald-700 font-medium flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Ditandatangani: {new Date(contract.outgoing_signed_at).toLocaleTimeString('id-ID')}
          </span>
        </div>

        <div className="flex items-center justify-center text-slate-400 my-1 md:my-0">
          <ArrowRight className="w-5 h-5 text-sky-600 animate-pulse hidden md:block" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Pengasuh Penerima (Receiver)</span>
          <p className="text-xs font-bold text-slate-800">
            {incomingName}
          </p>
          {isConfirmed ? (
            <span className="text-[10px] text-emerald-700 font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Ditandatangani: {contract.incoming_signed_at ? new Date(contract.incoming_signed_at).toLocaleTimeString('id-ID') : '-'}
            </span>
          ) : (
            <span className="text-[10px] text-amber-700 font-medium flex items-center">
              <ShieldAlert className="w-3 h-3 mr-1" /> Wajib Konfirmasi Sebelum Shift Dimulai
            </span>
          )}
        </div>
      </div>

      {/* Open Obligations Transferred */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 mb-2">Ringkasan Kewajiban Terbuka yang Diserahterimakan:</h4>
        <div className="space-y-1.5">
          {contract.open_obligations_summary.map((ob, idx) => (
            <div key={idx} className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 flex items-center justify-between font-medium">
              <span>{ob.title}</span>
              <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-sky-200 font-bold">
                Terlacak Kernel
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action to Sign */}
      {!isConfirmed && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onSignContract({ contractId: contract.id, signerRole: 'incoming', signerName: currentUser?.name || currentUser?.full_name, signerId: currentUser?.id })}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Konfirmasi & Tanda Tangan Penerima Shift</span>
          </button>
        </div>
      )}
    </div>
  );
}

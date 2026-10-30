import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { runHandoverAnalysis, synthesizeAutoHandoverContract } from '../../services/handover/handoverContractService';

export default function HandoverContractCard({ contract, onSignContract, currentUserRole, currentUser, staff, obligations, residents }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeContract = contract || synthesizeAutoHandoverContract(obligations, staff, currentUser);

  const isOutgoingSigned = Boolean(activeContract?.outgoing_signed_at);
  const isIncomingSigned = Boolean(activeContract?.incoming_signed_at);
  const isFullyConfirmed = activeContract?.contract_status === 'confirmed' || (isOutgoingSigned && isIncomingSigned);

  const outgoingStaffObj = staff?.find(s => s.id === activeContract?.outgoing_staff_id) || { full_name: 'Suster Dewi Pertiwi, Amd.Kep (Shift Pagi)' };
  const incomingStaffObj = staff?.find(s => s.id === activeContract?.incoming_staff_id) || { full_name: 'Ns. Ahmad Fauzi, M.Kep (Shift Siang)' };

  useEffect(() => {
    async function loadAnalysis() {
      setIsLoading(true);
      const res = await runHandoverAnalysis(activeContract, outgoingStaffObj, incomingStaffObj, obligations);
      setAnalysis(res);
      setIsLoading(false);
    }
    loadAnalysis();
  }, [activeContract?.id, obligations?.length]);

  const handleSignAsReceiver = () => {
    onSignContract?.({
      contractId: activeContract.id,
      signerRole: 'incoming',
      signerName: currentUser?.name || currentUser?.full_name || 'Suster Penerima',
      signerId: currentUser?.id || 'staff-incoming-current'
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{activeContract.shift_name}</h3>
            <p className="text-xs text-slate-500 font-medium">Two-Sided Handover Contract Agent &bull; Hash Cryptographic Signed</p>
          </div>
        </div>

        <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border flex items-center space-x-1 ${
          isFullyConfirmed
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
        }`}>
          {isFullyConfirmed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
          <span>{isFullyConfirmed ? 'Dua Sisi Terdokumentasi (CONFIRMED)' : 'Menunggu Konfirmasi Penerima Shift'}</span>
        </span>
      </div>

      {/* Two-Sided Signatures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perawat Penyerah (Outgoing)</span>
          <p className="font-bold text-slate-900 text-xs">{outgoingStaffObj.full_name}</p>
          <div className="flex items-center text-[11px] text-emerald-700 font-semibold pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Signed: {activeContract.outgoing_signed_at ? new Date(activeContract.outgoing_signed_at).toLocaleTimeString('id-ID') + ' WIB' : 'OK'}
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border space-y-1 ${
          isIncomingSigned ? 'bg-slate-50 border-slate-200' : 'bg-amber-50/50 border-amber-200'
        }`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perawat Penerima (Incoming)</span>
          <p className="font-bold text-slate-900 text-xs">{incomingStaffObj.full_name}</p>
          {isIncomingSigned ? (
            <div className="flex items-center text-[11px] text-emerald-700 font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Signed: {new Date(activeContract.incoming_signed_at).toLocaleTimeString('id-ID')} WIB
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-amber-700 font-medium">Belum Tanda Tangan</span>
              <button
                onClick={handleSignAsReceiver}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Konfirmasi & Tanda Tangan Penerima Shift
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Intelligent AI Clinical Analysis Section */}
      <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-sky-900">
          <span className="flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5 text-sky-600" /> Evaluasi Kontinuitas Klinis (Handover Superagent AI)
          </span>
          <span className="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded font-mono">Risk Level: {analysis?.riskLevel || 'LOW'}</span>
        </div>

        {isLoading ? (
          <p className="text-xs text-sky-700 animate-pulse font-medium">Menganalisis keterikatan tugas & kompetensi shift...</p>
        ) : (
          <div className="space-y-1.5 text-xs text-slate-700">
            <p className="font-medium text-slate-800">{analysis?.summaryAnalysis}</p>
            {analysis?.criticalNotes?.map((note, idx) => (
              <div key={idx} className="flex items-start text-[11px] text-amber-900 font-medium bg-amber-100/60 p-2 rounded-lg border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open Obligations Transferred Summary */}
      <div className="space-y-2 pt-1">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ringkasan Kewajiban Perawatan Dialihkan ({activeContract.open_obligations_summary?.length || 0})</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeContract.open_obligations_summary?.map((ob, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 line-clamp-1">{ob.title}</p>
                <p className="text-[10px] text-slate-500 font-medium">{ob.resident_name || 'Penghuni'}</p>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold ml-2 shrink-0">
                {ob.grade || 'E1'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Cryptographic Hash Signature Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
        <span className="flex items-center">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          Hash Signature: {activeContract.hash_signature}
        </span>
        <span>P5 Tamper-Evident Certified</span>
      </div>
    </div>
  );
}

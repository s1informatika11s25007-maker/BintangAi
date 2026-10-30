import React from 'react';
import { Clock, ShieldCheck, User, AlertCircle, Sparkles, Activity, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { OBLIGATION_STATUS, EVIDENCE_GRADE } from '../../types/core/architecture';

export default function ObligationGraphCard({ obligation, onSubmitEvidence, onApproveAction, onOpenTraceModal }) {
  if (!obligation) return null;

  const isClosed = obligation.status === OBLIGATION_STATUS.VERIFIED_CLOSED;
  const isCritical = obligation.priority === 'critical' || obligation.priority === 'emergency';

  const priorityColors = {
    routine: 'bg-slate-100 text-slate-700 border-slate-300',
    important: 'bg-sky-100 text-sky-800 border-sky-300',
    critical: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    emergency: 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold animate-pulse'
  };

  return (
    <div
      className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition space-y-3 ${
        isClosed ? 'border-emerald-200 bg-emerald-50/20 opacity-85' : isCritical ? 'border-amber-300' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase ${priorityColors[obligation.priority] || priorityColors.routine}`}>
              {obligation.priority}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
              Grade: {obligation.required_evidence_grade || EVIDENCE_GRADE.E1}
            </span>
            {obligation.is_negative_obligation && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300">
                Negative-Obligation
              </span>
            )}
          </div>
          <h3 className={`font-bold text-slate-900 text-sm sm:text-base leading-snug ${isClosed ? 'line-through text-slate-500' : ''}`}>
            {obligation.title}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-2">{obligation.description}</p>
        </div>

        <button
          onClick={() => onOpenTraceModal?.(obligation)}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-sky-700 transition shrink-0 text-xs font-bold flex items-center space-x-1"
          title="Buka Explainable Execution Trace"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trace</span>
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
        <div className="flex items-center space-x-3 font-medium">
          <span className="flex items-center text-slate-700">
            <User className="w-3.5 h-3.5 mr-1 text-sky-600" />
            {obligation.resident_name || 'Ibu Aminah'}
          </span>
          <span className="flex items-center text-slate-500">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Valid s/d {new Date(obligation.valid_until || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isClosed ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> VERIFIED CLOSED (P2)
            </span>
          ) : (
            <>
              {isCritical && (
                <button
                  onClick={() => onApproveAction?.(obligation.id)}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                  title="Persetujuan Manual Envelope P6 (Level A3 Klinis)"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>A3 Human Approval</span>
                </button>
              )}
              <button
                onClick={() => onSubmitEvidence?.(obligation)}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tutup Misi Bukti</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

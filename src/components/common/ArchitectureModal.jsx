import React, { useState } from 'react';
import { X, Layers, Cpu, ShieldCheck, FileCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { CORE_INNOVATIONS, ACTORS } from '../../types/core/architecture';

export default function ArchitectureModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('diagram');

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                SambungJaga AI — Arsitektur & Diagram Alur Alur-Kerja
              </h2>
              <p className="text-xs text-sky-400 font-medium">
                Sistem Tata Kelola Perawatan Lansia Multi-Agen Berbasis Clean Architecture Feature-First
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-5 shrink-0">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'diagram'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Diagram Alur Sistem</span>
          </button>
          <button
            onClick={() => setActiveTab('innovations')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'innovations'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Spesifikasi Inovasi P1–P6</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs leading-relaxed text-slate-300">
          {activeTab === 'diagram' ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/40 text-sky-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-sky-300">Spesifikasi Diagram Alur 100%:</span> Meliputi Ingesti Suara/Kamera, Triage Superagent AI Multi-Model (Groq Cloud / Chrome Gemini Nano), P1 Bitemporal Ledger, P2 Evidence-Grade Verifier, P3 Epistemic Ledger, P4 Failure-Set Search, P5 Offline Hash-Chain, P6 Authority Envelope Gate, hingga Port SINK/Viewer.
                </div>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-sky-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center text-xs border border-sky-500/30">1</span>
                  <span>1 · AKSES DAN INGESTI (ACCESS & INGESTION)</span>
                </div>
                <p className="text-slate-400 pl-8">
                  Menerima input laporan perawatan dari Pengasuh, Perawat, atau Kamera Vision AI. Mengingestkan teks, suara (STT), dan pemindaian alat medis digital secara cepat tanpa hambatan.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs border border-purple-500/30">2</span>
                  <span>2 · MULTI-MODEL AI PIPELINE & GEMINI NANO ON-DEVICE</span>
                </div>
                <p className="text-slate-400 pl-8">
                  Pemrosesan bertingkat: Tier 1 (Chrome Built-in Gemini Nano On-Device AI) untuk eksekusi offline 0 ms, Tier 2 (Groq Multi-Model Pipeline: llama-prompt-guard, qwen3.8-27b, gpt-oss-120b, gpt-oss-safeguard-20b), dan Tier 3 (Local Smart Rule Engine).
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs border border-emerald-500/30">3</span>
                  <span>3 · TERAPATAN INOVASI P1 - P6 & ATOMIC DB RPC</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 pt-1">
                  {CORE_INNOVATIONS.map((inv) => (
                    <div key={inv.code} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="font-bold text-emerald-400">{inv.code} · {inv.title}:</span> <span className="text-slate-400">{inv.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs border border-amber-500/30">4</span>
                  <span>4 · SINK / HASIL KELUARAN UNTUK SELURUH PERAN</span>
                </div>
                <p className="text-slate-400 pl-8">
                  Penyajian data langsung ke Supervisor Dashboard, Caregiver Mobile PWA, Consent-Aware Family Portal, HR Competency Lab, dan Audit Trail Hash-Chain.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CORE_INNOVATIONS.map((inv) => (
                <div key={inv.code} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-extrabold text-xs border border-sky-500/30 font-mono">
                      {inv.code}
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm">{inv.title}</h4>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{inv.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Arsitektur Clean Architecture Feature-First &bull; SambungJaga AI
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-xs transition shadow-lg shadow-sky-600/20"
          >
            Tutup Diagram Alur
          </button>
        </div>
      </div>
    </div>
  );
}

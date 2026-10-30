import React, { useState } from 'react';
import { ShieldCheck, Heart, Sparkles, ArrowRight, Layers, Cpu, Database, Activity, CheckCircle2, Lock } from 'lucide-react';
import ArchitectureModal from '../../components/common/ArchitectureModal';

export default function LandingPage({ onGoToLogin, onGoToRegister, onDirectDemoLogin }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-4">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-700 text-xs font-bold animate-fade-in">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span>Care Superagent AI &bull; Feature-First Clean Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Teknologi AI untuk Perawatan Lansia Tanpa Celah & Terverifikasi
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
          SambungJaga AI mengintegrasikan Chrome Built-in Gemini Nano On-Device, Bitemporal Obligation Ledger (P1), Evidence-Grade Closure (P2), Epistemic Fact Ledger (P3), dan P6 Authority Envelope.
        </p>

        <div className="flex items-center justify-center space-x-3 pt-2 flex-wrap gap-y-3">
          <button
            onClick={onGoToLogin}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-sky-600/30 flex items-center space-x-2"
          >
            <span>Mulai Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 transition shadow-sm flex items-center space-x-2"
          >
            <Layers className="w-4 h-4 text-sky-600" />
            <span>Pelajari Lebih Lanjut</span>
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            P1
          </div>
          <h3 className="font-bold text-slate-900 text-base">Bitemporal Obligation Ledger</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Memisahkan Valid Time (waktu instruksi medis berlaku) dan Transaction Time (waktu dicatat) untuk audit jejak medis tanpa manipulasi.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            P2
          </div>
          <h3 className="font-bold text-slate-900 text-base">Evidence-Grade Closure</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Verifikasi penutupan tugas berjenjang E0–E3 dengan bukti foto faceless privacy, QR Hash lokasi, dan random spot challenge audit.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
            P6
          </div>
          <h3 className="font-bold text-slate-900 text-base">Authority Envelope Gate</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Mencegah aksi independen AI berbahaya. Tindakan medis kritis A3 wajib membutuhkan konfirmasi persetujuan manual (Human Review).
          </p>
        </div>
      </div>

      {/* Demo Account Quick Access Section */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-extrabold text-lg text-white">Uji Coba Langsung Berdasarkan Peran (1-Click Demo)</h3>
            <p className="text-xs text-slate-400 font-medium">Masuk langsung ke ruang kerja sistem tanpa pendaftaran manual</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onDirectDemoLogin?.('supervisor')}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 text-left transition space-y-2 group"
          >
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">Supervisor</span>
            <p className="font-bold text-white text-xs group-hover:text-sky-300 transition">Ns. Ratna Sari, M.Kep</p>
            <p className="text-[11px] text-slate-400">Pusat Triage & Dashboard Care Debt</p>
          </button>

          <button
            onClick={() => onDirectDemoLogin?.('caregiver')}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-teal-500 text-left transition space-y-2 group"
          >
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">Pengasuh</span>
            <p className="font-bold text-white text-xs group-hover:text-teal-300 transition">Suster Dewi Pertiwi</p>
            <p className="text-[11px] text-slate-400">PWA Voice Capture & Bukti Kamera</p>
          </button>

          <button
            onClick={() => onDirectDemoLogin?.('family')}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500 text-left transition space-y-2 group"
          >
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Keluarga</span>
            <p className="font-bold text-white text-xs group-hover:text-purple-300 transition">Rina Wijaya</p>
            <p className="text-[11px] text-slate-400">Portal PDP Consent Filtered</p>
          </button>

          <button
            onClick={() => onDirectDemoLogin?.('admin_hr')}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-left transition space-y-2 group"
          >
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Admin HR</span>
            <p className="font-bold text-white text-xs group-hover:text-amber-300 transition">Budi Santoso</p>
            <p className="text-[11px] text-slate-400">P4 Failure Simulator Lab</p>
          </button>
        </div>
      </div>

      <ArchitectureModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

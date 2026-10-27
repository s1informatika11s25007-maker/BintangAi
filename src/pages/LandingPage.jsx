import React from 'react';
import {
  Shield,
  Activity,
  GitPullRequest,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  LogIn,
  UserPlus
} from 'lucide-react';
import { CORE_INNOVATIONS, ACTORS } from '../types/architecture';

export default function LandingPage({ onGoToLogin, onGoToRegister, onDirectDemoLogin }) {
  const layers = [
    { num: '1', title: 'Akses & Ingesti', desc: 'Voice STT, WA, P5 Offline Hash Chain, Prompt Injection Filter', color: 'border-purple-200 bg-purple-50/50 text-purple-900' },
    { num: '2', title: 'Persepsi & Pengetahuan', desc: 'Structured Extraction & P3 Epistemic Fact Ledger (5 status data)', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900' },
    { num: '3', title: 'Obligation Kernel', desc: 'P1 Bitemporal Obligation Ledger & Care Obligation Graph', color: 'border-amber-200 bg-amber-50/50 text-amber-900' },
    { num: '4', title: 'Superagent Orchestrator', desc: 'Care Mission Orchestrator + P6 Authority Envelope (A0–A3)', color: 'border-rose-200 bg-rose-50/50 text-rose-900' },
    { num: '5', title: 'Eksekusi Terkontrol', desc: 'Supabase PostgreSQL RLS, Realtime & Tool Execution Gateway', color: 'border-sky-200 bg-sky-50/50 text-sky-900' },
    { num: '6', title: 'Verifikasi Bukti', desc: 'P2 Evidence-Grade Verifier (E0–E3) & Spot Challenge Engine', color: 'border-blue-200 bg-blue-50/50 text-blue-900' },
    { num: '7', title: 'Platform Audit & Observasi', desc: 'Append-Only Hash-Chained Audit Trail [A] (SHA-256 Ledger)', color: 'border-slate-300 bg-slate-100 text-slate-900' },
    { num: '8', title: 'Analisis Asinkron', desc: 'P4 Failure-Set Search Simulator & Retroactive Rule Replay', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900' },
    { num: '9', title: 'Keluaran & Serah Terima', desc: 'Two-Sided Handover Contract, Family Portal & Evidence Pack', color: 'border-teal-200 bg-teal-50/50 text-teal-900' },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>Care Superagent Architecture (Obligation Kernel, Versi Final)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Evidence-Verified Care Continuity <br />
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Untuk Perawatan Lansia Indonesia
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Mentransformasi laporan suara/teks pengasuh menjadi <span className="font-bold text-white">Care Obligation Graph</span> yang bitemporal, terlacak, diverifikasi bukti sah (E0–E3), dan diaudit secara medis & hukum.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-sky-500/30 transition flex items-center justify-center space-x-2 border border-sky-400/30"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>Masuk ke Dashboard / Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToRegister}
              className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm px-6 py-3.5 rounded-2xl border border-slate-700 transition flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-sky-400" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* Quick Demo Instant Access */}
          <div className="pt-2 text-xs text-slate-400 flex items-center justify-center space-x-2">
            <span>Atau coba akses langsung demo per peran:</span>
            <button
              onClick={() => onDirectDemoLogin('supervisor')}
              className="text-sky-300 underline font-bold hover:text-sky-200"
            >
              Instant Demo Supervisor &rarr;
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-2xl font-black text-sky-400">P1 – P6</div>
              <div className="text-xs text-slate-400 font-medium">Kernel Inovasi Inti</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-2xl font-black text-emerald-400">E0 – E3</div>
              <div className="text-xs text-slate-400 font-medium">Tingkat Bukti Digital</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-2xl font-black text-amber-400">A0 – A3</div>
              <div className="text-xs text-slate-400 font-medium">Authority Envelope</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60">
              <div className="text-2xl font-black text-purple-400">100% SHA256</div>
              <div className="text-xs text-slate-400 font-medium">Append-Only Audit Log</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE INNOVATIONS P1 - P6 SHOWCASE */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest bg-sky-100 px-3 py-1 rounded-full border border-sky-200">
            Teknologi & Fondasi
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            6 Inovasi Inti (P1 – P6) Obligation Kernel
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Fitur keamanan dan integritas medis yang dirancang khusus untuk eliminasi kelalaian lansia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_INNOVATIONS.map((inn) => (
            <div
              key={inn.code}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xl shadow-slate-200/50 hover:border-sky-300 transition-all hover:shadow-2xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 border border-sky-500/20 font-mono">
                    {inn.code}
                  </span>
                  <Activity className="w-5 h-5 text-sky-500" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{inn.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{inn.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>Terintegrasi di DB & Engine</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE 9 ARCHITECTURE LAYERS DIAGRAM */}
      <section className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl shadow-slate-200/60 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              Peta Cetak Biru
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              9 Lapisan Arsitektur Terintegrasi
            </h2>
            <p className="text-xs text-slate-600">
              Alur pemrosesan dari laporan pengasuh hingga audit bukti legal
            </p>
          </div>

          <button
            onClick={onGoToLogin}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition flex items-center space-x-1.5 shrink-0 shadow-md"
          >
            <GitPullRequest className="w-4 h-4 text-sky-400" />
            <span>Simulasi Execution Trace Viewer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {layers.map((layer) => (
            <div
              key={layer.num}
              className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] ${layer.color}`}
            >
              <div className="flex items-center space-x-2 font-mono text-xs font-black mb-1">
                <span className="w-6 h-6 rounded-lg bg-white/80 flex items-center justify-center text-slate-900 shadow-sm">
                  {layer.num}
                </span>
                <span>Lapisan #{layer.num}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{layer.title}</h4>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">{layer.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ACTORS & ROLES SHOWCASE */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
            Aktor & Pengguna Sistem
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Siapa Saja yang Terhubung di SambungJaga?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ACTORS.map((actor) => (
            <div
              key={actor.id}
              onClick={() => onDirectDemoLogin(actor.id)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md hover:border-sky-400 hover:shadow-xl transition cursor-pointer text-center space-y-2"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{actor.title}</h4>
              <p className="text-[11px] text-slate-500">{actor.subtitle}</p>
              <span className="text-[10px] text-sky-600 font-semibold block pt-1">
                Akses Demo &rarr;
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION & FOOTER CTA */}
      <section className="rounded-3xl bg-gradient-to-r from-sky-600 to-blue-700 text-white p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-black">Siap Menjalankan Aplikasi SambungJaga AI?</h3>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl">
            Akses seluruh fitur interaktif: PWA Pengasuh, Dashboard Supervisor, Serah Terima Shift Dua Sisi, Simulator P4, dan Audit Trail SHA-256.
          </p>
        </div>

        <button
          onClick={onGoToLogin}
          className="bg-white text-sky-900 hover:bg-slate-100 font-black text-sm px-8 py-4 rounded-2xl shadow-xl transition shrink-0 flex items-center space-x-2"
        >
          <span>Masuk ke Dashboard</span>
          <ArrowRight className="w-4 h-4 text-sky-600" />
        </button>
      </section>
    </div>
  );
}

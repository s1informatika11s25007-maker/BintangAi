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
  UserPlus,
  Bot,
  Radio,
  Cpu,
  Lock,
  Layers
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

  // Actor list duplicated for 360 infinite smooth marquee loop
  const marqueeActors = [...ACTORS, ...ACTORS, ...ACTORS];

  return (
    <div className="space-y-16 py-4 w-full">
      {/* 1. HERO SECTION WITH ANIMATED AI AGENT STATUS */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-sky-500/20 rounded-full animate-pulse-glow pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-emerald-500/20 rounded-full animate-pulse-glow pointer-events-none"></div>

        {/* Live AI Agent Status Ticker */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80 flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-2 font-mono">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">CARE SUPERAGENT AI: ONLINE</span>
            <span className="text-slate-500">|</span>
            <span className="text-sky-300">P1–P6 Kernel Active</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
            <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1" /> Epistemic 99.4%</span>
            <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400 mr-1" /> Bitemporal Synced</span>
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold tracking-wide animate-float shadow-lg shadow-sky-500/10">
            <Bot className="w-4 h-4 text-sky-400 animate-spin-slow" />
            <span>SambungJaga AI — Obligation Kernel Versi Final</span>
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
              className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-sky-500/30 transition flex items-center justify-center space-x-2 border border-sky-400/30 hover:scale-105"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>Masuk ke Dashboard / Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToRegister}
              className="w-full sm:w-auto bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 font-semibold text-sm px-7 py-4 rounded-2xl border border-slate-700 transition flex items-center justify-center space-x-2 hover:scale-105"
            >
              <UserPlus className="w-4 h-4 text-sky-400" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* Quick Demo Instant Access */}
          <div className="pt-2 text-xs text-slate-400 flex items-center justify-center space-x-2">
            <span>Akses demo otomatis tanpa password:</span>
            <button
              onClick={() => onDirectDemoLogin('supervisor')}
              className="text-sky-300 font-bold hover:text-sky-200 underline flex items-center"
            >
              Instant Demo Supervisor &rarr;
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-sky-500/50 transition">
              <div className="text-2xl font-black text-sky-400">P1 – P6</div>
              <div className="text-xs text-slate-400 font-medium">Kernel Inovasi Inti</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500/50 transition">
              <div className="text-2xl font-black text-emerald-400">E0 – E3</div>
              <div className="text-xs text-slate-400 font-medium">Tingkat Bukti Digital</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-amber-500/50 transition">
              <div className="text-2xl font-black text-amber-400">A0 – A3</div>
              <div className="text-xs text-slate-400 font-medium">Authority Envelope</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-purple-500/50 transition">
              <div className="text-2xl font-black text-purple-400">100% SHA256</div>
              <div className="text-xs text-slate-400 font-medium">Append-Only Audit Log</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INFINITE RUNNING MARQUEE SLIDER FOR ACTORS & ROLES (Right to Left Commercial Motion) */}
      <section className="space-y-6 overflow-hidden py-4 bg-white/80 rounded-3xl p-6 border border-slate-200 shadow-xl">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Ekosistem AI Superagent Multi-Peran</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Siapa Saja yang Terhubung di SambungJaga?
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            (Geser otomatis bergerak dari kanan ke kiri. Hover untuk menghentikan & klik untuk akses demo!)
          </p>
        </div>

        {/* Running Marquee Slider Container */}
        <div className="relative w-full overflow-hidden py-4">
          <div className="animate-marquee flex space-x-6 items-center">
            {marqueeActors.map((actor, idx) => (
              <div
                key={`${actor.id}-${idx}`}
                onClick={() => onDirectDemoLogin(actor.id)}
                className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-200/60 hover:border-sky-500 hover:scale-105 transition duration-300 cursor-pointer text-center space-y-2.5 w-64 shrink-0 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-12 h-12 bg-sky-500/10 rounded-bl-full pointer-events-none"></div>

                <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-md shadow-sky-600/20 group-hover:scale-110 transition">
                  <Users className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900">{actor.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{actor.subtitle}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-center space-x-1 text-xs text-sky-600 font-bold group-hover:text-sky-700">
                  <span>Akses Demo</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE INNOVATIONS P1 - P6 SHOWCASE */}
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
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xl shadow-slate-200/50 hover:border-sky-400 hover:shadow-2xl transition-all space-y-3 flex flex-col justify-between hover:-translate-y-1"
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

      {/* 4. INTERACTIVE 9 ARCHITECTURE LAYERS DIAGRAM */}
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
              className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${layer.color}`}
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
          className="bg-white text-sky-900 hover:bg-slate-100 font-black text-sm px-8 py-4 rounded-2xl shadow-xl transition shrink-0 flex items-center space-x-2 hover:scale-105"
        >
          <span>Masuk ke Dashboard</span>
          <ArrowRight className="w-4 h-4 text-sky-600" />
        </button>
      </section>
    </div>
  );
}

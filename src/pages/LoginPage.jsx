import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Activity,
  ArrowLeft,
  Key
} from 'lucide-react';
import { ACTORS, CORE_INNOVATIONS } from '../types/architecture';

export default function LoginPage({ onLoginSuccess, onGoToRegister, onGoToLanding }) {
  const [selectedRole, setSelectedRole] = useState('supervisor');
  const [email, setEmail] = useState('supervisor.ratna@sambungjaga.id');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess(selectedRole);
  };

  const handleQuickDemoLogin = (roleId) => {
    setSelectedRole(roleId);
    onLoginSuccess(roleId);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-100 font-sans">
      {/* LEFT COLUMN: Far Left Branding & System Value Showcase */}
      <div className="w-full lg:w-7/12 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Background Ambient Lights */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={onGoToLanding}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="p-2.5 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">SambungJaga AI</h1>
              <p className="text-xs text-sky-200 font-medium">Care Superagent Architecture</p>
            </div>
          </div>

          <button
            onClick={onGoToLanding}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Landing</span>
          </button>
        </div>

        {/* Hero Value Showcase */}
        <div className="relative z-10 my-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>Obligation Kernel Versi Final 2026</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
            Evidence-Verified Care Continuity <br />
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Platform Perawatan Lansia Terverifikasi
            </span>
          </h2>

          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Meningkatkan keselamatan lansia melalui Graf Kewajiban Perawatan bitemporal, verifikasi bukti E0–E3, dan penegakan wewenang P6 Authority Envelope.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {CORE_INNOVATIONS.slice(0, 4).map((inn) => (
              <div key={inn.code} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1">
                <div className="flex items-center space-x-2 font-mono text-xs font-bold text-sky-400">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>{inn.code}: {inn.title}</span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2">{inn.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Supabase RLS Protected
          </span>
          <span className="font-mono text-[11px]">100% SHA-256 Audit Trail</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Far Right Form & Demo Presets */}
      <div className="w-full lg:w-5/12 bg-white p-8 lg:p-14 flex flex-col justify-center space-y-6 shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Masuk ke Akun Anda</h2>
          <p className="text-xs text-slate-500 font-medium">
            Pilih peran pengguna atau gunakan login otomatis demo untuk pengujian.
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700 flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5 text-sky-600" /> Demo Instant Login (Sekali Klik):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('supervisor')}
              className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-3 rounded-xl shadow-xs transition text-left truncate"
            >
              Ns. Ratna (Supervisor)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('caregiver')}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl shadow-xs transition text-left truncate"
            >
              Suster Dewi (Pengasuh)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('family')}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-xl shadow-xs transition text-left truncate"
            >
              Keluarga Ibu Aminah
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin_hr')}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-xl shadow-xs transition text-left truncate"
            >
              Admin HR / Panti
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-sky-600" /> Peran / Akses Pengguna
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 text-xs text-slate-900 font-bold outline-none focus:ring-2 focus:ring-sky-500"
            >
              {ACTORS.map(actor => (
                <option key={actor.id} value={actor.id}>{actor.title} — {actor.subtitle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1 text-sky-600" /> Email / NIP Staf
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
              <Lock className="w-3.5 h-3.5 mr-1 text-sky-600" /> Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-xl shadow-sky-600/20 transition flex items-center justify-center space-x-2"
          >
            <span>Masuk ke Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 text-center text-xs text-slate-600 border-t border-slate-100">
          Belum memiliki akun staf atau keluarga?{' '}
          <button
            onClick={onGoToRegister}
            className="font-bold text-sky-600 hover:underline ml-1"
          >
            Daftar Sekarang &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

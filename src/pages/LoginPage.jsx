import React, { useState } from 'react';
import {
  Heart,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Activity,
  ArrowLeft,
  ShieldCheck
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 font-sans text-slate-900 overflow-x-hidden">
      {/* LEFT COLUMN: Landing Page Light Theme Banner with Orangtua.jpeg Photo */}
      <div className="w-full lg:w-7/12 bg-gradient-to-br from-sky-50/80 via-blue-50/50 to-sky-100/60 border-r border-sky-200/90 text-slate-900 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shadow-sm">

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={onGoToLanding}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="p-2 bg-sky-600 rounded-xl text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                Sambung<span className="text-sky-600">Jaga</span>
              </h1>
              <p className="text-xs text-sky-700 font-bold">Care Superagent Architecture</p>
            </div>
          </div>

          <button
            onClick={onGoToLanding}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-600" />
            <span>Kembali ke Landing</span>
          </button>
        </div>

        {/* Hero Value Showcase & Orangtua.jpeg Photo */}
        <div className="relative z-10 my-6 space-y-4">
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
            Evidence-Verified Care Continuity <br />
            <span className="text-sky-600">
              Platform Perawatan Lansia Terverifikasi
            </span>
          </h2>

          {/* Elderly Care Photo Card (/Orangtua.jpeg) */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white my-4 group">
            <img
              src="/Orangtua.jpeg"
              onError={(e) => { e.target.src = '/elderly-care.svg'; }}
              alt="Perawatan Lansia SambungJaga"
              className="w-full h-56 sm:h-64 lg:h-72 object-cover rounded-2xl transform group-hover:scale-105 transition duration-500"
            />
            {/* Overlay Badge */}
            <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center space-x-2 border border-slate-700/80 shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Perawatan Lansia Terintegrasi</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed font-normal">
            Meningkatkan keselamatan lansia melalui Graf Kewajiban Perawatan bitemporal, verifikasi bukti E0–E3, dan penegakan wewenang P6 Authority Envelope.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {CORE_INNOVATIONS.slice(0, 2).map((inn) => (
              <div key={inn.code} className="p-3 rounded-2xl bg-white/90 border border-sky-200/80 shadow-xs space-y-1">
                <div className="flex items-center space-x-2 font-mono text-xs font-bold text-sky-700">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <span>{inn.code}: {inn.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2">{inn.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Footer */}
        <div className="relative z-10 pt-4 border-t border-sky-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span className="flex items-center text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> PostgreSQL RLS Protected
          </span>
          <span className="font-mono text-[11px] bg-white px-2 py-1 rounded border border-slate-300 font-bold">
            100% SHA-256 Audit Trail
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Form & Demo Presets */}
      <div className="w-full lg:w-5/12 bg-white p-8 lg:p-14 flex flex-col justify-center space-y-6 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Masuk ke Akun Anda</h2>
          <p className="text-xs text-slate-500 font-medium">
            Pilih peran pengguna atau gunakan login otomatis demo untuk pengujian.
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-sky-600" /> Demo Instant Login (Sekali Klik):
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
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-sky-600/20 transition flex items-center justify-center space-x-2"
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

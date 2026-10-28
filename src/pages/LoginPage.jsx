import React, { useState } from 'react';
import {
  Heart,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { ACTORS } from '../types/architecture';

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

      {/* LEFT COLUMN: Full-Height Tua.webp Background Banner with Clean Core Overlay Text */}
      <div className="w-full lg:w-7/12 min-h-[500px] lg:min-h-screen relative flex flex-col justify-between p-8 lg:p-14 overflow-hidden text-white shadow-2xl">

        {/* Full-Height Background Image (/Tua.webp) */}
        <img
          src="/Tua.webp"
          onError={(e) => { e.target.src = '/Orangtua.jpeg'; }}
          alt="Perawatan Lansia SambungJaga"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />

        {/* Dark Gradient Overlay for High Legibility & Professional Elegance */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/70 backdrop-blur-[2px] z-0"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={onGoToLanding}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="p-2 bg-sky-600 rounded-xl text-white shadow-lg shadow-sky-600/30 group-hover:scale-105 transition flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Sambung<span className="text-sky-400">Jaga</span>
              </h1>
              <p className="text-xs text-sky-200 font-bold">Care Superagent Architecture</p>
            </div>
          </div>

          <button
            onClick={onGoToLanding}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-300" />
            <span>Kembali ke Landing</span>
          </button>
        </div>

        {/* Hero Core Value Showcase (Streamlined & Uncluttered) */}
        <div className="relative z-10 my-auto py-12 space-y-4 max-w-xl text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Sistem Perawatan Lansia Terintegrasi</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Evidence-Verified Care Continuity <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300">
              Platform Perawatan Lansia Terverifikasi
            </span>
          </h2>

          <p className="text-sm text-slate-200 leading-relaxed font-normal opacity-90">
            Meningkatkan keselamatan dan kenyamanan lansia dengan verifikasi tugas perawatan yang akurat, transparan, dan terpercaya.
          </p>
        </div>

        {/* Trust Footer */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 font-medium">
          <span className="flex items-center text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" /> Akses Terproteksi Aman
          </span>
          <span className="font-mono text-[11px] bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700/80 text-sky-300 font-bold backdrop-blur-md">
            Sistem Terverifikasi
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

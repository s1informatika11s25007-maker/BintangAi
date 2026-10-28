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

export default function LoginPage({ onLoginSuccess, onGoToRegister, onGoToLanding }) {
  const [selectedRole, setSelectedRole] = useState('supervisor');
  const [email, setEmail] = useState('supervisor.ratna@sambungjaga.id');
  const [password, setPassword] = useState('••••••••••••');

  const demoAccounts = {
    supervisor: 'supervisor.ratna@sambungjaga.id',
    caregiver: 'dewi.caregiver@sambungjaga.id',
    family: 'keluarga.aminah@gmail.com',
    admin_hr: 'admin.hr@sambungjaga.id'
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    if (demoAccounts[roleId]) {
      setEmail(demoAccounts[roleId]);
      setPassword('••••••••••••');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess(selectedRole);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 font-sans text-slate-900 overflow-x-hidden">

      {/* LEFT COLUMN: Tua.webp Full-Height Background Banner with Entrance Animation */}
      <div className="w-full lg:w-5/12 min-h-[380px] lg:min-h-screen relative flex flex-col justify-between p-8 lg:p-12 overflow-hidden text-white shadow-2xl shrink-0">

        {/* Full-Height Background Image (/Tua.webp) */}
        <img
          src="/Tua.webp"
          onError={(e) => { e.target.src = '/Orangtua.jpeg'; }}
          alt="Perawatan Lansia SambungJaga"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/75 backdrop-blur-[2px] z-0"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between animate-fade-in">
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
              <p className="text-xs text-sky-200 font-bold">Care Superagent</p>
            </div>
          </div>

          <button
            onClick={onGoToLanding}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-300" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Hero Message */}
        <div className="relative z-10 my-auto py-8 space-y-3 text-left animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Perawatan Lansia Terintegrasi</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Evidence-Verified Care <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300">
              Platform Perawatan Terverifikasi
            </span>
          </h2>
        </div>

        {/* Trust Footer */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 font-medium">
          <span className="flex items-center text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" /> Akses Terproteksi
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Ultra-Clean Form with Dropdown Demo Select & Entrance Animation */}
      <div className="w-full lg:w-7/12 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 shadow-xl animate-fade-in">

        {/* Header - Full Width */}
        <div className="space-y-1.5 w-full text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Masuk ke akun SambungJaga Anda
          </p>
        </div>

        {/* Login Form - Full Width */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-2 text-left w-full">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
              <UserCheck className="w-4 h-4 mr-1.5 text-sky-600" /> Peran / Akses Pengguna (Demo Auto-Fill)
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-slate-900 font-bold outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-2xs"
            >
              <option value="supervisor">Ns. Ratna Sari — Supervisor Klinis</option>
              <option value="caregiver">Suster Dewi Pertiwi — Pengasuh / Perawat</option>
              <option value="family">Keluarga Ibu Hj. Aminah — Wali Pasien</option>
              <option value="admin_hr">Budi Santoso — Admin HR / Panti</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
              <Mail className="w-4 h-4 mr-1.5 text-sky-600" /> Email Staf
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
              <Lock className="w-4 h-4 mr-1.5 text-sky-600" /> Kata Sandi
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-2xs"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base py-4 rounded-xl shadow-lg shadow-sky-600/25 hover:shadow-sky-600/40 transition duration-300 flex items-center justify-center space-x-2 mt-2"
          >
            <span>Masuk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-100 w-full">
          Belum punya akun?{' '}
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

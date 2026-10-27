import React, { useState } from 'react';
import {
  Shield,
  User,
  Mail,
  Phone,
  Building,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Lock
} from 'lucide-react';

export default function RegisterPage({ onRegisterSuccess, onGoToLogin, onGoToLanding }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('caregiver');
  const [facilityCode, setFacilityCode] = useState('PANTI-DAHLIA-JKT');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onRegisterSuccess(role);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-100 font-sans">
      {/* LEFT COLUMN: Far Left Branding & Registration Perks */}
      <div className="w-full lg:w-7/12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

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
              <p className="text-xs text-purple-200 font-medium">Care Superagent Architecture</p>
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

        {/* Value Content */}
        <div className="relative z-10 my-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            <span>Registrasi Staf & Wali Pasien</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
            Bergabung dalam Jaringan <br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-sky-300 bg-clip-text text-transparent">
              Perawatan Lansia Terverifikasi
            </span>
          </h2>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/80">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Otorisasi Berbasis Peran (RBAC)</h4>
                <p className="text-[11px] text-slate-300">Hak akses terintegrasi sesuai skema Supabase PostgreSQL RLS.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/80">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Verifikasi Mobile PWA Offline Ledger</h4>
                <p className="text-[11px] text-slate-300">Atestasi perangkat anti-backdate untuk pengasuh di lapangan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>SambungJaga AI © 2026</span>
          <span className="font-mono text-[11px]">Kepatuhan UU PDP Active</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Far Right Registration Form */}
      <div className="w-full lg:w-5/12 bg-white p-8 lg:p-14 flex flex-col justify-center space-y-6 shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pendaftaran Akun Baru</h2>
          <p className="text-xs text-slate-500 font-medium">
            Isi formulir untuk mendaftarkan staf medis atau akun keluarga pasien.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-center space-y-3 shadow-md">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="font-bold text-base">Pendaftaran Berhasil!</h3>
            <p className="text-xs opacity-90">Memproses pembuatan akun & verifikasi otorisasi RBAC...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-sky-600" /> Nama Lengkap & Gelar
              </label>
              <input
                type="text"
                required
                placeholder="Suster Dewi Pertiwi, Amd.Kep"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peran Utama</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-3 text-xs text-slate-900 font-bold outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="caregiver">Pengasuh / Perawat</option>
                  <option value="supervisor">Supervisor Klinis</option>
                  <option value="family">Keluarga Pasien</option>
                  <option value="admin_hr">Admin Panti / HR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1 text-sky-600" /> Kode Panti
                </label>
                <input
                  type="text"
                  required
                  value={facilityCode}
                  onChange={(e) => setFacilityCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-sky-600" /> Alamat Email Resmi
              </label>
              <input
                type="email"
                required
                placeholder="dewi@panti.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-sky-600" /> Nomor WhatsApp (Verifikasi PWA)
              </label>
              <input
                type="tel"
                required
                placeholder="+62 812 3456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-xl shadow-sky-600/20 transition flex items-center justify-center space-x-2"
            >
              <span>Daftarkan Akun Baru</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="pt-4 text-center text-xs text-slate-600 border-t border-slate-100">
          Sudah memiliki akun?{' '}
          <button
            onClick={onGoToLogin}
            className="font-bold text-sky-600 hover:underline ml-1"
          >
            Masuk di Sini &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

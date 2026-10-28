import React, { useState } from 'react';
import {
  Heart,
  User,
  Mail,
  Phone,
  Building,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 font-sans text-slate-900 overflow-x-hidden">

      {/* LEFT COLUMN: Landing Page Light Theme Banner with Entrance Animation */}
      <div className="w-full lg:w-5/12 bg-gradient-to-br from-sky-50/80 via-indigo-50/50 to-sky-100/60 border-r border-sky-200/90 text-slate-900 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden shadow-sm shrink-0 animate-fade-in">

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
              <p className="text-xs text-indigo-700 font-bold">Care Superagent</p>
            </div>
          </div>

          <button
            onClick={onGoToLanding}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-600" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Value Content */}
        <div className="relative z-10 my-10 space-y-5 text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pendaftaran Akun Baru</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            Bergabung dalam Jaringan <br />
            <span className="text-sky-600">
              Perawatan Lansia Terverifikasi
            </span>
          </h2>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-start space-x-2.5 bg-white/90 p-3 rounded-2xl border border-sky-200/80 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Otorisasi Berbasis Peran</h4>
                <p className="text-[11px] text-slate-600">Hak akses terintegrasi dan terproteksi aman.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 bg-white/90 p-3 rounded-2xl border border-sky-200/80 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Verifikasi Perangkat</h4>
                <p className="text-[11px] text-slate-600">Atestasi perangkat untuk pengasuh di lapangan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-sky-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
          <span>SambungJaga © 2026</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Streamlined Registration Form with Entrance Animation */}
      <div className="w-full lg:w-7/12 bg-white p-8 lg:p-16 flex flex-col justify-center space-y-6 shadow-xl animate-fade-in">

        <div className="space-y-1.5 w-full text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pendaftaran Akun</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Buat akun staf medis atau keluarga pasien
          </p>
        </div>

        <div className="w-full space-y-4">
          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-center space-y-3 shadow-md">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="font-bold text-base">Pendaftaran Berhasil!</h3>
              <p className="text-xs opacity-90">Memproses verifikasi akun baru Anda...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left w-full">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-sky-600" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Suster Dewi Pertiwi, Amd.Kep"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500 transition shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peran Utama</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-slate-900 font-bold outline-none focus:ring-2 focus:ring-sky-500 transition shadow-2xs"
                  >
                    <option value="caregiver">Pengasuh / Perawat</option>
                    <option value="supervisor">Supervisor Klinis</option>
                    <option value="family">Keluarga Pasien</option>
                    <option value="admin_hr">Admin HR / Panti</option>
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500 transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-sky-600" /> Alamat Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="dewi@panti.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500 transition shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-sky-600" /> Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+62 812 3456 7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500 transition shadow-2xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base py-4 rounded-xl shadow-lg shadow-sky-600/25 hover:shadow-sky-600/40 transition duration-300 flex items-center justify-center space-x-2 mt-2"
              >
                <span>Daftar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Footer Link */}
          <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-100 w-full">
            Sudah punya akun?{' '}
            <button
              onClick={onGoToLogin}
              className="font-bold text-sky-600 hover:underline ml-1"
            >
              Masuk &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

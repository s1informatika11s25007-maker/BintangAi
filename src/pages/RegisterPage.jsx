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
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { supabase } from '../supabase/client';
import { ROLE_LABELS } from '../services/staffService';

export default function RegisterPage({ onRegisterSuccess, onGoToLogin, onGoToLanding }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('caregiver');
  const [facilityCode, setFacilityCode] = useState('PANTI-DAHLIA-JKT');
  const [phone, setPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setIsRegistering(true);

    const newUser = {
      id: `usr-${Date.now()}`,
      full_name: fullName.trim(),
      role: role,
      email: email.trim(),
      phone: phone.trim(),
      facility_code: facilityCode,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      competencies: ['clinical_care', 'vital_signs']
    };

    // Insert into Supabase staff_profiles table if connected
    try {
      await supabase.from('staff_profiles').insert([{
        full_name: newUser.full_name,
        role: newUser.role,
        avatar_url: newUser.avatar_url,
        competencies: newUser.competencies
      }]);
    } catch (err) {
      console.warn("Notice: Registered staff saved to local session context.", err);
    }

    const accountObj = {
      id: newUser.id,
      key: `acc_${role}_${newUser.id}`,
      name: newUser.full_name,
      roleTitle: ROLE_LABELS[role] || 'Staf Medis',
      role: role,
      email: newUser.email,
      avatar: newUser.avatar_url,
      competencies: newUser.competencies
    };

    setSubmitted(true);
    setTimeout(() => {
      onRegisterSuccess(role, accountObj);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 font-sans text-slate-900 overflow-x-hidden">

      {/* LEFT COLUMN: Full-Height gunung.jpeg Background Banner */}
      <div className="w-full lg:w-5/12 min-h-[380px] lg:min-h-screen relative flex flex-col justify-between p-8 lg:p-12 overflow-hidden text-white shadow-2xl shrink-0 animate-fade-in">

        {/* Full-Height Background Image (/gunung.jpeg) */}
        <img
          src="/gunung.jpeg"
          onError={(e) => { e.target.src = '/Tua.jpeg'; }}
          alt="Pemandangan Alam SambungJaga"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/75 backdrop-blur-[2px] z-0"></div>

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
        <div className="relative z-10 my-auto py-8 space-y-3 text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Pendaftaran Akun Baru</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Bergabung dalam Jaringan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300">
              Perawatan Lansia Terverifikasi
            </span>
          </h2>
        </div>

        {/* Trust Footer */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 font-medium">
          <span className="flex items-center text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" /> Akses Terproteksi Realtime
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Streamlined Registration Form */}
      <div className="w-full lg:w-7/12 bg-white p-8 lg:p-16 flex flex-col justify-center space-y-6 shadow-xl animate-fade-in">

        <div className="space-y-1.5 w-full text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pendaftaran Akun Baru</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Buat akun staf medis atau keluarga pasien untuk langsung mengakses sistem
          </p>
        </div>

        <div className="w-full space-y-4">
          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-center space-y-3 shadow-md animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="font-bold text-base">Pendaftaran Berhasil!</h3>
              <p className="text-xs opacity-90 font-medium">Mengarahkan Anda ke ruang kerja {ROLE_LABELS[role] || 'Staf'}...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left w-full">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-sky-600" /> Nama Lengkap Staf / Wali
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peran Utama (Role)</label>
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
                disabled={isRegistering}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base py-4 rounded-xl shadow-lg shadow-sky-600/25 hover:shadow-sky-600/40 transition duration-300 flex items-center justify-center space-x-2 mt-2 disabled:opacity-70"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Daftar & Masuk Sistem</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
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

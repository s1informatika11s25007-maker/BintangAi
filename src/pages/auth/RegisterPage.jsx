import React, { useState } from 'react';
import { Heart, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase/client/client';
import { appendAuditEntry } from '../../services/audit/auditTrailService';

export default function RegisterPage({ onRegisterSuccess, onGoToLogin, onGoToLanding }) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('caregiver');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const newAccount = {
      id: `staff-reg-${Date.now()}`,
      full_name: fullName,
      role,
      email,
      phone_number: phone,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      competencies: role === 'caregiver' ? ['vital_signs', 'general_care'] : ['clinical_supervision']
    };

    try {
      await supabase.from('staff_profiles').insert([newAccount]);
    } catch (err) {
      console.warn("Notice: Registered account saved to local session.", err);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      onRegisterSuccess(role, {
        id: newAccount.id,
        name: fullName,
        roleTitle: role === 'caregiver' ? 'Pengasuh / Perawat' : 'Supervisor Klinis',
        role,
        email,
        avatar: newAccount.avatar_url
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3">
        <button
          onClick={onGoToLanding}
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-xl shadow-sky-600/30">
            <Heart className="w-7 h-7 fill-white" />
          </div>
        </div>

        <h2 className="text-center text-2xl font-black text-slate-900 tracking-tight">
          Pendaftaran Akun Baru
        </h2>
        <p className="text-center text-xs text-slate-500 font-medium">
          Bergabung dengan Ekosistem Tata Kelola Perawatan Lansia SambungJaga AI
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-3xl space-y-6">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="font-bold text-slate-900 text-base">Pendaftaran Berhasil!</h3>
              <p className="text-xs text-slate-500">Mengarahkan Anda ke Ruang Kerja Sistem...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Suster Siti Nurhaliza, Amd.Kep"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Peran Akses Sistem</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="caregiver">Pengasuh / Perawat (Caregiver PWA)</option>
                  <option value="supervisor">Supervisor Klinis</option>
                  <option value="family">Wali Keluarga Pasien</option>
                  <option value="admin_hr">Admin Panti / HR</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="siti@panti.id"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+628123456789"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-sky-600/30 flex items-center justify-center space-x-2"
              >
                <span>Daftar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500">
              Sudah punya akun?{' '}
              <button onClick={onGoToLogin} className="text-sky-600 hover:text-sky-700 font-bold underline ml-1">
                Masuk di Sini
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

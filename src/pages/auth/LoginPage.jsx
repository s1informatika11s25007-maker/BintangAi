import React, { useState, useEffect } from 'react';
import {
  Heart,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';

import {
  fetchDemoAccountsPerRole,
  ROLE_LABELS
} from '../../services/dashboard/staffService';

export default function LoginPage({ onLoginSuccess, onGoToRegister, onGoToLanding }) {
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [selectedAccountKey, setSelectedAccountKey] = useState('none');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAccounts() {
      setIsFetchingAccounts(true);
      try {
        const accounts = await fetchDemoAccountsPerRole();
        if (isMounted) {
          setDemoAccounts(accounts);
          if (accounts.length > 0) {
            const defaultAcc = accounts.find(a => a.role === 'supervisor') || accounts[0];
            const accKey = defaultAcc.key || defaultAcc.id;
            setSelectedAccountKey(accKey);
            setSelectedAccount(defaultAcc);
            setEmail(defaultAcc.email);
            setPassword('••••••••••••');
          } else {
            setSelectedAccountKey('none');
            setSelectedAccount(null);
            setEmail('');
            setPassword('');
          }
        }
      } finally {
        if (isMounted) setIsFetchingAccounts(false);
      }
    }
    loadAccounts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAccountChange = (accountKey) => {
    setSelectedAccountKey(accountKey);
    if (accountKey === 'none') {
      setSelectedAccount(null);
      setEmail('');
      setPassword('');
      return;
    }

    const target = demoAccounts.find(a => (a.key === accountKey || a.id === accountKey));
    if (target) {
      setSelectedAccount(target);
      setEmail(target.email);
      setPassword('••••••••••••');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoggingIn(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      if (selectedAccountKey === 'none' || !selectedAccount) {
        // Mode Manual Input Email & Password
        const lowerEmail = email.toLowerCase();
        let inferredRole = 'supervisor';
        if (lowerEmail.includes('caregiver') || lowerEmail.includes('perawat') || lowerEmail.includes('suster')) {
          inferredRole = 'caregiver';
        } else if (lowerEmail.includes('family') || lowerEmail.includes('keluarga') || lowerEmail.includes('wali')) {
          inferredRole = 'family';
        } else if (lowerEmail.includes('admin') || lowerEmail.includes('hr')) {
          inferredRole = 'admin_hr';
        }

        const namePart = email.split('@')[0];
        const formattedName = namePart ? (namePart.charAt(0).toUpperCase() + namePart.slice(1)) : 'Staf SambungJaga';

        const customUser = {
          id: `manual-${Date.now()}`,
          key: `acc_manual_${Date.now()}`,
          name: formattedName,
          role: inferredRole,
          roleTitle: ROLE_LABELS[inferredRole] || 'Staf Medis',
          email: email.trim(),
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          competencies: ['clinical_care', 'vital_signs']
        };

        onLoginSuccess(inferredRole, customUser);
      } else {
        // Mode Demo Account Terpilih
        onLoginSuccess(selectedAccount.role, selectedAccount);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isManualMode = selectedAccountKey === 'none';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-100 font-sans text-slate-900 overflow-x-hidden">

      {/* LEFT COLUMN: Clean Clinical Visual Banner */}
      <div className="w-full lg:w-5/12 min-h-[380px] lg:min-h-screen relative flex flex-col justify-between p-8 lg:p-12 overflow-hidden text-white shadow-xl shrink-0">

        <img
          src="/Tua.jpeg"
          onError={(e) => { e.target.src = '/Orangtua.jpeg'; }}
          alt="Perawatan Lansia SambungJaga"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/70 to-slate-900/80 backdrop-blur-[1px] z-0"></div>

        {/* Header Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={onGoToLanding}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="p-2 bg-sky-600 rounded-xl text-white shadow-md transition-transform duration-200 group-hover:scale-105 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Sambung<span className="text-sky-400">Jaga</span>
              </h1>
              <p className="text-xs text-sky-200 font-medium">Care Superagent Platform</p>
            </div>
          </div>

          <button
            onClick={onGoToLanding}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sky-300" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Hero Clinical Tagline */}
        <div className="relative z-10 my-auto py-8 space-y-3 text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Sistem Operasional Perawatan Lansia</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
            Evidence-Verified Care <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-indigo-200">
              Integritas & Penjaminan Layanan
            </span>
          </h2>
        </div>

        {/* Banner Footer */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 font-medium">
          <span className="flex items-center text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" /> Otorisasi Akses Berbasis Peran
          </span>
        </div>
      </div>

      {/* RIGHT COLUMN: Professional Clean Form */}
      <div className="w-full lg:w-7/12 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 shadow-xl">

        {/* Header Wording */}
        <div className="space-y-1.5 text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            Akses Portal Layanan Kesehatan SambungJaga. Silakan pilih profil terdaftar atau gunakan opsi input mandiri untuk masuk.
          </p>
        </div>

        {isFetchingAccounts ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Memuat data akun staf...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-1 text-left w-full">

            {/* Account Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center">
                <UserCheck className="w-4 h-4 mr-1.5 text-sky-600" /> Pilih Akun Staf & Peran Akses
              </label>
              <select
                value={selectedAccountKey}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all duration-200 shadow-xs cursor-pointer"
              >
                <option value="none">-- Mode Input Mandiri --</option>
                {demoAccounts.map((account) => {
                  const accKey = account.key || account.id;
                  return (
                    <option key={accKey} value={accKey}>
                      {account.name} — {ROLE_LABELS[account.role] || account.roleTitle}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center">
                <Mail className="w-4 h-4 mr-1.5 text-sky-600" /> Alamat Email
              </label>
              <input
                type="email"
                required
                readOnly={!isManualMode}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isManualMode ? "Masukkan alamat email resmi Anda" : "Email otomatis terisi"}
                className={`w-full border rounded-xl px-4 py-3.5 text-xs sm:text-sm font-semibold outline-none transition-all duration-200 shadow-xs ${
                  isManualMode
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600'
                    : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                }`}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 flex items-center">
                <Lock className="w-4 h-4 mr-1.5 text-sky-600" /> Kata Sandi
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  readOnly={!isManualMode}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isManualMode ? "Masukkan kata sandi Anda" : "Kata sandi otomatis terisi"}
                  className={`w-full border rounded-xl px-4 py-3.5 pr-11 text-xs sm:text-sm font-semibold outline-none transition-all duration-200 shadow-xs ${
                    isManualMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600'
                      : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-600 transition-colors duration-200 focus:outline-none"
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] flex items-center justify-center space-x-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <span>
                    {isManualMode
                      ? 'Masuk ke Sistem'
                      : `Masuk sebagai ${selectedAccount ? (ROLE_LABELS[selectedAccount.role] || selectedAccount.name) : 'Staf'}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="pt-3 text-center text-xs text-slate-600 border-t border-slate-100 w-full">
          Belum memiliki akun staf?{' '}
          <button
            onClick={onGoToRegister}
            className="font-bold text-sky-600 hover:text-sky-700 hover:underline transition-colors ml-1 cursor-pointer"
          >
            Daftar Akun Baru &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}

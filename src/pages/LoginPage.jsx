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
} from '../services/staffService';

export default function LoginPage({ onLoginSuccess, onGoToRegister, onGoToLanding }) {
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [selectedAccountKey, setSelectedAccountKey] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAccounts() {
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
          }
        }
      } finally {
        // no-op
      }
    }
    loadAccounts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAccountChange = (accountKey) => {
    setSelectedAccountKey(accountKey);
    const target = demoAccounts.find(a => (a.key === accountKey || a.id === accountKey));
    if (target) {
      setSelectedAccount(target);
      setEmail(target.email);
      setPassword('••••••••••••');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAccount) {
      setIsLoggingIn(true);

      // Simulasi autentikasi karena akun-akun ini hanya ada di tabel staff_profiles
      // (seed data) dan belum didaftarkan di sistem Supabase Auth
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        onLoginSuccess(selectedAccount.role, selectedAccount);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoggingIn(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-sky-50/30 to-slate-100 font-sans text-slate-900 overflow-x-hidden">

      {/* LEFT COLUMN: Tua.jpeg Full-Height Background Banner */}
      <div className="w-full lg:w-5/12 min-h-[380px] lg:min-h-screen relative flex flex-col justify-between p-8 lg:p-12 overflow-hidden text-white shadow-2xl shrink-0">

        <img
          src="/Tua.jpeg"
          onError={(e) => { e.target.src = '/Orangtua.jpeg'; }}
          alt="Perawatan Lansia SambungJaga"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/75 backdrop-blur-[2px] z-0"></div>

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

        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 font-medium">
          <span className="flex items-center text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" /> Profil Staf Real
          </span>
        </div>
      </div>

      <div className="w-full lg:w-7/12 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 shadow-xl animate-fade-in">
        <div className="space-y-1.5 w-full text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Masuk ke akun SambungJaga Anda menggunakan staf yang telah didaftarkan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2 text-left w-full">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
              <UserCheck className="w-4 h-4 mr-1.5 text-sky-600" /> Pilih Akun & Peran Pengguna
            </label>
            <select
              value={selectedAccountKey}
              onChange={(e) => handleAccountChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-slate-900 font-bold outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-2xs"
            >
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
              <Mail className="w-4 h-4 mr-1.5 text-sky-600" /> Email Staf
            </label>
            <input
              type="email"
              required
              readOnly
              value={email}
              className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-slate-600 font-semibold outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center">
              <Lock className="w-4 h-4 mr-1.5 text-sky-600" /> Kata Sandi
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                readOnly
                value={password}
                className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-3.5 pr-11 text-xs sm:text-sm text-slate-600 font-semibold outline-none cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-600 transition duration-200 transform active:scale-90 focus:outline-none"
                title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 transition-transform duration-200" />
                ) : (
                  <Eye className="w-4 h-4 transition-transform duration-200" />
                )}
              </button>
            </div>
          </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm sm:text-base py-4 rounded-xl shadow-lg shadow-sky-600/25 hover:shadow-sky-600/40 transition duration-300 flex items-center justify-center space-x-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk dengan Profil {selectedAccount ? ROLE_LABELS[selectedAccount.role] : ''}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

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

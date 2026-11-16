import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { login, fetchDemoAccounts, demoLogin } from '@/features/auth/api/sessionApi';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { logUserActivity } from '@/utils/logger';
import AuthHeaderAccessibilityBar from '@/components/ui/AuthHeaderAccessibilityBar';
import BintangAvatar from '@/features/ai-tutor/components/BintangAvatar';
import {
  HiArrowLeft,
  HiArrowRight,
  HiEye,
  HiEyeOff,
  HiFingerPrint,
  HiLockClosed,
  HiMail,
  HiVolumeUp,
  HiCheckCircle,
  HiExclamationCircle,
  HiHeart
} from 'react-icons/hi';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedDemoKey, setSelectedDemoKey] = useState(null);
  const [demoAccounts, setDemoAccounts] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, fetchProfile } = useAuthStore();
  const { setModeFromProfile } = useAccessibilityStore();
  const { speak, stopSpeaking } = useVoice();

  useEffect(() => {
    let isMounted = true;
    fetchDemoAccounts().then((accounts) => {
      if (isMounted && accounts) setDemoAccounts(accounts);
    }).catch((err) => console.error("Error loading demo accounts:", err));

    const query = new URLSearchParams(location.search);
    const reason = query.get('reason');

    if (reason === 'inactivity') {
      const msg = 'Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan masuk kembali.';
      setMessage({ type: 'error', text: msg });
      speak(msg, 1.0, true);
    } else if (reason === 'teacher_logout') {
      const msg = 'Sesi Anda telah dikeluarkan (logout) oleh Guru Pembimbing. Silakan masuk kembali.';
      setMessage({ type: 'error', text: msg });
      speak(msg, 1.0, true);
    }
    return () => { isMounted = false; };
  }, [location.search, speak]);

  const fillAndLoginDemo = async (acc) => {
    setSelectedDemoKey(acc.key);
    setEmail(acc.email);
    setPassword(acc.pass);

    const announceText = `Akun Demo ${acc.label} (${acc.full_name}) dipilih. Sedang memproses...`;
    setMessage({ type: 'success', text: announceText });
    speak(announceText, 1.0, true);

    setLoading(true);
    try {
      const data = await demoLogin(acc);
      setUser(data.user);

      const profileData = await fetchProfile(data.user.id, true);
      if (profileData) {
        await logUserActivity('LOGIN', 'Masuk Demo Role', `Mencoba Demo ${acc.label}`, profileData);
        setModeFromProfile(profileData);

        const targetPath = profileData.role === 'guru'
          ? '/teacher/dashboard'
          : profileData.role === 'ortu'
            ? '/parent/dashboard'
            : '/student/dashboard';

        setTimeout(() => navigate(targetPath), 800);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err?.message || 'Gagal masuk akun demo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    stopSpeaking();

    const cleanEmail = email.trim();

    try {
      if (!cleanEmail) throw new Error('Silakan masukkan alamat email Anda.');
      if (!password) throw new Error('Silakan masukkan kata sandi Anda.');

      const data = await login(cleanEmail, password);
      setUser(data.user);

      const profileData = await fetchProfile(data.user.id);
      if (!profileData) {
        throw new Error('Profil pengguna belum ditemukan di database.');
      }

      await logUserActivity('LOGIN', 'Masuk Aplikasi', `Pengguna ${profileData.full_name} (${profileData.role}) berhasil masuk`, profileData);
      setModeFromProfile(profileData);

      const targetPath = profileData.role === 'guru'
        ? '/teacher/dashboard'
        : profileData.role === 'ortu'
          ? '/parent/dashboard'
          : '/student/dashboard';

      const successMsg = `Selamat datang kembali, ${profileData.full_name}! Mengalihkan ke ruang belajar...`;
      speak(successMsg, 1.0, true);

      setTimeout(() => navigate(targetPath), 800);
    } catch (error) {
      const errMsg = error?.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.';
      setMessage({ type: 'error', text: errMsg });
      speak(errMsg, 1.0, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-sky-50/70 font-sans text-slate-900 selection:bg-sky-200">
      <AuthHeaderAccessibilityBar
        spokenTitle="Halaman Masuk BintangAI"
        spokenText="Selamat datang di BintangAI. Silakan gunakan akun demo atau masukkan email dan kata sandimu."
      />

      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Left Visual & Mascot Panel */}
        <aside className="relative isolate flex min-h-[320px] lg:min-h-full w-full lg:w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-10 shadow-2xl">
          {/* Top Branding Logo */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 rounded-2xl focus-visible:outline-none"
              aria-label="Kembali ke Beranda Utama BintangAI"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
                <BintangAvatar state="idle" size="xs" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-black tracking-tight text-white block">
                  Bintang<span className="text-blue-400">AI</span>
                </span>
                <span className="text-[10px] font-extrabold text-sky-200 tracking-wider uppercase block">
                  Inklusif SD 1–6
                </span>
              </div>
            </button>
          </div>

          {/* Mascot "Kak Bintang" Assistant Box */}
          <div className="relative my-8 lg:my-auto space-y-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl bg-white/10 p-6 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-4">
                <BintangAvatar state="happy" size="sm" />
                <div>
                  <h3 className="text-lg font-black text-white">Kak Bintang AI</h3>
                  <p className="text-xs text-sky-200 font-medium">Asisten Belajar Pintar SD</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950/70 p-4 border border-white/10 text-xs sm:text-sm leading-relaxed text-sky-100 font-medium">
                "Selamat datang kembali! Kamu bisa mengetuk salah satu <strong className="text-yellow-300">Akun Demo Role</strong> di sebelah kanan untuk langsung mencoba, atau ketikkan email dan kata sandimu!"
              </div>

              <button
                type="button"
                onClick={() => speak("Halo Teman Bintang! Kak Bintang siap menemani belajar tanpa hambatan. Pilih akun demo di kanan atau masukkan email dan kata sandimu!", 1.0, true)}
                className="w-full py-2.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-95"
              >
                <HiVolumeUp className="text-base" /> Dengarkan Suara Kak Bintang
              </button>
            </motion.div>
          </div>

          <div className="relative border-t border-white/15 pt-4 text-xs text-sky-200 font-semibold flex justify-between items-center">
            <span>© 2026 BintangAI • Ruang Belajar SD Inklusif</span>
            <span className="inline-flex items-center gap-1 text-yellow-300">
              <HiHeart className="text-rose-400" /> Belajar Mandiri
            </span>
          </div>
        </aside>

        {/* Right Interaction Panel (Demo Accounts & Form) */}
        <section className="flex-1 flex flex-col justify-center overflow-y-auto bg-white px-6 py-8 sm:px-10 md:px-14 lg:px-16 lg:py-12">
          <div className="w-full max-w-2xl mx-auto space-y-8 my-auto">
            {/* Header Back & Title */}
            <div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mb-4 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition"
              >
                <HiArrowLeft className="text-sm" /> Kembali ke Beranda Utama
              </button>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Masuk ke <span className="text-blue-600">BintangAI</span>
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Lanjutkan petualangan belajar, modul interaktif, dan kuis ramah disabilitas.
              </p>
            </div>

            {/* Quick Demo Accounts Selection Cards */}
            <div className="rounded-3xl bg-sky-50/80 border-2 border-sky-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold">
                    <HiFingerPrint className="text-lg" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-sky-950">Pilihan Demo Role (Tanpa Login Manual)</h2>
                    <p className="text-[11px] text-sky-700 font-semibold">Klik salah satu kartu untuk langsung mencoba simulasi tiap role</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {demoAccounts.map((acc) => {
                  const isSelected = selectedDemoKey === acc.key;
                  return (
                    <button
                      key={acc.key}
                      type="button"
                      disabled={loading}
                      onClick={() => fillAndLoginDemo(acc)}
                      className={`relative flex flex-col justify-between rounded-2xl p-3.5 text-left border-2 transition-all active:scale-95 ${
                        isSelected
                          ? 'border-blue-600 bg-white shadow-xl ring-2 ring-blue-500/20 scale-[1.02]'
                          : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-2xl">{acc.icon}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${acc.badgeColor || 'bg-blue-600 text-white'}`}>
                          {acc.label}
                        </span>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs font-black text-slate-900 truncate">{acc.full_name}</p>
                        <p className="text-[10px] text-slate-500 font-semibold truncate">{acc.description}</p>
                      </div>
                      {isSelected && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-blue-600">
                          <HiCheckCircle className="text-sm" /> Memproses...
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alert Message Box */}
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  key={message.text}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  role={message.type === 'error' ? 'alert' : 'status'}
                  className={`flex items-start gap-3 rounded-2xl p-4 border text-sm font-bold shadow-sm ${
                    message.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {message.type === 'success' ? (
                    <HiCheckCircle className="text-2xl text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <HiExclamationCircle className="text-2xl text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p>{message.text}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-blue-600">
                    <HiMail />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-blue-600">
                    <HiLockClosed />
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-12 py-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2.5 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-300 active:scale-[0.99] transition flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {loading ? (
                  <span>Sedang Memproses...</span>
                ) : (
                  <>
                    <span>Masuk ke BintangAI</span>
                    <HiArrowRight className="text-xl" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Redirect Link */}
            <div className="border-t border-slate-200 pt-6 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-600">Belum memiliki akun BintangAI?</p>
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-extrabold text-sm transition"
              >
                <span>Daftar Akun Baru Gratis</span>
                <HiArrowRight />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;

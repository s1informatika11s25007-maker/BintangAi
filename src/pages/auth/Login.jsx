import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { login } from '@/features/auth/api/sessionApi';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import { logUserActivity } from '@/utils/logger';
import AuthHeaderAccessibilityBar from '@/components/ui/AuthHeaderAccessibilityBar';
import {
  HiAcademicCap,
  HiArrowLeft,
  HiArrowRight,
  HiChevronDown,
  HiEye,
  HiEyeOff,
  HiFingerPrint,
  HiLightningBolt,
  HiLockClosed,
  HiMail,
  HiSparkles,
  HiVolumeUp,
  HiCheckCircle,
  HiExclamationCircle,
  HiUserGroup,
  HiHeart
} from 'react-icons/hi';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [selectedDemoKey, setSelectedDemoKey] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, fetchProfile } = useAuthStore();
  const { setModeFromProfile } = useAccessibilityStore();
  const { speak, stopSpeaking } = useVoice();

  // Load reason query if session timed out or forced logout
  useEffect(() => {
    let isMounted = true;
    const query = new URLSearchParams(location.search);
    const reason = query.get('reason');

    if (reason === 'inactivity') {
      const msg = 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan masuk kembali.';
      setMessage({ type: 'error', text: msg });
      speak(msg, 1.0, true);
    } else if (reason === 'teacher_logout') {
      const msg = 'Sesi Anda telah dikeluarkan (logout) oleh Guru Pembimbing. Silakan masuk kembali.';
      setMessage({ type: 'error', text: msg });
      speak(msg, 1.0, true);
    }

    // Fetch demo accounts from database with robust preset fallback
    const fetchDemoAccounts = async () => {
      setLoadingDemo(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, disability_type, student_password_hash')
          .eq('is_demo_account', true)
          .not('email', 'is', null);

        let accountsList = [];

        if (!error && data && data.length > 0) {
          const accountsMap = {};
          data.forEach((profile) => {
            let key = profile.role;
            if (profile.role === 'siswa' && profile.disability_type) {
              key = profile.disability_type;
            }

            if (!accountsMap[key]) {
              let label = 'Siswa';
              let icon = '🎓';
              let badgeColor = 'bg-blue-500 text-white';
              let description = 'Siswa SD Belajar Inklusif';

              if (profile.role === 'guru') {
                label = 'Guru Pembimbing';
                icon = '👨‍🏫';
                badgeColor = 'bg-indigo-600 text-white';
                description = 'Kelola kelas & modul';
              } else if (profile.role === 'ortu') {
                label = 'Orang Tua';
                icon = '👪';
                badgeColor = 'bg-rose-500 text-white';
                description = 'Pantau perkembangan anak';
              } else if (profile.disability_type === 'tunanetra') {
                label = 'Siswa Tunanetra';
                icon = '🦯';
                badgeColor = 'bg-purple-600 text-white';
                description = 'Fitur Suara Audio & High Contrast';
              } else if (profile.disability_type === 'tunarungu') {
                label = 'Siswa Tunarungu';
                icon = '🤟';
                badgeColor = 'bg-cyan-600 text-white';
                description = 'Fitur Teks Visual & Subtitle';
              } else if (profile.disability_type === 'tunawicara') {
                label = 'Siswa Tunawicara';
                icon = '💬';
                badgeColor = 'bg-emerald-600 text-white';
                description = 'Fitur Isyarat & Gambar Cepat';
              }

              accountsMap[key] = {
                key,
                label,
                email: profile.email,
                pass: profile.student_password_hash || 'demo123456',
                icon,
                badgeColor,
                description,
                full_name: profile.full_name || label,
                role: profile.role,
                disability_type: profile.disability_type || 'tidak_ada'
              };
            }
          });

          const desiredOrder = ['guru', 'tunanetra', 'tunarungu', 'tunawicara', 'ortu'];
          desiredOrder.forEach((k) => {
            if (accountsMap[k]) accountsList.push(accountsMap[k]);
          });
          Object.keys(accountsMap).forEach((k) => {
            if (!desiredOrder.includes(k)) accountsList.push(accountsMap[k]);
          });
        }

        // Fallback default demo profiles if DB empty or unavailable
        if (accountsList.length === 0) {
          accountsList = [
            {
              key: 'guru',
              label: 'Guru Pembimbing',
              email: 'guru.demo@bintang.ai',
              pass: 'demo123456',
              icon: '👨‍🏫',
              badgeColor: 'bg-indigo-600 text-white',
              description: 'Kelola kelas & bimbingan SD',
              full_name: 'Ibu Rina (Guru SLB/SD)',
              role: 'guru',
              disability_type: 'tidak_ada'
            },
            {
              key: 'tunanetra',
              label: 'Siswa Tunanetra',
              email: 'tunanetra.demo@bintang.ai',
              pass: 'demo123456',
              icon: '🦯',
              badgeColor: 'bg-purple-600 text-white',
              description: 'Suara Audio & Kontras Tinggi',
              full_name: 'Budi Santoso (Kelas 4 SD)',
              role: 'siswa',
              disability_type: 'tunanetra'
            },
            {
              key: 'tunarungu',
              label: 'Siswa Tunarungu',
              email: 'tunarungu.demo@bintang.ai',
              pass: 'demo123456',
              icon: '🤟',
              badgeColor: 'bg-cyan-600 text-white',
              description: 'Teks Visual & Subtitle Pintar',
              full_name: 'Siti Rahma (Kelas 3 SD)',
              role: 'siswa',
              disability_type: 'tunarungu'
            },
            {
              key: 'tunawicara',
              label: 'Siswa Tunawicara',
              email: 'tunawicara.demo@bintang.ai',
              pass: 'demo123456',
              icon: '💬',
              badgeColor: 'bg-emerald-600 text-white',
              description: 'Gambar Isyarat & Pilihan Cepat',
              full_name: 'Doni Pratama (Kelas 5 SD)',
              role: 'siswa',
              disability_type: 'tunawicara'
            },
            {
              key: 'ortu',
              label: 'Orang Tua',
              email: 'ortu.demo@bintang.ai',
              pass: 'demo123456',
              icon: '👪',
              badgeColor: 'bg-rose-500 text-white',
              description: 'Dampingi & Lihat Laporan Anak',
              full_name: 'Pak Herman (Orang Tua)',
              role: 'ortu',
              disability_type: 'tidak_ada'
            }
          ];
        }

        if (isMounted) setDemoAccounts(accountsList);
      } catch (err) {
        console.error('Error fetching demo accounts:', err);
      } finally {
        if (isMounted) setLoadingDemo(false);
      }
    };

    fetchDemoAccounts();
    return () => {
      isMounted = false;
    };
  }, [location.search, speak]);

  const fillDemoAccount = (acc) => {
    setSelectedDemoKey(acc.key);
    setEmail(acc.email);
    setPassword(acc.pass);

    const announceText = `Akun Demo ${acc.label} (${acc.full_name}) berhasil dipilih. Klik tombol Masuk ke BintangAi di bawah.`;
    setMessage({
      type: 'success',
      text: announceText
    });

    speak(announceText, 1.0, true);
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

      // Update online status in Supabase database
      try {
        await supabase.from('profiles').update({
          is_online: true,
          last_active_at: new Date().toISOString(),
          last_active: new Date().toISOString().split('T')[0]
        }).eq('id', data.user.id);
      } catch (e) {}

      const profileData = await fetchProfile(data.user.id);
      if (!profileData) {
        throw new Error('Profil pengguna belum ditemukan di database. Silakan hubungi administrator.');
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
    <div className="min-h-screen w-full flex flex-col bg-slate-100 font-sans text-slate-900 selection:bg-indigo-100">
      {/* Universal Top Accessibility Control Bar */}
      <AuthHeaderAccessibilityBar
        spokenTitle="Halaman Masuk BintangAi"
        spokenText="Selamat datang di BintangAi, platform belajar inklusif untuk siswa SD kelas 1 sampai 6. Silakan gunakan akun demo atau masukkan email dan kata sandimu."
      />

      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Left Visual & Mascot Panel */}
        <aside className="relative isolate flex min-h-[320px] lg:min-h-full w-full lg:w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-10 shadow-2xl">
          {/* Background image & gradient overlay */}
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80")' }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="pointer-events-none absolute right-[-6rem] top-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

          {/* Top Branding Logo */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
              aria-label="Kembali ke Beranda Utama BintangAi"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 font-black text-2xl text-indigo-950 shadow-xl shadow-amber-400/20">
                ⭐
              </div>
              <div className="text-left">
                <span className="text-2xl font-black tracking-tight text-white block">
                  Bintang<span className="text-amber-400">Ai</span>
                </span>
                <span className="text-[10px] font-extrabold text-indigo-200 tracking-wider uppercase block">
                  Inklusif SD 1–6
                </span>
              </div>
            </button>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-white/15">
              <HiSparkles className="text-amber-400" /> Kelas 1–6 SD
            </span>
          </div>

          {/* Mascot "Kak Bintang" Assistant Box */}
          <div className="relative my-8 lg:my-auto space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl bg-white/10 p-6 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-3xl shadow-lg ring-4 ring-white/20">
                  ⭐
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Kak Bintang <span className="text-xs bg-amber-400 text-indigo-950 px-2 py-0.5 rounded-full font-bold">Asisten Belajar</span>
                  </h3>
                  <p className="text-xs text-indigo-200 font-medium">Siap membantu sahabat istimewa!</p>
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-950/70 p-4 border border-white/10 text-xs sm:text-sm leading-relaxed text-indigo-100 font-medium">
                <p>
                  "Halo Teman Bintang! ✨ Selamat datang kembali. Kamu bisa menekan <strong className="text-amber-300">Akun Demo</strong> di kanan untuk langsung mencoba, atau masukkan email dan kata sandimu!"
                </p>
              </div>

              <button
                type="button"
                onClick={() => speak("Halo Teman Bintang! Selamat datang kembali. Kak Bintang siap menemani belajar tanpa hambatan. Pilih akun demo di kanan atau masukkan email dan kata sandimu!", 1.0, true)}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-indigo-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <HiVolumeUp className="text-base" /> Dengarkan Suara Kak Bintang
              </button>
            </motion.div>

            {/* Disability Support Highlights */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="rounded-2xl bg-purple-900/50 p-3 border border-purple-400/30 text-center space-y-1">
                <span className="text-xl block">🦯</span>
                <span className="text-[11px] font-extrabold text-purple-200 block">Tunanetra</span>
                <span className="text-[9px] text-purple-300 block font-semibold">Voice & Audio</span>
              </div>
              <div className="rounded-2xl bg-cyan-900/50 p-3 border border-cyan-400/30 text-center space-y-1">
                <span className="text-xl block">🤟</span>
                <span className="text-[11px] font-extrabold text-cyan-200 block">Tunarungu</span>
                <span className="text-[9px] text-cyan-300 block font-semibold">Subtitle & Visual</span>
              </div>
              <div className="rounded-2xl bg-emerald-900/50 p-3 border border-emerald-400/30 text-center space-y-1">
                <span className="text-xl block">💬</span>
                <span className="text-[11px] font-extrabold text-emerald-200 block">Tunawicara</span>
                <span className="text-[9px] text-emerald-300 block font-semibold">Isyarat & Pilihan</span>
              </div>
            </div>
          </div>

          <div className="relative border-t border-white/15 pt-4 text-xs text-indigo-200 font-semibold flex justify-between items-center">
            <span>© 2026 BintangAi • SD Inklusif</span>
            <span className="inline-flex items-center gap-1 text-amber-300">
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
                className="mb-4 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
              >
                <HiArrowLeft className="text-sm" /> Kembali ke Beranda
              </button>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Masuk ke <span className="text-indigo-600">BintangAi</span>
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Lanjutkan petualangan belajar, modul interaktif, dan kuis ramah disabilitas.
              </p>
            </div>

            {/* Quick Demo Accounts Selection Cards */}
            <div className="rounded-3xl bg-indigo-50/70 border-2 border-indigo-100 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold">
                    <HiFingerPrint className="text-lg" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-indigo-950">Akses Cepat Akun Demo (Database)</h2>
                    <p className="text-[11px] text-indigo-700 font-semibold">Klik salah satu kartu di bawah untuk mengisi data otomatis</p>
                  </div>
                </div>
                {loadingDemo && <span className="text-xs text-indigo-600 font-bold animate-pulse">Memuat...</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {demoAccounts.map((acc) => {
                  const isSelected = selectedDemoKey === acc.key;
                  return (
                    <button
                      key={acc.key}
                      type="button"
                      onClick={() => fillDemoAccount(acc)}
                      className={`relative flex flex-col justify-between rounded-2xl p-3.5 text-left border-2 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 ${
                        isSelected
                          ? 'border-indigo-600 bg-white shadow-xl ring-2 ring-indigo-500/20 scale-[1.02]'
                          : 'border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-md'
                      }`}
                      aria-label={`Pilih akun demo ${acc.label}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-2xl">{acc.icon}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${acc.badgeColor}`}>
                          {acc.label}
                        </span>
                      </div>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs font-black text-slate-900 truncate">{acc.full_name}</p>
                        <p className="text-[10px] text-slate-500 font-semibold truncate">{acc.description}</p>
                      </div>
                      {isSelected && (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600">
                          <HiCheckCircle className="text-sm" /> Terpilih!
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
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
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
                  <button
                    type="button"
                    onClick={() => speak(message.text, 1.0, true)}
                    className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-900"
                    title="Dengarkan Ulang Pesan Ini"
                    aria-label="Dengarkan Ulang Pesan Ini"
                  >
                    <HiVolumeUp className="text-lg" />
                  </button>
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
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-colors group-focus-within:text-indigo-600">
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
                    className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    aria-describedby="email-helper"
                  />
                </div>
                <p id="email-helper" className="text-[11px] font-semibold text-slate-400">
                  Gunakan email terdaftar Anda (atau pilih Akun Demo di atas).
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs font-semibold text-indigo-600">Minimal 8 Karakter</span>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-colors group-focus-within:text-indigo-600">
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
                    className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-12 py-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !showPassword;
                      setShowPassword(nextState);
                      speak(nextState ? 'Kata sandi ditampilkan' : 'Kata sandi disembunyikan', 1.0, true);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2.5 text-slate-400 hover:text-indigo-600 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-300"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60 focus-visible:ring-4 focus-visible:ring-indigo-300"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sedang Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke BintangAi</span>
                    <HiArrowRight className="text-xl" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Redirect Link */}
            <div className="border-t border-slate-200 pt-6 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-600">Belum memiliki akun BintangAi?</p>
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-sm transition-all focus-visible:ring-4 focus-visible:ring-indigo-200"
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

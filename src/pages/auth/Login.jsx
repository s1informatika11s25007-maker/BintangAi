import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { login } from '@/features/auth/api/sessionApi';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
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
} from 'react-icons/hi';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [demoAccounts, setDemoAccounts] = useState([]);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const navigate = useNavigate();
  const { setUser, fetchProfile } = useAuthStore();
  const { setModeFromProfile } = useAccessibilityStore();

  useEffect(() => {
    let isMounted = true;

    if (window.location.search.includes('reason=inactivity')) {
      setMessage({
        type: 'error',
        text: 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit. Silakan masuk kembali.'
      });
    } else if (window.location.search.includes('reason=teacher_logout')) {
      setMessage({
        type: 'error',
        text: 'Sesi Anda telah dikeluarkannya (logout) oleh Guru. Silakan masuk kembali.'
      });
    }

    const fetchDemoAccounts = async () => {
      setLoadingDemo(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, disability_type, student_password_hash')
          .eq('is_demo_account', true)
          .not('email', 'is', null);

        if (error) throw error;
        if (!isMounted || !data?.length) return;

        const accountsMap = {};
        data.forEach((profile) => {
          let key = profile.role;
          if (profile.role === 'siswa' && profile.disability_type) {
            key = profile.disability_type;
          }

          if (!accountsMap[key]) {
            let label = profile.role === 'guru'
              ? 'Guru'
              : profile.role === 'ortu'
                ? 'Orang Tua'
                : `Siswa (${profile.disability_type || 'Umum'})`;
            let icon = '👨‍🏫';
            let color = 'blue';

            if (profile.role === 'guru') {
              label = 'Guru';
              icon = '👨‍🏫';
              color = 'blue';
            } else if (profile.role === 'ortu') {
              label = 'Orang Tua';
              icon = '👪';
              color = 'sky';
            } else if (profile.disability_type === 'tunanetra') {
              label = 'Tunanetra';
              icon = '🦯';
              color = 'violet';
            } else if (profile.disability_type === 'tunarungu') {
              label = 'Tunarungu';
              icon = '🤟';
              color = 'cyan';
            } else if (profile.disability_type === 'tunawicara') {
              label = 'Tunawicara';
              icon = '💬';
              color = 'indigo';
            }

            accountsMap[key] = {
              label,
              email: profile.email,
              pass: profile.student_password_hash || 'demo123456',
              icon,
              color,
              full_name: profile.full_name,
            };
          }
        });

        const desiredOrder = ['guru', 'tunanetra', 'tunarungu', 'tunawicara', 'ortu'];
        const orderedAccounts = desiredOrder
          .filter((key) => accountsMap[key])
          .map((key) => accountsMap[key]);

        Object.keys(accountsMap).forEach((key) => {
          if (!desiredOrder.includes(key)) orderedAccounts.push(accountsMap[key]);
        });

        if (isMounted) setDemoAccounts(orderedAccounts);
      } catch (error) {
        console.error('Gagal memuat akun demo dari database:', error);
      } finally {
        if (isMounted) setLoadingDemo(false);
      }
    };

    fetchDemoAccounts();
    return () => {
      isMounted = false;
    };
  }, []);

  const fillDemoAccount = (account) => {
    setEmail(account.email || '');
    setPassword(account.pass || '');
    setMessage({
      type: 'success',
      text: `Akun demo ${account.label}${account.full_name ? ` – ${account.full_name}` : ''} dipilih. Klik Masuk untuk melanjutkan.`,
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const data = await login(email.trim(), password);
      setUser(data.user);

      // Update online status in database
      await supabase.from('profiles').update({
        is_online: true,
        last_active_at: new Date().toISOString(),
        last_active: new Date().toISOString().split('T')[0]
      }).eq('id', data.user.id);

      const profileData = await fetchProfile(data.user.id);
      if (!profileData) {
        throw new Error('Profil pengguna belum ditemukan. Silakan hubungi administrator.');
      }

      setModeFromProfile(profileData);
      const targetPath = profileData.role === 'guru'
        ? '/teacher/dashboard'
        : profileData.role === 'ortu'
          ? '/parent/dashboard'
          : '/student/dashboard';

      navigate(targetPath);
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Login gagal. Periksa email dan kata sandi Anda.' });
    } finally {
      setLoading(false);
    }
  };

  const colorDot = {
    blue: 'bg-blue-500',
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4F8FF] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Panel foto kiri dipertahankan dan tetap tampil sebagai banner pada layar kecil. */}
      <aside className="relative isolate flex min-h-[260px] w-full flex-col justify-between overflow-hidden bg-blue-950 px-6 py-7 text-white sm:min-h-[300px] lg:min-h-screen lg:w-[43%] lg:px-12 lg:py-10">
        <motion.div
          initial={{ scale: 1.08, opacity: 0.45 }}
          animate={{ scale: 1, opacity: 0.72 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80")' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#08275A]/95 via-[#0B438A]/75 to-[#1677C8]/70" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 -z-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="pointer-events-none absolute right-[-5rem] top-1/3 -z-10 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl" />

        <motion.button
          type="button"
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => navigate('/')}
          className="flex w-fit items-center gap-3 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200/70"
          aria-label="Kembali ke halaman utama BintangAi"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-blue-700 shadow-lg shadow-blue-950/20">B</span>
          <span className="text-xl font-black tracking-tight">Bintang<span className="text-sky-200">Ai</span></span>
        </motion.button>

        <div className="relative my-8 max-w-xl space-y-5 lg:my-0 lg:space-y-6">
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-50 backdrop-blur-md sm:text-xs"
          >
            <HiLightningBolt className="text-sky-200" /> Ruang Belajar Inklusif
          </motion.div>
          <motion.h1
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="max-w-lg text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl"
          >
            Selamat datang kembali, <span className="text-sky-200">Bintang!</span>
          </motion.h1>
          <motion.p
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="max-w-md text-sm font-medium leading-7 text-blue-50/90 sm:text-base"
          >
            Lanjutkan perjalanan belajar yang lebih mandiri bersama Kak Bintang. Setiap anak punya cara belajar dan kesempatan untuk bersinar.
          </motion.p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-white/90">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">Kelas 1–6 SD</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">Belajar di rumah</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">Aksesibel</span>
          </div>
        </div>

        <div className="relative hidden items-center justify-between border-t border-white/20 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-100/75 lg:flex">
          <span>© 2026 BintangAi</span>
          <span className="flex items-center gap-2"><HiAcademicCap className="text-sky-200" /> Belajar tanpa hambatan</span>
        </div>
      </aside>

      {/* Panel formulir - Edge-to-edge full width & full height sampai ujung atas, kanan, dan bawah */}
      <section className="relative flex flex-1 flex-col justify-center overflow-y-auto bg-white px-6 py-8 sm:px-10 md:px-14 lg:h-full lg:px-16 lg:py-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-0 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 w-full max-w-2xl mx-auto my-auto space-y-6"
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-7 inline-flex items-center gap-2 rounded-lg text-xs font-bold text-slate-500 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <HiArrowLeft /> Kembali ke beranda
          </button>

          <div className="mb-7 space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">Masuk ke akun</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Halo, <span className="text-blue-700">Bintang!</span></h2>
            <p className="text-sm leading-6 text-slate-500">Masuk untuk melanjutkan materi, latihan, dan aktivitas belajarmu.</p>
          </div>

          {(demoAccounts.length > 0 || loadingDemo) && (
            <div className="relative z-20 mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">Akses akun demo</span>
                <span className="h-px flex-1 bg-blue-100" />
              </div>
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={isDemoOpen}
                  aria-controls="demo-account-menu"
                  onClick={() => setIsDemoOpen((open) => !open)}
                  disabled={loadingDemo || demoAccounts.length === 0}
                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-left text-sm font-bold text-blue-900 transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="flex items-center gap-3"><HiFingerPrint className="text-xl text-blue-600" />{loadingDemo ? 'Memuat akun demo…' : 'Pilih akun demo'}</span>
                  <HiChevronDown className={`shrink-0 text-blue-500 transition-transform ${isDemoOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isDemoOpen && demoAccounts.length > 0 && (
                    <>
                      <button
                        type="button"
                        aria-label="Tutup daftar akun demo"
                        onClick={() => setIsDemoOpen(false)}
                        className="fixed inset-0 z-30 cursor-default"
                      />
                      <motion.div
                        id="demo-account-menu"
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        className="absolute left-0 right-0 top-full z-40 max-h-64 space-y-1 overflow-y-auto rounded-2xl border border-blue-100 bg-white p-2 shadow-2xl shadow-blue-900/10"
                      >
                        {demoAccounts.map((account) => (
                          <button
                            type="button"
                            key={account.email || account.label}
                            onClick={() => {
                              fillDemoAccount(account);
                              setIsDemoOpen(false);
                            }}
                            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorDot[account.color] || 'bg-blue-500'}`} />
                              <span className="min-w-0">
                                <span className="block text-sm font-bold text-slate-800">{account.icon} {account.label}</span>
                                <span className="block truncate text-xs text-slate-500">{account.full_name || account.email}</span>
                              </span>
                            </span>
                            <HiArrowRight className="shrink-0 text-blue-400" />
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={`${message.type}-${message.text}`}
                initial={{ opacity: 0, y: -7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -7 }}
                role={message.type === 'error' ? 'alert' : 'status'}
                className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold leading-5 ${
                  message.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-bold text-slate-700">Alamat email</label>
              <div className="group relative">
                <HiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400 transition group-focus-within:text-blue-600" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@email.com"
                  className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="login-password" className="text-sm font-bold text-slate-700">Kata sandi</label>
                <span className="text-xs font-medium text-slate-400">Gunakan kata sandi akun Anda</span>
              </div>
              <div className="group relative">
                <HiLockClosed className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400 transition group-focus-within:text-blue-600" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="min-h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-12 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  {showPassword ? <HiEyeOff size={19} /> : <HiEye size={19} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-blue-700 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl hover:shadow-blue-700/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />Memproses…</>
              ) : (
                <>Masuk ke BintangAi <HiArrowRight className="text-lg transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          <div className="mt-7 border-t border-blue-50 pt-6 text-center">
            <p className="text-sm text-slate-500">Belum memiliki akun?</p>
            <button
              type="button"
              onClick={() => navigate('/auth/register')}
              className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            >
              Daftar sekarang <HiArrowRight />
            </button>
          </div>
          <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">BintangAi · Belajar lebih mandiri, dengan cara yang sesuai untukmu.</p>
        </motion.div>
      </section>
    </main>
  );
};

export default Login;

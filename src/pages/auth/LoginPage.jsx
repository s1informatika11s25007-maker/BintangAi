import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { login, loginDemoAccount, fetchDemoAccountsFromDB, DEFAULT_DEMO_ACCOUNTS } from '@/features/auth/api/sessionApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight, HiArrowLeft, HiChevronDown, HiFingerPrint, HiLightningBolt } from 'react-icons/hi';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Inisialisasi awal dengan data instan agar 0ms delay & bebas animasi memuat
  const [demoAccounts, setDemoAccounts] = useState(DEFAULT_DEMO_ACCOUNTS);

  const navigate = useNavigate();
  const { setUser, fetchProfile } = useAuthStore();
  const { setModeFromProfile } = useAccessibilityStore();

  // Memuat data terkini dari database di background
  useEffect(() => {
    let isMounted = true;
    fetchDemoAccountsFromDB()
      .then((accounts) => {
        if (isMounted && accounts && accounts.length > 0) {
          setDemoAccounts(accounts);
        }
      })
      .catch((err) => {
        console.error("Gagal sinkronisasi demo dari DB:", err);
      });
    return () => { isMounted = false; };
  }, []);

  const handleSelectDemoRole = async (acc) => {
    setIsDemoOpen(false);
    setEmail(acc.email);
    setPassword('••••••••');
    setLoading(true);
    setMessage({ type: 'success', text: `Menyiapkan akses demo ${acc.label}...` });

    try {
      const { data } = await loginDemoAccount(acc.email);
      setUser(data.user);

      const profileData = await fetchProfile(data.user.id);
      if (profileData) {
        setModeFromProfile(profileData);
        const targetPath = profileData.role === 'guru' ? '/teacher/dashboard' :
                           profileData.role === 'ortu' ? '/parent/dashboard' :
                           '/student/dashboard';
        navigate(targetPath);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Gagal masuk ke akun demo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const cleanEmail = email.toLowerCase().trim();
      const matchedDemo = demoAccounts.find(
        acc => acc.email.toLowerCase() === cleanEmail
      );

      let authResult;
      if (matchedDemo) {
        authResult = await loginDemoAccount(matchedDemo.email);
      } else {
        const res = await login(cleanEmail, password);
        authResult = { data: res };
      }

      setUser(authResult.data.user);

      const profileData = await fetchProfile(authResult.data.user.id);
      if (profileData) {
        setModeFromProfile(profileData);

        const targetPath = profileData.role === 'guru' ? '/teacher/dashboard' :
                           profileData.role === 'ortu' ? '/parent/dashboard' :
                           '/student/dashboard';
        navigate(targetPath);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } }
  };

  return (
    <div className="h-screen max-h-screen flex font-sans bg-slate-50 selection:bg-indigo-100 overflow-hidden">
      {/* Left Section - Hero Visual (Gambar lebih jelas, gradien biru halus, teks terletak di atas secara rapi) */}
      <div className="hidden lg:flex lg:w-[45%] h-full relative overflow-hidden bg-slate-900 shrink-0">
        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {/* Layer gradien biru halus agar gambar background tampak jernih & teks di atas tetap terbaca jelas */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/80 via-indigo-900/35 to-indigo-950/70 z-10" />

        <div className="relative z-20 w-full h-full flex flex-col justify-between p-8 lg:p-12">
          {/* Teks Terletak Di Atas Secara Rapi (Bukan di Tengah Gambar) */}
          <div className="space-y-6 max-w-md">
            {/* Logo BintangAi Konsisten */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3.5 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-black text-xl">B</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
                Bintang<span className="text-indigo-400">Ai</span>
              </span>
            </motion.div>

            {/* Content Text Block (Top-Aligned) */}
            <div className="space-y-3.5 pt-2">
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 backdrop-blur-md border border-white/20 text-indigo-200 text-[11px] font-bold uppercase tracking-wider"
              >
                <HiLightningBolt className="text-indigo-400 animate-pulse" />
                Platform Belajar Masa Depan
              </motion.div>

              <motion.h2
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md"
              >
                Wujudkan Impian Tanpa <span className="text-indigo-300 underline decoration-indigo-400/40 underline-offset-6">Batasan</span>.
              </motion.h2>

              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm lg:text-base text-white/90 font-medium leading-relaxed drop-shadow-sm"
              >
                Platform inklusif yang dirancang untuk membantu setiap individu bersinar sesuai dengan keunikannya.
              </motion.p>
            </div>
          </div>

          {/* Footer Copyright at Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[10px] font-bold uppercase tracking-widest text-white/60 drop-shadow-sm"
          >
            © 2026 BINTANGAI DIGITAL ECOSYSTEM
          </motion.div>
        </div>

        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right Section - Login Form (Presisi 100% Layar Tanpa Scroll) */}
      <div className="w-full lg:w-[55%] h-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-[440px]">
          {/* Mobile Branding Logo (Hanya tampil di layar seluler saat panel kiri tersembunyi) */}
          <div className="flex lg:hidden items-center justify-between mb-3">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-black text-base">B</span>
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Bintang<span className="text-indigo-600">Ai</span>
              </span>
            </div>
          </div>

          {/* Tombol Kembali ke Beranda / Landing Page */}
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs mb-3 lg:mb-4 transition-colors cursor-pointer"
          >
            <HiArrowLeft className="text-sm" /> Kembali ke Beranda
          </motion.button>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5 lg:space-y-6"
          >
            <div className="space-y-1">
              <motion.h1 variants={itemVariants} className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Selamat Datang <span className="text-indigo-600">Kembali</span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-sm text-slate-500 font-medium">
                Silakan masuk untuk mengakses dashboard belajar Anda
              </motion.p>
            </div>

            {/* Quick Access Demo - Compact & Fast */}
            <motion.div variants={itemVariants} className="space-y-3 relative z-20">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uji Coba Platform</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDemoOpen(!isDemoOpen)}
                  className="w-full h-12 px-5 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-between group hover:border-indigo-600 hover:shadow-md transition-all text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <HiFingerPrint className="text-indigo-600" />
                    </div>
                    <span className="font-bold text-slate-700">Pilih Role Akses Demo</span>
                  </div>
                  <div className={`text-slate-400 group-hover:text-indigo-600 transition-transform ${isDemoOpen ? 'rotate-180' : ''}`}>
                    <HiChevronDown size={20} />
                  </div>
                </button>

                {isDemoOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsDemoOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-40 p-1.5 space-y-1">
                      {demoAccounts.map((acc) => (
                        <button
                          key={acc.id || acc.email}
                          onClick={() => handleSelectDemoRole(acc)}
                          className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between group text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${acc.color || 'bg-indigo-500'}`} />
                            <span className="font-bold text-slate-700 group-hover:text-indigo-600">Akses Demo {acc.label}</span>
                          </div>
                          <HiArrowRight className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" size={16} />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              variants={itemVariants}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Alamat Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <HiMail size={18} />
                  </div>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none font-semibold transition-all text-sm text-slate-900 placeholder:text-slate-400"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Kata Sandi</label>
                  <button type="button" className="text-[10px] font-bold text-indigo-600 hover:underline">Lupa Sandi?</button>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <HiLockClosed size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none font-semibold transition-all text-sm text-slate-900 placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                  >
                    {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm group disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Masuk Sekarang
                    <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.form>

            <motion.div variants={itemVariants} className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium mb-2">Baru di BintangAi?</p>
              <button
                onClick={() => navigate('/auth/register')}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 font-bold text-xs transition-all text-slate-700"
              >
                Buat Akun Baru
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
      </div>
    </div>
  );
};

export default Login;

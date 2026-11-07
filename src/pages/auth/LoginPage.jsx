import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { login } from '@/features/auth/api/sessionApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight, HiSparkles, HiChevronDown, HiFingerPrint, HiLightningBolt } from 'react-icons/hi';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const navigate = useNavigate();
  const { setUser, fetchProfile } = useAuthStore();
  const { setModeFromProfile } = useAccessibilityStore();

  // Welcome message removed as requested
  useEffect(() => {
  }, []);

  const demoAccounts = [
    { label: 'Guru', email: 'santaku@gmail.com', pass: 'santaku', icon: '👨‍🏫', color: 'indigo' },
    { label: 'Tunanetra', email: 'zakaria@gmail.com', pass: 'zakaria', icon: '🦯', color: 'purple' },
    { label: 'Tunarungu', email: 'zabarku@gmail.com', pass: 'zabarku', icon: '🤟', color: 'orange' },
    { label: 'Tunawicara', email: 'apapula@gmail.com', pass: 'apapula', icon: '🗣️', color: 'emerald' },
    { label: 'Orang Tua', email: 'Mega@gmail.com', pass: 'Megakulah', icon: '👪', color: 'rose' },
  ];

  const fillDemoAccount = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setMessage({ type: 'success', text: `Akun ${acc.label} terpilih! Klik Masuk Sekarang.` });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const data = await login(email, password);
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
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50 selection:bg-indigo-100 overflow-hidden">
      {/* Left Section - Hero Visual */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-indigo-900">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-indigo-900/50 to-transparent z-10" />

        <div className="relative z-20 w-full flex flex-col justify-between p-16">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <span className="text-indigo-600 font-black text-2xl">B</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Bintang<span className="text-indigo-400">Ai</span>
            </span>
          </motion.div>

          <div className="max-w-md">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <HiLightningBolt className="text-indigo-400 animate-pulse" />
              Platform Belajar Masa Depan
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-5xl font-extrabold text-white leading-tight mb-6"
            >
              Wujudkan Impian Tanpa <span className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-8">Batasan</span>.
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg text-indigo-100/80 font-medium leading-relaxed"
            >
              Platform inklusif yang dirancang untuk membantu setiap individu bersinar sesuai dengan keunikannya.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-[10px] font-bold uppercase tracking-widest text-indigo-300/50"
          >
            © 2026 BINTANGAI DIGITAL ECOSYSTEM
          </motion.div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 md:p-12 relative">
        <div className="w-full max-w-[480px]">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <div className="space-y-2">
              <motion.h1 variants={itemVariants} className="text-4xl font-black text-slate-900 tracking-tight">
                Selamat Datang <span className="text-indigo-600">Kembali</span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-slate-500 font-medium">
                Silakan masuk untuk mengakses dashboard belajar Anda
              </motion.p>
            </div>

            {/* Quick Access Demo - Professional Dropdown */}
            <motion.div variants={itemVariants} className="space-y-4 relative z-20">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uji Coba Platform</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="relative">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setIsDemoOpen(!isDemoOpen)}
                  className="w-full h-14 px-6 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-between group hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <HiFingerPrint className="text-indigo-600 group-hover:animate-pulse" />
                    </div>
                    <span className="font-bold text-slate-700">Pilih Role Akses Demo</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isDemoOpen ? 180 : 0 }}
                    className="text-slate-400 group-hover:text-indigo-600"
                  >
                    <HiChevronDown size={22} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isDemoOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-30"
                        onClick={() => setIsDemoOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 8, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-indigo-100/50 overflow-hidden z-40 p-2 space-y-1"
                      >
                        {demoAccounts.map((acc) => (
                          <motion.button
                            key={acc.email}
                            whileHover={{ x: 6, backgroundColor: "rgb(245 243 255)" }}
                            onClick={() => {
                              fillDemoAccount(acc);
                              setIsDemoOpen(false);
                            }}
                            className="w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full transition-transform group-hover:scale-150 ${
                                acc.color === 'indigo' ? 'bg-indigo-500' :
                                acc.color === 'purple' ? 'bg-purple-500' :
                                acc.color === 'orange' ? 'bg-orange-500' :
                                acc.color === 'emerald' ? 'bg-emerald-500' :
                                'bg-rose-500'
                              }`} />
                              <span className="font-bold text-slate-700 group-hover:text-indigo-600">Akses Demo {acc.label}</span>
                            </div>
                            <HiArrowRight className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all" size={16} />
                          </motion.button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${
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
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Alamat Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <HiMail size={20} />
                  </div>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none font-semibold transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="nama@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kata Sandi</label>
                  <button type="button" className="text-[10px] font-bold text-indigo-600 hover:underline">Lupa Sandi?</button>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <HiLockClosed size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-14 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none font-semibold transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                  >
                    {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
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

            <motion.div variants={itemVariants} className="pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium mb-3">Baru di BintangAi?</p>
              <button
                onClick={() => navigate('/auth/register')}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 font-bold transition-all text-slate-700"
              >
                Buat Akun Baru
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle decorative background for form */}
        <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>
    </div>
  );
};

export default Login;

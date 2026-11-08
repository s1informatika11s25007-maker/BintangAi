import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { login } from '@/features/auth/api/sessionApi';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiArrowRight, HiSparkles, HiChevronDown, HiFingerPrint, HiLightningBolt, HiArrowLeft } from 'react-icons/hi';

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
    const fetchDemoAccounts = async () => {
      setLoadingDemo(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, disability_type, student_password_hash')
          .or('is_demo_account.eq.true,role.in.(guru,ortu,siswa)')
          .not('email', 'is', null);

        if (error) throw error;

        if (data && data.length > 0) {
          const accountsMap = {};

          data.forEach(p => {
            let key = p.role;
            if (p.role === 'siswa' && p.disability_type) {
              key = p.disability_type;
            }

            if (!accountsMap[key]) {
              let label = p.role === 'guru' ? 'Guru' : p.role === 'ortu' ? 'Orang Tua' : `Siswa (${p.disability_type || 'Umum'})`;
              let icon = '👨‍🏫';
              let color = 'indigo';

              if (p.role === 'guru') {
                label = 'Guru'; icon = '👨‍🏫'; color = 'indigo';
              } else if (p.role === 'ortu') {
                label = 'Orang Tua'; icon = '👪'; color = 'rose';
              } else if (p.disability_type === 'tunanetra') {
                label = 'Tunanetra'; icon = '🦯'; color = 'purple';
              } else if (p.disability_type === 'tunarungu') {
                label = 'Tunarungu'; icon = '🤟'; color = 'orange';
              } else if (p.disability_type === 'tunawicara') {
                label = 'Tunawicara'; icon = '🗣️'; color = 'emerald';
              }

              accountsMap[key] = {
                label,
                email: p.email,
                pass: p.student_password_hash || 'demo123456',
                icon,
                color,
                full_name: p.full_name
              };
            }
          });

          const desiredOrder = ['guru', 'tunanetra', 'tunarungu', 'tunawicara', 'ortu'];
          const orderedAccounts = [];
          desiredOrder.forEach(k => {
            if (accountsMap[k]) orderedAccounts.push(accountsMap[k]);
          });

          Object.keys(accountsMap).forEach(k => {
            if (!desiredOrder.includes(k)) orderedAccounts.push(accountsMap[k]);
          });

          setDemoAccounts(orderedAccounts);
        }
      } catch (err) {
        console.error("Gagal memuat akun demo dari database:", err);
      } finally {
        setLoadingDemo(false);
      }
    };

    fetchDemoAccounts();
  }, []);

  const fillDemoAccount = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setMessage({ type: 'success', text: `Akun Demo (${acc.label} - ${acc.full_name}) terpilih! Klik Masuk Sekarang.` });
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="h-[100dvh] w-screen flex font-sans bg-slate-50 selection:bg-indigo-100 overflow-hidden">
      {/* Left Section - Hero Visual */}
      <div className="hidden lg:flex lg:w-[45%] h-full relative overflow-hidden bg-indigo-950 flex-col justify-between">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/85 via-indigo-900/25 to-indigo-950/50 z-10" />

        <div className="relative z-20 w-full h-full flex flex-col justify-between p-8 lg:p-12">
          {/* Top Section - Brand + Main Text */}
          <div className="space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 cursor-pointer group w-fit"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <span className="text-indigo-600 font-black text-xl">B</span>
              </div>
              <span className="text-xl font-black tracking-tight text-white drop-shadow-md">
                Bintang<span className="text-indigo-400">Ai</span>
              </span>
            </motion.div>

            <div className="max-w-md space-y-3">
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-900/80 backdrop-blur-md border border-white/20 text-indigo-100 text-[11px] font-bold uppercase tracking-widest shadow-md"
              >
                <HiLightningBolt className="text-indigo-400 animate-pulse" />
                Platform Belajar Masa Depan
              </motion.div>
              <motion.h2
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-lg"
              >
                Wujudkan Impian Tanpa <span className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-8">Batasan</span>.
              </motion.h2>
              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm lg:text-base text-indigo-100/90 font-medium leading-relaxed drop-shadow"
              >
                Platform inklusif yang dirancang untuk membantu setiap individu bersinar sesuai dengan keunikannya.
              </motion.p>
            </div>
          </div>

          {/* Bottom Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[10px] font-bold uppercase tracking-widest text-indigo-200/70 drop-shadow pt-4"
          >
            © 2026 BINTANGAI DIGITAL ECOSYSTEM
          </motion.div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-[55%] h-full flex flex-col justify-center items-center p-6 md:p-10 lg:p-12 overflow-y-auto relative">
        <div className="w-full max-w-[420px] my-auto">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs mb-4 transition-colors w-fit"
          >
            <HiArrowLeft /> Kembali ke Beranda
          </motion.button>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="space-y-1.5">
              <motion.h1 variants={itemVariants} className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Selamat Datang <span className="text-indigo-600">Kembali</span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-slate-500 text-sm font-medium">
                Silakan masuk untuk mengakses dashboard belajar Anda
              </motion.p>
            </div>

            {/* Quick Access Demo - Dynamic Database Accounts */}
            {demoAccounts.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-3 relative z-20">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Akses Demo (Database)</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="relative">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setIsDemoOpen(!isDemoOpen)}
                    className="w-full h-12 px-5 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-between group hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-50 transition-all text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <HiFingerPrint className="text-indigo-600 group-hover:animate-pulse" />
                      </div>
                      <span className="font-bold text-slate-700">Pilih Akun Demo dari Database</span>
                    </div>
                    <motion.div
                      animate={{ rotate: isDemoOpen ? 180 : 0 }}
                      className="text-slate-400 group-hover:text-indigo-600"
                    >
                      <HiChevronDown size={20} />
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
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 6, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.98 }}
                          className="absolute top-full left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-indigo-100/50 overflow-hidden z-40 p-2 space-y-1 max-h-[260px] overflow-y-auto"
                        >
                          {demoAccounts.map((acc) => (
                            <motion.button
                              key={acc.email}
                              whileHover={{ x: 4, backgroundColor: "rgb(245 243 255)" }}
                              onClick={() => {
                                fillDemoAccount(acc);
                                setIsDemoOpen(false);
                              }}
                              className="w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-2 h-2 rounded-full transition-transform group-hover:scale-150 ${
                                  acc.color === 'indigo' ? 'bg-indigo-500' :
                                  acc.color === 'purple' ? 'bg-purple-500' :
                                  acc.color === 'orange' ? 'bg-orange-500' :
                                  acc.color === 'emerald' ? 'bg-emerald-500' :
                                  'bg-rose-500'
                                }`} />
                                <div>
                                  <p className="font-bold text-slate-700 group-hover:text-indigo-600 text-xs leading-tight">
                                    {acc.label}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {acc.full_name} ({acc.email})
                                  </p>
                                </div>
                              </div>
                              <HiArrowRight className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all" size={14} />
                            </motion.button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
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
                    className="w-full pl-11 pr-5 py-3.5 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none font-semibold text-sm transition-all text-slate-900 placeholder:text-slate-400"
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
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none font-semibold text-sm transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
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
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Masuk Sekarang
                    <HiArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                  </>
                )}
              </motion.button>
            </motion.form>

            <motion.div variants={itemVariants} className="pt-4 border-t border-slate-100 text-center">
              <p className="text-slate-500 text-xs font-medium mb-2">Baru di BintangAi?</p>
              <button
                onClick={() => navigate('/auth/register')}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 font-bold text-xs transition-all text-slate-700"
              >
                Buat Akun Baru
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Subtle decorative background for form */}
        <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      </div>
    </div>
  );
};

export default Login;

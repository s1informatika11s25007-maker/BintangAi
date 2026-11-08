import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useAccessibilityStore } from '../../store/accessibilityStore';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('siswa');
  const [disabilityType, setDisabilityType] = useState('tidak_ada');
  const [slbName, setSlbName] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [classCode, setClassCode] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [demoAccounts, setDemoAccounts] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setProfile, fetchProfile } = useAuthStore();
  const { setModeFromProfile } = useAccessibilityStore();

  useEffect(() => {
    const fetchDemoAccounts = async () => {
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
              let color = 'bg-blue-50 text-blue-700';

              if (p.role === 'guru') {
                label = 'Guru'; icon = '👨‍🏫'; color = 'bg-blue-50 text-blue-700';
              } else if (p.role === 'ortu') {
                label = 'Orang Tua'; icon = '👪'; color = 'bg-rose-50 text-rose-700';
              } else if (p.disability_type === 'tunanetra') {
                label = 'Tunanetra'; icon = '🦯'; color = 'bg-purple-50 text-purple-700';
              } else if (p.disability_type === 'tunarungu') {
                label = 'Tunarungu'; icon = '🤟'; color = 'bg-orange-50 text-orange-700';
              } else if (p.disability_type === 'tunawicara') {
                label = 'Tunawicara'; icon = '🗣️'; color = 'bg-emerald-50 text-emerald-700';
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
      }
    };

    fetchDemoAccounts();
  }, []);

  const fillDemoAccount = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setMessage(`Akun Demo (${acc.label} - ${acc.full_name}) terpilih! Klik Masuk Sekarang.`);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'register') setIsLogin(false);
    if (mode === 'login') setIsLogin(true);
  }, [location.search]);

  useEffect(() => {
    setMessage(null);
  }, [isLogin]);

  useEffect(() => {
    if (role !== 'siswa') {
      setDisabilityType('tidak_ada');
    }
    setSlbName('');
    setClassLevel('');
    setClassCode('');
    setSubject('');
  }, [role]);

  const validateEmail = (email) => email.toLowerCase().trim().endsWith('@gmail.com');

  const generateClassCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();

    if (!validateEmail(cleanEmail)) {
      const errMsg = "Gunakan email @gmail.com";
      setMessage(errMsg);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (error) throw new Error("Email atau kata sandi salah");

        setUser(data.user);
        const profileData = await fetchProfile(data.user.id);

        if (!profileData) {
            const metadata = data.user.user_metadata || {};
            const fallbackProfile = {
                id: data.user.id,
                full_name: metadata.full_name || cleanEmail.split('@')[0],
                role: metadata.role || 'siswa',
                disability_type: metadata.disability_type || 'tidak_ada',
                slb_name: metadata.slb_name || '',
                class_level: metadata.class_level || '',
                class_code: metadata.class_code || '',
                subject: metadata.subject || '',
                xp: 0
            };
            setProfile(fallbackProfile);
            setModeFromProfile(fallbackProfile);
            navigate(fallbackProfile.role === 'guru' ? '/teacher/dashboard' : fallbackProfile.role === 'ortu' ? '/parent/dashboard' : '/student/dashboard');
        } else {
            setModeFromProfile(profileData);
            const targetPath = profileData.role === 'guru' ? '/teacher/dashboard' :
                               profileData.role === 'ortu' ? '/parent/dashboard' :
                               '/student/dashboard';
            navigate(targetPath);
        }

      } else {
        let linkedId = null;
        let finalClassCode = classCode;
        let finalSlbName = slbName;
        let finalClassLevel = classLevel;

        if (role === 'ortu') {
          if (!studentIdInput) throw new Error("ID Siswa tidak boleh kosong");
          const { data: child, error: childError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', studentIdInput.trim())
            .maybeSingle();

          if (childError || !child) throw new Error("ID Siswa tidak ditemukan!");
          linkedId = child.id;
        }

        if (role === 'guru') {
          finalClassCode = generateClassCode();
          if (!slbName) throw new Error("Nama SLB wajib diisi untuk Guru");
          if (!classLevel) throw new Error("Kelas yang diampu wajib diisi untuk Guru");
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: {
              full_name: fullName,
              role,
              disability_type: disabilityType,
              slb_name: finalSlbName,
              class_level: finalClassLevel,
              class_code: finalClassCode,
              subject: subject,
              linked_student_id: linkedId
            }
          }
        });

        if (error) throw new Error(error.message);

        if (data.user) {
          setMessage(role === 'guru' ? `Daftar berhasil! Kode Kelas Anda: ${finalClassCode}` : "Daftar berhasil! Silakan masuk.");
          setIsLogin(true);
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const subjects = [
    "Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA", "IPS", "Seni Budaya", "PJOK", "Lainnya"
  ];

  const classLevels = ["1 SD", "2 SD", "3 SD", "4 SD", "5 SD", "6 SD"];

  const labelStyles = "text-xs font-bold text-slate-700 mb-1.5 block ml-1 tracking-tight uppercase";
  const inputStyles = "w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/5 outline-none font-semibold text-sm transition-all text-slate-900 placeholder:text-slate-400 shadow-sm";

  return (
    <div className="h-[100dvh] w-screen flex font-sans bg-[#F8FAFC] selection:bg-indigo-100 overflow-hidden">
      {/* Left Sidebar */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-indigo-950 flex-col justify-between">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/1586981/pexels-photo-1586981.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.85
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/85 via-indigo-900/25 to-indigo-950/50 z-10" />

        <div className="relative z-20 w-full h-full flex flex-col justify-between p-8 lg:p-12">
          <div className="space-y-6">
            <div
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group w-fit"
            >
              <div className="w-12 h-12 bg-white/95 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all duration-300">
                <span className="text-indigo-600 font-black text-2xl">B</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                Bintang<span className="text-indigo-400">Ai</span>
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl space-y-3"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-900/80 text-white backdrop-blur-md shadow-xl border border-white/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
                </span>
                Platform Belajar Inklusif
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                Platform course berbasis <span className="text-indigo-400">AI</span> untuk anak <span className="text-indigo-400">Istimewa</span>.
              </h2>
              <p className="text-sm lg:text-base font-medium text-indigo-100/90 leading-relaxed drop-shadow">
                Belajar mandiri dengan visual adaptif, dan bimbingan AI yang memahami kebutuhan setiap bintang.
              </p>
            </motion.div>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200/70 drop-shadow pt-4">
            © 2026 BINTANGAI • EMPOWERING INCLUSIVITY
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-6 md:p-10 lg:p-12 overflow-y-auto bg-slate-50">
        <div className="w-full max-w-md my-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs mb-4 transition-colors w-fit"
          >
            ← Kembali ke Beranda
          </button>
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-1.5">
              {isLogin ? 'Selamat Datang Kembali' : 'Bergabung Bersama Kami'}
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              {isLogin ? 'Masuk untuk melanjutkan petualangan' : 'Mulai perjalanan belajarmu hari ini'}
            </p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-40 blur-2xl pointer-events-none" />

            {/* Akses Cepat Akun Demo Dinamis Database */}
            {isLogin && demoAccounts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 relative z-10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-[2px] flex-1 bg-slate-100" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Akun Demo (Database)</span>
                  <div className="h-[2px] flex-1 bg-slate-100" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto p-1">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemoAccount(acc)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border-2 border-transparent hover:border-indigo-200 hover:bg-white transition-all shadow-sm group ${acc.color}`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                        {acc.icon}
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-xs font-black truncate">{acc.label}</p>
                        <p className="text-[10px] opacity-75 font-bold truncate">{acc.full_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mb-6 p-4 rounded-2xl text-xs font-bold text-center relative z-10 ${
                    message.includes('berhasil') || message.includes('terpilih') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAuth} className="space-y-4 relative z-10">
              {!isLogin && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div>
                    <label className={labelStyles}>Nama Lengkap 👤</label>
                    <input
                      type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className={inputStyles} placeholder="Masukkan nama lengkap Anda"
                    />
                  </div>

                  <div>
                    <label className={labelStyles}>Peran Belajar 🎓</label>
                    <select
                      value={role} onChange={(e) => setRole(e.target.value)}
                      className={inputStyles}
                    >
                      <option value="siswa">Siswa Istimewa</option>
                      <option value="guru">Guru Pembimbing</option>
                      <option value="ortu">Orang Tua</option>
                    </select>
                  </div>

                  {role === 'guru' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className={labelStyles}>Nama Sekolah (SLB) 🏫</label>
                      <input
                        type="text" required value={slbName} onChange={(e) => setSlbName(e.target.value)}
                        className={inputStyles} placeholder="Contoh: SLB Negeri 1 Jakarta"
                      />
                    </motion.div>
                  )}

                  {role === 'siswa' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div>
                        <label className={labelStyles}>Kebutuhan Khusus ✨</label>
                        <select
                          value={disabilityType} onChange={(e) => setDisabilityType(e.target.value)}
                          className={inputStyles}
                        >
                          <option value="tidak_ada">Umum / Tanpa Hambatan</option>
                          <option value="tunanetra">Tunanetra (Hambatan Penglihatan)</option>
                          <option value="tunarungu">Tunarungu (Hambatan Pendengaran)</option>
                          <option value="tunawicara">Tunawicara (Hambatan Bicara)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelStyles}>Kode Kelas dari Guru 🔑</label>
                        <input
                          type="text" required value={classCode} onChange={(e) => setClassCode(e.target.value)}
                          className={inputStyles} placeholder="Masukkan 6 digit kode kelas"
                        />
                      </div>
                    </motion.div>
                  )}

                  {role === 'guru' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelStyles}>Kelas 📖</label>
                        <select
                          value={classLevel} onChange={(e) => setClassLevel(e.target.value)}
                          className={inputStyles} required
                        >
                          <option value="">Pilih Kelas</option>
                          {classLevels.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelStyles}>Mapel 🎯</label>
                        <select
                          value={subject} onChange={(e) => setSubject(e.target.value)}
                          className={inputStyles} required
                        >
                          <option value="">Pilih Mapel</option>
                          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              <div>
                <label className={labelStyles}>Alamat Email ✉️</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className={inputStyles} placeholder="nama@gmail.com"
                />
              </div>

              <div className="relative">
                <label className={labelStyles}>Kata Sandi 🔒</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputStyles} placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-2"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {role === 'ortu' && !isLogin && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className={labelStyles}>ID Unik Siswa (Anak) 🔗</label>
                  <input
                    type="text" required value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value)}
                    className={inputStyles} placeholder="Tempel ID profil anak Anda"
                  />
                </motion.div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </div>
                ) : (isLogin ? 'Masuk Sekarang' : 'Daftar Akun')}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-slate-100 pt-5 relative z-10">
              <p className="text-slate-500 font-medium text-xs mb-1">
                {isLogin ? 'Belum punya akun?' : 'Sudah memiliki akun?'}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 font-bold text-xs hover:text-indigo-700 transition-colors"
              >
                {isLogin ? 'Buat Akun Baru Gratis' : 'Masuk ke Akun Anda'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

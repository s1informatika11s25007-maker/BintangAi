import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import {
  HiUser, HiMail, HiLockClosed, HiAcademicCap,
  HiUserGroup, HiLink, HiArrowLeft, HiSparkles,
  HiChevronRight, HiEye, HiEyeOff
} from 'react-icons/hi';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('siswa');
  const [disabilityType, setDisabilityType] = useState('tidak_ada');
  const [slbName, setSlbName] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [classCode, setClassCode] = useState('');
  const [subject, setSubject] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const generateClassCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
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
        email: email.toLowerCase().trim(),
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

      if (error) throw error;

      if (data.user) {
        setMessage({
          type: 'success',
          text: role === 'guru' ? `Berhasil! Kode Kelas: ${finalClassCode}. Segera diarahkan...` : "Daftar berhasil! Silakan masuk."
        });
        setTimeout(() => navigate('/auth/login'), 2500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const subjects = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "IPA", "IPS", "Seni Budaya", "PJOK", "Lainnya"];
  const classLevels = ["1 SD", "2 SD", "3 SD", "4 SD", "5 SD", "6 SD"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white selection:bg-indigo-100 overflow-hidden">
      {/* Sidebar Visual */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden bg-slate-950">
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 2 }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />

        <div className="relative z-20 w-full flex flex-col justify-between p-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer w-fit"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <span className="text-white font-black text-xl">B</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">BintangAi</span>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              <HiSparkles className="animate-pulse" /> Mulai Petualangan
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-black text-white leading-tight"
            >
              Setiap Anak Adalah <span className="text-indigo-500">Bintang</span>.
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-slate-400 font-medium"
            >
              Bergabunglah dengan ribuan siswa dan guru dalam menciptakan lingkungan belajar yang setara.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 text-slate-500 text-xs font-bold"
          >
            <span>PRIVASI</span>
            <span>SYARAT</span>
            <span>BANTUAN</span>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-[60%] flex flex-col bg-slate-50/50">
        <div className="p-6 md:p-12 max-w-2xl mx-auto w-full">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate('/auth/login')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-12 transition-colors"
          >
            <HiArrowLeft /> Kembali ke Masuk
          </motion.button>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Daftar Akun Baru</h1>
              <p className="text-slate-500 font-medium mt-2">Pilih peran dan lengkapi data diri Anda</p>
            </div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <motion.div variants={itemVariants} className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">1</div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Informasi Dasar</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                    <input
                      type="text" required placeholder="Nama Lengkap"
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none font-semibold transition-all shadow-sm"
                    />
                  </div>
                  <div className="relative group">
                    <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                    <input
                      type="email" required placeholder="Email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none font-semibold transition-all shadow-sm"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Role Selection */}
              <motion.div variants={itemVariants} className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">2</div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Pilih Peran</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'siswa', label: 'Siswa', icon: <HiAcademicCap /> },
                    { id: 'guru', label: 'Guru', icon: <HiUserGroup /> },
                    { id: 'ortu', label: 'Ortu', icon: <HiLink /> },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 font-bold text-sm ${
                        role === r.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <span className="text-2xl">{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Conditional Fields */}
              <AnimatePresence mode="popLayout">
                {role === 'siswa' && (
                  <motion.div
                    key="siswa-fields"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Tipe Disabilitas</label>
                      <select
                        value={disabilityType} onChange={(e) => setDisabilityType(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none font-semibold transition-all shadow-sm"
                      >
                        <option value="tidak_ada">Umum / Tanpa Hambatan</option>
                        <option value="tunanetra">Tunanetra</option>
                        <option value="tunarungu">Tunarungu</option>
                        <option value="tunawicara">Tunawicara</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Kode Kelas (Wajib)</label>
                      <input
                        type="text" required placeholder="Contoh: X8J2K1"
                        value={classCode} onChange={(e) => setClassCode(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none font-semibold transition-all shadow-sm"
                      />
                    </div>
                  </motion.div>
                )}

                {role === 'guru' && (
                  <motion.div
                    key="guru-fields"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <input
                      type="text" required placeholder="Nama Sekolah/SLB"
                      value={slbName} onChange={(e) => setSlbName(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none font-semibold transition-all shadow-sm"
                    />
                    <select
                      value={classLevel} onChange={(e) => setClassLevel(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none font-semibold transition-all shadow-sm"
                    >
                      <option value="">Pilih Kelas</option>
                      {classLevels.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                    </select>
                    <select
                      value={subject} onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none font-semibold transition-all shadow-sm"
                    >
                      <option value="">Pilih Mapel</option>
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </motion.div>
                )}

                {role === 'ortu' && (
                  <motion.div
                    key="ortu-fields"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2"
                  >
                    <input
                      type="text" required placeholder="ID Unik Siswa (Tanyakan pada anak/guru)"
                      value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none font-semibold transition-all shadow-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security */}
              <motion.div variants={itemVariants} className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">3</div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Keamanan</h3>
                </div>
                <div className="relative group">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                  <input
                    type={showPassword ? "text" : "password"} required placeholder="Buat Kata Sandi (Min. 8 Karakter)"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-indigo-600 outline-none font-semibold transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2 pt-4">
                <button
                  type="submit" disabled={loading}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Daftar Sekarang
                      <HiChevronRight className="text-2xl group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.p variants={itemVariants} className="text-center text-slate-400 text-xs font-medium">
              Dengan mendaftar, Anda menyetujui <span className="text-slate-600 underline">Kebijakan Privasi</span> dan <span className="text-slate-600 underline">Ketentuan Layanan</span> kami.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;

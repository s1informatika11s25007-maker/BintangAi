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
        const candidateId = studentIdInput.trim();
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidateId)) throw new Error("Masukkan ID siswa dengan format yang benar. Tautan akan diverifikasi admin.");
        linkedId = candidateId;
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
          text: role === 'siswa'
            ? "Pendaftaran siswa berhasil. Silakan masuk."
            : "Pendaftaran berhasil. Permintaan peran guru/orang tua dan tautan kelas akan diverifikasi admin sebelum akses diaktifkan."
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
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="h-screen max-h-screen flex font-sans bg-white selection:bg-indigo-100 overflow-hidden">
      {/* Sidebar Visual (Tampilan Jelas & Responsif) */}
      <div className="hidden lg:flex lg:w-[38%] h-full relative overflow-hidden bg-slate-950 shrink-0">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.75 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/35 to-slate-950/75 z-10" />

        <div className="relative z-20 w-full h-full flex flex-col justify-between p-8 lg:p-12">
          {/* Top Container: Logo & Teks Tersusun Rapi di Bagian Atas */}
          <div className="space-y-6 max-w-sm">
            {/* Logo BintangAi Konsisten */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3.5 cursor-pointer group w-fit"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-black text-xl">B</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
                Bintang<span className="text-indigo-400">Ai</span>
              </span>
            </motion.div>

            {/* Teks Terletak Di Atas Rapi (Tidak di Tengah Gambar) */}
            <div className="space-y-3.5 pt-1">
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 backdrop-blur-md border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                <HiSparkles className="animate-pulse text-indigo-400" /> Mulai Petualangan
              </motion.div>

              <motion.h2
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-md"
              >
                Setiap Anak Adalah <span className="text-indigo-400">Bintang</span>.
              </motion.h2>

              <motion.p
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-slate-200 font-medium leading-relaxed drop-shadow-sm"
              >
                Bergabunglah dengan ribuan siswa dan guru dalam menciptakan lingkungan belajar yang setara.
              </motion.p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 text-slate-400 text-[11px] font-bold tracking-wider drop-shadow-sm"
          >
            <span>PRIVASI</span>
            <span>SYARAT</span>
            <span>BANTUAN</span>
          </motion.div>
        </div>
      </div>

      {/* Main Content Form (Presisi 100% Layar Tanpa Scroll di Desktop/Tablet) */}
      <div className="w-full lg:w-[62%] h-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-slate-50/50 overflow-y-auto lg:overflow-hidden">
        <div className="max-w-[540px] mx-auto w-full">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate('/auth/login')}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs mb-3 lg:mb-4 transition-colors"
          >
            <HiArrowLeft /> Kembali ke Masuk
          </motion.button>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4 lg:space-y-5"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Daftar Akun Baru</h1>
              <p className="text-slate-500 font-medium text-xs mt-1">Pilih peran dan lengkapi data diri Anda</p>
            </div>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2.5 ${
                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              {/* Basic Info */}
              <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">1</div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Informasi Dasar</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="relative group">
                    <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                    <input
                      type="text" required placeholder="Nama Lengkap"
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-600 outline-none font-semibold text-xs transition-all shadow-sm"
                    />
                  </div>
                  <div className="relative group">
                    <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                    <input
                      type="email" required placeholder="Email (@gmail.com)"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-600 outline-none font-semibold text-xs transition-all shadow-sm"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Role Selection */}
              <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">2</div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Pilih Peran</h3>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'siswa', label: 'Siswa', icon: <HiAcademicCap /> },
                    { id: 'guru', label: 'Guru', icon: <HiUserGroup /> },
                    { id: 'ortu', label: 'Ortu', icon: <HiLink /> },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1 font-bold text-xs ${
                        role === r.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{r.icon}</span>
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2.5"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tipe Disabilitas</label>
                      <select
                        value={disabilityType} onChange={(e) => setDisabilityType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-600 outline-none font-semibold text-xs transition-all shadow-sm"
                      >
                        <option value="tidak_ada">Umum / Tanpa Hambatan</option>
                        <option value="tunanetra">Tunanetra</option>
                        <option value="tunarungu">Tunarungu</option>
                        <option value="tunawicara">Tunawicara</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kode Kelas (Wajib)</label>
                      <input
                        type="text" required placeholder="Contoh: X8J2K1"
                        value={classCode} onChange={(e) => setClassCode(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-600 outline-none font-semibold text-xs transition-all shadow-sm"
                      />
                    </div>
                  </motion.div>
                )}

                {role === 'guru' && (
                  <motion.div
                    key="guru-fields"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-2.5"
                  >
                    <input
                      type="text" required placeholder="Nama Sekolah/SLB"
                      value={slbName} onChange={(e) => setSlbName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-600 outline-none font-semibold text-xs transition-all shadow-sm"
                    />
                    <select
                      value={classLevel} onChange={(e) => setClassLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-600 outline-none font-semibold text-xs transition-all shadow-sm"
                    >
                      <option value="">Pilih Kelas</option>
                      {classLevels.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                    </select>
                    <select
                      value={subject} onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-600 outline-none font-semibold text-xs transition-all shadow-sm"
                    >
                      <option value="">Pilih Mapel</option>
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </motion.div>
                )}

                {role === 'ortu' && (
                  <motion.div
                    key="ortu-fields"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2"
                  >
                    <input
                      type="text" required placeholder="ID Unik Siswa (Tanyakan pada anak/guru)"
                      value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-600 outline-none font-semibold text-xs transition-all shadow-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security */}
              <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">3</div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Keamanan</h3>
                </div>
                <div className="relative group">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" />
                  <input
                    type={showPassword ? "text" : "password"} required placeholder="Buat Kata Sandi (Min. 8 Karakter)"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-indigo-600 outline-none font-semibold text-xs transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <HiEyeOff className="text-lg" /> : <HiEye className="text-lg" />}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2 pt-1">
                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 lg:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Daftar Sekarang
                      <HiChevronRight className="text-xl group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.p variants={itemVariants} className="text-center text-slate-400 text-[10px] font-medium">
              Dengan mendaftar, Anda menyetujui <span className="text-slate-600 underline">Kebijakan Privasi</span> dan <span className="text-slate-600 underline">Ketentuan Layanan</span> kami.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;

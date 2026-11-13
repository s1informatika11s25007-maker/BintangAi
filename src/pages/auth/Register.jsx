import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import {
  HiAcademicCap,
  HiArrowLeft,
  HiChevronRight,
  HiEye,
  HiEyeOff,
  HiLink,
  HiLockClosed,
  HiMail,
  HiUser,
  HiUserGroup,
} from 'react-icons/hi';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('siswa');
  const [disabilityType, setDisabilityType] = useState('tidak_ada');
  const [slbName, setSlbName] = useState('');
  const [classLevel, setClassLevel] = useState('4 SD');
  const [classCode, setClassCode] = useState('');
  const [subject, setSubject] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const generateClassCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let linkedId = null;
      let finalClassCode = classCode.trim().toUpperCase();
      const finalSlbName = slbName.trim();
      let finalClassLevel = classLevel;

      if (!fullName.trim()) throw new Error('Nama lengkap wajib diisi.');
      if (password.length < 8) throw new Error('Kata sandi minimal 8 karakter.');

      if (role === 'siswa') {
        if (!classLevel) throw new Error('Tingkat kelas siswa (1 SD–6 SD) wajib dipilih.');
        if (!finalClassCode) throw new Error('Kode kelas wajib diisi untuk siswa.');
      }

      if (role === 'ortu') {
        if (!studentIdInput.trim()) throw new Error('ID Siswa tidak boleh kosong.');
        const { data: child, error: childError } = await supabase
          .from('profiles')
          .select('id, class_level')
          .eq('id', studentIdInput.trim())
          .maybeSingle();

        if (childError || !child) throw new Error('ID Siswa tidak ditemukan. Periksa kembali ID yang diberikan oleh anak atau guru.');
        linkedId = child.id;
        if (child.class_level) finalClassLevel = child.class_level;
      }

      if (role === 'guru') {
        finalClassCode = generateClassCode();
        if (!finalSlbName) throw new Error('Nama sekolah/SLB wajib diisi untuk guru.');
        if (!classLevel) throw new Error('Kelas yang diampu wajib dipilih.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
            disability_type: disabilityType,
            slb_name: finalSlbName,
            class_level: finalClassLevel,
            class_code: finalClassCode,
            subject,
            linked_student_id: linkedId,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setMessage({
          type: 'success',
          text: role === 'guru'
            ? `Pendaftaran berhasil. Kode kelas Anda: ${finalClassCode}. Silakan masuk setelah proses pendaftaran selesai.`
            : 'Pendaftaran berhasil. Silakan masuk untuk melanjutkan.',
        });
        window.setTimeout(() => navigate('/auth/login'), 2500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error?.message || 'Pendaftaran gagal. Silakan coba kembali.' });
    } finally {
      setLoading(false);
    }
  };

  const subjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'Seni Budaya', 'PJOK', 'Lainnya'];
  const classLevels = ['1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'];
  const inputClass = 'min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100';
  const labelClass = 'mb-1.5 block text-xs font-bold text-slate-700';

  const roleOptions = [
    { id: 'siswa', label: 'Siswa', helper: 'Belajar', icon: <HiAcademicCap className="text-2xl" /> },
    { id: 'guru', label: 'Guru', helper: 'Mengajar', icon: <HiUserGroup className="text-2xl" /> },
    { id: 'ortu', label: 'Orang tua', helper: 'Mendampingi', icon: <HiLink className="text-2xl" /> },
  ];

  return (
    <main className="min-h-screen w-full bg-[#F4F8FF] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 lg:flex">
      {/* Foto kiri asli tetap dipakai agar halaman daftar serasi dengan halaman masuk. */}
      <aside className="relative isolate flex min-h-[250px] w-full flex-col justify-between overflow-hidden bg-blue-950 px-6 py-7 text-white sm:min-h-[290px] lg:sticky lg:top-0 lg:h-screen lg:min-h-screen lg:w-[40%] lg:px-12 lg:py-10">
        <motion.div
          initial={{ scale: 1.08, opacity: 0.45 }}
          animate={{ scale: 1, opacity: 0.72 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80")' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#08275A]/95 via-[#0B438A]/75 to-[#1677C8]/70" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
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
            <HiAcademicCap className="text-sky-200" /> Mulai perjalanan belajar
          </motion.div>
          <motion.h1
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="max-w-lg text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl"
          >
            Setiap anak punya cara untuk <span className="text-sky-200">bersinar.</span>
          </motion.h1>
          <motion.p
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="max-w-md text-sm font-medium leading-7 text-blue-50/90 sm:text-base"
          >
            Bergabung dengan ruang belajar inklusif BintangAi. Siswa, guru, dan orang tua saling mendukung perjalanan belajar yang lebih mandiri.
          </motion.p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-white/90">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">Kelas 1–6 SD</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">Belajar inklusif</span>
          </div>
        </div>

        <div className="relative hidden border-t border-white/20 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-100/75 lg:block">
          © 2026 BintangAi · Belajar tanpa hambatan
        </div>
      </aside>

      {/* Form pendaftaran - Full width & height edge-to-edge sampai ujung atas, kanan, dan bawah */}
      <section className="relative flex flex-1 flex-col justify-center overflow-y-auto bg-white px-6 py-8 sm:px-10 md:px-14 lg:h-full lg:px-16 lg:py-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-0 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 w-full max-w-3xl mx-auto my-auto space-y-6"
        >
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="mb-6 inline-flex items-center gap-2 rounded-lg text-xs font-bold text-slate-500 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            <HiArrowLeft /> Kembali ke masuk
          </button>

          <div className="mb-7 space-y-2">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600">Buat akun BintangAi</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Mulai <span className="text-blue-700">belajar bersama.</span></h2>
            <p className="text-sm leading-6 text-slate-500">Lengkapi data berikut agar pengalaman belajar dan pendampingan sesuai dengan peran Anda.</p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={`${message.type}-${message.text}`}
                initial={{ opacity: 0, y: -7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -7 }}
                role={message.type === 'error' ? 'alert' : 'status'}
                className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold leading-5 ${
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

          <form onSubmit={handleRegister} className="space-y-6">
            <section className="space-y-3" aria-labelledby="basic-info-heading">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-blue-700">1</span>
                <div>
                  <h3 id="basic-info-heading" className="text-sm font-extrabold text-slate-800">Informasi dasar</h3>
                  <p className="text-xs text-slate-400">Data untuk mengenali akun Anda.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="register-name" className={labelClass}>Nama lengkap</label>
                  <div className="relative">
                    <HiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-name"
                      type="text"
                      autoComplete="name"
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Nama lengkap"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="register-email" className={labelClass}>Alamat email</label>
                  <div className="relative">
                    <HiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="nama@email.com"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3" aria-labelledby="role-heading">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-blue-700">2</span>
                <div>
                  <h3 id="role-heading" className="text-sm font-extrabold text-slate-800">Pilih peran</h3>
                  <p className="text-xs text-slate-400">Pilih cara Anda menggunakan BintangAi.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {roleOptions.map((option) => {
                  const selected = role === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setRole(option.id)}
                      className={`flex min-h-[106px] flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
                        selected
                          ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-sm shadow-blue-100'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50/50'
                      }`}
                    >
                      <span className={selected ? 'text-blue-700' : 'text-slate-400'}>{option.icon}</span>
                      <span className="text-xs font-extrabold sm:text-sm">{option.label}</span>
                      <span className="text-[10px] font-medium text-slate-400">{option.helper}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <AnimatePresence mode="popLayout">
              {role === 'siswa' && (
                <motion.section
                  key="student-fields"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
                  aria-labelledby="student-details-heading"
                >
                  <div>
                    <h3 id="student-details-heading" className="text-sm font-extrabold text-blue-900">Profil siswa</h3>
                    <p className="text-xs leading-5 text-blue-700/75">Pilih kelas dan kebutuhan aksesibilitas agar pengalaman belajar dapat disesuaikan.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label htmlFor="student-class" className={labelClass}>Tingkat kelas</label>
                      <select id="student-class" required value={classLevel} onChange={(event) => setClassLevel(event.target.value)} className={inputClass}>
                        {classLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="student-disability" className={labelClass}>Kebutuhan akses</label>
                      <select id="student-disability" value={disabilityType} onChange={(event) => setDisabilityType(event.target.value)} className={inputClass}>
                        <option value="tidak_ada">Umum</option>
                        <option value="tunanetra">Tunanetra</option>
                        <option value="tunarungu">Tunarungu</option>
                        <option value="tunawicara">Tunawicara</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="student-class-code" className={labelClass}>Kode kelas</label>
                      <input
                        id="student-class-code"
                        type="text"
                        required
                        value={classCode}
                        onChange={(event) => setClassCode(event.target.value.toUpperCase())}
                        placeholder="Contoh: X8J2K1"
                        autoCapitalize="characters"
                        className={`${inputClass} uppercase`}
                      />
                    </div>
                  </div>
                </motion.section>
              )}

              {role === 'guru' && (
                <motion.section
                  key="teacher-fields"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
                  aria-labelledby="teacher-details-heading"
                >
                  <div>
                    <h3 id="teacher-details-heading" className="text-sm font-extrabold text-blue-900">Profil guru</h3>
                    <p className="text-xs leading-5 text-blue-700/75">Kode kelas akan dibuat otomatis setelah pendaftaran berhasil.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label htmlFor="teacher-school" className={labelClass}>Nama sekolah/SLB</label>
                      <input id="teacher-school" type="text" required value={slbName} onChange={(event) => setSlbName(event.target.value)} placeholder="Nama sekolah" className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="teacher-class" className={labelClass}>Kelas yang diampu</label>
                      <select id="teacher-class" required value={classLevel} onChange={(event) => setClassLevel(event.target.value)} className={inputClass}>
                        <option value="">Pilih kelas</option>
                        {classLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="teacher-subject" className={labelClass}>Mata pelajaran</label>
                      <select id="teacher-subject" value={subject} onChange={(event) => setSubject(event.target.value)} className={inputClass}>
                        <option value="">Pilih mapel</option>
                        {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.section>
              )}

              {role === 'ortu' && (
                <motion.section
                  key="parent-fields"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
                  aria-labelledby="parent-details-heading"
                >
                  <div>
                    <h3 id="parent-details-heading" className="text-sm font-extrabold text-blue-900">Hubungkan akun anak</h3>
                    <p className="text-xs leading-5 text-blue-700/75">Masukkan ID unik siswa yang diberikan oleh anak atau guru.</p>
                  </div>
                  <div>
                    <label htmlFor="parent-student-id" className={labelClass}>ID unik siswa</label>
                    <input
                      id="parent-student-id"
                      type="text"
                      required
                      value={studentIdInput}
                      onChange={(event) => setStudentIdInput(event.target.value)}
                      placeholder="Masukkan ID siswa"
                      className={inputClass}
                    />
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <section className="space-y-3" aria-labelledby="security-heading">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-sm font-black text-blue-700">3</span>
                <div>
                  <h3 id="security-heading" className="text-sm font-extrabold text-slate-800">Keamanan akun</h3>
                  <p className="text-xs text-slate-400">Buat kata sandi minimal 8 karakter.</p>
                </div>
              </div>
              <div>
                <label htmlFor="register-password" className={labelClass}>Kata sandi</label>
                <div className="relative">
                  <HiLockClosed className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimal 8 karakter"
                    className={`${inputClass} pl-11 pr-12`}
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
            </section>

            <button
              type="submit"
              disabled={loading}
              className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-blue-700 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-xl hover:shadow-blue-700/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />Memproses pendaftaran…</>
              ) : (
                <>Buat akun BintangAi <HiChevronRight className="text-lg transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-blue-50 pt-5 text-center">
            <p className="text-sm text-slate-500">Sudah memiliki akun?</p>
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-extrabold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            >
              Masuk ke akun <HiChevronRight />
            </button>
          </div>
          <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">Dengan mendaftar, Anda menyatakan bahwa informasi yang diberikan benar dan dapat digunakan untuk membuat akun BintangAi.</p>
        </motion.div>
      </section>
    </main>
  );
};

export default Register;

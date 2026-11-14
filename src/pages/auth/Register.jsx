import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import AuthHeaderAccessibilityBar from '@/components/ui/AuthHeaderAccessibilityBar';
import {
  HiAcademicCap,
  HiArrowLeft,
  HiArrowRight,
  HiCheckCircle,
  HiChevronRight,
  HiExclamationCircle,
  HiEye,
  HiEyeOff,
  HiHeart,
  HiLink,
  HiLockClosed,
  HiMail,
  HiSparkles,
  HiUser,
  HiUserGroup,
  HiVolumeUp
} from 'react-icons/hi';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('siswa');
  const [disabilityType, setDisabilityType] = useState('tunanetra');
  const [slbName, setSlbName] = useState('');
  const [classLevel, setClassLevel] = useState('4 SD');
  const [classCode, setClassCode] = useState('');
  const [subject, setSubject] = useState('Matematika');
  const [studentIdInput, setStudentIdInput] = useState('');

  // Parent Student Verification State
  const [checkingStudent, setCheckingStudent] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [studentCheckError, setStudentCheckError] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();
  const { setModeFromProfile } = useAccessibilityStore();
  const { speak, stopSpeaking } = useVoice();

  const generateClassCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  // Realtime parent child lookup in database
  const checkChildProfile = useCallback(async (studentId) => {
    if (!studentId || studentId.trim().length < 5) {
      setVerifiedStudent(null);
      setStudentCheckError(null);
      return;
    }

    setCheckingStudent(true);
    setStudentCheckError(null);
    try {
      const cleanId = studentId.trim();
      let query = supabase
        .from('profiles')
        .select('id, full_name, class_level, disability_type, role, short_id')
        .eq('role', 'siswa');

      if (cleanId.length === 6 && /^\d+$/.test(cleanId)) {
        query = query.eq('short_id', cleanId);
      } else {
        query = query.or(`id.eq.${cleanId},short_id.eq.${cleanId}`);
      }

      const { data: child, error } = await query.maybeSingle();

      if (error || !child) {
        setVerifiedStudent(null);
        setStudentCheckError('ID Belajar Siswa 6 Digit tidak ditemukan. Periksa kembali ID anak/guru.');
      } else {
        setVerifiedStudent(child);
        setStudentCheckError(null);
        speak(`Anak ditemukan: ${child.full_name}, ${child.class_level || 'SD'}.`, 1.0, true);
      }
    } catch (err) {
      setStudentCheckError('Gagal memverifikasi ID siswa.');
    } finally {
      setCheckingStudent(false);
    }
  }, [speak]);

  useEffect(() => {
    if (role === 'ortu' && studentIdInput.trim()) {
      const timer = setTimeout(() => {
        checkChildProfile(studentIdInput.trim());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [role, studentIdInput, checkChildProfile]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setMessage(null);

    const names = {
      siswa: 'Siswa Istimewa untuk belajar mandiri',
      guru: 'Guru Pembimbing untuk kelola kelas',
      ortu: 'Orang Tua untuk mendampingi anak'
    };
    speak(`Peran dipilih: ${names[newRole] || newRole}`, 1.0, true);
  };

  const handleDisabilityChange = (type) => {
    setDisabilityType(type);

    const labels = {
      tunanetra: 'Tunanetra, fitur suara audio dan kontras tinggi.',
      tunarungu: 'Tunarungu, fitur teks visual dan subtitle.',
      tunawicara: 'Tunawicara, fitur gambar dan isyarat cepat.',
      tidak_ada: 'Mode Umum tanpa hambatan khusus.'
    };
    speak(labels[type] || 'Kebutuhan khusus dipilih.', 1.0, true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    stopSpeaking();

    try {
      let linkedId = null;
      let finalClassCode = classCode.trim().toUpperCase();
      const finalSlbName = slbName.trim();
      let finalClassLevel = classLevel;

      if (!fullName.trim()) throw new Error('Nama lengkap wajib diisi.');
      if (!email.trim()) throw new Error('Alamat email wajib diisi.');
      if (password.length < 8) throw new Error('Kata sandi minimal 8 karakter.');

      if (role === 'siswa') {
        if (!classLevel) throw new Error('Tingkat kelas siswa (1 SD–6 SD) wajib dipilih.');
        if (!finalClassCode) throw new Error('Kode kelas dari guru wajib diisi.');
      }

      if (role === 'ortu') {
        if (!studentIdInput.trim()) throw new Error('ID Siswa anak Anda wajib diisi.');
        if (studentCheckError || !verifiedStudent) {
          throw new Error('ID Siswa tidak valid atau tidak ditemukan di database.');
        }
        linkedId = verifiedStudent.id;
        if (verifiedStudent.class_level) finalClassLevel = verifiedStudent.class_level;
      }

      if (role === 'guru') {
        finalClassCode = generateClassCode();
        if (!finalSlbName) throw new Error('Nama sekolah atau SLB wajib diisi untuk Guru.');
        if (!classLevel) throw new Error('Tingkat kelas yang diampu wajib dipilih.');
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
        const successText = role === 'guru'
          ? `Pendaftaran berhasil! Kode kelas Anda: ${finalClassCode}. Mengalihkan ke halaman masuk...`
          : 'Pendaftaran akun BintangAi berhasil! Mengalihkan ke halaman masuk...';

        setMessage({
          type: 'success',
          text: successText,
        });

        speak(successText, 1.0, true);

        setTimeout(() => {
          navigate('/auth/login');
        }, 2200);
      }
    } catch (err) {
      const errMsg = err?.message || 'Pendaftaran gagal. Periksa data yang Anda masukkan.';
      setMessage({ type: 'error', text: errMsg });
      speak(errMsg, 1.0, true);
    } finally {
      setLoading(false);
    }
  };

  const subjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'Seni Budaya', 'PJOK', 'Lainnya'];
  const classLevels = [
    { code: '1 SD', emoji: '🎈', name: 'Kelas 1' },
    { code: '2 SD', emoji: '🎨', name: 'Kelas 2' },
    { code: '3 SD', emoji: '🚀', name: 'Kelas 3' },
    { code: '4 SD', emoji: '📚', name: 'Kelas 4' },
    { code: '5 SD', emoji: '🧪', name: 'Kelas 5' },
    { code: '6 SD', emoji: '🏆', name: 'Kelas 6' },
  ];

  const roleOptions = [
    {
      id: 'siswa',
      label: 'Siswa Istimewa',
      helper: 'Belajar & Bermain',
      badge: 'SD Kelas 1–6',
      icon: '🎓',
      color: 'border-blue-500 bg-blue-50 text-blue-900',
    },
    {
      id: 'guru',
      label: 'Guru Pembimbing',
      helper: 'Kelola Kelas & Modul',
      badge: 'Pengajar SLB/SD',
      icon: '👨‍🏫',
      color: 'border-indigo-500 bg-indigo-50 text-indigo-900',
    },
    {
      id: 'ortu',
      label: 'Orang Tua',
      helper: 'Dampingi & Pantau Anak',
      badge: 'Orang Tua / Wali',
      icon: '👪',
      color: 'border-rose-500 bg-rose-50 text-rose-900',
    },
  ];

  const disabilityOptions = [
    {
      id: 'tunanetra',
      label: 'Tunanetra',
      desc: 'Fitur Suara Audio Reader & Kontras Tinggi',
      icon: '🦯',
      color: 'border-purple-400 bg-purple-50 text-purple-950',
    },
    {
      id: 'tunarungu',
      label: 'Tunarungu',
      desc: 'Fitur Visual Subtitle & Indikator Jelas',
      icon: '🤟',
      color: 'border-cyan-400 bg-cyan-50 text-cyan-950',
    },
    {
      id: 'tunawicara',
      label: 'Tunawicara',
      desc: 'Fitur Gambar Isyarat & Pilihan Cepat',
      icon: '💬',
      color: 'border-emerald-400 bg-emerald-50 text-emerald-950',
    },
    {
      id: 'tidak_ada',
      label: 'Umum / Tanpa Hambatan',
      desc: 'Standar Pembelajaran SD',
      icon: '🌟',
      color: 'border-slate-300 bg-slate-50 text-slate-900',
    },
  ];

  // Password strength meter
  const getPasswordStrength = () => {
    if (!password) return { percent: 0, label: 'Kosong', color: 'bg-slate-200' };
    if (password.length < 6) return { percent: 30, label: 'Sangat Lemah 🔴', color: 'bg-rose-500' };
    if (password.length < 8) return { percent: 60, label: 'Sedang (Kurang 8 Karakter) 🟡', color: 'bg-amber-500' };
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) return { percent: 100, label: 'Sangat Kuat & Aman! 🟢', color: 'bg-emerald-500' };
    return { percent: 80, label: 'Kuat 🟢', color: 'bg-emerald-400' };
  };

  const pwdStrength = getPasswordStrength();

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-100 font-sans text-slate-900 selection:bg-indigo-100">
      {/* Universal Accessibility Bar */}
      <AuthHeaderAccessibilityBar
        spokenTitle="Halaman Pendaftaran BintangAi"
        spokenText="Selamat datang di halaman pendaftaran BintangAi. Silakan pilih peranmu sebagai siswa, guru, atau orang tua, lalu isi informasi data dirimu."
      />

      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Left Visual Branding Side */}
        <aside className="relative isolate flex min-h-[300px] lg:min-h-full w-full lg:w-[40%] flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-950 to-indigo-900 px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-10 shadow-2xl">
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80")' }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute -bottom-28 -left-16 -z-10 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />

          {/* Top Logo */}
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
                  Pendaftaran Inklusif
                </span>
              </div>
            </button>
          </div>

          {/* Mascot "Kak Bintang" Banner */}
          <div className="relative my-8 lg:my-auto space-y-5">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl bg-white/10 p-6 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-2xl text-indigo-950 shadow-md">
                  ⭐
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Mulai Belajar Bersama Kak Bintang</h3>
                  <p className="text-xs text-indigo-200 font-medium">Setiap anak punya cara untuk bersinar!</p>
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-950/70 p-4 border border-white/10 text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                "Pilih peranmu, tentukan kebutuhan belajarmu, dan nikmati materi SD yang seru dan mudah dipahami!"
              </div>

              <button
                type="button"
                onClick={() => speak("Setiap anak punya cara untuk bersinar. Bergabung bersama BintangAi untuk pengalaman belajar inklusif yang disesuaikan dengan dirimu!", 1.0, true)}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-indigo-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <HiVolumeUp className="text-base" /> Dengarkan Kak Bintang
              </button>
            </motion.div>
          </div>

          <div className="relative border-t border-white/15 pt-4 text-xs text-indigo-200 font-semibold flex justify-between items-center">
            <span>© 2026 BintangAi • SD Inklusif</span>
            <span className="inline-flex items-center gap-1 text-amber-300">
              <HiHeart className="text-rose-400" /> Belajar Tanpa Hambatan
            </span>
          </div>
        </aside>

        {/* Right Form Interaction Panel */}
        <section className="flex-1 flex flex-col justify-center overflow-y-auto bg-white px-6 py-8 sm:px-10 md:px-14 lg:px-16 lg:py-12">
          <div className="w-full max-w-3xl mx-auto space-y-8 my-auto">
            {/* Navigation Header */}
            <div>
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="mb-4 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
              >
                <HiArrowLeft className="text-sm" /> Sudah punya akun? Masuk
              </button>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Buat Akun <span className="text-indigo-600">BintangAi</span>
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Lengkapi langkah berikut untuk pengalaman belajar inklusif yang disesuaikan.
              </p>
            </div>

            {/* Visual Step Progress Indicator */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  currentStep === 1
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                <span>1. Peran & Kebutuhan</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  currentStep === 2
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                <span>2. Detail Profil SD</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  currentStep === 3
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                <span>3. Data & Keamanan</span>
              </button>
            </div>

            {/* Alert Message */}
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
                  <button
                    type="button"
                    onClick={() => speak(message.text, 1.0, true)}
                    className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-900"
                    title="Dengarkan Pesan Ini"
                  >
                    <HiVolumeUp className="text-lg" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Multi-step Form */}
            <form onSubmit={handleRegister} className="space-y-6">
              {/* STEP 1: ROLE & DISABILITY SELECTION */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Role Selector */}
                  <div className="space-y-3">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Langkah 1A: Pilih Peran Pengguna <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {roleOptions.map((opt) => {
                        const isSelected = role === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleRoleChange(opt.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/70 shadow-lg ring-2 ring-indigo-500/20'
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-3xl">{opt.icon}</span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                {opt.badge}
                              </span>
                            </div>
                            <div className="mt-3 space-y-0.5">
                              <p className="text-sm font-black text-slate-900">{opt.label}</p>
                              <p className="text-xs text-slate-500 font-semibold">{opt.helper}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Disability Type Selection (If Siswa) */}
                  {role === 'siswa' && (
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        Langkah 1B: Pilih Kebutuhan Belajar Siswa <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {disabilityOptions.map((dis) => {
                          const isSelected = disabilityType === dis.id;
                          return (
                            <button
                              key={dis.id}
                              type="button"
                              onClick={() => handleDisabilityChange(dis.id)}
                              className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 ${
                                isSelected
                                  ? `${dis.color} shadow-lg ring-2 ring-indigo-500/20 scale-[1.01]`
                                  : 'border-slate-200 bg-white hover:border-indigo-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{dis.icon}</span>
                                <div className="space-y-0.5">
                                  <p className="text-sm font-black text-slate-900">{dis.label}</p>
                                  <p className="text-xs text-slate-600 font-semibold">{dis.desc}</p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
                    >
                      <span>Lanjut ke Langkah 2</span>
                      <HiArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PROFILE DETAILS */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Siswa Fields */}
                  {role === 'siswa' && (
                    <div className="space-y-5 rounded-3xl bg-indigo-50/70 p-5 border-2 border-indigo-100">
                      <div>
                        <h3 className="text-sm font-extrabold text-indigo-950">Detail Siswa SD</h3>
                        <p className="text-xs text-indigo-700 font-semibold">Pilih tingkat kelas dan masukkan kode kelas dari gurumu.</p>
                      </div>

                      {/* Grade Level Selection Pills */}
                      <div className="space-y-2">
                        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                          Tingkat Kelas SD <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {classLevels.map((lvl) => {
                            const isSelected = classLevel === lvl.code;
                            return (
                              <button
                                key={lvl.code}
                                type="button"
                                onClick={() => {
                                  setClassLevel(lvl.code);
                                  speak(`Kelas ${lvl.code} dipilih`, 1.0, true);
                                }}
                                className={`py-3 px-4 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                                }`}
                              >
                                <span>{lvl.emoji}</span>
                                <span>{lvl.code}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Class Code Input */}
                      <div className="space-y-1.5">
                        <label htmlFor="student-class-code" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                          Kode Kelas dari Guru <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="student-class-code"
                          type="text"
                          required
                          value={classCode}
                          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                          placeholder="Contoh: X8J2K1"
                          autoCapitalize="characters"
                          className="w-full rounded-2xl bg-white border-2 border-slate-200 px-4 py-3.5 text-sm font-black text-slate-900 tracking-wider uppercase outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                        />
                        <p className="text-[11px] text-slate-500 font-semibold">
                          Minta kode kelas 6 digit kepada guru pembimbingmu.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Guru Fields */}
                  {role === 'guru' && (
                    <div className="space-y-4 rounded-3xl bg-indigo-50/70 p-5 border-2 border-indigo-100">
                      <div>
                        <h3 className="text-sm font-extrabold text-indigo-950">Profil Guru Pembimbing</h3>
                        <p className="text-xs text-indigo-700 font-semibold">Kode kelas unik akan dibuat otomatis untuk siswa Anda.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="teacher-school" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                            Nama Sekolah / SLB <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="teacher-school"
                            type="text"
                            required
                            value={slbName}
                            onChange={(e) => setSlbName(e.target.value)}
                            placeholder="Contoh: SLB Negeri 1 / SDN 01 Utama"
                            className="w-full rounded-2xl bg-white border-2 border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="teacher-class" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                            Kelas yang Diampu <span className="text-rose-500">*</span>
                          </label>
                          <select
                            id="teacher-class"
                            required
                            value={classLevel}
                            onChange={(e) => setClassLevel(e.target.value)}
                            className="w-full rounded-2xl bg-white border-2 border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                          >
                            {classLevels.map((lvl) => (
                              <option key={lvl.code} value={lvl.code}>{lvl.emoji} {lvl.code}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="teacher-subject" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                          Mata Pelajaran Utama
                        </label>
                        <select
                          id="teacher-subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full rounded-2xl bg-white border-2 border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                        >
                          {subjects.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Orang Tua Fields */}
                  {role === 'ortu' && (
                    <div className="space-y-4 rounded-3xl bg-rose-50/70 p-5 border-2 border-rose-100">
                      <div>
                        <h3 className="text-sm font-extrabold text-rose-950">Hubungkan Akun Anak</h3>
                        <p className="text-xs text-rose-700 font-semibold">Masukkan ID unik profil anak Anda untuk pemantauan.</p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="parent-student-id" className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                          ID Unik Siswa (Anak) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="parent-student-id"
                            type="text"
                            required
                            value={studentIdInput}
                            onChange={(e) => setStudentIdInput(e.target.value)}
                            placeholder="Contoh: UUID Profil Siswa (disalin dari profil anak)"
                            className="w-full rounded-2xl bg-white border-2 border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
                          />
                          {checkingStudent && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-rose-600 font-bold animate-pulse">
                              Memeriksa ID...
                            </div>
                          )}
                        </div>

                        {/* Realtime verification feedback */}
                        {verifiedStudent && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300">
                            <HiCheckCircle className="text-lg text-emerald-600 shrink-0" />
                            <span>Anak ditemukan: <strong>{verifiedStudent.full_name}</strong> ({verifiedStudent.class_level || 'SD'})</span>
                          </div>
                        )}

                        {studentCheckError && (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-100 text-rose-900 text-xs font-bold border border-rose-300">
                            <HiExclamationCircle className="text-lg text-rose-600 shrink-0" />
                            <span>{studentCheckError}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="py-3 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-sm rounded-xl transition-all"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
                    >
                      <span>Lanjut ke Langkah 3</span>
                      <HiArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: USER CREDENTIALS & SECURITY */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  {/* Full Name Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-name" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-indigo-600">
                        <HiUser />
                      </div>
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-email" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-indigo-600">
                        <HiMail />
                      </div>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@gmail.com"
                        className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {/* Password Input & Strength */}
                  <div className="space-y-2">
                    <label htmlFor="reg-password" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Kata Sandi Baru <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-indigo-600">
                        <HiLockClosed />
                      </div>
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-12 py-4 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !showPassword;
                          setShowPassword(nextState);
                          speak(nextState ? 'Kata sandi ditampilkan' : 'Kata sandi disembunyikan', 1.0, true);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2.5 text-slate-400 hover:text-indigo-600 transition-colors"
                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                      </button>
                    </div>

                    {/* Password Strength Progress Bar */}
                    {password && (
                      <div className="space-y-1 pt-1">
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                            style={{ width: `${pwdStrength.percent}%` }}
                          />
                        </div>
                        <p className="text-[11px] font-extrabold text-slate-600">
                          Kekuatan Sandi: <span>{pwdStrength.label}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="py-3.5 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-sm rounded-xl transition-all"
                    >
                      Kembali
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Membuat Akun...</span>
                        </>
                      ) : (
                        <>
                          <span>Daftar Akun BintangAi</span>
                          <HiChevronRight className="text-xl" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>

            {/* Bottom Login Link */}
            <div className="border-t border-slate-200 pt-6 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-600">Sudah memiliki akun?</p>
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-sm transition-all"
              >
                <span>Masuk ke Akun Anda</span>
                <HiChevronRight />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;

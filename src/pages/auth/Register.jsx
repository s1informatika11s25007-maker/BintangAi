import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { useVoice } from '@/features/accessibility/hooks/useVoice';
import AuthHeaderAccessibilityBar from '@/components/ui/AuthHeaderAccessibilityBar';
import BintangAvatar from '@/features/ai-tutor/components/BintangAvatar';
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheckCircle,
  HiChevronRight,
  HiExclamationCircle,
  HiEye,
  HiEyeOff,
  HiHeart,
  HiLockClosed,
  HiMail,
  HiUser,
  HiVolumeUp
} from 'react-icons/hi';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State (100% PRESERVED & REQUIRED)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('siswa'); // 'siswa', 'guru', 'ortu'
  const [selectedDisabilities, setSelectedDisabilities] = useState(['tidak_ada']);
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
        setStudentCheckError('ID Belajar Siswa tidak ditemukan. Periksa kembali ID anak.');
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
      siswa: 'Siswa SD untuk belajar mandiri',
      guru: 'Guru Pembimbing untuk kelola kelas',
      ortu: 'Orang Tua untuk mendampingi anak'
    };
    speak(`Peran dipilih: ${names[newRole] || newRole}`, 1.0, true);
  };

  const toggleDisability = (type) => {
    let updated = [];
    if (type === 'tidak_ada') {
      updated = ['tidak_ada'];
      speak('Mode Umum SD dipilih.', 1.0, true);
    } else {
      const prevWithoutGeneral = selectedDisabilities.filter(d => d !== 'tidak_ada');
      if (prevWithoutGeneral.includes(type)) {
        updated = prevWithoutGeneral.filter(d => d !== type);
        if (updated.length === 0) updated = ['tidak_ada'];
      } else {
        updated = [...prevWithoutGeneral, type];
      }

      const labels = {
        tunanetra: 'Tunanetra (Suara & Audio)',
        tunarungu: 'Tunarungu (Teks Visual & Subtitle)',
        tunawicara: 'Tunawicara (Kamera Gestur & Panduan Singkat)'
      };
      const activeLabels = updated.map(u => labels[u] || u).join(', ');
      speak(`Kebutuhan khusus dipilih: ${activeLabels}`, 1.0, true);
    }
    setSelectedDisabilities(updated);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    stopSpeaking();

    try {
      if (!fullName.trim()) throw new Error('Nama lengkap wajib diisi.');
      if (!email.trim()) throw new Error('Alamat email wajib diisi.');
      if (password.length < 8) throw new Error('Kata sandi minimal 8 karakter.');
      if (password !== confirmPassword) throw new Error('Konfirmasi kata sandi tidak cocok dengan kata sandi.');

      let linkedId = null;
      let finalClassCode = classCode.trim().toUpperCase();
      const finalSlbName = slbName.trim();
      let finalClassLevel = classLevel;

      if (role === 'siswa') {
        if (!classLevel) throw new Error('Tingkat kelas siswa (1 SD–6 SD) wajib dipilih.');
        if (!finalClassCode) throw new Error('Kode kelas dari guru wajib diisi.');
        if (!selectedDisabilities || selectedDisabilities.length === 0) {
          throw new Error('Pilih minimal 1 kebutuhan belajar siswa.');
        }
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

      const primaryDisability = selectedDisabilities.find(d => d !== 'tidak_ada') || selectedDisabilities[0] || 'tidak_ada';

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role,
            disabilities: selectedDisabilities,
            disability_type: primaryDisability,
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
          ? `Pendaftaran berhasil! Kode kelas Anda: ${finalClassCode}. Mengalihkan ke halaman login...`
          : 'Pendaftaran akun BintangAI berhasil! Mengalihkan ke halaman masuk...';

        setMessage({ type: 'success', text: successText });
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
      label: 'Siswa SD',
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
      label: 'Orang Tua / Wali',
      helper: 'Dampingi & Pantau Anak',
      badge: 'Orang Tua',
      icon: '👪',
      color: 'border-rose-500 bg-rose-50 text-rose-900',
    },
  ];

  const disabilityOptions = [
    { id: 'tunanetra', label: 'Tunanetra', desc: 'Suara Lisan & Audio Reader', icon: '🦯', color: 'border-purple-400 bg-purple-50 text-purple-950' },
    { id: 'tunarungu', label: 'Tunarungu', desc: 'Live Caption & Subtitle Visual', icon: '🤟', color: 'border-cyan-400 bg-cyan-50 text-cyan-950' },
    { id: 'tunawicara', label: 'Tunawicara', desc: 'Kamera Gestur Isyarat Tangan & Panduan Singkat', icon: '💬', color: 'border-emerald-400 bg-emerald-50 text-emerald-950' },
    { id: 'tidak_ada', label: 'Umum / Tanpa Hambatan', desc: 'Standar Pembelajaran SD', icon: '🌟', color: 'border-slate-300 bg-slate-50 text-slate-900' }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-sky-50/70 font-sans text-slate-900 selection:bg-sky-200">
      {/* Universal Accessibility Bar */}
      <AuthHeaderAccessibilityBar
        spokenTitle="Halaman Pendaftaran BintangAI"
        spokenText="Selamat datang di pendaftaran BintangAI. Isi formulir untuk memulai petualangan belajar."
      />

      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Left Visual Branding Side */}
        <aside className="relative isolate flex min-h-[300px] lg:min-h-full w-full lg:w-[40%] flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-10 shadow-2xl">
          {/* Top Logo */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 rounded-2xl focus-visible:outline-none"
              aria-label="Kembali ke Beranda Utama BintangAI"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
                <BintangAvatar state="idle" size="xs" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-black tracking-tight text-white block">
                  Bintang<span className="text-blue-400">AI</span>
                </span>
                <span className="text-[10px] font-extrabold text-sky-200 tracking-wider uppercase block">
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
                <BintangAvatar state="happy" size="sm" />
                <div>
                  <h3 className="text-base font-black text-white">Kak Bintang AI</h3>
                  <p className="text-xs text-sky-200 font-medium">Setiap anak punya cara bersinar!</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950/70 p-4 border border-white/10 text-xs sm:text-sm text-sky-100 leading-relaxed font-medium">
                "Pilih peranmu, tentukan kebutuhan belajarmu, dan nikmati materi SD yang seru dan mudah dipahami!"
              </div>

              <button
                type="button"
                onClick={() => speak("Setiap anak punya cara untuk bersinar. Bergabung bersama BintangAI untuk pengalaman belajar inklusif!", 1.0, true)}
                className="w-full py-2.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <HiVolumeUp className="text-base" /> Dengarkan Kak Bintang
              </button>
            </motion.div>
          </div>

          <div className="relative border-t border-white/15 pt-4 text-xs text-sky-200 font-semibold flex justify-between items-center">
            <span>© 2026 BintangAI • Ruang Belajar SD</span>
            <span className="inline-flex items-center gap-1 text-yellow-300">
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
                className="mb-4 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition"
              >
                <HiArrowLeft className="text-sm" /> Sudah punya akun? Masuk
              </button>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Buat Akun <span className="text-blue-600">BintangAI</span>
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Semua kolom wajib diisi (*) untuk keamanan dan kenyamanan belajar anak.
              </p>
            </div>

            {/* Visual Step Progress Indicator */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-sky-100 rounded-2xl border border-sky-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  currentStep === 1
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                <span>1. Peran & Kebutuhan</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  currentStep === 2
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                <span>2. Detail Profil SD</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  currentStep === 3
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-blue-600'
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
                            className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                              isSelected
                                ? 'border-blue-600 bg-sky-50 shadow-lg ring-2 ring-blue-500/20'
                                : 'border-slate-200 bg-white hover:border-blue-300'
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
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                          Langkah 1B: Pilih Kebutuhan Belajar Siswa <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[10px] font-black text-blue-700 bg-sky-100 px-2.5 py-1 rounded-full uppercase">
                          Pilih yang paling sesuai
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {disabilityOptions.map((dis) => {
                          const isSelected = selectedDisabilities.includes(dis.id);
                          return (
                            <button
                              key={dis.id}
                              type="button"
                              onClick={() => toggleDisability(dis.id)}
                              className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 flex items-center justify-between gap-3 ${
                                isSelected
                                  ? `${dis.color} shadow-lg ring-2 ring-blue-500/20 scale-[1.01]`
                                  : 'border-slate-200 bg-white hover:border-blue-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{dis.icon}</span>
                                <div className="space-y-0.5">
                                  <p className="text-sm font-black text-slate-900">{dis.label}</p>
                                  <p className="text-xs text-slate-600 font-semibold">{dis.desc}</p>
                                </div>
                              </div>
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center font-black text-xs shrink-0 ${
                                isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected ? '✓' : ''}
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
                      className="py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
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
                    <div className="space-y-5 rounded-3xl bg-sky-50/70 p-5 border-2 border-sky-200">
                      <div>
                        <h3 className="text-sm font-extrabold text-sky-950">Detail Siswa SD</h3>
                        <p className="text-xs text-sky-700 font-semibold">Pilih tingkat kelas dan masukkan kode kelas dari gurumu.</p>
                      </div>

                      {/* Grade Level Selection Pills */}
                      <div className="space-y-2">
                        <label className="block text-xs font-extrabold text-slate-700 uppercase">
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
                                className={`py-3 px-4 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 transition ${
                                  isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
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
                        <label htmlFor="student-class-code" className="block text-xs font-extrabold text-slate-700 uppercase">
                          Kode Kelas dari Guru <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="student-class-code"
                          type="text"
                          required
                          value={classCode}
                          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                          placeholder="Contoh: X8J2K1"
                          className="w-full rounded-2xl bg-white border-2 border-slate-200 px-4 py-3.5 text-sm font-black text-slate-900 tracking-wider uppercase outline-none focus:border-blue-600 focus:ring-4 focus:ring-sky-100"
                        />
                      </div>
                    </div>
                  )}

                  {/* Guru Fields */}
                  {role === 'guru' && (
                    <div className="space-y-4 rounded-3xl bg-sky-50/70 p-5 border-2 border-sky-200">
                      <div>
                        <h3 className="text-sm font-extrabold text-sky-950">Profil Guru Pembimbing</h3>
                        <p className="text-xs text-sky-700 font-semibold">Kode kelas unik akan dibuat otomatis untuk siswa Anda.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="teacher-school" className="block text-xs font-extrabold text-slate-700 uppercase">
                            Nama Sekolah / SLB <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="teacher-school"
                            type="text"
                            required
                            value={slbName}
                            onChange={(e) => setSlbName(e.target.value)}
                            placeholder="Contoh: SLB Negeri 1 / SDN 01"
                            className="w-full rounded-2xl bg-white border-2 border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:ring-4 focus:ring-sky-100"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="teacher-class" className="block text-xs font-extrabold text-slate-700 uppercase">
                            Kelas yang Diampu <span className="text-rose-500">*</span>
                          </label>
                          <select
                            id="teacher-class"
                            required
                            value={classLevel}
                            onChange={(e) => setClassLevel(e.target.value)}
                            className="w-full rounded-2xl bg-white border-2 border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                          >
                            {classLevels.map((lvl) => (
                              <option key={lvl.code} value={lvl.code}>{lvl.emoji} {lvl.code}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="teacher-subject" className="block text-xs font-extrabold text-slate-700 uppercase">
                          Mata Pelajaran Utama
                        </label>
                        <select
                          id="teacher-subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full rounded-2xl bg-white border-2 border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
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
                    <div className="space-y-4 rounded-3xl bg-rose-50/70 p-5 border-2 border-rose-200">
                      <div>
                        <h3 className="text-sm font-extrabold text-rose-950">Hubungkan Akun Anak</h3>
                        <p className="text-xs text-rose-700 font-semibold">Masukkan ID unik profil anak Anda untuk pemantauan.</p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="parent-student-id" className="block text-xs font-extrabold text-slate-700 uppercase">
                          ID Unik Siswa (Anak) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="parent-student-id"
                            type="text"
                            required
                            value={studentIdInput}
                            onChange={(e) => setStudentIdInput(e.target.value)}
                            placeholder="Contoh: UUID / Short ID Siswa"
                            className="w-full rounded-2xl bg-white border-2 border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-rose-500"
                          />
                          {checkingStudent && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-rose-600 font-bold animate-pulse">
                              Memeriksa...
                            </div>
                          )}
                        </div>

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
                      className="py-3 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-sm rounded-xl transition"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
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
                    <label htmlFor="reg-name" className="block text-xs font-extrabold uppercase text-slate-700">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        id="reg-name"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Masukkan nama lengkap Anda"
                        className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-email" className="block text-xs font-extrabold uppercase text-slate-700">
                      Alamat Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@gmail.com"
                        className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-sky-100"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="reg-password" className="block text-xs font-extrabold uppercase text-slate-700">
                        Kata Sandi Baru <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 8 karakter"
                          className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-10 py-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-sky-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                        >
                          {showPassword ? <HiEyeOff /> : <HiEye />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="reg-confirm-password" className="block text-xs font-extrabold uppercase text-slate-700">
                        Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input
                          id="reg-confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi Kata Sandi"
                          className="w-full rounded-2xl bg-slate-50 border-2 border-slate-200 pl-12 pr-4 py-4 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-sky-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="py-3.5 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-sm rounded-xl transition"
                    >
                      Kembali
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-300 active:scale-[0.99] transition flex items-center justify-center gap-3 disabled:opacity-60"
                    >
                      {loading ? (
                        <span>Membuat Akun...</span>
                      ) : (
                        <>
                          <span>Daftar Akun BintangAI</span>
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
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-extrabold text-sm transition"
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

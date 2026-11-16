import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BintangAvatar from '@/features/ai-tutor/components/BintangAvatar';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { login } from '@/features/auth/api/sessionApi';
import { supabase } from '@/lib/supabaseClient';

const primaryButton =
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60';

const secondaryButton =
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border-2 border-blue-200 bg-white px-5 py-2.5 text-sm font-extrabold text-blue-800 transition active:scale-95 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-60';

const inputClass =
  'w-full rounded-xl border border-blue-100 bg-[#F8FBFF] px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100';

const DEMO_ACCOUNTS = [
  {
    key: 'tunanetra',
    group: 'siswa',
    label: 'Siswa Tunanetra',
    email: 'demo.tunanetra@gmail.com',
    pass: 'demo123456',
    description: 'Budi Santoso · Kelas 4 SD',
    support: 'Panduan suara, pembaca layar, dan deskripsi gambar',
    icon: '🎧',
    color: 'from-blue-50 to-sky-50',
    badgeBg: 'bg-blue-600 text-white',
  },
  {
    key: 'tunarungu',
    group: 'siswa',
    label: 'Siswa Tunarungu',
    email: 'demo.tunarungu@gmail.com',
    pass: 'demo123456',
    description: 'Siti Rahma · Kelas 3 SD',
    support: 'Teks yang jelas, subtitle, dan petunjuk visual',
    icon: '💬',
    color: 'from-sky-50 to-blue-50',
    badgeBg: 'bg-sky-600 text-white',
  },
  {
    key: 'tunawicara',
    group: 'siswa',
    label: 'Siswa Tunawicara',
    email: 'demo.tunawicara@gmail.com',
    pass: 'demo123456',
    description: 'Doni Pratama · Kelas 5 SD',
    support: 'Komunikasi dengan tulisan, gambar, dan simbol',
    icon: '🧩',
    color: 'from-blue-50 to-sky-50',
    badgeBg: 'bg-emerald-600 text-white',
  },
  {
    key: 'guru',
    group: 'guru',
    label: 'Guru Pembimbing',
    email: 'demo.guru@gmail.com',
    pass: 'demo123456',
    description: 'Ibu Rina · Guru SLB/SD',
    support: 'Kelola kelas dan materi belajar',
    icon: '👩‍🏫',
    color: 'from-blue-100 to-sky-50',
    badgeBg: 'bg-purple-600 text-white',
  },
  {
    key: 'ortu',
    group: 'ortu',
    label: 'Orang Tua / Wali',
    email: 'demo.ortu@gmail.com',
    pass: 'demo123456',
    description: 'Pak Herman · Orang tua',
    support: 'Dampingi dan lihat laporan anak',
    icon: '👨‍👧',
    color: 'from-sky-50 to-blue-100',
    badgeBg: 'bg-amber-600 text-white',
  },
];

const LEARNING_MODES = [
  {
    id: 'tunanetra',
    title: 'Tunanetra',
    note: 'Hambatan penglihatan',
    description: 'Bicara dan mendengarkan. Kak Bintang akan membacakan teks dan menjelaskan gambar.',
    icon: '🎧',
  },
  {
    id: 'tunarungu',
    title: 'Tunarungu',
    note: 'Hambatan pendengaran',
    description: 'Melihat teks dan petunjuk visual. Semua penjelasan dilengkapi tulisan yang jelas.',
    icon: '💬',
  },
  {
    id: 'tunawicara',
    title: 'Tunawicara',
    note: 'Hambatan bicara',
    description: 'Menulis, memilih gambar, atau menggunakan gestur isyarat untuk menyampaikan jawaban.',
    icon: '🧩',
  },
  {
    id: 'tidak_ada',
    title: 'Umum',
    note: 'Tampilan standar',
    description: 'Gunakan tampilan Bintang AI seperti biasa, tanpa pengaturan khusus.',
    icon: '🌟',
  },
];

const SLIDE_LABELS = [
  'Sambutan',
  'Mengapa Bintang AI',
  'Cara belajar',
  'Fitur utama',
  'Alur pengguna',
  'Coba simulasi',
  'Mulai belajar',
  'Masuk dan daftar',
];

const MobileLandingPage = () => {
  const navigate = useNavigate();
  const { setUser, fetchProfile } = useAuthStore();
  const { setManualMode } = useAccessibilityStore();

  const [activeSlide, setActiveSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);

  const [regStep, setRegStep] = useState(1);
  const [regRole, setRegRole] = useState('siswa');
  const [regDisability, setRegDisability] = useState('tunanetra');
  const [regClassLevel, setRegClassLevel] = useState('4 SD');
  const [regClassCode, setRegClassCode] = useState('');
  const [regSlbName, setRegSlbName] = useState('');
  const [regSubject, setRegSubject] = useState('Matematika');
  const [regStudentIdInput, setRegStudentIdInput] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState(null);

  const goToSlide = useCallback((nextIndex) => {
    const safeIndex = Math.max(0, Math.min(7, nextIndex));
    setSlideDirection(safeIndex >= activeSlide ? 1 : -1);
    setActiveSlide(safeIndex);
  }, [activeSlide]);

  const openAuth = (tab) => {
    setAuthTab(tab);
    setLoginMessage(null);
    setRegMessage(null);
    if (tab === 'register') setRegStep(1);
    goToSlide(7);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) {
      if (dx < 0 && activeSlide < 7) {
        goToSlide(activeSlide + 1);
      } else if (dx > 0 && activeSlide > 0) {
        goToSlide(activeSlide - 1);
      }
    }
  };

  const handleDemoLogin = async (account) => {
    setLoginLoading(true);
    setLoginMessage(null);
    try {
      const authData = await login(account.email, account.pass);
      if (authData?.user) {
        setUser(authData.user);
        await fetchProfile();
        if (account.group === 'siswa') setManualMode(account.key);
        const destination = account.group === 'guru'
          ? '/teacher/dashboard'
          : account.group === 'ortu'
          ? '/parent/dashboard'
          : account.key === 'tunanetra'
          ? '/student/playground'
          : '/student/dashboard';
        navigate(destination);
      }
    } catch (err) {
      setLoginMessage({ type: 'error', text: err.message || 'Gagal login ke akun demo.' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMessage(null);
    try {
      const authData = await login(loginEmail, loginPassword);
      if (authData?.user) {
        setUser(authData.user);
        await fetchProfile();
        navigate('/student/dashboard');
      }
    } catch (err) {
      setLoginMessage({ type: 'error', text: err.message || 'Gagal masuk. Periksa email dan password Anda.' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setRegMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }
    setRegLoading(true);
    setRegMessage(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regFullName,
            role: regRole,
            disability_type: regDisability,
            class_level: regClassLevel,
            class_code: regClassCode,
            slb_name: regSlbName,
            subject: regSubject,
          },
        },
      });
      if (error) throw error;
      if (data?.user) {
        setUser(data.user);
        await fetchProfile();
        navigate('/student/dashboard');
      }
    } catch (err) {
      setRegMessage({ type: 'error', text: err.message || 'Gagal mendaftar. Coba lagi.' });
    } finally {
      setRegLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: 0.96,
    }),
  };

  return (
    <div className="relative min-h-[100dvh] h-[100dvh] w-full bg-gradient-to-b from-sky-50/80 via-white to-blue-50/80 text-slate-900 flex flex-col justify-between overflow-hidden font-sans select-none">

      {/* STICKY TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-blue-100/80 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => goToSlide(0)}>
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-blue-100 bg-white p-0.5 shadow-sm">
            <BintangAvatar size={34} state="idle" />
          </div>
          <div>
            <span className="text-base font-black text-blue-950 tracking-tight">Bintang<span className="text-blue-700">AI</span></span>
            <span className="block text-[10px] font-bold text-blue-600">Teman Belajar Kita</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={() => openAuth('login')} className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-xs font-bold text-blue-800 hover:bg-blue-50">
            Masuk
          </button>
          <button onClick={() => openAuth('register')} className="px-3 py-1.5 rounded-xl bg-blue-700 text-xs font-extrabold text-white shadow-sm hover:bg-blue-800">
            Daftar
          </button>
          <button onClick={() => goToSlide(5)} className="px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">
            ▶ Demo
          </button>
        </div>
      </header>

      {/* SLIDE CONTENT AREA WITH 100% PARITY & MATCHING SLIDE ANIMATIONS */}
      <div className="relative flex-1 w-full overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.main
            key={activeSlide}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 flex flex-col justify-between overflow-y-auto px-4 py-3 sm:px-6"
          >
            {/* SLIDE 0 — SAMBUTAN */}
            {activeSlide === 0 && (
              <div className="flex flex-col justify-between h-full space-y-4 py-2">
                <div className="text-center space-y-3 pt-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-extrabold text-blue-800">
                    Untuk teman kelas 1–6 SD
                  </span>
                  <div className="relative inline-block py-1">
                    <BintangAvatar size={110} state="happy" className="mx-auto" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 leading-tight">
                    Halo, <span className="text-sky-600">Teman Bintang!</span>
                  </h1>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    Yuk, belajar, bertanya, dan mencoba hal baru bersama Kak Bintang.
                  </p>
                  <div className="flex flex-col gap-2 pt-2">
                    <button onClick={() => goToSlide(1)} className={primaryButton}>
                      Ayo Jelajahi 🚀
                    </button>
                    <button onClick={() => openAuth('register')} className={secondaryButton}>
                      Buat Akun Baru
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-white/90 p-3 shadow-xs text-center space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Ruang khusus pendamping</p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-extrabold text-slate-800 pt-1">
                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-50 py-2"><span>👨‍🏫</span> <span>Guru</span></div>
                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 py-2"><span>👪</span> <span>Orang tua</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 1 — MASALAH DAN SOLUSI */}
            {activeSlide === 1 && (
              <div className="flex flex-col justify-center h-full space-y-4 py-2">
                <div className="text-center space-y-1.5">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-black text-blue-800 uppercase tracking-wider">
                    Masalah dan solusi
                  </span>
                  <h2 className="text-xl font-black text-slate-900">Mengapa Bintang AI dibuat?</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Bintang AI dibuat khusus membantu siswa SD disabilitas kelas 1–6 agar dapat belajar mandiri dari rumah dengan mudah, aman, dan ceria.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border-2 border-slate-200 bg-white shadow-xs space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-800">Tantangan Siswa Disabilitas</span>
                    <h3 className="text-sm font-black text-slate-900">Hambatan Belajar Siswa SD</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Siswa Tunanetra kesulitan membaca teks modul, Siswa Tunarungu tidak dapat mendengar suara penjelasan guru, dan Siswa Tunawicara kesulitan menyampaikan jawaban saat belajar di rumah.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/60 shadow-xs space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-200 text-[10px] font-bold text-blue-900">Solusi Aksesibilitas SD</span>
                    <h3 className="text-sm font-black text-slate-900">Bintang AI Siap Membantu Belajar</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Suara lisan otomatis untuk Tunanetra, teks subtitle visual untuk Tunarungu, serta kamera gestur isyarat & balasan teks untuk Tunawicara kelas 1–6 SD, didampingi Guru dan Orang Tua.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2 — CARA BELAJAR */}
            {activeSlide === 2 && (
              <div className="flex flex-col justify-center h-full space-y-3 py-2">
                <div className="text-center space-y-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-black text-blue-800 uppercase tracking-wider">
                    Pilih yang nyaman
                  </span>
                  <h2 className="text-xl font-black text-slate-900">Ada banyak cara untuk memahami pelajaran</h2>
                  <p className="text-xs text-slate-600">Pilih satu cara untuk memulai. Pengaturan dapat disesuaikan lagi kapan saja.</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {LEARNING_MODES.map((mode) => (
                    <div key={mode.id} className="p-3 rounded-2xl border-2 border-blue-100 bg-white shadow-xs space-y-1 flex flex-col justify-between">
                      <div>
                        <span className="text-2xl">{mode.icon}</span>
                        <h3 className="text-xs font-black text-slate-900 mt-1">{mode.title}</h3>
                        <p className="text-[10px] text-slate-500 leading-snug line-clamp-3">{mode.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SLIDE 3 — FITUR UTAMA */}
            {activeSlide === 3 && (
              <div className="flex flex-col justify-center h-full space-y-3 py-2">
                <div className="text-center space-y-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-black text-blue-800 uppercase tracking-wider">
                    Yang bisa kamu lakukan
                  </span>
                  <h2 className="text-xl font-black text-slate-900">Empat kegiatan seru di Bintang AI</h2>
                  <p className="text-xs text-slate-600">Belajar sedikit demi sedikit. Kalau belum paham, kamu boleh mencoba lagi.</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { icon: '📖', number: '01', title: 'Baca Materi', text: 'Pelajari materi kelas 1 sampai 6 dengan tampilan yang mudah dibaca.' },
                    { icon: '🤖', number: '02', title: 'Tanya Kak Bintang', text: 'Tanyakan pelajaran dan dapatkan penjelasan dengan bahasa sederhana.' },
                    { icon: '🎯', number: '03', title: 'Kerjakan Latihan', text: 'Jawab kuis dan lihat hasil latihanmu. Terus semangat mencoba!' },
                    { icon: '🧑‍💻', number: '04', title: 'Mengajar Real-Time', text: 'Guru mengajar secara langsung dari jarak jauh sesuai format siswa.' },
                  ].map((f) => (
                    <div key={f.number} className="p-3 rounded-2xl border-2 border-blue-100 bg-blue-50/50 shadow-xs space-y-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{f.icon}</span>
                          <span className="text-[10px] font-black text-slate-400">{f.number}</span>
                        </div>
                        <h3 className="text-xs font-black text-slate-900 mt-1">{f.title}</h3>
                        <p className="text-[10px] text-slate-600 leading-snug line-clamp-3">{f.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SLIDE 4 — ALUR PENGGUNA */}
            {activeSlide === 4 && (
              <div className="flex flex-col justify-center h-full space-y-3 py-2">
                <div className="text-center space-y-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-black text-blue-800 uppercase tracking-wider">
                    Kita belajar bersama
                  </span>
                  <h2 className="text-xl font-black text-slate-900">Ada tiga teman dalam perjalanan belajar</h2>
                  <p className="text-xs text-slate-600">Siswa, guru, dan orang tua punya tugas masing-masing. Semuanya saling membantu.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  <div className="p-3.5 rounded-2xl border-2 border-blue-100 bg-blue-50 flex items-center gap-3">
                    <span className="text-3xl shrink-0 p-2 rounded-xl bg-white shadow-xs">👩‍🏫</span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-800">Menyiapkan</span>
                      <h3 className="text-sm font-black text-slate-900">Guru</h3>
                      <p className="text-[11px] text-slate-600 leading-snug">Menyiapkan kelas, membagikan kode kelas, membuat materi, dan melihat tugas.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border-2 border-sky-200 bg-sky-50 flex items-center gap-3 shadow-xs">
                    <span className="text-3xl shrink-0 p-2 rounded-xl bg-white shadow-xs">🧒</span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-sky-800">Belajar</span>
                      <h3 className="text-sm font-black text-slate-900">Siswa</h3>
                      <p className="text-[11px] text-slate-600 leading-snug">Membaca materi, bertanya kepada Kak Bintang, dan mengerjakan latihan.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border-2 border-blue-100 bg-blue-50 flex items-center gap-3">
                    <span className="text-3xl shrink-0 p-2 rounded-xl bg-white shadow-xs">👨‍👧</span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-800">Mendampingi</span>
                      <h3 className="text-sm font-black text-slate-900">Orang Tua</h3>
                      <p className="text-[11px] text-slate-600 leading-snug">Menemani anak belajar dan melihat laporan perkembangan yang tersedia.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 5 — COBA SIMULASI */}
            {activeSlide === 5 && (
              <div className="flex flex-col justify-center h-full space-y-3 py-1">
                <div className="text-center space-y-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-black text-blue-800 uppercase tracking-wider">
                    Yuk, coba!
                  </span>
                  <h2 className="text-lg font-black text-slate-900">Pilih pengalaman yang ingin kamu lihat</h2>
                  <p className="text-xs text-slate-600">Tekan tombol untuk membuka akun simulasi.</p>
                </div>

                {loginMessage && (
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800">{loginMessage.text}</div>
                )}

                <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <div key={acc.key} className={`p-3 rounded-2xl border border-white/80 bg-gradient-to-br ${acc.color} shadow-xs flex items-center justify-between gap-2`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0 p-1.5 rounded-xl bg-white shadow-xs">{acc.icon}</span>
                        <div className="min-w-0">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${acc.badgeBg}`}>{acc.label}</span>
                          <h3 className="text-xs font-black text-slate-900 truncate">{acc.description}</h3>
                        </div>
                      </div>
                      <button
                        disabled={loginLoading}
                        onClick={() => handleDemoLogin(acc)}
                        className="px-3 py-2 rounded-xl bg-blue-700 text-xs font-extrabold text-white shrink-0 shadow-xs active:scale-95"
                      >
                        {loginLoading ? '...' : 'Coba'} →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SLIDE 6 — MULAI BELAJAR */}
            {activeSlide === 6 && (
              <div className="flex flex-col justify-center items-center h-full text-center space-y-4 py-2">
                <BintangAvatar size={130} state="happy" className="mx-auto" />
                <div className="space-y-2">
                  <span className="inline-block px-3.5 py-1 rounded-full bg-sky-100 border border-sky-200 text-xs font-black uppercase tracking-wider text-sky-800">
                    Bintang AI · Ruang Belajar SD
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 leading-snug">Setiap anak punya kesempatan untuk bersinar!</h2>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">Ayo mulai petualangan belajar. Kamu bisa membuat akun atau masuk ke akun yang sudah ada.</p>
                </div>
                <div className="flex flex-col gap-2.5 w-full pt-2">
                  <button onClick={() => openAuth('register')} className={primaryButton}>
                    Buat akun baru 🚀
                  </button>
                  <button onClick={() => openAuth('login')} className={secondaryButton}>
                    Masuk ke akun
                  </button>
                </div>
              </div>
            )}

            {/* SLIDE 7 — MASUK DAN DAFTAR (FORM INTEGRATED IN 1 SCREEN) */}
            {activeSlide === 7 && (
              <div className="flex flex-col justify-center h-full space-y-3 py-2">
                {/* Form Header */}
                <div className="flex items-center gap-3">
                  <BintangAvatar size={42} state={authTab === 'login' ? 'happy' : 'idle'} />
                  <div>
                    <h2 className="text-sm font-black text-slate-900">{authTab === 'login' ? 'Selamat datang kembali!' : 'Buat akun Bintang AI'}</h2>
                    <p className="text-[11px] text-slate-500">Ruang belajar mandiri SD</p>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F1F6FF] border border-blue-100 text-center">
                  <button
                    onClick={() => { setAuthTab('login'); setLoginMessage(null); }}
                    className={`py-2 text-xs font-extrabold rounded-lg transition-colors ${authTab === 'login' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => { setAuthTab('register'); setRegStep(1); setRegMessage(null); }}
                    className={`py-2 text-xs font-extrabold rounded-lg transition-colors ${authTab === 'register' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-500'}`}
                  >
                    Daftar
                  </button>
                </div>

                {/* LOGIN FORM */}
                {authTab === 'login' && (
                  <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
                    {loginMessage && (
                      <div className={`p-2.5 rounded-xl text-xs font-semibold border ${loginMessage.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        {loginMessage.text}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">Alamat email</label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-950 mb-1">Kata sandi</label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Masukkan kata sandi"
                          className={`${inputClass} pr-20`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-50 rounded-lg"
                        >
                          {showLoginPassword ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={loginLoading} className={`${primaryButton} w-full mt-2`}>
                      {loginLoading ? 'Sedang memeriksa...' : 'Masuk dan mulai belajar 🚀'}
                    </button>
                  </form>
                )}

                {/* REGISTER FORM */}
                {authTab === 'register' && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Langkah {regStep} dari 3</span>
                      <span className="text-sky-700">{['Pilih peran', 'Detail kelas', 'Data akun'][regStep - 1]}</span>
                    </div>

                    {regMessage && (
                      <div className="p-2.5 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800">{regMessage.text}</div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="space-y-3">
                      {regStep === 1 && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-blue-950">Daftar sebagai:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'siswa', label: 'Siswa SD', icon: '🧒' },
                              { id: 'guru', label: 'Guru', icon: '👩‍🏫' },
                              { id: 'ortu', label: 'Orang tua', icon: '👨‍👧' },
                            ].map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setRegRole(item.id)}
                                className={`p-2.5 rounded-xl border-2 text-center transition-all ${regRole === item.id ? 'border-sky-500 bg-sky-50 text-blue-950 font-black' : 'border-blue-100 bg-white text-slate-600'}`}
                              >
                                <span className="text-xl block">{item.icon}</span>
                                <span className="text-[11px] mt-1 block">{item.label}</span>
                              </button>
                            ))}
                          </div>

                          {regRole === 'siswa' && (
                            <div>
                              <label className="block text-xs font-bold text-blue-950 mb-1">Cara belajar yang nyaman</label>
                              <select
                                value={regDisability}
                                onChange={(e) => setRegDisability(e.target.value)}
                                className={inputClass}
                              >
                                <option value="tunanetra">Tunanetra — suara dan pembaca layar</option>
                                <option value="tunarungu">Tunarungu — teks dan petunjuk visual</option>
                                <option value="tunawicara">Tunawicara — tulisan, gambar, dan simbol</option>
                                <option value="tidak_ada">Umum — tampilan standar</option>
                              </select>
                            </div>
                          )}

                          <button type="button" onClick={() => setRegStep(2)} className={`${primaryButton} w-full`}>
                            Lanjut →
                          </button>
                        </div>
                      )}

                      {regStep === 2 && (
                        <div className="space-y-3">
                          {regRole === 'siswa' && (
                            <>
                              <div>
                                <label className="block text-xs font-bold text-blue-950 mb-1">Kelas SD</label>
                                <select value={regClassLevel} onChange={(e) => setRegClassLevel(e.target.value)} className={inputClass}>
                                  {['1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'].map((lvl) => (
                                    <option key={lvl} value={lvl}>{lvl}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-blue-950 mb-1">Kode kelas dari guru</label>
                                <input
                                  type="text"
                                  required
                                  value={regClassCode}
                                  onChange={(e) => setRegClassCode(e.target.value.toUpperCase())}
                                  placeholder="Contoh: X8J2K1"
                                  className={`${inputClass} uppercase`}
                                />
                              </div>
                            </>
                          )}

                          {regRole === 'guru' && (
                            <>
                              <div>
                                <label className="block text-xs font-bold text-blue-950 mb-1">Nama sekolah / SLB</label>
                                <input
                                  type="text"
                                  required
                                  value={regSlbName}
                                  onChange={(e) => setRegSlbName(e.target.value)}
                                  placeholder="Masukkan nama sekolah"
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-blue-950 mb-1">Mata pelajaran utama</label>
                                <select value={regSubject} onChange={(e) => setRegSubject(e.target.value)} className={inputClass}>
                                  {['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Bahasa Inggris', 'Lainnya'].map((sub) => (
                                    <option key={sub} value={sub}>{sub}</option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}

                          {regRole === 'ortu' && (
                            <div>
                              <label className="block text-xs font-bold text-blue-950 mb-1">ID Belajar Siswa (Anak)</label>
                              <input
                                type="text"
                                required
                                value={regStudentIdInput}
                                onChange={(e) => setRegStudentIdInput(e.target.value)}
                                placeholder="Masukkan ID dari anak"
                                className={inputClass}
                              />
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => setRegStep(1)} className={`${secondaryButton} flex-1 py-2`}>Kembali</button>
                            <button type="button" onClick={() => setRegStep(3)} className={`${primaryButton} flex-1 py-2`}>Lanjut →</button>
                          </div>
                        </div>
                      )}

                      {regStep === 3 && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-blue-950 mb-1">Nama lengkap</label>
                            <input type="text" required value={regFullName} onChange={(e) => setRegFullName(e.target.value)} placeholder="Masukkan nama lengkap" className={inputClass} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-blue-950 mb-1">Alamat email</label>
                            <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="nama@email.com" className={inputClass} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-blue-950 mb-1">Kata sandi</label>
                            <input type={showRegPassword ? 'text' : 'password'} required minLength={8} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Minimal 8 karakter" className={inputClass} />
                          </div>
                          <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => setRegStep(2)} className={`${secondaryButton} flex-1 py-2`}>Kembali</button>
                            <button type="submit" disabled={regLoading} className={`${primaryButton} flex-1 py-2`}>
                              {regLoading ? 'Membuat akun...' : 'Buat akun'}
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>
            )}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* BOTTOM SLIDE NAVIGATION BAR (SLIDE-PER-SLIDE CONTROLS & CHAPTER DOTS) */}
      <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-blue-100 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-lg">
        <button
          onClick={() => goToSlide(activeSlide - 1)}
          disabled={activeSlide === 0}
          className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-xs font-extrabold text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 active:scale-95 transition-transform"
        >
          ← Sebelum
        </button>

        {/* Chapter Dots Indicator */}
        <div className="flex items-center gap-1.5">
          {SLIDE_LABELS.map((label, idx) => (
            <button
              key={label}
              onClick={() => goToSlide(idx)}
              aria-label={label}
              className={`h-2 rounded-full transition-all ${idx === activeSlide ? 'w-5 bg-blue-700' : 'w-2 bg-blue-200'}`}
            />
          ))}
        </div>

        <button
          onClick={() => goToSlide(activeSlide + 1)}
          disabled={activeSlide === 7}
          className="px-3 py-1.5 rounded-xl bg-blue-700 text-xs font-extrabold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 active:scale-95 transition-transform shadow-xs"
        >
          Sesudah →
        </button>

        {/* Floating Top Arrow (↑) */}
        <button
          onClick={() => goToSlide(0)}
          className="fixed bottom-14 right-4 z-50 h-10 w-10 rounded-full border border-blue-200 bg-white text-blue-900 shadow-xl backdrop-blur-md flex items-center justify-center text-lg font-bold active:scale-90 transition-transform"
          aria-label="Kembali ke Slide Utama"
        >
          ↑
        </button>
      </footer>
    </div>
  );
};

export default MobileLandingPage;

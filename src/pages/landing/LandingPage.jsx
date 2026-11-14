import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import Footer from '@/components/layout/Footer';
import BintangAvatar from '@/features/ai-tutor/components/BintangAvatar';
import AuthHeaderAccessibilityBar from '@/components/ui/AuthHeaderAccessibilityBar';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import {
  HiArrowRight,
  HiBookOpen,
  HiCheckCircle,
  HiMicrophone,
  HiChatAlt2,
  HiUserGroup,
  HiVolumeUp,
  HiVolumeOff,
  HiChevronUp,
  HiSparkles,
  HiStar,
  HiLightningBolt,
  HiAnnotation,
  HiHome,
  HiAcademicCap,
  HiEye,
  HiPlay,
  HiPause,
  HiThumbUp,
  HiQuestionMarkCircle,
  HiHeart,
  HiRefresh,
  HiBadgeCheck,
  HiSun
} from 'react-icons/hi';

const appFeatures = [
  {
    id: 'ai-tutor',
    icon: HiChatAlt2,
    title: 'AI Tutor Kak Bintang',
    description: 'Sahabat belajar pintar berkarakter ramah yang menjawab pertanyaan siswa SD kelas 1-6 dengan bahasa sederhana tanpa simbol markdown rumit.',
    tag: 'Tutor AI SD',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    path: '/student/tanya-ai',
    targetDisability: 'Semua Siswa SD'
  },
  {
    id: 'modules',
    icon: HiBookOpen,
    title: 'Materi Belajar Interaktif',
    description: 'Perpustakaan modul SD dengan pembacaan suara paragraf W3C, pengubah ukuran teks (S/M/L/XL), dan tombol Tap-to-Ask 1-ketuk.',
    tag: 'Modul SD',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    path: '/student/modules',
    targetDisability: 'Tunanetra & Tunarungu'
  },
  {
    id: 'live-captions',
    icon: HiMicrophone,
    title: 'Mata Pintar – Live Caption',
    description: 'Transkripsi ucapan arahan guru secara real-time menjadi teks caption jernih pada HUD layar untuk siswa tunarungu.',
    tag: 'Dukungan Tunarungu',
    color: 'bg-sky-50 text-sky-700 border-sky-200',
    path: '/student/live-captions',
    targetDisability: 'Siswa Tunarungu'
  },
  {
    id: 'quiz-gamification',
    icon: HiLightningBolt,
    title: 'QuizKu Adaptif & Gesture Hand',
    description: 'Kuis interaktif AI dengan input isyarat tangan (Gesture Camera), perolehan XP belajar, dan Streak Harian 🔥 yang memotivasi.',
    tag: 'Kuis & Gesture',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    path: '/student/tasks',
    targetDisability: 'Tunawicara & All SD'
  },
  {
    id: 'inbox-aac',
    icon: HiAnnotation,
    title: 'Bimbingan Jarak Jauh & AAC',
    description: 'Guru dan siswa berinteraksi dari rumah. Dilengkapi Papan Simbol Balasan Cepat (AAC) untuk komunikasi siswa tunawicara.',
    tag: 'AAC & Papan Simbol',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    path: '/student/inbox',
    targetDisability: 'Siswa Tunawicara'
  },
  {
    id: 'teacher-parent-monitor',
    icon: HiUserGroup,
    title: 'Monitoring Guru & Orang Tua',
    description: 'Dashboard khusus untuk guru mengelola kelas inklusif, serta orang tua memantau perkembangan belajar mandiri anak di rumah.',
    tag: 'Pendampingan Ortu',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    path: '/teacher/dashboard',
    targetDisability: 'Guru & Orang Tua'
  }
];

const sampleAACSymbols = [
  { text: 'Saya Paham 👍', icon: '👍', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { text: 'Mohon Jelaskan ❓', icon: '❓', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
  { text: 'Sudah Selesai ⭐', icon: '⭐', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { text: 'Butuh Bantuan 🙋', icon: '🙋', bg: 'bg-rose-100 text-rose-900 border-rose-300' }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [activeRoleTab, setActiveRoleTab] = useState('tunanetra');
  const [sdClassTab, setSdClassTab] = useState('rendah'); // 'rendah' (1-3) or 'tinggi' (4-6)

  // ACCESSIBILITY TOOLBAR STATES (FOR SD & DISABILITIES)
  const [fontSizeScale, setFontSizeScale] = useState(1); // 1 = Normal, 1.15 = Large, 1.3 = XL
  const [highContrast, setHighContrast] = useState(false);
  const [isPlayingLandingAudio, setIsPlayingLandingAudio] = useState(false);
  const [aacToast, setAacToast] = useState(null);

  // SIMULATOR INTERAKTIF DEMO STATES
  const [simTunanetraPlaying, setSimTunanetraPlaying] = useState(false);
  const [simTunarunguCaption, setSimTunarunguCaption] = useState('Ibu Guru: "Anak-anak, mari buka materi Bab 2 tentang Ekosistem ya!"');
  const [simTunarunguFont, setSimTunarunguFont] = useState('text-sm');

  // Scroll Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Web Speech Synthesis (Read-Aloud Helper)
  const synthRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakText = useCallback((text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95; // Slightly slower & clearer for SD children
    utterance.pitch = 1.05; // Warm, friendly tone
    utterance.onend = () => setIsPlayingLandingAudio(false);
    utterance.onerror = () => setIsPlayingLandingAudio(false);
    setIsPlayingLandingAudio(true);
    synthRef.current.speak(utterance);
  }, []);

  const stopAudio = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlayingLandingAudio(false);
      setSimTunanetraPlaying(false);
    }
  }, []);

  const handleReadLandingPage = () => {
    if (isPlayingLandingAudio) {
      stopAudio();
    } else {
      speakText(
        'Selamat datang di Bintang AI, Ruang Belajar Jarak Jauh SD Inklusif untuk kelas 1 sampai 6. Platform ini ramah untuk siswa Tunanetra dengan arahan suara lisan, siswa Tunarungu dengan teks caption visual, dan siswa Tunawicara dengan tombol balasan cepat. Silakan pilih tombol Daftar untuk bergabung gratis.'
      );
    }
  };

  const { reset: resetAccessibility } = useAccessibilityStore();

  useEffect(() => {
    resetAccessibility();
  }, [resetAccessibility]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      const sections = ['fitur-bimbingan', 'fitur-utama', 'sandbox-disabilitas', 'kesesuaian-sd', 'role-disabilitas'];
      const scrollPosition = window.scrollY + 220;

      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sec);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      stopAudio();
    };
  }, [stopAudio]);

  const go = (path) => {
    stopAudio();
    setMenuOpen(false);
    navigate(path);
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // AAC Symbol Tap Simulator
  const handleSimulateAAC = (symbol) => {
    setAacToast(`Simbol Terpilih: ${symbol.text}`);
    speakText(`Suara Balasan Otomatis: ${symbol.text}`);
    setTimeout(() => setAacToast(null), 3000);
  };

  return (
    <div
      className={`min-h-screen overflow-x-hidden font-sans transition-colors duration-300 relative ${
        highContrast ? 'bg-black text-yellow-300' : 'bg-white text-slate-900'
      }`}
      style={{ fontSize: `${fontSizeScale * 100}%` }}
    >
      {/* SMOOTH SCROLL PROGRESS BAR */}
      <motion.div
        className={`fixed top-0 left-0 right-0 h-1.5 z-[1000] origin-left ${
          highContrast ? 'bg-yellow-400' : 'bg-indigo-600'
        }`}
        style={{ scaleX }}
      />

      {/* 🚀 BAR AKSESIBILITAS UTAMA CLEAN DROPDOWN */}
      <AuthHeaderAccessibilityBar
        spokenTitle="Halaman Beranda BintangAi"
        spokenText="Selamat datang di Bintang AI, Ruang Belajar Jarak Jauh SD Inklusif untuk kelas 1 sampai 6."
        onReadPage={handleReadLandingPage}
      />

      {/* NAVIGASI UTAMA STICKY */}
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          highContrast
            ? 'bg-black border-yellow-400 text-yellow-300'
            : 'bg-white/95 backdrop-blur-xl border-slate-100 text-slate-900'
        }`}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 py-3.5"
          aria-label="Navigasi utama"
        >
          {/* LOGO BINTANGAI */}
          <div
            onClick={() => go('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && go('/')}
          >
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-2xl shadow-md transition-transform group-hover:scale-105 ${
                highContrast
                  ? 'bg-yellow-400 text-black shadow-yellow-400/20'
                  : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-indigo-200'
              }`}
            >
              B
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight block leading-none">
                Bintang<span className={highContrast ? 'text-yellow-400' : 'text-indigo-600'}>Ai</span>
              </span>
              <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-80">
                Ruang Belajar SD Inklusif
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-7">
            <a
              onClick={(e) => scrollToSection(e, 'fitur-bimbingan')}
              href="#fitur-bimbingan"
              className={`text-xs font-bold transition ${
                activeSection === 'fitur-bimbingan'
                  ? highContrast ? 'text-yellow-400 underline font-black' : 'text-indigo-600 font-black'
                  : 'hover:text-indigo-600'
              }`}
            >
              Bimbingan Jarak Jauh
            </a>
            <a
              onClick={(e) => scrollToSection(e, 'sandbox-disabilitas')}
              href="#sandbox-disabilitas"
              className={`text-xs font-bold transition ${
                activeSection === 'sandbox-disabilitas'
                  ? highContrast ? 'text-yellow-400 underline font-black' : 'text-indigo-600 font-black'
                  : 'hover:text-indigo-600'
              }`}
            >
              Simulator 3 Role Disabilitas
            </a>
            <a
              onClick={(e) => scrollToSection(e, 'kesesuaian-sd')}
              href="#kesesuaian-sd"
              className={`text-xs font-bold transition ${
                activeSection === 'kesesuaian-sd'
                  ? highContrast ? 'text-yellow-400 underline font-black' : 'text-indigo-600 font-black'
                  : 'hover:text-indigo-600'
              }`}
            >
              Kesesuaian SD 1-6
            </a>
            <a
              onClick={(e) => scrollToSection(e, 'fitur-utama')}
              href="#fitur-utama"
              className={`text-xs font-bold transition ${
                activeSection === 'fitur-utama'
                  ? highContrast ? 'text-yellow-400 underline font-black' : 'text-indigo-600 font-black'
                  : 'hover:text-indigo-600'
              }`}
            >
              Fitur Lengkap
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <button
              type="button"
              onClick={() => go('/auth/login')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                highContrast
                  ? 'border border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
                  : 'text-indigo-600 hover:bg-indigo-50 border border-transparent'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => go('/auth/register')}
              className={`rounded-xl px-5 py-2.5 text-xs font-black shadow-md transition-all active:scale-95 ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              Daftar Gratis SD
            </button>
          </div>

          <button
            type="button"
            className="rounded-xl border p-2.5 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            <span className="text-xl font-bold">{menuOpen ? '×' : '☰'}</span>
          </button>
        </nav>

        {menuOpen && (
          <div className={`border-t px-5 py-4 shadow-lg lg:hidden ${highContrast ? 'bg-black border-yellow-400' : 'bg-white'}`}>
            <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs font-bold">
              <a onClick={(e) => scrollToSection(e, 'fitur-bimbingan')} href="#fitur-bimbingan" className="py-2">Bimbingan Jarak Jauh</a>
              <a onClick={(e) => scrollToSection(e, 'sandbox-disabilitas')} href="#sandbox-disabilitas" className="py-2">Simulator 3 Disabilitas</a>
              <a onClick={(e) => scrollToSection(e, 'kesesuaian-sd')} href="#kesesuaian-sd" className="py-2">Kesesuaian SD 1-6</a>
              <a onClick={(e) => scrollToSection(e, 'fitur-utama')} href="#fitur-utama" className="py-2">Fitur Lengkap</a>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                <button type="button" onClick={() => go('/auth/login')} className="rounded-xl border py-2.5 text-center">Masuk</button>
                <button type="button" onClick={() => go('/auth/register')} className="rounded-xl bg-indigo-600 text-white py-2.5 text-center">Daftar SD</button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className={`relative overflow-hidden ${highContrast ? 'bg-black' : 'bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/80'}`}>
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-8 py-12 sm:py-20 lg:grid-cols-12">

            {/* LEFT COLUMN: HERO INTRO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold border shadow-2xs ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300'
                  : 'bg-white text-indigo-700 border-indigo-200'
              }`}>
                <span>🌟 Belajar Dari Rumah Inklusif SD Kelas 1–6</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
                Platform Belajar Dari Rumah
                <span className={`block mt-1 ${highContrast ? 'text-yellow-300' : 'text-indigo-600'}`}>
                  Ramah Anak SD Disabilitas
                </span>
              </h1>

              <p className={`text-sm sm:text-base leading-relaxed max-w-2xl font-medium ${highContrast ? 'text-yellow-100' : 'text-slate-600'}`}>
                BintangAi dirancang khusus membantu siswa SD kelas 1–6 (Tunanetra, Tunarungu, dan Tunawicara) belajar mandiri dari rumah dengan aman, seru, serta selalu mendapat bimbingan terarah dari guru dan asisten AI Kak Bintang.
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => go('/auth/register')}
                  className={`inline-flex items-center justify-center min-h-[48px] rounded-2xl px-7 py-4 text-sm font-black shadow-lg transition-all active:scale-95 w-full sm:w-auto ${
                    highContrast
                      ? 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-yellow-400/20'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-300'
                  }`}
                >
                  Mulai Belajar Sekarang 🚀
                </button>

                <button
                  type="button"
                  onClick={(e) => scrollToSection(e, 'sandbox-disabilitas')}
                  className={`inline-flex items-center justify-center min-h-[48px] rounded-2xl border px-6 py-4 text-sm font-bold transition-all w-full sm:w-auto ${
                    highContrast
                      ? 'border-yellow-400 text-yellow-300 hover:bg-yellow-400 hover:text-black'
                      : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  🎯 Coba Simulator 3 Disabilitas
                </button>
              </div>

              {/* QUICK FEATURE BADGES */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-extrabold pt-3">
                <span className="inline-flex items-center gap-1.5"><HiCheckCircle className="text-indigo-600 text-base" /> Bimbingan Guru Real-time</span>
                <span className="inline-flex items-center gap-1.5"><HiCheckCircle className="text-indigo-600 text-base" /> Tutor AI Tanpa Markdown Rumit</span>
                <span className="inline-flex items-center gap-1.5"><HiCheckCircle className="text-indigo-600 text-base" /> Papan Simbol AAC & Gesture</span>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: KAK BINTANG AVATAR & INTERACTIVE CARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 relative"
            >
              <div className={`rounded-3xl border p-6 shadow-xl space-y-4 ${
                highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-slate-200'
              }`}>
                {/* AVATAR HEADER */}
                <div className="flex items-center gap-4 border-b pb-4 border-slate-100">
                  <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                    <BintangAvatar size="sm" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base">Kak Bintang AI Tutor SD</h3>
                    <p className="text-xs text-indigo-600 font-extrabold flex items-center gap-1 mt-0.5">
                      Sahabat Belajar Pintar Anak SD
                    </p>
                  </div>
                </div>

                {/* SPEECH BUBBLE */}
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                  highContrast ? 'bg-yellow-950/40 border-yellow-400 text-yellow-200' : 'bg-indigo-50/90 border-indigo-100 text-indigo-950'
                }`}>
                  <p className="font-bold">
                    "Halo Teman-teman SD! 🌟 Aku Kak Bintang. Mau belajar Matematika, IPA, atau Bahasa Indonesia hari ini? Kamu bisa mendengarkan suaraku, membaca tulisan besar, atau mengetuk gambar simbol!"
                  </p>
                </div>

                {/* DISABILITY ROLES BADGES */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold ${
                    highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    👁️ Tunanetra<br/><span className="text-[9px] font-semibold">Suara Lisan</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold ${
                    highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}>
                    👂 Tunarungu<br/><span className="text-[9px] font-semibold">Live Caption</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold ${
                    highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-purple-50 border-purple-200 text-purple-900'
                  }`}>
                    💬 Tunawicara<br/><span className="text-[9px] font-semibold">Simbol AAC</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🎯 SECTION SIMULATOR INTERAKTIF 3 ROLE DISABILITAS (DISABILITY SANDBOX SIMULATOR) */}
        <section id="sandbox-disabilitas" className={`scroll-mt-28 px-4 sm:px-8 py-16 sm:py-24 border-y ${
          highContrast ? 'bg-black border-yellow-400' : 'bg-slate-50/70 border-slate-200/80'
        }`}>
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-indigo-100 text-indigo-800 border-indigo-200'
              }`}>
                Uji Coba Langsung 3 Role Disabilitas
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-snug">
                Coba Simulasi Antarmuka Aksesibilitas
              </h2>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${highContrast ? 'text-yellow-100' : 'text-slate-600'}`}>
                Klik tab di bawah untuk mempraktikkan bagaimana BintangAi menyesuaikan fitur secara otomatis untuk siswa Tunanetra, Tunarungu, dan Tunawicara.
              </p>
            </div>

            {/* SIMULATOR TAB NAVIGATION */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-md space-y-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setActiveRoleTab('tunanetra')}
                  className={`py-3 px-3 rounded-xl transition-all font-extrabold ${
                    activeRoleTab === 'tunanetra'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  👁️ Simulasi Tunanetra
                </button>
                <button
                  onClick={() => setActiveRoleTab('tunarungu')}
                  className={`py-3 px-3 rounded-xl transition-all font-extrabold ${
                    activeRoleTab === 'tunarungu'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  👂 Simulasi Tunarungu
                </button>
                <button
                  onClick={() => setActiveRoleTab('tunawicara')}
                  className={`py-3 px-3 rounded-xl transition-all font-extrabold ${
                    activeRoleTab === 'tunawicara'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  💬 Simulasi Tunawicara
                </button>
              </div>

              {/* DYNAMIC SIMULATOR CONTENT */}
              <AnimatePresence mode="wait">
                {/* 👁️ SIMULATOR TUNANETRA */}
                {activeRoleTab === 'tunanetra' && (
                  <motion.div
                    key="tunanetra-sim"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                      <h4 className="font-black text-amber-950 text-sm flex items-center justify-between">
                        <span>🔊 Pembacaan Suara Paragraf W3C (TTS)</span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-md font-bold">Dukungan Screen Reader</span>
                      </h4>
                      <p className="text-xs text-amber-900 font-medium leading-relaxed">
                        Siswa tunanetra dapat mendengarkan pembacaan materi paragraf demi paragraf tanpa perlu melihat layar.
                      </p>
                    </div>

                    <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4 shadow-inner">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                        <span>Paragraf 1 dari Modul IPA Kelas 4 SD:</span>
                        <span>TTS Rate: 0.95x</span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed italic bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                        "Tumbuhan hijau memasak makanannya sendiri melalui proses fotosintesis dengan bantuan sinar matahari."
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => {
                            if (simTunanetraPlaying) {
                              stopAudio();
                              setSimTunanetraPlaying(false);
                            } else {
                              setSimTunanetraPlaying(true);
                              speakText("Paragraf satu: Tumbuhan hijau memasak makanannya sendiri melalui proses fotosintesis dengan bantuan sinar matahari.");
                            }
                          }}
                          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 active:scale-95 transition"
                        >
                          {simTunanetraPlaying ? <HiPause className="text-base" /> : <HiPlay className="text-base" />}
                          <span>{simTunanetraPlaying ? 'Hentikan Audio' : 'Putar Audio Suara Lisan'}</span>
                        </button>
                        <span className="text-[11px] text-slate-400 font-bold">
                          💡 Tekan tombol Spasi di keyboard untuk Play/Pause
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 👂 SIMULATOR TUNARUNGU */}
                {activeRoleTab === 'tunarungu' && (
                  <motion.div
                    key="tunarungu-sim"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                      <h4 className="font-black text-emerald-950 text-sm flex items-center justify-between">
                        <span>👂 Mata Pintar Live Caption HUD HUD</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-md font-bold">Transkripsi Real-time</span>
                      </h4>
                      <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                        Ucapan guru dikonversi menjadi teks caption transparan berdefinisi tinggi di layar siswa tunarungu.
                      </p>
                    </div>

                    {/* HUD CAPTION PREVIEW */}
                    <div className="p-6 bg-slate-950 text-white rounded-2xl space-y-4 border border-emerald-500/40 relative overflow-hidden">
                      <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-3">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" /> Live Caption Aktif
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => setSimTunarunguFont('text-xs')} className="px-2 py-0.5 bg-slate-800 text-[10px] rounded font-bold">Teks S</button>
                          <button onClick={() => setSimTunarunguFont('text-sm')} className="px-2 py-0.5 bg-slate-800 text-[10px] rounded font-bold">Teks M</button>
                          <button onClick={() => setSimTunarunguFont('text-base')} className="px-2 py-0.5 bg-slate-800 text-[10px] rounded font-bold">Teks L</button>
                        </div>
                      </div>

                      <div className={`p-4 bg-black/80 border border-emerald-500/30 rounded-xl font-bold text-emerald-300 leading-relaxed ${simTunarunguFont}`}>
                        {simTunarunguCaption}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setSimTunarunguCaption('Ibu Guru: "Siapa yang tahu apa fungsi akar pada tumbuhan?"')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold"
                        >
                          Simulasi Ucapan Guru 1
                        </button>
                        <button
                          onClick={() => setSimTunarunguCaption('Ibu Guru: "Bagus sekali Bintang! Akar menyerap air dari dalam tanah."')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold"
                        >
                          Simulasi Ucapan Guru 2
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 💬 SIMULATOR TUNAWICARA */}
                {activeRoleTab === 'tunawicara' && (
                  <motion.div
                    key="tunawicara-sim"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                      <h4 className="font-black text-purple-950 text-sm flex items-center justify-between">
                        <span>💬 Papan Simbol AAC (Augmentative Communication)</span>
                        <span className="text-[10px] bg-purple-200 text-purple-900 px-2.5 py-0.5 rounded-md font-bold">Respons 1-Ketuk</span>
                      </h4>
                      <p className="text-xs text-purple-900 font-medium leading-relaxed">
                        Siswa tunawicara cukup mengetuk kartu gambar simbol untuk langsung bersuara dan membalas guru tanpa perlu mengetik.
                      </p>
                    </div>

                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                      <p className="text-xs font-bold text-slate-700">Coba Ketuk Papan Simbol Balasan Cepat Siswa di Bawah Ini:</p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {sampleAACSymbols.map((sym) => (
                          <button
                            key={sym.text}
                            onClick={() => handleSimulateAAC(sym)}
                            className={`p-4 rounded-2xl border font-black text-xs flex flex-col items-center gap-2 transition hover:scale-105 active:scale-95 shadow-xs ${sym.bg}`}
                          >
                            <span className="text-3xl">{sym.icon}</span>
                            <span className="text-center">{sym.text}</span>
                          </button>
                        ))}
                      </div>

                      {aacToast && (
                        <div className="p-3 bg-purple-600 text-white rounded-xl text-xs font-bold text-center animate-bounce">
                          {aacToast}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* 📚 KESESUAIAN SD KELAS 1–6 (GRADE LEVEL ADAPTABILITY SECTION) */}
        <section id="kesesuaian-sd" className="scroll-mt-28 px-4 sm:px-8 py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
                highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                Disesuaikan Berdasarkan Usia Anak
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-snug">
                Pendekatan Belajar Khusus SD Kelas 1–6
              </h2>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed ${highContrast ? 'text-yellow-100' : 'text-slate-600'}`}>
                BintangAi memisahkan pendekatan antarmuka untuk tingkat kelas rendah (SD 1–3) dan kelas tinggi (SD 4–6).
              </p>
            </div>

            {/* CLASS TAB SWITCHER */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setSdClassTab('rendah')}
                className={`px-6 py-3 rounded-2xl text-xs font-extrabold transition-all border ${
                  sdClassTab === 'rendah'
                    ? highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🏫 Kelas 1, 2, & 3 SD (Kelas Rendah)
              </button>
              <button
                onClick={() => setSdClassTab('tinggi')}
                className={`px-6 py-3 rounded-2xl text-xs font-extrabold transition-all border ${
                  sdClassTab === 'tinggi'
                    ? highContrast ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🎓 Kelas 4, 5, & 6 SD (Kelas Tinggi)
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {sdClassTab === 'rendah' ? (
                <>
                  <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-3xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-lg flex items-center justify-center">1</div>
                    <h3 className="font-bold text-slate-900 text-base">Fokus Bahasa Bergambar & Suara</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Anak-anak kelas 1-3 SD yang baru belajar membaca didukung dengan tombol berukuran ekstra besar, ikon visual yang kontras, serta panduan suara otomatis Kak Bintang.
                    </p>
                  </div>

                  <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center">2</div>
                    <h3 className="font-bold text-slate-900 text-base">Penyederhanaan Materi & Tanpa Markdown</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Jawaban AI dan teks modul diketik menggunakan bahasa anak-anak yang polos tanpa simbol matematika rumit atau format markdown yang membingungkan.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 bg-indigo-50/70 border border-indigo-200 rounded-3xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center">3</div>
                    <h3 className="font-bold text-slate-900 text-base">Gamifikasi & Poin XP Belajar</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Siswa kelas 4-6 SD termotivasi dengan perolehan XP kuis, Streak Harian 🔥, papan peringkat teman sekelas, serta kuis interaktif berdurasi fleksibel.
                    </p>
                  </div>

                  <div className="p-6 bg-purple-50/70 border border-purple-200 rounded-3xl space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-lg flex items-center justify-center">4</div>
                    <h3 className="font-bold text-slate-900 text-base">Kuis Gesture Tangan & Diskusi Kelompok</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Siswa dapat menjawab kuis menggunakan isyarat jari di depan kamera HP/laptop serta bergabung dalam grup kolaborasi inklusif.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* FITUR LENGKAP APLIKASI */}
        <section id="fitur-utama" className="scroll-mt-28 px-4 sm:px-8 py-16 sm:py-24 bg-slate-50/60 border-t border-slate-100">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <span className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-extrabold uppercase tracking-wider">
                Fitur Lengkap Platform
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug">
                Solusi Pembelajaran Inklusif Terpadu
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {appFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -5 }}
                    onClick={() => go(item.path)}
                    className={`p-6 rounded-3xl border shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                      highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${item.color}`}>
                          <Icon />
                        </div>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-extrabold">
                          {item.targetDisability}
                        </span>
                      </div>
                      <h3 className="font-black text-base group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-indigo-600">
                      <span>Buka Fitur</span>
                      <HiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="px-4 sm:px-8 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-8 sm:p-14 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-indigo-100 inline-block">
                Aksesibilitas Untuk Semua Anak SD
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                Mari Wujudkan Ruang Belajar Jarak Jauh Yang Ramah & Inklusif
              </h2>
              <p className="text-xs sm:text-sm font-medium text-indigo-100/90 leading-relaxed">
                Daftarkan akun siswa, guru, atau orang tua hari ini secara gratis. Pengalaman belajar dari rumah anak Anda menjadi lebih mandiri, seru, dan terarah.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => go('/auth/register')}
                className="px-7 py-4 bg-white text-indigo-900 font-black rounded-2xl shadow-lg hover:bg-indigo-50 transition-all text-sm text-center active:scale-95"
              >
                Daftar Akun Baru Gratis 🚀
              </button>
              <button
                type="button"
                onClick={() => go('/auth/login')}
                className="px-6 py-4 bg-indigo-900/80 hover:bg-indigo-900 border border-indigo-400/40 text-white font-bold rounded-2xl transition-all text-sm text-center"
              >
                Masuk Akun / Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FLOATING BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className={`fixed bottom-6 right-6 z-[200] p-3.5 rounded-2xl shadow-xl transition-all flex items-center justify-center group ${
              highContrast ? 'bg-yellow-400 text-black' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
            title="Kembali ke Atas"
            aria-label="Kembali ke bagian atas halaman"
          >
            <HiChevronUp className="text-xl group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default LandingPage;

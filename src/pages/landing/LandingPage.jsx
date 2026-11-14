import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import Footer from '@/components/layout/Footer';
import {
  HiArrowRight,
  HiBookOpen,
  HiCheckCircle,
  HiMicrophone,
  HiChatAlt2,
  HiUserGroup,
  HiVolumeUp,
  HiChevronUp,
  HiSparkles,
  HiStar,
  HiLightningBolt,
  HiAnnotation,
  HiHome,
  HiAcademicCap
} from 'react-icons/hi';

const appFeatures = [
  {
    icon: HiChatAlt2,
    title: 'AI Tutor Kak Bintang',
    description: 'Sahabat belajar pintar berkarakter ramah yang menjawab pertanyaan siswa SD kelas 1-6 dengan bahasa sederhana tanpa simbol markdown.',
    tag: 'Tutor AI SD',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    path: '/student/tanya-ai'
  },
  {
    icon: HiBookOpen,
    title: 'Materi Belajar Interaktif',
    description: 'Perpustakaan modul SD dengan pembacaan suara paragraf W3C, pengubah ukuran teks (S/M/L/XL), dan tombol Tap-to-Ask 1-ketuk.',
    tag: 'Modul SD',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    path: '/student/modules'
  },
  {
    icon: HiMicrophone,
    title: 'Mata Pintar – Live Caption',
    description: 'Transkripsi ucapan arahan guru secara real-time menjadi teks caption jernih di layar untuk siswa tunarungu.',
    tag: 'Dukungan Tunarungu',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    path: '/student/live-captions'
  },
  {
    icon: HiLightningBolt,
    title: 'QuizKu Adaptif & Gamifikasi',
    description: 'Kuis interaktif AI, perolehan XP belajar, Streak Harian 🔥, serta peringkat papan juara yang memotivasi.',
    tag: 'Kuis & XP',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    path: '/student/tasks'
  },
  {
    icon: HiAnnotation,
    title: 'Bimbingan Jarak Jauh Multi-Role',
    description: 'Guru dan siswa berinteraksi jarak jauh dari rumah untuk role Tunanetra (Suara Lisan), Tunarungu (Caption Live), dan Tunawicara (Balasan Cepat).',
    tag: 'Belajar Dari Rumah',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    path: '/student/inbox'
  },
  {
    icon: HiUserGroup,
    title: 'Monitoring Guru & Orang Tua',
    description: 'Dashboard khusus untuk guru mengelola tugas/modul, serta orang tua memantau dan mendampingi belajar mandiri anak di rumah.',
    tag: 'Pendampingan',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    path: '/teacher/dashboard'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [activeRoleTab, setActiveRoleTab] = useState('tunanetra');
  const reduceMotion = useReducedMotion();

  // Scroll Progress Indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      const sections = ['fitur-bimbingan', 'fitur-utama', 'role-disabilitas'];
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const go = (path) => {
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

  const fadeInVariants = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-950 relative">
      {/* SMOOTH SCROLL PROGRESS BAR */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 z-[1000] origin-left" style={{ scaleX }} />

      {/* Navigasi Sticky */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl transition-all duration-300">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 py-4"
          aria-label="Navigasi utama"
        >
          {/* LOGO BINTANGAI (LOGO B SEBELUMNYA) */}
          <div
            onClick={() => go('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform select-none">
              B
            </div>
            <div>
              <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight block leading-none">
                Bintang<span className="text-indigo-600">Ai</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                Ruang Belajar SD Inklusif
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-8 lg:flex">
            <a
              onClick={(e) => scrollToSection(e, 'fitur-bimbingan')}
              href="#fitur-bimbingan"
              className={`text-xs font-bold transition ${
                activeSection === 'fitur-bimbingan' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Bimbingan Jarak Jauh
            </a>
            <a
              onClick={(e) => scrollToSection(e, 'fitur-utama')}
              href="#fitur-utama"
              className={`text-xs font-bold transition ${
                activeSection === 'fitur-utama' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              Fitur Belajar Mandiri
            </a>
            <a
              onClick={(e) => scrollToSection(e, 'role-disabilitas')}
              href="#role-disabilitas"
              className={`text-xs font-bold transition ${
                activeSection === 'role-disabilitas' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
              }`}
            >
              3 Role Disabilitas
            </a>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => go('/auth/login')}
              className="rounded-xl px-4 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50"
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => go('/auth/register')}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
            >
              Daftar Gratis <HiArrowRight className="ml-1 inline" />
            </button>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            <span className="text-xl font-bold">{menuOpen ? '×' : '☰'}</span>
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-lg lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              <a onClick={(e) => scrollToSection(e, 'fitur-bimbingan')} href="#fitur-bimbingan" className="rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50">Bimbingan Jarak Jauh</a>
              <a onClick={(e) => scrollToSection(e, 'fitur-utama')} href="#fitur-utama" className="rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50">Fitur Belajar Mandiri</a>
              <a onClick={(e) => scrollToSection(e, 'role-disabilitas')} href="#role-disabilitas" className="rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50">3 Role Disabilitas</a>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => go('/auth/login')} className="rounded-xl border border-indigo-200 px-4 py-2.5 text-xs font-bold text-indigo-600">Masuk</button>
                <button type="button" onClick={() => go('/auth/register')} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white">Daftar</button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70">
          <div className="pointer-events-none absolute -right-28 top-10 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-8 py-12 sm:py-20 lg:grid-cols-12">
            <motion.div {...fadeInVariants} className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-indigo-700 shadow-2xs">
                <HiStar className="text-amber-500 text-sm animate-pulse" />
                Ruang Belajar Jarak Jauh SD Inklusif
              </div>

              <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-slate-900">
                Platform Belajar Dari Rumah
                <span className="text-indigo-600 block">Ramah Anak SD Disabilitas</span>
              </h1>

              <p className="text-xs sm:text-base leading-relaxed text-slate-600 max-w-2xl font-normal">
                BintangAi mendampingi siswa SD kelas 1–6 (Tunanetra, Tunarungu, Tunawicara) belajar jarak jauh dari rumah dengan menyenangkan. Siswa dapat belajar mandiri secara terarah dan tetap terhubung aktif dengan guru.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => go('/auth/register')}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  Mulai Belajar Di Rumah 🚀
                </button>
                <button
                  type="button"
                  onClick={() => go('/auth/login')}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Masuk / Akun Demo
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500 pt-3">
                <span className="inline-flex items-center gap-1.5"><HiCheckCircle className="text-indigo-600" /> Belajar Jarak Jauh</span>
                <span className="inline-flex items-center gap-1.5"><HiCheckCircle className="text-indigo-600" /> Pendampingan Guru & AI Tutor</span>
                <span className="inline-flex items-center gap-1.5"><HiCheckCircle className="text-indigo-600" /> Ramah 3 Role Disabilitas</span>
              </div>
            </motion.div>

            {/* CARD INTERAKSI BELAJAR DARI RUMAH (INTERACTION DEMO CARD) */}
            <motion.div {...fadeInVariants} className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-amber-200">
                      <HiStar className="text-2xl text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Interaksi Belajar Dari Rumah</h3>
                      <p className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                        <HiHome /> Belajar Mandiri SD
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold">
                    SD Kelas 1-6
                  </span>
                </div>

                {/* Dialog Pembelajaran Jarak Jauh Guru & Siswa */}
                <div className="space-y-2.5 text-xs">
                  {/* Guru */}
                  <div className="p-3 bg-indigo-50/90 border border-indigo-100 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-indigo-700">👩‍🏫 Ibu Guru Ratna</span>
                      <span className="text-indigo-500 font-semibold">Guru Kelas</span>
                    </div>
                    <p className="font-medium text-slate-800 leading-relaxed">
                      "Halo Bintang! Apakah materi IPA bab Rantai Makanan sudah kamu baca di rumah hari ini?"
                    </p>
                  </div>

                  {/* Siswa */}
                  <div className="p-3 bg-slate-100/80 border border-slate-200/80 rounded-2xl space-y-1 ml-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-700">👧 Bintang</span>
                      <span className="text-slate-500">Siswa Belajar Dari Rumah</span>
                    </div>
                    <p className="font-medium text-slate-800 leading-relaxed">
                      "Sudah Ibu Guru! Saya mau bertanya, katak itu masuk konsumen tingkat kesatu atau kedua ya?"
                    </p>
                  </div>

                  {/* Guru Penjelasan */}
                  <div className="p-3 bg-indigo-50/90 border border-indigo-100 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-indigo-700">👩‍🏫 Ibu Guru Ratna</span>
                    </div>
                    <p className="font-medium text-slate-800 leading-relaxed">
                      "Pertanyaan bagus Bintang! Katak memakan belalang (pemakan tumbuhan), jadi katak termasuk konsumen tingkat dua ya!"
                    </p>
                  </div>

                  {/* Siswa Paham */}
                  <div className="p-3 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl space-y-1 ml-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-emerald-800">👧 Bintang</span>
                      <span className="text-emerald-600 font-bold">Paham Pembelajaran</span>
                    </div>
                    <p className="font-medium text-emerald-950 leading-relaxed">
                      "Wah, terima kasih banyak Ibu Guru Ratna! Sekarang Bintang sudah paham!"
                    </p>
                  </div>
                </div>

                {/* Badge Role Disabilitas */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 bg-amber-50 border border-amber-200/60 rounded-xl text-[10px] font-bold text-amber-800">
                    👁️ Tunanetra
                  </div>
                  <div className="p-2 bg-emerald-50 border border-emerald-200/60 rounded-xl text-[10px] font-bold text-emerald-800">
                    👂 Tunarungu
                  </div>
                  <div className="p-2 bg-purple-50 border border-purple-200/60 rounded-xl text-[10px] font-bold text-purple-800">
                    💬 Tunawicara
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURE HIGHLIGHT: BIMBINGAN JARAK JAUH DARI RUMAH */}
        <section id="fitur-bimbingan" className="scroll-mt-24 px-4 sm:px-8 py-16 sm:py-24 bg-slate-50/60 border-y border-slate-100">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 w-fit mx-auto">
                <HiHome className="text-sm" /> Pembelajaran Jarak Jauh Inklusif
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug">
                Pendampingan Guru & Interaksi Belajar Dari Rumah
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Guru dapat memberikan bimbingan mandiri, menyiarkan arahan suara, dan membagikan modul belajar langsung ke rumah siswa. Sistem BintangAi menyesuaikan format tampilan interaksi secara otomatis berdasarkan kebutuhan siswa.
              </p>
            </div>

            {/* Interactive Role Tabs Demo */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-md space-y-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setActiveRoleTab('tunanetra')}
                  className={`py-2.5 px-3 rounded-xl transition-all ${
                    activeRoleTab === 'tunanetra' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👁️ Siswa Tunanetra
                </button>
                <button
                  onClick={() => setActiveRoleTab('tunarungu')}
                  className={`py-2.5 px-3 rounded-xl transition-all ${
                    activeRoleTab === 'tunarungu' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👂 Siswa Tunarungu
                </button>
                <button
                  onClick={() => setActiveRoleTab('tunawicara')}
                  className={`py-2.5 px-3 rounded-xl transition-all ${
                    activeRoleTab === 'tunawicara' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  💬 Siswa Tunawicara
                </button>
              </div>

              {/* Dynamic Content Preview per Role */}
              <AnimatePresence mode="wait">
                {activeRoleTab === 'tunanetra' && (
                  <motion.div
                    key="tunanetra"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900 uppercase">Aksesibilitas Tunanetra</span>
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">Suara Lisan TTS</span>
                      </div>
                      <p className="text-xs text-amber-900 font-medium leading-relaxed">
                        Pesan dan petunjuk dari guru dibacakan lisan (TTS) secara otomatis dengan sistem antrean suara otomatis yang rapi.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <p className="text-xs font-bold text-slate-700">Contoh Instruksi Bimbingan Jarak Jauh (Guru ➔ Siswa Tunanetra):</p>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-medium">
                          <strong>Guru:</strong> "Bintang, hari ini coba dengarkan pembacaan materi IPA bab 2 ya!"
                        </div>
                        <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 font-medium flex items-center gap-2">
                          <HiVolumeUp className="text-indigo-600 text-base shrink-0" />
                          <span><strong>Sistem (Suara Lisan):</strong> "Pesan baru dari Ibu Guru: Bintang, hari ini coba dengarkan pembacaan materi IPA bab 2 ya!"</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeRoleTab === 'tunarungu' && (
                  <motion.div
                    key="tunarungu"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 uppercase">Aksesibilitas Tunarungu</span>
                        <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">Mata Pintar HUD</span>
                      </div>
                      <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                        Ucapan arahan dari guru saat bimbingan jarak jauh ditranskripsi menjadi teks caption jernih pada HUD Mata Pintar di layar siswa.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <p className="text-xs font-bold text-slate-700">Contoh Live Caption Bimbingan Jarak Jauh (Guru ➔ Siswa Tunarungu):</p>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-medium">
                          <strong>Guru Bicara di Mikrofon:</strong> "Anak-anak, hari ini kita belajar tentang perkalian bilangan."
                        </div>
                        <div className="p-2.5 bg-emerald-100/70 border border-emerald-200 rounded-xl text-emerald-950 font-bold flex items-center gap-2">
                          <HiMicrophone className="text-emerald-700 text-base shrink-0" />
                          <span><strong>Mata Pintar HUD:</strong> "Anak-anak, hari ini kita belajar tentang perkalian bilangan."</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeRoleTab === 'tunawicara' && (
                  <motion.div
                    key="tunawicara"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-purple-50 border border-purple-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-900 uppercase">Aksesibilitas Tunawicara</span>
                        <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-md">Balasan Cepat 1-Ketuk</span>
                      </div>
                      <p className="text-xs text-purple-900 font-medium leading-relaxed">
                        Siswa tunawicara dapat membalas pesan arahan dari guru secara cepat cukup dengan 1 ketukan tombol tanpa mengetik teks panjang.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <p className="text-xs font-bold text-slate-700">Contoh Respon Balasan Cepat (Siswa Tunawicara ➔ Guru):</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl">
                          👍 Siap Ibu, Saya Paham
                        </span>
                        <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl">
                          ❓ Mohon Jelaskan Lagi
                        </span>
                        <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl">
                          ⭐ Kuis Sudah Selesai!
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* FITUR UTAMA APLIKASI */}
        <section id="fitur-utama" className="scroll-mt-24 px-4 sm:px-8 py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Fitur Lengkap BintangAi
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug">
                Fitur Pembelajaran Inklusif Di Rumah
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Dirancang khusus untuk mendukung kegiatan belajar mandiri anak di rumah maupun bimbingan terarah dari guru.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {appFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -4 }}
                    onClick={() => go(item.path)}
                    className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border ${item.color}`}>
                          <Icon />
                        </div>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-normal leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                      <span>Buka Fitur</span>
                      <HiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3 ROLE DISABILITAS SISWA */}
        <section id="role-disabilitas" className="scroll-mt-24 px-4 sm:px-8 py-16 sm:py-24 bg-slate-50/60 border-t border-slate-100">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Penyesuaian Antarmuka
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 leading-snug">
                Mendukung 3 Role Disabilitas Siswa SD
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                Antarmuka BintangAi menyesuaikan secara otomatis berdasarkan role pendaftaran siswa.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="p-7 bg-white rounded-3xl border border-amber-200/80 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl font-bold border border-amber-200">
                  👁️
                </div>
                <h3 className="text-lg font-bold text-slate-900">Siswa Tunanetra</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Navigasi suara otomatis Kak Bintang, pembacaan teks lisan (TTS), dukungan pembaca layar W3C, dan umpan balik audio.
                </p>
                <div className="p-3 bg-amber-50/50 rounded-xl text-[11px] font-bold text-amber-900">
                  Fitur: Pembacaan Paragraf Lisan + Deskripsi Gambar W3C
                </div>
              </div>

              <div className="p-7 bg-white rounded-3xl border border-emerald-200/80 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-bold border border-emerald-200">
                  👂
                </div>
                <h3 className="text-lg font-bold text-slate-900">Siswa Tunarungu</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Mata Pintar HUD Transkripsi ucapan real-time, penyorotan teks paragraf aktif, serta penanda visual berpemfokusan tinggi.
                </p>
                <div className="p-3 bg-emerald-50/50 rounded-xl text-[11px] font-bold text-emerald-900">
                  Fitur: Live Caption HUD + Teks Penyorotan Visual
                </div>
              </div>

              <div className="p-7 bg-white rounded-3xl border border-purple-200/80 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl font-bold border border-purple-200">
                  💬
                </div>
                <h3 className="text-lg font-bold text-slate-900">Siswa Tunawicara</h3>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Tombol Tap-to-Ask 1-ketuk, respon balasan cepat ke guru, serta reaksi emoji tanpa perlu mengetik teks panjang.
                </p>
                <div className="p-3 bg-purple-50/50 rounded-xl text-[11px] font-bold text-purple-900">
                  Fitur: Pertanyaan 1-Ketuk + Reaksi Emoji Interaktif
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA REGISTRATION BANNER */}
        <section className="px-4 sm:px-8 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-indigo-100 inline-block">
                Mari Bergabung Bersama BintangAi
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold leading-tight">
                Siap Mendukung Pembelajaran Jarak Jauh Anak Anda Di Rumah?
              </h2>
              <p className="text-xs sm:text-sm font-normal text-indigo-100/90 leading-relaxed">
                Daftarkan akun siswa, guru, atau orang tua secara gratis dan rasakan kemudahan belajar mandiri dari rumah bersama Kak Bintang.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => go('/auth/register')}
                className="px-6 py-3.5 bg-white text-indigo-700 font-bold rounded-xl shadow-md hover:bg-indigo-50 transition-all text-xs sm:text-sm text-center"
              >
                Daftar Akun Baru
              </button>
              <button
                type="button"
                onClick={() => go('/auth/login')}
                className="px-6 py-3.5 bg-indigo-800/80 hover:bg-indigo-800 border border-indigo-400/40 text-white font-bold rounded-xl transition-all text-xs sm:text-sm text-center"
              >
                Masuk Akun
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
            className="fixed bottom-6 right-6 z-[200] p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl transition-all flex items-center justify-center group"
            title="Kembali ke Atas"
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

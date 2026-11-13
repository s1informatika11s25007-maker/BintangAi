import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
  HiAcademicCap,
  HiArrowRight,
  HiBookOpen,
  HiCheckCircle,
  HiEye,
  HiHand,
  HiHeart,
  HiHome,
  HiMicrophone,
  HiChatAlt2,
  HiUserGroup,
  HiVolumeUp,
  HiChevronUp
} from 'react-icons/hi';

const features = [
  {
    icon: HiBookOpen,
    title: 'Materi dan latihan',
    description:
      'Siswa mempelajari modul, mengerjakan kuis, dan mengulang materi sesuai ritme belajarnya.',
    tag: 'Belajar mandiri',
  },
  {
    icon: HiChatAlt2,
    title: 'AI Tutor Kak Bintang',
    description:
      'Pendamping untuk bertanya dan meminta penjelasan materi dengan bahasa yang lebih sederhana.',
    tag: 'Pendamping belajar',
  },
  {
    icon: HiVolumeUp,
    title: 'Dukungan suara',
    description:
      'Teks dapat dibacakan melalui fitur suara yang didukung browser untuk membantu akses materi.',
    tag: 'Dukungan tunanetra',
  },
  {
    icon: HiMicrophone,
    title: 'Mata Pintar – Caption',
    description:
      'Ucapan yang tertangkap mikrofon dapat ditampilkan sebagai teks melalui pengenalan suara browser.',
    tag: 'Dukungan tunarungu',
  },
  {
    icon: HiHand,
    title: 'Kontrol gestur dasar',
    description:
      'Kontrol gerakan tangan tersedia pada bagian tertentu. Fitur ini bukan penerjemah BISINDO atau SIBI.',
    tag: 'Akses alternatif',
  },
  {
    icon: HiUserGroup,
    title: 'Pendampingan keluarga',
    description:
      'Orang tua dan guru dapat mendukung proses belajar melalui peran dan halaman pemantauan masing-masing.',
    tag: 'Rumah dan sekolah',
  },
];

const learningSteps = [
  {
    number: '01',
    title: 'Guru menyiapkan materi',
    description: 'Guru membagikan materi dan tugas yang sesuai dengan tingkat belajar siswa.',
  },
  {
    number: '02',
    title: 'Siswa belajar di rumah',
    description: 'Siswa membuka materi, bertanya kepada Kak Bintang, lalu belajar dengan dukungan akses yang tersedia.',
  },
  {
    number: '03',
    title: 'Latihan dan evaluasi',
    description: 'Siswa mengerjakan kuis atau tugas dan dapat mengulang materi yang belum dipahami.',
  },
  {
    number: '04',
    title: 'Orang tua ikut mendampingi',
    description: 'Orang tua dan guru melihat perkembangan untuk membantu menentukan langkah belajar berikutnya.',
  },
];

const accessNeeds = [
  {
    icon: HiEye,
    title: 'Untuk siswa tunanetra',
    description: 'Dukungan pembacaan teks dan suara membantu siswa mengakses materi yang berbentuk teks.',
    note: 'Gunakan pembaca layar dan perangkat yang kompatibel bila diperlukan.',
  },
  {
    icon: HiMicrophone,
    title: 'Untuk siswa tunarungu',
    description: 'Mata Pintar membantu menampilkan ucapan yang tertangkap mikrofon sebagai teks.',
    note: 'Ketepatan transkripsi bergantung pada browser, mikrofon, bahasa, dan kondisi suara.',
  },
  {
    icon: HiHand,
    title: 'Untuk siswa tunawicara',
    description: 'Kontrol gestur dasar dapat membantu pada bagian aplikasi yang mendukung input gerakan.',
    note: 'Kontrol gestur bukan penerjemah bahasa isyarat. Papan komunikasi AAC dapat dikembangkan sebagai tahap berikutnya.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const reduceMotion = useReducedMotion();

  // Scroll Progress Indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      // Detect Active Section on Scroll
      const sections = ['fitur', 'alur', 'aksesibilitas'];
      const scrollPosition = window.scrollY + 200;

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

  const reveal = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.18 },
        transition: { duration: 0.5, ease: 'easeOut' },
      };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-950 relative">
      {/* 🚀 SMOOTH SCROLL PROGRESS BAR AT TOP */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[1000] origin-left" style={{ scaleX }} />

      {/* Navigasi Sticky dengan Dynamic Blur & Active Links */}
      <header className="sticky top-0 z-50 border-b border-blue-100/80 bg-white/90 backdrop-blur-xl transition-all duration-300">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8"
          aria-label="Navigasi utama"
        >
          <button
            type="button"
            onClick={() => go('/')}
            className="flex items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            aria-label="BintangAi, halaman utama"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-700 text-xl font-black text-white shadow-lg shadow-blue-200">
              B
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              Bintang<span className="text-blue-700">Ai</span>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Belajar inklusif di rumah
              </span>
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#fitur"
              onClick={(e) => scrollToSection(e, 'fitur')}
              className={`text-sm font-bold transition-all px-3 py-1.5 rounded-full ${
                activeSection === 'fitur' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Fitur
            </a>
            <a
              href="#alur"
              onClick={(e) => scrollToSection(e, 'alur')}
              className={`text-sm font-bold transition-all px-3 py-1.5 rounded-full ${
                activeSection === 'alur' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Cara belajar
            </a>
            <a
              href="#aksesibilitas"
              onClick={(e) => scrollToSection(e, 'aksesibilitas')}
              className={`text-sm font-bold transition-all px-3 py-1.5 rounded-full ${
                activeSection === 'aksesibilitas' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-blue-700'
              }`}
            >
              Aksesibilitas
            </a>
            <button
              type="button"
              onClick={() => go('/auth/login')}
              className="rounded-full px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => go('/auth/register')}
              className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            >
              Daftar akun <HiArrowRight className="ml-1 inline" />
            </button>
          </div>

          <button
            type="button"
            className="rounded-xl border border-blue-100 p-2 text-blue-800 md:hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
          >
            <span className="text-xl">{menuOpen ? '×' : '☰'}</span>
          </button>
        </nav>
        {menuOpen && (
          <div className="border-t border-blue-100 bg-white px-5 py-4 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              <a onClick={(e) => scrollToSection(e, 'fitur')} href="#fitur" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50">Fitur</a>
              <a onClick={(e) => scrollToSection(e, 'alur')} href="#alur" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50">Cara belajar</a>
              <a onClick={(e) => scrollToSection(e, 'aksesibilitas')} href="#aksesibilitas" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50">Aksesibilitas</a>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button type="button" onClick={() => go('/auth/login')} className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-bold text-blue-700">Masuk</button>
                <button type="button" onClick={() => go('/auth/register')} className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white">Daftar</button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-100">
          <div className="pointer-events-none absolute -right-28 top-10 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div {...reveal} className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-bold text-blue-800 shadow-sm">
                <HiHome className="text-base" />
                E-learning inklusif untuk belajar di rumah
              </div>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Belajar lebih mandiri,
                <span className="block text-blue-700">dengan cara yang sesuai.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                BintangAi mendampingi siswa SD kelas 1–6 belajar di rumah melalui materi, latihan, AI Tutor, dan dukungan aksesibilitas. Orang tua dan guru tetap menjadi bagian penting dari perjalanan belajar anak.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go('/auth/register')}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  Mulai belajar <HiArrowRight className="ml-2 text-lg" />
                </button>
                <button
                  type="button"
                  onClick={() => go('/auth/login')}
                  className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-white px-7 py-4 text-sm font-extrabold text-blue-800 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  Masuk / akun demo
                </button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-2"><HiCheckCircle className="text-blue-600" /> Materi dan latihan</span>
                <span className="inline-flex items-center gap-2"><HiCheckCircle className="text-blue-600" /> Dukungan orang tua</span>
                <span className="inline-flex items-center gap-2"><HiCheckCircle className="text-blue-600" /> Pendampingan guru</span>
              </div>
            </motion.div>

            {/* Ilustrasi antarmuka */}
            <motion.div
              {...(reduceMotion ? {} : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.7, delay: 0.1 } })}
              className="relative mx-auto w-full max-w-xl"
              aria-label="Ilustrasi tampilan belajar BintangAi"
            >
              <div className="absolute -left-5 top-10 h-24 w-24 rounded-3xl bg-sky-300/40 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white bg-white p-4 shadow-2xl shadow-blue-200/70 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 font-black text-white">B</div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">Ruang Belajar</p>
                      <p className="text-xs text-slate-400">Contoh tampilan BintangAi</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">Di rumah</span>
                </div>
                <div className="mt-5 rounded-2xl bg-gradient-to-r from-blue-700 to-sky-600 p-5 text-white">
                  <p className="text-xs font-semibold text-blue-100">Halo, Bintang!</p>
                  <p className="mt-1 text-xl font-black">Ayo lanjut belajar hari ini.</p>
                  <p className="mt-2 text-xs leading-5 text-blue-100">Pilih materi, tanyakan hal yang belum dipahami, lalu berlatih.</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                    <HiBookOpen className="text-2xl text-blue-700" />
                    <p className="mt-3 text-sm font-extrabold text-slate-800">Materi belajar</p>
                    <p className="mt-1 text-xs text-slate-500">Baca dan pelajari</p>
                  </div>
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                    <HiChatAlt2 className="text-2xl text-sky-700" />
                    <p className="mt-3 text-sm font-extrabold text-slate-800">Tanya Kak Bintang</p>
                    <p className="mt-1 text-xs text-slate-500">Minta penjelasan</p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-extrabold text-slate-800">Contoh kegiatan</p>
                    <span className="text-[10px] font-bold text-blue-700">Latihan</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-lg">✏️</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-700">Matematika – latihan bilangan</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-2/3 rounded-full bg-blue-600" /></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500">Contoh</span>
                  </div>
                </div>
                <p className="mt-4 text-center text-[10px] text-slate-400">Ilustrasi antarmuka, bukan data atau progres pengguna sebenarnya.</p>
              </div>
              <div className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-xl shadow-blue-100 sm:block">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-800"><HiHeart className="text-lg text-sky-500" /> Belajar dengan dukungan</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Fitur */}
        <section id="fitur" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div {...reveal} className="mx-auto mb-12 max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">Satu ruang belajar, banyak dukungan</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Belajar tidak harus dengan satu cara</h2>
              <p className="mt-4 leading-7 text-slate-600">Siswa dapat memanfaatkan fitur pembelajaran dan akses yang tersedia sesuai perangkat, browser, serta kebutuhannya.</p>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    key={feature.title}
                    {...(reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { delay: index * 0.06, duration: 0.45 } })}
                    className="group rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"
                  >
                    <div className="flex items-start justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white"><Icon /></span>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-500">{feature.tag}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-extrabold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Alur belajar di rumah */}
        <section id="alur" className="scroll-mt-24 bg-blue-50/70 px-5 py-20 sm:px-8 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div {...reveal} className="max-w-xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">Belajar dari rumah</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">Terhubung dengan guru, didampingi keluarga.</h2>
              <p className="mt-5 leading-7 text-slate-600">BintangAi berfokus pada kegiatan belajar mandiri di rumah. Guru membantu menyiapkan pembelajaran, sementara orang tua dapat mendampingi dan melihat perkembangan anak.</p>
              <div className="mt-7 rounded-2xl border border-blue-100 bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-700 text-xl text-white"><HiAcademicCap /></span>
                  <div>
                    <p className="font-extrabold text-slate-900">Untuk kelas 1–6 SD</p>
                    <p className="text-xs leading-5 text-slate-500">Materi dan tingkat pendampingan perlu disesuaikan dengan kelas serta kemampuan setiap anak.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {learningSteps.map((step, index) => (
                <motion.article
                  key={step.number}
                  {...(reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { delay: index * 0.07, duration: 0.45 } })}
                  className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm"
                >
                  <span className="text-sm font-black tracking-widest text-blue-600">{step.number}</span>
                  <h3 className="mt-4 text-lg font-extrabold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Aksesibilitas */}
        <section id="aksesibilitas" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div {...reveal} className="mx-auto mb-12 max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">Dukungan aksesibilitas</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Memperhatikan kebutuhan setiap siswa</h2>
              <p className="mt-4 leading-7 text-slate-600">Fitur berikut menggambarkan dukungan yang tersedia atau masih memiliki batasan. Kami tidak menyebut kontrol gestur sebagai penerjemah bahasa isyarat.</p>
            </motion.div>
            <div className="grid gap-5 lg:grid-cols-3">
              {accessNeeds.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    {...(reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { delay: index * 0.07, duration: 0.45 } })}
                    className="rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/50 p-7"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-700 text-2xl text-white"><Icon /></span>
                    <h3 className="mt-5 text-xl font-extrabold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                    <div className="mt-5 rounded-2xl bg-white/90 p-4 text-xs leading-5 text-slate-500 ring-1 ring-blue-100">{item.note}</div>
                  </motion.article>
                );
              })}
            </div>
            <p className="mx-auto mt-7 max-w-4xl text-center text-xs leading-5 text-slate-500">
              Catatan: ketersediaan fitur dapat berbeda menurut browser, perangkat, izin mikrofon/kamera, dan dukungan teknologi bantu. Untuk kebutuhan komunikasi bahasa isyarat, siswa tetap perlu dukungan yang sesuai; BintangAi belum mengklaim penerjemahan BISINDO atau SIBI.
            </p>
          </div>
        </section>

        {/* Peran pendamping */}
        <section className="px-5 pb-20 sm:px-8 md:pb-24">
          <div className="mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-[2rem] bg-blue-800 p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-200">Belajar bersama</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Anak belajar mandiri. Orang tua dan guru tetap mendampingi.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">Teknologi membantu membuka akses belajar, tetapi perhatian keluarga, arahan guru, dan penyesuaian dengan kebutuhan anak tetap menjadi bagian utama.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button type="button" onClick={() => go('/auth/register')} className="rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-blue-800 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50">Daftar BintangAi</button>
              <button type="button" onClick={() => go('/auth/login')} className="rounded-xl border border-blue-300 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50">Masuk akun</button>
            </div>
          </div>
        </section>
      </main>

      {/* 🚀 FLOATING BACK-TO-TOP BUTTON FOR EASY NAVIGATION */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-[200] p-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl shadow-2xl shadow-blue-300 transition-all flex items-center justify-center group"
            title="Kembali ke Atas"
          >
            <HiChevronUp className="text-xl group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="border-t border-blue-100 bg-slate-50 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 font-black text-white">B</span>
            <div>
              <p className="font-extrabold text-slate-900">Bintang<span className="text-blue-700">Ai</span></p>
              <p className="text-xs text-slate-500">E-learning inklusif untuk belajar di rumah</p>
            </div>
          </div>
          <p className="max-w-xl text-xs leading-5 text-slate-500">© {new Date().getFullYear()} BintangAi. Platform pendukung pembelajaran inklusif. Fitur aksesibilitas digunakan sesuai dukungan perangkat dan browser.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

const Icon = ({ name, className = 'h-6 w-6' }) => {
  const common = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  };

  const paths = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h8" /></>,
    sparkle: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>,
    volume: <><path d="M4 10v4h3l5 4V6l-5 4z" /><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a9 9 0 0 1 0 11" /></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8" /></>,
    hand: <><path d="M8 12V5a1.5 1.5 0 0 1 3 0v6-8a1.5 1.5 0 0 1 3 0v8-6a1.5 1.5 0 0 1 3 0v8-4a1.5 1.5 0 0 1 3 0v7a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4 15a1.7 1.7 0 0 1 2.7-2.1L8 14" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    cap: <><path d="m2 10 10-5 10 5-10 5z" /><path d="M6 12v5c4 3 8 3 12 0v-5M22 10v6" /></>,
    heart: <><path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" /></>,
  };

  return <svg {...common}>{paths[name] || paths.sparkle}</svg>;
};

const featureItems = [
  {
    icon: 'book',
    title: 'Materi dan latihan',
    text: 'Siswa mempelajari modul, mengerjakan kuis, dan mengulang materi sesuai ritme belajarnya.',
    label: 'Belajar mandiri',
  },
  {
    icon: 'sparkle',
    title: 'AI Tutor Kak Bintang',
    text: 'Pendamping untuk bertanya dan meminta penjelasan materi dengan bahasa yang lebih sederhana.',
    label: 'Pendamping belajar',
  },
  {
    icon: 'volume',
    title: 'Dukungan suara',
    text: 'Teks dapat dibacakan melalui fitur suara yang didukung browser untuk membantu akses materi.',
    label: 'Dukungan tunanetra',
  },
  {
    icon: 'mic',
    title: 'Mata Pintar – Caption',
    text: 'Ucapan yang tertangkap mikrofon dapat ditampilkan sebagai teks melalui pengenalan suara browser.',
    label: 'Dukungan tunarungu',
  },
  {
    icon: 'hand',
    title: 'Kontrol gestur dasar',
    text: 'Kontrol gerakan tersedia pada bagian tertentu. Fitur ini bukan penerjemah BISINDO atau SIBI.',
    label: 'Akses alternatif',
  },
  {
    icon: 'users',
    title: 'Pendampingan keluarga',
    text: 'Orang tua dan guru dapat mendukung proses belajar melalui peran dan halaman pemantauan masing-masing.',
    label: 'Rumah dan sekolah',
  },
];

const steps = [
  ['01', 'Guru menyiapkan materi', 'Guru membagikan materi dan tugas yang sesuai dengan tingkat belajar siswa.'],
  ['02', 'Siswa belajar di rumah', 'Siswa membuka materi, bertanya kepada Kak Bintang, lalu belajar dengan dukungan akses yang tersedia.'],
  ['03', 'Latihan dan evaluasi', 'Siswa mengerjakan kuis atau tugas dan dapat mengulang materi yang belum dipahami.'],
  ['04', 'Orang tua ikut mendampingi', 'Orang tua dan guru melihat perkembangan untuk membantu menentukan langkah belajar berikutnya.'],
];

const accessibilityItems = [
  {
    icon: 'eye',
    title: 'Untuk siswa tunanetra',
    text: 'Dukungan pembacaan teks dan suara membantu siswa mengakses materi yang berbentuk teks.',
    note: 'Gunakan pembaca layar dan perangkat yang kompatibel bila diperlukan.',
  },
  {
    icon: 'mic',
    title: 'Untuk siswa tunarungu',
    text: 'Mata Pintar membantu menampilkan ucapan yang tertangkap mikrofon sebagai teks.',
    note: 'Ketepatan transkripsi bergantung pada browser, mikrofon, bahasa, dan kondisi suara.',
  },
  {
    icon: 'hand',
    title: 'Untuk siswa tunawicara',
    text: 'Kontrol gestur dasar dapat membantu pada bagian aplikasi yang mendukung input gerakan.',
    note: 'Kontrol gestur bukan penerjemah bahasa isyarat. Papan komunikasi AAC dapat dikembangkan sebagai tahap berikutnya.',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  // File sumber menggunakan /auth sebagai pintu masuk autentikasi.
  const goAuth = () => {
    setMenuOpen(false);
    navigate('/auth');
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
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-950">
      <header className="sticky top-0 z-50 border-b border-blue-100/80 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8" aria-label="Navigasi utama">
          <a href="#beranda" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200" aria-label="BintangAi, halaman utama">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-700 text-xl font-black text-white shadow-lg shadow-blue-200">B</span>
            <span className="text-xl font-extrabold tracking-tight">Bintang<span className="text-blue-700">Ai</span><span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Belajar inklusif di rumah</span></span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#fitur" className="text-sm font-semibold text-slate-600 transition hover:text-blue-700">Fitur</a>
            <a href="#alur" className="text-sm font-semibold text-slate-600 transition hover:text-blue-700">Cara belajar</a>
            <a href="#aksesibilitas" className="text-sm font-semibold text-slate-600 transition hover:text-blue-700">Aksesibilitas</a>
            <button type="button" onClick={goAuth} className="rounded-full px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">Masuk</button>
            <button type="button" onClick={goAuth} className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">Mulai sekarang <Icon name="arrow" className="ml-1 inline h-4 w-4" /></button>
          </div>

          <button type="button" className="rounded-xl border border-blue-100 p-2 text-blue-800 md:hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen}>
            <span className="text-xl">{menuOpen ? '×' : '☰'}</span>
          </button>
        </nav>
        {menuOpen && (
          <div className="border-t border-blue-100 bg-white px-5 py-4 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              <a onClick={() => setMenuOpen(false)} href="#fitur" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50">Fitur</a>
              <a onClick={() => setMenuOpen(false)} href="#alur" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50">Cara belajar</a>
              <a onClick={() => setMenuOpen(false)} href="#aksesibilitas" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-blue-50">Aksesibilitas</a>
              <button type="button" onClick={goAuth} className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white">Masuk / daftar</button>
            </div>
          </div>
        )}
      </header>

      <main id="beranda">
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-100">
          <div className="pointer-events-none absolute -right-28 top-10 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div {...reveal} className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-xs font-bold text-blue-800 shadow-sm"><Icon name="home" className="h-4 w-4" /> E-learning inklusif untuk belajar di rumah</div>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Belajar lebih mandiri,<span className="block text-blue-700">dengan cara yang sesuai.</span></h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">BintangAi mendampingi siswa SD kelas 1–6 belajar di rumah melalui materi, latihan, AI Tutor, dan dukungan aksesibilitas. Orang tua dan guru tetap menjadi bagian penting dari perjalanan belajar anak.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={goAuth} className="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-200 transition hover:-translate-y-1 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">Mulai belajar <Icon name="arrow" className="ml-2 h-5 w-5" /></button>
                <button type="button" onClick={() => setAboutOpen(true)} className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-white px-7 py-4 text-sm font-extrabold text-blue-800 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200">Tentang BintangAi</button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-blue-600" /> Materi dan latihan</span><span className="inline-flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-blue-600" /> Dukungan orang tua</span><span className="inline-flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-blue-600" /> Pendampingan guru</span></div>
            </motion.div>

            <motion.div {...(reduceMotion ? {} : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.7, delay: 0.1 } })} className="relative mx-auto w-full max-w-xl" aria-label="Ilustrasi tampilan belajar BintangAi">
              <div className="absolute -left-5 top-10 h-24 w-24 rounded-3xl bg-sky-300/40 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white bg-white p-4 shadow-2xl shadow-blue-200/70 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 font-black text-white">B</div><div><p className="text-sm font-extrabold text-slate-900">Ruang Belajar</p><p className="text-xs text-slate-400">Contoh tampilan BintangAi</p></div></div><span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700">Di rumah</span></div>
                <div className="mt-5 rounded-2xl bg-gradient-to-r from-blue-700 to-sky-600 p-5 text-white"><p className="text-xs font-semibold text-blue-100">Halo, Bintang!</p><p className="mt-1 text-xl font-black">Ayo lanjut belajar hari ini.</p><p className="mt-2 text-xs leading-5 text-blue-100">Pilih materi, tanyakan hal yang belum dipahami, lalu berlatih.</p></div>
                <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><Icon name="book" className="h-7 w-7 text-blue-700" /><p className="mt-3 text-sm font-extrabold text-slate-800">Materi belajar</p><p className="mt-1 text-xs text-slate-500">Baca dan pelajari</p></div><div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4"><Icon name="sparkle" className="h-7 w-7 text-sky-700" /><p className="mt-3 text-sm font-extrabold text-slate-800">Tanya Kak Bintang</p><p className="mt-1 text-xs text-slate-500">Minta penjelasan</p></div></div>
                <div className="mt-3 rounded-2xl border border-slate-100 p-4"><div className="flex items-center justify-between"><p className="text-sm font-extrabold text-slate-800">Contoh kegiatan</p><span className="text-[10px] font-bold text-blue-700">Latihan</span></div><div className="mt-3 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-lg">✏️</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700">Matematika – latihan bilangan</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-2/3 rounded-full bg-blue-600" /></div></div><span className="text-xs font-bold text-slate-500">Contoh</span></div></div>
                <p className="mt-4 text-center text-[10px] text-slate-400">Ilustrasi antarmuka, bukan data atau progres pengguna sebenarnya.</p>
              </div>
              <div className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-xl shadow-blue-100 sm:block"><div className="flex items-center gap-2 text-sm font-bold text-blue-800"><Icon name="heart" className="h-5 w-5 text-sky-500" /> Belajar dengan dukungan</div></div>
            </motion.div>
          </div>
        </section>

        <section id="fitur" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-24"><div className="mx-auto max-w-7xl"><motion.div {...reveal} className="mx-auto mb-12 max-w-2xl text-center"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">Satu ruang belajar, banyak dukungan</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Belajar tidak harus dengan satu cara</h2><p className="mt-4 leading-7 text-slate-600">Siswa dapat memanfaatkan fitur pembelajaran dan akses yang tersedia sesuai perangkat, browser, serta kebutuhannya.</p></motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featureItems.map((item, index) => <motion.article key={item.title} {...(reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { delay: index * 0.06, duration: 0.45 } })} className="group rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white"><Icon name={item.icon} className="h-6 w-6" /></span><span className="rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-500">{item.label}</span></div><h3 className="mt-5 text-lg font-extrabold text-slate-900">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p></motion.article>)}</div>
          </div></section>

        <section id="alur" className="scroll-mt-24 bg-blue-50/70 px-5 py-20 sm:px-8 md:py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]"><motion.div {...reveal} className="max-w-xl"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">Belajar dari rumah</p><h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">Terhubung dengan guru, didampingi keluarga.</h2><p className="mt-5 leading-7 text-slate-600">BintangAi berfokus pada kegiatan belajar mandiri di rumah. Guru membantu menyiapkan pembelajaran, sementara orang tua dapat mendampingi dan melihat perkembangan anak.</p><div className="mt-7 rounded-2xl border border-blue-100 bg-white p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-700 text-white"><Icon name="cap" /></span><div><p className="font-extrabold text-slate-900">Untuk kelas 1–6 SD</p><p className="text-xs leading-5 text-slate-500">Materi dan tingkat pendampingan perlu disesuaikan dengan kelas serta kemampuan setiap anak.</p></div></div></div></motion.div>
            <div className="grid gap-4 sm:grid-cols-2">{steps.map(([number, title, description], index) => <motion.article key={number} {...(reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { delay: index * 0.07, duration: 0.45 } })} className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm"><span className="text-sm font-black tracking-widest text-blue-600">{number}</span><h3 className="mt-4 text-lg font-extrabold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></motion.article>)}</div>
          </div></section>

        <section id="aksesibilitas" className="scroll-mt-24 px-5 py-20 sm:px-8 md:py-24"><div className="mx-auto max-w-7xl"><motion.div {...reveal} className="mx-auto mb-12 max-w-3xl text-center"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blue-700">Dukungan aksesibilitas</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Memperhatikan kebutuhan setiap siswa</h2><p className="mt-4 leading-7 text-slate-600">Fitur berikut menggambarkan dukungan yang tersedia atau masih memiliki batasan. Kami tidak menyebut kontrol gestur sebagai penerjemah bahasa isyarat.</p></motion.div>
            <div className="grid gap-5 lg:grid-cols-3">{accessibilityItems.map((item, index) => <motion.article key={item.title} {...(reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { delay: index * 0.07, duration: 0.45 } })} className="rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/50 p-7"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-700 text-white"><Icon name={item.icon} className="h-6 w-6" /></span><h3 className="mt-5 text-xl font-extrabold text-slate-900">{item.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p><div className="mt-5 rounded-2xl bg-white/90 p-4 text-xs leading-5 text-slate-500 ring-1 ring-blue-100">{item.note}</div></motion.article>)}</div>
            <p className="mx-auto mt-7 max-w-4xl text-center text-xs leading-5 text-slate-500">Catatan: ketersediaan fitur dapat berbeda menurut browser, perangkat, izin mikrofon/kamera, dan dukungan teknologi bantu. BintangAi belum mengklaim penerjemahan BISINDO atau SIBI.</p>
          </div></section>

        <section className="px-5 pb-20 sm:px-8 md:pb-24"><div className="mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-[2rem] bg-blue-800 p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-200">Belajar bersama</p><h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Anak belajar mandiri. Orang tua dan guru tetap mendampingi.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">Teknologi membantu membuka akses belajar, tetapi perhatian keluarga, arahan guru, dan penyesuaian dengan kebutuhan anak tetap menjadi bagian utama.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><button type="button" onClick={goAuth} className="rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-blue-800 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50">Masuk / daftar</button><button type="button" onClick={() => setAboutOpen(true)} className="rounded-xl border border-blue-300 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50">Tentang platform</button></div></div></section>
      </main>

      <footer className="border-t border-blue-100 bg-slate-50 px-5 py-10 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 font-black text-white">B</span><div><p className="font-extrabold text-slate-900">Bintang<span className="text-blue-700">Ai</span></p><p className="text-xs text-slate-500">E-learning inklusif untuk belajar di rumah</p></div></div><p className="max-w-xl text-xs leading-5 text-slate-500">© {new Date().getFullYear()} BintangAi. Platform pendukung pembelajaran inklusif. Fitur aksesibilitas digunakan sesuai dukungan perangkat dan browser.</p></div></footer>

      {aboutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="about-title">
          <button type="button" aria-label="Tutup informasi" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setAboutOpen(false)} />
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl sm:p-9">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Tentang platform</p><h2 id="about-title" className="mt-2 text-2xl font-black text-slate-950">BintangAi, ruang belajar inklusif</h2></div><button type="button" onClick={() => setAboutOpen(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-slate-500 hover:bg-slate-50" aria-label="Tutup">×</button></div>
            <p className="mt-5 text-sm leading-7 text-slate-600">BintangAi dirancang sebagai pendukung e-learning untuk siswa SD kelas 1–6. Siswa dapat mengakses materi dan latihan, bertanya kepada AI Tutor, serta menggunakan dukungan aksesibilitas yang tersedia. Guru membantu menyiapkan pembelajaran dan orang tua mendampingi kegiatan belajar di rumah.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">{[['Siswa', 'Belajar, bertanya, dan berlatih.'], ['Orang tua', 'Mendampingi dan memperhatikan perkembangan.'], ['Guru', 'Menyiapkan materi dan tugas.'], ['Aksesibilitas', 'Mendukung beberapa cara mengakses informasi.']].map(([title, text]) => <div key={title} className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4"><p className="font-extrabold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p></div>)}</div>
            <p className="mt-5 text-xs leading-5 text-slate-500">Catatan: kemampuan caption, suara, dan kamera bergantung pada browser serta perangkat. Kontrol gestur dasar tidak sama dengan penerjemahan bahasa isyarat.</p>
            <button type="button" onClick={() => { setAboutOpen(false); goAuth(); }} className="mt-7 w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-800">Lanjut ke BintangAi</button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Landing;

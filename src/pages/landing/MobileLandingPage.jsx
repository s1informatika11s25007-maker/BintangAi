import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BintangAvatar from '@/features/ai-tutor/components/BintangAvatar';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { login } from '@/features/auth/api/sessionApi';
import { supabase } from '@/lib/supabaseClient';

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
    color: 'from-blue-500/10 via-sky-500/5 to-blue-50 border-blue-200',
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
    color: 'from-sky-500/10 via-cyan-500/5 to-sky-50 border-sky-200',
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
    color: 'from-emerald-500/10 via-teal-500/5 to-emerald-50 border-emerald-200',
    badgeBg: 'bg-emerald-600 text-white',
  },
  {
    key: 'guru',
    group: 'guru',
    label: 'Guru Pembimbing',
    email: 'demo.guru@gmail.com',
    pass: 'demo123456',
    description: 'Ibu Rina · Guru SLB/SD',
    support: 'Kelola kelas, tugas, dan materi belajar',
    icon: '👩‍🏫',
    color: 'from-purple-500/10 via-indigo-500/5 to-purple-50 border-purple-200',
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
    color: 'from-amber-500/10 via-orange-500/5 to-amber-50 border-amber-200',
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
    title: 'Umum / Tanpa Hambatan',
    note: 'Tampilan standar SD',
    description: 'Menggunakan tampilan standar belajar SD dengan tombol interaktif dan kuis pilihan ganda.',
    icon: '🌟',
  },
];

const MobileLandingPage = () => {
  const navigate = useNavigate();
  const { setUser, fetchProfile } = useAuthStore();
  const { setManualMode } = useAccessibilityStore();

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-24">
      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={scrollToTop}>
          <BintangAvatar size={34} state="idle" />
          <div>
            <span className="text-base font-black text-white tracking-tight">Bintang<span className="text-sky-400">AI</span></span>
            <span className="block text-[10px] font-bold text-sky-400">Ruang Belajar SD</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAuthTab('login'); scrollToSection('section-auth'); }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
          >
            Masuk
          </button>
          <button
            onClick={() => { setAuthTab('register'); setRegStep(1); scrollToSection('section-auth'); }}
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-xs font-extrabold text-white shadow-md"
          >
            Daftar
          </button>
        </div>
      </header>

      {/* Main Content Sections (100% Content Parity with Desktop) */}
      <main className="flex-1 px-4 py-6 space-y-12">

        {/* SLIDE 1 — HERO */}
        <section id="section-hero" className="text-center space-y-5 pt-2">
          <span className="inline-block px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-black text-sky-400 uppercase tracking-widest">
            E-learning inklusif untuk belajar di rumah
          </span>
          <BintangAvatar size={120} state="happy" className="mx-auto" />
          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              Belajar lebih mandiri, <span className="block text-sky-400">dengan cara yang sesuai.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              BintangAi mendampingi siswa SD kelas 1–6 belajar di rumah melalui materi, latihan, AI Tutor, dan dukungan aksesibilitas. Orang tua dan guru tetap menjadi bagian penting dari perjalanan belajar anak.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => { setAuthTab('register'); setRegStep(1); scrollToSection('section-auth'); }}
              className="w-full py-3.5 rounded-2xl bg-sky-600 text-sm font-extrabold text-white shadow-lg shadow-sky-900/40 flex items-center justify-center gap-2"
            >
              Mulai belajar sekarang 🚀
            </button>
            <button
              onClick={() => scrollToSection('section-demo')}
              className="w-full py-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-sky-300"
            >
              Aku mau coba demo dulu →
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-bold text-slate-400">
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">✓ Materi & latihan</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">✓ Dukungan orang tua</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">✓ Pendampingan guru</span>
          </div>
        </section>

        {/* SLIDE 2 — MASALAH DAN SOLUSI */}
        <section id="section-solusi" className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="text-center space-y-1.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-black uppercase text-blue-400 tracking-wider">
              Masalah dan solusi
            </span>
            <h2 className="text-xl font-black text-white">Mengapa Bintang AI dibuat?</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Bintang AI dibuat khusus membantu siswa SD disabilitas (Tunanetra, Tunarungu, Tunawicara) kelas 1–6 agar dapat belajar mandiri dari rumah dengan mudah, aman, dan ceria.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Tantangan Card */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-300">Tantangan Siswa Disabilitas</span>
              <h3 className="text-sm font-black text-white">Hambatan Belajar Siswa SD</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Siswa Tunanetra kesulitan membaca teks modul, Siswa Tunarungu tidak dapat mendengar suara penjelasan guru, dan Siswa Tunawicara kesulitan menyampaikan jawaban saat belajar di rumah.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Hambatan penglihatan', 'Hambatan pendengaran', 'Hambatan bicara'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-700/80 text-[10px] font-bold text-slate-300">{tag}</span>
                ))}
              </div>
            </div>

            {/* Solusi Card */}
            <div className="p-4 rounded-2xl bg-sky-950/60 border border-sky-800/80 space-y-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-300">Solusi Aksesibilitas SD</span>
              <h3 className="text-sm font-black text-white">Bintang AI Siap Membantu Belajar</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Suara lisan otomatis untuk Tunanetra, teks subtitle visual untuk Tunarungu, serta kamera gestur isyarat & balasan teks untuk Tunawicara kelas 1–6 SD, didampingi Guru dan Orang Tua.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Suara Tunanetra', 'Subtitle Tunarungu', 'Gestur Tunawicara'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-sky-900/60 border border-sky-700/60 text-[10px] font-bold text-sky-200">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 3 — CARA BELAJAR */}
        <section id="section-cara" className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="text-center space-y-1.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[11px] font-black uppercase text-sky-400 tracking-wider">
              Pilih yang nyaman
            </span>
            <h2 className="text-xl font-black text-white">Ada banyak cara untuk memahami pelajaran</h2>
            <p className="text-xs text-slate-400">Pilih satu cara untuk memulai. Pengaturan dapat disesuaikan lagi kapan saja.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1">
            {LEARNING_MODES.map((mode) => (
              <div key={mode.id} className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-start gap-3.5">
                <span className="text-3xl shrink-0 p-2 rounded-xl bg-slate-700/60">{mode.icon}</span>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">{mode.note}</span>
                  <h3 className="text-sm font-black text-white">{mode.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{mode.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SLIDE 4 — FITUR / 4 KEGIATAN SERU */}
        <section id="section-fitur" className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="text-center space-y-1.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-black uppercase text-blue-400 tracking-wider">
              Yang bisa kamu lakukan
            </span>
            <h2 className="text-xl font-black text-white">Empat kegiatan seru di Bintang AI</h2>
            <p className="text-xs text-slate-400">Belajar sedikit demi sedikit. Kalau belum paham, kamu boleh mencoba lagi.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1">
            {[
              { icon: '📖', number: '01', title: 'Baca Materi', text: 'Pelajari materi kelas 1 sampai 6 dengan tampilan yang mudah dibaca.' },
              { icon: '🤖', number: '02', title: 'Tanya Kak Bintang', text: 'Tanyakan pelajaran dan dapatkan penjelasan dengan bahasa sederhana.' },
              { icon: '🎯', number: '03', title: 'Kerjakan Latihan', text: 'Jawab kuis dan lihat hasil latihanmu. Terus semangat mencoba!' },
              { icon: '🧑‍💻', number: '04', title: 'Mengajar Real-Time', text: 'Guru mengajar secara langsung dari jarak jauh. Materi, instruksi, dan balasan guru dikirim dalam format yang sesuai untuk tiap siswa.' },
            ].map((f) => (
              <div key={f.number} className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2 rounded-xl bg-slate-700/60">{f.icon}</span>
                  <span className="text-xs font-black text-slate-400">{f.number}</span>
                </div>
                <h3 className="text-sm font-black text-white">{f.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SLIDE 5 — PERAN */}
        <section id="section-peran" className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="text-center space-y-1.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[11px] font-black uppercase text-sky-400 tracking-wider">
              Kita belajar bersama
            </span>
            <h2 className="text-xl font-black text-white">Ada tiga teman dalam perjalanan belajar</h2>
            <p className="text-xs text-slate-400">Siswa, guru, dan orang tua punya tugas masing-masing. Semuanya saling membantu.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-center space-y-2">
              <span className="text-4xl block">👩‍🏫</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Menyiapkan</span>
              <h3 className="text-base font-black text-white">Guru</h3>
              <p className="text-xs text-slate-300 leading-relaxed">Menyiapkan kelas, membagikan kode kelas, membuat materi, dan melihat tugas.</p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-950/80 border border-sky-800 text-center space-y-2">
              <span className="text-4xl block">🧒</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Belajar</span>
              <h3 className="text-base font-black text-white">Siswa</h3>
              <p className="text-xs text-slate-300 leading-relaxed">Membaca materi, bertanya kepada Kak Bintang, dan mengerjakan latihan.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-center space-y-2">
              <span className="text-4xl block">👨‍👧</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Mendampingi</span>
              <h3 className="text-base font-black text-white">Orang Tua</h3>
              <p className="text-xs text-slate-300 leading-relaxed">Menemani anak belajar dan melihat laporan perkembangan yang tersedia.</p>
            </div>
          </div>
        </section>

        {/* SLIDE 6 — DEMO ACCOUNTS */}
        <section id="section-demo" className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="text-center space-y-1.5">
            <span className="inline-block px-3 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-black uppercase text-blue-400 tracking-wider">
              Yuk, coba!
            </span>
            <h2 className="text-xl font-black text-white">Pilih pengalaman yang ingin kamu lihat</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Tekan tombol untuk membuka akun simulasi. Kamu bisa melihat Bintang AI dari sisi siswa, guru, atau orang tua.</p>
          </div>

          {loginMessage && (
            <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-xs text-blue-200">{loginMessage.text}</div>
          )}

          <div className="space-y-3 pt-1">
            {DEMO_ACCOUNTS.map((acc) => (
              <div key={acc.key} className={`p-4 rounded-2xl bg-gradient-to-br ${acc.color} border space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-white shadow-xs">{acc.icon}</span>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${acc.badgeBg}`}>{acc.label}</span>
                      <h3 className="text-sm font-black text-slate-900 mt-0.5">{acc.description}</h3>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{acc.support}</p>
                <button
                  disabled={loginLoading}
                  onClick={() => handleDemoLogin(acc)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-transform"
                >
                  {loginLoading ? 'Sedang membuka...' : 'Coba Akun Ini'} →
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-slate-500 leading-relaxed">
            Catatan untuk pendamping: tombol simulasi menggunakan akun demo yang telah dikonfigurasi pada aplikasi dan tetap melalui proses autentikasi.
          </p>
        </section>

        {/* SLIDE 7 — AJAKAN MULAI */}
        <section id="section-ajakan" className="text-center space-y-4 pt-6 border-t border-slate-800/80">
          <BintangAvatar size={130} state="happy" className="mx-auto" />
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-black uppercase text-sky-400 tracking-wider">
              Bintang AI · Ruang Belajar SD
            </span>
            <h2 className="text-2xl font-black text-white leading-snug">Setiap anak punya kesempatan untuk bersinar!</h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">Ayo mulai petualangan belajar. Kamu bisa membuat akun atau masuk ke akun yang sudah ada.</p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => { setAuthTab('register'); setRegStep(1); scrollToSection('section-auth'); }}
              className="w-full py-3.5 rounded-2xl bg-sky-600 text-sm font-extrabold text-white shadow-lg flex items-center justify-center gap-2"
            >
              Buat Akun Baru 🚀
            </button>
            <button
              onClick={() => { setAuthTab('login'); scrollToSection('section-auth'); }}
              className="w-full py-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
            >
              Masuk Ke Akun
            </button>
          </div>
        </section>

        {/* SLIDE 8 — FORM LOGIN & REGISTER (INTEGRATED & CLEAN) */}
        <section id="section-auth" className="space-y-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
            <BintangAvatar size={48} state={authTab === 'login' ? 'happy' : 'idle'} />
            <div>
              <h2 className="text-sm font-black text-white">{authTab === 'login' ? 'Selamat Datang Kembali!' : 'Pendaftaran Akun Baru'}</h2>
              <p className="text-[11px] text-slate-400">Masuk atau daftar untuk mulai belajar</p>
            </div>
          </div>

          {/* Auth Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-800 text-center">
            <button
              onClick={() => { setAuthTab('login'); setLoginMessage(null); }}
              className={`py-2 text-xs font-extrabold rounded-lg transition-colors ${authTab === 'login' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400'}`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setAuthTab('register'); setRegStep(1); setRegMessage(null); }}
              className={`py-2 text-xs font-extrabold rounded-lg transition-colors ${authTab === 'register' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400'}`}
            >
              Daftar
            </button>
          </div>

          {/* LOGIN FORM */}
          {authTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
              {loginMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold border ${loginMessage.type === 'error' ? 'bg-rose-500/20 border-rose-500/40 text-rose-200' : 'bg-sky-500/20 border-sky-500/40 text-sky-200'}`}>
                  {loginMessage.text}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Kata Sandi</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold text-sky-400 hover:text-sky-300"
                  >
                    {showLoginPassword ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-xl bg-sky-600 text-sm font-black text-white shadow-lg shadow-sky-900/40 active:scale-98 transition-transform"
              >
                {loginLoading ? 'Sedang memeriksa...' : 'Masuk dan Mulai Belajar 🚀'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authTab === 'register' && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Langkah {regStep} dari 3</span>
                <span className="font-extrabold text-sky-400">{['Pilih Peran', 'Detail Kelas', 'Data Akun'][regStep - 1]}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((step) => (
                  <div key={step} className={`h-1.5 rounded-full ${step <= regStep ? 'bg-sky-500' : 'bg-slate-800'}`} />
                ))}
              </div>

              {regMessage && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">{regMessage.text}</div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {regStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-300">Daftar Sebagai:</p>
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
                          className={`p-3 rounded-xl border text-center transition-all ${regRole === item.id ? 'bg-sky-600/30 border-sky-500 text-white font-black' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                        >
                          <span className="text-2xl block">{item.icon}</span>
                          <span className="text-xs mt-1 block">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    {regRole === 'siswa' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Cara belajar yang nyaman</label>
                        <select
                          value={regDisability}
                          onChange={(e) => setRegDisability(e.target.value)}
                          className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="tunanetra">Tunanetra — suara dan pembaca layar</option>
                          <option value="tunarungu">Tunarungu — teks dan petunjuk visual</option>
                          <option value="tunawicara">Tunawicara — tulisan, gambar, dan simbol</option>
                          <option value="tidak_ada">Umum — tampilan standar</option>
                        </select>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="w-full py-3.5 rounded-xl bg-sky-600 text-xs font-black text-white shadow-md"
                    >
                      Lanjut →
                    </button>
                  </div>
                )}

                {regStep === 2 && (
                  <div className="space-y-3">
                    {regRole === 'siswa' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">Kelas SD</label>
                          <select
                            value={regClassLevel}
                            onChange={(e) => setRegClassLevel(e.target.value)}
                            className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                          >
                            {['1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'].map((lvl) => (
                              <option key={lvl} value={lvl}>{lvl}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">Kode Kelas dari Guru</label>
                          <input
                            type="text"
                            required
                            value={regClassCode}
                            onChange={(e) => setRegClassCode(e.target.value.toUpperCase())}
                            placeholder="Contoh: X8J2K1"
                            className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 uppercase"
                          />
                        </div>
                      </>
                    )}

                    {regRole === 'guru' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">Nama Sekolah / SLB</label>
                          <input
                            type="text"
                            required
                            value={regSlbName}
                            onChange={(e) => setRegSlbName(e.target.value)}
                            placeholder="Masukkan nama sekolah"
                            className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">Mata Pelajaran Utama</label>
                          <select
                            value={regSubject}
                            onChange={(e) => setRegSubject(e.target.value)}
                            className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                          >
                            {['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Bahasa Inggris', 'Lainnya'].map((sub) => (
                              <option key={sub} value={sub}>{sub}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {regRole === 'ortu' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">ID Belajar Siswa (Anak)</label>
                        <input
                          type="text"
                          required
                          value={regStudentIdInput}
                          onChange={(e) => setRegStudentIdInput(e.target.value)}
                          placeholder="Masukkan ID siswa"
                          className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setRegStep(1)} className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">Kembali</button>
                      <button type="button" onClick={() => setRegStep(3)} className="flex-1 py-3 rounded-xl bg-sky-600 text-xs font-black text-white">Lanjut →</button>
                    </div>
                  </div>
                )}

                {regStep === 3 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Nama Lengkap</label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Alamat Email</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Kata Sandi</label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white pr-20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold text-sky-400"
                        >
                          {showRegPassword ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Ulangi Kata Sandi</label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi"
                        className="w-full px-3.5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setRegStep(2)} className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">Kembali</button>
                      <button type="submit" disabled={regLoading} className="flex-1 py-3 rounded-xl bg-sky-600 text-xs font-black text-white shadow-md">
                        {regLoading ? 'Membuat akun...' : 'Buat Akun Bintang AI'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </section>
      </main>

      {/* Floating Back-to-Top Button (Arrow Pointing UP Only) */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 z-50 w-11 h-11 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        aria-label="Kembali ke Atas"
      >
        <span className="text-xl font-bold">↑</span>
      </button>
    </div>
  );
};

export default MobileLandingPage;

import React, { useState, useEffect } from 'react';
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

const MobileLandingPage = () => {
  const navigate = useNavigate();
  const { setUser, fetchProfile } = useAuthStore();
  const { setManualMode } = useAccessibilityStore();

  const [activeTab, setActiveTab] = useState('hero');
  const [authTab, setAuthTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [regStep, setRegStep] = useState(1);
  const [regRole, setRegRole] = useState('siswa');
  const [regDisability, setRegDisability] = useState('tunanetra');
  const [regClassLevel, setRegClassLevel] = useState('4 SD');
  const [regClassCode, setRegClassCode] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleDemoLogin = async (account) => {
    setLoginLoading(true);
    setLoginError(null);
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
      setLoginError(err.message || 'Gagal login ke akun demo.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const authData = await login(loginEmail, loginPassword);
      if (authData?.user) {
        setUser(authData.user);
        await fetchProfile();
        navigate('/student/dashboard');
      }
    } catch (err) {
      setLoginError(err.message || 'Gagal masuk. Periksa email dan password Anda.');
    } finally {
      setLoginLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-20">
      {/* Sticky Mobile Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('hero')}>
          <BintangAvatar size={34} state="idle" />
          <div>
            <span className="text-base font-black text-white tracking-tight">Bintang<span className="text-sky-400">AI</span></span>
            <span className="block text-[10px] font-bold text-sky-400">Ruang Belajar SD</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setAuthTab('login'); setActiveTab('auth'); }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-700"
          >
            Masuk
          </button>
          <button
            onClick={() => { setAuthTab('register'); setActiveTab('auth'); }}
            className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-xs font-extrabold text-white shadow-md hover:bg-sky-500"
          >
            Daftar
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-6 space-y-8">
        {activeTab === 'hero' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Mascot Banner */}
            <div className="text-center space-y-4 pt-2">
              <div className="inline-block relative">
                <BintangAvatar size={100} state="happy" />
              </div>
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-black text-sky-400 uppercase tracking-widest">
                  Pembelajaran Inklusif SD
                </span>
                <h1 className="text-2xl font-black text-white leading-snug">
                  Belajar Mandiri & Ceria untuk Siswa Kelas 1–6 SD
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Dampingan AI ramah untuk siswa Tunanetra, Tunarungu, dan Tunawicara bersama Guru dan Orang Tua.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => { setAuthTab('register'); setActiveTab('auth'); }}
                  className="w-full py-3.5 rounded-2xl bg-sky-600 text-sm font-extrabold text-white shadow-lg shadow-sky-900/40 flex items-center justify-center gap-2"
                >
                  Mulai Belajar Sekarang 🚀
                </button>
                <button
                  onClick={() => setActiveTab('demo')}
                  className="w-full py-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-sky-300 hover:bg-slate-750"
                >
                  Coba Akun Demo Simulasi →
                </button>
              </div>
            </div>

            {/* Accessibility Quick Badges */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <span className="text-xl">🎧</span>
                <p className="text-[11px] font-bold text-sky-300">Suara Lisan</p>
                <p className="text-[9px] text-slate-400">Tunanetra</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <span className="text-xl">💬</span>
                <p className="text-[11px] font-bold text-sky-300">Subtitle Teks</p>
                <p className="text-[9px] text-slate-400">Tunarungu</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                <span className="text-xl">🧩</span>
                <p className="text-[11px] font-bold text-sky-300">Gestur Isyarat</p>
                <p className="text-[9px] text-slate-400">Tunawicara</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* DEMO ACCOUNTS TAB */}
        {activeTab === 'demo' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Akun Simulasi Demo</h2>
                <p className="text-xs text-slate-400">Pilih satu akun untuk mencoba fitur langsung</p>
              </div>
              <button onClick={() => setActiveTab('hero')} className="text-xs text-sky-400 font-bold">← Beranda</button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">{loginError}</div>
            )}

            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <div key={acc.key} className={`p-4 rounded-2xl bg-gradient-to-br ${acc.color} border space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{acc.icon}</span>
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
          </motion.div>
        )}

        {/* AUTH (LOGIN & REGISTER) TAB */}
        {activeTab === 'auth' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <BintangAvatar size={42} state="happy" />
                <div>
                  <h2 className="text-base font-black text-white">{authTab === 'login' ? 'Masuk ke Bintang AI' : 'Buat Akun Baru'}</h2>
                  <p className="text-[11px] text-slate-400">Ruang belajar mandiri SD</p>
                </div>
              </div>
              <button onClick={() => setActiveTab('hero')} className="text-xs text-sky-400 font-bold">← Beranda</button>
            </div>

            {/* Auth Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-800 text-center">
              <button
                onClick={() => setAuthTab('login')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors ${authTab === 'login' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
              >
                Masuk
              </button>
              <button
                onClick={() => setAuthTab('register')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors ${authTab === 'register' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
              >
                Daftar
              </button>
            </div>

            {/* Login Form */}
            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 pt-2">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">{loginError}</div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kata Sandi</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-xl bg-sky-600 text-sm font-black text-white shadow-lg shadow-sky-900/30 active:scale-98 transition-transform"
                >
                  {loginLoading ? 'Sedang memeriksa...' : 'Masuk Sekarang 🚀'}
                </button>
              </form>
            )}

            {/* Register Form */}
            {authTab === 'register' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Langkah {regStep} dari 3</span>
                  <span className="font-bold text-sky-400">{['Pilih Peran', 'Detail Kelas', 'Data Akun'][regStep - 1]}</span>
                </div>
                {regStep === 1 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-300">Daftar Sebagai:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['siswa', 'guru', 'ortu'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRegRole(r)}
                          className={`p-3 rounded-xl border text-center transition-all ${regRole === r ? 'bg-sky-600/30 border-sky-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                        >
                          <span className="text-xl block">{r === 'siswa' ? '🧒' : r === 'guru' ? '👩‍🏫' : '👨‍👧'}</span>
                          <span className="text-xs font-bold capitalize mt-1 block">{r}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setRegStep(2)}
                      className="w-full py-3 rounded-xl bg-sky-600 text-xs font-bold text-white shadow-md"
                    >
                      Lanjut ke Detail Kelas →
                    </button>
                  </div>
                )}
                {regStep === 2 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Kelas SD</label>
                      <select
                        value={regClassLevel}
                        onChange={(e) => setRegClassLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                      >
                        {['1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'].map((lvl) => (
                          <option key={lvl} value={lvl}>{lvl}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setRegStep(1)} className="flex-1 py-3 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">Kembali</button>
                      <button onClick={() => setRegStep(3)} className="flex-1 py-3 rounded-xl bg-sky-600 text-xs font-bold text-white">Lanjut →</button>
                    </div>
                  </div>
                )}
                {regStep === 3 && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                    />
                    <input
                      type="email"
                      placeholder="Alamat Email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                    />
                    <input
                      type="password"
                      placeholder="Kata Sandi"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setRegStep(2)} className="flex-1 py-3 rounded-xl bg-slate-800 text-xs font-bold text-slate-300">Kembali</button>
                      <button onClick={handleLoginSubmit} className="flex-1 py-3 rounded-xl bg-sky-600 text-xs font-bold text-white">Buat Akun</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Floating Back-to-Top Button (Arrow Pointing UP Only) */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 z-50 w-11 h-11 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        aria-label="Kembali ke Atas"
      >
        <span className="text-xl font-bold">↑</span>
      </button>
    </div>
  );
};

export default MobileLandingPage;

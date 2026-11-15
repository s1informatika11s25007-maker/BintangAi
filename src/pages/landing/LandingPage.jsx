import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { login } from '@/features/auth/api/sessionApi';
import { supabase } from '@/lib/supabaseClient';
import { logUserActivity } from '@/utils/logger';

// Akun demo mengikuti akun yang sudah disediakan pada proyek.
// Urutan dibuat berdasarkan pengguna utama: siswa, guru, kemudian orang tua.
const DEMO_ACCOUNTS = [
  {
    key: 'tunanetra',
    group: 'siswa',
    label: 'Siswa Tunanetra',
    email: 'demo.tunanetra@gmail.com',
    pass: 'demo123456',
    description: 'Budi Santoso · Kelas 4 SD',
    support: 'Suara lisan dan kontras tinggi',
  },
  {
    key: 'tunarungu',
    group: 'siswa',
    label: 'Siswa Tunarungu',
    email: 'demo.tunarungu@gmail.com',
    pass: 'demo123456',
    description: 'Siti Rahma · Kelas 3 SD',
    support: 'Teks visual dan subtitle',
  },
  {
    key: 'tunawicara',
    group: 'siswa',
    label: 'Siswa Tunawicara',
    email: 'demo.tunawicara@gmail.com',
    pass: 'demo123456',
    description: 'Doni Pratama · Kelas 5 SD',
    support: 'Pilihan komunikasi dan panduan singkat',
  },
  {
    key: 'guru',
    group: 'guru',
    label: 'Guru Pembimbing',
    email: 'demo.guru@gmail.com',
    pass: 'demo123456',
    description: 'Ibu Rina · Guru SLB/SD',
    support: 'Kelola kelas dan modul SD',
  },
  {
    key: 'ortu',
    group: 'ortu',
    label: 'Orang Tua / Wali',
    email: 'demo.ortu@gmail.com',
    pass: 'demo123456',
    description: 'Pak Herman · Orang tua',
    support: 'Dampingi dan lihat laporan anak',
  },
];

const LEARNING_MODES = [
  {
    id: 'tunanetra',
    title: 'Tunanetra',
    note: 'Hambatan penglihatan',
    description: 'Panduan suara, pembaca layar, navigasi yang dapat digunakan tanpa melihat, dan deskripsi gambar.',
    tone: 'violet',
  },
  {
    id: 'tunarungu',
    title: 'Tunarungu',
    note: 'Hambatan pendengaran',
    description: 'Teks yang jelas, subtitle, transkrip ucapan, dan petunjuk visual.',
    tone: 'cyan',
  },
  {
    id: 'tunawicara',
    title: 'Tunawicara',
    note: 'Hambatan bicara',
    description: 'Pilihan komunikasi melalui tulisan, gambar, simbol, kalimat cepat, dan suara teks bila diperlukan.',
    tone: 'emerald',
  },
  {
    id: 'tidak_ada',
    title: 'Umum / Standar SD',
    note: 'Mode belajar umum',
    description: 'Tampilan belajar sederhana yang tetap menyediakan pengaturan teks, suara, dan kontras.',
    tone: 'slate',
  },
];

// Setiap slide mempunyai karakter transisi sendiri: tirai, lipatan 3D,
// iris, buku terbuka, tumpukan kertas, rana, spotlight, dan lipatan map.
// Dengan begitu presentasi terasa seperti rangkaian adegan, bukan carousel biasa.
const SLIDE_MOTIONS = [
  {
    initial: { opacity: 0, clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)', scale: 1.04 },
    animate: { opacity: 1, clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', scale: 1 },
    exit: { opacity: 0, clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)', scale: 0.97 },
    transition: { duration: 0.82, ease: [0.76, 0, 0.24, 1] },
    style: { transformPerspective: 1600, transformOrigin: 'center center' },
  },
  {
    initial: (direction) => ({ opacity: 0, rotateY: direction > 0 ? 34 : -34, x: direction > 0 ? 100 : -100, scale: 0.94 }),
    animate: { opacity: 1, rotateY: 0, x: 0, scale: 1 },
    exit: (direction) => ({ opacity: 0, rotateY: direction > 0 ? -30 : 30, x: direction > 0 ? -80 : 80, scale: 0.96 }),
    transition: { duration: 0.74, ease: [0.2, 0.8, 0.2, 1] },
    style: { transformPerspective: 1500, transformOrigin: 'center center' },
  },
  {
    initial: { opacity: 0, clipPath: 'circle(0% at 50% 48%)', scale: 0.96 },
    animate: { opacity: 1, clipPath: 'circle(145% at 50% 48%)', scale: 1 },
    exit: { opacity: 0, clipPath: 'circle(0% at 50% 48%)', scale: 1.03 },
    transition: { duration: 0.88, ease: [0.16, 1, 0.3, 1] },
    style: { transformPerspective: 1400, transformOrigin: 'center center' },
  },
  {
    initial: { opacity: 0, scaleX: 0.08, rotateY: 24, x: -40 },
    animate: { opacity: 1, scaleX: 1, rotateY: 0, x: 0 },
    exit: { opacity: 0, scaleX: 0.08, rotateY: -24, x: 40 },
    transition: { duration: 0.78, ease: [0.65, 0, 0.35, 1] },
    style: { transformPerspective: 1700, transformOrigin: 'left center' },
  },
  {
    initial: { opacity: 0, y: 110, rotateZ: 6, scale: 0.86, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, rotateZ: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -90, rotateZ: -5, scale: 0.91, filter: 'blur(8px)' },
    transition: { duration: 0.76, ease: [0.22, 1, 0.36, 1] },
    style: { transformPerspective: 1400, transformOrigin: 'center center' },
  },
  {
    initial: { opacity: 0, clipPath: 'inset(48% 0% 48% 0% round 28px)', scale: 1.04 },
    animate: { opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1 },
    exit: { opacity: 0, clipPath: 'inset(48% 0% 48% 0% round 28px)', scale: 0.98 },
    transition: { duration: 0.8, ease: [0.7, 0, 0.2, 1] },
    style: { transformPerspective: 1400, transformOrigin: 'center center' },
  },
  {
    initial: { opacity: 0, scale: 0.68, y: 55, filter: 'blur(18px)' },
    animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.22, y: -24, filter: 'blur(16px)' },
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    style: { transformPerspective: 1300, transformOrigin: 'center center' },
  },
  {
    initial: { opacity: 0, rotateX: 82, y: 70, scale: 0.96 },
    animate: { opacity: 1, rotateX: 0, y: 0, scale: 1 },
    exit: { opacity: 0, rotateX: -76, y: -45, scale: 0.96 },
    transition: { duration: 0.86, ease: [0.2, 0.9, 0.25, 1] },
    style: { transformPerspective: 1300, transformOrigin: 'bottom center' },
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

// Durasi otomatis tiap slide. Slide demo diberi waktu baca lebih panjang.
const TOUR_DURATIONS = [0, 7200, 7600, 7600, 7600, 10500, 7000, 0];

const fieldClass = 'w-full min-h-12 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-950 placeholder:text-blue-300 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100';
const primaryButton = 'inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60';
const secondaryButton = 'inline-flex min-h-12 items-center justify-center rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-800 transition hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, setManualMode, setModeFromProfile } = useAccessibilityStore();
  const { setUser, fetchProfile } = useAuthStore();
  const prefersReducedMotion = useReducedMotion();

  const normalizedMode = mode === 'standar' ? 'tidak_ada' : (mode || 'tidak_ada');

  // Presentasi berbentuk slide, bukan halaman panjang yang harus digulir.
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const slideContentRef = useRef(null);
  const touchStartRef = useRef(null);
  const wheelLockRef = useRef(false);
  const [selectedUserRole, setSelectedUserRole] = useState(normalizedMode);
  const [roleFeedback, setRoleFeedback] = useState('');

  // Tur otomatis per slide, dengan panduan awal dan kontrol jeda untuk desktop/Android.
  const [showTourGuide, setShowTourGuide] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourPaused, setTourPaused] = useState(false);

  // Auth state.
  const [authTab, setAuthTab] = useState('login');
  const [regStep, setRegStep] = useState(1);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);

  // Registration state.
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState('siswa');
  const [regDisability, setRegDisability] = useState(normalizedMode);
  const [regClassLevel, setRegClassLevel] = useState('4 SD');
  const [regClassCode, setRegClassCode] = useState('');
  const [regSlbName, setRegSlbName] = useState('');
  const [regSubject, setRegSubject] = useState('Matematika');
  const [regStudentIdInput, setRegStudentIdInput] = useState('');
  const [checkingChild, setCheckingChild] = useState(false);
  const [verifiedChild, setVerifiedChild] = useState(null);
  const [childCheckError, setChildCheckError] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState(null);

  // Audio is optional; it never starts automatically when a mode is selected.
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const speakText = useCallback((text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, []);

  const goToSlide = useCallback((nextIndex, options = {}) => {
    const safeIndex = Math.max(0, Math.min(7, nextIndex));
    setSlideDirection(safeIndex >= activeSlide ? 1 : -1);
    setActiveSlide(safeIndex);
    stopAudio();

    // Navigasi manual menghentikan tur agar tidak bertabrakan dengan pilihan pengguna.
    if (options.manual !== false) {
      setTourActive(false);
      setTourPaused(false);
    }
  }, [activeSlide, stopAudio]);

  const requestExplore = () => setShowTourGuide(true);

  const startExploreTour = () => {
    setShowTourGuide(false);
    setTourActive(true);
    setTourPaused(false);
    goToSlide(1, { manual: false });
  };

  const openAuth = (tab) => {
    setAuthTab(tab);
    setLoginMessage(null);
    setRegMessage(null);
    if (tab === 'register') setRegStep(1);
    goToSlide(7);
  };

  // Deep links /?mode=login and /?mode=register tetap didukung.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'register') {
      setAuthTab('register');
      setRegStep(1);
      setActiveSlide(7);
    } else if (modeParam === 'login') {
      setAuthTab('login');
      setActiveSlide(7);
    }
  }, [location.search]);

  // Tur otomatis: tunggu slide selesai masuk, lalu gulir isi yang panjang
  // secara perlahan sampai bagian paling bawah sebelum berpindah ke slide berikutnya.
  // Pada perangkat sentuh (termasuk Android), kecepatan dibuat lebih pelan.
  // Saat dijeda, requestAnimationFrame dihentikan dan posisi scroll dipertahankan.
  useEffect(() => {
    if (!tourActive || tourPaused) return undefined;

    if (activeSlide >= 7) {
      setTourActive(false);
      setTourPaused(false);
      return undefined;
    }

    const scroller = slideContentRef.current;
    if (!scroller) return undefined;

    let animationFrame = 0;
    let entryTimer = 0;
    let advanceTimer = 0;
    let cancelled = false;

    const advance = () => {
      if (cancelled) return;
      goToSlide(activeSlide + 1, { manual: false });
    };

    // Beri waktu untuk animasi transisi slide selesai sebelum mengukur konten.
    entryTimer = window.setTimeout(() => {
      if (cancelled) return;

      const maxScrollTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      const startScrollTop = Math.min(scroller.scrollTop, maxScrollTop);
      const distance = Math.max(0, maxScrollTop - startScrollTop);
      const baseDuration = TOUR_DURATIONS[activeSlide] || 7200;

      // Slide pendek tetap diberi waktu baca. Slide panjang digulir perlahan.
      if (distance < 8) {
        advanceTimer = window.setTimeout(advance, baseDuration);
        return;
      }

      const isTouchDevice = typeof window !== 'undefined'
        && window.matchMedia
        && window.matchMedia('(pointer: coarse)').matches;
      const pixelsPerSecond = prefersReducedMotion ? 10000 : (isTouchDevice ? 46 : 76);
      const scrollDuration = Math.max(baseDuration, (distance / pixelsPerSecond) * 1000);
      const startedAt = performance.now();

      const animateScroll = (now) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - startedAt) / scrollDuration);
        // Gerak linear menjaga laju gulir stabil dan mudah diikuti.
        scroller.scrollTop = startScrollTop + (distance * progress);

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(animateScroll);
        } else {
          // Tahan sebentar di bagian akhir agar konten terakhir sempat dibaca.
          advanceTimer = window.setTimeout(advance, 1100);
        }
      };

      animationFrame = window.requestAnimationFrame(animateScroll);
    }, prefersReducedMotion ? 80 : 850);

    return () => {
      cancelled = true;
      window.clearTimeout(entryTimer);
      window.clearTimeout(advanceTimer);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [tourActive, tourPaused, activeSlide, goToSlide, prefersReducedMotion]);

  // Navigasi keyboard: PageUp / PageDown, serta Spasi untuk jeda/lanjutkan tur.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement && (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      );
      if (isTyping) return;

      if (event.code === 'Space' && tourActive) {
        event.preventDefault();
        setTourPaused((paused) => !paused);
        return;
      }

      if (event.key === 'PageDown' || (event.altKey && event.key === 'ArrowRight')) {
        event.preventDefault();
        setTourActive(false);
        setTourPaused(false);
        setActiveSlide((current) => {
          const next = Math.min(7, current + 1);
          setSlideDirection(1);
          return next;
        });
        stopAudio();
      } else if (event.key === 'PageUp' || (event.altKey && event.key === 'ArrowLeft')) {
        event.preventDefault();
        setTourActive(false);
        setTourPaused(false);
        setActiveSlide((current) => {
          const next = Math.max(0, current - 1);
          setSlideDirection(-1);
          return next;
        });
        stopAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stopAudio, tourActive]);

  // Roda mouse/trackpad berpindah slide hanya ketika konten slide sudah
  // mencapai tepi atas/bawah. Konten panjang seperti formulir tetap bisa digulir.
  const handleWheel = useCallback((event) => {
    if (Math.abs(event.deltaY) < 42) return;
    const scroller = slideContentRef.current;
    if (!scroller || wheelLockRef.current) return;

    const atTop = scroller.scrollTop <= 4;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 5;
    const movingDown = event.deltaY > 0;
    if ((movingDown && !atBottom) || (!movingDown && !atTop)) return;

    event.preventDefault();
    wheelLockRef.current = true;
    goToSlide(activeSlide + (movingDown ? 1 : -1));
    window.setTimeout(() => { wheelLockRef.current = false; }, 920);
  }, [activeSlide, goToSlide]);

  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches?.[0];
    touchStartRef.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    // Geser horizontal untuk mengganti slide; geser vertikal tetap menggulir isi.
    if (Math.abs(deltaX) > 72 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      goToSlide(activeSlide + (deltaX < 0 ? 1 : -1));
    }
  };

  useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const checkChildProfile = useCallback(async (studentId) => {
    if (!studentId || studentId.trim().length < 5) {
      setVerifiedChild(null);
      setChildCheckError(null);
      return;
    }

    setCheckingChild(true);
    setChildCheckError(null);
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
        setVerifiedChild(null);
        setChildCheckError('ID Belajar Siswa tidak ditemukan. Periksa kembali ID anak.');
      } else {
        setVerifiedChild(child);
        setChildCheckError(null);
      }
    } catch (error) {
      setVerifiedChild(null);
      setChildCheckError('Gagal memverifikasi ID siswa. Silakan coba lagi.');
    } finally {
      setCheckingChild(false);
    }
  }, []);

  useEffect(() => {
    if (regRole !== 'ortu') {
      setVerifiedChild(null);
      setChildCheckError(null);
      return undefined;
    }

    if (!regStudentIdInput.trim()) {
      setVerifiedChild(null);
      setChildCheckError(null);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      checkChildProfile(regStudentIdInput.trim());
    }, 500);
    return () => window.clearTimeout(timer);
  }, [regRole, regStudentIdInput, checkChildProfile]);

  const handleSelectRoleInitial = (roleId) => {
    setSelectedUserRole(roleId);
    setRegDisability(roleId);
    setManualMode(roleId === 'tidak_ada' ? 'standar' : roleId);

    const labels = {
      tunanetra: 'Mode Tunanetra',
      tunarungu: 'Mode Tunarungu',
      tunawicara: 'Mode Tunawicara',
      tidak_ada: 'Mode Umum / Standar SD',
    };
    setRoleFeedback(`${labels[roleId] || 'Pilihan belajar'} dipilih. Pengaturan ini dapat diubah kembali nanti.`);
  };

  const getTargetPath = (role) => {
    if (role === 'guru') return '/teacher/dashboard';
    if (role === 'ortu') return '/parent/dashboard';
    return '/student/dashboard';
  };

  const handleDemoLogin = async (demoAccount) => {
    setLoginLoading(true);
    setLoginMessage(null);
    stopAudio();

    try {
      const data = await login(demoAccount.email, demoAccount.pass);
      setUser(data.user);

      const profileData = await fetchProfile(data.user.id);
      if (!profileData) {
        throw new Error('Akun demo berhasil dikenali, tetapi profilnya belum tersedia di database.');
      }

      await logUserActivity(
        'LOGIN',
        'Masuk Simulasi Peran',
        `Mencoba simulasi ${demoAccount.label} (${profileData.full_name})`,
        profileData,
      );
      setModeFromProfile(profileData);
      speakText(`Selamat mencoba simulasi ${demoAccount.label}.`);
      window.setTimeout(() => navigate(getTargetPath(profileData.role)), 500);
    } catch (error) {
      const message = error?.message || 'Gagal masuk ke akun simulasi.';
      setLoginMessage({ type: 'error', text: message });
      speakText(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginMessage(null);
    stopAudio();

    try {
      if (!loginEmail.trim()) throw new Error('Silakan masukkan alamat email.');
      if (!loginPassword) throw new Error('Silakan masukkan kata sandi.');

      const data = await login(loginEmail.trim(), loginPassword);
      setUser(data.user);

      const profileData = await fetchProfile(data.user.id);
      if (!profileData) throw new Error('Profil akun belum ditemukan di database.');

      await logUserActivity('LOGIN', 'Masuk Aplikasi', `Pengguna ${profileData.full_name} masuk`, profileData);
      setModeFromProfile(profileData);
      speakText(`Selamat datang kembali, ${profileData.full_name}.`);
      window.setTimeout(() => navigate(getTargetPath(profileData.role)), 500);
    } catch (error) {
      const message = error?.message || 'Masuk akun gagal. Periksa email dan kata sandi Anda.';
      setLoginMessage({ type: 'error', text: message });
      speakText(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterNext = () => {
    setRegMessage(null);

    if (regStep === 1) {
      if (!regRole) {
        setRegMessage({ type: 'error', text: 'Silakan pilih peran pengguna terlebih dahulu.' });
        return;
      }
      if (regRole === 'siswa' && !regDisability) {
        setRegMessage({ type: 'error', text: 'Silakan pilih kebutuhan belajar siswa.' });
        return;
      }
      setRegStep(2);
      return;
    }

    if (regStep === 2) {
      if (regRole === 'siswa') {
        if (!regClassLevel) {
          setRegMessage({ type: 'error', text: 'Tingkat kelas SD wajib dipilih.' });
          return;
        }
        if (!regClassCode.trim()) {
          setRegMessage({ type: 'error', text: 'Kode kelas dari guru wajib diisi.' });
          return;
        }
      }

      if (regRole === 'guru') {
        if (!regSlbName.trim()) {
          setRegMessage({ type: 'error', text: 'Nama sekolah atau SLB wajib diisi.' });
          return;
        }
        if (!regClassLevel) {
          setRegMessage({ type: 'error', text: 'Kelas yang diampu wajib dipilih.' });
          return;
        }
      }

      if (regRole === 'ortu') {
        if (!regStudentIdInput.trim()) {
          setRegMessage({ type: 'error', text: 'ID Belajar Siswa anak wajib diisi.' });
          return;
        }
        if (checkingChild) {
          setRegMessage({ type: 'error', text: 'Sedang memeriksa ID siswa. Silakan tunggu sebentar.' });
          return;
        }
        if (!verifiedChild || childCheckError) {
          setRegMessage({ type: 'error', text: childCheckError || 'ID siswa belum berhasil diverifikasi.' });
          return;
        }
      }

      setRegStep(3);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegLoading(true);
    setRegMessage(null);
    stopAudio();

    try {
      if (!regFullName.trim()) throw new Error('Nama lengkap wajib diisi.');
      if (!regEmail.trim()) throw new Error('Alamat email wajib diisi.');
      if (regPassword.length < 8) throw new Error('Kata sandi minimal 8 karakter.');
      if (regPassword !== regConfirmPassword) throw new Error('Konfirmasi kata sandi tidak cocok dengan kata sandi.');

      let linkedId = null;
      let finalClassCode = regClassCode.trim().toUpperCase();
      const finalSlbName = regSlbName.trim();
      let finalClassLevel = regClassLevel;

      if (regRole === 'siswa') {
        if (!regClassLevel) throw new Error('Tingkat kelas SD (1–6 SD) wajib dipilih.');
        if (!finalClassCode) throw new Error('Kode kelas dari guru wajib diisi.');
      }

      if (regRole === 'ortu') {
        if (!regStudentIdInput.trim()) throw new Error('ID Belajar Siswa anak wajib diisi.');
        if (checkingChild || !verifiedChild || childCheckError) {
          throw new Error('ID siswa belum berhasil diverifikasi. Periksa kembali ID anak.');
        }
        linkedId = verifiedChild.id;
        if (verifiedChild.class_level) finalClassLevel = verifiedChild.class_level;
      }

      if (regRole === 'guru') {
        finalClassCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        if (!finalSlbName) throw new Error('Nama sekolah / SLB wajib diisi untuk Guru.');
        if (!finalClassLevel) throw new Error('Kelas yang diampu wajib dipilih.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: regEmail.toLowerCase().trim(),
        password: regPassword,
        options: {
          data: {
            full_name: regFullName.trim(),
            role: regRole,
            disability_type: regDisability,
            slb_name: finalSlbName,
            class_level: finalClassLevel,
            class_code: finalClassCode,
            subject: regSubject,
            linked_student_id: linkedId,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const successText = regRole === 'guru'
          ? `Pendaftaran berhasil. Kode kelas Anda: ${finalClassCode}. Silakan masuk setelah proses konfirmasi akun selesai.`
          : 'Pendaftaran berhasil. Silakan masuk setelah proses konfirmasi akun selesai.';
        setRegMessage({ type: 'success', text: successText });
        speakText(successText);
        window.setTimeout(() => {
          setAuthTab('login');
          setLoginEmail(regEmail);
          setLoginPassword('');
        }, 2200);
      }
    } catch (error) {
      const message = error?.message || 'Pendaftaran gagal. Periksa kembali data Anda.';
      setRegMessage({ type: 'error', text: message });
      speakText(message);
    } finally {
      setRegLoading(false);
    }
  };

  const SlideHeading = ({ eyebrow, title, description }) => (
    <div className="max-w-3xl space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">{eyebrow}</p>
      <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">{title}</h2>
      {description && <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>}
    </div>
  );

  const renderModeCard = (item) => {
    const selected = selectedUserRole === item.id;
    const toneClasses = {
      violet: 'border-blue-200 bg-blue-50 text-blue-950',
      cyan: 'border-blue-200 bg-white text-blue-950',
      emerald: 'border-blue-300 bg-[#f2f7ff] text-blue-950',
      slate: 'border-slate-200 bg-white text-slate-950',
    };

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelectRoleInitial(item.id)}
        aria-pressed={selected}
        className={`group flex min-h-36 flex-col justify-between rounded-2xl border-2 p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 sm:p-5 ${toneClasses[item.tone]} ${selected ? 'border-blue-700 ring-2 ring-blue-200 shadow-md' : ''}`}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">{item.note}</span>
        <span>
          <span className="block text-lg font-extrabold">{item.title}</span>
          <span className="mt-2 block text-xs leading-5 opacity-80">{item.description}</span>
        </span>
        <span className="mt-3 flex items-center justify-between text-xs font-bold">
          <span>{selected ? 'Mode dipilih' : 'Pilih mode'}</span>
          <span aria-hidden="true" className="text-base">{selected ? '✓' : '→'}</span>
        </span>
      </button>
    );
  };

  const renderDemoCard = (account) => (
    <article key={account.key} className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">{account.label}</p>
        <h3 className="mt-3 text-lg font-extrabold text-slate-950">{account.description}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{account.support}</p>
      </div>
      <button
        type="button"
        disabled={loginLoading}
        onClick={() => handleDemoLogin(account)}
        className={`${primaryButton} mt-5 w-full`}
      >
        {loginLoading ? 'Memproses…' : 'Masuk ke simulasi'}
      </button>
    </article>
  );

  const demoStudents = DEMO_ACCOUNTS.filter((account) => account.group === 'siswa');
  const demoAdults = DEMO_ACCOUNTS.filter((account) => account.group !== 'siswa');

  const currentMotion = SLIDE_MOTIONS[activeSlide];
  const initialMotion = prefersReducedMotion ? { opacity: 0 } : (typeof currentMotion.initial === 'function' ? currentMotion.initial(slideDirection) : currentMotion.initial);
  const exitMotion = prefersReducedMotion ? { opacity: 0 } : (typeof currentMotion.exit === 'function' ? currentMotion.exit(slideDirection) : currentMotion.exit);

  return (
    <div className="relative h-screen h-[100dvh] w-screen overflow-hidden bg-[#f7f9fc] font-sans text-slate-900 selection:bg-blue-200">
      {/* Kanvas presentasi penuh layar. Tidak ada navbar/header maupun footer. */}
      <div
        className="absolute inset-0 overflow-hidden"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.main
            ref={slideContentRef}
            key={activeSlide}
            custom={slideDirection}
            initial={initialMotion}
            animate={prefersReducedMotion ? { opacity: 1 } : currentMotion.animate}
            exit={exitMotion}
            transition={prefersReducedMotion ? { duration: 0.01 } : currentMotion.transition}
            style={{
              ...(prefersReducedMotion ? {} : currentMotion.style),
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }}
            className={`absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain px-0 pb-24 [scrollbar-width:thin] [scrollbar-color:#93c5fd_transparent] sm:pb-20 ${activeSlide === 7 ? 'pr-4 sm:pr-8' : 'pr-12 sm:pr-16'}`}
          >
            {/* SLIDE 1 — WELCOME & PREFERENSI AKSESIBILITAS */}
            {activeSlide === 0 && (
              <section className="mx-auto flex min-h-full w-full max-w-7xl flex-col justify-center gap-8 px-5 py-8 sm:px-10 lg:flex-row lg:items-center lg:gap-14 lg:px-16">
                <div className="max-w-xl space-y-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Kenalan dengan Bintang AI · Kelas 1–6 SD</p>
                  <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">Halo, Teman Bintang.</h1>
                  <p className="max-w-lg text-lg leading-8 text-slate-600 sm:text-xl">Bintang AI adalah ruang belajar SD inklusif yang membantu anak belajar dengan cara yang lebih sesuai dan nyaman.</p>
                  <p className="max-w-lg text-sm leading-7 text-slate-500">Di sini, siswa dapat mempelajari modul, bertanya kepada Kak Bintang, dan berlatih. Guru serta orang tua ikut mendampingi perjalanan belajar anak.</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => speakText('Halo, Teman Bintang. Bintang AI adalah ruang belajar SD inklusif untuk siswa, guru, dan orang tua. Pilih cara belajar yang nyaman, lalu jelajahi fitur yang tersedia.')} className={secondaryButton}>
                      {isPlayingAudio ? 'Suara sedang diputar' : 'Dengarkan pengenalan'}
                    </button>
                    {isPlayingAudio && <button type="button" onClick={stopAudio} className="text-sm font-semibold text-blue-700 underline">Hentikan suara</button>}
                    <button type="button" onClick={requestExplore} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200">
                      Jelajahi Bintang AI <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                  <p role="status" aria-live="polite" className="min-h-5 text-sm font-semibold text-blue-800">{roleFeedback}</p>
                </div>

                <div className="w-full max-w-2xl space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Mulai dari sini</p>
                      <h2 className="mt-1 text-xl font-extrabold text-slate-950 sm:text-2xl">Cara belajar yang nyaman</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => openAuth('login')} className={`${secondaryButton} min-h-10 px-4 py-2 text-xs`}>Masuk</button>
                      <button type="button" onClick={() => openAuth('register')} className={`${primaryButton} min-h-10 px-4 py-2 text-xs`}>Daftar</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {LEARNING_MODES.map(renderModeCard)}
                  </div>
                  <p className="text-xs leading-5 text-slate-500">Catatan: kebutuhan setiap anak berbeda. Semua anak tetap dapat menggunakan pengaturan dasar seperti ukuran teks, kontras, dan suara.</p>
                </div>
              </section>
            )}

            {/* SLIDE 2 — ALASAN / SOLUSI */}
            {activeSlide === 1 && (
              <section className="mx-auto flex min-h-full w-full max-w-7xl flex-col justify-center gap-10 px-5 py-10 sm:px-10 lg:px-16">
                <SlideHeading
                  eyebrow="Mengapa Bintang AI hadir?"
                  title="Setiap anak berhak belajar dengan cara yang dapat diakses."
                  description="Bintang AI dirancang sebagai ruang belajar SD yang menghubungkan siswa, guru, dan orang tua dalam pengalaman belajar yang lebih mudah dijangkau."
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <article className="rounded-3xl border border-blue-100 bg-white p-6 sm:p-9">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Untuk siswa</p>
                    <h3 className="mt-4 text-2xl font-extrabold text-slate-950">Materi yang lebih mudah diikuti.</h3>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">Siswa dapat mempelajari materi melalui teks, suara, visual, dan pilihan komunikasi yang sesuai. Siswa juga dapat bertanya kepada Kak Bintang dengan bahasa yang sederhana.</p>
                  </article>
                  <article className="rounded-3xl border border-slate-200 bg-[#eef3f9] p-6 sm:p-9">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">Untuk pendamping</p>
                    <h3 className="mt-4 text-2xl font-extrabold text-slate-950">Belajar yang saling terhubung.</h3>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">Guru menyiapkan kelas dan materi. Orang tua mendampingi kegiatan belajar serta melihat perkembangan anak sesuai data yang tersedia di platform.</p>
                  </article>
                </div>
                <p className="max-w-3xl border-l-4 border-blue-700 pl-4 text-sm leading-7 text-slate-600">Prinsipnya sederhana: teknologi membantu anak belajar, bukan membuat anak harus menyesuaikan diri dengan teknologi.</p>
              </section>
            )}

            {/* SLIDE 3 — PILIHAN AKSESIBILITAS */}
            {activeSlide === 2 && (
              <section className="mx-auto flex min-h-full w-full max-w-7xl flex-col justify-center gap-8 px-5 py-8 sm:px-10 lg:px-16">
                <SlideHeading
                  eyebrow="Pilihan cara belajar"
                  title="Satu ruang belajar, beberapa cara untuk memahami."
                  description="Pilih mode sebagai titik awal. Fitur aksesibilitas sebaiknya tetap dapat diatur sesuai kebutuhan masing-masing anak."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {LEARNING_MODES.map(renderModeCard)}
                </div>
                <p role="status" aria-live="polite" className="text-sm font-semibold text-blue-800">{roleFeedback || 'Belum memilih? Kamu dapat melanjutkan tanpa menentukan mode.'}</p>
              </section>
            )}

            {/* SLIDE 4 — FITUR UTAMA */}
            {activeSlide === 3 && (
              <section className="mx-auto flex min-h-full w-full max-w-7xl flex-col justify-center gap-10 px-5 py-10 sm:px-10 lg:px-16">
                <SlideHeading
                  eyebrow="Fitur utama"
                  title="Belajar dalam empat langkah yang mudah dikenali."
                  description="Materi, pendamping tanya jawab, latihan, dan pengajaran realtime disusun agar siswa dapat belajar secara bertahap dan inklusif."
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <article className="flex min-h-64 flex-col justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                    <span className="text-sm font-bold tracking-[0.16em] text-blue-700">01 / MATERI</span>
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-950">Modul Belajar SD</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">Materi kelas 1–6 dengan pengaturan ukuran teks dan pembacaan paragraf bila tersedia.</p>
                    </div>
                  </article>
                  <article className="flex min-h-64 flex-col justify-between rounded-3xl bg-[#eaf2ff] p-6 sm:p-8">
                    <span className="text-sm font-bold tracking-[0.16em] text-blue-800">02 / BERTANYA</span>
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-950">Tanya Kak Bintang</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-700">Tutor belajar yang membantu menjelaskan materi dengan kalimat sederhana dan langkah yang mudah diikuti.</p>
                    </div>
                  </article>
                  <article className="flex min-h-64 flex-col justify-between rounded-3xl bg-[#f1f3f5] p-6 sm:p-8">
                    <span className="text-sm font-bold tracking-[0.16em] text-slate-600">03 / BERLATIH</span>
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-950">Kuis dan Poin</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">Latihan interaktif dan poin belajar untuk membantu siswa melihat kemajuan dari waktu ke waktu.</p>
                    </div>
                  </article>
                  <article className="flex min-h-64 flex-col justify-between rounded-3xl bg-[#f8fafc] p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                    <span className="text-sm font-bold tracking-[0.16em] text-blue-700">04 / REALTIME</span>
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-950">Pengajaran Realtime</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">Guru mengajar secara realtime dengan penyampaian suara untuk Tunanetra, teks untuk Tunarungu, dan Tunawicara membalas dengan teks.</p>
                    </div>
                  </article>
                </div>
              </section>
            )}

            {/* SLIDE 5 — ALUR PENGGUNA */}
            {activeSlide === 4 && (
              <section className="mx-auto flex min-h-full w-full max-w-7xl flex-col justify-center gap-10 px-5 py-10 sm:px-10 lg:px-16">
                <SlideHeading
                  eyebrow="Pengguna platform"
                  title="Tiga peran, satu perjalanan belajar."
                  description="Setiap peran memiliki tugas yang berbeda. Alurnya saling terhubung agar pembelajaran anak mendapat dukungan di sekolah dan di rumah."
                />
                <div className="grid gap-3 md:grid-cols-3">
                  <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">01 · Menyiapkan</p>
                    <h3 className="mt-5 text-2xl font-extrabold">Guru Pembimbing</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">Membuat kelas, membagikan kode kelas, menyiapkan modul, dan memantau tugas siswa.</p>
                  </article>
                  <article className="rounded-3xl border-2 border-blue-700 bg-blue-50 p-6 sm:p-7">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-800">02 · Belajar</p>
                    <h3 className="mt-5 text-2xl font-extrabold">Siswa SD</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-700">Membuka materi, bertanya kepada Kak Bintang, dan mengerjakan latihan sesuai kelasnya.</p>
                  </article>
                  <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">03 · Mendampingi</p>
                    <h3 className="mt-5 text-2xl font-extrabold">Orang Tua / Wali</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">Melihat laporan belajar dan mendampingi anak berdasarkan perkembangan yang tercatat.</p>
                  </article>
                </div>
                <p className="text-sm text-slate-500">Alur operasional: Guru menyiapkan kelas → Siswa belajar → Orang tua mendampingi.</p>
              </section>
            )}

            {/* SLIDE 6 — DEMO */}
            {activeSlide === 5 && (
              <section className="mx-auto flex min-h-full w-full max-w-7xl flex-col justify-center gap-8 px-5 py-8 sm:px-10 lg:px-16">
                <SlideHeading
                  eyebrow="Coba simulasi"
                  title="Lihat pengalaman dari sisi setiap pengguna."
                  description="Pilih akun contoh untuk masuk otomatis ke ruang simulasi. Siswa ditampilkan lebih dahulu karena siswa adalah pengguna utama ruang belajar."
                />
                {loginMessage && (
                  <div role="alert" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">{loginMessage.text}</div>
                )}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">A · Siswa SD</span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">{demoStudents.map(renderDemoCard)}</div>
                  <article className="mt-3 flex flex-col justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">Mode Umum / Standar SD</p>
                      <h3 className="mt-2 text-base font-extrabold text-slate-950">Gunakan akun siswa yang sudah terdaftar.</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">Belum tersedia akun simulasi terpisah untuk mode umum. Pilihan mode tetap dapat diatur sebelum masuk.</p>
                    </div>
                    <button type="button" onClick={() => { handleSelectRoleInitial('tidak_ada'); openAuth('login'); }} className={secondaryButton}>Masuk sebagai siswa</button>
                  </article>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">B · Guru</span>
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    {renderDemoCard(demoAdults.find((account) => account.group === 'guru'))}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">C · Orang tua / wali</span>
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    {renderDemoCard(demoAdults.find((account) => account.group === 'ortu'))}
                  </div>
                </div>
                <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-6 text-blue-900">Catatan: tombol ini melakukan login otomatis menggunakan akun simulasi yang dikonfigurasi pada aplikasi. Jadi, demo bukan sesi anonim tanpa autentikasi.</p>
              </section>
            )}

            {/* SLIDE 7 — CTA */}
            {activeSlide === 6 && (
              <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col items-center justify-center px-5 py-12 text-center sm:px-10">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-700">Bintang AI · Ruang Belajar SD Inklusif</p>
                <h2 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">Setiap anak punya cara untuk bersinar.</h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">Mulai dari mencoba simulasi, membuat akun, atau masuk untuk melanjutkan kegiatan belajar.</p>
                <div className="mt-9 flex w-full max-w-lg flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => openAuth('register')} className={`${primaryButton} flex-1`}>Daftar akun</button>
                  <button type="button" onClick={() => openAuth('login')} className={`${secondaryButton} flex-1`}>Masuk ke akun</button>
                </div>
                <button type="button" onClick={() => goToSlide(5)} className="mt-5 text-sm font-semibold text-blue-700 underline underline-offset-4">Kembali mencoba demo</button>
              </section>
            )}

            {/* SLIDE 8 — LOGIN / REGISTER: SPLIT SCREEN, BLUE & WHITE */}
            {activeSlide === 7 && (
              <section className="flex min-h-full w-full flex-col bg-white lg:min-h-[100dvh] lg:flex-row">
                {/* Panel kiri: pengenalan singkat yang mengisi ruang dan ramah anak. */}
                <aside className="relative flex w-full shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 px-5 py-6 text-white sm:px-8 sm:py-8 lg:min-h-[100dvh] lg:w-[40%] lg:px-10 lg:py-10 xl:w-[38%] xl:px-12">
                  <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[28px] border-white/10" />
                  <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full border-[34px] border-white/10" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-blue-50">
                      RUANG BELAJAR SD INKLUSIF
                    </div>
                    <p className="mt-7 text-sm font-semibold text-blue-100 sm:mt-10">Halo, Teman Bintang!</p>
                    <h2 className="mt-2 max-w-xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl xl:text-5xl">
                      {authTab === 'login' ? 'Senang bertemu kembali.' : 'Yuk, mulai perjalanan belajarmu.'}
                    </h2>
                    <p className="mt-4 max-w-lg text-sm leading-7 text-blue-50 sm:text-base">
                      {authTab === 'login'
                        ? 'Masuk untuk melanjutkan belajar, membuka modul, bertanya kepada Kak Bintang, dan melihat kegiatan kelas.'
                        : 'Buat akun bersama guru atau orang tua. Pilih peran dan cara belajar yang paling nyaman untukmu.'}
                    </p>
                  </div>

                  <div className="relative z-10 mt-7 grid grid-cols-3 gap-2 sm:mt-9 sm:gap-3 lg:mt-12">
                    {['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'].map((grade, index) => (
                      <div key={grade} className="rounded-xl border border-white/20 bg-white/10 px-2 py-3 text-center backdrop-blur-sm sm:py-4">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-blue-100">{grade}</span>
                        <span className="mt-1 block text-xl font-black text-white">{index + 1}</span>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 mt-6 flex flex-col gap-2 border-t border-white/20 pt-5 sm:flex-row sm:items-center sm:justify-between lg:mt-10">
                    <p className="text-xs leading-5 text-blue-100">Belajar dengan cara yang nyaman, satu langkah setiap hari.</p>
                    {authTab === 'register' && (
                      <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-blue-800">
                        Langkah {regStep} dari 3
                      </span>
                    )}
                  </div>
                </aside>

                {/* Panel kanan: form mengisi sisi kanan, tidak menjadi kartu kecil di tengah. */}
                <div className="flex min-w-0 flex-1 flex-col bg-[#f4f8ff] px-4 py-6 sm:px-7 sm:py-8 lg:min-h-[100dvh] lg:px-8 lg:py-9 xl:px-12">
                  <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
                    <div className="mb-6 flex flex-col gap-4 border-b border-blue-100 pb-5 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">Bintang AI</p>
                        <h3 className="mt-2 text-2xl font-black tracking-tight text-blue-950 sm:text-3xl">
                          {authTab === 'login' ? 'Masuk ke akun' : 'Daftar akun baru'}
                        </h3>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-blue-700/80">
                          {authTab === 'login' ? 'Gunakan email dan kata sandi akunmu.' : 'Isi informasi secara bertahap. Data yang diminta menyesuaikan peran.'}
                        </p>
                      </div>
                      <div className="grid w-full grid-cols-2 rounded-xl border border-blue-200 bg-white p-1 sm:w-auto sm:min-w-[230px]">
                        <button type="button" onClick={() => { setAuthTab('login'); setLoginMessage(null); }} aria-pressed={authTab === 'login'} className={`min-h-11 rounded-lg px-5 py-2.5 text-sm font-extrabold transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${authTab === 'login' ? 'bg-blue-700 text-white shadow-sm' : 'text-blue-700 hover:bg-blue-50'}`}>Masuk</button>
                        <button type="button" onClick={() => { setAuthTab('register'); setRegStep(1); setRegMessage(null); }} aria-pressed={authTab === 'register'} className={`min-h-11 rounded-lg px-5 py-2.5 text-sm font-extrabold transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${authTab === 'register' ? 'bg-blue-700 text-white shadow-sm' : 'text-blue-700 hover:bg-blue-50'}`}>Daftar</button>
                      </div>
                    </div>

                    {authTab === 'login' && (
                      <div className="w-full rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_36px_rgba(37,99,235,0.08)] sm:rounded-3xl sm:p-7 lg:p-8">
                        {loginMessage && (
                          <div role="alert" className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${loginMessage.type === 'error' ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-blue-200 bg-[#eef5ff] text-blue-900'}`}>{loginMessage.text}</div>
                        )}
                        <form onSubmit={handleLoginSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                          <div className="min-w-0">
                            <label htmlFor="landing-login-email" className="mb-2 block text-sm font-extrabold text-blue-900">Email</label>
                            <input id="landing-login-email" type="email" autoComplete="email" required value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="nama@email.com" className={fieldClass} />
                          </div>
                          <div className="min-w-0">
                            <label htmlFor="landing-login-password" className="mb-2 block text-sm font-extrabold text-blue-900">Kata sandi</label>
                            <div className="relative">
                              <input id="landing-login-password" type={showLoginPassword ? 'text' : 'password'} autoComplete="current-password" required value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="Masukkan kata sandi" className={`${fieldClass} pr-24`} />
                              <button type="button" onClick={() => setShowLoginPassword((value) => !value)} className="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-2 text-xs font-extrabold text-blue-700 hover:bg-blue-50" aria-label={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showLoginPassword ? 'Sembunyikan' : 'Tampilkan'}</button>
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <button type="submit" disabled={loginLoading} className={`${primaryButton} w-full rounded-xl py-3.5 text-base`}>{loginLoading ? 'Memeriksa akun…' : 'Masuk ke Bintang AI'}</button>
                          </div>
                        </form>
                        <div className="mt-5 flex flex-col gap-2 border-t border-blue-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-blue-800">Belum punya akun?</p>
                          <button type="button" onClick={() => { setAuthTab('register'); setRegStep(1); setRegMessage(null); }} className="w-fit text-sm font-extrabold text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900">Daftar sekarang</button>
                        </div>
                      </div>
                    )}

                    {authTab === 'register' && (
                      <div className="w-full rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_36px_rgba(37,99,235,0.08)] sm:rounded-3xl sm:p-6 lg:p-8">
                        <div className="mb-6">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-extrabold text-blue-900">Langkah {regStep} dari 3</p>
                            <p className="text-xs font-bold text-blue-600">{['Peran pengguna', 'Detail sekolah', 'Data akun'][regStep - 1]}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2" aria-label="Progres pendaftaran">
                            {[1, 2, 3].map((step) => <div key={step} className={`h-2 rounded-full ${step <= regStep ? 'bg-blue-700' : 'bg-blue-100'}`} />)}
                          </div>
                        </div>

                        {regMessage && (
                          <div role="alert" className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${regMessage.type === 'error' ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-blue-200 bg-[#eef5ff] text-blue-900'}`}>{regMessage.text}</div>
                        )}

                        <form onSubmit={handleRegisterSubmit} className="w-full space-y-5">
                          {regStep === 1 && (
                            <div className="space-y-5">
                              <fieldset>
                                <legend className="mb-3 text-sm font-extrabold text-blue-900">Pilih peran pengguna</legend>
                                <div className="grid gap-3 sm:grid-cols-3">
                                  {[
                                    { id: 'siswa', label: 'Siswa SD', description: 'Untuk anak kelas 1–6' },
                                    { id: 'guru', label: 'Guru SLB/SD', description: 'Untuk pengajar' },
                                    { id: 'ortu', label: 'Orang tua / wali', description: 'Untuk pendamping anak' },
                                  ].map((role) => (
                                    <button key={role.id} type="button" onClick={() => { setRegRole(role.id); setRegMessage(null); }} aria-pressed={regRole === role.id} className={`min-h-24 rounded-xl border-2 p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${regRole === role.id ? 'border-blue-700 bg-blue-50 shadow-sm' : 'border-blue-100 bg-white hover:border-blue-300 hover:bg-blue-50/60'}`}>
                                      <span className="block text-sm font-extrabold text-blue-900">{role.label}</span>
                                      <span className="mt-1 block text-xs leading-5 text-blue-700/80">{role.description}</span>
                                    </button>
                                  ))}
                                </div>
                              </fieldset>

                              {regRole === 'siswa' && (
                                <div>
                                  <label htmlFor="landing-reg-disability" className="mb-2 block text-sm font-extrabold text-blue-900">Preferensi cara belajar</label>
                                  <select id="landing-reg-disability" value={regDisability} onChange={(event) => setRegDisability(event.target.value)} className={fieldClass}>
                                    <option value="tunanetra">Tunanetra — suara dan pembaca layar</option>
                                    <option value="tunarungu">Tunarungu — teks dan subtitle</option>
                                    <option value="tunawicara">Tunawicara — pilihan komunikasi</option>
                                    <option value="tidak_ada">Umum / Standar SD</option>
                                  </select>
                                  <p className="mt-2 text-xs leading-5 text-blue-600">Pilihan ini dapat diubah lagi nanti. Fitur aksesibilitas dasar tetap tersedia untuk semua siswa.</p>
                                </div>
                              )}
                              <div className="flex justify-end">
                                <button type="button" onClick={handleRegisterNext} className={`${primaryButton} min-w-44`}>Lanjut ke detail</button>
                              </div>
                            </div>
                          )}

                          {regStep === 2 && (
                            <div className="space-y-5">
                              {regRole === 'siswa' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <label htmlFor="landing-reg-class" className="mb-2 block text-sm font-extrabold text-blue-900">Kelas SD</label>
                                    <select id="landing-reg-class" required value={regClassLevel} onChange={(event) => setRegClassLevel(event.target.value)} className={fieldClass}>
                                      {['1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'].map((level) => <option key={level} value={level}>{level}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label htmlFor="landing-reg-class-code" className="mb-2 block text-sm font-extrabold text-blue-900">Kode kelas dari guru</label>
                                    <input id="landing-reg-class-code" required value={regClassCode} onChange={(event) => setRegClassCode(event.target.value.toUpperCase())} placeholder="Contoh: X8J2K1" className={fieldClass} />
                                  </div>
                                </div>
                              )}

                              {regRole === 'guru' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <label htmlFor="landing-reg-school" className="mb-2 block text-sm font-extrabold text-blue-900">Nama sekolah / SLB</label>
                                    <input id="landing-reg-school" required value={regSlbName} onChange={(event) => setRegSlbName(event.target.value)} placeholder="Nama sekolah atau SLB" className={fieldClass} />
                                  </div>
                                  <div>
                                    <label htmlFor="landing-reg-teacher-class" className="mb-2 block text-sm font-extrabold text-blue-900">Kelas yang diampu</label>
                                    <select id="landing-reg-teacher-class" required value={regClassLevel} onChange={(event) => setRegClassLevel(event.target.value)} className={fieldClass}>
                                      {['1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'].map((level) => <option key={level} value={level}>{level}</option>)}
                                    </select>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label htmlFor="landing-reg-subject" className="mb-2 block text-sm font-extrabold text-blue-900">Mata pelajaran utama</label>
                                    <select id="landing-reg-subject" value={regSubject} onChange={(event) => setRegSubject(event.target.value)} className={fieldClass}>
                                      {['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Bahasa Inggris', 'Lainnya'].map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                                    </select>
                                  </div>
                                </div>
                              )}

                              {regRole === 'ortu' && (
                                <div>
                                  <label htmlFor="landing-reg-child-id" className="mb-2 block text-sm font-extrabold text-blue-900">ID Belajar Siswa anak</label>
                                  <input id="landing-reg-child-id" required value={regStudentIdInput} onChange={(event) => setRegStudentIdInput(event.target.value)} placeholder="Masukkan ID yang diberikan kepada siswa" className={fieldClass} />
                                  {checkingChild && <p role="status" className="mt-2 text-xs font-semibold text-blue-700">Sedang memeriksa ID siswa…</p>}
                                  {verifiedChild && <p role="status" className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">Profil ditemukan: {verifiedChild.full_name} · {verifiedChild.class_level || 'Kelas SD'}</p>}
                                  {childCheckError && <p role="alert" className="mt-2 text-xs font-semibold text-blue-700">{childCheckError}</p>}
                                </div>
                              )}

                              <div className="flex justify-between gap-3">
                                <button type="button" onClick={() => { setRegStep(1); setRegMessage(null); }} className={secondaryButton}>Kembali</button>
                                <button type="button" onClick={handleRegisterNext} className={primaryButton}>Lanjut ke data akun</button>
                              </div>
                            </div>
                          )}

                          {regStep === 3 && (
                            <div className="space-y-5">
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <label htmlFor="landing-reg-name" className="mb-2 block text-sm font-extrabold text-blue-900">Nama lengkap</label>
                                  <input id="landing-reg-name" autoComplete="name" required value={regFullName} onChange={(event) => setRegFullName(event.target.value)} placeholder="Masukkan nama lengkap" className={fieldClass} />
                                </div>
                                <div>
                                  <label htmlFor="landing-reg-email" className="mb-2 block text-sm font-extrabold text-blue-900">Email</label>
                                  <input id="landing-reg-email" type="email" autoComplete="email" required value={regEmail} onChange={(event) => setRegEmail(event.target.value)} placeholder="nama@email.com" className={fieldClass} />
                                </div>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                  <label htmlFor="landing-reg-password" className="mb-2 block text-sm font-extrabold text-blue-900">Kata sandi</label>
                                  <div className="relative">
                                    <input id="landing-reg-password" type={showRegPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} value={regPassword} onChange={(event) => setRegPassword(event.target.value)} placeholder="Minimal 8 karakter" className={`${fieldClass} pr-24`} />
                                    <button type="button" onClick={() => setShowRegPassword((value) => !value)} className="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-2 text-xs font-extrabold text-blue-700 hover:bg-blue-50">{showRegPassword ? 'Sembunyikan' : 'Tampilkan'}</button>
                                  </div>
                                </div>
                                <div>
                                  <label htmlFor="landing-reg-confirm" className="mb-2 block text-sm font-extrabold text-blue-900">Ulangi kata sandi</label>
                                  <input id="landing-reg-confirm" type={showRegPassword ? 'text' : 'password'} autoComplete="new-password" required value={regConfirmPassword} onChange={(event) => setRegConfirmPassword(event.target.value)} placeholder="Ulangi kata sandi" className={fieldClass} />
                                </div>
                              </div>
                              <div className="flex justify-between gap-3">
                                <button type="button" onClick={() => { setRegStep(2); setRegMessage(null); }} className={secondaryButton}>Kembali</button>
                                <button type="submit" disabled={regLoading} className={`${primaryButton} flex-1`}>{regLoading ? 'Membuat akun…' : 'Daftar akun Bintang AI'}</button>
                              </div>
                            </div>
                          )}
                        </form>
                      </div>
                    )}
                  </div>
                  <p className="mt-5 text-center text-[11px] font-semibold text-blue-500">Bintang AI · Belajar bersama, tumbuh bersama.</p>
                </div>
              </section>
            )}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Panduan sebelum tur otomatis dimulai. */}
      <AnimatePresence>
        {showTourGuide && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="presentation"
            onClick={(event) => { if (event.target === event.currentTarget) setShowTourGuide(false); }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="bintang-tour-title"
              className="w-full max-w-lg rounded-3xl border border-white/70 bg-white p-6 shadow-2xl sm:p-8"
              initial={{ opacity: 0, y: 28, scale: 0.94, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.42, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700">Sebelum mulai</p>
              <h2 id="bintang-tour-title" className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Jelajahi Bintang AI</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Slide akan bergerak otomatis satu per satu sampai bagian terakhir. Kamu tidak perlu menekan tombol Lanjut berulang kali.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-sm font-extrabold text-slate-900">Di komputer</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Tekan tombol <kbd className="rounded-md border border-slate-300 bg-white px-2 py-1 font-bold text-slate-800">Spasi</kbd> untuk jeda atau lanjutkan.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-extrabold text-slate-900">Di Android</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Gunakan tombol Jeda yang muncul di bagian bawah layar.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowTourGuide(false)} className={secondaryButton}>Nanti saja</button>
                <button type="button" onClick={startExploreTour} className={primaryButton}>Mulai jelajah</button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kontrol jeda selalu mudah disentuh selama tur berjalan, termasuk di Android. */}
      <AnimatePresence>
        {tourActive && (
          <motion.div
            className="absolute bottom-4 left-4 z-40 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 p-2 shadow-lg backdrop-blur-md sm:bottom-6 sm:left-6"
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
          >
            <button
              type="button"
              onClick={() => setTourPaused((paused) => !paused)}
              aria-pressed={tourPaused}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <span aria-hidden="true">{tourPaused ? '▶' : 'Ⅱ'}</span>
              {tourPaused ? 'Lanjutkan' : 'Jeda'}
            </button>
            <span className="hidden pr-2 text-xs font-semibold text-slate-500 sm:inline">{tourPaused ? 'Tur dijeda' : 'Spasi untuk jeda'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="sr-only" role="status" aria-live="polite">{tourActive ? (tourPaused ? 'Jelajah Bintang AI dijeda.' : `Jelajah Bintang AI, slide ${activeSlide + 1} dari 8.`) : ''}</p>

      {/* Penanda bab kecil di sisi kanan: tidak mengambil ruang header/footer. */}
      <nav aria-label="Navigasi bab presentasi" className={`absolute right-3 top-1/2 z-30 -translate-y-1/2 flex-col items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-2 py-3 shadow-sm backdrop-blur-md sm:right-6 sm:gap-2.5 sm:px-2.5 ${activeSlide === 7 ? 'hidden' : 'flex'}`}>
        {SLIDE_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`Buka slide ${index + 1}: ${label}`}
            aria-current={activeSlide === index ? 'step' : undefined}
            title={label}
            className={`rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${activeSlide === index ? 'h-7 w-2 bg-blue-700' : 'h-2 w-2 bg-slate-400/70 hover:bg-blue-500'}`}
          />
        ))}
      </nav>
    </div>
  );
};

export default LandingPage;


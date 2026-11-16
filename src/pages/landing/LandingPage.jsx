import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAccessibilityStore } from '@/features/accessibility/store/accessibilityStore';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { login } from '@/features/auth/api/sessionApi';
import { supabase } from '@/lib/supabaseClient';
import { logUserActivity } from '@/utils/logger';
import BintangAvatar from '@/features/ai-tutor/components/BintangAvatar';
import MobileLandingPage from './MobileLandingPage';

/*
 * Bintang AI — Landing Page untuk siswa kelas 1–6 SD.
 * Versi lengkap dengan desain login/register yang lebih bersih dan elegan.
 * Alur autentikasi, akun simulasi, integrasi store, aksesibilitas, dan tur
 * pengenalan tetap dipertahankan.
 */

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
  },
];

const LEARNING_MODES = [
  {
    id: 'tunanetra',
    title: 'Tunanetra',
    note: 'Hambatan penglihatan',
    description: 'Dengarkan materi, gunakan pembaca layar, dan dengarkan deskripsi gambar.',
    icon: '🎧',
    tone: 'blue',
  },
  {
    id: 'tunarungu',
    title: 'Tunarungu',
    note: 'Hambatan pendengaran',
    description: 'Baca teks yang jelas, lihat subtitle, dan ikuti petunjuk bergambar.',
    icon: '💬',
    tone: 'sky',
  },
  {
    id: 'tunawicara',
    title: 'Tunawicara',
    note: 'Hambatan bicara',
    description: 'Gunakan tulisan, gambar, dan simbol untuk menyampaikan jawaban.',
    icon: '🧩',
    tone: 'blueSoft',
  },
  {
    id: 'umum',
    title: 'Umum',
    note: 'Tampilan standar',
    description: 'Gunakan tampilan Bintang AI seperti biasa, tanpa pengaturan khusus.',
    icon: '🌟',
    tone: 'sky',
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
    initial: (direction) => ({ opacity: 0, x: direction > 0 ? 26 : -26, y: 10, scale: 0.99 }),
    animate: { opacity: 1, x: 0, y: 0, scale: 1 },
    exit: (direction) => ({ opacity: 0, x: direction > 0 ? -20 : 20, y: -6, scale: 0.99 }),
    transition: { duration: 0.42, ease: [0.2, 0.8, 0.2, 1] },
    style: {},
  },
];

// Transisi 2D yang lebih ringan khusus perangkat sentuh/Android.
const MOBILE_SLIDE_MOTIONS = [
  { initial: { opacity: 0, y: 18, scale: 0.985 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -12, scale: 0.99 }, transition: { duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }, style: {} },
  { initial: (direction) => ({ opacity: 0, x: direction > 0 ? 22 : -22 }), animate: { opacity: 1, x: 0 }, exit: (direction) => ({ opacity: 0, x: direction > 0 ? -18 : 18 }), transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }, style: {} },
  { initial: { opacity: 0, scale: 0.97 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.02 }, transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] }, style: {} },
  { initial: { opacity: 0, x: 18 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -14 }, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }, style: {} },
  { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }, style: {} },
  { initial: { opacity: 0, scale: 0.98, y: 12 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.99, y: -10 }, transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] }, style: {} },
  { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -14 }, transition: { duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }, style: {} },
  { initial: (direction) => ({ opacity: 0, x: direction > 0 ? 18 : -18 }), animate: { opacity: 1, x: 0 }, exit: (direction) => ({ opacity: 0, x: direction > 0 ? -18 : 18 }), transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }, style: {} },
];

const TOUR_DURATIONS = [0, 7200, 7600, 7600, 7600, 10500, 7000, 0];

const inputClass =
  'min-h-[52px] w-full rounded-2xl border-2 border-sky-100 bg-white px-4 py-3 text-base font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100';
const primaryButton =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-base font-extrabold text-white shadow-[0_5px_0_#075985] transition hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-[0_7px_0_#075985] active:translate-y-1 active:shadow-none focus:outline-none focus:ring-4 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';
const secondaryButton =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-sky-200 bg-white px-6 py-3 text-base font-extrabold text-sky-800 transition hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-50 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60';

const toneStyles = {
  blue: 'border-blue-100 bg-blue-50',
  sky: 'border-sky-100 bg-sky-50',
  blueSoft: 'border-blue-100 bg-[#F3F8FF]',
};

function SlideHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <p className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-blue-800">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

function BintangMascot({ size = 48, className = '', state = 'idle' }) {
  return <BintangAvatar size={size} state={state} className={className} />;
}

function BrandMark({ light = false }) {
  return (
    <div className="flex items-center gap-3.5">
      <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-blue-100 bg-white p-1 shadow-[0_6px_0_#bfdbfe] transition-transform hover:scale-105" aria-hidden="true">
        <BintangAvatar size={54} state="idle" />
      </span>
      <div>
        <span className={`block text-xl font-black leading-tight tracking-tight sm:text-2xl ${light ? 'text-white' : 'text-blue-950'}`}>Bintang AI</span>
        <span className={`block text-xs font-bold tracking-wide sm:text-sm ${light ? 'text-blue-100' : 'text-blue-600'}`}>Teman Belajar Kita</span>
      </div>
    </div>
  );
}

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, setManualMode, setModeFromProfile } = useAccessibilityStore();
  const { setUser, fetchProfile } = useAuthStore();
  const prefersReducedMotion = useReducedMotion();
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const updatePointerMode = () => setIsCoarsePointer(mediaQuery.matches);
    updatePointerMode();
    mediaQuery.addEventListener?.('change', updatePointerMode);
    return () => mediaQuery.removeEventListener?.('change', updatePointerMode);
  }, []);

  const validLearningModes = ['tunanetra', 'tunarungu', 'tunawicara'];
  const normalizedMode = validLearningModes.includes(mode)
    ? mode
    : (['standar', 'tidak_ada', 'umum'].includes(mode) ? 'umum' : '');
  const initialRegistrationMode = validLearningModes.includes(mode)
    ? mode
    : (['standar', 'tidak_ada', 'umum'].includes(mode) ? 'tidak_ada' : '');

  const [activeSlide, setActiveSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const slideContentRef = useRef(null);
  const touchStartRef = useRef(null);
  const wheelLockRef = useRef(false);
  const [selectedUserRole, setSelectedUserRole] = useState(normalizedMode);
  const [roleFeedback, setRoleFeedback] = useState('');

  const [showTourGuide, setShowTourGuide] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourPaused, setTourPaused] = useState(false);

  const [authTab, setAuthTab] = useState('login');
  const [regStep, setRegStep] = useState(1);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loadingDemoKey, setLoadingDemoKey] = useState(null);
  const [loginMessage, setLoginMessage] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('Membuka Ruang Belajar Bintang AI...');

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState('siswa');
  const [regDisability, setRegDisability] = useState(initialRegistrationMode);
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

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobileView) {
    return <MobileLandingPage />;
  }

  const speakText = useCallback((text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
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
    if (options.manual !== false) {
      setTourActive(false);
      setTourPaused(false);
    }
  }, [activeSlide, stopAudio]);

  const openAuth = (tab) => {
    setAuthTab(tab);
    setLoginMessage(null);
    setRegMessage(null);
    if (tab === 'register') setRegStep(1);
    goToSlide(7);
  };

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

  // Tur otomatis menggulir konten lalu berpindah ke slide berikutnya.
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
      if (!cancelled) goToSlide(activeSlide + 1, { manual: false });
    };

    entryTimer = window.setTimeout(() => {
      if (cancelled) return;
      const maxScrollTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      const startScrollTop = Math.min(scroller.scrollTop, maxScrollTop);
      const distance = Math.max(0, maxScrollTop - startScrollTop);
      const baseDuration = TOUR_DURATIONS[activeSlide] || 7200;

      if (distance < 8) {
        advanceTimer = window.setTimeout(advance, baseDuration);
        return;
      }

      const isTouchDevice = window.matchMedia?.('(pointer: coarse)').matches;
      const pixelsPerSecond = prefersReducedMotion ? 10000 : (isTouchDevice ? 46 : 76);
      const scrollDuration = Math.max(baseDuration, (distance / pixelsPerSecond) * 1000);
      const startedAt = performance.now();

      const animateScroll = (now) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - startedAt) / scrollDuration);
        scroller.scrollTop = startScrollTop + distance * progress;
        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(animateScroll);
        } else {
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement && (
        target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      );
      if (isTyping) return;

      if (event.code === 'Space' && tourActive) {
        event.preventDefault();
        setTourPaused((paused) => !paused);
        return;
      }
      if (event.key === 'PageDown' || (event.altKey && event.key === 'ArrowRight')) {
        event.preventDefault();
        goToSlide(activeSlide + 1);
      } else if (event.key === 'PageUp' || (event.altKey && event.key === 'ArrowLeft')) {
        event.preventDefault();
        goToSlide(activeSlide - 1);
      } else if (event.key === 'Escape' && activeSlide === 7) {
        goToSlide(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlide, goToSlide, tourActive]);

  const handleWheel = useCallback((event) => {
    if (Math.abs(event.deltaY) < 45) return;
    const scroller = slideContentRef.current;
    if (!scroller || wheelLockRef.current) return;
    const atTop = scroller.scrollTop <= 4;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 5;
    const movingDown = event.deltaY > 0;
    if ((movingDown && !atBottom) || (!movingDown && !atTop)) return;
    event.preventDefault();
    wheelLockRef.current = true;
    goToSlide(activeSlide + (movingDown ? 1 : -1));
    window.setTimeout(() => { wheelLockRef.current = false; }, 700);
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
    if (Math.abs(deltaX) > 80 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
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
        setChildCheckError('ID Belajar Siswa belum ditemukan. Periksa kembali ID dari anak.');
      } else {
        setVerifiedChild(child);
        setChildCheckError(null);
      }
    } catch (error) {
      setVerifiedChild(null);
      setChildCheckError('Belum dapat memeriksa ID siswa. Silakan coba lagi.');
    } finally {
      setCheckingChild(false);
    }
  }, []);

  useEffect(() => {
    if (regRole !== 'ortu' || !regStudentIdInput.trim()) {
      setVerifiedChild(null);
      setChildCheckError(null);
      return undefined;
    }
    const timer = window.setTimeout(() => checkChildProfile(regStudentIdInput.trim()), 500);
    return () => window.clearTimeout(timer);
  }, [regRole, regStudentIdInput, checkChildProfile]);

  const handleSelectRoleInitial = (roleId) => {
    const isGeneralMode = roleId === 'umum';
    setSelectedUserRole(roleId);
    // Nilai profil tetap kompatibel dengan data lama: mode umum disimpan sebagai tidak_ada.
    setRegDisability(isGeneralMode ? 'tidak_ada' : roleId);
    // Store aplikasi menggunakan 'standar' sebagai mode tanpa penyesuaian khusus.
    setManualMode(isGeneralMode ? 'standar' : roleId);
    const labels = {
      tunanetra: 'Mode Tunanetra',
      tunarungu: 'Mode Tunarungu',
      tunawicara: 'Mode Tunawicara',
      umum: 'Tampilan Umum',
    };
    const feedback = isGeneralMode
      ? 'Tampilan Umum dipilih. Bintang AI menggunakan tampilan standar tanpa pengaturan khusus.'
      : `${labels[roleId] || 'Pilihan belajar'} dipilih. Kamu bisa mengubahnya lagi nanti.`;
    setRoleFeedback(feedback);
  };

  const getTargetPath = (role) => {
    if (role === 'guru') return '/teacher/dashboard';
    if (role === 'ortu') return '/parent/dashboard';
    return '/student/dashboard';
  };

  const handleDemoLogin = async (demoAccount) => {
    if (!demoAccount) return;
    setLoadingDemoKey(demoAccount.key);
    setLoginLoading(true);
    setLoginMessage(null);
    useAuthStore.getState().setAuthRedirecting(true, `Membuka simulasi ${demoAccount.label}...`);
    stopAudio();
    try {
      const data = await login(demoAccount.email, demoAccount.pass);
      setUser(data.user);
      const profileData = await fetchProfile(data.user.id);
      if (!profileData) throw new Error('Profil akun simulasi belum tersedia di database.');
      await logUserActivity(
        'LOGIN',
        'Masuk Simulasi Peran',
        `Mencoba simulasi ${demoAccount.label} (${profileData.full_name})`,
        profileData,
      );
      setModeFromProfile(profileData);
      speakText(`Selamat mencoba simulasi ${demoAccount.label}.`);
      navigate(getTargetPath(profileData.role), { replace: true });
    } catch (error) {
      const message = error?.message || 'Belum berhasil masuk ke akun simulasi.';
      setLoginMessage({ type: 'error', text: message });
      speakText(message);
      useAuthStore.getState().setAuthRedirecting(false);
    } finally {
      setLoginLoading(false);
      setLoadingDemoKey(null);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    if (!loginEmail.trim()) {
      setLoginMessage({ type: 'error', text: 'Masukkan alamat email terlebih dahulu.' });
      return;
    }
    if (!loginPassword) {
      setLoginMessage({ type: 'error', text: 'Masukkan kata sandi terlebih dahulu.' });
      return;
    }
    setLoginLoading(true);
    setLoginMessage(null);
    useAuthStore.getState().setAuthRedirecting(true, 'Sedang memproses masuk ke Bintang AI...');
    stopAudio();
    try {
      const data = await login(loginEmail.trim(), loginPassword);
      setUser(data.user);
      const profileData = await fetchProfile(data.user.id);
      if (!profileData) throw new Error('Profil akun belum ditemukan. Hubungi guru atau pengelola aplikasi.');
      await logUserActivity('LOGIN', 'Masuk Aplikasi', `Pengguna ${profileData.full_name} masuk`, profileData);
      setModeFromProfile(profileData);
      speakText(`Selamat datang kembali, ${profileData.full_name}.`);
      navigate(getTargetPath(profileData.role), { replace: true });
    } catch (error) {
      const message = error?.message || 'Belum berhasil masuk. Periksa email dan kata sandi.';
      setLoginMessage({ type: 'error', text: message });
      speakText(message);
      useAuthStore.getState().setAuthRedirecting(false);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterNext = () => {
    setRegMessage(null);
    if (regStep === 1) {
      if (!regRole) {
        setRegMessage({ type: 'error', text: 'Pilih peran pengguna terlebih dahulu.' });
        return;
      }
      if (regRole === 'siswa' && !regDisability) {
        setRegMessage({ type: 'error', text: 'Pilih cara belajar yang paling nyaman.' });
        return;
      }
      setRegStep(2);
      return;
    }

    if (regStep === 2) {
      if (regRole === 'siswa') {
        if (!regClassLevel) {
          setRegMessage({ type: 'error', text: 'Pilih kelas SD terlebih dahulu.' });
          return;
        }
        if (!regClassCode.trim()) {
          setRegMessage({ type: 'error', text: 'Masukkan kode kelas dari guru.' });
          return;
        }
      }
      if (regRole === 'guru') {
        if (!regSlbName.trim()) {
          setRegMessage({ type: 'error', text: 'Masukkan nama sekolah atau SLB.' });
          return;
        }
        if (!regClassLevel) {
          setRegMessage({ type: 'error', text: 'Pilih kelas yang diampu.' });
          return;
        }
      }
      if (regRole === 'ortu') {
        if (!regStudentIdInput.trim()) {
          setRegMessage({ type: 'error', text: 'Masukkan ID Belajar Siswa anak.' });
          return;
        }
        if (checkingChild) {
          setRegMessage({ type: 'error', text: 'ID siswa sedang diperiksa. Tunggu sebentar, ya.' });
          return;
        }
        if (!verifiedChild || childCheckError) {
          setRegMessage({ type: 'error', text: childCheckError || 'ID siswa belum berhasil diperiksa.' });
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
      if (!regFullName.trim()) throw new Error('Nama lengkap perlu diisi.');
      if (!regEmail.trim()) throw new Error('Alamat email perlu diisi.');
      if (regPassword.length < 8) throw new Error('Kata sandi minimal 8 karakter.');
      if (regPassword !== regConfirmPassword) throw new Error('Kata sandi dan pengulangannya belum sama.');

      let linkedId = null;
      let finalClassCode = regClassCode.trim().toUpperCase();
      const finalSlbName = regSlbName.trim();
      let finalClassLevel = regClassLevel;

      if (regRole === 'siswa') {
        if (!regClassLevel) throw new Error('Kelas SD (1–6) perlu dipilih.');
        if (!finalClassCode) throw new Error('Kode kelas dari guru perlu diisi.');
      }
      if (regRole === 'ortu') {
        if (!regStudentIdInput.trim()) throw new Error('ID Belajar Siswa anak perlu diisi.');
        if (checkingChild || !verifiedChild || childCheckError) {
          throw new Error('ID siswa belum berhasil diverifikasi. Periksa kembali ID anak.');
        }
        linkedId = verifiedChild.id;
        if (verifiedChild.class_level) finalClassLevel = verifiedChild.class_level;
      }
      if (regRole === 'guru') {
        finalClassCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        if (!finalSlbName) throw new Error('Nama sekolah / SLB perlu diisi.');
        if (!finalClassLevel) throw new Error('Kelas yang diampu perlu dipilih.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: regEmail.toLowerCase().trim(),
        password: regPassword,
        options: {
          data: {
            full_name: regFullName.trim(),
            role: regRole,
            disability_type: regRole === 'siswa' ? regDisability : null,
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
          ? `Pendaftaran berhasil. Kode kelas kamu: ${finalClassCode}. Silakan masuk setelah konfirmasi akun selesai.`
          : 'Pendaftaran berhasil. Silakan masuk setelah konfirmasi akun selesai.';
        setRegMessage({ type: 'success', text: successText });
        speakText(successText);
        window.setTimeout(() => {
          setAuthTab('login');
          setLoginEmail(regEmail);
          setLoginPassword('');
        }, 2500);
      }
    } catch (error) {
      const message = error?.message || 'Pendaftaran belum berhasil. Periksa kembali data yang diisi.';
      setRegMessage({ type: 'error', text: message });
      speakText(message);
    } finally {
      setRegLoading(false);
    }
  };

  const renderModeCard = (item, compact = false) => {
    const selected = selectedUserRole === item.id;
    const baseClass = `bintang-touch-card group relative flex rounded-[26px] border-2 text-left transition duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-200 ${toneStyles[item.tone]} ${selected ? 'border-sky-600 shadow-lg ring-4 ring-sky-100' : 'border-transparent'}`;

    if (compact) {
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => handleSelectRoleInitial(item.id)}
          aria-pressed={selected}
          className={`${baseClass} min-h-[112px] w-full items-center gap-4 p-4 sm:p-5`}
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">{item.icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">{item.note}</span>
            <span className="mt-1 block text-xl font-black leading-tight text-slate-900">{item.title}</span>
            <span className="mt-1 block text-sm leading-5 text-slate-600">{item.description}</span>
          </span>
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-black ${selected ? 'bg-sky-600 text-white' : 'bg-white text-sky-700'}`} aria-hidden="true">{selected ? '✓' : '→'}</span>
        </button>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelectRoleInitial(item.id)}
        aria-pressed={selected}
        className={`${baseClass} min-h-[220px] flex-col items-start p-5 sm:p-6`}
      >
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-4xl shadow-sm" aria-hidden="true">{item.icon}</span>
        <span className="mt-5 text-xs font-extrabold uppercase tracking-[0.1em] text-slate-500">{item.note}</span>
        <span className="mt-1 text-2xl font-black leading-tight text-slate-900">{item.title}</span>
        <span className="mt-2 text-sm leading-6 text-slate-600">{item.description}</span>
        <span className="mt-auto flex w-full items-center justify-between pt-5 text-sm font-extrabold text-sky-800">
          {selected ? 'Mode dipilih ✓' : 'Pilih mode ini'}
          <span className="text-lg" aria-hidden="true">{selected ? '✓' : '→'}</span>
        </span>
      </button>
    );
  };

  const renderDemoCard = (account) => {
    const isThisLoading = loadingDemoKey === account.key;
    return (
      <article key={account.key} className={`flex h-full flex-col rounded-[26px] border border-white/80 bg-gradient-to-br ${account.color} p-5 shadow-[0_8px_24px_rgba(15,23,42,0.07)]`}>
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">{account.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-600">{account.label}</p>
            <h3 className="mt-1 text-lg font-black leading-snug text-slate-900">{account.description}</h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">{account.support}</p>
        <button type="button" disabled={loginLoading} onClick={() => handleDemoLogin(account)} className={`${primaryButton} mt-5 w-full text-sm`}>
          {isThisLoading ? 'Sedang membuka…' : 'Coba akun ini'} <span aria-hidden="true">→</span>
        </button>
      </article>
    );
  };

  const demoStudents = DEMO_ACCOUNTS.filter((account) => account.group === 'siswa');
  const demoTeacher = DEMO_ACCOUNTS.find((account) => account.group === 'guru');
  const demoParent = DEMO_ACCOUNTS.find((account) => account.group === 'ortu');

  const requestExplore = () => setShowTourGuide(true);

  const openDemoSlide = () => {
    setLoginMessage(null);
    goToSlide(5);
  };

  const startExploreTour = () => {
    setShowTourGuide(false);
    setTourActive(true);
    setTourPaused(false);
    goToSlide(1, { manual: false });
  };

  const currentMotion = (isCoarsePointer ? MOBILE_SLIDE_MOTIONS : SLIDE_MOTIONS)[activeSlide];
  const initialMotion = prefersReducedMotion
    ? { opacity: 0 }
    : (typeof currentMotion.initial === 'function' ? currentMotion.initial(slideDirection) : currentMotion.initial);
  const exitMotion = prefersReducedMotion
    ? { opacity: 0 }
    : (typeof currentMotion.exit === 'function' ? currentMotion.exit(slideDirection) : currentMotion.exit);

  useEffect(() => {
    // Sinkronkan tinggi kanvas Android secara ter-throttle.
    if (typeof window === 'undefined') return undefined;
    let frameId = 0;
    let lastHeight = 0;
    const updateViewportHeight = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        const height = Math.round(window.visualViewport?.height || window.innerHeight);
        if (Math.abs(height - lastHeight) < 2) return;
        lastHeight = height;
        document.documentElement.style.setProperty('--bintang-vh', `${height * 0.01}px`);
      });
    };
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight, { passive: true });
    window.visualViewport?.addEventListener('resize', updateViewportHeight, { passive: true });
    window.visualViewport?.addEventListener('scroll', updateViewportHeight, { passive: true });
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateViewportHeight);
      window.visualViewport?.removeEventListener('resize', updateViewportHeight);
      window.visualViewport?.removeEventListener('scroll', updateViewportHeight);
    };
  }, []);

  return (
    <div className="bintang-landing relative overflow-hidden bg-[#F4F8FF] font-sans text-slate-900 selection:bg-blue-200">
      <style>{`
        .bintang-landing {
          width: 100%;
          height: calc(var(--bintang-vh, 1vh) * 100);
          min-height: 100vh;
          min-height: calc(var(--bintang-vh, 1vh) * 100);
          isolation: isolate;
        }
        .bintang-slide {
          width: 100%;
          height: calc(var(--bintang-vh, 1vh) * 100);
          min-height: calc(var(--bintang-vh, 1vh) * 100);
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
          scrollbar-width: thin;
          scrollbar-color: #93c5fd transparent;
          padding-bottom: max(.75rem, env(safe-area-inset-bottom));
        }
        .bintang-screen-section {
          min-height: calc(var(--bintang-vh, 1vh) * 100);
          padding-top: max(1rem, env(safe-area-inset-top));
          padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
        }
        .bintang-mascot {
          position: relative;
          overflow: visible;
          animation: bintang-float 3.8s ease-in-out infinite;
          filter: drop-shadow(0 5px 4px rgba(29, 78, 216, .16));
        }
        .bintang-mascot svg { display: block; overflow: visible; }
        .bintang-eye {
          transform-box: fill-box;
          transform-origin: center;
          animation: bintang-blink 5.2s ease-in-out infinite;
        }
        .bintang-eye-right { animation-delay: .035s; }
        .bintang-mascot-hero { filter: drop-shadow(0 12px 10px rgba(37, 99, 235, .22)); }
        .bintang-pause-control { bottom: max(1.25rem, env(safe-area-inset-bottom)); left: max(1rem, env(safe-area-inset-left)); }
        .bintang-chapter-nav { right: max(.5rem, env(safe-area-inset-right)); }
        @keyframes bintang-blink {
          0%, 43%, 47%, 100% { transform: scaleY(1); }
          45%, 46% { transform: scaleY(.08); }
          82%, 84% { transform: scaleY(1); }
          83% { transform: scaleY(.08); }
        }
        @keyframes bintang-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        @media (max-width: 640px) {
          .bintang-slide { scrollbar-width: none; }
          .bintang-slide::-webkit-scrollbar { display: none; }
          .bintang-screen-section {
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
          }
          .bintang-chapter-nav { right: max(.25rem, env(safe-area-inset-right)); padding: .55rem .4rem; gap: .45rem; }
          .bintang-chapter-nav button { min-width: 18px; min-height: 18px; }
          .bintang-pause-control { bottom: max(.75rem, env(safe-area-inset-bottom)); left: max(.75rem, env(safe-area-inset-left)); }
          input, select, textarea { font-size: 16px !important; }
        }
        @media (pointer: coarse) {
          .bintang-mascot { filter: none; }
          .bintang-slide { scroll-behavior: auto; }
          .bintang-background-glow { filter: none !important; opacity: .2; }
          .bintang-touch-card { transition-duration: 120ms; }
          .bintang-touch-card:hover { transform: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bintang-mascot, .bintang-eye { animation: none !important; }
        }
      `}</style>

      {/* Latar dekoratif */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bintang-background-glow absolute -left-28 -top-28 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="bintang-background-glow absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="bintang-background-glow absolute -bottom-36 left-1/3 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
      </div>

      <div
        className="relative h-full min-h-0"
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
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
            }}
            className={`bintang-slide relative overflow-x-hidden overflow-y-auto overscroll-contain ${activeSlide === 7 ? 'pb-8' : 'pr-12 sm:pr-16'}`}
          >
            {/* SLIDE 1 — HALO DAN PILIH CARA BELAJAR */}
            {activeSlide === 0 && (
              <section className="mx-auto flex bintang-screen-section min-h-[100dvh] h-full max-h-screen w-full max-w-7xl flex-col justify-between overflow-hidden px-4 pb-4 pt-4 sm:px-7 lg:px-10">
                <header className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                  <BrandMark />
                  <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-end">
                    <button type="button" onClick={() => openAuth('login')} className={`${secondaryButton} min-h-10 px-3 py-1.5 text-xs sm:flex-none sm:px-4`}>Masuk</button>
                    <button type="button" onClick={() => openAuth('register')} className={`${primaryButton} min-h-10 px-3 py-1.5 text-xs sm:flex-none sm:px-4`}>Daftar</button>
                    <button type="button" onClick={openDemoSlide} aria-label="Lihat demo akun Bintang AI" className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-800 shadow-sm transition hover:border-blue-400 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:flex-none sm:px-4">
                      <span aria-hidden="true">▶</span> Demo
                    </button>
                  </div>
                </header>

                <div className="grid flex-1 items-center gap-4 overflow-hidden py-2 sm:gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
                  <div className="relative mx-auto w-full max-w-xl space-y-2 text-center lg:mx-0 lg:text-left">
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-xs font-extrabold text-blue-800">Untuk teman kelas 1–6 SD</div>
                    <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                      Halo, <span className="text-sky-600">Teman Bintang!</span>
                    </h1>
                    <p className="mx-auto max-w-lg text-sm font-medium leading-relaxed text-slate-600 sm:text-base lg:mx-0">
                      Yuk, belajar, bertanya, dan mencoba hal baru bersama Kak Bintang.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5 pt-1 lg:justify-start">
                      <button type="button" onClick={requestExplore} className={`${primaryButton} px-5 py-2.5 text-xs sm:min-w-44`}>Ayo Jelajahi <span aria-hidden="true">🚀</span></button>
                      <button type="button" onClick={() => speakText('Halo, Teman Bintang. Yuk belajar dan bertanya bersama Kak Bintang. Pilih cara belajar yang paling nyaman untukmu.')} className={`${secondaryButton} px-5 py-2.5 text-xs sm:min-w-44`}>
                        {isPlayingAudio ? 'Suara diputar…' : 'Dengarkan sapaan 🔊'}
                      </button>
                    </div>
                    {isPlayingAudio && <button type="button" onClick={stopAudio} className="text-xs font-bold text-sky-700 underline underline-offset-4">Hentikan suara</button>}
                    {roleFeedback && <p role="status" aria-live="polite" className="text-xs font-bold text-blue-700">{roleFeedback}</p>}

                    <div className="rounded-2xl border border-sky-100 bg-white/90 p-3 shadow-xs lg:max-w-md">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Ruang khusus pendamping</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2"><span className="text-xl" aria-hidden="true">👨‍🏫</span><span className="text-xs font-extrabold text-slate-800">Guru</span></div>
                        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2"><span className="text-xl" aria-hidden="true">👪</span><span className="text-xs font-extrabold text-slate-800">Orang tua / wali</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="relative mx-auto w-full max-w-2xl">
                    <div className="absolute -right-3 -top-8 z-10 sm:-right-4" aria-hidden="true"><BintangMascot size={96} label={null} /></div>
                    <div className="rounded-3xl border border-white bg-white/90 p-3.5 shadow-lg sm:p-5">
                      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div><p className="text-xs font-black uppercase tracking-[0.12em] text-sky-600">Mulai dari sini</p><h2 className="text-lg font-black text-slate-900 sm:text-xl">Pilih cara belajarmu</h2></div>
                        <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-[10px] font-extrabold text-blue-800">Bisa diubah nanti</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">{LEARNING_MODES.map((item) => renderModeCard(item, true))}</div>
                      <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-500">Catatan: Setiap anak dapat memakai pengaturan dasar seperti ukuran teks, suara, dan kontras.</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SLIDE 2 — MASALAH DAN SOLUSI */}
            {activeSlide === 1 && (
              <section className="mx-auto flex bintang-screen-section min-h-[100dvh] w-full max-w-7xl flex-col justify-center gap-9 px-4 py-12 sm:px-7 lg:px-10">
                <SlideHeading eyebrow="Masalah dan solusi" title="Mengapa Bintang AI dibuat?" description="Bintang AI dibuat khusus membantu siswa SD disabilitas (Tunanetra, Tunarungu, Tunawicara) kelas 1–6 agar dapat belajar mandiri dari rumah dengan mudah, aman, dan ceria." />
                <div className="grid gap-5 md:grid-cols-2">
                  <article className="rounded-[30px] border-2 border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <span className="inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-800">Tantangan Siswa Disabilitas</span>
                    <h3 className="mt-4 text-2xl font-black text-slate-900">Hambatan Belajar Siswa SD</h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">Siswa Tunanetra kesulitan membaca teks modul, Siswa Tunarungu tidak dapat mendengar suara penjelasan guru, dan Siswa Tunawicara kesulitan menyampaikan jawaban saat belajar di rumah.</p>
                    <div className="mt-5 flex flex-wrap gap-2">{['Hambatan penglihatan', 'Hambatan pendengaran', 'Hambatan bicara'].map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800">{tag}</span>)}</div>
                  </article>
                  <article className="rounded-[30px] border-2 border-blue-200 bg-blue-50/60 p-6 shadow-sm sm:p-8">
                    <span className="inline-block rounded-full bg-blue-200 px-3.5 py-1 text-xs font-bold text-blue-900">Solusi Aksesibilitas SD</span>
                    <h3 className="mt-4 text-2xl font-black text-slate-900">Bintang AI Siap Membantu Belajar</h3>
                    <p className="mt-3 text-base leading-7 text-slate-700">Suara lisan otomatis untuk Tunanetra, teks subtitle visual untuk Tunarungu, serta kamera gestur isyarat & balasan teks untuk Tunawicara kelas 1–6 SD, didampingi Guru dan Orang Tua.</p>
                    <div className="mt-5 flex flex-wrap gap-2">{['Suara Tunanetra', 'Subtitle Tunarungu', 'Gestur Tunawicara'].map((tag) => <span key={tag} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-900">{tag}</span>)}</div>
                  </article>
                </div>
                <p className="mx-auto max-w-3xl rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-center text-base font-bold leading-7 text-blue-900">Setiap anak SD disabilitas kelas 1–6 berhak mendapat ruang belajar yang mudah, aman, dan penuh kegembiraan.</p>
              </section>
            )}

            {/* SLIDE 3 — CARA BELAJAR */}
            {activeSlide === 2 && (
              <section className="mx-auto flex bintang-screen-section min-h-[100dvh] w-full max-w-7xl flex-col justify-center gap-8 px-4 py-12 sm:px-7 lg:px-10">
                <SlideHeading eyebrow="Pilih yang nyaman" title="Ada banyak cara untuk memahami pelajaran." description="Pilih satu cara untuk memulai. Pengaturan dapat disesuaikan lagi kapan saja." />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{LEARNING_MODES.map((item) => renderModeCard(item))}</div>
                <p className="mx-auto max-w-3xl rounded-2xl border border-sky-100 bg-white px-5 py-4 text-center text-sm font-semibold leading-6 text-slate-600 shadow-sm">Cara belajar dapat disesuaikan kembali bersama guru atau orang tua.</p>
              </section>
            )}

            {/* SLIDE 4 — FITUR */}
            {activeSlide === 3 && (
              <section className="mx-auto flex bintang-screen-section min-h-[100dvh] w-full max-w-7xl flex-col justify-center gap-9 px-4 py-12 sm:px-7 lg:px-10">
                <SlideHeading eyebrow="Yang bisa kamu lakukan" title="Empat kegiatan seru di Bintang AI." description="Belajar sedikit demi sedikit. Kalau belum paham, kamu boleh mencoba lagi." />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { icon: '📖', number: '01', title: 'Baca Materi', text: 'Pelajari materi kelas 1 sampai 6 dengan tampilan yang mudah dibaca.', color: 'bg-sky-50 border-sky-100' },
                    { icon: '🤖', number: '02', title: 'Tanya Kak Bintang', text: 'Tanyakan pelajaran dan dapatkan penjelasan dengan bahasa sederhana.', color: 'bg-blue-50 border-blue-100' },
                    { icon: '🎯', number: '03', title: 'Kerjakan Latihan', text: 'Jawab kuis dan lihat hasil latihanmu. Terus semangat mencoba!', color: 'bg-blue-50 border-blue-100' },
                    { icon: '🧑‍💻', number: '04', title: 'Mengajar Real-Time', text: 'Guru mengajar secara langsung dari jarak jauh. Materi, instruksi, dan balasan guru dikirim dalam format yang sesuai untuk tiap siswa: suara, teks atau subtitle, serta komunikasi visual.', color: 'bg-blue-50 border-blue-100' },
                  ].map((feature) => (
                    <article key={feature.number} className={`flex min-h-[270px] flex-col rounded-[28px] border-2 p-6 transition hover:-translate-y-1 hover:shadow-lg ${feature.color}`}>
                      <div className="flex items-center justify-between"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-4xl shadow-sm" aria-hidden="true">{feature.icon}</span><span className="text-sm font-black tracking-widest text-slate-400">{feature.number}</span></div>
                      <h3 className="mt-6 text-xl font-black text-slate-900">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* SLIDE 5 — PERAN */}
            {activeSlide === 4 && (
              <section className="mx-auto flex bintang-screen-section min-h-[100dvh] w-full max-w-7xl flex-col justify-center gap-9 px-4 py-12 sm:px-7 lg:px-10">
                <SlideHeading eyebrow="Kita belajar bersama" title="Ada tiga teman dalam perjalanan belajar." description="Siswa, guru, dan orang tua punya tugas masing-masing. Semuanya saling membantu." />
                <div className="grid gap-5 md:grid-cols-3">
                  <article className="rounded-[30px] border-2 border-blue-100 bg-blue-50 p-6 text-center sm:p-8"><span className="mx-auto grid h-24 w-24 place-items-center rounded-[30px] bg-white text-6xl shadow-sm" aria-hidden="true">👩‍🏫</span><p className="mt-5 text-xs font-black uppercase tracking-widest text-blue-800">Menyiapkan</p><h3 className="mt-2 text-2xl font-black text-slate-900">Guru</h3><p className="mt-3 text-sm leading-6 text-slate-600">Menyiapkan kelas, membagikan kode kelas, membuat materi, dan melihat tugas.</p></article>
                  <article className="rounded-[30px] border-2 border-sky-200 bg-sky-50 p-6 text-center shadow-lg sm:p-8"><span className="mx-auto grid h-24 w-24 place-items-center rounded-[30px] bg-white text-6xl shadow-sm" aria-hidden="true">🧒</span><p className="mt-5 text-xs font-black uppercase tracking-widest text-sky-800">Belajar</p><h3 className="mt-2 text-2xl font-black text-slate-900">Siswa</h3><p className="mt-3 text-sm leading-6 text-slate-600">Membaca materi, bertanya kepada Kak Bintang, dan mengerjakan latihan.</p></article>
                  <article className="rounded-[30px] border-2 border-blue-100 bg-blue-50 p-6 text-center sm:p-8"><span className="mx-auto grid h-24 w-24 place-items-center rounded-[30px] bg-white text-6xl shadow-sm" aria-hidden="true">👨‍👧</span><p className="mt-5 text-xs font-black uppercase tracking-widest text-blue-800">Mendampingi</p><h3 className="mt-2 text-2xl font-black text-slate-900">Orang Tua</h3><p className="mt-3 text-sm leading-6 text-slate-600">Menemani anak belajar dan melihat laporan perkembangan yang tersedia.</p></article>
                </div>
                <div className="mx-auto flex flex-wrap items-center justify-center gap-2 text-sm font-extrabold text-slate-600"><span className="rounded-full bg-blue-50 px-4 py-2">Guru menyiapkan</span><span aria-hidden="true">→</span><span className="rounded-full bg-sky-100 px-4 py-2">Siswa belajar</span><span aria-hidden="true">→</span><span className="rounded-full bg-blue-100 px-4 py-2">Keluarga mendampingi</span></div>
              </section>
            )}

            {/* SLIDE 6 — DEMO */}
            {activeSlide === 5 && (
              <section className="mx-auto flex h-[100dvh] max-h-[100dvh] bintang-screen-section w-full max-w-7xl flex-col justify-center overflow-hidden px-4 py-2 sm:px-7 lg:px-10">
                <div className="origin-center scale-[0.72] transform transition-transform sm:scale-[0.82] md:scale-[0.88] lg:scale-[0.94] xl:scale-100">
                  <div className="flex flex-col justify-center gap-3 sm:gap-4">
                    <SlideHeading title="Pilih pengalaman yang ingin kamu lihat." description="Tekan tombol untuk membuka akun simulasi. Kamu bisa melihat Bintang AI dari sisi siswa, guru, atau orang tua." />
                    {loginMessage && <div role="alert" className="mx-auto w-full max-w-3xl rounded-2xl border-2 border-blue-100 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-800">{loginMessage.text}</div>}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3"><span className="rounded-full bg-sky-100 px-4 py-1.5 text-sm font-black text-sky-800">A. Akun Siswa</span><span className="h-px flex-1 bg-sky-100" /></div>
                      <div className="grid gap-4 md:grid-cols-3">{demoStudents.map(renderDemoCard)}</div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3"><div className="flex items-center gap-3"><span className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-black text-blue-800">B. Akun Guru</span><span className="h-px flex-1 bg-blue-50" /></div>{renderDemoCard(demoTeacher)}</div>
                      <div className="space-y-3"><div className="flex items-center gap-3"><span className="rounded-full bg-blue-100 px-4 py-1.5 text-sm font-black text-blue-800">C. Akun Orang Tua</span><span className="h-px flex-1 bg-blue-100" /></div>{renderDemoCard(demoParent)}</div>
                    </div>
                    <p className="mx-auto max-w-3xl rounded-2xl bg-slate-100 px-5 py-3 text-center text-xs leading-5 text-slate-600">Catatan untuk pendamping: tombol simulasi menggunakan akun demo yang telah dikonfigurasi pada aplikasi dan tetap melalui proses autentikasi.</p>
                  </div>
                </div>
              </section>
            )}

            {/* SLIDE 7 — AJAKAN MULAI */}
            {activeSlide === 6 && (
              <section className="relative mx-auto flex bintang-screen-section min-h-[100dvh] w-full max-w-6xl flex-col items-center justify-center overflow-hidden px-5 py-16 text-center">
                <BintangMascot size={150} label="Maskot Bintang tersenyum" className="bintang-mascot-hero" />
                <p className="mt-9 rounded-full bg-sky-100 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-800">Bintang AI · Ruang Belajar SD</p>
                <h2 className="mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-6xl">Setiap anak punya kesempatan untuk bersinar!</h2>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Ayo mulai petualangan belajar. Kamu bisa membuat akun atau masuk ke akun yang sudah ada.</p>
                <div className="mt-9 flex w-full max-w-xl flex-col gap-4 sm:flex-row">
                  <button type="button" onClick={() => openAuth('register')} className={`${primaryButton} flex-1`}>Buat akun <BintangMascot size={22} label={null} /></button>
                  <button type="button" onClick={() => openAuth('login')} className={`${secondaryButton} flex-1`}>Masuk ke akun</button>
                </div>
                <button type="button" onClick={() => goToSlide(5)} className="mt-7 text-sm font-extrabold text-sky-700 underline decoration-sky-300 underline-offset-4">Aku mau coba demo dulu</button>
              </section>
            )}

            {/* SLIDE 8 — LOGIN / REGISTER */}
            {activeSlide === 7 && (
              <section className="relative mx-auto flex h-[100dvh] max-h-[100dvh] bintang-screen-section w-full max-w-[1380px] items-center justify-between overflow-hidden px-6 lg:px-12">
                {/* Floating Back Button (Arrow Pointing UP Only) */}
                <button
                  type="button"
                  onClick={() => goToSlide(0)}
                  aria-label="Kembali ke Halaman Utama"
                  title="Kembali ke Halaman Utama"
                  className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-blue-200/80 bg-white/95 text-slate-800 shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:border-sky-400 hover:bg-sky-50 hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <span aria-hidden="true" className="text-xl font-bold">↑</span>
                </button>

                <div className="flex h-full max-h-[calc(100dvh-2rem)] w-full items-center justify-between gap-8 lg:gap-16 origin-center scale-[0.9] sm:scale-[0.94] lg:scale-100 transition-transform">

                  {/* LEFT CONTENT (INTEGRATED INTO PAGE, WITH BINTANG AVATAR MASCOT FOR SD STUDENTS) */}
                  <div className="hidden lg:flex flex-1 flex-col justify-center py-4">
                    <div className="mb-3">
                      <BintangAvatar size={96} state={authTab === 'login' ? 'happy' : 'idle'} />
                    </div>
                    <div className="max-w-lg space-y-2.5">
                      <p className="inline-flex rounded-full bg-blue-50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-blue-800">
                        {authTab === 'login' ? 'Masuk Akun' : 'Daftar Akun Baru'}
                      </p>
                      <h2 className="text-3xl xl:text-4xl font-black leading-tight text-slate-900">
                        {authTab === 'login' ? 'Selamat datang kembali!' : 'Buat akun Bintang AI'}
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {authTab === 'login'
                          ? 'Masuk untuk membuka materi, latihan kuis, dan interaksi bersama Kak Bintang.'
                          : 'Lengkapi data untuk mulai belajar bersama pendampingan guru dan orang tua.'}
                      </p>
                    </div>

                    <div className="mt-6 max-w-lg space-y-2.5 border-t border-slate-200/80 pt-5">
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Dukungan Aksesibilitas SD</p>
                      <div className="flex flex-col gap-2 text-xs font-bold text-slate-800">
                        <div className="flex items-center gap-3 rounded-2xl bg-sky-50/90 px-3.5 py-2.5 border border-sky-100 shadow-2xs">
                          <span className="text-lg">🎧</span> <span>Suara & Pembaca Layar (Tunanetra)</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-blue-50/90 px-3.5 py-2.5 border border-blue-100 shadow-2xs">
                          <span className="text-lg">💬</span> <span>Subtitle & Teks Visual (Tunarungu)</span>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl bg-indigo-50/90 px-3.5 py-2.5 border border-indigo-100 shadow-2xs">
                          <span className="text-lg">🧩</span> <span>Gestur Isyarat & Simbol (Tunawicara)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT FORM CONTAINER (INTEGRATED DIRECTLY INTO PAGE, NO CARD BOX) */}
                  <div className="w-full max-w-[460px] lg:w-[460px] xl:w-[480px] shrink-0 h-full max-h-[580px] flex flex-col justify-center">
                    <div className="py-2 sm:py-4">
                      {/* Mobile Mascot Header */}
                      <div className="flex lg:hidden items-center gap-3 mb-4 p-2.5 rounded-2xl bg-blue-50/90 border border-blue-100">
                        <BintangAvatar size={48} state={authTab === 'login' ? 'happy' : 'idle'} />
                        <div>
                          <p className="text-xs font-black text-blue-900">{authTab === 'login' ? 'Halo, Teman Bintang!' : 'Daftar Akun Baru'}</p>
                          <p className="text-[11px] text-slate-600">Ruang belajar ceria SD</p>
                        </div>
                      </div>

                      {/* Tab masuk dan daftar */}
                      <div className="mb-6 grid w-full grid-cols-2 rounded-xl border border-blue-100 bg-[#F1F6FF] p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab('login');
                            setLoginMessage(null);
                          }}
                          aria-pressed={authTab === 'login'}
                          className={`min-h-10 rounded-lg px-4 text-sm font-extrabold transition duration-200 focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                            authTab === 'login'
                              ? 'bg-white text-blue-800 shadow-sm'
                              : 'text-slate-500 hover:bg-white/70 hover:text-blue-800'
                          }`}
                        >
                          Masuk
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab('register');
                            setRegStep(1);
                            setRegMessage(null);
                          }}
                          aria-pressed={authTab === 'register'}
                          className={`min-h-10 rounded-lg px-4 text-sm font-extrabold transition duration-200 focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                            authTab === 'register'
                              ? 'bg-white text-blue-800 shadow-sm'
                              : 'text-slate-500 hover:bg-white/70 hover:text-blue-800'
                          }`}
                        >
                          Daftar
                        </button>
                      </div>

                      {/* LOGIN */}
                      {authTab === 'login' && (
                        <div>
                          {loginMessage && (
                            <div
                              role="alert"
                              className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-800"
                            >
                              {loginMessage.text}
                            </div>
                          )}

                          <form onSubmit={handleLoginSubmit} className="space-y-5">
                            <div>
                              <label htmlFor="landing-login-email" className="mb-2 block text-sm font-bold text-blue-950">
                                Alamat email
                              </label>
                              <input
                                id="landing-login-email"
                                type="email"
                                autoComplete="email"
                                required
                                value={loginEmail}
                                onChange={(event) => setLoginEmail(event.target.value)}
                                placeholder="nama@email.com"
                                className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100`}
                              />
                            </div>

                            <div>
                              <label htmlFor="landing-login-password" className="mb-2 block text-sm font-bold text-blue-950">
                                Kata sandi
                              </label>
                              <div className="relative">
                                <input
                                  id="landing-login-password"
                                  type={showLoginPassword ? 'text' : 'password'}
                                  autoComplete="current-password"
                                  required
                                  value={loginPassword}
                                  onChange={(event) => setLoginPassword(event.target.value)}
                                  placeholder="Masukkan kata sandi"
                                  className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] pr-28 font-medium focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowLoginPassword((value) => !value)}
                                  className="absolute inset-y-0 right-2 my-auto h-10 rounded-lg px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-sky-200"
                                  aria-label={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                >
                                  {showLoginPassword ? 'Sembunyikan' : 'Tampilkan'}
                                </button>
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={loginLoading}
                              className={`${primaryButton} mt-1 w-full rounded-xl bg-sky-700 shadow-[0_4px_0_#075985] hover:bg-sky-800 hover:shadow-[0_5px_0_#075985]`}
                            >
                              {loginLoading ? 'Sedang memeriksa akun...' : 'Masuk dan mulai belajar'}
                            </button>
                          </form>

                          <div className="mt-6 border-t border-blue-100 pt-5 text-center">
                            <p className="text-sm text-slate-500">
                              Belum memiliki akun?{' '}
                              <button
                                type="button"
                                onClick={() => {
                                  setAuthTab('register');
                                  setRegStep(1);
                                  setRegMessage(null);
                                }}
                                className="font-extrabold text-blue-800 underline decoration-blue-200 underline-offset-4 transition hover:text-sky-700"
                              >
                                Daftar sekarang
                              </button>
                            </p>
                          </div>
                        </div>
                      )}

                      {/* REGISTER */}
                      {authTab === 'register' && (
                        <div>
                          <div className="mb-5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="text-sm font-bold text-blue-950">Langkah {regStep} dari 3</p>
                              <p className="text-xs font-semibold text-sky-700">
                                {['Pilih peran', 'Detail kelas', 'Data akun'][regStep - 1]}
                              </p>
                            </div>
                            <div className="grid grid-cols-3 gap-2" aria-label="Progres pendaftaran">
                              {[1, 2, 3].map((step) => (
                                <div key={step} className={`h-1.5 rounded-full transition-colors ${step <= regStep ? 'bg-sky-600' : 'bg-blue-100'}`} />
                              ))}
                            </div>
                          </div>

                          {regMessage && (
                            <div
                              role="alert"
                              className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${
                                regMessage.type === 'error'
                                  ? 'border-blue-200 bg-blue-50 text-blue-800'
                                  : 'border-sky-200 bg-sky-50 text-sky-800'
                              }`}
                            >
                              {regMessage.text}
                            </div>
                          )}

                          <form onSubmit={handleRegisterSubmit} className="space-y-5">
                            {/* LANGKAH 1 — PERAN */}
                            {regStep === 1 && (
                              <div className="space-y-5">
                                <fieldset>
                                  <legend className="mb-3 text-sm font-bold text-blue-950">Daftar sebagai</legend>
                                  <div className="grid gap-2.5 sm:grid-cols-3">
                                    {[
                                      { id: 'siswa', label: 'Siswa SD', description: 'Belajar dan berlatih' },
                                      { id: 'guru', label: 'Guru', description: 'Mengelola kelas' },
                                      { id: 'ortu', label: 'Orang tua', description: 'Mendampingi anak' },
                                    ].map((role) => {
                                      const selected = regRole === role.id;
                                      return (
                                        <button
                                          key={role.id}
                                          type="button"
                                          onClick={() => {
                                            setRegRole(role.id);
                                            setRegMessage(null);
                                          }}
                                          aria-pressed={selected}
                                          className={`flex min-h-[112px] flex-col rounded-xl border-2 p-3 text-left transition focus:outline-none focus:ring-4 focus:ring-sky-100 ${
                                            selected
                                              ? 'border-sky-500 bg-sky-50 shadow-sm'
                                              : 'border-blue-100 bg-white hover:border-sky-300 hover:bg-[#F8FBFF]'
                                          }`}
                                        >
                                          <span className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-extrabold text-blue-950">{role.label}</span>
                                            <span
                                              aria-hidden="true"
                                              className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                                                selected ? 'border-sky-600 bg-sky-600' : 'border-slate-300 bg-white'
                                              }`}
                                            >
                                              {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                                            </span>
                                          </span>
                                          <span className="mt-2 text-xs leading-5 text-slate-500">{role.description}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </fieldset>

                                {regRole === 'siswa' && (
                                  <div>
                                    <label htmlFor="landing-reg-disability" className="mb-2 block text-sm font-bold text-blue-950">
                                      Cara belajar yang nyaman
                                    </label>
                                    <select
                                      id="landing-reg-disability"
                                      value={regDisability}
                                      onChange={(event) => setRegDisability(event.target.value)}
                                      className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white`}
                                    >
                                      <option value="" disabled>Pilih cara belajar</option>
                                      <option value="tunanetra">Tunanetra — suara dan pembaca layar</option>
                                      <option value="tunarungu">Tunarungu — teks dan petunjuk visual</option>
                                      <option value="tunawicara">Tunawicara — tulisan, gambar, dan simbol</option>
                                      <option value="tidak_ada">Umum — tampilan standar</option>
                                    </select>
                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                      Pengaturan dapat disesuaikan kembali sesuai kebutuhan belajar.
                                    </p>
                                  </div>
                                )}

                                <div className="flex justify-end border-t border-blue-100 pt-4">
                                  <button
                                    type="button"
                                    onClick={handleRegisterNext}
                                    className={`${primaryButton} w-full rounded-xl bg-sky-700 shadow-[0_4px_0_#075985] hover:bg-sky-800 sm:w-auto sm:min-w-32`}
                                  >
                                    Lanjut <span aria-hidden="true">→</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* LANGKAH 2 — DETAIL KELAS */}
                            {regStep === 2 && (
                              <div className="space-y-5">
                                {regRole === 'siswa' && (
                                  <>
                                    <div>
                                      <h4 className="text-sm font-extrabold text-blue-950">Informasi kelas</h4>
                                      <p className="mt-1 text-xs leading-5 text-slate-500">Masukkan kelas dan kode yang diberikan oleh guru.</p>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                      <div>
                                        <label htmlFor="landing-reg-class" className="mb-2 block text-sm font-bold text-blue-950">Kelas SD</label>
                                        <select
                                          id="landing-reg-class"
                                          required
                                          value={regClassLevel}
                                          onChange={(event) => setRegClassLevel(event.target.value)}
                                          className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white`}
                                        >
                                          {['1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'].map((level) => (
                                            <option key={level} value={level}>{level}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label htmlFor="landing-reg-class-code" className="mb-2 block text-sm font-bold text-blue-950">Kode kelas dari guru</label>
                                        <input
                                          id="landing-reg-class-code"
                                          required
                                          value={regClassCode}
                                          onChange={(event) => setRegClassCode(event.target.value.toUpperCase())}
                                          placeholder="Contoh: X8J2K1"
                                          className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white`}
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}

                                {regRole === 'guru' && (
                                  <>
                                    <div>
                                      <h4 className="text-sm font-extrabold text-blue-950">Informasi guru</h4>
                                      <p className="mt-1 text-xs leading-5 text-slate-500">Lengkapi informasi sekolah dan mata pelajaran yang diampu.</p>
                                    </div>
                                    <div>
                                      <label htmlFor="landing-reg-school" className="mb-2 block text-sm font-bold text-blue-950">Nama sekolah / SLB</label>
                                      <input
                                        id="landing-reg-school"
                                        required
                                        value={regSlbName}
                                        onChange={(event) => setRegSlbName(event.target.value)}
                                        placeholder="Masukkan nama sekolah atau SLB"
                                        className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white`}
                                      />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                      <div>
                                        <label htmlFor="landing-reg-teacher-class" className="mb-2 block text-sm font-bold text-blue-950">Kelas yang diampu</label>
                                        <select
                                          id="landing-reg-teacher-class"
                                          required
                                          value={regClassLevel}
                                          onChange={(event) => setRegClassLevel(event.target.value)}
                                          className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white`}
                                        >
                                          {['1 SD', '2 SD', '3 SD', '4 SD', '5 SD', '6 SD'].map((level) => (
                                            <option key={level} value={level}>{level}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label htmlFor="landing-reg-subject" className="mb-2 block text-sm font-bold text-blue-950">Mata pelajaran utama</label>
                                        <select
                                          id="landing-reg-subject"
                                          value={regSubject}
                                          onChange={(event) => setRegSubject(event.target.value)}
                                          className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white`}
                                        >
                                          {['Matematika', 'Bahasa Indonesia', 'IPAS', 'Pendidikan Pancasila', 'Bahasa Inggris', 'Lainnya'].map((subject) => (
                                            <option key={subject} value={subject}>{subject}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </>
                                )}

                                {regRole === 'ortu' && (
                                  <div>
                                    <h4 className="text-sm font-extrabold text-blue-950">Hubungkan akun anak</h4>
                                    <p className="mb-4 mt-1 text-xs leading-5 text-slate-500">
                                      Masukkan ID Belajar Siswa untuk menghubungkan akun orang tua dengan profil anak.
                                    </p>
                                    <label htmlFor="landing-reg-child-id" className="mb-2 block text-sm font-bold text-blue-950">ID Belajar Siswa</label>
                                    <input
                                      id="landing-reg-child-id"
                                      required
                                      value={regStudentIdInput}
                                      onChange={(event) => setRegStudentIdInput(event.target.value)}
                                      placeholder="Masukkan ID dari anak"
                                      className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white`}
                                    />
                                    {checkingChild && (
                                      <p role="status" className="mt-3 text-sm font-semibold text-sky-700">Sedang memeriksa ID siswa...</p>
                                    )}
                                    {verifiedChild && (
                                      <div role="status" className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">Profil siswa ditemukan</p>
                                        <p className="mt-1 text-sm font-extrabold text-blue-950">{verifiedChild.full_name}</p>
                                        <p className="mt-0.5 text-xs text-slate-600">{verifiedChild.class_level || 'Kelas SD'}</p>
                                      </div>
                                    )}
                                    {childCheckError && (
                                      <p role="alert" className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-800">{childCheckError}</p>
                                    )}
                                  </div>
                                )}

                                <div className="flex flex-col-reverse justify-between gap-3 border-t border-blue-100 pt-4 sm:flex-row">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRegStep(1);
                                      setRegMessage(null);
                                    }}
                                    className={`${secondaryButton} rounded-xl border-blue-200 text-blue-800 hover:bg-blue-50`}
                                  >
                                    Kembali
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleRegisterNext}
                                    className={`${primaryButton} rounded-xl bg-sky-700 shadow-[0_4px_0_#075985] hover:bg-sky-800 sm:min-w-32`}
                                  >
                                    Lanjut <span aria-hidden="true">→</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* LANGKAH 3 — DATA AKUN */}
                            {regStep === 3 && (
                              <div className="space-y-5">
                                <div>
                                  <h4 className="text-sm font-extrabold text-blue-950">Informasi akun</h4>
                                  <p className="mt-1 text-xs leading-5 text-slate-500">Gunakan data yang benar untuk masuk ke Bintang AI.</p>
                                </div>

                                <div>
                                  <label htmlFor="landing-reg-name" className="mb-2 block text-sm font-bold text-blue-950">Nama lengkap</label>
                                  <input
                                    id="landing-reg-name"
                                    autoComplete="name"
                                    required
                                    value={regFullName}
                                    onChange={(event) => setRegFullName(event.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white`}
                                  />
                                </div>

                                <div>
                                  <label htmlFor="landing-reg-email" className="mb-2 block text-sm font-bold text-blue-950">Alamat email</label>
                                  <input
                                    id="landing-reg-email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={regEmail}
                                    onChange={(event) => setRegEmail(event.target.value)}
                                    placeholder="nama@email.com"
                                    className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white`}
                                  />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <label htmlFor="landing-reg-password" className="mb-2 block text-sm font-bold text-blue-950">Kata sandi</label>
                                    <div className="relative">
                                      <input
                                        id="landing-reg-password"
                                        type={showRegPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        minLength={8}
                                        value={regPassword}
                                        onChange={(event) => setRegPassword(event.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] pr-24 font-medium focus:border-sky-500 focus:bg-white`}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setShowRegPassword((value) => !value)}
                                        className="absolute inset-y-0 right-2 my-auto h-10 rounded-lg px-2 text-xs font-bold text-blue-700 hover:bg-blue-50"
                                        aria-label={showRegPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                      >
                                        {showRegPassword ? 'Sembunyikan' : 'Tampilkan'}
                                      </button>
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-400">Minimal 8 karakter.</p>
                                  </div>

                                  <div>
                                    <label htmlFor="landing-reg-confirm" className="mb-2 block text-sm font-bold text-blue-950">Ulangi kata sandi</label>
                                    <input
                                      id="landing-reg-confirm"
                                      type={showRegPassword ? 'text' : 'password'}
                                      autoComplete="new-password"
                                      required
                                      value={regConfirmPassword}
                                      onChange={(event) => setRegConfirmPassword(event.target.value)}
                                      placeholder="Ulangi kata sandi"
                                      className={`${inputClass} rounded-xl border border-blue-100 bg-[#F8FBFF] font-medium focus:border-sky-500 focus:bg-white`}
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col-reverse justify-between gap-3 border-t border-blue-100 pt-4 sm:flex-row">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRegStep(2);
                                      setRegMessage(null);
                                    }}
                                    className={`${secondaryButton} rounded-xl border-blue-200 text-blue-800 hover:bg-blue-50`}
                                  >
                                    Kembali
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={regLoading}
                                    className={`${primaryButton} rounded-xl bg-sky-700 shadow-[0_4px_0_#075985] hover:bg-sky-800 sm:min-w-52`}
                                  >
                                    {regLoading ? 'Membuat akun...' : 'Buat akun Bintang AI'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </form>
                        </div>
                      )}

                      <p className="mt-4 border-t border-blue-100 pt-3 text-center text-[11px] leading-5 text-slate-400">
                        Bintang AI · Belajar bersama, tumbuh bersama.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* PANDUAN TUR */}
      <AnimatePresence>
        {showTourGuide && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            role="presentation"
            onClick={(event) => { if (event.target === event.currentTarget) setShowTourGuide(false); }}
          >
            <motion.section
              role="dialog" aria-modal="true" aria-labelledby="bintang-tour-title"
              className="w-full max-w-lg rounded-[30px] border-4 border-white bg-white p-6 shadow-2xl sm:p-8"
              initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.25 }}
            >
              <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-blue-100 bg-blue-50" aria-hidden="true"><BintangMascot size={72} label={null} /></span>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-sky-700">Tur pengenalan</p>
              <h2 id="bintang-tour-title" className="mt-2 text-3xl font-black text-slate-900">Jelajahi Bintang AI</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">Halaman akan berpindah sendiri agar kamu bisa melihat fitur-fitur Bintang AI. Kamu tetap bisa menjeda atau memilih halaman sendiri.</p>
              <div className="mt-5 rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-sky-900"><strong>Tips:</strong> Tekan tombol Jeda untuk berhenti sebentar. Di komputer, kamu juga bisa memakai tombol Spasi.</div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowTourGuide(false)} className={secondaryButton}>Nanti saja</button>
                <button type="button" onClick={startExploreTour} className={primaryButton}>Mulai jelajah</button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOMBOL JEDA TUR */}
      <AnimatePresence>
        {tourActive && activeSlide < 7 && (
          <motion.div className="bintang-pause-control fixed bottom-5 left-4 z-40 sm:bottom-6 sm:left-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <button type="button" onClick={() => setTourPaused((paused) => !paused)} aria-pressed={tourPaused} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-white bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-xl hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-sky-200">
              <span aria-hidden="true">{tourPaused ? '▶' : 'Ⅱ'}</span>{tourPaused ? 'Lanjutkan tur' : 'Jeda tur'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVIGASI BAB */}
      {activeSlide !== 7 && (
        <nav aria-label="Navigasi bab presentasi" className="bintang-chapter-nav fixed right-2 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 rounded-full border border-blue-100 bg-white/95 px-2 py-3 shadow-md backdrop-blur-md sm:right-5 sm:gap-2.5 sm:px-2.5">
          {SLIDE_LABELS.map((label, index) => (
            <button key={label} type="button" onClick={() => goToSlide(index)} aria-label={`Buka halaman ${index + 1}: ${label}`} aria-current={activeSlide === index ? 'step' : undefined} title={label} className={`rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${activeSlide === index ? 'h-7 w-2.5 bg-sky-600' : 'h-2.5 w-2.5 bg-slate-300 hover:bg-sky-400'}`} />
          ))}
        </nav>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {tourActive ? (tourPaused ? 'Tur Bintang AI dijeda.' : `Tur Bintang AI, halaman ${activeSlide + 1} dari 8.`) : ''}
      </p>

      {/* FULLSCREEN REDIRECT & LOADING OVERLAY */}
      <AnimatePresence>
        {redirecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md text-slate-900 px-6 text-center select-none"
          >
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute h-32 w-32 rounded-full border-4 border-sky-100 border-t-blue-600 animate-spin" />
              <BintangAvatar size={96} state="happy" />
            </div>
            <h3 className="text-xl font-black text-blue-950">{redirectMessage}</h3>
            <p className="mt-2 text-xs font-bold text-sky-600 animate-pulse">Memuat halaman... Mohon tunggu sebentar 🚀</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;

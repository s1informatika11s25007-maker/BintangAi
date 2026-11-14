import React, { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';
import { useVoice } from '../hooks/useVoice';
import { useSubtitle } from './Subtitles';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useClassVoiceBroadcast } from '../hooks/useClassVoiceBroadcast';
import { getAccurateTimeGreeting } from '@/utils';

const AccessibilityProvider = ({ children }) => {
  const { isBlind } = useAccessibility();
  const { speak } = useVoice();
  const { profile } = useAuthStore();

  // Mount Realtime Teacher Class Voice Broadcast Hook globally for connected students
  useClassVoiceBroadcast();
  const location = useLocation();
  const lastPathname = useRef(location.pathname);
  const welcomeAnnounced = useRef(false);

  const isPublicPage = useMemo(() => {
    if (!location?.pathname) return false;
    if (location.pathname === '/') return true;
    const publicPaths = ['/auth', '/login', '/register'];
    return publicPaths.some(path => location.pathname.startsWith(path));
  }, [location?.pathname]);

  // Global guidance for blind students (Siswa Tunanetra) when switching pages
  useEffect(() => {
    // Silence and stop speech on public pages or unauthenticated state
    if (isPublicPage || !isBlind || !profile) {
      if (isPublicPage && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    let justWelcomed = false;
    // Handle welcome message once after login
    if (!welcomeAnnounced.current && (location.pathname.startsWith('/student') || location.pathname === '/profile')) {
      const name = profile.full_name?.split(' ')[0] || 'Teman';
      const timeGreeting = getAccurateTimeGreeting();
      speak(`${timeGreeting}, ${name}. Nay, asisten pintar kamu, sudah aktif. Gunakan tombol Tab untuk berpindah menu, atau tekan Spasi untuk berbicara dengan Nay kapan saja.`, 1.0, true);

      welcomeAnnounced.current = true;
      justWelcomed = true;
    }

    // Handle page transitions with friendly guidance for SD students
    if (lastPathname.current !== location.pathname) {
      // 🛡️ SKIP Page transition guidance on quiz execution pages to avoid cutting off question TTS
      const isQuizPage = location.pathname.startsWith('/student/quiz/') || location.pathname.startsWith('/student/task/');
      if (isQuizPage) {
        lastPathname.current = location.pathname;
        return;
      }

      const { name, guide } = getPageInfo(location.pathname);

      if (justWelcomed || location.pathname === '/student/dashboard') {
        lastPathname.current = location.pathname;
        return;
      }

      speak(`Membuka ${name}. ${guide}`, 1.0, true);
      lastPathname.current = location.pathname;
    }
  }, [location.pathname, isPublicPage, isBlind, profile, speak]);

  const getPageInfo = (path) => {
    if (path === '/student/dashboard') return {
        name: 'Beranda Utama',
        guide: 'Di sini kamu bisa melihat perkembangan level dan poin kamu. Ada juga daftar quiz terbaru yang perlu dikerjakan.'
    };
    if (path === '/student/tasks') return {
        name: 'Halaman Quiz dan Tugas',
        guide: 'Daftar quiz yang tersedia. Tekan Tab untuk memilih quiz, lalu tekan Enter untuk mulai mengerjakan.'
    };
    if (path === '/student/modules') return {
        name: 'Halaman Materi Belajar',
        guide: 'Pilih materi di daftar sebelah kiri. Setelah terbuka, kamu bisa mendengarkan pembacaan materi otomatis dan penjelasan Kak Bintang.'
    };
    if (path === '/student/playground') return {
        name: 'Halaman Tanya Kak Bintang',
        guide: 'Di sini kamu bisa mengobrol dan bertanya apa saja tentang pelajaran kepada Kak Bintang.'
    };
    if (path === '/student/collaboration') return {
        name: 'Dunia Inklusif Kolaborasi',
        guide: 'Fitur untuk belajar bersama teman-teman dalam dunia virtual.'
    };
    if (path === '/profile') return {
        name: 'Halaman Profil Saya',
        guide: 'Informasi akun dan pengaturan aksesibilitas suara kamu.'
    };
    return { name: 'Halaman Baru', guide: '' };
  };

  // Global focus, hover, and W3C Image/Diagram listener for Siswa Tunanetra
  useEffect(() => {
    if (isPublicPage || !isBlind || !profile) return;

    let lastSpokenBlock = null;
    let lastSpokenText = '';
    let lastSpokenTime = 0;
    let hoverDebounceTimer = null;

    const handleAccessibilityFeedback = (e, isKeyboard = false) => {
      if (!e.target || typeof e.target.closest !== 'function') return;

      // 1. Target resolution: Match any readable text container or interactive element
      const container = e.target.closest(
        'button, a, input, select, textarea, [role="button"], [role="article"], [role="option"], ' +
        'p, span, h1, h2, h3, h4, h5, h6, li, label, blockquote, figure, img, svg, ' +
        '[data-description], [data-message], [aria-label], [tabindex], .clickable-item, .chat-bubble'
      );

      if (!container) return;

      // Skip reading hidden elements
      if (container.offsetParent === null && container.tagName !== 'BODY') return;

      // 2. Extract readable text & attributes
      let ariaLabel = container.getAttribute('aria-label') || container.getAttribute('data-description') || '';
      let dataMessageRole = container.getAttribute('data-message') || container.closest('[data-message]')?.getAttribute('data-message');
      let altText = container.getAttribute('alt') || container.getAttribute('title') || container.placeholder || '';

      let rawText = ariaLabel || altText || container.innerText || container.textContent || '';
      let text = rawText.replace(/\s+/g, ' ').trim();

      if (!text || text.length < 2) return;

      // 3. Deduplication check: Avoid re-triggering speech inside the same block repeatedly
      const now = Date.now();
      if (container === lastSpokenBlock && text === lastSpokenText && (now - lastSpokenTime < 1800)) {
        return;
      }

      if (text === lastSpokenText && (now - lastSpokenTime < 800)) {
        return;
      }

      lastSpokenBlock = container;
      lastSpokenText = text;
      lastSpokenTime = now;

      // 4. Formatting speech output cleanly based on element type
      const tag = container.tagName.toLowerCase();
      const role = container.getAttribute('role');
      const isInteractive = (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select' || tag === 'textarea' || role === 'button');

      let typePrefix = '';
      let spokenText = text;

      if (tag === 'img' || tag === 'svg' || tag === 'figure') {
        typePrefix = 'Deskripsi Gambar atau Diagram: ';
      } else if (dataMessageRole) {
        if (!spokenText.toLowerCase().startsWith(dataMessageRole.toLowerCase())) {
          typePrefix = `Pesan ${dataMessageRole}: `;
        }
      } else if (isInteractive) {
        if (text.toLowerCase() === 'beranda' || text.toLowerCase() === 'home') {
          spokenText = 'Beranda Utama';
        }
        const hasPrefix = (p) => spokenText.toLowerCase().startsWith(p.toLowerCase());
        if ((tag === 'button' || role === 'button') && !hasPrefix('Tombol')) typePrefix = 'Tombol ';
        else if (tag === 'a' && !hasPrefix('Menu')) typePrefix = 'Menu ';
        else if (tag === 'input' && container.type === 'checkbox' && !hasPrefix('Kotak centang')) typePrefix = 'Kotak centang ';
        else if ((tag === 'input' || tag === 'textarea') && !hasPrefix('Kolom isian')) typePrefix = 'Kolom isian ';
        else if (tag === 'select' && !hasPrefix('Pilihan')) typePrefix = 'Pilihan ';
      }

      const fullMessage = `${typePrefix}${spokenText}`;

      // Speak speech output cleanly with configurable user settings
      speak(fullMessage, 1.0, true);
    };

    const handleMouseMove = (e) => {
      if (!e.clientX || !e.clientY) return;
      if (hoverDebounceTimer) clearTimeout(hoverDebounceTimer);
      hoverDebounceTimer = setTimeout(() => {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el) {
          handleAccessibilityFeedback({ target: el }, false);
        }
      }, 50);
    };

    const handleFocus = (e) => {
      handleAccessibilityFeedback(e, true);
    };

    window.addEventListener('focus', handleFocus, true);
    window.addEventListener('mouseenter', handleFocus, true);
    window.addEventListener('mousemove', handleMouseMove, { passive: true, capture: true });

    return () => {
      if (hoverDebounceTimer) clearTimeout(hoverDebounceTimer);
      window.removeEventListener('focus', handleFocus, true);
      window.removeEventListener('mouseenter', handleFocus, true);
      window.removeEventListener('mousemove', handleMouseMove, { passive: true, capture: true });
    };
  }, [isPublicPage, isBlind, profile, speak]);

  return <>{children}</>;
};

export default AccessibilityProvider;

import React, { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccessibility } from '../hooks/useAccessibility';
import { useVoice } from '../hooks/useVoice';
import { useSubtitle } from './Subtitles';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const AccessibilityProvider = ({ children }) => {
  const { isBlind } = useAccessibility();
  const { speak } = useVoice();
  const { profile } = useAuthStore();
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

      const hr = new Date().getHours();
      const timeGreeting = hr < 12 ? 'Selamat Pagi' : hr < 18 ? 'Selamat Siang' : 'Selamat Malam';
      speak(`${timeGreeting}, ${name}. Nay, asisten pintar kamu, sudah aktif. Gunakan tombol Tab untuk berpindah menu, atau tekan Spasi untuk berbicara dengan Nay kapan saja.`, 1.0, true);

      welcomeAnnounced.current = true;
      justWelcomed = true;
    }

    // Handle page transitions with friendly guidance for SD students
    if (lastPathname.current !== location.pathname) {
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

    let lastFocusedElement = null;
    let lastSpokenText = '';
    let lastSpokenTime = 0;

    const handleAccessibilityFeedback = (e) => {
      if (!e.target || typeof e.target.closest !== 'function') return;

      // 🎯 W3C DESKRIPSI GAMBAR DAN DIAGRAM (Alt Text & Diagram Reader)
      const imgTarget = e.target.closest('img, svg, figure, [data-description], [alt]');
      if (imgTarget && !e.target.closest('button, a')) {
        const alt = imgTarget.getAttribute('alt') || imgTarget.getAttribute('data-description') || imgTarget.getAttribute('aria-label') || imgTarget.getAttribute('title') || '';
        if (alt.trim()) {
          const now = Date.now();
          if (imgTarget === lastFocusedElement && alt === lastSpokenText && now - lastSpokenTime < 1000) return;
          lastFocusedElement = imgTarget;
          lastSpokenText = alt;
          lastSpokenTime = now;
          speak(`Deskripsi Gambar atau Diagram: ${alt.trim()}`, 1.0, true);
          return;
        }
      }

      // Search for nearest interactive element
      const target = e.target.closest('button, a, input, [role="button"], .clickable-item, [aria-label], select, textarea, h1, h2, h3, [tabindex]');
      if (!target) return;

      let text = target.getAttribute('aria-label') || target.innerText || target.placeholder || target.getAttribute('title') || '';
      text = text.replace(/\n/g, ' ').trim();

      if (!text) return;

      const now = Date.now();
      if (target === lastFocusedElement && text === lastSpokenText && now - lastSpokenTime < 800) return;

      lastFocusedElement = target;
      lastSpokenText = text;
      lastSpokenTime = now;

      const tag = target.tagName.toLowerCase();
      const role = target.getAttribute('role');
      let typePrefix = '';

      let spokenText = text;
      if (text.toLowerCase() === 'beranda' || text.toLowerCase() === 'home') {
        spokenText = 'Beranda Utama';
      }

      const hasPrefix = (p) => spokenText.toLowerCase().startsWith(p.toLowerCase());

      if ((tag === 'button' || role === 'button') && !hasPrefix('Tombol')) typePrefix = 'Tombol ';
      else if (tag === 'a' && !hasPrefix('Menu')) typePrefix = 'Menu ';
      else if (tag === 'input' && target.type === 'checkbox' && !hasPrefix('Kotak centang')) typePrefix = 'Kotak centang ';
      else if ((tag === 'input' || tag === 'textarea') && !hasPrefix('Kolom isian')) typePrefix = 'Kolom isian ';
      else if (tag === 'select' && !hasPrefix('Pilihan')) typePrefix = 'Pilihan ';

      // Speak with user-configured voice settings
      speak(`${typePrefix}${spokenText}`, 1.0, true);
    };

    window.addEventListener('focus', handleAccessibilityFeedback, true);
    window.addEventListener('mouseenter', handleAccessibilityFeedback, true);

    return () => {
      window.removeEventListener('focus', handleAccessibilityFeedback, true);
      window.removeEventListener('mouseenter', handleAccessibilityFeedback, true);
    };
  }, [isPublicPage, isBlind, profile, speak]);

  return <>{children}</>;
};

export default AccessibilityProvider;

import React, { useEffect, useRef } from 'react';
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

  // Global guidance for blind users when switching pages
  useEffect(() => {
    // Sound removed for student and parent roles as requested
    if (!isBlind || !profile || profile.role === 'siswa' || profile.role === 'ortu') return;

    let justWelcomed = false;
    // Handle welcome message once after login
    if (!welcomeAnnounced.current && (location.pathname.startsWith('/student') || location.pathname === '/profile')) {
      const name = profile.full_name?.split(' ')[0] || 'Teman';

      if (isBlind) {
        const hr = new Date().getHours();
        const timeGreeting = hr < 12 ? 'Selamat Pagi' : hr < 18 ? 'Selamat Siang' : 'Selamat Malam';
        speak(`${timeGreeting}, ${name}. Nay, asisten pintar kamu, sudah aktif. Gunakan tombol Tab untuk berpindah menu, atau tekan Spasi untuk berbicara dengan Nay kapan saja.`, 1.1, true);
      }

      welcomeAnnounced.current = true;
      justWelcomed = true;
    }

    // Handle page transitions with professional guidance
    if (lastPathname.current !== location.pathname) {
      const { name, guide } = getPageInfo(location.pathname);

      // Jika baru saja welcome, atau jika ke dashboard, jangan sapa di sini agar tidak tumpang tindih
      if (justWelcomed || location.pathname === '/student/dashboard') {
        lastPathname.current = location.pathname;
        return;
      }

      speak(`Membuka ${name}. ${guide}`, 1.1, true);
      lastPathname.current = location.pathname;
    }
  }, [location.pathname, isBlind, profile, speak]);

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
        guide: 'Pilih materi di daftar sebelah kiri. Setelah terbuka, kamu bisa minta saya meringkaskan materi atau membacakannya untukmu.'
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
        guide: 'Informasi akun dan pengaturan aksesibilitas kamu.'
    };
    return { name: 'Halaman Baru', guide: '' };
  };

  // Global focus and hover listener for blind users
  useEffect(() => {
    // Sound removed for student and parent roles as requested
    if (!isBlind || profile?.role === 'siswa' || profile?.role === 'ortu') return;

    let lastFocusedElement = null;
    let lastSpokenText = '';
    let lastSpokenTime = 0;

    const handleAccessibilityFeedback = (e) => {
      // Pastikan target adalah elemen DOM yang valid sebelum memanggil closest
      if (!e.target || typeof e.target.closest !== 'function') return;

      // Mencari elemen interaktif terdekat
      const target = e.target.closest('button, a, input, [role="button"], .clickable-item, [aria-label], select, textarea');
      if (!target) return;

      // Ambil teks dari aria-label atau innerText
      let text = target.getAttribute('aria-label') || target.innerText || target.placeholder || target.getAttribute('title') || '';

      // Bersihkan teks
      text = text.replace(/\n/g, ' ').trim();

      if (!text) return;

      // Debounce dan cegah pengulangan jika fokus belum berpindah secara fisik
      const now = Date.now();
      if (target === lastFocusedElement && text === lastSpokenText && now - lastSpokenTime < 1000) return;

      lastFocusedElement = target;
      lastSpokenText = text;
      lastSpokenTime = now;

      // Menentukan jenis elemen untuk panduan suara
      const tag = target.tagName.toLowerCase();
      const role = target.getAttribute('role');
      let typePrefix = '';

      // Normalisasi sebutan untuk Beranda/Home
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

      // Gunakan force=true agar responsif saat pindah-pindah cepat
      speak(`${typePrefix}${spokenText}`, 1.3, true);
    };

    window.addEventListener('focus', handleAccessibilityFeedback, true);
    window.addEventListener('mouseenter', handleAccessibilityFeedback, true);

    return () => {
      window.removeEventListener('focus', handleAccessibilityFeedback, true);
      window.removeEventListener('mouseenter', handleAccessibilityFeedback, true);
    };
  }, [isBlind, speak]);

  return <>{children}</>;
};

export default AccessibilityProvider;

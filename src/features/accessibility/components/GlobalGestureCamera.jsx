import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAccessibility } from '@/features/accessibility/hooks/useAccessibility';
import { useGestureControl } from '@/features/accessibility/hooks/useGestureControl';
import GestureCameraOverlay from './GestureCameraOverlay';
import { useSubtitle } from './Subtitles';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const GlobalGestureCamera = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMute } = useAccessibility();
  const { showSubtitle } = useSubtitle();
  const { profile, logout } = useAuthStore();

  const [menuActive, setMenuActive] = useState(false);
  const path = location.pathname;

  const isPublicPage = path === '/' || path.startsWith('/auth') || path === '/login' || path === '/register';

  // Camera enabled ONLY for Tunawicara mode on logged-in student pages
  const isEnabled = isMute && !!profile && profile.role === 'siswa' && !isPublicPage;

  const lastProcessedFinger = useRef(-1);
  const cooldownRef = useRef(false);

  // Helper function to scroll active container reliably across all pages
  const scrollActivePage = (topOffset) => {
    const containers = Array.from(document.querySelectorAll('.overflow-y-auto, main, body, #root'));
    let scrollTarget = containers.find(el => el && el.scrollHeight > el.clientHeight);

    if (!scrollTarget) {
      scrollTarget = document.querySelector('main') || window;
    }

    if (scrollTarget && typeof scrollTarget.scrollBy === 'function') {
      try {
        scrollTarget.scrollBy({ top: topOffset, behavior: 'smooth' });
      } catch (e) {
        scrollTarget.scrollTop += topOffset;
      }
    } else if (scrollTarget) {
      scrollTarget.scrollTop += topOffset;
    } else {
      window.scrollBy({ top: topOffset, behavior: 'smooth' });
    }
  };

  const { videoRef, canvasRef, isActive, handDetected, totalFingers } = useGestureControl({
    enabled: isEnabled,
    onScroll: (dir) => {
      if (!menuActive) {
        scrollActivePage(dir === 'down' ? 280 : -280);
      }
    }
  });

  const isProfilePage = path === '/profile';
  const [isModuleSelected, setIsModuleSelected] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;
    const checkModule = () => {
      const el = document.querySelector('[data-module-selected="true"]');
      setIsModuleSelected(!!el);
    };
    checkModule();
    const observer = new MutationObserver(checkModule);
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['data-module-selected'] });
    return () => observer.disconnect();
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled || totalFingers === 0 || cooldownRef.current) return;

    if (totalFingers === lastProcessedFinger.current) return;
    lastProcessedFinger.current = totalFingers;

    const isLoggedInPage = path.startsWith('/student/') || path === '/profile';

    const isDashboardPage = path === '/student/dashboard';
    const isTasksPage = path === '/student/tasks';
    const isTaskDetailPage = path.includes('/student/task/');

    // 1. TRIGGER MENU (10 Jari)
    if (totalFingers === 10 && isLoggedInPage) {
      setMenuActive(!menuActive);
      showSubtitle(menuActive ? '🏠 Menu Navigasi Ditutup' : '🔓 Menu Navigasi Terbuka (1=Beranda, 2=Quiz, 3=Materi, 4=Mabar, 5=Pesan Guru, 6=Tanya AI, 7=Profil)', 'info');
      triggerCooldown(600);
      return;
    }

    // 2. HANDLE NAVIGATION MENU (Saat Menu Utama Aktif - 1-7 Jari)
    if (menuActive) {
      let targetPath = '';
      let menuLabel = '';
      if (totalFingers === 1) { targetPath = '/student/dashboard'; menuLabel = 'Beranda Utama'; }
      else if (totalFingers === 2) { targetPath = '/student/tasks'; menuLabel = 'QuizKu'; }
      else if (totalFingers === 3) { targetPath = '/student/modules'; menuLabel = 'Materi Belajar'; }
      else if (totalFingers === 4) { targetPath = '/student/collaboration'; menuLabel = 'Grup Belajar'; }
      else if (totalFingers === 5) { targetPath = '/student/inbox'; menuLabel = 'Pesan Guru'; }
      else if (totalFingers === 6) { targetPath = profile?.disability_type === 'tunanetra' ? '/student/playground' : '/student/tanya-ai'; menuLabel = 'Tanya AI'; }
      else if (totalFingers === 7) { targetPath = '/profile'; menuLabel = 'Profil Saya'; }

      if (targetPath) {
        setMenuActive(false);
        showSubtitle(`🚀 Membuka ${menuLabel}`, 'success');
        navigate(targetPath);
        triggerCooldown(600);
      }
      return;
    }

    // 3. ATURAN KHUSUS HALAMAN BERANDA (Saat Menu Utama TIDAK Aktif)
    if (isDashboardPage && !menuActive) {
      if (totalFingers === 1) {
        scrollActivePage(380);
        showSubtitle('⬇️ Beranda: Scroll ke Bawah', 'info');
        triggerCooldown(600);
        return;
      }
      if (totalFingers === 2) {
        scrollActivePage(-380);
        showSubtitle('⬆️ Beranda: Scroll ke Atas', 'info');
        triggerCooldown(600);
        return;
      }
    }

    // 4. ATURAN KHUSUS HALAMAN QUIZKU (Saat Menu Utama TIDAK Aktif)
    if (isTasksPage && !menuActive) {
      if (totalFingers === 1) {
        const btnActive = document.querySelector('[data-tab-active="true"]');
        if (btnActive) btnActive.click();
        showSubtitle('⚡ Membuka Tab QuizKu Aktif', 'success');
        triggerCooldown();
        return;
      }
      if (totalFingers === 2) {
        const btnHistory = document.querySelector('[data-tab-completed="true"]');
        if (btnHistory) btnHistory.click();
        showSubtitle('🏆 Membuka Tab Riwayat & Kunci Jawaban', 'success');
        triggerCooldown();
        return;
      }
      if (totalFingers === 3) {
        const reviewBtn = document.querySelector('[data-btn-pembahasan="true"]');
        if (reviewBtn) {
          reviewBtn.click();
          showSubtitle('📖 Membuka Pembahasan Quiz', 'success');
          triggerCooldown();
          return;
        }
      }
    }

    // 5. ATURAN KHUSUS HALAMAN PEMBAHASAN QUIZ (Saat Modal/View Pembahasan Aktif)
    if (isTaskDetailPage && !menuActive) {
      const isPembahasanView = !!document.querySelector('[data-view-pembahasan="true"]');
      if (isPembahasanView && totalFingers === 1) {
        showSubtitle('⬅️ Kembali ke Halaman Sebelumnya', 'info');
        navigate('/student/tasks');
        triggerCooldown();
        return;
      }
    }

    // PAGE SPECIFIC INTERACTIVE ITEMS
    const interactivePaths = ['/student/tasks', '/student/modules', '/student/task/', '/student/collaboration'];
    if (interactivePaths.some(p => path.includes(p))) {

      const isModSel = !!document.querySelector('[data-module-selected="true"]');

      window.dispatchEvent(new CustomEvent('gesture-detected', { detail: { fingers: totalFingers } }));

      if (totalFingers === 6) {
        const nextBtn = document.querySelector('[data-gesture-next="true"]');
        if (nextBtn) { nextBtn.click(); triggerCooldown(); return; }
      }
      if (totalFingers === 7) {
        const prevBtn = document.querySelector('[data-gesture-prev="true"]');
        if (prevBtn) { prevBtn.click(); triggerCooldown(); return; }
      }

      if (!isModSel && totalFingers >= 1 && totalFingers <= 5) {
        const items = [...document.querySelectorAll('[data-gesture-item="true"]')];
        if (items.length >= totalFingers) {
          const target = items[totalFingers - 1];

          target.focus();
          target.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
          target.style.transform = 'scale(0.92) translateY(4px)';
          target.style.boxShadow = '0 0 50px rgba(79, 70, 229, 0.8)';

          setTimeout(() => {
            target.click();
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            target.dispatchEvent(clickEvent);

            target.style.transform = '';
            target.style.boxShadow = '';
            showSubtitle(`✅ Berhasil Memilih ke-${totalFingers}`, 'success');
          }, 300);

          triggerCooldown();
          return;
        }
      }
    }

    // PROFILE LOGOUT (2 Jari)
    if (isProfilePage && totalFingers === 2) {
      showSubtitle('👋 Melakukan Logout...', 'info');
      setTimeout(() => { logout('/auth/login'); }, 600);
      triggerCooldown();
      return;
    }

  }, [totalFingers, menuActive, path, isEnabled, isProfilePage, logout, navigate]);

  const triggerCooldown = () => {
    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
      lastProcessedFinger.current = -1;
    }, 1000);
  };

  useEffect(() => {
    setMenuActive(false);
    lastProcessedFinger.current = -1;
    cooldownRef.current = false;
  }, [path]);

  if (!isEnabled) return null;

  return (
    <GestureCameraOverlay
      videoRef={videoRef}
      canvasRef={canvasRef}
      isActive={isActive}
      handDetected={handDetected}
      totalFingers={totalFingers}
      menuActive={menuActive}
      isProfilePage={isProfilePage}
      isLandingPage={false}
      isAuthPage={false}
      isLoginMode={false}
      isModuleSelected={isModuleSelected}
    />
  );
};

export default GlobalGestureCamera;

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
  const isEnabled = isMute && !!profile && !isPublicPage;

  const lastProcessedFinger = useRef(-1);
  const cooldownRef = useRef(false);

  const { videoRef, canvasRef, isActive, handDetected, totalFingers } = useGestureControl({
    enabled: isEnabled,
    onScroll: (dir) => {
      if (path === '/student/dashboard' && !menuActive) {
        window.scrollBy({ top: dir === 'down' ? 250 : -250, behavior: 'smooth' });
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

    // TRIGGER MENU (10 Jari)
    if (totalFingers >= 9 && isLoggedInPage) {
      setMenuActive(!menuActive);
      showSubtitle(menuActive ? '🏠 Menu Navigasi Ditutup' : '🔓 Menu Navigasi Terbuka', 'info');
      triggerCooldown();
      return;
    }

    // HANDLE NAVIGATION MENU
    if (menuActive) {
      let targetPath = '';
      if (totalFingers === 1) targetPath = '/student/dashboard';
      else if (totalFingers === 2) targetPath = '/student/tasks';
      else if (totalFingers === 3) targetPath = '/student/modules';
      else if (totalFingers === 4) targetPath = '/student/collaboration';
      else if (totalFingers === 5) targetPath = '/student/tanya-ai';
      else if (totalFingers === 7) targetPath = '/profile';

      if (targetPath) {
        setMenuActive(false);
        navigate(targetPath);
        triggerCooldown();
      }
      return;
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

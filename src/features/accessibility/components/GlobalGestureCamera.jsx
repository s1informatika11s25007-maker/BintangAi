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
  const { logout } = useAuthStore();

  const [menuActive, setMenuActive] = useState(false);
  const path = location.pathname;

  // Camera always enabled for Tunawicara mode
  const isEnabled = isMute;

  const lastProcessedFinger = useRef(-1);
  const cooldownRef = useRef(false);

  const { videoRef, canvasRef, isActive, handDetected, totalFingers } = useGestureControl({
    enabled: isEnabled,
    onScroll: (dir) => {
      if ((path === '/student/dashboard' || path === '/') && !menuActive) {
        window.scrollBy({ top: dir === 'down' ? 250 : -250, behavior: 'smooth' });
      }
    }
  });

  // Determine page context
  const isLandingPage = path === '/';
  const isAuthPage = path === '/auth';
  const isTaskDetail = path.includes('/student/task/');
  const isTasksList = path === '/student/tasks';
  const isModulesList = path === '/student/modules';
  const isProfilePage = path === '/profile';

  // Auth specific state detected from DOM
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isModuleSelected, setIsModuleSelected] = useState(false);

  useEffect(() => {
    const checkModule = () => {
      const el = document.querySelector('[data-module-selected="true"]');
      setIsModuleSelected(!!el);
    };
    checkModule();
    const observer = new MutationObserver(checkModule);
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['data-module-selected'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAuthPage) {
      const checkMode = () => {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) setIsLoginMode(submitBtn.textContent.includes('Masuk'));
      };
      checkMode();
      const observer = new MutationObserver(checkMode);
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [isAuthPage]);

  useEffect(() => {
    if (!isEnabled || totalFingers === 0 || cooldownRef.current) return;

    // Logic: If finger changed or it's a new gesture
    if (totalFingers === lastProcessedFinger.current) return;
    lastProcessedFinger.current = totalFingers;

    // --- LANDING PAGE LOGIC ---
    if (isLandingPage) {
      if (totalFingers === 2) { navigate('/auth'); triggerCooldown(); return; }
      if (totalFingers === 5) { navigate('/auth'); triggerCooldown(); return; }
    }

    // --- LOGIN / REGISTER LOGIC ---
    if (isAuthPage) {
      if (totalFingers === 1) { navigate('/'); triggerCooldown(); return; }
      if (totalFingers === 2) {
        const toggleBtn = document.querySelector('button.text-indigo-600');
        if (toggleBtn) toggleBtn.click();
        triggerCooldown();
        return;
      }
      if (totalFingers === 5) {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
        triggerCooldown();
        return;
      }
    }

    // --- LOGGED IN PAGES LOGIC ---
    const isLoggedInPage = path.startsWith('/student/') || path === '/profile';

    // TRIGGER MENU (10 Jari) - Only works if not currently in a specific task to avoid distraction
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

    // --- PAGE SPECIFIC INTERACTIVE ITEMS ---
    // This logic takes precedence when menu is NOT active
    const interactivePaths = ['/student/tasks', '/student/modules', '/student/task/', '/student/collaboration'];
    if (interactivePaths.some(p => path.includes(p))) {

      const isModuleSelected = !!document.querySelector('[data-module-selected="true"]');

      // Dispatch event for components that want to handle gestures themselves (like PDF scrolling)
      window.dispatchEvent(new CustomEvent('gesture-detected', { detail: { fingers: totalFingers } }));

      // 1. Pagination for lists (6 and 7 fingers)
      if (totalFingers === 6) {
        const nextBtn = document.querySelector('[data-gesture-next="true"]');
        if (nextBtn) { nextBtn.click(); triggerCooldown(); return; }
      }
      if (totalFingers === 7) {
        const prevBtn = document.querySelector('[data-gesture-prev="true"]');
        if (prevBtn) { prevBtn.click(); triggerCooldown(); return; }
      }

      // 2. Select Items (1-5 fingers) - Disabled if module is selected to allow scrolling gestures
      if (!isModuleSelected && totalFingers >= 1 && totalFingers <= 5) {
        const items = [...document.querySelectorAll('[data-gesture-item="true"]')];
        if (items.length >= totalFingers) {
          const target = items[totalFingers - 1];

          // Robust focus
          target.focus();
          target.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
          target.style.transform = 'scale(0.92) translateY(4px)';
          target.style.boxShadow = '0 0 50px rgba(79, 70, 229, 0.8)';

          setTimeout(() => {
            // Multi-event robust trigger
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
      setTimeout(() => { logout(); navigate('/auth'); }, 1000);
      triggerCooldown();
      return;
    }

  }, [totalFingers, menuActive, path, isEnabled, isProfilePage, logout, navigate, isLandingPage, isAuthPage, isLoginMode]);

  const triggerCooldown = () => {
    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
      lastProcessedFinger.current = -1; // Reset to allow same finger after cooldown
    }, 1000); // Reduced to 1s for better responsiveness
  };

  // Auto-close menu and reset detection when path changes
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
      isLandingPage={isLandingPage}
      isAuthPage={isAuthPage}
      isLoginMode={isLoginMode}
      isModuleSelected={isModuleSelected}
    />
  );
};

export default GlobalGestureCamera;

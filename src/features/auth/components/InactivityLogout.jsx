import React, { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';

const InactivityLogout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const cameraActiveRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  // 15 minutes platform standard idle limit = 900.000 ms
  const INACTIVITY_LIMIT = 15 * 60 * 1000;

  const updateOnlineStatus = useCallback(async (onlineStatus = true) => {
    if (!user?.id) return;
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      // Single-row lightweight update on public.profiles - 0% database bloat
      await supabase.from('profiles').update({
        is_online: onlineStatus,
        last_active_at: new Date().toISOString(),
        last_active: todayDate
      }).eq('id', user.id);
    } catch (err) {
      console.error('Failed to update online status:', err);
    }
  }, [user?.id]);

  const handleAutoLogout = useCallback(async () => {
    try {
      console.log('User inactive for 15 minutes. Logging out automatically...');
      await updateOnlineStatus(false);
      await logout('/auth/login?reason=inactivity');
    } catch (error) {
      console.error('Auto-logout failed:', error);
    }
  }, [logout, updateOnlineStatus]);

  const resetTimer = useCallback((force = false) => {
    // Throttling: Avoid unnecessary processing on every mouse move
    const now = Date.now();
    if (!force && now - lastActivityRef.current < 2000) return;
    lastActivityRef.current = now;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // If camera is active (user is likely using sign language/gestures), we pause the logout timer
    if (user && !cameraActiveRef.current) {
      timeoutRef.current = setTimeout(handleAutoLogout, INACTIVITY_LIMIT);
    }
  }, [user, handleAutoLogout]);

  useEffect(() => {
    if (!user?.id) return;

    // Set online on mount & heartbeat every 60s
    updateOnlineStatus(true);
    const heartbeatInterval = setInterval(() => {
      if (Date.now() - lastActivityRef.current < INACTIVITY_LIMIT) {
        updateOnlineStatus(true);
      }
    }, 60000);

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    // Cek apakah kamera sedang aktif secara akurat dan sangat ringan
    const checkCameraActivity = () => {
      const video = document.querySelector('video');
      // Validasi apakah video benar-benar streaming (bukan sekadar elemen kosong)
      const isActive = !!(
        video &&
        video.srcObject &&
        video.srcObject.active &&
        video.readyState >= 2 && // HAVE_CURRENT_DATA
        !video.paused
      );

      // Hanya panggil resetTimer jika status berubah untuk mencegah "kedap-kedip" logika/efisiensi
      if (isActive !== cameraActiveRef.current) {
        cameraActiveRef.current = isActive;
        resetTimer(true);
      }
    };

    // Polling setiap 5 detik sudah sangat cukup untuk timer 10 menit
    const interval = setInterval(checkCameraActivity, 5000);

    const handleEvent = () => resetTimer();
    activityEvents.forEach(event => {
      window.addEventListener(event, handleEvent, { passive: true });
    });

    const handleUnload = () => {
      if (user?.id) {
        try {
          const body = JSON.stringify({ is_online: false, last_active_at: new Date().toISOString() });
          const endpoint = `${import.meta.env.VITE_SUPABASE_URL || 'https://qepfuqlnkofzfhfzahpr.supabase.co'}/rest/v1/profiles?id=eq.${user.id}`;
          fetch(endpoint, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
            },
            body,
            keepalive: true
          }).catch(() => {});
        } catch (e) {}
      }
    };

    window.addEventListener('pagehide', handleUnload);
    window.addEventListener('beforeunload', handleUnload);

    // Inisialisasi awal
    checkCameraActivity();
    resetTimer(true);

    return () => {
      clearInterval(interval);
      clearInterval(heartbeatInterval);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
      window.removeEventListener('pagehide', handleUnload);
      window.removeEventListener('beforeunload', handleUnload);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, resetTimer]);

  return <>{children}</>;
};

export default InactivityLogout;

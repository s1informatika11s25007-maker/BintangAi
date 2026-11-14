import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

/**
 * Detect real device name, browser, and OS accurately
 */
export const getDeviceName = () => {
  if (typeof navigator === 'undefined') return 'Perangkat Umum';

  const ua = navigator.userAgent;
  let os = 'Desktop / Laptop';
  let browser = 'Browser';

  // OS Detection
  if (/android/i.test(ua)) {
    const match = ua.match(/Android\s+([0-9\.]+)/i);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    const match = ua.match(/OS\s+([0-9_]+)/i);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // Browser Detection
  if (/chrome|crios/i.test(ua) && !/edge|edg|opr|opera/i.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'Firefox';
  } else if (/edge|edg/i.test(ua)) {
    browser = 'Edge';
  } else if (/opera|opr/i.test(ua)) {
    browser = 'Opera';
  }

  return `${os} (${browser})`;
};

/**
 * Non-blocking logger for user activity (Login, Auto-Logout, Button Click, Page Access, etc.)
 */
export const logUserActivity = async (actionType, featureName, description = '', overrideProfile = null) => {
  try {
    const profile = overrideProfile || useAuthStore.getState().profile;
    const user_id = profile?.id || null;
    const user_name = profile?.full_name || 'Pengguna Anonim';
    const user_role = profile?.role || 'pengguna';
    const class_code = profile?.class_code || null;
    const device_info = getDeviceName();

    // Asynchronous non-blocking insert into Supabase
    supabase.from('user_activity_logs').insert({
      user_id,
      user_name,
      user_role,
      class_code,
      action_type: actionType,
      feature_name: featureName,
      description: description || `Aksi pada fitur ${featureName}`,
      device_info,
      created_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn("Log insert warning:", error.message);
    });
  } catch (err) {
    console.warn("Activity logging error ignored:", err);
  }
};

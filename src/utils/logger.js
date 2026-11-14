import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

/**
 * Detect detailed device model, browser, and OS accurately (e.g. Samsung Galaxy (Android 14) - Chrome)
 */
export const getDeviceName = () => {
  if (typeof navigator === 'undefined') return 'Desktop PC';

  const ua = navigator.userAgent;
  let os = 'Desktop PC';
  let deviceModel = '';
  let browser = 'Browser';

  // Specific Android Phone Model Detection (Samsung, Xiaomi, OPPO, Vivo, Realme, Pixel, Infinix)
  if (/android/i.test(ua)) {
    const androidMatch = ua.match(/Android\s+([0-9\.]+)/i);
    const version = androidMatch ? androidMatch[1] : '';

    if (/samsung|sm-/i.test(ua)) deviceModel = 'Samsung Galaxy';
    else if (/redmi|mi /i.test(ua)) deviceModel = 'Xiaomi Redmi';
    else if (/oppo|cph/i.test(ua)) deviceModel = 'OPPO';
    else if (/vivo/i.test(ua)) deviceModel = 'Vivo';
    else if (/realme/i.test(ua)) deviceModel = 'Realme';
    else if (/pixel/i.test(ua)) deviceModel = 'Google Pixel';
    else if (/infinix/i.test(ua)) deviceModel = 'Infinix';
    else deviceModel = 'HP Android';

    os = `${deviceModel} (Android ${version})`.trim();
  } else if (/iphone/i.test(ua)) {
    const match = ua.match(/OS\s+([0-9_]+)/i);
    const version = match ? match[1].replace(/_/g, '.') : '';
    os = `iPhone (iOS ${version})`.trim();
  } else if (/ipad/i.test(ua)) {
    os = 'iPad';
  } else if (/windows/i.test(ua)) {
    os = 'Windows PC';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'MacBook / Mac';
  } else if (/linux/i.test(ua)) {
    os = 'Linux PC';
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

  return `${os} - ${browser}`;
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

import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

/**
 * Non-blocking logger for user activity (Login, Button Click, Page Access, etc.)
 */
export const logUserActivity = async (actionType, featureName, description = '', overrideProfile = null) => {
  try {
    const profile = overrideProfile || useAuthStore.getState().profile;
    const user_id = profile?.id || null;
    const user_name = profile?.full_name || 'Pengguna Anonim';
    const user_role = profile?.role || 'pengguna';
    const class_code = profile?.class_code || null;

    // Asynchronous non-blocking insert into Supabase
    supabase.from('user_activity_logs').insert({
      user_id,
      user_name,
      user_role,
      class_code,
      action_type: actionType,
      feature_name: featureName,
      description: description || `Aksi pada fitur ${featureName}`,
      created_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.warn("Log insert warning:", error.message);
    });
  } catch (err) {
    console.warn("Activity logging error ignored:", err);
  }
};

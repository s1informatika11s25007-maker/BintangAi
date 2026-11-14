import { supabase } from '@/lib/supabaseClient';

/**
 * Log user activity (Login, Button Click, Feature Access, etc.) to user_activity_logs table
 */
export const logUserActivity = async (actionType, featureName, description = '', profile = null) => {
  try {
    const user_id = profile?.id || null;
    const user_name = profile?.full_name || 'Pengguna Anonim';
    const user_role = profile?.role || 'pengguna';
    const class_code = profile?.class_code || null;

    await supabase.from('user_activity_logs').insert({
      user_id,
      user_name,
      user_role,
      class_code,
      action_type: actionType,
      feature_name: featureName,
      description,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Activity logging error ignored:", err);
  }
};

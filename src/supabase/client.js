import { createClient } from '@supabase/supabase-js';

// Fallback environment variables or demo fallback
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://mock-sambungjaga.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'mock-anon-key-sambungjaga-2026';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const isSupabaseConfigured = () => {
  return (
    import.meta.env?.VITE_SUPABASE_URL &&
    import.meta.env?.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('mock-sambungjaga')
  );
};

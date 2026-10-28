import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://qepfuqlnkofzfhfzahpr.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcGZ1cWxua29memZoZnphaHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1ODA0NTIsImV4cCI6MjEwODE1MjQ1Mn0.wB-NMe1S-ZihNdW8OjJxgh2JlaH10D1SV6tbWbAJS50';

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
  return true;
};

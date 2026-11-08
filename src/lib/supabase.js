import { createClient } from '@supabase/supabase-js'

// Mengambil URL dan Key dari environment variables (Vite prefix VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidConfig = supabaseUrl && supabaseUrl.startsWith('https') && supabaseAnonKey

// Log error jika config tidak valid untuk membantu debugging di Vercel
if (!isValidConfig) {
  console.error("%c CRITICAL ERROR: Supabase configuration missing! ", "background: red; color: white; font-weight: bold;");
  console.group("Debugging Info:");
  console.log("VITE_SUPABASE_URL:", supabaseUrl ? "Defined (Starts with https: " + supabaseUrl.startsWith('https') + ")" : "MISSING");
  console.log("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Defined" : "MISSING");
  console.log("Environment:", import.meta.env.MODE);
  console.groupEnd();
  console.warn("Please add these variables to your Vercel Project Settings (Environment Variables).");
}

// Inisialisasi client hanya jika URL valid
const client = isValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'bintangai-supabase-token'
      }
    })
  : null;

/**
 * DUMMY CLIENT
 * Digunakan sebagai fallback agar aplikasi tidak crash (White Screen)
 * saat environment variables belum dikonfigurasi di Vercel.
 */
const dummyClient = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error("Supabase URL is missing. Check Vercel settings.") }),
        limit: () => Promise.resolve({ data: [], error: new Error("Supabase URL is missing.") }),
        order: () => ({ limit: () => Promise.resolve({ data: [], error: new Error("Supabase URL is missing.") }) })
      }),
      order: () => ({ limit: () => Promise.resolve({ data: [], error: new Error("Supabase URL is missing.") }) }),
      limit: () => Promise.resolve({ data: [], error: new Error("Supabase URL is missing.") })
    }),
    insert: () => Promise.resolve({ data: null, error: new Error("Supabase URL is missing.") }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error("Supabase URL is missing.") }) }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: new Error("Supabase URL is missing.") }) }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ error: new Error("Akses ditolak: Supabase belum terhubung. Pastikan Environment Variables sudah diatur di Vercel.") }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  },
  functions: {
    invoke: () => Promise.resolve({ data: null, error: new Error("Supabase Edge Functions tidak dapat dipanggil tanpa URL.") }),
  },
  rpc: () => Promise.resolve({ data: null, error: new Error("RPC tidak tersedia.") }),
  channel: () => ({
    on: () => ({ subscribe: () => ({}) }),
    subscribe: () => ({})
  }),
  removeChannel: () => {}
};

// Export client asli atau dummy agar tidak throw "Cannot read properties of null"
export const supabase = client || dummyClient;

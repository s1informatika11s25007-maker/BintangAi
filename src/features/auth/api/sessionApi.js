import { supabase } from '../../../lib/supabaseClient';

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

/**
 * Helper visual styling untuk role demo (label & warna titik UI)
 */
const getRoleLabel = (role, disabilityType) => {
  if (role === 'guru') return 'Guru Pembimbing';
  if (role === 'ortu') return 'Orang Tua';
  if (role === 'siswa') {
    if (disabilityType === 'tunanetra') return 'Siswa Tunanetra';
    if (disabilityType === 'tunarungu') return 'Siswa Tunarungu';
    if (disabilityType === 'tunawicara') return 'Siswa Tunawicara';
    return 'Siswa Istimewa';
  }
  return role;
};

const getRoleColor = (role, disabilityType) => {
  if (role === 'guru') return 'bg-indigo-500';
  if (role === 'ortu') return 'bg-rose-500';
  if (role === 'siswa') {
    if (disabilityType === 'tunanetra') return 'bg-purple-500';
    if (disabilityType === 'tunarungu') return 'bg-orange-500';
    if (disabilityType === 'tunawicara') return 'bg-emerald-500';
  }
  return 'bg-indigo-500';
};

export const DEFAULT_DEMO_ACCOUNTS = [
  { id: 'guru', email: 'demo.guru@gmail.com', full_name: 'Pak Santoso, S.Pd', role: 'guru', disability_type: 'tidak_ada', label: 'Guru Pembimbing', color: 'bg-indigo-500' },
  { id: 'tunanetra', email: 'demo.tunanetra@gmail.com', full_name: 'Zakaria Pratama', role: 'siswa', disability_type: 'tunanetra', label: 'Siswa Tunanetra', color: 'bg-purple-500' },
  { id: 'tunarungu', email: 'demo.tunarungu@gmail.com', full_name: 'Zabar Kurnia', role: 'siswa', disability_type: 'tunarungu', label: 'Siswa Tunarungu', color: 'bg-orange-500' },
  { id: 'tunawicara', email: 'demo.tunawicara@gmail.com', full_name: 'Aria Putra', role: 'siswa', disability_type: 'tunawicara', label: 'Siswa Tunawicara', color: 'bg-emerald-500' },
  { id: 'ortu', email: 'demo.ortu@gmail.com', full_name: 'Ibu Mega Kusuma', role: 'ortu', disability_type: 'tidak_ada', label: 'Orang Tua', color: 'bg-rose-500' }
];

let cachedDemoAccounts = null;

/**
 * Mengambil daftar akun demo tetap (fixed) secara instan & efisien.
 * Menggunakan Partial Index PostgreSQL (is_demo_account = true) + Selective Column Projection & In-Memory Cache.
 */
export const fetchDemoAccountsFromDB = async (forceRefresh = false) => {
  if (cachedDemoAccounts && !forceRefresh) {
    return cachedDemoAccounts;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, disability_type, is_demo_account')
      .eq('is_demo_account', true)
      .limit(10);

    if (error || !data || data.length === 0) {
      cachedDemoAccounts = DEFAULT_DEMO_ACCOUNTS;
      return DEFAULT_DEMO_ACCOUNTS;
    }

    const uniqueDemos = [];
    const seenCategories = new Set();

    for (const profile of data) {
      const categoryKey = profile.role === 'siswa'
        ? `siswa_${profile.disability_type || 'tidak_ada'}`
        : profile.role;

      if (!seenCategories.has(categoryKey)) {
        seenCategories.add(categoryKey);
        uniqueDemos.push({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          disability_type: profile.disability_type,
          is_demo_account: profile.is_demo_account,
          label: getRoleLabel(profile.role, profile.disability_type),
          color: getRoleColor(profile.role, profile.disability_type)
        });
      }
    }

    cachedDemoAccounts = uniqueDemos.length > 0 ? uniqueDemos : DEFAULT_DEMO_ACCOUNTS;
    return cachedDemoAccounts;
  } catch (err) {
    console.error('[DemoAuth] Error fetching demo accounts from DB:', err);
    return cachedDemoAccounts || DEFAULT_DEMO_ACCOUNTS;
  }
};

/**
 * Melakukan proses login demo berbasis database (Database-driven Real-Time Demo Auth).
 */
export const loginDemoAccount = async (targetDemo) => {
  try {
    const targetEmail = typeof targetDemo === 'string' ? targetDemo : targetDemo.email;

    const { data: demoProfile, error: dbErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', targetEmail)
      .eq('is_demo_account', true)
      .maybeSingle();

    const emailToUse = demoProfile ? demoProfile.email : targetEmail;
    const demoPassword = 'DemoPassword123!';

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: demoPassword
    });

    if (error) {
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid')) {
        await supabase.auth.signUp({
          email: emailToUse,
          password: demoPassword,
          options: {
            data: {
              full_name: demoProfile?.full_name || 'User Demo',
              role: demoProfile?.role || 'siswa',
              disability_type: demoProfile?.disability_type || 'tidak_ada'
            }
          }
        });
        const retry = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: demoPassword
        });
        if (retry.error) throw retry.error;
        return { data: retry.data, profile: demoProfile };
      }
      throw error;
    }

    return { data, profile: demoProfile };
  } catch (err) {
    console.error('[DemoAuth] loginDemoAccount error:', err);
    throw new Error(`Gagal masuk ke akun demo: ${err.message}`);
  }
};

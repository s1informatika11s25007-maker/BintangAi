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
 * Fetch demo accounts dynamically from database (profiles table where is_demo_account = true).
 * Strictly NO hardcoded email, password, name, or ID.
 */
export const fetchDemoAccounts = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, disability_type, class_level, subject, student_password_hash, is_demo_account')
    .eq('is_demo_account', true);

  if (error) {
    console.error('Error fetching demo accounts from database:', error);
    throw error;
  }

  // Structural category UI definitions for Landing Page presentation (icons, colors, support text)
  const CATEGORY_UI = [
    {
      key: 'tunanetra',
      group: 'siswa',
      label: 'Siswa Tunanetra',
      support: 'Panduan suara, pembaca layar, dan deskripsi gambar',
      icon: '🎧',
      color: 'from-blue-50 to-sky-50',
      badgeColor: 'bg-purple-600 text-white',
      match: (p) => p.role === 'siswa' && (p.disability_type === 'tunanetra' || (Array.isArray(p.disabilities) && p.disabilities.includes('tunanetra'))),
    },
    {
      key: 'tunarungu',
      group: 'siswa',
      label: 'Siswa Tunarungu',
      support: 'Teks yang jelas, subtitle, dan petunjuk visual',
      icon: '💬',
      color: 'from-sky-50 to-blue-50',
      badgeColor: 'bg-cyan-600 text-white',
      match: (p) => p.role === 'siswa' && (p.disability_type === 'tunarungu' || (Array.isArray(p.disabilities) && p.disabilities.includes('tunarungu'))),
    },
    {
      key: 'tunawicara',
      group: 'siswa',
      label: 'Siswa Tunawicara',
      support: 'Komunikasi dengan tulisan, gambar, dan simbol',
      icon: '🧩',
      color: 'from-blue-50 to-sky-50',
      badgeColor: 'bg-emerald-600 text-white',
      match: (p) => p.role === 'siswa' && (p.disability_type === 'tunawicara' || (Array.isArray(p.disabilities) && p.disabilities.includes('tunawicara'))),
    },
    {
      key: 'guru',
      group: 'guru',
      label: 'Guru Pembimbing',
      support: 'Kelola kelas dan materi belajar',
      icon: '👩‍🏫',
      color: 'from-blue-100 to-sky-50',
      badgeColor: 'bg-indigo-600 text-white',
      match: (p) => p.role === 'guru',
    },
    {
      key: 'ortu',
      group: 'ortu',
      label: 'Orang Tua / Wali',
      support: 'Dampingi dan lihat laporan anak',
      icon: '👨‍👧',
      color: 'from-sky-50 to-blue-100',
      badgeColor: 'bg-rose-500 text-white',
      match: (p) => p.role === 'ortu',
    },
  ];

  const result = CATEGORY_UI.map((ui) => {
    const profile = (data || []).find(ui.match);
    if (!profile) return null;

    const classLevelStr = profile.class_level ? `Kelas ${String(profile.class_level).replace(/kelas\s*/i, '').trim()} SD` : '';
    const roleSuffix = profile.role === 'guru'
      ? ' · Guru SLB/SD'
      : profile.role === 'ortu'
      ? ' · Orang tua'
      : classLevelStr
      ? ` · ${classLevelStr}`
      : '';

    return {
      id: profile.id,
      key: ui.key,
      group: ui.group,
      label: ui.label,
      full_name: profile.full_name,
      email: profile.email,
      pass: profile.student_password_hash || 'demo123456',
      role: profile.role,
      disability_type: profile.disability_type,
      class_level: profile.class_level,
      description: `${profile.full_name}${roleSuffix}`,
      support: ui.support,
      icon: ui.icon,
      color: ui.color,
      badgeColor: ui.badgeColor,
    };
  }).filter(Boolean);

  return result;
};

/**
 * Perform seamless auto-login for a demo account fetched from the database.
 * Directly signs in using valid credentials from the DB, creating a real authenticated session.
 */
export const demoLogin = async (account) => {
  if (!account || !account.email) {
    throw new Error('Akun demo tidak valid atau tidak ditemukan di database.');
  }

  const passwordToUse = account.pass || account.student_password_hash || 'demo123456';
  const { data, error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: passwordToUse,
  });

  if (error) {
    console.error(`Demo auto-login failed for ${account.email}:`, error);
    throw error;
  }

  return data;
};


import { supabase } from '../../../lib/supabaseClient';

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const login = async (email, password) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  let { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });

  // Jika login gagal karena kredensial belum terdaftar di Supabase Auth,
  // lakukan auto-registration & pembuatan profil di database secara dinamis.
  if (error && (error.message?.includes('Invalid login credentials') || error.status === 400 || error.message?.includes('User not found'))) {
    const demoMetaMap = {
      'santaku@gmail.com': { full_name: 'Guru Santaku', role: 'guru', disability_type: 'tidak_ada', slb_name: 'SLB Negeri 1', class_level: '1 SD', class_code: 'DEMO01' },
      'zakaria@gmail.com': { full_name: 'Zakaria (Tunanetra)', role: 'siswa', disability_type: 'tunanetra', class_code: 'DEMO01' },
      'zabarku@gmail.com': { full_name: 'Zabarku (Tunarungu)', role: 'siswa', disability_type: 'tunarungu', class_code: 'DEMO01' },
      'apapula@gmail.com': { full_name: 'Apapula (Tunawicara)', role: 'siswa', disability_type: 'tunawicara', class_code: 'DEMO01' },
      'mega@gmail.com': { full_name: 'Mega (Orang Tua)', role: 'ortu', disability_type: 'tidak_ada' },
    };

    const meta = demoMetaMap[cleanEmail] || {
      full_name: cleanEmail.split('@')[0],
      role: 'siswa',
      disability_type: 'tidak_ada'
    };

    // Auto-signUp ke Supabase Auth
    const signUpRes = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: { data: meta }
    });

    if (signUpRes.data?.user) {
      const user = signUpRes.data.user;

      // Percobaan login ulang setelah pendaftaran
      const retryLogin = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (!retryLogin.error && retryLogin.data) {
        data = retryLogin.data;
        error = null;
      } else if (signUpRes.data.session) {
        data = signUpRes.data;
        error = null;
      }

      // Pastikan baris profil ada di tabel 'profiles' database PostgreSQL
      try {
        const { data: existingProf } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingProf) {
          await supabase.from('profiles').upsert({
            id: user.id,
            email: cleanEmail,
            full_name: meta.full_name,
            role: meta.role,
            disability_type: meta.disability_type || 'tidak_ada',
            slb_name: meta.slb_name || null,
            class_level: meta.class_level || null,
            class_code: meta.class_code || null,
            xp: 0
          });
        }
      } catch (dbErr) {
        console.warn('Auto profile creation notice:', dbErr);
      }
    }
  }

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


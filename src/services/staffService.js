import { supabase } from '../supabase/client';

export const ROLE_LABELS = {
  caregiver: 'Pengasuh / Perawat',
  supervisor: 'Supervisor Klinis',
  family: 'Wali Keluarga',
  admin_hr: 'Admin HR / Panti'
};

/**
 * Filter list of staff accounts to get exactly ONE demo account per role.
 * @param {Array} accounts
 * @returns {Array} Exactly 1 account for each role: ['caregiver', 'supervisor', 'family', 'admin_hr']
 */
export function filterOneAccountPerRole(accounts) {
  if (!Array.isArray(accounts) || accounts.length === 0) return [];

  const targetRoles = ['caregiver', 'supervisor', 'family', 'admin_hr'];
  const singleAccounts = [];

  targetRoles.forEach(role => {
    const match = accounts.find(a => a.role === role);
    if (match) {
      singleAccounts.push(match);
    }
  });

  return singleAccounts;
}

/**
 * Fetch staff profiles from Supabase database.
 */
export async function fetchStaffAccountsFromDatabase() {
  try {
    const { data: dbStaff, error } = await supabase.from('staff_profiles').select('*');
    if (!error && dbStaff && dbStaff.length > 0) {
      // Map database staff_profiles to full account object
      return dbStaff.map(dbItem => {
        return {
          id: dbItem.id,
          key: `acc_${dbItem.role}_${dbItem.id}`,
          name: dbItem.full_name || 'Staf SambungJaga',
          roleTitle: ROLE_LABELS[dbItem.role] || 'Staf Medis',
          role: dbItem.role,
          email: `${dbItem.role}@sambungjaga.id`,
          avatar: dbItem.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          competencies: dbItem.competencies || []
        };
      });
    }
  } catch (err) {
    console.error('Supabase error fetching staff accounts:', err);
  }

  return [];
}

/**
 * Fetch exactly ONE demo account per role from Supabase database
 */
export async function fetchDemoAccountsPerRole() {
  const allAccounts = await fetchStaffAccountsFromDatabase();
  return filterOneAccountPerRole(allAccounts);
}

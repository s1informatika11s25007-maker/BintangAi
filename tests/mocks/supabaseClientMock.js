// Vitest Mock for src/supabase/client.js
const mockChain = {
  select: () => mockChain,
  insert: () => Promise.resolve({ data: [], error: null }),
  update: () => mockChain,
  eq: () => Promise.resolve({ data: [], error: null }),
  order: () => Promise.resolve({ data: [], error: null }),
};

export const supabase = {
  from: () => mockChain,
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  },
};

export const isSupabaseConfigured = () => false;

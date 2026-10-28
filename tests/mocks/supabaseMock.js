// Vitest Mock for @supabase/supabase-js to bypass undici zlib decompress import
export const createClient = () => {
  const mockChain = {
    select: () => mockChain,
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => mockChain,
    eq: () => Promise.resolve({ data: [], error: null }),
    order: () => Promise.resolve({ data: [], error: null }),
  };

  return {
    from: () => mockChain,
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  };
};

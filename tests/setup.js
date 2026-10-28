import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase Client to prevent undici zlib/network binding errors in Vitest jsdom
vi.mock('../src/supabase/client.js', () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
    order: vi.fn().mockImplementation(() => Promise.resolve({ data: [], error: null })),
  };

  return {
    supabase: {
      from: vi.fn(() => mockChain),
      auth: {
        getUser: vi.fn().mockImplementation(() => Promise.resolve({ data: { user: null }, error: null })),
      },
    },
    isSupabaseConfigured: () => false,
  };
});

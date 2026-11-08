import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const isSupabaseConfigured = Boolean(
  supabaseUrl && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl) && supabaseAnonKey
);

const configError = new Error(
  'BintangAi belum terhubung ke Supabase. Atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di environment deployment.'
);

function unavailableQuery() {
  const query = {};
  const chainMethods = [
    'select', 'insert', 'upsert', 'update', 'delete', 'eq', 'neq', 'gt', 'gte',
    'lt', 'lte', 'like', 'ilike', 'is', 'in', 'contains', 'containedBy',
    'order', 'limit', 'range', 'not', 'or', 'filter', 'match', 'textSearch',
    'single', 'maybeSingle', 'csv', 'throwOnError', 'returns', 'overrideTypes'
  ];
  for (const method of chainMethods) query[method] = () => query;
  query.then = (resolve, reject) => Promise.resolve({ data: null, error: configError, count: null }).then(resolve, reject);
  query.catch = (reject) => Promise.resolve({ data: null, error: configError, count: null }).catch(reject);
  query.finally = (callback) => Promise.resolve({ data: null, error: configError, count: null }).finally(callback);
  return query;
}

function createUnavailableClient() {
  const failed = async () => ({ data: null, error: configError });
  return {
    from: () => unavailableQuery(),
    rpc: failed,
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: failed,
      signUp: failed,
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: failed,
      updateUser: failed,
    },
    functions: { invoke: failed },
    storage: {
      from: () => ({
        upload: failed,
        remove: failed,
        createSignedUrl: failed,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe() {} }) }), subscribe: () => ({ unsubscribe() {} }) }),
    removeChannel() {},
  };
}

const client = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'bintangai-supabase-token',
      },
      global: { headers: { 'X-Client-Info': 'bintangai-web' } },
    })
  : createUnavailableClient();

export const supabase = client;
export const assertSupabaseConfigured = () => {
  if (!isSupabaseConfigured) throw configError;
};

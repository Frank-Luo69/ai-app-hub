import { createClient } from '@supabase/supabase-js';

export function getAccessTokenFromRequest(req: Request): string | null {
  const h = req.headers.get('authorization') || req.headers.get('Authorization');
  if (h && /^Bearer\s+/i.test(h)) return h.replace(/^Bearer\s+/i, '').trim();
  // 允许前端通过自定义头传递
  const h2 = req.headers.get('x-supabase-auth');
  if (h2) return h2.trim();
  return null;
}

function createMockServerSupabase() {
  const noop = () => {};
  return {
    from() {
      const chain = {
        select: () => chain,
        eq: () => chain,
        single: () => Promise.reject(new Error('not found (mock)')),
        update: () => Promise.resolve({ data: null, error: { message: 'unauthenticated (mock)' } }),
        delete: () => Promise.resolve({ error: { message: 'unauthenticated (mock)' } }),
      } as any;
      return chain;
    },
    rpc: async () => ({ data: false, error: null }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  } as any;
}

export function createSupabaseForRequest(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = getAccessTokenFromRequest(req);
  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabase: createMockServerSupabase(), token };
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });
  return { supabase, token };
}

export async function getAuthUser(req: Request) {
  const { supabase } = createSupabaseForRequest(req);
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

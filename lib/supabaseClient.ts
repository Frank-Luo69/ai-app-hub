
'use client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createMockSupabase() {
	const noop = () => {};
	return {
		from(table: string) {
			const state: any = { table, filter: {} };
			const chain: any = {
				select: () => chain,
				eq: (k: string, v: any) => { state.filter[k] = v; return chain; },
				order: () => Promise.resolve({ data: [], error: null }),
				single: () => {
					if (state.table === 'apps' && state.filter.slug === 'e2e-demo') {
						return Promise.resolve({
							data: {
								id: 'e2e-app-1',
								title: 'E2E Demo App',
								slug: 'e2e-demo',
								description: 'Mock app for e2e without backend',
								cover_url: null,
								play_url: 'https://example.com',
								source_host: 'example.com',
								tags: ['demo'],
								status: 'active',
								owner_id: 'owner-1',
								created_at: new Date().toISOString(),
							},
							error: null,
						});
					}
					return Promise.resolve({ data: null, error: { message: 'not found (mock)' } });
				},
				insert: () => Promise.resolve({ data: null, error: { message: 'unauthenticated (mock)' } }),
				update: () => Promise.resolve({ data: null, error: { message: 'unauthenticated (mock)' } }),
				delete: () => Promise.resolve({ error: { message: 'unauthenticated (mock)' } }),
			};
			return chain;
		},
		rpc: async () => ({ data: false, error: null }),
		auth: {
			getUser: async () => ({ data: { user: null }, error: null }),
			getSession: async () => ({ data: { session: null }, error: null }),
			onAuthStateChange: (_: any, cb: any) => ({ subscription: { unsubscribe: noop } }),
			signOut: async () => ({ error: null }),
		},
		channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
		removeChannel: noop,
	} as any;
}

export const supabase = (supabaseUrl && supabaseAnonKey)
	? createClient(supabaseUrl, supabaseAnonKey)
	: createMockSupabase();

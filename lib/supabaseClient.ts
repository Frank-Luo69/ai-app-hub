
'use client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createMockSupabase() {
	const noop = () => {};
	return {
		from() {
			const chain = {
				select: () => chain,
				eq: () => chain,
				order: () => Promise.resolve({ data: [], error: null }),
				single: () => Promise.resolve({ data: null, error: { message: 'not found (mock)' } }),
				insert: () => Promise.resolve({ data: null, error: { message: 'unauthenticated (mock)' } }),
				update: () => Promise.resolve({ data: null, error: { message: 'unauthenticated (mock)' } }),
				delete: () => Promise.resolve({ error: { message: 'unauthenticated (mock)' } }),
			} as any;
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

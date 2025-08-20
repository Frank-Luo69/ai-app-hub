import { LocalStorageAdapter } from './local';
import { SupabaseStorageAdapter } from './supabase';
import type { StorageAdapter } from './adapter';

export function getStorageAdapter(): StorageAdapter {
  const hasSb = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    return hasSb ? new SupabaseStorageAdapter() : new LocalStorageAdapter();
  } catch {
    return new LocalStorageAdapter();
  }
}

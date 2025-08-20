import { createClient } from '@supabase/supabase-js';
import type { StorageAdapter, PutResult } from './adapter';

export class SupabaseStorageAdapter implements StorageAdapter {
  private url: string;
  private serviceKey: string;
  private bucket: string;
  constructor() {
    this.url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    this.serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET_COVERS || 'covers';
    if (!this.url || !this.serviceKey) throw new Error('Supabase Storage requires URL and SERVICE_ROLE key');
  }
  private client() { return createClient(this.url, this.serviceKey); }
  async put(opts: { key?: string; data: Buffer; contentType: string }): Promise<PutResult> {
    const key = opts.key || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { data, error } = await this.client().storage.from(this.bucket).upload(key, opts.data, { contentType: opts.contentType, upsert: true });
    if (error) throw error;
    const { data: pub } = this.client().storage.from(this.bucket).getPublicUrl(data.path);
    return { url: pub.publicUrl, key: data.path, contentType: opts.contentType, size: opts.data.length };
  }
  async delete(keyOrUrl: string): Promise<void> {
    const key = keyOrUrl.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/[^/]+\//, '');
    await this.client().storage.from(this.bucket).remove([key]);
  }
}

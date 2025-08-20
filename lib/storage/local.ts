import { promises as fs } from 'fs';
import path from 'path';
import type { StorageAdapter, PutResult } from './adapter';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

async function ensureDir() {
  await fs.mkdir(uploadsDir, { recursive: true });
}

export class LocalStorageAdapter implements StorageAdapter {
  async put(opts: { key?: string; data: Buffer; contentType: string }): Promise<PutResult> {
    await ensureDir();
    const ext = contentTypeToExt(opts.contentType) || 'bin';
    const key = opts.key || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = path.join(uploadsDir, key);
    await fs.writeFile(filePath, opts.data);
    return { url: `/uploads/${key}`, key, contentType: opts.contentType, size: opts.data.length };
  }
  async delete(keyOrUrl: string): Promise<void> {
    try {
      const key = keyOrUrl.replace(/^\/?uploads\//, '').replace(/^https?:\/\/[^/]+\//, '');
      const filePath = path.join(uploadsDir, key);
      await fs.unlink(filePath);
    } catch {}
  }
}

function contentTypeToExt(ct: string) {
  if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpg';
  if (ct.includes('png')) return 'png';
  if (ct.includes('webp')) return 'webp';
  return '';
}

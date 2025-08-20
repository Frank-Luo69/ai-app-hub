import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStorageAdapter } from '@/lib/storage';

export const runtime = 'nodejs';

const allowed = ['image/jpeg', 'image/png', 'image/webp'];
const maxSize = 2 * 1024 * 1024; // 2MB

const metaSchema = z.object({ oldUrl: z.string().url().optional() });

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const oldUrl = form.get('oldUrl');
    if (!(file instanceof File)) return NextResponse.json({ error: 'file required' }, { status: 400 });
    const ct = file.type;
    const size = file.size;
    if (!allowed.includes(ct)) return NextResponse.json({ error: '仅支持 jpg/png/webp' }, { status: 400 });
    if (size > maxSize) return NextResponse.json({ error: '图片大小不能超过 2MB' }, { status: 400 });
    if (oldUrl && typeof oldUrl === 'string') metaSchema.parse({ oldUrl });

    const buf = Buffer.from(await file.arrayBuffer());
    const adapter = getStorageAdapter();
    if (oldUrl && typeof oldUrl === 'string') {
      await adapter.delete(oldUrl);
    }
    const res = await adapter.put({ data: buf, contentType: ct });
    return NextResponse.json({ ok: true, url: res.url, key: res.key });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'upload failed' }, { status: 400 });
  }
}


import { NextResponse } from 'next/server';

async function tryFetch(url: string, method: 'HEAD'|'GET', timeoutMs = 6000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method, redirect: 'follow', signal: controller.signal });
    clearTimeout(t);
    return res;
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') return NextResponse.json({ ok: false, error: 'Invalid URL' }, { status: 400 });
    try { new URL(url); } catch { return NextResponse.json({ ok: false, error: 'URL 格式不正确' }, { status: 400 }); }
    let res: Response | null = null;
    try { res = await tryFetch(url, 'HEAD'); }
    catch { try { res = await tryFetch(url, 'GET'); } catch {} }
    const status = res?.status ?? 0;
    const ok = !!res && status >= 200 && status < 400;
    return NextResponse.json({ ok, status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseForRequest, getAuthUser } from '@/lib/serverSupabase';
import { rateLimit } from '@/lib/rateLimit';

const schema = z.object({
  app_id: z.string().uuid(),
  content: z.string().trim().min(1).max(2000),
});

export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const key = `cmt:${user.id}`;
    if (!rateLimit(key, 5, 60_000)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    const { supabase } = createSupabaseForRequest(req);
    const { data, error } = await (supabase as any)
      .from('comments')
      .insert({ app_id: parsed.data.app_id, content: parsed.data.content })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, comment: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'error' }, { status: 500 });
  }
}

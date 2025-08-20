import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseForRequest, getAuthUser } from '@/lib/serverSupabase';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().max(5000).optional(),
  play_url: z.string().url().optional(),
  cover_url: z.string().url().nullable().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
});

async function getAppById(supabase: any, id: string) {
  const { data, error } = await supabase.from('apps').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

function forbidden(msg = 'Forbidden') { return NextResponse.json({ error: msg }, { status: 403 }); }
function bad(msg = 'Bad Request') { return NextResponse.json({ error: msg }, { status: 400 }); }

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const { supabase } = createSupabaseForRequest(_req);
  try {
    const app = await getAppById(supabase, params.id);
    return NextResponse.json(app);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'not found' }, { status: 404 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string }}) {
  const user = await getAuthUser(req);
  if (!user) return forbidden('请先登录');
  const { supabase } = createSupabaseForRequest(req);
  const app = await getAppById(supabase, params.id).catch(() => null);
  if (!app) return NextResponse.json({ error: 'not found' }, { status: 404 });

  // 只有作者或管理员可修改
  const { data: isAdminRes } = await supabase.rpc('is_admin', { uid: user.id });
  const isAdmin = !!isAdminRes;
  if (app.owner_id !== user.id && !isAdmin) return forbidden();

  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return bad(parsed.error.issues.map((i: any) => i.message).join(', '));

  const updates = parsed.data;
  const { data, error } = await supabase.from('apps').update(updates).eq('id', app.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: { params: { id: string }}) {
  const user = await getAuthUser(req);
  if (!user) return forbidden('请先登录');
  const { supabase } = createSupabaseForRequest(req);
  const app = await getAppById(supabase, params.id).catch(() => null);
  if (!app) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { data: isAdminRes } = await supabase.rpc('is_admin', { uid: user.id });
  const isAdmin = !!isAdminRes;
  if (app.owner_id !== user.id && !isAdmin) return forbidden();

  const { error } = await supabase.from('apps').delete().eq('id', app.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

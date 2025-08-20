import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseForRequest, getAuthUser } from '@/lib/serverSupabase';

const paramSchema = z.object({ id: z.string().uuid() });

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const p = paramSchema.safeParse(params);
  if (!p.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { supabase } = createSupabaseForRequest(req);
  const { error } = await (supabase as any).from('comments').delete().eq('id', p.data.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ ok: true });
}

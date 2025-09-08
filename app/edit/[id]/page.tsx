"use client";
import { useEffect, useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { parseTags } from '@/lib/tags';

export default function EditPage({ params }: { params: { id: string } }) {
  const { t } = useI18n();
  const [app, setApp] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (supabase as any)
      .from('apps')
      .select('*')
      .eq('id', params.id)
      .single()
      .then((r: any) => setApp(r.data));
  }, [params.id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!app) return;
    setBusy(true); setMsg(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = (sessionData as any)?.session?.access_token;
      const res = await fetch(`/api/apps/${app.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          title: app.title,
          description: app.description,
          cover_url: app.cover_url,
          play_url: app.play_url,
          tags: app.tags,
          status: app.status,
        })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || '更新失败');
      }
      setMsg('已保存');
    } catch (e: any) {
      setMsg(e.message || '保存失败');
    } finally {
      setBusy(false);
    }
  }

  if (!app) return <div>加载中…</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">{t('edit')}</h1>
      <form onSubmit={onSubmit} className="space-y-3 card">
        <input className="w-full border rounded-xl px-3 py-2" value={app.title || ''} onChange={e => setApp({ ...app, title: e.target.value })} placeholder="标题" required />
        <textarea className="w-full border rounded-xl px-3 py-2" rows={4} value={app.description || ''} onChange={e => setApp({ ...app, description: e.target.value })} placeholder="简介" />
        <input className="w-full border rounded-xl px-3 py-2" value={app.play_url || ''} onChange={e => setApp({ ...app, play_url: e.target.value })} placeholder="链接" required />
        <input className="w-full border rounded-xl px-3 py-2" value={app.cover_url || ''} onChange={e => setApp({ ...app, cover_url: e.target.value })} placeholder="封面图链接" />
  <input className="w-full border rounded-xl px-3 py-2" value={(app.tags || []).join(', ')} onChange={e => setApp({ ...app, tags: parseTags(e.target.value) })} placeholder="标签（逗号分隔）" />
        <div className="flex items-center gap-3">
          <label className="text-sm">状态</label>
          <select className="border rounded-xl px-2 py-1" value={app.status || 'active'} onChange={e => setApp({ ...app, status: e.target.value })}>
            <option value="active">active</option>
            <option value="draft">draft</option>
          </select>
        </div>
        <button className="btn-primary px-4 py-2 rounded-xl disabled:opacity-50" disabled={busy}>{t('edit')}</button>
        {msg && <div className="text-sm text-gray-600">{msg}</div>}
      </form>
    </div>
  );
}


'use client';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import slugify from 'slugify';

async function checkUrl(url: string) {
  const res = await fetch('/api/check-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export default function SubmitPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, []);

  const [form, setForm] = useState({ title: '', description: '', play_url: '', cover_url: '', tags: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userEmail) { setMsg('请先登录'); return; }
    setMsg(null); setBusy(true);
    try {
      const urlOk = await checkUrl(form.play_url);
      if (!urlOk.ok) {
        setMsg(`链接无法访问（状态: ${urlOk.status ?? '未知'}）。`);
        setBusy(false);
        return;
      }
      // Use "app" as the fallback slug prefix instead of "game"
      let base = slugify(form.title || 'app', { lower: true, strict: true }) || 'app';
      const suffix = Math.random().toString(36).slice(2, 8);
      const slug = `${base}-${suffix}`;

      const { data, error } = await supabase.from('apps').insert({
        title: form.title.trim(),
        slug,
        description: form.description.trim(),
        cover_url: form.cover_url.trim() || null,
        play_url: form.play_url.trim(),
        source_host: (() => { try { return new URL(form.play_url).host } catch { return null } })(),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        status: 'active'
      }).select().single();

      if (error) throw error;
      window.location.href = `/g/${data.slug}`;
    } catch (err: any) {
      setMsg(err.message || '提交失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">提交应用</h1>
      {!userEmail && <div className="mb-4 text-sm text-gray-600">发帖/提交需要登录。请先点击右上角「登录」。</div>}
      <form onSubmit={onSubmit} className="space-y-3 card">
        <input className="w-full border rounded-xl px-3 py-2" placeholder="标题" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        <textarea className="w-full border rounded-xl px-3 py-2" placeholder="简介" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="应用链接（将新开页跳转）"
          value={form.play_url}
          onChange={(e) => setForm({ ...form, play_url: e.target.value })}
          required
        />
        <input className="w-full border rounded-xl px-3 py-2" placeholder="封面图链接（可选）" value={form.cover_url} onChange={e => setForm({ ...form, cover_url: e.target.value })} />
        <input className="w-full border rounded-xl px-3 py-2" placeholder="标签（逗号分隔）" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        <button className="btn-primary px-4 py-2 rounded-xl disabled:opacity-50" disabled={busy}>提交</button>
        {msg && <div className="text-sm text-red-600">{msg}</div>}
      </form>
    </div>
  );
}

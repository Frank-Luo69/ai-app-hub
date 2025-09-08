
'use client';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import slugify from 'slugify';
import { useI18n } from '@/lib/i18n';
import { z } from 'zod';
import { parseTags } from '@/lib/tags';

const SubmitSchema = z.object({
  title: z.string().min(1, '标题必填'),
  description: z.string().max(2000).optional().or(z.literal('')),
  play_url: z.string().url('请输入有效链接'),
  cover_url: z.string().url('封面链接需为 URL').optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
});

async function checkUrl(url: string) {
  const res = await fetch('/api/check-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export default function SubmitPage() {
  const { t } = useI18n();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then((res: any) => setUserEmail(res.data?.user?.email ?? null));
  }, []);

  const [form, setForm] = useState({ title: '', description: '', play_url: '', cover_url: '', tags: '' });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!userEmail) { setMsg(t('login')); return; }
    setMsg(null); setBusy(true);
    try {
      // client-side validation
      setErrors({});
      const parsed = SubmitSchema.safeParse(form);
      if (!parsed.success) {
        const e: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const k = issue.path[0] as string;
          e[k] = issue.message;
        }
        setErrors(e);
        setBusy(false);
        return;
      }
      const urlOk = await checkUrl(form.play_url);
      if (!urlOk.ok) {
        setMsg(`链接无法访问（状态: ${urlOk.status ?? '未知'}）。`);
        setBusy(false);
        return;
      }
      // 如果选择了文件，先上传
      if (file) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes((file as File).type)) { setMsg('仅支持 jpg/png/webp'); setBusy(false); return; }
        if ((file as File).size > 2 * 1024 * 1024) { setMsg('图片大小不能超过 2MB'); setBusy(false); return; }
        const fd = new FormData();
        fd.append('file', file as File);
        if (form.cover_url) fd.append('oldUrl', form.cover_url);
        const up = await fetch('/api/upload', { method: 'POST', body: fd }).then(r => r.json());
        if (!up.ok) { setMsg(up.error || '上传失败'); setBusy(false); return; }
        setForm((s) => ({ ...s, cover_url: up.url }));
      }

      // Use "app" as the fallback slug prefix instead of "game"
      let base = slugify(form.title || 'app', { lower: true, strict: true }) || 'app';
      const suffix = Math.random().toString(36).slice(2, 8);
      const slug = `${base}-${suffix}`;

      const { data: sessionData } = await supabase.auth.getSession();
      const ownerId = sessionData.session?.user?.id;
      const { data, error } = await supabase.from('apps').insert({
        title: form.title.trim(),
        slug,
        description: form.description.trim(),
        cover_url: form.cover_url.trim() || null,
        play_url: form.play_url.trim(),
        source_host: (() => { try { return new URL(form.play_url).host } catch { return null } })(),
  tags: parseTags(form.tags),
        status: 'active',
        owner_id: ownerId,
        owner_email: userEmail,
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
  <h1 className="text-xl font-semibold mb-4">{t('submit')}</h1>
  {!userEmail && <div className="mb-4 text-sm text-gray-600">发帖/提交需要登录。请先点击右上角「登录」。</div>}
      <form onSubmit={onSubmit} className="space-y-3 card">
        <input className="w-full border rounded-xl px-3 py-2" placeholder="标题" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        {errors.title && <div className="text-xs text-red-600">{errors.title}</div>}
        <textarea className="w-full border rounded-xl px-3 py-2" placeholder="简介" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        {errors.description && <div className="text-xs text-red-600">{errors.description}</div>}
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="应用链接（将新开页跳转）"
          value={form.play_url}
          onChange={(e) => setForm({ ...form, play_url: e.target.value })}
          required
        />
        {errors.play_url && <div className="text-xs text-red-600">{errors.play_url}</div>}
        <div className="space-y-2">
          <input className="w-full border rounded-xl px-3 py-2" placeholder="封面图链接（可选）" value={form.cover_url} onChange={e => setForm({ ...form, cover_url: e.target.value })} />
          {errors.cover_url && <div className="text-xs text-red-600">{errors.cover_url}</div>}
          <div className="flex items-center gap-3">
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {form.cover_url && <img src={form.cover_url} alt="cover" className="w-24 h-16 object-cover rounded border" />}
          </div>
        </div>
        <input className="w-full border rounded-xl px-3 py-2" placeholder="标签（逗号分隔）" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        {errors.tags && <div className="text-xs text-red-600">{errors.tags}</div>}
  <button className="btn-primary px-4 py-2 rounded-xl disabled:opacity-50" disabled={busy}>{t('submit')}</button>
        {msg && <div className="text-sm text-red-600">{msg}</div>}
      </form>
    </div>
  );
}

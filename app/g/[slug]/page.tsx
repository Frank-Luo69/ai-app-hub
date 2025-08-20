
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

function hostFrom(url: string) { try { return new URL(url).host; } catch { return ''; } }

export default function AppDetail({ params }: { params: { slug: string }}) {
  // Renamed from game to app to reflect the new app-centric model
  const [app, setApp] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    // Fetch the app record by slug and all comments (filtered by the presence of an app_id)
    (supabase as any)
      .from('apps')
      .select('*')
      .eq('slug', params.slug)
      .single()
      .then((r: any) => setApp(r.data));
    (supabase as any)
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
      .then((r: any) => setComments(((r.data || []) as any[]).filter((c: any) => c.app_id)));
    (supabase as any).auth
      .getUser()
      .then(async (r: any) => {
        const u = r.data.user;
        setUserEmail(u?.email ?? null);
        setUserId(u?.id ?? null);
        if (u?.id) {
          const { data: adm } = await supabase.rpc('is_admin', { uid: u.id });
          setIsAdmin(!!adm);
        }
      });
  }, [params.slug]);

  useEffect(() => {
    if (!app) return;
    const channel = (supabase as any)
      .channel('comments-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `app_id=eq.${app.id}` },
        (payload: any) => setComments((prev: any[]) => [payload.new, ...prev])
      )
      .subscribe();
    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, [app]);

  async function postComment() {
    if (!userEmail) return alert('请先登录');
    if (!content.trim()) return;
    const { error } = await supabase
      .from('comments')
      .insert({ app_id: app!.id, content: content.trim() });
    if (error) alert(error.message);
    else setContent('');
  }

  async function deleteApp() {
    if (!app) return;
    if (!confirm('确认删除该应用？此操作不可恢复')) return;
    // 将 Supabase access token 传给 API 用于鉴权
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    const res = await fetch(`/api/apps/${app.id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error || '删除失败');
      return;
    }
    window.location.href = '/';
  }

  if (!app) return <div>加载中…</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="card">
          {app.cover_url && (
            <img
              src={app.cover_url}
              alt={app.title}
              className="w-full h-64 object-cover rounded-xl border"
            />
          )}
          <h1 className="text-2xl font-semibold mt-4">{app.title}</h1>
          <p className="text-gray-600 mt-2 whitespace-pre-wrap">{app.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(app.tags || []).map((t: string) => (
              <span key={t} className="badge">
                {t}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">来源域名：{hostFrom(app.play_url)}</div>
            <a
              href={app.play_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-4 py-2 rounded-xl"
            >
              去玩
            </a>
          </div>
          {(userId && (app.owner_id === userId || isAdmin)) && (
            <div className="mt-3 flex gap-3">
              {/* 预留编辑：后续实现 /edit 页面 */}
              <button className="btn" onClick={deleteApp}>删除</button>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">讨论区</h2>
          <div className="flex gap-2 mb-3">
            <input className="flex-1 border rounded-xl px-3 py-2" placeholder={userEmail ? '写点什么…' : '登录后才能发言'} value={content} onChange={e => setContent(e.target.value)} disabled={!userEmail} />
            <button className="btn" onClick={postComment} disabled={!userEmail || !content.trim()}>发送</button>
          </div>
          <div className="space-y-3">
            {comments
              .filter((c) => c.app_id === app.id && !c.is_deleted)
              .map((c) => (
                <div key={c.id} className="border rounded-xl p-3">
                  <div className="text-sm text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
                  <div className="mt-1 whitespace-pre-wrap">{c.content}</div>
                </div>
              ))}
            {comments.filter((c) => c.app_id === app.id).length === 0 && (
              <div className="text-sm text-gray-500">还没有评论，来占个沙发～</div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <h3 className="font-semibold">安全提示</h3>
          <p className="text-sm text-gray-600 mt-1">本平台仅收录外链，点击「去玩」将打开第三方站点。请注意甄别内容与版权。</p>
        </div>
      </div>
    </div>
  );
}

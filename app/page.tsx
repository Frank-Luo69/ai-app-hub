
'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AppCard from '@/components/GameCard';
import { useI18n } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useI18n();
  // Rename state and setter to reflect "apps" instead of "games"
  const [apps, setApps] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  useEffect(() => {
    // Fetch all apps from the "apps" table, ordered by creation time descending
    supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: false })
  .then((res: any) => {
        setApps((res as any).data || []);
      });
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    (apps || []).forEach((a: any) => (a.tags || []).forEach((t: string) => set.add(t)));
    return Array.from(set).sort();
  }, [apps]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return apps;
    return apps.filter((a) =>
      (a.title || '').toLowerCase().includes(kw) ||
      (a.description || '').toLowerCase().includes(kw)
    );
  }, [apps, q]);

  const filteredByTag = useMemo(() => {
    if (!tag) return filtered;
    return filtered.filter((a) => (a.tags || []).includes(tag));
  }, [filtered, tag]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredByTag.slice(start, start + pageSize);
  }, [filteredByTag, page]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder={t('searchPlaceholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap text-sm">
        <button className={`badge ${tag === '' ? 'bg-black text-white' : ''}`} onClick={() => { setTag(''); setPage(1); }}>{t('filterAll')}</button>
        {allTags.map((tname) => (
          <button key={tname} className={`badge ${tag === tname ? 'bg-black text-white' : ''}`} onClick={() => { setTag(tname); setPage(1); }}>{tname}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paged.map((a) => (
          <AppCard key={a.id} app={a} />
        ))}
      </div>
      {filteredByTag.length === 0 && (
        <div className="text-center text-gray-500">{t('noApps')}</div>
      )}
      {filteredByTag.length > pageSize && (
        <div className="flex items-center justify-center gap-3">
          <button className="btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>{t('prev')}</button>
          <span className="text-sm text-gray-600">{page}</span>
          <button className="btn" disabled={page * pageSize >= filteredByTag.length} onClick={() => setPage((p) => p + 1)}>{t('next')}</button>
        </div>
      )}
    </div>
  );
}

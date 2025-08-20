
'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
// Import the default exported AppCard component.  Even though the file name hasn't changed,
// the component now exposes an app-centric card instead of a game-centric one.
import AppCard from '@/components/GameCard';

export default function HomePage() {
  // Rename state and setter to reflect "apps" instead of "games"
  const [apps, setApps] = useState<any[]>([]);
  const [q, setQ] = useState('');
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

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return apps;
    return apps.filter((a) =>
      (a.title || '').toLowerCase().includes(kw) ||
      (a.description || '').toLowerCase().includes(kw)
    );
  }, [apps, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="搜索应用标题或简介…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a) => (
          <AppCard key={a.id} app={a} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center text-gray-500">暂无应用，去「提交应用」发布一个吧～</div>
      )}
    </div>
  );
}

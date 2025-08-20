"use client";
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AppCard from '@/components/GameCard';
import { useI18n } from '@/lib/i18n';

export default function MyAppsPage() {
  const { t } = useI18n();
  const [apps, setApps] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = (data as any)?.user?.id || null;
      setUserId(uid);
      if (!uid) { setApps([]); return; }
      const { data: rows } = await (supabase as any)
        .from('apps')
        .select('*')
        .eq('owner_id', uid)
        .order('created_at', { ascending: false });
      setApps(rows || []);
    })();
  }, []);

  const count = useMemo(() => apps.length, [apps]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('myApps')}</h1>
        {!userId && <div className="text-sm text-gray-600">{t('login')}</div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((a) => <AppCard key={a.id} app={a} />)}
      </div>
      {count === 0 && (
        <div className="text-sm text-gray-500">{t('noApps')}</div>
      )}
    </div>
  );
}

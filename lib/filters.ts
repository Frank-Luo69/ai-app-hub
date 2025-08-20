export type AppRow = {
  id: string;
  title: string;
  description?: string | null;
  tags?: string[] | null;
};

export function filterByQuery(apps: AppRow[], q: string) {
  const kw = (q || '').trim().toLowerCase();
  if (!kw) return apps;
  return apps.filter((a) =>
    (a.title || '').toLowerCase().includes(kw) ||
    ((a.description || '').toLowerCase().includes(kw))
  );
}

export function filterByTag(apps: AppRow[], tag: string) {
  if (!tag) return apps;
  return apps.filter((a) => (a.tags || []).includes(tag));
}

export function paginate<T>(rows: T[], page: number, pageSize: number) {
  const p = Math.max(1, page || 1);
  const start = (p - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

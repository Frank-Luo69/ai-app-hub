type Key = string;
const hits = new Map<Key, number[]>();

export function rateLimit(key: Key, max: number, windowMs: number) {
  const now = Date.now();
  const cutoff = now - windowMs;
  const arr = hits.get(key) || [];
  const recent = arr.filter((t) => t > cutoff);
  if (recent.length >= max) return false;
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function resetRateLimit(key?: Key) {
  if (key) hits.delete(key);
  else hits.clear();
}

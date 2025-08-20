
import Link from 'next/link';

/**
 * Extract the host part from a URL string.
 * When the URL cannot be parsed, an empty string is returned.
 */
export function hostFrom(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

/**
 * Card component used to display an individual app entry.
 * It was formerly named GameCard, but the app platform uses "app" semantics.
 */
export default function AppCard({ app }: { app: any }) {
  return (
    <div className="card">
      <div className="flex gap-4">
        {app.cover_url ? (
          <img
            src={app.cover_url}
            alt={app.title}
            className="w-32 h-24 object-cover rounded-xl border"
          />
        ) : (
          <div className="w-32 h-24 rounded-xl bg-gray-100 border flex items-center justify-center text-gray-400">
            No Cover
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link href={`/g/${app.slug}`} className="font-semibold hover:underline">
              {app.title}
            </Link>
            <span className="text-xs text-gray-500">{hostFrom(app.play_url)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{app.description}</p>
          <div className="mt-2">
            {(app.tags || []).map((t: string) => (
              <span key={t} className="badge">
                {t}
              </span>
            ))}
          </div>
          {app.status && (
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded border ${app.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                {app.status}
              </span>
            </div>
          )}
          {/* 预留：当当前用户为作者或管理员时显示编辑入口（后续移动到服务端渲染可减少闪烁） */}
        </div>
      </div>
    </div>
  );
}

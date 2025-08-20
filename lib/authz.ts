export function canManageApp(opts: { userId?: string | null; ownerId?: string | null; isAdmin?: boolean }) {
  const { userId, ownerId, isAdmin } = opts;
  if (!userId) return false;
  if (isAdmin) return true;
  return !!ownerId && ownerId === userId;
}

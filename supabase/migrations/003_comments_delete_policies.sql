-- Allow deleting comments by author, app owner, or admin
create policy if not exists "comments_delete_author" on public.comments
  for delete using (author_id = auth.uid());
create policy if not exists "comments_delete_app_owner" on public.comments
  for delete using (exists(select 1 from public.apps a where a.id = comments.app_id and a.owner_id = auth.uid()));
create policy if not exists "comments_delete_admin" on public.comments
  for delete using (public.is_admin(auth.uid()));

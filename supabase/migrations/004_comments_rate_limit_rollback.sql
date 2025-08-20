-- Rollback for 004: restore previous insert policy and drop function
create policy if not exists "comments_insert_auth" on public.comments for insert with check (auth.uid() is not null);
drop function if exists public.can_post_comment(int, int);

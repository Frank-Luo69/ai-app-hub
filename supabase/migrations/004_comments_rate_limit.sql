-- Rate limit support for comments
create or replace function public.can_post_comment(win_seconds int, max_count int)
returns boolean language sql volatile as $$
  select (
    select count(*) from public.comments c
    where c.author_id = auth.uid()
      and c.created_at > now() - make_interval(secs => win_seconds)
  ) < max_count;
$$;

-- Update insert policy to enforce rate limit (60s, 5 per user)
drop policy if exists "comments_insert_auth" on public.comments;
create policy "comments_insert_auth" on public.comments for insert
  with check (auth.uid() is not null and public.can_post_comment(60, 5));

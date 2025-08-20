
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_url text,
  play_url text not null,
  source_host text,
  tags text[] default '{}',
  status text not null default 'active',
  -- 所有者：默认当前登录用户
  owner_id uuid references auth.users(id) default auth.uid(),
  created_at timestamptz default now()
);
alter table public.apps enable row level security;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.apps(id) on delete cascade,
  author_id uuid default auth.uid(),
  content text not null,
  created_at timestamptz default now(),
  is_deleted boolean default false
);
alter table public.comments enable row level security;

create policy if not exists "apps_select_public" on public.apps for select using (true);
create policy if not exists "comments_select_public" on public.comments for select using (true);

-- 插入：必须登录且 owner_id=auth.uid()（允许使用列默认值）
create policy if not exists "apps_insert_auth" on public.apps for insert with check (auth.uid() is not null and owner_id = auth.uid());
create policy if not exists "comments_insert_auth" on public.comments for insert with check (auth.uid() is not null);

-- 管理员表与函数（用于权限判定）
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id)
);

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists(select 1 from public.admins a where a.user_id = uid);
$$;

-- 更新/删除策略：作者本人或管理员
create policy if not exists "apps_update_owner" on public.apps
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy if not exists "apps_update_admin" on public.apps
  for update using (public.is_admin(auth.uid())) with check (true);

create policy if not exists "apps_delete_owner" on public.apps
  for delete using (owner_id = auth.uid());
create policy if not exists "apps_delete_admin" on public.apps
  for delete using (public.is_admin(auth.uid()));

-- 索引：owner_id、slug 已有唯一约束
create index if not exists idx_apps_owner on public.apps(owner_id);

-- 001_ownership_auth.sql
-- 目的：为 apps 增加所有权字段 owner_id、RLS 策略、管理员表/函数，并迁移旧 submitter_id 数据。

begin;

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- 1) 模式调整：增加 owner_id（允许为空，后续回填并设默认）
alter table public.apps add column if not exists owner_id uuid references auth.users(id);

-- 2) 将 submitter_id 迁移到 owner_id（如果存在）
do $$
begin
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='apps' and column_name='submitter_id') then
    update public.apps set owner_id = coalesce(owner_id, submitter_id);
  end if;
end $$;

-- 3) 将空 owner_id 的行设为匿名（不可编辑），这里允许为空，但后续策略仅允许作者或管理员修改
-- 可选：不强制 not null，以兼容历史数据

-- 4) 设置默认值（仅对新插入生效）
alter table public.apps alter column owner_id set default auth.uid();

-- 5) 索引
create index if not exists idx_apps_owner on public.apps(owner_id);

-- 6) 管理员表与函数
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id)
);

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists(select 1 from public.admins a where a.user_id = uid);
$$;

-- 7) RLS 策略
alter table public.apps enable row level security;

create policy if not exists "apps_select_public" on public.apps for select using (true);
create policy if not exists "apps_insert_auth" on public.apps for insert with check (auth.uid() is not null and owner_id = auth.uid());
create policy if not exists "apps_update_owner" on public.apps for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy if not exists "apps_update_admin" on public.apps for update using (public.is_admin(auth.uid())) with check (true);
create policy if not exists "apps_delete_owner" on public.apps for delete using (owner_id = auth.uid());
create policy if not exists "apps_delete_admin" on public.apps for delete using (public.is_admin(auth.uid()));

commit;

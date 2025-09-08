-- 005_tags_normalization.sql
-- 目的：修复历史数据里将整串逗号分隔标签当作一个元素存入 text[] 的问题；并通过触发器保证后续写入被规范化。

-- 1) 规范化函数：
--    - 将数组每个元素用逗号拆分
--    - 去除首尾空格、转小写
--    - 过滤空值
--    - 去重并排序（稳定展示与便于比较）
create or replace function public.normalize_tags(arr text[])
returns text[] language plpgsql immutable as $$
declare
  v text;
  item text;
  tmp text[] := '{}';
begin
  if arr is null then
    return '{}';
  end if;

  -- 拆分、清洗
  foreach v in array arr loop
    if v is null then
      continue;
    end if;
    for item in select trim(both ' ' from lower(x)) from regexp_split_to_table(v, '\s*,\s*') as t(x) loop
      if item is not null and length(item) > 0 then
        tmp := array_append(tmp, item);
      end if;
    end loop;
  end loop;

  -- 去重
  tmp := (select array_agg(distinct x) from unnest(tmp) as u(x));
  if tmp is null then
    tmp := '{}';
  end if;

  -- 排序
  return (select coalesce(array_agg(x order by x), '{}') from unnest(tmp) as u(x));
end;
$$;

-- 2) 触发器：在 insert/update 前规范化
create or replace function public.before_apps_tags_normalize()
returns trigger language plpgsql as $$
begin
  new.tags := public.normalize_tags(new.tags);
  return new;
end;
$$;

drop trigger if exists trg_apps_tags_normalize on public.apps;
create trigger trg_apps_tags_normalize
before insert or update on public.apps
for each row execute function public.before_apps_tags_normalize();

-- 3) 一次性修复历史数据
update public.apps set tags = public.normalize_tags(tags) where tags is not null;

-- 4) 索引：为包含查询提供加速（如后续添加 where tags && '{ai,chat}'::text[]）
create index if not exists idx_apps_tags_gin on public.apps using gin (tags);

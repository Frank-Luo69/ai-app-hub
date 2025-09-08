# Changelog

## v0.2.1 (2025-09-08)

Fixes
- Tags：修复提交/编辑时的标签未按逗号拆分的问题；统一为小写、去重，并为历史数据执行一次性规范化。

Database
- 迁移：005_tags_normalization.sql
  - 新增函数 public.normalize_tags(text[])、触发器 before insert/update 规范化 apps.tags
  - 一次性更新历史数据，并添加 GIN 索引 idx_apps_tags_gin

Upgrade Notes
1) 在 Supabase SQL Editor 或迁移流水线上执行 supabase/migrations/005_tags_normalization.sql
2) 无需代码改动配置，前后端已内建拆分与清洗逻辑

Rollback
- 可安全删除触发器与函数并移除索引：
  - drop trigger if exists trg_apps_tags_normalize on public.apps;
  - drop function if exists public.before_apps_tags_normalize();
  - drop function if exists public.normalize_tags(text[]);
  - drop index if exists idx_apps_tags_gin;

## v0.2.0 (2025-08-20)

Features
- Comments (PR #4)
  - API: POST /api/comments, DELETE /api/comments/:id（需登录，RLS 保护，Zod 校验）
  - UI: 详情页评论区支持发表/删除与错误提示；仅作者/应用所有者/管理员显示删除入口
  - Rate limit: SQL 函数 public.can_post_comment(win_seconds, max_count) + 插入策略限制（60秒最多5条/用户）

Database
- 迁移
  - 003_comments_delete_policies.sql：评论删除策略（作者/应用所有者/管理员）
  - 004_comments_rate_limit.sql：函数 can_post_comment 与插入策略更新
- 回滚
  - 004 回滚：恢复 insert 策略为仅需登录；drop function can_post_comment(int,int)

CI
- CodeQL、构建与单测通过；e2e 保持可选

## v0.1.0 (2025-08-20)

Features
- Accounts & Ownership (PR #2)
  - Ownership model: apps.owner_id (FK -> auth.users), admins + is_admin(), RLS policies for select/insert/update/delete
  - Protected API: /api/apps/[id] (GET/PUT/DELETE) with Zod validation and admin/owner checks
  - UI protections: only owner/admin see manage actions; Submit writes owner_id
  - Tests: Vitest unit tests scaffolding; Playwright e2e smoke; CI workflow (build + unit, e2e optional)
- UX & Upload (PR #3)
  - Upload: StorageAdapter (local & Supabase), /api/upload with type/size validation, form integration
  - i18n: zh/en provider, Navbar language switcher, key strings internationalized
  - Home: search + tag filter + client-side pagination; grid cards
  - My Apps: owner-only list (/my)
  - Edit page: /edit/[id] updates via protected API
  - Detail: show author email; improved layout
  - Submit: client-side Zod validation; cover upload; slug generation

Upgrade Notes
- Database migrations
  1) 001_ownership_auth.sql：创建 owner_id、RLS、admins/is_admin 等（在使用 Supabase 迁移流水线时按顺序执行）
  2) 002_add_owner_email.sql：新增 apps.owner_email 字段

- Supabase 手动执行确认（已由维护者执行）
  - 已在 Supabase SQL Editor 运行：
    - alter table if exists public.apps add column if not exists owner_email text;
  - 并完成历史数据的回填，确保详情页可展示作者邮箱

- 回滚步骤
  - 若仅需回退 0.1.0 新增列：
    - alter table if exists public.apps drop column if exists owner_email;
  - 若需整体回退到 0.0.x：
    - 回滚到上一个 Git tag，撤回对应迁移（谨慎操作，视环境使用的迁移管线而定）

CI/CD
- GitHub Actions：build + unit tests，e2e 可选
- Vercel：PR 预览可用，合并后可 Promote 到 production



# AI Mini-App Hub — 完整可部署模板（Next.js 14 + Supabase）

已包含所有必需文件：**根配置、App Router 页面、API、组件、Supabase Schema、Tailwind、.gitignore、env 示例**。

## 本地
1) `npm i`
2) `cp .env.local.example .env.local` 并填入 Supabase：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3) Supabase 控制台 → SQL Editor 执行 `supabase/schema.sql`
4) `npm run dev` → 打开 http://localhost:3000
   - `/auth` 登录（魔法链接）
   - `/submit` 提交外链
   - `/g/[slug]` 详情 + 讨论

## 部署（Vercel）
- Framework Preset：**Next.js**
- Environment Variables（Production/Preview/Development 全选）：
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- 部署后回 Supabase → Authentication → URL Configuration：
  - Site URL：`https://你的域名`
  - Redirect URLs：追加 `https://你的域名/*`（本地 `http://localhost:3000/*` 也保留）

## 目录
- package.json / next.config.js / tsconfig.json / postcss.config.js / tailwind.config.ts / next-env.d.ts
- app/（页面与 API）
- components/ / lib/ / supabase/ / public/
- .env.local.example / .gitignore / README.md

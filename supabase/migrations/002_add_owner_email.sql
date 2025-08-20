-- Add owner_email column for showing author info without an extra join
alter table if exists public.apps add column if not exists owner_email text;

-- Backfill from existing rows if possible using the auth.users view is not possible here,
-- so we leave it null for existing data. New inserts should populate it from session user.

-- No down migration here; dropping the column would be:
-- alter table public.apps drop column if exists owner_email;

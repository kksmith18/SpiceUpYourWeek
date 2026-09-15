-- Run this in the Supabase SQL Editor once you're ready to make the app
-- reachable by anyone but you (e.g. before/after deploying to Vercel).
-- Reverses supabase/dev_disable_rls.sql. Safe to run now — every existing
-- row was already backfilled to your account via scripts/backfill-user-id.mjs.

alter table recipes enable row level security;
alter table workouts enable row level security;
alter table pantry_ignore enable row level security;

alter table recipes alter column user_id set not null;
alter table workouts alter column user_id set not null;
alter table pantry_ignore alter column user_id set not null;

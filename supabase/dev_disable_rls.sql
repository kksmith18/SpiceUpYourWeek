-- TEMP, for solo local testing only — run this in the Supabase SQL Editor.
-- With the login gate commented out (see src/lib/supabase/middleware.ts),
-- requests aren't authenticated, so RLS would otherwise block every read/write.
--
-- Before this app is ever reachable by anyone but you, re-enable RLS:
--   alter table recipes enable row level security;
--   alter table workouts enable row level security;
--   alter table pantry_ignore enable row level security;

alter table recipes disable row level security;
alter table workouts disable row level security;
alter table pantry_ignore disable row level security;

-- Also needed if you already ran the original schema.sql (user_id was NOT NULL there):
alter table recipes alter column user_id drop not null;
alter table workouts alter column user_id drop not null;
alter table pantry_ignore alter column user_id drop not null;

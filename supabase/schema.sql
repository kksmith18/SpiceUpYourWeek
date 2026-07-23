-- SpiceUpYourWeek schema — paste this into the Supabase SQL Editor and run it once.
-- Every table is scoped to the signed-in user via Row Level Security, so this is
-- already safe if a second account ever shows up later.

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  code text not null default '',
  name text not null,
  tag text not null default 'Dinner',
  main_protein text not null default '',
  minutes integer not null default 0,
  day_lock text not null default '',
  max_per_week integer not null default 1,
  protein jsonb not null default '[]',
  carbs jsonb not null default '[]',
  vegetables jsonb not null default '[]',
  other jsonb not null default '[]',
  optional jsonb not null default '[]',
  instructions jsonb not null default '[]',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  tag text not null default 'Legs',
  minutes integer not null default 0,
  day_lock text not null default '',
  max_per_week integer not null default 1,
  exercises jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists pantry_ignore (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table recipes enable row level security;
alter table workouts enable row level security;
alter table pantry_ignore enable row level security;

create policy "recipes: owner full access" on recipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workouts: owner full access" on workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "pantry_ignore: owner full access" on pantry_ignore
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

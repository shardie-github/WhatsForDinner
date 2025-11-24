create table if not exists public.meal_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cuisines text[] default '{}',
  diet text default 'none',
  allergies text[] default '{}',
  cook_time_minutes int default 30,
  updated_at timestamptz default now()
);
alter table public.meal_prefs enable row level security;
create policy "prefs_owner" on public.meal_prefs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

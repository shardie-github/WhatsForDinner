-- Users assumed in auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.journal_entries (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.badges (
  id bigserial primary key,
  code text unique not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id bigint not null references public.badges(id) on delete cascade,
  awarded_at timestamptz default now(),
  primary key (user_id, badge_id)
);

create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  days int not null default 0,
  updated_at timestamptz default now()
);

create table if not exists public.posts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create table if not exists public.reactions (
  post_id bigint references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now(),
  primary key (post_id, user_id, emoji)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.user_badges enable row level security;
alter table public.streaks enable row level security;
alter table public.posts enable row level security;
alter table public.reactions enable row level security;

-- Policies: owner can CRUD their own data; public can read posts
create policy "own_profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own_journal" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_streak" on public.streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_badges" on public.user_badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "read_posts" on public.posts for select using (true);
create policy "write_own_posts" on public.posts
  for insert with check (auth.uid() = user_id);
create policy "edit_own_posts" on public.posts
  for update using (auth.uid() = user_id);

create policy "react_own" on public.reactions
  for insert with check (auth.uid() = user_id);
create policy "unreact_own" on public.reactions
  for delete using (auth.uid() = user_id);

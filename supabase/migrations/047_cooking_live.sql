-- Cooking activities and live stream features

-- Cooking activities table
create table if not exists public.cooking_activities (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  family_name text,
  meal_name text not null,
  description text,
  ingredients text[],
  cooking_time_minutes int,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  is_live boolean default true,
  started_at timestamptz default now(),
  ended_at timestamptz,
  likes_count int default 0,
  views_count int default 0,
  created_at timestamptz default now()
);

create index idx_cooking_activities_live on public.cooking_activities(is_live, started_at desc);
create index idx_cooking_activities_user on public.cooking_activities(user_id, created_at desc);

-- Cook-off competitions
create table if not exists public.cook_offs (
  id bigserial primary key,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  prize_xp int default 100,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists public.cook_off_participants (
  cook_off_id bigint not null references public.cook_offs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_name text not null,
  description text,
  submitted_at timestamptz default now(),
  votes int default 0,
  primary key (cook_off_id, user_id)
);

create index idx_cook_off_participants on public.cook_off_participants(cook_off_id, votes desc);

-- Cooking activity likes
create table if not exists public.cooking_activity_likes (
  activity_id bigint not null references public.cooking_activities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (activity_id, user_id)
);

-- RLS policies
alter table public.cooking_activities enable row level security;
alter table public.cook_offs enable row level security;
alter table public.cook_off_participants enable row level security;
alter table public.cooking_activity_likes enable row level security;

-- Cooking activities policies
create policy "read_cooking_activities" on public.cooking_activities for select using (true);
create policy "create_own_cooking" on public.cooking_activities for insert with check (auth.uid() = user_id);
create policy "update_own_cooking" on public.cooking_activities for update using (auth.uid() = user_id);

-- Cook-offs policies
create policy "read_cook_offs" on public.cook_offs for select using (true);
create policy "participate_cook_off" on public.cook_off_participants for all using (auth.uid() = user_id);

-- Likes policies
create policy "like_cooking" on public.cooking_activity_likes for insert with check (auth.uid() = user_id);
create policy "unlike_cooking" on public.cooking_activity_likes for delete using (auth.uid() = user_id);

-- Function to update cooking activity likes count
create or replace function update_cooking_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.cooking_activities
    set likes_count = likes_count + 1
    where id = new.activity_id;
  elsif TG_OP = 'DELETE' then
    update public.cooking_activities
    set likes_count = greatest(0, likes_count - 1)
    where id = old.activity_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger cooking_likes_count_trigger
after insert or delete on public.cooking_activity_likes
for each row execute function update_cooking_likes_count();

-- Function to update cooking activity views
create or replace function increment_cooking_views()
returns trigger as $$
begin
  update public.cooking_activities
  set views_count = views_count + 1
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Function to increment cook-off votes
create or replace function increment_cook_off_votes(cook_off_id bigint, participant_user_id uuid)
returns void as $$
begin
  update public.cook_off_participants
  set votes = votes + 1
  where cook_off_id = increment_cook_off_votes.cook_off_id
    and user_id = increment_cook_off_votes.participant_user_id;
end;
$$ language plpgsql security definer;

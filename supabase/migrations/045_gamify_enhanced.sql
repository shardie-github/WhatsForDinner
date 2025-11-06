-- Extended gamification schema with all enhancements

-- Comments table
create table if not exists public.comments (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  parent_id bigint references public.comments(id) on delete cascade,
  is_edited boolean default false,
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_comments_post_id on public.comments(post_id);
create index idx_comments_user_id on public.comments(user_id);
create index idx_comments_parent_id on public.comments(parent_id);

-- Moderation actions
create table if not exists public.moderation_actions (
  id bigserial primary key,
  moderator_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'user')),
  target_id bigint not null,
  action text not null check (action in ('warn', 'hide', 'delete', 'ban')),
  reason text,
  created_at timestamptz default now()
);

-- Referrals
create table if not exists public.referrals (
  id bigserial primary key,
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid references auth.users(id) on delete cascade,
  referral_code text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'rewarded')),
  reward_xp int default 0,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create unique index idx_referrals_code on public.referrals(referral_code);
create index idx_referrals_referrer on public.referrals(referrer_id);
create index idx_referrals_referred on public.referrals(referred_id);

-- Weekly challenges
create table if not exists public.weekly_challenges (
  id bigserial primary key,
  week_start date not null,
  week_end date not null,
  title text not null,
  description text,
  xp_reward int not null default 50,
  badge_id bigint references public.badges(id),
  target_value int,
  metric text not null check (metric in ('journal_entries', 'streak_days', 'posts', 'reactions', 'comments', 'referrals')),
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.user_challenge_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id bigint not null references public.weekly_challenges(id) on delete cascade,
  current_value int default 0,
  completed_at timestamptz,
  primary key (user_id, challenge_id)
);

-- Leaderboards
create table if not exists public.leaderboard_entries (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null check (period in ('daily', 'weekly', 'monthly', 'all_time')),
  period_start date not null,
  xp int default 0,
  rank int,
  updated_at timestamptz default now(),
  unique(user_id, period, period_start)
);

create index idx_leaderboard_period on public.leaderboard_entries(period, period_start, xp desc);

-- Notifications
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('streak_risk', 'streak_milestone', 'badge_unlocked', 'quest_completed', 'challenge_completed', 'friend_activity', 'mention', 'reaction', 'comment', 'referral_reward')),
  title text not null,
  body text,
  link_url text,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_user_unread on public.notifications(user_id, is_read, created_at desc);

-- User activity feed
create table if not exists public.activity_log (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index idx_activity_log_user on public.activity_log(user_id, created_at desc);

-- Friends/connections
create table if not exists public.friendships (
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (requester_id, addressee_id),
  check (requester_id != addressee_id)
);

create index idx_friendships_requester on public.friendships(requester_id, status);
create index idx_friendships_addressee on public.friendships(addressee_id, status);

-- Push notification subscriptions
create table if not exists public.push_subscriptions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, endpoint)
);

-- Enhanced journal entries with tags and mood
alter table public.journal_entries add column if not exists tags text[];
alter table public.journal_entries add column if not exists mood text check (mood in ('great', 'good', 'okay', 'challenging', 'tough'));
alter table public.journal_entries add column if not exists is_shared boolean default false;

-- Enhanced profiles
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists total_xp int default 0;
alter table public.profiles add column if not exists level int default 1;
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists is_public boolean default true;

-- Enhanced streaks with last_activity
alter table public.streaks add column if not exists last_activity_date date;
alter table public.streaks add column if not exists longest_streak int default 0;

-- Community challenges (group goals)
create table if not exists public.community_challenges (
  id bigserial primary key,
  title text not null,
  description text,
  target_value int not null,
  current_value int default 0,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reward_xp int default 100,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.community_challenge_contributions (
  id bigserial primary key,
  challenge_id bigint not null references public.community_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  contribution_value int not null,
  created_at timestamptz default now(),
  unique(challenge_id, user_id)
);

-- RLS for new tables
alter table public.comments enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.referrals enable row level security;
alter table public.weekly_challenges enable row level security;
alter table public.user_challenge_progress enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;
alter table public.friendships enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.community_challenges enable row level security;
alter table public.community_challenge_contributions enable row level security;

-- Comments policies
create policy "read_comments" on public.comments for select using (true);
create policy "create_own_comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "edit_own_comments" on public.comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own_comments" on public.comments for delete using (auth.uid() = user_id);

-- Moderation policies (admin only)
create policy "moderators_only" on public.moderation_actions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and id in (
    select user_id from auth.users where raw_user_meta_data->>'role' = 'moderator' or raw_user_meta_data->>'role' = 'admin'
  ))
);

-- Referrals policies
create policy "own_referrals" on public.referrals for all using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- Weekly challenges policies
create policy "read_challenges" on public.weekly_challenges for select using (true);
create policy "own_challenge_progress" on public.user_challenge_progress for all using (auth.uid() = user_id);

-- Leaderboard policies
create policy "read_leaderboards" on public.leaderboard_entries for select using (true);

-- Notifications policies
create policy "own_notifications" on public.notifications for all using (auth.uid() = user_id);

-- Activity log policies
create policy "own_activity" on public.activity_log for all using (auth.uid() = user_id);

-- Friendships policies
create policy "own_friendships" on public.friendships for all using (
  auth.uid() = requester_id or auth.uid() = addressee_id
);

-- Push subscriptions policies
create policy "own_subscriptions" on public.push_subscriptions for all using (auth.uid() = user_id);

-- Community challenges policies
create policy "read_community_challenges" on public.community_challenges for select using (true);
create policy "own_contributions" on public.community_challenge_contributions for all using (auth.uid() = user_id);

-- Function to update leaderboard
create or replace function update_leaderboard()
returns trigger as $$
begin
  insert into public.leaderboard_entries (user_id, period, period_start, xp)
  values (
    new.user_id,
    'daily',
    current_date,
    (select total_xp from public.profiles where id = new.user_id)
  )
  on conflict (user_id, period, period_start) do update
  set xp = excluded.xp, updated_at = now();
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update leaderboard on profile XP change
create trigger update_leaderboard_trigger
after update of total_xp on public.profiles
for each row
when (old.total_xp is distinct from new.total_xp)
execute function update_leaderboard();

-- Function to check and award streak milestones
create or replace function check_streak_milestone()
returns trigger as $$
declare
  milestone_days int[];
  milestone int;
begin
  milestone_days := array[7, 14, 30, 60, 100, 365];
  
  foreach milestone in array milestone_days loop
    if new.days = milestone and old.days < milestone then
      insert into public.notifications (user_id, type, title, body)
      values (
        new.user_id,
        'streak_milestone',
        'Streak Milestone! 🔥',
        format('Congratulations on your %s-day streak!', milestone)
      );
      
      -- Award XP for milestone
      update public.profiles
      set total_xp = total_xp + (milestone * 10)
      where id = new.user_id;
      
      exit;
    end if;
  end loop;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger streak_milestone_trigger
after update of days on public.streaks
for each row
when (old.days < new.days)
execute function check_streak_milestone();

-- Function to generate referral code
create or replace function generate_referral_code()
returns text as $$
select upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
$$ language sql;

-- Ensure all users have referral codes
update public.profiles
set referral_code = generate_referral_code()
where referral_code is null;

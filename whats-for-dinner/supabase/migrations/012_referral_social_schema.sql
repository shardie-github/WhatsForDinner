-- Referral and Social Sharing Schema Migration
-- This migration creates tables for referral system, social sharing, and viral features

-- Create referral_codes table for invite codes
create table referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  code text unique not null,
  description text,
  max_uses int,
  current_uses int default 0,
  reward_type text not null check (reward_type in ('credits', 'discount', 'premium', 'points')),
  reward_value numeric(10,2) not null,
  is_active boolean default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create referral_tracking table for tracking referrals
create table referral_tracking (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id) on delete cascade,
  referred_id uuid references auth.users(id) on delete cascade,
  referral_code_id uuid references referral_codes(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'completed', 'expired', 'cancelled')),
  reward_earned numeric(10,2) default 0.0,
  reward_claimed boolean default false,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create social_shares table for tracking social media shares
create table social_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('recipe', 'post', 'chef', 'event', 'general')),
  content_id uuid not null,
  platform text not null check (platform in ('facebook', 'twitter', 'instagram', 'tiktok', 'linkedin', 'pinterest', 'whatsapp')),
  share_url text not null,
  share_text text,
  engagement_metrics jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create viral_campaigns table for viral marketing campaigns
create table viral_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  campaign_type text not null check (campaign_type in ('referral', 'social_share', 'challenge', 'contest')),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  target_metric text not null check (target_metric in ('shares', 'referrals', 'engagement', 'signups')),
  target_value int not null,
  current_value int default 0,
  reward_structure jsonb not null,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create user_badges table for gamification
create table user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  badge_type text not null check (badge_type in (
    'referral_master', 'social_butterfly', 'viral_creator', 'community_champion',
    'early_adopter', 'loyal_user', 'content_creator', 'influencer'
  )),
  badge_name text not null,
  badge_description text,
  badge_icon text,
  points_earned int default 0,
  earned_at timestamp with time zone default now(),
  metadata jsonb default '{}'
);

-- Create social_leaderboard table for social engagement rankings
create table social_leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  total_shares int default 0,
  total_referrals int default 0,
  total_engagement int default 0,
  viral_score numeric(10,2) default 0.0,
  rank_position int,
  period text not null check (period in ('daily', 'weekly', 'monthly', 'all_time')),
  updated_at timestamp with time zone default now()
);

-- Create social_analytics table for tracking social performance
create table social_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  platform text not null,
  metric_type text not null check (metric_type in ('shares', 'likes', 'comments', 'clicks', 'conversions')),
  metric_value int not null,
  content_id uuid,
  content_type text,
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- Create referral_rewards table for reward management
create table referral_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  reward_type text not null check (reward_type in ('credits', 'discount', 'premium', 'points')),
  reward_value numeric(10,2) not null,
  source text not null check (source in ('referral', 'social_share', 'campaign', 'achievement')),
  source_id uuid,
  status text default 'pending' check (status in ('pending', 'claimed', 'expired', 'cancelled')),
  expires_at timestamp with time zone,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create social_widgets table for embeddable sharing widgets
create table social_widgets (
  id uuid primary key default gen_random_uuid(),
  widget_type text not null check (widget_type in ('share_button', 'referral_banner', 'leaderboard', 'badge_display')),
  title text not null,
  description text,
  configuration jsonb not null,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index idx_referral_codes_user on referral_codes(user_id);
create index idx_referral_codes_code on referral_codes(code);
create index idx_referral_codes_active on referral_codes(is_active);

create index idx_referral_tracking_referrer on referral_tracking(referrer_id);
create index idx_referral_tracking_referred on referral_tracking(referred_id);
create index idx_referral_tracking_code on referral_tracking(referral_code_id);
create index idx_referral_tracking_status on referral_tracking(status);

create index idx_social_shares_user on social_shares(user_id);
create index idx_social_shares_content on social_shares(content_type, content_id);
create index idx_social_shares_platform on social_shares(platform);
create index idx_social_shares_created on social_shares(created_at);

create index idx_viral_campaigns_type on viral_campaigns(campaign_type);
create index idx_viral_campaigns_active on viral_campaigns(is_active);
create index idx_viral_campaigns_dates on viral_campaigns(start_date, end_date);

create index idx_user_badges_user on user_badges(user_id);
create index idx_user_badges_type on user_badges(badge_type);
create index idx_user_badges_earned on user_badges(earned_at);

create index idx_social_leaderboard_user on social_leaderboard(user_id);
create index idx_social_leaderboard_period on social_leaderboard(period);
create index idx_social_leaderboard_rank on social_leaderboard(rank_position);

create index idx_social_analytics_user on social_analytics(user_id);
create index idx_social_analytics_platform on social_analytics(platform);
create index idx_social_analytics_metric on social_analytics(metric_type);
create index idx_social_analytics_period on social_analytics(period_start, period_end);

create index idx_referral_rewards_user on referral_rewards(user_id);
create index idx_referral_rewards_type on referral_rewards(reward_type);
create index idx_referral_rewards_status on referral_rewards(status);
create index idx_referral_rewards_source on referral_rewards(source);

create index idx_social_widgets_type on social_widgets(widget_type);
create index idx_social_widgets_active on social_widgets(is_active);

-- Enable Row Level Security
alter table referral_codes enable row level security;
alter table referral_tracking enable row level security;
alter table social_shares enable row level security;
alter table viral_campaigns enable row level security;
alter table user_badges enable row level security;
alter table social_leaderboard enable row level security;
alter table social_analytics enable row level security;
alter table referral_rewards enable row level security;
alter table social_widgets enable row level security;

-- RLS Policies for referral_codes
create policy "Users can view their own referral codes" on referral_codes
  for select using (auth.uid() = user_id);

create policy "Users can create referral codes" on referral_codes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own referral codes" on referral_codes
  for update using (auth.uid() = user_id);

create policy "Anyone can view active referral codes" on referral_codes
  for select using (is_active = true);

-- RLS Policies for referral_tracking
create policy "Users can view their referral tracking" on referral_tracking
  for select using (auth.uid() = referrer_id or auth.uid() = referred_id);

create policy "System can create referral tracking" on referral_tracking
  for insert with check (true);

-- RLS Policies for social_shares
create policy "Users can view their own shares" on social_shares
  for select using (auth.uid() = user_id);

create policy "Users can create shares" on social_shares
  for insert with check (auth.uid() = user_id);

create policy "Anyone can view public shares" on social_shares
  for select using (true);

-- RLS Policies for viral_campaigns
create policy "Anyone can view active campaigns" on viral_campaigns
  for select using (is_active = true and end_date > now());

create policy "Users can create campaigns" on viral_campaigns
  for insert with check (auth.uid() = created_by);

-- RLS Policies for user_badges
create policy "Users can view their own badges" on user_badges
  for select using (auth.uid() = user_id);

create policy "Anyone can view public badges" on user_badges
  for select using (true);

-- RLS Policies for social_leaderboard
create policy "Anyone can view leaderboard" on social_leaderboard
  for select using (true);

-- RLS Policies for social_analytics
create policy "Users can view their analytics" on social_analytics
  for select using (auth.uid() = user_id);

-- RLS Policies for referral_rewards
create policy "Users can view their rewards" on referral_rewards
  for select using (auth.uid() = user_id);

create policy "Users can claim their rewards" on referral_rewards
  for update using (auth.uid() = user_id);

-- RLS Policies for social_widgets
create policy "Anyone can view active widgets" on social_widgets
  for select using (is_active = true);

-- Functions for referral and social features

-- Function to generate referral code
create or replace function generate_referral_code(user_id_param uuid, description_param text default null)
returns text as $$
declare
  code text;
  code_exists boolean;
begin
  -- Generate a unique code
  loop
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    select exists(select 1 from referral_codes where code = generate_referral_code.code) into code_exists;
    
    if not code_exists then
      exit;
    end if;
  end loop;
  
  -- Insert the referral code
  insert into referral_codes (user_id, code, description, max_uses, reward_type, reward_value)
  values (user_id_param, code, description_param, null, 'credits', 10.0);
  
  return code;
end;
$$ language plpgsql security definer;

-- Function to process referral
create or replace function process_referral(
  referral_code_param text,
  referred_user_id_param uuid
)
returns boolean as $$
declare
  code_record record;
  referrer_id_val uuid;
begin
  -- Get referral code details
  select * into code_record
  from referral_codes
  where code = referral_code_param and is_active = true;
  
  if not found then
    return false;
  end if;
  
  -- Check if code has remaining uses
  if code_record.max_uses is not null and code_record.current_uses >= code_record.max_uses then
    return false;
  end if;
  
  -- Check if code is expired
  if code_record.expires_at is not null and code_record.expires_at < now() then
    return false;
  end if;
  
  -- Check if user is trying to refer themselves
  if code_record.user_id = referred_user_id_param then
    return false;
  end if;
  
  -- Create referral tracking record
  insert into referral_tracking (referrer_id, referred_id, referral_code_id, status)
  values (code_record.user_id, referred_user_id_param, code_record.id, 'completed');
  
  -- Update code usage count
  update referral_codes
  set current_uses = current_uses + 1
  where id = code_record.id;
  
  -- Create rewards for both users
  insert into referral_rewards (user_id, reward_type, reward_value, source, source_id, status)
  values 
    (code_record.user_id, code_record.reward_type, code_record.reward_value, 'referral', code_record.id, 'pending'),
    (referred_user_id_param, 'credits', 5.0, 'referral', code_record.id, 'pending');
  
  return true;
end;
$$ language plpgsql security definer;

-- Function to track social share
create or replace function track_social_share(
  user_id_param uuid,
  content_type_param text,
  content_id_param uuid,
  platform_param text,
  share_url_param text,
  share_text_param text default null
)
returns uuid as $$
declare
  share_id_val uuid;
begin
  insert into social_shares (
    user_id, content_type, content_id, platform, share_url, share_text
  ) values (
    user_id_param, content_type_param, content_id_param, platform_param, share_url_param, share_text_param
  ) returning id into share_id_val;
  
  -- Update social analytics
  insert into social_analytics (user_id, platform, metric_type, metric_value, content_id, content_type, period_start, period_end)
  values (
    user_id_param, platform_param, 'shares', 1, content_id_param, content_type_param, 
    date_trunc('day', now()), date_trunc('day', now()) + interval '1 day'
  );
  
  return share_id_val;
end;
$$ language plpgsql security definer;

-- Function to update social leaderboard
create or replace function update_social_leaderboard()
returns void as $$
begin
  -- Clear current leaderboard
  delete from social_leaderboard;
  
  -- Recalculate and insert leaderboard data
  insert into social_leaderboard (user_id, total_shares, total_referrals, total_engagement, viral_score, period)
  select 
    u.id as user_id,
    coalesce(s.total_shares, 0) as total_shares,
    coalesce(r.total_referrals, 0) as total_referrals,
    coalesce(e.total_engagement, 0) as total_engagement,
    coalesce(s.total_shares, 0) * 1.0 + coalesce(r.total_referrals, 0) * 2.0 + coalesce(e.total_engagement, 0) * 0.5 as viral_score,
    'all_time' as period
  from auth.users u
  left join (
    select 
      user_id,
      count(*) as total_shares
    from social_shares
    group by user_id
  ) s on u.id = s.user_id
  left join (
    select 
      referrer_id as user_id,
      count(*) as total_referrals
    from referral_tracking
    where status = 'completed'
    group by referrer_id
  ) r on u.id = r.user_id
  left join (
    select 
      user_id,
      sum(metric_value) as total_engagement
    from social_analytics
    where metric_type in ('likes', 'comments', 'clicks')
    group by user_id
  ) e on u.id = e.user_id
  where coalesce(s.total_shares, 0) + coalesce(r.total_referrals, 0) + coalesce(e.total_engagement, 0) > 0
  order by viral_score desc;
  
  -- Update rank positions
  update social_leaderboard
  set rank_position = subquery.rank
  from (
    select id, row_number() over (order by viral_score desc) as rank
    from social_leaderboard
  ) subquery
  where social_leaderboard.id = subquery.id;
end;
$$ language plpgsql security definer;

-- Function to check and award social badges
create or replace function check_social_badges(user_id_param uuid)
returns void as $$
begin
  -- Social Butterfly badge (10+ shares)
  if not exists (select 1 from user_badges where user_id = user_id_param and badge_type = 'social_butterfly') then
    if exists (
      select 1 from social_shares 
      where user_id = user_id_param 
      group by user_id 
      having count(*) >= 10
    ) then
      insert into user_badges (user_id, badge_type, badge_name, badge_description, points_earned)
      values (user_id_param, 'social_butterfly', 'Social Butterfly', 'Shared content 10+ times!', 25);
    end if;
  end if;
  
  -- Referral Master badge (5+ successful referrals)
  if not exists (select 1 from user_badges where user_id = user_id_param and badge_type = 'referral_master') then
    if exists (
      select 1 from referral_tracking 
      where referrer_id = user_id_param and status = 'completed'
      group by referrer_id 
      having count(*) >= 5
    ) then
      insert into user_badges (user_id, badge_type, badge_name, badge_description, points_earned)
      values (user_id_param, 'referral_master', 'Referral Master', 'Successfully referred 5+ users!', 50);
    end if;
  end if;
end;
$$ language plpgsql security definer;

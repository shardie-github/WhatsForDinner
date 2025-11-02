-- ============================================================================
-- PART 10: REFERRAL AND SOCIAL SCHEMA - Run after Part 9
-- ============================================================================

-- Create referral_codes table for invite codes
CREATE TABLE IF NOT EXISTS referral_codes (
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
CREATE TABLE IF NOT EXISTS referral_tracking (
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
CREATE TABLE IF NOT EXISTS social_shares (
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
CREATE TABLE IF NOT EXISTS viral_campaigns (
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
CREATE TABLE IF NOT EXISTS user_badges (
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
CREATE TABLE IF NOT EXISTS social_leaderboard (
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
CREATE TABLE IF NOT EXISTS social_analytics (
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
CREATE TABLE IF NOT EXISTS referral_rewards (
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
CREATE TABLE IF NOT EXISTS social_widgets (
  id uuid primary key default gen_random_uuid(),
  widget_type text not null check (widget_type in ('share_button', 'referral_banner', 'leaderboard', 'badge_display')),
  title text not null,
  description text,
  configuration jsonb not null,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

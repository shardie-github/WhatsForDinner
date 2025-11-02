-- ============================================================================
-- PART 4: GROWTH ENGINE SCHEMA - Run after Part 3
-- ============================================================================

-- Create growth_metrics table for historical KPI tracking
CREATE TABLE IF NOT EXISTS growth_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  metric_type text not null check (metric_type in (
    'cac', 'ltv', 'retention_d30', 'retention_d90', 'mrr', 'churn_rate', 
    'ai_cost_ratio', 'conversion_rate', 'activation_rate', 'engagement_score'
  )),
  value numeric(15,4) not null,
  cohort_date date,
  period_start date not null,
  period_end date not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now(),
  unique(tenant_id, metric_type, cohort_date, period_start, period_end)
);

-- Create referrals table for affiliate system
CREATE TABLE IF NOT EXISTS referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id) on delete cascade,
  invitee_email text,
  invitee_id uuid references auth.users(id),
  reward_status text default 'pending' check (reward_status in ('pending', 'earned', 'paid', 'expired')),
  referral_code text unique not null,
  reward_type text check (reward_type in ('pro_extension', 'credit', 'cash')),
  reward_value numeric(10,2),
  conversion_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '90 days')
);

-- Create affiliate_campaigns table for tracking campaigns
CREATE TABLE IF NOT EXISTS affiliate_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  reward_type text not null check (reward_type in ('pro_extension', 'credit', 'cash')),
  reward_value numeric(10,2) not null,
  is_active boolean default true,
  start_date timestamp with time zone default now(),
  end_date timestamp with time zone,
  max_referrals int,
  current_referrals int default 0,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create funnel_events table for conversion tracking
CREATE TABLE IF NOT EXISTS funnel_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  tenant_id uuid references tenants(id),
  session_id text not null,
  funnel_stage text not null check (funnel_stage in (
    'landing', 'signup', 'onboarding', 'first_recipe', 'recipe_feedback', 
    'subscription', 'activation', 'retention', 'churn'
  )),
  event_data jsonb default '{}',
  timestamp timestamp with time zone default now(),
  page_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

-- Create ab_test_experiments table for A/B testing
CREATE TABLE IF NOT EXISTS ab_test_experiments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  hypothesis text,
  status text default 'draft' check (status in ('draft', 'running', 'paused', 'completed')),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  traffic_allocation numeric(3,2) default 0.5,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create ab_test_variants table
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references ab_test_experiments(id) on delete cascade,
  name text not null,
  description text,
  configuration jsonb not null,
  traffic_weight numeric(3,2) default 0.5,
  is_control boolean default false,
  created_at timestamp with time zone default now()
);

-- Create ab_test_assignments table
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references ab_test_experiments(id) on delete cascade,
  variant_id uuid references ab_test_variants(id) on delete cascade,
  user_id uuid references auth.users(id),
  session_id text,
  assigned_at timestamp with time zone default now(),
  unique(experiment_id, user_id),
  unique(experiment_id, session_id)
);

-- Create ai_copy_logs table for copy optimization
CREATE TABLE IF NOT EXISTS ai_copy_logs (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in (
    'landing_headline', 'email_subject', 'feature_copy', 'cta_button', 'social_post'
  )),
  variant_name text not null,
  content text not null,
  performance_metrics jsonb default '{}',
  is_winner boolean default false,
  test_id uuid references ab_test_experiments(id),
  created_at timestamp with time zone default now()
);

-- Create social_posts table for automated content
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('twitter', 'tiktok', 'threads', 'instagram', 'linkedin')),
  content text not null,
  media_urls text[],
  hashtags text[],
  scheduled_for timestamp with time zone,
  published_at timestamp with time zone,
  status text default 'draft' check (status in ('draft', 'scheduled', 'published', 'failed')),
  performance_metrics jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create ugc_shares table for user-generated content tracking
CREATE TABLE IF NOT EXISTS ugc_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  recipe_id int references recipes(id),
  share_type text not null check (share_type in ('meal_card', 'recipe', 'achievement')),
  platform text not null,
  share_url text,
  impressions int default 0,
  clicks int default 0,
  conversions int default 0,
  created_at timestamp with time zone default now()
);

-- Create dynamic_pricing_rules table
CREATE TABLE IF NOT EXISTS dynamic_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  rule_name text not null,
  rule_type text not null check (rule_type in ('ltv_based', 'usage_based', 'seasonal', 'churn_risk')),
  conditions jsonb not null,
  pricing_adjustment jsonb not null,
  is_active boolean default true,
  priority int default 0,
  created_at timestamp with time zone default now()
);

-- Create churn_predictions table for ML predictions
CREATE TABLE IF NOT EXISTS churn_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  tenant_id uuid references tenants(id),
  churn_probability numeric(3,2) not null check (churn_probability >= 0 and churn_probability <= 1),
  risk_factors jsonb default '{}',
  recommended_actions jsonb default '[]',
  model_version text not null,
  predicted_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '7 days')
);

-- Create winback_campaigns table
CREATE TABLE IF NOT EXISTS winback_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  campaign_type text not null check (campaign_type in ('email', 'push', 'sms', 'in_app')),
  status text default 'pending' check (status in ('pending', 'sent', 'opened', 'clicked', 'converted', 'failed')),
  content jsonb not null,
  sent_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  converted_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

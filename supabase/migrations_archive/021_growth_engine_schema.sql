-- Growth Engine Schema Migration
-- This migration adds comprehensive growth tracking, referral systems, and marketing automation

-- Create growth_metrics table for historical KPI tracking
create table growth_metrics (
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
create table referrals (
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
create table affiliate_campaigns (
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
create table funnel_events (
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
create table ab_test_experiments (
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
create table ab_test_variants (
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
create table ab_test_assignments (
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
create table ai_copy_logs (
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
create table social_posts (
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
create table ugc_shares (
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
create table dynamic_pricing_rules (
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
create table churn_predictions (
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
create table winback_campaigns (
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

-- Create indexes for performance
create index idx_growth_metrics_tenant_id on growth_metrics(tenant_id);
create index idx_growth_metrics_type on growth_metrics(metric_type);
create index idx_growth_metrics_period on growth_metrics(period_start, period_end);

create index idx_referrals_referrer_id on referrals(referrer_id);
create index idx_referrals_code on referrals(referral_code);
create index idx_referrals_status on referrals(reward_status);

create index idx_funnel_events_user_id on funnel_events(user_id);
create index idx_funnel_events_session_id on funnel_events(session_id);
create index idx_funnel_events_stage on funnel_events(funnel_stage);
create index idx_funnel_events_timestamp on funnel_events(timestamp);

create index idx_ab_test_assignments_user on ab_test_assignments(user_id);
create index idx_ab_test_assignments_session on ab_test_assignments(session_id);

create index idx_social_posts_platform on social_posts(platform);
create index idx_social_posts_status on social_posts(status);
create index idx_social_posts_scheduled on social_posts(scheduled_for);

create index idx_ugc_shares_user_id on ugc_shares(user_id);
create index idx_ugc_shares_platform on ugc_shares(platform);

create index idx_churn_predictions_user_id on churn_predictions(user_id);
create index idx_churn_predictions_probability on churn_predictions(churn_probability);

create index idx_winback_campaigns_user_id on winback_campaigns(user_id);
create index idx_winback_campaigns_status on winback_campaigns(status);

-- Enable Row Level Security
alter table growth_metrics enable row level security;
alter table referrals enable row level security;
alter table affiliate_campaigns enable row level security;
alter table funnel_events enable row level security;
alter table ab_test_experiments enable row level security;
alter table ab_test_variants enable row level security;
alter table ab_test_assignments enable row level security;
alter table ai_copy_logs enable row level security;
alter table social_posts enable row level security;
alter table ugc_shares enable row level security;
alter table dynamic_pricing_rules enable row level security;
alter table churn_predictions enable row level security;
alter table winback_campaigns enable row level security;

-- RLS Policies for growth_metrics
create policy "Users can view growth metrics for their tenants" on growth_metrics
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage growth metrics" on growth_metrics
  for all using (true);

-- RLS Policies for referrals
create policy "Users can view their own referrals" on referrals
  for select using (referrer_id = auth.uid());

create policy "Users can create referrals" on referrals
  for insert with check (referrer_id = auth.uid());

create policy "Users can update their own referrals" on referrals
  for update using (referrer_id = auth.uid());

-- RLS Policies for funnel_events
create policy "Users can view their own funnel events" on funnel_events
  for select using (user_id = auth.uid());

create policy "System can insert funnel events" on funnel_events
  for insert with check (true);

-- RLS Policies for ab_test_assignments
create policy "Users can view their own test assignments" on ab_test_assignments
  for select using (user_id = auth.uid());

create policy "System can manage test assignments" on ab_test_assignments
  for all using (true);

-- RLS Policies for ugc_shares
create policy "Users can view their own shares" on ugc_shares
  for select using (user_id = auth.uid());

create policy "Users can create shares" on ugc_shares
  for insert with check (user_id = auth.uid());

-- RLS Policies for churn_predictions
create policy "Users can view their own churn predictions" on churn_predictions
  for select using (user_id = auth.uid());

create policy "System can manage churn predictions" on churn_predictions
  for all using (true);

-- RLS Policies for winback_campaigns
create policy "Users can view their own winback campaigns" on winback_campaigns
  for select using (user_id = auth.uid());

create policy "System can manage winback campaigns" on winback_campaigns
  for all using (true);

-- Create functions for growth analytics
create or replace function calculate_cohort_retention(
  cohort_date_param date,
  days_param int
)
returns table(
  cohort_date date,
  days_since_signup int,
  users_in_cohort bigint,
  users_retained bigint,
  retention_rate numeric
) as $$
begin
  return query
  with cohort_users as (
    select user_id, created_at::date as signup_date
    from auth.users
    where created_at::date = cohort_date_param
  ),
  retention_data as (
    select 
      cu.signup_date,
      cu.user_id,
      case 
        when exists(
          select 1 from usage_logs ul 
          where ul.user_id = cu.user_id 
          and ul.timestamp::date = cu.signup_date + interval '1 day' * days_param
        ) then 1 else 0 
      end as retained
    from cohort_users cu
  )
  select 
    rd.signup_date as cohort_date,
    days_param as days_since_signup,
    count(*) as users_in_cohort,
    sum(rd.retained) as users_retained,
    round(sum(rd.retained)::numeric / count(*)::numeric, 4) as retention_rate
  from retention_data rd
  group by rd.signup_date;
end;
$$ language plpgsql security definer;

-- Function to calculate LTV
create or replace function calculate_user_ltv(user_id_param uuid)
returns numeric as $$
declare
  total_revenue numeric;
  months_active int;
  ltv_value numeric;
begin
  -- Calculate total revenue from subscriptions
  select coalesce(sum(
    case 
      when s.plan = 'pro' then 9.99
      when s.plan = 'family' then 19.99
      else 0
    end
  ), 0) into total_revenue
  from subscriptions s
  where s.user_id = user_id_param
  and s.status = 'active';
  
  -- Calculate months active
  select extract(months from (now() - min(created_at))) into months_active
  from auth.users
  where id = user_id_param;
  
  -- Calculate LTV (simplified: total revenue / months active * 12)
  if months_active > 0 then
    ltv_value := total_revenue / months_active * 12;
  else
    ltv_value := 0;
  end if;
  
  return ltv_value;
end;
$$ language plpgsql security definer;

-- Function to generate referral code
create or replace function generate_referral_code()
returns text as $$
begin
  return upper(substring(md5(random()::text) from 1 for 8));
end;
$$ language plpgsql;

-- Function to process referral conversion
create or replace function process_referral_conversion(
  referral_code_param text,
  new_user_id uuid
)
returns boolean as $$
declare
  referral_record referrals%rowtype;
  reward_amount numeric;
begin
  -- Find the referral
  select * into referral_record
  from referrals
  where referral_code = referral_code_param
  and reward_status = 'pending'
  and expires_at > now();
  
  if not found then
    return false;
  end if;
  
  -- Update referral record
  update referrals
  set 
    invitee_id = new_user_id,
    conversion_date = now(),
    reward_status = 'earned'
  where id = referral_record.id;
  
  -- Process reward based on type
  case referral_record.reward_type
    when 'pro_extension' then
      -- Add 7 days to Pro plan
      insert into subscriptions (user_id, plan, status, current_period_start, current_period_end)
      values (referral_record.referrer_id, 'pro', 'active', now(), now() + interval '7 days');
      
    when 'credit' then
      -- Add credit to user account (implement based on your billing system)
      -- This would typically update a credits table or Stripe customer balance
      null;
      
    when 'cash' then
      -- Process cash reward (implement based on your payout system)
      null;
  end case;
  
  return true;
end;
$$ language plpgsql security definer;

-- Function to track funnel event
create or replace function track_funnel_event(
  user_id_param uuid,
  session_id_param text,
  funnel_stage_param text,
  event_data_param jsonb default '{}',
  page_url_param text default null,
  utm_source_param text default null,
  utm_medium_param text default null,
  utm_campaign_param text default null
)
returns void as $$
declare
  user_tenant_id uuid;
begin
  -- Get user's tenant
  select tm.tenant_id into user_tenant_id
  from tenant_memberships tm
  where tm.user_id = user_id_param and tm.status = 'active';
  
  -- Insert funnel event
  insert into funnel_events (
    user_id, tenant_id, session_id, funnel_stage, 
    event_data, page_url, utm_source, utm_medium, utm_campaign
  ) values (
    user_id_param, user_tenant_id, session_id_param, funnel_stage_param,
    event_data_param, page_url_param, utm_source_param, utm_medium_param, utm_campaign_param
  );
end;
$$ language plpgsql security definer;

-- Function to assign user to A/B test
create or replace function assign_ab_test(
  user_id_param uuid,
  session_id_param text,
  experiment_name_param text
)
returns uuid as $$
declare
  experiment_id_val uuid;
  variant_id_val uuid;
  assignment_id_val uuid;
begin
  -- Get active experiment
  select id into experiment_id_val
  from ab_test_experiments
  where name = experiment_name_param
  and status = 'running'
  and (start_date is null or start_date <= now())
  and (end_date is null or end_date >= now());
  
  if not found then
    return null;
  end if;
  
  -- Check if user already assigned
  select id into assignment_id_val
  from ab_test_assignments
  where experiment_id = experiment_id_val
  and (user_id = user_id_param or session_id = session_id_param);
  
  if found then
    return assignment_id_val;
  end if;
  
  -- Assign to variant based on traffic weight
  select id into variant_id_val
  from ab_test_variants
  where experiment_id = experiment_id_val
  order by random()
  limit 1;
  
  -- Create assignment
  insert into ab_test_assignments (experiment_id, variant_id, user_id, session_id)
  values (experiment_id_val, variant_id_val, user_id_param, session_id_param)
  returning id into assignment_id_val;
  
  return assignment_id_val;
end;
$$ language plpgsql security definer;

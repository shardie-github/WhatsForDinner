-- ============================================================================
-- MASTER SUPABASE DATABASE SCHEMA
-- ============================================================================
-- This is a consolidated SQL script containing all table creation statements
-- Run this directly in the Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- SECTION 1: CORE TABLES (001_create_tables.sql)
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid primary key references auth.users,
  name text,
  preferences jsonb
);

-- Create pantry_items table
CREATE TABLE IF NOT EXISTS pantry_items (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  ingredient text not null,
  quantity int default 1
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  title text,
  details jsonb,
  calories int,
  time text
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  recipe_id bigint references recipes(id)
);

-- ============================================================================
-- SECTION 2: ANALYTICS AND LOGGING TABLES (002_analytics_logging_tables.sql)
-- ============================================================================

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid references profiles(id),
  session_id text not null,
  properties jsonb default '{}',
  timestamp timestamptz default now(),
  page_url text,
  user_agent text
);

-- Recipe metrics table
CREATE TABLE IF NOT EXISTS recipe_metrics (
  id bigint generated always as identity primary key,
  recipe_id bigint references recipes(id),
  user_id uuid references profiles(id),
  generated_at timestamptz default now(),
  ingredients_used text[] not null,
  cuisine_type text,
  cook_time text not null,
  calories int not null,
  feedback_score int check (feedback_score >= 1 and feedback_score <= 5),
  api_latency_ms int not null,
  model_used text not null,
  retry_count int default 0
);

-- System metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_type text not null check (metric_type in ('api_performance', 'user_engagement', 'error_rate', 'cost_analysis')),
  value numeric not null,
  metadata jsonb default '{}',
  timestamp timestamptz default now()
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('error', 'warn', 'info', 'debug')),
  message text not null,
  context jsonb default '{}',
  user_id uuid references profiles(id),
  session_id text,
  stack_trace text,
  timestamp timestamptz default now(),
  source text not null check (source in ('frontend', 'api', 'edge_function', 'system')),
  component text
);

-- Error reports table
CREATE TABLE IF NOT EXISTS error_reports (
  id uuid primary key default gen_random_uuid(),
  error_type text not null,
  message text not null,
  stack_trace text,
  user_id uuid references profiles(id),
  session_id text,
  context jsonb default '{}',
  resolved boolean default false,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Recipe feedback table
CREATE TABLE IF NOT EXISTS recipe_feedback (
  id bigint generated always as identity primary key,
  recipe_id bigint references recipes(id),
  user_id uuid references profiles(id),
  feedback_type text not null check (feedback_type in ('thumbs_up', 'thumbs_down', 'rating')),
  score int check (score >= 1 and score <= 5),
  feedback_text text,
  created_at timestamptz default now()
);

-- AI configuration table
CREATE TABLE IF NOT EXISTS ai_config (
  id uuid primary key default gen_random_uuid(),
  model_name text not null,
  system_prompt text not null,
  message_templates jsonb not null,
  version text not null,
  is_active boolean default false,
  created_at timestamptz default now(),
  performance_score numeric,
  metadata jsonb default '{}'
);

-- Workflow state table for autonomous operations
CREATE TABLE IF NOT EXISTS workflow_state (
  id uuid primary key default gen_random_uuid(),
  workflow_name text not null,
  status text not null check (status in ('pending', 'running', 'completed', 'failed')),
  current_step text,
  progress_percentage int default 0,
  metadata jsonb default '{}',
  started_at timestamptz default now(),
  completed_at timestamptz,
  error_message text
);

-- ============================================================================
-- SECTION 3: MULTI-TENANT SAAS SCHEMA (003_multi_tenant_saas_schema.sql)
-- ============================================================================

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text default 'free' check (plan in ('free', 'pro', 'family')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'active' check (status in ('active', 'inactive', 'suspended', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  settings jsonb default '{}',
  metadata jsonb default '{}'
);

-- Create tenant memberships table for role-based access
CREATE TABLE IF NOT EXISTS tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  invited_by uuid references auth.users(id),
  joined_at timestamp with time zone default now(),
  status text default 'active' check (status in ('active', 'pending', 'suspended')),
  unique(tenant_id, user_id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  tenant_id uuid references tenants(id),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('free', 'pro', 'family')),
  status text not null check (status in ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  metadata jsonb default '{}'
);

-- Create usage logs table for quota control
CREATE TABLE IF NOT EXISTS usage_logs (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id),
  tenant_id uuid references tenants(id),
  action text not null,
  tokens_used int default 0,
  cost_usd numeric(10,4) default 0,
  model_used text,
  timestamp timestamp with time zone default now(),
  metadata jsonb default '{}'
);

-- Create tenant invites table
CREATE TABLE IF NOT EXISTS tenant_invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  email text not null,
  role text not null check (role in ('editor', 'viewer')),
  invited_by uuid references auth.users(id),
  token text unique not null,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create AI cache table for cost optimization
CREATE TABLE IF NOT EXISTS ai_cache (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  cache_key text not null,
  prompt_hash text not null,
  response_data jsonb not null,
  model_used text not null,
  tokens_used int not null,
  cost_usd numeric(10,4) not null,
  ttl_seconds int not null,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null,
  unique(tenant_id, cache_key)
);

-- Create billing events table for Stripe webhook tracking
CREATE TABLE IF NOT EXISTS billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  processed boolean default false,
  data jsonb not null,
  created_at timestamp with time zone default now()
);

-- Add tenant_id columns to existing tables (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tenant_id') THEN
    ALTER TABLE profiles ADD COLUMN tenant_id uuid references tenants(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role text default 'owner' check (role in ('owner', 'editor', 'viewer'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pantry_items' AND column_name = 'tenant_id') THEN
    ALTER TABLE pantry_items ADD COLUMN tenant_id uuid references tenants(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'tenant_id') THEN
    ALTER TABLE recipes ADD COLUMN tenant_id uuid references tenants(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'tenant_id') THEN
    ALTER TABLE favorites ADD COLUMN tenant_id uuid references tenants(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_events' AND column_name = 'tenant_id') THEN
    ALTER TABLE analytics_events ADD COLUMN tenant_id uuid references tenants(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipe_metrics' AND column_name = 'tenant_id') THEN
    ALTER TABLE recipe_metrics ADD COLUMN tenant_id uuid references tenants(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipe_feedback' AND column_name = 'tenant_id') THEN
    ALTER TABLE recipe_feedback ADD COLUMN tenant_id uuid references tenants(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pantry_items' AND column_name = 'is_sample') THEN
    ALTER TABLE pantry_items ADD COLUMN is_sample boolean default false;
  END IF;
END $$;

-- ============================================================================
-- SECTION 4: GROWTH ENGINE SCHEMA (004_growth_engine_schema.sql)
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

-- ============================================================================
-- SECTION 5: FEDERATED ECOSYSTEM SCHEMA (005_federated_ecosystem_schema.sql)
-- ============================================================================

-- Create partner_registry table for ecosystem partners
CREATE TABLE IF NOT EXISTS partner_registry (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in (
    'shopify', 'zapier', 'alexa', 'google_home', 'tiktok', 'instagram', 
    'api_integration', 'white_label', 'franchise', 'affiliate'
  )),
  api_base text not null,
  api_key text,
  webhook_url text,
  revenue_share_percent numeric(5,2) default 0.0,
  status text default 'pending' check (status in ('pending', 'active', 'suspended', 'terminated')),
  region text default 'global' check (region in ('global', 'na', 'eu', 'apac')),
  capabilities jsonb default '{}',
  metadata jsonb default '{}',
  registered_at timestamp with time zone default now(),
  activated_at timestamp with time zone,
  last_sync_at timestamp with time zone
);

-- Create federated_api_endpoints table for unified API routing
CREATE TABLE IF NOT EXISTS federated_api_endpoints (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partner_registry(id) on delete cascade,
  endpoint_path text not null,
  method text not null check (method in ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  target_url text not null,
  auth_type text default 'oauth2' check (auth_type in ('oauth2', 'jwt', 'api_key', 'none')),
  rate_limit_per_minute int default 100,
  rate_limit_per_hour int default 1000,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Create api_usage_tracking table for monetization
CREATE TABLE IF NOT EXISTS api_usage_tracking (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partner_registry(id),
  tenant_id uuid references tenants(id),
  endpoint_id uuid references federated_api_endpoints(id),
  user_id uuid references auth.users(id),
  request_id text not null,
  method text not null,
  endpoint text not null,
  status_code int not null,
  response_time_ms int not null,
  tokens_used int default 0,
  cost_usd numeric(10,4) default 0.0,
  revenue_usd numeric(10,4) default 0.0,
  metadata jsonb default '{}',
  timestamp timestamp with time zone default now()
);

-- Create ai_model_advisor table for multi-model cost optimization
CREATE TABLE IF NOT EXISTS ai_model_advisor (
  id uuid primary key default gen_random_uuid(),
  model_name text not null,
  provider text not null check (provider in ('openai', 'anthropic', 'google', 'azure')),
  cost_per_1k_tokens numeric(10,6) not null,
  quality_score numeric(3,2) not null check (quality_score >= 0 and quality_score <= 1),
  latency_ms int not null,
  context_window int not null,
  is_active boolean default true,
  last_updated timestamp with time zone default now()
);

-- Create ai_evolution_logs table for learning loop
CREATE TABLE IF NOT EXISTS ai_evolution_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  model_version text not null,
  prompt_hash text not null,
  performance_metrics jsonb not null,
  user_feedback jsonb default '{}',
  optimization_suggestions jsonb default '{}',
  applied_changes jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create franchise_deployments table for white-label automation
CREATE TABLE IF NOT EXISTS franchise_deployments (
  id uuid primary key default gen_random_uuid(),
  franchise_name text not null,
  domain text unique not null,
  tenant_id uuid references tenants(id),
  region text not null check (region in ('na', 'eu', 'apac')),
  deployment_manifest jsonb not null,
  status text default 'pending' check (status in ('pending', 'deploying', 'active', 'failed', 'suspended')),
  stripe_account_id text,
  custom_theme jsonb default '{}',
  features_enabled jsonb default '{}',
  created_at timestamp with time zone default now(),
  deployed_at timestamp with time zone
);

-- Create compliance_audit_logs table for enterprise governance
CREATE TABLE IF NOT EXISTS compliance_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  user_id uuid references auth.users(id),
  action_type text not null,
  resource_type text not null,
  resource_id text not null,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  risk_score numeric(3,2) default 0.0,
  compliance_flags jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create anomaly_detections table for AI-powered monitoring
CREATE TABLE IF NOT EXISTS anomaly_detections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  detection_type text not null check (detection_type in (
    'api_abuse', 'billing_anomaly', 'data_privacy_risk', 'performance_degradation',
    'security_threat', 'cost_spike', 'usage_pattern_change'
  )),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  description text not null,
  detected_at timestamp with time zone default now(),
  resolved_at timestamp with time zone,
  auto_resolved boolean default false,
  resolution_actions jsonb default '[]',
  metadata jsonb default '{}'
);

-- Create developer_portal_sessions table for SDK management
CREATE TABLE IF NOT EXISTS developer_portal_sessions (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references auth.users(id),
  api_key text unique not null,
  name text not null,
  permissions jsonb not null,
  rate_limits jsonb not null,
  is_active boolean default true,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

-- Create sdk_downloads table for tracking SDK usage
CREATE TABLE IF NOT EXISTS sdk_downloads (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references auth.users(id),
  sdk_language text not null,
  sdk_version text not null,
  download_count int default 1,
  last_downloaded_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- ============================================================================
-- SECTION 6: JOB QUEUE SCHEMA (006_job_queue_schema.sql)
-- ============================================================================

-- Create jobs_queue table
CREATE TABLE IF NOT EXISTS jobs_queue (
  id bigint generated always as identity primary key,
  type text not null check (type in ('meal_generation', 'email_notification', 'data_cleanup', 'analytics_processing')),
  payload jsonb not null default '{}',
  status text not null check (status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  priority int default 0,
  retry_count int default 0,
  max_retries int default 3,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz,
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade
);

-- Create job results table for storing job outputs
CREATE TABLE IF NOT EXISTS job_results (
  id uuid primary key default gen_random_uuid(),
  job_id bigint references jobs_queue(id) on delete cascade,
  result_data jsonb not null,
  created_at timestamptz default now()
);

-- Create job logs table for detailed logging
CREATE TABLE IF NOT EXISTS job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id bigint references jobs_queue(id) on delete cascade,
  level text not null check (level in ('debug', 'info', 'warn', 'error')),
  message text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ============================================================================
-- SECTION 7: ADMIN DASHBOARD SCHEMA (009_admin_dashboard_schema.sql)
-- ============================================================================

-- Create admin roles enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
    CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator', 'analyst');
  END IF;
END $$;

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'analyst',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  is_active BOOLEAN DEFAULT true
);

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 8: COMMUNITY PORTAL SCHEMA (010_community_portal_schema.sql)
-- ============================================================================

-- Create community_posts table for user-generated content
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  post_type text not null check (post_type in (
    'recipe', 'guide', 'tip', 'story', 'question', 'discussion'
  )),
  category text not null check (category in (
    'appetizers', 'main_courses', 'desserts', 'beverages', 'snacks', 
    'cooking_tips', 'kitchen_hacks', 'food_science', 'dietary', 'general'
  )),
  tags text[] default '{}',
  images jsonb default '[]',
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  prep_time_minutes int,
  cook_time_minutes int,
  servings int,
  ingredients jsonb default '[]',
  instructions jsonb default '[]',
  nutrition_info jsonb default '{}',
  status text default 'draft' check (status in ('draft', 'published', 'archived', 'flagged')),
  is_featured boolean default false,
  view_count int default 0,
  like_count int default 0,
  comment_count int default 0,
  share_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone
);

-- Create community_votes table for voting system
CREATE TABLE IF NOT EXISTS community_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  vote_type text not null check (vote_type in ('upvote', 'downvote', 'like', 'dislike')),
  created_at timestamp with time zone default now(),
  unique(user_id, post_id, vote_type)
);

-- Create community_comments table for discussions
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  parent_id uuid references community_comments(id) on delete cascade,
  content text not null,
  is_approved boolean default true,
  like_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create community_follows table for user relationships
CREATE TABLE IF NOT EXISTS community_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references auth.users(id) on delete cascade,
  following_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- Create community_bookmarks table for saved content
CREATE TABLE IF NOT EXISTS community_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- Create community_reports table for content moderation
CREATE TABLE IF NOT EXISTS community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  comment_id uuid references community_comments(id) on delete cascade,
  reason text not null check (reason in (
    'spam', 'inappropriate', 'harassment', 'misinformation', 'copyright', 'other'
  )),
  description text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create community_achievements table for gamification
CREATE TABLE IF NOT EXISTS community_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  achievement_type text not null check (achievement_type in (
    'first_post', 'popular_recipe', 'helpful_comment', 'top_contributor',
    'recipe_master', 'community_helper', 'viral_content', 'expert_chef'
  )),
  title text not null,
  description text,
  badge_icon text,
  points int default 0,
  earned_at timestamp with time zone default now()
);

-- Create community_leaderboard table for rankings
CREATE TABLE IF NOT EXISTS community_leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  total_points int default 0,
  posts_count int default 0,
  comments_count int default 0,
  likes_received int default 0,
  followers_count int default 0,
  rank_position int,
  period text not null check (period in ('weekly', 'monthly', 'all_time')),
  updated_at timestamp with time zone default now()
);

-- Create community_events table for challenges and campaigns
CREATE TABLE IF NOT EXISTS community_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_type text not null check (event_type in (
    'recipe_challenge', 'cooking_contest', 'hackathon', 'feature_request', 'beta_test'
  )),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  rules text,
  prizes jsonb default '[]',
  max_participants int,
  current_participants int default 0,
  status text default 'upcoming' check (status in ('upcoming', 'active', 'completed', 'cancelled')),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create community_event_submissions table for event participation
CREATE TABLE IF NOT EXISTS community_event_submissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references community_events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  submission_data jsonb default '{}',
  status text default 'submitted' check (status in ('submitted', 'reviewed', 'winner', 'runner_up')),
  score numeric(5,2),
  feedback text,
  submitted_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone
);

-- ============================================================================
-- SECTION 9: CHEF MARKETPLACE SCHEMA (011_chef_marketplace_schema.sql)
-- ============================================================================

-- Create chef_profiles table for partner chefs
CREATE TABLE IF NOT EXISTS chef_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chef_name text not null,
  bio text,
  specialties text[] default '{}',
  experience_years int default 0,
  certifications text[] default '{}',
  social_links jsonb default '{}',
  profile_image_url text,
  cover_image_url text,
  is_verified boolean default false,
  is_featured boolean default false,
  rating numeric(3,2) default 0.0,
  total_ratings int default 0,
  total_sales int default 0,
  revenue_earned numeric(10,2) default 0.0,
  status text default 'pending' check (status in ('pending', 'approved', 'suspended', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create recipe_packs table for chef's recipe collections
CREATE TABLE IF NOT EXISTS recipe_packs (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in (
    'appetizers', 'main_courses', 'desserts', 'beverages', 'snacks',
    'breakfast', 'lunch', 'dinner', 'holiday', 'seasonal', 'dietary'
  )),
  difficulty_level text not null check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  prep_time_minutes int,
  cook_time_minutes int,
  total_servings int,
  price_usd numeric(10,2) not null,
  currency text default 'USD',
  images jsonb default '[]',
  tags text[] default '{}',
  ingredients_list jsonb default '[]',
  instructions jsonb default '[]',
  nutrition_info jsonb default '{}',
  dietary_restrictions text[] default '{}',
  cooking_methods text[] default '{}',
  equipment_needed text[] default '{}',
  skill_level_required text check (skill_level_required in ('beginner', 'intermediate', 'advanced')),
  is_featured boolean default false,
  is_published boolean default false,
  view_count int default 0,
  purchase_count int default 0,
  rating numeric(3,2) default 0.0,
  total_ratings int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone
);

-- Create recipe_pack_reviews table for customer feedback
CREATE TABLE IF NOT EXISTS recipe_pack_reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_pack_id uuid references recipe_packs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  images jsonb default '[]',
  is_verified_purchase boolean default false,
  helpful_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create chef_offers table for branded offers and promotions
CREATE TABLE IF NOT EXISTS chef_offers (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  offer_type text not null check (offer_type in (
    'discount', 'bundle', 'free_shipping', 'early_bird', 'seasonal', 'limited_time'
  )),
  discount_percent numeric(5,2),
  discount_amount numeric(10,2),
  minimum_purchase numeric(10,2),
  max_uses int,
  current_uses int default 0,
  valid_from timestamp with time zone not null,
  valid_until timestamp with time zone not null,
  is_active boolean default true,
  terms_conditions text,
  created_at timestamp with time zone default now()
);

-- Create chef_analytics table for performance tracking
CREATE TABLE IF NOT EXISTS chef_analytics (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  metric_type text not null check (metric_type in (
    'views', 'purchases', 'revenue', 'ratings', 'followers', 'engagement'
  )),
  metric_value numeric(15,2) not null,
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create chef_earnings table for revenue tracking
CREATE TABLE IF NOT EXISTS chef_earnings (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  recipe_pack_id uuid references recipe_packs(id) on delete cascade,
  sale_id uuid not null,
  gross_amount numeric(10,2) not null,
  platform_fee_percent numeric(5,2) not null,
  platform_fee_amount numeric(10,2) not null,
  net_amount numeric(10,2) not null,
  currency text default 'USD',
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create chef_followers table for chef following system
CREATE TABLE IF NOT EXISTS chef_followers (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(chef_id, user_id)
);

-- Create chef_notifications table for chef updates
CREATE TABLE IF NOT EXISTS chef_notifications (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  notification_type text not null check (notification_type in (
    'new_follower', 'new_review', 'new_purchase', 'earnings_update', 'offer_expiring'
  )),
  title text not null,
  message text not null,
  is_read boolean default false,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create chef_verification_documents table for verification process
CREATE TABLE IF NOT EXISTS chef_verification_documents (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  document_type text not null check (document_type in (
    'identity', 'certification', 'portfolio', 'business_license', 'tax_document'
  )),
  document_url text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone default now()
);

-- ============================================================================
-- SECTION 10: REFERRAL AND SOCIAL SCHEMA (012_referral_social_schema.sql)
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

-- ============================================================================
-- SECTION 11: FEATURE FLAGS SCHEMA (013_feature_flags_schema.sql)
-- ============================================================================

-- Create config_flags table for feature flags and kill switches
CREATE TABLE IF NOT EXISTS config_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_environment TEXT DEFAULT 'all' CHECK (target_environment IN ('all', 'development', 'staging', 'production')),
  target_users TEXT[] DEFAULT '{}',
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create flag_audit_log for tracking flag changes
CREATE TABLE IF NOT EXISTS flag_audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  flag_id TEXT REFERENCES config_flags(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'enabled', 'disabled', 'deleted')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- ============================================================================
-- SECTION 12: AI SYSTEM SCHEMA (014_ai_system_schema.sql)
-- ============================================================================

-- Create AI health metrics table
CREATE TABLE IF NOT EXISTS ai_health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deploy_id TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('staging', 'production', 'preview')),
  metrics JSONB NOT NULL DEFAULT '{}',
  patterns JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI embeddings table
CREATE TABLE IF NOT EXISTS ai_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deploy_id TEXT NOT NULL,
  analysis JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI cost analysis table
CREATE TABLE IF NOT EXISTS ai_cost_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metrics_summary JSONB NOT NULL DEFAULT '{}',
  prediction JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI performance metrics table
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure')),
  operation TEXT NOT NULL CHECK (operation IN ('completion', 'embedding', 'moderation', 'image')),
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_type TEXT,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  request_id TEXT NOT NULL,
  environment TEXT DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI performance reports table
CREATE TABLE IF NOT EXISTS ai_performance_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  avg_latency DECIMAL(10,2) DEFAULT 0,
  success_rate DECIMAL(5,4) DEFAULT 0,
  trends JSONB DEFAULT '[]',
  alerts JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI integrity reports table
CREATE TABLE IF NOT EXISTS ai_integrity_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_checks INTEGER DEFAULT 0,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  checks JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 13: GAP CLOSURE FEATURES (006_gap_closure_features.sql)
-- ============================================================================

-- User Preferences Table (for dietary preferences wizard)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  diets TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  cooking_skill TEXT CHECK (cooking_skill IN ('beginner', 'intermediate', 'advanced')),
  custom_preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Onboarding State Table
CREATE TABLE IF NOT EXISTS onboarding_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_completed BOOLEAN DEFAULT FALSE,
  sample_data_seeded BOOLEAN DEFAULT FALSE,
  first_recipe_generated BOOLEAN DEFAULT FALSE,
  preferences_set BOOLEAN DEFAULT FALSE,
  recipe_saved BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment Events Table (for A/B testing)
CREATE TABLE IF NOT EXISTS experiment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_name TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals Table (for waitlist/referral program)
CREATE TABLE IF NOT EXISTS lead_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_email TEXT,
  referred_email TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted')),
  signed_up_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- All tables have been created successfully!
-- Next steps:
-- 1. Set up Row Level Security (RLS) policies
-- 2. Create indexes for performance
-- 3. Create functions and triggers
-- 4. Run the RLS security migration (014_consolidated_rls_security.sql) separately if needed

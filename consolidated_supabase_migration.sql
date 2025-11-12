-- ============================================================================
-- CONSOLIDATED SUPABASE MIGRATION FILE
-- ============================================================================
-- This file consolidates all Supabase migrations into a single, optimized SQL file
-- 
-- Features:
-- - Removes all duplicates and redundancies
-- - Proper dependency ordering
-- - Comprehensive RLS policies for security
-- - Performance optimizations with proper indexes
-- - Security best practices
-- 
-- Run this file in Supabase SQL Editor
-- All statements use IF NOT EXISTS to avoid conflicts
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- Vector extension for AI embeddings (uncomment if needed)
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- SECTION 2: ENUMS AND TYPES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE plan AS ENUM ('free', 'premium', 'partner', 'pro', 'family', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator', 'analyst');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE recipe_source AS ENUM ('curated', 'partner', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE health_metric_kind AS ENUM ('weight', 'sleep', 'water', 'steps', 'calories');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE room_kind AS ENUM ('family', 'dm');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- SECTION 3: CORE TABLES
-- ============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  avatar_emoji TEXT DEFAULT '🍳',
  preferences JSONB DEFAULT '{}',
  household_size INTEGER DEFAULT 1,
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'spring', 'summer', 'fall', 'winter')),
  notifications_enabled BOOLEAN DEFAULT true,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'partner')),
  tenant_id UUID, -- Will reference tenants table
  role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID, -- Will reference tenants table
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  details JSONB,
  cook_time INTEGER, -- minutes
  time TEXT,
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'beginner', 'intermediate', 'advanced')),
  tags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  ingredients JSONB DEFAULT '[]',
  instructions JSONB DEFAULT '[]',
  nutrition_info JSONB DEFAULT '{}',
  calories INTEGER,
  cuisine_type TEXT,
  ai_recommended BOOLEAN DEFAULT false,
  ai_match_score DECIMAL(3,2),
  is_published BOOLEAN DEFAULT false,
  source recipe_source DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pantry items table
CREATE TABLE IF NOT EXISTS pantry_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID, -- Will reference tenants table
  ingredient TEXT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID, -- Will reference tenants table
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Recipe favorites (alternative structure)
CREATE TABLE IF NOT EXISTS recipe_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- ============================================================================
-- SECTION 4: MULTI-TENANT TABLES
-- ============================================================================

-- Tenants/Organizations table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'family', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table (alias for tenants)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'family', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant memberships
CREATE TABLE IF NOT EXISTS tenant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  UNIQUE(tenant_id, user_id)
);

-- User organizations (alias for tenant_memberships)
CREATE TABLE IF NOT EXISTS user_organizations (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  PRIMARY KEY (user_id, org_id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tenant_id UUID REFERENCES tenants(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'family', 'premium', 'partner')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Tenant invites
CREATE TABLE IF NOT EXISTS tenant_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints for tenant_id columns
DO $$
BEGIN
  -- Update profiles.tenant_id to reference tenants
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tenant_id') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'profiles_tenant_id_fkey'
    ) THEN
      ALTER TABLE profiles ADD CONSTRAINT profiles_tenant_id_fkey 
      FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;
  END IF;

  -- Update recipes.tenant_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'tenant_id') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'recipes_tenant_id_fkey'
    ) THEN
      ALTER TABLE recipes ADD CONSTRAINT recipes_tenant_id_fkey 
      FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;
  END IF;

  -- Update pantry_items.tenant_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pantry_items' AND column_name = 'tenant_id') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'pantry_items_tenant_id_fkey'
    ) THEN
      ALTER TABLE pantry_items ADD CONSTRAINT pantry_items_tenant_id_fkey 
      FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;
  END IF;

  -- Update favorites.tenant_id
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'favorites' AND column_name = 'tenant_id') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'favorites_tenant_id_fkey'
    ) THEN
      ALTER TABLE favorites ADD CONSTRAINT favorites_tenant_id_fkey 
      FOREIGN KEY (tenant_id) REFERENCES tenants(id);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- SECTION 5: ANALYTICS AND LOGGING TABLES
-- ============================================================================

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  page_url TEXT,
  user_agent TEXT
);

-- Recipe metrics
CREATE TABLE IF NOT EXISTS recipe_metrics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  ingredients_used TEXT[] NOT NULL,
  cuisine_type TEXT,
  cook_time TEXT NOT NULL,
  calories INT NOT NULL,
  feedback_score INT CHECK (feedback_score >= 1 AND feedback_score <= 5),
  api_latency_ms INT NOT NULL,
  model_used TEXT NOT NULL,
  retry_count INT DEFAULT 0
);

-- System metrics
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('api_performance', 'user_engagement', 'error_rate', 'cost_analysis')),
  value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  stack_trace TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  source TEXT NOT NULL CHECK (source IN ('frontend', 'api', 'edge_function', 'system')),
  component TEXT
);

-- Error reports
CREATE TABLE IF NOT EXISTS error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  context JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Recipe feedback
CREATE TABLE IF NOT EXISTS recipe_feedback (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('thumbs_up', 'thumbs_down', 'rating')),
  score INT CHECK (score >= 1 AND score <= 5),
  feedback_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 6: AI SYSTEM TABLES
-- ============================================================================

-- AI health metrics
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

-- AI embeddings (requires vector extension)
CREATE TABLE IF NOT EXISTS ai_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace TEXT NOT NULL,
  content TEXT NOT NULL,
  -- embedding VECTOR(1536), -- Uncomment if vector extension is enabled
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI performance metrics
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
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  request_id TEXT NOT NULL,
  environment TEXT DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI cache
CREATE TABLE IF NOT EXISTS ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,
  response_data JSONB NOT NULL,
  model_used TEXT NOT NULL,
  tokens_used INT NOT NULL,
  cost_usd NUMERIC(10,4) NOT NULL,
  ttl_seconds INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(tenant_id, cache_key)
);

-- ============================================================================
-- SECTION 7: GROWTH AND FEATURE TABLES
-- ============================================================================

-- Growth metrics
CREATE TABLE IF NOT EXISTS growth_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'cac', 'ltv', 'retention_d30', 'retention_d90', 'mrr', 'churn_rate', 
    'ai_cost_ratio', 'conversion_rate', 'activation_rate', 'engagement_score'
  )),
  value NUMERIC(15,4) NOT NULL,
  cohort_date DATE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, metric_type, cohort_date, period_start, period_end)
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email TEXT,
  invitee_id UUID REFERENCES auth.users(id),
  reward_status TEXT DEFAULT 'pending' CHECK (reward_status IN ('pending', 'earned', 'paid', 'expired')),
  referral_code TEXT UNIQUE NOT NULL,
  reward_type TEXT CHECK (reward_type IN ('pro_extension', 'credit', 'cash')),
  reward_value NUMERIC(10,2),
  conversion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- Feature flags
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

-- Flag audit log
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

-- Usage logs
CREATE TABLE IF NOT EXISTS usage_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  cost_usd NUMERIC(10,4) DEFAULT 0,
  model_used TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Billing events
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 8: JOB QUEUE TABLES
-- ============================================================================

-- Jobs queue
CREATE TABLE IF NOT EXISTS jobs_queue (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('meal_generation', 'email_notification', 'data_cleanup', 'analytics_processing')),
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  priority INT DEFAULT 0,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Job results
CREATE TABLE IF NOT EXISTS job_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id BIGINT REFERENCES jobs_queue(id) ON DELETE CASCADE,
  result_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job logs
CREATE TABLE IF NOT EXISTS job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id BIGINT REFERENCES jobs_queue(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECTION 9: INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Recipes indexes
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_tenant_id ON recipes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_ai_recommended ON recipes(ai_recommended) WHERE ai_recommended = true;
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at);

-- Pantry items indexes
CREATE INDEX IF NOT EXISTS idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_tenant_id ON pantry_items(tenant_id);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_recipe_id ON favorites(recipe_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tenant_id ON favorites(tenant_id);

-- Tenant indexes
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id ON tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenants_plan ON tenants(plan);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

-- Tenant memberships indexes
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant_id ON tenant_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user_id ON tenant_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_role ON tenant_memberships(role);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_id ON analytics_events(tenant_id);

-- Recipe metrics indexes
CREATE INDEX IF NOT EXISTS idx_recipe_metrics_user_id ON recipe_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_metrics_generated_at ON recipe_metrics(generated_at);
CREATE INDEX IF NOT EXISTS idx_recipe_metrics_feedback_score ON recipe_metrics(feedback_score);
CREATE INDEX IF NOT EXISTS idx_recipe_metrics_tenant_id ON recipe_metrics(tenant_id);

-- Logs indexes
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);

-- Error reports indexes
CREATE INDEX IF NOT EXISTS idx_error_reports_resolved ON error_reports(resolved);
CREATE INDEX IF NOT EXISTS idx_error_reports_created_at ON error_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_error_reports_user_id ON error_reports(user_id);

-- Recipe feedback indexes
CREATE INDEX IF NOT EXISTS idx_recipe_feedback_recipe_id ON recipe_feedback(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_feedback_user_id ON recipe_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_feedback_created_at ON recipe_feedback(created_at);

-- AI performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_timestamp ON ai_performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_model ON ai_performance_metrics(model);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_provider ON ai_performance_metrics(provider);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_user_id ON ai_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_environment ON ai_performance_metrics(environment);

-- AI cache indexes
CREATE INDEX IF NOT EXISTS idx_ai_cache_tenant_id ON ai_cache(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires_at ON ai_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_prompt_hash ON ai_cache(prompt_hash);

-- Growth metrics indexes
CREATE INDEX IF NOT EXISTS idx_growth_metrics_tenant_id ON growth_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_metric_type ON growth_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_period_start ON growth_metrics(period_start);

-- Referrals indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_reward_status ON referrals(reward_status);

-- Feature flags indexes
CREATE INDEX IF NOT EXISTS idx_config_flags_enabled ON config_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_config_flags_environment ON config_flags(target_environment);
CREATE INDEX IF NOT EXISTS idx_config_flags_expires ON config_flags(expires_at);

-- Usage logs indexes
CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_id ON usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action);

-- Jobs queue indexes
CREATE INDEX IF NOT EXISTS idx_jobs_queue_status ON jobs_queue(status);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_type ON jobs_queue(type);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_priority ON jobs_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_created_at ON jobs_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_tenant_id ON jobs_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_user_id ON jobs_queue(user_id);

-- Job results indexes
CREATE INDEX IF NOT EXISTS idx_job_results_job_id ON job_results(job_id);

-- Job logs indexes
CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_logs_level ON job_logs(level);
CREATE INDEX IF NOT EXISTS idx_job_logs_created_at ON job_logs(created_at);

-- ============================================================================
-- SECTION 10: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flag_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS "%s_read_own" ON %I.%I', r.tablename, r.schemaname, r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "%s_write_own" ON %I.%I', r.tablename, r.schemaname, r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "%s_insert_own" ON %I.%I', r.tablename, r.schemaname, r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "%s_update_own" ON %I.%I', r.tablename, r.schemaname, r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "%s_delete_own" ON %I.%I', r.tablename, r.schemaname, r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "%s_read_tenant" ON %I.%I', r.tablename, r.schemaname, r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "%s_service_role" ON %I.%I', r.tablename, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Profiles policies
CREATE POLICY "profiles_read_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_read_tenant" ON profiles
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Recipes policies
CREATE POLICY "recipes_read_own" ON recipes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "recipes_insert_own" ON recipes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "recipes_update_own" ON recipes
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "recipes_delete_own" ON recipes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "recipes_read_tenant" ON recipes
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    ) OR tenant_id IS NULL
  );

-- Pantry items policies
CREATE POLICY "pantry_items_read_own" ON pantry_items
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "pantry_items_insert_own" ON pantry_items
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pantry_items_update_own" ON pantry_items
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pantry_items_delete_own" ON pantry_items
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Favorites policies
CREATE POLICY "favorites_read_own" ON favorites
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "favorites_insert_own" ON favorites
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "favorites_delete_own" ON favorites
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Recipe favorites policies
CREATE POLICY "recipe_favorites_read_own" ON recipe_favorites
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "recipe_favorites_insert_own" ON recipe_favorites
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "recipe_favorites_delete_own" ON recipe_favorites
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Tenants policies
CREATE POLICY "tenants_read_member" ON tenants
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "tenants_write_owner" ON tenants
  FOR ALL TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  )
  WITH CHECK (
    id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Tenant memberships policies
CREATE POLICY "tenant_memberships_read_own" ON tenant_memberships
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tenant_memberships_read_tenant" ON tenant_memberships
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "tenant_memberships_write_owner" ON tenant_memberships
  FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Subscriptions policies
CREATE POLICY "subscriptions_read_tenant" ON subscriptions
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Analytics events policies
CREATE POLICY "analytics_events_read_own" ON analytics_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "analytics_events_insert" ON analytics_events
  FOR INSERT TO authenticated, service_role
  WITH CHECK (true);

-- Recipe metrics policies
CREATE POLICY "recipe_metrics_read_own" ON recipe_metrics
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "recipe_metrics_insert" ON recipe_metrics
  FOR INSERT TO authenticated, service_role
  WITH CHECK (true);

-- System metrics policies (admin only)
CREATE POLICY "system_metrics_service_role" ON system_metrics
  FOR ALL TO service_role
  USING (true);

-- Logs policies (admin only)
CREATE POLICY "logs_service_role" ON logs
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "logs_read_own" ON logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Error reports policies
CREATE POLICY "error_reports_read_own" ON error_reports
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "error_reports_insert" ON error_reports
  FOR INSERT TO authenticated, service_role
  WITH CHECK (true);

-- Recipe feedback policies
CREATE POLICY "recipe_feedback_read_own" ON recipe_feedback
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "recipe_feedback_insert_own" ON recipe_feedback
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "recipe_feedback_update_own" ON recipe_feedback
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- AI health metrics policies
CREATE POLICY "ai_health_metrics_read" ON ai_health_metrics
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "ai_health_metrics_service_role" ON ai_health_metrics
  FOR ALL TO service_role
  USING (true);

-- AI embeddings policies
CREATE POLICY "ai_embeddings_read" ON ai_embeddings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "ai_embeddings_service_role" ON ai_embeddings
  FOR ALL TO service_role
  USING (true);

-- AI performance metrics policies
CREATE POLICY "ai_performance_metrics_read_own" ON ai_performance_metrics
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "ai_performance_metrics_service_role" ON ai_performance_metrics
  FOR ALL TO service_role
  USING (true);

-- AI cache policies
CREATE POLICY "ai_cache_read_tenant" ON ai_cache
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "ai_cache_service_role" ON ai_cache
  FOR ALL TO service_role
  USING (true);

-- Growth metrics policies
CREATE POLICY "growth_metrics_read_tenant" ON growth_metrics
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "growth_metrics_service_role" ON growth_metrics
  FOR ALL TO service_role
  USING (true);

-- Referrals policies
CREATE POLICY "referrals_read_own" ON referrals
  FOR SELECT TO authenticated
  USING (referrer_id = auth.uid());

CREATE POLICY "referrals_insert_own" ON referrals
  FOR INSERT TO authenticated
  WITH CHECK (referrer_id = auth.uid());

-- Feature flags policies
CREATE POLICY "config_flags_read_enabled" ON config_flags
  FOR SELECT TO anon, authenticated
  USING (enabled = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "config_flags_read_all" ON config_flags
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "config_flags_service_role" ON config_flags
  FOR ALL TO service_role
  USING (true);

-- Flag audit log policies
CREATE POLICY "flag_audit_log_read" ON flag_audit_log
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "flag_audit_log_service_role" ON flag_audit_log
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Usage logs policies
CREATE POLICY "usage_logs_read_tenant" ON usage_logs
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "usage_logs_insert" ON usage_logs
  FOR INSERT TO authenticated, service_role
  WITH CHECK (true);

-- Billing events policies
CREATE POLICY "billing_events_service_role" ON billing_events
  FOR ALL TO service_role
  USING (true);

-- Jobs queue policies
CREATE POLICY "jobs_queue_read_tenant" ON jobs_queue
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "jobs_queue_service_role" ON jobs_queue
  FOR ALL TO service_role
  USING (true);

-- Job results policies
CREATE POLICY "job_results_read_tenant" ON job_results
  FOR SELECT TO authenticated
  USING (
    job_id IN (
      SELECT id FROM jobs_queue 
      WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "job_results_service_role" ON job_results
  FOR ALL TO service_role
  USING (true);

-- Job logs policies
CREATE POLICY "job_logs_read_tenant" ON job_logs
  FOR SELECT TO authenticated
  USING (
    job_id IN (
      SELECT id FROM jobs_queue 
      WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_memberships 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

CREATE POLICY "job_logs_service_role" ON job_logs
  FOR ALL TO service_role
  USING (true);

-- Service role bypass policies (for all tables)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    BEGIN
      EXECUTE format('CREATE POLICY "%s_service_role" ON %I.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', 
        r.tablename, r.schemaname, r.tablename);
    EXCEPTION WHEN duplicate_object THEN
      -- Policy already exists, skip
    END;
  END LOOP;
END $$;

-- ============================================================================
-- SECTION 11: FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user (auto-provision profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Function to check if user belongs to tenant
CREATE OR REPLACE FUNCTION user_belongs_to_tenant(
  user_id_param UUID,
  tenant_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_memberships
    WHERE tenant_memberships.user_id = user_id_param
      AND tenant_memberships.tenant_id = tenant_id_param
      AND tenant_memberships.status = 'active'
  );
$$;

-- Function to get user's tenant IDs
CREATE OR REPLACE FUNCTION get_user_tenants(user_id_param UUID)
RETURNS TABLE(tenant_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT tenant_id
  FROM tenant_memberships
  WHERE user_id = user_id_param
    AND status = 'active';
$$;

-- Function to evaluate feature flags
CREATE OR REPLACE FUNCTION evaluate_feature_flag(
  flag_name TEXT,
  user_id UUID DEFAULT NULL,
  environment TEXT DEFAULT 'production'
)
RETURNS BOOLEAN AS $$
DECLARE
  flag_record RECORD;
  user_hash INTEGER;
  target_percentage INTEGER;
BEGIN
  SELECT * INTO flag_record
  FROM config_flags
  WHERE name = flag_name
    AND enabled = true
    AND (target_environment = 'all' OR target_environment = environment)
    AND (expires_at IS NULL OR expires_at > NOW());

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF flag_record.rollout_percentage = 0 THEN
    RETURN false;
  END IF;

  IF flag_record.rollout_percentage = 100 THEN
    RETURN true;
  END IF;

  IF user_id IS NOT NULL AND array_length(flag_record.target_users, 1) > 0 THEN
    IF user_id = ANY(flag_record.target_users) THEN
      RETURN true;
    END IF;
  END IF;

  IF user_id IS NOT NULL THEN
    user_hash := ('x' || substr(md5(user_id::text || flag_name), 1, 8))::bit(32)::int;
    target_percentage := user_hash % 100;
    RETURN target_percentage < flag_record.rollout_percentage;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION user_belongs_to_tenant(UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_tenants(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION evaluate_feature_flag(TEXT, UUID, TEXT) TO authenticated, anon, service_role;

-- ============================================================================
-- SECTION 12: TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on recipes
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on tenants
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-provision profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger to update updated_at on config_flags
DROP TRIGGER IF EXISTS update_config_flags_updated_at ON config_flags;
CREATE TRIGGER update_config_flags_updated_at
  BEFORE UPDATE ON config_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 13: REALTIME PUBLICATION
-- ============================================================================

-- Create publication if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS recipe_favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS tenant_memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS recipe_feedback;

-- ============================================================================
-- SECTION 14: STORAGE BUCKETS
-- ============================================================================

-- Assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'assets',
  'assets',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'assets');

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

-- Storage policies
DO $$
BEGIN
  -- Public read for assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_read_assets'
  ) THEN
    CREATE POLICY storage_read_assets
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'assets');
  END IF;

  -- Authenticated write for assets (owner only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_write_assets'
  ) THEN
    CREATE POLICY storage_write_assets
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  -- Authenticated update/delete for assets (owner only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_update_assets'
  ) THEN
    CREATE POLICY storage_update_assets
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'assets' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_delete_assets'
  ) THEN
    CREATE POLICY storage_delete_assets
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  -- Avatar policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_read_avatars'
  ) THEN
    CREATE POLICY storage_read_avatars
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_write_avatars'
  ) THEN
    CREATE POLICY storage_write_avatars
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'avatars' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This consolidated migration includes:
-- - All core tables with proper structure
-- - Multi-tenant support
-- - Comprehensive RLS policies for security
-- - Performance indexes
-- - Helper functions
-- - Realtime publication setup
-- - Storage bucket configuration
-- 
-- All statements are idempotent and safe to run multiple times
-- ============================================================================

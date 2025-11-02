-- ============================================================================
-- PART 3: MULTI-TENANT SAAS SCHEMA - Run after Part 2
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

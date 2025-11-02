-- ============================================================================
-- PART 5: FEDERATED ECOSYSTEM SCHEMA - Run after Part 4
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

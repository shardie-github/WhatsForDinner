-- Federated Ecosystem Schema Migration
-- This migration creates the foundation for a unified, API-monetized ecosystem

-- Create partner_registry table for ecosystem partners
create table partner_registry (
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
create table federated_api_endpoints (
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
create table api_usage_tracking (
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
create table ai_model_advisor (
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
create table ai_evolution_logs (
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
create table franchise_deployments (
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
create table compliance_audit_logs (
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
create table anomaly_detections (
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
create table developer_portal_sessions (
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
create table sdk_downloads (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references auth.users(id),
  sdk_language text not null,
  sdk_version text not null,
  download_count int default 1,
  last_downloaded_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
create index idx_partner_registry_type on partner_registry(type);
create index idx_partner_registry_status on partner_registry(status);
create index idx_partner_registry_region on partner_registry(region);

create index idx_federated_endpoints_partner on federated_api_endpoints(partner_id);
create index idx_federated_endpoints_active on federated_api_endpoints(is_active);

create index idx_api_usage_partner on api_usage_tracking(partner_id);
create index idx_api_usage_tenant on api_usage_tracking(tenant_id);
create index idx_api_usage_timestamp on api_usage_tracking(timestamp);

create index idx_ai_model_advisor_provider on ai_model_advisor(provider);
create index idx_ai_model_advisor_active on ai_model_advisor(is_active);

create index idx_ai_evolution_tenant on ai_evolution_logs(tenant_id);
create index idx_ai_evolution_created on ai_evolution_logs(created_at);

create index idx_franchise_deployments_status on franchise_deployments(status);
create index idx_franchise_deployments_region on franchise_deployments(region);

create index idx_compliance_audit_tenant on compliance_audit_logs(tenant_id);
create index idx_compliance_audit_action on compliance_audit_logs(action_type);
create index idx_compliance_audit_created on compliance_audit_logs(created_at);

create index idx_anomaly_detections_tenant on anomaly_detections(tenant_id);
create index idx_anomaly_detections_type on anomaly_detections(detection_type);
create index idx_anomaly_detections_severity on anomaly_detections(severity);

create index idx_developer_sessions_developer on developer_portal_sessions(developer_id);
create index idx_developer_sessions_active on developer_portal_sessions(is_active);

create index idx_sdk_downloads_language on sdk_downloads(sdk_language);
create index idx_sdk_downloads_developer on sdk_downloads(developer_id);

-- Enable Row Level Security
alter table partner_registry enable row level security;
alter table federated_api_endpoints enable row level security;
alter table api_usage_tracking enable row level security;
alter table ai_model_advisor enable row level security;
alter table ai_evolution_logs enable row level security;
alter table franchise_deployments enable row level security;
alter table compliance_audit_logs enable row level security;
alter table anomaly_detections enable row level security;
alter table developer_portal_sessions enable row level security;
alter table sdk_downloads enable row level security;

-- RLS Policies for partner_registry
create policy "Partners can view their own registry" on partner_registry
  for select using (true); -- Public read for discovery

create policy "System can manage partner registry" on partner_registry
  for all using (true);

-- RLS Policies for federated_api_endpoints
create policy "Public can view active endpoints" on federated_api_endpoints
  for select using (is_active = true);

create policy "System can manage endpoints" on federated_api_endpoints
  for all using (true);

-- RLS Policies for api_usage_tracking
create policy "Tenants can view their usage" on api_usage_tracking
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage usage tracking" on api_usage_tracking
  for all using (true);

-- RLS Policies for ai_model_advisor
create policy "Public can view model advisor" on ai_model_advisor
  for select using (is_active = true);

create policy "System can manage model advisor" on ai_model_advisor
  for all using (true);

-- RLS Policies for ai_evolution_logs
create policy "Tenants can view their evolution logs" on ai_evolution_logs
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage evolution logs" on ai_evolution_logs
  for all using (true);

-- RLS Policies for franchise_deployments
create policy "Franchise owners can view their deployments" on franchise_deployments
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage franchise deployments" on franchise_deployments
  for all using (true);

-- RLS Policies for compliance_audit_logs
create policy "Tenants can view their audit logs" on compliance_audit_logs
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage audit logs" on compliance_audit_logs
  for all using (true);

-- RLS Policies for anomaly_detections
create policy "Tenants can view their anomalies" on anomaly_detections
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage anomalies" on anomaly_detections
  for all using (true);

-- RLS Policies for developer_portal_sessions
create policy "Developers can view their sessions" on developer_portal_sessions
  for select using (developer_id = auth.uid());

create policy "Developers can manage their sessions" on developer_portal_sessions
  for all using (developer_id = auth.uid());

-- RLS Policies for sdk_downloads
create policy "Developers can view their downloads" on sdk_downloads
  for select using (developer_id = auth.uid());

create policy "System can manage downloads" on sdk_downloads
  for all using (true);

-- Functions for federated ecosystem

-- Function to register a new partner
create or replace function register_partner(
  name_param text,
  type_param text,
  api_base_param text,
  api_key_param text default null,
  webhook_url_param text default null,
  revenue_share_percent_param numeric default 0.0,
  region_param text default 'global',
  capabilities_param jsonb default '{}',
  metadata_param jsonb default '{}'
)
returns uuid as $$
declare
  partner_id_val uuid;
begin
  insert into partner_registry (
    name, type, api_base, api_key, webhook_url, 
    revenue_share_percent, region, capabilities, metadata
  ) values (
    name_param, type_param, api_base_param, api_key_param, webhook_url_param,
    revenue_share_percent_param, region_param, capabilities_param, metadata_param
  ) returning id into partner_id_val;
  
  return partner_id_val;
end;
$$ language plpgsql security definer;

-- Function to track API usage
create or replace function track_api_usage(
  partner_id_param uuid,
  tenant_id_param uuid,
  endpoint_id_param uuid,
  user_id_param uuid,
  request_id_param text,
  method_param text,
  endpoint_param text,
  status_code_param int,
  response_time_ms_param int,
  tokens_used_param int default 0,
  cost_usd_param numeric default 0.0,
  metadata_param jsonb default '{}'
)
returns void as $$
declare
  partner_revenue_share numeric;
  revenue_usd_val numeric;
begin
  -- Get partner revenue share
  select revenue_share_percent into partner_revenue_share
  from partner_registry
  where id = partner_id_param;
  
  -- Calculate partner revenue
  revenue_usd_val := cost_usd_param * (partner_revenue_share / 100.0);
  
  -- Insert usage tracking record
  insert into api_usage_tracking (
    partner_id, tenant_id, endpoint_id, user_id, request_id,
    method, endpoint, status_code, response_time_ms,
    tokens_used, cost_usd, revenue_usd, metadata
  ) values (
    partner_id_param, tenant_id_param, endpoint_id_param, user_id_param, request_id_param,
    method_param, endpoint_param, status_code_param, response_time_ms_param,
    tokens_used_param, cost_usd_param, revenue_usd_val, metadata_param
  );
end;
$$ language plpgsql security definer;

-- Function to get optimal AI model
create or replace function get_optimal_ai_model(
  estimated_tokens_param int,
  quality_requirement_param numeric default 0.8,
  max_latency_ms_param int default 5000
)
returns table(
  model_name text,
  provider text,
  cost_per_1k_tokens numeric,
  quality_score numeric,
  latency_ms int,
  total_cost numeric
) as $$
begin
  return query
  select 
    ama.model_name,
    ama.provider,
    ama.cost_per_1k_tokens,
    ama.quality_score,
    ama.latency_ms,
    (ama.cost_per_1k_tokens * estimated_tokens_param / 1000.0) as total_cost
  from ai_model_advisor ama
  where ama.is_active = true
    and ama.quality_score >= quality_requirement_param
    and ama.latency_ms <= max_latency_ms_param
  order by total_cost asc, ama.quality_score desc
  limit 5;
end;
$$ language plpgsql security definer;

-- Function to detect anomalies
create or replace function detect_anomalies(
  tenant_id_param uuid,
  detection_type_param text,
  threshold_multiplier_param numeric default 2.0
)
returns void as $$
declare
  anomaly_count int;
  avg_value numeric;
  current_value numeric;
begin
  -- Example: Detect API abuse (simplified)
  if detection_type_param = 'api_abuse' then
    -- Get average API calls per hour for this tenant
    select avg(count) into avg_value
    from (
      select count(*) as count
      from api_usage_tracking
      where tenant_id = tenant_id_param
        and timestamp >= now() - interval '24 hours'
      group by date_trunc('hour', timestamp)
    ) hourly_counts;
    
    -- Get current hour's API calls
    select count(*) into current_value
    from api_usage_tracking
    where tenant_id = tenant_id_param
      and timestamp >= date_trunc('hour', now());
    
    -- Check if current usage exceeds threshold
    if current_value > (avg_value * threshold_multiplier_param) then
      insert into anomaly_detections (
        tenant_id, detection_type, severity, description, metadata
      ) values (
        tenant_id_param, 
        'api_abuse', 
        'high',
        'API usage spike detected: ' || current_value || ' calls vs avg ' || avg_value,
        jsonb_build_object(
          'current_usage', current_value,
          'average_usage', avg_value,
          'threshold', avg_value * threshold_multiplier_param
        )
      );
    end if;
  end if;
end;
$$ language plpgsql security definer;

-- Function to create franchise deployment
create or replace function create_franchise_deployment(
  franchise_name_param text,
  domain_param text,
  tenant_id_param uuid,
  region_param text,
  custom_theme_param jsonb default '{}',
  features_enabled_param jsonb default '{}'
)
returns uuid as $$
declare
  deployment_id_val uuid;
  deployment_manifest_val jsonb;
begin
  -- Create deployment manifest
  deployment_manifest_val := jsonb_build_object(
    'franchise_name', franchise_name_param,
    'domain', domain_param,
    'region', region_param,
    'tenant_id', tenant_id_param,
    'created_at', now(),
    'version', '1.0.0',
    'features', features_enabled_param,
    'theme', custom_theme_param
  );
  
  -- Insert franchise deployment
  insert into franchise_deployments (
    franchise_name, domain, tenant_id, region, 
    deployment_manifest, custom_theme, features_enabled
  ) values (
    franchise_name_param, domain_param, tenant_id_param, region_param,
    deployment_manifest_val, custom_theme_param, features_enabled_param
  ) returning id into deployment_id_val;
  
  return deployment_id_val;
end;
$$ language plpgsql security definer;

-- Function to log compliance audit
create or replace function log_compliance_audit(
  tenant_id_param uuid,
  user_id_param uuid,
  action_type_param text,
  resource_type_param text,
  resource_id_param text,
  old_values_param jsonb default null,
  new_values_param jsonb default null,
  ip_address_param inet default null,
  user_agent_param text default null
)
returns void as $$
declare
  risk_score_val numeric := 0.0;
  compliance_flags_val jsonb := '{}';
begin
  -- Calculate risk score based on action type
  case action_type_param
    when 'user_deletion' then risk_score_val := 0.8;
    when 'data_export' then risk_score_val := 0.6;
    when 'billing_change' then risk_score_val := 0.4;
    when 'api_key_creation' then risk_score_val := 0.3;
    else risk_score_val := 0.1;
  end case;
  
  -- Set compliance flags
  if action_type_param in ('user_deletion', 'data_export') then
    compliance_flags_val := jsonb_build_object('gdpr_relevant', true);
  end if;
  
  -- Insert audit log
  insert into compliance_audit_logs (
    tenant_id, user_id, action_type, resource_type, resource_id,
    old_values, new_values, ip_address, user_agent,
    risk_score, compliance_flags
  ) values (
    tenant_id_param, user_id_param, action_type_param, resource_type_param, resource_id_param,
    old_values_param, new_values_param, ip_address_param, user_agent_param,
    risk_score_val, compliance_flags_val
  );
end;
$$ language plpgsql security definer;

-- Insert initial AI model data
insert into ai_model_advisor (model_name, provider, cost_per_1k_tokens, quality_score, latency_ms, context_window) values
('gpt-4o', 'openai', 0.005, 0.95, 1200, 128000),
('gpt-4o-mini', 'openai', 0.00015, 0.85, 800, 128000),
('claude-3-5-sonnet', 'anthropic', 0.003, 0.92, 1000, 200000),
('claude-3-haiku', 'anthropic', 0.00025, 0.80, 600, 200000),
('gemini-pro', 'google', 0.0005, 0.88, 900, 32000);

-- Create initial partner registry entries
insert into partner_registry (name, type, api_base, revenue_share_percent, region, capabilities, status) values
('Shopify Integration', 'shopify', 'https://api.shopify.com/v1', 5.0, 'global', '{"meal_kits": true, "inventory": true}', 'active'),
('Zapier Automation', 'zapier', 'https://hooks.zapier.com/hooks', 3.0, 'global', '{"automation": true, "workflows": true}', 'active'),
('Alexa Skills', 'alexa', 'https://api.amazonalexa.com/v1', 2.0, 'global', '{"voice": true, "smart_home": true}', 'pending'),
('Google Home', 'google_home', 'https://homegraph.googleapis.com/v1', 2.0, 'global', '{"voice": true, "assistant": true}', 'pending'),
('TikTok API', 'tiktok', 'https://open-api.tiktok.com/v1', 4.0, 'global', '{"video": true, "social": true}', 'pending'),
('Instagram API', 'instagram', 'https://graph.instagram.com/v1', 4.0, 'global', '{"photo": true, "stories": true}', 'pending');
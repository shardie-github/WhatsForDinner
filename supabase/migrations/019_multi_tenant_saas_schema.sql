-- Multi-tenant SaaS schema migration
-- This migration transforms the app into a scalable, monetized, multi-tenant SaaS platform

-- Create tenants table
create table tenants (
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
create table tenant_memberships (
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
create table subscriptions (
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
create table usage_logs (
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
create table tenant_invites (
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
create table ai_cache (
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
create table billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  processed boolean default false,
  data jsonb not null,
  created_at timestamp with time zone default now()
);

-- Update existing tables to support multi-tenancy
-- Add tenant_id to profiles table
alter table profiles add column tenant_id uuid references tenants(id);
alter table profiles add column role text default 'owner' check (role in ('owner', 'editor', 'viewer'));

-- Add tenant_id to all existing tables
alter table pantry_items add column tenant_id uuid references tenants(id);
alter table recipes add column tenant_id uuid references tenants(id);
alter table favorites add column tenant_id uuid references tenants(id);
alter table analytics_events add column tenant_id uuid references tenants(id);
alter table recipe_metrics add column tenant_id uuid references tenants(id);
alter table recipe_feedback add column tenant_id uuid references tenants(id);

-- Create indexes for performance
create index idx_tenants_stripe_customer_id on tenants(stripe_customer_id);
create index idx_tenants_plan on tenants(plan);
create index idx_tenants_status on tenants(status);

create index idx_tenant_memberships_tenant_id on tenant_memberships(tenant_id);
create index idx_tenant_memberships_user_id on tenant_memberships(user_id);
create index idx_tenant_memberships_role on tenant_memberships(role);

create index idx_subscriptions_tenant_id on subscriptions(tenant_id);
create index idx_subscriptions_stripe_subscription_id on subscriptions(stripe_subscription_id);
create index idx_subscriptions_status on subscriptions(status);

create index idx_usage_logs_tenant_id on usage_logs(tenant_id);
create index idx_usage_logs_user_id on usage_logs(user_id);
create index idx_usage_logs_timestamp on usage_logs(timestamp);
create index idx_usage_logs_action on usage_logs(action);

create index idx_tenant_invites_token on tenant_invites(token);
create index idx_tenant_invites_tenant_id on tenant_invites(tenant_id);
create index idx_tenant_invites_expires_at on tenant_invites(expires_at);

create index idx_ai_cache_tenant_id on ai_cache(tenant_id);
create index idx_ai_cache_expires_at on ai_cache(expires_at);
create index idx_ai_cache_prompt_hash on ai_cache(prompt_hash);

create index idx_billing_events_stripe_event_id on billing_events(stripe_event_id);
create index idx_billing_events_processed on billing_events(processed);

-- Add tenant_id indexes to existing tables
create index idx_profiles_tenant_id on profiles(tenant_id);
create index idx_pantry_items_tenant_id on pantry_items(tenant_id);
create index idx_recipes_tenant_id on recipes(tenant_id);
create index idx_favorites_tenant_id on favorites(tenant_id);
create index idx_analytics_events_tenant_id on analytics_events(tenant_id);
create index idx_recipe_metrics_tenant_id on recipe_metrics(tenant_id);
create index idx_recipe_feedback_tenant_id on recipe_feedback(tenant_id);

-- Enable Row Level Security on new tables
alter table tenants enable row level security;
alter table tenant_memberships enable row level security;
alter table subscriptions enable row level security;
alter table usage_logs enable row level security;
alter table tenant_invites enable row level security;
alter table ai_cache enable row level security;
alter table billing_events enable row level security;

-- RLS Policies for tenants
create policy "Users can view tenants they belong to" on tenants
  for select using (
    id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Tenant owners can update their tenant" on tenants
  for update using (
    id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- RLS Policies for tenant_memberships
create policy "Users can view memberships for their tenants" on tenant_memberships
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Tenant owners can manage memberships" on tenant_memberships
  for all using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- RLS Policies for subscriptions
create policy "Users can view their tenant subscriptions" on subscriptions
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

-- RLS Policies for usage_logs
create policy "Users can view usage logs for their tenants" on usage_logs
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can insert usage logs" on usage_logs
  for insert with check (true);

-- RLS Policies for tenant_invites
create policy "Users can view invites for their tenants" on tenant_invites
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid() and role = 'owner'
    )
  );

create policy "Tenant owners can manage invites" on tenant_invites
  for all using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- RLS Policies for ai_cache
create policy "Users can access cache for their tenants" on ai_cache
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage ai_cache" on ai_cache
  for all using (true);

-- RLS Policies for billing_events
create policy "System can manage billing events" on billing_events
  for all using (true);

-- Update existing RLS policies to include tenant isolation
-- Drop existing policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

drop policy if exists "Users can view own pantry items" on pantry_items;
drop policy if exists "Users can insert own pantry items" on pantry_items;
drop policy if exists "Users can update own pantry items" on pantry_items;
drop policy if exists "Users can delete own pantry items" on pantry_items;

drop policy if exists "Users can view own recipes" on recipes;
drop policy if exists "Users can insert own recipes" on recipes;
drop policy if exists "Users can update own recipes" on recipes;
drop policy if exists "Users can delete own recipes" on recipes;

drop policy if exists "Users can view own favorites" on favorites;
drop policy if exists "Users can insert own favorites" on favorites;
drop policy if exists "Users can delete own favorites" on favorites;

-- Create new tenant-aware policies
create policy "Users can view profiles in their tenants" on profiles
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can update profiles in their tenants" on profiles
  for update using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert profiles in their tenants" on profiles
  for insert with check (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can view pantry items in their tenants" on pantry_items
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert pantry items in their tenants" on pantry_items
  for insert with check (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can update pantry items in their tenants" on pantry_items
  for update using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can delete pantry items in their tenants" on pantry_items
  for delete using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can view recipes in their tenants" on recipes
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert recipes in their tenants" on recipes
  for insert with check (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can update recipes in their tenants" on recipes
  for update using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can delete recipes in their tenants" on recipes
  for delete using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can view favorites in their tenants" on favorites
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert favorites in their tenants" on favorites
  for insert with check (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can delete favorites in their tenants" on favorites
  for delete using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

-- Update analytics policies to include tenant isolation
drop policy if exists "Users can view own analytics events" on analytics_events;
drop policy if exists "System can insert analytics events" on analytics_events;

create policy "Users can view analytics events in their tenants" on analytics_events
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    ) or tenant_id is null
  );

create policy "System can insert analytics events" on analytics_events
  for insert with check (true);

-- Update recipe metrics policies
drop policy if exists "Users can view own recipe metrics" on recipe_metrics;
drop policy if exists "System can insert recipe metrics" on recipe_metrics;

create policy "Users can view recipe metrics in their tenants" on recipe_metrics
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can insert recipe metrics" on recipe_metrics
  for insert with check (true);

-- Update recipe feedback policies
drop policy if exists "Users can view own recipe feedback" on recipe_feedback;
drop policy if exists "Users can insert own recipe feedback" on recipe_feedback;
drop policy if exists "Users can update own recipe feedback" on recipe_feedback;

create policy "Users can view recipe feedback in their tenants" on recipe_feedback
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert recipe feedback in their tenants" on recipe_feedback
  for insert with check (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can update recipe feedback in their tenants" on recipe_feedback
  for update using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

-- Create functions for tenant management
create or replace function create_tenant_for_user(
  user_id uuid,
  tenant_name text,
  user_name text default null
)
returns uuid as $$
declare
  new_tenant_id uuid;
  new_profile_id uuid;
begin
  -- Create tenant
  insert into tenants (name, plan, status)
  values (tenant_name, 'free', 'active')
  returning id into new_tenant_id;
  
  -- Create tenant membership for owner
  insert into tenant_memberships (tenant_id, user_id, role, status)
  values (new_tenant_id, user_id, 'owner', 'active');
  
  -- Create or update profile with tenant_id
  insert into profiles (id, name, tenant_id, role)
  values (user_id, user_name, new_tenant_id, 'owner')
  on conflict (id) do update set
    tenant_id = new_tenant_id,
    role = 'owner',
    name = coalesce(user_name, profiles.name);
  
  return new_tenant_id;
end;
$$ language plpgsql security definer;

-- Function to check user's quota
create or replace function check_user_quota(
  user_id_param uuid,
  action_param text
)
returns boolean as $$
declare
  user_tenant_id uuid;
  user_plan text;
  daily_usage int;
  quota_limit int;
begin
  -- Get user's tenant and plan
  select tm.tenant_id, t.plan into user_tenant_id, user_plan
  from tenant_memberships tm
  join tenants t on t.id = tm.tenant_id
  where tm.user_id = user_id_param and tm.status = 'active';
  
  if user_tenant_id is null then
    return false;
  end if;
  
  -- Set quota limits based on plan
  case user_plan
    when 'free' then quota_limit := 3;
    when 'pro' then quota_limit := 1000;
    when 'family' then quota_limit := 1000;
    else quota_limit := 0;
  end case;
  
  -- Check daily usage for meal generation
  if action_param = 'meal_generation' then
    select count(*) into daily_usage
    from usage_logs
    where tenant_id = user_tenant_id
      and action = 'meal_generation'
      and timestamp >= current_date;
    
    return daily_usage < quota_limit;
  end if;
  
  return true;
end;
$$ language plpgsql security definer;

-- Function to log usage
create or replace function log_usage(
  user_id_param uuid,
  action_param text,
  tokens_used_param int default 0,
  cost_usd_param numeric default 0,
  model_used_param text default null,
  metadata_param jsonb default '{}'
)
returns void as $$
declare
  user_tenant_id uuid;
begin
  -- Get user's tenant
  select tm.tenant_id into user_tenant_id
  from tenant_memberships tm
  where tm.user_id = user_id_param and tm.status = 'active';
  
  if user_tenant_id is null then
    return;
  end if;
  
  -- Insert usage log
  insert into usage_logs (
    user_id, tenant_id, action, tokens_used, 
    cost_usd, model_used, metadata
  ) values (
    user_id_param, user_tenant_id, action_param, 
    tokens_used_param, cost_usd_param, model_used_param, metadata_param
  );
end;
$$ language plpgsql security definer;

-- Function to get tenant usage summary
create or replace function get_tenant_usage_summary(tenant_id_param uuid)
returns table(
  total_meals_today bigint,
  total_tokens_today bigint,
  total_cost_today numeric,
  plan_quota int,
  remaining_quota bigint
) as $$
declare
  tenant_plan text;
  quota_limit int;
begin
  -- Get tenant plan
  select plan into tenant_plan from tenants where id = tenant_id_param;
  
  -- Set quota based on plan
  case tenant_plan
    when 'free' then quota_limit := 3;
    when 'pro' then quota_limit := 1000;
    when 'family' then quota_limit := 1000;
    else quota_limit := 0;
  end case;
  
  return query
  select 
    count(*) filter (where action = 'meal_generation' and timestamp >= current_date) as total_meals_today,
    coalesce(sum(tokens_used) filter (where timestamp >= current_date), 0) as total_tokens_today,
    coalesce(sum(cost_usd) filter (where timestamp >= current_date), 0) as total_cost_today,
    quota_limit as plan_quota,
    greatest(quota_limit - count(*) filter (where action = 'meal_generation' and timestamp >= current_date), 0) as remaining_quota
  from usage_logs
  where tenant_id = tenant_id_param;
end;
$$ language plpgsql security definer;

-- Create trigger to update updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_tenants_updated_at before update on tenants
  for each row execute function update_updated_at_column();

create trigger update_subscriptions_updated_at before update on subscriptions
  for each row execute function update_updated_at_column();

-- Create function to clean up expired cache entries
create or replace function cleanup_expired_cache()
returns void as $$
begin
  delete from ai_cache where expires_at < now();
end;
$$ language plpgsql security definer;

-- Create function to clean up expired invites
create or replace function cleanup_expired_invites()
returns void as $$
begin
  delete from tenant_invites where expires_at < now() and used_at is null;
end;
$$ language plpgsql security definer;

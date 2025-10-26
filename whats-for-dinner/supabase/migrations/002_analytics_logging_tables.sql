-- Analytics and logging tables for self-optimizing system

-- Analytics events table
create table analytics_events (
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
create table recipe_metrics (
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
create table system_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_type text not null check (metric_type in ('api_performance', 'user_engagement', 'error_rate', 'cost_analysis')),
  value numeric not null,
  metadata jsonb default '{}',
  timestamp timestamptz default now()
);

-- Logs table
create table logs (
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
create table error_reports (
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
create table recipe_feedback (
  id bigint generated always as identity primary key,
  recipe_id bigint references recipes(id),
  user_id uuid references profiles(id),
  feedback_type text not null check (feedback_type in ('thumbs_up', 'thumbs_down', 'rating')),
  score int check (score >= 1 and score <= 5),
  feedback_text text,
  created_at timestamptz default now()
);

-- AI configuration table
create table ai_config (
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
create table workflow_state (
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

-- Enable Row Level Security
alter table analytics_events enable row level security;
alter table recipe_metrics enable row level security;
alter table system_metrics enable row level security;
alter table logs enable row level security;
alter table error_reports enable row level security;
alter table recipe_feedback enable row level security;
alter table ai_config enable row level security;
alter table workflow_state enable row level security;

-- RLS Policies for analytics_events
create policy "Users can view own analytics events" on analytics_events
  for select using (auth.uid() = user_id or user_id is null);

create policy "System can insert analytics events" on analytics_events
  for insert with check (true);

-- RLS Policies for recipe_metrics
create policy "Users can view own recipe metrics" on recipe_metrics
  for select using (auth.uid() = user_id);

create policy "System can insert recipe metrics" on recipe_metrics
  for insert with check (true);

-- RLS Policies for system_metrics (admin only)
create policy "System can manage system metrics" on system_metrics
  for all using (true);

-- RLS Policies for logs (admin only)
create policy "System can manage logs" on logs
  for all using (true);

-- RLS Policies for error_reports
create policy "Users can view own error reports" on error_reports
  for select using (auth.uid() = user_id or user_id is null);

create policy "System can manage error reports" on error_reports
  for all using (true);

-- RLS Policies for recipe_feedback
create policy "Users can view own recipe feedback" on recipe_feedback
  for select using (auth.uid() = user_id);

create policy "Users can insert own recipe feedback" on recipe_feedback
  for insert with check (auth.uid() = user_id);

create policy "Users can update own recipe feedback" on recipe_feedback
  for update using (auth.uid() = user_id);

-- RLS Policies for ai_config (admin only)
create policy "System can manage ai_config" on ai_config
  for all using (true);

-- RLS Policies for workflow_state (admin only)
create policy "System can manage workflow_state" on workflow_state
  for all using (true);

-- Indexes for performance
create index idx_analytics_events_user_id on analytics_events(user_id);
create index idx_analytics_events_timestamp on analytics_events(timestamp);
create index idx_analytics_events_event_type on analytics_events(event_type);

create index idx_recipe_metrics_user_id on recipe_metrics(user_id);
create index idx_recipe_metrics_generated_at on recipe_metrics(generated_at);
create index idx_recipe_metrics_feedback_score on recipe_metrics(feedback_score);

create index idx_system_metrics_metric_type on system_metrics(metric_type);
create index idx_system_metrics_timestamp on system_metrics(timestamp);

create index idx_logs_level on logs(level);
create index idx_logs_timestamp on logs(timestamp);
create index idx_logs_source on logs(source);
create index idx_logs_user_id on logs(user_id);

create index idx_error_reports_resolved on error_reports(resolved);
create index idx_error_reports_created_at on error_reports(created_at);
create index idx_error_reports_user_id on error_reports(user_id);

create index idx_recipe_feedback_recipe_id on recipe_feedback(recipe_id);
create index idx_recipe_feedback_user_id on recipe_feedback(user_id);
create index idx_recipe_feedback_created_at on recipe_feedback(created_at);

create index idx_ai_config_active on ai_config(is_active);
create index idx_ai_config_version on ai_config(version);

create index idx_workflow_state_status on workflow_state(status);
create index idx_workflow_state_workflow_name on workflow_state(workflow_name);

-- Functions for analytics
create or replace function get_popular_ingredients(limit_count int default 10)
returns table(ingredient text, usage_count bigint) as $$
begin
  return query
  select 
    unnest(ingredients_used) as ingredient,
    count(*) as usage_count
  from recipe_metrics
  where generated_at >= now() - interval '30 days'
  group by ingredient
  order by usage_count desc
  limit limit_count;
end;
$$ language plpgsql;

create or replace function get_cuisine_preferences()
returns table(cuisine_type text, preference_count bigint) as $$
begin
  return query
  select 
    cuisine_type,
    count(*) as preference_count
  from recipe_metrics
  where generated_at >= now() - interval '30 days'
    and cuisine_type is not null
  group by cuisine_type
  order by preference_count desc;
end;
$$ language plpgsql;

create or replace function get_recipe_feedback_summary(recipe_id_param bigint)
returns table(
  total_feedback bigint,
  average_rating numeric,
  thumbs_up_count bigint,
  thumbs_down_count bigint
) as $$
begin
  return query
  select 
    count(*) as total_feedback,
    avg(score) as average_rating,
    count(*) filter (where feedback_type = 'thumbs_up') as thumbs_up_count,
    count(*) filter (where feedback_type = 'thumbs_down') as thumbs_down_count
  from recipe_feedback
  where recipe_id = recipe_id_param;
end;
$$ language plpgsql;

-- Function to update recipe feedback scores
create or replace function update_recipe_feedback(
  recipe_id_param bigint,
  user_id_param uuid,
  feedback_type_param text,
  score_param int default null,
  feedback_text_param text default null
)
returns bigint as $$
declare
  feedback_id bigint;
begin
  insert into recipe_feedback (
    recipe_id,
    user_id,
    feedback_type,
    score,
    feedback_text
  ) values (
    recipe_id_param,
    user_id_param,
    feedback_type_param,
    score_param,
    feedback_text_param
  ) returning id into feedback_id;
  
  -- Update the recipe_metrics table with the feedback score
  if score_param is not null then
    update recipe_metrics 
    set feedback_score = score_param
    where recipe_id = recipe_id_param
      and user_id = user_id_param;
  end if;
  
  return feedback_id;
end;
$$ language plpgsql;
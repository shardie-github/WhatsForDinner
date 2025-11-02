-- ============================================================================
-- PART 2: ANALYTICS AND LOGGING TABLES - Run after Part 1
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

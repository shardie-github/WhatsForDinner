-- ============================================================================
-- PART 6: JOB QUEUE SCHEMA - Run after Part 5
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

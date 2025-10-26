-- Job queue schema for asynchronous task processing
-- This migration adds the jobs_queue table and related functionality

-- Create jobs_queue table
create table jobs_queue (
  id bigint generated always as identity primary key,
  type text not null check (type in ('meal_generation', 'email_notification', 'data_cleanup', 'analytics_processing')),
  payload jsonb not null default '{}',
  status text not null check (status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  priority int default 0, -- Higher numbers = higher priority
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
create table job_results (
  id uuid primary key default gen_random_uuid(),
  job_id bigint references jobs_queue(id) on delete cascade,
  result_data jsonb not null,
  created_at timestamptz default now()
);

-- Create job logs table for detailed logging
create table job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id bigint references jobs_queue(id) on delete cascade,
  level text not null check (level in ('debug', 'info', 'warn', 'error')),
  message text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Add indexes for performance
create index idx_jobs_queue_status on jobs_queue(status);
create index idx_jobs_queue_type on jobs_queue(type);
create index idx_jobs_queue_priority on jobs_queue(priority desc);
create index idx_jobs_queue_created_at on jobs_queue(created_at);
create index idx_jobs_queue_tenant_id on jobs_queue(tenant_id);
create index idx_jobs_queue_user_id on jobs_queue(user_id);

create index idx_job_results_job_id on job_results(job_id);
create index idx_job_logs_job_id on job_logs(job_id);
create index idx_job_logs_level on job_logs(level);
create index idx_job_logs_created_at on job_logs(created_at);

-- Enable Row Level Security
alter table jobs_queue enable row level security;
alter table job_results enable row level security;
alter table job_logs enable row level security;

-- RLS Policies for jobs_queue
create policy "Users can view jobs in their tenants" on jobs_queue
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage all jobs" on jobs_queue
  for all using (true);

-- RLS Policies for job_results
create policy "Users can view job results in their tenants" on job_results
  for select using (
    job_id in (
      select id from jobs_queue 
      where tenant_id in (
        select tenant_id from tenant_memberships 
        where user_id = auth.uid()
      )
    )
  );

create policy "System can manage job results" on job_results
  for all using (true);

-- RLS Policies for job_logs
create policy "Users can view job logs in their tenants" on job_logs
  for select using (
    job_id in (
      select id from jobs_queue 
      where tenant_id in (
        select tenant_id from tenant_memberships 
        where user_id = auth.uid()
      )
    )
  );

create policy "System can manage job logs" on job_logs
  for all using (true);

-- Function to create a job
create or replace function create_job(
  job_type text,
  job_payload jsonb,
  job_priority int default 0,
  job_tenant_id uuid default null,
  job_user_id uuid default null,
  job_max_retries int default 3
)
returns bigint as $$
declare
  new_job_id bigint;
begin
  insert into jobs_queue (
    type, payload, priority, tenant_id, user_id, max_retries
  ) values (
    job_type, job_payload, job_priority, job_tenant_id, job_user_id, job_max_retries
  ) returning id into new_job_id;
  
  return new_job_id;
end;
$$ language plpgsql security definer;

-- Function to get next pending job
create or replace function get_next_job()
returns table(
  job_id bigint,
  job_type text,
  job_payload jsonb,
  job_priority int,
  job_tenant_id uuid,
  job_user_id uuid,
  job_max_retries int,
  job_retry_count int
) as $$
declare
  next_job record;
begin
  -- Lock and get the next job
  select id, type, payload, priority, tenant_id, user_id, max_retries, retry_count
  into next_job
  from jobs_queue
  where status = 'pending'
  order by priority desc, created_at asc
  limit 1
  for update skip locked;
  
  if next_job.id is not null then
    -- Update job status to processing
    update jobs_queue
    set status = 'processing', started_at = now(), updated_at = now()
    where id = next_job.id;
    
    -- Return job details
    return query select 
      next_job.id, next_job.type, next_job.payload, next_job.priority,
      next_job.tenant_id, next_job.user_id, next_job.max_retries, next_job.retry_count;
  end if;
  
  return;
end;
$$ language plpgsql security definer;

-- Function to complete a job
create or replace function complete_job(
  job_id_param bigint,
  result_data jsonb default null,
  success boolean default true
)
returns void as $$
begin
  if success then
    update jobs_queue
    set status = 'completed', completed_at = now(), updated_at = now()
    where id = job_id_param;
    
    -- Store result if provided
    if result_data is not null then
      insert into job_results (job_id, result_data)
      values (job_id_param, result_data);
    end if;
  else
    update jobs_queue
    set status = 'failed', completed_at = now(), updated_at = now()
    where id = job_id_param;
  end if;
end;
$$ language plpgsql security definer;

-- Function to fail a job with retry logic
create or replace function fail_job(
  job_id_param bigint,
  error_message_param text
)
returns void as $$
declare
  job_record record;
begin
  select retry_count, max_retries into job_record
  from jobs_queue
  where id = job_id_param;
  
  if job_record.retry_count < job_record.max_retries then
    -- Retry the job
    update jobs_queue
    set 
      status = 'pending',
      retry_count = job_record.retry_count + 1,
      error_message = error_message_param,
      updated_at = now(),
      started_at = null
    where id = job_id_param;
  else
    -- Mark as permanently failed
    update jobs_queue
    set 
      status = 'failed',
      error_message = error_message_param,
      completed_at = now(),
      updated_at = now()
    where id = job_id_param;
  end if;
end;
$$ language plpgsql security definer;

-- Function to log job activity
create or replace function log_job_activity(
  job_id_param bigint,
  log_level text,
  log_message text,
  log_metadata jsonb default '{}'
)
returns void as $$
begin
  insert into job_logs (job_id, level, message, metadata)
  values (job_id_param, log_level, log_message, log_metadata);
end;
$$ language plpgsql security definer;

-- Function to clean up old completed jobs
create or replace function cleanup_old_jobs(
  days_to_keep int default 30
)
returns void as $$
begin
  -- Delete old completed jobs and their related data
  delete from job_logs
  where job_id in (
    select id from jobs_queue
    where status in ('completed', 'failed')
    and completed_at < now() - interval '1 day' * days_to_keep
  );
  
  delete from job_results
  where job_id in (
    select id from jobs_queue
    where status in ('completed', 'failed')
    and completed_at < now() - interval '1 day' * days_to_keep
  );
  
  delete from jobs_queue
  where status in ('completed', 'failed')
  and completed_at < now() - interval '1 day' * days_to_keep;
end;
$$ language plpgsql security definer;

-- Function to get job statistics
create or replace function get_job_stats(tenant_id_param uuid default null)
returns table(
  total_jobs bigint,
  pending_jobs bigint,
  processing_jobs bigint,
  completed_jobs bigint,
  failed_jobs bigint,
  avg_processing_time interval
) as $$
begin
  return query
  select 
    count(*) as total_jobs,
    count(*) filter (where status = 'pending') as pending_jobs,
    count(*) filter (where status = 'processing') as processing_jobs,
    count(*) filter (where status = 'completed') as completed_jobs,
    count(*) filter (where status = 'failed') as failed_jobs,
    avg(completed_at - started_at) filter (where status = 'completed' and started_at is not null) as avg_processing_time
  from jobs_queue
  where tenant_id_param is null or tenant_id = tenant_id_param;
end;
$$ language plpgsql security definer;

-- Create trigger to update updated_at timestamp
create or replace function update_jobs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_jobs_queue_updated_at
  before update on jobs_queue
  for each row
  execute function update_jobs_updated_at();

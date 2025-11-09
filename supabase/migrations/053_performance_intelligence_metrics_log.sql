-- Performance Intelligence Layer: metrics_log table
-- Stores normalized telemetry from Vercel, Supabase, Expo, and GitHub Actions

create table if not exists public.metrics_log (
  id bigint generated always as identity primary key,
  ts timestamptz default now() not null,
  source text not null check (source in ('vercel', 'supabase', 'expo', 'github', 'telemetry', 'custom')),
  metric jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Indexes for efficient querying
create index if not exists idx_metrics_log_ts on public.metrics_log(ts desc);
create index if not exists idx_metrics_log_source on public.metrics_log(source);
create index if not exists idx_metrics_log_metric_gin on public.metrics_log using gin(metric);

-- RLS policies
alter table public.metrics_log enable row level security;

-- Service role can read/write (for API endpoints)
create policy "service_role_full_access" on public.metrics_log
  for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can read their own metrics (if user_id in metric jsonb)
create policy "authenticated_read_own" on public.metrics_log
  for select
  using (
    auth.role() = 'authenticated' and
    (metric->>'user_id' is null or metric->>'user_id' = auth.uid()::text)
  );

-- Anonymous can insert telemetry (for beacon endpoints)
create policy "anonymous_insert_telemetry" on public.metrics_log
  for insert
  with check (
    source = 'telemetry' and
    auth.role() = 'anon'
  );

-- Admin users can read all (if admin role exists)
create policy "admin_read_all" on public.metrics_log
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and (preferences->>'role' = 'admin' or preferences->>'role' = 'super_admin')
    )
  );

-- Function to aggregate metrics by time window
create or replace function public.get_metrics_summary(
  p_source text default null,
  p_start_time timestamptz default now() - interval '7 days',
  p_end_time timestamptz default now()
)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'period', jsonb_build_object(
      'start', p_start_time,
      'end', p_end_time
    ),
    'sources', (
      select jsonb_object_agg(
        source,
        jsonb_build_object(
          'count', count(*),
          'latest', max(ts),
          'earliest', min(ts)
        )
      )
      from public.metrics_log
      where ts between p_start_time and p_end_time
        and (p_source is null or source = p_source)
    ),
    'total_records', (
      select count(*)
      from public.metrics_log
      where ts between p_start_time and p_end_time
        and (p_source is null or source = p_source)
    )
  ) into result;
  
  return result;
end;
$$;

-- Function to detect regressions (compare last N records to previous N)
create or replace function public.detect_regressions(
  p_metric_key text,
  p_threshold_percent numeric default 10,
  p_window_size int default 10
)
returns table (
  source text,
  metric_key text,
  current_avg numeric,
  previous_avg numeric,
  change_percent numeric,
  is_regression boolean
)
language plpgsql
security definer
as $$
begin
  return query
  with recent as (
    select 
      source,
      (metric->>p_metric_key)::numeric as value,
      row_number() over (partition by source order by ts desc) as rn
    from public.metrics_log
    where metric ? p_metric_key
      and (metric->>p_metric_key) ~ '^[0-9]+\.?[0-9]*$'
    order by ts desc
    limit p_window_size * 2
  ),
  current_window as (
    select 
      source,
      avg(value) as avg_value
    from recent
    where rn <= p_window_size
    group by source
  ),
  previous_window as (
    select 
      source,
      avg(value) as avg_value
    from recent
    where rn > p_window_size and rn <= p_window_size * 2
    group by source
  )
  select 
    c.source,
    p_metric_key,
    c.avg_value as current_avg,
    p.avg_value as previous_avg,
    case 
      when p.avg_value > 0 then 
        ((c.avg_value - p.avg_value) / p.avg_value * 100)
      else 0
    end as change_percent,
    case 
      when p.avg_value > 0 then 
        ((c.avg_value - p.avg_value) / p.avg_value * 100) > p_threshold_percent
      else false
    end as is_regression
  from current_window c
  left join previous_window p on c.source = p.source
  where p.avg_value is not null;
end;
$$;

comment on table public.metrics_log is 'Performance Intelligence Layer: Centralized metrics storage from all sources';
comment on function public.get_metrics_summary is 'Aggregates metrics by time window and source';
comment on function public.detect_regressions is 'Detects performance regressions by comparing time windows';

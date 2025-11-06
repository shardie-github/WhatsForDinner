-- [STAKE+TRUST:BEGIN:audit_log_migration]
-- Migration: 2025-11-05_trust_audit.sql
-- Purpose: Create user-facing audit log table with RLS
-- Online-safe: Yes (no CONCURRENTLY in transaction)

-- Create audit_log table for user-facing audit trail
create table if not exists public.audit_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  meta jsonb default '{}'::jsonb,
  ts timestamptz default now(),
  created_at timestamptz default now()
);

-- Create index for efficient queries
create index if not exists idx_audit_log_user_id on public.audit_log(user_id);
create index if not exists idx_audit_log_ts on public.audit_log(ts desc);
create index if not exists idx_audit_log_action on public.audit_log(action);

-- Enable Row Level Security
alter table public.audit_log enable row level security;

-- Create policy: users can only see their own audit logs
create policy "audit_owner" 
  on public.audit_log 
  for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- Create policy: allow service role to insert (for system-generated logs)
create policy "audit_service_role_insert" 
  on public.audit_log 
  for insert 
  with check (true);

-- Grant permissions
grant select on public.audit_log to authenticated;
grant insert on public.audit_log to authenticated;
grant usage on sequence public.audit_log_id_seq to authenticated;

-- Add comment for documentation
comment on table public.audit_log is 'User-facing audit log for personal actions and activity tracking';
comment on column public.audit_log.user_id is 'User ID (foreign key to auth.users)';
comment on column public.audit_log.action is 'Action type (e.g., "feedback", "export", "login")';
comment on column public.audit_log.meta is 'Additional metadata as JSON (e.g., rating, comment, export_format)';
comment on column public.audit_log.ts is 'Timestamp of the action';
-- [STAKE+TRUST:END:audit_log_migration]

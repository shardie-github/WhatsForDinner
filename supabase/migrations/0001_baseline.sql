-- Safe idempotent baseline
begin;
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, avatar_url text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.app_settings (
  id boolean primary key default true,
  maintenance_mode boolean default false,
  version text default '0.1.0',
  updated_at timestamptz default now()
);
create table if not exists public.audit_log (
  id bigserial primary key, actor uuid, action text not null,
  subject text, meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create table if not exists public.push_tokens (
  id bigserial primary key, user_id uuid references auth.users(id) on delete cascade,
  token text unique, platform text check (platform in ('ios','android','web')),
  created_at timestamptz default now()
);
create index if not exists idx_audit_log_actor on public.audit_log(actor);
create index if not exists idx_audit_log_created_at on public.audit_log(created_at);
create index if not exists idx_push_tokens_user on public.push_tokens(user_id);
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.audit_log enable row level security;
alter table public.push_tokens enable row level security;
do $$
begin
  if not exists(select 1 from pg_policies where policyname='profiles_select_self') then
    create policy profiles_select_self on public.profiles for select using (auth.uid()=user_id);
    create policy profiles_update_self on public.profiles for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
    create policy profiles_insert_self on public.profiles for insert with check (auth.uid()=user_id);
  end if;
  if not exists(select 1 from pg_policies where policyname='push_tokens_select_self') then
    create policy push_tokens_select_self on public.push_tokens for select using (auth.uid()=user_id);
    create policy push_tokens_insert_self on public.push_tokens for insert with check (auth.uid()=user_id);
    create policy push_tokens_delete_self on public.push_tokens for delete using (auth.uid()=user_id);
  end if;
end$$;
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
do $$
begin
  if not exists(select 1 from pg_trigger where tgname='trg_profiles_touch') then
    create trigger trg_profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
    create trigger trg_app_settings_touch before update on public.app_settings for each row execute function public.touch_updated_at();
  end if;
end$$;
commit;

-- ORG3XTRATE-AGENT — Pattern Detection & Automation Layer
-- Signals, Patterns, Recommendations, Support Diagnostics

-- Signals (raw)
create table if not exists public.events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  app text,              -- e.g., "web", "mobile", "shopify", "gmail", etc.
  type text,             -- e.g., "page_view","click","error","api_call","copy","purchase"
  path text,             -- route or feature key
  meta jsonb,            -- extra context
  ts timestamptz default now()
);

-- Sessions (derived)
create table if not exists public.sessions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  device text,
  locale text,
  country text
);

-- Declared apps-in-use (from OAuth connections or user settings)
create table if not exists public.user_apps (
  user_id uuid references auth.users(id) on delete cascade,
  app text not null,
  connected boolean default false,
  meta jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, app)
);

-- Feature snapshots / heuristics
create table if not exists public.signals (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  window text not null,        -- "1d","7d","30d"
  k text not null,             -- signal key e.g., "rage_clicks","timeouts","checkout_drop"
  v numeric not null,
  meta jsonb,
  computed_at timestamptz default now()
);

-- Segment membership (cohorts)
create table if not exists public.segments (
  id bigserial primary key,
  code text unique not null,   -- e.g., "new_user","power_user","blocked_on_payment"
  description text
);

create table if not exists public.user_segments (
  user_id uuid references auth.users(id) on delete cascade,
  segment_id bigint references public.segments(id) on delete cascade,
  assigned_at timestamptz default now(),
  primary key (user_id, segment_id)
);

-- Recommendations (curated workflows/automations)
create table if not exists public.recommendations (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  kind text not null,          -- "workflow","automation","tip","support"
  score numeric not null default 0,
  rationale jsonb,             -- feature attributions used
  cta jsonb,                   -- { label, href, action }
  created_at timestamptz default now(),
  dismissed boolean default false,
  accepted boolean default false
);

-- Support diagnostics (auto detection of issues)
create table if not exists public.support_diagnostics (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  hypothesis text not null,    -- "slow_network","auth_loop","captcha_fail","payment_error"
  confidence numeric not null, -- 0..1
  evidence jsonb,              -- events summary backing the hypothesis
  status text default 'open',  -- "open","muted","resolved"
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists events_user_id_idx on public.events(user_id);
create index if not exists events_ts_idx on public.events(ts);
create index if not exists events_type_idx on public.events(type);
create index if not exists events_session_id_idx on public.events(session_id);
create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists signals_user_id_idx on public.signals(user_id);
create index if not exists signals_k_idx on public.signals(k);
create index if not exists recommendations_user_id_idx on public.recommendations(user_id);
create index if not exists recommendations_created_at_idx on public.recommendations(created_at);
create index if not exists support_diagnostics_user_id_idx on public.support_diagnostics(user_id);
create index if not exists support_diagnostics_status_idx on public.support_diagnostics(status);

-- RLS
alter table public.events enable row level security;
alter table public.sessions enable row level security;
alter table public.user_apps enable row level security;
alter table public.signals enable row level security;
alter table public.user_segments enable row level security;
alter table public.recommendations enable row level security;
alter table public.support_diagnostics enable row level security;

-- Policies: owner-only for PII; recommendations readable by owner.
create policy "events_owner" on public.events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_owner" on public.sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "apps_owner" on public.user_apps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "signals_owner" on public.signals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "segments_owner" on public.user_segments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reco_owner" on public.recommendations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "diag_owner" on public.support_diagnostics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Comments for documentation
comment on table public.events is 'Raw user interaction events for pattern detection';
comment on table public.sessions is 'Derived session metadata';
comment on table public.user_apps is 'Declared apps-in-use from OAuth or settings';
comment on table public.signals is 'Computed behavioral signals (heuristics)';
comment on table public.segments is 'User cohort definitions';
comment on table public.recommendations is 'Curated workflow/automation recommendations';
comment on table public.support_diagnostics is 'Auto-detected support issues and hypotheses';

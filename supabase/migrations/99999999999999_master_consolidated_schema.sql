-- ============================================================================
-- MASTER CONSOLIDATED SCHEMA MIGRATION
-- ============================================================================
-- This is the single canonical migration that bootstraps a fresh database
-- to the final intended state. All legacy migrations are archived.
--
-- Safe to run on: Fresh databases (uses IF NOT EXISTS throughout)
-- Idempotent: Yes (can be run multiple times safely)
-- Date: 2025-01-27
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector; -- For embeddings (if using pgvector)

-- ============================================================================
-- SECTION 2: ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE plan AS ENUM ('free', 'premium', 'partner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE role AS ENUM ('owner', 'adult', 'teen', 'child');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE recipe_source AS ENUM ('curated', 'partner', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE health_metric_kind AS ENUM ('weight', 'sleep', 'water', 'steps', 'calories');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE room_kind AS ENUM ('family', 'dm');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE email_subscription_status AS ENUM ('subscribed', 'unsubscribed', 'bounced');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE referral_status AS ENUM ('clicked', 'signed_up', 'converted', 'pending', 'completed', 'rewarded', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE promo_offer_kind AS ENUM ('percentage', 'fixed', 'trial_days');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE promo_duration AS ENUM ('once', 'repeat', 'lifecycle');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE experiment_status AS ENUM ('draft', 'running', 'paused', 'complete');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE pricing_platform AS ENUM ('ios', 'android', 'web', 'any');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE pricing_plan AS ENUM ('monthly', 'annual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE monitoring_scope AS ENUM ('metadata_only', 'metadata_plus_usage', 'none');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE telemetry_event_type AS ENUM ('app_focus', 'app_switch', 'window_change', 'duration', 'interaction', 'view', 'click', 'error', 'complete', 'like', 'save', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transparency_log_action AS ENUM (
    'consent_granted', 'consent_revoked', 'app_added', 'app_removed',
    'signal_toggled', 'data_exported', 'data_deleted', 'policy_changed',
    'mfa_verified', 'session_elevated'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_request_type AS ENUM ('export', 'erase', 'restrict', 'rectify');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_request_status AS ENUM ('received', 'verifying', 'in_progress', 'complete', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_channel AS ENUM ('portal', 'email', 'api');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_region AS ENUM ('gdpr', 'ccpa', 'cpra', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- SECTION 3: HELPER FUNCTIONS
-- ============================================================================

-- Auth helper for Supabase compatibility
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'sub'::uuid;
$$ LANGUAGE sql STABLE;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECTION 4: CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  plan plan DEFAULT 'free' NOT NULL,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Households table
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Household members table
CREATE TABLE IF NOT EXISTS household_members (
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role role DEFAULT 'adult' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (household_id, user_id)
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  media_url text,
  steps jsonb NOT NULL DEFAULT '[]',
  ingredients jsonb NOT NULL DEFAULT '[]',
  macros jsonb,
  tags text[] DEFAULT '{}',
  source recipe_source DEFAULT 'user' NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  day date NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Meal preferences table
CREATE TABLE IF NOT EXISTS meal_prefs (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  cuisines text[] DEFAULT '{}',
  diet text DEFAULT 'none',
  allergies text[] DEFAULT '{}',
  cook_time_minutes int DEFAULT 30,
  updated_at timestamptz DEFAULT now()
);

-- Grocery lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name text,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind health_metric_kind NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  kind room_kind DEFAULT 'family' NOT NULL,
  participants uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]',
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  flags jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Ad impressions table
CREATE TABLE IF NOT EXISTS ad_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  slot text NOT NULL,
  kind text NOT NULL,
  ts timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'
);

-- Events table (general event tracking)
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  props jsonb DEFAULT '{}',
  ts timestamptz DEFAULT now() NOT NULL
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug text NOT NULL,
  key_hash text NOT NULL,
  scopes text[] NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Webhook events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  external_id text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(source, external_id)
);

-- ============================================================================
-- SECTION 5: GROWTH & REFERRAL TABLES
-- ============================================================================

-- Email subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  status email_subscription_status DEFAULT 'subscribed' NOT NULL,
  source text,
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Referral programs table
CREATE TABLE IF NOT EXISTS referral_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  active boolean DEFAULT true NOT NULL,
  reward_sender jsonb DEFAULT '{}',
  reward_receiver jsonb DEFAULT '{}',
  terms_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES referral_programs(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uses int DEFAULT 0 NOT NULL,
  max_uses int,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Referrals table (consolidated)
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES referral_programs(id) ON DELETE CASCADE,
  code_id uuid REFERENCES referral_codes(id) ON DELETE CASCADE,
  referrer_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  referee_email varchar(255),
  status referral_status DEFAULT 'clicked' NOT NULL,
  referrer_reward_type text CHECK (referrer_reward_type IN ('discount', 'credit', 'subscription_days', 'cash')),
  referrer_reward_amount numeric(10,2) DEFAULT 0,
  referred_reward_type text CHECK (referred_reward_type IN ('discount', 'credit', 'subscription_days')),
  referred_reward_amount numeric(10,2) DEFAULT 0,
  conversion_event text,
  conversion_date timestamptz,
  reward_paid_at timestamptz,
  expires_at timestamptz,
  ts timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Referral rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES referrals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type text NOT NULL CHECK (reward_type IN ('discount', 'credit', 'subscription_days', 'cash')),
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'expired', 'revoked')),
  applied_at timestamptz,
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Promo offers table
CREATE TABLE IF NOT EXISTS promo_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind promo_offer_kind NOT NULL,
  value numeric NOT NULL,
  duration promo_duration DEFAULT 'once' NOT NULL,
  constraints jsonb DEFAULT '{}',
  active boolean DEFAULT true NOT NULL,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text,
  status experiment_status DEFAULT 'draft' NOT NULL,
  hypothesis text,
  primary_metric text NOT NULL,
  guardrail_metrics jsonb DEFAULT '[]',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  started_at timestamptz,
  stopped_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Experiment variants table
CREATE TABLE IF NOT EXISTS experiment_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  key text NOT NULL,
  weight int DEFAULT 50 NOT NULL,
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(experiment_id, key)
);

-- Experiment assignments table
CREATE TABLE IF NOT EXISTS experiment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  anon_id text,
  variant_key text NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  sticky boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(experiment_id, COALESCE(user_id::text, anon_id))
);

-- Pricing rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country varchar(3),
  platform pricing_platform DEFAULT 'any' NOT NULL,
  plan pricing_plan NOT NULL,
  price_cents int NOT NULL,
  currency varchar(3) DEFAULT 'USD' NOT NULL,
  promo_offer_id uuid REFERENCES promo_offers(id) ON DELETE SET NULL,
  active boolean DEFAULT true NOT NULL,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Lifecycle events table
CREATE TABLE IF NOT EXISTS lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  anon_id text,
  name text NOT NULL,
  props jsonb DEFAULT '{}',
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Journey states table
CREATE TABLE IF NOT EXISTS journey_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key text NOT NULL,
  step text NOT NULL,
  last_sent_at timestamptz,
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, key)
);

-- ============================================================================
-- SECTION 6: PRIVACY & MONITORING TABLES
-- ============================================================================

-- Privacy preferences table
CREATE TABLE IF NOT EXISTS privacy_prefs (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  monitoring_enabled boolean NOT NULL DEFAULT false,
  data_retention_days integer NOT NULL DEFAULT 14,
  mfa_required boolean NOT NULL DEFAULT true,
  last_reviewed_at timestamptz,
  paused_until timestamptz,
  kill_switch_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- App allowlist table
CREATE TABLE IF NOT EXISTS app_allowlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id text NOT NULL,
  app_name text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  scope monitoring_scope NOT NULL DEFAULT 'metadata_only',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, app_id)
);

-- Signal toggles table
CREATE TABLE IF NOT EXISTS signal_toggles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  sampling_rate numeric(3, 2) NOT NULL DEFAULT 1.0 CHECK (sampling_rate >= 0 AND sampling_rate <= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, signal_key)
);

-- Telemetry events table (privacy-first, encrypted)
CREATE TABLE IF NOT EXISTS telemetry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ts timestamptz NOT NULL DEFAULT now(),
  app_id text NOT NULL DEFAULT 'web',
  event_type text NOT NULL,
  path text,
  duration_ms integer,
  metadata_redacted_json jsonb NOT NULL DEFAULT '{}',
  encrypted_payload text,
  meta jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Privacy transparency log table
CREATE TABLE IF NOT EXISTS privacy_transparency_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  entity_type text,
  entity_id uuid,
  old_value_hash text,
  new_value_hash text,
  metadata jsonb NOT NULL DEFAULT '{}',
  ts timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- MFA enforced sessions table
CREATE TABLE IF NOT EXISTS mfa_enforced_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  action_type text NOT NULL,
  verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 7: COMPLIANCE & REGTECH TABLES
-- ============================================================================

-- DSAR requests table
CREATE TABLE IF NOT EXISTS dsar_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email varchar(255) NOT NULL,
  type dsar_request_type NOT NULL,
  status dsar_request_status DEFAULT 'received' NOT NULL,
  submitted_at timestamptz DEFAULT now() NOT NULL,
  verified_at timestamptz,
  completed_at timestamptz,
  reason text,
  channel dsar_channel DEFAULT 'portal' NOT NULL,
  region dsar_region DEFAULT 'gdpr' NOT NULL,
  window_deadline timestamptz NOT NULL,
  artifacts jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Audit log table (user-facing)
CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  ts timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Account deletions table
CREATE TABLE IF NOT EXISTS account_deletions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  deleted_at timestamptz DEFAULT now(),
  reason text,
  data_retention_until timestamptz,
  metadata jsonb DEFAULT '{}'
);

-- ============================================================================
-- SECTION 8: BILLING & SUBSCRIPTIONS TABLES
-- ============================================================================

-- Subscriptions table (simplified - adjust based on your billing provider)
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  plan text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  stripe_subscription_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  amount numeric(10,2) NOT NULL,
  tax_amount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_at timestamptz,
  stripe_invoice_id text,
  pdf_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'cancelled')),
  stripe_refund_id text,
  processed_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- SECTION 9: SUPPORT TABLES
-- ============================================================================

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email text NOT NULL,
  subject text NOT NULL,
  category text NOT NULL CHECK (category IN ('billing', 'technical', 'feature', 'account', 'other')),
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  resolution text,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Support ticket messages table
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  message text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- SECTION 10: ANALYTICS TABLES
-- ============================================================================

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_name text NOT NULL,
  props jsonb DEFAULT '{}',
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Recipe metrics table
CREATE TABLE IF NOT EXISTS recipe_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  views int DEFAULT 0,
  saves int DEFAULT 0,
  cooks int DEFAULT 0,
  ratings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Recipe feedback table
CREATE TABLE IF NOT EXISTS recipe_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Metrics log table (performance intelligence)
CREATE TABLE IF NOT EXISTS metrics_log (
  id bigserial PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  tags jsonb DEFAULT '{}',
  ts timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- SECTION 11: INDEXES
-- ============================================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS meal_plans_user_day_idx ON meal_plans(user_id, day);
CREATE INDEX IF NOT EXISTS health_metrics_user_kind_ts_idx ON health_metrics(user_id, kind, ts);
CREATE INDEX IF NOT EXISTS messages_room_ts_idx ON messages(room_id, ts);
CREATE INDEX IF NOT EXISTS events_user_ts_idx ON events(user_id, ts);
CREATE INDEX IF NOT EXISTS recipes_source_idx ON recipes(source);
CREATE INDEX IF NOT EXISTS recipes_tags_idx ON recipes USING gin(tags);
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON recipes(user_id) WHERE user_id IS NOT NULL;

-- Growth table indexes
CREATE INDEX IF NOT EXISTS email_subscriptions_user_id_idx ON email_subscriptions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS email_subscriptions_email_idx ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS email_subscriptions_status_idx ON email_subscriptions(status);
CREATE INDEX IF NOT EXISTS referral_codes_program_id_idx ON referral_codes(program_id);
CREATE INDEX IF NOT EXISTS referral_codes_owner_user_id_idx ON referral_codes(owner_user_id);
CREATE INDEX IF NOT EXISTS referral_codes_code_idx ON referral_codes(code);
CREATE INDEX IF NOT EXISTS referrals_code_id_idx ON referrals(code_id);
CREATE INDEX IF NOT EXISTS referrals_referrer_user_id_idx ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS referrals_referee_user_id_idx ON referrals(referee_user_id) WHERE referee_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS referrals_status_idx ON referrals(status);
CREATE INDEX IF NOT EXISTS experiment_assignments_experiment_id_idx ON experiment_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS experiment_assignments_user_id_idx ON experiment_assignments(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lifecycle_events_user_id_idx ON lifecycle_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS journey_states_user_id_idx ON journey_states(user_id);

-- Privacy table indexes
CREATE INDEX IF NOT EXISTS privacy_prefs_user_id_idx ON privacy_prefs(user_id);
CREATE INDEX IF NOT EXISTS app_allowlist_user_id_idx ON app_allowlist(user_id);
CREATE INDEX IF NOT EXISTS app_allowlist_app_id_idx ON app_allowlist(app_id);
CREATE INDEX IF NOT EXISTS signal_toggles_user_id_idx ON signal_toggles(user_id);
CREATE INDEX IF NOT EXISTS signal_toggles_signal_key_idx ON signal_toggles(signal_key);
CREATE INDEX IF NOT EXISTS telemetry_events_user_id_idx ON telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS telemetry_events_ts_idx ON telemetry_events(ts);
CREATE INDEX IF NOT EXISTS telemetry_events_app_id_idx ON telemetry_events(app_id);
CREATE INDEX IF NOT EXISTS telemetry_events_user_ts_idx ON telemetry_events(user_id, ts);
CREATE INDEX IF NOT EXISTS privacy_transparency_log_user_id_idx ON privacy_transparency_log(user_id);
CREATE INDEX IF NOT EXISTS privacy_transparency_log_ts_idx ON privacy_transparency_log(ts);
CREATE INDEX IF NOT EXISTS privacy_transparency_log_action_idx ON privacy_transparency_log(action);
CREATE INDEX IF NOT EXISTS mfa_enforced_sessions_user_id_idx ON mfa_enforced_sessions(user_id);
CREATE INDEX IF NOT EXISTS mfa_enforced_sessions_session_token_idx ON mfa_enforced_sessions(session_token);
CREATE INDEX IF NOT EXISTS mfa_enforced_sessions_expires_at_idx ON mfa_enforced_sessions(expires_at);

-- Compliance table indexes
CREATE INDEX IF NOT EXISTS idx_dsar_requests_user_id ON dsar_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_email ON dsar_requests(email);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_status ON dsar_requests(status);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_region ON dsar_requests(region);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_window_deadline ON dsar_requests(window_deadline);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_ts ON audit_log(ts DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_account_deletions_user ON account_deletions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletions_date ON account_deletions(deleted_at);

-- Billing table indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_refunds_user ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Support table indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket ON support_ticket_messages(ticket_id);

-- ============================================================================
-- SECTION 12: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_transparency_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_enforced_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsar_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (idempotent)
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "own read" ON public.%I', r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "own write" ON public.%I', r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "own update" ON public.%I', r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "own delete" ON public.%I', r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "service_role bypass" ON public.%I', r.tablename);
  END LOOP;
END $$;

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Households policies
DROP POLICY IF EXISTS "Household members can view household" ON households;
DROP POLICY IF EXISTS "Household owner can manage household" ON households;
CREATE POLICY "Household members can view household" ON households FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = households.id
      AND hm.user_id = auth.uid()
    )
  );
CREATE POLICY "Household owner can manage household" ON households FOR ALL USING (owner_id = auth.uid());

-- Household members policies
DROP POLICY IF EXISTS "Household members can view members" ON household_members;
DROP POLICY IF EXISTS "Household owner can manage members" ON household_members;
CREATE POLICY "Household members can view members" ON household_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = auth.uid()
    )
  );
CREATE POLICY "Household owner can manage members" ON household_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM households h
      WHERE h.id = household_members.household_id
      AND h.owner_id = auth.uid()
    )
  );

-- Recipes policies
DROP POLICY IF EXISTS "Public curated and partner recipes" ON recipes;
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can manage own recipes" ON recipes;
CREATE POLICY "Public curated and partner recipes" ON recipes FOR SELECT USING (source IN ('curated', 'partner'));
CREATE POLICY "Users can view own recipes" ON recipes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own recipes" ON recipes FOR ALL USING (user_id = auth.uid());

-- Meal plans policies
DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can manage own meal plans" ON meal_plans;
CREATE POLICY "Users can view own meal plans" ON meal_plans FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = meal_plans.household_id
      AND hm.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can manage own meal plans" ON meal_plans FOR ALL USING (user_id = auth.uid());

-- Meal prefs policies
DROP POLICY IF EXISTS "prefs_owner" ON meal_prefs;
CREATE POLICY "prefs_owner" ON meal_prefs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Grocery lists policies
DROP POLICY IF EXISTS "Household members can view grocery lists" ON grocery_lists;
DROP POLICY IF EXISTS "Household members can manage grocery lists" ON grocery_lists;
CREATE POLICY "Household members can view grocery lists" ON grocery_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = grocery_lists.household_id
      AND hm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM households h
      WHERE h.id = grocery_lists.household_id
      AND h.owner_id = auth.uid()
    )
  );
CREATE POLICY "Household members can manage grocery lists" ON grocery_lists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = grocery_lists.household_id
      AND hm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM households h
      WHERE h.id = grocery_lists.household_id
      AND h.owner_id = auth.uid()
    )
  );

-- Health metrics policies
DROP POLICY IF EXISTS "Users can view own health metrics" ON health_metrics;
DROP POLICY IF EXISTS "Users can manage own health metrics" ON health_metrics;
CREATE POLICY "Users can view own health metrics" ON health_metrics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own health metrics" ON health_metrics FOR ALL USING (user_id = auth.uid());

-- Rooms policies
DROP POLICY IF EXISTS "Room participants can view room" ON rooms;
DROP POLICY IF EXISTS "Room participants can manage room" ON rooms;
CREATE POLICY "Room participants can view room" ON rooms FOR SELECT
  USING (
    auth.uid() = ANY(participants)
    OR EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = rooms.household_id
      AND hm.user_id = auth.uid()
    )
  );
CREATE POLICY "Room participants can manage room" ON rooms FOR ALL USING (auth.uid() = ANY(participants));

-- Messages policies
DROP POLICY IF EXISTS "Room participants can view messages" ON messages;
DROP POLICY IF EXISTS "Room participants can send messages" ON messages;
CREATE POLICY "Room participants can view messages" ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = messages.room_id
      AND (auth.uid() = ANY(r.participants) OR EXISTS (
        SELECT 1 FROM household_members hm
        WHERE hm.household_id = r.household_id
        AND hm.user_id = auth.uid()
      ))
    )
  );
CREATE POLICY "Room participants can send messages" ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = messages.room_id
      AND (auth.uid() = ANY(r.participants) OR EXISTS (
        SELECT 1 FROM household_members hm
        WHERE hm.household_id = r.household_id
        AND hm.user_id = auth.uid()
      ))
    )
    AND sender_id = auth.uid()
  );

-- Feature flags policies
DROP POLICY IF EXISTS "Users can view own feature flags" ON feature_flags;
CREATE POLICY "Users can view own feature flags" ON feature_flags FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own feature flags" ON feature_flags FOR ALL USING (user_id = auth.uid());

-- Ad impressions policies
DROP POLICY IF EXISTS "Users can insert own ad impressions" ON ad_impressions;
CREATE POLICY "Users can insert own ad impressions" ON ad_impressions FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Events policies
DROP POLICY IF EXISTS "Users can insert own events" ON events;
CREATE POLICY "Users can insert own events" ON events FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can view own events" ON events FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

-- Email subscriptions policies
DROP POLICY IF EXISTS "Users can view own email subscriptions" ON email_subscriptions;
DROP POLICY IF EXISTS "Users can manage own email subscriptions" ON email_subscriptions;
CREATE POLICY "Users can view own email subscriptions" ON email_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can manage own email subscriptions" ON email_subscriptions FOR ALL
  USING (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));

-- Referral programs policies
DROP POLICY IF EXISTS "Public can view active referral programs" ON referral_programs;
CREATE POLICY "Public can view active referral programs" ON referral_programs FOR SELECT USING (active = true);

-- Referral codes policies
DROP POLICY IF EXISTS "Users can view own referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Users can create own referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Public can view referral codes for validation" ON referral_codes;
CREATE POLICY "Users can view own referral codes" ON referral_codes FOR SELECT USING (owner_user_id = auth.uid());
CREATE POLICY "Users can create own referral codes" ON referral_codes FOR INSERT WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Public can view referral codes for validation" ON referral_codes FOR SELECT USING (true);

-- Referrals policies
DROP POLICY IF EXISTS "Users can view own referrals (as referrer)" ON referrals;
DROP POLICY IF EXISTS "Users can view referrals where they are referee" ON referrals;
DROP POLICY IF EXISTS "System can insert referrals" ON referrals;
CREATE POLICY "Users can view own referrals (as referrer)" ON referrals FOR SELECT USING (referrer_user_id = auth.uid());
CREATE POLICY "Users can view referrals where they are referee" ON referrals FOR SELECT USING (referee_user_id = auth.uid());
CREATE POLICY "System can insert referrals" ON referrals FOR INSERT WITH CHECK (true);

-- Referral rewards policies
DROP POLICY IF EXISTS "Users can view own rewards" ON referral_rewards;
CREATE POLICY "Users can view own rewards" ON referral_rewards FOR SELECT USING (auth.uid() = user_id);

-- Privacy policies (zero-trust, user-only)
DROP POLICY IF EXISTS "privacy_prefs_user_select" ON privacy_prefs;
DROP POLICY IF EXISTS "privacy_prefs_user_insert" ON privacy_prefs;
DROP POLICY IF EXISTS "privacy_prefs_user_update" ON privacy_prefs;
CREATE POLICY "privacy_prefs_user_select" ON privacy_prefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "privacy_prefs_user_insert" ON privacy_prefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "privacy_prefs_user_update" ON privacy_prefs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "app_allowlist_user_select" ON app_allowlist;
DROP POLICY IF EXISTS "app_allowlist_user_insert" ON app_allowlist;
DROP POLICY IF EXISTS "app_allowlist_user_update" ON app_allowlist;
DROP POLICY IF EXISTS "app_allowlist_user_delete" ON app_allowlist;
CREATE POLICY "app_allowlist_user_select" ON app_allowlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "app_allowlist_user_insert" ON app_allowlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "app_allowlist_user_update" ON app_allowlist FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "app_allowlist_user_delete" ON app_allowlist FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "signal_toggles_user_select" ON signal_toggles;
DROP POLICY IF EXISTS "signal_toggles_user_insert" ON signal_toggles;
DROP POLICY IF EXISTS "signal_toggles_user_update" ON signal_toggles;
DROP POLICY IF EXISTS "signal_toggles_user_delete" ON signal_toggles;
CREATE POLICY "signal_toggles_user_select" ON signal_toggles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "signal_toggles_user_insert" ON signal_toggles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "signal_toggles_user_update" ON signal_toggles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "signal_toggles_user_delete" ON signal_toggles FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "telemetry_events_user_select" ON telemetry_events;
DROP POLICY IF EXISTS "telemetry_events_user_insert" ON telemetry_events;
DROP POLICY IF EXISTS "telemetry_events_user_delete" ON telemetry_events;
CREATE POLICY "telemetry_events_user_select" ON telemetry_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "telemetry_events_user_insert" ON telemetry_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "telemetry_events_user_delete" ON telemetry_events FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "privacy_transparency_log_user_select" ON privacy_transparency_log;
DROP POLICY IF EXISTS "privacy_transparency_log_user_insert" ON privacy_transparency_log;
CREATE POLICY "privacy_transparency_log_user_select" ON privacy_transparency_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "privacy_transparency_log_user_insert" ON privacy_transparency_log FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mfa_enforced_sessions_user_select" ON mfa_enforced_sessions;
DROP POLICY IF EXISTS "mfa_enforced_sessions_user_insert" ON mfa_enforced_sessions;
DROP POLICY IF EXISTS "mfa_enforced_sessions_user_delete" ON mfa_enforced_sessions;
CREATE POLICY "mfa_enforced_sessions_user_select" ON mfa_enforced_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "mfa_enforced_sessions_user_insert" ON mfa_enforced_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mfa_enforced_sessions_user_delete" ON mfa_enforced_sessions FOR DELETE USING (auth.uid() = user_id);

-- DSAR requests policies
DROP POLICY IF EXISTS "Users can view own DSAR requests" ON dsar_requests;
CREATE POLICY "Users can view own DSAR requests" ON dsar_requests FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can create DSAR requests" ON dsar_requests FOR INSERT WITH CHECK (true);

-- Audit log policies
DROP POLICY IF EXISTS "audit_owner" ON audit_log;
DROP POLICY IF EXISTS "audit_service_role_insert" ON audit_log;
CREATE POLICY "audit_owner" ON audit_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "audit_service_role_insert" ON audit_log FOR INSERT WITH CHECK (true);

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Invoices policies
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);

-- Refunds policies
DROP POLICY IF EXISTS "Users can view own refunds" ON refunds;
DROP POLICY IF EXISTS "Users can create refund requests" ON refunds;
CREATE POLICY "Users can view own refunds" ON refunds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create refund requests" ON refunds FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Support tickets policies
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON support_tickets;
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);

-- Support ticket messages policies
DROP POLICY IF EXISTS "Users can view ticket messages" ON support_ticket_messages;
CREATE POLICY "Users can view ticket messages" ON support_ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = support_ticket_messages.ticket_id
      AND (st.user_id = auth.uid() OR st.email = (SELECT email FROM users WHERE id = auth.uid()))
    )
  );
CREATE POLICY "Users can create ticket messages" ON support_ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = support_ticket_messages.ticket_id
      AND (st.user_id = auth.uid() OR st.email = (SELECT email FROM users WHERE id = auth.uid()))
    )
  );

-- Analytics events policies
DROP POLICY IF EXISTS "Users can insert own analytics events" ON analytics_events;
CREATE POLICY "Users can insert own analytics events" ON analytics_events FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can view own analytics events" ON analytics_events FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());

-- Recipe metrics policies (public read)
DROP POLICY IF EXISTS "Public can view recipe metrics" ON recipe_metrics;
CREATE POLICY "Public can view recipe metrics" ON recipe_metrics FOR SELECT USING (true);

-- Recipe feedback policies
DROP POLICY IF EXISTS "Users can view recipe feedback" ON recipe_feedback;
DROP POLICY IF EXISTS "Users can create recipe feedback" ON recipe_feedback;
CREATE POLICY "Users can view recipe feedback" ON recipe_feedback FOR SELECT USING (true);
CREATE POLICY "Users can create recipe feedback" ON recipe_feedback FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- ============================================================================
-- SECTION 13: TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at BEFORE UPDATE ON grocery_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_subscriptions_updated_at BEFORE UPDATE ON email_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_programs_updated_at BEFORE UPDATE ON referral_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_codes_updated_at BEFORE UPDATE ON referral_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_offers_updated_at BEFORE UPDATE ON promo_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_states_updated_at BEFORE UPDATE ON journey_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_prefs_updated_at BEFORE UPDATE ON privacy_prefs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_allowlist_updated_at BEFORE UPDATE ON app_allowlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signal_toggles_updated_at BEFORE UPDATE ON signal_toggles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dsar_requests_updated_at BEFORE UPDATE ON dsar_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 14: HELPER FUNCTIONS (Additional)
-- ============================================================================

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id uuid)
RETURNS text AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    code := upper(substring(md5(user_id::text || random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  year_month text;
  last_number int;
  new_number text;
BEGIN
  year_month := to_char(now(), 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
  INTO last_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '%';
  
  new_number := 'INV-' || year_month || '-' || LPAD(last_number::text, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to log privacy action
CREATE OR REPLACE FUNCTION log_privacy_action(
  p_user_id uuid,
  p_action text,
  p_actor_id uuid DEFAULT NULL,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_old_value_hash text DEFAULT NULL,
  p_new_value_hash text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO privacy_transparency_log (
    user_id, action, actor_id, entity_type, entity_id,
    old_value_hash, new_value_hash, metadata
  ) VALUES (
    p_user_id, p_action, p_actor_id, p_entity_type, p_entity_id,
    p_old_value_hash, p_new_value_hash, p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- END OF MASTER MIGRATION
-- ============================================================================

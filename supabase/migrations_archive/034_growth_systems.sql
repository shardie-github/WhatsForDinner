-- ============================================================================
-- NOMAD BACKEND - GROWTH SYSTEMS MIGRATION
-- ============================================================================
-- This migration creates all tables for growth systems:
-- Email subscriptions, referrals, promo codes, experiments, pricing, lifecycle, journeys
-- Includes RLS policies for security
-- ============================================================================

-- Create enums
DO $$ BEGIN
  CREATE TYPE email_subscription_status AS ENUM ('subscribed', 'unsubscribed', 'bounced');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE referral_status AS ENUM ('clicked', 'signed_up', 'converted');
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

-- Email subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  status email_subscription_status DEFAULT 'subscribed' NOT NULL,
  source text, -- 'signup', 'manual', 'import', etc.
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Referral programs table
CREATE TABLE IF NOT EXISTS referral_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  active boolean DEFAULT true NOT NULL,
  reward_sender jsonb DEFAULT '{}', -- {type: 'trial_days', value: 7} or {type: 'discount', value: 10}
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

-- Referrals table (tracking clicks, signups, conversions)
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES referral_programs(id) ON DELETE CASCADE,
  code_id uuid NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referrer_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  referee_email varchar(255),
  status referral_status DEFAULT 'clicked' NOT NULL,
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Promo offers table
CREATE TABLE IF NOT EXISTS promo_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind promo_offer_kind NOT NULL,
  value numeric NOT NULL, -- percentage (0-100) or fixed cents or trial days
  duration promo_duration DEFAULT 'once' NOT NULL,
  constraints jsonb DEFAULT '{}', -- {max_uses_per_user: 1, geo: ['US'], min_purchase_cents: 1000}
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
  primary_metric text NOT NULL, -- e.g., 'conversion_rate', 'purchase_completed'
  guardrail_metrics jsonb DEFAULT '[]', -- e.g., ['crash_rate', 'purchase_rate']
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
  key text NOT NULL, -- 'control', 'variant_a', etc.
  weight int DEFAULT 50 NOT NULL, -- 0-100, relative weight for allocation
  meta jsonb DEFAULT '{}', -- variant-specific config
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(experiment_id, key)
);

-- Experiment assignments table
CREATE TABLE IF NOT EXISTS experiment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  anon_id text, -- anonymous identifier for logged-out users
  variant_key text NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  sticky boolean DEFAULT true NOT NULL, -- if false, can re-assign on next fetch
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(experiment_id, COALESCE(user_id::text, anon_id))
);

-- Pricing rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country varchar(3), -- ISO 3166-1 alpha-3, NULL = all countries
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

-- Lifecycle events table (attribution & growth tracking)
CREATE TABLE IF NOT EXISTS lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  anon_id text, -- anonymous identifier
  name text NOT NULL, -- 'AttributionCaptured', 'ReferralClick', 'PaywallViewed', etc.
  props jsonb DEFAULT '{}',
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Journey states table (orchestration state)
CREATE TABLE IF NOT EXISTS journey_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key text NOT NULL, -- journey key: 'onboarding', 'habit_loop', 'premium_upsell', etc.
  step text NOT NULL, -- current step in journey
  last_sent_at timestamptz,
  meta jsonb DEFAULT '{}', -- step-specific metadata
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, key)
);

-- Indexes for performance
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
CREATE INDEX IF NOT EXISTS promo_offers_slug_idx ON promo_offers(slug);
CREATE INDEX IF NOT EXISTS promo_offers_active_idx ON promo_offers(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS experiments_key_idx ON experiments(key);
CREATE INDEX IF NOT EXISTS experiments_status_idx ON experiments(status) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS experiment_variants_experiment_id_idx ON experiment_variants(experiment_id);
CREATE INDEX IF NOT EXISTS experiment_assignments_experiment_id_idx ON experiment_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS experiment_assignments_user_id_idx ON experiment_assignments(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS experiment_assignments_anon_id_idx ON experiment_assignments(anon_id) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS pricing_rules_country_platform_idx ON pricing_rules(country, platform);
CREATE INDEX IF NOT EXISTS pricing_rules_active_idx ON pricing_rules(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS lifecycle_events_user_id_idx ON lifecycle_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lifecycle_events_anon_id_idx ON lifecycle_events(anon_id) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lifecycle_events_name_ts_idx ON lifecycle_events(name, ts);
CREATE INDEX IF NOT EXISTS journey_states_user_id_idx ON journey_states(user_id);
CREATE INDEX IF NOT EXISTS journey_states_key_idx ON journey_states(key);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_states ENABLE ROW LEVEL SECURITY;

-- Email subscriptions policies
CREATE POLICY "Users can view own email subscriptions"
  ON email_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage own email subscriptions"
  ON email_subscriptions FOR ALL
  USING (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can view all email subscriptions"
  ON email_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Referral programs policies (public read for active, admin write)
CREATE POLICY "Public can view active referral programs"
  ON referral_programs FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage referral programs"
  ON referral_programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Referral codes policies
CREATE POLICY "Users can view own referral codes"
  ON referral_codes FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can create own referral codes"
  ON referral_codes FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Public can view referral codes for validation"
  ON referral_codes FOR SELECT
  USING (true); -- Allow reading to validate codes

CREATE POLICY "Admins can manage all referral codes"
  ON referral_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Referrals policies
CREATE POLICY "Users can view own referrals (as referrer)"
  ON referrals FOR SELECT
  USING (referrer_user_id = auth.uid());

CREATE POLICY "Users can view referrals where they are referee"
  ON referrals FOR SELECT
  USING (referee_user_id = auth.uid());

CREATE POLICY "System can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (true); -- Allow system to track referral clicks/signups

CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Promo offers policies (public read for active, admin write)
CREATE POLICY "Public can view active promo offers"
  ON promo_offers FOR SELECT
  USING (active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));

CREATE POLICY "Admins can manage promo offers"
  ON promo_offers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Experiments policies (admin-only for management, public read for running experiments)
CREATE POLICY "Public can view running experiments"
  ON experiments FOR SELECT
  USING (status = 'running');

CREATE POLICY "Admins can manage experiments"
  ON experiments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Experiment variants policies (public read for running experiments, admin write)
CREATE POLICY "Public can view variants of running experiments"
  ON experiment_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiments e
      WHERE e.id = experiment_variants.experiment_id
      AND e.status = 'running'
    )
  );

CREATE POLICY "Admins can manage experiment variants"
  ON experiment_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Experiment assignments policies
CREATE POLICY "Users can view own experiment assignments"
  ON experiment_assignments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert/update experiment assignments"
  ON experiment_assignments FOR ALL
  WITH CHECK (true); -- Allow system to assign experiments

CREATE POLICY "Admins can view all experiment assignments"
  ON experiment_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Pricing rules policies (public read for active, admin write)
CREATE POLICY "Public can view active pricing rules"
  ON pricing_rules FOR SELECT
  USING (active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));

CREATE POLICY "Admins can manage pricing rules"
  ON pricing_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Lifecycle events policies (users can view own, system can insert)
CREATE POLICY "Users can view own lifecycle events"
  ON lifecycle_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert lifecycle events"
  ON lifecycle_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all lifecycle events"
  ON lifecycle_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Journey states policies
CREATE POLICY "Users can view own journey states"
  ON journey_states FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can manage journey states"
  ON journey_states FOR ALL
  WITH CHECK (true); -- Allow system to advance journey states

CREATE POLICY "Admins can view all journey states"
  ON journey_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Updated_at triggers
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

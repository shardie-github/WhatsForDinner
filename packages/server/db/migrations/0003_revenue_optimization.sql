-- ============================================================================
-- NOMAD BACKEND - REVENUE OPTIMIZATION MIGRATION
-- ============================================================================
-- This migration creates all tables for intelligent pricing & revenue optimization
-- Includes RLS policies for security
-- ============================================================================

-- Create enums
DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('success', 'failed', 'refunded', 'trial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_platform AS ENUM ('ios', 'android', 'web');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE experiment_status AS ENUM ('draft', 'running', 'paused', 'complete');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ltv_segment AS ENUM ('new', 'retained', 'churned', 'reactivated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  plan text NOT NULL,
  platform transaction_platform NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'USD',
  amount_cents integer NOT NULL,
  country varchar(3),
  promo_offer_id uuid REFERENCES promo_offers(id) ON DELETE SET NULL,
  status transaction_status NOT NULL DEFAULT 'success',
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_ts_idx ON transactions(ts);
CREATE INDEX IF NOT EXISTS transactions_country_plan_idx ON transactions(country, plan);
CREATE INDEX IF NOT EXISTS transactions_platform_idx ON transactions(platform);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);

-- Revenue snapshots table
CREATE TABLE IF NOT EXISTS revenue_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period date NOT NULL,
  mrr_cents integer DEFAULT 0 NOT NULL,
  arr_cents integer DEFAULT 0 NOT NULL,
  arpu_cents integer DEFAULT 0 NOT NULL,
  ltv_cents integer DEFAULT 0 NOT NULL,
  cac_cents integer DEFAULT 0 NOT NULL,
  churn_rate numeric(5, 4) DEFAULT 0 NOT NULL,
  conversion_rate numeric(5, 4) DEFAULT 0 NOT NULL,
  computed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(period)
);

CREATE INDEX IF NOT EXISTS revenue_snapshots_period_idx ON revenue_snapshots(period);

-- Price experiments table
CREATE TABLE IF NOT EXISTS price_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  plan text NOT NULL,
  country varchar(3),
  platform transaction_platform,
  variant_a_price_cents integer NOT NULL,
  variant_b_price_cents integer NOT NULL,
  started_at timestamptz,
  stopped_at timestamptz,
  status experiment_status DEFAULT 'draft' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS price_experiments_slug_idx ON price_experiments(slug);
CREATE INDEX IF NOT EXISTS price_experiments_status_idx ON price_experiments(status);
CREATE INDEX IF NOT EXISTS price_experiments_country_plan_idx ON price_experiments(country, plan);

-- Elasticity results table
CREATE TABLE IF NOT EXISTS elasticity_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country varchar(3),
  plan text NOT NULL,
  price_points jsonb NOT NULL DEFAULT '[]',
  demand jsonb NOT NULL DEFAULT '[]',
  elasticity numeric(8, 4) NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(country, plan)
);

CREATE INDEX IF NOT EXISTS elasticity_results_country_plan_idx ON elasticity_results(country, plan);

-- Van Westendorp surveys table
CREATE TABLE IF NOT EXISTS vanwestendorp_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  country varchar(3) NOT NULL,
  responses jsonb NOT NULL DEFAULT '[]',
  median_optimal_price integer,
  currency varchar(3) DEFAULT 'USD' NOT NULL,
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS vanwestendorp_surveys_user_id_idx ON vanwestendorp_surveys(user_id);
CREATE INDEX IF NOT EXISTS vanwestendorp_surveys_country_idx ON vanwestendorp_surveys(country);
CREATE INDEX IF NOT EXISTS vanwestendorp_surveys_ts_idx ON vanwestendorp_surveys(ts);

-- LTV segments table
CREATE TABLE IF NOT EXISTS ltv_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment ltv_segment NOT NULL,
  avg_ltv_cents integer DEFAULT 0 NOT NULL,
  avg_cac_cents integer DEFAULT 0 NOT NULL,
  margin_pct numeric(5, 2) DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(segment)
);

CREATE INDEX IF NOT EXISTS ltv_segments_segment_idx ON ltv_segments(segment);

-- RLS Policies

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE elasticity_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE vanwestendorp_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ltv_segments ENABLE ROW LEVEL SECURITY;

-- Transactions: Admin can see all, users see only their own aggregated data
CREATE POLICY transactions_admin_all ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan = 'partner')
    )
  );

-- Revenue snapshots: Only aggregated queries for non-admin
CREATE POLICY revenue_snapshots_read ON revenue_snapshots
  FOR SELECT
  TO authenticated
  USING (true); -- Allow read, but API should only return aggregated data

CREATE POLICY revenue_snapshots_admin ON revenue_snapshots
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan = 'partner')
    )
  );

-- Price experiments: Admin only
CREATE POLICY price_experiments_admin ON price_experiments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan = 'partner')
    )
  );

-- Elasticity results: Read for premium analytics, write admin only
CREATE POLICY elasticity_results_read ON elasticity_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan IN ('premium', 'partner'))
    )
  );

CREATE POLICY elasticity_results_admin ON elasticity_results
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan = 'partner')
    )
  );

-- Van Westendorp surveys: Users can insert their own, read aggregated only
CREATE POLICY vanwestendorp_surveys_insert ON vanwestendorp_surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

CREATE POLICY vanwestendorp_surveys_read_aggregated ON vanwestendorp_surveys
  FOR SELECT
  TO authenticated
  USING (true); -- Allow read, but API should only return aggregated data

-- LTV segments: Premium analytics can read, admin can write
CREATE POLICY ltv_segments_read ON ltv_segments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan IN ('premium', 'partner'))
    )
  );

CREATE POLICY ltv_segments_admin ON ltv_segments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan = 'partner')
    )
  );

-- Add comments for documentation
COMMENT ON TABLE transactions IS 'Records all payment transactions across platforms';
COMMENT ON TABLE revenue_snapshots IS 'Daily/weekly aggregated revenue KPIs';
COMMENT ON TABLE price_experiments IS 'A/B tests for pricing variants';
COMMENT ON TABLE elasticity_results IS 'Price elasticity coefficients per country/plan';
COMMENT ON TABLE vanwestendorp_surveys IS 'Survey responses for willingness-to-pay analysis';
COMMENT ON TABLE ltv_segments IS 'LTV/CAC metrics by user segment';

COMMENT ON COLUMN elasticity_results.elasticity IS 'Price elasticity: negative = elastic (demand sensitive), positive = inelastic';
COMMENT ON COLUMN revenue_snapshots.churn_rate IS 'Churn rate as decimal (0.05 = 5%)';
COMMENT ON COLUMN revenue_snapshots.conversion_rate IS 'Conversion rate as decimal (0.02 = 2%)';

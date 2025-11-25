-- ============================================================================
-- METRICS & AUTOMATION TABLES
-- Migration: 001_metrics.sql
-- Purpose: Core tables for financial metrics, ETL automation, and growth experiments
-- Timezone: America/Toronto
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- EVENTS TABLE
-- Tracks all business events (orders, signups, conversions, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  session_id text,
  properties jsonb DEFAULT '{}'::jsonb,
  revenue_cents integer DEFAULT 0,
  currency text DEFAULT 'USD',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  source text, -- 'web', 'mobile', 'api', 'etl'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_event_name ON events(event_name);
CREATE INDEX idx_events_occurred_at ON events(occurred_at);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_source ON events(source);

COMMENT ON TABLE events IS 'Business events for analytics and metrics computation';
COMMENT ON COLUMN events.properties IS 'Flexible JSONB for event-specific data';
COMMENT ON COLUMN events.revenue_cents IS 'Revenue in cents (integer to avoid float precision issues)';

-- ============================================================================
-- ORDERS TABLE
-- ETL'd from Shopify, Stripe, or other payment processors
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE NOT NULL, -- Shopify order ID, Stripe payment intent, etc.
  user_id uuid REFERENCES auth.users(id),
  order_number text,
  status text NOT NULL, -- 'pending', 'paid', 'refunded', 'cancelled'
  total_cents integer NOT NULL,
  subtotal_cents integer NOT NULL,
  tax_cents integer DEFAULT 0,
  shipping_cents integer DEFAULT 0,
  discount_cents integer DEFAULT 0,
  currency text DEFAULT 'USD',
  payment_method text,
  items jsonb DEFAULT '[]'::jsonb,
  customer_email text,
  customer_name text,
  shipping_address jsonb,
  billing_address jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  ordered_at timestamptz NOT NULL,
  paid_at timestamptz,
  refunded_at timestamptz,
  refund_amount_cents integer DEFAULT 0,
  source text NOT NULL, -- 'shopify', 'stripe', 'manual'
  etl_pulled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_external_id ON orders(external_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_ordered_at ON orders(ordered_at);
CREATE INDEX idx_orders_source ON orders(source);
CREATE INDEX idx_orders_etl_pulled_at ON orders(etl_pulled_at);

COMMENT ON TABLE orders IS 'Orders from all sources (Shopify, Stripe, etc.)';
COMMENT ON COLUMN orders.external_id IS 'External system order ID (Shopify order ID, Stripe payment intent)';
COMMENT ON COLUMN orders.items IS 'Array of order items with product details';

-- ============================================================================
-- SPEND TABLE
-- Tracks marketing/advertising spend by channel and campaign
-- ============================================================================
CREATE TABLE IF NOT EXISTS spend (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL, -- 'meta', 'tiktok', 'google', 'organic', 'other'
  campaign_id text,
  campaign_name text,
  ad_set_id text,
  ad_set_name text,
  ad_id text,
  ad_name text,
  spend_cents integer NOT NULL,
  currency text DEFAULT 'USD',
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  conversion_value_cents integer DEFAULT 0,
  date date NOT NULL,
  hour integer, -- 0-23, nullable for daily aggregates
  metadata jsonb DEFAULT '{}'::jsonb,
  source text NOT NULL, -- 'meta_api', 'tiktok_api', 'manual', 'google_ads_api'
  etl_pulled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel, campaign_id, ad_set_id, ad_id, date, hour)
);

CREATE INDEX idx_spend_channel ON spend(channel);
CREATE INDEX idx_spend_date ON spend(date);
CREATE INDEX idx_spend_campaign_id ON spend(campaign_id);
CREATE INDEX idx_spend_source ON spend(source);
CREATE INDEX idx_spend_etl_pulled_at ON spend(etl_pulled_at);

COMMENT ON TABLE spend IS 'Marketing/advertising spend by channel, campaign, and time';
COMMENT ON COLUMN spend.spend_cents IS 'Spend in cents (integer to avoid float precision issues)';

-- ============================================================================
-- EXPERIMENTS TABLE
-- Tracks growth experiments and A/B tests
-- ============================================================================
CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  hypothesis text NOT NULL,
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'running', 'paused', 'completed', 'cancelled'
  variant_a_name text NOT NULL DEFAULT 'control',
  variant_b_name text NOT NULL DEFAULT 'treatment',
  allocation_pct integer DEFAULT 50, -- % of traffic to variant B
  success_metric text NOT NULL, -- References metrics_daily.metric_name
  success_threshold numeric, -- Target value for success metric
  sample_size_heuristic integer, -- Estimated sample size needed
  started_at timestamptz,
  ended_at timestamptz,
  rollout_plan text,
  rollback_plan text,
  results_summary jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_experiments_slug ON experiments(slug);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_experiments_started_at ON experiments(started_at);

COMMENT ON TABLE experiments IS 'Growth experiments and A/B tests';
COMMENT ON COLUMN experiments.success_metric IS 'Metric name from metrics_daily table';

-- ============================================================================
-- METRICS_DAILY TABLE
-- Daily aggregated metrics for finance model and dashboards
-- ============================================================================
CREATE TABLE IF NOT EXISTS metrics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  metric_unit text DEFAULT 'count', -- 'count', 'cents', 'percentage', 'ratio'
  breakdown jsonb DEFAULT '{}'::jsonb, -- Channel, campaign, experiment breakdowns
  metadata jsonb DEFAULT '{}'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(metric_date, metric_name, breakdown)
);

CREATE INDEX idx_metrics_daily_date ON metrics_daily(metric_date);
CREATE INDEX idx_metrics_daily_name ON metrics_daily(metric_name);
CREATE INDEX idx_metrics_daily_computed_at ON metrics_daily(computed_at);

COMMENT ON TABLE metrics_daily IS 'Daily aggregated metrics for finance model and dashboards';
COMMENT ON COLUMN metrics_daily.metric_name IS 'e.g., revenue, orders, cac, ltv, refund_rate, cogs_pct';
COMMENT ON COLUMN metrics_daily.breakdown IS 'JSONB for dimensional breakdowns (channel, campaign, experiment)';

-- ============================================================================
-- ETL_LOGS TABLE
-- Tracks ETL job execution for monitoring and debugging
-- ============================================================================
CREATE TABLE IF NOT EXISTS etl_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL, -- 'pull_ads_meta', 'pull_shopify_orders', 'compute_metrics'
  status text NOT NULL, -- 'started', 'completed', 'failed', 'skipped'
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  records_processed integer DEFAULT 0,
  records_inserted integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  error_stack text,
  metadata jsonb DEFAULT '{}'::jsonb,
  dry_run boolean DEFAULT false
);

CREATE INDEX idx_etl_logs_job_name ON etl_logs(job_name);
CREATE INDEX idx_etl_logs_status ON etl_logs(status);
CREATE INDEX idx_etl_logs_started_at ON etl_logs(started_at);

COMMENT ON TABLE etl_logs IS 'ETL job execution logs for monitoring and debugging';

-- ============================================================================
-- TRIGGERS
-- Auto-update updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spend_updated_at
  BEFORE UPDATE ON spend
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at
  BEFORE UPDATE ON experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL METRIC DEFINITIONS (for reference)
-- ============================================================================

COMMENT ON TABLE metrics_daily IS '
Common metric_name values:
- revenue: Total revenue in cents
- orders: Order count
- refund_rate: Refund rate as percentage (0-100)
- cogs_pct: COGS as percentage of revenue (0-100)
- cac: Customer acquisition cost in cents
- ltv: Lifetime value in cents
- ltv_cac_ratio: LTV:CAC ratio
- gross_margin_pct: Gross margin percentage (0-100)
- ebitda_margin_pct: EBITDA margin percentage (0-100)
- cash_flow: Net cash flow in cents
- cumulative_cash: Cumulative cash position in cents
';

-- ============================================================================
-- PARTNER REVENUE NETWORK - MIGRATION
-- ============================================================================
-- Creates all tables for partner onboarding, catalog management, campaigns,
-- tracking, conversions, payouts, and fraud detection.
-- Includes RLS policies for partner data isolation.
-- ============================================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE partner_status AS ENUM ('invited', 'active', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE partner_tier AS ENUM ('affiliate', 'sponsor', 'full');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE catalog_feed_source AS ENUM ('api', 's3', 'csv', 'xml');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE catalog_availability AS ENUM ('in_stock', 'out_of_stock', 'preorder', 'discontinued');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_kind AS ENUM ('sponsored_tile', 'banner', 'recipe_pin', 'search_boost');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE campaign_status AS ENUM ('draft', 'running', 'paused', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE creative_kind AS ENUM ('tile', 'banner', 'video', 'native');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE creative_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE partner_link_kind AS ENUM ('affiliate', 'deeplink', 'cart');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attribution_model AS ENUM ('last_click', 'first_click', 'multi');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('pending', 'in_review', 'paid', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE fraud_related_kind AS ENUM ('click', 'conversion', 'campaign', 'partner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  contact_email text NOT NULL,
  status partner_status DEFAULT 'invited' NOT NULL,
  tier partner_tier DEFAULT 'affiliate' NOT NULL,
  stripe_connect_id text,
  attribution_window_days integer DEFAULT 7 NOT NULL CHECK (attribution_window_days >= 1 AND attribution_window_days <= 30),
  revenue_share_pct numeric(5, 4) DEFAULT 0.10 NOT NULL CHECK (revenue_share_pct >= 0 AND revenue_share_pct <= 1),
  kyc_status text DEFAULT 'pending',
  tax_form_status text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS partners_slug_idx ON partners(slug);
CREATE INDEX IF NOT EXISTS partners_status_idx ON partners(status);
CREATE INDEX IF NOT EXISTS partners_tier_idx ON partners(tier);

-- Partner API keys table
CREATE TABLE IF NOT EXISTS partner_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  key_hash text NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS partner_api_keys_partner_id_idx ON partner_api_keys(partner_id);
CREATE INDEX IF NOT EXISTS partner_api_keys_key_hash_idx ON partner_api_keys(key_hash);

-- Catalog feeds table
CREATE TABLE IF NOT EXISTS catalog_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  source catalog_feed_source NOT NULL,
  url text,
  schedule_cron text,
  last_sync_at timestamptz,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS catalog_feeds_partner_id_idx ON catalog_feeds(partner_id);
CREATE INDEX IF NOT EXISTS catalog_feeds_status_idx ON catalog_feeds(status);

-- Catalog items table
CREATE TABLE IF NOT EXISTS catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  sku text NOT NULL,
  title text NOT NULL,
  brand text,
  url text,
  image_url text,
  price_cents integer,
  currency varchar(3) DEFAULT 'USD' NOT NULL,
  availability catalog_availability DEFAULT 'in_stock',
  tags text[] DEFAULT '{}',
  affiliateable boolean DEFAULT true NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(partner_id, sku)
);

CREATE INDEX IF NOT EXISTS catalog_items_partner_id_idx ON catalog_items(partner_id);
CREATE INDEX IF NOT EXISTS catalog_items_sku_idx ON catalog_items(sku);
CREATE INDEX IF NOT EXISTS catalog_items_affiliateable_idx ON catalog_items(affiliateable);
CREATE INDEX IF NOT EXISTS catalog_items_tags_idx ON catalog_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS catalog_items_partner_sku_idx ON catalog_items(partner_id, sku);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind campaign_kind NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  budget_cents integer NOT NULL,
  currency varchar(3) DEFAULT 'USD' NOT NULL,
  cpm_cents integer,
  cpc_cents integer,
  cpa_cents integer,
  cap_daily integer,
  status campaign_status DEFAULT 'draft' NOT NULL,
  targeting jsonb DEFAULT '{}',
  spent_cents integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS campaigns_partner_id_idx ON campaigns(partner_id);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_kind_idx ON campaigns(kind);
CREATE INDEX IF NOT EXISTS campaigns_dates_idx ON campaigns(start_at, end_at) WHERE status = 'running';

-- Creatives table
CREATE TABLE IF NOT EXISTS creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  kind creative_kind NOT NULL,
  assets jsonb DEFAULT '{}',
  click_url text,
  impression_url text,
  width integer,
  height integer,
  status creative_status DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS creatives_campaign_id_idx ON creatives(campaign_id);
CREATE INDEX IF NOT EXISTS creatives_status_idx ON creatives(status);

-- Placements table
CREATE TABLE IF NOT EXISTS placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  slot text NOT NULL,
  rules jsonb DEFAULT '{}',
  priority integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS placements_campaign_id_idx ON placements(campaign_id);
CREATE INDEX IF NOT EXISTS placements_slot_idx ON placements(slot);

-- Partner links table
CREATE TABLE IF NOT EXISTS partner_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  sku text REFERENCES catalog_items(sku),
  kind partner_link_kind NOT NULL,
  signed_url text NOT NULL,
  expires_at timestamptz,
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS partner_links_partner_id_idx ON partner_links(partner_id);
CREATE INDEX IF NOT EXISTS partner_links_signed_url_idx ON partner_links(signed_url);
CREATE INDEX IF NOT EXISTS partner_links_expires_at_idx ON partner_links(expires_at);

-- Clicks table
CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ts timestamptz DEFAULT now() NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  anon_id text,
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  sku text,
  source text,
  country varchar(3),
  ua_hash text,
  ip_hash text,
  consent boolean DEFAULT false NOT NULL,
  signature text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS clicks_partner_id_idx ON clicks(partner_id);
CREATE INDEX IF NOT EXISTS clicks_campaign_id_idx ON clicks(campaign_id);
CREATE INDEX IF NOT EXISTS clicks_ts_idx ON clicks(ts);
CREATE INDEX IF NOT EXISTS clicks_user_id_idx ON clicks(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS clicks_anon_id_idx ON clicks(anon_id) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS clicks_partner_ts_idx ON clicks(partner_id, ts);

-- Conversions table
CREATE TABLE IF NOT EXISTS conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ts timestamptz DEFAULT now() NOT NULL,
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  order_id text NOT NULL,
  sku text,
  amount_cents integer NOT NULL,
  currency varchar(3) DEFAULT 'USD' NOT NULL,
  attribution attribution_model DEFAULT 'last_click' NOT NULL,
  click_id uuid REFERENCES clicks(id) ON DELETE SET NULL,
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(partner_id, order_id)
);

CREATE INDEX IF NOT EXISTS conversions_partner_id_idx ON conversions(partner_id);
CREATE INDEX IF NOT EXISTS conversions_campaign_id_idx ON conversions(campaign_id);
CREATE INDEX IF NOT EXISTS conversions_order_id_idx ON conversions(order_id);
CREATE INDEX IF NOT EXISTS conversions_ts_idx ON conversions(ts);
CREATE INDEX IF NOT EXISTS conversions_click_id_idx ON conversions(click_id);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  revenue_cents integer DEFAULT 0 NOT NULL,
  share_pct numeric(5, 4) NOT NULL,
  payout_cents integer NOT NULL,
  currency varchar(3) DEFAULT 'USD' NOT NULL,
  status payout_status DEFAULT 'pending' NOT NULL,
  stripe_transfer_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS payouts_partner_id_idx ON payouts(partner_id);
CREATE INDEX IF NOT EXISTS payouts_status_idx ON payouts(status);
CREATE INDEX IF NOT EXISTS payouts_period_idx ON payouts(period_start, period_end);

-- Fraud signals table
CREATE TABLE IF NOT EXISTS fraud_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  related_id uuid NOT NULL,
  related_kind fraud_related_kind NOT NULL,
  signal text NOT NULL,
  score numeric(3, 2) NOT NULL CHECK (score >= 0 AND score <= 1),
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS fraud_signals_related_idx ON fraud_signals(related_id, related_kind);
CREATE INDEX IF NOT EXISTS fraud_signals_score_idx ON fraud_signals(score);
CREATE INDEX IF NOT EXISTS fraud_signals_ts_idx ON fraud_signals(ts);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;

-- Helper function to get partner_id from JWT
CREATE OR REPLACE FUNCTION get_partner_id_from_jwt() RETURNS uuid AS $$
  SELECT (current_setting('request.jwt.claims', true)::json->>'partner_id')::uuid;
$$ LANGUAGE sql STABLE;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'role') = 'admin',
    false
  );
$$ LANGUAGE sql STABLE;

-- Partners RLS
CREATE POLICY partners_select_own ON partners
  FOR SELECT
  USING (
    id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY partners_update_own ON partners
  FOR UPDATE
  USING (
    id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY partners_insert_admin ON partners
  FOR INSERT
  WITH CHECK (is_admin());

-- Partner API keys RLS
CREATE POLICY partner_api_keys_select_own ON partner_api_keys
  FOR SELECT
  USING (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY partner_api_keys_insert_admin ON partner_api_keys
  FOR INSERT
  WITH CHECK (is_admin());

-- Catalog feeds RLS
CREATE POLICY catalog_feeds_select_own ON catalog_feeds
  FOR SELECT
  USING (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY catalog_feeds_insert_own ON catalog_feeds
  FOR INSERT
  WITH CHECK (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY catalog_feeds_update_own ON catalog_feeds
  FOR UPDATE
  USING (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

-- Catalog items RLS
CREATE POLICY catalog_items_select_own ON catalog_items
  FOR SELECT
  USING (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY catalog_items_insert_own ON catalog_items
  FOR INSERT
  WITH CHECK (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY catalog_items_update_own ON catalog_items
  FOR UPDATE
  USING (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

-- Campaigns RLS
CREATE POLICY campaigns_select_own ON campaigns
  FOR SELECT
  USING (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY campaigns_insert_own ON campaigns
  FOR INSERT
  WITH CHECK (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY campaigns_update_own ON campaigns
  FOR UPDATE
  USING (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

-- Creatives RLS (inherits from campaign partner_id via JOIN)
CREATE POLICY creatives_select_own ON creatives
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = creatives.campaign_id
      AND campaigns.partner_id = get_partner_id_from_jwt()
    ) OR is_admin()
  );

CREATE POLICY creatives_insert_own ON creatives
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = creatives.campaign_id
      AND campaigns.partner_id = get_partner_id_from_jwt()
    ) OR is_admin()
  )
);

-- Placements RLS (similar to creatives)
CREATE POLICY placements_select_own ON placements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = placements.campaign_id
      AND campaigns.partner_id = get_partner_id_from_jwt()
    ) OR is_admin()
  );

-- Partner links RLS
CREATE POLICY partner_links_select_own ON partner_links
  FOR SELECT
  USING (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY partner_links_insert_own ON partner_links
  FOR INSERT
  WITH CHECK (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

-- Clicks RLS
-- Partners can see their own clicks; users can see their own clicks
CREATE POLICY clicks_select_own ON clicks
  FOR SELECT
  USING (
    partner_id = get_partner_id_from_jwt()
    OR user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY clicks_insert_public ON clicks
  FOR INSERT
  WITH CHECK (true); -- Public endpoint for redirect handler

-- Conversions RLS
CREATE POLICY conversions_select_own ON conversions
  FOR SELECT
  USING (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY conversions_insert_partner ON conversions
  FOR INSERT
  WITH CHECK (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

-- Payouts RLS
CREATE POLICY payouts_select_own ON payouts
  FOR SELECT
  USING (
    partner_id = get_partner_id_from_jwt() OR is_admin()
  );

CREATE POLICY payouts_insert_admin ON payouts
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY payouts_update_admin ON payouts
  FOR UPDATE
  USING (is_admin());

-- Fraud signals RLS (admin only)
CREATE POLICY fraud_signals_select_admin ON fraud_signals
  FOR SELECT
  USING (is_admin());

CREATE POLICY fraud_signals_insert_admin ON fraud_signals
  FOR INSERT
  WITH CHECK (is_admin());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER catalog_feeds_updated_at BEFORE UPDATE ON catalog_feeds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER catalog_items_updated_at BEFORE UPDATE ON catalog_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER creatives_updated_at BEFORE UPDATE ON creatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER payouts_updated_at BEFORE UPDATE ON payouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

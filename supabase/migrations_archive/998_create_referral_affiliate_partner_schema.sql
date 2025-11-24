-- ============================================================================
-- REFERRAL, AFFILIATE & PARTNER PROGRAM SCHEMA
-- Comprehensive tracking and compensation system
-- ============================================================================

-- Referral program table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id) on delete cascade,
  referred_user_id uuid references auth.users(id) on delete set null,
  referral_code text not null unique,
  status text not null default 'pending' check (status in ('pending', 'completed', 'rewarded', 'expired')),
  referrer_reward_type text check (referrer_reward_type in ('discount', 'credit', 'subscription_days', 'cash')),
  referrer_reward_amount numeric(10,2) default 0,
  referred_reward_type text check (referred_reward_type in ('discount', 'credit', 'subscription_days')),
  referred_reward_amount numeric(10,2) default 0,
  conversion_event text, -- 'signup', 'subscription', 'trial_start'
  conversion_date timestamptz,
  reward_paid_at timestamptz,
  expires_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Referral rewards/credits tracking
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid references referrals(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  reward_type text not null check (reward_type in ('discount', 'credit', 'subscription_days', 'cash')),
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'applied', 'expired', 'revoked')),
  applied_at timestamptz,
  expires_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Affiliate program table
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  affiliate_code text not null unique,
  company_name text,
  website_url text,
  contact_email text not null,
  tax_id text, -- For tax reporting
  payment_method text check (payment_method in ('paypal', 'bank_transfer', 'stripe', 'check')),
  payment_details jsonb default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'suspended', 'rejected')),
  commission_rate numeric(5,2) not null default 20.00, -- Percentage (20%)
  commission_type text not null default 'recurring' check (commission_type in ('one_time', 'recurring', 'hybrid')),
  minimum_payout numeric(10,2) default 50.00,
  payout_frequency text not null default 'monthly' check (payout_frequency in ('weekly', 'bi_weekly', 'monthly', 'quarterly')),
  total_earnings numeric(10,2) default 0,
  paid_earnings numeric(10,2) default 0,
  pending_earnings numeric(10,2) default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  approved_at timestamptz
);

-- Affiliate conversions/sales tracking
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliates(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  subscription_id uuid references subscriptions(id) on delete set null,
  conversion_type text not null check (conversion_type in ('signup', 'trial', 'subscription', 'upgrade')),
  commission_amount numeric(10,2) not null,
  commission_rate numeric(5,2) not null,
  revenue_amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'reversed')),
  paid_at timestamptz,
  payout_period text, -- '2024-01' for January 2024
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Partner program table (enterprise/strategic partners)
CREATE TABLE IF NOT EXISTS partners (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  website_url text,
  partner_type text not null check (partner_type in ('strategic', 'technology', 'distribution', 'channel', 'integration')),
  partner_tier text not null default 'bronze' check (partner_tier in ('bronze', 'silver', 'gold', 'platinum', 'enterprise')),
  revenue_share_rate numeric(5,2) default 0, -- Percentage (0-100)
  revenue_share_model text check (revenue_share_model in ('fixed', 'tiered', 'volume_based', 'custom')),
  revenue_share_details jsonb default '{}', -- Tier details, custom rates, etc.
  minimum_commitment numeric(10,2), -- Minimum revenue commitment
  contract_start_date date,
  contract_end_date date,
  status text not null default 'prospect' check (status in ('prospect', 'active', 'inactive', 'terminated')),
  total_revenue_share_paid numeric(10,2) default 0,
  total_revenue_share_pending numeric(10,2) default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Partner revenue share tracking
CREATE TABLE IF NOT EXISTS partner_revenue_shares (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  revenue_amount numeric(10,2) not null,
  share_rate numeric(5,2) not null,
  share_amount numeric(10,2) not null,
  period_start date not null,
  period_end date not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'reversed')),
  paid_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Program analytics and tracking
CREATE TABLE IF NOT EXISTS program_analytics (
  id uuid primary key default gen_random_uuid(),
  program_type text not null check (program_type in ('referral', 'affiliate', 'partner')),
  program_id uuid not null, -- ID of referral/affiliate/partner
  event_type text not null check (event_type in ('signup', 'visit', 'click', 'conversion', 'payout')),
  user_id uuid references auth.users(id) on delete set null,
  amount numeric(10,2),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Payout tracking for affiliates and partners
CREATE TABLE IF NOT EXISTS program_payouts (
  id uuid primary key default gen_random_uuid(),
  program_type text not null check (program_type in ('affiliate', 'partner')),
  program_id uuid not null, -- affiliate_id or partner_id
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  payout_method text not null,
  payout_reference text, -- Transaction ID, check number, etc.
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'reversed')),
  period_start date,
  period_end date,
  conversion_ids uuid[], -- Array of conversion IDs included in this payout
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  processed_at timestamptz,
  completed_at timestamptz
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);

CREATE INDEX IF NOT EXISTS idx_affiliates_user ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate ON affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_status ON affiliate_conversions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_period ON affiliate_conversions(payout_period);

CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_tier ON partners(partner_tier);

CREATE INDEX IF NOT EXISTS idx_partner_revenue_partner ON partner_revenue_shares(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_revenue_status ON partner_revenue_shares(status);

CREATE INDEX IF NOT EXISTS idx_program_analytics_program ON program_analytics(program_type, program_id);
CREATE INDEX IF NOT EXISTS idx_program_analytics_event ON program_analytics(event_type);

CREATE INDEX IF NOT EXISTS idx_program_payouts_program ON program_payouts(program_type, program_id);
CREATE INDEX IF NOT EXISTS idx_program_payouts_status ON program_payouts(status);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_id uuid)
RETURNS text AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    code := upper(substring(md5(user_id::text || random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM referrals WHERE referral_code = code) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate referral reward
CREATE OR REPLACE FUNCTION calculate_referral_reward(
  reward_type text,
  reward_amount numeric,
  subscription_plan text
)
RETURNS numeric AS $$
BEGIN
  -- Custom logic based on reward type and plan
  IF reward_type = 'subscription_days' THEN
    RETURN reward_amount; -- Days
  ELSIF reward_type = 'credit' THEN
    RETURN reward_amount; -- Credit amount
  ELSIF reward_type = 'discount' THEN
    -- Calculate discount based on plan
    CASE subscription_plan
      WHEN 'pro' THEN RETURN reward_amount; -- Percentage or fixed
      WHEN 'family' THEN RETURN reward_amount * 1.5; -- More for family plan
      ELSE RETURN reward_amount;
    END CASE;
  END IF;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate affiliate commission
CREATE OR REPLACE FUNCTION calculate_affiliate_commission(
  affiliate_id uuid,
  revenue_amount numeric,
  conversion_type text
)
RETURNS numeric AS $$
DECLARE
  rate numeric;
  commission numeric;
BEGIN
  SELECT commission_rate INTO rate FROM affiliates WHERE id = affiliate_id;
  
  -- Adjust rate based on conversion type
  IF conversion_type = 'subscription' THEN
    commission := revenue_amount * (rate / 100);
  ELSIF conversion_type = 'trial' THEN
    commission := revenue_amount * (rate / 100) * 0.5; -- 50% for trials
  ELSE
    commission := revenue_amount * (rate / 100);
  END IF;
  
  RETURN commission;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_revenue_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_payouts ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Affiliates can view their own data
CREATE POLICY "Affiliates can view own data"
  ON affiliates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Affiliates can view own conversions"
  ON affiliate_conversions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM affiliates
      WHERE affiliates.id = affiliate_conversions.affiliate_id
      AND affiliates.user_id = auth.uid()
    )
  );

-- Partners (admin only for now, can be expanded)
CREATE POLICY "Partners view (admin only)"
  ON partners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Public can insert analytics (for tracking)
CREATE POLICY "Public can track analytics"
  ON program_analytics FOR INSERT
  WITH CHECK (true);

-- Admin can manage all
CREATE POLICY "Admin can manage all programs"
  ON referrals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

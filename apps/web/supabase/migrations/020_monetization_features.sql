-- Monetization Features Schema
-- Migration: 015_monetization_features.sql
-- 
-- Creates tables for comprehensive monetization features:
-- - Customer value profiles
-- - Usage credits system
-- - Referral program enhancements
-- - Conversion metrics
-- - Retention metrics
-- - Feature access attempts

-- ============================================================================
-- SECTION 1: CUSTOMER VALUE PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_value_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  lifetime_value DECIMAL(10, 2) DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  last_upsell_date TIMESTAMPTZ,
  last_activity_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_value_profiles_tenant_id ON customer_value_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customer_value_profiles_engagement_score ON customer_value_profiles(engagement_score);

-- ============================================================================
-- SECTION 2: USAGE CREDITS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS usage_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('purchase', 'bonus', 'referral', 'trial', 'usage', 'loyalty')),
  feature_id TEXT,
  referral_id UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_credits_user_id ON usage_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_credits_tenant_id ON usage_credits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_credits_expires_at ON usage_credits(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- SECTION 3: REFERRAL PROGRAM ENHANCEMENTS
-- ============================================================================

-- Enhanced referral rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('credits', 'subscription_days', 'discount', 'cash')),
  reward_value DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'pending_conversion', 'awarded', 'expired')),
  awarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referral_id ON referral_rewards(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);

-- Enhanced referral signups tracking
CREATE TABLE IF NOT EXISTS referral_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired')),
  conversion_value DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referral_id, referee_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_signups_referrer_id ON referral_signups(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_referee_id ON referral_signups(referee_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_status ON referral_signups(status);

-- ============================================================================
-- SECTION 4: CONVERSION METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversion_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id TEXT NOT NULL,
  trigger_id TEXT NOT NULL,
  converted BOOLEAN NOT NULL DEFAULT FALSE,
  conversion_value DECIMAL(10, 2),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversion_metrics_user_id ON conversion_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_metrics_strategy_id ON conversion_metrics(strategy_id);
CREATE INDEX IF NOT EXISTS idx_conversion_metrics_converted ON conversion_metrics(converted);

-- ============================================================================
-- SECTION 5: RETENTION METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS retention_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('win_back', 'churn_prevention', 'loyalty_reward', 're_engagement')),
  converted BOOLEAN NOT NULL DEFAULT FALSE,
  conversion_value DECIMAL(10, 2),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retention_metrics_user_id ON retention_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_retention_metrics_offer_type ON retention_metrics(offer_type);
CREATE INDEX IF NOT EXISTS idx_retention_metrics_converted ON retention_metrics(converted);

-- ============================================================================
-- SECTION 6: FEATURE ACCESS ATTEMPTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_access_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  blocked BOOLEAN NOT NULL DEFAULT TRUE,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_access_attempts_user_id ON feature_access_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_access_attempts_feature_id ON feature_access_attempts(feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_access_attempts_blocked ON feature_access_attempts(blocked);

-- ============================================================================
-- SECTION 7: HELPER FUNCTIONS
-- ============================================================================

-- Function to update customer value profile updated_at
CREATE OR REPLACE FUNCTION update_customer_value_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_value_profiles_updated_at
  BEFORE UPDATE ON customer_value_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_value_profile_updated_at();

-- Function to extend subscription
CREATE OR REPLACE FUNCTION extend_subscription(
  user_id_param UUID,
  days_param INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET expires_at = COALESCE(expires_at, NOW()) + (days_param || ' days')::INTERVAL,
      updated_at = NOW()
  WHERE user_id = user_id_param
    AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get total credits for a user
CREATE OR REPLACE FUNCTION get_user_total_credits(
  user_id_param UUID,
  tenant_id_param UUID
)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COALESCE(SUM(credits), 0) INTO total
  FROM usage_credits
  WHERE user_id = user_id_param
    AND tenant_id = tenant_id_param
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 8: RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE customer_value_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_access_attempts ENABLE ROW LEVEL SECURITY;

-- Customer value profiles policies
CREATE POLICY "Users can view their own value profile"
  ON customer_value_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own value profile"
  ON customer_value_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Usage credits policies
CREATE POLICY "Users can view their own credits"
  ON usage_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON usage_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Referral rewards policies
CREATE POLICY "Users can view their own referral rewards"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Referral signups policies
CREATE POLICY "Users can view their own referral signups"
  ON referral_signups FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Conversion metrics policies
CREATE POLICY "Users can view their own conversion metrics"
  ON conversion_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversion metrics"
  ON conversion_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Retention metrics policies
CREATE POLICY "Users can view their own retention metrics"
  ON retention_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own retention metrics"
  ON retention_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Feature access attempts policies
CREATE POLICY "Users can view their own feature access attempts"
  ON feature_access_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feature access attempts"
  ON feature_access_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SECTION 9: COMMENTS
-- ============================================================================

COMMENT ON TABLE customer_value_profiles IS 'Stores customer value analysis and monetization potential';
COMMENT ON TABLE usage_credits IS 'Tracks usage-based premium feature credits';
COMMENT ON TABLE referral_rewards IS 'Tracks referral program rewards and bonuses';
COMMENT ON TABLE referral_signups IS 'Tracks referral signups and conversions';
COMMENT ON TABLE conversion_metrics IS 'Tracks paywall and conversion strategy performance';
COMMENT ON TABLE retention_metrics IS 'Tracks retention offers and churn prevention';
COMMENT ON TABLE feature_access_attempts IS 'Tracks premium feature access attempts for upsell opportunities';

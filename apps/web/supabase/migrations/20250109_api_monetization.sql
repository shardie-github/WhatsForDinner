-- API Monetization System
-- Zero-effort setup - pre-configured pricing tiers

-- API Plans (Pre-configured)
CREATE TABLE IF NOT EXISTS api_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  rate_limit INTEGER NOT NULL, -- Requests per minute
  monthly_limit INTEGER NOT NULL, -- Requests per month
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert pre-configured plans
INSERT INTO api_plans (id, name, price, rate_limit, monthly_limit, features) VALUES
  ('free', 'Free Tier', 0.00, 10, 1000, '["Basic API access", "Community support"]'::jsonb),
  ('starter', 'Starter', 29.00, 60, 10000, '["All free features", "Email support", "Higher limits"]'::jsonb),
  ('professional', 'Professional', 99.00, 300, 100000, '["All starter features", "Priority support", "Custom endpoints"]'::jsonb),
  ('enterprise', 'Enterprise', 299.00, 1000, -1, '["Unlimited requests", "Dedicated support", "SLA", "Custom integrations"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES api_plans(id),
  key_hash TEXT UNIQUE NOT NULL,
  rate_limit INTEGER NOT NULL,
  monthly_limit INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ
);

-- API Usage Tracking
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  requests_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key_id, DATE(created_at))
);

-- API Billing (for Stripe integration)
CREATE TABLE IF NOT EXISTS api_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES api_plans(id),
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON api_usage(key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_billing_user ON api_billing(user_id);

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_billing ENABLE ROW LEVEL SECURITY;

-- Users can view their own keys
CREATE POLICY "Users can view own keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON api_usage
  FOR SELECT USING (key_id IN (SELECT id FROM api_keys WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own billing" ON api_billing
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service can manage keys" ON api_keys
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service can manage usage" ON api_usage
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service can manage billing" ON api_billing
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update usage count
CREATE OR REPLACE FUNCTION update_api_usage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO api_usage (key_id, endpoint, requests_count, created_at)
  VALUES (NEW.key_id, NEW.endpoint, 1, DATE_TRUNC('day', NOW()))
  ON CONFLICT (key_id, DATE(created_at))
  DO UPDATE SET requests_count = api_usage.requests_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

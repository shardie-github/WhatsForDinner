-- Missing Tables Referenced in APIs
-- Complete all missing table definitions

-- User Engagement Table (for engagement scoring)
CREATE TABLE IF NOT EXISTS user_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_frequency DECIMAL(5,2) DEFAULT 0,
  feature_usage JSONB DEFAULT '{}'::jsonb,
  avg_session_duration INTEGER DEFAULT 0,
  content_views INTEGER DEFAULT 0,
  social_interactions INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  days_active INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Subscriptions Table (if not exists)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription Plans Table (if not exists)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans if not exist
INSERT INTO subscription_plans (id, name, description, price, billing_cycle, features) VALUES
  ('free', 'Free', 'Basic features', 0.00, 'monthly', '["Basic access", "Community support"]'::jsonb),
  ('basic', 'Basic', 'Essential features', 9.99, 'monthly', '["All free features", "Email support", "Priority access"]'::jsonb),
  ('pro', 'Professional', 'Advanced features', 29.99, 'monthly', '["All basic features", "Priority support", "Advanced analytics"]'::jsonb),
  ('enterprise', 'Enterprise', 'Full access', 99.99, 'monthly', '["All features", "Dedicated support", "Custom integrations"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_engagement_user ON user_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- RLS Policies
ALTER TABLE user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own engagement" ON user_engagement
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage engagement" ON user_engagement
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service can manage profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update engagement score automatically
CREATE OR REPLACE FUNCTION update_engagement_score()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER;
BEGIN
  -- Calculate score based on metrics
  score := 
    LEAST(25, (NEW.login_frequency / 5.0) * 10) +
    LEAST(25, (jsonb_object_keys(NEW.feature_usage)::text::int / 10.0) * 10) +
    LEAST(25, (NEW.purchase_count * 5)) +
    LEAST(25, CASE 
      WHEN NOW() - NEW.last_activity < INTERVAL '1 day' THEN 25
      WHEN NOW() - NEW.last_activity < INTERVAL '3 days' THEN 20
      WHEN NOW() - NEW.last_activity < INTERVAL '7 days' THEN 15
      WHEN NOW() - NEW.last_activity < INTERVAL '14 days' THEN 5
      ELSE 0
    END);
  
  NEW.engagement_score := score;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_engagement_score
  BEFORE INSERT OR UPDATE ON user_engagement
  FOR EACH ROW EXECUTE FUNCTION update_engagement_score();

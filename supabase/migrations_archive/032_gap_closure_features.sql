-- Gap Closure Features Migration
-- Adds tables for onboarding, experiments, user preferences, and referrals

-- User Preferences Table (for dietary preferences wizard)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  diets TEXT[] DEFAULT '{}', -- ['keto', 'vegan', 'paleo', etc.]
  allergies TEXT[] DEFAULT '{}', -- ['nuts', 'dairy', 'gluten', etc.]
  cooking_skill TEXT CHECK (cooking_skill IN ('beginner', 'intermediate', 'advanced')),
  custom_preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Onboarding State Table
CREATE TABLE IF NOT EXISTS onboarding_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_completed BOOLEAN DEFAULT FALSE,
  sample_data_seeded BOOLEAN DEFAULT FALSE,
  first_recipe_generated BOOLEAN DEFAULT FALSE,
  preferences_set BOOLEAN DEFAULT FALSE,
  recipe_saved BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment Events Table (for A/B testing)
CREATE TABLE IF NOT EXISTS experiment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id TEXT NOT NULL,
  variant TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_type TEXT NOT NULL, -- 'assigned', 'conversion', 'exposure'
  event_name TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals Table (for waitlist/referral program)
CREATE TABLE IF NOT EXISTS lead_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_email TEXT,
  referred_email TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted')),
  signed_up_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update pantry_items to support sample data flag
ALTER TABLE pantry_items ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;

-- RLS Policies

-- User Preferences: Users can read/write their own
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Server role can read all preferences (for recipe generation)
CREATE POLICY "Server can read all preferences"
  ON user_preferences FOR SELECT
  USING (true); -- In production, restrict to service_role

-- Onboarding State: Users can read/write their own
ALTER TABLE onboarding_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own onboarding state"
  ON onboarding_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding state"
  ON onboarding_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding state"
  ON onboarding_state FOR UPDATE
  USING (auth.uid() = user_id);

-- Experiment Events: Users can create their own events (anon can create view events)
ALTER TABLE experiment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own experiment events"
  ON experiment_events FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND event_type IN ('assigned', 'exposure', 'conversion'))
  );

CREATE POLICY "Users can read own experiment events"
  ON experiment_events FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Server role can read all experiment events (for analytics)
CREATE POLICY "Server can read all experiment events"
  ON experiment_events FOR SELECT
  USING (true); -- In production, restrict to service_role

-- Lead Referrals: Users can read/write their own referrals
ALTER TABLE lead_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals"
  ON lead_referrals FOR SELECT
  USING (auth.uid() = referrer_id OR referrer_id IS NULL);

CREATE POLICY "Users can insert own referrals"
  ON lead_referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id OR referrer_id IS NULL);

CREATE POLICY "Users can update own referrals"
  ON lead_referrals FOR UPDATE
  USING (auth.uid() = referrer_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_state_user_id ON onboarding_state(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_experiment_id ON experiment_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_user_id ON experiment_events(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_created_at ON experiment_events(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_referrals_referrer_id ON lead_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_lead_referrals_referral_code ON lead_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_pantry_items_is_sample ON pantry_items(is_sample);

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_state_updated_at
  BEFORE UPDATE ON onboarding_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

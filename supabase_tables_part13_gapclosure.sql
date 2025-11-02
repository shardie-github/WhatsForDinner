-- ============================================================================
-- PART 13: GAP CLOSURE FEATURES - Run after Part 12 (Final Part)
-- ============================================================================

-- User Preferences Table (for dietary preferences wizard)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  diets TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
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
  event_type TEXT NOT NULL,
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

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- All tables have been created successfully!
-- You can now set up Row Level Security policies and indexes as needed.

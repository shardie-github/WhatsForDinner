-- ============================================================================
-- NOMAD BACKEND - INITIAL SCHEMA MIGRATION
-- ============================================================================
-- This migration creates all core tables for Nomad backend
-- Includes RLS policies for security
-- ============================================================================

-- Create enums
DO $$ BEGIN
  CREATE TYPE plan AS ENUM ('free', 'premium', 'partner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE role AS ENUM ('owner', 'adult', 'teen', 'child');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE recipe_source AS ENUM ('curated', 'partner', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE health_metric_kind AS ENUM ('weight', 'sleep', 'water', 'steps', 'calories');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE room_kind AS ENUM ('family', 'dm');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Helper function for auth.uid() compatibility
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'sub'::uuid;
$$ LANGUAGE sql STABLE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  plan plan DEFAULT 'free' NOT NULL,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Households table
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Household members table
CREATE TABLE IF NOT EXISTS household_members (
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role role DEFAULT 'adult' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (household_id, user_id)
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  media_url text,
  steps jsonb NOT NULL DEFAULT '[]',
  ingredients jsonb NOT NULL DEFAULT '[]',
  macros jsonb,
  tags text[] DEFAULT '{}',
  source recipe_source DEFAULT 'user' NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  day date NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Grocery lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name text,
  items jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind health_metric_kind NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  kind room_kind DEFAULT 'family' NOT NULL,
  participants uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]',
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Feature flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  flags jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Ad impressions table
CREATE TABLE IF NOT EXISTS ad_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  slot text NOT NULL,
  kind text NOT NULL,
  ts timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  props jsonb DEFAULT '{}',
  ts timestamptz DEFAULT now() NOT NULL
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug text NOT NULL,
  key_hash text NOT NULL,
  scopes text[] NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Webhook events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  external_id text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(source, external_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS meal_plans_user_day_idx ON meal_plans(user_id, day);
CREATE INDEX IF NOT EXISTS health_metrics_user_kind_ts_idx ON health_metrics(user_id, kind, ts);
CREATE INDEX IF NOT EXISTS messages_room_ts_idx ON messages(room_id, ts);
CREATE INDEX IF NOT EXISTS events_user_ts_idx ON events(user_id, ts);
CREATE INDEX IF NOT EXISTS recipes_source_idx ON recipes(source);
CREATE INDEX IF NOT EXISTS recipes_tags_idx ON recipes USING gin(tags);
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON recipes(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Households policies
CREATE POLICY "Household members can view household"
  ON households FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = households.id
      AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Household owner can manage household"
  ON households FOR ALL
  USING (owner_id = auth.uid());

-- Household members policies
CREATE POLICY "Household members can view members"
  ON household_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
      AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Household owner can manage members"
  ON household_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM households h
      WHERE h.id = household_members.household_id
      AND h.owner_id = auth.uid()
    )
  );

-- Recipes policies
CREATE POLICY "Public curated and partner recipes"
  ON recipes FOR SELECT
  USING (source IN ('curated', 'partner'));

CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own recipes"
  ON recipes FOR ALL
  USING (user_id = auth.uid());

-- Meal plans policies
CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = meal_plans.household_id
      AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own meal plans"
  ON meal_plans FOR ALL
  USING (user_id = auth.uid());

-- Grocery lists policies
CREATE POLICY "Household members can view grocery lists"
  ON grocery_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = grocery_lists.household_id
      AND hm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM households h
      WHERE h.id = grocery_lists.household_id
      AND h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Household members can manage grocery lists"
  ON grocery_lists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = grocery_lists.household_id
      AND hm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM households h
      WHERE h.id = grocery_lists.household_id
      AND h.owner_id = auth.uid()
    )
  );

-- Health metrics policies
CREATE POLICY "Users can view own health metrics"
  ON health_metrics FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own health metrics"
  ON health_metrics FOR ALL
  USING (user_id = auth.uid());

-- Rooms policies
CREATE POLICY "Room participants can view room"
  ON rooms FOR SELECT
  USING (
    auth.uid() = ANY(participants)
    OR EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = rooms.household_id
      AND hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Room participants can manage room"
  ON rooms FOR ALL
  USING (auth.uid() = ANY(participants));

-- Messages policies
CREATE POLICY "Room participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = messages.room_id
      AND (auth.uid() = ANY(r.participants) OR EXISTS (
        SELECT 1 FROM household_members hm
        WHERE hm.household_id = r.household_id
        AND hm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Room participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.id = messages.room_id
      AND (auth.uid() = ANY(r.participants) OR EXISTS (
        SELECT 1 FROM household_members hm
        WHERE hm.household_id = r.household_id
        AND hm.user_id = auth.uid()
      ))
    )
    AND sender_id = auth.uid()
  );

-- Feature flags policies
CREATE POLICY "Users can view own feature flags"
  ON feature_flags FOR SELECT
  USING (user_id = auth.uid());

-- Ad impressions policies (less restrictive for analytics)
CREATE POLICY "Users can insert own ad impressions"
  ON ad_impressions FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Events policies (less restrictive for analytics)
CREATE POLICY "Users can insert own events"
  ON events FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at BEFORE UPDATE ON grocery_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration for 2-week sprint features
-- Expiration tracking, collections, meal planning

-- Expiration alerts table
CREATE TABLE IF NOT EXISTS expiration_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alerts JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  INDEX idx_expiration_alerts_user_id (user_id),
  INDEX idx_expiration_alerts_created_at (created_at)
);

-- Recipe collections table
CREATE TABLE IF NOT EXISTS recipe_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  recipe_ids UUID[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_recipe_collections_user_id (user_id),
  INDEX idx_recipe_collections_is_public (is_public)
);

-- Meal plans table (enhanced)
CREATE TABLE IF NOT EXISTS meal_plans_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  meals JSONB NOT NULL DEFAULT '{}',
  shopping_list_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_meal_plans_user_id (user_id),
  INDEX idx_meal_plans_household_id (household_id),
  INDEX idx_meal_plans_week_start (week_start_date)
);

-- Family activity feed
CREATE TABLE IF NOT EXISTS family_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  activity_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_family_activities_user_id (user_id),
  INDEX idx_family_activities_household_id (household_id),
  INDEX idx_family_activities_created_at (created_at)
);

-- Nutrition tracking
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  calories INTEGER,
  protein_g DECIMAL(10, 2),
  carbs_g DECIMAL(10, 2),
  fat_g DECIMAL(10, 2),
  fiber_g DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_nutrition_logs_user_id (user_id),
  INDEX idx_nutrition_logs_date (date)
);

-- RLS Policies
ALTER TABLE expiration_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Expiration alerts policies
CREATE POLICY "Users can view their own expiration alerts"
  ON expiration_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expiration alerts"
  ON expiration_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Recipe collections policies
CREATE POLICY "Users can view their own collections and public ones"
  ON recipe_collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own collections"
  ON recipe_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON recipe_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON recipe_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Meal plans policies
CREATE POLICY "Users can view their own meal plans"
  ON meal_plans_enhanced FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Household members can view household meal plans"
  ON meal_plans_enhanced FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = meal_plans_enhanced.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own meal plans"
  ON meal_plans_enhanced FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Family activities policies
CREATE POLICY "Household members can view household activities"
  ON family_activities FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_id = family_activities.household_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activities"
  ON family_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Nutrition logs policies
CREATE POLICY "Users can view their own nutrition logs"
  ON nutrition_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own nutrition logs"
  ON nutrition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition logs"
  ON nutrition_logs FOR UPDATE
  USING (auth.uid() = user_id);

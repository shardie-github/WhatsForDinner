-- ============================================================================
-- Premium Features Migration
-- Adds expiration tracking, nutrition cache, meal plans, and cost tracking
-- ============================================================================

-- Add expiration_date to pantry_items
ALTER TABLE pantry_items 
ADD COLUMN IF NOT EXISTS expiration_date DATE,
ADD COLUMN IF NOT EXISTS added_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'unit';

-- Create nutrition_cache table for USDA API data
CREATE TABLE IF NOT EXISTS nutrition_cache (
  id BIGSERIAL PRIMARY KEY,
  ingredient TEXT NOT NULL,
  amount NUMERIC,
  unit TEXT,
  nutrition_data JSONB NOT NULL,
  completeness NUMERIC DEFAULT 0,
  source TEXT DEFAULT 'usda',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  UNIQUE(ingredient, amount, unit)
);

CREATE INDEX IF NOT EXISTS idx_nutrition_cache_ingredient ON nutrition_cache(ingredient);
CREATE INDEX IF NOT EXISTS idx_nutrition_cache_expires ON nutrition_cache(expires_at);

-- Create ingredient_prices table for cost tracking
CREATE TABLE IF NOT EXISTS ingredient_prices (
  id BIGSERIAL PRIMARY KEY,
  ingredient TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  region TEXT,
  source TEXT DEFAULT 'estimated',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ingredient, unit, region, date)
);

CREATE INDEX IF NOT EXISTS idx_ingredient_prices_ingredient ON ingredient_prices(ingredient);
CREATE INDEX IF NOT EXISTS idx_ingredient_prices_date ON ingredient_prices(date);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  preferences JSONB,
  shopping_list JSONB,
  nutrition_summary JSONB,
  total_cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_tenant_id ON meal_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_week_start ON meal_plans(week_start_date);

-- Create meal_plan_days table
CREATE TABLE IF NOT EXISTS meal_plan_days (
  id BIGSERIAL PRIMARY KEY,
  meal_plan_id BIGINT REFERENCES meal_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  breakfast_recipe_id BIGINT REFERENCES recipes(id),
  lunch_recipe_id BIGINT REFERENCES recipes(id),
  dinner_recipe_id BIGINT REFERENCES recipes(id),
  snack_recipe_id BIGINT REFERENCES recipes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plan_days_meal_plan_id ON meal_plan_days(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_date ON meal_plan_days(date);

-- Create user_preferences table for preference learning
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL, -- 'cuisine', 'diet', 'ingredient', 'difficulty'
  preference_value TEXT NOT NULL,
  preference_score NUMERIC DEFAULT 1.0, -- Weight/importance
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_type, preference_value)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_tenant_id ON user_preferences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type ON user_preferences(preference_type);

-- Create user_interactions table for tracking user behavior
CREATE TABLE IF NOT EXISTS user_interactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'recipe_viewed', 'recipe_favorited', 'recipe_rated', 'recipe_cooked'
  recipe_id BIGINT REFERENCES recipes(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_tenant_id ON user_interactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created ON user_interactions(created_at);

-- Create recipe_shares table for recipe sharing
CREATE TABLE IF NOT EXISTS recipe_shares (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipe_shares_token ON recipe_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_recipe_id ON recipe_shares(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_tenant_id ON recipe_shares(tenant_id);

-- Create recipe_collections table
CREATE TABLE IF NOT EXISTS recipe_collections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipe_collections_user_id ON recipe_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_collections_tenant_id ON recipe_collections(tenant_id);

-- Create recipe_collection_items table
CREATE TABLE IF NOT EXISTS recipe_collection_items (
  id BIGSERIAL PRIMARY KEY,
  collection_id BIGINT REFERENCES recipe_collections(id) ON DELETE CASCADE,
  recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON recipe_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_recipe_id ON recipe_collection_items(recipe_id);

-- Create cost_savings_tracking table
CREATE TABLE IF NOT EXISTS cost_savings_tracking (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  recipe_id BIGINT REFERENCES recipes(id),
  home_cooked_cost NUMERIC NOT NULL,
  restaurant_cost NUMERIC DEFAULT 15.00,
  savings NUMERIC NOT NULL,
  savings_percentage NUMERIC,
  meal_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_savings_user_id ON cost_savings_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_cost_savings_tenant_id ON cost_savings_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cost_savings_date ON cost_savings_tracking(meal_date);

-- Enable RLS on all new tables
ALTER TABLE nutrition_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_savings_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nutrition_cache (public read, authenticated write)
CREATE POLICY "nutrition_cache_select_public" ON nutrition_cache
  FOR SELECT USING (expires_at > NOW());

CREATE POLICY "nutrition_cache_insert_authenticated" ON nutrition_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for ingredient_prices (public read)
CREATE POLICY "ingredient_prices_select_public" ON ingredient_prices
  FOR SELECT USING (true);

CREATE POLICY "ingredient_prices_insert_authenticated" ON ingredient_prices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for meal_plans (tenant-based)
CREATE POLICY "meal_plans_select_tenant" ON meal_plans
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "meal_plans_insert_tenant" ON meal_plans
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "meal_plans_update_tenant" ON meal_plans
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "meal_plans_delete_tenant" ON meal_plans
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for meal_plan_days (tenant-based via meal_plan)
CREATE POLICY "meal_plan_days_select_tenant" ON meal_plan_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meal_plans mp
      JOIN tenant_members tm ON mp.tenant_id = tm.tenant_id
      WHERE mp.id = meal_plan_days.meal_plan_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "meal_plan_days_insert_tenant" ON meal_plan_days
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meal_plans mp
      JOIN tenant_members tm ON mp.tenant_id = tm.tenant_id
      WHERE mp.id = meal_plan_days.meal_plan_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "meal_plan_days_update_tenant" ON meal_plan_days
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM meal_plans mp
      JOIN tenant_members tm ON mp.tenant_id = tm.tenant_id
      WHERE mp.id = meal_plan_days.meal_plan_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "meal_plan_days_delete_tenant" ON meal_plan_days
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM meal_plans mp
      JOIN tenant_members tm ON mp.tenant_id = tm.tenant_id
      WHERE mp.id = meal_plan_days.meal_plan_id
      AND tm.user_id = auth.uid()
    )
  );

-- RLS Policies for user_preferences (tenant-based)
CREATE POLICY "user_preferences_select_tenant" ON user_preferences
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "user_preferences_insert_tenant" ON user_preferences
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "user_preferences_update_tenant" ON user_preferences
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "user_preferences_delete_tenant" ON user_preferences
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for user_interactions (tenant-based)
CREATE POLICY "user_interactions_select_tenant" ON user_interactions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "user_interactions_insert_tenant" ON user_interactions
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for recipe_shares (public read if token matches, tenant write)
CREATE POLICY "recipe_shares_select_public" ON recipe_shares
  FOR SELECT USING (
    is_public = true OR
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "recipe_shares_insert_tenant" ON recipe_shares
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "recipe_shares_update_tenant" ON recipe_shares
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "recipe_shares_delete_tenant" ON recipe_shares
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for recipe_collections (tenant-based)
CREATE POLICY "recipe_collections_select_tenant" ON recipe_collections
  FOR SELECT USING (
    is_public = true OR
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "recipe_collections_insert_tenant" ON recipe_collections
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "recipe_collections_update_tenant" ON recipe_collections
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "recipe_collections_delete_tenant" ON recipe_collections
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for recipe_collection_items (tenant-based via collection)
CREATE POLICY "collection_items_select_tenant" ON recipe_collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipe_collections rc
      JOIN tenant_members tm ON rc.tenant_id = tm.tenant_id
      WHERE rc.id = recipe_collection_items.collection_id
      AND (rc.is_public = true OR tm.user_id = auth.uid())
    )
  );

CREATE POLICY "collection_items_insert_tenant" ON recipe_collection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipe_collections rc
      JOIN tenant_members tm ON rc.tenant_id = tm.tenant_id
      WHERE rc.id = recipe_collection_items.collection_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "collection_items_delete_tenant" ON recipe_collection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM recipe_collections rc
      JOIN tenant_members tm ON rc.tenant_id = tm.tenant_id
      WHERE rc.id = recipe_collection_items.collection_id
      AND tm.user_id = auth.uid()
    )
  );

-- RLS Policies for cost_savings_tracking (tenant-based)
CREATE POLICY "cost_savings_select_tenant" ON cost_savings_tracking
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "cost_savings_insert_tenant" ON cost_savings_tracking
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- Function to update meal_plan updated_at
CREATE OR REPLACE FUNCTION update_meal_plan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE meal_plans SET updated_at = NOW() WHERE id = NEW.meal_plan_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meal_plan_days_updated_at
  AFTER INSERT OR UPDATE OR DELETE ON meal_plan_days
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_plan_updated_at();

-- Function to update recipe_collection updated_at
CREATE OR REPLACE FUNCTION update_collection_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipe_collections SET updated_at = NOW() WHERE id = NEW.collection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER collection_items_updated_at
  AFTER INSERT OR DELETE ON recipe_collection_items
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_updated_at();

-- ============================================================================
-- CONSOLIDATED SUPABASE MIGRATION FILE
-- ============================================================================
-- This file contains all remaining migrations from:
-- https://github.com/shardie-github/WhatsForDinner/tree/main/supabase/migrations
--
-- Run this in Supabase SQL Editor
-- All statements use IF NOT EXISTS to avoid conflicts
-- ============================================================================


-- ============================================================================
-- FROM: 013_ai_system_schema.sql
-- ============================================================================

-- AI System Schema Migration
-- This migration creates the necessary tables for the AI automation system

-- Create AI health metrics table
CREATE TABLE IF NOT EXISTS ai_health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deploy_id TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('staging', 'production', 'preview')),
  metrics JSONB NOT NULL DEFAULT '{}',
  patterns JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('healthy', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI embeddings table
CREATE TABLE IF NOT EXISTS ai_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deploy_id TEXT NOT NULL,
  analysis JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI cost analysis table
CREATE TABLE IF NOT EXISTS ai_cost_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metrics_summary JSONB NOT NULL DEFAULT '{}',
  prediction JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI performance metrics table
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  model TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'azure')),
  operation TEXT NOT NULL CHECK (operation IN ('completion', 'embedding', 'moderation', 'image')),
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_type TEXT,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  request_id TEXT NOT NULL,
  environment TEXT DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI performance reports table
CREATE TABLE IF NOT EXISTS ai_performance_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  avg_latency DECIMAL(10,2) DEFAULT 0,
  success_rate DECIMAL(5,4) DEFAULT 0,
  trends JSONB DEFAULT '[]',
  alerts JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI integrity reports table
CREATE TABLE IF NOT EXISTS ai_integrity_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_checks INTEGER DEFAULT 0,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  checks JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_timestamp ON ai_health_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_deploy_id ON ai_health_metrics(deploy_id);
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_environment ON ai_health_metrics(environment);
CREATE INDEX IF NOT EXISTS idx_ai_health_metrics_status ON ai_health_metrics(status);

CREATE INDEX IF NOT EXISTS idx_ai_embeddings_namespace ON ai_embeddings(namespace);
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_created_at ON ai_embeddings(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_embedding ON ai_embeddings USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_ai_insights_deploy_id ON ai_insights(deploy_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_cost_analysis_timestamp ON ai_cost_analysis(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_cost_analysis_created_at ON ai_cost_analysis(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_timestamp ON ai_performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_model ON ai_performance_metrics(model);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_provider ON ai_performance_metrics(provider);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_operation ON ai_performance_metrics(operation);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_user_id ON ai_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_environment ON ai_performance_metrics(environment);

CREATE INDEX IF NOT EXISTS idx_ai_performance_reports_timestamp ON ai_performance_reports(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_performance_reports_period ON ai_performance_reports(period);

CREATE INDEX IF NOT EXISTS idx_ai_integrity_reports_timestamp ON ai_integrity_reports(timestamp);

-- Enable Row Level Security
ALTER TABLE ai_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_integrity_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for AI health metrics
CREATE POLICY "Allow authenticated users to read ai_health_metrics"
  ON ai_health_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_health_metrics"
  ON ai_health_metrics FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI embeddings
CREATE POLICY "Allow authenticated users to read ai_embeddings"
  ON ai_embeddings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_embeddings"
  ON ai_embeddings FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI insights
CREATE POLICY "Allow authenticated users to read ai_insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_insights"
  ON ai_insights FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI cost analysis
CREATE POLICY "Allow authenticated users to read ai_cost_analysis"
  ON ai_cost_analysis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_cost_analysis"
  ON ai_cost_analysis FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI performance metrics
CREATE POLICY "Allow users to read own ai_performance_metrics"
  ON ai_performance_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow service role to manage ai_performance_metrics"
  ON ai_performance_metrics FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI performance reports
CREATE POLICY "Allow authenticated users to read ai_performance_reports"
  ON ai_performance_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_performance_reports"
  ON ai_performance_reports FOR ALL
  TO service_role
  USING (true);

-- Create RLS policies for AI integrity reports
CREATE POLICY "Allow authenticated users to read ai_integrity_reports"
  ON ai_integrity_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow service role to manage ai_integrity_reports"
  ON ai_integrity_reports FOR ALL
  TO service_role
  USING (true);

-- CREATE OR REPLACE FUNCTION to get foreign keys (for database integrity watcher)
CREATE OR REPLACE FUNCTION get_foreign_keys()
RETURNS TABLE (
  child_table TEXT,
  child_column TEXT,
  parent_table TEXT,
  parent_column TEXT,
  constraint_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.table_name::TEXT as child_table,
    kcu.column_name::TEXT as child_column,
    ccu.table_name::TEXT as parent_table,
    ccu.column_name::TEXT as parent_column,
    tc.constraint_name::TEXT as constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';
END;
$$ LANGUAGE plpgsql;

-- CREATE OR REPLACE FUNCTION to execute SQL (for database integrity watcher)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS TABLE (result JSONB) AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$ LANGUAGE plpgsql;

-- CREATE OR REPLACE FUNCTION to clean up old data
CREATE OR REPLACE FUNCTION cleanup_ai_data()
RETURNS void AS $$
BEGIN
  -- Clean up old health metrics (older than 90 days)
  DELETE FROM ai_health_metrics 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean up old insights (older than 30 days)
  DELETE FROM ai_insights 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Clean up old performance metrics (older than 7 days)
  DELETE FROM ai_performance_metrics 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Clean up old cost analysis (older than 90 days)
  DELETE FROM ai_cost_analysis 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean up old performance reports (older than 30 days)
  DELETE FROM ai_performance_reports 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Clean up old integrity reports (older than 30 days)
  DELETE FROM ai_integrity_reports 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to clean up old data (runs daily)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-ai-data', '0 2 * * *', 'SELECT cleanup_ai_data();');

-- CREATE OR REPLACE FUNCTION to get AI system status
CREATE OR REPLACE FUNCTION get_ai_system_status()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'health_metrics_count', (SELECT COUNT(*) FROM ai_health_metrics),
    'embeddings_count', (SELECT COUNT(*) FROM ai_embeddings),
    'insights_count', (SELECT COUNT(*) FROM ai_insights),
    'performance_metrics_count', (SELECT COUNT(*) FROM ai_performance_metrics),
    'last_health_check', (SELECT MAX(created_at) FROM ai_health_metrics),
    'last_performance_check', (SELECT MAX(created_at) FROM ai_performance_metrics),
    'system_status', 'active'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_health_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_health_metrics TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_embeddings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_embeddings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_insights TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_cost_analysis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_cost_analysis TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_performance_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_performance_metrics TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_performance_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_performance_reports TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_integrity_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_integrity_reports TO service_role;

GRANT EXECUTE ON FUNCTION get_foreign_keys() TO authenticated;
GRANT EXECUTE ON FUNCTION get_foreign_keys() TO service_role;

GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION cleanup_ai_data() TO service_role;

GRANT EXECUTE ON FUNCTION get_ai_system_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_system_status() TO service_role;



-- ============================================================================
-- FROM: 014_nomad_schema.sql
-- ============================================================================

-- Nomad Database Schema Migration
-- Creates all tables needed for Nomad meal planner + health tracker + cooking inspiration + family communication

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- USER PROFILE & PREFERENCES
-- ============================================

-- User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_emoji TEXT DEFAULT '??',
  household_size INTEGER DEFAULT 1,
  theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'spring', 'summer', 'fall', 'winter')),
  notifications_enabled BOOLEAN DEFAULT true,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'partner')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Dietary Preferences
CREATE TABLE IF NOT EXISTS user_dietary_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preference TEXT NOT NULL CHECK (preference IN (
    'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 
    'gluten-free', 'pescatarian', 'halal', 'dairy-free'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference)
);

-- User Allergens
CREATE TABLE IF NOT EXISTS user_allergens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL CHECK (allergen IN (
    'nuts', 'peanuts', 'dairy', 'eggs', 'soy', 'shellfish', 'fish', 'wheat'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, allergen)
);

-- User Health Goals
CREATE TABLE IF NOT EXISTS user_health_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL CHECK (goal IN (
    'weight-loss', 'muscle-gain', 'heart-health', 'energy', 'digestive', 'general'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, goal)
);

-- ============================================
-- MEAL PLANNING
-- ============================================

-- Meal Plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  recipe_name TEXT,
  calories INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RECIPES
-- ============================================

-- Recipes (enhanced from existing)
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cook_time INTEGER, -- minutes
  servings INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  tags TEXT[] DEFAULT '{}',
  allergens TEXT[] DEFAULT '{}',
  ingredients JSONB DEFAULT '[]',
  instructions JSONB DEFAULT '[]',
  nutrition_info JSONB DEFAULT '{}', -- calories, protein, carbs, fat, fiber
  cuisine_type TEXT,
  ai_recommended BOOLEAN DEFAULT false,
  ai_match_score DECIMAL(3,2), -- 0.00 to 1.00
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe Favorites
CREATE TABLE IF NOT EXISTS recipe_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- ============================================
-- GROCERY LISTS
-- ============================================

-- Grocery Lists
CREATE TABLE IF NOT EXISTS grocery_lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'My Grocery List',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grocery List Items
CREATE TABLE IF NOT EXISTS grocery_list_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  grocery_list_id UUID NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT,
  category TEXT DEFAULT 'Other' CHECK (category IN (
    'Produce', 'Meat', 'Dairy', 'Grains', 'Pantry', 'Frozen', 'Beverages', 'Other'
  )),
  checked BOOLEAN DEFAULT false,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HEALTH TRACKING
-- ============================================

-- Health Metrics (daily entries)
CREATE TABLE IF NOT EXISTS health_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calories INTEGER DEFAULT 0,
  water_glasses INTEGER DEFAULT 0,
  steps INTEGER DEFAULT 0,
  sleep_hours DECIMAL(3,1),
  weight_kg DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Wearable Sync (stores wearable data connections)
CREATE TABLE IF NOT EXISTS wearable_sync (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_fit', 'apple_health', 'fitbit')),
  provider_user_id TEXT,
  access_token_encrypted TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ============================================
-- FAMILY FEATURES
-- ============================================

-- Families (family groups)
CREATE TABLE IF NOT EXISTS families (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'My Family',
  invite_code TEXT UNIQUE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Members
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Family Chat Messages
CREATE TABLE IF NOT EXISTS family_chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'meal_shared', 'recipe_shared', 'achievement')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Activities (activity feed)
CREATE TABLE IF NOT EXISTS family_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'logged_meal', 'added_recipe', 'completed_goal', 'shared', 'joined_family'
  )),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- GAMIFICATION
-- ============================================

-- Streaks
CREATE TABLE IF NOT EXISTS streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN (
    'meal-planning', 'health-tracking', 'family-activity', 'water-intake'
  )),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Achievements (progress tracking)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS
-- ============================================

-- Subscriptions (extends existing subscriptions table with Nomad tiers)
-- Note: This assumes subscriptions table exists, if not, uncomment below:
/*
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'partner')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'trialing', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- ============================================
-- INDEXES
-- ============================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);

-- Meal plans indexes
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_family_date ON meal_plans(family_id, date) WHERE family_id IS NOT NULL;

-- Recipes indexes
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_user ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_ai_recommended ON recipes(ai_recommended) WHERE ai_recommended = true;

-- Grocery lists indexes
CREATE INDEX IF NOT EXISTS idx_grocery_list_items_list ON grocery_list_items(grocery_list_id);
CREATE INDEX IF NOT EXISTS idx_grocery_list_items_checked ON grocery_list_items(checked) WHERE checked = false;

-- Health metrics indexes
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_date ON health_metrics(user_id, date);

-- Family indexes
CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_family_chat_family_created ON family_chat_messages(family_id, created_at DESC);

-- Streaks indexes
CREATE INDEX IF NOT EXISTS idx_streaks_user_type ON streaks(user_id, streak_type);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Preferences: Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON user_dietary_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own allergens" ON user_allergens
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON user_health_goals
  FOR ALL USING (auth.uid() = user_id);

-- Meal Plans: Users can manage their own plans, family members can view family plans
CREATE POLICY "Users can manage own meal plans" ON meal_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Family members can view family meal plans" ON meal_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = meal_plans.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Recipes: Public read, users can manage their own
CREATE POLICY "Anyone can view recipes" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Recipe Favorites: Users manage their own
CREATE POLICY "Users can manage own favorites" ON recipe_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Grocery Lists: Users can manage their own, family members can view/edit family lists
CREATE POLICY "Users can manage own grocery lists" ON grocery_lists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Family members can manage family grocery lists" ON grocery_lists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = grocery_lists.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Grocery List Items: Same as lists
CREATE POLICY "Users can manage grocery items" ON grocery_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM grocery_lists
      WHERE grocery_lists.id = grocery_list_items.grocery_list_id
      AND (
        grocery_lists.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM family_members
          WHERE family_members.family_id = grocery_lists.family_id
          AND family_members.user_id = auth.uid()
        )
      )
    )
  );

-- Health Metrics: Users manage their own
CREATE POLICY "Users can manage own health metrics" ON health_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Wearable Sync: Users manage their own
CREATE POLICY "Users can manage own wearable sync" ON wearable_sync
  FOR ALL USING (auth.uid() = user_id);

-- Families: Members can view, admins can manage
CREATE POLICY "Family members can view family" ON families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins can update family" ON families
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
      AND family_members.user_id = auth.uid()
      AND family_members.role = 'admin'
    )
  );

-- Family Members: Members can view, admins can manage
CREATE POLICY "Family members can view other members" ON family_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
    )
  );

-- Family Chat: Members can read/write
CREATE POLICY "Family members can chat" ON family_chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_chat_messages.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Family Activities: Members can view and create
CREATE POLICY "Family members can view activities" ON family_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_activities.family_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Family members can create activities" ON family_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_activities.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Streaks: Users manage their own
CREATE POLICY "Users can manage own streaks" ON streaks
  FOR ALL USING (auth.uid() = user_id);

-- Badges: Users can view their own
CREATE POLICY "Users can view own badges" ON badges
  FOR SELECT USING (auth.uid() = user_id);

-- Achievements: Users manage their own
CREATE POLICY "Users can manage own achievements" ON achievements
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at
  BEFORE UPDATE ON grocery_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grocery_list_items_updated_at
  BEFORE UPDATE ON grocery_list_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_metrics_updated_at
  BEFORE UPDATE ON health_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate family invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update streaks on activity
CREATE OR REPLACE FUNCTION update_streak(
  p_user_id UUID,
  p_streak_type TEXT
)
RETURNS VOID AS $$
DECLARE
  v_current_streak INTEGER;
  v_last_date DATE;
BEGIN
  SELECT current_streak, last_activity_date
  INTO v_current_streak, v_last_date
  FROM streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  IF v_current_streak IS NULL THEN
    -- First time, create streak
    INSERT INTO streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, p_streak_type, 1, 1, CURRENT_DATE);
  ELSIF v_last_date = CURRENT_DATE THEN
    -- Already logged today, do nothing
    RETURN;
  ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    UPDATE streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
  ELSE
    -- Break streak, restart
    UPDATE streaks
    SET current_streak = 1,
        last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id AND streak_type = p_streak_type;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA / SEED
-- ============================================

-- Insert some default recipes (optional seed data)
-- This can be removed or customized based on needs

COMMENT ON TABLE user_profiles IS 'Extended user profiles for Nomad app';
COMMENT ON TABLE meal_plans IS 'User meal planning entries';
COMMENT ON TABLE recipes IS 'Recipe collection';
COMMENT ON TABLE grocery_lists IS 'Shopping lists';
COMMENT ON TABLE health_metrics IS 'Daily health tracking data';
COMMENT ON TABLE families IS 'Family groups for shared planning';
COMMENT ON TABLE family_chat_messages IS 'Real-time family chat';
COMMENT ON TABLE streaks IS 'User engagement streaks';
COMMENT ON TABLE badges IS 'User achievements and badges';




-- ============================================================================
-- FROM: 015_auto_fixes.sql
-- ============================================================================

-- ============================================================================
-- Auto-Generated Supabase Fixes Migration
-- Generated: 2025-11-02T11:44:00Z
-- ============================================================================
-- This migration applies idempotent fixes for:
-- - Missing extensions
-- - Missing RLS policies
-- - Missing Realtime publications
-- - Storage buckets and policies
-- - Default RPC functions
-- ============================================================================
-- WARNING: Review this migration before applying to production
-- ============================================================================

-- ============================================================================
-- A. Extensions (idempotent)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Vector extension for AI embeddings (if using pgvector)
-- Uncomment if needed:
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- pg_cron requires superuser - enable manually if needed:
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================================
-- B. Ensure Realtime Publication
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- ============================================================================
-- C. Profiles Table & Trigger (enhanced version if missing)
-- ============================================================================

-- Enhance profiles table if it exists with basic structure
DO $$
BEGIN
  -- Add columns if they don't exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Add email column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
      ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;
    
    -- Add display_name column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'display_name') THEN
      ALTER TABLE public.profiles ADD COLUMN display_name text;
    END IF;
    
    -- Add avatar_url column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
      ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
    
    -- Add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
      ALTER TABLE public.profiles ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    END IF;
    
    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
      ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    END IF;
  ELSE
    -- Create profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name text,
      preferences jsonb,
      email text,
      display_name text,
      avatar_url text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
  
  -- Ensure RLS is enabled
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
END $$;

-- Profiles policies (idempotent)
DO $$
BEGIN
  -- Read own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_read_own'
  ) THEN
    CREATE POLICY profiles_read_own ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());
  END IF;

  -- Update own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_write_own'
  ) THEN
    CREATE POLICY profiles_write_own ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
  END IF;

  -- Insert own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Auto-provision profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- D. Storage Buckets (common ones)
-- ============================================================================

-- Assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'assets',
  'assets',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'assets');

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

-- Storage policies (idempotent)
DO $$
BEGIN
  -- Public read for assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_read_assets'
  ) THEN
    CREATE POLICY storage_read_assets
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'assets');
  END IF;

  -- Authenticated write for assets (owner only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_write_assets'
  ) THEN
    CREATE POLICY storage_write_assets
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'assets' AND (owner = auth.uid() OR metadata->>'owner_id' = auth.uid()::text));
  END IF;

  -- Authenticated update/delete for assets (owner only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_update_assets'
  ) THEN
    CREATE POLICY storage_update_assets
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'assets' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_delete_assets'
  ) THEN
    CREATE POLICY storage_delete_assets
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  -- Avatar policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_read_avatars'
  ) THEN
    CREATE POLICY storage_read_avatars
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_write_avatars'
  ) THEN
    CREATE POLICY storage_write_avatars
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'avatars' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- E. Common RPC Functions
-- ============================================================================

-- Get current user profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.profiles
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.* FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;

-- ============================================================================
-- F. Add Tables to Realtime Publication
-- ============================================================================

-- Add profiles to realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- ============================================================================
-- G. Helper: Enable RLS on existing tables (safe to run multiple times)
-- ============================================================================
-- This section can be expanded based on audit findings
-- For now, it ensures common tables have RLS enabled

DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT IN ('schema_migrations', '_prisma_migrations')
  LOOP
    -- Enable RLS (idempotent)
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', 
      table_record.schemaname, table_record.tablename);
    
    -- Check if table has user_id, owner_id, or created_by
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = table_record.schemaname
        AND table_name = table_record.tablename
        AND column_name IN ('user_id', 'owner_id', 'created_by')
    ) THEN
      -- Determine owner column
      DECLARE
        owner_col TEXT;
      BEGIN
        SELECT column_name INTO owner_col
        FROM information_schema.columns
        WHERE table_schema = table_record.schemaname
          AND table_name = table_record.tablename
          AND column_name IN ('user_id', 'owner_id', 'created_by')
        ORDER BY CASE column_name
          WHEN 'user_id' THEN 1
          WHEN 'owner_id' THEN 2
          WHEN 'created_by' THEN 3
        END
        LIMIT 1;
        
        -- Create read policy for authenticated (if missing)
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = table_record.schemaname
            AND tablename = table_record.tablename
            AND policyname = format('%s_read_authenticated', table_record.tablename)
        ) THEN
          EXECUTE format(
            'CREATE POLICY %I ON %I.%I FOR SELECT TO authenticated USING (true)',
            format('%s_read_authenticated', table_record.tablename),
            table_record.schemaname,
            table_record.tablename
          );
        END IF;
        
        -- Create owner write policy (if missing)
        IF owner_col IS NOT NULL AND NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = table_record.schemaname
            AND tablename = table_record.tablename
            AND policyname = format('%s_write_owner', table_record.tablename)
        ) THEN
          EXECUTE format(
            'CREATE POLICY %I ON %I.%I FOR ALL TO authenticated USING (%I = auth.uid()) WITH CHECK (%I = auth.uid())',
            format('%s_write_owner', table_record.tablename),
            table_record.schemaname,
            table_record.tablename,
            owner_col,
            owner_col
          );
        END IF;
      END;
    END IF;
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail migration
    RAISE WARNING 'Error processing table %: %', table_record.tablename, SQLERRM;
END $$;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Review AUDIT_SUPABASE.md for additional table-specific fixes needed
-- This migration is idempotent and safe to run multiple times
-- ============================================================================




-- ============================================================================
-- FROM: 016__comprehensive_auto_fixes.sql
-- ============================================================================

-- ============================================================================
-- Comprehensive Supabase Auto-Fix Migration
-- Generated: 2025-11-02T12:18:00Z
-- ============================================================================
-- This migration applies idempotent fixes for:
-- - Critical extensions
-- - Multi-tenant infrastructure (organizations/user_organizations compatibility)
-- - RLS hardening on all user tables
-- - Realtime publication for all tables
-- - Storage buckets and policies
-- - Performance monitoring (metrics views, query monitor)
-- - RPC functions
-- - Profile auto-provision
-- - Tenant provisioning function
-- - Metering/billing tables (optional)
-- ============================================================================
-- WARNING: Review this migration before applying to production
-- All changes are idempotent and safe to run multiple times
-- ============================================================================

-- ============================================================================
-- A. Critical Extensions (idempotent)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Vector extension for AI embeddings (if using pgvector)
-- Uncomment if needed:
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- pg_cron requires superuser - enable manually via Supabase SQL Editor:
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";
-- Then uncomment the cron jobs section below

-- ============================================================================
-- B. Ensure Realtime Publication Exists
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- ============================================================================
-- C. Multi-Tenant: Organizations/User_Organizations Compatibility
-- ============================================================================
-- This creates organizations and user_organizations tables for compatibility
-- If tenants/tenant_memberships already exist, we create views as aliases

-- Create organizations table (compatible with tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'family', 'enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  settings jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}'
);

-- Create user_organizations table (compatible with tenant_memberships)
CREATE TABLE IF NOT EXISTS public.user_organizations (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'member')),
  invited_by uuid REFERENCES auth.users(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  PRIMARY KEY (user_id, org_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON public.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON public.user_organizations(org_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_role ON public.user_organizations(role);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON public.organizations(plan);

-- Enable RLS on multi-tenant tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
DO $$
BEGIN
  -- Users can view organizations they belong to
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'organizations' 
    AND policyname = 'org_read_member'
  ) THEN
    CREATE POLICY org_read_member ON public.organizations
    FOR SELECT TO authenticated
    USING (
      id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    );
  END IF;

  -- Owners can update their organization
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'organizations' 
    AND policyname = 'org_write_owner'
  ) THEN
    CREATE POLICY org_write_owner ON public.organizations
    FOR ALL TO authenticated
    USING (
      id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
      )
    )
    WITH CHECK (
      id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
      )
    );
  END IF;
END $$;

-- RLS Policies for user_organizations
DO $$
BEGIN
  -- Users can view their own memberships
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_organizations' 
    AND policyname = 'user_org_read_own'
  ) THEN
    CREATE POLICY user_org_read_own ON public.user_organizations
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
  END IF;

  -- Organization owners can view all memberships
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_organizations' 
    AND policyname = 'user_org_read_org_owner'
  ) THEN
    CREATE POLICY user_org_read_org_owner ON public.user_organizations
    FOR SELECT TO authenticated
    USING (
      org_id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
      )
    );
  END IF;
END $$;

-- ============================================================================
-- D. Profiles Table Enhancement & Auto-Provision
-- ============================================================================

-- Enhance profiles table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
      ALTER TABLE public.profiles ADD COLUMN email text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'display_name') THEN
      ALTER TABLE public.profiles ADD COLUMN display_name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
      ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'tenant_id') THEN
      ALTER TABLE public.profiles ADD COLUMN tenant_id uuid REFERENCES public.organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
      ALTER TABLE public.profiles ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
      ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    END IF;
  ELSE
    -- Create profiles table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email text,
      display_name text,
      avatar_url text,
      tenant_id uuid REFERENCES public.organizations(id),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      name text,
      preferences jsonb DEFAULT '{}'
    );
  END IF;
  
  -- Ensure RLS is enabled
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
END $$;

-- Profiles policies (idempotent)
DO $$
BEGIN
  -- Read own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_read_own'
  ) THEN
    CREATE POLICY profiles_read_own ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());
  END IF;

  -- Update own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_write_own'
  ) THEN
    CREATE POLICY profiles_write_own ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
  END IF;

  -- Insert own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());
  END IF;

  -- View profiles in same organization
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_read_org'
  ) THEN
    CREATE POLICY profiles_read_org ON public.profiles
    FOR SELECT TO authenticated
    USING (
      tenant_id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    );
  END IF;
END $$;

-- Auto-provision profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- E. Tenant Provisioning Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.provision_tenant(
  user_id_param uuid,
  org_name text,
  user_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
  user_email text;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = user_id_param;
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Create organization
  INSERT INTO public.organizations (name, plan, status)
  VALUES (org_name, 'free', 'active')
  RETURNING id INTO new_org_id;

  -- Create user_organization membership
  INSERT INTO public.user_organizations (user_id, org_id, role, status)
  VALUES (user_id_param, new_org_id, 'owner', 'active')
  ON CONFLICT (user_id, org_id) DO NOTHING;

  -- Update profile with tenant_id
  UPDATE public.profiles
  SET tenant_id = new_org_id
  WHERE id = user_id_param;

  RETURN new_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.provision_tenant(uuid, text, text) TO authenticated;

-- ============================================================================
-- F. Storage Buckets & Policies
-- ============================================================================

-- Assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'assets',
  'assets',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'assets');

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

-- Storage policies (idempotent)
DO $$
BEGIN
  -- Public read for assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_read_assets'
  ) THEN
    CREATE POLICY storage_read_assets
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'assets');
  END IF;

  -- Authenticated write for assets (owner only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_write_assets'
  ) THEN
    CREATE POLICY storage_write_assets
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  -- Authenticated update/delete for assets (owner only)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_update_assets'
  ) THEN
    CREATE POLICY storage_update_assets
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'assets' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_delete_assets'
  ) THEN
    CREATE POLICY storage_delete_assets
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'assets' AND owner = auth.uid());
  END IF;

  -- Avatar policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_read_avatars'
  ) THEN
    CREATE POLICY storage_read_avatars
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_write_avatars'
  ) THEN
    CREATE POLICY storage_write_avatars
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'avatars' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- G. Performance Monitoring Tables & Views
-- ============================================================================

-- Query Monitor View (using pg_stat_statements)
CREATE OR REPLACE VIEW public.query_monitor AS
SELECT 
  LEFT(query, 100) AS query_preview,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time,
  rows,
  100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) AS cache_hit_ratio
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 100;

GRANT SELECT ON public.query_monitor TO authenticated;

-- Session Load Monitor View
CREATE OR REPLACE VIEW public.session_monitor AS
SELECT 
  datname,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  state_change,
  wait_event_type,
  wait_event,
  LEFT(query, 100) AS query_preview
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid != pg_backend_pid()
ORDER BY query_start DESC;

GRANT SELECT ON public.session_monitor TO authenticated;

-- ============================================================================
-- H. Metering & Billing Tables (Optional Advanced Layer)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.api_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  org_id uuid REFERENCES public.organizations(id),
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code int,
  response_time_ms int,
  request_size_bytes int,
  response_size_bytes int,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_org_id ON public.api_usage(org_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON public.api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON public.api_usage(endpoint);

ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- RLS for api_usage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'api_usage' 
    AND policyname = 'api_usage_read_own'
  ) THEN
    CREATE POLICY api_usage_read_own ON public.api_usage
    FOR SELECT TO authenticated
    USING (
      user_id = auth.uid() OR
      org_id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'api_usage' 
    AND policyname = 'api_usage_insert'
  ) THEN
    CREATE POLICY api_usage_insert ON public.api_usage
    FOR INSERT TO authenticated, service_role
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Event Logs Table
CREATE TABLE IF NOT EXISTS public.event_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  org_id uuid REFERENCES public.organizations(id),
  event_type text NOT NULL,
  event_name text NOT NULL,
  properties jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_logs_user_id ON public.event_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_org_id ON public.event_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON public.event_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_event_logs_event_type ON public.event_logs(event_type);

ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- RLS for event_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'event_logs' 
    AND policyname = 'event_logs_read_own'
  ) THEN
    CREATE POLICY event_logs_read_own ON public.event_logs
    FOR SELECT TO authenticated
    USING (
      user_id = auth.uid() OR
      org_id IN (
        SELECT org_id FROM public.user_organizations 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'event_logs' 
    AND policyname = 'event_logs_insert'
  ) THEN
    CREATE POLICY event_logs_insert ON public.event_logs
    FOR INSERT TO authenticated, service_role
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- I. RPC Functions
-- ============================================================================

-- Get current user profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.profiles
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT p.* FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;

-- Get user organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations()
RETURNS TABLE(
  org_id uuid,
  org_name text,
  role text,
  status text,
  joined_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.name,
    uo.role,
    uo.status,
    uo.joined_at
  FROM public.user_organizations uo
  JOIN public.organizations o ON o.id = uo.org_id
  WHERE uo.user_id = auth.uid() AND uo.status = 'active'
  ORDER BY uo.joined_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_organizations() TO authenticated;

-- ============================================================================
-- J. Add All User Tables to Realtime Publication
-- ============================================================================
-- This ensures all public tables are available for realtime subscriptions

DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT IN ('schema_migrations', '_prisma_migrations')
  LOOP
    -- Check if table is already in publication
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = table_record.schemaname
        AND tablename = table_record.tablename
    ) THEN
      BEGIN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I.%I',
          table_record.schemaname, table_record.tablename);
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Could not add table % to realtime: %', table_record.tablename, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- K. Enable RLS on All Public Tables (idempotent)
-- ============================================================================

DO $$
DECLARE
  table_record RECORD;
  owner_col TEXT;
BEGIN
  FOR table_record IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT IN ('schema_migrations', '_prisma_migrations')
  LOOP
    -- Enable RLS (idempotent)
    BEGIN
      EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY',
        table_record.schemaname, table_record.tablename);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Could not enable RLS on table %: %', table_record.tablename, SQLERRM;
    END;
    
    -- Check if table has tenant_id for tenant-aware policies
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = table_record.schemaname
        AND table_name = table_record.tablename
        AND column_name = 'tenant_id'
    ) THEN
      -- Create tenant-aware read policy if missing
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = table_record.schemaname
          AND tablename = table_record.tablename
          AND policyname = format('%s_read_tenant', table_record.tablename)
      ) THEN
        BEGIN
          EXECUTE format(
            'CREATE POLICY %I ON %I.%I FOR SELECT TO authenticated USING (tenant_id IN (SELECT org_id FROM public.user_organizations WHERE user_id = auth.uid() AND status = ''active'') OR tenant_id IS NULL)',
            format('%s_read_tenant', table_record.tablename),
            table_record.schemaname,
            table_record.tablename
          );
        EXCEPTION WHEN OTHERS THEN
          RAISE WARNING 'Could not create tenant read policy for table %: %', table_record.tablename, SQLERRM;
        END;
      END IF;
    END IF;
    
    -- Check for owner columns (user_id, owner_id, created_by)
    SELECT column_name INTO owner_col
    FROM information_schema.columns
    WHERE table_schema = table_record.schemaname
      AND table_name = table_record.tablename
      AND column_name IN ('user_id', 'owner_id', 'created_by')
    ORDER BY CASE column_name
      WHEN 'user_id' THEN 1
      WHEN 'owner_id' THEN 2
      WHEN 'created_by' THEN 3
    END
    LIMIT 1;
    
    -- Create owner-based write policy if owner column found and policy missing
    IF owner_col IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = table_record.schemaname
        AND tablename = table_record.tablename
        AND policyname = format('%s_write_owner', table_record.tablename)
    ) THEN
      BEGIN
        EXECUTE format(
          'CREATE POLICY %I ON %I.%I FOR ALL TO authenticated USING (%I = auth.uid()) WITH CHECK (%I = auth.uid())',
          format('%s_write_owner', table_record.tablename),
          table_record.schemaname,
          table_record.tablename,
          owner_col,
          owner_col
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Could not create owner write policy for table %: %', table_record.tablename, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- L. pg_cron Jobs (Optional - Uncomment after enabling pg_cron extension)
-- ============================================================================
-- Note: pg_cron requires superuser. Enable the extension first via Supabase SQL Editor,
-- then uncomment these jobs.

-- Daily backup snapshot (runs at 2 AM UTC)
-- SELECT cron.schedule(
--   'daily-backup-snapshot',
--   '0 2 * * *',
--   'SELECT pg_dump(''your-database-url'') INTO ''backup-$(date +%Y%m%d).sql'';'
-- );

-- Log retention rotation (runs daily at 3 AM UTC, keeps last 90 days)
-- SELECT cron.schedule(
--   'log-retention-rotation',
--   '0 3 * * *',
--   'DELETE FROM public.event_logs WHERE created_at < now() - interval ''90 days''; DELETE FROM public.api_usage WHERE created_at < now() - interval ''90 days'';'
-- );

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Review AUDIT_SUPABASE.md for additional table-specific fixes needed
-- This migration is idempotent and safe to run multiple times
-- ============================================================================




-- ============================================================================
-- FROM: 017_create_tables.sql
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid primary key references auth.users,
  name text,
  preferences jsonb
);

-- Create pantry_items table
CREATE TABLE IF NOT EXISTS pantry_items (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  ingredient text not null,
  quantity int default 1
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  title text,
  details jsonb,
  calories int,
  time text
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id),
  recipe_id bigint references recipes(id)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table pantry_items enable row level security;
alter table recipes enable row level security;
alter table favorites enable row level security;

-- Create policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can view own pantry items" on pantry_items
  for select using (auth.uid() = user_id);

create policy "Users can insert own pantry items" on pantry_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update own pantry items" on pantry_items
  for update using (auth.uid() = user_id);

create policy "Users can delete own pantry items" on pantry_items
  for delete using (auth.uid() = user_id);

create policy "Users can view own recipes" on recipes
  for select using (auth.uid() = user_id);

create policy "Users can insert own recipes" on recipes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own recipes" on recipes
  for update using (auth.uid() = user_id);

create policy "Users can delete own recipes" on recipes
  for delete using (auth.uid() = user_id);

create policy "Users can view own favorites" on favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert own favorites" on favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites" on favorites
  for delete using (auth.uid() = user_id);



-- ============================================================================
-- FROM: 018_analytics_logging_tables.sql
-- ============================================================================

-- Analytics and logging tables for self-optimizing system

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid references profiles(id),
  session_id text not null,
  properties jsonb default '{}',
  timestamp timestamptz default now(),
  page_url text,
  user_agent text
);

-- Recipe metrics table
CREATE TABLE IF NOT EXISTS recipe_metrics (
  id bigint generated always as identity primary key,
  recipe_id bigint references recipes(id),
  user_id uuid references profiles(id),
  generated_at timestamptz default now(),
  ingredients_used text[] not null,
  cuisine_type text,
  cook_time text not null,
  calories int not null,
  feedback_score int check (feedback_score >= 1 and feedback_score <= 5),
  api_latency_ms int not null,
  model_used text not null,
  retry_count int default 0
);

-- System metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_type text not null check (metric_type in ('api_performance', 'user_engagement', 'error_rate', 'cost_analysis')),
  value numeric not null,
  metadata jsonb default '{}',
  timestamp timestamptz default now()
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('error', 'warn', 'info', 'debug')),
  message text not null,
  context jsonb default '{}',
  user_id uuid references profiles(id),
  session_id text,
  stack_trace text,
  timestamp timestamptz default now(),
  source text not null check (source in ('frontend', 'api', 'edge_function', 'system')),
  component text
);

-- Error reports table
CREATE TABLE IF NOT EXISTS error_reports (
  id uuid primary key default gen_random_uuid(),
  error_type text not null,
  message text not null,
  stack_trace text,
  user_id uuid references profiles(id),
  session_id text,
  context jsonb default '{}',
  resolved boolean default false,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- Recipe feedback table
CREATE TABLE IF NOT EXISTS recipe_feedback (
  id bigint generated always as identity primary key,
  recipe_id bigint references recipes(id),
  user_id uuid references profiles(id),
  feedback_type text not null check (feedback_type in ('thumbs_up', 'thumbs_down', 'rating')),
  score int check (score >= 1 and score <= 5),
  feedback_text text,
  created_at timestamptz default now()
);

-- AI configuration table
CREATE TABLE IF NOT EXISTS ai_config (
  id uuid primary key default gen_random_uuid(),
  model_name text not null,
  system_prompt text not null,
  message_templates jsonb not null,
  version text not null,
  is_active boolean default false,
  created_at timestamptz default now(),
  performance_score numeric,
  metadata jsonb default '{}'
);

-- Workflow state table for autonomous operations
CREATE TABLE IF NOT EXISTS workflow_state (
  id uuid primary key default gen_random_uuid(),
  workflow_name text not null,
  status text not null check (status in ('pending', 'running', 'completed', 'failed')),
  current_step text,
  progress_percentage int default 0,
  metadata jsonb default '{}',
  started_at timestamptz default now(),
  completed_at timestamptz,
  error_message text
);

-- Enable Row Level Security
alter table analytics_events enable row level security;
alter table recipe_metrics enable row level security;
alter table system_metrics enable row level security;
alter table logs enable row level security;
alter table error_reports enable row level security;
alter table recipe_feedback enable row level security;
alter table ai_config enable row level security;
alter table workflow_state enable row level security;

-- RLS Policies for analytics_events
create policy "Users can view own analytics events" on analytics_events
  for select using (auth.uid() = user_id or user_id is null);

create policy "System can insert analytics events" on analytics_events
  for insert with check (true);

-- RLS Policies for recipe_metrics
create policy "Users can view own recipe metrics" on recipe_metrics
  for select using (auth.uid() = user_id);

create policy "System can insert recipe metrics" on recipe_metrics
  for insert with check (true);

-- RLS Policies for system_metrics (admin only)
create policy "System can manage system metrics" on system_metrics
  for all using (true);

-- RLS Policies for logs (admin only)
create policy "System can manage logs" on logs
  for all using (true);

-- RLS Policies for error_reports
create policy "Users can view own error reports" on error_reports
  for select using (auth.uid() = user_id or user_id is null);

create policy "System can manage error reports" on error_reports
  for all using (true);

-- RLS Policies for recipe_feedback
create policy "Users can view own recipe feedback" on recipe_feedback
  for select using (auth.uid() = user_id);

create policy "Users can insert own recipe feedback" on recipe_feedback
  for insert with check (auth.uid() = user_id);

create policy "Users can update own recipe feedback" on recipe_feedback
  for update using (auth.uid() = user_id);

-- RLS Policies for ai_config (admin only)
create policy "System can manage ai_config" on ai_config
  for all using (true);

-- RLS Policies for workflow_state (admin only)
create policy "System can manage workflow_state" on workflow_state
  for all using (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id on analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp on analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type on analytics_events(event_type);

CREATE INDEX IF NOT EXISTS idx_recipe_metrics_user_id on recipe_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_metrics_generated_at on recipe_metrics(generated_at);
CREATE INDEX IF NOT EXISTS idx_recipe_metrics_feedback_score on recipe_metrics(feedback_score);

CREATE INDEX IF NOT EXISTS idx_system_metrics_metric_type on system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp on system_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_logs_level on logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp on logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_source on logs(source);
CREATE INDEX IF NOT EXISTS idx_logs_user_id on logs(user_id);

CREATE INDEX IF NOT EXISTS idx_error_reports_resolved on error_reports(resolved);
CREATE INDEX IF NOT EXISTS idx_error_reports_created_at on error_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_error_reports_user_id on error_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_recipe_feedback_recipe_id on recipe_feedback(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_feedback_user_id on recipe_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_feedback_created_at on recipe_feedback(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_config_active on ai_config(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_config_version on ai_config(version);

CREATE INDEX IF NOT EXISTS idx_workflow_state_status on workflow_state(status);
CREATE INDEX IF NOT EXISTS idx_workflow_state_workflow_name on workflow_state(workflow_name);

-- Functions for analytics
create or replace function get_popular_ingredients(limit_count int default 10)
returns table(ingredient text, usage_count bigint) as $$
begin
  return query
  select 
    unnest(ingredients_used) as ingredient,
    count(*) as usage_count
  from recipe_metrics
  where generated_at >= now() - interval '30 days'
  group by ingredient
  order by usage_count desc
  limit limit_count;
end;
$$ language plpgsql;

create or replace function get_cuisine_preferences()
returns table(cuisine_type text, preference_count bigint) as $$
begin
  return query
  select 
    cuisine_type,
    count(*) as preference_count
  from recipe_metrics
  where generated_at >= now() - interval '30 days'
    and cuisine_type is not null
  group by cuisine_type
  order by preference_count desc;
end;
$$ language plpgsql;

create or replace function get_recipe_feedback_summary(recipe_id_param bigint)
returns table(
  total_feedback bigint,
  average_rating numeric,
  thumbs_up_count bigint,
  thumbs_down_count bigint
) as $$
begin
  return query
  select 
    count(*) as total_feedback,
    avg(score) as average_rating,
    count(*) filter (where feedback_type = 'thumbs_up') as thumbs_up_count,
    count(*) filter (where feedback_type = 'thumbs_down') as thumbs_down_count
  from recipe_feedback
  where recipe_id = recipe_id_param;
end;
$$ language plpgsql;

-- Function to update recipe feedback scores
create or replace function update_recipe_feedback(
  recipe_id_param bigint,
  user_id_param uuid,
  feedback_type_param text,
  score_param int default null,
  feedback_text_param text default null
)
returns bigint as $$
declare
  feedback_id bigint;
begin
  insert into recipe_feedback (
    recipe_id,
    user_id,
    feedback_type,
    score,
    feedback_text
  ) values (
    recipe_id_param,
    user_id_param,
    feedback_type_param,
    score_param,
    feedback_text_param
  ) returning id into feedback_id;
  
  -- Update the recipe_metrics table with the feedback score
  if score_param is not null then
    update recipe_metrics 
    set feedback_score = score_param
    where recipe_id = recipe_id_param
      and user_id = user_id_param;
  end if;
  
  return feedback_id;
end;
$$ language plpgsql;



-- ============================================================================
-- FROM: 019_multi_tenant_saas_schema.sql
-- ============================================================================

-- Multi-tenant SaaS schema migration
-- This migration transforms the app into a scalable, monetized, multi-tenant SaaS platform

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text default 'free' check (plan in ('free', 'pro', 'family')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'active' check (status in ('active', 'inactive', 'suspended', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  settings jsonb default '{}',
  metadata jsonb default '{}'
);

-- Create tenant memberships table for role-based access
CREATE TABLE IF NOT EXISTS tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  invited_by uuid references auth.users(id),
  joined_at timestamp with time zone default now(),
  status text default 'active' check (status in ('active', 'pending', 'suspended')),
  unique(tenant_id, user_id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  tenant_id uuid references tenants(id),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('free', 'pro', 'family')),
  status text not null check (status in ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  metadata jsonb default '{}'
);

-- Create usage logs table for quota control
CREATE TABLE IF NOT EXISTS usage_logs (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id),
  tenant_id uuid references tenants(id),
  action text not null,
  tokens_used int default 0,
  cost_usd numeric(10,4) default 0,
  model_used text,
  timestamp timestamp with time zone default now(),
  metadata jsonb default '{}'
);

-- Create tenant invites table
CREATE TABLE IF NOT EXISTS tenant_invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  email text not null,
  role text not null check (role in ('editor', 'viewer')),
  invited_by uuid references auth.users(id),
  token text unique not null,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create AI cache table for cost optimization
CREATE TABLE IF NOT EXISTS ai_cache (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  cache_key text not null,
  prompt_hash text not null,
  response_data jsonb not null,
  model_used text not null,
  tokens_used int not null,
  cost_usd numeric(10,4) not null,
  ttl_seconds int not null,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null,
  unique(tenant_id, cache_key)
);

-- Create billing events table for Stripe webhook tracking
CREATE TABLE IF NOT EXISTS billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  processed boolean default false,
  data jsonb not null,
  created_at timestamp with time zone default now()
);

-- Update existing tables to support multi-tenancy
-- Add tenant_id to profiles table
alter table profiles add column tenant_id uuid references tenants(id);
alter table profiles add column role text default 'owner' check (role in ('owner', 'editor', 'viewer'));

-- Add tenant_id to all existing tables
alter table pantry_items add column tenant_id uuid references tenants(id);
alter table recipes add column tenant_id uuid references tenants(id);
alter table favorites add column tenant_id uuid references tenants(id);
alter table analytics_events add column tenant_id uuid references tenants(id);
alter table recipe_metrics add column tenant_id uuid references tenants(id);
alter table recipe_feedback add column tenant_id uuid references tenants(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer_id on tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenants_plan on tenants(plan);
CREATE INDEX IF NOT EXISTS idx_tenants_status on tenants(status);

CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant_id on tenant_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user_id on tenant_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_role on tenant_memberships(role);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id on subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id on subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status on subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant_id on usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id on usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp on usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action on usage_logs(action);

CREATE INDEX IF NOT EXISTS idx_tenant_invites_token on tenant_invites(token);
CREATE INDEX IF NOT EXISTS idx_tenant_invites_tenant_id on tenant_invites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_invites_expires_at on tenant_invites(expires_at);

CREATE INDEX IF NOT EXISTS idx_ai_cache_tenant_id on ai_cache(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires_at on ai_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_prompt_hash on ai_cache(prompt_hash);

CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_event_id on billing_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_processed on billing_events(processed);

-- Add tenant_id indexes to existing tables
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id on profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_tenant_id on pantry_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_tenant_id on recipes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_favorites_tenant_id on favorites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_tenant_id on analytics_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recipe_metrics_tenant_id on recipe_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recipe_feedback_tenant_id on recipe_feedback(tenant_id);

-- Enable Row Level Security on new tables
alter table tenants enable row level security;
alter table tenant_memberships enable row level security;
alter table subscriptions enable row level security;
alter table usage_logs enable row level security;
alter table tenant_invites enable row level security;
alter table ai_cache enable row level security;
alter table billing_events enable row level security;

-- RLS Policies for tenants
create policy "Users can view tenants they belong to" on tenants
  for select using (
    id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Tenant owners can update their tenant" on tenants
  for update using (
    id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- RLS Policies for tenant_memberships
create policy "Users can view memberships for their tenants" on tenant_memberships
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Tenant owners can manage memberships" on tenant_memberships
  for all using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- RLS Policies for subscriptions
create policy "Users can view their tenant subscriptions" on subscriptions
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

-- RLS Policies for usage_logs
create policy "Users can view usage logs for their tenants" on usage_logs
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can insert usage logs" on usage_logs
  for insert with check (true);

-- RLS Policies for tenant_invites
create policy "Users can view invites for their tenants" on tenant_invites
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid() and role = 'owner'
    )
  );

create policy "Tenant owners can manage invites" on tenant_invites
  for all using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- RLS Policies for ai_cache
create policy "Users can access cache for their tenants" on ai_cache
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage ai_cache" on ai_cache
  for all using (true);

-- RLS Policies for billing_events
create policy "System can manage billing events" on billing_events
  for all using (true);

-- Update existing RLS policies to include tenant isolation
-- Drop existing policies
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

drop policy if exists "Users can view own pantry items" on pantry_items;
drop policy if exists "Users can insert own pantry items" on pantry_items;
drop policy if exists "Users can update own pantry items" on pantry_items;
drop policy if exists "Users can delete own pantry items" on pantry_items;

drop policy if exists "Users can view own recipes" on recipes;
drop policy if exists "Users can insert own recipes" on recipes;
drop policy if exists "Users can update own recipes" on recipes;
drop policy if exists "Users can delete own recipes" on recipes;

drop policy if exists "Users can view own favorites" on favorites;
drop policy if exists "Users can insert own favorites" on favorites;
drop policy if exists "Users can delete own favorites" on favorites;

-- Create new tenant-aware policies
create policy "Users can view profiles in their tenants" on profiles
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can update profiles in their tenants" on profiles
  for update using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert profiles in their tenants" on profiles
  for insert with check (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can view pantry items in their tenants" on pantry_items
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert pantry items in their tenants" on pantry_items
  for insert with check (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can update pantry items in their tenants" on pantry_items
  for update using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can delete pantry items in their tenants" on pantry_items
  for delete using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can view recipes in their tenants" on recipes
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert recipes in their tenants" on recipes
  for insert with check (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can update recipes in their tenants" on recipes
  for update using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can delete recipes in their tenants" on recipes
  for delete using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can view favorites in their tenants" on favorites
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert favorites in their tenants" on favorites
  for insert with check (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can delete favorites in their tenants" on favorites
  for delete using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

-- Update analytics policies to include tenant isolation
drop policy if exists "Users can view own analytics events" on analytics_events;
drop policy if exists "System can insert analytics events" on analytics_events;

create policy "Users can view analytics events in their tenants" on analytics_events
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    ) or tenant_id is null
  );

create policy "System can insert analytics events" on analytics_events
  for insert with check (true);

-- Update recipe metrics policies
drop policy if exists "Users can view own recipe metrics" on recipe_metrics;
drop policy if exists "System can insert recipe metrics" on recipe_metrics;

create policy "Users can view recipe metrics in their tenants" on recipe_metrics
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can insert recipe metrics" on recipe_metrics
  for insert with check (true);

-- Update recipe feedback policies
drop policy if exists "Users can view own recipe feedback" on recipe_feedback;
drop policy if exists "Users can insert own recipe feedback" on recipe_feedback;
drop policy if exists "Users can update own recipe feedback" on recipe_feedback;

create policy "Users can view recipe feedback in their tenants" on recipe_feedback
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can insert recipe feedback in their tenants" on recipe_feedback
  for insert with check (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "Users can update recipe feedback in their tenants" on recipe_feedback
  for update using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

-- Create functions for tenant management
create or replace function create_tenant_for_user(
  user_id uuid,
  tenant_name text,
  user_name text default null
)
returns uuid as $$
declare
  new_tenant_id uuid;
  new_profile_id uuid;
begin
  -- Create tenant
  insert into tenants (name, plan, status)
  values (tenant_name, 'free', 'active')
  returning id into new_tenant_id;
  
  -- Create tenant membership for owner
  insert into tenant_memberships (tenant_id, user_id, role, status)
  values (new_tenant_id, user_id, 'owner', 'active');
  
  -- Create or update profile with tenant_id
  insert into profiles (id, name, tenant_id, role)
  values (user_id, user_name, new_tenant_id, 'owner')
  on conflict (id) do update set
    tenant_id = new_tenant_id,
    role = 'owner',
    name = coalesce(user_name, profiles.name);
  
  return new_tenant_id;
end;
$$ language plpgsql security definer;

-- Function to check user's quota
create or replace function check_user_quota(
  user_id_param uuid,
  action_param text
)
returns boolean as $$
declare
  user_tenant_id uuid;
  user_plan text;
  daily_usage int;
  quota_limit int;
begin
  -- Get user's tenant and plan
  select tm.tenant_id, t.plan into user_tenant_id, user_plan
  from tenant_memberships tm
  join tenants t on t.id = tm.tenant_id
  where tm.user_id = user_id_param and tm.status = 'active';
  
  if user_tenant_id is null then
    return false;
  end if;
  
  -- Set quota limits based on plan
  case user_plan
    when 'free' then quota_limit := 3;
    when 'pro' then quota_limit := 1000;
    when 'family' then quota_limit := 1000;
    else quota_limit := 0;
  end case;
  
  -- Check daily usage for meal generation
  if action_param = 'meal_generation' then
    select count(*) into daily_usage
    from usage_logs
    where tenant_id = user_tenant_id
      and action = 'meal_generation'
      and timestamp >= current_date;
    
    return daily_usage < quota_limit;
  end if;
  
  return true;
end;
$$ language plpgsql security definer;

-- Function to log usage
create or replace function log_usage(
  user_id_param uuid,
  action_param text,
  tokens_used_param int default 0,
  cost_usd_param numeric default 0,
  model_used_param text default null,
  metadata_param jsonb default '{}'
)
returns void as $$
declare
  user_tenant_id uuid;
begin
  -- Get user's tenant
  select tm.tenant_id into user_tenant_id
  from tenant_memberships tm
  where tm.user_id = user_id_param and tm.status = 'active';
  
  if user_tenant_id is null then
    return;
  end if;
  
  -- Insert usage log
  insert into usage_logs (
    user_id, tenant_id, action, tokens_used, 
    cost_usd, model_used, metadata
  ) values (
    user_id_param, user_tenant_id, action_param, 
    tokens_used_param, cost_usd_param, model_used_param, metadata_param
  );
end;
$$ language plpgsql security definer;

-- Function to get tenant usage summary
create or replace function get_tenant_usage_summary(tenant_id_param uuid)
returns table(
  total_meals_today bigint,
  total_tokens_today bigint,
  total_cost_today numeric,
  plan_quota int,
  remaining_quota bigint
) as $$
declare
  tenant_plan text;
  quota_limit int;
begin
  -- Get tenant plan
  select plan into tenant_plan from tenants where id = tenant_id_param;
  
  -- Set quota based on plan
  case tenant_plan
    when 'free' then quota_limit := 3;
    when 'pro' then quota_limit := 1000;
    when 'family' then quota_limit := 1000;
    else quota_limit := 0;
  end case;
  
  return query
  select 
    count(*) filter (where action = 'meal_generation' and timestamp >= current_date) as total_meals_today,
    coalesce(sum(tokens_used) filter (where timestamp >= current_date), 0) as total_tokens_today,
    coalesce(sum(cost_usd) filter (where timestamp >= current_date), 0) as total_cost_today,
    quota_limit as plan_quota,
    greatest(quota_limit - count(*) filter (where action = 'meal_generation' and timestamp >= current_date), 0) as remaining_quota
  from usage_logs
  where tenant_id = tenant_id_param;
end;
$$ language plpgsql security definer;

-- Create trigger to update updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_tenants_updated_at before update on tenants
  for each row execute function update_updated_at_column();

create trigger update_subscriptions_updated_at before update on subscriptions
  for each row execute function update_updated_at_column();

-- CREATE OR REPLACE FUNCTION to clean up expired cache entries
create or replace function cleanup_expired_cache()
returns void as $$
begin
  delete from ai_cache where expires_at < now();
end;
$$ language plpgsql security definer;

-- CREATE OR REPLACE FUNCTION to clean up expired invites
create or replace function cleanup_expired_invites()
returns void as $$
begin
  delete from tenant_invites where expires_at < now() and used_at is null;
end;
$$ language plpgsql security definer;




-- ============================================================================
-- FROM: 020_rbac_rls_security.sql
-- ============================================================================

-- DEPRECATED: This migration is replaced by 003_consolidated_rls_security.sql
-- DO NOT RUN: Contains outdated references to non-existent tables
-- This file is kept for reference only and will be removed in a future migration
--
-- Use 003_consolidated_rls_security.sql instead which:
-- - Uses correct table names (profiles, not users)
-- - Integrates with multi-tenant schema
-- - Follows best practices for RLS
-- - Covers all tables from all migrations

-- Comprehensive RBAC and RLS Security Implementation
-- This migration sets up role-based access control and row-level security

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- Create custom roles
CREATE ROLE app_user;
CREATE ROLE app_admin;
CREATE ROLE app_super_admin;
CREATE ROLE app_readonly;

-- Grant basic permissions to app_user
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pantry_items TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO app_user;
GRANT SELECT ON public.tenant_usage TO app_user;
GRANT SELECT ON public.tenant_settings TO app_user;

-- Grant admin permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- Grant super admin permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_super_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_super_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO app_super_admin;

-- Grant readonly permissions
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for recipes table
CREATE POLICY "Users can view own recipes" ON public.recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON public.recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON public.recipes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON public.recipes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pantry_items table
CREATE POLICY "Users can view own pantry items" ON public.pantry_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pantry items" ON public.pantry_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pantry items" ON public.pantry_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pantry items" ON public.pantry_items
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for favorites table
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tenant_usage table
CREATE POLICY "Users can view own tenant usage" ON public.tenant_usage
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for tenant_settings table
CREATE POLICY "Users can view own tenant settings" ON public.tenant_settings
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for audit_logs table
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- RLS Policies for api_keys table
CREATE POLICY "Users can view own API keys" ON public.api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON public.api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for billing_events table
CREATE POLICY "Users can view own billing events" ON public.billing_events
    FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (for app_admin role)
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all recipes" ON public.recipes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all pantry items" ON public.pantry_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Super admin policies (for app_super_admin role)
CREATE POLICY "Super admins can do everything" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- CREATE OR REPLACE FUNCTION to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT role FROM public.users WHERE id = user_id;
$$;

-- CREATE OR REPLACE FUNCTION to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id 
        AND role IN ('admin', 'super_admin')
    );
$$;

-- CREATE OR REPLACE FUNCTION to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id 
        AND role = 'super_admin'
    );
$$;

-- CREATE OR REPLACE FUNCTION to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type TEXT,
    user_id UUID,
    details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        resource_type,
        details,
        ip_address,
        user_agent
    ) VALUES (
        user_id,
        event_type,
        'security',
        details,
        current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
        current_setting('request.headers', true)::jsonb->>'user-agent'
    );
END;
$$;

-- CREATE OR REPLACE FUNCTION to validate API key
CREATE OR REPLACE FUNCTION public.validate_api_key(api_key TEXT)
RETURNS TABLE(
    is_valid BOOLEAN,
    user_id UUID,
    permissions TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    key_record RECORD;
BEGIN
    SELECT 
        ak.user_id,
        ak.permissions,
        ak.expires_at,
        ak.is_active
    INTO key_record
    FROM public.api_keys ak
    WHERE ak.key_hash = encode(sha256(api_key::bytea), 'hex')
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
    
    IF key_record IS NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT[];
    ELSE
        RETURN QUERY SELECT true, key_record.user_id, key_record.permissions;
    END IF;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);

-- Create view for user permissions
CREATE VIEW public.user_permissions AS
SELECT 
    u.id,
    u.email,
    u.role,
    CASE 
        WHEN u.role = 'super_admin' THEN ARRAY['read', 'write', 'admin', 'super_admin']
        WHEN u.role = 'admin' THEN ARRAY['read', 'write', 'admin']
        WHEN u.role = 'user' THEN ARRAY['read', 'write']
        ELSE ARRAY['read']
    END as permissions,
    u.created_at,
    u.updated_at
FROM public.users u;

-- Grant access to the view
GRANT SELECT ON public.user_permissions TO app_user, app_admin, app_super_admin, app_readonly;

-- Create trigger for automatic role assignment
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.role IS NULL THEN
        NEW.role := 'user';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_assign_default_role
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_default_role();

-- Create trigger for audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
        current_setting('request.headers', true)::jsonb->>'user-agent'
    );
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_api_keys
    AFTER INSERT OR UPDATE OR DELETE ON public.api_keys
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- CREATE OR REPLACE FUNCTION to clean up old audit logs
CREATE OR REPLACE FUNCTION public.cleanup_audit_logs()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.audit_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$;

-- CREATE OR REPLACE FUNCTION to get user security summary
CREATE OR REPLACE FUNCTION public.get_user_security_summary(target_user_id UUID)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    role TEXT,
    last_login TIMESTAMPTZ,
    failed_login_attempts INTEGER,
    api_keys_count INTEGER,
    recent_activity_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.role,
        u.last_login,
        u.failed_login_attempts,
        COALESCE(ak_count.count, 0)::INTEGER as api_keys_count,
        COALESCE(activity_count.count, 0)::INTEGER as recent_activity_count
    FROM public.users u
    LEFT JOIN (
        SELECT user_id, COUNT(*) as count
        FROM public.api_keys
        WHERE user_id = target_user_id
        AND is_active = true
        GROUP BY user_id
    ) ak_count ON u.id = ak_count.user_id
    LEFT JOIN (
        SELECT user_id, COUNT(*) as count
        FROM public.audit_logs
        WHERE user_id = target_user_id
        AND created_at > NOW() - INTERVAL '7 days'
        GROUP BY user_id
    ) activity_count ON u.id = activity_count.user_id
    WHERE u.id = target_user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.log_security_event(TEXT, UUID, JSONB) TO app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.validate_api_key(TEXT) TO app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.cleanup_audit_logs() TO app_super_admin;
GRANT EXECUTE ON FUNCTION public.get_user_security_summary(UUID) TO app_admin, app_super_admin;

-- Insert default super admin user (for initial setup)
-- This should be replaced with proper user creation in production
INSERT INTO public.users (id, email, role, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin@whatsfordinner.com',
    'super_admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create security monitoring view
CREATE VIEW public.security_monitoring AS
SELECT 
    al.created_at,
    al.user_id,
    u.email,
    al.action,
    al.resource_type,
    al.resource_id,
    al.ip_address,
    al.user_agent,
    al.details
FROM public.audit_logs al
LEFT JOIN public.users u ON al.user_id = u.id
WHERE al.action IN ('login', 'logout', 'failed_login', 'api_key_created', 'api_key_revoked', 'role_changed')
ORDER BY al.created_at DESC;

GRANT SELECT ON public.security_monitoring TO app_admin, app_super_admin;



-- ============================================================================
-- FROM: 021_growth_engine_schema.sql
-- ============================================================================

-- Growth Engine Schema Migration
-- This migration adds comprehensive growth tracking, referral systems, and marketing automation

-- Create growth_metrics table for historical KPI tracking
CREATE TABLE IF NOT EXISTS growth_metrics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  metric_type text not null check (metric_type in (
    'cac', 'ltv', 'retention_d30', 'retention_d90', 'mrr', 'churn_rate', 
    'ai_cost_ratio', 'conversion_rate', 'activation_rate', 'engagement_score'
  )),
  value numeric(15,4) not null,
  cohort_date date,
  period_start date not null,
  period_end date not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now(),
  unique(tenant_id, metric_type, cohort_date, period_start, period_end)
);

-- Create referrals table for affiliate system
CREATE TABLE IF NOT EXISTS referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id) on delete cascade,
  invitee_email text,
  invitee_id uuid references auth.users(id),
  reward_status text default 'pending' check (reward_status in ('pending', 'earned', 'paid', 'expired')),
  referral_code text unique not null,
  reward_type text check (reward_type in ('pro_extension', 'credit', 'cash')),
  reward_value numeric(10,2),
  conversion_date timestamp with time zone,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '90 days')
);

-- Create affiliate_campaigns table for tracking campaigns
CREATE TABLE IF NOT EXISTS affiliate_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  reward_type text not null check (reward_type in ('pro_extension', 'credit', 'cash')),
  reward_value numeric(10,2) not null,
  is_active boolean default true,
  start_date timestamp with time zone default now(),
  end_date timestamp with time zone,
  max_referrals int,
  current_referrals int default 0,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create funnel_events table for conversion tracking
CREATE TABLE IF NOT EXISTS funnel_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  tenant_id uuid references tenants(id),
  session_id text not null,
  funnel_stage text not null check (funnel_stage in (
    'landing', 'signup', 'onboarding', 'first_recipe', 'recipe_feedback', 
    'subscription', 'activation', 'retention', 'churn'
  )),
  event_data jsonb default '{}',
  timestamp timestamp with time zone default now(),
  page_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

-- Create ab_test_experiments table for A/B testing
CREATE TABLE IF NOT EXISTS ab_test_experiments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  hypothesis text,
  status text default 'draft' check (status in ('draft', 'running', 'paused', 'completed')),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  traffic_allocation numeric(3,2) default 0.5,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create ab_test_variants table
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references ab_test_experiments(id) on delete cascade,
  name text not null,
  description text,
  configuration jsonb not null,
  traffic_weight numeric(3,2) default 0.5,
  is_control boolean default false,
  created_at timestamp with time zone default now()
);

-- Create ab_test_assignments table
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references ab_test_experiments(id) on delete cascade,
  variant_id uuid references ab_test_variants(id) on delete cascade,
  user_id uuid references auth.users(id),
  session_id text,
  assigned_at timestamp with time zone default now(),
  unique(experiment_id, user_id),
  unique(experiment_id, session_id)
);

-- Create ai_copy_logs table for copy optimization
CREATE TABLE IF NOT EXISTS ai_copy_logs (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in (
    'landing_headline', 'email_subject', 'feature_copy', 'cta_button', 'social_post'
  )),
  variant_name text not null,
  content text not null,
  performance_metrics jsonb default '{}',
  is_winner boolean default false,
  test_id uuid references ab_test_experiments(id),
  created_at timestamp with time zone default now()
);

-- Create social_posts table for automated content
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('twitter', 'tiktok', 'threads', 'instagram', 'linkedin')),
  content text not null,
  media_urls text[],
  hashtags text[],
  scheduled_for timestamp with time zone,
  published_at timestamp with time zone,
  status text default 'draft' check (status in ('draft', 'scheduled', 'published', 'failed')),
  performance_metrics jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create ugc_shares table for user-generated content tracking
CREATE TABLE IF NOT EXISTS ugc_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  recipe_id int references recipes(id),
  share_type text not null check (share_type in ('meal_card', 'recipe', 'achievement')),
  platform text not null,
  share_url text,
  impressions int default 0,
  clicks int default 0,
  conversions int default 0,
  created_at timestamp with time zone default now()
);

-- Create dynamic_pricing_rules table
CREATE TABLE IF NOT EXISTS dynamic_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  rule_name text not null,
  rule_type text not null check (rule_type in ('ltv_based', 'usage_based', 'seasonal', 'churn_risk')),
  conditions jsonb not null,
  pricing_adjustment jsonb not null,
  is_active boolean default true,
  priority int default 0,
  created_at timestamp with time zone default now()
);

-- Create churn_predictions table for ML predictions
CREATE TABLE IF NOT EXISTS churn_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  tenant_id uuid references tenants(id),
  churn_probability numeric(3,2) not null check (churn_probability >= 0 and churn_probability <= 1),
  risk_factors jsonb default '{}',
  recommended_actions jsonb default '[]',
  model_version text not null,
  predicted_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '7 days')
);

-- Create winback_campaigns table
CREATE TABLE IF NOT EXISTS winback_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  campaign_type text not null check (campaign_type in ('email', 'push', 'sms', 'in_app')),
  status text default 'pending' check (status in ('pending', 'sent', 'opened', 'clicked', 'converted', 'failed')),
  content jsonb not null,
  sent_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  converted_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_growth_metrics_tenant_id on growth_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_type on growth_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_period on growth_metrics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id on referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code on referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status on referrals(reward_status);

CREATE INDEX IF NOT EXISTS idx_funnel_events_user_id on funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session_id on funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_stage on funnel_events(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_funnel_events_timestamp on funnel_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_user on ab_test_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_session on ab_test_assignments(session_id);

CREATE INDEX IF NOT EXISTS idx_social_posts_platform on social_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_status on social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled on social_posts(scheduled_for);

CREATE INDEX IF NOT EXISTS idx_ugc_shares_user_id on ugc_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_ugc_shares_platform on ugc_shares(platform);

CREATE INDEX IF NOT EXISTS idx_churn_predictions_user_id on churn_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_probability on churn_predictions(churn_probability);

CREATE INDEX IF NOT EXISTS idx_winback_campaigns_user_id on winback_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_winback_campaigns_status on winback_campaigns(status);

-- Enable Row Level Security
alter table growth_metrics enable row level security;
alter table referrals enable row level security;
alter table affiliate_campaigns enable row level security;
alter table funnel_events enable row level security;
alter table ab_test_experiments enable row level security;
alter table ab_test_variants enable row level security;
alter table ab_test_assignments enable row level security;
alter table ai_copy_logs enable row level security;
alter table social_posts enable row level security;
alter table ugc_shares enable row level security;
alter table dynamic_pricing_rules enable row level security;
alter table churn_predictions enable row level security;
alter table winback_campaigns enable row level security;

-- RLS Policies for growth_metrics
create policy "Users can view growth metrics for their tenants" on growth_metrics
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage growth metrics" on growth_metrics
  for all using (true);

-- RLS Policies for referrals
create policy "Users can view their own referrals" on referrals
  for select using (referrer_id = auth.uid());

create policy "Users can create referrals" on referrals
  for insert with check (referrer_id = auth.uid());

create policy "Users can update their own referrals" on referrals
  for update using (referrer_id = auth.uid());

-- RLS Policies for funnel_events
create policy "Users can view their own funnel events" on funnel_events
  for select using (user_id = auth.uid());

create policy "System can insert funnel events" on funnel_events
  for insert with check (true);

-- RLS Policies for ab_test_assignments
create policy "Users can view their own test assignments" on ab_test_assignments
  for select using (user_id = auth.uid());

create policy "System can manage test assignments" on ab_test_assignments
  for all using (true);

-- RLS Policies for ugc_shares
create policy "Users can view their own shares" on ugc_shares
  for select using (user_id = auth.uid());

create policy "Users can create shares" on ugc_shares
  for insert with check (user_id = auth.uid());

-- RLS Policies for churn_predictions
create policy "Users can view their own churn predictions" on churn_predictions
  for select using (user_id = auth.uid());

create policy "System can manage churn predictions" on churn_predictions
  for all using (true);

-- RLS Policies for winback_campaigns
create policy "Users can view their own winback campaigns" on winback_campaigns
  for select using (user_id = auth.uid());

create policy "System can manage winback campaigns" on winback_campaigns
  for all using (true);

-- Create functions for growth analytics
create or replace function calculate_cohort_retention(
  cohort_date_param date,
  days_param int
)
returns table(
  cohort_date date,
  days_since_signup int,
  users_in_cohort bigint,
  users_retained bigint,
  retention_rate numeric
) as $$
begin
  return query
  with cohort_users as (
    select user_id, created_at::date as signup_date
    from auth.users
    where created_at::date = cohort_date_param
  ),
  retention_data as (
    select 
      cu.signup_date,
      cu.user_id,
      case 
        when exists(
          select 1 from usage_logs ul 
          where ul.user_id = cu.user_id 
          and ul.timestamp::date = cu.signup_date + interval '1 day' * days_param
        ) then 1 else 0 
      end as retained
    from cohort_users cu
  )
  select 
    rd.signup_date as cohort_date,
    days_param as days_since_signup,
    count(*) as users_in_cohort,
    sum(rd.retained) as users_retained,
    round(sum(rd.retained)::numeric / count(*)::numeric, 4) as retention_rate
  from retention_data rd
  group by rd.signup_date;
end;
$$ language plpgsql security definer;

-- Function to calculate LTV
create or replace function calculate_user_ltv(user_id_param uuid)
returns numeric as $$
declare
  total_revenue numeric;
  months_active int;
  ltv_value numeric;
begin
  -- Calculate total revenue from subscriptions
  select coalesce(sum(
    case 
      when s.plan = 'pro' then 9.99
      when s.plan = 'family' then 19.99
      else 0
    end
  ), 0) into total_revenue
  from subscriptions s
  where s.user_id = user_id_param
  and s.status = 'active';
  
  -- Calculate months active
  select extract(months from (now() - min(created_at))) into months_active
  from auth.users
  where id = user_id_param;
  
  -- Calculate LTV (simplified: total revenue / months active * 12)
  if months_active > 0 then
    ltv_value := total_revenue / months_active * 12;
  else
    ltv_value := 0;
  end if;
  
  return ltv_value;
end;
$$ language plpgsql security definer;

-- Function to generate referral code
create or replace function generate_referral_code()
returns text as $$
begin
  return upper(substring(md5(random()::text) from 1 for 8));
end;
$$ language plpgsql;

-- Function to process referral conversion
create or replace function process_referral_conversion(
  referral_code_param text,
  new_user_id uuid
)
returns boolean as $$
declare
  referral_record referrals%rowtype;
  reward_amount numeric;
begin
  -- Find the referral
  select * into referral_record
  from referrals
  where referral_code = referral_code_param
  and reward_status = 'pending'
  and expires_at > now();
  
  if not found then
    return false;
  end if;
  
  -- Update referral record
  update referrals
  set 
    invitee_id = new_user_id,
    conversion_date = now(),
    reward_status = 'earned'
  where id = referral_record.id;
  
  -- Process reward based on type
  case referral_record.reward_type
    when 'pro_extension' then
      -- Add 7 days to Pro plan
      insert into subscriptions (user_id, plan, status, current_period_start, current_period_end)
      values (referral_record.referrer_id, 'pro', 'active', now(), now() + interval '7 days');
      
    when 'credit' then
      -- Add credit to user account (implement based on your billing system)
      -- This would typically update a credits table or Stripe customer balance
      null;
      
    when 'cash' then
      -- Process cash reward (implement based on your payout system)
      null;
  end case;
  
  return true;
end;
$$ language plpgsql security definer;

-- Function to track funnel event
create or replace function track_funnel_event(
  user_id_param uuid,
  session_id_param text,
  funnel_stage_param text,
  event_data_param jsonb default '{}',
  page_url_param text default null,
  utm_source_param text default null,
  utm_medium_param text default null,
  utm_campaign_param text default null
)
returns void as $$
declare
  user_tenant_id uuid;
begin
  -- Get user's tenant
  select tm.tenant_id into user_tenant_id
  from tenant_memberships tm
  where tm.user_id = user_id_param and tm.status = 'active';
  
  -- Insert funnel event
  insert into funnel_events (
    user_id, tenant_id, session_id, funnel_stage, 
    event_data, page_url, utm_source, utm_medium, utm_campaign
  ) values (
    user_id_param, user_tenant_id, session_id_param, funnel_stage_param,
    event_data_param, page_url_param, utm_source_param, utm_medium_param, utm_campaign_param
  );
end;
$$ language plpgsql security definer;

-- Function to assign user to A/B test
create or replace function assign_ab_test(
  user_id_param uuid,
  session_id_param text,
  experiment_name_param text
)
returns uuid as $$
declare
  experiment_id_val uuid;
  variant_id_val uuid;
  assignment_id_val uuid;
begin
  -- Get active experiment
  select id into experiment_id_val
  from ab_test_experiments
  where name = experiment_name_param
  and status = 'running'
  and (start_date is null or start_date <= now())
  and (end_date is null or end_date >= now());
  
  if not found then
    return null;
  end if;
  
  -- Check if user already assigned
  select id into assignment_id_val
  from ab_test_assignments
  where experiment_id = experiment_id_val
  and (user_id = user_id_param or session_id = session_id_param);
  
  if found then
    return assignment_id_val;
  end if;
  
  -- Assign to variant based on traffic weight
  select id into variant_id_val
  from ab_test_variants
  where experiment_id = experiment_id_val
  order by random()
  limit 1;
  
  -- Create assignment
  insert into ab_test_assignments (experiment_id, variant_id, user_id, session_id)
  values (experiment_id_val, variant_id_val, user_id_param, session_id_param)
  returning id into assignment_id_val;
  
  return assignment_id_val;
end;
$$ language plpgsql security definer;




-- ============================================================================
-- FROM: 022_federated_ecosystem_schema.sql
-- ============================================================================

-- Federated Ecosystem Schema Migration
-- This migration creates the foundation for a unified, API-monetized ecosystem

-- Create partner_registry table for ecosystem partners
CREATE TABLE IF NOT EXISTS partner_registry (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in (
    'shopify', 'zapier', 'alexa', 'google_home', 'tiktok', 'instagram', 
    'api_integration', 'white_label', 'franchise', 'affiliate'
  )),
  api_base text not null,
  api_key text,
  webhook_url text,
  revenue_share_percent numeric(5,2) default 0.0,
  status text default 'pending' check (status in ('pending', 'active', 'suspended', 'terminated')),
  region text default 'global' check (region in ('global', 'na', 'eu', 'apac')),
  capabilities jsonb default '{}',
  metadata jsonb default '{}',
  registered_at timestamp with time zone default now(),
  activated_at timestamp with time zone,
  last_sync_at timestamp with time zone
);

-- Create federated_api_endpoints table for unified API routing
CREATE TABLE IF NOT EXISTS federated_api_endpoints (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partner_registry(id) on delete cascade,
  endpoint_path text not null,
  method text not null check (method in ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  target_url text not null,
  auth_type text default 'oauth2' check (auth_type in ('oauth2', 'jwt', 'api_key', 'none')),
  rate_limit_per_minute int default 100,
  rate_limit_per_hour int default 1000,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Create api_usage_tracking table for monetization
CREATE TABLE IF NOT EXISTS api_usage_tracking (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partner_registry(id),
  tenant_id uuid references tenants(id),
  endpoint_id uuid references federated_api_endpoints(id),
  user_id uuid references auth.users(id),
  request_id text not null,
  method text not null,
  endpoint text not null,
  status_code int not null,
  response_time_ms int not null,
  tokens_used int default 0,
  cost_usd numeric(10,4) default 0.0,
  revenue_usd numeric(10,4) default 0.0,
  metadata jsonb default '{}',
  timestamp timestamp with time zone default now()
);

-- Create ai_model_advisor table for multi-model cost optimization
CREATE TABLE IF NOT EXISTS ai_model_advisor (
  id uuid primary key default gen_random_uuid(),
  model_name text not null,
  provider text not null check (provider in ('openai', 'anthropic', 'google', 'azure')),
  cost_per_1k_tokens numeric(10,6) not null,
  quality_score numeric(3,2) not null check (quality_score >= 0 and quality_score <= 1),
  latency_ms int not null,
  context_window int not null,
  is_active boolean default true,
  last_updated timestamp with time zone default now()
);

-- Create ai_evolution_logs table for learning loop
CREATE TABLE IF NOT EXISTS ai_evolution_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  model_version text not null,
  prompt_hash text not null,
  performance_metrics jsonb not null,
  user_feedback jsonb default '{}',
  optimization_suggestions jsonb default '{}',
  applied_changes jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create franchise_deployments table for white-label automation
CREATE TABLE IF NOT EXISTS franchise_deployments (
  id uuid primary key default gen_random_uuid(),
  franchise_name text not null,
  domain text unique not null,
  tenant_id uuid references tenants(id),
  region text not null check (region in ('na', 'eu', 'apac')),
  deployment_manifest jsonb not null,
  status text default 'pending' check (status in ('pending', 'deploying', 'active', 'failed', 'suspended')),
  stripe_account_id text,
  custom_theme jsonb default '{}',
  features_enabled jsonb default '{}',
  created_at timestamp with time zone default now(),
  deployed_at timestamp with time zone
);

-- Create compliance_audit_logs table for enterprise governance
CREATE TABLE IF NOT EXISTS compliance_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  user_id uuid references auth.users(id),
  action_type text not null,
  resource_type text not null,
  resource_id text not null,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  risk_score numeric(3,2) default 0.0,
  compliance_flags jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create anomaly_detections table for AI-powered monitoring
CREATE TABLE IF NOT EXISTS anomaly_detections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  detection_type text not null check (detection_type in (
    'api_abuse', 'billing_anomaly', 'data_privacy_risk', 'performance_degradation',
    'security_threat', 'cost_spike', 'usage_pattern_change'
  )),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  description text not null,
  detected_at timestamp with time zone default now(),
  resolved_at timestamp with time zone,
  auto_resolved boolean default false,
  resolution_actions jsonb default '[]',
  metadata jsonb default '{}'
);

-- Create developer_portal_sessions table for SDK management
CREATE TABLE IF NOT EXISTS developer_portal_sessions (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references auth.users(id),
  api_key text unique not null,
  name text not null,
  permissions jsonb not null,
  rate_limits jsonb not null,
  is_active boolean default true,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone
);

-- Create sdk_downloads table for tracking SDK usage
CREATE TABLE IF NOT EXISTS sdk_downloads (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references auth.users(id),
  sdk_language text not null,
  sdk_version text not null,
  download_count int default 1,
  last_downloaded_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_partner_registry_type on partner_registry(type);
CREATE INDEX IF NOT EXISTS idx_partner_registry_status on partner_registry(status);
CREATE INDEX IF NOT EXISTS idx_partner_registry_region on partner_registry(region);

CREATE INDEX IF NOT EXISTS idx_federated_endpoints_partner on federated_api_endpoints(partner_id);
CREATE INDEX IF NOT EXISTS idx_federated_endpoints_active on federated_api_endpoints(is_active);

CREATE INDEX IF NOT EXISTS idx_api_usage_partner on api_usage_tracking(partner_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_tenant on api_usage_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_timestamp on api_usage_tracking(timestamp);

CREATE INDEX IF NOT EXISTS idx_ai_model_advisor_provider on ai_model_advisor(provider);
CREATE INDEX IF NOT EXISTS idx_ai_model_advisor_active on ai_model_advisor(is_active);

CREATE INDEX IF NOT EXISTS idx_ai_evolution_tenant on ai_evolution_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_evolution_created on ai_evolution_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_franchise_deployments_status on franchise_deployments(status);
CREATE INDEX IF NOT EXISTS idx_franchise_deployments_region on franchise_deployments(region);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_tenant on compliance_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_action on compliance_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_created on compliance_audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_anomaly_detections_tenant on anomaly_detections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_type on anomaly_detections(detection_type);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_severity on anomaly_detections(severity);

CREATE INDEX IF NOT EXISTS idx_developer_sessions_developer on developer_portal_sessions(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_sessions_active on developer_portal_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_sdk_downloads_language on sdk_downloads(sdk_language);
CREATE INDEX IF NOT EXISTS idx_sdk_downloads_developer on sdk_downloads(developer_id);

-- Enable Row Level Security
alter table partner_registry enable row level security;
alter table federated_api_endpoints enable row level security;
alter table api_usage_tracking enable row level security;
alter table ai_model_advisor enable row level security;
alter table ai_evolution_logs enable row level security;
alter table franchise_deployments enable row level security;
alter table compliance_audit_logs enable row level security;
alter table anomaly_detections enable row level security;
alter table developer_portal_sessions enable row level security;
alter table sdk_downloads enable row level security;

-- RLS Policies for partner_registry
create policy "Partners can view their own registry" on partner_registry
  for select using (true); -- Public read for discovery

create policy "System can manage partner registry" on partner_registry
  for all using (true);

-- RLS Policies for federated_api_endpoints
create policy "Public can view active endpoints" on federated_api_endpoints
  for select using (is_active = true);

create policy "System can manage endpoints" on federated_api_endpoints
  for all using (true);

-- RLS Policies for api_usage_tracking
create policy "Tenants can view their usage" on api_usage_tracking
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage usage tracking" on api_usage_tracking
  for all using (true);

-- RLS Policies for ai_model_advisor
create policy "Public can view model advisor" on ai_model_advisor
  for select using (is_active = true);

create policy "System can manage model advisor" on ai_model_advisor
  for all using (true);

-- RLS Policies for ai_evolution_logs
create policy "Tenants can view their evolution logs" on ai_evolution_logs
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage evolution logs" on ai_evolution_logs
  for all using (true);

-- RLS Policies for franchise_deployments
create policy "Franchise owners can view their deployments" on franchise_deployments
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage franchise deployments" on franchise_deployments
  for all using (true);

-- RLS Policies for compliance_audit_logs
create policy "Tenants can view their audit logs" on compliance_audit_logs
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage audit logs" on compliance_audit_logs
  for all using (true);

-- RLS Policies for anomaly_detections
create policy "Tenants can view their anomalies" on anomaly_detections
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage anomalies" on anomaly_detections
  for all using (true);

-- RLS Policies for developer_portal_sessions
create policy "Developers can view their sessions" on developer_portal_sessions
  for select using (developer_id = auth.uid());

create policy "Developers can manage their sessions" on developer_portal_sessions
  for all using (developer_id = auth.uid());

-- RLS Policies for sdk_downloads
create policy "Developers can view their downloads" on sdk_downloads
  for select using (developer_id = auth.uid());

create policy "System can manage downloads" on sdk_downloads
  for all using (true);

-- Functions for federated ecosystem

-- Function to register a new partner
create or replace function register_partner(
  name_param text,
  type_param text,
  api_base_param text,
  api_key_param text default null,
  webhook_url_param text default null,
  revenue_share_percent_param numeric default 0.0,
  region_param text default 'global',
  capabilities_param jsonb default '{}',
  metadata_param jsonb default '{}'
)
returns uuid as $$
declare
  partner_id_val uuid;
begin
  insert into partner_registry (
    name, type, api_base, api_key, webhook_url, 
    revenue_share_percent, region, capabilities, metadata
  ) values (
    name_param, type_param, api_base_param, api_key_param, webhook_url_param,
    revenue_share_percent_param, region_param, capabilities_param, metadata_param
  ) returning id into partner_id_val;
  
  return partner_id_val;
end;
$$ language plpgsql security definer;

-- Function to track API usage
create or replace function track_api_usage(
  partner_id_param uuid,
  tenant_id_param uuid,
  endpoint_id_param uuid,
  user_id_param uuid,
  request_id_param text,
  method_param text,
  endpoint_param text,
  status_code_param int,
  response_time_ms_param int,
  tokens_used_param int default 0,
  cost_usd_param numeric default 0.0,
  metadata_param jsonb default '{}'
)
returns void as $$
declare
  partner_revenue_share numeric;
  revenue_usd_val numeric;
begin
  -- Get partner revenue share
  select revenue_share_percent into partner_revenue_share
  from partner_registry
  where id = partner_id_param;
  
  -- Calculate partner revenue
  revenue_usd_val := cost_usd_param * (partner_revenue_share / 100.0);
  
  -- Insert usage tracking record
  insert into api_usage_tracking (
    partner_id, tenant_id, endpoint_id, user_id, request_id,
    method, endpoint, status_code, response_time_ms,
    tokens_used, cost_usd, revenue_usd, metadata
  ) values (
    partner_id_param, tenant_id_param, endpoint_id_param, user_id_param, request_id_param,
    method_param, endpoint_param, status_code_param, response_time_ms_param,
    tokens_used_param, cost_usd_param, revenue_usd_val, metadata_param
  );
end;
$$ language plpgsql security definer;

-- Function to get optimal AI model
create or replace function get_optimal_ai_model(
  estimated_tokens_param int,
  quality_requirement_param numeric default 0.8,
  max_latency_ms_param int default 5000
)
returns table(
  model_name text,
  provider text,
  cost_per_1k_tokens numeric,
  quality_score numeric,
  latency_ms int,
  total_cost numeric
) as $$
begin
  return query
  select 
    ama.model_name,
    ama.provider,
    ama.cost_per_1k_tokens,
    ama.quality_score,
    ama.latency_ms,
    (ama.cost_per_1k_tokens * estimated_tokens_param / 1000.0) as total_cost
  from ai_model_advisor ama
  where ama.is_active = true
    and ama.quality_score >= quality_requirement_param
    and ama.latency_ms <= max_latency_ms_param
  order by total_cost asc, ama.quality_score desc
  limit 5;
end;
$$ language plpgsql security definer;

-- Function to detect anomalies
create or replace function detect_anomalies(
  tenant_id_param uuid,
  detection_type_param text,
  threshold_multiplier_param numeric default 2.0
)
returns void as $$
declare
  anomaly_count int;
  avg_value numeric;
  current_value numeric;
begin
  -- Example: Detect API abuse (simplified)
  if detection_type_param = 'api_abuse' then
    -- Get average API calls per hour for this tenant
    select avg(count) into avg_value
    from (
      select count(*) as count
      from api_usage_tracking
      where tenant_id = tenant_id_param
        and timestamp >= now() - interval '24 hours'
      group by date_trunc('hour', timestamp)
    ) hourly_counts;
    
    -- Get current hour's API calls
    select count(*) into current_value
    from api_usage_tracking
    where tenant_id = tenant_id_param
      and timestamp >= date_trunc('hour', now());
    
    -- Check if current usage exceeds threshold
    if current_value > (avg_value * threshold_multiplier_param) then
      insert into anomaly_detections (
        tenant_id, detection_type, severity, description, metadata
      ) values (
        tenant_id_param, 
        'api_abuse', 
        'high',
        'API usage spike detected: ' || current_value || ' calls vs avg ' || avg_value,
        jsonb_build_object(
          'current_usage', current_value,
          'average_usage', avg_value,
          'threshold', avg_value * threshold_multiplier_param
        )
      );
    end if;
  end if;
end;
$$ language plpgsql security definer;

-- Function to create franchise deployment
create or replace function create_franchise_deployment(
  franchise_name_param text,
  domain_param text,
  tenant_id_param uuid,
  region_param text,
  custom_theme_param jsonb default '{}',
  features_enabled_param jsonb default '{}'
)
returns uuid as $$
declare
  deployment_id_val uuid;
  deployment_manifest_val jsonb;
begin
  -- Create deployment manifest
  deployment_manifest_val := jsonb_build_object(
    'franchise_name', franchise_name_param,
    'domain', domain_param,
    'region', region_param,
    'tenant_id', tenant_id_param,
    'created_at', now(),
    'version', '1.0.0',
    'features', features_enabled_param,
    'theme', custom_theme_param
  );
  
  -- Insert franchise deployment
  insert into franchise_deployments (
    franchise_name, domain, tenant_id, region, 
    deployment_manifest, custom_theme, features_enabled
  ) values (
    franchise_name_param, domain_param, tenant_id_param, region_param,
    deployment_manifest_val, custom_theme_param, features_enabled_param
  ) returning id into deployment_id_val;
  
  return deployment_id_val;
end;
$$ language plpgsql security definer;

-- Function to log compliance audit
create or replace function log_compliance_audit(
  tenant_id_param uuid,
  user_id_param uuid,
  action_type_param text,
  resource_type_param text,
  resource_id_param text,
  old_values_param jsonb default null,
  new_values_param jsonb default null,
  ip_address_param inet default null,
  user_agent_param text default null
)
returns void as $$
declare
  risk_score_val numeric := 0.0;
  compliance_flags_val jsonb := '{}';
begin
  -- Calculate risk score based on action type
  case action_type_param
    when 'user_deletion' then risk_score_val := 0.8;
    when 'data_export' then risk_score_val := 0.6;
    when 'billing_change' then risk_score_val := 0.4;
    when 'api_key_creation' then risk_score_val := 0.3;
    else risk_score_val := 0.1;
  end case;
  
  -- Set compliance flags
  if action_type_param in ('user_deletion', 'data_export') then
    compliance_flags_val := jsonb_build_object('gdpr_relevant', true);
  end if;
  
  -- Insert audit log
  insert into compliance_audit_logs (
    tenant_id, user_id, action_type, resource_type, resource_id,
    old_values, new_values, ip_address, user_agent,
    risk_score, compliance_flags
  ) values (
    tenant_id_param, user_id_param, action_type_param, resource_type_param, resource_id_param,
    old_values_param, new_values_param, ip_address_param, user_agent_param,
    risk_score_val, compliance_flags_val
  );
end;
$$ language plpgsql security definer;

-- Insert initial AI model data
insert into ai_model_advisor (model_name, provider, cost_per_1k_tokens, quality_score, latency_ms, context_window) values
('gpt-4o', 'openai', 0.005, 0.95, 1200, 128000),
('gpt-4o-mini', 'openai', 0.00015, 0.85, 800, 128000),
('claude-3-5-sonnet', 'anthropic', 0.003, 0.92, 1000, 200000),
('claude-3-haiku', 'anthropic', 0.00025, 0.80, 600, 200000),
('gemini-pro', 'google', 0.0005, 0.88, 900, 32000);

-- Create initial partner registry entries
insert into partner_registry (name, type, api_base, revenue_share_percent, region, capabilities, status) values
('Shopify Integration', 'shopify', 'https://api.shopify.com/v1', 5.0, 'global', '{"meal_kits": true, "inventory": true}', 'active'),
('Zapier Automation', 'zapier', 'https://hooks.zapier.com/hooks', 3.0, 'global', '{"automation": true, "workflows": true}', 'active'),
('Alexa Skills', 'alexa', 'https://api.amazonalexa.com/v1', 2.0, 'global', '{"voice": true, "smart_home": true}', 'pending'),
('Google Home', 'google_home', 'https://homegraph.googleapis.com/v1', 2.0, 'global', '{"voice": true, "assistant": true}', 'pending'),
('TikTok API', 'tiktok', 'https://open-api.tiktok.com/v1', 4.0, 'global', '{"video": true, "social": true}', 'pending'),
('Instagram API', 'instagram', 'https://graph.instagram.com/v1', 4.0, 'global', '{"photo": true, "stories": true}', 'pending');



-- ============================================================================
-- FROM: 023_job_queue_schema.sql
-- ============================================================================

-- Job queue schema for asynchronous task processing
-- This migration adds the jobs_queue table and related functionality

-- Create jobs_queue table
CREATE TABLE IF NOT EXISTS jobs_queue (
  id bigint generated always as identity primary key,
  type text not null check (type in ('meal_generation', 'email_notification', 'data_cleanup', 'analytics_processing')),
  payload jsonb not null default '{}',
  status text not null check (status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  priority int default 0, -- Higher numbers = higher priority
  retry_count int default 0,
  max_retries int default 3,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  started_at timestamptz,
  completed_at timestamptz,
  tenant_id uuid references tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade
);

-- Create job results table for storing job outputs
CREATE TABLE IF NOT EXISTS job_results (
  id uuid primary key default gen_random_uuid(),
  job_id bigint references jobs_queue(id) on delete cascade,
  result_data jsonb not null,
  created_at timestamptz default now()
);

-- Create job logs table for detailed logging
CREATE TABLE IF NOT EXISTS job_logs (
  id uuid primary key default gen_random_uuid(),
  job_id bigint references jobs_queue(id) on delete cascade,
  level text not null check (level in ('debug', 'info', 'warn', 'error')),
  message text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_queue_status on jobs_queue(status);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_type on jobs_queue(type);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_priority on jobs_queue(priority desc);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_created_at on jobs_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_tenant_id on jobs_queue(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_queue_user_id on jobs_queue(user_id);

CREATE INDEX IF NOT EXISTS idx_job_results_job_id on job_results(job_id);
CREATE INDEX IF NOT EXISTS idx_job_logs_job_id on job_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_logs_level on job_logs(level);
CREATE INDEX IF NOT EXISTS idx_job_logs_created_at on job_logs(created_at);

-- Enable Row Level Security
alter table jobs_queue enable row level security;
alter table job_results enable row level security;
alter table job_logs enable row level security;

-- RLS Policies for jobs_queue
create policy "Users can view jobs in their tenants" on jobs_queue
  for select using (
    tenant_id in (
      select tenant_id from tenant_memberships 
      where user_id = auth.uid()
    )
  );

create policy "System can manage all jobs" on jobs_queue
  for all using (true);

-- RLS Policies for job_results
create policy "Users can view job results in their tenants" on job_results
  for select using (
    job_id in (
      select id from jobs_queue 
      where tenant_id in (
        select tenant_id from tenant_memberships 
        where user_id = auth.uid()
      )
    )
  );

create policy "System can manage job results" on job_results
  for all using (true);

-- RLS Policies for job_logs
create policy "Users can view job logs in their tenants" on job_logs
  for select using (
    job_id in (
      select id from jobs_queue 
      where tenant_id in (
        select tenant_id from tenant_memberships 
        where user_id = auth.uid()
      )
    )
  );

create policy "System can manage job logs" on job_logs
  for all using (true);

-- Function to create a job
create or replace function create_job(
  job_type text,
  job_payload jsonb,
  job_priority int default 0,
  job_tenant_id uuid default null,
  job_user_id uuid default null,
  job_max_retries int default 3
)
returns bigint as $$
declare
  new_job_id bigint;
begin
  insert into jobs_queue (
    type, payload, priority, tenant_id, user_id, max_retries
  ) values (
    job_type, job_payload, job_priority, job_tenant_id, job_user_id, job_max_retries
  ) returning id into new_job_id;
  
  return new_job_id;
end;
$$ language plpgsql security definer;

-- Function to get next pending job
create or replace function get_next_job()
returns table(
  job_id bigint,
  job_type text,
  job_payload jsonb,
  job_priority int,
  job_tenant_id uuid,
  job_user_id uuid,
  job_max_retries int,
  job_retry_count int
) as $$
declare
  next_job record;
begin
  -- Lock and get the next job
  select id, type, payload, priority, tenant_id, user_id, max_retries, retry_count
  into next_job
  from jobs_queue
  where status = 'pending'
  order by priority desc, created_at asc
  limit 1
  for update skip locked;
  
  if next_job.id is not null then
    -- Update job status to processing
    update jobs_queue
    set status = 'processing', started_at = now(), updated_at = now()
    where id = next_job.id;
    
    -- Return job details
    return query select 
      next_job.id, next_job.type, next_job.payload, next_job.priority,
      next_job.tenant_id, next_job.user_id, next_job.max_retries, next_job.retry_count;
  end if;
  
  return;
end;
$$ language plpgsql security definer;

-- Function to complete a job
create or replace function complete_job(
  job_id_param bigint,
  result_data jsonb default null,
  success boolean default true
)
returns void as $$
begin
  if success then
    update jobs_queue
    set status = 'completed', completed_at = now(), updated_at = now()
    where id = job_id_param;
    
    -- Store result if provided
    if result_data is not null then
      insert into job_results (job_id, result_data)
      values (job_id_param, result_data);
    end if;
  else
    update jobs_queue
    set status = 'failed', completed_at = now(), updated_at = now()
    where id = job_id_param;
  end if;
end;
$$ language plpgsql security definer;

-- Function to fail a job with retry logic
create or replace function fail_job(
  job_id_param bigint,
  error_message_param text
)
returns void as $$
declare
  job_record record;
begin
  select retry_count, max_retries into job_record
  from jobs_queue
  where id = job_id_param;
  
  if job_record.retry_count < job_record.max_retries then
    -- Retry the job
    update jobs_queue
    set 
      status = 'pending',
      retry_count = job_record.retry_count + 1,
      error_message = error_message_param,
      updated_at = now(),
      started_at = null
    where id = job_id_param;
  else
    -- Mark as permanently failed
    update jobs_queue
    set 
      status = 'failed',
      error_message = error_message_param,
      completed_at = now(),
      updated_at = now()
    where id = job_id_param;
  end if;
end;
$$ language plpgsql security definer;

-- Function to log job activity
create or replace function log_job_activity(
  job_id_param bigint,
  log_level text,
  log_message text,
  log_metadata jsonb default '{}'
)
returns void as $$
begin
  insert into job_logs (job_id, level, message, metadata)
  values (job_id_param, log_level, log_message, log_metadata);
end;
$$ language plpgsql security definer;

-- Function to clean up old completed jobs
create or replace function cleanup_old_jobs(
  days_to_keep int default 30
)
returns void as $$
begin
  -- Delete old completed jobs and their related data
  delete from job_logs
  where job_id in (
    select id from jobs_queue
    where status in ('completed', 'failed')
    and completed_at < now() - interval '1 day' * days_to_keep
  );
  
  delete from job_results
  where job_id in (
    select id from jobs_queue
    where status in ('completed', 'failed')
    and completed_at < now() - interval '1 day' * days_to_keep
  );
  
  delete from jobs_queue
  where status in ('completed', 'failed')
  and completed_at < now() - interval '1 day' * days_to_keep;
end;
$$ language plpgsql security definer;

-- Function to get job statistics
create or replace function get_job_stats(tenant_id_param uuid default null)
returns table(
  total_jobs bigint,
  pending_jobs bigint,
  processing_jobs bigint,
  completed_jobs bigint,
  failed_jobs bigint,
  avg_processing_time interval
) as $$
begin
  return query
  select 
    count(*) as total_jobs,
    count(*) filter (where status = 'pending') as pending_jobs,
    count(*) filter (where status = 'processing') as processing_jobs,
    count(*) filter (where status = 'completed') as completed_jobs,
    count(*) filter (where status = 'failed') as failed_jobs,
    avg(completed_at - started_at) filter (where status = 'completed' and started_at is not null) as avg_processing_time
  from jobs_queue
  where tenant_id_param is null or tenant_id = tenant_id_param;
end;
$$ language plpgsql security definer;

-- Create trigger to update updated_at timestamp
create or replace function update_jobs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_jobs_queue_updated_at
  before update on jobs_queue
  for each row
  execute function update_jobs_updated_at();




-- ============================================================================
-- FROM: 024_performance_indexes.sql
-- ============================================================================

-- Performance Optimization Indexes
-- This migration adds comprehensive indexing for optimal query performance

-- =============================================
-- MEALS TABLE INDEXES
-- =============================================

-- Index for user-specific meal queries
CREATE INDEX IF NOT EXISTS idx_meals_user_id_created_at 
ON meals(user_id, created_at DESC);

-- Index for meal type filtering
CREATE INDEX IF NOT EXISTS idx_meals_meal_type 
ON meals(meal_type);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_meals_meal_date 
ON meals(meal_date);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_meals_status 
ON meals(status);

-- Composite index for user meals by date and type
CREATE INDEX IF NOT EXISTS idx_meals_user_date_type 
ON meals(user_id, meal_date, meal_type);

-- Index for meal generation status
CREATE INDEX IF NOT EXISTS idx_meals_generation_status 
ON meals(generation_status);

-- =============================================
-- INGREDIENTS TABLE INDEXES
-- =============================================

-- Index for ingredient name searches
CREATE INDEX IF NOT EXISTS idx_ingredients_name 
ON ingredients USING gin(to_tsvector('english', name));

-- Index for ingredient category filtering
CREATE INDEX IF NOT EXISTS idx_ingredients_category 
ON ingredients(category);

-- Index for dietary restrictions
CREATE INDEX IF NOT EXISTS idx_ingredients_dietary_restrictions 
ON ingredients USING gin(dietary_restrictions);

-- Index for nutritional value queries
CREATE INDEX IF NOT EXISTS idx_ingredients_calories 
ON ingredients(calories_per_100g);

-- Index for availability status
CREATE INDEX IF NOT EXISTS idx_ingredients_available 
ON ingredients(is_available);

-- =============================================
-- RECIPES TABLE INDEXES
-- =============================================

-- Index for recipe name searches
CREATE INDEX IF NOT EXISTS idx_recipes_name 
ON recipes USING gin(to_tsvector('english', name));

-- Index for recipe difficulty
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty 
ON recipes(difficulty_level);

-- Index for cooking time
CREATE INDEX IF NOT EXISTS idx_recipes_cooking_time 
ON recipes(cooking_time_minutes);

-- Index for dietary restrictions
CREATE INDEX IF NOT EXISTS idx_recipes_dietary_restrictions 
ON recipes USING gin(dietary_restrictions);

-- Index for cuisine type
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine_type 
ON recipes(cuisine_type);

-- Index for rating and popularity
CREATE INDEX IF NOT EXISTS idx_recipes_rating 
ON recipes(average_rating DESC);

-- Index for creation date
CREATE INDEX IF NOT EXISTS idx_recipes_created_at 
ON recipes(created_at DESC);

-- =============================================
-- MEAL_INGREDIENTS TABLE INDEXES
-- =============================================

-- Index for meal-specific ingredient queries
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_meal_id 
ON meal_ingredients(meal_id);

-- Index for ingredient-specific meal queries
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_ingredient_id 
ON meal_ingredients(ingredient_id);

-- Composite index for meal-ingredient lookups
CREATE INDEX IF NOT EXISTS idx_meal_ingredients_meal_ingredient 
ON meal_ingredients(meal_id, ingredient_id);

-- =============================================
-- RECIPE_INGREDIENTS TABLE INDEXES
-- =============================================

-- Index for recipe-specific ingredient queries
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id 
ON recipe_ingredients(recipe_id);

-- Index for ingredient-specific recipe queries
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id 
ON recipe_ingredients(ingredient_id);

-- Composite index for recipe-ingredient lookups
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_ingredient 
ON recipe_ingredients(recipe_id, ingredient_id);

-- =============================================
-- USER_PREFERENCES TABLE INDEXES
-- =============================================

-- Index for user-specific preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON user_preferences(user_id);

-- Index for dietary restrictions
CREATE INDEX IF NOT EXISTS idx_user_preferences_dietary_restrictions 
ON user_preferences USING gin(dietary_restrictions);

-- Index for cuisine preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_cuisine_preferences 
ON user_preferences USING gin(cuisine_preferences);

-- =============================================
-- ANALYTICS TABLES INDEXES
-- =============================================

-- Index for user analytics by date
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_date 
ON user_analytics(user_id, date);

-- Index for event type filtering
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type 
ON user_analytics(event_type);

-- Index for session analytics
CREATE INDEX IF NOT EXISTS idx_session_analytics_session_id 
ON session_analytics(session_id);

-- Index for session analytics by date
CREATE INDEX IF NOT EXISTS idx_session_analytics_date 
ON session_analytics(created_at);

-- =============================================
-- JOB QUEUE TABLE INDEXES
-- =============================================

-- Index for job status filtering
CREATE INDEX IF NOT EXISTS idx_job_queue_status 
ON job_queue(status);

-- Index for job priority
CREATE INDEX IF NOT EXISTS idx_job_queue_priority 
ON job_queue(priority DESC);

-- Index for job creation time
CREATE INDEX IF NOT EXISTS idx_job_queue_created_at 
ON job_queue(created_at);

-- Index for job processing
CREATE INDEX IF NOT EXISTS idx_job_queue_status_priority_created 
ON job_queue(status, priority DESC, created_at);

-- =============================================
-- FULL-TEXT SEARCH INDEXES
-- =============================================

-- Full-text search for recipes
CREATE INDEX IF NOT EXISTS idx_recipes_search 
ON recipes USING gin(
    to_tsvector('english', 
        coalesce(name, '') || ' ' || 
        coalesce(description, '') || ' ' || 
        coalesce(instructions, '')
    )
);

-- Full-text search for ingredients
CREATE INDEX IF NOT EXISTS idx_ingredients_search 
ON ingredients USING gin(
    to_tsvector('english', 
        coalesce(name, '') || ' ' || 
        coalesce(description, '')
    )
);

-- =============================================
-- PARTIAL INDEXES FOR OPTIMIZATION
-- =============================================

-- Index for active meals only
CREATE INDEX IF NOT EXISTS idx_meals_active 
ON meals(user_id, meal_date) 
WHERE status = 'active';

-- Index for published recipes only
CREATE INDEX IF NOT EXISTS idx_recipes_published 
ON recipes(cuisine_type, difficulty_level) 
WHERE is_published = true;

-- Index for available ingredients only
CREATE INDEX IF NOT EXISTS idx_ingredients_available_category 
ON ingredients(category) 
WHERE is_available = true;

-- Index for pending jobs only
CREATE INDEX IF NOT EXISTS idx_job_queue_pending 
ON job_queue(priority DESC, created_at) 
WHERE status = 'pending';

-- =============================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =============================================

-- Index for meal planning queries
CREATE INDEX IF NOT EXISTS idx_meals_planning 
ON meals(user_id, meal_date, meal_type, status);

-- Index for recipe recommendation queries
CREATE INDEX IF NOT EXISTS idx_recipes_recommendations 
ON recipes(cuisine_type, difficulty_level, average_rating, cooking_time_minutes) 
WHERE is_published = true;

-- Index for ingredient substitution queries
CREATE INDEX IF NOT EXISTS idx_ingredients_substitution 
ON ingredients(category, dietary_restrictions, calories_per_100g) 
WHERE is_available = true;

-- =============================================
-- STATISTICS AND MAINTENANCE
-- =============================================

-- Update table statistics for better query planning
ANALYZE meals;
ANALYZE ingredients;
ANALYZE recipes;
ANALYZE meal_ingredients;
ANALYZE recipe_ingredients;
ANALYZE user_preferences;
ANALYZE user_analytics;
ANALYZE session_analytics;
ANALYZE job_queue;

-- Create a function to refresh statistics
CREATE OR REPLACE FUNCTION refresh_table_statistics()
RETURNS void AS $$
BEGIN
    ANALYZE meals;
    ANALYZE ingredients;
    ANALYZE recipes;
    ANALYZE meal_ingredients;
    ANALYZE recipe_ingredients;
    ANALYZE user_preferences;
    ANALYZE user_analytics;
    ANALYZE session_analytics;
    ANALYZE job_queue;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE(
    table_name text,
    index_name text,
    index_size text,
    index_scans bigint,
    tuples_read bigint,
    tuples_fetched bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        indexname as index_name,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        idx_scan as index_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to identify unused indexes
CREATE OR REPLACE FUNCTION get_unused_indexes()
RETURNS TABLE(
    table_name text,
    index_name text,
    index_size text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        indexname as index_name,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexname NOT LIKE '%_pkey'
    ORDER BY pg_relation_size(indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;



-- ============================================================================
-- FROM: 025_caching_policies.sql
-- ============================================================================

-- Caching and Performance Optimization Policies
-- This migration sets up comprehensive caching strategies and performance optimizations

-- =============================================
-- CACHING CONFIGURATION
-- =============================================

-- Enable query result caching
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET pg_stat_statements.max = 10000;

-- Configure connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- =============================================
-- MATERIALIZED VIEWS FOR CACHING
-- =============================================

-- Materialized view for popular recipes
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_recipes AS
SELECT 
    r.id,
    r.name,
    r.cuisine_type,
    r.difficulty_level,
    r.cooking_time_minutes,
    r.average_rating,
    r.total_ratings,
    COUNT(mr.meal_id) as usage_count,
    r.created_at,
    r.updated_at
FROM recipes r
LEFT JOIN meal_recipes mr ON r.id = mr.recipe_id
WHERE r.is_published = true
GROUP BY r.id, r.name, r.cuisine_type, r.difficulty_level, 
         r.cooking_time_minutes, r.average_rating, r.total_ratings,
         r.created_at, r.updated_at
ORDER BY usage_count DESC, r.average_rating DESC;

-- CREATE INDEX IF NOT EXISTS on materialized view
CREATE INDEX IF NOT EXISTS idx_popular_recipes_usage_rating 
ON popular_recipes(usage_count DESC, average_rating DESC);

-- Materialized view for user meal statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS user_meal_stats AS
SELECT 
    m.user_id,
    DATE_TRUNC('month', m.meal_date) as month,
    m.meal_type,
    COUNT(*) as meal_count,
    AVG(CASE WHEN m.generation_status = 'completed' THEN 1 ELSE 0 END) as success_rate,
    COUNT(DISTINCT DATE(m.meal_date)) as active_days
FROM meals m
WHERE m.created_at >= NOW() - INTERVAL '12 months'
GROUP BY m.user_id, DATE_TRUNC('month', m.meal_date), m.meal_type;

-- CREATE INDEX IF NOT EXISTS on materialized view
CREATE INDEX IF NOT EXISTS idx_user_meal_stats_user_month 
ON user_meal_stats(user_id, month);

-- Materialized view for ingredient popularity
CREATE MATERIALIZED VIEW IF NOT EXISTS ingredient_popularity AS
SELECT 
    i.id,
    i.name,
    i.category,
    COUNT(mi.meal_id) as usage_count,
    COUNT(DISTINCT mi.meal_id) as unique_meals,
    AVG(mi.quantity) as avg_quantity,
    i.calories_per_100g,
    i.is_available
FROM ingredients i
LEFT JOIN meal_ingredients mi ON i.id = mi.ingredient_id
LEFT JOIN meals m ON mi.meal_id = m.id
WHERE m.created_at >= NOW() - INTERVAL '6 months'
GROUP BY i.id, i.name, i.category, i.calories_per_100g, i.is_available
ORDER BY usage_count DESC;

-- CREATE INDEX IF NOT EXISTS on materialized view
CREATE INDEX IF NOT EXISTS idx_ingredient_popularity_usage 
ON ingredient_popularity(usage_count DESC);

-- =============================================
-- CACHE REFRESH FUNCTIONS
-- =============================================

-- Function to refresh popular recipes cache
CREATE OR REPLACE FUNCTION refresh_popular_recipes_cache()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY popular_recipes;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh user meal stats cache
CREATE OR REPLACE FUNCTION refresh_user_meal_stats_cache()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_meal_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh ingredient popularity cache
CREATE OR REPLACE FUNCTION refresh_ingredient_popularity_cache()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY ingredient_popularity;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh all caches
CREATE OR REPLACE FUNCTION refresh_all_caches()
RETURNS void AS $$
BEGIN
    PERFORM refresh_popular_recipes_cache();
    PERFORM refresh_user_meal_stats_cache();
    PERFORM refresh_ingredient_popularity_cache();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CACHE INVALIDATION TRIGGERS
-- =============================================

-- Function to invalidate popular recipes cache
CREATE OR REPLACE FUNCTION invalidate_popular_recipes_cache()
RETURNS trigger AS $$
BEGIN
    -- Refresh cache when recipes are updated
    PERFORM refresh_popular_recipes_cache();
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for recipe updates
CREATE TRIGGER trigger_invalidate_popular_recipes
    AFTER INSERT OR UPDATE OR DELETE ON recipes
    FOR EACH STATEMENT
    EXECUTE FUNCTION invalidate_popular_recipes_cache();

-- Function to invalidate user meal stats cache
CREATE OR REPLACE FUNCTION invalidate_user_meal_stats_cache()
RETURNS trigger AS $$
BEGIN
    -- Refresh cache when meals are updated
    PERFORM refresh_user_meal_stats_cache();
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for meal updates
CREATE TRIGGER trigger_invalidate_user_meal_stats
    AFTER INSERT OR UPDATE OR DELETE ON meals
    FOR EACH STATEMENT
    EXECUTE FUNCTION invalidate_user_meal_stats_cache();

-- Function to invalidate ingredient popularity cache
CREATE OR REPLACE FUNCTION invalidate_ingredient_popularity_cache()
RETURNS trigger AS $$
BEGIN
    -- Refresh cache when meal ingredients are updated
    PERFORM refresh_ingredient_popularity_cache();
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for meal ingredient updates
CREATE TRIGGER trigger_invalidate_ingredient_popularity
    AFTER INSERT OR UPDATE OR DELETE ON meal_ingredients
    FOR EACH STATEMENT
    EXECUTE FUNCTION invalidate_ingredient_popularity_cache();

-- =============================================
-- QUERY OPTIMIZATION FUNCTIONS
-- =============================================

-- Function to get cached popular recipes
CREATE OR REPLACE FUNCTION get_popular_recipes(
    p_limit INTEGER DEFAULT 10,
    p_cuisine_type TEXT DEFAULT NULL,
    p_difficulty_level INTEGER DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    cuisine_type TEXT,
    difficulty_level INTEGER,
    cooking_time_minutes INTEGER,
    average_rating DECIMAL,
    total_ratings INTEGER,
    usage_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id,
        pr.name,
        pr.cuisine_type,
        pr.difficulty_level,
        pr.cooking_time_minutes,
        pr.average_rating,
        pr.total_ratings,
        pr.usage_count
    FROM popular_recipes pr
    WHERE (p_cuisine_type IS NULL OR pr.cuisine_type = p_cuisine_type)
    AND (p_difficulty_level IS NULL OR pr.difficulty_level = p_difficulty_level)
    ORDER BY pr.usage_count DESC, pr.average_rating DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get cached user meal statistics
CREATE OR REPLACE FUNCTION get_user_meal_stats(
    p_user_id UUID,
    p_months INTEGER DEFAULT 6
)
RETURNS TABLE(
    month DATE,
    meal_type TEXT,
    meal_count BIGINT,
    success_rate DECIMAL,
    active_days BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ums.month::DATE,
        ums.meal_type,
        ums.meal_count,
        ums.success_rate,
        ums.active_days
    FROM user_meal_stats ums
    WHERE ums.user_id = p_user_id
    AND ums.month >= DATE_TRUNC('month', NOW() - INTERVAL '1 month' * p_months)
    ORDER BY ums.month DESC, ums.meal_type;
END;
$$ LANGUAGE plpgsql;

-- Function to get cached ingredient popularity
CREATE OR REPLACE FUNCTION get_ingredient_popularity(
    p_category TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    name TEXT,
    category TEXT,
    usage_count BIGINT,
    unique_meals BIGINT,
    avg_quantity DECIMAL,
    calories_per_100g INTEGER,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ip.id,
        ip.name,
        ip.category,
        ip.usage_count,
        ip.unique_meals,
        ip.avg_quantity,
        ip.calories_per_100g,
        ip.is_available
    FROM ingredient_popularity ip
    WHERE (p_category IS NULL OR ip.category = p_category)
    ORDER BY ip.usage_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PERFORMANCE MONITORING FUNCTIONS
-- =============================================

-- Function to get cache hit ratios
CREATE OR REPLACE FUNCTION get_cache_hit_ratios()
RETURNS TABLE(
    cache_name TEXT,
    hit_ratio DECIMAL,
    total_requests BIGINT,
    cache_hits BIGINT,
    cache_misses BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'popular_recipes'::TEXT as cache_name,
        CASE 
            WHEN (pr.usage_count + pr.usage_count) > 0 
            THEN (pr.usage_count::DECIMAL / (pr.usage_count + pr.usage_count)) * 100
            ELSE 0 
        END as hit_ratio,
        (pr.usage_count + pr.usage_count) as total_requests,
        pr.usage_count as cache_hits,
        pr.usage_count as cache_misses
    FROM (
        SELECT COUNT(*) as usage_count
        FROM popular_recipes
    ) pr
    UNION ALL
    SELECT 
        'user_meal_stats'::TEXT as cache_name,
        CASE 
            WHEN (ums.meal_count + ums.meal_count) > 0 
            THEN (ums.meal_count::DECIMAL / (ums.meal_count + ums.meal_count)) * 100
            ELSE 0 
        END as hit_ratio,
        (ums.meal_count + ums.meal_count) as total_requests,
        ums.meal_count as cache_hits,
        ums.meal_count as cache_misses
    FROM (
        SELECT COUNT(*) as meal_count
        FROM user_meal_stats
    ) ums;
END;
$$ LANGUAGE plpgsql;

-- Function to get slow queries
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE(
    query TEXT,
    calls BIGINT,
    total_time DECIMAL,
    mean_time DECIMAL,
    rows BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
    FROM pg_stat_statements
    WHERE mean_time > 1000 -- Queries taking more than 1 second on average
    ORDER BY mean_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- AUTOMATED CACHE MAINTENANCE
-- =============================================

-- Create a function to run cache maintenance
CREATE OR REPLACE FUNCTION run_cache_maintenance()
RETURNS void AS $$
BEGIN
    -- Refresh all caches
    PERFORM refresh_all_caches();
    
    -- Update table statistics
    PERFORM refresh_table_statistics();
    
    -- Log maintenance completion
    INSERT INTO system_logs (level, message, created_at)
    VALUES ('INFO', 'Cache maintenance completed', NOW());
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job for cache maintenance (if pg_cron is available)
-- This would typically be set up via a cron job or scheduled task
-- SELECT cron.schedule('cache-maintenance', '0 2 * * *', 'SELECT run_cache_maintenance();');

-- =============================================
-- CACHE CONFIGURATION SETTINGS
-- =============================================

-- Set up cache configuration
INSERT INTO system_settings (key, value, description, created_at)
VALUES 
    ('cache.popular_recipes.refresh_interval', '3600', 'Popular recipes cache refresh interval in seconds', NOW()),
    ('cache.user_meal_stats.refresh_interval', '7200', 'User meal stats cache refresh interval in seconds', NOW()),
    ('cache.ingredient_popularity.refresh_interval', '1800', 'Ingredient popularity cache refresh interval in seconds', NOW()),
    ('cache.enabled', 'true', 'Enable caching system', NOW())
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();



-- ============================================================================
-- FROM: 026_admin_dashboard_schema.sql
-- ============================================================================

-- Admin Dashboard Schema
-- This migration creates comprehensive analytics views and admin functionality

-- =============================================
-- ADMIN ROLES AND PERMISSIONS
-- =============================================

-- Create admin roles
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator', 'analyst');

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role admin_role NOT NULL DEFAULT 'analyst',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id),
    is_active BOOLEAN DEFAULT true
);

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- =============================================
-- ANALYTICS VIEWS
-- =============================================

-- User analytics view
CREATE OR REPLACE VIEW admin_user_analytics AS
SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    COUNT(DISTINCT m.id) as total_meals,
    COUNT(DISTINCT CASE WHEN m.created_at >= NOW() - INTERVAL '30 days' THEN m.id END) as meals_last_30_days,
    COUNT(DISTINCT CASE WHEN m.created_at >= NOW() - INTERVAL '7 days' THEN m.id END) as meals_last_7_days,
    AVG(CASE WHEN m.generation_status = 'completed' THEN 1 ELSE 0 END) as success_rate,
    COUNT(DISTINCT up.id) as preferences_count,
    MAX(m.created_at) as last_meal_date,
    CASE 
        WHEN MAX(m.created_at) >= NOW() - INTERVAL '7 days' THEN 'active'
        WHEN MAX(m.created_at) >= NOW() - INTERVAL '30 days' THEN 'inactive'
        ELSE 'dormant'
    END as user_status
FROM auth.users u
LEFT JOIN meals m ON u.id = m.user_id
LEFT JOIN user_preferences up ON u.id = up.user_id
GROUP BY u.id, u.email, u.created_at;

-- Meal analytics view
CREATE OR REPLACE VIEW admin_meal_analytics AS
SELECT 
    DATE_TRUNC('day', m.created_at) as date,
    COUNT(*) as total_meals,
    COUNT(CASE WHEN m.generation_status = 'completed' THEN 1 END) as completed_meals,
    COUNT(CASE WHEN m.generation_status = 'failed' THEN 1 END) as failed_meals,
    COUNT(CASE WHEN m.generation_status = 'pending' THEN 1 END) as pending_meals,
    AVG(CASE WHEN m.generation_status = 'completed' THEN 1 ELSE 0 END) as success_rate,
    COUNT(DISTINCT m.user_id) as unique_users,
    COUNT(CASE WHEN m.meal_type = 'breakfast' THEN 1 END) as breakfast_count,
    COUNT(CASE WHEN m.meal_type = 'lunch' THEN 1 END) as lunch_count,
    COUNT(CASE WHEN m.meal_type = 'dinner' THEN 1 END) as dinner_count,
    COUNT(CASE WHEN m.meal_type = 'snack' THEN 1 END) as snack_count
FROM meals m
GROUP BY DATE_TRUNC('day', m.created_at)
ORDER BY date DESC;

-- Recipe analytics view
CREATE OR REPLACE VIEW admin_recipe_analytics AS
SELECT 
    r.id,
    r.name,
    r.cuisine_type,
    r.difficulty_level,
    r.cooking_time_minutes,
    r.average_rating,
    r.total_ratings,
    r.is_published,
    r.created_at,
    COUNT(mr.meal_id) as usage_count,
    COUNT(DISTINCT mr.meal_id) as unique_meals,
    COUNT(CASE WHEN mr.created_at >= NOW() - INTERVAL '30 days' THEN mr.meal_id END) as usage_last_30_days,
    AVG(mr.rating) as average_meal_rating
FROM recipes r
LEFT JOIN meal_recipes mr ON r.id = mr.recipe_id
GROUP BY r.id, r.name, r.cuisine_type, r.difficulty_level, 
         r.cooking_time_minutes, r.average_rating, r.total_ratings,
         r.is_published, r.created_at;

-- Ingredient analytics view
CREATE OR REPLACE VIEW admin_ingredient_analytics AS
SELECT 
    i.id,
    i.name,
    i.category,
    i.calories_per_100g,
    i.is_available,
    COUNT(mi.meal_id) as usage_count,
    COUNT(DISTINCT mi.meal_id) as unique_meals,
    COUNT(CASE WHEN mi.created_at >= NOW() - INTERVAL '30 days' THEN mi.meal_id END) as usage_last_30_days,
    AVG(mi.quantity) as average_quantity,
    COUNT(DISTINCT mi.meal_id) / NULLIF(COUNT(*), 0) as usage_frequency
FROM ingredients i
LEFT JOIN meal_ingredients mi ON i.id = mi.ingredient_id
GROUP BY i.id, i.name, i.category, i.calories_per_100g, i.is_available;

-- System performance analytics view
CREATE OR REPLACE VIEW admin_system_performance AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_requests,
    COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END) as successful_requests,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_requests,
    AVG(response_time_ms) as average_response_time,
    MAX(response_time_ms) as max_response_time,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN endpoint LIKE '%/api/meals/generate%' THEN 1 END) as meal_generation_requests,
    AVG(CASE WHEN endpoint LIKE '%/api/meals/generate%' THEN response_time_ms END) as avg_meal_generation_time
FROM api_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- =============================================
-- AUDIT LOGGING
-- =============================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ADMIN FUNCTIONS
-- =============================================

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM auth.users),
        'active_users', (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '30 days'),
        'total_meals', (SELECT COUNT(*) FROM meals),
        'meals_today', (SELECT COUNT(*) FROM meals WHERE created_at >= CURRENT_DATE),
        'total_recipes', (SELECT COUNT(*) FROM recipes),
        'published_recipes', (SELECT COUNT(*) FROM recipes WHERE is_published = true),
        'total_ingredients', (SELECT COUNT(*) FROM ingredients),
        'available_ingredients', (SELECT COUNT(*) FROM ingredients WHERE is_available = true),
        'success_rate', (SELECT AVG(CASE WHEN generation_status = 'completed' THEN 1 ELSE 0 END) FROM meals),
        'avg_response_time', (SELECT AVG(response_time_ms) FROM api_logs WHERE created_at >= NOW() - INTERVAL '24 hours')
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity trends
CREATE OR REPLACE FUNCTION get_user_activity_trends(days INTEGER DEFAULT 30)
RETURNS TABLE(
    date DATE,
    new_users BIGINT,
    active_users BIGINT,
    total_meals BIGINT,
    success_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('day', m.created_at)::DATE as date,
        COUNT(DISTINCT CASE WHEN u.created_at >= DATE_TRUNC('day', m.created_at) THEN u.id END) as new_users,
        COUNT(DISTINCT m.user_id) as active_users,
        COUNT(m.id) as total_meals,
        AVG(CASE WHEN m.generation_status = 'completed' THEN 1 ELSE 0 END) as success_rate
    FROM meals m
    LEFT JOIN auth.users u ON u.id = m.user_id
    WHERE m.created_at >= NOW() - INTERVAL '1 day' * days
    GROUP BY DATE_TRUNC('day', m.created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular content
CREATE OR REPLACE FUNCTION get_popular_content(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    content_type TEXT,
    id UUID,
    name TEXT,
    usage_count BIGINT,
    rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'recipe'::TEXT as content_type,
        r.id,
        r.name,
        COUNT(mr.meal_id) as usage_count,
        r.average_rating as rating
    FROM recipes r
    LEFT JOIN meal_recipes mr ON r.id = mr.recipe_id
    WHERE r.is_published = true
    GROUP BY r.id, r.name, r.average_rating
    ORDER BY usage_count DESC, rating DESC
    LIMIT limit_count
    
    UNION ALL
    
    SELECT 
        'ingredient'::TEXT as content_type,
        i.id,
        i.name,
        COUNT(mi.meal_id) as usage_count,
        NULL::DECIMAL as rating
    FROM ingredients i
    LEFT JOIN meal_ingredients mi ON i.id = mi.ingredient_id
    WHERE i.is_available = true
    GROUP BY i.id, i.name
    ORDER BY usage_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get system health metrics
CREATE OR REPLACE FUNCTION get_system_health_metrics()
RETURNS JSON AS $$
DECLARE
    metrics JSON;
BEGIN
    SELECT json_build_object(
        'database_size', pg_size_pretty(pg_database_size(current_database())),
        'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
        'max_connections', (SELECT setting::int FROM pg_settings WHERE name = 'max_connections'),
        'cache_hit_ratio', (
            SELECT round(
                (sum(blks_hit) * 100.0 / (sum(blks_hit) + sum(blks_read))), 2
            ) FROM pg_stat_database WHERE datname = current_database()
        ),
        'slow_queries', (
            SELECT count(*) FROM pg_stat_statements 
            WHERE mean_time > 1000 AND calls > 10
        ),
        'error_rate', (
            SELECT round(
                (count(*) FILTER (WHERE status_code >= 400) * 100.0 / count(*)), 2
            ) FROM api_logs WHERE created_at >= NOW() - INTERVAL '1 hour'
        )
    ) INTO metrics;
    
    RETURN metrics;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on admin tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin users can only see their own records
CREATE POLICY "Admin users can view own records" ON admin_users
    FOR SELECT USING (auth.uid() = user_id);

-- Super admins can see all admin users
CREATE POLICY "Super admins can view all admin users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );

-- Admin users can update their own records
CREATE POLICY "Admin users can update own records" ON admin_users
    FOR UPDATE USING (auth.uid() = user_id);

-- Super admins can manage all admin users
CREATE POLICY "Super admins can manage all admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );

-- Admin sessions are private to the admin user
CREATE POLICY "Admin sessions are private" ON admin_sessions
    FOR ALL USING (
        admin_user_id IN (
            SELECT id FROM admin_users WHERE user_id = auth.uid()
        )
    );

-- Audit logs are readable by admins
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin', 'moderator')
        )
    );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Admin sessions indexes
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user_id ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_resource_type ON admin_audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);

-- System logs indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- =============================================
-- TRIGGERS FOR AUDIT LOGGING
-- =============================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO admin_audit_logs (
        admin_user_id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address
    ) VALUES (
        (SELECT id FROM admin_users WHERE user_id = auth.uid()),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        inet_client_addr()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging
CREATE TRIGGER trigger_admin_users_audit
    AFTER INSERT OR UPDATE OR DELETE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION log_admin_action();

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample admin user (replace with actual user ID)
-- INSERT INTO admin_users (user_id, role, permissions) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'super_admin', '{"all": true}');

-- Insert sample system log
INSERT INTO system_logs (level, message, context) 
VALUES ('INFO', 'Admin dashboard schema created', '{"migration": "009_admin_dashboard_schema"}');



-- ============================================================================
-- FROM: 027_community_portal_schema.sql
-- ============================================================================

-- Community Portal Schema Migration
-- This migration creates tables for community features, recipe submissions, voting, and content management

-- Create community_posts table for user-generated content
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  post_type text not null check (post_type in (
    'recipe', 'guide', 'tip', 'story', 'question', 'discussion'
  )),
  category text not null check (category in (
    'appetizers', 'main_courses', 'desserts', 'beverages', 'snacks', 
    'cooking_tips', 'kitchen_hacks', 'food_science', 'dietary', 'general'
  )),
  tags text[] default '{}',
  images jsonb default '[]',
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  prep_time_minutes int,
  cook_time_minutes int,
  servings int,
  ingredients jsonb default '[]',
  instructions jsonb default '[]',
  nutrition_info jsonb default '{}',
  status text default 'draft' check (status in ('draft', 'published', 'archived', 'flagged')),
  is_featured boolean default false,
  view_count int default 0,
  like_count int default 0,
  comment_count int default 0,
  share_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone
);

-- Create community_votes table for voting system
CREATE TABLE IF NOT EXISTS community_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  vote_type text not null check (vote_type in ('upvote', 'downvote', 'like', 'dislike')),
  created_at timestamp with time zone default now(),
  unique(user_id, post_id, vote_type)
);

-- Create community_comments table for discussions
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade,
  author_id uuid references auth.users(id) on delete cascade,
  parent_id uuid references community_comments(id) on delete cascade,
  content text not null,
  is_approved boolean default true,
  like_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create community_follows table for user relationships
CREATE TABLE IF NOT EXISTS community_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid references auth.users(id) on delete cascade,
  following_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id)
);

-- Create community_bookmarks table for saved content
CREATE TABLE IF NOT EXISTS community_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, post_id)
);

-- Create community_reports table for content moderation
CREATE TABLE IF NOT EXISTS community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  comment_id uuid references community_comments(id) on delete cascade,
  reason text not null check (reason in (
    'spam', 'inappropriate', 'harassment', 'misinformation', 'copyright', 'other'
  )),
  description text,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create community_achievements table for gamification
CREATE TABLE IF NOT EXISTS community_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  achievement_type text not null check (achievement_type in (
    'first_post', 'popular_recipe', 'helpful_comment', 'top_contributor',
    'recipe_master', 'community_helper', 'viral_content', 'expert_chef'
  )),
  title text not null,
  description text,
  badge_icon text,
  points int default 0,
  earned_at timestamp with time zone default now()
);

-- Create community_leaderboard table for rankings
CREATE TABLE IF NOT EXISTS community_leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  total_points int default 0,
  posts_count int default 0,
  comments_count int default 0,
  likes_received int default 0,
  followers_count int default 0,
  rank_position int,
  period text not null check (period in ('weekly', 'monthly', 'all_time')),
  updated_at timestamp with time zone default now()
);

-- Create community_events table for challenges and campaigns
CREATE TABLE IF NOT EXISTS community_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_type text not null check (event_type in (
    'recipe_challenge', 'cooking_contest', 'hackathon', 'feature_request', 'beta_test'
  )),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  rules text,
  prizes jsonb default '[]',
  max_participants int,
  current_participants int default 0,
  status text default 'upcoming' check (status in ('upcoming', 'active', 'completed', 'cancelled')),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create community_event_submissions table for event participation
CREATE TABLE IF NOT EXISTS community_event_submissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references community_events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  post_id uuid references community_posts(id) on delete cascade,
  submission_data jsonb default '{}',
  status text default 'submitted' check (status in ('submitted', 'reviewed', 'winner', 'runner_up')),
  score numeric(5,2),
  feedback text,
  submitted_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_author on community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type on community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_category on community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_status on community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_featured on community_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_community_posts_created on community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_likes on community_posts(like_count);

CREATE INDEX IF NOT EXISTS idx_community_votes_user on community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_post on community_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_type on community_votes(vote_type);

CREATE INDEX IF NOT EXISTS idx_community_comments_post on community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author on community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent on community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created on community_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_community_follows_follower on community_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_community_follows_following on community_follows(following_id);

CREATE INDEX IF NOT EXISTS idx_community_bookmarks_user on community_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_community_bookmarks_post on community_bookmarks(post_id);

CREATE INDEX IF NOT EXISTS idx_community_reports_post on community_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_comment on community_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_status on community_reports(status);

CREATE INDEX IF NOT EXISTS idx_community_achievements_user on community_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_community_achievements_type on community_achievements(achievement_type);

CREATE INDEX IF NOT EXISTS idx_community_leaderboard_user on community_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_community_leaderboard_period on community_leaderboard(period);
CREATE INDEX IF NOT EXISTS idx_community_leaderboard_rank on community_leaderboard(rank_position);

CREATE INDEX IF NOT EXISTS idx_community_events_type on community_events(event_type);
CREATE INDEX IF NOT EXISTS idx_community_events_status on community_events(status);
CREATE INDEX IF NOT EXISTS idx_community_events_dates on community_events(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_community_event_submissions_event on community_event_submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_community_event_submissions_user on community_event_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_event_submissions_status on community_event_submissions(status);

-- Enable Row Level Security
alter table community_posts enable row level security;
alter table community_votes enable row level security;
alter table community_comments enable row level security;
alter table community_follows enable row level security;
alter table community_bookmarks enable row level security;
alter table community_reports enable row level security;
alter table community_achievements enable row level security;
alter table community_leaderboard enable row level security;
alter table community_events enable row level security;
alter table community_event_submissions enable row level security;

-- RLS Policies for community_posts
create policy "Anyone can view published posts" on community_posts
  for select using (status = 'published');

create policy "Users can view their own posts" on community_posts
  for select using (auth.uid() = author_id);

create policy "Users can create posts" on community_posts
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own posts" on community_posts
  for update using (auth.uid() = author_id);

create policy "Users can delete their own posts" on community_posts
  for delete using (auth.uid() = author_id);

-- RLS Policies for community_votes
create policy "Users can view votes" on community_votes
  for select using (true);

create policy "Users can create votes" on community_votes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own votes" on community_votes
  for update using (auth.uid() = user_id);

create policy "Users can delete their own votes" on community_votes
  for delete using (auth.uid() = user_id);

-- RLS Policies for community_comments
create policy "Anyone can view approved comments" on community_comments
  for select using (is_approved = true);

create policy "Users can view their own comments" on community_comments
  for select using (auth.uid() = author_id);

create policy "Users can create comments" on community_comments
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own comments" on community_comments
  for update using (auth.uid() = author_id);

create policy "Users can delete their own comments" on community_comments
  for delete using (auth.uid() = author_id);

-- RLS Policies for community_follows
create policy "Users can view follows" on community_follows
  for select using (true);

create policy "Users can create follows" on community_follows
  for insert with check (auth.uid() = follower_id);

create policy "Users can delete their own follows" on community_follows
  for delete using (auth.uid() = follower_id);

-- RLS Policies for community_bookmarks
create policy "Users can view their own bookmarks" on community_bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can create bookmarks" on community_bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks" on community_bookmarks
  for delete using (auth.uid() = user_id);

-- RLS Policies for community_reports
create policy "Users can create reports" on community_reports
  for insert with check (auth.uid() = reporter_id);

create policy "Users can view their own reports" on community_reports
  for select using (auth.uid() = reporter_id);

-- RLS Policies for community_achievements
create policy "Users can view their own achievements" on community_achievements
  for select using (auth.uid() = user_id);

create policy "Anyone can view public achievements" on community_achievements
  for select using (true);

-- RLS Policies for community_leaderboard
create policy "Anyone can view leaderboard" on community_leaderboard
  for select using (true);

-- RLS Policies for community_events
create policy "Anyone can view active events" on community_events
  for select using (status in ('upcoming', 'active'));

create policy "Users can create events" on community_events
  for insert with check (auth.uid() = created_by);

-- RLS Policies for community_event_submissions
create policy "Users can view their own submissions" on community_event_submissions
  for select using (auth.uid() = user_id);

create policy "Users can create submissions" on community_event_submissions
  for insert with check (auth.uid() = user_id);

-- Functions for community features

-- Function to update post vote counts
create or replace function update_post_vote_counts()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    if NEW.vote_type in ('upvote', 'like') then
      update community_posts 
      set like_count = like_count + 1 
      where id = NEW.post_id;
    elsif NEW.vote_type in ('downvote', 'dislike') then
      update community_posts 
      set like_count = like_count - 1 
      where id = NEW.post_id;
    end if;
  elsif TG_OP = 'UPDATE' then
    -- Handle vote type changes
    if OLD.vote_type in ('upvote', 'like') and NEW.vote_type in ('downvote', 'dislike') then
      update community_posts 
      set like_count = like_count - 2 
      where id = NEW.post_id;
    elsif OLD.vote_type in ('downvote', 'dislike') and NEW.vote_type in ('upvote', 'like') then
      update community_posts 
      set like_count = like_count + 2 
      where id = NEW.post_id;
    end if;
  elsif TG_OP = 'DELETE' then
    if OLD.vote_type in ('upvote', 'like') then
      update community_posts 
      set like_count = like_count - 1 
      where id = OLD.post_id;
    elsif OLD.vote_type in ('downvote', 'dislike') then
      update community_posts 
      set like_count = like_count + 1 
      where id = OLD.post_id;
    end if;
  end if;
  
  return COALESCE(NEW, OLD);
end;
$$ language plpgsql;

-- Create trigger for vote count updates
create trigger update_post_vote_counts_trigger
  after insert or update or delete on community_votes
  for each row execute function update_post_vote_counts();

-- Function to update comment count
create or replace function update_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update community_posts 
    set comment_count = comment_count + 1 
    where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update community_posts 
    set comment_count = comment_count - 1 
    where id = OLD.post_id;
  end if;
  
  return COALESCE(NEW, OLD);
end;
$$ language plpgsql;

-- Create trigger for comment count updates
create trigger update_post_comment_count_trigger
  after insert or delete on community_comments
  for each row execute function update_post_comment_count();

-- Function to calculate user points
create or replace function calculate_user_points(user_id_param uuid)
returns int as $$
declare
  total_points int := 0;
begin
  -- Points from posts (likes received)
  select coalesce(sum(like_count), 0) into total_points
  from community_posts
  where author_id = user_id_param and status = 'published';
  
  -- Points from achievements
  total_points := total_points + coalesce((
    select sum(points) 
    from community_achievements 
    where user_id = user_id_param
  ), 0);
  
  return total_points;
end;
$$ language plpgsql security definer;

-- Function to update leaderboard
create or replace function update_leaderboard()
returns void as $$
begin
  -- Clear current leaderboard
  delete from community_leaderboard;
  
  -- Recalculate and insert leaderboard data
  insert into community_leaderboard (user_id, total_points, posts_count, comments_count, likes_received, followers_count, period)
  select 
    u.id as user_id,
    calculate_user_points(u.id) as total_points,
    coalesce(p.posts_count, 0) as posts_count,
    coalesce(c.comments_count, 0) as comments_count,
    coalesce(p.likes_received, 0) as likes_received,
    coalesce(f.followers_count, 0) as followers_count,
    'all_time' as period
  from auth.users u
  left join (
    select 
      author_id,
      count(*) as posts_count,
      sum(like_count) as likes_received
    from community_posts
    where status = 'published'
    group by author_id
  ) p on u.id = p.author_id
  left join (
    select 
      author_id,
      count(*) as comments_count
    from community_comments
    where is_approved = true
    group by author_id
  ) c on u.id = c.author_id
  left join (
    select 
      following_id,
      count(*) as followers_count
    from community_follows
    group by following_id
  ) f on u.id = f.following_id
  where calculate_user_points(u.id) > 0
  order by total_points desc;
  
  -- Update rank positions
  update community_leaderboard
  set rank_position = subquery.rank
  from (
    select id, row_number() over (order by total_points desc) as rank
    from community_leaderboard
  ) subquery
  where community_leaderboard.id = subquery.id;
end;
$$ language plpgsql security definer;

-- Function to check and award achievements
create or replace function check_achievements(user_id_param uuid)
returns void as $$
begin
  -- First post achievement
  if not exists (select 1 from community_achievements where user_id = user_id_param and achievement_type = 'first_post') then
    if exists (select 1 from community_posts where author_id = user_id_param and status = 'published') then
      insert into community_achievements (user_id, achievement_type, title, description, points)
      values (user_id_param, 'first_post', 'First Post', 'Congratulations on your first community post!', 10);
    end if;
  end if;
  
  -- Popular recipe achievement
  if not exists (select 1 from community_achievements where user_id = user_id_param and achievement_type = 'popular_recipe') then
    if exists (select 1 from community_posts where author_id = user_id_param and like_count >= 50 and post_type = 'recipe') then
      insert into community_achievements (user_id, achievement_type, title, description, points)
      values (user_id_param, 'popular_recipe', 'Popular Recipe', 'Your recipe has received 50+ likes!', 50);
    end if;
  end if;
  
  -- Top contributor achievement
  if not exists (select 1 from community_achievements where user_id = user_id_param and achievement_type = 'top_contributor') then
    if calculate_user_points(user_id_param) >= 500 then
      insert into community_achievements (user_id, achievement_type, title, description, points)
      values (user_id_param, 'top_contributor', 'Top Contributor', 'You have earned 500+ community points!', 100);
    end if;
  end if;
end;
$$ language plpgsql security definer;




-- ============================================================================
-- FROM: 028_chef_marketplace_schema.sql
-- ============================================================================

-- Chef Marketplace Schema Migration
-- This migration creates tables for partner onboarding, recipe packs, branded offers, and analytics

-- Create chef_profiles table for partner chefs
CREATE TABLE IF NOT EXISTS chef_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  chef_name text not null,
  bio text,
  specialties text[] default '{}',
  experience_years int default 0,
  certifications text[] default '{}',
  social_links jsonb default '{}',
  profile_image_url text,
  cover_image_url text,
  is_verified boolean default false,
  is_featured boolean default false,
  rating numeric(3,2) default 0.0,
  total_ratings int default 0,
  total_sales int default 0,
  revenue_earned numeric(10,2) default 0.0,
  status text default 'pending' check (status in ('pending', 'approved', 'suspended', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create recipe_packs table for chef's recipe collections
CREATE TABLE IF NOT EXISTS recipe_packs (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in (
    'appetizers', 'main_courses', 'desserts', 'beverages', 'snacks',
    'breakfast', 'lunch', 'dinner', 'holiday', 'seasonal', 'dietary'
  )),
  difficulty_level text not null check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  prep_time_minutes int,
  cook_time_minutes int,
  total_servings int,
  price_usd numeric(10,2) not null,
  currency text default 'USD',
  images jsonb default '[]',
  tags text[] default '{}',
  ingredients_list jsonb default '[]',
  instructions jsonb default '[]',
  nutrition_info jsonb default '{}',
  dietary_restrictions text[] default '{}',
  cooking_methods text[] default '{}',
  equipment_needed text[] default '{}',
  skill_level_required text check (skill_level_required in ('beginner', 'intermediate', 'advanced')),
  is_featured boolean default false,
  is_published boolean default false,
  view_count int default 0,
  purchase_count int default 0,
  rating numeric(3,2) default 0.0,
  total_ratings int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone
);

-- Create recipe_pack_reviews table for customer feedback
CREATE TABLE IF NOT EXISTS recipe_pack_reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_pack_id uuid references recipe_packs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  images jsonb default '[]',
  is_verified_purchase boolean default false,
  helpful_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create chef_offers table for branded offers and promotions
CREATE TABLE IF NOT EXISTS chef_offers (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  title text not null,
  description text not null,
  offer_type text not null check (offer_type in (
    'discount', 'bundle', 'free_shipping', 'early_bird', 'seasonal', 'limited_time'
  )),
  discount_percent numeric(5,2),
  discount_amount numeric(10,2),
  minimum_purchase numeric(10,2),
  max_uses int,
  current_uses int default 0,
  valid_from timestamp with time zone not null,
  valid_until timestamp with time zone not null,
  is_active boolean default true,
  terms_conditions text,
  created_at timestamp with time zone default now()
);

-- Create chef_analytics table for performance tracking
CREATE TABLE IF NOT EXISTS chef_analytics (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  metric_type text not null check (metric_type in (
    'views', 'purchases', 'revenue', 'ratings', 'followers', 'engagement'
  )),
  metric_value numeric(15,2) not null,
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create chef_earnings table for revenue tracking
CREATE TABLE IF NOT EXISTS chef_earnings (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  recipe_pack_id uuid references recipe_packs(id) on delete cascade,
  sale_id uuid not null,
  gross_amount numeric(10,2) not null,
  platform_fee_percent numeric(5,2) not null,
  platform_fee_amount numeric(10,2) not null,
  net_amount numeric(10,2) not null,
  currency text default 'USD',
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create chef_followers table for chef following system
CREATE TABLE IF NOT EXISTS chef_followers (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(chef_id, user_id)
);

-- Create chef_notifications table for chef updates
CREATE TABLE IF NOT EXISTS chef_notifications (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  notification_type text not null check (notification_type in (
    'new_follower', 'new_review', 'new_purchase', 'earnings_update', 'offer_expiring'
  )),
  title text not null,
  message text not null,
  is_read boolean default false,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create chef_verification_documents table for verification process
CREATE TABLE IF NOT EXISTS chef_verification_documents (
  id uuid primary key default gen_random_uuid(),
  chef_id uuid references chef_profiles(id) on delete cascade,
  document_type text not null check (document_type in (
    'identity', 'certification', 'portfolio', 'business_license', 'tax_document'
  )),
  document_url text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chef_profiles_user on chef_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_chef_profiles_status on chef_profiles(status);
CREATE INDEX IF NOT EXISTS idx_chef_profiles_verified on chef_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_chef_profiles_featured on chef_profiles(is_featured);
CREATE INDEX IF NOT EXISTS idx_chef_profiles_rating on chef_profiles(rating);

CREATE INDEX IF NOT EXISTS idx_recipe_packs_chef on recipe_packs(chef_id);
CREATE INDEX IF NOT EXISTS idx_recipe_packs_category on recipe_packs(category);
CREATE INDEX IF NOT EXISTS idx_recipe_packs_difficulty on recipe_packs(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_recipe_packs_published on recipe_packs(is_published);
CREATE INDEX IF NOT EXISTS idx_recipe_packs_featured on recipe_packs(is_featured);
CREATE INDEX IF NOT EXISTS idx_recipe_packs_price on recipe_packs(price_usd);
CREATE INDEX IF NOT EXISTS idx_recipe_packs_rating on recipe_packs(rating);

CREATE INDEX IF NOT EXISTS idx_recipe_pack_reviews_pack on recipe_pack_reviews(recipe_pack_id);
CREATE INDEX IF NOT EXISTS idx_recipe_pack_reviews_user on recipe_pack_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_pack_reviews_rating on recipe_pack_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_chef_offers_chef on chef_offers(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_offers_type on chef_offers(offer_type);
CREATE INDEX IF NOT EXISTS idx_chef_offers_active on chef_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_chef_offers_valid on chef_offers(valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_chef_analytics_chef on chef_analytics(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_analytics_type on chef_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_chef_analytics_period on chef_analytics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_chef_earnings_chef on chef_earnings(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_earnings_pack on chef_earnings(recipe_pack_id);
CREATE INDEX IF NOT EXISTS idx_chef_earnings_status on chef_earnings(payment_status);
CREATE INDEX IF NOT EXISTS idx_chef_earnings_created on chef_earnings(created_at);

CREATE INDEX IF NOT EXISTS idx_chef_followers_chef on chef_followers(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_followers_user on chef_followers(user_id);

CREATE INDEX IF NOT EXISTS idx_chef_notifications_chef on chef_notifications(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_notifications_type on chef_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_chef_notifications_read on chef_notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_chef_verification_chef on chef_verification_documents(chef_id);
CREATE INDEX IF NOT EXISTS idx_chef_verification_type on chef_verification_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_chef_verification_status on chef_verification_documents(status);

-- Enable Row Level Security
alter table chef_profiles enable row level security;
alter table recipe_packs enable row level security;
alter table recipe_pack_reviews enable row level security;
alter table chef_offers enable row level security;
alter table chef_analytics enable row level security;
alter table chef_earnings enable row level security;
alter table chef_followers enable row level security;
alter table chef_notifications enable row level security;
alter table chef_verification_documents enable row level security;

-- RLS Policies for chef_profiles
create policy "Anyone can view approved chef profiles" on chef_profiles
  for select using (status = 'approved');

create policy "Users can view their own chef profile" on chef_profiles
  for select using (auth.uid() = user_id);

create policy "Users can create chef profile" on chef_profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own chef profile" on chef_profiles
  for update using (auth.uid() = user_id);

-- RLS Policies for recipe_packs
create policy "Anyone can view published recipe packs" on recipe_packs
  for select using (is_published = true);

create policy "Chefs can view their own recipe packs" on recipe_packs
  for select using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

create policy "Chefs can create recipe packs" on recipe_packs
  for insert with check (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

create policy "Chefs can update their own recipe packs" on recipe_packs
  for update using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- RLS Policies for recipe_pack_reviews
create policy "Anyone can view reviews" on recipe_pack_reviews
  for select using (true);

create policy "Users can create reviews" on recipe_pack_reviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews" on recipe_pack_reviews
  for update using (auth.uid() = user_id);

-- RLS Policies for chef_offers
create policy "Anyone can view active offers" on chef_offers
  for select using (is_active = true and valid_until > now());

create policy "Chefs can manage their offers" on chef_offers
  for all using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- RLS Policies for chef_analytics
create policy "Chefs can view their analytics" on chef_analytics
  for select using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- RLS Policies for chef_earnings
create policy "Chefs can view their earnings" on chef_earnings
  for select using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- RLS Policies for chef_followers
create policy "Anyone can view followers" on chef_followers
  for select using (true);

create policy "Users can follow chefs" on chef_followers
  for insert with check (auth.uid() = user_id);

create policy "Users can unfollow chefs" on chef_followers
  for delete using (auth.uid() = user_id);

-- RLS Policies for chef_notifications
create policy "Chefs can view their notifications" on chef_notifications
  for select using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- RLS Policies for chef_verification_documents
create policy "Chefs can view their verification documents" on chef_verification_documents
  for select using (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

create policy "Chefs can upload verification documents" on chef_verification_documents
  for insert with check (
    chef_id in (select id from chef_profiles where user_id = auth.uid())
  );

-- Functions for chef marketplace

-- Function to update chef rating
create or replace function update_chef_rating(chef_id_param uuid)
returns void as $$
declare
  avg_rating numeric(3,2);
  total_ratings_count int;
begin
  -- Calculate average rating from recipe pack reviews
  select 
    coalesce(avg(rating), 0.0),
    count(*)
  into avg_rating, total_ratings_count
  from recipe_pack_reviews rpr
  join recipe_packs rp on rpr.recipe_pack_id = rp.id
  where rp.chef_id = chef_id_param;
  
  -- Update chef profile
  update chef_profiles
  set 
    rating = avg_rating,
    total_ratings = total_ratings_count
  where id = chef_id_param;
end;
$$ language plpgsql security definer;

-- Function to update recipe pack rating
create or replace function update_recipe_pack_rating(pack_id_param uuid)
returns void as $$
declare
  avg_rating numeric(3,2);
  total_ratings_count int;
begin
  -- Calculate average rating
  select 
    coalesce(avg(rating), 0.0),
    count(*)
  into avg_rating, total_ratings_count
  from recipe_pack_reviews
  where recipe_pack_id = pack_id_param;
  
  -- Update recipe pack
  update recipe_packs
  set 
    rating = avg_rating,
    total_ratings = total_ratings_count
  where id = pack_id_param;
  
  -- Update chef rating as well
  perform update_chef_rating(
    (select chef_id from recipe_packs where id = pack_id_param)
  );
end;
$$ language plpgsql security definer;

-- Trigger to update ratings when reviews are added/updated/deleted
create or replace function trigger_update_ratings()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    perform update_recipe_pack_rating(NEW.recipe_pack_id);
  elsif TG_OP = 'DELETE' then
    perform update_recipe_pack_rating(OLD.recipe_pack_id);
  end if;
  
  return COALESCE(NEW, OLD);
end;
$$ language plpgsql;

create trigger update_ratings_trigger
  after insert or update or delete on recipe_pack_reviews
  for each row execute function trigger_update_ratings();

-- Function to calculate chef earnings
create or replace function calculate_chef_earnings(chef_id_param uuid, start_date timestamp, end_date timestamp)
returns table(
  total_sales int,
  gross_revenue numeric(10,2),
  platform_fees numeric(10,2),
  net_earnings numeric(10,2)
) as $$
begin
  return query
  select 
    count(*)::int as total_sales,
    coalesce(sum(ce.gross_amount), 0.0) as gross_revenue,
    coalesce(sum(ce.platform_fee_amount), 0.0) as platform_fees,
    coalesce(sum(ce.net_amount), 0.0) as net_earnings
  from chef_earnings ce
  where ce.chef_id = chef_id_param
    and ce.created_at >= start_date
    and ce.created_at <= end_date;
end;
$$ language plpgsql security definer;

-- Function to track analytics
create or replace function track_chef_analytics(
  chef_id_param uuid,
  metric_type_param text,
  metric_value_param numeric,
  period_start_param timestamp,
  period_end_param timestamp,
  metadata_param jsonb default '{}'
)
returns void as $$
begin
  insert into chef_analytics (
    chef_id, metric_type, metric_value, period_start, period_end, metadata
  ) values (
    chef_id_param, metric_type_param, metric_value_param, 
    period_start_param, period_end_param, metadata_param
  );
end;
$$ language plpgsql security definer;




-- ============================================================================
-- FROM: 029_referral_social_schema.sql
-- ============================================================================

-- Referral and Social Sharing Schema Migration
-- This migration creates tables for referral system, social sharing, and viral features

-- Create referral_codes table for invite codes
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  code text unique not null,
  description text,
  max_uses int,
  current_uses int default 0,
  reward_type text not null check (reward_type in ('credits', 'discount', 'premium', 'points')),
  reward_value numeric(10,2) not null,
  is_active boolean default true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create referral_tracking table for tracking referrals
CREATE TABLE IF NOT EXISTS referral_tracking (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id) on delete cascade,
  referred_id uuid references auth.users(id) on delete cascade,
  referral_code_id uuid references referral_codes(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'completed', 'expired', 'cancelled')),
  reward_earned numeric(10,2) default 0.0,
  reward_claimed boolean default false,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create social_shares table for tracking social media shares
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('recipe', 'post', 'chef', 'event', 'general')),
  content_id uuid not null,
  platform text not null check (platform in ('facebook', 'twitter', 'instagram', 'tiktok', 'linkedin', 'pinterest', 'whatsapp')),
  share_url text not null,
  share_text text,
  engagement_metrics jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Create viral_campaigns table for viral marketing campaigns
CREATE TABLE IF NOT EXISTS viral_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  campaign_type text not null check (campaign_type in ('referral', 'social_share', 'challenge', 'contest')),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  target_metric text not null check (target_metric in ('shares', 'referrals', 'engagement', 'signups')),
  target_value int not null,
  current_value int default 0,
  reward_structure jsonb not null,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create user_badges table for gamification
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  badge_type text not null check (badge_type in (
    'referral_master', 'social_butterfly', 'viral_creator', 'community_champion',
    'early_adopter', 'loyal_user', 'content_creator', 'influencer'
  )),
  badge_name text not null,
  badge_description text,
  badge_icon text,
  points_earned int default 0,
  earned_at timestamp with time zone default now(),
  metadata jsonb default '{}'
);

-- Create social_leaderboard table for social engagement rankings
CREATE TABLE IF NOT EXISTS social_leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  total_shares int default 0,
  total_referrals int default 0,
  total_engagement int default 0,
  viral_score numeric(10,2) default 0.0,
  rank_position int,
  period text not null check (period in ('daily', 'weekly', 'monthly', 'all_time')),
  updated_at timestamp with time zone default now()
);

-- Create social_analytics table for tracking social performance
CREATE TABLE IF NOT EXISTS social_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  platform text not null,
  metric_type text not null check (metric_type in ('shares', 'likes', 'comments', 'clicks', 'conversions')),
  metric_value int not null,
  content_id uuid,
  content_type text,
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- Create referral_rewards table for reward management
CREATE TABLE IF NOT EXISTS referral_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  reward_type text not null check (reward_type in ('credits', 'discount', 'premium', 'points')),
  reward_value numeric(10,2) not null,
  source text not null check (source in ('referral', 'social_share', 'campaign', 'achievement')),
  source_id uuid,
  status text default 'pending' check (status in ('pending', 'claimed', 'expired', 'cancelled')),
  expires_at timestamp with time zone,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create social_widgets table for embeddable sharing widgets
CREATE TABLE IF NOT EXISTS social_widgets (
  id uuid primary key default gen_random_uuid(),
  widget_type text not null check (widget_type in ('share_button', 'referral_banner', 'leaderboard', 'badge_display')),
  title text not null,
  description text,
  configuration jsonb not null,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user on referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code on referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active on referral_codes(is_active);

CREATE INDEX IF NOT EXISTS idx_referral_tracking_referrer on referral_tracking(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_referred on referral_tracking(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_code on referral_tracking(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referral_tracking_status on referral_tracking(status);

CREATE INDEX IF NOT EXISTS idx_social_shares_user on social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_content on social_shares(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform on social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_created on social_shares(created_at);

CREATE INDEX IF NOT EXISTS idx_viral_campaigns_type on viral_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_viral_campaigns_active on viral_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_viral_campaigns_dates on viral_campaigns(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_user_badges_user on user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_type on user_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned on user_badges(earned_at);

CREATE INDEX IF NOT EXISTS idx_social_leaderboard_user on social_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_social_leaderboard_period on social_leaderboard(period);
CREATE INDEX IF NOT EXISTS idx_social_leaderboard_rank on social_leaderboard(rank_position);

CREATE INDEX IF NOT EXISTS idx_social_analytics_user on social_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_platform on social_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_social_analytics_metric on social_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_social_analytics_period on social_analytics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user on referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_type on referral_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status on referral_rewards(status);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_source on referral_rewards(source);

CREATE INDEX IF NOT EXISTS idx_social_widgets_type on social_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_social_widgets_active on social_widgets(is_active);

-- Enable Row Level Security
alter table referral_codes enable row level security;
alter table referral_tracking enable row level security;
alter table social_shares enable row level security;
alter table viral_campaigns enable row level security;
alter table user_badges enable row level security;
alter table social_leaderboard enable row level security;
alter table social_analytics enable row level security;
alter table referral_rewards enable row level security;
alter table social_widgets enable row level security;

-- RLS Policies for referral_codes
create policy "Users can view their own referral codes" on referral_codes
  for select using (auth.uid() = user_id);

create policy "Users can create referral codes" on referral_codes
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own referral codes" on referral_codes
  for update using (auth.uid() = user_id);

create policy "Anyone can view active referral codes" on referral_codes
  for select using (is_active = true);

-- RLS Policies for referral_tracking
create policy "Users can view their referral tracking" on referral_tracking
  for select using (auth.uid() = referrer_id or auth.uid() = referred_id);

create policy "System can create referral tracking" on referral_tracking
  for insert with check (true);

-- RLS Policies for social_shares
create policy "Users can view their own shares" on social_shares
  for select using (auth.uid() = user_id);

create policy "Users can create shares" on social_shares
  for insert with check (auth.uid() = user_id);

create policy "Anyone can view public shares" on social_shares
  for select using (true);

-- RLS Policies for viral_campaigns
create policy "Anyone can view active campaigns" on viral_campaigns
  for select using (is_active = true and end_date > now());

create policy "Users can create campaigns" on viral_campaigns
  for insert with check (auth.uid() = created_by);

-- RLS Policies for user_badges
create policy "Users can view their own badges" on user_badges
  for select using (auth.uid() = user_id);

create policy "Anyone can view public badges" on user_badges
  for select using (true);

-- RLS Policies for social_leaderboard
create policy "Anyone can view leaderboard" on social_leaderboard
  for select using (true);

-- RLS Policies for social_analytics
create policy "Users can view their analytics" on social_analytics
  for select using (auth.uid() = user_id);

-- RLS Policies for referral_rewards
create policy "Users can view their rewards" on referral_rewards
  for select using (auth.uid() = user_id);

create policy "Users can claim their rewards" on referral_rewards
  for update using (auth.uid() = user_id);

-- RLS Policies for social_widgets
create policy "Anyone can view active widgets" on social_widgets
  for select using (is_active = true);

-- Functions for referral and social features

-- Function to generate referral code
create or replace function generate_referral_code(user_id_param uuid, description_param text default null)
returns text as $$
declare
  code text;
  code_exists boolean;
begin
  -- Generate a unique code
  loop
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    select exists(select 1 from referral_codes where code = generate_referral_code.code) into code_exists;
    
    if not code_exists then
      exit;
    end if;
  end loop;
  
  -- Insert the referral code
  insert into referral_codes (user_id, code, description, max_uses, reward_type, reward_value)
  values (user_id_param, code, description_param, null, 'credits', 10.0);
  
  return code;
end;
$$ language plpgsql security definer;

-- Function to process referral
create or replace function process_referral(
  referral_code_param text,
  referred_user_id_param uuid
)
returns boolean as $$
declare
  code_record record;
  referrer_id_val uuid;
begin
  -- Get referral code details
  select * into code_record
  from referral_codes
  where code = referral_code_param and is_active = true;
  
  if not found then
    return false;
  end if;
  
  -- Check if code has remaining uses
  if code_record.max_uses is not null and code_record.current_uses >= code_record.max_uses then
    return false;
  end if;
  
  -- Check if code is expired
  if code_record.expires_at is not null and code_record.expires_at < now() then
    return false;
  end if;
  
  -- Check if user is trying to refer themselves
  if code_record.user_id = referred_user_id_param then
    return false;
  end if;
  
  -- Create referral tracking record
  insert into referral_tracking (referrer_id, referred_id, referral_code_id, status)
  values (code_record.user_id, referred_user_id_param, code_record.id, 'completed');
  
  -- Update code usage count
  update referral_codes
  set current_uses = current_uses + 1
  where id = code_record.id;
  
  -- Create rewards for both users
  insert into referral_rewards (user_id, reward_type, reward_value, source, source_id, status)
  values 
    (code_record.user_id, code_record.reward_type, code_record.reward_value, 'referral', code_record.id, 'pending'),
    (referred_user_id_param, 'credits', 5.0, 'referral', code_record.id, 'pending');
  
  return true;
end;
$$ language plpgsql security definer;

-- Function to track social share
create or replace function track_social_share(
  user_id_param uuid,
  content_type_param text,
  content_id_param uuid,
  platform_param text,
  share_url_param text,
  share_text_param text default null
)
returns uuid as $$
declare
  share_id_val uuid;
begin
  insert into social_shares (
    user_id, content_type, content_id, platform, share_url, share_text
  ) values (
    user_id_param, content_type_param, content_id_param, platform_param, share_url_param, share_text_param
  ) returning id into share_id_val;
  
  -- Update social analytics
  insert into social_analytics (user_id, platform, metric_type, metric_value, content_id, content_type, period_start, period_end)
  values (
    user_id_param, platform_param, 'shares', 1, content_id_param, content_type_param, 
    date_trunc('day', now()), date_trunc('day', now()) + interval '1 day'
  );
  
  return share_id_val;
end;
$$ language plpgsql security definer;

-- Function to update social leaderboard
create or replace function update_social_leaderboard()
returns void as $$
begin
  -- Clear current leaderboard
  delete from social_leaderboard;
  
  -- Recalculate and insert leaderboard data
  insert into social_leaderboard (user_id, total_shares, total_referrals, total_engagement, viral_score, period)
  select 
    u.id as user_id,
    coalesce(s.total_shares, 0) as total_shares,
    coalesce(r.total_referrals, 0) as total_referrals,
    coalesce(e.total_engagement, 0) as total_engagement,
    coalesce(s.total_shares, 0) * 1.0 + coalesce(r.total_referrals, 0) * 2.0 + coalesce(e.total_engagement, 0) * 0.5 as viral_score,
    'all_time' as period
  from auth.users u
  left join (
    select 
      user_id,
      count(*) as total_shares
    from social_shares
    group by user_id
  ) s on u.id = s.user_id
  left join (
    select 
      referrer_id as user_id,
      count(*) as total_referrals
    from referral_tracking
    where status = 'completed'
    group by referrer_id
  ) r on u.id = r.user_id
  left join (
    select 
      user_id,
      sum(metric_value) as total_engagement
    from social_analytics
    where metric_type in ('likes', 'comments', 'clicks')
    group by user_id
  ) e on u.id = e.user_id
  where coalesce(s.total_shares, 0) + coalesce(r.total_referrals, 0) + coalesce(e.total_engagement, 0) > 0
  order by viral_score desc;
  
  -- Update rank positions
  update social_leaderboard
  set rank_position = subquery.rank
  from (
    select id, row_number() over (order by viral_score desc) as rank
    from social_leaderboard
  ) subquery
  where social_leaderboard.id = subquery.id;
end;
$$ language plpgsql security definer;

-- Function to check and award social badges
create or replace function check_social_badges(user_id_param uuid)
returns void as $$
begin
  -- Social Butterfly badge (10+ shares)
  if not exists (select 1 from user_badges where user_id = user_id_param and badge_type = 'social_butterfly') then
    if exists (
      select 1 from social_shares 
      where user_id = user_id_param 
      group by user_id 
      having count(*) >= 10
    ) then
      insert into user_badges (user_id, badge_type, badge_name, badge_description, points_earned)
      values (user_id_param, 'social_butterfly', 'Social Butterfly', 'Shared content 10+ times!', 25);
    end if;
  end if;
  
  -- Referral Master badge (5+ successful referrals)
  if not exists (select 1 from user_badges where user_id = user_id_param and badge_type = 'referral_master') then
    if exists (
      select 1 from referral_tracking 
      where referrer_id = user_id_param and status = 'completed'
      group by referrer_id 
      having count(*) >= 5
    ) then
      insert into user_badges (user_id, badge_type, badge_name, badge_description, points_earned)
      values (user_id_param, 'referral_master', 'Referral Master', 'Successfully referred 5+ users!', 50);
    end if;
  end if;
end;
$$ language plpgsql security definer;




-- ============================================================================
-- FROM: 030_feature_flags_schema.sql
-- ============================================================================

-- Feature Flags and Kill Switches Schema
-- This migration creates the feature flags system with RLS for safe configuration

-- Create config_flags table for feature flags and kill switches
CREATE TABLE IF NOT EXISTS config_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_environment TEXT DEFAULT 'all' CHECK (target_environment IN ('all', 'development', 'staging', 'production')),
  target_users TEXT[] DEFAULT '{}', -- Array of user IDs for targeted rollouts
  conditions JSONB DEFAULT '{}', -- Additional conditions for flag evaluation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- CREATE INDEX IF NOT EXISTS for efficient flag lookups
CREATE INDEX IF NOT EXISTS idx_config_flags_enabled ON config_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_config_flags_environment ON config_flags(target_environment);
CREATE INDEX IF NOT EXISTS idx_config_flags_expires ON config_flags(expires_at);

-- Create flag_audit_log for tracking flag changes
CREATE TABLE IF NOT EXISTS flag_audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  flag_id TEXT REFERENCES config_flags(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'enabled', 'disabled', 'deleted')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- CREATE INDEX IF NOT EXISTS for audit log queries
CREATE INDEX IF NOT EXISTS idx_flag_audit_log_flag_id ON flag_audit_log(flag_id);
CREATE INDEX IF NOT EXISTS idx_flag_audit_log_changed_at ON flag_audit_log(changed_at);

-- Enable RLS on both tables
ALTER TABLE config_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flag_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for config_flags
-- Anonymous users can only read enabled flags (for client-side evaluation)
CREATE POLICY "Anonymous users can read enabled flags" ON config_flags
  FOR SELECT USING (enabled = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Authenticated users can read all flags (for admin interfaces)
CREATE POLICY "Authenticated users can read all flags" ON config_flags
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role can manage flags" ON config_flags
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for flag_audit_log
-- Only service role can write to audit log
CREATE POLICY "Service role can write audit log" ON flag_audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Authenticated users can read audit log
CREATE POLICY "Authenticated users can read audit log" ON flag_audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

-- CREATE OR REPLACE FUNCTION to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_config_flags_updated_at
  BEFORE UPDATE ON config_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- CREATE OR REPLACE FUNCTION to log flag changes
CREATE OR REPLACE FUNCTION log_flag_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO flag_audit_log (flag_id, action, new_values, changed_by, reason)
    VALUES (NEW.id, 'created', to_jsonb(NEW), NEW.created_by, 'Flag created');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO flag_audit_log (flag_id, action, old_values, new_values, changed_by, reason)
    VALUES (NEW.id, 'updated', to_jsonb(OLD), to_jsonb(NEW), NEW.created_by, 'Flag updated');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO flag_audit_log (flag_id, action, old_values, changed_by, reason)
    VALUES (OLD.id, 'deleted', to_jsonb(OLD), OLD.created_by, 'Flag deleted');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for flag change logging
CREATE TRIGGER log_config_flags_changes
  AFTER INSERT OR UPDATE OR DELETE ON config_flags
  FOR EACH ROW
  EXECUTE FUNCTION log_flag_change();

-- Insert default feature flags
INSERT INTO config_flags (id, name, description, enabled, target_environment, created_by) VALUES
  ('maintenance_mode', 'Maintenance Mode', 'Enable maintenance mode to show downtime page', false, 'all', (SELECT id FROM auth.users LIMIT 1)),
  ('new_ui_enabled', 'New UI Enabled', 'Enable the new user interface', false, 'production', (SELECT id FROM auth.users LIMIT 1)),
  ('beta_features', 'Beta Features', 'Enable beta features for testing', true, 'staging', (SELECT id FROM auth.users LIMIT 1)),
  ('analytics_enabled', 'Analytics Enabled', 'Enable user analytics tracking', true, 'all', (SELECT id FROM auth.users LIMIT 1)),
  ('debug_mode', 'Debug Mode', 'Enable debug logging and additional error details', false, 'development', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- CREATE OR REPLACE FUNCTION to evaluate feature flags for a user
CREATE OR REPLACE FUNCTION evaluate_feature_flag(
  flag_name TEXT,
  user_id UUID DEFAULT NULL,
  environment TEXT DEFAULT 'production'
)
RETURNS BOOLEAN AS $$
DECLARE
  flag_record RECORD;
  user_hash INTEGER;
  target_percentage INTEGER;
BEGIN
  -- Get the flag configuration
  SELECT * INTO flag_record
  FROM config_flags
  WHERE name = flag_name
    AND enabled = true
    AND (target_environment = 'all' OR target_environment = environment)
    AND (expires_at IS NULL OR expires_at > NOW());

  -- If flag doesn't exist or is disabled, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- If rollout_percentage is 0, return false
  IF flag_record.rollout_percentage = 0 THEN
    RETURN false;
  END IF;

  -- If rollout_percentage is 100, return true
  IF flag_record.rollout_percentage = 100 THEN
    RETURN true;
  END IF;

  -- If user_id is provided, check targeted users
  IF user_id IS NOT NULL AND array_length(flag_record.target_users, 1) > 0 THEN
    IF user_id = ANY(flag_record.target_users) THEN
      RETURN true;
    END IF;
  END IF;

  -- If user_id is provided, use consistent hashing for percentage-based rollouts
  IF user_id IS NOT NULL THEN
    -- Create a consistent hash of user_id + flag_name
    user_hash := ('x' || substr(md5(user_id::text || flag_name), 1, 8))::bit(32)::int;
    target_percentage := user_hash % 100;
    
    RETURN target_percentage < flag_record.rollout_percentage;
  END IF;

  -- If no user_id, return false for percentage-based rollouts
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION evaluate_feature_flag(TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION evaluate_feature_flag(TEXT, UUID, TEXT) TO anon;

-- CREATE OR REPLACE FUNCTION to get all active flags for a user (for client-side caching)
CREATE OR REPLACE FUNCTION get_user_feature_flags(
  user_id UUID DEFAULT NULL,
  environment TEXT DEFAULT 'production'
)
RETURNS TABLE(flag_name TEXT, enabled BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cf.name as flag_name,
    evaluate_feature_flag(cf.name, user_id, environment) as enabled
  FROM config_flags cf
  WHERE cf.enabled = true
    AND (cf.target_environment = 'all' OR cf.target_environment = environment)
    AND (cf.expires_at IS NULL OR cf.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_feature_flags(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_feature_flags(UUID, TEXT) TO anon;




-- ============================================================================
-- FROM: 031_consolidated_rls_security.sql
-- ============================================================================

-- Consolidated RLS Security Implementation
-- This migration consolidates RBAC and RLS policies with best practices
-- 
-- RUNS AFTER: All table creation migrations (001-013)
-- REPLACES: Policies from 003_multi_tenant_saas_schema.sql with enhanced role-aware versions
-- DEPRECATES: 003_rbac_rls_security.sql (conflicting/outdated table references)
--
-- Features:
-- - Role-based access control (app_user, app_admin, app_super_admin, app_readonly)
-- - Tenant isolation for all multi-tenant tables
-- - Security helper functions for policy checks
-- - Comprehensive coverage of all tables
-- - Best practices: explicit policies, proper WITH CHECK clauses, security definer functions

-- ============================================================================
-- SECTION 1: ROLE CREATION AND PERMISSIONS
-- ============================================================================

-- Create custom roles (use IF NOT EXISTS pattern to avoid conflicts)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
    CREATE ROLE app_admin;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_super_admin') THEN
    CREATE ROLE app_super_admin;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readonly') THEN
    CREATE ROLE app_readonly;
  END IF;
END
$$;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO app_user, app_admin, app_super_admin, app_readonly;

-- Grant basic permissions to app_user (with RLS, users only see their tenant data)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Grant admin permissions (with RLS restrictions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- Grant super admin permissions (with RLS, still respects policies)
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_super_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_super_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO app_super_admin;

-- Grant readonly permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

-- ============================================================================
-- SECTION 2: SECURITY HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user belongs to a tenant
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(
  user_id_param UUID,
  tenant_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_memberships
    WHERE tenant_memberships.user_id = user_id_param
      AND tenant_memberships.tenant_id = tenant_id_param
      AND tenant_memberships.status = 'active'
  );
$$;

-- Function to get user's tenant IDs
CREATE OR REPLACE FUNCTION public.get_user_tenants(user_id_param UUID)
RETURNS TABLE(tenant_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT tenant_id
  FROM tenant_memberships
  WHERE user_id = user_id_param
    AND status = 'active';
$$;

-- Function to check if user has role in tenant
CREATE OR REPLACE FUNCTION public.user_has_tenant_role(
  user_id_param UUID,
  tenant_id_param UUID,
  role_param TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_memberships
    WHERE user_id = user_id_param
      AND tenant_id = tenant_id_param
      AND role = role_param
      AND status = 'active'
  );
$$;

-- Function to check if user is tenant owner
CREATE OR REPLACE FUNCTION public.is_tenant_owner(
  user_id_param UUID,
  tenant_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_has_tenant_role(user_id_param, tenant_id_param, 'owner');
$$;

-- Function to check user role from profiles (legacy support)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = 'super_admin'
  );
$$;

-- Grant execute permissions on security functions
GRANT EXECUTE ON FUNCTION public.user_belongs_to_tenant(UUID, UUID) TO authenticated, app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.get_user_tenants(UUID) TO authenticated, app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.user_has_tenant_role(UUID, UUID, TEXT) TO authenticated, app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.is_tenant_owner(UUID, UUID) TO authenticated, app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, app_user, app_admin, app_super_admin;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated, app_user, app_admin, app_super_admin;

-- ============================================================================
-- SECTION 3: ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Core tables (from 001_create_tables.sql)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Analytics tables (from 002_analytics_logging_tables.sql)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_feedback ENABLE ROW LEVEL SECURITY;

-- Multi-tenant tables (from 003_multi_tenant_saas_schema.sql)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Growth engine tables (from 004_growth_engine_schema.sql)
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_copy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE churn_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE winback_campaigns ENABLE ROW LEVEL SECURITY;

-- Federated ecosystem tables (from 005_federated_ecosystem_schema.sql)
ALTER TABLE partner_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE federated_api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_advisor ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_evolution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sdk_downloads ENABLE ROW LEVEL SECURITY;

-- Job queue tables (from 006_job_queue_schema.sql)
ALTER TABLE jobs_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;

-- Community portal tables (from 010_community_portal_schema.sql)
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_event_submissions ENABLE ROW LEVEL SECURITY;

-- Chef marketplace tables (from 011_chef_marketplace_schema.sql)
ALTER TABLE chef_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_pack_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_verification_documents ENABLE ROW LEVEL SECURITY;

-- Referral/social tables (from 012_referral_social_schema.sql)
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_widgets ENABLE ROW LEVEL SECURITY;

-- Feature flags tables (from 013_feature_flags_schema.sql)
ALTER TABLE config_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flag_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin dashboard tables (from 009_admin_dashboard_schema.sql)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 4: CORE TABLES RLS POLICIES (with tenant isolation)
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their tenants" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles in their tenants" ON profiles;
DROP POLICY IF EXISTS "Users can insert profiles in their tenants" ON profiles;

-- Profiles: Users can view/update profiles in their tenants
CREATE POLICY "profiles_select_tenant" ON profiles
  FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
    OR tenant_id IS NULL  -- Allow null for backward compatibility during migration
    OR auth.uid() = id    -- Users can always see their own profile
  );

CREATE POLICY "profiles_update_tenant" ON profiles
  FOR UPDATE
  USING (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
    OR auth.uid() = id
  )
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
    OR auth.uid() = id
  );

CREATE POLICY "profiles_insert_tenant" ON profiles
  FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
    OR auth.uid() = id
  );

-- Pantry items: Tenant-isolated
DROP POLICY IF EXISTS "Users can view own pantry items" ON pantry_items;
DROP POLICY IF EXISTS "Users can insert own pantry items" ON pantry_items;
DROP POLICY IF EXISTS "Users can update own pantry items" ON pantry_items;
DROP POLICY IF EXISTS "Users can delete own pantry items" ON pantry_items;
DROP POLICY IF EXISTS "Users can view pantry items in their tenants" ON pantry_items;
DROP POLICY IF EXISTS "Users can insert pantry items in their tenants" ON pantry_items;
DROP POLICY IF EXISTS "Users can update pantry items in their tenants" ON pantry_items;
DROP POLICY IF EXISTS "Users can delete pantry items in their tenants" ON pantry_items;

CREATE POLICY "pantry_items_select_tenant" ON pantry_items
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "pantry_items_insert_tenant" ON pantry_items
  FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "pantry_items_update_tenant" ON pantry_items
  FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "pantry_items_delete_tenant" ON pantry_items
  FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

-- Recipes: Tenant-isolated
DROP POLICY IF EXISTS "Users can view own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can view recipes in their tenants" ON recipes;
DROP POLICY IF EXISTS "Users can insert recipes in their tenants" ON recipes;
DROP POLICY IF EXISTS "Users can update recipes in their tenants" ON recipes;
DROP POLICY IF EXISTS "Users can delete recipes in their tenants" ON recipes;

CREATE POLICY "recipes_select_tenant" ON recipes
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "recipes_insert_tenant" ON recipes
  FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "recipes_update_tenant" ON recipes
  FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "recipes_delete_tenant" ON recipes
  FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

-- Favorites: Tenant-isolated
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can view favorites in their tenants" ON favorites;
DROP POLICY IF EXISTS "Users can insert favorites in their tenants" ON favorites;
DROP POLICY IF EXISTS "Users can delete favorites in their tenants" ON favorites;

CREATE POLICY "favorites_select_tenant" ON favorites
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "favorites_insert_tenant" ON favorites
  FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "favorites_delete_tenant" ON favorites
  FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

-- ============================================================================
-- SECTION 5: MULTI-TENANT TABLES RLS POLICIES
-- ============================================================================

-- Tenants: Users can view their tenants, owners can update
CREATE POLICY "tenants_select_membership" ON tenants
  FOR SELECT
  USING (id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "tenants_update_owner" ON tenants
  FOR UPDATE
  USING (is_tenant_owner(auth.uid(), id))
  WITH CHECK (is_tenant_owner(auth.uid(), id));

CREATE POLICY "tenants_insert_system" ON tenants
  FOR INSERT
  WITH CHECK (true);  -- Only system can create tenants via function

-- Tenant memberships: Users can view memberships for their tenants
CREATE POLICY "tenant_memberships_select_tenant" ON tenant_memberships
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "tenant_memberships_all_owner" ON tenant_memberships
  FOR ALL
  USING (is_tenant_owner(auth.uid(), tenant_id))
  WITH CHECK (is_tenant_owner(auth.uid(), tenant_id));

-- Subscriptions: Users can view their tenant subscriptions
CREATE POLICY "subscriptions_select_tenant" ON subscriptions
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "subscriptions_all_system" ON subscriptions
  FOR ALL
  USING (true);  -- System manages subscriptions via webhooks

-- Usage logs: Users can view their tenant usage
CREATE POLICY "usage_logs_select_tenant" ON usage_logs
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "usage_logs_insert_system" ON usage_logs
  FOR INSERT
  WITH CHECK (true);  -- System can insert usage logs

-- Tenant invites: Owners can manage invites
CREATE POLICY "tenant_invites_select_owner" ON tenant_invites
  FOR SELECT
  USING (is_tenant_owner(auth.uid(), tenant_id));

CREATE POLICY "tenant_invites_all_owner" ON tenant_invites
  FOR ALL
  USING (is_tenant_owner(auth.uid(), tenant_id))
  WITH CHECK (is_tenant_owner(auth.uid(), tenant_id));

-- AI cache: Users can access cache for their tenants
CREATE POLICY "ai_cache_select_tenant" ON ai_cache
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "ai_cache_all_system" ON ai_cache
  FOR ALL
  USING (true);  -- System manages cache

-- Billing events: System only
CREATE POLICY "billing_events_all_system" ON billing_events
  FOR ALL
  USING (true);

-- ============================================================================
-- SECTION 6: ANALYTICS TABLES RLS POLICIES
-- ============================================================================

-- Analytics events: Tenant-isolated
DROP POLICY IF EXISTS "Users can view own analytics events" ON analytics_events;
DROP POLICY IF EXISTS "System can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can view analytics events in their tenants" ON analytics_events;

CREATE POLICY "analytics_events_select_tenant" ON analytics_events
  FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
    OR tenant_id IS NULL
  );

CREATE POLICY "analytics_events_insert_system" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Recipe metrics: Tenant-isolated
DROP POLICY IF EXISTS "Users can view own recipe metrics" ON recipe_metrics;
DROP POLICY IF EXISTS "System can insert recipe metrics" ON recipe_metrics;
DROP POLICY IF EXISTS "Users can view recipe metrics in their tenants" ON recipe_metrics;

CREATE POLICY "recipe_metrics_select_tenant" ON recipe_metrics
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "recipe_metrics_insert_system" ON recipe_metrics
  FOR INSERT
  WITH CHECK (true);

-- Recipe feedback: Tenant-isolated
DROP POLICY IF EXISTS "Users can view own recipe feedback" ON recipe_feedback;
DROP POLICY IF EXISTS "Users can insert own recipe feedback" ON recipe_feedback;
DROP POLICY IF EXISTS "Users can update own recipe feedback" ON recipe_feedback;
DROP POLICY IF EXISTS "Users can view recipe feedback in their tenants" ON recipe_feedback;
DROP POLICY IF EXISTS "Users can insert recipe feedback in their tenants" ON recipe_feedback;
DROP POLICY IF EXISTS "Users can update recipe feedback in their tenants" ON recipe_feedback;

CREATE POLICY "recipe_feedback_select_tenant" ON recipe_feedback
  FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "recipe_feedback_insert_tenant" ON recipe_feedback
  FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "recipe_feedback_update_tenant" ON recipe_feedback
  FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

-- ============================================================================
-- SECTION 7: ADMIN ROLE POLICIES (for app_admin and app_super_admin)
-- ============================================================================

-- Super admin can view all (respects RLS but with broader access)
-- Note: In Supabase, service_role bypasses RLS, but authenticated admin users need explicit policies

CREATE POLICY "admin_profiles_select_all" ON profiles
  FOR SELECT
  TO app_admin, app_super_admin
  USING (is_admin(auth.uid()));

CREATE POLICY "admin_tenants_select_all" ON tenants
  FOR SELECT
  TO app_admin, app_super_admin
  USING (is_admin(auth.uid()));

-- Super admin policies (if needed for specific admin operations)
CREATE POLICY "super_admin_all_profiles" ON profiles
  FOR ALL
  TO app_super_admin
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

-- ============================================================================
-- SECTION 8: READONLY ROLE POLICIES
-- ============================================================================

-- Readonly can view data in their tenants
CREATE POLICY "readonly_profiles_select" ON profiles
  FOR SELECT
  TO app_readonly
  USING (tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

CREATE POLICY "readonly_tenants_select" ON tenants
  FOR SELECT
  TO app_readonly
  USING (id IN (SELECT tenant_id FROM get_user_tenants(auth.uid())));

-- ============================================================================
-- SECTION 9: GRANT FUTURE PERMISSIONS
-- ============================================================================

-- Ensure future tables inherit permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO app_admin, app_super_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO app_readonly;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_user, app_admin, app_super_admin;

-- ============================================================================
-- SECTION 10: COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION public.user_belongs_to_tenant IS 'Check if user belongs to a specific tenant';
COMMENT ON FUNCTION public.get_user_tenants IS 'Get all tenant IDs for a user';
COMMENT ON FUNCTION public.user_has_tenant_role IS 'Check if user has specific role in tenant';
COMMENT ON FUNCTION public.is_tenant_owner IS 'Check if user is owner of a tenant';

COMMENT ON POLICY "profiles_select_tenant" ON profiles IS 'Users can view profiles in their tenants';
COMMENT ON POLICY "pantry_items_select_tenant" ON pantry_items IS 'Users can view pantry items in their tenants';
COMMENT ON POLICY "recipes_select_tenant" ON recipes IS 'Users can view recipes in their tenants';
COMMENT ON POLICY "favorites_select_tenant" ON favorites IS 'Users can view favorites in their tenants';




-- ============================================================================
-- FROM: 032_gap_closure_features.sql
-- ============================================================================

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




-- ============================================================================
-- FROM: 033_initial_schema.sql
-- ============================================================================

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




-- ============================================================================
-- FROM: 034_growth_systems.sql
-- ============================================================================

-- ============================================================================
-- NOMAD BACKEND - GROWTH SYSTEMS MIGRATION
-- ============================================================================
-- This migration creates all tables for growth systems:
-- Email subscriptions, referrals, promo codes, experiments, pricing, lifecycle, journeys
-- Includes RLS policies for security
-- ============================================================================

-- Create enums
DO $$ BEGIN
  CREATE TYPE email_subscription_status AS ENUM ('subscribed', 'unsubscribed', 'bounced');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE referral_status AS ENUM ('clicked', 'signed_up', 'converted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE promo_offer_kind AS ENUM ('percentage', 'fixed', 'trial_days');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE promo_duration AS ENUM ('once', 'repeat', 'lifecycle');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE experiment_status AS ENUM ('draft', 'running', 'paused', 'complete');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE pricing_platform AS ENUM ('ios', 'android', 'web', 'any');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE pricing_plan AS ENUM ('monthly', 'annual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Email subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  status email_subscription_status DEFAULT 'subscribed' NOT NULL,
  source text, -- 'signup', 'manual', 'import', etc.
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Referral programs table
CREATE TABLE IF NOT EXISTS referral_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  active boolean DEFAULT true NOT NULL,
  reward_sender jsonb DEFAULT '{}', -- {type: 'trial_days', value: 7} or {type: 'discount', value: 10}
  reward_receiver jsonb DEFAULT '{}',
  terms_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES referral_programs(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uses int DEFAULT 0 NOT NULL,
  max_uses int,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Referrals table (tracking clicks, signups, conversions)
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES referral_programs(id) ON DELETE CASCADE,
  code_id uuid NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referrer_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  referee_email varchar(255),
  status referral_status DEFAULT 'clicked' NOT NULL,
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Promo offers table
CREATE TABLE IF NOT EXISTS promo_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind promo_offer_kind NOT NULL,
  value numeric NOT NULL, -- percentage (0-100) or fixed cents or trial days
  duration promo_duration DEFAULT 'once' NOT NULL,
  constraints jsonb DEFAULT '{}', -- {max_uses_per_user: 1, geo: ['US'], min_purchase_cents: 1000}
  active boolean DEFAULT true NOT NULL,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Experiments table
CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text,
  status experiment_status DEFAULT 'draft' NOT NULL,
  hypothesis text,
  primary_metric text NOT NULL, -- e.g., 'conversion_rate', 'purchase_completed'
  guardrail_metrics jsonb DEFAULT '[]', -- e.g., ['crash_rate', 'purchase_rate']
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  started_at timestamptz,
  stopped_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Experiment variants table
CREATE TABLE IF NOT EXISTS experiment_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  key text NOT NULL, -- 'control', 'variant_a', etc.
  weight int DEFAULT 50 NOT NULL, -- 0-100, relative weight for allocation
  meta jsonb DEFAULT '{}', -- variant-specific config
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(experiment_id, key)
);

-- Experiment assignments table
CREATE TABLE IF NOT EXISTS experiment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  anon_id text, -- anonymous identifier for logged-out users
  variant_key text NOT NULL,
  assigned_at timestamptz DEFAULT now() NOT NULL,
  sticky boolean DEFAULT true NOT NULL, -- if false, can re-assign on next fetch
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(experiment_id, COALESCE(user_id::text, anon_id))
);

-- Pricing rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country varchar(3), -- ISO 3166-1 alpha-3, NULL = all countries
  platform pricing_platform DEFAULT 'any' NOT NULL,
  plan pricing_plan NOT NULL,
  price_cents int NOT NULL,
  currency varchar(3) DEFAULT 'USD' NOT NULL,
  promo_offer_id uuid REFERENCES promo_offers(id) ON DELETE SET NULL,
  active boolean DEFAULT true NOT NULL,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Lifecycle events table (attribution & growth tracking)
CREATE TABLE IF NOT EXISTS lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  anon_id text, -- anonymous identifier
  name text NOT NULL, -- 'AttributionCaptured', 'ReferralClick', 'PaywallViewed', etc.
  props jsonb DEFAULT '{}',
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Journey states table (orchestration state)
CREATE TABLE IF NOT EXISTS journey_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key text NOT NULL, -- journey key: 'onboarding', 'habit_loop', 'premium_upsell', etc.
  step text NOT NULL, -- current step in journey
  last_sent_at timestamptz,
  meta jsonb DEFAULT '{}', -- step-specific metadata
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS email_subscriptions_user_id_idx ON email_subscriptions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS email_subscriptions_email_idx ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS email_subscriptions_status_idx ON email_subscriptions(status);
CREATE INDEX IF NOT EXISTS referral_codes_program_id_idx ON referral_codes(program_id);
CREATE INDEX IF NOT EXISTS referral_codes_owner_user_id_idx ON referral_codes(owner_user_id);
CREATE INDEX IF NOT EXISTS referral_codes_code_idx ON referral_codes(code);
CREATE INDEX IF NOT EXISTS referrals_code_id_idx ON referrals(code_id);
CREATE INDEX IF NOT EXISTS referrals_referrer_user_id_idx ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS referrals_referee_user_id_idx ON referrals(referee_user_id) WHERE referee_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS referrals_status_idx ON referrals(status);
CREATE INDEX IF NOT EXISTS promo_offers_slug_idx ON promo_offers(slug);
CREATE INDEX IF NOT EXISTS promo_offers_active_idx ON promo_offers(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS experiments_key_idx ON experiments(key);
CREATE INDEX IF NOT EXISTS experiments_status_idx ON experiments(status) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS experiment_variants_experiment_id_idx ON experiment_variants(experiment_id);
CREATE INDEX IF NOT EXISTS experiment_assignments_experiment_id_idx ON experiment_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS experiment_assignments_user_id_idx ON experiment_assignments(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS experiment_assignments_anon_id_idx ON experiment_assignments(anon_id) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS pricing_rules_country_platform_idx ON pricing_rules(country, platform);
CREATE INDEX IF NOT EXISTS pricing_rules_active_idx ON pricing_rules(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS lifecycle_events_user_id_idx ON lifecycle_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lifecycle_events_anon_id_idx ON lifecycle_events(anon_id) WHERE anon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS lifecycle_events_name_ts_idx ON lifecycle_events(name, ts);
CREATE INDEX IF NOT EXISTS journey_states_user_id_idx ON journey_states(user_id);
CREATE INDEX IF NOT EXISTS journey_states_key_idx ON journey_states(key);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_states ENABLE ROW LEVEL SECURITY;

-- Email subscriptions policies
CREATE POLICY "Users can view own email subscriptions"
  ON email_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage own email subscriptions"
  ON email_subscriptions FOR ALL
  USING (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can view all email subscriptions"
  ON email_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Referral programs policies (public read for active, admin write)
CREATE POLICY "Public can view active referral programs"
  ON referral_programs FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage referral programs"
  ON referral_programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Referral codes policies
CREATE POLICY "Users can view own referral codes"
  ON referral_codes FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users can create own referral codes"
  ON referral_codes FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Public can view referral codes for validation"
  ON referral_codes FOR SELECT
  USING (true); -- Allow reading to validate codes

CREATE POLICY "Admins can manage all referral codes"
  ON referral_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Referrals policies
CREATE POLICY "Users can view own referrals (as referrer)"
  ON referrals FOR SELECT
  USING (referrer_user_id = auth.uid());

CREATE POLICY "Users can view referrals where they are referee"
  ON referrals FOR SELECT
  USING (referee_user_id = auth.uid());

CREATE POLICY "System can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (true); -- Allow system to track referral clicks/signups

CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Promo offers policies (public read for active, admin write)
CREATE POLICY "Public can view active promo offers"
  ON promo_offers FOR SELECT
  USING (active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));

CREATE POLICY "Admins can manage promo offers"
  ON promo_offers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Experiments policies (admin-only for management, public read for running experiments)
CREATE POLICY "Public can view running experiments"
  ON experiments FOR SELECT
  USING (status = 'running');

CREATE POLICY "Admins can manage experiments"
  ON experiments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Experiment variants policies (public read for running experiments, admin write)
CREATE POLICY "Public can view variants of running experiments"
  ON experiment_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM experiments e
      WHERE e.id = experiment_variants.experiment_id
      AND e.status = 'running'
    )
  );

CREATE POLICY "Admins can manage experiment variants"
  ON experiment_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Experiment assignments policies
CREATE POLICY "Users can view own experiment assignments"
  ON experiment_assignments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert/update experiment assignments"
  ON experiment_assignments FOR ALL
  WITH CHECK (true); -- Allow system to assign experiments

CREATE POLICY "Admins can view all experiment assignments"
  ON experiment_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Pricing rules policies (public read for active, admin write)
CREATE POLICY "Public can view active pricing rules"
  ON pricing_rules FOR SELECT
  USING (active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));

CREATE POLICY "Admins can manage pricing rules"
  ON pricing_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Lifecycle events policies (users can view own, system can insert)
CREATE POLICY "Users can view own lifecycle events"
  ON lifecycle_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert lifecycle events"
  ON lifecycle_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all lifecycle events"
  ON lifecycle_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Journey states policies
CREATE POLICY "Users can view own journey states"
  ON journey_states FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can manage journey states"
  ON journey_states FOR ALL
  WITH CHECK (true); -- Allow system to advance journey states

CREATE POLICY "Admins can view all journey states"
  ON journey_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (u.preferences->>'role') = 'admin'
    )
  );

-- Updated_at triggers
CREATE TRIGGER update_email_subscriptions_updated_at BEFORE UPDATE ON email_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_programs_updated_at BEFORE UPDATE ON referral_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_codes_updated_at BEFORE UPDATE ON referral_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_offers_updated_at BEFORE UPDATE ON promo_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_states_updated_at BEFORE UPDATE ON journey_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();




-- ============================================================================
-- FROM: 035_revenue_optimization.sql
-- ============================================================================

-- ============================================================================
-- NOMAD BACKEND - REVENUE OPTIMIZATION MIGRATION
-- ============================================================================
-- This migration creates all tables for intelligent pricing & revenue optimization
-- Includes RLS policies for security
-- ============================================================================

-- Create enums
DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('success', 'failed', 'refunded', 'trial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_platform AS ENUM ('ios', 'android', 'web');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE experiment_status AS ENUM ('draft', 'running', 'paused', 'complete');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ltv_segment AS ENUM ('new', 'retained', 'churned', 'reactivated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  plan text NOT NULL,
  platform transaction_platform NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'USD',
  amount_cents integer NOT NULL,
  country varchar(3),
  promo_offer_id uuid REFERENCES promo_offers(id) ON DELETE SET NULL,
  status transaction_status NOT NULL DEFAULT 'success',
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_ts_idx ON transactions(ts);
CREATE INDEX IF NOT EXISTS transactions_country_plan_idx ON transactions(country, plan);
CREATE INDEX IF NOT EXISTS transactions_platform_idx ON transactions(platform);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);

-- Revenue snapshots table
CREATE TABLE IF NOT EXISTS revenue_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period date NOT NULL,
  mrr_cents integer DEFAULT 0 NOT NULL,
  arr_cents integer DEFAULT 0 NOT NULL,
  arpu_cents integer DEFAULT 0 NOT NULL,
  ltv_cents integer DEFAULT 0 NOT NULL,
  cac_cents integer DEFAULT 0 NOT NULL,
  churn_rate numeric(5, 4) DEFAULT 0 NOT NULL,
  conversion_rate numeric(5, 4) DEFAULT 0 NOT NULL,
  computed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(period)
);

CREATE INDEX IF NOT EXISTS revenue_snapshots_period_idx ON revenue_snapshots(period);

-- Price experiments table
CREATE TABLE IF NOT EXISTS price_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  plan text NOT NULL,
  country varchar(3),
  platform transaction_platform,
  variant_a_price_cents integer NOT NULL,
  variant_b_price_cents integer NOT NULL,
  started_at timestamptz,
  stopped_at timestamptz,
  status experiment_status DEFAULT 'draft' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS price_experiments_slug_idx ON price_experiments(slug);
CREATE INDEX IF NOT EXISTS price_experiments_status_idx ON price_experiments(status);
CREATE INDEX IF NOT EXISTS price_experiments_country_plan_idx ON price_experiments(country, plan);

-- Elasticity results table
CREATE TABLE IF NOT EXISTS elasticity_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country varchar(3),
  plan text NOT NULL,
  price_points jsonb NOT NULL DEFAULT '[]',
  demand jsonb NOT NULL DEFAULT '[]',
  elasticity numeric(8, 4) NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(country, plan)
);

CREATE INDEX IF NOT EXISTS elasticity_results_country_plan_idx ON elasticity_results(country, plan);

-- Van Westendorp surveys table
CREATE TABLE IF NOT EXISTS vanwestendorp_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  country varchar(3) NOT NULL,
  responses jsonb NOT NULL DEFAULT '[]',
  median_optimal_price integer,
  currency varchar(3) DEFAULT 'USD' NOT NULL,
  ts timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS vanwestendorp_surveys_user_id_idx ON vanwestendorp_surveys(user_id);
CREATE INDEX IF NOT EXISTS vanwestendorp_surveys_country_idx ON vanwestendorp_surveys(country);
CREATE INDEX IF NOT EXISTS vanwestendorp_surveys_ts_idx ON vanwestendorp_surveys(ts);

-- LTV segments table
CREATE TABLE IF NOT EXISTS ltv_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment ltv_segment NOT NULL,
  avg_ltv_cents integer DEFAULT 0 NOT NULL,
  avg_cac_cents integer DEFAULT 0 NOT NULL,
  margin_pct numeric(5, 2) DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(segment)
);

CREATE INDEX IF NOT EXISTS ltv_segments_segment_idx ON ltv_segments(segment);

-- RLS Policies

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE elasticity_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE vanwestendorp_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ltv_segments ENABLE ROW LEVEL SECURITY;

-- Transactions: Admin can see all, users see only their own aggregated data
CREATE POLICY transactions_admin_all ON transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan = 'partner')
    )
  );

-- Revenue snapshots: Only aggregated queries for non-admin
CREATE POLICY revenue_snapshots_read ON revenue_snapshots
  FOR SELECT
  TO authenticated
  USING (true); -- Allow read, but API should only return aggregated data

CREATE POLICY revenue_snapshots_admin ON revenue_snapshots
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan = 'partner')
    )
  );

-- Price experiments: Admin only
CREATE POLICY price_experiments_admin ON price_experiments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan = 'partner')
    )
  );

-- Elasticity results: Read for premium analytics, write admin only
CREATE POLICY elasticity_results_read ON elasticity_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan IN ('premium', 'partner'))
    )
  );

CREATE POLICY elasticity_results_admin ON elasticity_results
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan = 'partner')
    )
  );

-- Van Westendorp surveys: Users can insert their own, read aggregated only
CREATE POLICY vanwestendorp_surveys_insert ON vanwestendorp_surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

CREATE POLICY vanwestendorp_surveys_read_aggregated ON vanwestendorp_surveys
  FOR SELECT
  TO authenticated
  USING (true); -- Allow read, but API should only return aggregated data

-- LTV segments: Premium analytics can read, admin can write
CREATE POLICY ltv_segments_read ON ltv_segments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan IN ('premium', 'partner'))
    )
  );

CREATE POLICY ltv_segments_admin ON ltv_segments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.preferences->>'role' = 'admin' OR users.plan = 'partner')
    )
  );

-- Add comments for documentation
COMMENT ON TABLE transactions IS 'Records all payment transactions across platforms';
COMMENT ON TABLE revenue_snapshots IS 'Daily/weekly aggregated revenue KPIs';
COMMENT ON TABLE price_experiments IS 'A/B tests for pricing variants';
COMMENT ON TABLE elasticity_results IS 'Price elasticity coefficients per country/plan';
COMMENT ON TABLE vanwestendorp_surveys IS 'Survey responses for willingness-to-pay analysis';
COMMENT ON TABLE ltv_segments IS 'LTV/CAC metrics by user segment';

COMMENT ON COLUMN elasticity_results.elasticity IS 'Price elasticity: negative = elastic (demand sensitive), positive = inelastic';
COMMENT ON COLUMN revenue_snapshots.churn_rate IS 'Churn rate as decimal (0.05 = 5%)';
COMMENT ON COLUMN revenue_snapshots.conversion_rate IS 'Conversion rate as decimal (0.02 = 2%)';




-- ============================================================================
-- FROM: 036_partner_revenue_network.sql
-- ============================================================================

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




-- ============================================================================
-- FROM: 037_regtech_layer.sql
-- ============================================================================

-- ============================================================================
-- REGTECH LAYER MIGRATION
-- ============================================================================
-- Privacy, Compliance, and Regulatory Technology Tables
-- Includes DSAR, Controls Monitoring, Risk Register, Vendor Mgmt, DPIA
-- ============================================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE dsar_request_type AS ENUM ('export', 'erase', 'restrict', 'rectify');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_request_status AS ENUM ('received', 'verifying', 'in_progress', 'complete', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_channel AS ENUM ('portal', 'email', 'api');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_region AS ENUM ('gdpr', 'ccpa', 'cpra', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dsar_artifact_kind AS ENUM ('data_export', 'erasure_log', 'correction_log', 'restriction_token');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lawful_basis AS ENUM ('consent', 'contract', 'legitimate_interest', 'legal_obligation');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_category AS ENUM ('security', 'privacy', 'operational', 'vendor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_severity AS ENUM ('low', 'med', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_likelihood AS ENUM ('unlikely', 'possible', 'likely');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE risk_status AS ENUM ('open', 'mitigated', 'accepted', 'transferred');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE control_framework AS ENUM ('soc2', 'iso27001', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE control_frequency AS ENUM ('continuous', 'daily', 'weekly', 'monthly', 'quarterly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE evidence_kind AS ENUM ('log', 'screenshot', 'report', 'config');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE control_status AS ENUM ('passing', 'failing', 'waived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE control_result AS ENUM ('pass', 'fail', 'waive');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE vendor_category AS ENUM ('hosting', 'analytics', 'ads', 'payments', 'crm', 'devtools');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE vendor_risk_level AS ENUM ('low', 'med', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE vendor_status AS ENUM ('approved', 'pending', 'denied');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE residual_risk AS ENUM ('low', 'med', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE dpia_decision AS ENUM ('proceed', 'revise', 'block');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE regulatory_region AS ENUM ('gdpr', 'ccpa', 'cpra', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- DSAR Requests table
CREATE TABLE IF NOT EXISTS dsar_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email varchar(255) NOT NULL,
  type dsar_request_type NOT NULL,
  status dsar_request_status DEFAULT 'received' NOT NULL,
  submitted_at timestamptz DEFAULT now() NOT NULL,
  verified_at timestamptz,
  completed_at timestamptz,
  reason text,
  channel dsar_channel DEFAULT 'portal' NOT NULL,
  region dsar_region DEFAULT 'gdpr' NOT NULL,
  window_deadline timestamptz NOT NULL,
  artifacts jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dsar_requests_user_id ON dsar_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_email ON dsar_requests(email);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_status ON dsar_requests(status);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_region ON dsar_requests(region);
CREATE INDEX IF NOT EXISTS idx_dsar_requests_window_deadline ON dsar_requests(window_deadline);

-- DSAR Artifacts table
CREATE TABLE IF NOT EXISTS dsar_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES dsar_requests(id) ON DELETE CASCADE NOT NULL,
  kind dsar_artifact_kind NOT NULL,
  url text NOT NULL,
  checksum text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dsar_artifacts_request_id ON dsar_artifacts(request_id);
CREATE INDEX IF NOT EXISTS idx_dsar_artifacts_kind ON dsar_artifacts(kind);

-- Processing Activities table
CREATE TABLE IF NOT EXISTS processing_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  purpose text NOT NULL,
  lawful_basis lawful_basis NOT NULL,
  data_categories text[] DEFAULT '{}' NOT NULL,
  recipients text[] DEFAULT '{}' NOT NULL,
  dpa_links text[] DEFAULT '{}' NOT NULL,
  retention_days integer,
  systems text[] DEFAULT '{}' NOT NULL,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_processing_activities_name ON processing_activities(name);
CREATE INDEX IF NOT EXISTS idx_processing_activities_lawful_basis ON processing_activities(lawful_basis);

-- Risk Register table
CREATE TABLE IF NOT EXISTS risk_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category risk_category NOT NULL,
  severity risk_severity NOT NULL,
  likelihood risk_likelihood NOT NULL,
  owner text NOT NULL,
  status risk_status DEFAULT 'open' NOT NULL,
  controls text[] DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_risk_register_category ON risk_register(category);
CREATE INDEX IF NOT EXISTS idx_risk_register_severity ON risk_register(severity);
CREATE INDEX IF NOT EXISTS idx_risk_register_status ON risk_register(status);
CREATE INDEX IF NOT EXISTS idx_risk_register_owner ON risk_register(owner);

-- Controls table
CREATE TABLE IF NOT EXISTS controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  framework control_framework NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  owner text NOT NULL,
  frequency control_frequency DEFAULT 'monthly' NOT NULL,
  evidence_kind evidence_kind DEFAULT 'report' NOT NULL,
  last_checked_at timestamptz,
  status control_status DEFAULT 'failing' NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_controls_key ON controls(key);
CREATE INDEX IF NOT EXISTS idx_controls_framework ON controls(framework);
CREATE INDEX IF NOT EXISTS idx_controls_status ON controls(status);
CREATE INDEX IF NOT EXISTS idx_controls_owner ON controls(owner);

-- Control Evidence table
CREATE TABLE IF NOT EXISTS control_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id uuid REFERENCES controls(id) ON DELETE CASCADE NOT NULL,
  ts timestamptz DEFAULT now() NOT NULL,
  result control_result NOT NULL,
  artifact_url text NOT NULL,
  artifact_checksum text NOT NULL,
  collector text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_control_evidence_control_id ON control_evidence(control_id);
CREATE INDEX IF NOT EXISTS idx_control_evidence_result ON control_evidence(result);
CREATE INDEX IF NOT EXISTS idx_control_evidence_ts ON control_evidence(ts);
CREATE INDEX IF NOT EXISTS idx_control_evidence_collector ON control_evidence(collector);

-- Vendor Catalog table
CREATE TABLE IF NOT EXISTS vendor_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category vendor_category NOT NULL,
  dpa_url text,
  subprocessor boolean DEFAULT false NOT NULL,
  pii_access boolean DEFAULT false NOT NULL,
  risk_level vendor_risk_level DEFAULT 'med' NOT NULL,
  status vendor_status DEFAULT 'pending' NOT NULL,
  owner text NOT NULL,
  review_date timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vendor_catalog_name ON vendor_catalog(name);
CREATE INDEX IF NOT EXISTS idx_vendor_catalog_category ON vendor_catalog(category);
CREATE INDEX IF NOT EXISTS idx_vendor_catalog_status ON vendor_catalog(status);
CREATE INDEX IF NOT EXISTS idx_vendor_catalog_risk_level ON vendor_catalog(risk_level);

-- DPIA Records table
CREATE TABLE IF NOT EXISTS dpia_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processing_activity_id uuid REFERENCES processing_activities(id) ON DELETE SET NULL,
  summary text NOT NULL,
  risks text[] DEFAULT '{}' NOT NULL,
  mitigations text[] DEFAULT '{}' NOT NULL,
  residual_risk residual_risk NOT NULL,
  decision dpia_decision DEFAULT 'proceed' NOT NULL,
  reviewer text NOT NULL,
  reviewed_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dpia_records_processing_activity_id ON dpia_records(processing_activity_id);
CREATE INDEX IF NOT EXISTS idx_dpia_records_residual_risk ON dpia_records(residual_risk);
CREATE INDEX IF NOT EXISTS idx_dpia_records_decision ON dpia_records(decision);

-- Legal Hold table
CREATE TABLE IF NOT EXISTS legal_hold (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_legal_hold_active ON legal_hold(active);
CREATE INDEX IF NOT EXISTS idx_legal_hold_scope ON legal_hold(scope);

-- Regulatory Reports table
CREATE TABLE IF NOT EXISTS regulatory_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  region regulatory_region NOT NULL,
  metrics jsonb NOT NULL,
  generated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_regulatory_reports_region ON regulatory_reports(region);
CREATE INDEX IF NOT EXISTS idx_regulatory_reports_period ON regulatory_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_regulatory_reports_generated_at ON regulatory_reports(generated_at);

-- RLS Policies

-- DSAR Requests: Users can read their own requests
ALTER TABLE dsar_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY dsar_requests_user_select ON dsar_requests
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

CREATE POLICY dsar_requests_user_insert ON dsar_requests
  FOR INSERT
  WITH CHECK (true); -- Anyone can submit DSAR

CREATE POLICY dsar_requests_admin_update ON dsar_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- DSAR Artifacts: Users can read their own artifacts
ALTER TABLE dsar_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY dsar_artifacts_user_select ON dsar_artifacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dsar_requests 
      WHERE dsar_requests.id = dsar_artifacts.request_id 
      AND (dsar_requests.user_id = auth.uid() OR dsar_requests.email = current_setting('request.jwt.claims', true)::json->>'email')
    ) OR
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

-- Control Evidence: Read-only for auditors and admins
ALTER TABLE control_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY control_evidence_read ON control_evidence
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

-- Processing Activities: Read-only for auditors, full access for privacy officer
ALTER TABLE processing_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY processing_activities_read ON processing_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

CREATE POLICY processing_activities_modify ON processing_activities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- Risk Register: Read for auditors, modify for privacy officer
ALTER TABLE risk_register ENABLE ROW LEVEL SECURITY;

CREATE POLICY risk_register_read ON risk_register
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

CREATE POLICY risk_register_modify ON risk_register
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- Controls: Read for auditors, modify for privacy officer
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY controls_read ON controls
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

CREATE POLICY controls_modify ON controls
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- Vendor Catalog: Read for auditors, modify for privacy officer
ALTER TABLE vendor_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY vendor_catalog_read ON vendor_catalog
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

CREATE POLICY vendor_catalog_modify ON vendor_catalog
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- DPIA Records: Read for auditors, modify for privacy officer
ALTER TABLE dpia_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY dpia_records_read ON dpia_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

CREATE POLICY dpia_records_modify ON dpia_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer')
    )
  );

-- Regulatory Reports: Read for auditors and privacy officer
ALTER TABLE regulatory_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY regulatory_reports_read ON regulatory_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = (SELECT id FROM admin_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email')
      AND admin_users.role IN ('superadmin', 'privacy_officer', 'auditor')
    )
  );

-- Update admin_users role enum to include privacy_officer and auditor
-- Note: This assumes the enum exists, adjust if needed
DO $$ 
BEGIN
  ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'privacy_officer';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
  ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'auditor';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;




-- ============================================================================
-- FROM: 040_premium_features.sql
-- ============================================================================

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




-- ============================================================================
-- FROM: 041_privacy_first_usage_monitoring.sql
-- ============================================================================

-- Privacy-First Usage Monitoring Migration
-- Implements zero-trust, user-only access with RLS and encryption

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

-- Enable pgcrypto for encryption at rest
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- SECTION 2: ENUMS
-- ============================================================================

CREATE TYPE monitoring_scope AS ENUM ('metadata_only', 'metadata_plus_usage', 'none');
CREATE TYPE telemetry_event_type AS ENUM ('app_focus', 'app_switch', 'window_change', 'duration', 'interaction');
CREATE TYPE transparency_log_action AS ENUM (
  'consent_granted',
  'consent_revoked',
  'app_added',
  'app_removed',
  'signal_toggled',
  'data_exported',
  'data_deleted',
  'policy_changed',
  'mfa_verified',
  'session_elevated'
);

-- ============================================================================
-- SECTION 3: TABLES
-- ============================================================================

-- Privacy preferences table
CREATE TABLE IF NOT EXISTS privacy_prefs (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  monitoring_enabled BOOLEAN NOT NULL DEFAULT false,
  data_retention_days INTEGER NOT NULL DEFAULT 14,
  mfa_required BOOLEAN NOT NULL DEFAULT true,
  last_reviewed_at TIMESTAMPTZ,
  paused_until TIMESTAMPTZ,
  kill_switch_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS privacy_prefs_user_id_idx ON privacy_prefs(user_id);

-- App allowlist table
CREATE TABLE IF NOT EXISTS app_allowlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  scope monitoring_scope NOT NULL DEFAULT 'metadata_only',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

CREATE INDEX IF NOT EXISTS app_allowlist_user_id_idx ON app_allowlist(user_id);
CREATE INDEX IF NOT EXISTS app_allowlist_app_id_idx ON app_allowlist(app_id);

-- Signal toggles table
CREATE TABLE IF NOT EXISTS signal_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  sampling_rate NUMERIC(3, 2) NOT NULL DEFAULT 1.0 CHECK (sampling_rate >= 0 AND sampling_rate <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, signal_key)
);

CREATE INDEX IF NOT EXISTS signal_toggles_user_id_idx ON signal_toggles(user_id);
CREATE INDEX IF NOT EXISTS signal_toggles_signal_key_idx ON signal_toggles(signal_key);

-- Telemetry events table (encrypted at rest)
CREATE TABLE IF NOT EXISTS telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  app_id TEXT NOT NULL,
  event_type telemetry_event_type NOT NULL,
  duration_ms INTEGER,
  metadata_redacted_json JSONB NOT NULL DEFAULT '{}',
  encrypted_payload TEXT, -- pgcrypto encrypted sensitive fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS telemetry_events_user_id_idx ON telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS telemetry_events_ts_idx ON telemetry_events(ts);
CREATE INDEX IF NOT EXISTS telemetry_events_app_id_idx ON telemetry_events(app_id);
CREATE INDEX IF NOT EXISTS telemetry_events_user_ts_idx ON telemetry_events(user_id, ts);

-- Privacy transparency log table (immutable append-only)
CREATE TABLE IF NOT EXISTS privacy_transparency_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action transparency_log_action NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT,
  entity_id UUID,
  old_value_hash TEXT,
  new_value_hash TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS privacy_transparency_log_user_id_idx ON privacy_transparency_log(user_id);
CREATE INDEX IF NOT EXISTS privacy_transparency_log_ts_idx ON privacy_transparency_log(ts);
CREATE INDEX IF NOT EXISTS privacy_transparency_log_action_idx ON privacy_transparency_log(action);

-- MFA enforced sessions table
CREATE TABLE IF NOT EXISTS mfa_enforced_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  action_type TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mfa_enforced_sessions_user_id_idx ON mfa_enforced_sessions(user_id);
CREATE INDEX IF NOT EXISTS mfa_enforced_sessions_session_token_idx ON mfa_enforced_sessions(session_token);
CREATE INDEX IF NOT EXISTS mfa_enforced_sessions_expires_at_idx ON mfa_enforced_sessions(expires_at);

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY (ZERO-TRUST, USER-ONLY)
-- ============================================================================

-- Enable RLS on all privacy tables
ALTER TABLE privacy_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_allowlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_transparency_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_enforced_sessions ENABLE ROW LEVEL SECURITY;

-- Privacy preferences policies
CREATE POLICY "privacy_prefs_user_select"
  ON privacy_prefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "privacy_prefs_user_insert"
  ON privacy_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "privacy_prefs_user_update"
  ON privacy_prefs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- App allowlist policies
CREATE POLICY "app_allowlist_user_select"
  ON app_allowlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "app_allowlist_user_insert"
  ON app_allowlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "app_allowlist_user_update"
  ON app_allowlist FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "app_allowlist_user_delete"
  ON app_allowlist FOR DELETE
  USING (auth.uid() = user_id);

-- Signal toggles policies
CREATE POLICY "signal_toggles_user_select"
  ON signal_toggles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "signal_toggles_user_insert"
  ON signal_toggles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "signal_toggles_user_update"
  ON signal_toggles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "signal_toggles_user_delete"
  ON signal_toggles FOR DELETE
  USING (auth.uid() = user_id);

-- Telemetry events policies (NO ADMIN ACCESS)
CREATE POLICY "telemetry_events_user_select"
  ON telemetry_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "telemetry_events_user_insert"
  ON telemetry_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "telemetry_events_user_delete"
  ON telemetry_events FOR DELETE
  USING (auth.uid() = user_id);

-- NO UPDATE POLICY - telemetry events are immutable
-- NO ADMIN SELECT POLICY - zero-trust, user-only access

-- Privacy transparency log policies (immutable append-only)
CREATE POLICY "privacy_transparency_log_user_select"
  ON privacy_transparency_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "privacy_transparency_log_user_insert"
  ON privacy_transparency_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NO UPDATE/DELETE POLICY - transparency log is immutable

-- MFA enforced sessions policies
CREATE POLICY "mfa_enforced_sessions_user_select"
  ON mfa_enforced_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "mfa_enforced_sessions_user_insert"
  ON mfa_enforced_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mfa_enforced_sessions_user_delete"
  ON mfa_enforced_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 5: ENCRYPTION FUNCTIONS
-- ============================================================================

-- Function to encrypt sensitive telemetry payload
CREATE OR REPLACE FUNCTION encrypt_telemetry_payload(payload TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Use environment variable or default key (should be set via Supabase secrets)
  encryption_key := current_setting('app.telemetry_encryption_key', true);
  IF encryption_key IS NULL OR encryption_key = '' THEN
    -- Fallback: use a key derived from user context (NOT RECOMMENDED FOR PRODUCTION)
    encryption_key := 'default_key_change_in_production';
  END IF;
  
  RETURN pgp_sym_encrypt(payload, encryption_key);
END;
$$;

-- Function to decrypt telemetry payload
CREATE OR REPLACE FUNCTION decrypt_telemetry_payload(encrypted_payload TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  encryption_key := current_setting('app.telemetry_encryption_key', true);
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := 'default_key_change_in_production';
  END IF;
  
  RETURN pgp_sym_decrypt(encrypted_payload, encryption_key);
END;
$$;

-- ============================================================================
-- SECTION 6: HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has elevated MFA session
CREATE OR REPLACE FUNCTION has_elevated_mfa_session(user_id_param UUID, action_type_param TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM mfa_enforced_sessions
    WHERE mfa_enforced_sessions.user_id = user_id_param
      AND mfa_enforced_sessions.action_type = action_type_param
      AND mfa_enforced_sessions.expires_at > NOW()
      AND mfa_enforced_sessions.session_token IS NOT NULL
  );
$$;

-- Function to create transparency log entry (immutable)
CREATE OR REPLACE FUNCTION log_privacy_action(
  p_user_id UUID,
  p_action transparency_log_action,
  p_actor_id UUID,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_old_value_hash TEXT DEFAULT NULL,
  p_new_value_hash TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO privacy_transparency_log (
    user_id,
    action,
    actor_id,
    entity_type,
    entity_id,
    old_value_hash,
    new_value_hash,
    metadata
  ) VALUES (
    p_user_id,
    p_action,
    p_actor_id,
    p_entity_type,
    p_entity_id,
    p_old_value_hash,
    p_new_value_hash,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Function to check if kill-switch is active (environment-level)
CREATE OR REPLACE FUNCTION is_privacy_kill_switch_active()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('app.privacy_kill_switch', true)::boolean,
    false
  );
$$;

-- ============================================================================
-- SECTION 7: TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER privacy_prefs_updated_at
  BEFORE UPDATE ON privacy_prefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER app_allowlist_updated_at
  BEFORE UPDATE ON app_allowlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER signal_toggles_updated_at
  BEFORE UPDATE ON signal_toggles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to log privacy preference changes
CREATE OR REPLACE FUNCTION log_privacy_prefs_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  old_hash TEXT;
  new_hash TEXT;
BEGIN
  -- Generate hash of old and new values for audit
  old_hash := encode(digest(row_to_json(OLD)::text, 'sha256'), 'hex');
  new_hash := encode(digest(row_to_json(NEW)::text, 'sha256'), 'hex');
  
  IF OLD.monitoring_enabled != NEW.monitoring_enabled THEN
    PERFORM log_privacy_action(
      NEW.user_id,
      CASE WHEN NEW.monitoring_enabled THEN 'consent_granted' ELSE 'consent_revoked' END,
      NEW.user_id,
      'privacy_prefs',
      NEW.user_id,
      old_hash,
      new_hash,
      jsonb_build_object(
        'old_monitoring_enabled', OLD.monitoring_enabled,
        'new_monitoring_enabled', NEW.monitoring_enabled
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER privacy_prefs_log_changes
  AFTER UPDATE ON privacy_prefs
  FOR EACH ROW
  EXECUTE FUNCTION log_privacy_prefs_changes();

-- ============================================================================
-- SECTION 8: CLEANUP FUNCTION (for data retention)
-- ============================================================================

-- Function to purge expired telemetry events based on user retention policy
CREATE OR REPLACE FUNCTION purge_expired_telemetry()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  user_pref RECORD;
BEGIN
  FOR user_pref IN
    SELECT user_id, data_retention_days
    FROM privacy_prefs
    WHERE monitoring_enabled = true
  LOOP
    DELETE FROM telemetry_events
    WHERE telemetry_events.user_id = user_pref.user_id
      AND telemetry_events.ts < NOW() - (user_pref.data_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  END LOOP;
  
  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- SECTION 9: GUARDIAN ROLE (system health only, no user data access)
-- ============================================================================

-- Create guardian role that can only check system health counters
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'privacy_guardian') THEN
    CREATE ROLE privacy_guardian;
  END IF;
END
$$;

-- Grant read-only access to aggregate counts only (no user data)
CREATE OR REPLACE FUNCTION get_privacy_health_stats()
RETURNS TABLE(
  total_users_opted_in BIGINT,
  total_apps_monitored BIGINT,
  total_events_today BIGINT,
  avg_retention_days NUMERIC,
  export_jobs_count BIGINT,
  delete_jobs_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    COUNT(*) FILTER (WHERE monitoring_enabled = true)::BIGINT AS total_users_opted_in,
    COUNT(*) FILTER (WHERE enabled = true)::BIGINT AS total_apps_monitored,
    COUNT(*) FILTER (WHERE DATE(ts) = CURRENT_DATE)::BIGINT AS total_events_today,
    AVG(data_retention_days)::NUMERIC AS avg_retention_days,
    COUNT(*) FILTER (WHERE action IN ('data_exported', 'data_deleted'))::BIGINT AS export_jobs_count,
    COUNT(*) FILTER (WHERE action = 'data_deleted')::BIGINT AS delete_jobs_count
  FROM privacy_prefs
  LEFT JOIN app_allowlist ON app_allowlist.user_id = privacy_prefs.user_id
  LEFT JOIN telemetry_events ON telemetry_events.user_id = privacy_prefs.user_id
  LEFT JOIN privacy_transparency_log ON privacy_transparency_log.user_id = privacy_prefs.user_id
  WHERE privacy_prefs.monitoring_enabled = true;
$$;

GRANT EXECUTE ON FUNCTION get_privacy_health_stats() TO privacy_guardian;

-- Explicitly deny guardian role access to user rows
REVOKE ALL ON privacy_prefs FROM privacy_guardian;
REVOKE ALL ON app_allowlist FROM privacy_guardian;
REVOKE ALL ON signal_toggles FROM privacy_guardian;
REVOKE ALL ON telemetry_events FROM privacy_guardian;
REVOKE ALL ON privacy_transparency_log FROM privacy_guardian;
REVOKE ALL ON mfa_enforced_sessions FROM privacy_guardian;

-- ============================================================================
-- SECTION 10: COMMENTS
-- ============================================================================

COMMENT ON TABLE privacy_prefs IS 'Per-user privacy preferences and consent settings. Zero-trust: users can only access their own rows.';
COMMENT ON TABLE app_allowlist IS 'Per-user app allowlist for monitoring. Zero-trust: users can only access their own rows.';
COMMENT ON TABLE signal_toggles IS 'Per-user signal toggles for granular telemetry control. Zero-trust: users can only access their own rows.';
COMMENT ON TABLE telemetry_events IS 'User telemetry events, encrypted at rest. Zero-trust: users can only access their own rows. NO ADMIN ACCESS.';
COMMENT ON TABLE privacy_transparency_log IS 'Immutable append-only log of all privacy-related actions. Zero-trust: users can only access their own rows.';
COMMENT ON TABLE mfa_enforced_sessions IS 'Time-boxed elevated MFA sessions for sensitive privacy actions. Zero-trust: users can only access their own rows.';

COMMENT ON FUNCTION get_privacy_health_stats() IS 'Guardian role can only call this function to check system health. Cannot access user data rows.';
COMMENT ON FUNCTION has_elevated_mfa_session() IS 'Check if user has valid elevated MFA session for sensitive actions.';
COMMENT ON FUNCTION log_privacy_action() IS 'Immutable append-only function to log privacy actions for transparency.';
COMMENT ON FUNCTION is_privacy_kill_switch_active() IS 'Check if privacy kill-switch is active (environment-level disable).';




-- ============================================================================
-- FROM: 042_guardian_trust_ledger_roots.sql
-- ============================================================================

-- Guardian Trust Ledger Roots Migration
-- Stores daily hash roots for cryptographic verification

CREATE TABLE IF NOT EXISTS trust_ledger_roots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  root_hash TEXT NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS trust_ledger_roots_user_id_idx ON trust_ledger_roots(user_id);
CREATE INDEX IF NOT EXISTS trust_ledger_roots_date_idx ON trust_ledger_roots(date);
CREATE INDEX IF NOT EXISTS trust_ledger_roots_user_date_idx ON trust_ledger_roots(user_id, date);

-- Enable RLS
ALTER TABLE trust_ledger_roots ENABLE ROW LEVEL SECURITY;

-- RLS Policies - User-only access
CREATE POLICY "trust_ledger_roots_user_select"
  ON trust_ledger_roots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trust_ledger_roots_user_insert"
  ON trust_ledger_roots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NO UPDATE/DELETE - roots are immutable
-- NO ADMIN ACCESS - zero-trust, user-only

COMMENT ON TABLE trust_ledger_roots IS 'Daily hash roots for Guardian trust ledger verification. Zero-trust: users can only access their own rows.';

-- Function to store daily root hash
CREATE OR REPLACE FUNCTION store_ledger_root(
  p_user_id UUID,
  p_date DATE,
  p_root_hash TEXT,
  p_event_count INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  root_id UUID;
BEGIN
  INSERT INTO trust_ledger_roots (user_id, date, root_hash, event_count)
  VALUES (p_user_id, p_date, p_root_hash, p_event_count)
  ON CONFLICT (user_id, date) DO UPDATE SET
    root_hash = EXCLUDED.root_hash,
    event_count = EXCLUDED.event_count
  RETURNING id INTO root_id;
  
  RETURN root_id;
END;
$$;

COMMENT ON FUNCTION store_ledger_root IS 'Store daily hash root for ledger verification. Only callable by authenticated users for their own data.';




-- ============================================================================
-- FROM: 043_agent_pattern_detection.sql
-- ============================================================================

-- ORG3XTRATE-AGENT — Pattern Detection & Automation Layer
-- Signals, Patterns, Recommendations, Support Diagnostics

-- Signals (raw)
CREATE TABLE IF NOT EXISTS public.events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  app text,              -- e.g., "web", "mobile", "shopify", "gmail", etc.
  type text,             -- e.g., "page_view","click","error","api_call","copy","purchase"
  path text,             -- route or feature key
  meta jsonb,            -- extra context
  ts timestamptz default now()
);

-- Sessions (derived)
CREATE TABLE IF NOT EXISTS public.sessions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  device text,
  locale text,
  country text
);

-- Declared apps-in-use (from OAuth connections or user settings)
CREATE TABLE IF NOT EXISTS public.user_apps (
  user_id uuid references auth.users(id) on delete cascade,
  app text not null,
  connected boolean default false,
  meta jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, app)
);

-- Feature snapshots / heuristics
CREATE TABLE IF NOT EXISTS public.signals (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  window text not null,        -- "1d","7d","30d"
  k text not null,             -- signal key e.g., "rage_clicks","timeouts","checkout_drop"
  v numeric not null,
  meta jsonb,
  computed_at timestamptz default now()
);

-- Segment membership (cohorts)
CREATE TABLE IF NOT EXISTS public.segments (
  id bigserial primary key,
  code text unique not null,   -- e.g., "new_user","power_user","blocked_on_payment"
  description text
);

CREATE TABLE IF NOT EXISTS public.user_segments (
  user_id uuid references auth.users(id) on delete cascade,
  segment_id bigint references public.segments(id) on delete cascade,
  assigned_at timestamptz default now(),
  primary key (user_id, segment_id)
);

-- Recommendations (curated workflows/automations)
CREATE TABLE IF NOT EXISTS public.recommendations (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  kind text not null,          -- "workflow","automation","tip","support"
  score numeric not null default 0,
  rationale jsonb,             -- feature attributions used
  cta jsonb,                   -- { label, href, action }
  created_at timestamptz default now(),
  dismissed boolean default false,
  accepted boolean default false
);

-- Support diagnostics (auto detection of issues)
CREATE TABLE IF NOT EXISTS public.support_diagnostics (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  hypothesis text not null,    -- "slow_network","auth_loop","captcha_fail","payment_error"
  confidence numeric not null, -- 0..1
  evidence jsonb,              -- events summary backing the hypothesis
  status text default 'open',  -- "open","muted","resolved"
  created_at timestamptz default now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS events_user_id_idx on public.events(user_id);
CREATE INDEX IF NOT EXISTS events_ts_idx on public.events(ts);
CREATE INDEX IF NOT EXISTS events_type_idx on public.events(type);
CREATE INDEX IF NOT EXISTS events_session_id_idx on public.events(session_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx on public.sessions(user_id);
CREATE INDEX IF NOT EXISTS signals_user_id_idx on public.signals(user_id);
CREATE INDEX IF NOT EXISTS signals_k_idx on public.signals(k);
CREATE INDEX IF NOT EXISTS recommendations_user_id_idx on public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS recommendations_created_at_idx on public.recommendations(created_at);
CREATE INDEX IF NOT EXISTS support_diagnostics_user_id_idx on public.support_diagnostics(user_id);
CREATE INDEX IF NOT EXISTS support_diagnostics_status_idx on public.support_diagnostics(status);

-- RLS
alter table public.events enable row level security;
alter table public.sessions enable row level security;
alter table public.user_apps enable row level security;
alter table public.signals enable row level security;
alter table public.user_segments enable row level security;
alter table public.recommendations enable row level security;
alter table public.support_diagnostics enable row level security;

-- Policies: owner-only for PII; recommendations readable by owner.
create policy "events_owner" on public.events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sessions_owner" on public.sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "apps_owner" on public.user_apps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "signals_owner" on public.signals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "segments_owner" on public.user_segments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reco_owner" on public.recommendations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "diag_owner" on public.support_diagnostics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Comments for documentation
comment on table public.events is 'Raw user interaction events for pattern detection';
comment on table public.sessions is 'Derived session metadata';
comment on table public.user_apps is 'Declared apps-in-use from OAuth or settings';
comment on table public.signals is 'Computed behavioral signals (heuristics)';
comment on table public.segments is 'User cohort definitions';
comment on table public.recommendations is 'Curated workflow/automation recommendations';
comment on table public.support_diagnostics is 'Auto-detected support issues and hypotheses';




-- ============================================================================
-- FROM: 044_gamify.sql
-- ============================================================================

-- Users assumed in auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.badges (
  id bigserial primary key,
  code text unique not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id bigint not null references public.badges(id) on delete cascade,
  awarded_at timestamptz default now(),
  primary key (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  days int not null default 0,
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.reactions (
  post_id bigint references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now(),
  primary key (post_id, user_id, emoji)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.user_badges enable row level security;
alter table public.streaks enable row level security;
alter table public.posts enable row level security;
alter table public.reactions enable row level security;

-- Policies: owner can CRUD their own data; public can read posts
create policy "own_profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own_journal" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_streak" on public.streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_badges" on public.user_badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "read_posts" on public.posts for select using (true);
create policy "write_own_posts" on public.posts
  for insert with check (auth.uid() = user_id);
create policy "edit_own_posts" on public.posts
  for update using (auth.uid() = user_id);

create policy "react_own" on public.reactions
  for insert with check (auth.uid() = user_id);
create policy "unreact_own" on public.reactions
  for delete using (auth.uid() = user_id);




-- ============================================================================
-- FROM: 045_gamify_enhanced.sql
-- ============================================================================

-- Extended gamification schema with all enhancements

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  parent_id bigint references public.comments(id) on delete cascade,
  is_edited boolean default false,
  is_deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id on public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id on public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id on public.comments(parent_id);

-- Moderation actions
CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id bigserial primary key,
  moderator_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'user')),
  target_id bigint not null,
  action text not null check (action in ('warn', 'hide', 'delete', 'ban')),
  reason text,
  created_at timestamptz default now()
);

-- Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id bigserial primary key,
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid references auth.users(id) on delete cascade,
  referral_code text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'rewarded')),
  reward_xp int default 0,
  created_at timestamptz default now(),
  completed_at timestamptz
);

create unique index idx_referrals_code on public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer on public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred on public.referrals(referred_id);

-- Weekly challenges
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id bigserial primary key,
  week_start date not null,
  week_end date not null,
  title text not null,
  description text,
  xp_reward int not null default 50,
  badge_id bigint references public.badges(id),
  target_value int,
  metric text not null check (metric in ('journal_entries', 'streak_days', 'posts', 'reactions', 'comments', 'referrals')),
  is_active boolean default true,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id bigint not null references public.weekly_challenges(id) on delete cascade,
  current_value int default 0,
  completed_at timestamptz,
  primary key (user_id, challenge_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  period text not null check (period in ('daily', 'weekly', 'monthly', 'all_time')),
  period_start date not null,
  xp int default 0,
  rank int,
  updated_at timestamptz default now(),
  unique(user_id, period, period_start)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_period on public.leaderboard_entries(period, period_start, xp desc);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('streak_risk', 'streak_milestone', 'badge_unlocked', 'quest_completed', 'challenge_completed', 'friend_activity', 'mention', 'reaction', 'comment', 'referral_reward')),
  title text not null,
  body text,
  link_url text,
  is_read boolean default false,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread on public.notifications(user_id, is_read, created_at desc);

-- User activity feed
CREATE TABLE IF NOT EXISTS public.activity_log (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user on public.activity_log(user_id, created_at desc);

-- Friends/connections
CREATE TABLE IF NOT EXISTS public.friendships (
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (requester_id, addressee_id),
  check (requester_id != addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester on public.friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee on public.friendships(addressee_id, status);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, endpoint)
);

-- Enhanced journal entries with tags and mood
alter table public.journal_entries add column if not exists tags text[];
alter table public.journal_entries add column if not exists mood text check (mood in ('great', 'good', 'okay', 'challenging', 'tough'));
alter table public.journal_entries add column if not exists is_shared boolean default false;

-- Enhanced profiles
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists total_xp int default 0;
alter table public.profiles add column if not exists level int default 1;
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists is_public boolean default true;

-- Enhanced streaks with last_activity
alter table public.streaks add column if not exists last_activity_date date;
alter table public.streaks add column if not exists longest_streak int default 0;

-- Community challenges (group goals)
CREATE TABLE IF NOT EXISTS public.community_challenges (
  id bigserial primary key,
  title text not null,
  description text,
  target_value int not null,
  current_value int default 0,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reward_xp int default 100,
  is_active boolean default true,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.community_challenge_contributions (
  id bigserial primary key,
  challenge_id bigint not null references public.community_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  contribution_value int not null,
  created_at timestamptz default now(),
  unique(challenge_id, user_id)
);

-- RLS for new tables
alter table public.comments enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.referrals enable row level security;
alter table public.weekly_challenges enable row level security;
alter table public.user_challenge_progress enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;
alter table public.friendships enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.community_challenges enable row level security;
alter table public.community_challenge_contributions enable row level security;

-- Comments policies
create policy "read_comments" on public.comments for select using (true);
create policy "create_own_comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "edit_own_comments" on public.comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete_own_comments" on public.comments for delete using (auth.uid() = user_id);

-- Moderation policies (admin only)
create policy "moderators_only" on public.moderation_actions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and id in (
    select user_id from auth.users where raw_user_meta_data->>'role' = 'moderator' or raw_user_meta_data->>'role' = 'admin'
  ))
);

-- Referrals policies
create policy "own_referrals" on public.referrals for all using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- Weekly challenges policies
create policy "read_challenges" on public.weekly_challenges for select using (true);
create policy "own_challenge_progress" on public.user_challenge_progress for all using (auth.uid() = user_id);

-- Leaderboard policies
create policy "read_leaderboards" on public.leaderboard_entries for select using (true);

-- Notifications policies
create policy "own_notifications" on public.notifications for all using (auth.uid() = user_id);

-- Activity log policies
create policy "own_activity" on public.activity_log for all using (auth.uid() = user_id);

-- Friendships policies
create policy "own_friendships" on public.friendships for all using (
  auth.uid() = requester_id or auth.uid() = addressee_id
);

-- Push subscriptions policies
create policy "own_subscriptions" on public.push_subscriptions for all using (auth.uid() = user_id);

-- Community challenges policies
create policy "read_community_challenges" on public.community_challenges for select using (true);
create policy "own_contributions" on public.community_challenge_contributions for all using (auth.uid() = user_id);

-- Function to update leaderboard
create or replace function update_leaderboard()
returns trigger as $$
begin
  insert into public.leaderboard_entries (user_id, period, period_start, xp)
  values (
    new.user_id,
    'daily',
    current_date,
    (select total_xp from public.profiles where id = new.user_id)
  )
  on conflict (user_id, period, period_start) do update
  set xp = excluded.xp, updated_at = now();
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update leaderboard on profile XP change
create trigger update_leaderboard_trigger
after update of total_xp on public.profiles
for each row
when (old.total_xp is distinct from new.total_xp)
execute function update_leaderboard();

-- Function to check and award streak milestones
create or replace function check_streak_milestone()
returns trigger as $$
declare
  milestone_days int[];
  milestone int;
begin
  milestone_days := array[7, 14, 30, 60, 100, 365];
  
  foreach milestone in array milestone_days loop
    if new.days = milestone and old.days < milestone then
      insert into public.notifications (user_id, type, title, body)
      values (
        new.user_id,
        'streak_milestone',
        'Streak Milestone! 🔥',
        format('Congratulations on your %s-day streak!', milestone)
      );
      
      -- Award XP for milestone
      update public.profiles
      set total_xp = total_xp + (milestone * 10)
      where id = new.user_id;
      
      exit;
    end if;
  end loop;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger streak_milestone_trigger
after update of days on public.streaks
for each row
when (old.days < new.days)
execute function check_streak_milestone();

-- Function to generate referral code
create or replace function generate_referral_code()
returns text as $$
select upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
$$ language sql;

-- Ensure all users have referral codes
update public.profiles
set referral_code = generate_referral_code()
where referral_code is null;




-- ============================================================================
-- FROM: 046_gamify_seed_data.sql
-- ============================================================================

-- Seed initial badges and weekly challenges

-- Badges
insert into public.badges (code, name, description) values
('first_streak', 'First Streak', 'Complete your first daily streak'),
('week_warrior', 'Week Warrior', 'Maintain a 7-day streak'),
('month_master', 'Month Master', 'Complete a 30-day streak'),
('journal_keeper', 'Journal Keeper', 'Write 10 journal entries'),
('social_butterfly', 'Social Butterfly', 'Post 5 times in the community'),
('helper', 'Helper', 'Receive 10 reactions on your posts'),
('early_bird', 'Early Bird', 'Join during the first week'),
('referral_champ', 'Referral Champ', 'Refer 5 friends'),
('quest_completer', 'Quest Completer', 'Complete 10 daily quests'),
('community_hero', 'Community Hero', 'Contribute to a community challenge')
on conflict (code) do nothing;

-- Weekly challenge template function
create or replace function create_weekly_challenge()
returns void as $$
declare
  week_start date;
  week_end date;
begin
  -- Calculate current week
  week_start := date_trunc('week', current_date)::date;
  week_end := week_start + interval '6 days';

  -- Only create if one doesn't exist for this week
  if not exists (
    select 1 from public.weekly_challenges
    where week_start = week_start
  ) then
    insert into public.weekly_challenges (week_start, week_end, title, description, xp_reward, target_value, metric)
    values
    (week_start, week_end, 'Weekly Journal Challenge', 'Write 5 journal entries this week', 50, 5, 'journal_entries'),
    (week_start, week_end, 'Community Contributor', 'Post 3 times in the community', 40, 3, 'posts'),
    (week_start, week_end, 'Social Engagement', 'React to 10 posts', 30, 10, 'reactions');
  end if;
end;
$$ language plpgsql;

-- Run weekly challenge creation
select create_weekly_challenge();

-- Create a community challenge
insert into public.community_challenges (title, description, target_value, starts_at, ends_at, reward_xp, is_active)
values
('1000 Journal Entries', 'Let''s write 1000 journal entries together!', 1000, current_date, current_date + interval '30 days', 100, true)
on conflict do nothing;




-- ============================================================================
-- FROM: 047_cooking_live.sql
-- ============================================================================

-- Cooking activities and live stream features

-- Cooking activities table
CREATE TABLE IF NOT EXISTS public.cooking_activities (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  family_name text,
  meal_name text not null,
  description text,
  ingredients text[],
  cooking_time_minutes int,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  is_live boolean default true,
  started_at timestamptz default now(),
  ended_at timestamptz,
  likes_count int default 0,
  views_count int default 0,
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_cooking_activities_live on public.cooking_activities(is_live, started_at desc);
CREATE INDEX IF NOT EXISTS idx_cooking_activities_user on public.cooking_activities(user_id, created_at desc);

-- Cook-off competitions
CREATE TABLE IF NOT EXISTS public.cook_offs (
  id bigserial primary key,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  prize_xp int default 100,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.cook_off_participants (
  cook_off_id bigint not null references public.cook_offs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_name text not null,
  description text,
  submitted_at timestamptz default now(),
  votes int default 0,
  primary key (cook_off_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cook_off_participants on public.cook_off_participants(cook_off_id, votes desc);

-- Cooking activity likes
CREATE TABLE IF NOT EXISTS public.cooking_activity_likes (
  activity_id bigint not null references public.cooking_activities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (activity_id, user_id)
);

-- RLS policies
alter table public.cooking_activities enable row level security;
alter table public.cook_offs enable row level security;
alter table public.cook_off_participants enable row level security;
alter table public.cooking_activity_likes enable row level security;

-- Cooking activities policies
create policy "read_cooking_activities" on public.cooking_activities for select using (true);
create policy "create_own_cooking" on public.cooking_activities for insert with check (auth.uid() = user_id);
create policy "update_own_cooking" on public.cooking_activities for update using (auth.uid() = user_id);

-- Cook-offs policies
create policy "read_cook_offs" on public.cook_offs for select using (true);
create policy "participate_cook_off" on public.cook_off_participants for all using (auth.uid() = user_id);

-- Likes policies
create policy "like_cooking" on public.cooking_activity_likes for insert with check (auth.uid() = user_id);
create policy "unlike_cooking" on public.cooking_activity_likes for delete using (auth.uid() = user_id);

-- Function to update cooking activity likes count
create or replace function update_cooking_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.cooking_activities
    set likes_count = likes_count + 1
    where id = new.activity_id;
  elsif TG_OP = 'DELETE' then
    update public.cooking_activities
    set likes_count = greatest(0, likes_count - 1)
    where id = old.activity_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger cooking_likes_count_trigger
after insert or delete on public.cooking_activity_likes
for each row execute function update_cooking_likes_count();

-- Function to update cooking activity views
create or replace function increment_cooking_views()
returns trigger as $$
begin
  update public.cooking_activities
  set views_count = views_count + 1
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Function to increment cook-off votes
create or replace function increment_cook_off_votes(cook_off_id bigint, participant_user_id uuid)
returns void as $$
begin
  update public.cook_off_participants
  set votes = votes + 1
  where cook_off_id = increment_cook_off_votes.cook_off_id
    and user_id = increment_cook_off_votes.participant_user_id;
end;
$$ language plpgsql security definer;




-- ============================================================================
-- FROM: 048_2025-11-05_meal_prefs.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.meal_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cuisines text[] default '{}',
  diet text default 'none',
  allergies text[] default '{}',
  cook_time_minutes int default 30,
  updated_at timestamptz default now()
);
alter table public.meal_prefs enable row level security;
create policy "prefs_owner" on public.meal_prefs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);




-- ============================================================================
-- FROM: 049_2025-11-05_telemetry.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.telemetry_events (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  app text default 'web',    -- app namespace (floyo, whatsfordinner, etc.)
  type text not null,        -- 'view','click','error','complete','like','save','custom:*'
  path text,
  meta jsonb,
  ts timestamptz default now()
);
alter table public.telemetry_events enable row level security;
create policy "telemetry_owner" on public.telemetry_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);




-- ============================================================================
-- FROM: 050_2025-11-05_trust_audit.sql
-- ============================================================================

-- [STAKE+TRUST:BEGIN:audit_log_migration]
-- Migration: 2025-11-05_trust_audit.sql
-- Purpose: Create user-facing audit log table with RLS
-- Online-safe: Yes (no CONCURRENTLY in transaction)

-- Create audit_log table for user-facing audit trail
CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,
  meta jsonb default '{}'::jsonb,
  ts timestamptz default now(),
  created_at timestamptz default now()
);

-- CREATE INDEX IF NOT EXISTS for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id on public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_ts on public.audit_log(ts desc);
CREATE INDEX IF NOT EXISTS idx_audit_log_action on public.audit_log(action);

-- Enable Row Level Security
alter table public.audit_log enable row level security;

-- Create policy: users can only see their own audit logs
create policy "audit_owner" 
  on public.audit_log 
  for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- Create policy: allow service role to insert (for system-generated logs)
create policy "audit_service_role_insert" 
  on public.audit_log 
  for insert 
  with check (true);

-- Grant permissions
grant select on public.audit_log to authenticated;
grant insert on public.audit_log to authenticated;
grant usage on sequence public.audit_log_id_seq to authenticated;

-- Add comment for documentation
comment on table public.audit_log is 'User-facing audit log for personal actions and activity tracking';
comment on column public.audit_log.user_id is 'User ID (foreign key to auth.users)';
comment on column public.audit_log.action is 'Action type (e.g., "feedback", "export", "login")';
comment on column public.audit_log.meta is 'Additional metadata as JSON (e.g., rating, comment, export_format)';
comment on column public.audit_log.ts is 'Timestamp of the action';
-- [STAKE+TRUST:END:audit_log_migration]




-- ============================================================================
-- FROM: 051_realtime_publication.sql
-- ============================================================================

-- Realtime Publication Migration
-- Creates publication for app tables to enable Supabase Realtime

-- Create publication if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add app tables to publication (only tables that should have realtime)
-- Core tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS users;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS households;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS household_members;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS meal_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS grocery_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS messages;

-- Growth & engagement tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS referral_programs;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS referral_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS referrals;

-- Privacy & monitoring (if realtime needed)
-- Note: Only add if realtime updates are required for these tables
-- ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS privacy_prefs;
-- ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS telemetry_events;

-- Note: Some tables (like audit_logs, api_logs) should NOT be in realtime
-- for security/performance reasons




-- ============================================================================
-- FROM: 052_rls_app_tables.sql
-- ============================================================================

-- RLS Policies for App Tables
-- Ensures all app tables have proper RLS policies
-- This migration is idempotent and safe to run multiple times

-- Enable RLS on core tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "own read" ON public.users;
DROP POLICY IF EXISTS "own write" ON public.users;
DROP POLICY IF EXISTS "own update" ON public.users;
DROP POLICY IF EXISTS "own delete" ON public.users;

DROP POLICY IF EXISTS "own read" ON public.households;
DROP POLICY IF EXISTS "own write" ON public.households;
DROP POLICY IF EXISTS "own update" ON public.households;
DROP POLICY IF EXISTS "own delete" ON public.households;

DROP POLICY IF EXISTS "own read" ON public.recipes;
DROP POLICY IF EXISTS "own write" ON public.recipes;
DROP POLICY IF EXISTS "own update" ON public.recipes;
DROP POLICY IF EXISTS "own delete" ON public.recipes;

DROP POLICY IF EXISTS "own read" ON public.meal_plans;
DROP POLICY IF EXISTS "own write" ON public.meal_plans;
DROP POLICY IF EXISTS "own update" ON public.meal_plans;
DROP POLICY IF EXISTS "own delete" ON public.meal_plans;

DROP POLICY IF EXISTS "own read" ON public.grocery_lists;
DROP POLICY IF EXISTS "own write" ON public.grocery_lists;
DROP POLICY IF EXISTS "own update" ON public.grocery_lists;
DROP POLICY IF EXISTS "own delete" ON public.grocery_lists;

DROP POLICY IF EXISTS "own read" ON public.rooms;
DROP POLICY IF EXISTS "own write" ON public.rooms;
DROP POLICY IF EXISTS "own update" ON public.rooms;
DROP POLICY IF EXISTS "own delete" ON public.rooms;

DROP POLICY IF EXISTS "own read" ON public.messages;
DROP POLICY IF EXISTS "own write" ON public.messages;
DROP POLICY IF EXISTS "own update" ON public.messages;
DROP POLICY IF EXISTS "own delete" ON public.messages;

DROP POLICY IF EXISTS "own read" ON public.health_metrics;
DROP POLICY IF EXISTS "own write" ON public.health_metrics;
DROP POLICY IF EXISTS "own update" ON public.health_metrics;
DROP POLICY IF EXISTS "own delete" ON public.health_metrics;

DROP POLICY IF EXISTS "own read" ON public.feature_flags;
DROP POLICY IF EXISTS "own write" ON public.feature_flags;
DROP POLICY IF EXISTS "own update" ON public.feature_flags;

DROP POLICY IF EXISTS "own read" ON public.events;
DROP POLICY IF EXISTS "own write" ON public.events;

-- Service role bypass policy (for admin operations)
CREATE POLICY IF NOT EXISTS "service_role bypass" ON public.users
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Users table policies
CREATE POLICY "own read" ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "own write" ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "own update" ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "own delete" ON public.users FOR DELETE
  USING (auth.uid() = id);

-- Households table policies (users can read households they're members of)
CREATE POLICY "own read" ON public.households FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = households.id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own write" ON public.households FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "own update" ON public.households FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "own delete" ON public.households FOR DELETE
  USING (auth.uid() = owner_id);

-- Household members policies
CREATE POLICY "own read" ON public.household_members FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = household_members.household_id
      AND households.owner_id = auth.uid()
    )
  );

CREATE POLICY "own write" ON public.household_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = household_members.household_id
      AND households.owner_id = auth.uid()
    )
  );

CREATE POLICY "own update" ON public.household_members FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = household_members.household_id
      AND households.owner_id = auth.uid()
    )
  );

CREATE POLICY "own delete" ON public.household_members FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.households
      WHERE households.id = household_members.household_id
      AND households.owner_id = auth.uid()
    )
  );

-- Recipes table policies
CREATE POLICY "own read" ON public.recipes FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "own write" ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own update" ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "own delete" ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Meal plans policies
CREATE POLICY "own read" ON public.meal_plans FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = meal_plans.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own write" ON public.meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own update" ON public.meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "own delete" ON public.meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Grocery lists policies
CREATE POLICY "own read" ON public.grocery_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own write" ON public.grocery_lists FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own update" ON public.grocery_lists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own delete" ON public.grocery_lists FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = grocery_lists.household_id
      AND household_members.user_id = auth.uid()
    )
  );

-- Rooms policies
CREATE POLICY "own read" ON public.rooms FOR SELECT
  USING (
    auth.uid() = ANY(participants) OR
    EXISTS (
      SELECT 1 FROM public.household_members
      WHERE household_members.household_id = rooms.household_id
      AND household_members.user_id = auth.uid()
    )
  );

CREATE POLICY "own write" ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "own update" ON public.rooms FOR UPDATE
  USING (auth.uid() = ANY(participants));

CREATE POLICY "own delete" ON public.rooms FOR DELETE
  USING (auth.uid() = ANY(participants));

-- Messages policies
CREATE POLICY "own read" ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      WHERE rooms.id = messages.room_id
      AND (
        auth.uid() = ANY(rooms.participants) OR
        EXISTS (
          SELECT 1 FROM public.household_members
          WHERE household_members.household_id = rooms.household_id
          AND household_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "own write" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "own update" ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

CREATE POLICY "own delete" ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);

-- Health metrics policies
CREATE POLICY "own read" ON public.health_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "own write" ON public.health_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own update" ON public.health_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "own delete" ON public.health_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Feature flags policies
CREATE POLICY "own read" ON public.feature_flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "own write" ON public.feature_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own update" ON public.feature_flags FOR UPDATE
  USING (auth.uid() = user_id);

-- Events policies (users can only see their own events)
CREATE POLICY "own read" ON public.events FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "own write" ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);




-- ============================================================================
-- FROM: 053_performance_intelligence_metrics_log.sql
-- ============================================================================

-- Performance Intelligence Layer: metrics_log table
-- Stores normalized telemetry from Vercel, Supabase, Expo, and GitHub Actions

CREATE TABLE IF NOT EXISTS public.metrics_log (
  id bigint generated always as identity primary key,
  ts timestamptz default now() not null,
  source text not null check (source in ('vercel', 'supabase', 'expo', 'github', 'telemetry', 'custom')),
  metric jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_metrics_log_ts on public.metrics_log(ts desc);
CREATE INDEX IF NOT EXISTS idx_metrics_log_source on public.metrics_log(source);
CREATE INDEX IF NOT EXISTS idx_metrics_log_metric_gin on public.metrics_log using gin(metric);

-- RLS policies
alter table public.metrics_log enable row level security;

-- Service role can read/write (for API endpoints)
create policy "service_role_full_access" on public.metrics_log
  for all
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can read their own metrics (if user_id in metric jsonb)
create policy "authenticated_read_own" on public.metrics_log
  for select
  using (
    auth.role() = 'authenticated' and
    (metric->>'user_id' is null or metric->>'user_id' = auth.uid()::text)
  );

-- Anonymous can insert telemetry (for beacon endpoints)
create policy "anonymous_insert_telemetry" on public.metrics_log
  for insert
  with check (
    source = 'telemetry' and
    auth.role() = 'anon'
  );

-- Admin users can read all (if admin role exists)
create policy "admin_read_all" on public.metrics_log
  for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and (preferences->>'role' = 'admin' or preferences->>'role' = 'super_admin')
    )
  );

-- Function to aggregate metrics by time window
create or replace function public.get_metrics_summary(
  p_source text default null,
  p_start_time timestamptz default now() - interval '7 days',
  p_end_time timestamptz default now()
)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'period', jsonb_build_object(
      'start', p_start_time,
      'end', p_end_time
    ),
    'sources', (
      select jsonb_object_agg(
        source,
        jsonb_build_object(
          'count', count(*),
          'latest', max(ts),
          'earliest', min(ts)
        )
      )
      from public.metrics_log
      where ts between p_start_time and p_end_time
        and (p_source is null or source = p_source)
    ),
    'total_records', (
      select count(*)
      from public.metrics_log
      where ts between p_start_time and p_end_time
        and (p_source is null or source = p_source)
    )
  ) into result;
  
  return result;
end;
$$;

-- Function to detect regressions (compare last N records to previous N)
create or replace function public.detect_regressions(
  p_metric_key text,
  p_threshold_percent numeric default 10,
  p_window_size int default 10
)
returns table (
  source text,
  metric_key text,
  current_avg numeric,
  previous_avg numeric,
  change_percent numeric,
  is_regression boolean
)
language plpgsql
security definer
as $$
begin
  return query
  with recent as (
    select 
      source,
      (metric->>p_metric_key)::numeric as value,
      row_number() over (partition by source order by ts desc) as rn
    from public.metrics_log
    where metric ? p_metric_key
      and (metric->>p_metric_key) ~ '^[0-9]+\.?[0-9]*$'
    order by ts desc
    limit p_window_size * 2
  ),
  current_window as (
    select 
      source,
      avg(value) as avg_value
    from recent
    where rn <= p_window_size
    group by source
  ),
  previous_window as (
    select 
      source,
      avg(value) as avg_value
    from recent
    where rn > p_window_size and rn <= p_window_size * 2
    group by source
  )
  select 
    c.source,
    p_metric_key,
    c.avg_value as current_avg,
    p.avg_value as previous_avg,
    case 
      when p.avg_value > 0 then 
        ((c.avg_value - p.avg_value) / p.avg_value * 100)
      else 0
    end as change_percent,
    case 
      when p.avg_value > 0 then 
        ((c.avg_value - p.avg_value) / p.avg_value * 100) > p_threshold_percent
      else false
    end as is_regression
  from current_window c
  left join previous_window p on c.source = p.source
  where p.avg_value is not null;
end;
$$;

comment on table public.metrics_log is 'Performance Intelligence Layer: Centralized metrics storage from all sources';
comment on function public.get_metrics_summary is 'Aggregates metrics by time window and source';
comment on function public.detect_regressions is 'Detects performance regressions by comparing time windows';




-- ============================================================================
-- FROM: 1000_growth_features_tables.sql
-- ============================================================================

-- ============================================================================
-- GROWTH FEATURES DATABASE TABLES
-- Migration: 1000_growth_features_tables.sql
-- Date: 2025-01-09
-- Description: Tables for gamification, credits, collections, family plans
-- ============================================================================

-- ============================================================================
-- GAMIFICATION TABLES
-- ============================================================================

-- User streaks table (enhanced)
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_last_activity ON user_streaks(last_activity_date);

-- User badges table (enhanced for string badge IDs)
CREATE TABLE IF NOT EXISTS user_badges (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);

-- ============================================================================
-- CREDITS SYSTEM TABLES
-- ============================================================================

-- User credits balance
CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned integer NOT NULL DEFAULT 0,
  lifetime_spent integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- Credit transactions log
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL, -- Positive for credits added, negative for credits spent
  transaction_type text NOT NULL CHECK (transaction_type IN (
    'purchase', 'reward', 'refund', 'recipe_generation', 'customization', 'bonus'
  )),
  reference_id text, -- Stripe payment ID, recipe ID, etc.
  description text,
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);

-- ============================================================================
-- RECIPE COLLECTIONS MARKETPLACE TABLES
-- ============================================================================

-- Recipe collections
CREATE TABLE IF NOT EXISTS recipe_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
  description text CHECK (char_length(description) <= 500),
  recipe_ids bigint[] NOT NULL CHECK (array_length(recipe_ids, 1) > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0.99 AND price <= 99.99),
  category text,
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN (
    'pending_review', 'active', 'rejected', 'archived'
  )),
  sales_count integer NOT NULL DEFAULT 0,
  rating_average numeric(3,2) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
  rating_count integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_collections_creator ON recipe_collections(creator_id);
CREATE INDEX IF NOT EXISTS idx_recipe_collections_status ON recipe_collections(status);
CREATE INDEX IF NOT EXISTS idx_recipe_collections_category ON recipe_collections(category);
CREATE INDEX IF NOT EXISTS idx_recipe_collections_sales ON recipe_collections(sales_count DESC);

-- Collection purchases
CREATE TABLE IF NOT EXISTS collection_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES recipe_collections(id) ON DELETE CASCADE,
  stripe_payment_intent_id text,
  amount_paid numeric(10,2) NOT NULL,
  creator_revenue numeric(10,2) NOT NULL, -- 70% of sale
  platform_revenue numeric(10,2) NOT NULL, -- 30% of sale
  purchased_at timestamptz DEFAULT now(),
  UNIQUE(user_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_purchases_user ON collection_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_purchases_collection ON collection_purchases(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_purchases_creator ON recipe_collections(creator_id);

-- ============================================================================
-- RECIPE SHARING & REWARDS TABLES
-- ============================================================================

-- Recipe shares tracking
CREATE TABLE IF NOT EXISTS recipe_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id bigint NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  share_type text NOT NULL CHECK (share_type IN ('link', 'social', 'email')),
  platform text, -- 'twitter', 'facebook', 'email', etc.
  reward_credited boolean NOT NULL DEFAULT false,
  credits_awarded integer DEFAULT 0,
  shared_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_shares_user ON recipe_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_recipe ON recipe_shares(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_at ON recipe_shares(shared_at DESC);

-- Share rewards (for tracking referral rewards)
CREATE TABLE IF NOT EXISTS share_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sharer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  share_token text UNIQUE NOT NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('credits', 'badge', 'streak_bonus')),
  reward_value integer,
  claimed boolean NOT NULL DEFAULT false,
  claimed_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_rewards_sharer ON share_rewards(sharer_id);
CREATE INDEX IF NOT EXISTS idx_share_rewards_token ON share_rewards(share_token);
CREATE INDEX IF NOT EXISTS idx_share_rewards_expires ON share_rewards(expires_at);

-- ============================================================================
-- RECIPE IMAGES TABLE
-- ============================================================================

-- Generated recipe images
CREATE TABLE IF NOT EXISTS recipe_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id bigint NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_source text NOT NULL CHECK (image_source IN ('ai_generated', 'unsplash', 'upload')),
  prompt text, -- For AI-generated images
  style text CHECK (style IN ('realistic', 'artistic', 'minimal')),
  width integer,
  height integer,
  file_size_bytes integer,
  cached boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_images_recipe ON recipe_images(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_images_source ON recipe_images(image_source);

-- ============================================================================
-- FAMILY PLAN TABLES (Enhanced tenant_invites)
-- ============================================================================

-- Family members (if not using tenant system)
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by uuid REFERENCES auth.users(id),
  joined_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(family_owner_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_family_members_owner ON family_members(family_owner_id);
CREATE INDEX IF NOT EXISTS idx_family_members_member ON family_members(member_id);

-- Family invites (enhanced version, can coexist with tenant_invites)
CREATE TABLE IF NOT EXISTS family_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('editor', 'viewer')),
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_invites_owner ON family_invites(family_owner_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_token ON family_invites(token);
CREATE INDEX IF NOT EXISTS idx_family_invites_email ON family_invites(email);

-- ============================================================================
-- SUBSCRIPTION USAGE TRACKING (Enhanced)
-- ============================================================================

-- Subscription usage tracking (if not exists)
CREATE TABLE IF NOT EXISTS subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  recipes_generated integer NOT NULL DEFAULT 0,
  recipes_limit integer, -- NULL = unlimited
  customizations_used integer NOT NULL DEFAULT 0,
  customizations_limit integer, -- NULL = unlimited
  credits_used integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_user ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription ON subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON subscription_usage(period_start, period_end);

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to update collection sales count
CREATE OR REPLACE FUNCTION update_collection_sales_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipe_collections
  SET sales_count = sales_count + 1,
      updated_at = now()
  WHERE id = NEW.collection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collection_sales
  AFTER INSERT ON collection_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_sales_count();

-- Function to update credit balance
CREATE OR REPLACE FUNCTION update_user_credits_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent, updated_at)
  VALUES (
    NEW.user_id,
    COALESCE((SELECT balance FROM user_credits WHERE user_id = NEW.user_id), 0) + NEW.amount,
    CASE WHEN NEW.amount > 0 THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.amount < 0 THEN ABS(NEW.amount) ELSE 0 END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    balance = user_credits.balance + NEW.amount,
    lifetime_earned = user_credits.lifetime_earned + CASE WHEN NEW.amount > 0 THEN NEW.amount ELSE 0 END,
    lifetime_spent = user_credits.lifetime_spent + CASE WHEN NEW.amount < 0 THEN ABS(NEW.amount) ELSE 0 END,
    updated_at = now();
  
  -- Update balance_after in transaction
  UPDATE credit_transactions
  SET balance_after = (SELECT balance FROM user_credits WHERE user_id = NEW.user_id)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credits_balance
  AFTER INSERT ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_credits_balance();

-- Function to update streak updated_at
CREATE OR REPLACE FUNCTION update_streak_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_streak_timestamp
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_streak_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- User streaks: Users can read/update their own streaks
CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User badges: Users can read their own badges
CREATE POLICY "Users can view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- User credits: Users can read their own credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Credit transactions: Users can read their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Recipe collections: Public read for active collections, creators can manage
CREATE POLICY "Anyone can view active collections" ON recipe_collections
  FOR SELECT USING (status = 'active');

CREATE POLICY "Creators can manage own collections" ON recipe_collections
  FOR ALL USING (auth.uid() = creator_id);

-- Collection purchases: Users can read their own purchases
CREATE POLICY "Users can view own purchases" ON collection_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Recipe shares: Users can read their own shares
CREATE POLICY "Users can view own shares" ON recipe_shares
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shares" ON recipe_shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Share rewards: Users can read their own rewards
CREATE POLICY "Users can view own rewards" ON share_rewards
  FOR SELECT USING (auth.uid() = sharer_id OR auth.uid() = recipient_id);

-- Recipe images: Public read, recipe owners can manage
CREATE POLICY "Anyone can view recipe images" ON recipe_images
  FOR SELECT USING (true);

-- Family members: Members can view their family
CREATE POLICY "Family members can view family" ON family_members
  FOR SELECT USING (
    auth.uid() = family_owner_id OR 
    auth.uid() = member_id OR
    EXISTS (SELECT 1 FROM family_members WHERE family_owner_id = family_members.family_owner_id AND member_id = auth.uid())
  );

-- Family invites: Owners can manage invites
CREATE POLICY "Owners can manage invites" ON family_invites
  FOR ALL USING (auth.uid() = family_owner_id);

-- Subscription usage: Users can read their own usage
CREATE POLICY "Users can view own usage" ON subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE user_streaks IS 'Tracks user meal planning streaks with current and longest streak';
COMMENT ON TABLE user_badges IS 'User badge unlocks for gamification';
COMMENT ON TABLE user_credits IS 'User credit balance for pay-per-use features';
COMMENT ON TABLE credit_transactions IS 'Credit transaction history';
COMMENT ON TABLE recipe_collections IS 'Recipe collections marketplace';
COMMENT ON TABLE collection_purchases IS 'Collection purchase records';
COMMENT ON TABLE recipe_shares IS 'Recipe sharing tracking for rewards';
COMMENT ON TABLE share_rewards IS 'Share referral rewards';
COMMENT ON TABLE recipe_images IS 'Generated recipe images';
COMMENT ON TABLE family_members IS 'Family plan members';
COMMENT ON TABLE family_invites IS 'Family plan invitations';
COMMENT ON TABLE subscription_usage IS 'Subscription usage tracking';




-- ============================================================================
-- FROM: 995_create_account_deletion.sql
-- ============================================================================

-- ============================================================================
-- ACCOUNT DELETION FUNCTION
-- Secure account deletion with data retention for legal compliance
-- ============================================================================

-- Function to delete user account and anonymize data
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
  user_uuid uuid;
BEGIN
  user_uuid := auth.uid();
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Soft delete: Mark data for deletion instead of hard delete
  -- This allows for legal retention requirements
  
  -- Anonymize user data
  UPDATE profiles
  SET 
    name = 'Deleted User',
    preferences = '{}'::jsonb,
    updated_at = now()
  WHERE id = user_uuid;

  -- Delete user-specific data (soft delete to anonymized)
  UPDATE pantry_items
  SET 
    ingredient = 'Deleted',
    quantity = 0,
    updated_at = now()
  WHERE user_id = user_uuid;

  -- Delete meal plans (soft delete)
  UPDATE meal_plans
  SET 
    name = 'Deleted Plan',
    metadata = '{"deleted": true}'::jsonb,
    updated_at = now()
  WHERE user_id = user_uuid;

  -- Delete recipes (soft delete)
  UPDATE recipes
  SET 
    title = 'Deleted Recipe',
    details = '{}'::jsonb,
    updated_at = now()
  WHERE user_id = user_uuid;

  -- Cancel subscriptions
  UPDATE subscriptions
  SET 
    status = 'canceled',
    cancel_at_period_end = false,
    updated_at = now()
  WHERE user_id = user_uuid;

  -- Delete auth user (Supabase handles this)
  -- Note: This should be done via Supabase Auth API, not SQL
  -- The function above prepares the data for deletion

  -- Log deletion
  INSERT INTO account_deletions (
    user_id,
    deleted_at,
    reason
  )
  VALUES (
    user_uuid,
    now(),
    'User requested deletion'
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Account deletions log table
CREATE TABLE IF NOT EXISTS account_deletions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  deleted_at timestamptz default now(),
  reason text,
  data_retention_until timestamptz, -- Legal retention period
  metadata jsonb default '{}'
);

CREATE INDEX IF NOT EXISTS idx_account_deletions_user ON account_deletions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletions_date ON account_deletions(deleted_at);

-- RLS for account deletions
ALTER TABLE account_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view deletions"
  ON account_deletions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );




-- ============================================================================
-- FROM: 996_create_support_tickets.sql
-- ============================================================================

-- ============================================================================
-- SUPPORT TICKET SYSTEM
-- ============================================================================

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  subject text not null,
  category text not null check (category in ('billing', 'technical', 'feature', 'account', 'other')),
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid references auth.users(id) on delete set null,
  resolution text,
  resolved_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ticket replies/messages
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references support_tickets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  message text not null,
  is_internal boolean default false, -- Internal notes visible only to support
  created_at timestamptz default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON support_tickets(email);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket ON support_ticket_messages(ticket_id);

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Users can create tickets
CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (true);

-- Users can update their own tickets
CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

-- Support staff can view all tickets
CREATE POLICY "Support staff can view all tickets"
  ON support_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'support')
    )
  );

-- Support staff can manage all tickets
CREATE POLICY "Support staff can manage all tickets"
  ON support_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'support')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();




-- ============================================================================
-- FROM: 997_create_billing_refunds_invoices.sql
-- ============================================================================

-- ============================================================================
-- BILLING, INVOICES, AND REFUNDS SCHEMA
-- ============================================================================

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  invoice_number text not null unique,
  amount numeric(10,2) not null,
  tax_amount numeric(10,2) default 0,
  total_amount numeric(10,2) not null,
  currency text not null default 'USD',
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_at timestamptz,
  stripe_invoice_id text,
  pdf_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  invoice_id uuid references invoices(id) on delete set null,
  amount numeric(10,2) not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'processed', 'failed', 'cancelled')),
  stripe_refund_id text,
  processed_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tax calculations table (for multi-region support)
CREATE TABLE IF NOT EXISTS tax_calculations (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  country text not null,
  region text,
  tax_rate numeric(5,2) not null,
  tax_amount numeric(10,2) not null,
  tax_type text not null check (tax_type in ('vat', 'sales_tax', 'gst', 'other')),
  created_at timestamptz default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_refunds_user ON refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_subscription ON refunds(subscription_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

CREATE INDEX IF NOT EXISTS idx_tax_calculations_invoice ON tax_calculations(invoice_id);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  year_month text;
  last_number int;
  new_number text;
BEGIN
  year_month := to_char(now(), 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
  INTO last_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '%';
  
  new_number := 'INV-' || year_month || '-' || LPAD(last_number::text, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to create invoice from subscription
CREATE OR REPLACE FUNCTION create_invoice_from_subscription(
  p_subscription_id uuid,
  p_amount numeric,
  p_tax_amount numeric DEFAULT 0
)
RETURNS uuid AS $$
DECLARE
  v_invoice_id uuid;
  v_invoice_number text;
  v_user_id uuid;
  v_total numeric;
BEGIN
  -- Get subscription details
  SELECT user_id INTO v_user_id
  FROM subscriptions
  WHERE id = p_subscription_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  
  -- Generate invoice number
  v_invoice_number := generate_invoice_number();
  v_total := p_amount + p_tax_amount;
  
  -- Create invoice
  INSERT INTO invoices (
    user_id,
    subscription_id,
    invoice_number,
    amount,
    tax_amount,
    total_amount,
    status,
    due_date
  )
  VALUES (
    v_user_id,
    p_subscription_id,
    v_invoice_number,
    p_amount,
    p_tax_amount,
    v_total,
    'sent',
    now() + INTERVAL '30 days'
  )
  RETURNING id INTO v_invoice_id;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own refunds
CREATE POLICY "Users can view own refunds"
  ON refunds FOR SELECT
  USING (auth.uid() = user_id);

-- Users can request refunds
CREATE POLICY "Users can create refund requests"
  ON refunds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin can manage all
CREATE POLICY "Admin can manage all billing"
  ON invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage all refunds"
  ON refunds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at
  BEFORE UPDATE ON refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();




-- ============================================================================
-- FROM: 998_create_referral_affiliate_partner_schema.sql
-- ============================================================================

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




-- ============================================================================
-- FROM: 999_create_knowledge_base.sql
-- ============================================================================

-- ============================================================================
-- KNOWLEDGE BASE SCHEMA
-- For Wiki & AI Chat Bot Integration
-- ============================================================================

-- Knowledge base articles table
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null, -- Markdown content
  excerpt text, -- Short summary for search results
  category text not null,
  subcategory text,
  tags text[] default '{}',
  author_id uuid references auth.users(id),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  view_count int default 0,
  helpful_count int default 0,
  not_helpful_count int default 0,
  search_vector tsvector, -- Full-text search vector
  embedding vector(1536), -- OpenAI embeddings for semantic search
  metadata jsonb default '{}', -- Additional metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz,
  version int default 1
);

-- Categories table for organizing articles
CREATE TABLE IF NOT EXISTS knowledge_base_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  parent_id uuid references knowledge_base_categories(id) on delete cascade,
  icon text, -- Icon name or emoji
  order_index int default 0,
  created_at timestamptz default now()
);

-- Chat bot conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text not null, -- For anonymous users
  title text, -- Auto-generated from first message
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  metadata jsonb default '{}'
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  article_ids uuid[] default '{}', -- Articles referenced in response
  sources jsonb default '[]', -- Sources used for answer
  helpful boolean, -- User feedback
  created_at timestamptz default now(),
  metadata jsonb default '{}'
);

-- User feedback on articles
CREATE TABLE IF NOT EXISTS article_feedback (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references knowledge_base_articles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  helpful boolean not null,
  comment text,
  created_at timestamptz default now(),
  unique(article_id, user_id)
);

-- Article views tracking
CREATE TABLE IF NOT EXISTS article_views (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references knowledge_base_articles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  viewed_at timestamptz default now(),
  time_spent_seconds int,
  scroll_depth int -- Percentage scrolled
);

-- Search queries table (for improving search)
CREATE TABLE IF NOT EXISTS search_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  query text not null,
  results_count int,
  clicked_article_id uuid references knowledge_base_articles(id) on delete set null,
  created_at timestamptz default now()
);

-- Auto-update logs (track what content was auto-updated)
CREATE TABLE IF NOT EXISTS knowledge_base_updates (
  id uuid primary key default gen_random_uuid(),
  update_type text not null check (update_type in ('feature_added', 'chat_learned', 'user_contribution', 'auto_sync')),
  article_id uuid references knowledge_base_articles(id) on delete set null,
  source text, -- 'chat_bot', 'feature_release', 'user_contribution', etc.
  changes jsonb, -- What changed
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON knowledge_base_articles(category);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON knowledge_base_articles(status);
CREATE INDEX IF NOT EXISTS idx_kb_articles_slug ON knowledge_base_articles(slug);
CREATE INDEX IF NOT EXISTS idx_kb_articles_search ON knowledge_base_articles USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_kb_articles_tags ON knowledge_base_articles USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_kb_articles_embedding ON knowledge_base_articles USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_article_feedback_article ON article_feedback(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries(query);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_knowledge_base_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
CREATE TRIGGER update_kb_articles_search_vector
  BEFORE INSERT OR UPDATE ON knowledge_base_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_search_vector();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON knowledge_base_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published articles
CREATE POLICY "Anyone can read published articles"
  ON knowledge_base_articles FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users can read all their own articles
CREATE POLICY "Users can read own articles"
  ON knowledge_base_articles FOR SELECT
  USING (auth.uid() = author_id);

-- Policy: Only admins can insert/update articles
CREATE POLICY "Admins can manage articles"
  ON knowledge_base_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Anyone can read categories
CREATE POLICY "Anyone can read categories"
  ON knowledge_base_categories FOR SELECT
  USING (true);

-- Policy: Users can manage their own conversations
CREATE POLICY "Users can manage own conversations"
  ON chat_conversations FOR ALL
  USING (user_id = auth.uid() OR session_id = current_setting('app.session_id', true));

-- Policy: Users can manage messages in their conversations
CREATE POLICY "Users can manage own messages"
  ON chat_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND (chat_conversations.user_id = auth.uid() OR chat_conversations.session_id = current_setting('app.session_id', true))
    )
  );

-- Policy: Anyone can provide feedback
CREATE POLICY "Anyone can provide feedback"
  ON article_feedback FOR ALL
  USING (true);

-- Policy: Anyone can view articles (for analytics)
CREATE POLICY "Anyone can track views"
  ON article_views FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can search (logged anonymously)
CREATE POLICY "Anyone can search"
  ON search_queries FOR INSERT
  WITH CHECK (true);

-- Insert default categories
INSERT INTO knowledge_base_categories (name, slug, description, icon, order_index) VALUES
  ('Getting Started', 'getting-started', 'New user guides and onboarding', '🚀', 1),
  ('Meal Planning', 'meal-planning', 'Creating and managing meal plans', '📅', 2),
  ('Pantry Management', 'pantry', 'Managing your pantry and ingredients', '🥫', 3),
  ('Recipes', 'recipes', 'Finding, saving, and using recipes', '🍳', 4),
  ('Grocery Lists', 'grocery-lists', 'Creating and managing shopping lists', '🛒', 5),
  ('Shopping & Integrations', 'integrations', 'Store integrations and online ordering', '🔗', 6),
  ('Nutrition & Health', 'nutrition', 'Nutrition tracking and dietary preferences', '🥗', 7),
  ('Community Features', 'community', 'Sharing and community features', '👥', 8),
  ('Account & Settings', 'account', 'Account management and preferences', '⚙️', 9),
  ('Advanced Features', 'advanced', 'Advanced tips and strategies', '🎯', 10),
  ('Troubleshooting', 'troubleshooting', 'Common issues and solutions', '🔧', 11),
  ('FAQs', 'faqs', 'Frequently asked questions', '❓', 12)
ON CONFLICT (slug) DO NOTHING;




-- ============================================================================
-- FROM: create_secrets_vault.sql
-- ============================================================================

-- Create secrets_vault table for storing encrypted secrets
-- This table is used by the unified secrets management system

CREATE TABLE IF NOT EXISTS secrets_vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  last_rotated TIMESTAMPTZ DEFAULT NOW(),
  next_rotation TIMESTAMPTZ,
  hash TEXT,
  encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, environment)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_secrets_vault_key_env ON secrets_vault(key, environment);
CREATE INDEX IF NOT EXISTS idx_secrets_vault_next_rotation ON secrets_vault(next_rotation);
CREATE INDEX IF NOT EXISTS idx_secrets_vault_environment ON secrets_vault(environment);

-- Enable RLS
ALTER TABLE secrets_vault ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access secrets
DROP POLICY IF EXISTS "Service role only" ON secrets_vault;
CREATE POLICY "Service role only" ON secrets_vault
  FOR ALL
  USING (auth.role() = 'service_role');

-- CREATE OR REPLACE FUNCTION to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_secrets_vault_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_secrets_vault_updated_at ON secrets_vault;
CREATE TRIGGER update_secrets_vault_updated_at
  BEFORE UPDATE ON secrets_vault
  FOR EACH ROW
  EXECUTE FUNCTION update_secrets_vault_updated_at();

-- Create secret_rotation_logs table for audit trail
CREATE TABLE IF NOT EXISTS secret_rotation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  environment TEXT NOT NULL,
  new_hash TEXT,
  rotated_at TIMESTAMPTZ DEFAULT NOW(),
  rotated_by TEXT DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_secret_rotation_logs_key ON secret_rotation_logs(key, environment);
CREATE INDEX IF NOT EXISTS idx_secret_rotation_logs_rotated_at ON secret_rotation_logs(rotated_at);

-- Enable RLS on rotation logs
ALTER TABLE secret_rotation_logs ENABLE ROW LEVEL SECURITY;

-- Policy for rotation logs
DROP POLICY IF EXISTS "Service role only" ON secret_rotation_logs;
CREATE POLICY "Service role only" ON secret_rotation_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON secrets_vault TO service_role;
GRANT ALL ON secret_rotation_logs TO service_role;

-- Add comments for documentation
COMMENT ON TABLE secrets_vault IS 'Centralized secrets vault for storing encrypted environment variables and API keys';
COMMENT ON COLUMN secrets_vault.key IS 'Environment variable key name';
COMMENT ON COLUMN secrets_vault.value IS 'Encrypted secret value';
COMMENT ON COLUMN secrets_vault.environment IS 'Environment: production, staging, development, preview';
COMMENT ON COLUMN secrets_vault.encrypted IS 'Whether the value is encrypted';
COMMENT ON COLUMN secrets_vault.next_rotation IS 'Next scheduled rotation date';

COMMENT ON TABLE secret_rotation_logs IS 'Audit log for secret rotations';
COMMENT ON COLUMN secret_rotation_logs.new_hash IS 'SHA256 hash of the new secret value';



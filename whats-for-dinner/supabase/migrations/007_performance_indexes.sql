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
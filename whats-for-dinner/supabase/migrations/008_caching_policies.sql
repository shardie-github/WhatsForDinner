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

-- Create index on materialized view
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

-- Create index on materialized view
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

-- Create index on materialized view
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
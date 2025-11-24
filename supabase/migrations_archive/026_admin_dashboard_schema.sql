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
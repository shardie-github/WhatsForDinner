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

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT role FROM public.users WHERE id = user_id;
$$;

-- Create function to check if user is admin
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

-- Create function to check if user is super admin
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

-- Create function to log security events
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

-- Create function to validate API key
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
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);

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

-- Create function to clean up old audit logs
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

-- Create function to get user security summary
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
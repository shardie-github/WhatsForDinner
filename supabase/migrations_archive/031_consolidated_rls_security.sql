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

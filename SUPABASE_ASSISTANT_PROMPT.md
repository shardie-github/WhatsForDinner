# Supabase Assistant Prompt: Complete Database Schema & RLS Setup

## Overview
You need to create **89 tables** for a multi-tenant SaaS recipe application with the following modules:
- Core tables (profiles, recipes, pantry_items, favorites)
- Analytics & logging tables
- Multi-tenant SaaS tables (tenants, memberships, subscriptions, billing)
- Growth engine tables (referrals, A/B testing, funnels, campaigns)
- Federated ecosystem tables (partners, API routing, compliance)
- Job queue tables
- Admin dashboard tables
- Community portal tables
- Chef marketplace tables
- Referral & social tables
- Feature flags tables
- AI system tables (health, embeddings, performance, costs)
- Gap closure tables (user preferences, onboarding, experiments)

## Instructions

### Step 1: Create All Tables
Run the complete table creation script from `master_supabase_schema.sql`. This includes:

**Core Tables (4):**
1. `profiles` - User profiles linked to auth.users
2. `pantry_items` - User pantry inventory
3. `recipes` - Recipe storage
4. `favorites` - User recipe favorites

**Analytics Tables (8):**
5. `analytics_events` - Event tracking
6. `recipe_metrics` - Recipe performance metrics
7. `system_metrics` - System performance metrics
8. `logs` - Application logging
9. `error_reports` - Error tracking
10. `recipe_feedback` - User feedback on recipes
11. `ai_config` - AI model configuration
12. `workflow_state` - Workflow state management

**Multi-Tenant Tables (8):**
13. `tenants` - Tenant/workspace management
14. `tenant_memberships` - User-tenant relationships with roles
15. `subscriptions` - Stripe subscription management
16. `usage_logs` - API usage and cost tracking
17. `tenant_invites` - Tenant invitation system
18. `ai_cache` - AI response caching
19. `billing_events` - Stripe webhook events

**Growth Engine Tables (12):**
20. `growth_metrics` - KPI tracking (CAC, LTV, retention, MRR)
21. `referrals` - Referral program tracking
22. `affiliate_campaigns` - Affiliate campaign management
23. `funnel_events` - Conversion funnel tracking
24. `ab_test_experiments` - A/B test experiments
25. `ab_test_variants` - A/B test variants
26. `ab_test_assignments` - User variant assignments
27. `ai_copy_logs` - Copy optimization tracking
28. `social_posts` - Social media post management
29. `ugc_shares` - User-generated content shares
30. `dynamic_pricing_rules` - Dynamic pricing logic
31. `churn_predictions` - ML churn predictions
32. `winback_campaigns` - Winback campaign tracking

**Federated Ecosystem Tables (10):**
33. `partner_registry` - Ecosystem partner registry
34. `federated_api_endpoints` - Unified API routing
35. `api_usage_tracking` - API monetization tracking
36. `ai_model_advisor` - Multi-model cost optimization
37. `ai_evolution_logs` - AI learning loop tracking
38. `franchise_deployments` - White-label deployments
39. `compliance_audit_logs` - Enterprise governance
40. `anomaly_detections` - AI-powered anomaly detection
41. `developer_portal_sessions` - SDK API key management
42. `sdk_downloads` - SDK download tracking

**Job Queue Tables (3):**
43. `jobs_queue` - Background job queue
44. `job_results` - Job execution results
45. `job_logs` - Detailed job logging

**Admin Dashboard Tables (4):**
46. `admin_users` - Admin user management
47. `admin_sessions` - Admin session tracking
48. `admin_audit_logs` - Admin audit logs
48. `system_logs` - System-level logging

**Community Portal Tables (10):**
49. `community_posts` - User-generated posts
50. `community_votes` - Voting system
51. `community_comments` - Post comments
52. `community_follows` - User following relationships
53. `community_bookmarks` - Saved content
54. `community_reports` - Content moderation reports
55. `community_achievements` - Gamification achievements
56. `community_leaderboard` - User rankings
57. `community_events` - Community events/challenges
58. `community_event_submissions` - Event participation

**Chef Marketplace Tables (10):**
59. `chef_profiles` - Chef partner profiles
60. `recipe_packs` - Chef recipe collections
61. `recipe_pack_reviews` - Customer reviews
62. `chef_offers` - Promotions and offers
63. `chef_analytics` - Chef performance metrics
64. `chef_earnings` - Revenue tracking
65. `chef_followers` - Chef following system
66. `chef_notifications` - Chef notifications
67. `chef_verification_documents` - Verification docs

**Referral & Social Tables (10):**
68. `referral_codes` - Referral code management
69. `referral_tracking` - Referral conversion tracking
70. `social_shares` - Social media share tracking
71. `viral_campaigns` - Viral marketing campaigns
72. `user_badges` - User gamification badges
73. `social_leaderboard` - Social engagement rankings
74. `social_analytics` - Social performance tracking
75. `referral_rewards` - Reward management
76. `social_widgets` - Embeddable sharing widgets

**Feature Flags Tables (2):**
77. `config_flags` - Feature flags and kill switches
78. `flag_audit_log` - Flag change audit trail

**AI System Tables (7):**
79. `ai_health_metrics` - AI system health monitoring
80. `ai_embeddings` - Vector embeddings storage
81. `ai_insights` - AI-generated insights
82. `ai_cost_analysis` - Cost analysis reports
83. `ai_performance_metrics` - Performance tracking
84. `ai_performance_reports` - Aggregated reports
85. `ai_integrity_reports` - System integrity checks

**Gap Closure Tables (4):**
86. `user_preferences` - Dietary preferences wizard
87. `onboarding_state` - Onboarding progress tracking
88. `experiment_events` - A/B testing events
89. `lead_referrals` - Waitlist referral tracking

### Step 2: Create Security Helper Functions
Create these security helper functions BEFORE RLS policies:

```sql
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

-- Function to check user role from profiles
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
```

### Step 3: Enable Row Level Security on All Tables
Enable RLS on all 89 tables:

```sql
-- Core tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Analytics tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_feedback ENABLE ROW LEVEL SECURITY;

-- Multi-tenant tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Growth engine tables
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

-- Federated ecosystem tables
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

-- Job queue tables
ALTER TABLE jobs_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;

-- Admin dashboard tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Community portal tables
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

-- Chef marketplace tables
ALTER TABLE chef_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_pack_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chef_verification_documents ENABLE ROW LEVEL SECURITY;

-- Referral & social tables
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_widgets ENABLE ROW LEVEL SECURITY;

-- Feature flags tables
ALTER TABLE config_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flag_audit_log ENABLE ROW LEVEL SECURITY;

-- AI system tables
ALTER TABLE ai_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_integrity_reports ENABLE ROW LEVEL SECURITY;

-- Gap closure tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_referrals ENABLE ROW LEVEL SECURITY;
```

### Step 4: Create RLS Policies for Multi-Tenant Tables
For all tables with `tenant_id` column, create tenant-isolation policies:

**Pattern for tenant-isolated SELECT:**
```sql
CREATE POLICY "{table_name}_select_tenant" ON {table_name}
  FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
    OR tenant_id IS NULL  -- Allow null for backward compatibility
  );
```

**Pattern for tenant-isolated INSERT:**
```sql
CREATE POLICY "{table_name}_insert_tenant" ON {table_name}
  FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
  );
```

**Pattern for tenant-isolated UPDATE:**
```sql
CREATE POLICY "{table_name}_update_tenant" ON {table_name}
  FOR UPDATE
  USING (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
  )
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
  );
```

**Pattern for tenant-isolated DELETE:**
```sql
CREATE POLICY "{table_name}_delete_tenant" ON {table_name}
  FOR DELETE
  USING (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
    OR is_tenant_owner(auth.uid(), tenant_id)  -- Owners can delete
  );
```

### Step 5: Special RLS Policies

**For System Tables (billing_events, logs, system_logs):**
- Only allow service_role/system access
- Block all public/authenticated access except SELECT for admins

**For Public Tables (chef_profiles, recipe_packs where is_published=true, community_posts where status='published'):**
- Allow SELECT for authenticated users
- Allow INSERT/UPDATE for owners only

**For Admin Tables:**
- Only allow access for users with admin/super_admin role in profiles table
- Use `is_admin(auth.uid())` or `is_super_admin(auth.uid())` in policy conditions

**For User-Owned Tables (user_preferences, onboarding_state):**
- Users can only access their own records: `auth.uid() = user_id`

**For Referral Tables:**
- Users can SELECT their own referrals
- Users can INSERT new referrals for themselves
- System can UPDATE referral status when conversions happen

### Step 6: Key RLS Policy Examples

**Tenants Table (Critical for Multi-Tenancy):**
```sql
CREATE POLICY "tenants_select_membership" ON tenants
  FOR SELECT
  USING (
    id IN (SELECT tenant_id FROM tenant_memberships WHERE user_id = auth.uid())
  );

CREATE POLICY "tenants_update_owner" ON tenants
  FOR UPDATE
  USING (is_tenant_owner(auth.uid(), id))
  WITH CHECK (is_tenant_owner(auth.uid(), id));

CREATE POLICY "tenants_insert_system" ON tenants
  FOR INSERT
  WITH CHECK (false);  -- Only allow system/service role inserts
```

**Profiles Table:**
```sql
CREATE POLICY "profiles_select_tenant" ON profiles
  FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
    OR tenant_id IS NULL
    OR auth.uid() = id
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
```

**Tenant Memberships:**
```sql
CREATE POLICY "tenant_memberships_select_tenant" ON tenant_memberships
  FOR SELECT
  USING (
    tenant_id IN (SELECT tenant_id FROM get_user_tenants(auth.uid()))
    OR user_id = auth.uid()
  );

CREATE POLICY "tenant_memberships_all_owner" ON tenant_memberships
  FOR ALL
  USING (is_tenant_owner(auth.uid(), tenant_id))
  WITH CHECK (is_tenant_owner(auth.uid(), tenant_id));
```

### Step 7: Grant Permissions to Roles
```sql
-- Create roles
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
END $$;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO app_user, app_admin, app_super_admin, app_readonly;

-- Grant table permissions (RLS will enforce security)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO app_super_admin;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user, app_admin, app_super_admin;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO app_readonly;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.user_belongs_to_tenant(UUID, UUID) TO authenticated, app_user;
GRANT EXECUTE ON FUNCTION public.get_user_tenants(UUID) TO authenticated, app_user;
GRANT EXECUTE ON FUNCTION public.user_has_tenant_role(UUID, UUID, TEXT) TO authenticated, app_user;
GRANT EXECUTE ON FUNCTION public.is_tenant_owner(UUID, UUID) TO authenticated, app_user;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, app_user;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, app_user;
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated, app_user;
```

## Summary Checklist

- [ ] Create all 89 tables from master_supabase_schema.sql
- [ ] Create 7 security helper functions
- [ ] Enable RLS on all 89 tables
- [ ] Create tenant-isolation policies for all multi-tenant tables (~60 tables)
- [ ] Create public-read policies for published content tables
- [ ] Create user-owned policies for personal data tables
- [ ] Create admin-only policies for system tables
- [ ] Create roles and grant appropriate permissions
- [ ] Test RLS policies with test users in different tenants
- [ ] Verify tenant isolation works correctly

## Files Reference
- Table definitions: `master_supabase_schema.sql`
- RLS policies: `whats-for-dinner/supabase/migrations/014_consolidated_rls_security.sql`
- Part files: `supabase_tables_part*.sql` (organized by module)

## Important Notes

1. **Execution Order Matters:**
   - Create tables first
   - Create helper functions second
   - Enable RLS third
   - Create policies last

2. **Tenant Isolation:**
   - All tables with `tenant_id` must have tenant-isolation policies
   - Users should only see data from tenants they belong to
   - Use `get_user_tenants()` function in all tenant-based policies

3. **System Tables:**
   - Tables like `billing_events`, `logs`, `system_logs` should only allow service_role access
   - Use `auth.role() = 'service_role'` in policies

4. **Public Content:**
   - Published content (recipes, posts) should be readable by all authenticated users
   - But only owners can modify

5. **Testing:**
   - Test with users in different tenants
   - Verify users cannot see other tenants' data
   - Test admin access separately
   - Verify system role access works

## Quick Start Command

```bash
# In Supabase SQL Editor, run this order:
# 1. master_supabase_schema.sql (creates all tables)
# 2. Step 2 (security functions) 
# 3. Step 3 (enable RLS)
# 4. Step 4-6 (create all policies)
# 5. Step 7 (grant permissions)
```

---

**Total Tables: 89**
**Total RLS Policies Needed: ~150-200** (varies by table access patterns)

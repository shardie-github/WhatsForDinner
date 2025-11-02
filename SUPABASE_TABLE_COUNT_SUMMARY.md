# Supabase Table Count & Quick Setup

## Answer: How Many Tables?

**Total: 89 tables** across 13 modules:

| Module | Count | Tables |
|--------|-------|--------|
| Core | 4 | profiles, pantry_items, recipes, favorites |
| Analytics | 8 | analytics_events, recipe_metrics, system_metrics, logs, error_reports, recipe_feedback, ai_config, workflow_state |
| Multi-Tenant | 8 | tenants, tenant_memberships, subscriptions, usage_logs, tenant_invites, ai_cache, billing_events |
| Growth Engine | 12 | growth_metrics, referrals, affiliate_campaigns, funnel_events, ab_test_experiments, ab_test_variants, ab_test_assignments, ai_copy_logs, social_posts, ugc_shares, dynamic_pricing_rules, churn_predictions, winback_campaigns |
| Federated Ecosystem | 10 | partner_registry, federated_api_endpoints, api_usage_tracking, ai_model_advisor, ai_evolution_logs, franchise_deployments, compliance_audit_logs, anomaly_detections, developer_portal_sessions, sdk_downloads |
| Job Queue | 3 | jobs_queue, job_results, job_logs |
| Admin Dashboard | 4 | admin_users, admin_sessions, admin_audit_logs, system_logs |
| Community Portal | 10 | community_posts, community_votes, community_comments, community_follows, community_bookmarks, community_reports, community_achievements, community_leaderboard, community_events, community_event_submissions |
| Chef Marketplace | 10 | chef_profiles, recipe_packs, recipe_pack_reviews, chef_offers, chef_analytics, chef_earnings, chef_followers, chef_notifications, chef_verification_documents |
| Referral & Social | 10 | referral_codes, referral_tracking, social_shares, viral_campaigns, user_badges, social_leaderboard, social_analytics, referral_rewards, social_widgets |
| Feature Flags | 2 | config_flags, flag_audit_log |
| AI System | 7 | ai_health_metrics, ai_embeddings, ai_insights, ai_cost_analysis, ai_performance_metrics, ai_performance_reports, ai_integrity_reports |
| Gap Closure | 4 | user_preferences, onboarding_state, experiment_events, lead_referrals |

## Quick Supabase Assistant Prompt

Copy this prompt into Supabase Assistant:

---

**"Create all 89 tables and RLS policies for a multi-tenant SaaS recipe application. Reference `master_supabase_schema.sql` for table definitions and `whats-for-dinner/supabase/migrations/014_consolidated_rls_security.sql` for RLS policies.**

**Execution order:**
1. Create all 89 tables from master_supabase_schema.sql
2. Create 7 security helper functions (user_belongs_to_tenant, get_user_tenants, user_has_tenant_role, is_tenant_owner, get_user_role, is_admin, is_super_admin)
3. Enable RLS on all 89 tables
4. Create tenant-isolation policies for all tables with tenant_id column (users can only access data from tenants they belong to)
5. Create public-read policies for published content (chef_profiles, recipe_packs, community_posts)
6. Create user-owned policies for personal data (user_preferences, onboarding_state)
7. Create admin-only policies for system tables (billing_events, system_logs, admin_*)
8. Create roles (app_user, app_admin, app_super_admin, app_readonly) and grant permissions

**Key RLS requirements:**
- All multi-tenant tables must isolate data by tenant_id
- Use get_user_tenants(auth.uid()) function in tenant policies
- System tables only accessible by service_role
- Published content readable by all authenticated users
- Admin tables only accessible by users with admin role

**Verify tenant isolation works correctly after setup.**"**

---

## File Locations

- **Table Definitions:** `master_supabase_schema.sql` (contains all 89 CREATE TABLE statements)
- **RLS Policies:** `whats-for-dinner/supabase/migrations/014_consolidated_rls_security.sql`
- **Part Files:** `supabase_tables_part*.sql` (organized by module, 13 files)
- **Detailed Prompt:** `SUPABASE_ASSISTANT_PROMPT.md` (comprehensive guide)

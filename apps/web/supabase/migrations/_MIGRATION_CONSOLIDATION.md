# Migration Consolidation Complete

**Date:** 2025-01-27  
**Consolidated By:** Unified Background Agent v3.0

## Summary

All migrations have been consolidated into `/apps/web/supabase/migrations` - the single canonical location for database migrations.

## Migration Order

1. `001_create_tables.sql` - Core tables (profiles, recipes, pantry_items, favorites)
2. `002_analytics_logging_tables.sql` - Analytics and logging tables
3. `003_multi_tenant_saas_schema.sql` - Multi-tenant architecture
4. `004_growth_engine_schema.sql` - Growth and marketing features
5. `005_federated_ecosystem_schema.sql` - Partner and API ecosystem
6. `006_gap_closure_features.sql` - Feature gap closures
7. `007_gamify.sql` - Gamification features
8. `008_gamify_enhanced.sql` - Enhanced gamification
9. `009_gamify_seed_data.sql` - Gamification seed data
10. `010_cooking_live.sql` - Live cooking features
11. `011_job_queue_schema.sql` - Job queue system (NEW - consolidated)
12. `012_performance_indexes.sql` - Performance indexes (NEW - consolidated)
13. `013_caching_policies.sql` - Caching strategies (NEW - consolidated)
14. `014_admin_dashboard_schema.sql` - Admin dashboard (NEW - consolidated)
15. `015_community_portal_schema.sql` - Community features (NEW - consolidated)
16. `016_chef_marketplace_schema.sql` - Chef marketplace (NEW - consolidated)
17. `017_referral_social_schema.sql` - Referral and social (NEW - consolidated)
18. `018_feature_flags_schema.sql` - Feature flags (NEW - consolidated)
19. `019_consolidated_rls_security.sql` - Consolidated RLS policies (NEW - consolidated)
20. `020_monetization_features.sql` - Monetization features (NEW - consolidated)
21. `021_metrics.sql` - Metrics and ETL tables (NEW - consolidated)
22. `2025-11-05_meal_prefs.sql` - Meal preferences
23. `2025-11-05_telemetry.sql` - Telemetry features
24. `2025-11-05_trust_audit.sql` - Trust and audit features
25. `20250109_affiliate_system.sql` - Affiliate system
26. `20250109_api_monetization.sql` - API monetization
27. `20250109_data_insights_system.sql` - Data insights
28. `20250109_marketplace_system.sql` - Marketplace system
29. `20250109_missing_tables.sql` - Missing tables
30. `20250109_monetization_settings.sql` - Monetization settings

## Archived Locations

The following directories are now deprecated and should not be used for new migrations:

- `/whats-for-dinner/supabase/migrations` - Legacy location (migrations copied)
- `/supabase/migrations` - Contains master consolidated migration (reference only)
- `/infra/supabase/migrations` - Infrastructure-specific (migrations copied)

## Next Steps

1. Update CI/CD workflows to use only `/apps/web/supabase/migrations`
2. Update documentation to reference new location
3. Archive old migration directories after verification
4. Update Supabase CLI configuration if needed

## Verification

Run the following to verify consolidation:

```bash
# Check all migrations are in place
ls -1 apps/web/supabase/migrations/*.sql | wc -l

# Validate schema
pnpm db:validate
```

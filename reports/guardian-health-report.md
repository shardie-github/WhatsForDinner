# Full-Stack Guardian Health Report

**Generated:** 2025-11-15T15:07:29.968Z

---

## 1. Environment & Secret Drift

### Environment & Secrets

**Summary:** 2 total issues (0 critical, 2 warnings, 0 info)

| Severity | Issue | Location | Fix |
|----------|-------|----------|-----|
| warning | Both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL defined. Prefer NEXT_PUBLIC_SUPABASE_URL for client-side usage. | /workspace/.env.example | N/A |
| warning | Non-null assertion used without fallback. May cause runtime errors if env var is missing. | /workspace/whats-for-dinner/src/lib/supabaseClient.ts | N/A |

## 2. Supabase Schema Alignment

- **Prisma Tables:** 25
- **Migration Files:** 47

**Mismatches:**
- ⚠️ Table events exists in migration 000000000800_upsert_functions.sql but not in Prisma schema
- ⚠️ Table spend exists in migration 000000000800_upsert_functions.sql but not in Prisma schema
- ⚠️ Table metrics_daily exists in migration 000000000800_upsert_functions.sql but not in Prisma schema
- ⚠️ Table ai_health_metrics exists in migration 013_ai_system_schema.sql but not in Prisma schema
- ⚠️ Table ai_embeddings exists in migration 013_ai_system_schema.sql but not in Prisma schema
- ⚠️ Table ai_insights exists in migration 013_ai_system_schema.sql but not in Prisma schema
- ⚠️ Table ai_cost_analysis exists in migration 013_ai_system_schema.sql but not in Prisma schema
- ⚠️ Table ai_performance_metrics exists in migration 013_ai_system_schema.sql but not in Prisma schema
- ⚠️ Table ai_performance_reports exists in migration 013_ai_system_schema.sql but not in Prisma schema
- ⚠️ Table ai_integrity_reports exists in migration 013_ai_system_schema.sql but not in Prisma schema
- ⚠️ Table user_profiles exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table user_dietary_preferences exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table user_allergens exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table user_health_goals exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table meal_plans exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table recipes exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table recipe_favorites exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table grocery_lists exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table grocery_list_items exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table health_metrics exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table wearable_sync exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table families exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table family_members exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table family_chat_messages exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table family_activities exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table streaks exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table badges exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table achievements exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table subscriptions exists in migration 014_nomad_schema.sql but not in Prisma schema
- ⚠️ Table profiles exists in migration 015_auto_fixes.sql but not in Prisma schema
- ⚠️ Table organizations exists in migration 016__comprehensive_auto_fixes.sql but not in Prisma schema
- ⚠️ Table user_organizations exists in migration 016__comprehensive_auto_fixes.sql but not in Prisma schema
- ⚠️ Table profiles exists in migration 016__comprehensive_auto_fixes.sql but not in Prisma schema
- ⚠️ Table api_usage exists in migration 016__comprehensive_auto_fixes.sql but not in Prisma schema
- ⚠️ Table event_logs exists in migration 016__comprehensive_auto_fixes.sql but not in Prisma schema
- ⚠️ Table profiles exists in migration 017_create_tables.sql but not in Prisma schema
- ⚠️ Table pantry_items exists in migration 017_create_tables.sql but not in Prisma schema
- ⚠️ Table recipes exists in migration 017_create_tables.sql but not in Prisma schema
- ⚠️ Table favorites exists in migration 017_create_tables.sql but not in Prisma schema
- ⚠️ Table analytics_events exists in migration 018_analytics_logging_tables.sql but not in Prisma schema
- ⚠️ Table recipe_metrics exists in migration 018_analytics_logging_tables.sql but not in Prisma schema
- ⚠️ Table system_metrics exists in migration 018_analytics_logging_tables.sql but not in Prisma schema
- ⚠️ Table logs exists in migration 018_analytics_logging_tables.sql but not in Prisma schema
- ⚠️ Table error_reports exists in migration 018_analytics_logging_tables.sql but not in Prisma schema
- ⚠️ Table recipe_feedback exists in migration 018_analytics_logging_tables.sql but not in Prisma schema
- ⚠️ Table ai_config exists in migration 018_analytics_logging_tables.sql but not in Prisma schema
- ⚠️ Table workflow_state exists in migration 018_analytics_logging_tables.sql but not in Prisma schema
- ⚠️ Table tenants exists in migration 019_multi_tenant_saas_schema.sql but not in Prisma schema
- ⚠️ Table tenant_memberships exists in migration 019_multi_tenant_saas_schema.sql but not in Prisma schema
- ⚠️ Table subscriptions exists in migration 019_multi_tenant_saas_schema.sql but not in Prisma schema
- ⚠️ Table usage_logs exists in migration 019_multi_tenant_saas_schema.sql but not in Prisma schema
- ⚠️ Table tenant_invites exists in migration 019_multi_tenant_saas_schema.sql but not in Prisma schema
- ⚠️ Table ai_cache exists in migration 019_multi_tenant_saas_schema.sql but not in Prisma schema
- ⚠️ Table billing_events exists in migration 019_multi_tenant_saas_schema.sql but not in Prisma schema
- ⚠️ Table growth_metrics exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table referrals exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table affiliate_campaigns exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table funnel_events exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table ab_test_experiments exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table ab_test_variants exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table ab_test_assignments exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table ai_copy_logs exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table social_posts exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table ugc_shares exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table dynamic_pricing_rules exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table churn_predictions exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table winback_campaigns exists in migration 021_growth_engine_schema.sql but not in Prisma schema
- ⚠️ Table partner_registry exists in migration 022_federated_ecosystem_schema.sql but not in Prisma schema
- ⚠️ Table federated_api_endpoints exists in migration 022_federated_ecosystem_schema.sql but not in Prisma schema
- ⚠️ Table api_usage_tracking exists in migration 022_federated_ecosystem_schema.sql but not in Prisma schema
- ⚠️ Table ai_model_advisor exists in migration 022_federated_ecosystem_schema.sql but not in Prisma schema
- ⚠️ Table ai_evolution_logs exists in migration 022_federated_ecosystem_schema.sql but not in Prisma schema
- ⚠️ Table franchise_deployments exists in migration 022_federated_ecosystem_schema.sql but not in Prisma schema
- ⚠️ Table compliance_audit_logs exists in migration 022_federated_ecosystem_schema.sql but not in Prisma schema
- ⚠️ Table anomaly_detections exists in migration 022_federated_ecosystem_schema.sql but not in Prisma schema
- ⚠️ Table developer_portal_sessions exists in migration 022_federated_ecosystem_schema.sql but not in Prisma schema
- ⚠️ Table sdk_downloads exists in migration 022_federated_ecosystem_schema.sql but not in Prisma schema
- ⚠️ Table jobs_queue exists in migration 023_job_queue_schema.sql but not in Prisma schema
- ⚠️ Table job_results exists in migration 023_job_queue_schema.sql but not in Prisma schema
- ⚠️ Table job_logs exists in migration 023_job_queue_schema.sql but not in Prisma schema
- ⚠️ Table admin_users exists in migration 026_admin_dashboard_schema.sql but not in Prisma schema
- ⚠️ Table admin_sessions exists in migration 026_admin_dashboard_schema.sql but not in Prisma schema
- ⚠️ Table admin_audit_logs exists in migration 026_admin_dashboard_schema.sql but not in Prisma schema
- ⚠️ Table system_logs exists in migration 026_admin_dashboard_schema.sql but not in Prisma schema
- ⚠️ Table community_posts exists in migration 027_community_portal_schema.sql but not in Prisma schema
- ⚠️ Table community_votes exists in migration 027_community_portal_schema.sql but not in Prisma schema
- ⚠️ Table community_comments exists in migration 027_community_portal_schema.sql but not in Prisma schema
- ⚠️ Table community_follows exists in migration 027_community_portal_schema.sql but not in Prisma schema
- ⚠️ Table community_bookmarks exists in migration 027_community_portal_schema.sql but not in Prisma schema
- ⚠️ Table community_reports exists in migration 027_community_portal_schema.sql but not in Prisma schema
- ⚠️ Table community_achievements exists in migration 027_community_portal_schema.sql but not in Prisma schema
- ⚠️ Table community_leaderboard exists in migration 027_community_portal_schema.sql but not in Prisma schema
- ⚠️ Table community_events exists in migration 027_community_portal_schema.sql but not in Prisma schema
- ⚠️ Table community_event_submissions exists in migration 027_community_portal_schema.sql but not in Prisma schema
- ⚠️ Table chef_profiles exists in migration 028_chef_marketplace_schema.sql but not in Prisma schema
- ⚠️ Table recipe_packs exists in migration 028_chef_marketplace_schema.sql but not in Prisma schema
- ⚠️ Table recipe_pack_reviews exists in migration 028_chef_marketplace_schema.sql but not in Prisma schema
- ⚠️ Table chef_offers exists in migration 028_chef_marketplace_schema.sql but not in Prisma schema
- ⚠️ Table chef_analytics exists in migration 028_chef_marketplace_schema.sql but not in Prisma schema
- ⚠️ Table chef_earnings exists in migration 028_chef_marketplace_schema.sql but not in Prisma schema
- ⚠️ Table chef_followers exists in migration 028_chef_marketplace_schema.sql but not in Prisma schema
- ⚠️ Table chef_notifications exists in migration 028_chef_marketplace_schema.sql but not in Prisma schema
- ⚠️ Table chef_verification_documents exists in migration 028_chef_marketplace_schema.sql but not in Prisma schema
- ⚠️ Table referral_codes exists in migration 029_referral_social_schema.sql but not in Prisma schema
- ⚠️ Table referral_tracking exists in migration 029_referral_social_schema.sql but not in Prisma schema
- ⚠️ Table social_shares exists in migration 029_referral_social_schema.sql but not in Prisma schema
- ⚠️ Table viral_campaigns exists in migration 029_referral_social_schema.sql but not in Prisma schema
- ⚠️ Table user_badges exists in migration 029_referral_social_schema.sql but not in Prisma schema
- ⚠️ Table social_leaderboard exists in migration 029_referral_social_schema.sql but not in Prisma schema
- ⚠️ Table social_analytics exists in migration 029_referral_social_schema.sql but not in Prisma schema
- ⚠️ Table referral_rewards exists in migration 029_referral_social_schema.sql but not in Prisma schema
- ⚠️ Table social_widgets exists in migration 029_referral_social_schema.sql but not in Prisma schema
- ⚠️ Table config_flags exists in migration 030_feature_flags_schema.sql but not in Prisma schema
- ⚠️ Table flag_audit_log exists in migration 030_feature_flags_schema.sql but not in Prisma schema
- ⚠️ Table user_preferences exists in migration 032_gap_closure_features.sql but not in Prisma schema
- ⚠️ Table onboarding_state exists in migration 032_gap_closure_features.sql but not in Prisma schema
- ⚠️ Table experiment_events exists in migration 032_gap_closure_features.sql but not in Prisma schema
- ⚠️ Table lead_referrals exists in migration 032_gap_closure_features.sql but not in Prisma schema
- ⚠️ Table users exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table households exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table household_members exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table recipes exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table meal_plans exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table grocery_lists exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table health_metrics exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table rooms exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table messages exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table feature_flags exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table ad_impressions exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table events exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table api_keys exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table webhook_events exists in migration 033_initial_schema.sql but not in Prisma schema
- ⚠️ Table email_subscriptions exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table referral_programs exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table referral_codes exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table referrals exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table promo_offers exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table experiments exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table experiment_variants exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table experiment_assignments exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table pricing_rules exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table lifecycle_events exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table journey_states exists in migration 034_growth_systems.sql but not in Prisma schema
- ⚠️ Table transactions exists in migration 035_revenue_optimization.sql but not in Prisma schema
- ⚠️ Table revenue_snapshots exists in migration 035_revenue_optimization.sql but not in Prisma schema
- ⚠️ Table price_experiments exists in migration 035_revenue_optimization.sql but not in Prisma schema
- ⚠️ Table elasticity_results exists in migration 035_revenue_optimization.sql but not in Prisma schema
- ⚠️ Table vanwestendorp_surveys exists in migration 035_revenue_optimization.sql but not in Prisma schema
- ⚠️ Table ltv_segments exists in migration 035_revenue_optimization.sql but not in Prisma schema
- ⚠️ Table partners exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table partner_api_keys exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table catalog_feeds exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table catalog_items exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table campaigns exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table creatives exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table placements exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table partner_links exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table clicks exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table conversions exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table payouts exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table fraud_signals exists in migration 036_partner_revenue_network.sql but not in Prisma schema
- ⚠️ Table dsar_requests exists in migration 037_regtech_layer.sql but not in Prisma schema
- ⚠️ Table dsar_artifacts exists in migration 037_regtech_layer.sql but not in Prisma schema
- ⚠️ Table processing_activities exists in migration 037_regtech_layer.sql but not in Prisma schema
- ⚠️ Table risk_register exists in migration 037_regtech_layer.sql but not in Prisma schema
- ⚠️ Table controls exists in migration 037_regtech_layer.sql but not in Prisma schema
- ⚠️ Table control_evidence exists in migration 037_regtech_layer.sql but not in Prisma schema
- ⚠️ Table vendor_catalog exists in migration 037_regtech_layer.sql but not in Prisma schema
- ⚠️ Table dpia_records exists in migration 037_regtech_layer.sql but not in Prisma schema
- ⚠️ Table legal_hold exists in migration 037_regtech_layer.sql but not in Prisma schema
- ⚠️ Table regulatory_reports exists in migration 037_regtech_layer.sql but not in Prisma schema
- ⚠️ Table nutrition_cache exists in migration 040_premium_features.sql but not in Prisma schema
- ⚠️ Table ingredient_prices exists in migration 040_premium_features.sql but not in Prisma schema
- ⚠️ Table meal_plans exists in migration 040_premium_features.sql but not in Prisma schema
- ⚠️ Table meal_plan_days exists in migration 040_premium_features.sql but not in Prisma schema
- ⚠️ Table user_preferences exists in migration 040_premium_features.sql but not in Prisma schema
- ⚠️ Table user_interactions exists in migration 040_premium_features.sql but not in Prisma schema
- ⚠️ Table recipe_shares exists in migration 040_premium_features.sql but not in Prisma schema
- ⚠️ Table recipe_collections exists in migration 040_premium_features.sql but not in Prisma schema
- ⚠️ Table recipe_collection_items exists in migration 040_premium_features.sql but not in Prisma schema
- ⚠️ Table cost_savings_tracking exists in migration 040_premium_features.sql but not in Prisma schema
- ⚠️ Table privacy_prefs exists in migration 041_privacy_first_usage_monitoring.sql but not in Prisma schema
- ⚠️ Table app_allowlist exists in migration 041_privacy_first_usage_monitoring.sql but not in Prisma schema
- ⚠️ Table signal_toggles exists in migration 041_privacy_first_usage_monitoring.sql but not in Prisma schema
- ⚠️ Table telemetry_events exists in migration 041_privacy_first_usage_monitoring.sql but not in Prisma schema
- ⚠️ Table privacy_transparency_log exists in migration 041_privacy_first_usage_monitoring.sql but not in Prisma schema
- ⚠️ Table mfa_enforced_sessions exists in migration 041_privacy_first_usage_monitoring.sql but not in Prisma schema
- ⚠️ Table trust_ledger_roots exists in migration 042_guardian_trust_ledger_roots.sql but not in Prisma schema
- ⚠️ Table events exists in migration 043_agent_pattern_detection.sql but not in Prisma schema
- ⚠️ Table sessions exists in migration 043_agent_pattern_detection.sql but not in Prisma schema
- ⚠️ Table user_apps exists in migration 043_agent_pattern_detection.sql but not in Prisma schema
- ⚠️ Table signals exists in migration 043_agent_pattern_detection.sql but not in Prisma schema
- ⚠️ Table segments exists in migration 043_agent_pattern_detection.sql but not in Prisma schema
- ⚠️ Table user_segments exists in migration 043_agent_pattern_detection.sql but not in Prisma schema
- ⚠️ Table recommendations exists in migration 043_agent_pattern_detection.sql but not in Prisma schema
- ⚠️ Table support_diagnostics exists in migration 043_agent_pattern_detection.sql but not in Prisma schema
- ⚠️ Table profiles exists in migration 044_gamify.sql but not in Prisma schema
- ⚠️ Table journal_entries exists in migration 044_gamify.sql but not in Prisma schema
- ⚠️ Table badges exists in migration 044_gamify.sql but not in Prisma schema
- ⚠️ Table user_badges exists in migration 044_gamify.sql but not in Prisma schema
- ⚠️ Table streaks exists in migration 044_gamify.sql but not in Prisma schema
- ⚠️ Table posts exists in migration 044_gamify.sql but not in Prisma schema
- ⚠️ Table reactions exists in migration 044_gamify.sql but not in Prisma schema
- ⚠️ Table comments exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table moderation_actions exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table referrals exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table weekly_challenges exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table user_challenge_progress exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table leaderboard_entries exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table notifications exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table activity_log exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table friendships exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table push_subscriptions exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table community_challenges exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table community_challenge_contributions exists in migration 045_gamify_enhanced.sql but not in Prisma schema
- ⚠️ Table cooking_activities exists in migration 047_cooking_live.sql but not in Prisma schema
- ⚠️ Table cook_offs exists in migration 047_cooking_live.sql but not in Prisma schema
- ⚠️ Table cook_off_participants exists in migration 047_cooking_live.sql but not in Prisma schema
- ⚠️ Table cooking_activity_likes exists in migration 047_cooking_live.sql but not in Prisma schema
- ⚠️ Table meal_prefs exists in migration 048_2025-11-05_meal_prefs.sql but not in Prisma schema
- ⚠️ Table telemetry_events exists in migration 049_2025-11-05_telemetry.sql but not in Prisma schema
- ⚠️ Table audit_log exists in migration 050_2025-11-05_trust_audit.sql but not in Prisma schema
- ⚠️ Table metrics_log exists in migration 053_performance_intelligence_metrics_log.sql but not in Prisma schema
- ⚠️ Table user_streaks exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table user_badges exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table user_credits exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table credit_transactions exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table recipe_collections exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table collection_purchases exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table recipe_shares exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table share_rewards exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table recipe_images exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table family_members exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table family_invites exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table subscription_usage exists in migration 1000_growth_features_tables.sql but not in Prisma schema
- ⚠️ Table account_deletions exists in migration 995_create_account_deletion.sql but not in Prisma schema
- ⚠️ Table support_tickets exists in migration 996_create_support_tickets.sql but not in Prisma schema
- ⚠️ Table support_ticket_messages exists in migration 996_create_support_tickets.sql but not in Prisma schema
- ⚠️ Table invoices exists in migration 997_create_billing_refunds_invoices.sql but not in Prisma schema
- ⚠️ Table refunds exists in migration 997_create_billing_refunds_invoices.sql but not in Prisma schema
- ⚠️ Table tax_calculations exists in migration 997_create_billing_refunds_invoices.sql but not in Prisma schema
- ⚠️ Table referrals exists in migration 998_create_referral_affiliate_partner_schema.sql but not in Prisma schema
- ⚠️ Table referral_rewards exists in migration 998_create_referral_affiliate_partner_schema.sql but not in Prisma schema
- ⚠️ Table affiliates exists in migration 998_create_referral_affiliate_partner_schema.sql but not in Prisma schema
- ⚠️ Table affiliate_conversions exists in migration 998_create_referral_affiliate_partner_schema.sql but not in Prisma schema
- ⚠️ Table partners exists in migration 998_create_referral_affiliate_partner_schema.sql but not in Prisma schema
- ⚠️ Table partner_revenue_shares exists in migration 998_create_referral_affiliate_partner_schema.sql but not in Prisma schema
- ⚠️ Table program_analytics exists in migration 998_create_referral_affiliate_partner_schema.sql but not in Prisma schema
- ⚠️ Table program_payouts exists in migration 998_create_referral_affiliate_partner_schema.sql but not in Prisma schema
- ⚠️ Table knowledge_base_articles exists in migration 999_create_knowledge_base.sql but not in Prisma schema
- ⚠️ Table knowledge_base_categories exists in migration 999_create_knowledge_base.sql but not in Prisma schema
- ⚠️ Table chat_conversations exists in migration 999_create_knowledge_base.sql but not in Prisma schema
- ⚠️ Table chat_messages exists in migration 999_create_knowledge_base.sql but not in Prisma schema
- ⚠️ Table article_feedback exists in migration 999_create_knowledge_base.sql but not in Prisma schema
- ⚠️ Table article_views exists in migration 999_create_knowledge_base.sql but not in Prisma schema
- ⚠️ Table search_queries exists in migration 999_create_knowledge_base.sql but not in Prisma schema
- ⚠️ Table knowledge_base_updates exists in migration 999_create_knowledge_base.sql but not in Prisma schema
- ⚠️ Table secrets_vault exists in migration create_secrets_vault.sql but not in Prisma schema
- ⚠️ Table secret_rotation_logs exists in migration create_secrets_vault.sql but not in Prisma schema

## 3. Vercel Deployment Config

- **Config Valid:** ✅

**Issues:**
- ⚠️ Cron endpoint /api/cron/retention?frequency=daily does not exist
- ⚠️ Cron endpoint /api/cron/retention?frequency=weekly does not exist
- ⚠️ next.config.ts has output: 'export' which disables API routes. Cron jobs will not work.

## 4. Repo Integrity

- **Broken Imports:** 18

**Broken Imports:**
- /workspace/scripts/verify-audit.ts: ../packages/server/src/audit/index.js
- /workspace/scripts/seed-admin.ts: ../packages/server/src/db/index.js
- /workspace/scripts/seed-admin.ts: ../packages/server/src/db/schema.js
- /workspace/scripts/seed-admin.ts: ../packages/server/src/auth/admin.js
- /workspace/packages/adapters/crm/noop.ts: ./types.js
- /workspace/packages/adapters/crm/noop.ts: ../../server/src/observability/index.js
- /workspace/packages/adapters/crm/index.ts: ./sendgrid.js
- /workspace/packages/adapters/crm/index.ts: ./klaviyo.js
- /workspace/packages/adapters/crm/index.ts: ./noop.js
- /workspace/packages/adapters/crm/index.ts: ./types.js
- ... and 8 more

## 5. AI Agent Mesh

- **Zapier Configured:** ✅

**Integrations:**
- zapier-Pull Meta Ads Data: ❌
- zapier-Pull TikTok Ads Data: ❌
- zapier-Pull Shopify Orders: ❌
- zapier-Compute Daily Metrics: ❌
- tiktok: ❌
- meta.*ads: ❌
- elevenlabs: ❌
- autods: ❌
- capcut: ❌
- mindstudio: ❌

# Supabase Schema Installation Guide

The master SQL file has been split into 13 smaller parts for easier pasting into the Supabase SQL Editor.

## Installation Order

Run these files **IN ORDER** in your Supabase SQL Editor:

### Part 1: Core Tables
- File: `supabase_tables_part1_core.sql`
- Creates: profiles, pantry_items, recipes, favorites

### Part 2: Analytics Tables
- File: `supabase_tables_part2_analytics.sql`
- Creates: analytics_events, recipe_metrics, system_metrics, logs, error_reports, recipe_feedback, ai_config, workflow_state

### Part 3: Multi-Tenant Schema
- File: `supabase_tables_part3_multitenant.sql`
- Creates: tenants, tenant_memberships, subscriptions, usage_logs, tenant_invites, ai_cache, billing_events
- Also adds tenant_id columns to existing tables

### Part 4: Growth Engine
- File: `supabase_tables_part4_growth.sql`
- Creates: growth_metrics, referrals, affiliate_campaigns, funnel_events, ab_test tables, social_posts, ugc_shares, churn_predictions, winback_campaigns

### Part 5: Federated Ecosystem
- File: `supabase_tables_part5_federated.sql`
- Creates: partner_registry, federated_api_endpoints, api_usage_tracking, ai_model_advisor, ai_evolution_logs, franchise_deployments, compliance_audit_logs, anomaly_detections, developer_portal_sessions, sdk_downloads

### Part 6: Job Queue
- File: `supabase_tables_part6_jobqueue.sql`
- Creates: jobs_queue, job_results, job_logs

### Part 7: Admin Dashboard
- File: `supabase_tables_part7_admin.sql`
- Creates: admin_users, admin_sessions, admin_audit_logs, system_logs

### Part 8: Community Portal
- File: `supabase_tables_part8_community.sql`
- Creates: community_posts, community_votes, community_comments, community_follows, community_bookmarks, community_reports, community_achievements, community_leaderboard, community_events, community_event_submissions

### Part 9: Chef Marketplace
- File: `supabase_tables_part9_chef.sql`
- Creates: chef_profiles, recipe_packs, recipe_pack_reviews, chef_offers, chef_analytics, chef_earnings, chef_followers, chef_notifications, chef_verification_documents

### Part 10: Referral and Social
- File: `supabase_tables_part10_social.sql`
- Creates: referral_codes, referral_tracking, social_shares, viral_campaigns, user_badges, social_leaderboard, social_analytics, referral_rewards, social_widgets

### Part 11: Feature Flags
- File: `supabase_tables_part11_featureflags.sql`
- Creates: config_flags, flag_audit_log

### Part 12: AI System
- File: `supabase_tables_part12_ai.sql`
- Creates: ai_health_metrics, ai_embeddings, ai_insights, ai_cost_analysis, ai_performance_metrics, ai_performance_reports, ai_integrity_reports

### Part 13: Gap Closure Features (FINAL)
- File: `supabase_tables_part13_gapclosure.sql`
- Creates: user_preferences, onboarding_state, experiment_events, lead_referrals

## Quick Installation Steps

1. Open Supabase SQL Editor
2. Start with Part 1, copy the entire file content
3. Paste into SQL Editor and click "Run query"
4. Wait for success message
5. Repeat for Part 2, Part 3, etc. through Part 13

## Notes

- Each file uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
- **IMPORTANT**: Run files in order (1 ? 13) due to foreign key dependencies
- Files are small enough to paste directly into Supabase SQL Editor
- After creating all tables, you may want to set up Row Level Security policies
- The master file is available if you prefer to split it manually into smaller chunks

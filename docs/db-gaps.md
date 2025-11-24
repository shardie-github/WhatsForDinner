# Database Schema Gaps Analysis

## Summary

This document identifies gaps between:
1. Prisma schema (`prisma/schema.prisma`)
2. Migration files (`supabase/migrations/**`)
3. Code usage (TypeScript queries, RPC calls)

## Missing in Migrations (but in Prisma/Code)

### Tables Present in Prisma but Need Verification in Migrations
- ✅ `users` - Present in migrations
- ✅ `households` - Present in migrations
- ✅ `household_members` - Present in migrations
- ✅ `recipes` - Present in migrations
- ✅ `meal_plans` - Present in migrations
- ✅ `grocery_lists` - Present in migrations
- ✅ `health_metrics` - Present in migrations
- ✅ `rooms` - Present in migrations
- ✅ `messages` - Present in migrations
- ✅ `feature_flags` - Present in migrations
- ✅ `ad_impressions` - Present in migrations
- ✅ `events` - Present in migrations
- ✅ `api_keys` - Present in migrations
- ✅ `webhook_events` - Present in migrations
- ✅ `email_subscriptions` - Present in migrations
- ✅ `referral_programs` - Present in migrations
- ✅ `referral_codes` - Present in migrations
- ✅ `referrals` - Present in migrations (multiple definitions - needs consolidation)
- ✅ `privacy_prefs` - Present in migrations
- ✅ `app_allowlist` - Present in migrations
- ✅ `signal_toggles` - Present in migrations
- ✅ `telemetry_events` - Present in migrations (multiple definitions - needs consolidation)
- ✅ `privacy_transparency_log` - Present in migrations
- ✅ `mfa_enforced_sessions` - Present in migrations
- ✅ `dsar_requests` - Present in migrations

### Potential Duplicates/Conflicts

⚠️ **Multiple `referrals` table definitions:**
- `034_growth_systems.sql` - Growth system referrals
- `998_create_referral_affiliate_partner_schema.sql` - Referral/affiliate schema
- `021_growth_engine_schema.sql` - Growth engine referrals
- **Action**: Consolidate into single referrals table with comprehensive schema

⚠️ **Multiple `telemetry_events` table definitions:**
- `041_privacy_first_usage_monitoring.sql` - Privacy-first telemetry (UUID id, encrypted)
- `049_2025-11-05_telemetry.sql` - Simple telemetry (bigserial id)
- **Action**: Use the privacy-first version (041) as canonical, migrate 049 data if needed

⚠️ **Multiple `meal_plans` table definitions:**
- `033_initial_schema.sql` - Core meal plans
- `040_premium_features.sql` - Enhanced meal plans with days
- `014_nomad_schema.sql` - Nomad meal plans
- **Action**: Consolidate into single comprehensive meal_plans table

⚠️ **Multiple `profiles` table references:**
- Some migrations reference `profiles` table that may not exist
- `users` table is the canonical user table
- **Action**: Ensure RLS policies reference `users` not `profiles`, or create `profiles` if needed

## Obsolete in Migrations (not used in code)

### Tables Defined but Not Referenced in Prisma
- `profiles` - Referenced in some RLS policies but not in Prisma schema
- `pantry_items` - Not in Prisma but referenced in migrations
- `favorites` - Not in Prisma but referenced in migrations
- Various multi-tenant tables (`tenants`, `tenant_memberships`) - May not be actively used
- Various admin tables (`admin_users`, `admin_sessions`) - May be used but not in Prisma

**Note**: Prisma schema may not be complete. These tables may be used via direct SQL or Supabase client.

## Inconsistencies

### Type Mismatches
- `telemetry_events.id`: UUID in 041 vs bigserial in 049
- `meal_prefs.user_id`: References `auth.users` vs `users` table
- Some tables reference `auth.users` directly, others reference `users` table

### Missing Foreign Keys
- Some tables have loose references without explicit FK constraints
- Some RLS policies reference tables that may not exist

### RLS Policy Conflicts
- Multiple migrations define RLS policies for same tables
- Some policies may conflict or override each other
- Need to consolidate into single policy set per table

## Recommendations

1. **Consolidate duplicate tables**: Merge multiple definitions of `referrals`, `telemetry_events`, `meal_plans`
2. **Standardize references**: Use `users` table consistently, not `auth.users` or `profiles`
3. **Create missing tables**: Add `profiles` table if needed for admin roles, or update RLS to use `users`
4. **Verify all FKs**: Ensure all foreign keys are properly defined
5. **Consolidate RLS policies**: Single source of truth for each table's RLS policies
6. **Align Prisma schema**: Update Prisma to match final consolidated migration, or vice versa

## Migration Strategy

The master migration (`99999999999999_master_consolidated_schema.sql`) will:
1. Create all tables with final structure (resolving conflicts)
2. Use `IF NOT EXISTS` to be idempotent
3. Define all RLS policies in one place
4. Create all functions and triggers
5. Be safe to run on fresh database

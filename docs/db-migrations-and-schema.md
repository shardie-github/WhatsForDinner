# Database Migrations & Schema

**Last Updated:** 2025-01-28  
**Status:** ✅ Complete Migration Strategy Documented

---

## Executive Summary

This repository uses a **dual-approach** for database schema management:
- **Migrations:** Supabase-native SQL migrations (`supabase/migrations/`)
- **Type Generation:** Prisma schema (`prisma/schema.prisma`) for type-safe access

**Key Principle:** Supabase handles migrations, Prisma handles type generation.

---

## Migration Strategy

### Master Consolidated Migration

**File:** `supabase/migrations/99999999999999_master_consolidated_schema.sql`

**Purpose:** Single consolidated migration for fresh database bootstrapping

**Characteristics:**
- ✅ Idempotent (uses `IF NOT EXISTS` throughout)
- ✅ Contains all tables, enums, indexes, RLS policies, functions
- ✅ Safe to run multiple times
- ✅ Suitable for fresh database initialization

**When to Use:**
- Fresh database setup
- Development environment initialization
- Testing database setup

**When NOT to Use:**
- Production databases with existing data (use incremental migrations instead)

---

## Migration Workflow

### Local Development

**Prerequisites:**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to Supabase project (one-time)
supabase link --project-ref <your-project-ref>
```

**Apply Migrations:**
```bash
# Apply all pending migrations
supabase migration up

# Or apply specific migration
supabase migration up --version <timestamp>
```

**Create New Migration:**
```bash
# Generate migration from schema changes
supabase migration new <migration-name>

# Or use migra to generate diff
supabase db diff -f <migration-name>
```

**Check Migration Status:**
```bash
# List applied migrations
supabase migration list

# Check remote status
supabase db remote commit --dry-run
```

---

### CI/CD Workflow

**Workflow:** `.github/workflows/supabase-migrate.yml`

**Triggers:**
- Push to `main` branch
- Manual dispatch (`workflow_dispatch`)

**Steps:**
1. Checkout code
2. Setup pnpm 9.0.0
3. Setup Node.js 20.x
4. Login to Supabase (`supabase login --token`)
5. Link project (`supabase link --project-ref`)
6. Apply migrations (`supabase migration up`)
7. Validate schema (optional, via `scripts/db-validate-schema.ts`)

**Secrets Required:**
- `SUPABASE_ACCESS_TOKEN` - Supabase CLI authentication token
- `SUPABASE_PROJECT_REF` - Supabase project reference ID
- `DATABASE_URL` - Database connection string (for validation)

**Concurrency:**
- Group: `supabase-migrations-${{ github.ref }}`
- Cancel in-progress: `false` (migrations must complete sequentially)

---

## Prisma Integration

### Schema File

**Location:** `prisma/schema.prisma`

**Purpose:** Type-safe database access in application code

**Engine Type:** WASM (for Termux/Android compatibility)

**Generation:**
```bash
# Generate Prisma Client
pnpm prisma generate

# Or via package script
pnpm db:generate
```

**Usage:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type-safe database access
const user = await prisma.user.findUnique({
  where: { id: userId },
});
```

### Prisma vs Supabase Migrations

**Why Both?**

1. **Supabase Migrations:**
   - Native SQL migrations
   - Better for complex RLS policies
   - Better for database functions and triggers
   - Required for Supabase platform features

2. **Prisma Schema:**
   - Type generation for application code
   - Better developer experience (autocomplete, type safety)
   - Not used for migrations (Supabase handles migrations)

**Synchronization:**
- Prisma schema should match Supabase schema
- When Supabase schema changes, update Prisma schema manually
- Script exists: `scripts/sync-prisma-from-supabase.ts` (if needed)

---

## Schema Validation

### Validation Script

**Location:** `scripts/db-validate-schema.ts`

**Purpose:** Validate that database schema matches expectations

**Usage:**
```bash
# Run validation
tsx scripts/db-validate-schema.ts

# Or via package script
pnpm db:validate
```

**What It Checks:**
- ✅ Core tables exist (`users`, `households`, `recipes`, `meal_plans`, etc.)
- ✅ Required columns exist
- ✅ Indexes exist
- ✅ RLS policies exist (informational)

**Required Environment:**
- `DATABASE_URL` - PostgreSQL connection string

**Output:**
- ✅ Pass: All tables and columns exist
- ❌ Fail: Missing tables or columns (with details)

---

## Core Schema Overview

### Core Tables

**Users & Authentication:**
- `users` - User accounts
- `households` - Family/household management
- `household_members` - Household membership

**Meal Planning:**
- `recipes` - Recipe storage
- `meal_plans` - Meal planning data
- `grocery_lists` - Shopping lists

**Health Tracking:**
- `health_metrics` - Health metrics (weight, sleep, water, steps, calories)

**Messaging:**
- `rooms` - Chat rooms (family, DM)
- `messages` - Chat messages

**Growth Systems:**
- `email_subscriptions` - Email marketing
- `referral_programs` - Referral programs
- `referral_codes` - Referral codes
- `referrals` - Referral tracking

**Privacy & Compliance:**
- `privacy_prefs` - Privacy preferences
- `app_allowlist` - App allowlist
- `signal_toggles` - Signal toggles
- `telemetry_events` - Telemetry events
- `privacy_transparency_log` - Privacy transparency log
- `mfa_enforced_sessions` - MFA sessions
- `dsar_requests` - DSAR (Data Subject Access Request) requests

**Monetization:**
- `api_keys` - API keys for partners
- `webhook_events` - Webhook events
- `ad_impressions` - Ad impressions
- `events` - Analytics events

**Feature Flags:**
- `feature_flags` - User-level feature flags

---

## Row-Level Security (RLS)

### Strategy

**Enforcement:** Database-level access control via RLS policies

**Benefits:**
- Security enforced at database level (can't be bypassed)
- Multi-tenant data isolation
- Fine-grained access control (per table, per user)

### Example Policies

**Users can only read their own meal plans:**
```sql
CREATE POLICY "Users can read own meal plans"
ON meal_plans FOR SELECT
USING (auth.uid() = user_id);
```

**Household members can read household data:**
```sql
CREATE POLICY "Household members can read household"
ON households FOR SELECT
USING (
  auth.uid() = owner_id OR
  auth.uid() IN (
    SELECT user_id FROM household_members
    WHERE household_id = households.id
  )
);
```

**RLS Policies Location:**
- Defined in master migration: `supabase/migrations/99999999999999_master_consolidated_schema.sql`
- Applied automatically when migration runs

---

## Indexes

### Key Indexes

**Performance-Critical Indexes:**
- `meal_plans_user_day_idx` - On `meal_plans(user_id, day)`
- `health_metrics_user_kind_ts_idx` - On `health_metrics(user_id, kind, ts)`
- `events_user_ts_idx` - On `events(user_id, ts)`
- `messages_room_ts_idx` - On `messages(room_id, ts)`

**Foreign Key Indexes:**
- Automatically created for foreign keys
- Additional indexes for common query patterns

**Index Strategy:**
- Index foreign keys
- Index frequently queried columns
- Index columns used in WHERE clauses
- Index columns used in JOINs

---

## Enums

### Core Enums

**Plan Types:**
- `free` - Free plan
- `premium` - Premium plan
- `partner` - Partner plan

**Roles:**
- `owner` - Household owner
- `adult` - Adult member
- `teen` - Teen member
- `child` - Child member

**Recipe Sources:**
- `curated` - Curated recipes
- `partner` - Partner recipes
- `user` - User-created recipes

**Health Metric Kinds:**
- `weight` - Weight tracking
- `sleep` - Sleep tracking
- `water` - Water intake
- `steps` - Step count
- `calories` - Calorie tracking

**And more...** See master migration for complete list.

---

## Database Functions

### Helper Functions

**Auth Helper:**
```sql
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT current_setting('request.jwt.claims', true)::json->>'sub'::uuid;
$$ LANGUAGE sql STABLE;
```

**Updated At Trigger:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Usage:**
- Applied automatically via triggers on tables with `updated_at` columns
- Ensures `updated_at` is always current

---

## Migration Best Practices

### ✅ Do

1. **Use idempotent migrations** (`IF NOT EXISTS`, `CREATE OR REPLACE`)
2. **Test migrations locally** before pushing
3. **Run migrations in CI** before deploying code
4. **Validate schema** after migrations
5. **Document breaking changes** in migration comments
6. **Use transactions** for multi-step migrations
7. **Backup before migrations** (production)

### ❌ Don't

1. **Don't modify existing migrations** (create new ones instead)
2. **Don't run migrations manually in production** (use CI/CD)
3. **Don't skip validation** after migrations
4. **Don't mix concerns** (separate migrations for schema vs data)
5. **Don't commit secrets** in migrations

---

## Troubleshooting

### Migration Fails in CI

**Common Issues:**
1. **Supabase token expired:** Regenerate `SUPABASE_ACCESS_TOKEN`
2. **Migration conflicts:** Check for schema drift
3. **Syntax errors:** Validate SQL syntax locally
4. **Missing dependencies:** Ensure all migrations are in correct order

**Fix:**
```bash
# Check migration status locally
supabase migration list

# Validate SQL syntax
supabase migration lint

# Check for drift
supabase db remote commit --dry-run
```

### Schema Validation Fails

**Common Issues:**
1. **Missing tables:** Run migrations
2. **Missing columns:** Check migration applied correctly
3. **Connection issues:** Verify `DATABASE_URL` is correct

**Fix:**
```bash
# Run validation script
tsx scripts/db-validate-schema.ts

# Check database connection
psql $DATABASE_URL -c "SELECT version();"
```

### Prisma Client Generation Fails

**Common Issues:**
1. **Invalid schema:** Check `prisma/schema.prisma` syntax
2. **Missing DATABASE_URL:** Set `DATABASE_URL` environment variable
3. **Engine type mismatch:** Ensure `PRISMA_CLIENT_ENGINE_TYPE=wasm`

**Fix:**
```bash
# Generate Prisma Client
pnpm prisma generate

# Or check schema
pnpm prisma validate
```

---

## Related Documentation

- [Backend Strategy](./backend-strategy.md) - Overall backend architecture
- [Stack Discovery](./stack-discovery.md) - Technology stack overview
- [CI Overview](./ci-overview.md) - CI/CD pipeline
- [Deploy Strategy](./deploy-strategy.md) - Deployment process

---

*Keep this document updated as schema evolves.*

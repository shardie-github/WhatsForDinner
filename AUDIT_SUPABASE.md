# Supabase Database Audit Report

**Generated:** 2025-11-02  
**Audit Script:** `scripts/supabase_audit.sh`  
**Migration:** `supabase/migrations/202511021144__auto_fixes.sql`

---

## Executive Summary

This audit examines the Supabase database configuration across:
- ? Repository migrations
- ? Edge Functions
- ?? Live database state (requires connection)
- ? CI/CD integration

**Status:** Audit infrastructure created. Run `./scripts/supabase_audit.sh` with `SUPABASE_DB_URL` set to perform full audit against live database.

---

## Summary Checklist

| Category | Status | Notes |
|----------|--------|-------|
| **Migrations** | ? | Found in `supabase/migrations/` and `whats-for-dinner/supabase/migrations/` |
| **RLS Policies** | ?? | Requires live database connection to verify |
| **Realtime** | ? | Auto-fix migration ensures publication exists |
| **Storage** | ? | Auto-fix creates default buckets (`assets`, `avatars`) |
| **RPC Functions** | ? | `get_current_user_profile()` added |
| **Extensions** | ? | Auto-fix includes: uuid-ossp, pgcrypto, pgjwt, pg_stat_statements, pg_trgm |
| **Edge Functions** | ? | Found 4 functions; added missing `deno.json` to `search-ai` |
| **Prisma** | ? | Not used in this project |
| **CI Guard** | ? | Workflow at `.github/workflows/supabase-ci.yml` |

---

## 1. Migration Files Analysis

### Migration Locations
- **Primary:** `/workspace/supabase/migrations/`
  - `014_ai_system_schema.sql` (AI tables with RLS)
- **Secondary:** `/workspace/whats-for-dinner/supabase/migrations/`
  - 14 migration files including core tables, analytics, multi-tenant, etc.

### Key Findings
? Most migrations use `IF NOT EXISTS` (idempotent)  
? RLS enabled in early migrations (e.g., `001_create_tables.sql`)  
?? **Action Required:** Run catalog queries against live database to detect drift

### Catalog Queries
Run these queries against your live database to check current state:

```bash
psql "$SUPABASE_DB_URL" < supabase/.audit/catalog_queries.sql > supabase/.audit/catalog_results.txt
```

**Key Queries:**
- Tables & schemas
- RLS status per table
- Existing policies
- Realtime publication membership
- Storage buckets & policies
- RPC functions
- Enabled extensions

---

## 2. Edge Functions

### Function Inventory

| Function | Location | index.ts | deno.json | Status |
|----------|----------|-----------|-----------|--------|
| `search-ai` | `supabase/functions/search-ai/` | ? | ? | Fixed - added deno.json |
| `api` | `whats-for-dinner/supabase/functions/api/` | ? | ? | Shared deno.json |
| `generate-meal` | `whats-for-dinner/supabase/functions/generate-meal/` | ? | ? | Shared deno.json |
| `job-processor` | `whats-for-dinner/supabase/functions/job-processor/` | ? | ? | Shared deno.json |

### Build Status
To verify builds:
```bash
supabase functions build search-ai
supabase functions build api
supabase functions build generate-meal
supabase functions build job-processor
```

### Deployment
```bash
supabase functions deploy search-ai
```

---

## 3. Row Level Security (RLS)

### Current State (from migrations)

**Tables with RLS enabled:**
- `profiles` ? (with own-user policies)
- `pantry_items` ? (with user_id policies)
- `recipes` ? (with user_id policies)
- `favorites` ? (with user_id policies)
- `ai_health_metrics` ? (authenticated read)
- `ai_embeddings` ? (authenticated read)
- `ai_insights` ? (authenticated read)
- Plus many others from consolidated migrations

### Auto-Fix Migration Adds

1. **Profiles table enhancements:**
   - Adds missing columns (`email`, `display_name`, `avatar_url`, timestamps)
   - Ensures RLS enabled
   - Creates idempotent policies

2. **Per-table RLS enablement:**
   - The migration includes a DO block that:
     - Enables RLS on all public tables (idempotent)
     - Detects owner columns (`user_id`, `owner_id`, `created_by`)
     - Creates default read policy for authenticated users
     - Creates owner write policy if owner column found

### Owner Column Heuristic

For each table, the migration checks for (in order):
1. `user_id` ? Used for write policies
2. `owner_id` ? Used for write policies
3. `created_by` ? Used for write policies

If none found, the table gets:
- ? RLS enabled
- ? Authenticated read policy
- ?? **No write policy** (must be added manually)

**Action Required:** Review tables without owner columns and add appropriate write policies.

---

## 4. Realtime Publication

### Current Setup

**Publication:** `supabase_realtime`

**Tables added in auto-fix:**
- ? `public.profiles`

### Additional Tables to Consider

Based on application needs, consider adding:
- `recipes` (if recipes should update in real-time)
- `community_posts` (for live feeds)
- `analytics_events` (for live dashboards)

**To add manually:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.<table_name>;
```

**To check current membership:**
```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

---

## 5. Storage Buckets

### Default Buckets (Auto-Created)

| Bucket | Public | Size Limit | MIME Types |
|---------|--------|------------|------------|
| `assets` | ? | 50MB | images, PDF |
| `avatars` | ? | 2MB | images only |

### Policies Created

**Assets bucket:**
- ? `storage_read_assets` - Public read
- ? `storage_write_assets` - Authenticated insert (owner only)
- ? `storage_update_assets` - Authenticated update (owner only)
- ? `storage_delete_assets` - Authenticated delete (owner only)

**Avatars bucket:**
- ? `storage_read_avatars` - Public read
- ? `storage_write_avatars` - Authenticated all (owner only)

### Custom Buckets

If your application uses additional buckets, add them:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('custom-bucket', 'custom-bucket', false, 10485760)
ON CONFLICT (id) DO NOTHING;
```

---

## 6. Extensions

### Required Extensions (Auto-Installed)

| Extension | Purpose | Status |
|-----------|---------|--------|
| `uuid-ossp` | UUID generation | ? |
| `pgcrypto` | Cryptographic functions | ? |
| `pgjwt` | JWT handling | ? |
| `pg_stat_statements` | Query performance tracking | ? |
| `pg_trgm` | Text search (trigram) | ? |
| `vector` | AI embeddings (pgvector) | ?? Uncomment if needed |

### Optional Extensions

**pg_cron** (requires superuser):
```sql
-- Run as superuser in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

**To verify installed extensions:**
```sql
SELECT extname, extversion FROM pg_extension ORDER BY extname;
```

---

## 7. RPC Functions

### Created Functions

**`get_current_user_profile()`**
- Returns current authenticated user's profile
- Security: `DEFINER`
- Access: `authenticated` role

### Additional Functions Needed?

If your code references functions that don't exist:
1. Check application code for RPC calls
2. Add functions to a migration:

```sql
CREATE OR REPLACE FUNCTION public.your_function_name(...)
RETURNS <return_type>
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Implementation
$$;
```

---

## 8. Auto-Fix Migration

**File:** `supabase/migrations/202511021144__auto_fixes.sql`

### What It Does

? **Idempotent** - Safe to run multiple times  
? **Non-destructive** - Only adds missing items  
? **Safe defaults** - Least-privilege principles

### Includes

1. Extensions (if not exists)
2. Realtime publication setup
3. Profiles table enhancements + trigger
4. Storage buckets (`assets`, `avatars`)
5. Storage policies (owner-based)
6. RPC function (`get_current_user_profile`)
7. Automatic RLS enablement for all public tables
8. Owner-based policies (where detected)

### How to Apply

```bash
# Option 1: Using Supabase CLI
supabase db push --db-url "$SUPABASE_DB_URL"

# Option 2: Manual in Supabase SQL Editor
# Copy contents of 202511021144__auto_fixes.sql and run
```

### Post-Application

After applying:
1. ? Verify extensions: `SELECT extname FROM pg_extension;`
2. ? Verify RLS: Check tables have RLS enabled
3. ? Verify policies: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
4. ? Verify storage: `SELECT * FROM storage.buckets;`

---

## 9. CI/CD Integration

### GitHub Actions Workflow

**Location:** `.github/workflows/supabase-ci.yml`

### What It Does

1. ? **Lints migrations** - Checks SQL syntax
2. ? **Validates Edge Functions** - Ensures they build
3. ? **Schema drift detection** - Compares remote vs local
4. ? **Blocks merges** - If drift detected

### Setup Required

**Repository Secrets:**
- `SUPABASE_DB_URL` - Connection string for remote schema pull

**To enable:**
1. Go to GitHub repo ? Settings ? Secrets
2. Add `SUPABASE_DB_URL` secret
3. Format: `postgresql://postgres:<PASSWORD>@db.<project>.supabase.co:5432/postgres?sslmode=require`

### Workflow Triggers

- Pull requests to `main`/`master`
- Pushes to `main`/`master`

---

## 10. Environment Configuration

### Updated `.env.example`

Added required variables:
- ? `SUPABASE_DB_URL` - For migrations and audits
- ? `SUPABASE_PROJECT_REF` - For CLI operations
- ? `DATABASE_URL` - Alias for compatibility
- ? `PRISMA_CLIENT_ENGINE_TYPE=wasm` - If using Prisma

### Local Setup

```bash
# Copy example
cp .env.example .env.local

# Fill in your values:
# - SUPABASE_DB_URL (from Supabase Dashboard ? Settings ? Database)
# - SUPABASE_PROJECT_REF (from project URL)
```

---

## 11. Manual Follow-ups

### Tables Needing Attention

After running catalog queries, review:

1. **Tables without owner columns:**
   - These will have RLS enabled but no write policies
   - Add policies based on business logic

2. **Tables not in Realtime:**
   - Add if real-time updates are needed:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.<table_name>;
   ```

3. **Missing indexes:**
   - Review slow queries and add indexes as needed
   - Consider GIN indexes for JSONB columns
   - Consider trigram indexes for text search

### Security Review

1. ? **Service role policies:**
   - Some AI tables allow service_role full access
   - Review if this is appropriate

2. ? **Public read policies:**
   - Current defaults are conservative (authenticated only)
   - Adjust based on business requirements

3. ? **Write policies:**
   - Owner-based by default
   - Add team/collaboration policies if needed

---

## 12. Next Steps

### Immediate Actions

1. **Run full audit:**
   ```bash
   export SUPABASE_DB_URL="postgresql://..."
   ./scripts/supabase_audit.sh
   ```

2. **Apply migration:**
   ```bash
   supabase db push --db-url "$SUPABASE_DB_URL"
   ```

3. **Review audit results:**
   - Check `supabase/.audit/catalog_results.txt`
   - Update this report with findings

### Ongoing Maintenance

1. **Before each PR:**
   - CI will check for drift automatically

2. **Monthly:**
   - Re-run audit script
   - Review new tables for RLS
   - Update Realtime membership as needed

3. **After schema changes:**
   - Generate new migration
   - Update audit report
   - Verify RLS policies

---

## 13. Troubleshooting

### Migration Fails

**Error: Extension already exists**
- ? Safe to ignore (migration uses `IF NOT EXISTS`)

**Error: Policy already exists**
- ? Safe to ignore (migration checks before creating)

**Error: Table does not exist**
- ?? Review migration order - may need to run base migrations first

### RLS Blocking Queries

**Symptom:** Queries return no rows for authenticated users

**Check:**
```sql
-- Verify RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = '<table_name>';
```

**Fix:** Add appropriate policy or adjust existing one

### Storage Upload Fails

**Symptom:** 403 Forbidden on file upload

**Check:**
```sql
-- Verify bucket exists
SELECT * FROM storage.buckets WHERE id = '<bucket_name>';

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND qual LIKE '%<bucket_name>%';
```

**Fix:** Ensure write policy exists and allows your operation

---

## 14. Resources

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [PostgreSQL Extensions](https://www.postgresql.org/docs/current/contrib.html)

---

## Changelog

- **2025-11-02:** Initial audit infrastructure created
  - Audit script
  - Auto-fix migration
  - CI workflow
  - This report

---

**Report Status:** ? Infrastructure Complete  
**Next Run:** After connecting to live database

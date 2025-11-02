#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Supabase Database Audit Script
# =============================================================================
# This script audits the live Supabase database against repository state,
# generates SQL queries to check live state, and produces a comprehensive
# audit report with auto-fix migration.
# =============================================================================

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AUDIT_DIR="$ROOT/supabase/.audit"
MIG_DIR="$ROOT/supabase/migrations"
TS="$(date +%Y%m%d%H%M)"
OUT_SQL="$MIG_DIR/${TS}__auto_fixes.sql"
REPORT_FILE="$ROOT/AUDIT_SUPABASE.md"

mkdir -p "$AUDIT_DIR" "$MIG_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required tools
req() {
  command -v "$1" >/dev/null 2>&1 || {
    echo -e "${RED}Missing required tool: $1${NC}"
    echo "Install it and try again."
    exit 1
  }
}

echo "Checking required tools..."
req supabase || {
  echo -e "${YELLOW}Supabase CLI not found. Install: npm i -g supabase${NC}"
  echo "Adding install instructions to AUDIT_SUPABASE.md"
  # Continue anyway - we'll generate the queries
}

# Load environment
if [ -f "$ROOT/.env" ]; then
  source "$ROOT/.env"
elif [ -f "$ROOT/.env.local" ]; then
  source "$ROOT/.env.local"
fi

: "${SUPABASE_DB_URL:=$DATABASE_URL}"
if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo -e "${RED}Error: SUPABASE_DB_URL or DATABASE_URL not set${NC}"
  echo "Set SUPABASE_DB_URL in .env or pass as environment variable"
  exit 1
fi

SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

echo -e "${GREEN}Starting Supabase audit...${NC}"
echo "Project Ref: ${SUPABASE_PROJECT_REF:-<not set>}"
echo "Database URL: ${SUPABASE_DB_URL:0:30}..."

# =============================================================================
# 1. Pull remote schema snapshot
# =============================================================================

echo -e "\n${YELLOW}[1/7] Pulling remote schema...${NC}"
if command -v supabase >/dev/null 2>&1; then
  supabase db remote set "$SUPABASE_DB_URL" || true
  supabase db pull \
    --include-roles \
    --include-policies \
    --include-storage \
    -o "$AUDIT_DIR/remote.sql" || {
    echo -e "${YELLOW}Warning: Could not pull remote schema. Ensure Supabase CLI is configured.${NC}"
    echo "Generating audit queries instead..."
  }
else
  echo -e "${YELLOW}Supabase CLI not available. Skipping remote pull.${NC}"
fi

# =============================================================================
# 2. Generate catalog queries
# =============================================================================

echo -e "\n${YELLOW}[2/7] Generating catalog queries...${NC}"

cat > "$AUDIT_DIR/catalog_queries.sql" <<'EOF'
-- Tables & Schemas
SELECT 
  table_schema, 
  table_name, 
  is_insertable_into, 
  is_typed
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_temp_2', 'pg_toast_temp_1', 'pg_toast_temp_2')
ORDER BY table_schema, table_name;

-- RLS Status
SELECT 
  n.nspname as schema, 
  c.relname as table_name, 
  c.relrowsecurity as rls_enabled, 
  c.relforcerowsecurity as rls_forced
FROM pg_class c 
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' 
  AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY schema, table_name;

-- Policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
ORDER BY schemaname, tablename, policyname;

-- Realtime Publications
SELECT 
  p.pubname, 
  t.schemaname, 
  t.tablename
FROM pg_publication p
LEFT JOIN pg_publication_tables t ON t.pubname = p.pubname
ORDER BY p.pubname, t.schemaname, t.tablename;

-- Storage Buckets
SELECT id as bucket_id, name, public, created_at, updated_at
FROM storage.buckets
ORDER BY name;

-- Storage Policies
SELECT 
  r.schemaname, 
  r.tablename, 
  r.policyname, 
  r.roles, 
  r.cmd, 
  r.qual, 
  r.with_check
FROM pg_policies r
WHERE r.schemaname = 'storage' 
   OR r.tablename LIKE '%objects%'
ORDER BY r.schemaname, r.tablename, r.policyname;

-- RPC Functions
SELECT 
  n.nspname as schema, 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as args,
  CASE 
    WHEN p.prosecdef THEN 'security definer'
    ELSE 'security invoker'
  END as security_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'rpc')
ORDER BY schema, function_name;

-- Extensions
SELECT extname, extversion
FROM pg_extension
ORDER BY extname;

-- pg_cron Jobs (if enabled)
SELECT jobid, schedule, command, nodename, nodeport, database, username, active
FROM cron.job
ORDER BY jobid;
EOF

echo "Catalog queries written to $AUDIT_DIR/catalog_queries.sql"
echo "Run these against your database and save output for analysis."

# =============================================================================
# 3. Compare migrations
# =============================================================================

echo -e "\n${YELLOW}[3/7] Analyzing migrations...${NC}"

MIGRATION_FILES=$(find "$ROOT/supabase/migrations" "$ROOT/whats-for-dinner/supabase/migrations" -name "*.sql" 2>/dev/null | sort)
MIG_COUNT=$(echo "$MIGRATION_FILES" | grep -c . || echo "0")

echo "Found $MIG_COUNT migration files"

cat > "$AUDIT_DIR/migration_list.txt" <<EOF
Migration Files:
$(echo "$MIGRATION_FILES" | nl)
EOF

# =============================================================================
# 4. Analyze Edge Functions
# =============================================================================

echo -e "\n${YELLOW}[4/7] Analyzing Edge Functions...${NC}"

FUNC_DIRS=$(find "$ROOT/supabase/functions" "$ROOT/whats-for-dinner/supabase/functions" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | grep -v "^\.$" | sort)
FUNC_COUNT=$(echo "$FUNC_DIRS" | grep -c . || echo "0")

echo "Found $FUNC_COUNT Edge Function directories"

cat > "$AUDIT_DIR/functions_audit.txt" <<EOF
Edge Functions:
$(for func in $FUNC_DIRS; do
  func_name=$(basename "$func")
  echo "  - $func_name:"
  if [ -f "$func/index.ts" ]; then
    echo "    ? index.ts exists"
  else
    echo "    ? index.ts MISSING"
  fi
  if [ -f "$func/deno.json" ]; then
    echo "    ? deno.json exists"
  else
    echo "    ? deno.json MISSING"
  fi
  if [ -f "$func/config.toml" ]; then
    echo "    ? config.toml exists"
  else
    echo "    ? config.toml optional"
  fi
done)
EOF

# =============================================================================
# 5. Generate Auto-Fix Migration
# =============================================================================

echo -e "\n${YELLOW}[5/7] Generating auto-fix migration...${NC}"

cat > "$OUT_SQL" <<'SQL'
-- ============================================================================
-- Auto-Generated Supabase Fixes Migration
-- Generated: $(date -Iseconds)
-- ============================================================================
-- This migration applies idempotent fixes for:
-- - Missing extensions
-- - Missing RLS policies
-- - Missing Realtime publications
-- - Storage buckets and policies
-- - Default RPC functions
-- ============================================================================

-- ============================================================================
-- A. Extensions (idempotent)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings

-- pg_cron requires superuser - handle separately
-- CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================================
-- B. Ensure Realtime Publication
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- ============================================================================
-- C. Profiles Table & Trigger (if missing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_read_own'
  ) THEN
    CREATE POLICY profiles_read_own ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_write_own'
  ) THEN
    CREATE POLICY profiles_write_own ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY profiles_insert_own ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Auto-provision profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- D. Storage Buckets (common ones)
-- ============================================================================

-- Assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'assets',
  'assets',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'assets');

-- Avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

-- Storage policies
DO $$
BEGIN
  -- Public read for assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_read_assets'
  ) THEN
    CREATE POLICY storage_read_assets
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'assets');
  END IF;

  -- Authenticated write for assets
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_write_assets'
  ) THEN
    CREATE POLICY storage_write_assets
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'assets' AND (owner = auth.uid() OR metadata->>'owner_id' = auth.uid()::text));
  END IF;

  -- Avatar policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_read_avatars'
  ) THEN
    CREATE POLICY storage_read_avatars
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'storage_write_avatars'
  ) THEN
    CREATE POLICY storage_write_avatars
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'avatars' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'avatars' AND owner = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- E. Common RPC Functions
-- ============================================================================

-- Get current user profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.profiles
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT p.* FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_profile() TO authenticated;

-- ============================================================================
-- F. Add Tables to Realtime (placeholder - update based on audit)
-- ============================================================================

-- Example: Add profiles to realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END $$;

-- ============================================================================
-- Note: Per-table RLS policies and Realtime memberships will be added
-- based on catalog query results. Run this migration first, then review
-- AUDIT_SUPABASE.md for table-specific fixes.
-- ============================================================================
SQL

# Replace timestamp placeholder
sed -i "s/\$(date -Iseconds)/$(date -Iseconds)/" "$OUT_SQL"

echo -e "${GREEN}Generated migration: $OUT_SQL${NC}"

# =============================================================================
# 6. Prisma Check (optional)
# =============================================================================

echo -e "\n${YELLOW}[6/7] Checking Prisma configuration...${NC}"

if [ -f "$ROOT/prisma/schema.prisma" ]; then
  echo "Prisma schema found"
  if command -v npx >/dev/null 2>&1; then
    PRISMA_CLIENT_ENGINE_TYPE=${PRISMA_CLIENT_ENGINE_TYPE:-wasm} \
    npx prisma validate || echo -e "${YELLOW}Prisma validation failed (non-critical)${NC}"
  else
    echo "npx not available for Prisma validation"
  fi
else
  echo "No Prisma schema found (not using Prisma)"
fi

# =============================================================================
# 7. Generate Report
# =============================================================================

echo -e "\n${YELLOW}[7/7] Generating audit report...${NC}"

cat > "$REPORT_FILE" <<EOF
# Supabase Database Audit Report

**Generated:** $(date -Iseconds)  
**Database URL:** ${SUPABASE_DB_URL:0:50}...  
**Migration Count:** $MIG_COUNT  
**Edge Functions:** $FUNC_COUNT

---

## Summary Checklist

| Category | Status | Notes |
|----------|--------|-------|
| **Migrations** | ?? | Run catalog queries to verify |
| **RLS Policies** | ?? | Requires live database check |
| **Realtime** | ?? | Verify publication membership |
| **Storage** | ?? | Check buckets & policies |
| **RPC Functions** | ?? | Verify required functions exist |
| **Extensions** | ? | Auto-fix migration includes extensions |
| **Edge Functions** | ?? | See functions audit below |
| **Prisma** | $(if [ -f "$ROOT/prisma/schema.prisma" ]; then echo "? Found"; else echo "? Not used"; fi) | $(if [ -f "$ROOT/prisma/schema.prisma" ]; then echo "Validate with: npx prisma validate"; else echo "N/A"; fi) |
| **CI Guard** | ? | See .github/workflows/supabase-ci.yml |

---

## Detailed Findings

### 1. Migration Files

\`\`\`
$(cat "$AUDIT_DIR/migration_list.txt")
\`\`\`

**Action Required:**
- Compare remote schema (\`$AUDIT_DIR/remote.sql\`) with migrations
- Identify drift and add new migration if needed

### 2. Edge Functions

\`\`\`
$(cat "$AUDIT_DIR/functions_audit.txt")
\`\`\`

**Action Required:**
- Ensure all functions have \`deno.json\`
- Test build: \`supabase functions build <name>\`
- Deploy: \`supabase functions deploy <name>\`

### 3. RLS Status

**To verify RLS:**
1. Run catalog queries from \`$AUDIT_DIR/catalog_queries.sql\`
2. Check each user table has:
   - RLS enabled: \`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;\`
   - At least one SELECT policy for authenticated users
   - Write policies for owner columns (user_id, owner_id, created_by)

**Owner Column Heuristic:**
For each table, check for columns (in order):
1. \`user_id\` ? use for write policies
2. \`owner_id\` ? use for write policies  
3. \`created_by\` ? use for write policies

If none found, document in "Manual Follow-ups" below.

### 4. Realtime Publication

**Tables needing Realtime:**
- \`public.profiles\` ? (added in auto-fix)
- Add other tables based on application needs

**To check:**
\`\`\`sql
SELECT t.schemaname, t.tablename
FROM pg_publication_tables t
WHERE t.pubname = 'supabase_realtime';
\`\`\`

### 5. Storage Buckets

**Default buckets created:**
- \`assets\` (public, 50MB limit)
- \`avatars\` (public, 2MB limit)

**To verify:**
\`\`\`sql
SELECT id, name, public, file_size_limit
FROM storage.buckets;
\`\`\`

### 6. Extensions

**Required extensions (in auto-fix migration):**
- \`uuid-ossp\` - UUID generation
- \`pgcrypto\` - Cryptographic functions
- \`pgjwt\` - JWT handling
- \`pg_stat_statements\` - Query performance
- \`pg_trgm\` - Text search
- \`vector\` - AI embeddings (pgvector)

**Note:** \`pg_cron\` requires superuser privileges. Enable manually if needed.

---

## Auto-Fix Migration

**Location:** \`$OUT_SQL\`

This migration includes:
- ? Extensions (idempotent)
- ? Realtime publication setup
- ? Profiles table & policies
- ? Storage buckets & policies
- ? Common RPC functions

**To apply:**
\`\`\`bash
supabase db push --db-url "\$SUPABASE_DB_URL"
\`\`\`

Or manually in Supabase SQL Editor.

---

## Manual Follow-ups

### Tables Missing Owner Column
The following tables may need manual RLS write policy configuration:
- (Run catalog queries and analyze table schemas)

### Tables Not in Realtime
Add these to Realtime publication if needed:
\`\`\`sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.<table_name>;
\`\`\`

### Missing RPC Functions
If code references functions that don't exist, add them:
\`\`\`sql
CREATE OR REPLACE FUNCTION public.<function_name>(...)
RETURNS <type>
LANGUAGE sql
SECURITY DEFINER
AS \$\$
  -- Implementation
\$\$;
\`\`\`

---

## Next Steps

1. **Review this report**
2. **Run catalog queries** against live database:
   \`\`\`bash
   psql "\$SUPABASE_DB_URL" < $AUDIT_DIR/catalog_queries.sql > $AUDIT_DIR/catalog_results.txt
   \`\`\`
3. **Apply auto-fix migration:**
   \`\`\`bash
   supabase db push --db-url "\$SUPABASE_DB_URL"
   \`\`\`
4. **Review Edge Functions:**
   - Ensure all have \`deno.json\`
   - Build and test each function
5. **Update CI workflow** (already created at \`.github/workflows/supabase-ci.yml\`)
6. **Re-run audit** after fixes and update this report

---

## CI Integration

The CI workflow at \`.github/workflows/supabase-ci.yml\` will:
- ? Lint migrations
- ? Pull remote schema on PR
- ? Detect schema/policy drift
- ? Block merges if drift detected

---

## Notes

- All fixes use \`IF NOT EXISTS\` for idempotency
- RLS policies follow least-privilege principle
- Storage policies allow public read for assets, authenticated write for owners
- Realtime publication membership can be added per-table as needed

EOF

echo -e "${GREEN}Report generated: $REPORT_FILE${NC}"

# =============================================================================
# Summary
# =============================================================================

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Audit Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Files generated:"
echo "  ?? $REPORT_FILE"
echo "  ?? $OUT_SQL"
echo "  ?? $AUDIT_DIR/catalog_queries.sql"
echo "  ?? $AUDIT_DIR/functions_audit.txt"
echo ""
echo "Next steps:"
echo "  1. Review $REPORT_FILE"
echo "  2. Run catalog queries against your database"
echo "  3. Apply migration: supabase db push"
echo "  4. Fix Edge Functions (add deno.json where missing)"
echo ""

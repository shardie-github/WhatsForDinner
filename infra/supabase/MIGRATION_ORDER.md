# Supabase Migration Order - Run These in SQL Editor

**⚠️ IMPORTANT: Run these migrations in order in your Supabase SQL Editor**

---

## Migration Files to Run (In Order)

### 1. First Migration: Core Tables Schema
**File:** `infra/supabase/migrations/001_metrics.sql`

**What it does:**
- Creates all core tables: `events`, `orders`, `spend`, `experiments`, `metrics_daily`, `etl_logs`
- Sets up indexes for performance
- Creates triggers for auto-updating `updated_at` timestamps
- Adds helpful comments and documentation

**How to run:**
1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `infra/supabase/migrations/001_metrics.sql`
3. Paste into SQL Editor
4. Click "Run" or press Cmd/Ctrl + Enter

**Expected result:**
- ✅ 6 tables created: `events`, `orders`, `spend`, `experiments`, `metrics_daily`, `etl_logs`
- ✅ Multiple indexes created
- ✅ 3 triggers created

---

### 2. Second Migration: Row Level Security (RLS)
**File:** `infra/supabase/rls.sql`

**What it does:**
- Enables Row Level Security on all tables
- Creates RLS policies for user access
- Creates service role policies for ETL scripts
- Creates admin policies (adjust based on your admin role implementation)
- Creates helper function `is_admin()`

**How to run:**
1. Still in SQL Editor
2. Copy the entire contents of `infra/supabase/rls.sql`
3. Paste into SQL Editor (can run in same session)
4. Click "Run"

**Expected result:**
- ✅ RLS enabled on all 6 tables
- ✅ Multiple policies created
- ✅ Helper function created

**⚠️ Note:** Adjust admin role check if your `profiles` table structure differs

---

## Quick Copy-Paste Commands

### Option 1: Run Both Separately (Recommended)

**Step 1:**
```sql
-- Copy entire contents of: infra/supabase/migrations/001_metrics.sql
-- Paste and run in Supabase SQL Editor
```

**Step 2:**
```sql
-- Copy entire contents of: infra/supabase/rls.sql
-- Paste and run in Supabase SQL Editor
```

### Option 2: Run Combined (If you prefer)

You can combine both files into one SQL script, but running separately makes it easier to debug if something fails.

---

## Verification Queries

After running both migrations, verify with these queries:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('events', 'orders', 'spend', 'experiments', 'metrics_daily', 'etl_logs')
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('events', 'orders', 'spend', 'experiments', 'metrics_daily', 'etl_logs');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('events', 'orders', 'spend', 'experiments', 'metrics_daily', 'etl_logs')
ORDER BY tablename, policyname;
```

---

## Troubleshooting

### If you get "relation already exists" errors:
- Tables may already exist from previous runs
- Either drop existing tables first, or modify migration to use `CREATE TABLE IF NOT EXISTS` (already included)

### If RLS policies fail:
- Check if `profiles` table exists and has a `role` column
- Adjust admin role check in `rls.sql` based on your actual schema
- Or comment out admin policies if not needed initially

### If you need to rollback:
```sql
-- Drop tables (⚠️ WARNING: This deletes all data)
DROP TABLE IF EXISTS etl_logs CASCADE;
DROP TABLE IF EXISTS metrics_daily CASCADE;
DROP TABLE IF EXISTS experiments CASCADE;
DROP TABLE IF EXISTS spend CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Drop helper function
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS update_updated_at_column();
```

---

## Next Steps After Migrations

1. ✅ Verify tables and policies are created
2. ✅ Set up environment variables (see `/infra/env/.env.example`)
3. ✅ Test ETL scripts in dry-run mode
4. ✅ Set up GitHub Actions or cron scheduler
5. ✅ Start pulling data and computing metrics

---

**Migration Files Location:**
- `/workspace/infra/supabase/migrations/001_metrics.sql`
- `/workspace/infra/supabase/rls.sql`

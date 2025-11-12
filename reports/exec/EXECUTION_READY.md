# Execution Ready - Migrations & Checks

**Status:** ✅ All scripts ready, awaiting database connection string  
**Generated:** 2025-01-27

---

## ✅ What's Ready

### 1. Migration Scripts
- ✅ `/scripts/apply_migrations.sh` - Bash script (47 migrations ready)
- ✅ `/scripts/apply_all_migrations.ts` - TypeScript script with tracking
- ✅ `/scripts/execute_migrations_and_checks.ts` - Complete execution script
- ✅ `/scripts/RUN_NOW.sh` - Quick execution wrapper

### 2. GitHub Actions Workflows
- ✅ `.github/workflows/preflight.yml` - Preflight checks
- ✅ `.github/workflows/data-quality.yml` - Nightly DQ checks
- ✅ `.github/workflows/nightly-etl.yml` - Nightly ETL
- ✅ `.github/workflows/supabase-delta-apply.yml` - Delta migrations
- ✅ `.github/workflows/system-health.yml` - Weekly health sweep

### 3. Check Scripts
- ✅ `/scripts/agents/preflight.ts` - Environment & DB checks
- ✅ `/scripts/agents/generate_delta_migration.ts` - Delta generator
- ✅ `/scripts/agents/verify_db.ts` - Database verifier
- ✅ `/scripts/agents/run_data_quality.ts` - DQ runner
- ✅ `/scripts/agents/system_doctor.ts` - Self-healing system
- ✅ `/scripts/etl/*.ts` - ETL scripts (dry-run support)

### 4. Migrations Ready
- ✅ 47 migration files in `/supabase/migrations/`
- ✅ New migration: `000000000800_upsert_functions.sql` (self-healing SQL pack)
- ✅ All migrations are idempotent (safe to re-run)

---

## 🚀 How to Execute

### Option 1: Quick Execution (Recommended)

```bash
# Set your database connection string
export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Run everything
./scripts/RUN_NOW.sh
```

### Option 2: TypeScript Script

```bash
export SUPABASE_DB_URL="postgresql://..."
tsx scripts/execute_migrations_and_checks.ts
```

### Option 3: Step-by-Step

```bash
# 1. Apply migrations
./scripts/apply_migrations.sh

# 2. Run checks
./scripts/run_all_checks.sh --live

# 3. Verify
tsx scripts/agents/verify_db.ts
```

### Option 4: Individual Scripts

```bash
# Preflight
tsx scripts/agents/preflight.ts

# Generate delta
tsx scripts/agents/generate_delta_migration.ts

# Verify DB
tsx scripts/agents/verify_db.ts

# Data quality
tsx scripts/agents/run_data_quality.ts

# System doctor
tsx scripts/agents/system_doctor.ts
```

---

## 📋 Execution Order

When you run `./scripts/RUN_NOW.sh` or `tsx scripts/execute_migrations_and_checks.ts`, it will:

1. ✅ **Apply Migrations** (47 files, idempotent)
   - Tries Supabase CLI first
   - Falls back to psql if CLI unavailable
   - Safe to re-run

2. ✅ **Preflight Checks**
   - Environment variables
   - Database connectivity
   - Base tables presence

3. ✅ **Generate Delta Migration**
   - Introspects database
   - Creates migration for missing objects only

4. ✅ **Verify Database**
   - Tables, columns, indexes
   - RLS enabled
   - Policies present

5. ✅ **ETL Smoke Tests** (dry-run)
   - Events ETL
   - Source A ads ETL
   - Source B ads ETL
   - Metrics computation

6. ✅ **Data Quality Checks**
   - NOT NULL constraints
   - Data freshness
   - Duplicates
   - Completeness

7. ✅ **System Doctor**
   - Self-healing checks
   - Creates tickets on failure

---

## 🔑 Required Environment Variable

```bash
export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

Or:

```bash
export DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

---

## 📊 Expected Output

When executed successfully, you should see:

```
🚀 Starting migration and check execution...
Database: postgresql://postgres:...

📦 Step 1: Applying migrations...
Found 47 migration files
✅ Migrations applied via Supabase CLI (or psql)

🔍 Step 2: Running preflight checks...
✅ Preflight checks passed

📝 Step 3: Generating delta migration...
✅ Delta migration generated

✅ Step 4: Verifying database...
✅ Database verification passed

🧪 Step 5: Running ETL smoke tests (dry-run)...
✅ ETL smoke tests passed

📊 Step 6: Running data quality checks...
✅ Data quality checks passed

🏥 Step 7: Running system doctor...
✅ System doctor passed

🎉 Execution complete!
```

---

## ⚠️ Troubleshooting

### "SUPABASE_DB_URL not found"
- Set the environment variable: `export SUPABASE_DB_URL="..."`
- Or use: `SUPABASE_DB_URL="..." ./scripts/RUN_NOW.sh`

### "psql not found"
- Install PostgreSQL client: `sudo apt-get install postgresql-client`
- Or use Supabase CLI: `npm install -g supabase`

### "tsx not found"
- Install: `npm install -g tsx`
- Or use: `npx tsx scripts/execute_migrations_and_checks.ts`

### Migrations fail with "already exists"
- ✅ **This is expected** - Migrations use `IF NOT EXISTS` and are idempotent
- Safe to re-run

### Connection fails
- Verify connection string is correct
- Check network connectivity
- Verify database is accessible

---

## 📝 Next Steps After Execution

1. **Review Reports:**
   - `/reports/exec/preflight_report.md`
   - `/reports/exec/run_summary_2025-01-27.md`
   - `/reports/system_health_2025-01-27.md`

2. **Check Backlog:**
   - Review any tickets created by system doctor
   - `/backlog/READY_*` files

3. **Enable Monetization:**
   - Per `/backlog/READY_realignment_001.md`

4. **Verify GitHub Actions:**
   - Check workflows are running
   - Monitor nightly ETL

---

## 🎯 Quick Start

```bash
# 1. Set connection string
export SUPABASE_DB_URL="your-connection-string-here"

# 2. Run everything
./scripts/RUN_NOW.sh

# 3. Done! ✅
```

---

**All scripts are ready and waiting for database connection string.**

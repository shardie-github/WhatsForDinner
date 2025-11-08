# Prisma Schema Sync with Supabase

## Overview

The Prisma schema needs to match what's actually in your Supabase database. This guide explains how to sync the Prisma schema from Supabase.

## Why Sync?

- Supabase migrations may have created tables that aren't in Prisma schema
- Column types or constraints may differ
- Indexes and relations need to match
- Ensures Prisma client works correctly with Supabase

## Method 1: Automatic Sync (Recommended)

### Prerequisites

1. Set `DATABASE_URL` in `.env.local`:
   ```bash
   DATABASE_URL=postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.ghqyxhbyyirveptgwoqm.supabase.co:5432/postgres?sslmode=require
   ```

2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

### Sync Command

```bash
# Option 1: Using npm script
pnpm db:sync

# Option 2: Direct command
tsx scripts/sync-prisma-from-supabase.ts

# Option 3: Manual Prisma command
npx prisma db pull
```

### What It Does

1. **Backs up** current `prisma/schema.prisma` to a timestamped backup
2. **Introspects** Supabase database to get actual schema
3. **Updates** `prisma/schema.prisma` to match database
4. **Formats** the schema
5. **Generates** Prisma client

## Method 2: Manual Sync

If automatic sync doesn't work, you can manually run Prisma commands:

```bash
# 1. Pull schema from database
npx prisma db pull

# 2. Review changes
git diff prisma/schema.prisma

# 3. Format schema
npx prisma format

# 4. Generate client
npx prisma generate
```

## After Syncing

### 1. Review Changes

```bash
git diff prisma/schema.prisma
```

Check for:
- New tables that were added
- Column type changes
- Missing relations
- Index differences

### 2. Update Schema if Needed

You may need to:
- Add custom types or enums
- Adjust relation names
- Add `@@map` directives for table names
- Set `engineType = "wasm"` in generator

### 3. Generate Client

```bash
pnpm db:generate
```

### 4. Test

```bash
# Run reality check
pnpm doctor

# Or test in code
npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.\$queryRaw\`SELECT 1\`.then(() => console.log('✅ Works')).catch(e => console.error('❌', e));"
```

## Common Issues

### Schema Doesn't Match Database

**Symptom**: Prisma client errors or missing tables

**Solution**:
1. Run `pnpm db:sync` to pull latest schema
2. Check Supabase migrations were applied
3. Verify `DATABASE_URL` points to correct database

### Missing Relations

**Symptom**: Prisma relations don't work

**Solution**:
1. Check foreign keys exist in Supabase
2. Verify relation names match
3. Run `prisma format` to auto-fix relations

### Type Mismatches

**Symptom**: Type errors in Prisma client

**Solution**:
1. Check column types in Supabase match Prisma types
2. Use `@db` directives for custom types
3. Update enum definitions if needed

### Engine Type Issues

**Symptom**: Prisma client generation fails or uses wrong engine

**Solution**:
1. Ensure `PRISMA_CLIENT_ENGINE_TYPE=wasm` is set
2. Check `generator client` block in schema:
   ```prisma
   generator client {
     provider = "prisma-client-js"
     engineType = "wasm"
   }
   ```

## Best Practices

1. **Sync regularly**: After major Supabase migrations
2. **Review changes**: Always review `git diff` before committing
3. **Backup first**: Script automatically backs up, but good to verify
4. **Test after sync**: Run `pnpm doctor` to verify everything works
5. **Commit schema**: Keep `prisma/schema.prisma` in version control

## Workflow

```bash
# 1. Make changes in Supabase (migrations, SQL editor, etc.)

# 2. Sync Prisma schema
pnpm db:sync

# 3. Review changes
git diff prisma/schema.prisma

# 4. Test
pnpm doctor

# 5. Commit if everything looks good
git add prisma/schema.prisma
git commit -m "Sync Prisma schema from Supabase"
```

## Troubleshooting

### Can't Connect to Database

- Verify `DATABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Ensure database is accessible (not paused)
- Check SSL mode is `require`

### Schema Pull Fails

- Check database permissions
- Verify service role key has access
- Try connecting with `psql` to test connection
- Check Supabase project status

### Generated Schema Has Issues

- Review Supabase migrations
- Check for custom types or functions
- Verify table names match expectations
- May need manual adjustments after pull

## Related Commands

```bash
# Pull schema from database
pnpm db:pull

# Generate Prisma client
pnpm db:generate

# Open Prisma Studio (visual database browser)
pnpm db:studio

# Create new migration
pnpm db:migrate:dev

# Deploy migrations
pnpm db:migrate
```

## See Also

- [Prisma DB Pull Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate/db-pull)
- [Supabase Migrations Guide](./deploy.md)
- [Development Setup](./dev.md)

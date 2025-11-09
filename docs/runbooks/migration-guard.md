# Database Migration Safety Guard

## Overview

The migration guard prevents destructive database operations unless explicitly enabled via the `MIGRATION_CANARY` environment variable.

## Configuration

The migration guard flag is configured in `ops.config.json`:

```json
{
  "migration": {
    "canary_flag": "MIGRATION_CANARY",
    "description": "Environment flag that must be set to true for migrations to run (safety guard)"
  }
}
```

## How It Works

### Prisma Migrations

If using Prisma, add guard check to migration scripts:

```typescript
// Example: scripts/migrate-with-guard.ts
import { execSync } from 'child_process';

const MIGRATION_CANARY = process.env.MIGRATION_CANARY === 'true';

if (!MIGRATION_CANARY) {
  console.error('❌ MIGRATION_CANARY flag not set. Migrations blocked for safety.');
  console.error('Set MIGRATION_CANARY=true to enable migrations.');
  process.exit(1);
}

console.log('✅ MIGRATION_CANARY enabled. Proceeding with migration...');
execSync('prisma migrate deploy', { stdio: 'inherit' });
```

### Supabase Migrations

For Supabase SQL migrations, add guard check:

```sql
-- Example: Check environment variable before destructive operations
DO $$
BEGIN
  IF current_setting('app.migration_canary', true) != 'true' THEN
    RAISE EXCEPTION 'MIGRATION_CANARY not set. Destructive migrations blocked.';
  END IF;
END $$;

-- Your migration SQL here
-- DROP TABLE IF EXISTS ... (only runs if guard passes)
```

**Note:** Supabase doesn't directly support environment variables in SQL. Use a migration wrapper script instead.

### Migration Wrapper Script

Create a wrapper that checks the flag:

```typescript
// scripts/supabase-migrate.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const MIGRATION_CANARY = process.env.MIGRATION_CANARY === 'true';
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: tsx scripts/supabase-migrate.ts <migration.sql>');
  process.exit(1);
}

// Check for destructive SQL patterns
const sql = fs.readFileSync(migrationFile, 'utf-8');
const destructivePatterns = [
  /DROP\s+(TABLE|DATABASE|SCHEMA)/i,
  /TRUNCATE/i,
  /DELETE\s+FROM/i,
];

const hasDestructive = destructivePatterns.some(pattern => pattern.test(sql));

if (hasDestructive && !MIGRATION_CANARY) {
  console.error('❌ Destructive SQL detected and MIGRATION_CANARY not set.');
  console.error('Set MIGRATION_CANARY=true to allow destructive migrations.');
  process.exit(1);
}

console.log('✅ Migration guard passed. Applying migration...');
execSync(`supabase db push --file ${migrationFile}`, { stdio: 'inherit' });
```

## Usage

### Enable Migrations (Staging/Development)

```bash
# Set flag
export MIGRATION_CANARY=true

# Run migration
pnpm db:migrate
# or
tsx scripts/supabase-migrate.ts migrations/001_initial.sql
```

### Production Migrations

**⚠️ Extra Caution Required:**

1. **Review Migration:**
   - Review SQL/Prisma migration file
   - Verify backup is recent
   - Test in staging first

2. **Enable Guard:**
   ```bash
   export MIGRATION_CANARY=true
   ```

3. **Run Migration:**
   ```bash
   pnpm db:migrate
   ```

4. **Disable Guard:**
   ```bash
   unset MIGRATION_CANARY
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Database Migration
  if: github.ref == 'refs/heads/main'
  env:
    MIGRATION_CANARY: ${{ secrets.MIGRATION_CANARY_ENABLED }}
  run: |
    if [ "$MIGRATION_CANARY" != "true" ]; then
      echo "❌ MIGRATION_CANARY not enabled. Skipping migration."
      exit 0
    fi
    pnpm db:migrate
```

**Security Note:** Store `MIGRATION_CANARY_ENABLED` as a GitHub secret, not in code.

## Best Practices

1. **Always Test First:** Run migrations in staging before production
2. **Backup Before Migrate:** Ensure recent backup before destructive operations
3. **Review SQL:** Manually review all migration files
4. **Use Transactions:** Wrap migrations in transactions when possible
5. **Rollback Plan:** Have a rollback plan ready
6. **Monitor Post-Migrate:** Watch for errors after migration

## Destructive Operations Blocked

The guard should block:

- `DROP TABLE`
- `DROP DATABASE`
- `DROP SCHEMA`
- `TRUNCATE TABLE`
- `DELETE FROM` (without WHERE clause)
- Column drops
- Constraint drops

## Non-Destructive Operations Allowed

These operations can proceed without the guard:

- `CREATE TABLE`
- `ALTER TABLE ADD COLUMN`
- `CREATE INDEX`
- `CREATE VIEW`
- Data inserts/updates (with WHERE clauses)

## Related Documentation

- [Database Migration Guide](../../DATABASE_MIGRATION_GUIDE.md)
- [Restore Runbook](./restore.md)
- [Backup Testing Procedures](../../backup-testing-procedures.md)
- [Configuration Reference](../../ops.config.json)

---

**Last Updated:** {{ timestamp }}  
**Owner:** DevOps Team  
**Configuration:** `ops.config.json` → `migration.canary_flag`

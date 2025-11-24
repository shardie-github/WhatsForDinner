# Supabase Migrations

## Overview

This project uses a **single canonical master migration** for bootstrapping fresh databases. All historical migrations have been consolidated into:

- `99999999999999_master_consolidated_schema.sql` - The master migration file

## Migration Strategy

### For Fresh Databases

Run the master migration to bootstrap a new database:

```bash
supabase migration up
```

This will apply `99999999999999_master_consolidated_schema.sql` which contains:
- All table definitions
- All enums
- All indexes
- All RLS policies
- All functions and triggers
- All seed data (if any)

### For Existing Databases

If you have an existing database with migrations already applied:

1. **Option A**: Continue using incremental migrations (create new migration files)
2. **Option B**: Reset and use master migration (⚠️ **destructive** - only for dev/staging)

### Creating New Migrations

For structural changes going forward:

1. Create a new migration file with timestamp prefix:
   ```bash
   # Example: 20250128000000_add_new_feature.sql
   ```

2. Use clear, descriptive names:
   - `20250128000000_add_recipe_ratings.sql`
   - `20250128000001_add_user_preferences.sql`

3. Follow these guidelines:
   - Use `IF NOT EXISTS` for tables/columns
   - Use `DROP POLICY IF EXISTS` before creating policies
   - Make migrations idempotent when possible
   - Test on a copy of production data first

## Legacy Migrations

All historical migrations are preserved in `supabase/migrations_archive/` for reference. These are **not** applied to fresh databases, but are kept for:
- Historical reference
- Understanding schema evolution
- Debugging existing production databases

## Running Migrations

### Using Supabase CLI

```bash
# Link to your project (one-time setup)
supabase link --project-ref <your-project-ref>

# Apply pending migrations
supabase migration up

# Or use the helper script
./scripts/supa-migrate-all.sh
```

### Using the Helper Script

See `scripts/supa-migrate-all.sh` for a Termux-friendly migration script.

## Migration File Naming

- Master migration: `99999999999999_master_consolidated_schema.sql`
- New migrations: `YYYYMMDDHHMMSS_description.sql` (timestamp format)

The timestamp ensures migrations run in chronological order.

## Best Practices

1. **Always test migrations** on a copy of production data first
2. **Use transactions** where possible (Supabase CLI handles this)
3. **Make migrations idempotent** when possible (`IF NOT EXISTS`, `DROP IF EXISTS`)
4. **Document breaking changes** in migration comments
5. **Keep migrations small** - one logical change per migration
6. **Never modify applied migrations** - create new ones instead

## Troubleshooting

### Migration fails

1. Check the error message carefully
2. Verify your Supabase project is linked: `supabase link --project-ref <ref>`
3. Check you're authenticated: `supabase login`
4. Review the migration file for syntax errors

### Need to rollback

Supabase migrations are forward-only. To rollback:
1. Create a new migration that reverses the changes
2. Or restore from backup

### Schema drift

If your database schema doesn't match migrations:
1. Generate a migration from current state: `supabase db diff`
2. Review and apply the diff migration
3. Update the master migration if needed

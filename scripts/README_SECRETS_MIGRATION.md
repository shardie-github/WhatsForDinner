# Secrets Migration Scripts

This directory contains scripts for migrating and managing secrets across Supabase and Vercel.

## Scripts Overview

### 1. `migrate-secrets-to-supabase-vercel.mjs`

Main migration script that extracts environment variables and migrates them to Supabase and Vercel.

**Usage:**
```bash
# Dry run (preview changes)
npm run secrets:migrate:dry-run

# Actual migration
npm run secrets:migrate

# Migrate to specific environment
npm run secrets:migrate -- --env staging
```

**What it does:**
- Extracts all env vars from `.env.example` files
- Migrates secrets to Supabase `secrets_vault` table
- Syncs environment variables to Vercel
- Generates migration report

### 2. `secrets-manager-unified.mjs`

Unified secrets manager that provides a single interface to access secrets from Supabase, Vercel, or environment variables.

**Usage:**
```bash
# Get a secret value
npm run secrets:get OPENAI_API_KEY

# Set a secret
npm run secrets:set NEW_SECRET "value"

# Validate required secrets
npm run secrets:validate OPENAI_API_KEY SUPABASE_SERVICE_ROLE_KEY
```

**In code:**
```javascript
import { secretsManager } from './secrets-manager-unified.mjs';

const apiKey = await secretsManager.getSecret('OPENAI_API_KEY');
```

### 3. `sync-secrets-supabase-vercel.mjs`

Keeps secrets synchronized between Supabase and Vercel.

**Usage:**
```bash
# Bidirectional sync (default)
npm run secrets:sync

# Supabase → Vercel only
npm run secrets:sync:sb-to-vercel

# Vercel → Supabase only
npm run secrets:sync:vercel-to-sb

# Sync specific environment
npm run secrets:sync -- staging
```

### 4. `update-scripts-to-use-secrets-manager.mjs`

Helper script to update existing scripts to use the unified secrets manager.

**Usage:**
```bash
# Preview changes
node scripts/update-scripts-to-use-secrets-manager.mjs --dry-run

# Update specific file
node scripts/update-scripts-to-use-secrets-manager.mjs scripts/healthcheck.js
```

## Quick Start

1. **Run migration:**
   ```bash
   npm run secrets:migrate:dry-run  # Preview
   npm run secrets:migrate           # Execute
   ```

2. **Verify migration:**
   ```bash
   npm run secrets:get NEXT_PUBLIC_SUPABASE_URL
   ```

3. **Sync to Vercel:**
   ```bash
   npm run secrets:sync
   ```

4. **Update scripts (optional):**
   ```bash
   node scripts/update-scripts-to-use-secrets-manager.mjs --dry-run
   ```

## Environment Variables Required

For migration scripts to work:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel (optional, for Vercel sync)
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-project-id
```

## Files Created

- `SECRETS_MIGRATION_REPORT.json` - Migration report with summary
- `supabase/migrations/create_secrets_vault.sql` - Database migration for secrets table

## See Also

- [Migration Guide](../docs/SECRETS_MIGRATION_GUIDE.md) - Complete migration documentation
- [Supabase Migration](../supabase/migrations/create_secrets_vault.sql) - Database schema

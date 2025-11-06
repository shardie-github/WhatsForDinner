# Secrets Migration Guide: Supabase & Vercel

This guide explains how to migrate all environment variables and secrets to Supabase and Vercel for centralized, secure secret management.

## Overview

The migration system includes:

1. **Supabase Secrets Vault** - Centralized storage for encrypted secrets
2. **Vercel Environment Variables** - Synced environment variables for deployment
3. **Unified Secrets Manager** - Single interface to access secrets from both sources

## Architecture

```
┌─────────────────┐
│   Application   │
│    Scripts      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Unified Secrets │
│     Manager      │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌─────────┐
│ Supabase│ │ Vercel  │
│ Secrets │ │   Env   │
│  Vault  │ │  Vars   │
└─────────┘ └─────────┘
```

## Setup

### 1. Run Database Migration

First, create the `secrets_vault` table in Supabase:

```bash
# Apply the migration
supabase db push

# Or manually run the SQL
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/create_secrets_vault.sql
```

### 2. Set Required Environment Variables

For the migration scripts to work, you need:

```bash
# Supabase
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Vercel (optional, for Vercel sync)
export VERCEL_TOKEN="your-vercel-token"
export VERCEL_PROJECT_ID="your-project-id"
```

## Migration Process

### Step 1: Dry Run Migration

Preview what will be migrated without making changes:

```bash
npm run secrets:migrate:dry-run
```

This will:
- Extract all environment variables from `.env.example` files
- Show what secrets will be migrated to Supabase
- Show what variables will be synced to Vercel

### Step 2: Run Migration

Migrate all secrets to Supabase and Vercel:

```bash
npm run secrets:migrate
```

This will:
1. Extract environment variables from all `.env.example` files
2. Create secrets in Supabase `secrets_vault` table
3. Sync environment variables to Vercel

### Step 3: Verify Migration

Check that secrets are accessible:

```bash
# Get a secret
npm run secrets:get NEXT_PUBLIC_SUPABASE_URL

# Validate required secrets
npm run secrets:validate NEXT_PUBLIC_SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY
```

### Step 4: Sync Between Systems

Keep Supabase and Vercel in sync:

```bash
# Bidirectional sync (default)
npm run secrets:sync

# Supabase → Vercel only
npm run secrets:sync:sb-to-vercel

# Vercel → Supabase only
npm run secrets:sync:vercel-to-sb
```

## Using the Unified Secrets Manager

### In Scripts (ESM)

```javascript
import { secretsManager } from './secrets-manager-unified.mjs';

// Get a secret
const apiKey = await secretsManager.getSecret('OPENAI_API_KEY');

// Get multiple secrets
const { apiKey, dbUrl } = await secretsManager.getSecrets([
  'OPENAI_API_KEY',
  'DATABASE_URL'
]);

// With environment override
const stagingKey = await secretsManager.getSecret('OPENAI_API_KEY', {
  environment: 'staging'
});
```

### In Scripts (CommonJS)

```javascript
const { secretsManager } = require('./secrets-manager-unified.mjs');

// Get a secret (async)
async function getApiKey() {
  return await secretsManager.getSecret('OPENAI_API_KEY');
}
```

### Fallback to process.env

The secrets manager automatically falls back to `process.env` if a secret is not found in Supabase or Vercel. This ensures backward compatibility during migration.

## Updating Existing Scripts

Use the automated script to update existing scripts:

```bash
# Dry run to see what would change
node scripts/update-scripts-to-use-secrets-manager.mjs --dry-run

# Update a specific file
node scripts/update-scripts-to-use-secrets-manager.mjs scripts/healthcheck.js

# Update all scripts (be careful!)
node scripts/update-scripts-to-use-secrets-manager.mjs
```

### Manual Update Pattern

For scripts that need manual updates:

**Before:**
```javascript
const apiKey = process.env.OPENAI_API_KEY;
const dbUrl = process.env.DATABASE_URL;
```

**After (ESM):**
```javascript
import { secretsManager } from './secrets-manager-unified.mjs';

async function main() {
  const apiKey = await secretsManager.getSecret('OPENAI_API_KEY');
  const dbUrl = await secretsManager.getSecret('DATABASE_URL');
  // ... rest of code
}
```

## Managing Secrets

### Add a New Secret

```bash
# Using the CLI
npm run secrets:set OPENAI_API_KEY "sk-..."

# Or programmatically
import { secretsManager } from './secrets-manager-unified.mjs';
await secretsManager.setSecret('NEW_SECRET_KEY', 'secret-value');
```

### Rotate a Secret

Secrets automatically track rotation schedules. To manually rotate:

```javascript
import { secretsManager } from './secrets-manager-unified.mjs';

await secretsManager.setSecret('STRIPE_SECRET_KEY', 'new-key-value');
await secretsManager.syncToVercel('STRIPE_SECRET_KEY', 'new-key-value');
```

## Environment-Specific Secrets

Secrets can be stored per environment:

- `production` - Production environment
- `staging` - Staging environment
- `preview` - Vercel preview deployments
- `development` - Local development

```bash
# Migrate to specific environment
npm run secrets:migrate -- --env staging

# Get secret from specific environment
const stagingKey = await secretsManager.getSecret('API_KEY', {
  environment: 'staging'
});
```

## Security Best Practices

1. **Never commit secrets** - Use `.env.example` for templates only
2. **Use encryption** - Secrets in Supabase are marked as encrypted
3. **Rotate regularly** - Secrets have automatic rotation schedules
4. **Audit access** - Check `secret_rotation_logs` table for audit trail
5. **Limit access** - Only service role can access secrets_vault
6. **Use RLS** - Row Level Security is enabled on all secret tables

## Troubleshooting

### Secrets not found

```bash
# Check if secret exists in Supabase
npm run secrets:get SECRET_NAME

# Verify Supabase connection
node -e "import('./scripts/secrets-manager-unified.mjs').then(m => m.secretsManager.getSecret('TEST_KEY'))"
```

### Sync failures

```bash
# Check Vercel credentials
echo $VERCEL_TOKEN
echo $VERCEL_PROJECT_ID

# Test Vercel API access
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v10/projects/$VERCEL_PROJECT_ID/env
```

### Migration errors

```bash
# Check Supabase connection
psql $SUPABASE_DB_URL -c "SELECT * FROM secrets_vault LIMIT 1;"

# Verify table exists
psql $SUPABASE_DB_URL -c "\d secrets_vault"
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Sync secrets
  run: npm run secrets:sync
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Vercel Deployment

Secrets are automatically available in Vercel deployments after syncing. No additional configuration needed.

## Migration Checklist

- [ ] Run database migration to create `secrets_vault` table
- [ ] Set required environment variables (Supabase, Vercel)
- [ ] Run dry-run migration to preview changes
- [ ] Execute migration to Supabase and Vercel
- [ ] Verify secrets are accessible via secrets manager
- [ ] Update critical scripts to use secrets manager
- [ ] Set up scheduled sync job (optional)
- [ ] Document team on new secret management process

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review migration logs: `SECRETS_MIGRATION_REPORT.json`
3. Verify Supabase and Vercel credentials
4. Check RLS policies on `secrets_vault` table

# Database Migration Guide

## Secrets Vault Migration

To set up the secrets_vault table in Supabase:

### Method 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of: `supabase/migrations/create_secrets_vault.sql`
4. Paste and click "Run"

### Method 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migration
supabase db push
```

### Method 3: Direct psql
```bash
psql $SUPABASE_DB_URL -f supabase/migrations/create_secrets_vault.sql
```

### Method 4: Using Node.js (if pg is installed)
```bash
# Install pg
pnpm install pg

# Set DATABASE_URL
export SUPABASE_DB_URL="postgresql://..."

# Run migration script
node scripts/apply-secrets-migration.mjs
```

## Verification

After migration, verify the tables exist:
```sql
SELECT * FROM secrets_vault LIMIT 1;
SELECT * FROM secret_rotation_logs LIMIT 1;
```

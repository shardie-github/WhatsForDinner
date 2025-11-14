# Environment Variable Sync Fixes
Generated: 2025-11-14T00:56:49.121Z

## Missing Variables

- **DATABASE_URL**: Set in Supabase
- **SUPABASE_URL**: Set in Supabase
- **SUPABASE_ANON_KEY**: Set in Supabase
- **SUPABASE_SERVICE_ROLE_KEY**: Set in Supabase
- **SUPABASE_JWT_SECRET**: Set in Supabase
- **NEXT_PUBLIC_SUPABASE_URL**: Set in Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Set in Supabase

## Mismatched Variables



## Sync Commands

```bash
# Sync secrets from Supabase to Vercel
pnpm secrets:sync:sb-to-vercel

# Or manually sync via:
node scripts/sync-secrets-supabase-vercel.mjs supabase-to-vercel
```

## Authoritative Source

**Supabase Dashboard** is the authoritative source for all environment variables.
All other sources should be synced from Supabase.

## Manual Steps

1. Go to Supabase Dashboard > Settings > API
2. Copy the values for:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_JWT_SECRET (if applicable)
3. Set DATABASE_URL using: postgresql://postgres:[SERVICE_ROLE_KEY]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
4. Run sync script: `pnpm secrets:sync:sb-to-vercel`

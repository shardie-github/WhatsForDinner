# Environment Variables Setup Guide

## Overview

This document describes all environment variables required for the Supabase-backed application, including Supabase connection strings and OpenAI API keys.

## Supabase Environment Variables

### Required Variables

#### Public (Client-Side)
These variables are exposed to the browser and should use the `NEXT_PUBLIC_` prefix:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
  - Format: `https://<project-ref>.supabase.co`
  - Example: `https://abcdefghijklmnop.supabase.co`
  - Used by: Frontend code, client-side Supabase client initialization

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
  - Format: JWT token string
  - Used by: Frontend code for client-side database access
  - Security: Protected by RLS policies - safe to expose

#### Private (Server-Side Only)
These variables should **never** be exposed to the browser:

- `SUPABASE_URL` - Supabase project URL (server-side)
  - Format: `https://<project-ref>.supabase.co`
  - Used by: Server-side code, Edge Functions, background jobs
  - Note: Can be same as `NEXT_PUBLIC_SUPABASE_URL` but kept separate for clarity

- `SUPABASE_ANON_KEY` - Supabase anonymous key (server-side)
  - Used by: Server-side code when using anon client
  - Note: Can be same as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key ⚠️ **SECRET**
  - Format: JWT token string
  - Used by: Server-side code, admin operations, bypasses RLS
  - Security: **NEVER expose this to the browser** - it bypasses all RLS policies
  - Access: Only use in server-side code, Edge Functions, background jobs

- `SUPABASE_JWT_SECRET` - JWT secret for token verification
  - Used by: Custom JWT verification, token signing
  - Security: Keep secret

- `SUPABASE_PROJECT_REF` - Project reference ID
  - Format: Alphanumeric string (e.g., `abcdefghijklmnop`)
  - Used by: Migration scripts, CLI commands
  - Example: `abcdefghijklmnop`

- `DATABASE_URL` - Direct PostgreSQL connection string
  - Format: `postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
  - Used by: Prisma, direct database connections, migrations
  - Security: Contains database password - keep secret
  - Note: Can be constructed from `SUPABASE_SERVICE_ROLE_KEY` and project ref

### Variable Mapping

| Code Expects | .env.example | Description |
|--------------|--------------|-------------|
| `process.env.NEXT_PUBLIC_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase URL |
| `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `process.env.SUPABASE_URL` | `SUPABASE_URL` | Server-side Supabase URL |
| `process.env.SUPABASE_ANON_KEY` | `SUPABASE_ANON_KEY` | Server-side anon key |
| `process.env.SUPABASE_SERVICE_ROLE_KEY` | `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret) |
| `process.env.DATABASE_URL` | `DATABASE_URL` | Direct DB connection |
| `process.env.SUPABASE_PROJECT_REF` | `SUPABASE_PROJECT_REF` | Project reference |

## OpenAI Environment Variables

### Required Variables

- `OPENAI_API_KEY` - OpenAI API key ⚠️ **SECRET**
  - Format: `sk-...` (starts with `sk-`)
  - Used by: AI features, recipe generation, chat bot
  - Security: Keep secret - never expose to browser
  - Access: Server-side only

- `OPENAI_MODEL` - OpenAI model to use (optional)
  - Default: `gpt-4-turbo-preview`
  - Used by: AI features
  - Examples: `gpt-4`, `gpt-4-turbo-preview`, `gpt-3.5-turbo`

- `OPENAI_MAX_TOKENS` - Maximum tokens per request (optional)
  - Default: `2000`
  - Used by: AI features

- `OPENAI_TEMPERATURE` - Model temperature (optional)
  - Default: `0.7`
  - Range: `0.0` to `2.0`
  - Used by: AI features

## Configuration by Environment

### Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your values:
   ```bash
   # Get these from your Supabase project dashboard
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_PROJECT_REF=your-project-ref
   
   # OpenAI (get from OpenAI dashboard)
   OPENAI_API_KEY=sk-your-openai-key
   ```

3. Never commit `.env.local` to git (it's in `.gitignore`)

### Production (Vercel/Netlify/etc.)

Set environment variables in your deployment platform:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Set for Production, Preview, and Development environments

**GitHub Secrets (for CI/CD):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_PROJECT_REF`

### Edge Functions (Supabase)

Edge Functions have their own environment variables:

1. Go to Supabase Dashboard → Edge Functions → Settings
2. Add secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`

Or use Supabase CLI:
```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
supabase secrets set OPENAI_API_KEY=sk-your-key
```

## Security Best Practices

### ✅ DO

- ✅ Use `NEXT_PUBLIC_*` prefix only for variables that are safe to expose
- ✅ Keep `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` secret
- ✅ Use RLS policies to protect data (don't rely on hiding keys)
- ✅ Rotate secrets regularly
- ✅ Use different keys for development, staging, and production
- ✅ Store secrets in environment variables, not in code
- ✅ Use secret management services in production (AWS Secrets Manager, etc.)

### ❌ DON'T

- ❌ Never commit `.env.local` or `.env` files
- ❌ Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser
- ❌ Never expose `OPENAI_API_KEY` to the browser
- ❌ Never hardcode secrets in source code
- ❌ Never share secrets in chat/email/slack
- ❌ Never use production keys in development

## Verification

### Check Environment Variables

Run the validation script:
```bash
npm run validate-env
# or
node scripts/validate-env.mjs
```

### Manual Check

```bash
# Check if variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY  # Should show value (but don't share it!)
echo $OPENAI_API_KEY  # Should show value starting with sk-
```

### Test Supabase Connection

```bash
# Using Supabase CLI
supabase link --project-ref $SUPABASE_PROJECT_REF
supabase db diff  # Should connect successfully
```

## Troubleshooting

### "Missing SUPABASE_URL"

- Check `.env.local` exists and has the variable
- Restart your dev server after adding variables
- Verify variable name matches exactly (case-sensitive)

### "Invalid API Key"

- Check OpenAI key starts with `sk-`
- Verify key is active in OpenAI dashboard
- Check for extra spaces/newlines in the value

### "RLS Policy Violation"

- This is expected - RLS policies protect your data
- Use `SUPABASE_SERVICE_ROLE_KEY` only in server-side code
- Check RLS policies in Supabase dashboard

### "Project Not Found"

- Verify `SUPABASE_PROJECT_REF` is correct
- Check you have access to the project
- Ensure project is not paused/deleted

## Related Documentation

- [Database Schema Overview](./db-overview.md)
- [Migration Guide](../supabase/migrations/README.md)
- [Supabase Documentation](https://supabase.com/docs)

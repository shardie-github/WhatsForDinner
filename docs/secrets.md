# Secrets Management Guide

This document explains which secrets live in **Vercel Project Environment Variables** vs **GitHub Actions Secrets** and the exact names to set.

## Vercel Project Environment Variables

Set these in your Vercel project dashboard: **Settings → Environment Variables**

### Core Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (https://ghqyxhbyyirveptgwoqm.supabase.co)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `SUPABASE_URL` - Same as NEXT_PUBLIC_SUPABASE_URL (for server-side)
- `SUPABASE_ANON_KEY` - Same as NEXT_PUBLIC_SUPABASE_ANON_KEY (for server-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only, NEVER expose to client)
- `SUPABASE_JWT_SECRET` - JWT secret for token verification

### Database
- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://postgres:${SUPABASE_SERVICE_ROLE_KEY}@db.ghqyxhbyyirveptgwoqm.supabase.co:5432/postgres?sslmode=require`
- `PRISMA_CLIENT_ENGINE_TYPE` - Set to `wasm` (required for Termux/Android compatibility)

### App Configuration
- `NEXTAUTH_URL` - NextAuth base URL (e.g., https://your-app.vercel.app)
- `NEXTAUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_ENV` - Environment (production, staging, development)
- `LOG_LEVEL` - Logging level (info, warn, error, debug)

### OAuth Providers (if used)
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Storage (if used)
- `NEXT_PUBLIC_UPLOAD_BUCKET` - Supabase storage bucket name (default: `public`)
- `SIGNING_SECRET` - Secret for signing URLs (if used)

## GitHub Actions Secrets

Set these in your GitHub repository: **Settings → Secrets and variables → Actions**

### Required for CI/CD
- `NEXT_PUBLIC_SUPABASE_URL` - Same as Vercel
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Same as Vercel
- `SUPABASE_SERVICE_ROLE_KEY` - Same as Vercel
- `SUPABASE_JWT_SECRET` - Same as Vercel
- `DATABASE_URL` - Same as Vercel
- `PRISMA_CLIENT_ENGINE_TYPE` - Set to `wasm`

### Optional (for CI-only features)
- `VERCEL_TOKEN` - Vercel API token (if using Vercel CLI in CI)
- `NEXT_PUBLIC_UPLOAD_BUCKET` - If storage tests are run in CI

## Getting Secrets from Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/ghqyxhbyyirveptgwoqm
2. Navigate to **Settings → API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)
4. Navigate to **Settings → Database**
5. Copy the connection string → `DATABASE_URL` (replace password with service role key)
6. Navigate to **Settings → API → JWT Settings**
7. Copy the **JWT Secret** → `SUPABASE_JWT_SECRET`

## Security Notes

- **Never commit secrets to git** - Use environment variables only
- **Service role key** has admin access - Only use server-side, never expose to client
- **Rotate secrets regularly** - Especially if exposed or compromised
- **Use different keys** for development, staging, and production environments

## Verification

After setting secrets, verify they work:

```bash
# Local verification
pnpm doctor

# Or manually
curl https://your-app.vercel.app/api/healthz
```

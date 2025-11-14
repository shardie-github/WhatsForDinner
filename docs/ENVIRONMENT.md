# Environment Variables Configuration Guide

This document explains how environment variables and secrets are managed across Supabase, GitHub Actions, Vercel, and local development.

## Overview

**Supabase is the source of truth** for all database and authentication-related environment variables. All other platforms (GitHub Actions, Vercel, local development) should sync their values from Supabase.

## Core Environment Variables

### Server-Side (Private) Variables

These variables are **never exposed to the client** and should only be used in server-side code:

- `DATABASE_URL` - PostgreSQL connection string for Prisma and direct database access
- `SUPABASE_URL` - Supabase project URL (server-side)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (server-side usage)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (bypasses RLS, use with caution)
- `SUPABASE_JWT_SECRET` - JWT secret for token verification

### Public (Client-Side) Variables

These variables are exposed to the browser and must be prefixed with `NEXT_PUBLIC_`:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (exposed to client)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (exposed to client)

## Configuration by Platform

### 1. Supabase (Source of Truth)

Supabase Dashboard holds the canonical values for all Supabase-related environment variables.

**Location:** [Supabase Dashboard](https://app.supabase.com/project/<your-project-ref>/settings/api)

**Required Variables:**
- `DATABASE_URL` - Found in Settings > Database > Connection string
- `SUPABASE_URL` - Found in Settings > API > Project URL
- `SUPABASE_ANON_KEY` - Found in Settings > API > Project API keys > `anon` `public`
- `SUPABASE_SERVICE_ROLE_KEY` - Found in Settings > API > Project API keys > `service_role` `secret`
- `SUPABASE_JWT_SECRET` - Found in Settings > API > JWT Secret

**How to Access:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the values for:
   - Project URL → `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`
   - JWT Secret → `SUPABASE_JWT_SECRET`
4. For `DATABASE_URL`, go to Settings > Database and copy the connection string

### 2. GitHub Actions Secrets

GitHub Actions Secrets are used for CI/CD pipelines and automated testing.

**Location:** Repository Settings > Secrets and variables > Actions

**Required Secrets:**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**How to Add:**
1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret name and value (copy from Supabase Dashboard)
5. Save each secret

**Note:** The `env-smoke-test.yml` workflow validates that all required secrets are present.

### 3. Vercel Environment Variables

Vercel environment variables are used for production, preview, and development deployments.

**Location:** [Vercel Dashboard](https://vercel.com/<your-team>/<your-project>/settings/environment-variables)

**Required Variables:**

**Production Environment:**
- All server-side variables listed above
- All `NEXT_PUBLIC_*` variables listed above

**Preview Environment:**
- Same as Production (recommended)
- Or use separate Supabase project for preview/staging

**Development Environment:**
- Same as Production (recommended)
- Or use separate Supabase project for development

**How to Add:**
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable:
   - Key: Variable name (e.g., `DATABASE_URL`)
   - Value: Copy from Supabase Dashboard
   - Environment: Select Production, Preview, Development, or all
4. Save each variable

**Quick Setup:**
```bash
# Pull environment variables from Vercel to local .env.local
cd apps/web
vercel env pull .env.local
```

### 4. Local Development

Local development uses `.env.local` file (gitignored, never committed).

**Setup Steps:**

1. **Copy the template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in values from Supabase:**
   - Open `.env.local`
   - Replace `<your-project-ref>` with your actual Supabase project reference
   - Fill in all empty values from Supabase Dashboard

3. **Or pull from Vercel:**
   ```bash
   cd apps/web
   vercel env pull .env.local
   ```

4. **Verify setup:**
   ```bash
   # Check that required variables are present
   node -e "require('dotenv').config({ path: '.env.local' }); console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing')"
   ```

**File Location:** `.env.local` (in project root or `apps/web/`)

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

## Setup Checklist

Use this checklist to ensure all platforms are configured correctly:

- [ ] **Supabase Dashboard**
  - [ ] Verified `DATABASE_URL` is accessible
  - [ ] Copied `SUPABASE_URL` from Settings > API
  - [ ] Copied `SUPABASE_ANON_KEY` from Settings > API
  - [ ] Copied `SUPABASE_SERVICE_ROLE_KEY` from Settings > API
  - [ ] Copied `SUPABASE_JWT_SECRET` from Settings > API

- [ ] **GitHub Actions Secrets**
  - [ ] Added `DATABASE_URL` secret
  - [ ] Added `SUPABASE_URL` secret
  - [ ] Added `SUPABASE_ANON_KEY` secret
  - [ ] Added `SUPABASE_SERVICE_ROLE_KEY` secret
  - [ ] Added `SUPABASE_JWT_SECRET` secret
  - [ ] Added `NEXT_PUBLIC_SUPABASE_URL` secret
  - [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` secret
  - [ ] Ran Env Smoke Test CI workflow to verify

- [ ] **Vercel Environment Variables**
  - [ ] Added all server-side variables to Production
  - [ ] Added all server-side variables to Preview
  - [ ] Added all server-side variables to Development
  - [ ] Added all `NEXT_PUBLIC_*` variables to Production
  - [ ] Added all `NEXT_PUBLIC_*` variables to Preview
  - [ ] Added all `NEXT_PUBLIC_*` variables to Development
  - [ ] Deployed and verified `/api/health` endpoint

- [ ] **Local Development**
  - [ ] Created `.env.local` from `.env.example`
  - [ ] Filled in all values from Supabase
  - [ ] Verified app starts without errors
  - [ ] Tested database connection

- [ ] **Validation**
  - [ ] Ran Env Smoke Test CI workflow (should pass)
  - [ ] Deployed to Vercel and called `/api/health` (should return `ok: true`)
  - [ ] Verified no missing environment variable errors in logs

## Validation & Health Checks

### GitHub Actions: Env Smoke Test

The `.github/workflows/env-smoke-test.yml` workflow automatically validates that all required environment variables are present in GitHub Secrets.

**When it runs:**
- On push to `main` or `master` branch
- On manual workflow dispatch

**What it checks:**
- All required secrets are present
- App builds successfully
- Prisma generates client (if schema exists)

### Vercel: `/api/health` Endpoint

The `/api/health` endpoint validates that all required environment variables are present at runtime.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "ok": true,
  "missing": [],
  "timestamp": "2025-01-12T10:00:00.000Z"
}
```

**If variables are missing:**
```json
{
  "ok": false,
  "missing": ["DATABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  "timestamp": "2025-01-12T10:00:00.000Z"
}
```

**How to test:**
```bash
# After deploying to Vercel
curl https://your-app.vercel.app/api/health
```

## Troubleshooting

### Missing Environment Variables

**Symptom:** App fails to start or API calls fail with "Missing required environment variable"

**Solution:**
1. Check which variable is missing from the error message
2. Verify it exists in:
   - Supabase Dashboard (source of truth)
   - GitHub Secrets (if using CI/CD)
   - Vercel Environment Variables (if deployed)
   - `.env.local` (if running locally)

### Variables Not Syncing

**Symptom:** Changes in Supabase don't reflect in Vercel/GitHub

**Solution:**
1. Manually update Vercel Environment Variables from Supabase Dashboard
2. Manually update GitHub Secrets from Supabase Dashboard
3. Consider using `vercel env pull` to sync from Vercel to local

### Public Variables Not Available in Browser

**Symptom:** `NEXT_PUBLIC_*` variables are `undefined` in client-side code

**Solution:**
1. Ensure variable name starts with `NEXT_PUBLIC_`
2. Restart Next.js dev server after adding new `NEXT_PUBLIC_*` variables
3. Verify variable is set in Vercel Environment Variables (if deployed)
4. Check that variable is in `.env.local` (if running locally)

## Security Best Practices

1. **Never commit secrets:** `.env.local` is gitignored for a reason
2. **Rotate secrets regularly:** Update Supabase keys and sync to all platforms
3. **Use service role key sparingly:** Only use `SUPABASE_SERVICE_ROLE_KEY` when necessary (bypasses RLS)
4. **Separate environments:** Use different Supabase projects for dev/staging/production when possible
5. **Monitor access:** Regularly audit who has access to Supabase Dashboard and Vercel project

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

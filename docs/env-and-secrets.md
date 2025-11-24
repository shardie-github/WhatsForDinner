# Environment Variables & Secrets

**Last Updated:** 2025-01-28  
**Status:** ✅ Complete Reference

---

## Overview

This document provides a complete reference for all environment variables and secrets required for deployment and runtime operation.

**Key Principle:** Some variables are needed in **both** GitHub Secrets (for CI/CD builds) **and** Vercel Dashboard (for runtime). Others are only needed in one place.

---

## Required GitHub Secrets

These secrets must be configured in **GitHub Repository Settings → Secrets and variables → Actions**.

### Vercel Deployment Secrets (Critical)

| Secret Name | Where to Get | Purpose | Required For |
|------------|--------------|---------|--------------|
| `VERCEL_TOKEN` | [Vercel Dashboard → Account → Tokens](https://vercel.com/account/tokens) | Authenticate Vercel CLI in GitHub Actions | All deployments |
| `VERCEL_ORG_ID` | Vercel Dashboard → Team Settings → General → Team ID | Identify Vercel organization | All deployments |
| `VERCEL_PROJECT_ID` | Vercel Dashboard → Project Settings → General → Project ID | Identify Vercel project | All deployments |

**How to Get:**

1. **VERCEL_TOKEN:**
   - Go to https://vercel.com/account/tokens
   - Click "Create Token"
   - Name it (e.g., "GitHub Actions Deployment")
   - Copy the token immediately (it won't be shown again)
   - Add to GitHub Secrets

2. **VERCEL_ORG_ID:**
   - Go to Vercel Dashboard → Your Team/Organization
   - Check URL: `vercel.com/[org-id]/...`
   - Or go to Team Settings → General → Team ID
   - Copy the ID

3. **VERCEL_PROJECT_ID:**
   - Go to your project in Vercel Dashboard
   - Go to Settings → General
   - Find "Project ID" field
   - Or check URL: `vercel.com/[org-id]/[project-id]/...`
   - Copy the ID

**Verification:**
- Run `scripts/deploy-doctor.ts` to verify all secrets are set
- Or check GitHub Actions logs for "Verify Vercel secrets" step

---

### Build-Time Secrets (For CI/CD)

| Secret Name | Purpose | Required For | Default |
|------------|---------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (build-time) | Build process | None |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (build-time) | Build process | None |
| `DATABASE_URL` | Database connection (for Prisma Client generation) | Build process | `postgresql://localhost:5432/test` |

**Note:** These are used during the GitHub Actions build process. They may have placeholder values for CI, but should match production values for production builds.

---

### Optional GitHub Secrets

| Secret Name | Purpose | Required For |
|------------|---------|--------------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI authentication | Database migrations |
| `SUPABASE_PROJECT_REF` | Supabase project reference | Database migrations |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Admin operations |
| `PROD_URL` | Production URL for E2E tests | E2E testing |

---

## Required Vercel Environment Variables

These variables must be configured in **Vercel Dashboard → Project Settings → Environment Variables**.

### Critical Runtime Variables

| Variable Name | Environment | Purpose | Example |
|--------------|-------------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Supabase service role key | `eyJhbGc...` |
| `SUPABASE_JWT_SECRET` | Production, Preview | JWT secret for Supabase | `your-secret-key` |
| `DATABASE_URL` | Production, Preview | Database connection string | `postgresql://...` |
| `PRISMA_CLIENT_ENGINE_TYPE` | Production, Preview | Prisma engine type | `wasm` |
| `NEXTAUTH_URL` | Production, Preview | NextAuth base URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Production, Preview | NextAuth secret | `your-secret-key` |

**Note:** These are pulled from Vercel during `vercel pull` in the deployment workflow.

---

### Complete Environment Variable List

See `.env.example` for the complete list of all environment variables. Key categories:

#### Core Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

#### Database
- `DATABASE_URL`
- `PRISMA_CLIENT_ENGINE_TYPE` (should be `wasm`)

#### App Configuration
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_ENV` (development/staging/production)
- `LOG_LEVEL`
- `NODE_ENV`

#### OAuth Providers
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

#### Storage
- `NEXT_PUBLIC_UPLOAD_BUCKET`
- `SIGNING_SECRET`

#### Payments
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### Analytics & Monitoring
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`

#### And 50+ more...

See `.env.example` for the complete list.

---

## Where to Set Variables

### GitHub Secrets (CI/CD Build Process)

**Set in:** GitHub Repository → Settings → Secrets and variables → Actions

**Used for:**
- GitHub Actions workflows
- Build process in CI
- Test execution
- Deployment authentication

**Required:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL` (for build)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for build)
- `DATABASE_URL` (for Prisma Client generation)

---

### Vercel Dashboard (Runtime Environment)

**Set in:** Vercel Dashboard → Project → Settings → Environment Variables

**Used for:**
- Runtime environment variables
- Build-time variables (pulled during `vercel pull`)
- Preview deployments
- Production deployments

**Required:**
- All `NEXT_PUBLIC_*` variables
- All server-side environment variables
- See `.env.example` for complete list

**Environments:**
- **Production:** Used for `main` branch deployments
- **Preview:** Used for PR preview deployments
- **Development:** Used for local development (optional)

---

## Variables Needed in Both Places

Some variables are needed in **both** GitHub Secrets **and** Vercel Dashboard:

| Variable | GitHub Secrets | Vercel Dashboard | Reason |
|----------|---------------|------------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | ✅ Yes | Build-time (CI) + Runtime |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | ✅ Yes | Build-time (CI) + Runtime |
| `DATABASE_URL` | ✅ Yes (for Prisma) | ✅ Yes (for runtime) | Prisma generation + Runtime |

**Why Both?**
- GitHub Secrets: Used during CI/CD build process
- Vercel Dashboard: Used during Vercel build and runtime

---

## Verification

### Check GitHub Secrets

```bash
# Run deploy-doctor script
pnpm deploy:doctor

# Or check manually in GitHub UI
# Settings → Secrets and variables → Actions
```

### Check Vercel Environment Variables

```bash
# Pull env vars from Vercel (requires Vercel CLI)
cd apps/web
vercel env pull .env.local

# Or check in Vercel Dashboard
# Project → Settings → Environment Variables
```

### Automated Verification

The `frontend-deploy.yml` workflow includes a "Verify Vercel secrets" step that checks:
- `VERCEL_TOKEN` is set
- `VERCEL_ORG_ID` is set
- `VERCEL_PROJECT_ID` is set

If any are missing, the workflow fails with a clear error message.

---

## Troubleshooting

### "VERCEL_TOKEN secret is not set"

**Fix:**
1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Add `VERCEL_TOKEN` secret
3. Get token from https://vercel.com/account/tokens

### "Environment variable not found at runtime"

**Fix:**
1. Check Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure variable is set for correct environment (Production/Preview)
3. Redeploy after adding variable

### "Build fails with missing NEXT_PUBLIC_* variable"

**Fix:**
1. Add variable to GitHub Secrets (for CI build)
2. Add variable to Vercel Dashboard (for Vercel build)
3. Ensure variable name matches exactly (case-sensitive)

### "Deployment succeeds but app doesn't work"

**Fix:**
1. Check Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure all required runtime variables are set
3. Check Vercel deployment logs for errors
4. Verify variable values are correct (not placeholders)

---

## Security Best Practices

### ✅ Do

1. **Use GitHub Secrets** for sensitive values (never commit to repo)
2. **Use Vercel Environment Variables** for runtime config
3. **Rotate secrets regularly** (especially VERCEL_TOKEN)
4. **Use different values** for development, staging, and production
5. **Limit secret access** to only necessary workflows
6. **Audit secrets periodically** to remove unused ones

### ❌ Don't

1. **Never commit secrets** to version control
2. **Don't hardcode secrets** in workflow files
3. **Don't share secrets** in logs or error messages
4. **Don't use production secrets** in development
5. **Don't leave placeholder values** in production

---

## Related Documentation

- [Deploy Strategy](./deploy-strategy.md) - Deployment overview
- [Vercel Troubleshooting](./vercel-troubleshooting.md) - Troubleshooting guide
- [Deploy Reliability Plan](./deploy-reliability-plan.md) - Comprehensive deployment guide
- `.env.example` - Complete environment variable template

---

*Keep this document updated as new secrets are added or removed.*

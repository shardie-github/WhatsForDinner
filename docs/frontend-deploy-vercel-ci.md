# Frontend Deployment to Vercel via GitHub Actions

This document explains how frontend deployments work in this repository. **No local Vercel or Supabase CLI is required**—everything runs automatically in GitHub Actions.

## Overview

The `frontend-deploy.yml` workflow handles all frontend deployments:

- **Pull Requests** → Creates preview deployments on Vercel
- **Push to `main`** → Deploys to production on Vercel
- **Manual trigger** → Can deploy preview or production via `workflow_dispatch`

## Workflow Structure

### Job 1: `build-and-test`

Runs before any deployment to ensure code quality:

1. **Checkout** code
2. **Setup** pnpm and Node.js (with caching)
3. **Install** dependencies (`pnpm install --frozen-lockfile`)
4. **Generate** Prisma Client (if needed)
5. **Run lint** (`pnpm lint`)
6. **Run type check** (`pnpm type-check`)
7. **Run tests** (`pnpm test:ci` or `pnpm test`)
8. **Build packages** (`pnpm build:packages`)
9. **Build web app** (`pnpm build:web`)

If any step fails, the deployment is blocked.

### Job 2: `deploy`

Only runs if `build-and-test` succeeds:

- **For PRs**: Deploys preview environment
- **For `main` branch**: Deploys production environment
- **For manual trigger**: Deploys preview by default (can be configured for production)

Uses Vercel CLI to:
1. Pull Vercel configuration (`vercel pull`)
2. Build the application (`vercel build`)
3. Deploy (`vercel deploy`)

## Required GitHub Secrets

The following secrets must be configured in GitHub (Settings → Secrets and variables → Actions):

### Vercel Secrets

1. **`VERCEL_TOKEN`**
   - **How to get**: 
     - Go to [Vercel Dashboard](https://vercel.com/account/tokens)
     - Click "Create Token"
     - Give it a name (e.g., "GitHub Actions")
     - Copy the token
   - **Required**: Yes

2. **`VERCEL_ORG_ID`**
   - **How to get**:
     - Go to [Vercel Dashboard](https://vercel.com/account)
     - Click on your organization/team
     - The Org ID is in the URL: `vercel.com/[org-id]/...`
     - Or check Settings → General → Team ID
   - **Required**: Yes

3. **`VERCEL_PROJECT_ID`**
   - **How to get**:
     - Go to your project in Vercel Dashboard
     - Go to Settings → General
     - Find "Project ID" (or check the URL: `vercel.com/[org-id]/[project-id]/...`)
   - **Required**: Yes

### Optional (for tests/build)

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (for build-time env vars)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (for build-time env vars)
- `DATABASE_URL` - Database connection string (for Prisma Client generation)

## How to Trigger

### Automatic Triggers

1. **Pull Request**
   - Open a PR targeting any branch
   - Workflow runs automatically
   - Creates a preview deployment
   - Preview URL is shown in workflow logs

2. **Push to `main`**
   - Merge PR or push directly to `main`
   - Workflow runs automatically
   - Deploys to production
   - Production URL is shown in workflow logs

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **"Frontend CI/CD"** workflow
3. Click **"Run workflow"**
4. Choose branch and click **"Run workflow"**
5. By default, deploys preview. To deploy production:
   - Set environment variable `PRODUCTION=true` or `VERCEL_ENV=production` in workflow inputs (if supported)

## Finding Deployment URLs

### In GitHub Actions Logs

1. Go to the workflow run (Actions → Frontend CI/CD → [run])
2. Click on the **"Deploy to Vercel"** job
3. Look for output like:
   ```
   ✅ Preview deployment successful!
   Preview URL: https://your-app-abc123.vercel.app
   ```
   or
   ```
   ✅ Production deployment successful!
   Production URL: https://your-app.vercel.app
   ```

### In Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. View **Deployments** tab
4. Each deployment shows:
   - Commit SHA
   - Branch
   - Environment (Preview/Production)
   - URL

## Preview vs Production

### Preview Deployments
- **Trigger**: Pull requests
- **URL**: Unique per PR (e.g., `your-app-git-branch-org.vercel.app`)
- **Purpose**: Test changes before merging
- **Environment**: Uses `preview` environment variables from Vercel

### Production Deployments
- **Trigger**: Push to `main` branch
- **URL**: Your production domain (e.g., `your-app.vercel.app`)
- **Purpose**: Live production site
- **Environment**: Uses `production` environment variables from Vercel

## Separation of Concerns

### Frontend Deployments
- Handled by: `.github/workflows/frontend-deploy.yml`
- **Does NOT** run database migrations
- **Does NOT** require Supabase CLI locally
- Focus: Build and deploy frontend code

### Database Migrations
- Handled by: `.github/workflows/supabase-migrate.yml`
- **Separate workflow** (runs independently)
- **Does NOT** deploy frontend
- Focus: Apply database schema changes

**Why separate?**
- Frontend deployments should be fast and independent
- Database migrations may require manual review
- Allows deploying frontend without touching database (and vice versa)
- Reduces risk of breaking production

## Troubleshooting

### Workflow Fails at "Verify Vercel secrets"
- **Issue**: Missing or incorrect secrets
- **Fix**: Check all three Vercel secrets are set correctly in GitHub Secrets

### Build Fails
- **Issue**: Type errors, lint errors, or test failures
- **Fix**: Fix the errors locally, commit, and push
- Check the `build-and-test` job logs for details

### Deployment Fails
- **Issue**: Vercel CLI error
- **Fix**: 
  - Check Vercel token is valid (not expired)
  - Verify project ID and org ID are correct
  - Check Vercel project settings allow deployments from GitHub Actions

### Preview URL Not Showing
- **Issue**: URL extraction from Vercel CLI output failed
- **Fix**: Check Vercel Dashboard for the deployment URL
- The deployment likely succeeded even if URL extraction failed

## No Local CLI Required

✅ **You do NOT need to:**
- Install Vercel CLI locally
- Run `vercel login` locally
- Run `vercel deploy` locally
- Install Supabase CLI locally (for migrations)

✅ **Everything runs in GitHub Actions:**
- Dependencies are installed in CI
- Builds happen in CI
- Deployments happen in CI
- Migrations happen in CI (separate workflow)

This is perfect for:
- Android/Termux users (no local CLI needed)
- CI/CD automation
- Consistent deployment environment
- Team collaboration

## Related Documentation

- [CI/CD Overview](./ci-overview.md) - Overall CI/CD architecture
- [Supabase Migrations CI](./supabase-migrations-ci.md) - Database migration workflow

---

*Last updated: 2025-01-XX*

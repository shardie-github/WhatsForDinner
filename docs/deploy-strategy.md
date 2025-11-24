# Deployment Strategy

**Last Updated:** 2025-01-28  
**Status:** ✅ Canonical Deployment Strategy Established

---

## Executive Summary

This document establishes the **canonical deployment strategy** for the What's For Dinner monorepo. All deployments follow a CI-first approach with zero local CLI requirements.

---

## Canonical Deployment Paths

### Preview Deployments (Pull Requests)

**Trigger:** Pull request opened or updated (targeting any branch)

**Workflow:** `.github/workflows/frontend-deploy.yml`

**Flow:**
```
PR Opened/Updated
  ↓
frontend-deploy.yml triggered
  ↓
build-and-test job
  ├─ Lint ✅
  ├─ Type Check ✅
  ├─ Tests ✅
  └─ Build ✅
  ↓
deploy job (Preview)
  ├─ Verify Vercel secrets
  ├─ Install Vercel CLI
  ├─ Link Vercel project (if needed)
  ├─ Pull Vercel config (preview environment)
  ├─ Build with Vercel CLI
  └─ Deploy preview
  ↓
Preview URL available in workflow logs
```

**Environment:** Preview (uses preview environment variables from Vercel)

**Purpose:** Test changes before merging to main

---

### Production Deployments (main branch)

**Trigger:** Push to `main` branch

**Workflow:** `.github/workflows/frontend-deploy.yml`

**Flow:**
```
Push to main
  ↓
frontend-deploy.yml triggered
  ↓
build-and-test job
  ├─ Lint ✅
  ├─ Type Check ✅
  ├─ Tests ✅
  └─ Build ✅
  ↓
deploy job (Production)
  ├─ Verify Vercel secrets
  ├─ Install Vercel CLI
  ├─ Link Vercel project (if needed)
  ├─ Pull Vercel config (production environment)
  ├─ Build with Vercel CLI
  └─ Deploy production
  ↓
Production deployment live
```

**Environment:** Production (uses production environment variables from Vercel)

**Purpose:** Deploy to live production site

---

## Canonical Hosting

### Primary Host: Vercel

**Status:** ✅ Vercel is the canonical hosting provider

**Project Structure:**
- **Monorepo Root:** `/workspace`
- **Frontend App:** `/workspace/apps/web`
- **Vercel Project Root:** Must be configured as `apps/web` in Vercel Dashboard

**Vercel Configuration:**
- **Project Name:** (To be configured - see Vercel Dashboard)
- **Organization:** (To be configured - see Vercel Dashboard)
- **Root Directory:** `apps/web`
- **Build Command:** `pnpm build` (runs in `apps/web`)
- **Output Directory:** `.next`
- **Install Command:** `pnpm install --frozen-lockfile`

---

## Workflow Roles

### Primary Deployment Workflow

**File:** `.github/workflows/frontend-deploy.yml`

**Role:** ✅ **CANONICAL** - Handles all frontend deployments

**Responsibilities:**
- Build and test frontend code
- Deploy preview builds for PRs
- Deploy production builds for main branch
- Verify Vercel configuration

**Status:** Active and canonical

---

### Database Migration Workflow

**File:** `.github/workflows/supabase-migrate.yml`

**Role:** Separate concern - Handles database migrations only

**Responsibilities:**
- Apply Supabase migrations
- Validate migration syntax
- Run migration checks

**Status:** Active but separate from frontend deployments

**Note:** Migrations run **independently** of frontend deployments. This is intentional to decouple concerns.

---

### Deprecated Workflows

**File:** `.github/workflows/deploy.yml`

**Role:** ⚠️ **DEPRECATED** - Do not use

**Status:** Disabled (triggers commented out)

**Removal Date:** 2025-02-28

**Reason:** Mixed concerns (frontend deploy + migrations), replaced by `frontend-deploy.yml`

---

### Alternative Deployment Workflow

**File:** `.github/workflows/vercel-promotion.yml`

**Role:** ⚠️ **ALTERNATIVE** - Manual promotion workflow

**Status:** Active but manual-only (`workflow_dispatch`)

**Use Case:** Manual promotion with additional gates (SLO checks, migration checks)

**Note:** Not used for automatic deployments. Use `frontend-deploy.yml` for automatic deployments.

---

## Branch Mapping

### Preview Environment

**Branches:** All PR branches (any branch opened as PR)

**Workflow:** `frontend-deploy.yml`

**Vercel Environment:** Preview

**URL Pattern:** `{project-name}-git-{branch-name}-{org}.vercel.app`

---

### Production Environment

**Branches:** `main` only

**Workflow:** `frontend-deploy.yml`

**Vercel Environment:** Production

**URL Pattern:** `{project-name}.vercel.app` or custom domain

---

## Vercel Project Configuration

### Required Vercel Project Settings

**Project ID:** (Stored in GitHub Secret `VERCEL_PROJECT_ID`)

**Organization ID:** (Stored in GitHub Secret `VERCEL_ORG_ID`)

**Root Directory:** `apps/web`

**Framework Preset:** Next.js

**Build Command:** `pnpm build`

**Output Directory:** `.next`

**Install Command:** `pnpm install --frozen-lockfile`

**Node Version:** 20.x

---

## Git Integration Strategy

### Recommended: Disable Vercel Git Integration

**Rationale:**
- We use GitHub Actions for all deployments
- Avoids conflicts between Vercel Git Integration and GitHub Actions
- Gives us full control over deployment process
- Allows us to run quality gates before deployment

**How to Disable:**
1. Go to Vercel Dashboard → Project Settings → Git
2. Disconnect Git Integration
3. Or ensure Git Integration is configured for a different branch (e.g., `develop`) if you want to keep it for manual testing

**Alternative:** If Git Integration is enabled, ensure it's configured for a branch that doesn't conflict with `main` (e.g., `develop` or `staging`)

---

## Environment Variables

### Build-Time Variables (Required in GitHub Secrets)

These are used during the build process in GitHub Actions:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `DATABASE_URL` - Database connection (for Prisma Client generation)

### Runtime Variables (Required in Vercel Dashboard)

These are pulled from Vercel during `vercel pull`:

- All `NEXT_PUBLIC_*` variables
- All server-side environment variables
- See `.env.example` for complete list

**Where to Set:**
- **GitHub Secrets:** For CI/CD build process
- **Vercel Dashboard:** For runtime environment variables

**Note:** Some variables need to be in both places (build-time + runtime)

---

## Deployment Verification

### How to Verify Preview Deployment

1. Open a PR
2. Check GitHub Actions → `frontend-deploy.yml` workflow
3. Look for "Deploy Preview (PR)" step
4. Check logs for preview URL
5. Or check Vercel Dashboard → Deployments

### How to Verify Production Deployment

1. Push to `main` branch
2. Check GitHub Actions → `frontend-deploy.yml` workflow
3. Look for "Deploy Production (main)" step
4. Check logs for production URL
5. Or check Vercel Dashboard → Deployments

---

## Failure Handling

### If Preview Deployment Fails

1. Check `build-and-test` job logs for errors
2. Check `deploy` job logs for Vercel errors
3. Verify Vercel secrets are set correctly
4. Verify Vercel project is linked correctly
5. Check Vercel Dashboard for deployment status

### If Production Deployment Fails

1. Same as preview deployment
2. Additionally, check if migrations need to be run first
3. Verify production environment variables are set in Vercel

---

## Related Documentation

- [Deploy Failure Postmortem](./deploy-failure-postmortem-initial.md) - Failure analysis
- [Deploy Reliability Plan](./deploy-reliability-plan.md) - Comprehensive fix plan
- [Environment Variables & Secrets](./env-and-secrets.md) - Complete secrets documentation
- [Vercel Troubleshooting](./vercel-troubleshooting.md) - Troubleshooting guide
- [CI Overview](./ci-overview.md) - Overall CI/CD architecture

---

*This is the canonical deployment strategy. All deployments must follow this pattern.*

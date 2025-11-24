# CI/CD Overview

## Current State Analysis

### Package Manager & Lockfiles
- **Canonical Package Manager**: `pnpm@9.0.0` (specified in root `package.json`)
- **Lockfile**: `pnpm-lock.yaml` (root level)
- **Issues Found**:
  - `package-lock.json` files exist in `whats-for-dinner/` and `apps/web/` subdirectories (should be removed)
  - These conflicting lockfiles can cause CI failures

### Node Version
- **Pinned Version**: Node 20 (specified in `package.json` engines: `>=18.0.0 <21.0.0`)
- **CI Usage**: All workflows use Node 20 consistently
- **Status**: ✅ Consistent

### Frontend Stack
- **Framework**: Next.js 16.0.0
- **Location**: `apps/web/`
- **Build Output**: Static export (`output: 'export'` in `next.config.ts`)
- **Hosting**: Vercel

### Current CI Workflows

#### 1. `ci.yml` - Main CI Pipeline
- **Triggers**: Push/PR to `main` and `develop`
- **Jobs**:
  - `lint`: Runs ESLint
  - `type-check`: TypeScript type checking
  - `test`: Runs test suite (depends on lint + type-check)
  - `build`: Builds packages and web app (depends on lint + type-check + test)
  - `test-coverage`: Generates coverage reports
  - `code-hygiene`: Runs unused exports/imports checks
- **Status**: ✅ Well-structured, uses pnpm correctly

#### 2. `deploy.yml` - Production Deployment
- **Triggers**: Push to `main`, `workflow_dispatch`
- **Issues**:
  - Uses `continue-on-error: true` on critical steps (Supabase login, migrations, Vercel deploy)
  - Doesn't properly handle preview vs production deployments
  - Mixes Supabase migrations with frontend deployment (should be separate)
- **Status**: ⚠️ Needs refactoring

#### 3. `supabase-migrate.yml` - Database Migrations
- **Triggers**: Push to `main`, `workflow_dispatch`
- **Issues**:
  - **Hardcoded project ref**: `ramptcbrcfuudlrybzng` (should use secret)
  - Doesn't use pnpm (uses npx directly)
- **Status**: ⚠️ Needs fixes

#### 4. `vercel-promotion.yml` - Manual Promotion
- **Triggers**: `workflow_dispatch` only
- **Purpose**: Manual promotion with SLO checks
- **Status**: ✅ Separate concern, can coexist with automated deployment

#### 5. `vercel-guard.yml` - Vercel Validation
- **Triggers**: PR and push to `main`
- **Issues**:
  - Uses `npm` instead of `pnpm` (inconsistent)
  - Checks for `package-lock.json` first (wrong priority)
- **Status**: ⚠️ Needs fixes

### Failing/Skipped Checks (Identified Issues)

1. **Lockfile Mismatches**
   - Multiple lockfiles (pnpm + npm) cause dependency resolution failures
   - **Fix**: Remove `package-lock.json` files, use only `pnpm-lock.yaml`

2. **Missing Scripts**
   - Some workflows reference scripts that may not exist
   - **Fix**: Ensure all referenced scripts exist in `package.json`

3. **Inconsistent Package Manager Usage**
   - `vercel-guard.yml` uses npm instead of pnpm
   - **Fix**: Standardize on pnpm everywhere

4. **Hardcoded Secrets**
   - Supabase project ref is hardcoded in `supabase-migrate.yml`
   - **Fix**: Use `SUPABASE_PROJECT_REF` secret

5. **Deployment Workflow Issues**
   - `deploy.yml` doesn't handle preview deployments for PRs
   - **Fix**: Create dedicated `frontend-deploy.yml` with proper preview/production logic

## Target State (✅ IMPLEMENTED)

### Frontend CI/CD Workflow
- **Name**: `frontend-deploy.yml` ✅
- **Triggers**:
  - `pull_request` → Preview deployment ✅
  - `push` to `main` → Production deployment ✅
  - `workflow_dispatch` → Manual trigger ✅
- **Jobs**:
  1. `build-and-test`: Lint → Test → Typecheck → Build ✅
  2. `deploy`: Deploy to Vercel (preview or production based on trigger) ✅

### Supabase Migrations
- **Workflow**: `supabase-migrate.yml` (separate from frontend) ✅
- **Triggers**: `workflow_dispatch`, push to `main` ✅
- **Decoupled**: Frontend deployments do NOT trigger migrations automatically ✅
- **Fixes Applied**:
  - ✅ Removed hardcoded project ref, now uses `SUPABASE_PROJECT_REF` secret
  - ✅ Uses pnpm consistently

### Standardization
- ✅ Single package manager: `pnpm`
- ✅ Single lockfile: `pnpm-lock.yaml` (removed conflicting `package-lock.json` files)
- ✅ Node version: `20`
- ✅ All workflows use pnpm consistently
- ✅ `.gitignore` updated to ignore npm/yarn lockfiles, keep pnpm-lock.yaml

### Workflow Cleanup
- ✅ `deploy.yml` deprecated (disabled triggers, marked as deprecated)
- ✅ `vercel-guard.yml` fixed (now uses pnpm instead of npm)
- ✅ All workflows standardized on pnpm

## Required GitHub Secrets

### Frontend Deployment
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### Supabase Migrations
- `SUPABASE_ACCESS_TOKEN` - Supabase access token
- `SUPABASE_PROJECT_REF` - Supabase project reference ID

## Checks Required for Merge

1. ✅ Lint passes
2. ✅ Type check passes
3. ✅ Tests pass
4. ✅ Build succeeds
5. ✅ Preview deployment created (for PRs)

---

*Last updated: 2025-01-XX*
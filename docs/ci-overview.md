# CI/CD Overview

**Last Updated:** 2025-01-28  
**Status:** ✅ Active CI/CD Pipeline Documented

---

## Executive Summary

This repository uses **GitHub Actions** for all CI/CD operations, following a **CI-first** approach:
- ✅ Zero local CLI requirements (perfect for Android/Termux users)
- ✅ Automatic preview deployments on PRs
- ✅ Automatic production deployments on `main`
- ✅ Database migrations automated via CI
- ✅ Comprehensive quality gates (lint, type-check, test, build)

---

## Core Workflows

### 1. Frontend CI/CD (`frontend-deploy.yml`) ✅

**Purpose:** Build, test, and deploy the Next.js web application to Vercel

**Triggers:**
- `pull_request` → Preview deployment
- `push` to `main` → Production deployment
- `workflow_dispatch` → Manual deployment

**Jobs:**

#### `build-and-test`
- Checkout code
- Setup pnpm 9.0.0
- Setup Node.js 20.x
- Install dependencies (`pnpm install --frozen-lockfile`)
- Generate Prisma Client
- Run lint (`pnpm lint`)
- Run type check (`pnpm type-check`)
- Run tests (`pnpm test:ci`)
- Build packages (`pnpm build:packages`)
- Build web app (`pnpm build:web`)

#### `deploy`
- Depends on: `build-and-test`
- Install Vercel CLI
- Verify Vercel secrets
- **Preview (PR):** Deploy to preview environment
- **Production (main):** Deploy to production environment
- **Manual:** Deploy based on input

**Secrets Required:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Status:** ✅ Active and well-configured

---

### 2. Database Migrations (`supabase-migrate.yml`) ✅

**Purpose:** Apply Supabase database migrations

**Triggers:**
- `push` to `main`
- `workflow_dispatch` (manual)

**Jobs:**

#### `migrate`
- Checkout code
- Setup pnpm 9.0.0
- Setup Node.js 20.x
- Login to Supabase (`supabase login --token`)
- Link project (`supabase link --project-ref`)
- Apply migrations (`supabase migration up`)

**Secrets Required:**
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

**Status:** ✅ Active and working

**Note:** Migrations run **separately** from frontend deployments (decoupled)

---

### 3. CI Checks (`ci.yml`) ✅

**Purpose:** Run quality gates on every PR and push

**Triggers:**
- `push` to `main` or `develop`
- `pull_request` to `main` or `develop`

**Jobs:**

#### `lint`
- Run ESLint (`pnpm lint`)
- **Status:** Required (must pass)

#### `type-check`
- Generate Prisma Client
- Run TypeScript type check (`pnpm type-check`)
- **Status:** Required (must pass)

#### `test`
- Depends on: `lint`, `type-check`
- Run test suite (`pnpm test:ci`)
- **Status:** Required (must pass)

#### `build`
- Depends on: `lint`, `type-check`, `test`
- Build packages (`pnpm build:packages`)
- Build web app (`pnpm build:web`)
- Build mobile app (`pnpm build:mobile`) - optional
- **Status:** Required (must pass)

#### `test-coverage`
- Depends on: `test`
- Run tests with coverage (`pnpm test:coverage`)
- Check coverage threshold (80%)
- Upload coverage report
- **Status:** Warning if below threshold (non-blocking)

#### `code-hygiene`
- Depends on: `build`
- Check unused exports (`pnpm prune:exports`)
- Scan for unused files (`pnpm scan:usage`)
- Audit dependencies (`pnpm audit:deps`)
- **Status:** Warnings only (non-blocking)

**Status:** ✅ Active and comprehensive

---

### 4. Supabase CI (`supabase-ci.yml`) ✅

**Purpose:** Validate Supabase schema and migrations

**Triggers:**
- `pull_request` affecting `supabase/**` or `prisma/**`
- `push` to `main` affecting `supabase/**` or `prisma/**`

**Jobs:**

#### `supabase-guard`
- Setup Supabase CLI
- Lint migrations
- Check migration syntax
- Pull remote schema (if `SUPABASE_DB_URL` is set)
- Generate local schema from migrations
- Check for schema drift
- Validate Edge Functions
- Apply delta migrations (on push to main)
- Verify post-apply (on push to main)

**Secrets Required:**
- `SUPABASE_DB_URL` (optional, for drift detection)
- `SUPABASE_PROJECT_REF`
- `SUPABASE_SERVICE_ROLE_KEY`

**Status:** ✅ Active (warnings are non-blocking)

---

### 5. Schema Validation (`schema-validation.yml`) ✅

**Purpose:** Validate database schema health

**Triggers:**
- `push` to `main` or `develop` affecting schema files
- `pull_request` affecting schema files

**Jobs:**

#### `schema-health-check`
- Generate Prisma Client
- Run schema health check script
- Upload health report

#### `migration-validation`
- Validate migration file naming
- Check SQL syntax
- Check migration order

#### `prisma-schema-validation`
- Validate Prisma schema
- Check for breaking changes

**Status:** ✅ Active (warnings are non-blocking)

---

### 6. E2E Tests (`e2e.yml`) ✅

**Purpose:** Run end-to-end smoke tests

**Triggers:**
- `push` to `main`
- `workflow_dispatch` (manual)

**Jobs:**

#### `e2e-smoke-test`
- Setup Playwright
- Install browsers
- Run smoke tests (`tests/reality/smoke.test.ts`)
- Upload test results and screenshots

**Secrets Required:**
- `PROD_URL` (optional, defaults to localhost)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Status:** ✅ Active

**Note:** Should be added as required check for PRs

---

## Specialized Workflows

### Security (`security.yml`)
- Security scanning
- Dependency audits
- Secret scanning

### Compliance (`compliance.yml`)
- Compliance checks
- Privacy audits

### System Health (`system-health.yml`)
- Health checks
- Monitoring validation

### Nightly Jobs (`nightly.yml`, `nightly-drift-report.yml`, `nightly-etl.yml`)
- Scheduled jobs (run nightly)
- Drift reports
- ETL processes

### Operations (`ops-ci.yml`, `ops-matrix-ci.yml`)
- Operations checks
- Matrix testing

### Other Workflows
- `chaos.yml` - Chaos engineering tests
- `canary-deploy.yml` - Canary deployments
- `release.yml` - Release automation
- `telemetry.yml` - Telemetry validation
- `watcher-cron.yml` - Watcher cron jobs
- And 30+ more workflows...

**Recommendation:** Audit each workflow to determine if it's:
1. **Active** - Runs regularly and provides value
2. **Obsolete** - No longer needed, should be removed
3. **Needs Update** - Still relevant but needs modernization

---

## Required Checks for `main` Branch

### Must Pass (Blocking)

1. ✅ **Lint** (`ci.yml` → `lint`)
2. ✅ **Type Check** (`ci.yml` → `type-check`)
3. ✅ **Tests** (`ci.yml` → `test`)
4. ✅ **Build** (`ci.yml` → `build`)
5. ✅ **Frontend Deploy** (`frontend-deploy.yml` → `build-and-test`)

### Should Pass (Non-Blocking but Important)

1. ⚠️ **Test Coverage** (`ci.yml` → `test-coverage`) - Warning if < 80%
2. ⚠️ **E2E Smoke Tests** (`e2e.yml` → `e2e-smoke-test`) - Should be required
3. ⚠️ **Schema Validation** (`schema-validation.yml`) - Warnings only
4. ⚠️ **Supabase CI** (`supabase-ci.yml`) - Warnings only

### Optional (Informational)

1. ℹ️ **Code Hygiene** (`ci.yml` → `code-hygiene`) - Warnings only
2. ℹ️ **Security** (`security.yml`) - Scans and audits
3. ℹ️ **Compliance** (`compliance.yml`) - Compliance checks

---

## Branch Protection Recommendations

### For `main` Branch

**Required Status Checks:**
- `lint` (from `ci.yml`)
- `type-check` (from `ci.yml`)
- `test` (from `ci.yml`)
- `build` (from `ci.yml`)
- `build-and-test` (from `frontend-deploy.yml`)

**Optional Status Checks:**
- `e2e-smoke-test` (from `e2e.yml`) - **Should be required**
- `test-coverage` (from `ci.yml`)
- `schema-health-check` (from `schema-validation.yml`)

**Settings:**
- Require branches to be up to date before merging
- Require pull request reviews before merging
- Require status checks to pass before merging
- Do not allow force pushes
- Do not allow deletions

---

## Workflow Concurrency

### Concurrency Groups

**Frontend Deployments:**
```yaml
concurrency:
  group: frontend-deploy-${{ github.ref }}
  cancel-in-progress: true
```

**Supabase Migrations:**
```yaml
concurrency:
  group: supabase-migrations-${{ github.ref }}
  cancel-in-progress: false
```

**Rationale:**
- Frontend deployments: Cancel in-progress (newer commit supersedes)
- Migrations: Don't cancel (migrations must complete sequentially)

---

## Environment Variables in CI

### Node Version
- **Pinned:** 20.x (LTS)
- **Set in:** All workflows via `NODE_VERSION: '20'`

### Package Manager
- **Pinned:** pnpm 9.0.0
- **Set in:** All workflows via `PNPM_VERSION: 9`

### Build Environment
- **Cache:** pnpm cache enabled
- **Lockfile:** `--frozen-lockfile` (ensures reproducible builds)

---

## Secrets Management

### GitHub Secrets

**Required for CI/CD:**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `SUPABASE_ACCESS_TOKEN` - Supabase CLI token
- `SUPABASE_PROJECT_REF` - Supabase project reference
- `DATABASE_URL` - Database connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional:**
- `SUPABASE_DB_URL` - For schema drift detection
- `SUPABASE_SERVICE_ROLE_KEY` - For service role operations
- `PROD_URL` - For E2E tests
- `SENTRY_DSN` - For error tracking
- And 50+ more...

**See:** `docs/env-and-secrets.md` for complete list

---

## Deployment Flow

### Preview Deployment (PR)

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
deploy job
  ├─ Install Vercel CLI
  ├─ Pull Vercel config (preview)
  ├─ Build
  └─ Deploy (preview)
  ↓
Preview URL available in PR comments
```

### Production Deployment (main)

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
deploy job
  ├─ Install Vercel CLI
  ├─ Pull Vercel config (production)
  ├─ Build
  └─ Deploy (production)
  ↓
Production deployment live
```

### Database Migration (main)

```
Push to main (affecting supabase/migrations)
  ↓
supabase-migrate.yml triggered
  ↓
migrate job
  ├─ Login to Supabase
  ├─ Link project
  └─ Apply migrations
  ↓
Migrations applied to production database
```

**Note:** Migrations run **independently** of frontend deployments

---

## Troubleshooting

### Build Failures

**Common Issues:**
1. **Dependency issues:** Check `pnpm-lock.yaml` is up to date
2. **Type errors:** Run `pnpm type-check` locally
3. **Test failures:** Run `pnpm test` locally
4. **Build errors:** Check Node version matches (20.x)

### Deployment Failures

**Common Issues:**
1. **Vercel secrets missing:** Check GitHub Secrets
2. **Build timeout:** Increase timeout in workflow
3. **Environment variables:** Check Vercel Dashboard

### Migration Failures

**Common Issues:**
1. **Supabase token expired:** Regenerate `SUPABASE_ACCESS_TOKEN`
2. **Migration conflicts:** Check for schema drift
3. **Syntax errors:** Validate SQL syntax locally

---

## Best Practices

### ✅ Do

1. **Keep workflows focused:** One workflow per concern
2. **Use concurrency groups:** Prevent overlapping deployments
3. **Pin versions:** Node, pnpm, action versions
4. **Use frozen lockfile:** `--frozen-lockfile` for reproducible builds
5. **Separate concerns:** Frontend deployments ≠ Database migrations
6. **Add timeouts:** Prevent hanging workflows
7. **Use secrets:** Never hardcode credentials

### ❌ Don't

1. **Mix concerns:** Don't deploy frontend and run migrations in same workflow
2. **Skip quality gates:** Don't disable lint/type-check/test
3. **Use latest tags:** Pin action versions
4. **Commit secrets:** Use GitHub Secrets
5. **Ignore failures:** Fix failing checks before merging

---

## Future Improvements

### Short-Term

1. ✅ Add smoke tests as required check for PRs
2. ✅ Audit and consolidate workflows (remove obsolete ones)
3. ✅ Add performance monitoring to CI
4. ✅ Add security scanning as required check

### Long-Term

1. Consider workflow consolidation tool
2. Add comprehensive E2E test suite
3. Add performance budgets to CI
4. Add automated rollback on deployment failures

---

## Conclusion

**Current State:** ✅ CI/CD pipeline is **well-structured and functional**

**Strengths:**
- CI-first approach (no local CLI requirements)
- Comprehensive quality gates
- Decoupled deployments (frontend ≠ migrations)
- Good use of concurrency groups

**Areas for Improvement:**
- Add smoke tests as required checks
- Audit and consolidate workflows
- Add performance monitoring
- Improve documentation for specialized workflows

**Status:** Production-ready with minor improvements needed.

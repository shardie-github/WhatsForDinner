# Stack Discovery Report

**Generated:** 2025-01-28  
**Purpose:** Complete inventory of the technology stack, infrastructure, and deployment patterns

---

## Executive Summary

This repository is a **monorepo meal planning application** ("What's for Dinner") built with:
- **Frontend:** Next.js 16 (web) + React Native/Expo (mobile)
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **ORM:** Prisma (for type-safe database access)
- **Hosting:** Vercel (web), GitHub Actions (CI/CD)
- **Package Manager:** pnpm 9.0.0
- **Node Version:** 20.x (LTS)

The application is **CI-first** with all deployments and migrations automated via GitHub Actions.

---

## Frontend Stack

### Web Application (`apps/web`)
- **Framework:** Next.js 16.0.0
- **React:** 19.2.0
- **Build Tool:** Next.js built-in (Turbopack enabled)
- **Styling:** Tailwind CSS + Radix UI components
- **State Management:** TanStack Query (React Query)
- **Type Safety:** TypeScript 5.x
- **Output Mode:** Static export (`output: 'export'`)
- **PWA:** Enabled via `next-pwa`

**Key Features:**
- Static site generation (SSG)
- Image optimization (WebP/AVIF)
- Code splitting and bundle optimization
- Security headers configured
- Sentry integration (optional)

### Mobile Application (`apps/mobile`)
- **Framework:** React Native + Expo SDK 52
- **Capacitor:** v7.4.4 (for native features)
- **Build:** EAS Build (Expo Application Services)
- **Styling:** NativeWind (Tailwind for React Native)

### Shared Packages (`packages/`)
- `@whats-for-dinner/ui` - Shared UI components
- `@whats-for-dinner/utils` - Shared utilities and hooks
- `@whats-for-dinner/theme` - Design system
- `@whats-for-dinner/config` - Shared configuration

**Monorepo Tool:** Turborepo for build orchestration

---

## Backend Stack

### Database
- **Provider:** Supabase (managed PostgreSQL)
- **ORM:** Prisma 5.22.0
- **Engine Type:** WASM (Termux/Android compatible)
- **Migrations:** Supabase-native SQL migrations (`supabase/migrations/`)
- **Schema Strategy:** Consolidated master migration (`99999999999999_master_consolidated_schema.sql`)

**Key Tables:**
- `users` - User accounts
- `households` - Family/household management
- `meal_plans` - Meal planning data
- `recipes` - Recipe storage
- `grocery_lists` - Shopping lists
- `health_metrics` - Health tracking
- Growth systems (referrals, email subscriptions, etc.)
- Privacy & compliance (DSAR, privacy prefs, etc.)

### API Layer
- **Primary:** Next.js API routes (`apps/web/app/api/`)
- **Edge Functions:** Supabase Edge Functions (`supabase/functions/`)
  - `generate-meal` - AI meal generation
  - `job-processor` - Background job processing
  - `api` - General API endpoints

### Authentication
- **Provider:** Supabase Auth
- **Methods:** Email/password, OAuth (GitHub, Google)
- **Session Management:** Supabase SSR helpers

### Storage
- **Provider:** Supabase Storage
- **Buckets:** Public uploads, artifacts, backups

### Realtime
- **Provider:** Supabase Realtime (PostgreSQL subscriptions)

---

## Infrastructure & Hosting

### Web Hosting
- **Platform:** Vercel
- **Deployment Method:** GitHub Actions → Vercel CLI
- **Preview Deploys:** Automatic on PRs
- **Production Deploys:** Automatic on `main` branch push
- **Configuration:** `vercel.json` (crons, rewrites, headers)

### Mobile Hosting
- **Platform:** EAS Build (Expo)
- **Distribution:** App Store / Google Play (via EAS)

### CI/CD
- **Platform:** GitHub Actions
- **Primary Workflows:**
  - `frontend-deploy.yml` - Frontend builds and Vercel deployments
  - `supabase-migrate.yml` - Database migrations
  - `ci.yml` - Lint, type-check, test, build
  - `supabase-ci.yml` - Schema validation and drift detection

**Node Version:** 20.x (pinned in workflows)  
**Package Manager:** pnpm 9.0.0 (locked)

---

## Database Migrations

### Current Strategy
- **Master Migration:** `supabase/migrations/99999999999999_master_consolidated_schema.sql`
  - Single consolidated migration for fresh databases
  - Idempotent (uses `IF NOT EXISTS` throughout)
  - Contains all tables, enums, indexes, RLS policies, functions

### Migration Workflow
1. **Local Development:** `supabase migration up` (via Supabase CLI)
2. **CI/CD:** `.github/workflows/supabase-migrate.yml`
   - Runs on `push` to `main`
   - Uses `supabase migration up` via GitHub Actions
   - Requires: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`

### Prisma Integration
- **Schema:** `prisma/schema.prisma` (generated from Supabase schema)
- **Client Generation:** `prisma generate` (WASM engine)
- **Usage:** Type-safe database access in application code
- **Note:** Prisma is used for type generation, not migrations (Supabase handles migrations)

---

## Environment Variables

### Core Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only)
- `SUPABASE_PROJECT_REF` - Project reference ID
- `DATABASE_URL` - PostgreSQL connection string

### Application
- `NEXT_PUBLIC_APP_URL` - Application base URL
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level

### Third-Party Services
- `OPENAI_API_KEY` - OpenAI for meal generation
- `STRIPE_SECRET_KEY` - Payment processing
- `RESEND_API_KEY` - Email sending
- `SENTRY_DSN` - Error tracking (optional)

**Full list:** See `.env.example` (200+ variables documented)

---

## CI/CD Workflows

### Active Workflows

#### `frontend-deploy.yml` ✅
- **Triggers:** PRs, push to `main`, manual dispatch
- **Jobs:**
  - `build-and-test` - Lint, type-check, test, build
  - `deploy` - Deploy to Vercel (preview or production)
- **Status:** Active and well-configured

#### `supabase-migrate.yml` ✅
- **Triggers:** Push to `main`, manual dispatch
- **Job:** `migrate` - Applies Supabase migrations
- **Status:** Active and working

#### `ci.yml` ✅
- **Triggers:** PRs, push to `main`/`develop`
- **Jobs:** Lint, type-check, test, build, test-coverage, code-hygiene
- **Status:** Active and comprehensive

#### `supabase-ci.yml` ✅
- **Triggers:** PRs/push affecting `supabase/**` or `prisma/**`
- **Job:** Schema validation, drift detection, edge function validation
- **Status:** Active (non-blocking warnings)

### Potentially Obsolete Workflows

#### `deploy.yml` ⚠️
- **Status:** DEPRECATED (marked in file)
- **Reason:** Mixed frontend deployment with migrations (violates separation of concerns)
- **Replacement:** Use `frontend-deploy.yml` + `supabase-migrate.yml`
- **Action:** Should be removed

#### Other Workflows (50+ total)
Many workflows exist for:
- Nightly jobs (`nightly.yml`, `nightly-drift-report.yml`, `nightly-etl.yml`)
- Security (`security.yml`, `compliance.yml`)
- Monitoring (`system-health.yml`, `telemetry.yml`)
- Operations (`ops-ci.yml`, `ops-matrix-ci.yml`)
- Specialized (`chaos.yml`, `e2e.yml`, `canary-deploy.yml`)

**Recommendation:** Audit each workflow to determine if it's:
1. **Active** - Runs regularly and provides value
2. **Obsolete** - No longer needed, should be removed
3. **Needs Update** - Still relevant but needs modernization

---

## Testing Strategy

### Current Tests
- **Unit Tests:** Jest (configured in `apps/web`)
- **E2E Tests:** Playwright (workflow: `e2e.yml`)
- **Type Checking:** TypeScript compiler
- **Linting:** ESLint

### Test Coverage
- Coverage reporting configured (`test:coverage`)
- Threshold: 80% (warning if below)

### Smoke Tests
- Scripts exist: `smoke:test`, `smoke:test:elevation`
- **Gap:** Not wired into CI as required checks

---

## Security & Compliance

### Authentication
- Supabase Auth with MFA support
- Row-Level Security (RLS) policies enforced
- Session management via Supabase SSR

### Privacy & Compliance
- GDPR compliance features (DSAR requests)
- Privacy preferences management
- Data retention policies
- Transparency logging

### Security Headers
- Configured in `next.config.ts`
- X-Frame-Options, X-Content-Type-Options, Referrer-Policy

### Secrets Management
- GitHub Secrets for CI/CD
- Vercel environment variables for deployments
- Supabase secrets for database access

---

## Observability

### Error Tracking
- Sentry integration (optional, env-driven)
- Error boundaries in React components

### Monitoring
- Prometheus metrics (optional)
- Grafana dashboards (configured)
- Loki for logs (configured)

### Telemetry
- PostHog analytics (optional)
- Custom event tracking

---

## Notable Gaps & Red Flags

### ⚠️ Critical Issues

1. **Too Many Workflows**
   - 50+ GitHub workflows exist
   - Many may be obsolete or redundant
   - **Action:** Audit and consolidate

2. **Prisma vs Supabase Migrations**
   - Prisma schema exists but migrations are Supabase-native
   - **Status:** Acceptable (Prisma for types, Supabase for migrations)
   - **Action:** Document this strategy clearly

3. **Smoke Tests Not in CI**
   - Smoke test scripts exist but not required in CI
   - **Action:** Add smoke tests as required CI checks

4. **Deprecated Workflow**
   - `deploy.yml` is deprecated but still in repo
   - **Action:** Remove after confirming no dependencies

### ⚠️ Medium Priority

1. **Environment Variables**
   - 200+ env vars documented
   - Many may be unused
   - **Action:** Audit actual usage vs documented vars

2. **Test Coverage**
   - Coverage threshold exists but may not be enforced
   - **Action:** Ensure coverage gates in CI

3. **Mobile Build**
   - Mobile app exists but build may not be fully automated
   - **Action:** Verify mobile CI/CD pipeline

### ✅ Strengths

1. **CI-First Approach**
   - All deployments automated
   - No local CLI requirements for production

2. **Consolidated Migrations**
   - Single master migration simplifies onboarding
   - Idempotent design

3. **Comprehensive Documentation**
   - Extensive docs in `/docs`
   - Well-documented environment variables

4. **Modern Stack**
   - Latest Next.js, React 19
   - Type-safe with TypeScript + Prisma

---

## Recommendations

### Immediate Actions
1. ✅ Document backend strategy (Supabase + Prisma)
2. ✅ Document frontend hosting strategy (Vercel)
3. ✅ Normalize migrations workflow
4. ✅ Add smoke tests to CI
5. ✅ Remove deprecated `deploy.yml` workflow

### Short-Term
1. Audit and consolidate GitHub workflows
2. Create demo script and seed data workflow
3. Normalize environment variables (usage audit)
4. Add schema validation script

### Long-Term
1. Consider workflow consolidation tool
2. Implement comprehensive E2E test suite
3. Add performance monitoring to CI
4. Create runbook for common operations

---

## Conclusion

This is a **well-structured, modern monorepo** with:
- ✅ Clear separation of concerns (frontend/backend)
- ✅ CI-first deployment strategy
- ✅ Comprehensive database schema
- ✅ Good documentation foundation

**Primary focus areas:**
1. Workflow consolidation and cleanup
2. Smoke test integration
3. Demo readiness (seed data, scripts)
4. Environment variable normalization

The stack is **production-ready** with minor cleanup needed.

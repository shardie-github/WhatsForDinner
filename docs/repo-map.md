# Repository Map - What's For Dinner Monorepo

**Generated**: 2025-11-01  
**Purpose**: Comprehensive technical map for go-live readiness and onboarding

---

## ?? Executive Summary

**Product**: What's For Dinner - Universal meal planning & pantry management app  
**Architecture**: Turborepo monorepo with Next.js (web) + Expo (mobile)  
**Stack**: TypeScript, React 18/19, Supabase (Postgres + Auth), Vercel deployment  
**Hosting**: Vercel (web), EAS Build (mobile), Supabase (database + functions)  
**Package Manager**: pnpm 9.0.0  
**Node Version**: 18.x - 20.x  

---

## ??? Repository Structure

### Root-Level Organization

```
/workspace/
??? apps/                       # Application workspaces
?   ??? web/                   # Next.js 15 PWA (primary web app)
?   ??? mobile/                # Expo SDK 52 React Native app
?   ??? community-portal/      # Community features (Next.js)
?   ??? chef-marketplace/      # Chef marketplace (Next.js)
?   ??? api-docs/              # API documentation site
?   ??? referral/              # Referral program app
?   ??? *.disabled/            # Feature apps (admin, billing, etc.) - not built
??? packages/                   # Shared libraries
?   ??? ui/                    # Cross-platform components (Vitest)
?   ??? utils/                 # Shared utilities & hooks
?   ??? theme/                 # Design system & tokens
?   ??? config/                # Shared configs (ESLint, Tailwind, TS)
??? whats-for-dinner/          # Legacy app structure (to be consolidated)
??? ai/                        # AI automation agents
??? agents/                    # Continuous improvement agents
??? config/                    # Environment & infrastructure configs
??? docs/                      # Documentation
??? infra/                     # Terraform infrastructure
??? scripts/                   # Build, deploy, monitoring scripts
??? supabase/                  # Database migrations & edge functions
??? watchers/                  # Automated health monitoring
```

---

## ?? Application Surfaces

### 1. Web App (`apps/web`)
- **Framework**: Next.js 16.0.0 (App Router)
- **React**: 19.2.0
- **Entry Point**: `apps/web/src/app/layout.tsx`, `apps/web/src/app/page.tsx`
- **Build Output**: `.next/` ? Vercel deployment
- **Key Features**:
  - PWA support via `next-pwa`
  - Sentry error tracking
  - PostHog analytics
  - Stripe payments integration
  - Server-side rendering + static generation
- **Scripts**:
  - `pnpm dev:web` ? Development server (localhost:3000)
  - `pnpm build:web` ? Production build
  - `pnpm test:ci` ? Jest tests with coverage
- **Authentication**: Supabase Auth with Next.js helpers
- **Styling**: Tailwind CSS 3.4 + Radix UI primitives

### 2. Mobile App (`apps/mobile`)
- **Framework**: Expo SDK 52 + Expo Router 4.0
- **React Native**: 0.76.3
- **Entry Point**: `apps/mobile/app/_layout.tsx`, `apps/mobile/app/index.tsx`
- **Build Output**: `dist/` (Expo export) ? EAS Build
- **Key Features**:
  - Universal routing (iOS, Android, Web)
  - NativeWind 4.0 (Tailwind for React Native)
  - Offline-first with SQLite
  - Secure storage for tokens
- **Scripts**:
  - `pnpm dev:mobile` ? Expo dev server
  - `pnpm build:mobile` ? Expo export
  - `pnpm android/ios` ? Platform-specific dev builds
- **Deployment**: EAS Build for app stores

### 3. Community Portal (`apps/community-portal`)
- Next.js app for community features
- Shared components from `@whats-for-dinner/ui`

### 4. Chef Marketplace (`apps/chef-marketplace`)
- Next.js app for chef-created recipe marketplace
- Integration with Stripe for payments

### 5. API Documentation (`apps/api-docs`)
- API reference documentation site
- Auto-generated from OpenAPI specs

### 6. Referral Program (`apps/referral`)
- Standalone referral tracking app
- Analytics integration

---

## ?? Shared Packages

### `@whats-for-dinner/ui`
- **Location**: `packages/ui/`
- **Purpose**: Cross-platform UI components
- **Test Runner**: Vitest + React Testing Library
- **Coverage**: Component library with design system primitives
- **Exports**: Button, Card, Input, Dialog, etc.
- **Platform Support**: Web + React Native (via NativeWind)

### `@whats-for-dinner/utils`
- **Location**: `packages/utils/`
- **Purpose**: Shared utilities, hooks, and helpers
- **Exports**: 
  - Hooks: `usePantry`, `useRecipes`, `useAuth`
  - Utils: `cn()` (class merging), date formatters, validators

### `@whats-for-dinner/theme`
- **Location**: `packages/theme/`
- **Purpose**: Design tokens (colors, spacing, typography)
- **Format**: TypeScript theme object + Tailwind config

### `@whats-for-dinner/config`
- **Location**: `packages/config/`
- **Purpose**: Shared configurations
- **Includes**: ESLint config, Tailwind config, TypeScript config base

---

## ?? Data Layer

### Database: Supabase (PostgreSQL)
- **Provider**: Supabase (managed Postgres 15+)
- **Location**: `supabase/migrations/`
- **Schema Management**: SQL migrations (014_ai_system_schema.sql latest)
- **Key Tables**:
  - `ai_health_metrics` - AI system monitoring
  - `ai_embeddings` - Vector embeddings (pgvector)
  - `ai_performance_metrics` - AI usage tracking
  - `ai_cost_analysis` - Cost monitoring
  - `ai_insights`, `ai_performance_reports`, `ai_integrity_reports`
- **RLS (Row Level Security)**: Enabled on all tables
- **Policies**: 
  - `authenticated` users: SELECT access
  - `service_role`: Full CRUD access
- **Functions**:
  - `get_foreign_keys()` - DB integrity checks
  - `exec_sql()` - Dynamic query execution
  - `cleanup_ai_data()` - Automated data retention
  - `get_ai_system_status()` - System health check

### Edge Functions
- **Location**: `supabase/functions/`
- **Deployed**: `search-ai/index.ts` (semantic search via embeddings)

### ORM: Supabase Client
- **Client Library**: `@supabase/supabase-js` v2.76.1
- **Auth Helpers**: `@supabase/auth-helpers-nextjs`, `auth-helpers-react`
- **No Prisma**: Direct Supabase client usage

### Migrations
- **Tool**: Supabase CLI (`supabase db push`)
- **Strategy**: Incremental SQL migrations
- **Idempotency**: Uses `IF NOT EXISTS` and `IF NOT EXISTS` guards
- **Rollback**: Manual via inverse SQL scripts (not automated)

---

## ?? Authentication & Authorization

### Auth Provider: Supabase Auth
- **Flows Supported**:
  - Email/password
  - Magic link
  - OAuth providers (Google, GitHub, etc.)
- **Session Management**: JWT tokens in secure cookies
- **Cookie Settings**: 
  - `httpOnly: true`
  - `sameSite: 'lax'`
  - `secure: true` (production)
- **Auth Helpers**:
  - Next.js: `@supabase/auth-helpers-nextjs`
  - React: `@supabase/auth-helpers-react`
- **Guards**: 
  - Server-side: Middleware in `apps/web/middleware.ts`
  - Client-side: `useAuth()` hook
- **RBAC**: Via RLS policies in Supabase

### Rate Limiting
- **Strategy**: ENV-configured (`RATE_LIMIT_REQUESTS`, `RATE_LIMIT_WINDOW`)
- **Enforcement**: Server-side middleware (to be implemented)

---

## ?? Configuration & Secrets

### Environment Variables
- **Template**: `.env.example` (140 lines, comprehensive)
- **Local Dev**: `.env.local` (gitignored)
- **Production**: Vercel environment variables UI
- **Key Vars**:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `OPENAI_API_KEY` (AI features)
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
  - `SENTRY_DSN`, `NEXT_PUBLIC_GA_ID`
  - `SESSION_SECRET` (cookie signing)

### Feature Flags
- **Location**: `experiments/*.json`
- **Files**:
  - `landing-hero-variant.json`
  - `pantry-quick-start.json`
  - `upgrade-cta-placement.json`
- **Usage**: Server-side or client-side toggles (simple JSON)

### Infrastructure Configs
- **Location**: `config/*.json`
- **Files**:
  - `environments.json` - Dev/staging/prod configs
  - `feature-flags.json` - Feature toggle definitions
  - `cdn.json` - CDN and caching rules
  - `cache-headers.json` - HTTP cache policies
  - `branch-protections.json` - Git workflow rules
  - `backup-monitoring.json`, `disaster-recovery.json`

---

## ?? Testing

### Unit & Integration Tests
- **Web**: Jest 29 + React Testing Library + jsdom
  - Config: `apps/web/jest.config.js`
  - Command: `pnpm test:ci` (with coverage)
- **Mobile**: Jest + jest-expo 52
  - Config: `apps/mobile/jest.config.js`
- **Packages**: Vitest (e.g., `packages/ui/vitest.config.ts`)
- **Coverage Threshold**: None set (needs 70% global minimum)

### E2E Tests
- **Tool**: Playwright
  - Config: `apps/web/playwright.config.ts`
  - Smoke tests: `apps/web/tests/smoke.spec.ts`
  - Command: `pnpm smoke:test`
- **Mobile E2E**: Detox configured (`apps/mobile/package.json`)

### Test Scripts
- `pnpm test` ? All unit tests
- `pnpm test:watch` ? Watch mode
- `pnpm test:ci` ? CI mode with coverage
- `pnpm smoke:test` ? Playwright smoke tests

### Current Coverage
- **Status**: No coverage thresholds enforced
- **Gap**: Missing smoke tests for API routes, auth guards, key UI routes

---

## ?? Styling & Design System

### Web
- **Framework**: Tailwind CSS 3.4
- **Components**: Radix UI primitives + custom components
- **Config**: `apps/web/tailwind.config.js`
- **Plugin**: `tailwindcss-animate` for animations
- **Utility**: `class-variance-authority` for component variants

### Mobile
- **Framework**: NativeWind 4.0 (Tailwind for React Native)
- **Config**: `apps/mobile/tailwind.config.js`
- **Shared Tokens**: `@whats-for-dinner/theme`

### Shared Theme
- **Package**: `@whats-for-dinner/theme`
- **Format**: TypeScript design tokens
- **Includes**: Colors, spacing, typography, breakpoints

---

## ?? Linting & Formatting

### ESLint
- **Version**: 9.x (flat config)
- **Base Configs**:
  - `apps/web/eslint.config.mjs`
  - `apps/mobile/eslint.config.mjs`
  - `packages/config/eslint.config.js`
- **Plugins**:
  - `eslint-plugin-jsx-a11y` (accessibility)
  - `eslint-plugin-prettier` (format integration)
  - `eslint-config-next` (Next.js rules)
  - `eslint-config-expo` (Expo rules)
- **Missing**: `eslint-plugin-security`, import/order rules

### Prettier
- **Config**: `.prettierrc`
- **Settings**:
  - `singleQuote: true`
  - `semi: true`
  - `printWidth: 80`
  - `tabWidth: 2`
- **Plugin**: `prettier-plugin-tailwindcss` (class sorting)

### Scripts
- `pnpm lint` ? Lint all packages
- `pnpm lint:fix` ? Auto-fix issues
- `pnpm format` ? Format all files
- `pnpm format:check` ? Verify formatting

### Pre-commit Hooks
- **Tool**: Husky 9.0.11 (configured in `apps/web`)
- **Staged**: lint-staged runs `prettier` + `eslint --fix` on staged files

---

## ?? Build System

### Turborepo
- **Config**: `turbo.json`
- **Pipelines**:
  - `build` ? Depends on `^build`, outputs `.next/**`, `dist/**`
  - `dev` ? No cache, persistent
  - `lint`, `test`, `type-check` ? Depend on `^build`
- **Caching**: Local + remote (Vercel)

### Build Commands
- `pnpm build` ? Build all apps + packages
- `pnpm build:packages` ? Build shared packages only
- `pnpm build:web` ? Build web app
- `pnpm build:mobile` ? Build mobile app

### Bundle Analysis
- **Script**: `pnpm analyze:bundle`
- **Tool**: `scripts/bundle-report.mjs`
- **Budget Check**: `pnpm bundle:check` (verifies size budgets)

---

## ?? Observability & Monitoring

### Logging
- **Strategy**: Structured logs (needs pino/winston integration)
- **Format**: JSON with request IDs
- **Levels**: error, warn, info, debug (controlled by `LOG_LEVEL`)
- **Current**: Console.log only (needs upgrade)

### Error Tracking
- **Tool**: Sentry
- **Package**: `@sentry/nextjs` v8.55.0
- **Config**: Sentry DSN in env vars
- **Coverage**: Web app only (mobile needs Sentry React Native SDK)

### Analytics
- **Tools**:
  - PostHog (`posthog-js` v1.200.0) - Product analytics
  - Google Analytics (`NEXT_PUBLIC_GA_ID`)
- **Events**: Client-side tracking (needs event catalog)

### Metrics & Traces
- **Status**: Not implemented
- **Needed**: OpenTelemetry for backend metrics (p50/p95 latency, error rate)

### Health Checks
- **Endpoints**: None exposed yet
- **Script**: `pnpm health:check` ? `scripts/healthcheck.js`
- **Checks**: Supabase connectivity, basic DB queries

---

## ?? CI/CD Pipeline

### GitHub Actions
- **Location**: `.github/workflows/`
- **Workflows**:
  1. `ci-cd.yml` (primary pipeline)
     - Lint, type-check, test, build, deploy
     - Security scan (Trivy), bundle check, secrets scan
     - Deploys to Vercel (staging/prod) + Supabase
     - Performance test (Lighthouse), micro-load test (k6)
     - Cost guard, RLS smoke test, DB perf check
  2. `build.yml` - Build verification
  3. `release-pipeline.yml` - Release automation
  4. `vercel-promotion.yml` - Environment promotion
  5. `gap-sprint.yml` - Gap closure automation
  6. `futurecheck.yml` - Dependency staleness check
  7. `watcher-cron.yml` - Scheduled health checks
  8. `dr-drill.yml` - Disaster recovery drill
  9. `ai-audit.yml` - AI system audits

### Deployment Targets
- **Web**: Vercel (staging + production)
- **Mobile**: EAS Build (not in CI yet)
- **Database**: Supabase CLI (`supabase db push`)
- **Infrastructure**: Terraform (`infra/main.tf`)

### Artifacts
- Build artifacts (`.next`, `dist`, `packages/*/dist`)
- Coverage reports (Codecov integration)
- Bundle reports
- Security scan results (SARIF)
- Performance reports (Lighthouse, k6)

### Secrets (GitHub Secrets)
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- `SUPABASE_PROJECT_REF`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `SLACK_WEBHOOK` (deployment notifications)
- `STAGING_URL` (for load tests)

---

## ??? Security

### Current Measures
- **Secrets Scanning**: `scripts/secrets-scan.mjs --check` (runs in CI)
- **Dependency Scanning**: Trivy vulnerability scanner in CI
- **RLS**: Enabled on all Supabase tables
- **Environment**: Separate keys for dev/staging/prod

### Gaps (To Address)
- ? No Gitleaks in CI
- ? CSP headers not verified
- ? Helmet or equivalent not configured
- ? No HSTS, COOP/COEP headers
- ? Rate limiting not implemented
- ? Anti-CSRF tokens not verified (relying on SameSite)
- ? Input validation schema (Zod installed but not comprehensive)

---

## ?? AI/ML Integration

### AI Agents
- **Location**: `ai/*.ts`, `agents/continuous-improvement/`
- **Agents**:
  - `self_diagnose.ts` - Weekly audit of system health
  - `insights_agent.mjs` - Weekly analysis
  - `ai_autoscale.ts` - Daily cost analysis
  - `privacy_guard.ts` - Privacy audit
- **Continuous Improvement**: Agents in `agents/` folder

### AI Features
- **Embedding Generation**: `scripts/generate-embeddings.mjs`
- **Semantic Search**: `supabase/functions/search-ai/index.ts`
- **AI-Powered Docs**: `scripts/generate-docs-ai.mjs`
- **Release Notes**: `scripts/release-notes-ai.mjs`

### Cost Tracking
- **Script**: `scripts/cost-guard.mjs`
- **DB Table**: `ai_cost_analysis`, `ai_performance_metrics`
- **Threshold**: `COST_ALERT_THRESHOLD` env var

---

## ?? External Integrations

### Payment Processing
- **Provider**: Stripe
- **Package**: `stripe` v14.21.0, `@stripe/stripe-js` v2.4.0
- **Webhooks**: `STRIPE_WEBHOOK_SECRET` (signature verification)
- **Usage**: Subscription billing, one-time payments

### Email
- **Provider**: Resend (primary) or SendGrid
- **Package**: `resend` v6.2.2
- **Env Vars**: `RESEND_API_KEY`, `EMAIL_FROM`

### AI/ML APIs
- **Provider**: OpenAI
- **Package**: `openai` v6.7.0
- **Models**: GPT-4 Turbo, embeddings (text-embedding-3-small)
- **Cost Control**: Tracked in `ai_cost_analysis` table

### Notifications
- **Slack**: Webhook integration (`SLACK_WEBHOOK_URL`)
- **Usage**: CI/CD notifications, alert routing

---

## ?? Performance

### Budgets
- **Script**: `scripts/performance-budgets.js`
- **Check**: `pnpm performance:budget` (runs in CI on PRs with `perf-check` label)
- **Targets**: Not explicitly defined (needs 200KB JS per route)

### Lighthouse CI
- **Config**: `whats-for-dinner/lighthouse.config.js`
- **Run**: `pnpm performance:lighthouse`
- **CI Integration**: Runs on staging after deploy

### Bundle Analysis
- **Tool**: `scripts/bundle-report.mjs`
- **Check**: `pnpm bundle:check`
- **Output**: `REPORTS/` directory

### Load Testing
- **Tool**: k6 (micro-load test in CI)
- **Thresholds**: p95 < 700ms, error rate < 10%
- **Trigger**: PRs with `perf-check` label on develop branch

---

## ??? Scripts Inventory

### Root Scripts (`package.json`)
- **Dev**: `dev`, `dev:web`, `dev:mobile`, `dev:doctor`
- **Build**: `build`, `build:packages`, `build:web`, `build:mobile`
- **Test**: `test`, `test:watch`, `test:coverage`, `test:ci`, `smoke:test`
- **Lint/Format**: `lint`, `lint:fix`, `type-check`, `format`, `format:check`
- **Security**: `secrets:scan`, `security:audit`, `supply-chain:audit`
- **Performance**: `performance:audit`, `performance:lighthouse`, `analyze:bundle`
- **DB**: `db:perf`, `rls:test`, `migrate:emc`
- **Health**: `health:check`, `check:all`
- **Deploy**: `deploy:staging`, `deploy:canary`, `deploy:production`
- **AI**: `ai:audit`, `ai:insights`, `ai:cost`, `ai:privacy`, `ai:embeddings`
- **Watchers**: `watcher:db`, `watcher:api`, `watcher:ai`
- **Misc**: `chaos:test`, `backup:run`, `privacy:audit`, `futurecheck`

### Custom Scripts (`scripts/` directory)
- 47 scripts total (29 `.js`, 11 `.mjs`, 6 `.ts`, 1 `.sh`)
- Key scripts:
  - `run-all-checks.mjs` - Master check runner
  - `supply-chain-audit.js` - Dependency audit
  - `bundle-report.mjs` - Bundle analysis
  - `secrets-scan.mjs` - Secret detection
  - `healthcheck.js` - System health
  - `cost-guard.mjs` - Cost monitoring
  - `chaos-testing.js` - Chaos engineering
  - `blind-spot-hunter.js` - Gap analysis

---

## ?? Documentation

### Existing Docs (`docs/` + root)
- **ADRs**: `docs/adr-index.md`, `docs/adr-template.md`
- **API**: `docs/api_reference.md`
- **Architecture**: `docs/architecture_map.md`
- **DR**: `docs/disaster-recovery-procedures.md`
- **Compliance**: `docs/gdpr-compliance.md`
- **Specs**: `docs/specs/*.md` (5 JTBD specs)
- **Runbooks**: `DOCS/RUNBOOKS.md`, `DOCS/PERFORMANCE.md`, `DOCS/SECURITY.md`, `DOCS/SLOs.md`
- **Guides**: 
  - `README.md` (main)
  - `A11Y_GUIDE.md`, `DX_GUIDE.md`, `I18N_README.md`
  - `AI_AUTOMATION_README.md`, `AI_COMPLIANCE.md`
  - `ONBOARDING.md`, `SUSTAINABILITY.md`
- **Summaries**: 
  - `GO_LIVE_READINESS.md`, `GO_LIVE_SUMMARY.md`
  - `ARCHITECTURE_SUMMARY.md`, `ECOSYSTEM_SUMMARY.md`
  - `GAP_CLOSURE_SUMMARY.md`, `PHASE_COMPLETION_SUMMARY.md`
  - `OPTIMIZATION_SUMMARY.md`, `RLS_MIGRATION_SUMMARY.md`
  - `SAFE_RELEASES_SUMMARY.md`, `REPOSITORY_CLEANUP_SUMMARY.md`
- **Deployment**: `PRODUCTION_DEPLOYMENT_RUNBOOK.md`, `DEPLOYMENT_READINESS.md`
- **Reports**: `REPORTS/` (31 files: 24 `.md`, 6 `.json`, 1 `.html`)

### Documentation Gaps
- ? No `docs/observability.md` (needs creation)
- ? No `docs/data-flows.md` (PII classification)
- ? No `analytics/event-catalog.json` (analytics events)
- ? No `docs/analytics.md` (analytics documentation)
- ? No `docs/runbooks/` subdirectory (individual runbooks)
- ? No `docs/go-live-checklist.md` (parseable checklist)

---

## ?? External Dependencies

### Critical Dependencies
- **Next.js**: 16.0.0 (bleeding edge, verify stability)
- **React**: 19.2.0 (RC version, monitor for issues)
- **Expo**: ~52.0.0 (SDK 52)
- **Supabase**: v2.76.1
- **TypeScript**: v5
- **Tailwind CSS**: v3.4.0
- **Stripe**: v14.21.0
- **OpenAI**: v6.7.0
- **Sentry**: v8.55.0

### Development Tools
- **Turborepo**: v1.13.4
- **pnpm**: 9.0.0
- **Prettier**: v3.2.5
- **ESLint**: v9
- **Jest**: v29.7.0
- **Playwright**: v1.40.0
- **Vitest**: (in `packages/ui`)

### Potential Issues
- ?? Next.js 16.0.0 & React 19.2.0 are very new (stability risk)
- ?? No explicit `packageManager` lockfile integrity check in CI
- ?? Multiple ESLint configs (potential conflicts)

---

## ?? Success Metrics (Defined)

### Product/Business Metrics
- **Not Instrumented Yet**
- Proposed: Activation, Conversion, Engagement, Retention, Revenue

### Reliability/Performance Metrics
- **Partial Coverage**:
  - Sentry (error tracking)
  - Lighthouse CI (Core Web Vitals)
  - k6 load tests (p95 latency, error rate)
- **Gaps**:
  - No p50/p95 tracking for API routes
  - No background job success tracking
  - No data freshness SLAs

---

## ?? Go-Live Readiness Status

### ? Ready
1. Monorepo structure with Turborepo
2. TypeScript strict mode enabled
3. CI/CD pipeline (comprehensive)
4. Database with RLS policies
5. Multiple deployment targets
6. Security scanning (Trivy, secrets)
7. Performance testing (Lighthouse, k6)
8. AI automation agents
9. Extensive documentation
10. Cost monitoring

### ?? Needs Attention
1. Coverage thresholds not enforced (need 70% minimum)
2. Input validation not comprehensive (Zod partially implemented)
3. CSP/security headers not verified
4. Rate limiting not implemented
5. HSTS, COOP/COEP headers missing
6. Event catalog for analytics not defined
7. Observability layer incomplete (no OTEL)
8. Rollback procedures not tested

### ? Blockers
1. No Gitleaks in CI/CD (secret scanning in history)
2. No comprehensive smoke tests for auth guards
3. Bundle budgets not explicitly set (200KB target)
4. No structured logging (pino/winston)
5. No health/readiness endpoints exposed
6. No circuit breakers for external APIs
7. Missing runbooks (deploy, rollback, oncall)

---

## ??? Next Steps (Priority Order)

1. **Immediate**: Add missing security headers, Gitleaks, rate limiting
2. **High**: Set coverage thresholds, add smoke tests, define bundle budgets
3. **Medium**: Implement observability (OTEL, structured logs, healthz endpoints)
4. **Medium**: Create analytics event catalog, instrument key flows
5. **Low**: Consolidate ESLint configs, remove legacy `whats-for-dinner/` folder
6. **Low**: Test rollback procedures, create runbooks

---

## ?? Key Contacts & Resources

- **Codeowners**: See `CODEOWNERS` file
- **Slack**: `#deployments` (notifications)
- **Vercel Project**: `VERCEL_PROJECT_ID` secret
- **Supabase Project**: `SUPABASE_PROJECT_REF` secret
- **GitHub Repo**: Current repository

---

**Document Maintained By**: Automated Repo Map Generator  
**Last Updated**: 2025-11-01  
**Status**: Living document - update as architecture evolves

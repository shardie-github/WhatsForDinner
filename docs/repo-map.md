# Repository Map - What's for Dinner

**Generated**: 2025-01-21  
**Purpose**: Comprehensive mapping of application architecture, services, data layer, and operational infrastructure for go-live readiness assessment.

---

## Executive Summary

**Stack**: Monorepo (Turborepo) with Next.js 15 web app, Expo SDK 52 mobile app, Supabase backend, TypeScript, pnpm

**Architecture**: Universal app with shared packages, multi-tenant SaaS, AI-powered recipe generation, analytics/observability layer

**Hosting**: Vercel (web), Expo EAS (mobile), Supabase (backend), GitHub Actions (CI/CD)

---

## 1. Application Surfaces & Entry Points

### 1.1 Web Application (`apps/web/`)
- **Framework**: Next.js 15 with App Router
- **Type**: PWA (Progressive Web App)
- **Entry Point**: `apps/web/src/app/page.tsx`
- **Build Output**: `apps/web/dist/`
- **Key Routes**:
  - `/` - Landing page
  - `/auth/*` - Authentication flows
  - `/pricing` - Pricing page
  - `/partners` - Partner portal
  - `/api/*` - API routes (35 endpoints)

### 1.2 Mobile Application (`apps/mobile/`)
- **Framework**: Expo SDK 52, React Native 0.76.3
- **Entry Point**: `apps/mobile/app/_layout.tsx`
- **Router**: Expo Router 4.0
- **Styling**: NativeWind 4.0

### 1.3 API Endpoints (`apps/web/src/app/api/`)
- `/api/health` - Health check endpoint
- `/api/dinner` - Recipe generation
- `/api/pantry` - Pantry management
- `/api/billing/*` - Stripe integration (checkout, portal)
- `/api/stripe/webhook` - Stripe webhooks
- `/api/observability/*` - Metrics, traces, errors, alerts
- `/api/experiments/*` - A/B testing
- `/api/features/check` - Feature flag checks
- `/api/federation` - Federated gateway
- `/api/partners/*` - Partner revenue/stats

### 1.4 Background Workers/Cron
- **Location**: Supabase Edge Functions (`supabase/functions/`)
- `job-processor/` - Background job queue processor
- `generate-meal/` - Recipe generation worker
- **Watchers**: `watchers/*.ts` - Nightly integrity checks (DB, API contracts, AI performance)

---

## 2. Data Layer

### 2.1 Database (Supabase/PostgreSQL)
- **Client**: `apps/web/src/lib/supabaseClient.ts`
- **Migrations**: `apps/web/supabase/migrations/` (6 files)
  - `001_create_tables.sql` - Core schema
  - `002_analytics_logging_tables.sql` - Analytics & logging
  - `003_multi_tenant_saas_schema.sql` - Multi-tenant tables
  - `004_growth_engine_schema.sql` - Growth metrics
  - `005_federated_ecosystem_schema.sql` - Federation
  - `006_gap_closure_features.sql` - Gap closure features

### 2.2 Core Tables
- **User/Tenant Management**:
  - `profiles` - User profiles
  - `tenants` - Multi-tenant organizations
  - `tenant_memberships` - User-tenant relationships
  - `subscriptions` - Stripe subscription data

- **Core Application**:
  - `pantry_items` - User pantry ingredients
  - `recipes` - Generated recipes
  - `favorites` - User favorite recipes
  - `recipe_feedback` - Recipe ratings/feedback

- **Analytics & Observability**:
  - `analytics_events` - Client-side events
  - `recipe_metrics` - Recipe generation metrics
  - `system_metrics` - System performance metrics
  - `logs` - Structured application logs
  - `error_reports` - Error tracking

- **Growth & Business**:
  - `growth_metrics` - CAC, LTV, MRR, retention, churn
  - `funnel_events` - Conversion funnel tracking
  - `referrals` - Referral program
  - `ab_test_experiments`, `ab_test_variants`, `ab_test_assignments` - A/B testing

- **AI & Workflow**:
  - `ai_config` - AI model configurations
  - `workflow_state` - Workflow orchestration state
  - `churn_predictions` - Churn prediction models
  - `winback_campaigns` - Retention campaigns

- **Marketing & UGC**:
  - `ai_copy_logs` - AI-generated copy variants
  - `social_posts` - Social media posts
  - `ugc_shares` - User-generated content shares

### 2.3 Database Functions (Supabase RPC)
- `get_popular_ingredients(limit_count)` - Popular ingredients analytics
- `get_cuisine_preferences()` - Cuisine preference analytics
- `get_recipe_feedback_summary(recipe_id_param)` - Recipe feedback aggregation
- `update_recipe_feedback(...)` - Recipe feedback update

### 2.4 Row-Level Security (RLS)
- **Migration**: `apps/web/supabase/migrations/014_consolidated_rls_security.sql`
- **Policy Testing**: `scripts/rls-smoke.ts`
- Policies enforce tenant isolation, user data access, and role-based permissions

### 2.5 ORM/Query Layer
- **Library**: `@supabase/supabase-js` (PostgREST client)
- **Type Safety**: TypeScript types generated from schema (`Database` type in `supabaseClient.ts`)

---

## 3. External APIs & Integrations

### 3.1 AI Services
- **OpenAI**: GPT-4 for recipe generation
  - Client: `apps/web/src/lib/openaiClient.ts`
  - Service: `apps/web/src/lib/openaiService.ts`
  - Config: `apps/web/src/lib/aiConfig.ts`
  - Safety: `apps/web/src/lib/aiSafetyGuardrails.ts`

### 3.2 Payment Processing
- **Stripe**: Subscription billing
  - Client: `apps/web/src/lib/stripe.ts`
  - Webhooks: `/api/stripe/webhook/route.ts`
  - Checkout: `/api/billing/checkout/route.ts`
  - Portal: `/api/billing/portal/route.ts`

### 3.3 Email
- **Resend**: Transactional emails
  - Package: `resend@^6.2.2`

### 3.4 Analytics (Client-Side)
- **PostHog**: Product analytics
  - Package: `posthog-js@^1.200.0`

### 3.5 Error Tracking
- **Sentry**: Error monitoring
  - Package: `@sentry/nextjs@^8.55.0`

---

## 4. Configuration & Environment

### 4.1 Environment Variables
- **Template**: `.env.example`
- **Required Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
  - `OPENAI_API_KEY` - OpenAI API key
  - `STRIPE_SECRET_KEY` - Stripe secret key
  - `NEXT_PUBLIC_APP_URL` - Application URL
  - `SENTRY_DSN` - Sentry error tracking DSN

### 4.2 Feature Flags
- **Configuration**: `config/feature-flags.json`
- **Provider**: `packages/utils/src/feature-flags.ts`
- **Runtime Check**: `/api/features/check`

### 4.3 Experiments (A/B Testing)
- **Config**: `experiments/*.json`
  - `landing-hero-variant.json`
  - `pantry-quick-start.json`
  - `upgrade-cta-placement.json`
- **Runtime**: Database-backed (ab_test_experiments table)

---

## 5. Logging, Metrics, & Observability

### 5.1 Structured Logging
- **Logger**: `apps/web/src/lib/logger.ts`
- **Storage**: `logs` table in Supabase
- **Levels**: error, warn, info, debug

### 5.2 Metrics System
- **Monitoring**: `apps/web/src/lib/monitoring.ts`
- **Storage**: `system_metrics` table
- **Types**: api_performance, user_engagement, error_rate, cost_analysis

### 5.3 Distributed Tracing
- **System**: `apps/web/src/lib/observability.ts`
- **Storage**: `traces`, `trace_spans` tables (implied from code)
- **Utilities**: `withTrace()`, `withSpan()`, `trackError()`

### 5.4 Health Checks
- **System**: `apps/web/src/lib/healthCheck.ts`
- **Endpoint**: `/api/health`
- **Checks**: Database, API endpoints, external services, security systems, performance, monitoring, AI services, storage, network, system resources

### 5.5 Analytics Events
- **Service**: `apps/web/src/lib/analytics.ts`
- **Storage**: `analytics_events` table
- **Client-Side**: Session tracking, user tracking, event properties

---

## 6. Authentication & Authorization

### 6.1 Authentication
- **Provider**: Supabase Auth
- **Helpers**: `@supabase/auth-helpers-nextjs`, `@supabase/auth-helpers-react`
- **Flow**: Email/password, OAuth (via Supabase)

### 6.2 Authorization Model
- **Multi-Tenant**: Tenant-based isolation via RLS
- **Roles**: owner, editor, viewer (per tenant)
- **Enforcement**: RLS policies + application-level checks

---

## 7. Shared Packages

### 7.1 UI Components (`packages/ui/`)
- **Cross-platform**: Works on web and mobile
- **Radix UI**: Base components
- **Tailwind/NativeWind**: Styling

### 7.2 Utilities (`packages/utils/`)
- **Hooks**: `usePantry`, `useRecipes`, `useFavorites`, `useTenant`
- **Feature Flags**: Runtime flag checking
- **Common utilities**: `cn()` (className merge)

### 7.3 Theme (`packages/theme/`)
- **Design System**: Shared theme tokens

### 7.4 Config (`packages/config/`)
- **ESLint**: Shared linting config
- **Tailwind**: Shared Tailwind config

---

## 8. Testing Infrastructure

### 8.1 Unit Tests
- **Framework**: Jest
- **Config**: `apps/web/jest.config.js`, `apps/web/jest.setup.js`
- **Location**: `apps/web/src/**/__tests__/`, `apps/web/src/__tests__/`
- **Coverage**: `test:coverage` script

### 8.2 E2E Tests
- **Framework**: Playwright
- **Config**: `apps/web/playwright.config.ts`
- **Location**: `apps/web/tests/`
- **Smoke Tests**: `tests/smoke.spec.ts`
- **Security Tests**: `tests/e2e/security.spec.ts`

### 8.3 Accessibility Tests
- **Script**: `scripts/a11y-test.js`
- **Framework**: axe-core (implied)

### 8.4 Test Coverage
- **Thresholds**: Defined in Jest config
- **CI**: `test:ci` runs with coverage
- **Upload**: Codecov integration in CI

---

## 9. Build & Bundle

### 9.1 Build System
- **Monorepo**: Turborepo (`turbo.json`)
- **Package Manager**: pnpm 9.0.0
- **Node Version**: 18.0.0 - 20.x (engines)

### 9.2 Build Scripts
- `build:packages` - Build shared packages
- `build:web` - Build Next.js web app
- `build:mobile` - Build Expo mobile app
- `build` - Build all

### 9.3 Bundle Analysis
- **Script**: `scripts/bundle-report.mjs`
- **Command**: `analyze:bundle`, `bundle:check`
- **Output**: Reports in `REPORTS/`

### 9.4 Code Splitting
- **Framework**: Next.js automatic code splitting
- **Package Imports**: Optimized via `optimizePackageImports` in `next.config.ts`

---

## 10. Linting & Formatting

### 10.1 ESLint
- **Config**: Shared via `packages/config/` or app-specific
- **Framework Config**: `eslint-config-next@15.0.0`
- **Security Plugin**: `eslint-plugin-security` (to be verified)
- **A11y Plugin**: `eslint-plugin-jsx-a11y@^6.8.0`

### 10.2 Prettier
- **Config**: Root-level Prettier config
- **Plugins**: `prettier-plugin-tailwindcss`
- **Scripts**: `format`, `format:check`

### 10.3 TypeScript
- **Config**: `tsconfig.json` (root), `apps/web/tsconfig.json`
- **Mode**: Strict (`strict: true`)
- **Additional Checks**: `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`
- **Type Check Script**: `type-check`

---

## 11. CI/CD Pipeline

### 11.1 GitHub Actions Workflows
- **Location**: `.github/workflows/`
- **Main CI**: `.github/workflows/ci-cd.yml`
  - Jobs: lint-and-typecheck, test, build, deploy-staging, deploy-production, security-scan, performance-test, cost-guard, notify

### 11.2 CI Stages
1. **Lint & Type Check**: ESLint + TypeScript
2. **Tests**: Jest + Playwright + RLS smoke tests + DB perf checks + health checks
3. **Build**: All packages + apps
4. **Security Scan**: Trivy vulnerability scanner
5. **Performance Test**: Lighthouse CI
6. **Deploy**: Vercel (web), Supabase (DB), Terraform (infra)

### 11.3 Deployment Environments
- **Staging**: `develop` branch ? Vercel staging
- **Production**: `main` branch ? Vercel production
- **Mobile**: EAS Build (manual or via CI)

---

## 12. Security Infrastructure

### 12.1 Secrets Management
- **Scanning**: `scripts/secrets-scan.mjs` (`secrets:scan`)
- **Validation**: `apps/web/src/lib/secretsManager.ts`, `apps/web/src/lib/secretsIntelligence.ts`
- **Rotation**: Scripts in `whats-for-dinner/scripts/security/`

### 12.2 Security Headers
- **Validation**: `security:headers` script
- **Middleware**: Next.js middleware (`apps/web/src/middleware.ts`)

### 12.3 Security Testing
- **Audit Scripts**: `scripts/security-scan.js`, `apps/web/scripts/generate-security-audit.js`
- **Tests**: `apps/web/src/__tests__/security.test.ts`

### 12.4 RLS & Data Security
- **RLS Policies**: Enforced via Supabase migrations
- **Testing**: `scripts/rls-smoke.ts` (`rls:test`)

---

## 13. Performance & Optimization

### 13.1 Performance Monitoring
- **Scripts**: `performance:audit`, `performance:lighthouse`, `performance:budget`
- **Monitoring**: `apps/web/src/lib/performanceOptimizer.ts`
- **Metrics**: Stored in `system_metrics` (api_performance type)

### 13.2 Performance Budgets
- **Script**: `scripts/performance-budgets.js`
- **Check**: `performance:budget`

### 13.3 Lighthouse CI
- **Config**: `whats-for-dinner/lighthouse.config.js`
- **CI Job**: Runs on staging deployments

### 13.4 Bundle Size Monitoring
- **Script**: `scripts/bundle-report.mjs`
- **Commands**: `analyze:bundle`, `bundle:check`

---

## 14. Documentation

### 14.1 Operational Docs
- `PRODUCTION_DEPLOYMENT_RUNBOOK.md`
- `GO_LIVE_READINESS.md`
- `OBSERVABILITY.md`
- `SECURITY_CHECKLIST.md`
- `SLOs.md`
- `DOCS/RUNBOOKS.md`

### 14.2 Architecture Docs
- `ARCHITECTURE_SUMMARY.md`
- `docs/architecture_map.md`
- `docs/api_reference.md`

### 14.3 Developer Docs
- `README.md`
- `DX_GUIDE.md`
- `ONBOARDING.md`

---

## 15. Infrastructure as Code

### 15.1 Terraform
- **Location**: `infra/main.tf`
- **Deployment**: Via CI/CD on production merges

---

## 16. Current Test Coverage & Gaps

### 16.1 Coverage
- Unit tests: Jest (some coverage)
- E2E tests: Playwright smoke tests
- Integration: RLS smoke tests, DB perf checks
- Accessibility: Script exists (`scripts/a11y-test.js`)

### 16.2 Gaps (To Address)
- **Coverage Thresholds**: Need to verify/establish minimum thresholds (target: 70%)
- **API Endpoint Tests**: Need comprehensive tests for all 35 API routes
- **RLS Policy Tests**: Need tests for each policy path
- **E2E Coverage**: Expand beyond smoke tests to critical user flows
- **Accessibility CI**: Integrate axe/pa11y into CI pipeline

---

## 17. Lint/Format Setup Status

### 17.1 Current Status
- ? ESLint configured (flat config)
- ? Prettier configured
- ? TypeScript strict mode enabled
- ? CI gates on lint, format, type-check
- ?? Security ESLint plugin: Need to verify presence
- ?? Import/order rules: Need to verify configuration

### 17.2 Scripts
- `lint` - Run ESLint
- `lint:fix` - Auto-fix ESLint issues
- `format` - Format with Prettier
- `format:check` - Check formatting
- `type-check` - TypeScript type checking

---

## 18. Known Dependencies

### 18.1 Core Dependencies
- `next@16.0.0` - Next.js framework
- `react@19.2.0` - React library
- `@supabase/supabase-js@^2.76.1` - Supabase client
- `@tanstack/react-query@^5.17.0` - Data fetching
- `zod@^3.22.4` - Schema validation
- `stripe@^14.21.0` - Stripe SDK
- `openai@^6.7.0` - OpenAI SDK

### 18.2 Dev Dependencies
- `typescript@^5` - TypeScript compiler
- `jest@^29.7.0` - Test framework
- `@playwright/test@^1.40.0` - E2E testing
- `eslint@^9` - Linting
- `prettier@^3.2.5` - Code formatting
- `turbo@^1.13.4` - Monorepo build system

---

## 19. Entry Points Summary

| Surface | Entry Point | Build Output |
|---------|------------|--------------|
| Web App | `apps/web/src/app/page.tsx` | `apps/web/dist/` |
| Mobile App | `apps/mobile/app/_layout.tsx` | EAS Build |
| API Routes | `apps/web/src/app/api/**/route.ts` | Serverless functions |
| Edge Functions | `supabase/functions/**/index.ts` | Supabase Edge Runtime |

---

## 20. Data Flows

### 20.1 Recipe Generation Flow
1. User submits pantry items ? `/api/dinner`
2. API calls OpenAI ? Recipe generated
3. Recipe stored in `recipes` table
4. Metrics logged to `recipe_metrics`
5. Analytics event tracked ? `analytics_events`

### 20.2 Authentication Flow
1. User authenticates via Supabase Auth
2. Profile created/updated in `profiles`
3. Tenant membership checked/created in `tenant_memberships`
4. Session tracked in analytics

### 20.3 Subscription Flow
1. User selects plan ? `/api/billing/checkout`
2. Stripe checkout session created
3. Webhook received ? `/api/stripe/webhook`
4. Subscription record created in `subscriptions`
5. Tenant plan updated in `tenants`

---

## Next Steps for Go-Live

1. ? **Repo Map Created** (this document)
2. ? Verify dependency hygiene
3. ? Enhance test coverage (70% threshold)
4. ? Security hardening (gitleaks, headers, CSP)
5. ? RLS policy testing
6. ? Observability documentation
7. ? Success metrics instrumentation
8. ? Feature flags implementation
9. ? CI/CD enhancement (deployment verification)
10. ? A11y & SEO audit
11. ? Runbooks creation
12. ? Release PR generation

---

*This repo map is a living document. Update as architecture evolves.*

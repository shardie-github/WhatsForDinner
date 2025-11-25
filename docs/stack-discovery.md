# Stack Discovery & Architecture Analysis

**Generated:** $(date)  
**Agent:** Unified Background Agent v3.0  
**Status:** Complete Diagnostic

---

## Executive Summary

**What's for Dinner** is a production-grade meal planning application built as a monorepo using modern web technologies. The system demonstrates sophisticated architecture with multiple deployment targets, comprehensive CI/CD, and enterprise-level features.

### Key Metrics
- **Monorepo Structure:** Turborepo-powered workspace
- **Frontend:** Next.js 16 (React 19) + React Native (Expo SDK 52)
- **Backend:** Supabase (PostgreSQL) + Prisma ORM
- **Deployment:** Vercel (Web) + EAS Build (Mobile)
- **CI/CD:** 40+ GitHub Actions workflows
- **Language:** TypeScript (strict mode enabled)
- **Package Manager:** pnpm 9.0.0

---

## 1. Architecture Overview

### 1.1 Monorepo Structure

```
whats-for-dinner-monorepo/
├── apps/
│   ├── web/              # Next.js 16 web application (main app)
│   ├── mobile/           # React Native mobile app
│   ├── api-docs/        # API documentation portal
│   ├── chef-marketplace/ # Chef marketplace feature
│   ├── community-portal/ # Community features
│   └── referral/        # Referral program app
├── packages/
│   ├── ui/              # Shared UI components (Radix UI based)
│   ├── utils/           # Shared utilities and hooks
│   ├── theme/           # Design system and theming
│   ├── config/          # Configuration management
│   ├── server/          # Server-side utilities and jobs
│   ├── analytics/       # Analytics integration
│   ├── adapters/        # External service adapters
│   └── testing/         # Testing utilities and fixtures
├── scripts/             # Automation scripts (200+ files)
├── ops/                 # Operations and deployment tooling
├── infra/               # Infrastructure as code
├── supabase/            # Supabase migrations and functions
└── docs/                # Documentation
```

### 1.2 Technology Stack

#### Frontend
- **Framework:** Next.js 16.0.0 (App Router)
- **React:** 19.2.0
- **Styling:** Tailwind CSS + NativeWind
- **UI Components:** Radix UI primitives
- **State Management:** TanStack Query (React Query)
- **Mobile:** React Native + Expo SDK 52 + Capacitor 7

#### Backend
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma 5.22.0 (WASM engine for Termux compatibility)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime
- **API:** Next.js API Routes + Supabase Edge Functions

#### Infrastructure
- **Hosting:** Vercel (Web), EAS Build (Mobile)
- **CI/CD:** GitHub Actions (40+ workflows)
- **Monitoring:** Sentry, PostHog, Custom observability
- **Analytics:** PostHog, Mixpanel, Google Analytics
- **Payments:** Stripe, LemonSqueezy
- **Email:** Resend, SendGrid

#### Development Tools
- **Monorepo:** Turborepo 1.13.4
- **Package Manager:** pnpm 9.0.0
- **TypeScript:** 5.x (strict mode)
- **Linting:** ESLint 9
- **Testing:** Jest, Vitest, Playwright
- **Formatting:** Prettier

---

## 2. Data Flow Architecture

### 2.1 Request Flow

```
User (Browser/Mobile)
  ↓
Next.js App Router (apps/web)
  ↓
API Routes (/api/*)
  ↓
Supabase Client (Auth + Database)
  ↓
PostgreSQL Database
  ↓
Prisma ORM (Type-safe queries)
```

### 2.2 Authentication Flow

```
1. User authenticates via Supabase Auth
2. JWT token stored in httpOnly cookie
3. Server-side middleware validates token
4. Row-Level Security (RLS) enforces permissions
5. Prisma queries filtered by user context
```

### 2.3 Real-time Updates

```
Supabase Realtime
  ↓
WebSocket connection
  ↓
React Query subscriptions
  ↓
UI auto-updates
```

---

## 3. Database Schema

### 3.1 Core Tables

- **users** - User accounts and preferences
- **households** - Multi-user household management
- **household_members** - User-household relationships
- **recipes** - Recipe storage (curated, partner, user-generated)
- **meal_plans** - Daily meal planning
- **grocery_lists** - Shopping list management
- **health_metrics** - Health tracking data
- **rooms** - Chat/messaging rooms
- **messages** - Chat messages

### 3.2 Growth & Monetization Tables

- **referral_programs** - Referral program configuration
- **referral_codes** - User referral codes
- **referrals** - Referral tracking
- **email_subscriptions** - Email marketing
- **ad_impressions** - Ad tracking
- **events** - Analytics events

### 3.3 Privacy & Compliance Tables

- **privacy_prefs** - User privacy preferences
- **app_allowlist** - Third-party app permissions
- **signal_toggles** - Telemetry controls
- **telemetry_events** - Privacy-compliant telemetry
- **privacy_transparency_log** - Audit trail
- **mfa_enforced_sessions** - MFA session management
- **dsar_requests** - GDPR data subject access requests

### 3.4 Schema Characteristics

- **UUID Primary Keys:** All tables use UUIDs
- **Timestamps:** Created/updated timestamps on all tables
- **JSONB Fields:** Flexible JSON storage for preferences, metadata
- **Indexes:** Strategic indexes on foreign keys and query patterns
- **RLS Policies:** Row-Level Security on all user-scoped tables

---

## 4. API Endpoints

### 4.1 Core APIs

**User Management**
- `GET /api/user/me` - Get current user
- `POST /api/user/me` - Update user profile

**Recipes**
- `GET /api/v2/recipes` - List/search recipes
- `POST /api/recipes/generate-image` - Generate recipe images
- `POST /api/recipes/customize` - Customize recipes

**Meal Planning**
- `GET /api/dinner` - Get meal suggestions
- `POST /api/meal-plans` - Create meal plan

**Pantry**
- `POST /api/pantry/seed-sample` - Seed sample pantry items

### 4.2 Privacy & Compliance APIs

- `GET /api/privacy/prefs` - Get privacy preferences
- `POST /api/privacy/prefs` - Update privacy preferences
- `POST /api/privacy/export` - Export user data (GDPR)
- `POST /api/privacy/erase` - Delete user data (GDPR)
- `GET /api/privacy/apps` - List connected apps
- `POST /api/privacy/log` - Privacy transparency log
- `POST /api/privacy/mfa/verify` - MFA verification

### 4.3 Growth & Monetization APIs

- `GET /api/programs/analytics` - Referral analytics
- `POST /api/programs/track` - Track referral events
- `POST /api/programs/attribution` - Attribution tracking
- `POST /api/programs/rewards/distribute` - Distribute rewards
- `GET /api/partners/stats` - Partner statistics
- `GET /api/partners/revenue` - Revenue data
- `POST /api/partners/v1/recipes` - Partner recipe API
- `POST /api/partners/v1/nutrition` - Nutrition API
- `POST /api/partners/v1/meal-plans` - Meal plan API

### 4.4 Observability APIs

- `GET /api/observability/health` - Health check
- `GET /api/observability/metrics` - Metrics endpoint
- `GET /api/observability/traces` - Trace data
- `GET /api/observability/errors` - Error logs
- `GET /api/observability/report` - Observability report
- `GET /api/observability/dashboard` - Dashboard data

### 4.4 Developer APIs

- `GET /api/developers/keys` - List API keys
- `POST /api/developers/keys` - Create API key
- `DELETE /api/developers/keys/[id]` - Revoke API key
- `GET /api/developers/usage` - API usage stats

---

## 5. Environment Variables

### 5.1 Core Configuration (Required)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL

# App
NEXT_PUBLIC_APP_URL
NODE_ENV
```

### 5.2 Optional Services

- **OpenAI:** `OPENAI_API_KEY` - AI meal generation
- **Stripe:** `STRIPE_SECRET_KEY` - Payments
- **Resend:** `RESEND_API_KEY` - Email
- **Sentry:** `NEXT_PUBLIC_SENTRY_DSN` - Error tracking
- **PostHog:** `NEXT_PUBLIC_POSTHOG_KEY` - Analytics
- **Redis:** `REDIS_URL` - Caching (optional)

### 5.3 Environment Variable Count

- **Total Variables:** 100+ (comprehensive .env.example)
- **Required:** ~10 core variables
- **Optional:** 90+ service integrations

---

## 6. CI/CD Pipeline

### 6.1 Primary Workflows

**ci.yml** - Main CI pipeline
- Lint
- Type check
- Tests
- Smoke tests
- Build
- Test coverage (80% threshold)
- Code hygiene checks

**frontend-deploy.yml** - Frontend deployment
- Build and test
- Deploy preview (PRs)
- Deploy production (main branch)

**supabase-migrate.yml** - Database migrations
- Validate migrations
- Apply to staging/production

### 6.2 Specialized Workflows (40+ total)

- **security.yml** - Security scanning
- **performance-monitoring.yml** - Performance tests
- **e2e.yml** - End-to-end tests
- **nightly.yml** - Nightly maintenance
- **watcher-cron.yml** - Automated watchers
- **reliability-orchestrator.yml** - Reliability checks
- And 30+ more specialized workflows

### 6.3 Deployment Strategy

- **Preview Deployments:** Every PR gets a preview URL
- **Production Deployments:** Automatic on merge to main
- **Database Migrations:** Separate workflow, applied after validation
- **Zero Manual Steps:** Fully automated CI/CD

---

## 7. Dependency Analysis

### 7.1 High-Gravity Packages

**Frontend Core**
- `next` - Framework
- `react`, `react-dom` - UI library
- `@supabase/supabase-js` - Backend client
- `@tanstack/react-query` - Data fetching

**UI Components**
- `@radix-ui/*` - Accessible primitives
- `tailwindcss` - Styling
- `lucide-react` - Icons

**Backend**
- `@prisma/client` - Database ORM
- `zod` - Schema validation
- `stripe` - Payments

### 7.2 Package Count

- **Dependencies:** ~50 (production)
- **Dev Dependencies:** ~40 (development)
- **Total Packages:** ~90 (excluding transitive)

---

## 8. Security Posture

### 8.1 Security Features

✅ **Row-Level Security (RLS)** - Database-level access control  
✅ **JWT Authentication** - Secure token-based auth  
✅ **MFA Support** - Multi-factor authentication  
✅ **GDPR Compliance** - Data export/deletion  
✅ **Privacy Controls** - Granular user preferences  
✅ **Secrets Management** - No hardcoded secrets  
✅ **Security Headers** - HSTS, CSP, X-Frame-Options  
✅ **Input Validation** - Zod schema validation  
✅ **SQL Injection Protection** - Prisma ORM  
✅ **CSRF Protection** - Next.js built-in  

### 8.2 Security Scanning

- Automated security audits in CI
- Dependency vulnerability scanning
- Secrets scanning
- Penetration testing scripts

---

## 9. Performance Characteristics

### 9.1 Performance Targets

- **LCP:** < 2.5s (Largest Contentful Paint)
- **CLS:** < 0.1 (Cumulative Layout Shift)
- **FID:** < 100ms (First Input Delay)
- **Bundle Size:** < 170KB (JavaScript)
- **TTFB:** < 500ms (Time to First Byte)

### 9.2 Optimizations

- **Code Splitting** - Automatic route-based splitting
- **Image Optimization** - Next.js Image component
- **Bundle Analysis** - Automated bundle size monitoring
- **Caching** - Redis (optional) + HTTP caching
- **CDN** - Vercel Edge Network

---

## 10. Testing Strategy

### 10.1 Test Types

- **Unit Tests** - Jest + Testing Library
- **Integration Tests** - API route tests
- **E2E Tests** - Playwright
- **Accessibility Tests** - pa11y-ci
- **Performance Tests** - Lighthouse CI
- **Contract Tests** - OpenAPI validation

### 10.2 Coverage

- **Target:** 80% coverage threshold
- **Enforced:** CI blocks merges below threshold
- **Reporting:** Codecov integration

---

## 11. Observability & Monitoring

### 11.1 Monitoring Stack

- **Error Tracking:** Sentry
- **Analytics:** PostHog, Mixpanel
- **Performance:** Custom observability APIs
- **Logging:** Structured logging
- **Metrics:** Prometheus (optional)
- **Tracing:** OpenTelemetry (optional)

### 11.2 Health Checks

- `/api/health` - Basic health check
- `/api/observability/health` - Detailed health
- `/status` - Public status page

---

## 12. Risk Heatmap

### 🔴 High Risk Areas

1. **Migration Fragmentation**
   - Multiple migration directories (`apps/web/supabase/migrations`, `supabase/migrations`, `whats-for-dinner/supabase/migrations`)
   - Risk: Schema drift, migration conflicts
   - Action: Consolidate migrations

2. **Environment Variable Complexity**
   - 100+ environment variables
   - Risk: Missing vars, misconfiguration
   - Action: Create env-doctor script, canonicalize vars

3. **CI/CD Workflow Proliferation**
   - 40+ workflows
   - Risk: Maintenance burden, conflicting triggers
   - Action: Audit and consolidate workflows

### 🟡 Medium Risk Areas

1. **API Endpoint Discovery**
   - 366+ API route files
   - Risk: Undocumented endpoints, inconsistent patterns
   - Action: Generate OpenAPI spec, document all endpoints

2. **Dependency Management**
   - Large dependency tree
   - Risk: Security vulnerabilities, bundle bloat
   - Action: Regular audits, remove unused deps

3. **TypeScript Strictness**
   - Some `any` types may exist
   - Risk: Runtime errors
   - Action: Enable stricter checks, fix type errors

### 🟢 Low Risk Areas

1. **Architecture** - Well-structured monorepo
2. **Security** - Comprehensive security features
3. **Testing** - Good test coverage strategy
4. **Documentation** - Extensive docs directory

---

## 13. Recommendations

### Immediate Actions (Priority 1)

1. ✅ **Consolidate Database Migrations**
   - Unify migration directories
   - Create baseline migration
   - Validate schema consistency

2. ✅ **Create Environment Variable Doctor**
   - Script to validate env vars
   - Detect missing/unused vars
   - Generate canonical .env.example

3. ✅ **Generate OpenAPI Documentation**
   - Discover all API endpoints
   - Generate OpenAPI spec
   - Create API documentation

4. ✅ **Fix TypeScript Errors**
   - Run type check
   - Fix all errors
   - Enable stricter checks

### Short-term Improvements (Priority 2)

1. **Audit CI/CD Workflows**
   - Identify redundant workflows
   - Consolidate similar workflows
   - Optimize workflow triggers

2. **Dependency Cleanup**
   - Remove unused dependencies
   - Update outdated packages
   - Audit security vulnerabilities

3. **Performance Optimization**
   - Bundle size analysis
   - Code splitting improvements
   - Image optimization audit

### Long-term Enhancements (Priority 3)

1. **Architecture Documentation**
   - Complete architecture diagrams
   - Data flow documentation
   - Decision records

2. **Developer Experience**
   - Improve onboarding docs
   - Create development scripts
   - Enhance local setup

3. **Observability Enhancement**
   - Expand metrics collection
   - Improve error tracking
   - Add performance monitoring

---

## 14. Completeness Checklist

- [x] Architecture documented
- [x] Data flow mapped
- [x] Database schema analyzed
- [x] API endpoints discovered
- [x] Environment variables cataloged
- [x] CI/CD workflows analyzed
- [x] Dependencies mapped
- [x] Security posture assessed
- [x] Performance targets defined
- [x] Testing strategy documented
- [x] Observability stack identified
- [x] Risks identified
- [x] Recommendations provided

---

**Next Steps:** Proceed with systematic improvements per Unified Background Agent modes.

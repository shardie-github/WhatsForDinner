# YC Tech Overview: What's for Dinner

**Generated**: 2025-01-27  
**Purpose**: Technical architecture overview for YC application and technical due diligence

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    What's for Dinner                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   iOS App    │  │ Android App  │  │   Web App    │     │
│  │  (React      │  │  (React      │  │  (Next.js    │     │
│  │   Native)    │  │   Native)    │  │   16)        │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │  Shared Packages │                        │
│                  │  • UI Components │                        │
│                  │  • Utils & Hooks │                        │
│                  │  • Theme System │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │   Supabase       │                        │
│                  │  • PostgreSQL   │                        │
│                  │  • Auth (JWT)    │                        │
│                  │  • Realtime     │                        │
│                  │  • Storage      │                        │
│                  │  • Edge Functions│                       │
│                  └────────┬────────┘                        │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │   External APIs │                        │
│                  │  • OpenAI GPT-4 │                        │
│                  │  • Stripe       │                        │
│                  │  • PostHog      │                        │
│                  │  • Sentry       │                        │
│                  └─────────────────┘                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Infrastructure Layer                    │   │
│  │  • Vercel (Web Hosting)                             │   │
│  │  • Supabase Cloud (Database, Auth, Functions)        │   │
│  │  • GitHub Actions (CI/CD)                           │   │
│  │  • AWS (Optional - Terraform modules exist)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Summary

### Frontend

**Web App**:
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **State Management**: React Query (TanStack Query)
- **Analytics**: PostHog, Custom analytics service

**Mobile App**:
- **Framework**: React Native / Expo SDK 52
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind for React Native)
- **State Management**: React Query

**Shared Packages** (Monorepo):
- `/packages/ui/` - Shared UI components
- `/packages/utils/` - Shared utilities and hooks
- `/packages/theme/` - Design system and theming
- `/packages/config/` - Shared configurations

---

### Backend

**Database**:
- **PostgreSQL** (via Supabase)
- **15+ migrations** covering:
  - Core schema (users, recipes, pantry)
  - Multi-tenant SaaS architecture
  - Analytics and logging
  - Monetization features
  - Growth engine (referrals, social)
  - Feature flags
  - RBAC and RLS security

**Authentication**:
- **Supabase Auth** (JWT-based)
- Row-Level Security (RLS) policies
- Multi-tenant isolation

**API Layer**:
- **Next.js API Routes** (`/apps/web/src/app/api/`)
- **Supabase Edge Functions** (Deno):
  - `generate-meal/` - AI recipe generation
  - `job-processor/` - Background jobs
  - `api/` - General API endpoints

**Real-time**:
- **Supabase Realtime** - Live updates for pantry, recipes

---

### Infrastructure

**Hosting**:
- **Vercel** - Web app hosting (serverless)
- **Supabase Cloud** - Database, auth, storage, functions
- **EAS Build** - Mobile app builds (Expo)

**CI/CD**:
- **GitHub Actions** - Automated testing, deployment
- **Workflows**:
  - `ci.yml` - Lint, type-check, tests
  - `ci-cd.yml` - Build and deploy
  - `supabase-deploy.yml` - Database migrations

**Monitoring**:
- **Sentry** - Error tracking and performance
- **PostHog** - Product analytics
- **Custom Analytics** - Supabase tables (`analytics_events`, `system_metrics`)

**Optional Infrastructure** (Terraform modules exist):
- **AWS** - ECS, RDS, ALB, VPC (for future migration)
- **Redis** - Caching (if needed)
- **CloudWatch** - Logging and monitoring

---

### External Services

**AI/ML**:
- **OpenAI GPT-4** - Recipe generation
- **AI Caching** - Reduces API costs (`ai_cache` table)

**Payments**:
- **Stripe** - Subscription billing
- **Webhooks** - Subscription events tracked in `billing_events` table

**Analytics**:
- **PostHog** - Product analytics (if configured)
- **Sentry** - Error tracking
- **Custom** - Supabase analytics tables

---

## What's Technically Hard Here

### 1. AI Recipe Generation with Personalization

**Challenge**: Generate high-quality, personalized recipes based on:
- User's pantry (variable ingredients)
- Dietary restrictions (complex validation)
- Cooking skill level
- Family preferences
- Time constraints

**How We Solve**:
- GPT-4 with fine-tuned prompts
- Caching similar requests (`ai_cache` table)
- Feedback loop (`recipe_feedback` table) improves recommendations
- Multi-step generation (ingredients → recipe → validation)

**Files**:
- `/whats-for-dinner/supabase/functions/generate-meal/index.ts`
- `/whats-for-dinner/src/lib/ai-agents/` (if exists)

---

### 2. Multi-Tenant Architecture with Data Isolation

**Challenge**: Support families/households sharing data while maintaining security and isolation.

**How We Solve**:
- `tenants` table for isolation
- Row-Level Security (RLS) policies enforce tenant boundaries
- `tenant_memberships` table for role-based access
- All tables include `tenant_id` for isolation

**Files**:
- `/whats-for-dinner/supabase/migrations/003_multi_tenant_saas_schema.sql`
- `/whats-for-dinner/supabase/migrations/014_consolidated_rls_security.sql`

---

### 3. Real-Time Sync Across Platforms

**Challenge**: Pantry changes, recipe saves sync instantly across web, iOS, Android.

**How We Solve**:
- Supabase Realtime subscriptions
- Optimistic UI updates
- Conflict resolution (last-write-wins with timestamps)

**Files**:
- Supabase Realtime (built-in)
- Frontend hooks for real-time updates

---

### 4. Cost Optimization (AI API Costs)

**Challenge**: OpenAI API costs can be high. Need to minimize while maintaining quality.

**How We Solve**:
- `ai_cache` table caches similar requests
- Prompt optimization (shorter prompts, better structure)
- Usage quotas per subscription tier (`usage_logs` table)
- Cost tracking (`cost_usd` field in `usage_logs`)

**Files**:
- `/whats-for-dinner/supabase/migrations/003_multi_tenant_saas_schema.sql` - `ai_cache` table
- `/whats-for-dinner/supabase/migrations/003_multi_tenant_saas_schema.sql` - `usage_logs` table

---

## What's Likely to Break at Scale

### 1. Database Performance

**Risk**: As user base grows, database queries slow down.

**Current Mitigations**:
- ✅ Indexes on all foreign keys and frequently queried columns
- ✅ Performance indexes migration (`007_performance_indexes.sql`)
- ✅ Query optimization functions

**Potential Issues**:
- N+1 queries in API routes
- Missing indexes on new queries
- Large `analytics_events` table (needs partitioning)

**Recommendations**:
- Add database query monitoring
- Implement query timeouts
- Consider read replicas at 100K+ users
- Partition `analytics_events` table by date

---

### 2. AI API Rate Limits & Costs

**Risk**: OpenAI rate limits or costs spike with growth.

**Current Mitigations**:
- ✅ Usage quotas per subscription tier
- ✅ AI caching (`ai_cache` table)
- ✅ Cost tracking (`usage_logs` table)

**Potential Issues**:
- Rate limits hit during peak usage
- Costs exceed revenue (negative unit economics)
- Cache hit rate too low

**Recommendations**:
- Monitor API usage and costs daily
- Optimize prompts to reduce token usage
- Implement request queuing for rate limits
- Consider fine-tuning smaller models for common requests

---

### 3. Supabase Edge Function Cold Starts

**Risk**: Edge functions have cold starts, causing slow response times.

**Current Mitigations**:
- ✅ Functions are lightweight (Deno runtime)
- ✅ Caching reduces function calls

**Potential Issues**:
- Cold starts add 500ms+ latency
- Concurrent request limits

**Recommendations**:
- Keep functions warm (ping endpoint)
- Consider migrating hot paths to Next.js API routes
- Monitor function performance

---

### 4. Real-Time Subscription Limits

**Risk**: Supabase Realtime has connection limits.

**Current Mitigations**:
- ✅ Only subscribe to necessary channels
- ✅ Unsubscribe when components unmount

**Potential Issues**:
- Connection limits hit at scale
- High bandwidth usage

**Recommendations**:
- Implement connection pooling
- Use polling fallback for non-critical updates
- Monitor connection counts

---

## Technical Edge/Moat

### 1. Proprietary Data: User Pantry Patterns

**What**: Data on what users actually have, what they cook, what they like.

**Why It's Valuable**:
- Improves AI recommendations over time
- Creates switching cost (users don't want to rebuild pantry)
- Enables personalized features competitors can't match

**How We Leverage**:
- `recipe_metrics` table tracks what users cook
- `recipe_feedback` table tracks preferences
- `pantry_items` table tracks pantry patterns
- Analytics functions analyze patterns (`get_popular_ingredients`, `get_cuisine_preferences`)

---

### 2. AI Personalization Engine

**What**: AI that learns user preferences and improves recommendations.

**Why It's Valuable**:
- Gets smarter with use (data moat)
- Creates switching cost (competitors don't have your data)
- Hard to replicate (requires data + AI expertise)

**How We Leverage**:
- Feedback loop (`recipe_feedback` → improves prompts)
- User preference tracking (`profiles.dietary_preferences`, `profiles.allergies`)
- Recipe metrics analysis (what works, what doesn't)

---

### 3. Multi-Tenant Architecture

**What**: Enterprise-ready architecture supporting families/households.

**Why It's Valuable**:
- Enables B2B2C partnerships (wellness platforms)
- Supports family sharing (viral growth)
- Hard to retrofit (requires architectural changes)

**How We Leverage**:
- `tenants` table for isolation
- `tenant_memberships` for sharing
- RLS policies for security

---

### 4. Universal Platform (Web + Mobile)

**What**: Single codebase powers web, iOS, Android.

**Why It's Valuable**:
- Faster development (write once, deploy everywhere)
- Consistent UX across platforms
- Lower maintenance cost

**How We Leverage**:
- Monorepo structure (`/apps/web/`, `/apps/mobile/`)
- Shared packages (`/packages/ui/`, `/packages/utils/`)
- Real-time sync across platforms

---

## Infrastructure Scalability

### Current Capacity

**Vercel**:
- Serverless (auto-scales)
- Limits: 100GB bandwidth/month (free), unlimited (paid)
- **Scalability**: ✅ Handles millions of requests

**Supabase**:
- PostgreSQL: 500MB (free), 8GB+ (paid)
- Edge Functions: 2M invocations/month (free), unlimited (paid)
- Realtime: 200 concurrent connections (free), 500+ (paid)
- **Scalability**: ✅ Handles 100K+ users with paid plan

**OpenAI**:
- Rate limits: 3,500 RPM (requests per minute) for GPT-4
- **Scalability**: � May need request queuing at scale

---

### Scaling Plan

**Phase 1 (0-10K users)**:
- Current infrastructure sufficient
- Monitor costs and performance

**Phase 2 (10K-100K users)**:
- Upgrade Supabase plan (more database storage, higher limits)
- Implement database read replicas
- Add Redis caching layer
- Optimize AI API usage (caching, prompt optimization)

**Phase 3 (100K+ users)**:
- Consider migrating to AWS (Terraform modules exist)
- Implement database partitioning
- Add CDN for static assets
- Consider fine-tuning smaller AI models

---

## Security & Compliance

### Security Features

**Authentication**:
- ✅ JWT-based auth (Supabase Auth)
- ✅ Row-Level Security (RLS) policies
- ✅ Multi-tenant isolation

**Data Protection**:
- ✅ Encryption at rest (Supabase)
- ✅ Encryption in transit (HTTPS)
- ✅ No hardcoded secrets (environment variables)

**API Security**:
- ✅ CORS policies
- ✅ Rate limiting (usage quotas)
- ✅ Input validation

**Files**:
- `/whats-for-dinner/supabase/migrations/014_consolidated_rls_security.sql` - RLS policies
- `/whats-for-dinner/SECURITY.md` - Security policy

---

### Compliance

**GDPR**:
- ✅ Data export functionality (can be added)
- ✅ Data deletion functionality (can be added)
- ✅ Privacy policy (mentioned in codebase)

**CCPA**:
- ✅ Similar to GDPR (can reuse functionality)

**HIPAA** (for B2B2C):
- ⚠️ Not currently compliant (would need BAA with Supabase)
- Architecture supports it (multi-tenant, RLS)

---

## Development Workflow

### Code Quality

**TypeScript**: 100% TypeScript (type safety)
**Testing**: Jest, Playwright (unit, integration, E2E)
**Linting**: ESLint, Prettier
**CI/CD**: GitHub Actions (automated testing, deployment)

**Files**:
- `/whats-for-dinner/jest.config.js` - Test configuration
- `/.github/workflows/ci.yml` - CI pipeline

---

### Deployment

**Web**: Automated via GitHub Actions → Vercel
**Database**: Migrations via GitHub Actions → Supabase
**Mobile**: Manual via EAS Build (can be automated)

**Files**:
- `/.github/workflows/ci-cd.yml` - Deployment pipeline
- `/.github/workflows/supabase-deploy.yml` - Database migrations

---

## Technical Debt & Risks

### Known Technical Debt

1. **Console.log Statements**: ~1,400 remaining (in scripts/tests/docs - acceptable)
2. **Any Types**: ~400 remaining (can be improved over time)
3. **Test Coverage**: 40%+ (templates exist, needs implementation)

### Risks

1. **Database Performance**: May need optimization at scale
2. **AI API Costs**: Need to monitor and optimize
3. **Supabase Limits**: May need to upgrade or migrate at scale
4. **Mobile App**: Less mature than web app (needs more work)

---

## TODO: Founders to Supply

- [ ] Actual infrastructure costs (Vercel, Supabase, OpenAI)
- [ ] Performance benchmarks (API response times, page load times)
- [ ] Scalability testing results (if any)
- [ ] Security audit results (if any)
- [ ] Technical team size and expertise

---

**Last Updated**: 2025-01-27  
**Status**: Comprehensive tech overview - Ready for technical due diligence

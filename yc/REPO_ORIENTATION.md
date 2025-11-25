# Repo Orientation: What's for Dinner

**Generated**: 2025-01-27  
**Purpose**: Quick orientation for YC partners, investors, and technical reviewers

---

## What Is This Product?

**What's for Dinner** is an AI-powered meal planning application that solves the daily "what should I cook?" problem by generating personalized recipe suggestions based on ingredients users already have in their pantry.

### One-Sentence Description
> AI meal planner that learns your pantry and suggests recipes in 30 seconds.

### Core Value Proposition
- **Pantry-first approach**: Start with what you have, not what you need
- **AI personalization**: Learns user preferences, dietary restrictions, and cooking style
- **Universal platform**: Web, iOS, and Android apps with seamless sync
- **Time-saving**: Reduces meal decision time from 15+ minutes to 30 seconds

---

## Who Is The User?

### Primary ICP: Busy Families (28-45, household of 2-4)
- **Pain**: Decision fatigue, food waste, repetitive meals
- **Job-to-be-done**: "I need dinner ideas in under 5 minutes using ingredients I already have"

### Secondary ICP: Diet-Restricted Consumers (25-55)
- **Pain**: Generic apps don't respect strict diets (keto, vegan, FODMAP, allergies)
- **Job-to-be-done**: "I need recipes that actually fit my dietary restrictions"

### Tertiary ICP: Meal Prep Enthusiasts (22-40)
- **Pain**: Weekly meal planning is time-consuming
- **Job-to-be-done**: "I need optimized weekly meal prep plans"

---

## What Problem Does It Solve?

### The Problem
Every day at 6 PM, millions of people stare into their fridge and ask "What's for dinner?" Current solutions fail because:
- Recipe sites require searching (don't start with what you have)
- Meal apps need you to know what you want (planning fatigue)
- Generic AI doesn't learn your preferences (no personalization)

**Result**: Decision fatigue, wasted ingredients, repetitive meals, ordering takeout again.

### The Solution
1. User adds ingredients (or app learns from their pantry)
2. AI generates personalized recipes in 30 seconds
3. Recipes fit dietary needs, skill level, and preferences
4. System learns and improves with each interaction

---

## Architecture Overview

### High-Level Architecture

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
│                  │   Supabase      │                        │
│                  │  • PostgreSQL   │                        │
│                  │  • Auth         │                        │
│                  │  • Realtime     │                        │
│                  │  • Storage      │                        │
│                  │  • Edge Functions                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │   External APIs │                        │
│                  │  • OpenAI GPT-4 │                        │
│                  │  • Stripe       │                        │
│                  │  • PostHog      │                        │
│                  └─────────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend**
- Next.js 16 (Web)
- React 19
- React Native / Expo (Mobile)
- TypeScript
- Tailwind CSS

**Backend**
- Supabase (PostgreSQL, Auth, Realtime, Storage)
- Supabase Edge Functions (Deno)
- OpenAI GPT-4 (meal generation)

**Infrastructure**
- Vercel (web deployment)
- GitHub Actions (CI/CD)
- Turborepo (monorepo management)
- Terraform (AWS infrastructure - optional)

**Analytics & Monitoring**
- PostHog (product analytics)
- Sentry (error tracking)
- Custom analytics tables (Supabase)

**Payments**
- Stripe (subscriptions)

---

## Main Product Location

**Primary Product**: `/whats-for-dinner/` directory
- Standalone Next.js app with full feature set
- Can run independently

**Monorepo Structure**: Root `/apps/web/` and `/apps/mobile/`
- Shared packages in `/packages/`
- More modular, enterprise-ready structure

**Decision**: The `/whats-for-dinner/` directory appears to be the main, production-ready product. The monorepo structure suggests future expansion or migration path.

---

## Key Features

1. **AI Meal Generation**: GPT-4 powered recipe suggestions based on pantry
2. **Pantry Management**: Track ingredients, expiration alerts, barcode scanning
3. **Dietary Preferences**: Keto, vegan, FODMAP, allergies, custom restrictions
4. **Multi-Platform**: Web, iOS, Android with real-time sync
5. **Offline Support**: Access meal plans without internet
6. **Multi-Tenant SaaS**: Family/household sharing, enterprise-ready
7. **Subscription Tiers**: Free, Pro ($9.99/mo), Premium ($19.99/mo)
8. **Affiliate Integration**: Grocery delivery partnerships (future)

---

## Business Model

### Revenue Streams

1. **Consumer Subscriptions**
   - Free: 10 recipes/day
   - Pro: $9.99/month (unlimited recipes)
   - Premium: $19.99/month (+ meal planning, grocery integration)

2. **Affiliate Commissions** (Future)
   - Grocery delivery partnerships (2.5-5% per order)
   - Estimated: 40% conversion from recipe to cart

3. **B2B/Enterprise** (Future)
   - Wellness platform integrations
   - White-label solutions

### Target Metrics
- **Goal**: $1.2M MRR at 100K users ($12 ARPU)
- **Current**: Product live, infrastructure ready, metrics collection in place

---

## Current State

### ✅ What's Built
- Core product live (recipe generation working)
- Universal app (web + mobile)
- Enterprise infrastructure (multi-tenant, compliance-ready)
- Analytics instrumentation (PostHog + custom tables)
- Payment processing (Stripe integration)
- Comprehensive database schema (15+ migrations)
- CI/CD pipeline (GitHub Actions)
- Security & compliance (GDPR-ready, RLS policies)

### 🔄 What's Next (90 Days)
- 10K users
- $10K MRR
- 40% weekly retention
- Proof points: "10,000 recipes generated this month"

---

## Key Files & Directories

### Product Code
- `/whats-for-dinner/src/` - Main application code
- `/whats-for-dinner/supabase/` - Database migrations, Edge Functions
- `/apps/web/src/` - Monorepo web app
- `/apps/mobile/` - React Native mobile app

### Documentation
- `/README.md` - Main product README
- `/gtm/` - Go-to-market materials (one-pager, ICP profiles, messaging)
- `/docs/` - Technical documentation
- `/whats-for-dinner/docs/` - Product-specific docs

### Infrastructure
- `/whats-for-dinner/infra/terraform/` - AWS infrastructure as code
- `/.github/workflows/` - CI/CD pipelines
- `/whats-for-dinner/supabase/migrations/` - Database schema

### Analytics & Metrics
- `/whats-for-dinner/src/lib/analytics.ts` - Analytics service
- `/whats-for-dinner/supabase/migrations/002_analytics_logging_tables.sql` - Analytics schema
- PostHog integration (configured)

---

## Assumptions & Notes

1. **Main Product**: `/whats-for-dinner/` is the primary YC-relevant product
2. **Monorepo**: `/apps/web/` appears to be a newer structure, possibly future migration target
3. **Metrics**: Analytics infrastructure exists but actual user metrics need to be collected/verified
4. **Revenue**: Stripe integration exists, but actual revenue numbers need to be confirmed
5. **Team**: No explicit team information found in repo (to be documented in YC_TEAM_NOTES.md)

---

## Next Steps

See `/yc/` directory for:
- **YC_PRODUCT_OVERVIEW.md** - Detailed product narrative
- **YC_PROBLEM_USERS.md** - User segments and pain points
- **YC_METRICS_CHECKLIST.md** - Metrics instrumentation status
- **YC_GAP_ANALYSIS.md** - Gaps vs YC expectations

---

**Last Updated**: 2025-01-27  
**Status**: Phase 0 Complete ✅

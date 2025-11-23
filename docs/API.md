# API Documentation

Generated API documentation for What's for Dinner.

## Endpoints

### /activation/review

### /admin/audit

#### GET

* Admin Audit Logs API
 * 
 * GET /api/admin/audit - List audit logs with filters

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /admin/costs

#### GET

* Admin Cost Dashboard API
 * 
 * Provides cost data for the admin dashboard:
 * - Infrastructure costs (Supabase, Vercel, etc.)
 * - Stripe fees
 * - Email service costs
 * - Advertising costs
 * - Trends and forecasts

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /admin/dashboard

#### GET

* Admin Dashboard API
 * 
 * GET /api/admin/dashboard - Key metrics overview

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /admin/governance/retention

#### GET

* Admin Data Governance - Retention Policies API
 * 
 * GET /api/admin/governance/retention - List policies & preview
 * POST /api/admin/governance/retention/run - Run retention policies

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* Admin Data Governance - Retention Policies API
 * 
 * GET /api/admin/governance/retention - List policies & preview
 * POST /api/admin/governance/retention/run - Run retention policies

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /admin/incidents

#### GET

* Admin Incidents API
 * 
 * GET /api/admin/incidents - List incidents
 * POST /api/admin/incidents - Create incident

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* Admin Incidents API
 * 
 * GET /api/admin/incidents - List incidents
 * POST /api/admin/incidents - Create incident

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /admin/wiki/sync-markdown

#### POST

API endpoint at /admin/wiki/sync-markdown

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /affiliate/convert

#### POST

* Affiliate Conversion API
 * Automatically called on purchase - zero effort

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /affiliate/dashboard

#### GET

* Affiliate Dashboard API
 * Pre-built dashboard data - zero effort

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /affiliate/register

#### POST

* Affiliate Registration API
 * Zero-effort affiliate signup - automatically enabled for all users

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /affiliate/track

### /agent/suggest

#### POST

API endpoint at /agent/suggest

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /alerts

#### GET

API endpoint at /alerts

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### PATCH

API endpoint at /alerts

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /analytics/dashboard

#### GET

API endpoint at /analytics/dashboard

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /api-access/keys

#### GET

* API Key Management
 * Zero-effort API key generation and management

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* API Key Management
 * Zero-effort API key generation and management

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /audit/me

#### GET

API endpoint at /audit/me

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /auth/apple/callback

#### POST

API endpoint at /auth/apple/callback

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /auth/delete-account

#### GET

API endpoint at /auth/delete-account

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /auth/delete-account

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /billing/checkout

#### POST

API endpoint at /billing/checkout

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /billing/invoice

#### GET

* Invoice Generation API
 * Generates invoices for subscriptions and payments

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /billing/portal

#### POST

API endpoint at /billing/portal

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /billing/refund

#### GET

* Refund Processing API
 * Handles refund requests and processing

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* Refund Processing API
 * Handles refund requests and processing

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /business-readiness

#### GET

* Business Readiness API
 * Endpoint for accessing business readiness reports and metrics

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* Business Readiness API
 * Endpoint for accessing business readiness reports and metrics

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /chat

#### POST

API endpoint at /chat

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /checkout/create-link

### /collections/create

### /collections/list

### /collections/purchase

### /collections

#### GET

* GET /api/collections
 * Get all collections for the current user

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* GET /api/collections
 * Get all collections for the current user

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /commerce/hub

#### GET

API endpoint at /commerce/hub

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /commerce/hub

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /cost/calculate

#### POST

API endpoint at /cost/calculate

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /credits/purchase

### /cro/insights

#### GET

* CRO Insights API

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* CRO Insights API

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /cron/affiliate-payouts

#### GET

* Automated Affiliate Payout Cron Job
 * Runs monthly to process affiliate payouts
 * Configure in Vercel Cron or similar

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /cron/data-aggregation

#### GET

* Automated Data Aggregation Cron Job
 * Aggregates and anonymizes data for insights packages
 * Runs daily

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /cron/retention

#### GET

* Retention Automation Cron Job
 * Runs daily and weekly retention automation

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /csrf-token

#### GET

API endpoint at /csrf-token

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /data-insights/anonymize

#### POST

* Automatic Data Anonymization
 * Zero-effort GDPR/CCPA compliant anonymization

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /data-insights/catalog

#### GET

* Data Insights Catalog
 * Pre-built insights ready to sell - zero effort

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /developers/keys

#### GET

API endpoint at /developers/keys

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /developers/keys

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /developers/usage

#### GET

API endpoint at /developers/usage

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /dinner

### /email/program-welcome

#### POST

* Program Welcome Email
 * Sends welcome emails when users join programs

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /errors

#### GET

API endpoint at /errors

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /experiments/assign

#### GET

* GET /api/experiments/assign?experimentId=xxx
 * Assigns or retrieves variant for an experiment

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /experiments/convert

#### POST

* POST /api/experiments/convert
 * Tracks a conversion event for an experiment

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /experiments/price

### /expiration/alerts

#### GET

* GET /api/expiration/alerts
 * Get expiration alerts for the current user

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /export

#### POST

API endpoint at /export

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /family/invite

### /features/check

#### POST

* POST /api/features/check
 * Checks if a feature is available for the user's plan

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /federation

#### GET

API endpoint at /federation

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /federation

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /feedback

#### GET

API endpoint at /feedback

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /feedback

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /gamification/badges

### /gamification/challenges

### /gamification/leaderboard

### /gamification/streak

### /gdpr/delete

#### DELETE

API endpoint at /gdpr/delete

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /gdpr/export

#### GET

API endpoint at /gdpr/export

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /grocery/cart

#### POST

* Grocery Cart API
 * Add items to cart and manage carts

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /grocery/config

#### GET

* Grocery Configuration API
 * Get and update grocery integration configuration

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### PUT

* Grocery Configuration API
 * Get and update grocery integration configuration

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /grocery/search

#### GET

* Grocery Product Search API
 * Search products across all stores

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /grocery/stores

#### GET

* Grocery Stores API
 * Get available grocery stores and their configuration

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /guardian

#### GET

* Guardian API Routes
 * RESTful API for Guardian system

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* Guardian API Routes
 * RESTful API for Guardian system

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /health/comprehensive

#### GET

* Comprehensive Health Check API
 * Checks all system components and returns health status

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /health/db

#### GET

* Phase 1 Guardrail: Health Endpoint - Database
 * Checks the health of the database connection

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /health/live

#### GET

* Liveness Probe Endpoint
 * 
 * Simple check to verify the service is running.
 * Used by Kubernetes/Docker health checks.
 * 
 * GET /api/health/live

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /health/queue

#### GET

* Phase 1 Guardrail: Health Endpoint - Queue
 * Checks the health of the queue worker and Redis connection

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /health/ready

#### GET

* Readiness Probe Endpoint
 * 
 * Checks if the service is ready to accept traffic.
 * Verifies dependencies (database, external APIs) are available.
 * 
 * GET /api/health/ready

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /health

#### GET

* Production Health Check Endpoint
 * 
 * Provides comprehensive health checking for production monitoring:
 * - GET /api/health - Full health check with all checks
 * - GET /api/health/live - Liveness probe (simple alive check)
 * - GET /api/health/ready - Readiness probe (ready to accept traffic)

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /healthz

#### GET

API endpoint at /healthz

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /ingest

#### POST

API endpoint at /ingest

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /marketplace/purchase

### /marketplace/verify

### /meal-plan/daily-suggestion

#### GET

* Daily Suggestion API
 * Returns a personalized daily recipe suggestion

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /meal-plan/generate

### /mealplan/ai-generate

### /mealplan

### /metrics/dashboard

### /metrics

#### GET

API endpoint at /metrics

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /metrics

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /metrics.json

#### GET

* Performance Intelligence Layer: JSON Dashboard Endpoint
 * Returns metrics in JSON format for external consumption

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /monetization/opportunities

#### GET

* Monetization Opportunities API

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /monetization/paywall

#### GET

* Paywall Strategy API
 * Determine if paywall should be shown and which strategy to use

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /monetization/pricing

#### GET

* Dynamic Pricing API
 * Get personalized pricing offers

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /monetization/retention

#### GET

* Retention Monetization API
 * Get retention offers and churn risk analysis

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /monetization/upsells

#### GET

* Smart Upsell Opportunities API
 * Get personalized upsell opportunities

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /monetization/usage-premium

#### GET

* Usage-Based Premium Features API

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* Usage-Based Premium Features API

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /monetization/value-profile

#### GET

* Customer Value Profile API
 * Get comprehensive customer value analysis

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /nomad/family/chat

#### GET

API endpoint at /nomad/family/chat

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /nomad/family/chat

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /nomad/family

#### GET

API endpoint at /nomad/family

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /nomad/family

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /nomad/mealplan

#### GET

API endpoint at /nomad/mealplan

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /nomad/mealplan

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### DELETE

API endpoint at /nomad/mealplan

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /nomad/nutrition

#### GET

API endpoint at /nomad/nutrition

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /nomad/recipes

#### GET

API endpoint at /nomad/recipes

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /nomad/recipes

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /nomad/user

#### GET

API endpoint at /nomad/user

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

API endpoint at /nomad/user

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /nomad/wearables/google-fit/callback

#### GET

* Encrypt token using AES-256-GCM

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /nutrition

#### POST

API endpoint at /nutrition

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /observability/alerts

#### GET

API endpoint at /observability/alerts

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### PATCH

API endpoint at /observability/alerts

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /observability/dashboard

#### GET

API endpoint at /observability/dashboard

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /observability/errors

#### GET

API endpoint at /observability/errors

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /observability/health

#### GET

API endpoint at /observability/health

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /observability/metrics

#### GET

API endpoint at /observability/metrics

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /observability/report

#### GET

API endpoint at /observability/report

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /observability/traces

#### GET

API endpoint at /observability/traces

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /onboarding/checklist

#### GET

* GET /api/onboarding/checklist
 * Returns user's onboarding checklist state

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /onboarding/prefill

### /pantry/seed-sample

### /partner/webhook

### /partners/revenue

#### GET

API endpoint at /partners/revenue

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /partners/stats

#### GET

API endpoint at /partners/stats

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /performance/optimize

#### POST

API endpoint at /performance/optimize

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /performance/recommendations

#### GET

API endpoint at /performance/recommendations

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /performance

#### GET

* Performance Metrics API
 * 
 * Tracks and returns performance metrics: API response times, suggestion generation time, Core Web Vitals

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /performance/summary

#### GET

* Performance Summary API
 * Returns performance metrics for monitoring

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /preferences

#### GET

* GET /api/preferences
 * Returns user's dietary preferences

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* GET /api/preferences
 * Returns user's dietary preferences

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /premium/cost

#### POST

API endpoint at /premium/cost

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /premium/meal-plan

### /premium/nutrition

### /premium/pantry-intelligence

#### POST

API endpoint at /premium/pantry-intelligence

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /pricing/current

### /pricing/survey

### /privacy/apps

#### POST

API endpoint at /privacy/apps

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /privacy/consent

#### GET

* Privacy API Routes
 * Zero-trust, user-only access with MFA enforcement

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* Privacy API Routes
 * Zero-trust, user-only access with MFA enforcement

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /privacy/delete

#### POST

API endpoint at /privacy/delete

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /privacy/erase

#### POST

* Privacy Erasure Endpoint (Right to be Forgotten)
 * Schedules account and data deletion

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /privacy/export

#### POST

API endpoint at /privacy/export

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /privacy/log

#### POST

API endpoint at /privacy/log

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /privacy/mfa/verify

#### GET

API endpoint at /privacy/mfa/verify

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /privacy/prefs

#### GET

API endpoint at /privacy/prefs

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /privacy/signals

#### POST

API endpoint at /privacy/signals

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /programs/analytics

#### GET

* Program Analytics API
 * Returns aggregated analytics for programs

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /programs/attribution

#### GET

* Attribution API
 * Handles program code attribution and cookie tracking

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* Attribution API
 * Handles program code attribution and cookie tracking

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /programs/rewards/distribute

#### POST

* Automated Reward Distribution
 * Processes pending rewards and distributes them

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /programs/track

#### POST

* Program Tracking API
 * Tracks conversions, clicks, and attribution for referral/affiliate/partner programs

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /purchase/convert

#### POST

* Purchase Conversion Handler
 * Automatically calls affiliate conversion on purchase
 * Pre-wired to work with existing purchase flow

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /push/register

#### POST

API endpoint at /push/register

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /recipes/customize

### /recipes/generate-image

### /reco/whatsfordinner

#### POST

API endpoint at /reco/whatsfordinner

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /referral/convert

### /referral/create

### /referral/enhanced

#### GET

* Enhanced Referral Program API

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* Enhanced Referral Program API

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /revenue/dashboard

### /revenue/enable

### /revenue/summary

### /selftest

#### GET

API endpoint at /selftest

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /share/reward

### /stripe/monetization-webhook

#### POST

* Stripe Webhook Handler for Monetization
 * Handles affiliate payouts, API subscriptions, marketplace payouts

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /stripe/webhook

#### POST

API endpoint at /stripe/webhook

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /subscriptions/create

### /subscriptions/me

### /support/ticket

#### GET

* Support Ticket API
 * Creates and manages support tickets

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

#### POST

* Support Ticket API
 * Creates and manages support tickets

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /swagger

#### GET

API endpoint at /swagger

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /telemetry/ingest

### /telemetry

#### POST

* Performance Intelligence Layer: Telemetry Beacon Endpoint
 * Receives client-side performance metrics via sendBeacon

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /traces

#### GET

API endpoint at /traces

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /upsells/opportunities

#### GET

* Automated Upsell Opportunities
 * Zero-effort upsell identification using engagement scoring

**Authentication**: Required

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error

### /user/me

#### GET

API endpoint at /user/me

**Responses**:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 500: Internal Server Error


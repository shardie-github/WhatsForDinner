# Analytics & Success Metrics

## Overview

This document describes the analytics infrastructure, event tracking, and success metrics for "What's for Dinner".

---

## Event Catalog

See [analytics/event-catalog.json](../analytics/event-catalog.json) for the complete catalog of tracked events.

### Key Events

#### Product/Business Metrics

1. **Activation**: `onboarding_step_completed` (especially "first_recipe" step)
   - Definition: % of users completing first meaningful action (generating first recipe)
   - Target: >40% activation rate

2. **Conversion Funnel**: `funnel_stage_reached`
   - Stages: landing ? signup ? onboarding ? first_recipe ? recipe_feedback ? subscription
   - Targets: 
     - Visitor ? Signup: >15%
     - Signup ? First Recipe: >40%
     - First Recipe ? Subscription: >5%

3. **Engagement**: 
   - Weekly Active Users (WAU): Users with `recipe_generated` or `recipe_viewed` in past 7 days
   - Session length: Calculated from `page_view` events
   - Feature depth: Average `recipe_generated` events per user per week
   - Target: >30% WAU, >2 recipes/week per active user

4. **Retention**:
   - D1: % of signups who generate a recipe on day 1
   - D7: % of signups active in week 1 who return in week 2
   - D30: % of signups active in month 1 who return in month 2
   - Targets: D1 >60%, D7 >30%, D30 >15%

5. **Revenue**:
   - AOV (Average Order Value): Average subscription plan value at checkout
   - ARPU/ARPA: Average Revenue Per User/Account
   - MRR Growth: Month-over-month MRR growth
   - Refund rate: % of subscriptions refunded
   - Targets: MRR growth >10% MoM, refund rate <2%

#### Reliability/Performance Metrics

1. **Error Rate**: `error_occurred` events
   - Target: <0.1% of all events
   - Critical errors: <0.01%

2. **API Latency**: Tracked in `recipe_generated` event (`api_latency_ms`)
   - p50: <1s
   - p95: <3s
   - p99: <5s

3. **Core Web Vitals**:
   - LCP (Largest Contentful Paint): <2.5s
   - CLS (Cumulative Layout Shift): <0.1
   - INP (Interaction to Next Paint): <200ms

4. **Background Job Success**: Job processor success rate
   - Target: >99%

5. **Data Freshness**: Time between event occurrence and availability in analytics
   - Target: <5 minutes

---

## Event Tracking Implementation

### Client-Side Events

Events are tracked via `apps/web/src/lib/analytics.ts`:

```typescript
import { analytics } from '@/lib/analytics';

// Track event
await analytics.trackEvent('recipe_generated', {
  recipe_id: 123,
  ingredients_count: 5,
  api_latency_ms: 1234,
  // ...
});
```

### Server-Side Events

Server-side events are tracked in API routes:

```typescript
import { analytics } from '@/lib/analytics';

// In API route
await analytics.trackEvent('subscription_started', {
  plan: 'pro',
  stripe_customer_id: customerId,
});
```

### Session Tracking

Sessions are automatically tracked via `session_id` stored in localStorage. Each session persists across page views until the browser is closed.

---

## Analytics Queries (Supabase SQL)

### Activation Rate (Last 30 Days)

```sql
WITH signups AS (
  SELECT DISTINCT user_id
  FROM analytics_events
  WHERE event_type = 'user_signed_up'
    AND timestamp >= NOW() - INTERVAL '30 days'
),
activated AS (
  SELECT DISTINCT user_id
  FROM analytics_events
  WHERE event_type = 'recipe_generated'
    AND timestamp >= NOW() - INTERVAL '30 days'
)
SELECT 
  COUNT(DISTINCT s.user_id) as total_signups,
  COUNT(DISTINCT a.user_id) as activated_users,
  ROUND(100.0 * COUNT(DISTINCT a.user_id) / COUNT(DISTINCT s.user_id), 2) as activation_rate
FROM signups s
LEFT JOIN activated a ON s.user_id = a.user_id;
```

### Conversion Funnel (Last 7 Days)

```sql
WITH funnel_data AS (
  SELECT 
    user_id,
    session_id,
    MAX(CASE WHEN funnel_stage = 'landing' THEN 1 ELSE 0 END) as reached_landing,
    MAX(CASE WHEN funnel_stage = 'signup' THEN 1 ELSE 0 END) as reached_signup,
    MAX(CASE WHEN funnel_stage = 'onboarding' THEN 1 ELSE 0 END) as reached_onboarding,
    MAX(CASE WHEN funnel_stage = 'first_recipe' THEN 1 ELSE 0 END) as reached_first_recipe,
    MAX(CASE WHEN funnel_stage = 'recipe_feedback' THEN 1 ELSE 0 END) as reached_feedback,
    MAX(CASE WHEN funnel_stage = 'subscription' THEN 1 ELSE 0 END) as reached_subscription
  FROM funnel_events
  WHERE timestamp >= NOW() - INTERVAL '7 days'
  GROUP BY user_id, session_id
)
SELECT 
  SUM(reached_landing) as visitors,
  SUM(reached_signup) as signups,
  SUM(reached_onboarding) as onboarded,
  SUM(reached_first_recipe) as first_recipe,
  SUM(reached_feedback) as feedback,
  SUM(reached_subscription) as subscriptions,
  ROUND(100.0 * SUM(reached_signup) / NULLIF(SUM(reached_landing), 0), 2) as signup_rate,
  ROUND(100.0 * SUM(reached_first_recipe) / NULLIF(SUM(reached_signup), 0), 2) as activation_rate,
  ROUND(100.0 * SUM(reached_subscription) / NULLIF(SUM(reached_first_recipe), 0), 2) as conversion_rate
FROM funnel_data;
```

### Weekly Active Users (WAU)

```sql
SELECT 
  DATE_TRUNC('week', timestamp) as week,
  COUNT(DISTINCT user_id) as wau
FROM analytics_events
WHERE event_type IN ('recipe_generated', 'recipe_viewed')
  AND timestamp >= NOW() - INTERVAL '8 weeks'
GROUP BY DATE_TRUNC('week', timestamp)
ORDER BY week DESC;
```

### D7 Retention (Cohort Analysis)

```sql
WITH cohort_signups AS (
  SELECT 
    user_id,
    DATE_TRUNC('week', timestamp) as cohort_week
  FROM analytics_events
  WHERE event_type = 'user_signed_up'
),
week_activity AS (
  SELECT 
    user_id,
    DATE_TRUNC('week', timestamp) as activity_week
  FROM analytics_events
  WHERE event_type IN ('recipe_generated', 'recipe_viewed')
)
SELECT 
  c.cohort_week,
  COUNT(DISTINCT c.user_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '1 week' THEN c.user_id END) as week1_retained,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.activity_week = c.cohort_week + INTERVAL '1 week' THEN c.user_id END) / COUNT(DISTINCT c.user_id), 2) as week1_retention_rate
FROM cohort_signups c
LEFT JOIN week_activity a ON c.user_id = a.user_id
GROUP BY c.cohort_week
ORDER BY c.cohort_week DESC
LIMIT 8;
```

### Error Rate (Last 24 Hours)

```sql
SELECT 
  COUNT(*) FILTER (WHERE event_type = 'error_occurred') as error_count,
  COUNT(*) as total_events,
  ROUND(100.0 * COUNT(*) FILTER (WHERE event_type = 'error_occurred') / COUNT(*), 4) as error_rate_pct
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '24 hours';
```

### API Performance (p50, p95, p99)

```sql
SELECT 
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY api_latency_ms) as p50_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY api_latency_ms) as p95_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY api_latency_ms) as p99_ms,
  AVG(api_latency_ms) as avg_ms,
  COUNT(*) as total_requests
FROM recipe_metrics
WHERE generated_at >= NOW() - INTERVAL '24 hours';
```

### MRR Growth

```sql
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) FILTER (WHERE plan = 'pro') * 9.99 as pro_mrr,
  COUNT(*) FILTER (WHERE plan = 'family') * 19.99 as family_mrr,
  COUNT(*) FILTER (WHERE plan = 'pro') * 9.99 + COUNT(*) FILTER (WHERE plan = 'family') * 19.99 as total_mrr
FROM subscriptions
WHERE status = 'active'
  AND created_at >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

---

## Data Privacy & Retention

- **PII Classification**: See event catalog for PII classifications per event
- **Retention Policy**:
  - Default: 24 months
  - Events with PII: 12 months
  - Events with high PII: 6 months
- **GDPR Compliance**: User data can be deleted via `DELETE FROM analytics_events WHERE user_id = ?`

---

## Dashboards

### Product Dashboard (Recommended Metrics)

1. **Activation Rate**: Weekly trend
2. **Conversion Funnel**: Stage-by-stage drop-off
3. **WAU/MAU Ratio**: Weekly/Monthly Active Users
4. **Retention Curves**: D1, D7, D30
5. **MRR Growth**: Month-over-month

### Engineering Dashboard (Recommended Metrics)

1. **Error Rate**: 24-hour trend
2. **API Latency**: p50, p95, p99 over time
3. **Core Web Vitals**: LCP, CLS, INP
4. **Background Job Success Rate**: Daily trend
5. **Data Freshness SLA**: Time to availability

---

## Integration with External Analytics

### PostHog (Client-Side)

PostHog is configured for client-side product analytics. Events are also sent to PostHog for real-time analysis.

### Sentry (Error Tracking)

Errors are tracked in both:
- `error_reports` table (for analytics)
- Sentry (for alerting and debugging)

---

## Next Steps

1. ? Event catalog created
2. ? SQL queries documented
3. ? Set up automated dashboards (Supabase dashboard or external tool)
4. ? Configure alerts for SLO violations
5. ? Set up retention policy automation

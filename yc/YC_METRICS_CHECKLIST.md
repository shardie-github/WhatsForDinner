# YC Metrics Checklist: What's for Dinner

**Generated**: 2025-01-27  
**Purpose**: Comprehensive metrics instrumentation status and gaps for YC readiness

---

## A. USAGE METRICS

### DAU/WAU/MAU (Daily/Weekly/Monthly Active Users)

**Status**: ⚠️ **PARTIALLY INSTRUMENTED**

**What's Instrumented**:
- ✅ `analytics_events` table tracks user sessions (`session_id`, `user_id`, `timestamp`)
- ✅ PostHog integration configured (can track active users)
- ✅ `analytics.trackEvent()` function available

**What's Missing**:
- ❌ No automated DAU/WAU/MAU calculation queries
- ❌ No dashboard showing active user trends
- ❌ No retention cohort analysis

**Where It's Tracked**:
- `/whats-for-dinner/src/lib/analytics.ts` - Analytics service
- `/whats-for-dinner/supabase/migrations/002_analytics_logging_tables.sql` - Schema
- PostHog (if configured with `NEXT_PUBLIC_POSTHOG_KEY`)

**Proposed Implementation**:
```sql
-- Add to Supabase migrations
CREATE OR REPLACE FUNCTION get_active_users(
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ
)
RETURNS TABLE (
  date DATE,
  dau BIGINT,
  wau BIGINT,
  mau BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('day', timestamp)::DATE as date,
    COUNT(DISTINCT user_id) FILTER (WHERE timestamp >= date_trunc('day', CURRENT_DATE)) as dau,
    COUNT(DISTINCT user_id) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as wau,
    COUNT(DISTINCT user_id) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days') as mau
  FROM analytics_events
  WHERE timestamp BETWEEN period_start AND period_end
  GROUP BY date_trunc('day', timestamp)::DATE
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;
```

**Effort**: LOW (1-2 hours)
**Priority**: HIGH (YC partners will ask for this)

---

### Activation Rate

**Definition**: % of signups who generate their first recipe within 7 days

**Status**: ⚠️ **PARTIALLY INSTRUMENTED**

**What's Instrumented**:
- ✅ `recipe_metrics` table tracks recipe generation (`user_id`, `generated_at`)
- ✅ `analytics_events` tracks signup events (if implemented)

**What's Missing**:
- ❌ No signup event tracking in `analytics_events`
- ❌ No activation calculation query
- ❌ No activation funnel visualization

**Where It's Tracked**:
- `/whats-for-dinner/supabase/migrations/002_analytics_logging_tables.sql` - `recipe_metrics` table
- `/whats-for-dinner/src/lib/analytics.ts` - `trackRecipeGeneration()` function

**Proposed Implementation**:
1. Track signup event: `analytics.trackEvent('user_signed_up', { source, ... })`
2. Track first recipe: Already tracked in `recipe_metrics`
3. Calculate activation: Query users who signed up and generated recipe within 7 days

**Effort**: LOW (2-3 hours)
**Priority**: HIGH (Key product-market fit metric)

---

### Retention Rate

**Definition**: % of users who return within 7 days, 30 days

**Status**: ⚠️ **PARTIALLY INSTRUMENTED**

**What's Instrumented**:
- ✅ `analytics_events` tracks user activity over time
- ✅ `retention_metrics` table exists (from migration 015)
- ✅ PostHog can calculate retention (if configured)

**What's Missing**:
- ❌ No automated retention calculation queries
- ❌ No retention cohort analysis
- ❌ No retention dashboard

**Where It's Tracked**:
- `/whats-for-dinner/supabase/migrations/015_monetization_features.sql` - `retention_metrics` table
- `/whats-for-dinner/supabase/migrations/002_analytics_logging_tables.sql` - `analytics_events` table

**Proposed Implementation**:
```sql
-- Add retention calculation function
CREATE OR REPLACE FUNCTION calculate_retention(
  cohort_start DATE,
  days_after_signup INT
)
RETURNS TABLE (
  cohort_date DATE,
  signups BIGINT,
  retained BIGINT,
  retention_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH cohort_users AS (
    SELECT DISTINCT user_id
    FROM analytics_events
    WHERE event_type = 'user_signed_up'
      AND DATE(timestamp) = cohort_start
  ),
  retained_users AS (
    SELECT DISTINCT user_id
    FROM analytics_events
    WHERE user_id IN (SELECT user_id FROM cohort_users)
      AND timestamp >= cohort_start + (days_after_signup || ' days')::INTERVAL
      AND timestamp < cohort_start + ((days_after_signup + 1) || ' days')::INTERVAL
  )
  SELECT 
    cohort_start as cohort_date,
    COUNT(*) as signups,
    (SELECT COUNT(*) FROM retained_users) as retained,
    ROUND(
      (SELECT COUNT(*)::NUMERIC FROM retained_users) / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) as retention_rate
  FROM cohort_users;
END;
$$ LANGUAGE plpgsql;
```

**Effort**: MEDIUM (4-6 hours)
**Priority**: HIGH (YC partners will ask for retention)

---

### Engagement Metrics

**Definition**: Recipes generated per user per week, session duration, pages per session

**Status**: ✅ **WELL INSTRUMENTED**

**What's Instrumented**:
- ✅ `recipe_metrics` tracks recipes generated per user
- ✅ `analytics_events` tracks page views, user actions
- ✅ `system_metrics` tracks user engagement
- ✅ PostHog tracks session duration (if configured)

**What's Missing**:
- ❌ No aggregated engagement dashboard
- ❌ No "power user" segmentation

**Where It's Tracked**:
- `/whats-for-dinner/src/lib/analytics.ts` - `trackRecipeGeneration()`, `trackEvent()`
- `/whats-for-dinner/supabase/migrations/002_analytics_logging_tables.sql` - Tables

**Proposed Implementation**:
- Create engagement score calculation (recipes/week, sessions/week)
- Segment users into: Power users (5+ recipes/week), Regular (1-4), Casual (<1)

**Effort**: LOW (2-3 hours)
**Priority**: MEDIUM (Useful but not critical for YC)

---

## B. GROWTH & ACQUISITION

### User Acquisition Channels

**Status**: ⚠️ **PARTIALLY INSTRUMENTED**

**What's Instrumented**:
- ✅ `analytics_events` can track `event_type` and `properties` (can include `source`)
- ✅ PostHog can track UTM parameters (if configured)

**What's Missing**:
- ❌ No explicit `source` field in signup events
- ❌ No channel attribution tracking
- ❌ No CAC calculation by channel

**Where It's Tracked**:
- `/whats-for-dinner/src/lib/analytics.ts` - `trackEvent()` accepts properties
- PostHog (if configured)

**Proposed Implementation**:
1. Track signup with source: `analytics.trackEvent('user_signed_up', { source: 'organic', 'google_ads', 'facebook', 'referral', ... })`
2. Store UTM parameters in user profile
3. Calculate CAC by channel: Ad spend / signups by channel

**Effort**: LOW (2-3 hours)
**Priority**: HIGH (YC partners will ask "How do you get users?")

---

### Conversion Funnel

**Proposed Funnel**:
1. **Visitor** → Landing page view
2. **Signup** → Account created
3. **Activated** → First recipe generated
4. **Engaged** → 3+ recipes generated
5. **Paying** → Subscription purchased

**Status**: ⚠️ **PARTIALLY INSTRUMENTED**

**What's Instrumented**:
- ✅ `analytics_events` tracks page views, signups (if implemented)
- ✅ `recipe_metrics` tracks recipe generation
- ✅ `subscriptions` table tracks paying users
- ✅ `conversion_metrics` table exists (migration 015)

**What's Missing**:
- ❌ No funnel visualization
- ❌ No conversion rate calculations
- ❌ No drop-off analysis

**Where It's Tracked**:
- `/whats-for-dinner/supabase/migrations/002_analytics_logging_tables.sql`
- `/whats-for-dinner/supabase/migrations/015_monetization_features.sql` - `conversion_metrics`
- `/whats-for-dinner/supabase/migrations/003_multi_tenant_saas_schema.sql` - `subscriptions`

**Proposed Implementation**:
```sql
-- Funnel calculation query
WITH funnel AS (
  SELECT 
    COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN session_id END) as visitors,
    COUNT(DISTINCT CASE WHEN event_type = 'user_signed_up' THEN user_id END) as signups,
    COUNT(DISTINCT CASE WHEN event_type = 'recipe_generated' THEN user_id END) as activated,
    COUNT(DISTINCT CASE WHEN (SELECT COUNT(*) FROM recipe_metrics rm WHERE rm.user_id = ae.user_id) >= 3 THEN user_id END) as engaged,
    COUNT(DISTINCT s.user_id) as paying
  FROM analytics_events ae
  LEFT JOIN subscriptions s ON s.user_id = ae.user_id AND s.status = 'active'
  WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
  visitors,
  signups,
  ROUND(signups::NUMERIC / NULLIF(visitors, 0) * 100, 2) as signup_rate,
  activated,
  ROUND(activated::NUMERIC / NULLIF(signups, 0) * 100, 2) as activation_rate,
  engaged,
  ROUND(engaged::NUMERIC / NULLIF(activated, 0) * 100, 2) as engagement_rate,
  paying,
  ROUND(paying::NUMERIC / NULLIF(engaged, 0) * 100, 2) as conversion_rate
FROM funnel;
```

**Effort**: MEDIUM (4-6 hours)
**Priority**: HIGH (YC partners will ask for conversion funnel)

---

### Referral Tracking

**Status**: ✅ **WELL INSTRUMENTED**

**What's Instrumented**:
- ✅ `referral_tracking` table (migration 012)
- ✅ `referral_signups` table (migration 015)
- ✅ `referral_rewards` table (migration 015)

**Where It's Tracked**:
- `/whats-for-dinner/supabase/migrations/012_referral_social_schema.sql`
- `/whats-for-dinner/supabase/migrations/015_monetization_features.sql`

**What's Missing**:
- ❌ No referral dashboard
- ❌ No viral coefficient calculation

**Effort**: LOW (2-3 hours to build dashboard)
**Priority**: MEDIUM (Nice to have, not critical)

---

## C. REVENUE & UNIT ECONOMICS

### Revenue Metrics

**Status**: ✅ **WELL INSTRUMENTED**

**What's Instrumented**:
- ✅ `subscriptions` table tracks subscription status, plan, billing period
- ✅ `billing_events` table tracks Stripe webhook events
- ✅ `customer_value_profiles` table tracks LTV (migration 015)
- ✅ Stripe integration exists

**Where It's Tracked**:
- `/whats-for-dinner/supabase/migrations/003_multi_tenant_saas_schema.sql` - `subscriptions`, `billing_events`
- `/whats-for-dinner/supabase/migrations/015_monetization_features.sql` - `customer_value_profiles`
- Stripe dashboard (external)

**What's Missing**:
- ❌ No MRR calculation query
- ❌ No ARPU calculation query
- ❌ No revenue dashboard

**Proposed Implementation**:
```sql
-- MRR calculation
SELECT 
  SUM(CASE 
    WHEN plan = 'pro' THEN 9.99
    WHEN plan = 'premium' THEN 19.99
    ELSE 0
  END) as mrr
FROM subscriptions
WHERE status = 'active';

-- ARPU calculation
SELECT 
  COUNT(DISTINCT user_id) as paying_users,
  SUM(CASE 
    WHEN plan = 'pro' THEN 9.99
    WHEN plan = 'premium' THEN 19.99
    ELSE 0
  END) / NULLIF(COUNT(DISTINCT user_id), 0) as arpu
FROM subscriptions
WHERE status = 'active';
```

**Effort**: LOW (1-2 hours)
**Priority**: HIGH (YC partners will ask for revenue metrics)

---

### Unit Economics

**Status**: ⚠️ **PARTIALLY INSTRUMENTED**

**What's Instrumented**:
- ✅ `usage_logs` table tracks AI API costs (`tokens_used`, `cost_usd`, `model_used`)
- ✅ `customer_value_profiles` tracks LTV
- ✅ `subscriptions` tracks revenue

**What's Missing**:
- ❌ No CAC calculation (need ad spend data)
- ❌ No LTV calculation query
- ❌ No payback period calculation
- ❌ No gross margin calculation

**Where It's Tracked**:
- `/whats-for-dinner/supabase/migrations/003_multi_tenant_saas_schema.sql` - `usage_logs`
- `/whats-for-dinner/supabase/migrations/015_monetization_features.sql` - `customer_value_profiles`

**Proposed Implementation**:
```sql
-- LTV calculation (simplified)
WITH user_revenue AS (
  SELECT 
    user_id,
    SUM(CASE 
      WHEN plan = 'pro' THEN 9.99
      WHEN plan = 'premium' THEN 19.99
      ELSE 0
    END) as total_revenue,
    MIN(created_at) as first_subscription,
    MAX(current_period_end) as last_payment
  FROM subscriptions
  WHERE status = 'active'
  GROUP BY user_id
)
SELECT 
  AVG(total_revenue) as avg_ltv,
  AVG(EXTRACT(EPOCH FROM (last_payment - first_subscription)) / 2592000) as avg_months_active
FROM user_revenue;

-- Gross margin calculation
WITH costs AS (
  SELECT SUM(cost_usd) as total_ai_costs
  FROM usage_logs
  WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
),
revenue AS (
  SELECT SUM(CASE 
    WHEN plan = 'pro' THEN 9.99
    WHEN plan = 'premium' THEN 19.99
    ELSE 0
  END) as mrr
  FROM subscriptions
  WHERE status = 'active'
)
SELECT 
  r.mrr,
  c.total_ai_costs,
  r.mrr - c.total_ai_costs as gross_profit,
  ROUND((r.mrr - c.total_ai_costs) / NULLIF(r.mrr, 0) * 100, 2) as gross_margin_pct
FROM revenue r, costs c;
```

**Effort**: MEDIUM (4-6 hours)
**Priority**: HIGH (YC partners will ask for unit economics)

---

### Cost Structure

**Status**: ✅ **WELL INSTRUMENTED**

**What's Instrumented**:
- ✅ `usage_logs` tracks AI API costs per user/tenant
- ✅ `ai_cache` table tracks cache hits (cost optimization)
- ✅ `system_metrics` tracks cost analysis

**Where It's Tracked**:
- `/whats-for-dinner/supabase/migrations/003_multi_tenant_saas_schema.sql` - `usage_logs`, `ai_cache`
- `/whats-for-dinner/supabase/migrations/002_analytics_logging_tables.sql` - `system_metrics`

**What's Missing**:
- ❌ No infrastructure cost tracking (Vercel, Supabase)
- ❌ No total cost of goods sold (COGS) calculation

**Effort**: LOW (2-3 hours to add infrastructure cost tracking)
**Priority**: MEDIUM (Useful but not critical for YC)

---

## D. PRODUCT METRICS

### Recipe Generation Metrics

**Status**: ✅ **WELL INSTRUMENTED**

**What's Instrumented**:
- ✅ `recipe_metrics` tracks every recipe generation
- ✅ Tracks: ingredients used, cuisine type, cook time, calories, feedback score, API latency, model used
- ✅ `recipe_feedback` tracks user ratings

**Where It's Tracked**:
- `/whats-for-dinner/src/lib/analytics.ts` - `trackRecipeGeneration()`
- `/whats-for-dinner/supabase/migrations/002_analytics_logging_tables.sql` - Tables

**What's Missing**:
- ❌ No recipe success rate (recipes generated vs recipes cooked)
- ❌ No average time to generate recipe

**Effort**: LOW (1-2 hours to add success rate calculation)
**Priority**: MEDIUM (Useful product metric)

---

### User Satisfaction

**Status**: ✅ **WELL INSTRUMENTED**

**What's Instrumented**:
- ✅ `recipe_feedback` table tracks user ratings (1-5 stars, thumbs up/down)
- ✅ `recipe_metrics.feedback_score` tracks per-recipe feedback

**Where It's Tracked**:
- `/whats-for-dinner/supabase/migrations/002_analytics_logging_tables.sql` - `recipe_feedback`
- `/whats-for-dinner/src/lib/feedbackSystem.ts` - Feedback tracking

**What's Missing**:
- ❌ No NPS calculation
- ❌ No CSAT score

**Effort**: LOW (2-3 hours to add NPS survey)
**Priority**: MEDIUM (Nice to have)

---

## E. METRICS DASHBOARD RECOMMENDATIONS

### YC Interview Dashboard

**Required Metrics to Display**:

1. **Growth**
   - DAU/WAU/MAU (trending up)
   - New signups (daily/weekly)
   - Activation rate (% signups → first recipe)

2. **Engagement**
   - Recipes generated (daily/weekly)
   - Average recipes per user per week
   - Retention (7-day, 30-day)

3. **Revenue**
   - MRR (monthly recurring revenue)
   - ARPU (average revenue per user)
   - Conversion rate (% free → paid)

4. **Unit Economics**
   - CAC (customer acquisition cost)
   - LTV (lifetime value)
   - LTV:CAC ratio
   - Payback period

5. **Product**
   - Recipe generation success rate
   - Average time to generate recipe
   - User satisfaction (NPS/CSAT)

**Proposed Implementation**:
- Create `/apps/web/src/app/admin/metrics/page.tsx` dashboard
- Use Supabase queries to calculate metrics
- Display in simple charts (can use Chart.js or similar)

**Effort**: MEDIUM (1-2 days)
**Priority**: HIGH (YC partners will want to see this)

---

## F. METRICS GAPS SUMMARY

### Critical Gaps (Must Fix for YC)

1. **DAU/WAU/MAU Calculation** - HIGH priority, LOW effort
2. **Activation Rate** - HIGH priority, LOW effort
3. **Retention Rate** - HIGH priority, MEDIUM effort
4. **Conversion Funnel** - HIGH priority, MEDIUM effort
5. **MRR/ARPU Calculation** - HIGH priority, LOW effort
6. **Unit Economics (CAC, LTV)** - HIGH priority, MEDIUM effort
7. **Metrics Dashboard** - HIGH priority, MEDIUM effort

### Important Gaps (Should Fix)

8. **User Acquisition Channels** - MEDIUM priority, LOW effort
9. **Referral Dashboard** - MEDIUM priority, LOW effort
10. **Cost Structure Tracking** - MEDIUM priority, LOW effort

### Nice-to-Have Gaps

11. **NPS/CSAT** - LOW priority, LOW effort
12. **Recipe Success Rate** - LOW priority, LOW effort
13. **Power User Segmentation** - LOW priority, LOW effort

---

## G. IMPLEMENTATION PRIORITY

### Week 1 (Critical for YC)
- [ ] DAU/WAU/MAU calculation queries
- [ ] Activation rate calculation
- [ ] MRR/ARPU calculation queries
- [ ] Basic metrics dashboard

### Week 2 (Important)
- [ ] Retention rate calculation
- [ ] Conversion funnel queries
- [ ] Unit economics (CAC, LTV) calculations
- [ ] User acquisition channel tracking

### Week 3 (Nice to Have)
- [ ] Referral dashboard
- [ ] NPS/CSAT tracking
- [ ] Recipe success rate
- [ ] Power user segmentation

---

## H. DATA COLLECTION REQUIREMENTS

### Events to Track (If Not Already)

1. **`user_signed_up`** - When user creates account
   - Properties: `source`, `utm_source`, `utm_medium`, `utm_campaign`

2. **`recipe_generated`** - When recipe is generated
   - Properties: `recipe_id`, `ingredients_count`, `cook_time`, `cuisine_type`

3. **`recipe_viewed`** - When user views a recipe
   - Properties: `recipe_id`, `source` (generated, saved, shared)

4. **`recipe_cooked`** - When user marks recipe as cooked
   - Properties: `recipe_id`, `feedback_score`

5. **`subscription_started`** - When user subscribes
   - Properties: `plan`, `price`, `source`

6. **`subscription_cancelled`** - When user cancels
   - Properties: `plan`, `reason`, `retention_days`

---

## TODO: Founders to Supply

- [ ] Actual user count (current)
- [ ] Actual MRR (current)
- [ ] Actual retention rates (7-day, 30-day)
- [ ] Actual CAC by channel
- [ ] Actual LTV
- [ ] Actual activation rate
- [ ] Actual conversion rate (free → paid)
- [ ] Ad spend by channel (for CAC calculation)

---

**Last Updated**: 2025-01-27  
**Status**: Comprehensive analysis complete - Ready for implementation prioritization

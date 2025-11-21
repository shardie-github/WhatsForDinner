# Metrics & Forecasts

**Product:** What's For Dinner  
**Last Updated:** 2025-01-27  
**Forecast Period:** 12 months

---

## 1. METRICS OVERVIEW

### North Star Metric

**Weekly Active Meal Planners (WAMP)**
- **Definition:** Users who generate at least one meal suggestion or create/update a meal plan within a 7-day rolling window
- **Formula:** `COUNT(DISTINCT user_id WHERE meal_suggestions_generated > 0 OR meal_plans_updated > 0 IN last_7_days)`
- **Why:** This measures core product value delivery. If users aren't planning meals weekly, they're not getting value from the product. Meal planning is a weekly habit, making this the ideal frequency metric.
- **Target:** 60%+ of MAU should be WAMP

### Supporting Metrics

#### Acquisition Metrics

**1. Signups**
- **Definition:** Total number of new user registrations
- **Formula:** `COUNT(DISTINCT user_id WHERE created_at >= period_start)`
- **Data Source:** `users.created_at`
- **Event:** `USER_SIGNED_UP`

**2. Signups by Channel**
- **Definition:** New registrations broken down by acquisition source
- **Formula:** `COUNT(DISTINCT user_id) GROUP BY signup_source`
- **Data Source:** `users.metadata->>'signup_source'` or `events.props->>'source'` where `events.name = 'USER_SIGNED_UP'`
- **Channels:** organic, paid_ads, referral, content_marketing, app_store, partner

**3. Customer Acquisition Cost (CAC)**
- **Definition:** Total marketing spend divided by new signups in a period
- **Formula:** `SUM(marketing_spend) / COUNT(new_signups)`
- **Data Source:** Marketing spend tracking + signups
- **Target:** <$15 per user

**4. CAC by Channel**
- **Definition:** Marketing spend per channel divided by signups from that channel
- **Formula:** `channel_spend / channel_signups`
- **Data Source:** Channel-level spend tracking + signups by channel

#### Activation Metrics

**5. Activation Rate**
- **Definition:** Percentage of signups who generate their first meal suggestion within 7 days
- **Formula:** `COUNT(DISTINCT activated_users) / COUNT(DISTINCT signups) * 100`
- **Data Source:** `events` table where `name = 'MEAL_SUGGESTION_GENERATED'` (first occurrence per user)
- **Target:** 60%+ activation rate

**6. Time to Activation**
- **Definition:** Median time from signup to first meal suggestion generation
- **Formula:** `MEDIAN(TIMESTAMP_DIFF(first_suggestion_time, signup_time))`
- **Data Source:** `users.created_at` vs first `MEAL_SUGGESTION_GENERATED` event timestamp
- **Target:** <5 minutes

**7. Onboarding Completion Rate**
- **Definition:** Percentage of users who complete all onboarding steps (pantry setup, preferences, first suggestion)
- **Formula:** `COUNT(DISTINCT users WHERE onboarding_completed = true) / COUNT(DISTINCT signups) * 100`
- **Data Source:** `users.metadata->>'onboarding_completed'` or completion of all onboarding events
- **Target:** 70%+ completion rate

#### Engagement Metrics

**8. Daily Active Users (DAU)**
- **Definition:** Unique users who perform any action in the app on a given day
- **Formula:** `COUNT(DISTINCT user_id WHERE last_active_date = target_date)`
- **Data Source:** `events.ts` or `users.last_active_at`
- **Target:** 20%+ of MAU should be DAU

**9. Weekly Active Users (WAU)**
- **Definition:** Unique users active in a 7-day rolling window
- **Formula:** `COUNT(DISTINCT user_id WHERE last_active_date >= DATE_SUB(CURRENT_DATE, 7))`
- **Data Source:** `events.ts` aggregated by user
- **Target:** 60%+ of MAU should be WAU

**10. Monthly Active Users (MAU)**
- **Definition:** Unique users active in a 30-day rolling window
- **Formula:** `COUNT(DISTINCT user_id WHERE last_active_date >= DATE_SUB(CURRENT_DATE, 30))`
- **Data Source:** `events.ts` aggregated by user

**11. Meal Suggestions per Active User**
- **Definition:** Average number of meal suggestions generated per active user per week
- **Formula:** `SUM(meal_suggestions_generated) / COUNT(DISTINCT active_users)`
- **Data Source:** `events` where `name = 'MEAL_SUGGESTION_GENERATED'`
- **Target:** 3+ suggestions per active user per week

**12. Recipes Saved per User**
- **Definition:** Average number of recipes saved/bookmarked per user
- **Formula:** `SUM(recipes_saved) / COUNT(DISTINCT users)`
- **Data Source:** `recipes` table count per user or `RECIPE_SAVED` events
- **Target:** 5+ saved recipes per active user

#### Retention Metrics

**13. D1 Retention**
- **Definition:** Percentage of users who return 1 day after signup
- **Formula:** `COUNT(DISTINCT users active on day_1) / COUNT(DISTINCT signups) * 100`
- **Data Source:** `events.ts` filtered by signup cohort
- **Target:** 50%+ D1 retention

**14. D7 Retention**
- **Definition:** Percentage of users who return 7 days after signup
- **Formula:** `COUNT(DISTINCT users active on day_7) / COUNT(DISTINCT signups) * 100`
- **Data Source:** Cohort analysis using `events.ts`
- **Target:** 40%+ D7 retention

**15. D30 Retention**
- **Definition:** Percentage of users who return 30 days after signup
- **Formula:** `COUNT(DISTINCT users active on day_30) / COUNT(DISTINCT signups) * 100`
- **Data Source:** Cohort analysis using `events.ts`
- **Target:** 25%+ D30 retention

**16. Monthly Churn Rate**
- **Definition:** Percentage of paying users who cancel their subscription in a month
- **Formula:** `COUNT(cancelled_subscriptions) / COUNT(paying_users_at_start) * 100`
- **Data Source:** `users.plan` changes or subscription cancellation events
- **Target:** <5% monthly churn

#### Monetization Metrics

**17. Free-to-Paid Conversion Rate**
- **Definition:** Percentage of free users who upgrade to Pro or Family plan
- **Formula:** `COUNT(upgraded_users) / COUNT(free_users) * 100`
- **Data Source:** `users.plan` changes from 'free' to 'premium'/'partner'
- **Target:** 10%+ conversion rate

**18. Trial-to-Paid Conversion Rate**
- **Definition:** Percentage of trial users who convert to paid after trial ends
- **Formula:** `COUNT(converted_trials) / COUNT(completed_trials) * 100`
- **Data Source:** Trial completion events + subscription activation
- **Target:** 50%+ trial conversion

**19. Monthly Recurring Revenue (MRR)**
- **Definition:** Sum of all active subscription revenue in a month
- **Formula:** `SUM(monthly_subscription_price WHERE subscription_active = true)`
- **Data Source:** `users.plan` + pricing table (Pro: $9.99, Family: $19.99)
- **Calculation:** `(COUNT(pro_users) * 9.99) + (COUNT(family_users) * 19.99)`

**20. Annual Recurring Revenue (ARR)**
- **Definition:** MRR multiplied by 12
- **Formula:** `MRR * 12`

**21. Average Revenue Per User (ARPU)**
- **Definition:** Average monthly revenue per paying user
- **Formula:** `MRR / COUNT(paying_users)`
- **Target:** $12+ ARPU (mix of Pro and Family plans)

**22. Lifetime Value (LTV)**
- **Definition:** Average total revenue per user over their lifetime
- **Formula:** `ARPU * average_lifetime_months`
- **Calculation:** `ARPU / monthly_churn_rate`
- **Target:** $200+ LTV

**23. LTV:CAC Ratio**
- **Definition:** Lifetime value divided by customer acquisition cost
- **Formula:** `LTV / CAC`
- **Target:** >3:1 (ideally 5:1+)

---

## 2. EVENT MODEL

### Event Schema

All events should be stored in the `events` table with the following structure:
- `id`: UUID (primary key)
- `user_id`: UUID (nullable for anonymous events)
- `name`: String (event name)
- `props`: JSONB (event properties)
- `ts`: Timestamp (event timestamp)

### Core Events

#### User Lifecycle Events

**USER_SIGNED_UP**
- **When:** User completes registration
- **Location:** `apps/web/src/app/auth/page.tsx` or auth callback handlers
- **Required Properties:**
  ```json
  {
    "source": "organic|paid_ads|referral|content_marketing|app_store|partner",
    "referral_code": "string|null",
    "platform": "web|ios|android",
    "user_agent": "string"
  }
  ```
- **Optional Properties:**
  ```json
  {
    "utm_source": "string",
    "utm_medium": "string",
    "utm_campaign": "string"
  }
  ```

**USER_ONBOARDING_STARTED**
- **When:** User begins onboarding flow
- **Location:** `apps/web/src/app/onboarding/page.tsx`
- **Required Properties:**
  ```json
  {
    "step": "pantry_setup|preferences|first_suggestion"
  }
  ```

**USER_ONBOARDING_COMPLETED**
- **When:** User completes all onboarding steps
- **Location:** `apps/web/src/app/onboarding/page.tsx` (final step)
- **Required Properties:**
  ```json
  {
    "time_to_complete_seconds": "number",
    "steps_completed": ["pantry_setup", "preferences", "first_suggestion"]
  }
  ```

**USER_ACTIVATED**
- **When:** User generates their first meal suggestion
- **Location:** Meal suggestion generation API endpoints
- **Required Properties:**
  ```json
  {
    "time_to_activation_seconds": "number",
    "suggestion_method": "ai_generate|quick_generate|surprise_me"
  }
  ```

#### Product Usage Events

**MEAL_SUGGESTION_GENERATED**
- **When:** User generates a meal suggestion (AI or manual)
- **Location:** 
  - `apps/web/src/app/api/meal-planner/generate/route.ts`
  - `apps/web/src/app/surprise-me/page.tsx`
  - Meal generation components
- **Required Properties:**
  ```json
  {
    "suggestion_id": "uuid",
    "method": "ai_generate|quick_generate|surprise_me|manual",
    "pantry_items_used": "number",
    "dietary_preferences_applied": "array",
    "generation_time_ms": "number"
  }
  ```
- **Optional Properties:**
  ```json
  {
    "ai_model": "gpt-4|gpt-3.5-turbo",
    "tokens_used": "number",
    "cost_usd": "number"
  }
  ```

**MEAL_PLAN_CREATED**
- **When:** User creates a new meal plan
- **Location:** `apps/web/src/app/meal-planner/page.tsx`
- **Required Properties:**
  ```json
  {
    "meal_plan_id": "uuid",
    "days_planned": "number",
    "meals_count": "number",
    "household_id": "uuid|null"
  }
  ```

**MEAL_PLAN_UPDATED**
- **When:** User modifies an existing meal plan
- **Location:** Meal planner components
- **Required Properties:**
  ```json
  {
    "meal_plan_id": "uuid",
    "change_type": "meal_added|meal_removed|meal_swapped|day_added|day_removed"
  }
  ```

**RECIPE_SAVED**
- **When:** User saves/bookmarks a recipe
- **Location:** Recipe detail pages, recipe cards
- **Required Properties:**
  ```json
  {
    "recipe_id": "uuid",
    "recipe_source": "curated|partner|user",
    "source_recipe_id": "uuid|null"
  }
  ```

**RECIPE_VIEWED**
- **When:** User views a recipe detail page
- **Location:** Recipe detail pages
- **Required Properties:**
  ```json
  {
    "recipe_id": "uuid",
    "recipe_source": "curated|partner|user",
    "view_duration_seconds": "number"
  }
  ```

**GROCERY_LIST_CREATED**
- **When:** User creates a grocery list
- **Location:** `apps/web/src/app/grocery/page.tsx`
- **Required Properties:**
  ```json
  {
    "grocery_list_id": "uuid",
    "items_count": "number",
    "source": "meal_plan|manual|pantry_restock"
  }
  ```

**GROCERY_LIST_EXPORTED**
- **When:** User exports grocery list (to partner, print, etc.)
- **Location:** Grocery list export functionality
- **Required Properties:**
  ```json
  {
    "grocery_list_id": "uuid",
    "export_method": "print|email|partner_integration|copy",
    "partner_name": "string|null"
  }
  ```

**PANTRY_ITEM_ADDED**
- **When:** User adds item to pantry
- **Location:** Pantry management components
- **Required Properties:**
  ```json
  {
    "item_name": "string",
    "add_method": "manual|barcode_scan|receipt_import|ai_detection",
    "expiration_date": "date|null"
  }
  ```

**PANTRY_ITEM_USED**
- **When:** User marks pantry item as used/consumed
- **Location:** Pantry management components
- **Required Properties:**
  ```json
  {
    "item_id": "uuid",
    "used_in_recipe": "boolean",
    "recipe_id": "uuid|null"
  }
  ```

#### Monetization Events

**SUBSCRIPTION_TRIAL_STARTED**
- **When:** User starts a free trial of Pro or Family plan
- **Location:** `apps/web/src/app/pricing/page.tsx`, subscription checkout
- **Required Properties:**
  ```json
  {
    "plan": "pro|family",
    "billing_cycle": "monthly|annual",
    "trial_days": "number"
  }
  ```

**SUBSCRIPTION_UPGRADED**
- **When:** User upgrades from free to paid or from Pro to Family
- **Location:** Subscription management pages
- **Required Properties:**
  ```json
  {
    "from_plan": "free|pro",
    "to_plan": "pro|family",
    "billing_cycle": "monthly|annual",
    "revenue_usd": "number"
  }
  ```

**SUBSCRIPTION_DOWNGRADED**
- **When:** User downgrades from paid to free or Family to Pro
- **Location:** Subscription management pages
- **Required Properties:**
  ```json
  {
    "from_plan": "pro|family",
    "to_plan": "free|pro",
    "reason": "string|null"
  }
  ```

**SUBSCRIPTION_CANCELLED**
- **When:** User cancels their subscription
- **Location:** Subscription cancellation flow
- **Required Properties:**
  ```json
  {
    "plan": "pro|family",
    "cancellation_reason": "string|null",
    "retention_offer_shown": "boolean",
    "retention_offer_accepted": "boolean"
  }
  ```

**SUBSCRIPTION_RENEWED**
- **When:** Subscription successfully renews (monthly or annual)
- **Location:** Payment processing webhooks
- **Required Properties:**
  ```json
  {
    "plan": "pro|family",
    "billing_cycle": "monthly|annual",
    "revenue_usd": "number"
  }
  ```

#### Engagement Events

**APP_OPENED**
- **When:** User opens the app (web or mobile)
- **Location:** App initialization, page load handlers
- **Required Properties:**
  ```json
  {
    "platform": "web|ios|android",
    "session_id": "uuid"
  }
  ```

**FEATURE_USED**
- **When:** User uses a specific feature
- **Location:** Various feature components
- **Required Properties:**
  ```json
  {
    "feature_name": "meal_planner|pantry|grocery_list|recipes|health_tracker|family_sharing",
    "feature_version": "string"
  }
  ```

**REFERRAL_CODE_SHARED**
- **When:** User shares their referral code
- **Location:** Referral program pages
- **Required Properties:**
  ```json
  {
    "referral_code": "string",
    "share_method": "link|email|social|copy"
  }
  ```

**REFERRAL_SIGNUP_COMPLETED**
- **When:** A referred user completes signup
- **Location:** Referral signup flow
- **Required Properties:**
  ```json
  {
    "referral_code": "string",
    "referrer_user_id": "uuid",
    "referee_user_id": "uuid"
  }
  ```

---

## 3. DATA STORAGE PLAN

### Primary Event Storage

**Table: `events`** (already exists in schema)
- Stores all product events
- Indexed on `user_id` and `ts` for fast queries
- JSONB `props` column for flexible event properties

**Recommended Indexes:**
```sql
CREATE INDEX idx_events_name_ts ON events(name, ts);
CREATE INDEX idx_events_user_name_ts ON events(user_id, name, ts);
CREATE INDEX idx_events_props_source ON events USING GIN ((props->>'source'));
```

### Aggregated Metrics Tables

**Table: `user_metrics_daily`**
- Pre-aggregated daily metrics per user
- Updated via scheduled job (hourly or daily)

```sql
CREATE TABLE user_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  metric_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  meal_suggestions_count INT DEFAULT 0,
  meal_plans_created INT DEFAULT 0,
  recipes_saved INT DEFAULT 0,
  grocery_lists_created INT DEFAULT 0,
  pantry_items_added INT DEFAULT 0,
  session_count INT DEFAULT 0,
  session_duration_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

CREATE INDEX idx_user_metrics_daily_date ON user_metrics_daily(metric_date);
CREATE INDEX idx_user_metrics_daily_user_date ON user_metrics_daily(user_id, metric_date);
```

**Table: `cohort_metrics`**
- Cohort-based retention metrics
- Updated daily for signup cohorts

```sql
CREATE TABLE cohort_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_date DATE NOT NULL,
  cohort_size INT NOT NULL,
  d1_active INT DEFAULT 0,
  d7_active INT DEFAULT 0,
  d30_active INT DEFAULT 0,
  d1_retention DECIMAL(5,2) DEFAULT 0,
  d7_retention DECIMAL(5,2) DEFAULT 0,
  d30_retention DECIMAL(5,2) DEFAULT 0,
  activated_count INT DEFAULT 0,
  activation_rate DECIMAL(5,2) DEFAULT 0,
  converted_count INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_date)
);

CREATE INDEX idx_cohort_metrics_date ON cohort_metrics(cohort_date);
```

**Table: `revenue_metrics_daily`**
- Daily revenue aggregation
- Updated via payment webhooks and scheduled jobs

```sql
CREATE TABLE revenue_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  mrr DECIMAL(10,2) DEFAULT 0,
  new_mrr DECIMAL(10,2) DEFAULT 0,
  expansion_mrr DECIMAL(10,2) DEFAULT 0,
  contraction_mrr DECIMAL(10,2) DEFAULT 0,
  churned_mrr DECIMAL(10,2) DEFAULT 0,
  paying_users_count INT DEFAULT 0,
  new_paying_users INT DEFAULT 0,
  churned_users INT DEFAULT 0,
  arpu DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_date)
);

CREATE INDEX idx_revenue_metrics_daily_date ON revenue_metrics_daily(metric_date);
```

### Analytics Integration

**Recommended Tools:**
1. **PostHog** (already mentioned in cost forecasts)
   - Real-time event tracking
   - Funnel analysis
   - Cohort analysis
   - Feature flags

2. **Supabase Analytics** (built-in)
   - Database query analytics
   - Performance monitoring

3. **Custom Dashboards**
   - Build using aggregated tables
   - Use tools like Metabase, Retool, or custom React dashboards

### Event Tracking Implementation

**Location:** `apps/web/src/lib/analytics/events.ts` (create if doesn't exist)

```typescript
// Example implementation structure
export async function trackEvent(
  name: string,
  props: Record<string, any>,
  userId?: string
) {
  // Send to PostHog
  posthog.capture(name, { ...props, userId });
  
  // Store in Supabase events table
  await supabase.from('events').insert({
    user_id: userId,
    name,
    props,
    ts: new Date()
  });
}
```

---

## 4. FORECASTING SCENARIOS

### Core Assumptions

**User Growth Assumptions:**
- **Month 1-3:** [PLACEHOLDER: 20%] MoM growth (early stage)
- **Month 4-6:** [PLACEHOLDER: 25%] MoM growth (growth phase)
- **Month 7-12:** [PLACEHOLDER: 15%] MoM growth (maturation)

**Activation & Retention Assumptions:**
- **Activation Rate:** [PLACEHOLDER: 60%] of signups activate within 7 days
- **D7 Retention:** [PLACEHOLDER: 40%] of activated users return after 7 days
- **D30 Retention:** [PLACEHOLDER: 25%] of activated users return after 30 days
- **Monthly Churn (Free):** [PLACEHOLDER: 10%] of free users become inactive monthly
- **Monthly Churn (Paid):** [PLACEHOLDER: 5%] of paying users cancel monthly

**Monetization Assumptions:**
- **Free-to-Paid Conversion:** [PLACEHOLDER: 10%] of free users upgrade to paid
- **Trial Conversion:** [PLACEHOLDER: 50%] of trial users convert to paid
- **Plan Mix:** [PLACEHOLDER: 70%] Pro, [PLACEHOLDER: 30%] Family
- **Annual Plan Adoption:** [PLACEHOLDER: 30%] of paying users choose annual billing
- **ARPU (Monthly):** [PLACEHOLDER: $12.00] (weighted average of Pro $9.99 and Family $19.99)
- **ARPU (Annual):** [PLACEHOLDER: $11.00] (with annual discount)

**Acquisition Assumptions:**
- **CAC (Average):** [PLACEHOLDER: $12.00] per user
- **CAC by Channel:**
  - Organic: [PLACEHOLDER: $0]
  - Content Marketing: [PLACEHOLDER: $5]
  - Paid Ads: [PLACEHOLDER: $20]
  - Referral: [PLACEHOLDER: $2] (incentive cost)
  - App Store: [PLACEHOLDER: $0]
- **Channel Mix:**
  - Organic: [PLACEHOLDER: 40%]
  - Content Marketing: [PLACEHOLDER: 25%]
  - Paid Ads: [PLACEHOLDER: 20%]
  - Referral: [PLACEHOLDER: 10%]
  - App Store: [PLACEHOLDER: 5%]

**Engagement Assumptions:**
- **WAU/MAU Ratio:** [PLACEHOLDER: 60%] (target engagement)
- **DAU/MAU Ratio:** [PLACEHOLDER: 20%] (daily engagement)
- **Meal Suggestions per WAU:** [PLACEHOLDER: 3] per week
- **Recipes Saved per Active User:** [PLACEHOLDER: 5] per month

### Scenario 1: Conservative Growth

**Assumptions:**
- MoM Growth: 15% (consistent)
- Activation Rate: 55%
- D7 Retention: 35%
- D30 Retention: 20%
- Free-to-Paid Conversion: 8%
- Monthly Churn (Paid): 6%
- CAC: $15

**12-Month Projection:**

| Month | Signups | MAU | Activated Users | Paying Users | MRR | ARR | CAC | LTV | LTV:CAC |
|-------|---------|-----|-----------------|--------------|-----|-----|-----|-----|---------|
| 1 | [PLACEHOLDER: 100] | [PLACEHOLDER: 70] | [PLACEHOLDER: 55] | [PLACEHOLDER: 0] | $0 | $0 | $15 | - | - |
| 2 | [PLACEHOLDER: 115] | [PLACEHOLDER: 120] | [PLACEHOLDER: 95] | [PLACEHOLDER: 8] | [PLACEHOLDER: $96] | [PLACEHOLDER: $1,152] | $15 | [PLACEHOLDER: $200] | [PLACEHOLDER: 13:1] |
| 3 | [PLACEHOLDER: 132] | [PLACEHOLDER: 180] | [PLACEHOLDER: 143] | [PLACEHOLDER: 19] | [PLACEHOLDER: $228] | [PLACEHOLDER: $2,736] | $15 | $200 | 13:1 |
| 6 | [PLACEHOLDER: 200] | [PLACEHOLDER: 400] | [PLACEHOLDER: 260] | [PLACEHOLDER: 52] | [PLACEHOLDER: $624] | [PLACEHOLDER: $7,488] | $15 | $200 | 13:1 |
| 9 | [PLACEHOLDER: 304] | [PLACEHOLDER: 800] | [PLACEHOLDER: 484] | [PLACEHOLDER: 116] | [PLACEHOLDER: $1,392] | [PLACEHOLDER: $16,704] | $15 | $200 | 13:1 |
| 12 | [PLACEHOLDER: 463] | [PLACEHOLDER: 1,500] | [PLACEHOLDER: 825] | [PLACEHOLDER: 240] | [PLACEHOLDER: $2,880] | [PLACEHOLDER: $34,560] | $15 | $200 | 13:1 |

**Key Milestones:**
- **Month 3:** [PLACEHOLDER: 180] MAU, [PLACEHOLDER: $228] MRR
- **Month 6:** [PLACEHOLDER: 400] MAU, [PLACEHOLDER: $624] MRR
- **Month 12:** [PLACEHOLDER: 1,500] MAU, [PLACEHOLDER: $2,880] MRR

### Scenario 2: Aggressive Growth

**Assumptions:**
- MoM Growth: 30% (aggressive marketing)
- Activation Rate: 65%
- D7 Retention: 45%
- D30 Retention: 30%
- Free-to-Paid Conversion: 12%
- Monthly Churn (Paid): 4%
- CAC: $18 (higher due to paid ads)

**12-Month Projection:**

| Month | Signups | MAU | Activated Users | Paying Users | MRR | ARR | CAC | LTV | LTV:CAC |
|-------|---------|-----|-----------------|--------------|-----|-----|-----|-----|---------|
| 1 | [PLACEHOLDER: 100] | [PLACEHOLDER: 70] | [PLACEHOLDER: 65] | [PLACEHOLDER: 0] | $0 | $0 | $18 | - | - |
| 2 | [PLACEHOLDER: 130] | [PLACEHOLDER: 140] | [PLACEHOLDER: 130] | [PLACEHOLDER: 16] | [PLACEHOLDER: $192] | [PLACEHOLDER: $2,304] | $18 | [PLACEHOLDER: $300] | [PLACEHOLDER: 17:1] |
| 3 | [PLACEHOLDER: 169] | [PLACEHOLDER: 250] | [PLACEHOLDER: 220] | [PLACEHOLDER: 38] | [PLACEHOLDER: $456] | [PLACEHOLDER: $5,472] | $18 | $300 | 17:1 |
| 6 | [PLACEHOLDER: 371] | [PLACEHOLDER: 800] | [PLACEHOLDER: 650] | [PLACEHOLDER: 156] | [PLACEHOLDER: $1,872] | [PLACEHOLDER: $22,464] | $18 | $300 | 17:1 |
| 9 | [PLACEHOLDER: 814] | [PLACEHOLDER: 2,500] | [PLACEHOLDER: 2,000] | [PLACEHOLDER: 480] | [PLACEHOLDER: $5,760] | [PLACEHOLDER: $69,120] | $18 | $300 | 17:1 |
| 12 | [PLACEHOLDER: 1,786] | [PLACEHOLDER: 7,000] | [PLACEHOLDER: 5,600] | [PLACEHOLDER: 1,344] | [PLACEHOLDER: $16,128] | [PLACEHOLDER: $193,536] | $18 | $300 | 17:1 |

**Key Milestones:**
- **Month 3:** [PLACEHOLDER: 250] MAU, [PLACEHOLDER: $456] MRR
- **Month 6:** [PLACEHOLDER: 800] MAU, [PLACEHOLDER: $1,872] MRR
- **Month 12:** [PLACEHOLDER: 7,000] MAU, [PLACEHOLDER: $16,128] MRR

### Forecasting Model Structure

**User Funnel:**
```
Signups → Activated Users → Active Users (WAU) → Paying Users → MRR
```

**Key Calculations:**
1. **MAU Growth:** `previous_MAU * (1 + MoM_growth_rate) + new_signups * activation_rate * retention_rate`
2. **Activated Users:** `signups * activation_rate`
3. **WAU:** `MAU * WAU_MAU_ratio`
4. **Paying Users:** `cumulative_activated_users * conversion_rate * (1 - churn_rate)^months`
5. **MRR:** `paying_users * ARPU`
6. **ARR:** `MRR * 12`
7. **LTV:** `ARPU / monthly_churn_rate`
8. **LTV:CAC:** `LTV / CAC`

### Revenue Breakdown by Plan

**Monthly Plan Revenue:**
- Pro Monthly: `pro_monthly_users * 9.99`
- Family Monthly: `family_monthly_users * 19.99`

**Annual Plan Revenue (prorated to MRR):**
- Pro Annual: `pro_annual_users * 99.99 / 12`
- Family Annual: `family_annual_users * 199.99 / 12`

**Total MRR:** Sum of all plan revenues

### Usage-to-Revenue Model

**Core Hypothesis:** More active users (higher WAU) → Higher engagement → Higher conversion → Higher MRR

**Key Relationships:**
1. **WAU → Conversion:** Users who are weekly active are [PLACEHOLDER: 3x] more likely to convert than inactive users
2. **Meal Suggestions → Conversion:** Users generating [PLACEHOLDER: 5+] suggestions per week are [PLACEHOLDER: 2x] more likely to convert
3. **Recipes Saved → Retention:** Users with [PLACEHOLDER: 10+] saved recipes have [PLACEHOLDER: 50%] lower churn

**Forecasting Formula:**
```
Conversion_Rate = base_conversion_rate * 
  (1 + WAU_multiplier * (WAU_ratio - target_WAU_ratio)) * 
  (1 + engagement_multiplier * (suggestions_per_user / target_suggestions))
```

---

## 5. IMPLEMENTATION PRIORITIES

### Phase 1: Foundation (Weeks 1-2)
1. ✅ Set up event tracking infrastructure (`events` table)
2. ✅ Implement core event tracking functions
3. ✅ Track USER_SIGNED_UP events
4. ✅ Track MEAL_SUGGESTION_GENERATED events
5. ✅ Create basic analytics dashboard

### Phase 2: Core Metrics (Weeks 3-4)
1. ✅ Implement activation tracking
2. ✅ Set up daily aggregation jobs
3. ✅ Track monetization events (subscriptions)
4. ✅ Calculate MRR, ARPU, conversion rates
5. ✅ Build cohort retention analysis

### Phase 3: Advanced Analytics (Weeks 5-6)
1. ✅ Set up funnel analysis
2. ✅ Implement LTV calculations
3. ✅ Track CAC by channel
4. ✅ Build forecasting model
5. ✅ Create executive dashboard

### Phase 4: Optimization (Ongoing)
1. ✅ A/B test conversion flows
2. ✅ Optimize activation rates
3. ✅ Reduce churn through engagement
4. ✅ Improve CAC efficiency
5. ✅ Refine forecasting model with real data

---

## 6. METRICS DASHBOARD REQUIREMENTS

### Executive Dashboard
- North Star Metric (WAMP)
- MRR trend (last 90 days)
- MAU trend (last 90 days)
- Conversion funnel (Signups → Activated → Paying)
- Key ratios (LTV:CAC, WAU/MAU, Churn Rate)

### Product Dashboard
- Activation rate by cohort
- Retention curves (D1, D7, D30)
- Feature usage heatmap
- Engagement metrics (suggestions per user, recipes saved)
- Error rates and performance metrics

### Growth Dashboard
- Signups by channel
- CAC by channel
- Referral program performance
- Conversion rates by acquisition source
- Viral coefficient

### Revenue Dashboard
- MRR breakdown by plan
- New MRR vs Churned MRR
- ARPU trends
- Subscription lifecycle (trials → conversions → renewals → churn)
- Revenue forecasts vs actuals

---

## NOTES

- All placeholder values marked with `[PLACEHOLDER: value]` should be replaced with actual assumptions or historical data
- Forecasting model should be updated monthly with actual results to improve accuracy
- Event tracking should be implemented incrementally, starting with highest-priority events
- Consider privacy implications when tracking user events (GDPR compliance)
- All revenue calculations assume USD pricing
- Churn calculations should account for both cancellations and payment failures

---

**Next Steps:**
1. Review and adjust placeholder assumptions based on market research or historical data
2. Implement event tracking for Phase 1 events
3. Set up data aggregation jobs
4. Build initial analytics dashboards
5. Begin tracking and refining forecasts monthly

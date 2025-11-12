# Metrics Dashboard Specification

**Generated:** 2025-01-27  
**Purpose:** Define metrics dashboard structure and KPIs

---

## Overview

This dashboard provides real-time visibility into key business metrics: revenue, users, acquisition, retention, and unit economics.

**Data Sources:**
- `public.metrics_daily` - Aggregated daily metrics
- `public.orders` - Order data
- `public.spend` - Ad spend data
- `public.events` - User events

**Update Frequency:** Daily (via ETL at 01:10 America/Toronto)

---

## Dashboard Sections

### 1. Revenue Overview

**Metrics:**
- **MRR (Monthly Recurring Revenue)** - Sum of `revenue_cents` for last 30 days / 100
- **ARR (Annual Recurring Revenue)** - MRR × 12
- **Revenue Growth %** - Month-over-month growth
- **Passive Revenue** - Affiliate + API + Data Insights revenue

**Visualization:** Line chart (30-day trend), big number cards

**Filters:** Date range (7d, 30d, 90d, 1y)

---

### 2. User Metrics

**Metrics:**
- **Total Users** - Count of unique users from `events` table
- **MAU (Monthly Active Users)** - Unique users active in last 30 days
- **Activation Rate** - % of signups who generate first meal plan
- **7-Day Retention** - % of users active after 7 days
- **30-Day Retention** - % of users active after 30 days

**Visualization:** Bar chart (activation, retention), line chart (MAU trend)

**Filters:** User segment (solo, family), date range

---

### 3. Acquisition & CAC

**Metrics:**
- **New Users** - Count of new signups (last 30 days)
- **Blended CAC** - Weighted average: (Organic × $0 + Paid × $40 + Referral × $5) / Total
- **Paid CAC** - Ad spend / New users from paid channels
- **Referral Rate** - % of new users from referrals
- **Organic Rate** - % of new users from organic channels

**Visualization:** Funnel chart (acquisition channels), line chart (CAC trend)

**Filters:** Channel (organic, paid, referral), date range

---

### 4. Unit Economics

**Metrics:**
- **ARPU (Average Revenue Per User)** - MRR / Total Users
- **LTV (Lifetime Value)** - ARPU / Monthly Churn Rate
- **LTV/CAC Ratio** - LTV / CAC
- **Payback Period** - Months to recover CAC
- **Gross Margin %** - (Revenue - COGS) / Revenue × 100

**Visualization:** Big number cards, trend lines

**Filters:** Date range

---

### 5. Conversion Funnel

**Metrics:**
- **Sessions** - Count of `session_start` events
- **Add to Carts** - Count of `add_to_cart` events
- **Orders** - Count of orders
- **Conversion Rate** - Orders / Sessions × 100
- **AOV (Average Order Value)** - Average `total_cents` / 100

**Visualization:** Funnel chart, conversion rate trend

**Filters:** Date range, user segment

---

### 6. Ad Spend & Performance

**Metrics:**
- **Total Ad Spend** - Sum of `spend_cents` from `spend` table / 100
- **Clicks** - Sum of `clicks`
- **Impressions** - Sum of `impressions`
- **CPC (Cost Per Click)** - Spend / Clicks
- **CTR (Click-Through Rate)** - Clicks / Impressions × 100
- **Conversions** - Sum of `conv`

**Visualization:** Bar chart (by platform), line chart (spend trend)

**Filters:** Platform (meta, tiktok), date range

---

### 7. Retention Cohort Analysis

**Metrics:**
- **Cohort Retention** - % of users from each cohort still active
- **Cohort Size** - Number of users in each cohort
- **Retention by Day** - Day 1, 7, 14, 30 retention rates

**Visualization:** Heatmap (cohort × retention day), line chart (retention curves)

**Filters:** Cohort (weekly, monthly), date range

---

## Key Performance Indicators (KPIs)

### Primary KPIs

1. **MRR Growth** - Target: +20% month-over-month
2. **Activation Rate** - Target: 75%+
3. **30-Day Retention** - Target: 46%+
4. **LTV/CAC Ratio** - Target: 4x+
5. **Blended CAC** - Target: <$25

### Secondary KPIs

1. **7-Day Retention** - Target: 55%+
2. **Referral Rate** - Target: 20%+
3. **Conversion Rate** - Target: 5%+
4. **Gross Margin %** - Target: 85%+
5. **Payback Period** - Target: <3 months

---

## Alert Thresholds

**Critical Alerts:**
- MRR drops >10% week-over-week
- Activation rate drops below 50%
- CAC exceeds $50
- LTV/CAC drops below 2x

**Warning Alerts:**
- 30-day retention drops below 35%
- Conversion rate drops below 3%
- Ad spend exceeds budget by 20%

---

## Implementation Notes

**Dashboard Tool:** Recommended: Metabase, Superset, or custom React dashboard

**Data Refresh:** Daily at 01:10 America/Toronto (via ETL)

**Access Control:** 
- Admin: Full access
- Growth Lead: Read-only
- Product Lead: Read-only

**Export:** CSV export available for all metrics

---

## Sample Queries

### MRR Calculation
```sql
SELECT 
  SUM(revenue_cents) / 100.0 as mrr
FROM public.metrics_daily
WHERE day >= CURRENT_DATE - INTERVAL '30 days'
```

### Activation Rate
```sql
SELECT 
  COUNT(DISTINCT CASE WHEN event_name = 'meal_plan_generated' THEN user_id END) * 100.0 / 
  COUNT(DISTINCT CASE WHEN event_name = 'user_signed_up' THEN user_id END) as activation_rate
FROM public.events
WHERE occurred_at >= CURRENT_DATE - INTERVAL '30 days'
```

### Blended CAC
```sql
WITH acquisition_costs AS (
  SELECT 
    SUM(spend_cents) / 100.0 as paid_spend,
    COUNT(DISTINCT user_id) FILTER (WHERE source = 'paid') as paid_users,
    COUNT(DISTINCT user_id) FILTER (WHERE source = 'referral') as referral_users,
    COUNT(DISTINCT user_id) FILTER (WHERE source = 'organic') as organic_users
  FROM public.orders o
  LEFT JOIN public.spend s ON DATE(o.placed_at) = s.date
  WHERE o.placed_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
  CASE 
    WHEN (paid_users + referral_users + organic_users) > 0 
    THEN (paid_spend + (referral_users * 5) + (organic_users * 0)) / 
         (paid_users + referral_users + organic_users)
    ELSE 0 
  END as blended_cac
FROM acquisition_costs;
```

---

*Dashboard implementation should query these tables and display metrics as specified above.*

# Metrics Overview

**Purpose**: Key metrics for investors  
**Cross-Reference**: `/yc/YC_METRICS_CHECKLIST.md` for detailed metrics

---

## User Metrics

### Growth Metrics

**Current** (Founders to fill in):
- **Total Users**: [TBD]
- **DAU (Daily Active Users)**: [TBD]
- **WAU (Weekly Active Users)**: [TBD]
- **MAU (Monthly Active Users)**: [TBD]

**Growth Rate**:
- Week-over-week growth: [TBD]%
- Month-over-month growth: [TBD]%

**See**: `/yc/YC_METRICS_CHECKLIST.md` for calculation queries

---

### Engagement Metrics

**Current** (Founders to fill in):
- **Recipes Generated**: [TBD] total, [TBD] per user/week
- **Average Session Duration**: [TBD] minutes
- **Time to First Recipe**: [TBD] seconds (target: < 30 seconds)
- **Pantry Items Tracked**: [TBD] average per user

---

### Retention Metrics

**Current** (Founders to fill in):
- **Day 1 Retention**: [TBD]%
- **Day 7 Retention**: [TBD]% (target: 40%+)
- **Day 30 Retention**: [TBD]% (target: 20%+)
- **Weekly Retention**: [TBD]%

**Cohort Analysis**: [TBD] - See `/yc/YC_METRICS_CHECKLIST.md` for queries

---

## Revenue Metrics

### Subscription Metrics

**Current** (Founders to fill in):
- **MRR (Monthly Recurring Revenue)**: $[TBD]
- **ARR (Annual Recurring Revenue)**: $[TBD]
- **ARPU (Average Revenue Per User)**: $[TBD]/month (target: $12/month)

**Subscription Breakdown**:
- Free tier: [TBD] users
- Pro ($9.99/month): [TBD] users
- Premium ($19.99/month): [TBD] users

---

### Conversion Metrics

**Current** (Founders to fill in):
- **Signup → First Recipe**: [TBD]% (activation rate)
- **Free → Paid Conversion**: [TBD]% (target: 5%+)
- **Trial → Paid Conversion**: [TBD]% (if applicable)

---

### Unit Economics

**Current** (Founders to fill in):
- **CAC (Customer Acquisition Cost)**: $[TBD] (by channel)
- **LTV (Lifetime Value)**: $[TBD]
- **LTV:CAC Ratio**: [TBD]:1 (target: 3:1+)
- **Payback Period**: [TBD] months (target: < 12 months)
- **Gross Margin**: [TBD]% (target: 85%+)

**See**: `/yc/FINANCIAL_MODEL.md` for detailed unit economics

---

## Product Metrics

### Feature Usage

**Current** (Founders to fill in):
- **Pantry Scanning**: [TBD]% of users
- **Recipe Generation**: [TBD]% of users
- **Shopping List**: [TBD]% of users
- **Meal Planning**: [TBD]% of users (if available)

---

### Quality Metrics

**Current** (Founders to fill in):
- **Recipe Rating (Average)**: [TBD]/5 stars
- **Recipe Success Rate**: [TBD]% (users who cook the recipe)
- **User Satisfaction (NPS)**: [TBD] (target: 50+)

---

## Distribution Metrics

### Acquisition Channels

**Current** (Founders to fill in):
- **Organic Search (SEO)**: [TBD] signups/month
- **Social Media**: [TBD] signups/month
- **Referrals**: [TBD] signups/month
- **Paid Ads**: [TBD] signups/month

**CAC by Channel**:
- SEO: $[TBD] (organic = $0)
- Social: $[TBD]
- Referrals: $[TBD] (organic = $0)
- Paid Ads: $[TBD]

**See**: `/yc/YC_DISTRIBUTION_PLAN.md` for distribution strategy

---

## Operational Metrics

### Infrastructure Costs

**Current** (Founders to fill in):
- **Vercel (Hosting)**: $[TBD]/month
- **Supabase (Database)**: $[TBD]/month
- **OpenAI (AI API)**: $[TBD]/month
- **Total Infrastructure**: $[TBD]/month

**Cost per User**: $[TBD]/user/month

---

### Performance Metrics

**Current** (Founders to fill in):
- **API Response Time**: [TBD]ms (target: < 500ms)
- **Page Load Time**: [TBD]s (target: < 2.5s)
- **Uptime**: [TBD]% (target: 99.9%+)

---

## Targets (Next 90 Days)

### User Targets
- **10K users** (from [current])
- **40% weekly retention**
- **5% free → paid conversion**

### Revenue Targets
- **$10K MRR** (from $[current])
- **$12 ARPU** (blended)

### Product Targets
- **< 30 seconds** time to first recipe
- **4.5+ stars** average recipe rating

---

## How to Calculate

**See**: `/yc/YC_METRICS_CHECKLIST.md` for:
- SQL queries for all metrics
- Calculation formulas
- Dashboard implementation guide

---

## Data Collection

**Where metrics are stored**:
- `analytics_events` table - User behavior
- `recipe_metrics` table - Recipe performance
- `subscriptions` table - Revenue data
- `users` table - User counts

**How to access**:
- Supabase Dashboard → SQL Editor
- Run queries from `/yc/YC_METRICS_CHECKLIST.md`
- Or build dashboard at `/admin/metrics` (see `/yc/YC_GAP_ANALYSIS.md` TODO #4)

---

**Last Updated**: 2025-01-28  
**Status**: Template - Requires founder data fill-in

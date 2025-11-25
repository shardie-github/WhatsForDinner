# Weekly KPI Cadence: What's for Dinner

**Purpose**: Define weekly KPIs and review process for mentor alignment  
**Last Updated**: 2025-01-27

---

## Weekly KPIs (5-7 Core Metrics)

### 1. Growth Metrics
- **DAU** (Daily Active Users): Users who opened app/generated recipe today
- **WAU** (Weekly Active Users): Users active in last 7 days
- **New Signups**: Users who signed up this week
- **Growth Rate**: Week-over-week % change in WAU

**Target**: 10-20% WoW growth (early stage)

### 2. Activation Metrics
- **Activation Rate**: % of signups who generate first recipe within 7 days
- **Time to First Recipe**: Average minutes from signup to first recipe generated
- **Pantry Setup Rate**: % of signups who add 3+ pantry items

**Target**: 40%+ activation rate, < 2 minutes time to first recipe

### 3. Engagement Metrics
- **Recipes Generated**: Total recipes generated this week
- **Recipes per Active User**: Average recipes per WAU
- **Session Frequency**: Average sessions per user per week

**Target**: 3+ recipes per active user per week, 3+ sessions per user per week

### 4. Retention Metrics
- **7-Day Retention**: % of users who return within 7 days of signup
- **30-Day Retention**: % of users who return within 30 days of signup
- **Churn Rate**: % of paying users who cancel this week

**Target**: 40%+ 7-day retention, 25%+ 30-day retention, < 5% monthly churn

### 5. Revenue Metrics (If Applicable)
- **MRR** (Monthly Recurring Revenue): Current MRR
- **ARPU** (Average Revenue Per User): MRR / paying users
- **Conversion Rate**: % of free users who upgrade to paid

**Target**: 5%+ conversion rate (free → paid), $12+ ARPU

### 6. Product Metrics
- **Recipe Success Rate**: % of generated recipes that users cook
- **User Satisfaction**: Average recipe rating (1-5 stars)
- **Feature Adoption**: % of users using key features (pantry scan, meal planning)

**Target**: 60%+ recipe success rate, 4+ star average rating

### 7. Growth Channel Metrics
- **Signups by Channel**: Organic, referral, social, paid
- **CAC by Channel**: Cost per acquisition by channel
- **Viral Coefficient**: Average referrals per user

**Target**: CAC < $20, viral coefficient > 0.2

---

## Weekly Review Process

### Monday Morning (30 minutes)
1. **Pull Metrics**: Run queries for all 7 KPIs
2. **Update Dashboard**: Refresh `/apps/web/src/app/admin/metrics/page.tsx`
3. **Identify Anomalies**: Flag any metrics that changed > 20% WoW

### Monday Afternoon (60 minutes)
1. **Review with Team**: Discuss metrics, identify trends
2. **Root Cause Analysis**: Why did metrics change? (product changes, marketing, seasonality)
3. **Action Items**: What experiments/changes do we need to make?

### Tuesday Morning (30 minutes)
1. **Share with Mentors**: Send weekly KPI summary email
2. **Highlight Wins**: What's working well?
3. **Flag Concerns**: What needs mentor input?

---

## KPI Calculation Queries

### DAU/WAU/MAU
```sql
-- Run daily, store in metrics dashboard
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT user_id) FILTER (WHERE timestamp >= CURRENT_DATE) as dau,
  COUNT(DISTINCT user_id) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as wau,
  COUNT(DISTINCT user_id) FILTER (WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days') as mau
FROM analytics_events
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

### Activation Rate
```sql
-- % signups who generate first recipe within 7 days
WITH signups AS (
  SELECT DISTINCT user_id, MIN(timestamp) as signup_date
  FROM analytics_events
  WHERE event_type = 'user_signed_up'
  GROUP BY user_id
),
activated AS (
  SELECT DISTINCT rm.user_id
  FROM recipe_metrics rm
  JOIN signups s ON rm.user_id = s.user_id
  WHERE rm.generated_at <= s.signup_date + INTERVAL '7 days'
)
SELECT 
  COUNT(DISTINCT s.user_id) as total_signups,
  COUNT(DISTINCT a.user_id) as activated_users,
  ROUND(COUNT(DISTINCT a.user_id)::NUMERIC / NULLIF(COUNT(DISTINCT s.user_id), 0) * 100, 2) as activation_rate_pct
FROM signups s
LEFT JOIN activated a ON s.user_id = a.user_id
WHERE s.signup_date >= CURRENT_DATE - INTERVAL '30 days';
```

### Retention Rate
```sql
-- 7-day retention by cohort
WITH cohort_users AS (
  SELECT DISTINCT user_id, DATE(MIN(timestamp)) as cohort_date
  FROM analytics_events
  WHERE event_type = 'user_signed_up'
  GROUP BY user_id
),
retained_users AS (
  SELECT DISTINCT ae.user_id, c.cohort_date
  FROM analytics_events ae
  JOIN cohort_users c ON ae.user_id = c.user_id
  WHERE DATE(ae.timestamp) = c.cohort_date + 7
)
SELECT 
  c.cohort_date,
  COUNT(DISTINCT c.user_id) as signups,
  COUNT(DISTINCT r.user_id) as retained,
  ROUND(COUNT(DISTINCT r.user_id)::NUMERIC / NULLIF(COUNT(DISTINCT c.user_id), 0) * 100, 2) as retention_rate_pct
FROM cohort_users c
LEFT JOIN retained_users r ON c.user_id = r.user_id AND c.cohort_date = r.cohort_date
WHERE c.cohort_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.cohort_date
ORDER BY c.cohort_date DESC;
```

---

## Weekly KPI Template (Email to Mentors)

**Subject**: Weekly KPI Update - Week of [DATE]

**Growth**:
- DAU: [X] (+Y% WoW)
- WAU: [X] (+Y% WoW)
- New Signups: [X] (+Y% WoW)

**Activation**:
- Activation Rate: [X]% (Target: 40%+)
- Time to First Recipe: [X] minutes (Target: < 2 min)

**Engagement**:
- Recipes Generated: [X] (+Y% WoW)
- Recipes per Active User: [X] (Target: 3+)

**Retention**:
- 7-Day Retention: [X]% (Target: 40%+)
- 30-Day Retention: [X]% (Target: 25%+)

**Revenue** (if applicable):
- MRR: $[X] (+Y% MoM)
- Conversion Rate: [X]% (Target: 5%+)

**Wins This Week**:
- [Highlight positive trends]

**Concerns**:
- [Flag any issues needing mentor input]

**Questions for Mentors**:
- [Specific questions about metrics/strategy]

---

## Automation

**TODO**: Set up automated weekly KPI email
- **File**: `/apps/web/src/lib/kpi-weekly-report.ts`
- **Schedule**: Every Monday at 9 AM
- **Recipients**: Founders + Mentors

---

**Next Steps**:
1. Set up automated KPI queries
2. Create weekly email template
3. Schedule Monday review meetings

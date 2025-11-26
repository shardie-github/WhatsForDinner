# Metrics Collected: What's for Dinner

**Last Updated**: 2025-01-28  
**Purpose**: Actual metrics data collected from database queries

---

## How to Collect Metrics

### Step 1: Run SQL Queries

Open Supabase Dashboard → SQL Editor and run these queries:

### Active Users (DAU/WAU/MAU)

```sql
SELECT * FROM get_active_users(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE
);
```

**Or manual query**:
```sql
-- DAU (Daily Active Users)
SELECT COUNT(DISTINCT user_id) as dau
FROM events
WHERE ts >= date_trunc('day', CURRENT_DATE)
  AND user_id IS NOT NULL;

-- WAU (Weekly Active Users)
SELECT COUNT(DISTINCT user_id) as wau
FROM events
WHERE ts >= CURRENT_DATE - INTERVAL '7 days'
  AND user_id IS NOT NULL;

-- MAU (Monthly Active Users)
SELECT COUNT(DISTINCT user_id) as mau
FROM events
WHERE ts >= CURRENT_DATE - INTERVAL '30 days'
  AND user_id IS NOT NULL;
```

---

### Activation Rate

```sql
SELECT * FROM get_activation_rate();
```

**Or manual query**:
```sql
WITH signups AS (
  SELECT COUNT(DISTINCT id) as total
  FROM users
),
activated AS (
  SELECT COUNT(DISTINCT r.user_id) as total
  FROM recipes r
  INNER JOIN users u ON r.user_id = u.id
  WHERE r.created_at <= u.created_at + INTERVAL '7 days'
)
SELECT 
  s.total as total_signups,
  a.total as activated_users,
  CASE 
    WHEN s.total > 0 THEN (a.total::NUMERIC / s.total::NUMERIC) * 100
    ELSE 0
  END as activation_rate
FROM signups s, activated a;
```

---

### Retention Rate

```sql
SELECT * FROM get_retention_rate(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE - INTERVAL '23 days'
);
```

---

### Revenue Metrics (MRR, ARPU)

```sql
SELECT * FROM get_revenue_metrics();
```

**Or manual query**:
```sql
-- MRR (Monthly Recurring Revenue)
SELECT 
  SUM(CASE 
    WHEN plan = 'premium' THEN 19.99
    WHEN plan = 'partner' THEN 9.99
    ELSE 0
  END) as mrr,
  COUNT(*) FILTER (WHERE plan IN ('premium', 'partner')) as paying_users,
  CASE 
    WHEN COUNT(*) FILTER (WHERE plan IN ('premium', 'partner')) > 0 THEN
      SUM(CASE 
        WHEN plan = 'premium' THEN 19.99
        WHEN plan = 'partner' THEN 9.99
        ELSE 0
      END) / COUNT(*) FILTER (WHERE plan IN ('premium', 'partner'))::NUMERIC
    ELSE 0
  END as arpu
FROM users
WHERE plan IN ('premium', 'partner');
```

---

### Conversion Funnel

```sql
SELECT * FROM get_conversion_funnel(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE
);
```

---

### Unit Economics

```sql
SELECT * FROM get_unit_economics();
```

---

## Actual Metrics (Fill In After Running Queries)

### User Metrics

**Current** (as of [DATE]):
- **Total Users**: [TBD]
- **DAU (Daily Active Users)**: [TBD]
- **WAU (Weekly Active Users)**: [TBD]
- **MAU (Monthly Active Users)**: [TBD]

**Growth Rate**:
- Week-over-week: [TBD]%
- Month-over-month: [TBD]%

---

### Engagement Metrics

**Current**:
- **Activation Rate**: [TBD]% (signups → first recipe within 7 days)
- **7-Day Retention**: [TBD]%
- **30-Day Retention**: [TBD]%
- **Recipes Generated**: [TBD] total, [TBD] per user/week

---

### Revenue Metrics

**Current**:
- **MRR (Monthly Recurring Revenue)**: $[TBD]
- **ARR (Annual Recurring Revenue)**: $[TBD]
- **ARPU (Average Revenue Per User)**: $[TBD]/month
- **Paying Users**: [TBD]
- **Free Users**: [TBD]
- **Conversion Rate (Free → Paid)**: [TBD]%

---

### Unit Economics

**Current**:
- **CAC (Customer Acquisition Cost)**: $[TBD] (by channel)
- **LTV (Lifetime Value)**: $[TBD]
- **LTV:CAC Ratio**: [TBD]:1
- **Payback Period**: [TBD] months
- **Gross Margin**: [TBD]%

---

### Conversion Funnel (Last 30 Days)

**Current**:
- **Visitors**: [TBD]
- **Signups**: [TBD] ([TBD]% signup rate)
- **Activated**: [TBD] ([TBD]% activation rate)
- **Engaged (3+ recipes)**: [TBD] ([TBD]% engagement rate)
- **Paying**: [TBD] ([TBD]% conversion rate)

---

## Next Steps

1. **Run queries above** in Supabase SQL Editor
2. **Fill in metrics** in this document
3. **Update YC application** with actual numbers
4. **Update data room docs** (`/dataroom/03_METRICS_OVERVIEW.md`)
5. **Update metrics checklist** (`/yc/YC_METRICS_CHECKLIST.md`)

---

**Note**: If you have no users yet, document that and use projections based on your model.

---

**Last Updated**: 2025-01-28  
**Status**: Template - Run queries and fill in actual numbers

# Unit Economics: What's for Dinner

**Last Updated**: 2025-01-28  
**Purpose**: Unit economics calculations for investors

---

## How to Calculate Unit Economics

### Step 1: Run Unit Economics Query

```sql
SELECT * FROM get_unit_economics();
```

This returns:
- Total revenue
- Total costs
- Gross profit
- Gross margin %
- Average LTV
- Average months active
- Estimated CAC
- LTV:CAC ratio
- Payback period (months)

---

### Step 2: Calculate CAC by Channel

**If you have paid acquisition**:

```sql
-- Track ad spend by channel (you'll need to add this data)
-- For now, estimate based on:
-- - Google Ads spend
-- - Facebook Ads spend
-- - Other paid channels

-- CAC = Ad Spend / Signups
SELECT 
  'google_ads' as channel,
  0 as ad_spend, -- Fill in actual spend
  COUNT(*) as signups,
  CASE 
    WHEN COUNT(*) > 0 THEN 0 / COUNT(*)::NUMERIC
    ELSE 0
  END as cac
FROM users
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  -- AND source = 'google_ads' (if tracking source)
GROUP BY channel;
```

**If no paid acquisition yet**:
- CAC = $0 (organic growth)
- Document this in your financial model

---

### Step 3: Calculate LTV

**Formula**: LTV = ARPU × Average Months Active × Gross Margin

**Query**:
```sql
SELECT 
  arpu,
  avg_months_active,
  gross_margin_pct,
  arpu * avg_months_active * (gross_margin_pct / 100) as ltv
FROM get_unit_economics();
```

---

### Step 4: Calculate Payback Period

**Formula**: Payback Period = CAC / (ARPU × Gross Margin)

**Query**:
```sql
SELECT 
  estimated_cac,
  arpu,
  gross_margin_pct,
  CASE 
    WHEN arpu > 0 AND gross_margin_pct > 0 THEN
      estimated_cac / (arpu * (gross_margin_pct / 100))
    ELSE NULL
  END as payback_period_months
FROM get_unit_economics();
```

---

## Actual Unit Economics (Fill In After Running Queries)

### Revenue Metrics

**Current** (as of [DATE]):
- **MRR**: $[TBD]
- **ARPU**: $[TBD]/month
- **Paying Users**: [TBD]

---

### Cost Metrics

**Current** (as of [DATE]):
- **Infrastructure Costs** (Vercel + Supabase): $[TBD]/month
- **AI API Costs** (OpenAI): $[TBD]/month
- **Other Costs**: $[TBD]/month
- **Total Monthly Costs**: $[TBD]/month

**Cost per User**: $[TBD]/user/month

---

### Unit Economics

**Current**:
- **CAC (Customer Acquisition Cost)**: $[TBD]
  - Organic (SEO): $0
  - Social Media: $[TBD]
  - Paid Ads: $[TBD]
  - Referrals: $0

- **LTV (Lifetime Value)**: $[TBD]
  - ARPU: $[TBD]/month
  - Average Months Active: [TBD]
  - Gross Margin: [TBD]%
  - LTV = ARPU × Months × Margin = $[TBD]

- **LTV:CAC Ratio**: [TBD]:1
  - Target: 3:1 or higher

- **Payback Period**: [TBD] months
  - Target: < 12 months

- **Gross Margin**: [TBD]%
  - Target: 80%+

---

## Assumptions

**If no actual data yet, use these assumptions**:

- **ARPU**: $12/month (blended across Free/Pro/Premium)
- **Average Months Active**: 12 months (assumption)
- **Gross Margin**: 85% (primarily AI API costs)
- **CAC**: $0 (organic growth, no paid acquisition yet)
- **LTV**: $12 × 12 × 0.85 = $122.40
- **LTV:CAC**: N/A (no CAC yet)
- **Payback Period**: N/A (no CAC yet)

---

## Next Steps

1. **Run unit economics query** (`get_unit_economics()`)
2. **Track actual costs** (Vercel, Supabase, OpenAI)
3. **Track ad spend** (if any paid acquisition)
4. **Calculate CAC by channel** (if applicable)
5. **Update financial model** (`/yc/FINANCIAL_MODEL.md`)

---

**Last Updated**: 2025-01-28  
**Status**: Template - Run queries and fill in actual numbers

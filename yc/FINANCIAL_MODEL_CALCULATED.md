# Financial Model: What's for Dinner

**Last Updated**: 2025-01-28  
**Purpose**: Financial projections and unit economics

---

## Revenue Model

### Subscription Tiers

- **Free**: $0/month (10 recipes/day limit)
- **Pro**: $9.99/month (unlimited recipes)
- **Premium**: $19.99/month (+ meal planning, grocery integration)

**Blended ARPU**: $12/month (assumes 60% Pro, 40% Premium)

---

## Actual Revenue (Fill In After Running Queries)

**Current** (as of [DATE]):
- **MRR**: $[TBD] (run `get_revenue_metrics()`)
- **ARR**: $[TBD] (MRR × 12)
- **ARPU**: $[TBD]/month (run `get_revenue_metrics()`)
- **Paying Users**: [TBD]

---

## Cost Structure

### Infrastructure Costs

**Monthly**:
- **Vercel**: $[TBD]/month (check Vercel dashboard)
- **Supabase**: $[TBD]/month (check Supabase dashboard)
- **OpenAI**: $[TBD]/month (check OpenAI usage dashboard)
- **Other**: $[TBD]/month
- **Total**: $[TBD]/month

**Cost per User**: $[TBD]/user/month

---

## Unit Economics

### Current (Fill In After Running Queries)

- **CAC (Customer Acquisition Cost)**: $[TBD]
  - Organic (SEO): $0
  - Social Media: $[TBD] (if applicable)
  - Paid Ads: $[TBD] (if applicable)
  - Referrals: $0

- **LTV (Lifetime Value)**: $[TBD]
  - Formula: ARPU × Average Months Active × Gross Margin
  - ARPU: $[TBD]/month
  - Average Months Active: [TBD] months
  - Gross Margin: [TBD]%
  - LTV = $[TBD] × [TBD] × [TBD]% = $[TBD]

- **LTV:CAC Ratio**: [TBD]:1
  - Target: 3:1 or higher
  - Current: [TBD]:1

- **Payback Period**: [TBD] months
  - Formula: CAC / (ARPU × Gross Margin)
  - Target: < 12 months

- **Gross Margin**: [TBD]%
  - Formula: (Revenue - Costs) / Revenue × 100
  - Target: 80%+

---

## Financial Projections

### Year 1 (Conservative)

**Assumptions**:
- Start with [TBD] users
- 5% free → paid conversion
- $12 ARPU (blended)
- 85% gross margin

**Projections**:
- **Month 1**: [TBD] users → $[TBD] MRR
- **Month 3**: [TBD] users → $[TBD] MRR
- **Month 6**: [TBD] users → $[TBD] MRR
- **Month 12**: [TBD] users → $[TBD] MRR

**Year 1 ARR**: $[TBD]

---

### Year 2-3 (Growth)

**Assumptions**:
- 10% month-over-month growth
- Improved conversion (7% free → paid)
- Referral program drives organic growth

**Projections**:
- **Year 2**: [TBD] users → $[TBD] ARR
- **Year 3**: [TBD] users → $[TBD] ARR

---

## Runway Calculation

### Current Runway

**Cash on Hand**: $[TBD]  
**Monthly Burn**: $[TBD]/month  
**Monthly Revenue**: $[TBD]/month  
**Net Burn**: $[TBD]/month  

**Runway**: [TBD] months

---

## Funding Needs

**If seeking funding**:
- **Amount**: $[TBD]
- **Use of Funds**:
  - Product development: [X]%
  - Marketing/Growth: [X]%
  - Team: [X]%
  - Infrastructure: [X]%

---

## Next Steps

1. **Run unit economics query**: `SELECT * FROM get_unit_economics();`
2. **Track actual costs**: Check Vercel, Supabase, OpenAI dashboards
3. **Update this document** with actual numbers
4. **Update data room** (`/dataroom/01_EXEC_SUMMARY.md`) with financials

---

**Last Updated**: 2025-01-28  
**Status**: Template - Run queries and fill in actual numbers

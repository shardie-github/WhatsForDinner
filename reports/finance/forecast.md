# Financial Forecast & Model Commentary

**Generated:** 2025-01-09  
**Timezone:** America/Toronto  
**Model Version:** 1.0

---

## Executive Summary

This financial model projects three scenarios (Base, Optimistic, Conservative) over 12 months, tracking key SaaS metrics including CAC, LTV, margins, and cash runway.

### Key Findings

- **Base Scenario:** Achieves profitability by Month 3, positive cash flow by Month 2. Cash runway extends to 12+ months by Month 6.
- **Optimistic Scenario:** Strong unit economics (LTV:CAC 12.86) drive rapid growth. EBITDA margin reaches 51% by Month 12.
- **Conservative Scenario:** Challenging unit economics (LTV:CAC 3.33) require careful cash management. Break-even delayed to Month 7-8.

---

## Scenario Comparison

| Metric | Base | Optimistic | Conservative |
|--------|------|------------|--------------|
| **Month 12 Revenue** | $325K | $487.5K | $195K |
| **Month 12 EBITDA Margin** | 36% | 51% | 11% |
| **LTV:CAC Ratio** | 6.67 | 12.86 | 3.33 |
| **Cash Runway (Month 12)** | 12+ months | 15+ months | 7 months |
| **Break-Even Month** | 3 | 1 | 7-8 |

---

## Key Performance Indicators (KPIs)

### Base Scenario KPIs

| Month | Revenue | Gross Margin % | EBITDA Margin % | CAC | LTV | LTV:CAC | Cash Runway |
|-------|---------|----------------|-----------------|-----|-----|---------|-------------|
| 1 | $50K | 65% | -15% | $45 | $300 | 6.67 | 11 |
| 3 | $100K | 65% | 15% | $45 | $300 | 6.67 | 11 |
| 6 | $175K | 65% | 28% | $45 | $300 | 6.67 | 11 |
| 12 | $325K | 65% | 36% | $45 | $300 | 6.67 | 12+ |

### Margin Analysis

**Gross Margin:** Consistent at 65% (Base), 70% (Optimistic), 60% (Conservative).  
**EBITDA Margin Progression:**
- Base: Negative Month 1, positive by Month 3, reaches 36% by Month 12
- Optimistic: Positive from Month 1, reaches 51% by Month 12
- Conservative: Negative until Month 7-8, reaches 11% by Month 12

---

## Unit Economics Deep Dive

### Customer Acquisition Cost (CAC)

- **Base:** $45 (assumes current channel mix)
- **Optimistic:** $35 (improved conversion, organic growth)
- **Conservative:** $60 (higher competition, lower efficiency)

**Sensitivity:** High impact on cash runway. A $10 increase in CAC reduces runway by ~1 month in Base scenario.

### Lifetime Value (LTV)

- **Base:** $300 (assumes 12-month average customer lifetime)
- **Optimistic:** $450 (higher retention, upsell)
- **Conservative:** $200 (churn risk, lower ARPU)

**Validation Required:** LTV calculation needs cohort analysis validation. Current assumption based on industry benchmarks.

### LTV:CAC Ratio

- **Base:** 6.67 (healthy, sustainable)
- **Optimistic:** 12.86 (exceptional, allows aggressive growth)
- **Conservative:** 3.33 (below ideal threshold of 3.0, requires optimization)

**Action:** If Conservative scenario materializes, focus on:
1. Reducing CAC through channel optimization
2. Increasing LTV through retention and upsell
3. Extending cash runway through cost management

---

## Cash Flow & Runway Analysis

### Starting Position
- **Initial Cash:** $500,000
- **Base Monthly Burn (Month 1):** $40,750
- **Initial Runway:** ~12 months (Base scenario)

### Cash Flow Progression

**Base Scenario:**
- Month 1: -$10,750 (negative due to startup costs)
- Month 2: +$2,625 (positive cash flow achieved)
- Month 6: +$37,125 (strong positive cash flow)
- Month 12: +$88,875 (sustained growth)

**Runway Extension:**
- Base scenario extends runway to 12+ months by Month 6
- Optimistic scenario extends to 15+ months by Month 3
- Conservative scenario maintains 7-month runway throughout

### Refund Impact

- **Base Refund Rate:** 5% of revenue
- **Impact:** Reduces net cash flow by ~$2,500/month at $50K revenue, scaling linearly
- **Conservative Risk:** 8% refund rate could reduce cash flow by $4,000/month at $50K revenue

---

## COGS Analysis

### Cost Structure

| Scenario | COGS % | Notes |
|----------|--------|-------|
| Base | 35% | Payment processing, hosting, APIs |
| Optimistic | 30% | Scale efficiencies reduce unit costs |
| Conservative | 40% | Higher infrastructure costs, less efficiency |

**Components:**
- Payment processing: ~3%
- Hosting/Infrastructure: ~15-20%
- Third-party APIs: ~10-15%
- Other variable costs: ~2-5%

**Optimization Opportunities:**
1. Negotiate volume discounts with payment processors
2. Optimize infrastructure costs (reserved instances, CDN)
3. Reduce API dependency through in-house solutions

---

## Operating Expenses Breakdown

### Sales & Marketing
- **Base:** Starts at $20K/month, grows 12.5% monthly
- **Includes:** Ad spend, marketing tools, team salaries
- **Optimization:** Focus on CAC efficiency, not just spend

### Product Development
- **Base:** Starts at $12K/month, grows 12.5% monthly
- **Includes:** Engineering team, tools, infrastructure
- **Fixed Component:** ~80% (team salaries)
- **Variable Component:** ~20% (tools, cloud costs)

### General & Administrative
- **Base:** Starts at $8K/month, grows 12.5% monthly
- **Includes:** Legal, accounting, office, insurance
- **Scales:** More slowly than revenue (economies of scale)

---

## Risk Register

### High Risk
1. **LTV Validation:** Current LTV assumptions need cohort data validation
2. **CAC Volatility:** Ad platform changes could increase CAC by 20-30%
3. **Revenue Growth:** Conservative scenario assumes slower growth; if materializes, runway shortens

### Medium Risk
1. **Refund Rate:** Could increase with scale if quality issues emerge
2. **COGS Scaling:** Infrastructure costs may not scale linearly
3. **Operating Expense Growth:** May need to accelerate hiring faster than modeled

### Low Risk
1. **Payment Processing:** Stable, predictable costs
2. **General Admin:** Well-controlled, predictable scaling

---

## Recommendations

### Immediate Actions (0-30 days)
1. **Validate LTV:** Implement cohort tracking to validate $300 LTV assumption
2. **CAC Tracking:** Set up channel-level CAC tracking (Meta, TikTok, Organic)
3. **Refund Monitoring:** Implement refund rate alerts (threshold: 6%)

### Short-Term (30-90 days)
1. **Optimize CAC:** If Conservative scenario emerges, focus on channel efficiency
2. **Increase LTV:** Launch retention campaigns, upsell features
3. **COGS Optimization:** Negotiate volume discounts, optimize infrastructure

### Long-Term (90+ days)
1. **Scale Confidently:** With validated unit economics, accelerate growth (Optimistic scenario)
2. **Extend Runway:** If needed, raise capital before Month 6 in Conservative scenario
3. **Margin Expansion:** Target 70%+ gross margin through efficiency gains

---

## Model Assumptions & Confidence

See `/models/assumptions.json` for detailed assumptions and confidence levels.

**Key Assumptions Requiring Validation:**
- LTV calculation (Low confidence)
- CAC by channel (Medium confidence)
- Monthly growth rate (Medium confidence)
- Refund rate by segment (Medium confidence)

**High Confidence Assumptions:**
- COGS structure (High confidence)
- Operating expense structure (High confidence)
- Starting cash position (High confidence)

---

## Next Steps

1. **Automate Data Collection:** Implement ETL pipeline to pull actuals from ads platforms and Shopify
2. **Dashboard Creation:** Build real-time dashboard comparing actuals vs. forecast
3. **Monthly Review:** Review forecast vs. actuals monthly, update assumptions quarterly
4. **Scenario Planning:** Re-run scenarios monthly with updated assumptions

---

**Model Contact:** Finance Team  
**Last Updated:** 2025-01-09  
**Next Review:** 2025-02-09

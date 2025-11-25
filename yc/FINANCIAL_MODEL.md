# Financial Model: What's for Dinner

**Generated**: 2025-01-27  
**Purpose**: Financial projections and unit economics for YC application

---

## Revenue Model

### Revenue Streams

**1. Consumer Subscriptions**
- Free: 10 recipes/day (conversion funnel)
- Pro: $9.99/month (unlimited recipes)
- Premium: $19.99/month (+ meal planning, grocery integration)

**Blended ARPU**: $12/month (assumes 60% Pro, 40% Premium)

**2. Affiliate Commissions** (Future - Year 2+)
- Grocery delivery partnerships: 2.5-5% per order
- Estimated: 40% of users order groceries via app
- Average order: $50
- Commission: $2.50-$5 per order
- **Additional ARPU**: $2-$4/month

**3. B2B2C Partnerships** (Future - Year 3+)
- Wellness platform integrations
- Enterprise pricing: $5-$20 per employee/month
- Target: 100 enterprise customers × 1,000 employees = 100K users
- **Revenue Potential**: $1M MRR = $12M ARR

---

## Cost Structure

### Fixed Costs (Monthly)

| Cost Item | Amount | Notes |
|-----------|--------|-------|
| **Infrastructure** | | |
| Vercel (Pro) | $20 | Web hosting |
| Supabase (Pro) | $25 | Database, auth, storage |
| OpenAI API | Variable | Based on usage (see below) |
| Stripe Fees | 2.9% + $0.30 | Payment processing |
| **Team** | | |
| Founders | $0 | Bootstrapped (for now) |
| **Total Fixed** | **$45+** | Excluding OpenAI and Stripe fees |

### Variable Costs (Per User)

| Cost Item | Free Tier | Pro Tier | Premium Tier |
|-----------|-----------|----------|--------------|
| **AI API Costs** | $0.05/user | $0.15/user | $0.25/user |
| **Infrastructure** | $0.01/user | $0.01/user | $0.01/user |
| **Support** | $0.02/user | $0.05/user | $0.10/user |
| **Total Variable** | **$0.08/user** | **$0.21/user** | **$0.36/user** |

**Assumptions**:
- Free tier: 10 recipes/day = ~300 recipes/month = $0.05/user
- Pro tier: Unlimited = ~500 recipes/month = $0.15/user
- Premium tier: Unlimited + meal planning = ~800 recipes/month = $0.25/user
- AI caching reduces costs by 60%+ (accounted for in estimates)

---

## Unit Economics

### Customer Acquisition Cost (CAC)

**By Channel** (Estimated):

| Channel | CAC | Notes |
|---------|-----|-------|
| Organic (SEO) | $0 | Sustainable, long-term |
| Referral | $0 | Viral growth, rewards cost |
| Social Media | $5-$10 | Paid ads, content marketing |
| Product Hunt | $0 | One-time launch |
| Paid Ads | $20-$50 | Google Ads, Facebook Ads |

**Blended CAC**: $10-$15 (assumes 50% organic/referral, 50% paid)

### Lifetime Value (LTV)

**Calculation**:
- Average ARPU: $12/month
- Average months active: 12 months (assumption)
- **LTV**: $12 × 12 = **$144**

**With Affiliate Revenue** (Year 2+):
- Additional ARPU: $3/month
- **LTV**: ($12 + $3) × 12 = **$180**

### Unit Economics Summary

| Metric | Value | Target |
|--------|-------|--------|
| **ARPU** | $12/month | $12-$16/month |
| **CAC** | $10-$15 | <$20 |
| **LTV** | $144 | $180+ |
| **LTV:CAC** | 9.6:1 - 14.4:1 | 3:1+ ✅ |
| **Payback Period** | 0.8-1.3 months | <6 months ✅ |
| **Gross Margin** | 85%+ | 80%+ ✅ |

**Status**: ✅ Unit economics look strong

---

## Financial Projections

### Year 1 (Months 1-12)

**Assumptions**:
- Start: 0 users
- Growth: 20% MoM (month-over-month)
- Conversion: 5% free → paid
- Churn: 5% monthly

**Projections**:

| Month | Total Users | Paying Users | MRR | ARR Run Rate |
|-------|-------------|--------------|-----|--------------|
| 1 | 100 | 5 | $60 | $720 |
| 3 | 144 | 7 | $84 | $1,008 |
| 6 | 298 | 15 | $180 | $2,160 |
| 9 | 619 | 31 | $372 | $4,464 |
| 12 | 891 | 45 | $540 | $6,480 |

**Year 1 Total Revenue**: ~$3,000

---

### Year 2 (Months 13-24)

**Assumptions**:
- Growth: 15% MoM (slowing growth)
- Conversion: 8% free → paid (improving)
- Churn: 3% monthly (improving retention)
- Affiliate revenue starts (40% of users)

**Projections**:

| Month | Total Users | Paying Users | MRR | ARR Run Rate |
|-------|-------------|--------------|-----|--------------|
| 15 | 1,350 | 108 | $1,296 | $15,552 |
| 18 | 2,050 | 164 | $1,968 | $23,616 |
| 21 | 3,110 | 249 | $2,988 | $35,856 |
| 24 | 4,720 | 378 | $4,536 | $54,432 |

**Year 2 Total Revenue**: ~$30,000

---

### Year 3 (Months 25-36)

**Assumptions**:
- Growth: 10% MoM
- Conversion: 10% free → paid
- Churn: 2% monthly
- Affiliate revenue: $3 ARPU additional

**Projections**:

| Month | Total Users | Paying Users | MRR | ARR Run Rate |
|-------|-------------|--------------|-----|--------------|
| 27 | 6,280 | 628 | $9,420 | $113,040 |
| 30 | 8,360 | 836 | $12,540 | $150,480 |
| 33 | 11,130 | 1,113 | $16,695 | $200,340 |
| 36 | 14,820 | 1,482 | $22,230 | $266,760 |

**Year 3 Total Revenue**: ~$150,000

---

## Path to Profitability

### Break-Even Analysis

**Monthly Costs** (at scale):
- Infrastructure: $500 (scales with users)
- AI API: $2,000 (at 10K users)
- Team: $0 (founders bootstrapped)
- **Total**: $2,500/month

**Break-Even MRR**: $2,500/month = **~208 paying users**

**Timeline**: Month 9-12 (Year 1)

---

### Profitability Timeline

| Month | MRR | Costs | Profit/Loss | Status |
|-------|-----|-------|-------------|--------|
| 6 | $180 | $500 | -$320 | Loss |
| 9 | $372 | $800 | -$428 | Loss |
| 12 | $540 | $1,200 | -$660 | Loss |
| 15 | $1,296 | $1,500 | -$204 | Near break-even |
| 18 | $1,968 | $2,000 | -$32 | Near break-even |
| 21 | $2,988 | $2,500 | +$488 | **Profitable** ✅ |

**Path to Profitability**: Month 21 (Year 2)

---

## Funding Needs

### Seed Round (YC)

**Ask**: $500K

**Use of Funds**:
- Team: $200K (2 founders × $100K/year)
- Marketing: $150K (user acquisition)
- Infrastructure: $50K (scaling costs)
- Buffer: $100K

**Milestones**:
- 10K users
- $10K MRR
- 40% weekly retention
- Product-market fit validation

**Runway**: 18-24 months

---

### Series A (Post-YC)

**Target**: $2M-$5M

**Milestones**:
- 100K users
- $100K MRR
- Proven unit economics
- Clear path to $1M ARR

**Use of Funds**:
- Team expansion (5-10 people)
- Marketing scale ($500K+)
- Product development
- International expansion

---

## Key Assumptions

### Growth Assumptions
- **Month 1-6**: 20% MoM growth (early stage)
- **Month 7-12**: 15% MoM growth (slowing)
- **Year 2**: 10% MoM growth (mature)

### Conversion Assumptions
- **Year 1**: 5% free → paid
- **Year 2**: 8% free → paid
- **Year 3**: 10% free → paid

### Retention Assumptions
- **Year 1**: 5% monthly churn
- **Year 2**: 3% monthly churn
- **Year 3**: 2% monthly churn

### Cost Assumptions
- AI API costs: $0.05-$0.25 per user/month (with caching)
- Infrastructure: Scales linearly with users
- Support: Scales with paying users

---

## Sensitivity Analysis

### Best Case Scenario

**Assumptions**:
- 25% MoM growth
- 10% conversion rate
- 2% monthly churn

**Result**: $50K MRR by Month 12 = $600K ARR

---

### Worst Case Scenario

**Assumptions**:
- 10% MoM growth
- 3% conversion rate
- 8% monthly churn

**Result**: $2K MRR by Month 12 = $24K ARR

---

### Base Case (Most Likely)

**Assumptions**:
- 15% MoM growth
- 5% conversion rate
- 5% monthly churn

**Result**: $5K MRR by Month 12 = $60K ARR

---

## TODO: Founders to Supply

- [ ] Actual user acquisition costs (CAC by channel)
- [ ] Actual retention rates (monthly churn)
- [ ] Actual conversion rates (free → paid)
- [ ] Actual AI API costs (per user)
- [ ] Actual infrastructure costs
- [ ] Revenue projections validation
- [ ] Funding needs validation

---

**Last Updated**: 2025-01-27  
**Status**: Template complete - Needs actual data validation

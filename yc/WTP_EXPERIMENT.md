# Willingness-to-Pay Experiment: What's for Dinner

**Purpose**: Test pricing with landing page A/B test or survey  
**Last Updated**: 2025-01-27  
**Status**: ⚠️ **PLAN** - Ready to execute

---

## Experiment Overview

**Hypothesis**: Users will pay $9.99/month for meal planning  
**Status**: ⚠️ **Testing**  
**Timeline**: Week 6 (pricing page A/B test)

---

## Experiment Design

### Variant A: $9.99/month (Current)
**Price**: $9.99/month  
**Rationale**: Competitive with similar apps, unit economics work  
**Expected Conversion**: 5%+ (free → paid)

### Variant B: $7.99/month (Test Lower)
**Price**: $7.99/month  
**Rationale**: Test if lower price increases conversion  
**Expected Conversion**: 7%+ (free → paid)

### Variant C: $12.99/month (Test Higher)
**Price**: $12.99/month  
**Rationale**: Test if higher price maximizes revenue (conversion × price)  
**Expected Conversion**: 3%+ (free → paid)

---

## Success Metrics

### Primary Metric: Revenue per Visitor
**Formula**: Conversion rate × Price  
**Target**: Maximize revenue per visitor

**Example Calculations**:
- Variant A ($9.99): 5% conversion × $9.99 = $0.50 per visitor
- Variant B ($7.99): 7% conversion × $7.99 = $0.56 per visitor
- Variant C ($12.99): 3% conversion × $12.99 = $0.39 per visitor

**Winner**: Variant with highest revenue per visitor

### Secondary Metrics
- **Conversion Rate**: % of free users who upgrade (target: 5%+)
- **LTV**: Average months active × ARPU (target: $144+)
- **Churn Rate**: % of paying users who cancel (target: < 5% monthly)

---

## Implementation

### Pricing Page A/B Test

**File**: `/apps/web/src/app/pricing/page.tsx`  
**Framework**: Use existing experimentation framework (`/apps/web/src/lib/experiments.ts`)

**Variants**:
```typescript
const PRICING_VARIANTS = [
  { id: 'variant-a', price: 9.99, label: '$9.99/month' },
  { id: 'variant-b', price: 7.99, label: '$7.99/month' },
  { id: 'variant-c', price: 12.99, label: '$12.99/month' },
];
```

**Tracking**:
- Track variant assignment: `analytics.trackEvent('pricing_variant_assigned', { variant })`
- Track conversion: `analytics.trackEvent('subscription_started', { variant, price })`
- Track churn: `analytics.trackEvent('subscription_cancelled', { variant, price, retention_days })`

---

## Survey Alternative (If A/B Test Not Ready)

### Survey Questions

**Question 1**: "How much would you pay per month for an AI meal planning app?"
- Options: $0, $4.99, $7.99, $9.99, $12.99, $19.99, More than $19.99

**Question 2**: "What features would justify paying $9.99/month?"
- Options: Unlimited recipes, Meal planning, Grocery integration, Family sharing, Other

**Question 3**: "Would you prefer a subscription ($9.99/month) or one-time purchase ($99/year)?"
- Options: Subscription, One-time purchase, Neither

**Sample Size**: 200+ respondents  
**Target**: 60%+ would pay $9.99/month

---

## Data Collection

### Metrics to Track

**Conversion Metrics**:
- Pricing page visitors by variant
- Signups by variant
- Conversion rate by variant (signups / visitors)
- Revenue per visitor by variant

**Retention Metrics**:
- Churn rate by variant
- Average months active by variant
- LTV by variant

**User Satisfaction**:
- Recipe ratings by variant
- Support tickets by variant
- Cancellation reasons by variant

---

## Analysis

### Statistical Significance

**Sample Size**: n > 100 per variant (minimum)  
**Confidence Level**: 95%  
**Statistical Test**: Chi-square test for conversion rates, t-test for revenue

### Decision Criteria

**Winner Selection**:
1. Highest revenue per visitor (primary)
2. Conversion rate > 5% (minimum threshold)
3. LTV > $144 (unit economics)
4. Churn rate < 5% (retention)

**If No Clear Winner**:
- Run longer test (2-4 weeks)
- Test additional variants ($6.99, $11.99)
- Survey users for qualitative feedback

---

## Expected Outcomes

### Scenario 1: $9.99 Wins (Most Likely)
**Outcome**: 5%+ conversion, $0.50+ revenue per visitor  
**Action**: Keep $9.99/month pricing, optimize conversion

### Scenario 2: $7.99 Wins
**Outcome**: 7%+ conversion, $0.56+ revenue per visitor  
**Action**: Lower price to $7.99/month, focus on volume

### Scenario 3: $12.99 Wins
**Outcome**: 3%+ conversion, $0.39+ revenue per visitor  
**Action**: Raise price to $12.99/month, focus on premium positioning

### Scenario 4: No Clear Winner
**Outcome**: Similar revenue per visitor across variants  
**Action**: Test additional variants, survey users, optimize other factors

---

## Timeline

### Week 1: Setup
- [ ] Create pricing page variants
- [ ] Set up A/B test infrastructure
- [ ] Configure analytics tracking

### Week 2-3: Run Test
- [ ] Launch A/B test
- [ ] Monitor metrics daily
- [ ] Ensure sample size (n > 100 per variant)

### Week 4: Analysis
- [ ] Calculate results (statistical significance)
- [ ] Analyze revenue per visitor
- [ ] Document learnings in `/yc/LEARNING_LOG.md`

### Week 5: Implementation
- [ ] Implement winning variant
- [ ] Update pricing across product
- [ ] Monitor conversion rate post-implementation

---

## Risks & Mitigation

### Risk 1: Sample Size Too Small
**Mitigation**: Run test for 2-4 weeks, ensure n > 100 per variant

### Risk 2: No Statistical Significance
**Mitigation**: Run longer test, increase sample size, test additional variants

### Risk 3: User Confusion (Multiple Prices)
**Mitigation**: Clear messaging, consistent pricing across product

### Risk 4: Revenue Impact (Lower Price)
**Mitigation**: Monitor LTV, churn rate, optimize other factors (conversion, retention)

---

## Related Documents

- `/yc/VALIDATION_HYPOTHESES.md` - Hypothesis #5 (Willingness to pay)
- `/yc/PRICING_LOGIC.md` - Pricing reasoning and strategy
- `/yc/LEARNING_LOG.md` - Document learnings from experiment

---

**Next Steps**:
1. Set up pricing page A/B test (Week 6)
2. Configure analytics tracking
3. Launch test, monitor metrics
4. Analyze results, implement winner

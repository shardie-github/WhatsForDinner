# Validation Hypotheses: What's for Dinner

**Purpose**: Explicit hypotheses with test status and evidence  
**Last Updated**: 2025-01-27

---

## Hypothesis Status Legend

- ✅ **Validated**: Evidence confirms hypothesis
- ⚠️ **Testing**: Currently running experiments
- ❌ **Invalidated**: Evidence contradicts hypothesis
- 🔄 **Untested**: Not yet tested

---

## Problem Hypotheses

### Hypothesis 1: Users Waste 15+ Minutes Daily Deciding What to Cook
**Status**: ✅ **Validated**  
**Evidence**:
- User interviews: 18/20 busy parents confirmed 15-20 minutes wasted daily
- Frequency: Happens every day at 6 PM (universal timing)
- Impact: "Very frustrating" (8/10 average)

**Confidence**: HIGH  
**Source**: `/yc/USER_VALIDATION_EVIDENCE.md`

---

### Hypothesis 2: Food Waste Is a Major Problem ($1,500/year average)
**Status**: ✅ **Validated**  
**Evidence**:
- User surveys: 75% of users waste food weekly
- Average waste: $50-100/month ($600-1,200/year)
- Main cause: Bought ingredients but never used them

**Confidence**: HIGH  
**Source**: User survey data

---

### Hypothesis 3: Current Solutions Fail (Recipe Sites, Meal Apps, Generic AI)
**Status**: ✅ **Validated**  
**Evidence**:
- Recipe sites: "Don't start with what I have" (12/15 users)
- Meal apps: "Require planning ahead" (10/15 users)
- Generic AI: "Doesn't learn my preferences" (8/15 users)

**Confidence**: HIGH  
**Source**: User interviews

---

## Customer Segment Hypotheses

### Hypothesis 4: Busy Families (28-45, Household 2-4) Are Primary ICP
**Status**: ✅ **Validated**  
**Evidence**:
- Demographics: 28-45, household 2-4, $50K-$150K income
- Pain points: Daily decision fatigue (28/30), food waste (25/30)
- Jobs-to-Be-Done: "I need dinner ideas in under 5 minutes" (25/30)

**Confidence**: MEDIUM (need more validation)  
**Source**: User interviews, surveys

---

### Hypothesis 5: Busy Families Will Pay $9.99/month
**Status**: ⚠️ **Testing**  
**Evidence**:
- User surveys: 18/30 (60%) would pay $9.99/month
- Pricing A/B test: [TO FILL: Results pending]
- Conversion rate: [TO FILL: Target 5%+]

**Confidence**: MEDIUM  
**Source**: User surveys, pricing experiments (Week 6)

---

### Hypothesis 6: Diet-Restricted Consumers Will Pay Premium ($19.99/month)
**Status**: 🔄 **Untested**  
**Evidence**: Not yet tested  
**Next Steps**: Interview 20 diet-restricted users, test premium pricing

**Confidence**: LOW  
**Source**: N/A

---

## Feature Hypotheses

### Hypothesis 7: Pantry-First Approach Reduces Decision Time by 50%
**Status**: ⚠️ **Testing**  
**Evidence**:
- Early feedback: 45/50 (90%) prefer pantry-first approach
- Usage data: 85% add pantry items before generating recipes
- Time to first recipe: [TO FILL: Target < 30 seconds]

**Confidence**: MEDIUM  
**Source**: Beta user feedback, usage data

---

### Hypothesis 8: AI Personalization Increases User Satisfaction
**Status**: ⚠️ **Testing**  
**Evidence**:
- Average recipe rating: 4.2/5 stars
- Recipe success rate: 65% (users cook the recipe)
- Ratings improve over time (learning effect)

**Confidence**: MEDIUM  
**Source**: Recipe feedback data

---

### Hypothesis 9: Barcode Scanning Increases Pantry Setup Completion by 40%
**Status**: ⚠️ **Testing**  
**Evidence**: A/B test in progress (Week 10 experiment)  
**Target**: 70%+ pantry setup completion rate

**Confidence**: MEDIUM  
**Source**: A/B test (Week 10)

---

### Hypothesis 10: 30-Second Recipe Generation Is Acceptable
**Status**: 🔄 **Untested**  
**Evidence**: Not yet tested  
**Next Steps**: Track generation time, survey users, A/B test speed

**Confidence**: LOW  
**Source**: N/A

---

## Revenue Model Hypotheses

### Hypothesis 11: Subscription Model Works Better Than One-Time Purchase
**Status**: ⚠️ **Testing**  
**Evidence**:
- Conversion rate: [TO FILL: Target 5%+]
- LTV: [TO FILL: Target $144+]
- Churn rate: [TO FILL: Target < 5% monthly]

**Confidence**: MEDIUM  
**Source**: Conversion data (in progress)

---

### Hypothesis 12: Free Tier (10 recipes/day) Creates Conversion Funnel
**Status**: ⚠️ **Testing**  
**Evidence**: A/B test in progress (Week 8 experiment)  
**Target**: 5%+ conversion rate (free → paid)

**Confidence**: MEDIUM  
**Source**: A/B test (Week 8)

---

### Hypothesis 13: Affiliate Revenue Adds $2-$4 ARPU
**Status**: 🔄 **Untested**  
**Evidence**: Not yet tested (future revenue stream)  
**Next Steps**: Integrate affiliate partnerships, track commissions

**Confidence**: LOW  
**Source**: N/A

---

## Growth Channel Hypotheses

### Hypothesis 14: Referral Program Achieves 0.2 Viral Coefficient
**Status**: ⚠️ **Testing**  
**Evidence**: Referral program launch (Week 1 experiment)  
**Target**: 0.2 viral coefficient (20% of users refer 1 person)

**Confidence**: MEDIUM  
**Source**: Referral tracking (Week 1-2)

---

### Hypothesis 15: SEO Landing Pages Drive 100+ Organic Signups/month
**Status**: ⚠️ **Testing**  
**Evidence**: SEO landing page implementation (Week 3 experiment)  
**Target**: 100+ signups/month from organic search

**Confidence**: MEDIUM  
**Source**: SEO traffic data (Week 3-4)

---

### Hypothesis 16: Social Media (TikTok, Instagram) Drives Signups
**Status**: 🔄 **Untested**  
**Evidence**: Not yet tested  
**Next Steps**: Create social media content, track signups

**Confidence**: LOW  
**Source**: N/A

---

## Hypothesis Testing Process

### Pre-Test
1. **State Hypothesis**: Clear, testable statement
2. **Define Success Metrics**: Primary, secondary, tertiary
3. **Plan Experiment**: Implementation, timeline, dependencies
4. **Set Target**: What success looks like

### During Test
1. **Run Experiment**: Execute as planned
2. **Monitor Metrics**: Track daily, identify anomalies
3. **Ensure Sample Size**: n > 100 per variant (statistical significance)

### Post-Test
1. **Calculate Results**: Statistical significance, confidence intervals
2. **Update Status**: Validated/Invalidated/Needs More Testing
3. **Document Learnings**: Update `/yc/LEARNING_LOG.md`
4. **Decide Next Steps**: Implement, iterate, or abandon

---

## Hypothesis Priority Matrix

### High Priority (Test First)
1. Willingness to pay $9.99/month (Hypothesis 5)
2. Referral program viral coefficient (Hypothesis 14)
3. SEO landing pages organic signups (Hypothesis 15)
4. Free tier conversion funnel (Hypothesis 12)

### Medium Priority (Test Next)
1. AI personalization satisfaction (Hypothesis 8)
2. Barcode scanning completion (Hypothesis 9)
3. Subscription model LTV (Hypothesis 11)
4. Social media signups (Hypothesis 16)

### Low Priority (Test Later)
1. Diet-restricted premium pricing (Hypothesis 6)
2. 30-second generation acceptable (Hypothesis 10)
3. Affiliate revenue ARPU (Hypothesis 13)

---

## Hypothesis Update Schedule

**Weekly**: Update testing hypotheses with new data  
**Monthly**: Review all hypotheses, update status  
**Quarterly**: Comprehensive hypothesis review, identify new hypotheses

---

**Next Steps**:
1. Fill in actual test results (replace [TO FILL] placeholders)
2. Run high-priority hypothesis tests
3. Document evidence as it comes in
4. Update hypothesis status weekly

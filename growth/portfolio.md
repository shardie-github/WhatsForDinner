# Growth Experiment Portfolio

**Purpose:** Prioritized list of growth experiments linked to financial metrics and validated through data.

**Last Updated:** 2025-01-09  
**Timezone:** America/Toronto

---

## Portfolio Overview

This portfolio contains 5 prioritized growth experiments designed to:
1. Improve unit economics (CAC, LTV, LTV:CAC ratio)
2. Increase revenue growth rate
3. Reduce refund rate
4. Optimize channel efficiency
5. Validate product-market fit signals

---

## Prioritization Framework

Experiments are scored using **Impact × Confidence ÷ Effort**:

- **Impact:** Expected revenue/CAC/LTV improvement (1-10)
- **Confidence:** Likelihood of success based on data/analogs (1-10)
- **Effort:** Development/resource requirements (1-10, higher = more effort)

**Priority Score = (Impact × Confidence) / Effort**

---

## Top 5 Experiments

### 1. **Channel Attribution & CAC Optimization** (Priority Score: 8.0)
- **Impact:** 9 (High - directly improves CAC)
- **Confidence:** 8 (High - proven optimization area)
- **Effort:** 9 (Low effort - data analysis)
- **Status:** Ready to start
- **Slug:** `channel-attribution-optimization`
- **Expected Outcome:** Reduce CAC by 15-20% through better channel allocation
- **Financial Impact:** Improves LTV:CAC ratio, extends cash runway

### 2. **Onboarding Flow Conversion Optimization** (Priority Score: 7.5)
- **Impact:** 8 (High - improves conversion rate)
- **Confidence:** 7 (Medium-High - A/B testing proven method)
- **Effort:** 7.5 (Medium effort - requires dev work)
- **Status:** Ready to start
- **Slug:** `onboarding-conversion-optimization`
- **Expected Outcome:** Increase signup-to-paid conversion by 20-30%
- **Financial Impact:** Increases revenue per visitor, improves CAC efficiency

### 3. **Retention Email Campaign** (Priority Score: 7.0)
- **Impact:** 7 (Medium-High - improves LTV)
- **Confidence:** 8 (High - email marketing proven)
- **Effort:** 6 (Low-Medium effort - email setup)
- **Status:** Ready to start
- **Slug:** `retention-email-campaign`
- **Expected Outcome:** Increase 30-day retention by 15-20%, extend LTV
- **Financial Impact:** Increases LTV, improves LTV:CAC ratio

### 4. **Pricing Page A/B Test** (Priority Score: 6.5)
- **Impact:** 8 (High - directly affects revenue)
- **Confidence:** 6 (Medium - pricing tests can be unpredictable)
- **Effort:** 7 (Medium effort - requires design + dev)
- **Status:** Ready to start
- **Slug:** `pricing-page-ab-test`
- **Expected Outcome:** Optimize pricing display to increase conversion by 10-15%
- **Financial Impact:** Increases ARPU, improves revenue growth

### 5. **Refund Prevention Flow** (Priority Score: 6.0)
- **Impact:** 6 (Medium - reduces refunds)
- **Confidence:** 7 (Medium-High - proactive support proven)
- **Effort:** 8 (Medium-High effort - requires product changes)
- **Status:** Ready to start
- **Slug:** `refund-prevention-flow`
- **Expected Outcome:** Reduce refund rate from 5% to 3-4%
- **Financial Impact:** Improves net revenue, reduces cash flow impact

---

## Experiment Status Summary

| Status | Count | Experiments |
|--------|-------|-------------|
| Ready to Start | 5 | All experiments in portfolio |
| Running | 0 | - |
| Completed | 0 | - |
| Paused | 0 | - |

---

## Success Criteria

### Overall Portfolio Goals (30 days)
- **CAC Reduction:** 10-15% improvement
- **LTV Increase:** 10-15% improvement
- **LTV:CAC Ratio:** Improve from 6.67 to 7.5+
- **Refund Rate:** Reduce from 5% to 4% or lower
- **Conversion Rate:** 15-20% improvement

### Leading Indicators (7-14 days)
- Experiment traffic allocation reached
- Statistical significance approaching (p < 0.1)
- No negative signals (e.g., increased churn, decreased engagement)

---

## Resource Requirements

### Engineering
- **Channel Attribution:** 2-3 days (data analysis, dashboard)
- **Onboarding Flow:** 5-7 days (design + implementation)
- **Retention Email:** 2-3 days (email setup, templates)
- **Pricing Page:** 5-7 days (design + implementation)
- **Refund Prevention:** 7-10 days (product changes, support integration)

**Total:** ~21-30 engineering days

### Design
- **Onboarding Flow:** 3-5 days
- **Pricing Page:** 3-5 days
- **Refund Prevention:** 2-3 days

**Total:** ~8-13 design days

### Data/Analytics
- **Channel Attribution:** 3-5 days (analysis, reporting)
- **All Experiments:** Ongoing monitoring (1-2 hours/day)

**Total:** ~3-5 days + ongoing monitoring

---

## Risk Register

### High Risk
- **Pricing Page Test:** Could negatively impact conversion if not executed well
- **Refund Prevention:** May require significant product changes

### Medium Risk
- **Onboarding Flow:** Requires careful UX design to avoid confusion
- **Retention Email:** Risk of email fatigue if overdone

### Low Risk
- **Channel Attribution:** Low risk, primarily data analysis

---

## Next Steps

1. **Week 1:** Start Channel Attribution & Retention Email (low effort, high impact)
2. **Week 2:** Begin Onboarding Flow & Pricing Page design
3. **Week 3:** Launch Onboarding Flow & Pricing Page experiments
4. **Week 4:** Begin Refund Prevention Flow development
5. **Ongoing:** Monitor all experiments, analyze results, iterate

---

## Experiment Details

See individual experiment plans in `/growth/experiments/<slug>/plan.md` for detailed:
- Hypothesis
- Metrics
- Success thresholds
- Sample size calculations
- Rollout plans
- Rollback plans

---

**Portfolio Owner:** Growth Team  
**Review Frequency:** Weekly  
**Next Review:** 2025-01-16

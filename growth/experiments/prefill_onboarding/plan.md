# Experiment: Pre-fill Onboarding

**Slug:** `prefill_onboarding`  
**Status:** Ready to launch  
**Priority:** High  
**Owner:** Growth Lead

---

## Hypothesis

Pre-filling pantry with sample items and auto-generating first meal plan will reduce time-to-activation from 5+ minutes to <2 minutes, increasing activation rate from 60% to 75%.

---

## Metrics

### Primary
- **Activation rate** (% of signups who generate first meal plan)
  - Baseline: 60%
  - Target: 75%
  - Minimum Detectable Effect: 10%

### Secondary
- **Time-to-activation** (minutes from signup to first meal plan)
  - Baseline: 5+ minutes
  - Target: <2 minutes
- **7-day retention** (% of activated users active after 7 days)
  - Baseline: 45%
  - Target: 50%+

---

## Sample Size Heuristic

**Formula:** n = (2 × (Z_α/2 + Z_β)² × p(1-p)) / d²

Where:
- Z_α/2 = 1.96 (95% confidence)
- Z_β = 0.84 (80% power)
- p = 0.60 (baseline activation rate)
- d = 0.10 (minimum detectable effect)

**Result:** n = 369 per group → **500 users total (250 control, 250 treatment)**

---

## Rollout Plan

**Phase 1:** 10% rollout (50 users) - 3 days  
**Phase 2:** 50% rollout (250 users) - 7 days  
**Phase 3:** 100% rollout (all users) - if success criteria met

**Duration:** 30 days total

---

## Rollback Criteria

**Immediate rollback if:**
- Activation rate drops below 55%
- User feedback shows "too pushy" sentiment (>20% negative)
- Technical errors prevent meal plan generation (>5% error rate)

**Rollback process:**
1. Disable pre-fill feature flag
2. Revert to control onboarding flow
3. Notify team within 1 hour
4. Analyze root cause within 24 hours

---

## Guardrails

1. **User Consent:** Don't auto-generate meal plan without user clicking "Generate"
2. **Relevance:** Pre-filled items must be relevant to user location (Canadian stores)
3. **Flexibility:** Users can remove pre-filled items or start fresh
4. **Feedback:** Monitor user feedback for "too pushy" sentiment
5. **Performance:** Ensure pre-fill doesn't slow down onboarding (>2s load time)

---

## Implementation Details

**Control Group:**
- Standard onboarding: empty pantry, manual meal plan generation

**Treatment Group:**
- Pre-filled pantry: 10-15 common Canadian pantry items
- One-click "Generate my first meal plan" button
- Pre-selected solo/family preference (if detectable)

**Feature Flag:** `prefill_onboarding` (50% rollout)

---

## Success Criteria

**Must achieve:**
- Activation rate: 75%+ (treatment) vs. 60% (control)
- Time-to-activation: <2 minutes (treatment) vs. 5+ minutes (control)

**Nice to have:**
- 7-day retention: 50%+ (treatment) vs. 45% (control)
- User feedback: "easier to use" sentiment

---

## Analysis Plan

**Weekly check-ins:**
- Day 7: Check activation rate, time-to-activation
- Day 14: Check retention, user feedback
- Day 21: Final analysis, decide on 100% rollout
- Day 30: Final report

**Statistical significance:** p < 0.05 required for rollout

---

## Owner & Stakeholders

**Owner:** Growth Lead  
**Stakeholders:** Product Lead, Engineering Lead  
**Analyst:** Growth Analyst (if available)

---

## Related Experiments

- Solo-First Onboarding (complementary)
- Retention Email Automation (downstream impact)

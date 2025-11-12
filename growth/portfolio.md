# Growth Experiment Portfolio

**Generated:** 2025-01-27  
**Status:** Active  
**Total Experiments:** 5 prioritized tests

---

## Overview

This portfolio contains 3-5 prioritized growth experiments designed to improve key metrics: activation, retention, referral, and conversion.

**Portfolio Goals:**
- Increase activation rate: 60% → 75%
- Improve 30-day retention: 40% → 45%
- Build referral loop: 0% → 20% of users from referrals
- Increase conversion: Free → Paid: 5% → 10%

---

## Experiment 1: Pre-fill Onboarding (Activation)

**Status:** Ready to launch  
**Priority:** High  
**Hypothesis:** Pre-filling pantry with sample items and auto-generating first meal plan will reduce time-to-activation from 5+ minutes to <2 minutes, increasing activation rate from 60% to 75%.

**Metrics:**
- Primary: Activation rate (% of signups who generate first meal plan)
- Secondary: Time-to-activation (minutes), 7-day retention

**Sample Size:** 500 users (250 control, 250 treatment)  
**Duration:** 30 days  
**Rollout:** 50% A/B test

**Success Criteria:**
- Activation rate: 75%+ (treatment) vs. 60% (control)
- Time-to-activation: <2 minutes (treatment) vs. 5+ minutes (control)

**Rollback:** If activation rate drops below 55%, revert to control.

**Guardrails:**
- Monitor user feedback for "too pushy" sentiment
- Ensure pre-filled items are relevant to user location
- Don't auto-generate meal plan without user consent

---

## Experiment 2: Solo-First Onboarding (Activation)

**Status:** Ready to launch  
**Priority:** Medium  
**Hypothesis:** Solo-first onboarding flow (detecting solo users and highlighting solo features) will increase solo user activation rate by 25% and improve solo user retention.

**Metrics:**
- Primary: Solo user activation rate
- Secondary: Solo user 7-day retention, Solo user LTV

**Sample Size:** 300 solo users (150 control, 150 treatment)  
**Duration:** 60 days  
**Rollout:** 50% A/B test (solo users only)

**Success Criteria:**
- Solo activation rate: 80%+ (treatment) vs. 60% (control)
- Solo 7-day retention: 55%+ (treatment) vs. 45% (control)

**Rollback:** If solo activation drops below 50%, revert to control.

**Guardrails:**
- Don't exclude family users from core features
- Ensure solo detection is accurate (not false positives)

---

## Experiment 3: Referral Program (Acquisition)

**Status:** Ready to launch  
**Priority:** High  
**Hypothesis:** Referral program ("Refer a friend, both get 1 month free") will drive 20% of new users from referrals, reducing blended CAC from $30 to $20.

**Metrics:**
- Primary: Referral rate (% of new users from referrals)
- Secondary: Blended CAC, Referral conversion rate

**Sample Size:** 1,000 users (all users eligible)  
**Duration:** 90 days  
**Rollout:** 100% (all users)

**Success Criteria:**
- Referral rate: 20%+ of new users
- Blended CAC: $20 (from $30)
- Referral conversion: 15%+ of referred users convert to paid

**Rollback:** If referral abuse detected (>10% fake referrals), add verification.

**Guardrails:**
- Monitor for referral abuse (same IP, fake emails)
- Cap referral rewards per user (max 5 referrals)
- Verify referred users are real (email verification)

---

## Experiment 4: Grocery Integration Conversion Lift (Conversion)

**Status:** Ready to launch  
**Priority:** High  
**Hypothesis:** Highlighting grocery integration feature ("Add to Loblaws cart") will increase free-to-paid conversion by 2x for users who use grocery integration.

**Metrics:**
- Primary: Free-to-paid conversion rate (grocery users vs. non-grocery users)
- Secondary: Grocery integration usage rate, Grocery user LTV

**Sample Size:** 500 free users (250 see grocery CTA, 250 control)  
**Duration:** 60 days  
**Rollout:** 50% A/B test

**Success Criteria:**
- Grocery user conversion: 10%+ (treatment) vs. 5% (control)
- Grocery integration usage: 60%+ of users
- Grocery user LTV: $180+ (vs. $144 baseline)

**Rollback:** If conversion drops below 3%, remove grocery CTA.

**Guardrails:**
- Only show grocery CTA if user's store is integrated
- Don't overwhelm users with grocery prompts
- Ensure grocery integration works reliably

---

## Experiment 5: Retention Email Automation (Retention)

**Status:** Ready to launch  
**Priority:** Medium  
**Hypothesis:** Weekly "pantry running low" emails and monthly "favorites" recaps will increase 30-day retention from 40% to 46%.

**Metrics:**
- Primary: 30-day retention rate
- Secondary: Email open rate, Email click rate, Re-engagement rate

**Sample Size:** 1,000 users (500 control, 500 treatment)  
**Duration:** 90 days  
**Rollout:** 50% A/B test

**Success Criteria:**
- 30-day retention: 46%+ (treatment) vs. 40% (control)
- Email open rate: 30%+
- Re-engagement rate: 15%+ (users who return after email)

**Rollback:** If retention drops below 35%, pause emails.

**Guardrails:**
- Respect email preferences (unsubscribe)
- Don't send more than 2 emails per week
- Personalize emails (use user's pantry data)

---

## Experiment Prioritization

**Priority Order (Impact × Confidence ÷ Time-to-Value):**

1. **Pre-fill Onboarding** (Priority: 9.5) - High impact, high confidence, low effort
2. **Referral Program** (Priority: 6.4) - High impact, high confidence, medium effort
3. **Grocery Integration Conversion** (Priority: 4.2) - High impact, medium confidence, medium effort
4. **Retention Email Automation** (Priority: 2.1) - Medium impact, medium confidence, medium effort
5. **Solo-First Onboarding** (Priority: 1.8) - Medium impact, medium confidence, medium effort

---

## Portfolio Metrics Dashboard

**Overall Portfolio Goals:**

| Metric | Baseline | Target | Current | Status |
|--------|----------|--------|---------|--------|
| Activation Rate | 60% | 75% | 60% | 🟡 In Progress |
| 30-Day Retention | 40% | 46% | 40% | 🟡 In Progress |
| Referral Rate | 0% | 20% | 0% | 🔴 Not Started |
| Free-to-Paid Conversion | 5% | 10% | 5% | 🟡 In Progress |
| Blended CAC | $30 | $20 | $30 | 🔴 Not Started |

---

## Next Steps

1. **Week 1:** Launch Pre-fill Onboarding experiment
2. **Week 2:** Launch Referral Program experiment
3. **Week 3:** Launch Grocery Integration Conversion experiment
4. **Week 4:** Review results, iterate on experiments
5. **Week 5:** Launch Retention Email Automation experiment
6. **Week 6:** Launch Solo-First Onboarding experiment

---

*Individual experiment plans in `/growth/experiments/<slug>/plan.md`*

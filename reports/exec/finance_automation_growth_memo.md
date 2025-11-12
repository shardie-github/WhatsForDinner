# Finance → Automation → Growth Execution Chain Memo

**Generated:** 2025-01-27  
**Status:** Ready for execution  
**Owner:** Growth Lead

---

## Executive Summary

This memo outlines the top 5 actions from the Finance → Automation → Growth execution chain, prioritized by Impact × Confidence ÷ Effort.

**Top 5 Actions:**
1. Enable monetization channels (7 days, Priority: 9.5)
2. Increase test coverage (14 days, Priority: 6.4)
3. Optimize onboarding (30 days, Priority: 2.5)
4. Lock grocery partnerships (60 days, Priority: 1.2)
5. Activate referral program (60 days, Priority: 1.1)

---

## Action 1: Enable Monetization Channels

**Priority:** 9.5 (Impact × Confidence ÷ Time)  
**Impact:** High  
**Confidence:** 95%  
**Time:** 7 days  
**Effort:** Low

**Objective:** Activate existing monetization infrastructure to generate $500+/month passive revenue.

**Steps:**
1. Run `pnpm monetization:enable` (1 day)
2. Set environment variables: `AFFILIATE_ENABLED=true`, `API_MONETIZATION_ENABLED=true`, `DATA_INSIGHTS_ENABLED=true` (1 day)
3. Connect revenue dashboard to Stripe + database (5 days)
4. Verify revenue tracking (1 day)

**Success Criteria:**
- Revenue dashboard shows non-zero revenue
- Affiliate tracking works
- API monetization endpoints active

**KPI:** $500+/month from monetization channels

**30-Day Signal:** Revenue dashboard shows non-zero revenue from at least one channel

**Owner:** Growth Lead

---

## Action 2: Increase Test Coverage (Unblock GTM)

**Priority:** 6.4 (Impact × Confidence ÷ Time)  
**Impact:** High  
**Confidence:** 90%  
**Time:** 14 days  
**Effort:** Medium

**Objective:** Fix GTM blocker (test coverage) to enable launch readiness.

**Steps:**
1. Add test coverage tool to CI (Jest coverage, 2 days)
2. Set coverage gate: fail builds if <80% (1 day)
3. Increase test coverage to 80%+ (10 days)
4. Fix critical bugs identified in GTM audit (1 day)
5. Re-run GTM audit, verify score >90 (1 day)

**Success Criteria:**
- GTM audit score >90
- Test coverage >80%
- All critical bugs fixed

**KPI:** GTM readiness: READY (from NOT_READY)

**30-Day Signal:** GTM audit score >90, test coverage >80%

**Owner:** Engineering Lead

---

## Action 3: Optimize Onboarding (2-Min Activation)

**Priority:** 2.5 (Impact × Confidence ÷ Time)  
**Impact:** Medium  
**Confidence:** 75%  
**Time:** 30 days  
**Effort:** Low

**Objective:** Reduce time-to-activation from 5+ minutes to <2 minutes, increase activation rate from 60% to 75%.

**Steps:**
1. Pre-fill pantry with sample items (7 days)
2. Add one-click "Generate my first meal plan" button (7 days)
3. A/B test: 50% rollout (7 days)
4. Measure activation rate, time-to-activation (7 days)
5. Roll out to 100% if success criteria met (2 days)

**Success Criteria:**
- Activation rate: 75%+ (treatment) vs. 60% (control)
- Time-to-activation: <2 minutes (treatment) vs. 5+ minutes (control)

**KPI:** Activation rate: 75%+ (from 60%)

**30-Day Signal:** Activation rate >75%, time-to-activation <2 minutes

**Owner:** Growth Lead

---

## Action 4: Lock Grocery Partnerships

**Priority:** 1.2 (Impact × Confidence ÷ Time)  
**Impact:** High  
**Confidence:** 70%  
**Time:** 60 days  
**Effort:** Medium

**Objective:** Secure Canadian grocery store API partnerships to strengthen moat.

**Steps:**
1. Research grocery store API programs (Loblaws, Metro, Sobeys, FreshCo, Real Canadian Superstore) (3 days)
2. Reach out to API teams, offer data insights value prop (7 days)
3. Apply for API access (7 days)
4. Build integrations for 2+ stores (30 days)
5. Test integrations with beta users (10 days)
6. Launch publicly (3 days)

**Success Criteria:**
- 2+ grocery stores integrated
- 60% of users use integration feature
- Conversion lift: 2x (free → paid)

**KPI:** Grocery integration usage: 60%+ (from 0%), conversion lift: 2x

**30-Day Signal:** 2+ grocery stores integrated, 60% of users use integration

**Owner:** Partnerships Lead

---

## Action 5: Activate Referral Program

**Priority:** 1.1 (Impact × Confidence ÷ Time)  
**Impact:** Medium  
**Confidence:** 80%  
**Time:** 60 days  
**Effort:** Medium

**Objective:** Build referral loop to drive 20% of new users from referrals, reduce CAC from $30 to $20.

**Steps:**
1. Build referral API (30 days)
2. Create reward logic: "Refer friend, both get 1 month free" (7 days)
3. Add referral UI to app (7 days)
4. Launch referral program (7 days)
5. Measure referral rate, CAC reduction (9 days)

**Success Criteria:**
- Referral rate: 20%+ of new users
- Blended CAC: $20 (from $30)
- Referral conversion: 15%+ of referred users convert to paid

**KPI:** Referral rate: 20%+ (from 0%), Blended CAC: $20 (from $30)

**30-Day Signal:** Referral rate >15%, CAC <$25

**Owner:** Growth Lead

---

## 30/60/90 Day Plan

### 30 Days

**Week 1:**
- Enable monetization channels (Action 1)
- Start test coverage increase (Action 2)

**Week 2:**
- Continue test coverage (Action 2)
- Start onboarding optimization (Action 3)

**Week 3:**
- Continue onboarding optimization (Action 3)
- Research grocery partnerships (Action 4)

**Week 4:**
- Complete onboarding A/B test (Action 3)
- Reach out to grocery API teams (Action 4)

**Deliverables:**
- Revenue dashboard showing non-zero revenue
- Test coverage >80%
- Onboarding A/B test launched

---

### 60 Days

**Week 5-6:**
- Build grocery integrations (Action 4)
- Start referral program development (Action 5)

**Week 7-8:**
- Complete grocery integrations (Action 4)
- Continue referral program (Action 5)

**Deliverables:**
- 2+ grocery stores integrated
- Referral program API built
- Onboarding optimization rolled out to 100%

---

### 90 Days

**Week 9-10:**
- Launch grocery integrations publicly (Action 4)
- Launch referral program (Action 5)

**Week 11-12:**
- Measure results, iterate
- Scale successful experiments

**Deliverables:**
- Grocery integration usage: 60%+
- Referral rate: 20%+
- All 5 actions complete

---

## Risk Mitigation

**Risk 1: Monetization channels don't generate revenue**
- Mitigation: Debug revenue tracking, verify API connections
- Owner: Growth Lead

**Risk 2: Test coverage increase takes longer than 14 days**
- Mitigation: Prioritize critical paths, use code coverage tools
- Owner: Engineering Lead

**Risk 3: Grocery partnerships stall**
- Mitigation: Start with public APIs, build relationships, fallback to manual lists
- Owner: Partnerships Lead

**Risk 4: Referral program doesn't drive referrals**
- Mitigation: Improve referral UI, increase reward value, test messaging
- Owner: Growth Lead

---

## Success Metrics

### 30-Day Signals

- Revenue dashboard shows non-zero revenue
- Test coverage >80%
- Onboarding A/B test shows activation rate >70%

### 60-Day Signals

- 2+ grocery stores integrated
- Referral program active, referral rate >10%
- Activation rate >75%

### 90-Day Signals

- MRR >$1,000/month
- Grocery integration usage >60%
- Referral rate >20%
- Blended CAC <$25

---

*See individual action plans in `/backlog/READY_*` tickets*

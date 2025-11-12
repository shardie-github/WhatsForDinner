# Feedback Loop Fixes

**Generated:** 2025-01-27  
**Status:** Ready for implementation

---

## Fix 1: Acquisition → Activation Loop

**Problem:** Empty pantry requires manual input (5+ minutes), activation rate only 60%

**Solution:** Pre-fill onboarding

**Implementation:**
1. Pre-fill pantry with 10-15 common Canadian pantry items
2. Add one-click "Generate my first meal plan" button
3. A/B test: 50% rollout
4. Measure: activation rate, time-to-activation

**Expected Impact:**
- Activation rate: 60% → 75%
- Time-to-activation: 5+ min → <2 min

**Owner:** Growth Lead  
**KPI:** Activation rate >75%  
**30-Day Signal:** Activation rate >70% in treatment group

**Ticket:** `/backlog/READY_loop_fix_001.md`

---

## Fix 2: Activation → Retention Loop

**Problem:** No daily habit formation, 30-day retention only 40%

**Solution:** Retention email automation

**Implementation:**
1. Weekly "pantry running low" emails
2. Monthly "favorites" recaps
3. Push notifications: "What's for dinner tonight?"
4. A/B test: 50% rollout

**Expected Impact:**
- 30-day retention: 40% → 46%
- Email open rate: 30%+
- Re-engagement rate: 15%+

**Owner:** Growth Lead  
**KPI:** 30-day retention >46%  
**30-Day Signal:** 30-day retention >42% in treatment group

**Ticket:** `/backlog/READY_loop_fix_002.md`

---

## Fix 3: Retention → Referral Loop

**Problem:** No referral program exists, referral rate 0%

**Solution:** Build referral program

**Implementation:**
1. Build referral API
2. Create reward: "Refer friend, both get 1 month free"
3. Add referral UI to app
4. Launch referral program

**Expected Impact:**
- Referral rate: 0% → 20%
- Blended CAC: $30 → $20
- Referral conversion: 15%+

**Owner:** Growth Lead  
**KPI:** Referral rate >20%  
**30-Day Signal:** Referral rate >10%

**Ticket:** `/backlog/READY_loop_fix_003.md`

---

## Fix 4: Referral → Acquisition Loop

**Problem:** No referral program (depends on Fix 3)

**Solution:** Build referral program (same as Fix 3)

**Implementation:**
- Same as Fix 3 (referral program)

**Expected Impact:**
- Acquisition cost: -33% (CAC $30 → $20)
- Organic growth: +20% of users from referrals

**Owner:** Growth Lead  
**KPI:** Blended CAC <$25  
**30-Day Signal:** Blended CAC <$30

**Ticket:** `/backlog/READY_loop_fix_004.md`

---

## Implementation Priority

1. **Fix 1** (Acquisition → Activation) - Priority: 9.5
2. **Fix 2** (Activation → Retention) - Priority: 2.1
3. **Fix 3 & 4** (Referral loops) - Priority: 1.1

---

*See individual tickets in `/backlog/READY_loop_fix_*.md`*

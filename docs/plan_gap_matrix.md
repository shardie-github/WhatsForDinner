# Gap Closure Execution Plan

**Date**: 2025-01-21  
**Timeline**: 2-week sprint  
**Target**: Close critical gaps → 42 → 55+ market fit score

---

## Gap Matrix: Impact × Effort × Risk

| Gap ID | Gap Description | Category | Impact | Effort | Risk | Priority | Owner | ETA |
|--------|----------------|----------|--------|--------|------|----------|-------|-----|
| G1 | No validated user base | Market | 10 | 4 | 6 | P0 | Product | 7d |
| G2 | Unclear value prop (vs Yummly) | Messaging | 9 | 3 | 5 | P0 | Product | 3d |
| G3 | Feature bloat (unvalidated apps) | Product | 8 | 2 | 4 | P1 | Eng | 1d |
| G4 | No proven revenue model | Monetization | 10 | 6 | 8 | P0 | Product | 14d |
| G5 | Missing grocery integration | Product | 9 | 7 | 7 | P1 | Eng | 21d |
| G6 | No onboarding flow | Product | 7 | 4 | 3 | P1 | Eng | 5d |
| G7 | Empty state UX missing | UX | 6 | 3 | 2 | P2 | Eng | 3d |
| G8 | No GTM materials | Messaging | 7 | 4 | 3 | P1 | Product | 4d |
| G9 | No experiment infrastructure | Growth | 6 | 5 | 4 | P2 | Eng | 3d |
| G10 | No content marketing | Growth | 7 | 5 | 2 | P1 | Product | Ongoing |

**Priority Scale**: P0 = Critical, P1 = High, P2 = Medium  
**Impact/Effort Scale**: 1-10 (1 = low, 10 = critical)

---

## Sprint Plan: Week 1-2

### Week 1 (Days 1-5): Foundation

**Day 1-2: Positioning & Messaging**
- [x] Update homepage hero (3 variants)
- [x] Create landing variants A/B/C
- [ ] Generate messaging_map.md
- [ ] Generate one_pager.md, mini_deck.md
- **Owner**: Product  
- **Acceptance**: Hero variants live, GTM docs complete

**Day 3-4: Onboarding & Empty State**
- [ ] Enhance onboarding checklist (sample data)
- [ ] Build empty-state component with CTAs
- [ ] Add pantry quick-start flow
- **Owner**: Eng  
- **Acceptance**: New users see checklist + empty state, can seed sample data

**Day 5: Experiments Infrastructure**
- [ ] Configure experiment stop rules
- [ ] Add experiment logging endpoints
- [ ] Wire up conversion tracking
- **Owner**: Eng  
- **Acceptance**: Experiments track exposures/conversions, stop rules active

### Week 2 (Days 6-10): Monetization & GTM

**Day 6-7: Pricing & Upgrade Flow**
- [ ] Improve upgrade CTA placement
- [ ] Add telemetry to checkout flow
- [ ] Create pricing experiments config
- **Owner**: Eng  
- **Acceptance**: Upgrade clicks tracked, checkout events logged

**Day 8-9: GTM Materials & Outreach**
- [ ] Generate ICP profiles (enhance existing)
- [ ] Create outreach-draft.mjs script
- [ ] Produce sales snippets for ICPs
- **Owner**: Product  
- **Acceptance**: Outreach script generates 5 personalized emails from ICP inputs

**Day 10: Proof & Documentation**
- [ ] Generate gap-closure proof JSON
- [ ] Update market_fit_score.json
- [ ] Document all PRs and changes
- **Owner**: Product  
- **Acceptance**: Signed proof with checklist, updated score

---

## Critical Actions by Category

### Product Fit & JTBD

**Gap**: Core value unclear, pantry-first not prominent

**Actions**:
1. ✅ Implement "Use My Pantry" button (pantry-first flow)
2. ✅ Add empty-state guidance ("Add ingredients to get started")
3. ✅ Enhance onboarding to highlight core value
4. ✅ Create JTBD specs (pantry-first, personalization, speed)

**Success Metrics**:
- Time-to-first-recipe: < 30s (target)
- % users using pantry vs. manual: 60%+ (target)
- Onboarding completion: 70%+ (target)

---

### Value Narrative & Positioning

**Gap**: Generic messaging, no differentiation proof

**Actions**:
1. ✅ Rewrite hero with 3 variants (Problem/Outcome/Proof)
2. ✅ Create messaging_map.md with ICP-specific copy
3. ✅ Generate one_pager.md (90-second sales pitch)
4. ✅ Generate mini_deck.md (6 slides for investors)

**Success Metrics**:
- Recipe generation rate: 25%+ (from landing)
- Time-to-understand-value: < 5s (target)

---

### Monetization & Pricing

**Gap**: No paying customers, revenue model unproven

**Actions**:
1. ✅ Improve upgrade CTA visibility (homepage, recipe cards)
2. ✅ Add checkout event telemetry
3. ✅ Create pricing hypotheses doc (3 tiers, value metrics)
4. ✅ Implement feature gates for premium features

**Success Metrics**:
- Upgrade CTA click rate: 5%+ (target)
- Free → Paid conversion: 5%+ (target, 90-day goal)
- First paying customer: Week 2-3 (goal)

---

### Acquisition Experiments

**Gap**: No growth channels validated

**Actions**:
1. ✅ Deploy landing variants A/B/C
2. ✅ Configure experiment stop rules
3. ✅ Add experiment logging API endpoints
4. ✅ Create waitlist/referral toggle (future)

**Success Metrics**:
- Landing conversion rate: 25%+ (target)
- Experiment statistical significance: 95%+ (target)
- Stop rules trigger correctly (validation)

---

### Adoption & Onboarding

**Gap**: Users don't know how to get value

**Actions**:
1. ✅ Enhance onboarding checklist
2. ✅ Add sample data seeding (opt-in)
3. ✅ Build empty-state UX with import CTAs
4. ✅ Add guided first-run flow

**Success Metrics**:
- Onboarding completion: 70%+ (target)
- First recipe generated: < 5min from signup (target)
- Sample data usage: 40%+ of new users (target)

---

### Tech & RLS Hardening

**Gap**: Need to ensure no regressions

**Actions**:
1. ✅ Keep migrate-before-build
2. ✅ Expand RLS tests for new tables
3. ✅ Ensure env keys propagate (GitHub/Vercel)
4. ✅ Run secrets scan

**Success Metrics**:
- All RLS tests pass
- No secrets in code
- CI/CD green

---

### GTM Starter Pack

**Gap**: No sales/marketing materials

**Actions**:
1. ✅ Enhance ICP_profiles.md (already exists)
2. ✅ Create messaging_map.md
3. ✅ Generate one_pager.md, mini_deck.md
4. ✅ Build outreach-draft.mjs script

**Success Metrics**:
- All GTM docs complete
- Outreach script generates valid emails
- Messaging aligned with positioning

---

## Acceptance Tests

### Landing Variants
- [ ] Variants A, B, C respond 200
- [ ] Experiment assignment consistent (same user = same variant)
- [ ] Conversion events tracked correctly
- [ ] Stop rules configured and testable

### Onboarding
- [ ] Checklist appears for new users
- [ ] Sample data seeding works
- [ ] Checklist completion tracked
- [ ] Empty state shows when pantry empty

### Upgrade Flow
- [ ] Upgrade CTA visible on homepage (free users)
- [ ] Checkout event logged to telemetry
- [ ] Feature gates enforce limits
- [ ] Stripe integration works

### Experiments
- [ ] Experiment events logged via API
- [ ] Exposures tracked correctly
- [ ] Conversions tracked correctly
- [ ] Stop rules can trigger pauses

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Landing variants break | Low | High | Feature flag, canary deploy |
| Experiments skew data | Medium | Medium | Statistical validation, stop rules |
| RLS breaks existing auth | Low | High | Comprehensive tests, shadow env |
| GTM materials too generic | Medium | Low | ICP-specific variants, user feedback |
| Upgrade flow friction | Medium | High | A/B test checkout steps, analytics |

---

## Success Criteria (End of Sprint)

**Week 1 Targets**:
- ✅ +2 pts market_fit_score (42 → 44+)
- ✅ ≥1 variant live (landing A/B/C)
- ✅ ≥1 JTBD gap closed (pantry-first flow)

**Week 2 Targets**:
- ✅ Onboarding flow complete
- ✅ GTM materials shipped
- ✅ Upgrade flow with telemetry

**90-Day Targets**:
- Market fit score: 65+
- 1,000 active users
- First paying customer
- 40% weekly retention

---

## Related Gaps (Out of Scope for Sprint)

**Deferred**:
- Grocery integration (21 days, requires partnerships)
- Content marketing (ongoing, requires SEO strategy)
- B2B sales (after consumer validation)
- Diet specialization (2-3 months, requires domain expertise)

**Rationale**: Focus on core validation first, then expand.

---

**Status**: ✅ Plan Complete  
**Next Review**: End of Week 1  
**Decision Point**: Week 2 - proceed with monetization or pivot if retention < 30%

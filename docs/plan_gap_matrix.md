# Gap Matrix & 2-Week Execution Plan

**Generated**: 2025-01-21  
**Current Market Fit Score**: 42/100  
**Target Score (90 days)**: 70/100  
**Week 1 Target**: +2 points, 1 variant live, 1 JTBD gap closed

---

## Gap Matrix: Impact × Effort × Risk

| Gap ID | Gap | Impact | Effort | Risk | Priority | Owner | ETA |
|--------|-----|--------|--------|------|----------|-------|-----|
| **USER-VALIDATION** | No user validation / retention data | 🔴 Critical | 3 | Medium | **P0** | Product | 3 days |
| **REVENUE-MODEL** | No proven revenue model | 🔴 Critical | 4 | Low | **P0** | Product + Eng | 5 days |
| **DIFFERENTIATION** | Unclear unique selling proposition | 🟠 High | 5 | Medium | **P1** | Product + Marketing | 7 days |
| **FEATURE-BLOAT** | Too many unvalidated features | 🟠 High | 2 | Low | **P1** | Product | 1 day |
| **GTM-EXECUTION** | No go-to-market execution | 🟠 High | 4 | Medium | **P1** | Marketing | 10 days |
| **MESSAGING** | Generic value prop, no emotional hooks | 🟡 Medium | 3 | Low | **P2** | Marketing | 2 days |
| **ONBOARDING** | No guided first-run experience | 🟡 Medium | 3 | Low | **P2** | Eng | 4 days |
| **MONETIZATION-INFRA** | No pricing tiers, feature gates | 🟡 Medium | 5 | Medium | **P1** | Eng | 6 days |
| **EXPERIMENTS** | No A/B testing infrastructure | 🟡 Medium | 4 | Low | **P2** | Eng | 5 days |
| **CONTENT-MARKETING** | SEO content not executed | 🟡 Medium | 2 | Low | **P2** | Marketing | Ongoing |

**Legend**:  
- Impact: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low  
- Effort: 1-10 (1=quick fix, 10=major project)  
- Risk: Low / Medium / High  
- Priority: P0 (Do Now) / P1 (This Sprint) / P2 (Next Sprint)

---

## 2-Week Execution Plan

### Week 1: Foundations & Validation

#### Days 1-3: Critical Gaps

**Day 1 (Monday)**
- ✅ Create gap matrix and plan (this doc)
- ✅ Simplify UI: Hide non-core features (community, marketplace)
- ✅ Create JTBD specs and value narrative refresh
- 🎯 **Owner**: Product Lead

**Day 2 (Tuesday)**
- ✅ Implement landing page variant A (pantry-first, emotional hooks)
- ✅ Implement landing page variant B (outcome-focused, proof points)
- ✅ Set up experiment infrastructure (logging, variant assignment)
- 🎯 **Owner**: Eng Lead

**Day 3 (Wednesday)**
- ✅ Deploy both variants with tracking
- ✅ Implement basic telemetry: user_id, variant, conversions
- ✅ Create user interview script and outreach
- 🎯 **Owner**: Product + Marketing

#### Days 4-5: Revenue & Monetization

**Day 4 (Thursday)**
- ✅ Define 3 pricing tiers (Free, Pro $9.99, Premium $19.99)
- ✅ Implement feature gates API
- ✅ Create upgrade CTA component
- 🎯 **Owner**: Eng Lead

**Day 5 (Friday)**
- ✅ Wire checkout flow (server-validated)
- ✅ Add pricing page
- ✅ Implement checkout/intake event telemetry
- 🎯 **Owner**: Eng Lead

#### Weekend: Content & GTM Prep

**Days 6-7**
- ✅ Write 3 variant headlines for A/B test
- ✅ Draft GTM materials (ICP profiles, messaging map)
- ✅ Create sales one-pager and mini-deck
- 🎯 **Owner**: Marketing Lead

---

### Week 2: Adoption & Experiments

#### Days 8-10: Onboarding & Feature Gaps

**Day 8 (Monday)**
- ✅ Build onboarding checklist component
- ✅ Create sample data seeder (opt-in)
- ✅ Implement empty-state UX with "Import/Connect" CTAs
- 🎯 **Owner**: Eng Lead

**Day 9 (Tuesday)**
- ✅ Close JTBD Gap #1: "Pantry Import" flow
- ✅ Close JTBD Gap #2: "Dietary Preferences Wizard"
- ✅ Test onboarding flow end-to-end
- 🎯 **Owner**: Eng Lead + Product

**Day 10 (Wednesday)**
- ✅ Ship waitlist/referral toggle
- ✅ Add share link generation + count tracking
- ✅ Create experiments/*.json configs
- 🎯 **Owner**: Eng Lead

#### Days 11-12: GTM Execution & AI Leverage

**Day 11 (Thursday)**
- ✅ Publish ICP profiles and messaging map
- ✅ Create outreach script generator
- ✅ Stand up semantic search using existing ai_embeddings
- 🎯 **Owner**: Marketing + Eng

**Day 12 (Friday)**
- ✅ Add prompt privacy-guard middleware to AI routes
- ✅ Log outcomes to ai_health_metrics
- ✅ Finalize all GTM materials
- 🎯 **Owner**: Eng Lead + Marketing

#### Days 13-14: Proof & CI

**Weekend**
- ✅ Create gap-closure proof artifact
- ✅ Update RealityOps dashboard with experiment cards
- ✅ Add CI workflows (gap-sprint.yml, reality-check extension)
- ✅ Generate all PRs with acceptance tests
- 🎯 **Owner**: Eng Lead + DevOps

---

## Acceptance Tests & Success Metrics

### Week 1 Targets

**Must Pass:**
- ✅ Landing variants respond 200 OK
- ✅ Experiment logs recorded (variant → conversion)
- ✅ Upgrade CTA event captured
- ✅ Pricing tiers defined and gated
- ✅ No RLS regressions
- ✅ All secrets propagate correctly

**Nice to Have:**
- ✅ Onboarding checklist renders
- ✅ Sample data seeding works (opt-in)
- ✅ ICP profiles published

### Week 2 Targets

**Must Pass:**
- ✅ Onboarding flow completes < 2 minutes
- ✅ All 3 JTBD gaps closed (per specs)
- ✅ Experiments have stop rules defined
- ✅ Gap-closure proof signed
- ✅ RealityOps dashboard updated

**Nice to Have:**
- ✅ Semantic search returns results
- ✅ Outreach script generates valid emails
- ✅ Waitlist referral tracking functional

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Landing variants break existing flow | Low | High | Feature flag rollback, shadow deploy |
| Pricing changes break billing | Medium | High | Test in staging, gradual rollout |
| RLS policies break user access | Low | Critical | Test all roles (anon, authenticated, server) |
| Experiments corrupt data | Low | Medium | Write-only logging, no destructive ops |
| Over-engineering (again) | Medium | Medium | Daily check: "Does this close a gap from matrix?" |

---

## Dependencies & Blockers

**External Dependencies:**
- Stripe account for checkout (assume exists)
- Supabase RLS policies (extend existing)
- Vercel deployment pipeline (assume exists)

**Internal Blockers:**
- None identified (all gaps are internal execution)

**If Blocked:**
- Create scoped ticket, ship rest of plan
- Document in proof artifact

---

## Owners & Accountability

| Owner | Role | Responsible For | Slack/Daily Standup |
|-------|------|----------------|---------------------|
| Product Lead | PM | Gap prioritization, JTBD specs, user interviews | Daily 9am |
| Eng Lead | Engineering | Implementation, CI/CD, RLS, telemetry | Daily 9am |
| Marketing Lead | Growth | GTM materials, messaging, variants | Daily 9am |
| DevOps | Infrastructure | CI workflows, secrets, deployment | On-call |

---

## Daily Standup Template

**Format**: 15 min, async or sync

**Questions:**
1. What did I ship yesterday that closes a gap?
2. What's blocking me today?
3. What will I ship today?
4. Any risks to Week 1/Week 2 targets?

---

## Communication Plan

**Daily**: Standup update (Slack/Async)  
**End of Week 1**: Progress review + proof draft  
**End of Week 2**: Final proof + PR summary + dashboard update

---

## Success Criteria: Gap Closure

✅ **USER-VALIDATION**: User interview script ready, variant tracking live  
✅ **REVENUE-MODEL**: Pricing tiers defined, checkout functional  
✅ **DIFFERENTIATION**: 3 value prop variants A/B testing  
✅ **FEATURE-BLOAT**: UI simplified (non-core hidden)  
✅ **GTM-EXECUTION**: ICP, messaging, one-pager, mini-deck published  
✅ **MESSAGING**: Emotional hooks in variants, proof points added  
✅ **ONBOARDING**: Checklist + sample data functional  
✅ **MONETIZATION-INFRA**: Feature gates + upgrade flow wired  
✅ **EXPERIMENTS**: Logging + variant assignment + stop rules  
✅ **CONTENT-MARKETING**: Content plan documented (execution ongoing)

---

**Next Review**: End of Week 2 (2025-02-04)  
**Proof Artifact**: `/proofs/gap_closure_[timestamp].json`  
**Dashboard**: RealityOps experiment cards + conversion funnel

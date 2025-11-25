# Experiment Cadence: What's for Dinner

**Purpose**: Weekly/monthly experiment schedule for systematic growth  
**Last Updated**: 2025-01-27

---

## Experiment Philosophy

**Principles**:
1. **One experiment per week** (focus, not multitasking)
2. **Clear success metrics** (define before running)
3. **Document learnings** (update `/yc/LEARNING_LOG.md`)
4. **Iterate quickly** (fail fast, learn fast)

---

## Weekly Experiment Schedule (Next 12 Weeks)

### Week 1: Referral Reward Structure
**Experiment**: Test referral reward: 1 month free vs 2 weeks free  
**Hypothesis**: 1 month free will increase referral rate by 50%  
**Success Metric**: Referral rate > 20% (20% of users refer 1 person)  
**Implementation**: A/B test referral rewards in `/apps/web/src/app/referrals/page.tsx`  
**Status**: ⚠️ **PENDING** - Need to build referral UI first

---

### Week 2: Onboarding Flow Optimization
**Experiment**: Test onboarding flow: Quick start (3 pantry items) vs Full setup (10+ items)  
**Hypothesis**: Quick start will increase activation rate by 30%  
**Success Metric**: Activation rate > 40% (40% of signups generate first recipe within 7 days)  
**Implementation**: A/B test onboarding flow in `/apps/web/src/app/onboarding/page.tsx`  
**Status**: ⚠️ **PENDING** - Need to create onboarding flow

---

### Week 3: SEO Landing Pages
**Experiment**: Create SEO landing pages for "what to make with [ingredients]"  
**Hypothesis**: SEO pages will drive 100+ organic signups/month  
**Success Metric**: 100+ signups/month from organic search  
**Implementation**: Create `/apps/web/src/app/recipes/what-to-make-with/[ingredients]/page.tsx`  
**Status**: ⚠️ **PENDING** - Need to implement SEO pages

---

### Week 4: Social Sharing Buttons
**Experiment**: Add "Share Recipe" buttons to recipes  
**Hypothesis**: Social sharing will increase viral coefficient by 0.1  
**Success Metric**: Viral coefficient > 0.2 (20% of users refer 1 person)  
**Implementation**: Add share buttons to `/apps/web/src/components/recipe/RecipeCard.tsx`  
**Status**: ⚠️ **PENDING** - Need to implement share buttons

---

### Week 5: Email Activation Sequence
**Experiment**: Test email sequence: Welcome → Day 1 tutorial → Day 3 suggestions → Day 7 reminder  
**Hypothesis**: Email sequence will increase activation rate by 20%  
**Success Metric**: Activation rate > 45% (with email vs 40% without)  
**Implementation**: Create email sequences in `/apps/web/src/lib/email/sequences.ts`  
**Status**: ⚠️ **PENDING** - Need to implement email sequences

---

### Week 6: Pricing Page A/B Test
**Experiment**: Test pricing page: $9.99/month vs $7.99/month vs $12.99/month  
**Hypothesis**: $9.99/month will maximize revenue (conversion × price)  
**Success Metric**: Revenue per visitor (conversion rate × price)  
**Implementation**: A/B test pricing in `/apps/web/src/app/pricing/page.tsx`  
**Status**: ⚠️ **PENDING** - Need to create pricing page A/B test

---

### Week 7: Landing Page Hero Copy
**Experiment**: Test hero copy: "Pantry-first meal planning" vs "AI recipe generator" vs "Never wonder what's for dinner again"  
**Hypothesis**: "Pantry-first" will increase signup rate by 25%  
**Success Metric**: Signup rate > 10% (10% of visitors sign up)  
**Implementation**: A/B test hero copy in `/apps/web/src/app/landing/page.tsx`  
**Status**: ✅ **READY** - Experimentation framework exists

---

### Week 8: Free Tier Limit
**Experiment**: Test free tier: 10 recipes/day vs 5 recipes/day vs 20 recipes/day  
**Hypothesis**: 10 recipes/day will maximize conversion (not too restrictive, not too generous)  
**Success Metric**: Conversion rate (free → paid) > 5%  
**Implementation**: A/B test free tier limits  
**Status**: ⚠️ **PENDING** - Need to implement tier limits

---

### Week 9: Recipe Card Design
**Experiment**: Test recipe card: Image-first vs Text-first vs Minimal  
**Hypothesis**: Image-first will increase recipe click-through by 30%  
**Success Metric**: Recipe click-through rate > 60%  
**Implementation**: A/B test recipe card design in `/apps/web/src/components/recipe/RecipeCard.tsx`  
**Status**: ✅ **READY** - Component exists, can A/B test

---

### Week 10: Pantry Scan Flow
**Experiment**: Test pantry scan: Barcode scan vs Manual entry vs Receipt import  
**Hypothesis**: Barcode scan will increase pantry setup completion by 40%  
**Success Metric**: Pantry setup completion rate > 70%  
**Implementation**: A/B test pantry scan flow  
**Status**: ⚠️ **PENDING** - Need to implement barcode scanning

---

### Week 11: Recipe Generation Speed
**Experiment**: Test recipe generation: 30 seconds vs 15 seconds vs 60 seconds  
**Hypothesis**: 30 seconds is optimal (fast enough, but shows AI is working)  
**Success Metric**: User satisfaction (recipe rating) > 4 stars  
**Implementation**: A/B test generation speed  
**Status**: ⚠️ **PENDING** - Need to optimize generation speed

---

### Week 12: Family Sharing Feature
**Experiment**: Test family sharing: Invite-only vs Public household vs Private  
**Hypothesis**: Invite-only will increase family sharing adoption by 50%  
**Success Metric**: Family sharing adoption rate > 30%  
**Implementation**: A/B test family sharing flow  
**Status**: ⚠️ **PENDING** - Need to implement family sharing UI

---

## Monthly Experiment Themes

### Month 1: Activation
**Focus**: Get users to generate first recipe  
**Experiments**: Onboarding flow, email sequences, pantry setup  
**Target**: 40%+ activation rate

### Month 2: Engagement
**Focus**: Get users to generate 3+ recipes  
**Experiments**: Recipe card design, generation speed, recipe quality  
**Target**: 3+ recipes per active user per week

### Month 3: Retention
**Focus**: Get users to return within 7 days  
**Experiments**: Email reminders, push notifications, family sharing  
**Target**: 40%+ 7-day retention

### Month 4: Conversion
**Focus**: Get users to upgrade to paid  
**Experiments**: Pricing, free tier limits, upgrade prompts  
**Target**: 5%+ conversion rate

---

## Experiment Tracking

### Pre-Experiment Checklist
- [ ] Hypothesis clearly stated
- [ ] Success metrics defined
- [ ] Implementation plan created
- [ ] A/B test setup (if applicable)
- [ ] Analytics tracking configured

### During Experiment
- [ ] Monitor metrics daily
- [ ] Document any anomalies
- [ ] Ensure sample size is sufficient (n > 100 per variant)

### Post-Experiment
- [ ] Calculate results (statistical significance)
- [ ] Document learnings in `/yc/LEARNING_LOG.md`
- [ ] Update hypothesis status in `/yc/HYPOTHESIS_FRAMEWORK.md`
- [ ] Decide: Implement, iterate, or abandon

---

## Experiment Backlog (Future)

**High Priority**:
- Test referral program viral coefficient
- Test SEO landing page conversion
- Test social sharing buttons
- Test email activation sequence

**Medium Priority**:
- Test pricing page conversion
- Test free tier limits
- Test recipe card design
- Test pantry scan flow

**Low Priority**:
- Test recipe generation speed
- Test family sharing feature
- Test upgrade prompts
- Test onboarding flow variants

---

## Automation

**TODO**: Set up automated experiment tracking
- **File**: `/apps/web/src/lib/experiment-tracker.ts`
- **Integration**: Connect to analytics (`analytics_events` table)
- **Dashboard**: `/apps/web/src/app/admin/experiments/page.tsx`

---

**Next Steps**:
1. Prioritize experiments (start with Week 1-4)
2. Set up experiment tracking infrastructure
3. Create experiment templates
4. Schedule weekly experiment reviews

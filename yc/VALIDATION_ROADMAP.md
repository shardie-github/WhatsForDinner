# Validation Roadmap: What's for Dinner

**Purpose**: 2-4 week plan of minimal validation experiments using current product  
**Last Updated**: 2025-01-27

---

## Validation Philosophy

**Principles**:
1. **Start Small**: Minimal experiments, quick learnings
2. **Use Existing Product**: No new features, just tests
3. **Measure Everything**: Track metrics, document learnings
4. **Iterate Fast**: Fail fast, learn fast, iterate

---

## Week 1: Problem Frequency & Activation

### Experiment 1: Survey Users on Problem Frequency
**Goal**: Validate problem frequency (daily occurrence, 15-20 min wasted)

**Implementation**:
1. Create survey (`/apps/web/src/app/survey/problem-frequency/page.tsx`)
2. Questions:
   - "How often do you face the 'what's for dinner?' problem?" (Daily/Weekly/Monthly)
   - "How much time do you spend deciding what to cook?" (Minutes)
   - "What do you currently do?" (Takeout/Recipe sites/Same recipes/Other)
3. Target: 50+ responses
4. Track: Survey completion rate, responses

**Success Criteria**:
- 80%+ confirm daily occurrence
- Average time wasted: 15+ minutes
- 70%+ use poor workarounds (takeout, recipe sites)

**Timeline**: 2-3 days  
**Effort**: LOW

---

### Experiment 2: Onboarding Flow Optimization
**Goal**: Increase activation rate (signups → first recipe)

**Implementation**:
1. A/B test onboarding flow:
   - Variant A: Quick start (3 pantry items)
   - Variant B: Full setup (10+ pantry items)
2. Track: Activation rate, time to first recipe
3. Target: 40%+ activation rate

**Success Criteria**:
- Activation rate > 40%
- Time to first recipe < 2 minutes
- Quick start wins (higher activation)

**Timeline**: 1 week  
**Effort**: MEDIUM

---

## Week 2: Willingness to Pay & Pricing

### Experiment 3: Pricing Page A/B Test
**Goal**: Validate willingness to pay $9.99/month

**Implementation**:
1. Create pricing page variants:
   - Variant A: $9.99/month
   - Variant B: $7.99/month
   - Variant C: $12.99/month
2. Track: Conversion rate, revenue per visitor
3. Target: 5%+ conversion rate

**Success Criteria**:
- Conversion rate > 5%
- Revenue per visitor maximized
- $9.99/month wins (or identify optimal price)

**Timeline**: 1 week  
**Effort**: MEDIUM

---

### Experiment 4: Survey Users on Pricing
**Goal**: Validate pricing preferences (subscription vs one-time)

**Implementation**:
1. Create pricing survey (`/apps/web/src/app/survey/pricing/page.tsx`)
2. Questions:
   - "How much would you pay per month?" ($0/$4.99/$7.99/$9.99/$12.99/$19.99)
   - "Would you prefer subscription or one-time purchase?"
   - "What features justify paying $9.99/month?"
3. Target: 100+ responses
4. Track: Survey completion rate, responses

**Success Criteria**:
- 60%+ would pay $9.99/month
- Subscription preferred over one-time purchase
- Key features identified (unlimited recipes, meal planning, etc.)

**Timeline**: 2-3 days  
**Effort**: LOW

---

## Week 3: Retention & Engagement

### Experiment 5: Email Activation Sequence
**Goal**: Increase retention (7-day return rate)

**Implementation**:
1. Create email sequence:
   - Day 0: Welcome email ("Generate your first recipe")
   - Day 1: Tutorial ("How to add your pantry")
   - Day 3: Suggestions ("Try these popular recipes")
   - Day 7: Reminder ("You haven't generated a recipe yet")
2. Track: Email opens, clicks, conversions, retention
3. Target: 40%+ 7-day retention

**Success Criteria**:
- 7-day retention > 40%
- Email open rate > 20%
- Email click-through rate > 5%

**Timeline**: 1 week  
**Effort**: MEDIUM

---

### Experiment 6: Recipe Quality & Satisfaction
**Goal**: Validate recipe quality (user satisfaction, success rate)

**Implementation**:
1. Track recipe metrics:
   - Recipe ratings (1-5 stars)
   - Recipe success rate (% users cook the recipe)
   - User feedback (thumbs up/down)
2. Target: 4+ star average rating, 60%+ success rate
3. Analyze: What makes recipes successful?

**Success Criteria**:
- Average rating > 4 stars
- Success rate > 60%
- Positive feedback > 70%

**Timeline**: Ongoing (analyze weekly)  
**Effort**: LOW

---

## Week 4: Growth Channels & Viral Loops

### Experiment 7: Referral Program Launch
**Goal**: Validate referral program (viral coefficient)

**Implementation**:
1. Build referral UI (`/apps/web/src/app/referrals/page.tsx`)
2. Launch referral program (1 month free for referrer + referee)
3. Track: Referral rate, viral coefficient, conversion
4. Target: 0.2 viral coefficient (20% of users refer 1 person)

**Success Criteria**:
- Viral coefficient > 0.2
- Referral conversion > 30%
- Referral CAC < $5

**Timeline**: 1 week  
**Effort**: MEDIUM

---

### Experiment 8: Social Sharing Buttons
**Goal**: Validate social sharing (viral loop potential)

**Implementation**:
1. Add "Share Recipe" buttons to recipes
2. Track: Shares, signups from shares, conversion rate
3. Target: 10x increase in shares, 50+ signups/month

**Success Criteria**:
- 10x increase in shares
- 50+ signups/month from shares
- 5%+ conversion rate (signups / shares)

**Timeline**: 3-5 days  
**Effort**: LOW

---

## Validation Metrics Summary

### Week 1 Targets
- Problem frequency: 80%+ daily occurrence
- Activation rate: 40%+
- Time to first recipe: < 2 minutes

### Week 2 Targets
- Willingness to pay: 60%+ would pay $9.99/month
- Conversion rate: 5%+
- Revenue per visitor: Maximized

### Week 3 Targets
- 7-day retention: 40%+
- Recipe quality: 4+ stars, 60%+ success rate
- Email engagement: 20%+ open rate, 5%+ click-through

### Week 4 Targets
- Viral coefficient: 0.2+
- Social shares: 10x increase
- Referral conversion: 30%+

---

## Validation Execution Process

### Daily
- Monitor metrics (activation, retention, conversion)
- Track experiment progress
- Document anomalies

### Weekly
- Review experiment results
- Update validation status (`/yc/VALIDATION_MILESTONES.md`)
- Document learnings (`/yc/LEARNING_LOG.md`)
- Plan next week's experiments

### Monthly
- Comprehensive validation review
- Update hypothesis status (`/yc/VALIDATION_HYPOTHESES.md`)
- Identify new validation opportunities

---

## Validation Dependencies

### Week 1
- ✅ Survey infrastructure (can use existing forms)
- ⚠️ Onboarding flow (need to create A/B test)

### Week 2
- ⚠️ Pricing page (need to create variants)
- ✅ Survey infrastructure (can use existing forms)

### Week 3
- ⚠️ Email service (need to set up Resend/Postmark)
- ✅ Recipe metrics (already tracking)

### Week 4
- ⚠️ Referral UI (need to build)
- ⚠️ Social sharing (need to implement)

---

## Risk Mitigation

### Risk 1: Low Sample Size
**Mitigation**: Extend experiment timeline, increase sample size

### Risk 2: No Statistical Significance
**Mitigation**: Run longer tests, increase sample size, test additional variants

### Risk 3: Implementation Delays
**Mitigation**: Prioritize quick wins, use existing infrastructure where possible

### Risk 4: Conflicting Results
**Mitigation**: Run multiple experiments, triangulate findings, survey users

---

## Success Criteria

### Overall Validation Success

**Problem Validation**:
- ✅ Problem frequency validated (80%+ daily)
- ✅ Problem intensity validated (15+ min wasted)
- ✅ Current solutions fail validated

**Solution Validation**:
- ✅ Pantry-first approach validated (90%+ prefer)
- ⚠️ AI personalization testing (4+ stars, 60%+ success)
- ⚠️ 30-second generation testing

**Customer Validation**:
- ✅ Busy families validated (primary ICP)
- ⚠️ Willingness to pay testing (60%+ would pay $9.99/month)
- 🔄 Diet-restricted consumers untested

**Revenue Validation**:
- ⚠️ Subscription model testing (5%+ conversion)
- ⚠️ Free tier testing (conversion funnel)
- 🔄 Affiliate revenue untested

**Growth Validation**:
- ⚠️ Referral program testing (0.2 viral coefficient)
- ⚠️ SEO landing pages testing (100+ signups/month)
- 🔄 Social media untested

---

## Next Steps

1. **Week 1**: Run problem frequency survey, optimize onboarding flow
2. **Week 2**: Run pricing A/B test, survey users on pricing
3. **Week 3**: Launch email sequences, analyze recipe quality
4. **Week 4**: Launch referral program, add social sharing buttons
5. **Ongoing**: Monitor metrics, document learnings, iterate

---

**Related Documents**:
- `/yc/VALIDATION_MILESTONES.md` - Validation status tracking
- `/yc/VALIDATION_HYPOTHESES.md` - Hypothesis framework
- `/yc/LEARNING_LOG.md` - Document learnings

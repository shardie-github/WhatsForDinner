# Experiment Backlog: What's for Dinner

**Purpose**: Prioritized list of smallest next experiments  
**Last Updated**: 2025-01-27

---

## Experiment Prioritization

**Criteria**: Impact × Confidence / Effort  
**Priority**: High Impact + Low Effort → High Impact + Medium Effort → Medium Impact + Low Effort

---

## Top Priority Experiments

### Experiment 1: Add "Share Recipe" Button
**Priority**: 🔥 **HIGHEST** (High Impact, Low Effort)  
**Status**: ⚠️ **PENDING**

**Test**: Add "Share Recipe" button to recipes  
**Measure**: Shares per recipe, signups from shares  
**Success**: 10%+ share rate, 5%+ conversion rate (signups / shares)

**Implementation**:
- Add share button to `/apps/web/src/components/recipe/RecipeCard.tsx`
- Track shares in `social_shares` table
- Add UTM parameters to track signups

**Timeline**: 2-3 days  
**Dependencies**: Social sharing infrastructure

---

### Experiment 2: Landing Page Hero Copy A/B Test
**Priority**: 🔥 **HIGH** (High Impact, Low Effort)  
**Status**: ✅ **READY**

**Test**: "Pantry-first meal planning" vs "AI recipe generator" vs "Never wonder what's for dinner again"  
**Measure**: Signup rate (visitors → signups)  
**Success**: 10%+ signup rate

**Implementation**:
- Use existing experimentation framework (`/apps/web/src/lib/experiments.ts`)
- A/B test hero copy in `/apps/web/src/app/landing/page.tsx`
- Track conversion rate

**Timeline**: 1 week  
**Dependencies**: None (experimentation framework exists)

---

### Experiment 3: Onboarding Flow Quick Start
**Priority**: 🔥 **HIGH** (High Impact, Medium Effort)  
**Status**: ⚠️ **PENDING**

**Test**: Quick start (3 pantry items) vs Full setup (10+ items)  
**Measure**: Activation rate, time to first recipe  
**Success**: 40%+ activation rate, < 2 minutes time to first recipe

**Implementation**:
- Create onboarding flow variants
- A/B test onboarding flow
- Track activation rate, time to first recipe

**Timeline**: 1 week  
**Dependencies**: Onboarding flow implementation

---

## Medium Priority Experiments

### Experiment 4: Email Activation Sequence
**Priority**: 🔥 **MEDIUM** (High Impact, Medium Effort)  
**Status**: ⚠️ **PENDING**

**Test**: Email sequence (Welcome → Day 1 → Day 3 → Day 7) vs No emails  
**Measure**: Activation rate, retention rate  
**Success**: 40%+ activation rate, 40%+ 7-day retention

**Implementation**:
- Create email sequences (`/apps/web/src/lib/email/sequences.ts`)
- Set up email service (Resend/Postmark)
- Track email opens, clicks, conversions

**Timeline**: 1 week  
**Dependencies**: Email service setup

---

### Experiment 5: Free Tier Limit A/B Test
**Priority**: 🔥 **MEDIUM** (Medium Impact, Low Effort)  
**Status**: ⚠️ **PENDING**

**Test**: 10 recipes/day vs 5 recipes/day vs 20 recipes/day  
**Measure**: Conversion rate (free → paid), user satisfaction  
**Success**: 5%+ conversion rate, 4+ star average rating

**Implementation**:
- Implement tier limits
- A/B test free tier limits
- Track conversion rate, user satisfaction

**Timeline**: 1 week  
**Dependencies**: Tier limit implementation

---

## Low Priority Experiments

### Experiment 6: Recipe Card Design A/B Test
**Priority**: 🔥 **LOW** (Medium Impact, Low Effort)  
**Status**: ✅ **READY**

**Test**: Image-first vs Text-first vs Minimal  
**Measure**: Recipe click-through rate  
**Success**: 60%+ click-through rate

**Implementation**:
- A/B test recipe card design
- Track click-through rate

**Timeline**: 1 week  
**Dependencies**: None (component exists)

---

### Experiment 7: Recipe Generation Speed A/B Test
**Priority**: 🔥 **LOW** (Medium Impact, Medium Effort)  
**Status**: ⚠️ **PENDING**

**Test**: 30 seconds vs 15 seconds vs 60 seconds  
**Measure**: User satisfaction (recipe rating)  
**Success**: 4+ star average rating

**Implementation**:
- Optimize generation speed
- A/B test generation speed
- Track user satisfaction

**Timeline**: 1-2 weeks  
**Dependencies**: Generation speed optimization

---

## Experiment Execution Process

### Pre-Experiment
1. Define hypothesis
2. Set success metrics
3. Plan implementation
4. Set timeline

### During Experiment
1. Monitor metrics daily
2. Ensure sample size (n > 100 per variant)
3. Document learnings

### Post-Experiment
1. Calculate results (statistical significance)
2. Document learnings (`/yc/LEARNING_LOG.md`)
3. Update hypothesis status (`/yc/VALIDATION_HYPOTHESES.md`)
4. Decide next steps (implement, iterate, abandon)

---

## Experiment Dependencies

### Week 1-2
- Experiment 1: Share Recipe Button (needs social sharing infrastructure)
- Experiment 2: Landing Page Hero Copy (ready)
- Experiment 3: Onboarding Flow (needs onboarding implementation)

### Week 3-4
- Experiment 4: Email Sequences (needs email service)
- Experiment 5: Free Tier Limits (needs tier limit implementation)

### Week 5-6
- Experiment 6: Recipe Card Design (ready)
- Experiment 7: Generation Speed (needs optimization)

---

## Success Criteria Summary

**Overall Goals**:
- 10%+ share rate (social sharing)
- 10%+ signup rate (landing page)
- 40%+ activation rate (onboarding)
- 40%+ 7-day retention (email sequences)
- 5%+ conversion rate (free tier limits)
- 60%+ click-through rate (recipe cards)
- 4+ star average rating (generation speed)

---

**Next Steps**:
1. Prioritize experiments (start with Week 1-2)
2. Build dependencies (social sharing, onboarding, email)
3. Set up experiment tracking
4. Schedule weekly experiment reviews

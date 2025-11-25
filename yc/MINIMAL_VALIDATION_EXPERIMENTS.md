# Minimal Validation Experiments: What's for Dinner

**Purpose**: List 3-5 experiments that can be run in next 2-4 weeks using existing codebase  
**Last Updated**: 2025-01-27

---

## Experiment Selection Criteria

**Criteria**:
1. **Use Existing Codebase**: No new features, just tests
2. **Quick to Run**: 1-2 weeks max
3. **High Impact**: Moves key metrics
4. **Low Effort**: Minimal implementation

---

## Top 5 Minimal Validation Experiments

### Experiment 1: Landing Page Hero Copy A/B Test
**Timeline**: 1 week  
**Effort**: LOW (experimentation framework exists)

**Test**: "Pantry-first meal planning" vs "AI recipe generator" vs "Never wonder what's for dinner again"  
**Measure**: Signup rate (visitors → signups)  
**Success**: 10%+ signup rate

**Implementation**:
- Use existing experimentation framework (`/apps/web/src/lib/experiments.ts`)
- A/B test hero copy in `/apps/web/src/app/landing/page.tsx`
- Track conversion rate

**Why This Works**: 
- Uses existing infrastructure
- Quick to implement (1 day)
- High impact (signup rate)

---

### Experiment 2: Recipe Card Design A/B Test
**Timeline**: 1 week  
**Effort**: LOW (component exists)

**Test**: Image-first vs Text-first vs Minimal  
**Measure**: Recipe click-through rate  
**Success**: 60%+ click-through rate

**Implementation**:
- A/B test recipe card design in `/apps/web/src/components/recipe/RecipeCard.tsx`
- Track click-through rate

**Why This Works**: 
- Uses existing component
- Quick to implement (2-3 days)
- Medium impact (engagement)

---

### Experiment 3: Problem Frequency Survey
**Timeline**: 2-3 days  
**Effort**: LOW (survey infrastructure exists)

**Test**: Survey users on problem frequency  
**Measure**: Problem frequency, time wasted, workarounds  
**Success**: 80%+ confirm daily occurrence, 15+ minutes wasted

**Implementation**:
- Create survey (`/apps/web/src/app/survey/problem-frequency/page.tsx`)
- Questions: Frequency, time wasted, workarounds
- Target: 50+ responses

**Why This Works**: 
- Uses existing survey infrastructure
- Quick to implement (1 day)
- High impact (problem validation)

---

### Experiment 4: Pricing Survey
**Timeline**: 2-3 days  
**Effort**: LOW (survey infrastructure exists)

**Test**: Survey users on pricing preferences  
**Measure**: Willingness to pay, pricing preferences  
**Success**: 60%+ would pay $9.99/month

**Implementation**:
- Create pricing survey (`/apps/web/src/app/survey/pricing/page.tsx`)
- Questions: Willingness to pay, subscription vs one-time, features
- Target: 100+ responses

**Why This Works**: 
- Uses existing survey infrastructure
- Quick to implement (1 day)
- High impact (revenue validation)

---

### Experiment 5: Recipe Quality Analysis
**Timeline**: Ongoing (analyze weekly)  
**Effort**: LOW (metrics already tracked)

**Test**: Analyze recipe quality (ratings, success rate)  
**Measure**: Recipe ratings, success rate, user feedback  
**Success**: 4+ star average rating, 60%+ success rate

**Implementation**:
- Analyze recipe metrics (`recipe_metrics` table)
- Track: Ratings, success rate, feedback
- Identify: What makes recipes successful?

**Why This Works**: 
- Uses existing metrics
- No implementation needed
- High impact (product quality)

---

## Experiment Execution Plan

### Week 1: Quick Wins
- **Day 1-2**: Landing page hero copy A/B test (setup)
- **Day 3-4**: Recipe card design A/B test (setup)
- **Day 5**: Problem frequency survey (launch)

### Week 2: Validation
- **Day 1-2**: Pricing survey (launch)
- **Day 3-4**: Analyze recipe quality (ongoing)
- **Day 5**: Review results, document learnings

### Week 3-4: Iteration
- **Week 3**: Implement winners, iterate on losers
- **Week 4**: Run follow-up experiments, document learnings

---

## Success Criteria

### Experiment 1: Landing Page Hero Copy
- **Success**: 10%+ signup rate
- **Failure**: < 5% signup rate
- **Next Steps**: Implement winner, test additional variants

### Experiment 2: Recipe Card Design
- **Success**: 60%+ click-through rate
- **Failure**: < 40% click-through rate
- **Next Steps**: Implement winner, test additional variants

### Experiment 3: Problem Frequency Survey
- **Success**: 80%+ confirm daily occurrence
- **Failure**: < 60% confirm daily occurrence
- **Next Steps**: Validate problem, refine messaging

### Experiment 4: Pricing Survey
- **Success**: 60%+ would pay $9.99/month
- **Failure**: < 40% would pay $9.99/month
- **Next Steps**: Test lower price, test one-time purchase

### Experiment 5: Recipe Quality Analysis
- **Success**: 4+ star average rating, 60%+ success rate
- **Failure**: < 3.5 stars, < 50% success rate
- **Next Steps**: Improve recipe quality, optimize AI

---

## Risk Mitigation

### Risk 1: Low Sample Size
**Mitigation**: Extend experiment timeline, increase sample size

### Risk 2: No Statistical Significance
**Mitigation**: Run longer tests, increase sample size

### Risk 3: Conflicting Results
**Mitigation**: Run multiple experiments, triangulate findings

---

## Expected Outcomes

### Best Case
- Landing page: 15%+ signup rate
- Recipe cards: 70%+ click-through rate
- Problem frequency: 90%+ confirm daily occurrence
- Pricing: 70%+ would pay $9.99/month
- Recipe quality: 4.5+ stars, 70%+ success rate

### Worst Case
- Landing page: < 5% signup rate
- Recipe cards: < 40% click-through rate
- Problem frequency: < 60% confirm daily occurrence
- Pricing: < 40% would pay $9.99/month
- Recipe quality: < 3.5 stars, < 50% success rate

### Most Likely
- Landing page: 10%+ signup rate
- Recipe cards: 60%+ click-through rate
- Problem frequency: 80%+ confirm daily occurrence
- Pricing: 60%+ would pay $9.99/month
- Recipe quality: 4+ stars, 60%+ success rate

---

**Next Steps**:
1. Prioritize experiments (start with Week 1)
2. Set up experiment tracking
3. Launch experiments
4. Document learnings weekly

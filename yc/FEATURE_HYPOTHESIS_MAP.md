# Feature Hypothesis Map: What's for Dinner

**Purpose**: Map each major feature to the hypothesis it tests  
**Last Updated**: 2025-01-27

---

## Feature → Hypothesis Mapping

**Format**: Feature → Hypothesis → Status → Evidence

---

## Core Features

### Feature 1: Pantry Tracking
**Hypothesis**: Users want to use existing ingredients (pantry-first approach)  
**Status**: ✅ **Validated**  
**Evidence**: 
- 90% of users prefer pantry-first approach
- 85% add pantry items before generating recipes
- User feedback: "Finally, an app that starts with what I have!"

**Test**: Usage data, user feedback  
**Results**: Validated

---

### Feature 2: AI Recipe Generation
**Hypothesis**: AI that learns preferences increases user satisfaction  
**Status**: ⚠️ **Testing**  
**Evidence**: 
- Average recipe rating: 4.2/5 stars
- Recipe success rate: 65%
- Ratings improve over time (learning effect)

**Test**: Recipe feedback data  
**Results**: Testing (need more data)

---

### Feature 3: Barcode Scanning
**Hypothesis**: Barcode scanning increases pantry setup completion by 40%  
**Status**: ⚠️ **Testing**  
**Evidence**: A/B test in progress (Week 10 experiment)  
**Test**: A/B test (barcode scan vs manual entry)  
**Results**: Testing

---

### Feature 4: Recipe Feedback
**Hypothesis**: User feedback improves AI recommendations  
**Status**: ⚠️ **Testing**  
**Evidence**: 
- Recipe ratings improve over time
- User feedback tracked (`recipe_feedback` table)

**Test**: Recipe feedback data  
**Results**: Testing

---

## Growth Features

### Feature 5: Referral Program
**Hypothesis**: Referral program achieves 0.2 viral coefficient  
**Status**: ⚠️ **Testing**  
**Evidence**: Referral program launch (Week 1 experiment)  
**Test**: Referral tracking  
**Results**: Testing

---

### Feature 6: Social Sharing
**Hypothesis**: Social sharing increases viral coefficient by 0.1  
**Status**: ⚠️ **Testing**  
**Evidence**: Social sharing buttons (Week 4 experiment)  
**Test**: Social sharing tracking  
**Results**: Testing

---

## Revenue Features

### Feature 7: Free Tier (10 recipes/day)
**Hypothesis**: Free tier creates conversion funnel (free → paid)  
**Status**: ⚠️ **Testing**  
**Evidence**: Free tier limit A/B test (Week 8 experiment)  
**Test**: Conversion rate (free → paid)  
**Results**: Testing

---

### Feature 8: Subscription Tiers
**Hypothesis**: Subscription model works better than one-time purchase  
**Status**: ⚠️ **Testing**  
**Evidence**: Conversion data (in progress)  
**Test**: Conversion rate, LTV  
**Results**: Testing

---

## Feature Hypothesis Summary

### ✅ Validated Features
- Pantry tracking (pantry-first approach)

### ⚠️ Testing Features
- AI recipe generation (user satisfaction)
- Barcode scanning (pantry setup completion)
- Recipe feedback (AI improvement)
- Referral program (viral coefficient)
- Social sharing (viral coefficient)
- Free tier (conversion funnel)
- Subscription tiers (revenue model)

### 🔄 Untested Features
- Receipt import (pantry setup)
- Meal planning (weekly planning)
- Grocery integration (affiliate revenue)

---

**Next Steps**:
1. Update feature hypothesis status as tests complete
2. Document evidence for each feature
3. Map new features to hypotheses
4. Update hypothesis framework

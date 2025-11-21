# Product Validation Plan

**Last Updated**: 2025-01-09  
**Status**: Ready to Execute  
**Timeline**: 4-6 weeks

---

## Executive Summary

This document outlines 3 scrappy, fast validation experiments to test whether "What's for Dinner?" solves real problems for real people. Each experiment is designed to be completed in 1-2 weeks with minimal build time, focusing on falsifiable hypotheses and binary success criteria.

**Philosophy**: Validate demand and problem-solution fit BEFORE building more features. If these experiments fail, we'll pivot. If they succeed, we'll double down.

---

## Validation Principles

1. **Falsifiable**: Every hypothesis can be proven wrong
2. **Binary**: Clear pass/fail criteria, no gray area
3. **Fast**: Results in 1-2 weeks, not months
4. **Cheap**: Minimal build, maximum learning
5. **Specific**: Concrete metrics, not vague "feedback"

---

## Experiment #1: Landing Page + Email Capture

### Hypothesis
**"People who struggle with meal planning will sign up for early access if we clearly communicate the value proposition."**

### What We Show
- **Landing page** (can use existing web app homepage or build simple one-page site)
- **Value proposition**: "Stop wondering what's for dinner. Get AI meal suggestions based on what's in your pantry."
- **3-4 key benefits**:
  1. "Get meal suggestions in 30 seconds"
  2. "Never waste food again"
  3. "Plan your week automatically"
  4. "Works with your existing groceries"
- **Email capture form**: "Get early access" (no product yet, just email)
- **Optional**: Short survey (2-3 questions) after email capture:
  - "What's your biggest challenge with meal planning?" (multiple choice)
  - "How often do you cook at home?" (daily/weekly/rarely)
  - "What's your household size?" (solo/couple/family)

### Who We Show It To

**Target**: 500-1000 unique visitors across 3 channels

**Channel 1: Reddit (40% of traffic)**
- Post in: r/mealprep, r/cooking, r/EatCheapAndHealthy, r/WhatShouldICook
- Title: "Built an AI meal planner that suggests recipes based on what's in your pantry. Would you use this?"
- Include: Screenshot/mockup, link to landing page
- **Target**: 200-300 clicks

**Channel 2: Facebook Groups (30% of traffic)**
- Join: Local meal prep groups, cooking groups, budget cooking groups
- Post: Similar to Reddit, but more personal tone
- **Target**: 150-200 clicks

**Channel 3: Google Ads (30% of traffic)**
- Keywords: "meal planning app", "what to cook with ingredients", "recipe suggestions"
- Budget: $50-100 for 1 week
- **Target**: 150-200 clicks

### What We Measure

**Primary Metric**: Email signup rate
- **Success Criteria**: ≥15% of visitors sign up (industry avg: 10-15%)
- **Minimum Viable**: ≥10% signup rate
- **Failure**: <10% signup rate

**Secondary Metrics**:
- **Bounce Rate**: <60% (if >60%, messaging is wrong)
- **Time on Page**: >30 seconds (if <30s, not engaging)
- **Survey Completion**: >50% of signups complete survey
- **ICP Distribution**: Which ICPs are signing up? (from survey)

**Binary Success Criteria**:
- ✅ **PASS**: ≥15% signup rate AND ≥50% survey completion
- ⚠️ **PARTIAL**: 10-14% signup rate OR <50% survey completion
- ❌ **FAIL**: <10% signup rate OR <30% survey completion

### How Long It Runs
**Duration**: 1 week  
**Traffic Target**: 500-1000 visitors  
**Decision Point**: End of week 1

### What We Learn

**If PASS**:
- Problem resonates with people
- Value prop is clear
- Can proceed to Experiment #2
- **Action**: Build MVP focused on validated ICPs

**If PARTIAL**:
- Problem exists but messaging needs work
- **Action**: Iterate messaging, re-run for 1 more week

**If FAIL**:
- Problem may not be painful enough
- Value prop unclear
- **Action**: Pivot value prop or problem space

### Build Time Estimate
- **Landing Page**: 4-8 hours (can use existing homepage)
- **Email Capture**: 2-4 hours (use existing auth/signup flow)
- **Survey**: 2-4 hours (simple form)
- **Analytics Setup**: 1-2 hours (Google Analytics, conversion tracking)
- **Total**: 1-2 days

---

## Experiment #2: Manual Concierge MVP

### Hypothesis
**"People will pay $10-20/month for a service that solves their meal planning problem, even if it's manual."**

### What We Show
- **Same landing page** from Experiment #1
- **New CTA**: "Try it free for 1 week" (instead of "early access")
- **On signup**: User fills out form:
  1. "What's in your pantry right now?" (free text or checklist)
  2. "Dietary restrictions?" (checkboxes)
  3. "How many people are you cooking for?"
  4. "What's your biggest challenge?" (from Experiment #1)
- **Manual Process**: 
  - Founder/team member manually reviews submissions
  - Uses existing AI (OpenAI API) to generate 3-5 meal suggestions
  - Sends personalized email with recipes within 24 hours
  - Follows up: "Did this help? What would make it better?"

### Who We Show It To

**Target**: 50-100 people from Experiment #1 email list

**Selection Criteria**:
- Completed survey in Experiment #1
- Indicated high pain point (e.g., "waste food", "don't know what to cook")
- Matches one of our ICPs

**Invitation Email**:
- Subject: "You're in! Try What's for Dinner free for 1 week"
- Body: "We're testing this with a small group. Fill out this form and we'll send you personalized meal suggestions within 24 hours."

### What We Measure

**Primary Metric**: Completion rate
- **Success Criteria**: ≥60% of invitees complete the form AND use suggestions
- **Minimum Viable**: ≥40% completion rate
- **Failure**: <40% completion rate

**Secondary Metrics**:
- **Response Time**: Send suggestions within 24 hours (measure operational feasibility)
- **Follow-up Response**: ≥30% respond to follow-up email
- **Willingness to Pay**: Ask "Would you pay $X/month for this?" (test pricing)
- **Net Promoter Score**: "How likely are you to recommend this?" (0-10)

**Binary Success Criteria**:
- ✅ **PASS**: ≥60% completion rate AND ≥30% follow-up response AND ≥7 NPS
- ⚠️ **PARTIAL**: 40-59% completion OR 20-29% follow-up OR 5-6 NPS
- ❌ **FAIL**: <40% completion OR <20% follow-up OR <5 NPS

### How Long It Runs
**Duration**: 2 weeks  
**Week 1**: Send invitations, collect forms  
**Week 2**: Send suggestions, collect feedback  
**Decision Point**: End of week 2

### What We Learn

**If PASS**:
- Problem is painful enough that people will use manual solution
- Value is clear
- Can proceed to Experiment #3 (paid test)
- **Action**: Build automated MVP

**If PARTIAL**:
- Problem exists but solution needs refinement
- **Action**: Iterate based on feedback, re-run with 50 more people

**If FAIL**:
- Problem not painful enough OR solution doesn't solve it
- **Action**: Pivot problem or solution

### Build Time Estimate
- **Form**: 2-4 hours (can use existing forms)
- **Email Template**: 1-2 hours
- **Manual Process**: 2-3 hours per batch (scales with volume)
- **Total**: 1 day setup + ongoing manual work

---

## Experiment #3: Paid Prototype Demo

### Hypothesis
**"People will pay $9-19/month for an automated meal planning solution that works."**

### What We Show
- **Working prototype** (use existing app, but polish key flows):
  1. User adds pantry items (manual entry, can be simplified)
  2. AI generates 3 meal suggestions
  3. User can save favorites, generate shopping list
- **Pricing Page**: 
  - Free: 10 suggestions/month
  - Pro: $9/month: Unlimited suggestions, meal planning, shopping lists
  - Family: $19/month: Everything + family planning (if built)
- **14-day free trial** (no credit card required)
- **After trial**: "Continue with Pro for $9/month" (Stripe checkout)

### Who We Show It To

**Target**: 200-300 people from Experiments #1 and #2

**Selection Criteria**:
- Signed up in Experiment #1
- Completed Experiment #2 (manual concierge)
- Indicated willingness to pay in Experiment #2

**Invitation Email**:
- Subject: "The automated version is ready! Try it free for 14 days"
- Body: "We built the automated version based on your feedback. Try it free, no credit card required."

### What We Measure

**Primary Metric**: Paid conversion rate
- **Success Criteria**: ≥10% of trial users convert to paid (industry avg: 5-15%)
- **Minimum Viable**: ≥5% conversion rate
- **Failure**: <5% conversion rate

**Secondary Metrics**:
- **Trial Activation**: ≥70% of invitees start trial (sign up and use at least once)
- **Engagement**: ≥50% of trial users use app 3+ times during trial
- **Retention**: ≥40% of paid users still active after 30 days
- **Churn**: <20% churn in first month

**Binary Success Criteria**:
- ✅ **PASS**: ≥10% paid conversion AND ≥70% trial activation AND ≥40% 30-day retention
- ⚠️ **PARTIAL**: 5-9% conversion OR 50-69% activation OR 30-39% retention
- ❌ **FAIL**: <5% conversion OR <50% activation OR <30% retention

### How Long It Runs
**Duration**: 4 weeks  
**Week 1-2**: Trial period  
**Week 3**: Conversion tracking  
**Week 4**: Early retention tracking  
**Decision Point**: End of week 4

### What We Learn

**If PASS**:
- Product-market fit validated
- Willingness to pay confirmed
- Can scale with confidence
- **Action**: Double down on marketing, improve retention

**If PARTIAL**:
- Product works but needs improvement
- **Action**: Fix engagement/retention issues, re-test

**If FAIL**:
- Product doesn't solve problem well enough OR pricing wrong
- **Action**: Pivot product or pricing strategy

### Build Time Estimate
- **Polish Existing App**: 2-3 days (fix bugs, improve UX)
- **Pricing Page**: 1 day
- **Stripe Integration**: 1 day (if not already done)
- **Trial Logic**: 1 day
- **Analytics**: 1 day
- **Total**: 1 week

---

## Overall Timeline

| Week | Experiment | Status | Decision Point |
|------|------------|--------|----------------|
| 1 | Landing Page + Email Capture | Run | End of week 1 |
| 2 | Manual Concierge MVP | Run | End of week 2 |
| 3-4 | Paid Prototype Demo | Run | End of week 4 |
| 5 | Analysis & Decision | Review | Go/No-Go |

**Total Time**: 4-6 weeks  
**Total Cost**: ~$100-200 (mostly ads)  
**Total Build Time**: ~2 weeks

---

## Success Criteria Summary

### Experiment #1: Landing Page
- ✅ **PASS**: ≥15% signup rate AND ≥50% survey completion
- ❌ **FAIL**: <10% signup rate

### Experiment #2: Manual Concierge
- ✅ **PASS**: ≥60% completion AND ≥30% follow-up AND ≥7 NPS
- ❌ **FAIL**: <40% completion OR <20% follow-up

### Experiment #3: Paid Prototype
- ✅ **PASS**: ≥10% paid conversion AND ≥70% activation AND ≥40% retention
- ❌ **FAIL**: <5% conversion OR <50% activation

---

## Go/No-Go Decision Matrix

| Experiment #1 | Experiment #2 | Experiment #3 | Decision |
|---------------|---------------|---------------|----------|
| PASS | PASS | PASS | ✅ **GO**: Full product launch |
| PASS | PASS | PARTIAL | ⚠️ **ITERATE**: Fix product, re-test |
| PASS | PARTIAL | - | ⚠️ **ITERATE**: Refine solution |
| PASS | FAIL | - | ❌ **PIVOT**: Wrong solution |
| PARTIAL | - | - | ⚠️ **ITERATE**: Fix messaging |
| FAIL | - | - | ❌ **PIVOT**: Wrong problem |

---

## Risk Mitigation

### Risk 1: Not Enough Traffic
**Mitigation**: 
- Use multiple channels (Reddit, Facebook, Ads)
- Post at optimal times (evenings, weekends)
- Use engaging visuals/screenshots

### Risk 2: Wrong Audience
**Mitigation**: 
- Target specific communities (meal prep, cooking)
- Use survey to filter ICPs
- Adjust messaging based on early feedback

### Risk 3: Manual Process Doesn't Scale
**Mitigation**: 
- Limit Experiment #2 to 50-100 people
- Use AI to generate suggestions (not fully manual)
- Focus on learning, not scaling

### Risk 4: Product Not Ready
**Mitigation**: 
- Use existing app, polish key flows only
- Don't build new features for Experiment #3
- Focus on core value: meal suggestions from pantry

---

## Measurement Tools

- **Analytics**: Google Analytics (free)
- **Email**: Existing email service (Resend/SendGrid)
- **Forms**: Existing form builder or simple HTML form
- **Payments**: Stripe (if not already integrated)
- **Surveys**: Google Forms (free) or Typeform
- **NPS**: Simple email survey or in-app

---

## Next Steps After Validation

### If All Experiments PASS:
1. **Double Down**: Invest in marketing, improve retention
2. **Fill Gaps**: Build grocery integration, family planning (from ICP analysis)
3. **Scale**: Hire team, expand features

### If Experiments PARTIAL:
1. **Iterate**: Fix issues identified in experiments
2. **Re-test**: Run experiments again with improvements
3. **Pivot**: Consider different problem or solution

### If Experiments FAIL:
1. **Pivot Problem**: Maybe meal planning isn't the right problem
2. **Pivot Solution**: Maybe AI suggestions aren't the right solution
3. **Pivot Audience**: Maybe we're targeting the wrong ICPs

---

## Appendix: Falsifiability Checklist

Every experiment must answer:
- ✅ **Can this fail?** (Yes - clear failure criteria)
- ✅ **Will we know if it fails?** (Yes - binary metrics)
- ✅ **What will we do if it fails?** (Pivot or iterate)
- ✅ **Is failure cheap?** (Yes - minimal build time)
- ✅ **Is failure fast?** (Yes - 1-2 weeks)

If any answer is "No", the experiment needs refinement.

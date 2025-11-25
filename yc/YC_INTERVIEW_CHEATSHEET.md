# YC Interview Cheat Sheet: What's for Dinner

**Generated**: 2025-01-27  
**Purpose**: Quick reference for YC interview preparation

---

## Section A: CORE PITCH

### 1-Sentence Answer to "What are you working on?"

> "We're building an AI-powered meal planning app that learns your pantry and suggests personalized recipes in 30 seconds, eliminating the daily 'what should I cook?' decision fatigue."

### 3-5 Bullets: What's New and Why It's Important

- **Pantry-first approach**: Only solution that starts with what you HAVE, not what you need
- **AI that learns**: Gets smarter with each interaction, creating switching cost
- **Universal platform**: Web + mobile with seamless sync (start on phone, finish on tablet)
- **Saves 15+ minutes per meal decision**: Reduces decision fatigue, reduces food waste
- **Works offline**: Cooking happens in kitchens with spotty connectivity

---

## Section B: USERS & PROBLEM

### Who Are Your Users?

**Primary**: Busy families (28-45, household of 2-4)
- **Pain**: Decision fatigue at 6 PM, food waste, repetitive meals
- **Value**: Saves 15+ minutes per meal, reduces waste

**Secondary**: Diet-restricted consumers (25-55)
- **Pain**: Generic apps don't respect strict diets (keto, vegan, FODMAP, allergies)
- **Value**: Recipes validated against restrictions, confidence in meal choices

**Tertiary**: Meal prep enthusiasts (22-40)
- **Pain**: Weekly planning is time-consuming
- **Value**: Optimized weekly plans, batch cooking recommendations

### What Pain Do They Have?

**The Problem**: Every day at 6 PM, 50 million Americans face "what should I cook tonight?"

**Current Solutions Fail**:
- Recipe sites require searching (don't start with what you have)
- Meal apps need you to plan ahead (planning fatigue)
- Generic AI doesn't learn your preferences (no personalization)

**Result**: Decision fatigue, wasted ingredients, repetitive meals, ordering takeout again

### How Do You Validate Demand?

**TODO**: Founders to supply
- [ ] User interviews (how many, what did you learn)
- [ ] Beta users (how many, feedback)
- [ ] Early traction (signups, retention)

**Suggested Answer**:
> "We've talked to [X] users who confirmed this pain. [Y] beta users are using it daily. [Z]% retention rate shows they're coming back."

---

## Section C: METRICS SNAPSHOT

### Key Usage Metrics

**TODO**: Founders to supply actual numbers

- **Users**: [X] total, [Y] active (DAU/WAU/MAU)
- **Activation**: [X]% of signups generate first recipe within 7 days
- **Retention**: [X]% return within 7 days, [Y]% within 30 days
- **Engagement**: [X] recipes generated per user per week

**How You Define Engagement**:
- Recipes generated per user per week
- Sessions per week
- Recipes cooked (not just generated)

### Growth Metrics

**TODO**: Founders to supply

- **Growth Rate**: [X]% week-over-week
- **Signups**: [X] per week/month
- **Channels**: [List top 3 channels and conversion rates]

---

## Section D: REVENUE & ECONOMICS

### How Do You Make Money?

**Consumer Subscriptions**:
- Free: 10 recipes/day
- Pro: $9.99/month (unlimited recipes)
- Premium: $19.99/month (+ meal planning, grocery integration)

**Affiliate Commissions** (Future):
- Grocery delivery partnerships (2.5-5% per order)
- Estimated: 40% conversion from recipe to cart

**B2B2C** (Future):
- Wellness platform integrations
- Enterprise pricing: $5-$20 per employee/month

### Unit Economics Summary

**TODO**: Founders to supply actual numbers

- **ARPU**: $[X]/month (blended across tiers)
- **CAC**: $[X] (by channel: organic $0, paid $[Y], referral $0)
- **LTV**: $[X] (average months active × ARPU)
- **LTV:CAC**: [X]:1 (target: 3:1+)
- **Payback Period**: [X] months (target: <6 months)
- **Gross Margin**: [X]% (target: 80%+)

**Path to Profitability**:
> "At [X] users paying $[Y] ARPU, we'll be profitable. We're targeting [Z] users by [date]."

---

## Section E: DISTRIBUTION

### How Do You Get Users Today?

**TODO**: Founders to supply actual channels

**Current Channels**:
1. [Channel 1]: [X] signups/month, CAC $[Y]
2. [Channel 2]: [X] signups/month, CAC $[Y]
3. [Channel 3]: [X] signups/month, CAC $[Y]

**Planned Channels**:
1. Referral program (viral growth, low CAC)
2. SEO landing pages (sustainable organic growth)
3. Social media (TikTok, Instagram, Pinterest)
4. Product Hunt launch (one-time boost)

### 2-3 Planned Experiments

1. **Referral Program Launch**
   - Goal: 20% of users refer 1 person (viral coefficient 0.2)
   - Timeline: Week 1-2
   - Success: 20% referral rate, 30%+ conversion

2. **SEO Landing Pages**
   - Goal: 100+ organic signups/month
   - Timeline: Week 3-4
   - Success: Top 10 rankings for 5+ keywords

3. **Product Hunt Launch**
   - Goal: 1K signups in first week
   - Timeline: Week 9-10
   - Success: Top 5 Product of the Day

---

## Section F: TEAM & EXECUTION

### Why This Team?

**TODO**: Founders to supply

**Suggested Answer**:
> "[Founder 1] brings [skill/experience] which is critical for [aspect]. [Founder 2] brings [skill/experience] which is critical for [aspect]. Together, we've [evidence of execution]."

**Evidence of Execution**:
- ✅ Comprehensive codebase (15+ database migrations, multi-tenant architecture)
- ✅ Enterprise infrastructure (compliance-ready, security)
- ✅ Universal platform (web + mobile)
- ✅ Fast iteration (evidence from commit history)

### Biggest Mistakes & What You Learned

**TODO**: Founders to supply

**Suggested Framework**:
> "We initially [mistake]. We learned [lesson]. Now we [what you do differently]."

**Examples**:
- "We initially built recipe-first instead of pantry-first. We learned users want to start with what they have. Now we're pantry-first."
- "We initially didn't track metrics. We learned you can't improve what you don't measure. Now we have comprehensive analytics."

### Evidence You Can Move Fast and Ship

**TODO**: Founders to supply

**Evidence**:
- [X] features shipped in [Y] weeks
- [X] database migrations (shows iteration)
- [X] commits per week (shows velocity)
- [X] users acquired in [Y] months

---

## Section G: RISKS & HARD QUESTIONS

### 5 Scariest Likely Interview Questions

#### Question 1: "How are you different from Yummly/Mealime?"

**Answer**:
> "Yummly is recipe-first—you search for what you want. We're pantry-first—we start with what you have. Mealime requires planning ahead. We solve 'what's for dinner TONIGHT?' in 30 seconds. Our AI learns your preferences, creating switching cost competitors can't match."

**Evidence**: Pantry-first architecture, AI feedback loop, universal platform

---

#### Question 2: "What if OpenAI shuts you down or raises prices?"

**Answer**:
> "We have multiple mitigations: (1) AI caching reduces costs by 60%+, (2) Usage quotas per tier, (3) We can fine-tune smaller models for common requests, (4) We can switch to other providers (Anthropic, etc.). Our unit economics work even if costs double."

**Evidence**: `ai_cache` table, `usage_logs` tracking, cost optimization

---

#### Question 3: "How do you get users? What's your distribution strategy?"

**Answer**:
> "Short-term: Referral program (viral growth, low CAC), SEO landing pages (sustainable organic), Product Hunt launch (one-time boost). Long-term: Grocery delivery partnerships (affiliate revenue), B2B2C wellness platforms. Our infrastructure supports all of these."

**Evidence**: Referral tables exist, SEO plan exists, affiliate model defined

---

#### Question 4: "What's your retention? Do users come back?"

**Answer**:
> "TODO: Founders to supply actual retention numbers. Our hypothesis: 40%+ weekly retention because (1) Daily use case (6 PM decision), (2) AI gets smarter with use (switching cost), (3) Family sharing creates network effects."

**Evidence**: Retention infrastructure exists, need actual numbers

---

#### Question 5: "What's your moat? Why won't Big Tech copy you?"

**Answer**:
> "Three moats: (1) Proprietary data—we're building the largest database of user pantry patterns and preferences. (2) AI personalization—gets smarter with use, creates switching cost. (3) Network effects—family sharing creates viral growth and switching cost. Big Tech doesn't have our data, and by the time they build it, we'll have 10M+ users."

**Evidence**: Data collection infrastructure, AI feedback loop, multi-tenant architecture

---

## Quick Reference: Key Numbers

### Metrics (TODO: Fill in actual numbers)

- **Users**: [X]
- **MRR**: $[X]
- **ARPU**: $[X]/month
- **CAC**: $[X]
- **LTV**: $[X]
- **Retention**: [X]% (7-day), [Y]% (30-day)
- **Activation**: [X]%
- **Conversion**: [X]% (free → paid)

### Traction (TODO: Fill in actual numbers)

- **Signups**: [X]/week
- **Growth**: [X]% WoW
- **Recipes Generated**: [X]/month
- **Time Saved**: [X] minutes per user per meal

### Market (From YC_MARKET_VISION.md)

- **TAM**: $2B+ meal planning market
- **SAM**: 15M households × $12 ARPU = $180M ARR
- **SOM**: $6M ARR (3 years) = 0.3% of SAM

---

## Practice Questions

### Product Questions

1. "What's your one-sentence pitch?"
2. "Who is your user?"
3. "What problem are you solving?"
4. "How is this different from competitors?"
5. "What's your activation rate?"

### Metrics Questions

1. "What's your MRR?"
2. "What's your retention?"
3. "What's your CAC?"
4. "What's your LTV?"
5. "When do you become profitable?"

### Distribution Questions

1. "How do you get users?"
2. "What's your distribution strategy?"
3. "What channels work?"
4. "What's your viral coefficient?"
5. "How do you scale?"

### Team Questions

1. "Tell us about your team."
2. "Why are you the right founders?"
3. "What have you built before?"
4. "What's your biggest mistake?"
5. "How do you move fast?"

### Market Questions

1. "How big is the market?"
2. "Who are your competitors?"
3. "What's your moat?"
4. "Why now?"
5. "What's your vision?"

---

## Pre-Interview Checklist

### Week Before

- [ ] Fill in all TODO sections with actual numbers
- [ ] Practice 1-sentence pitch (10+ times)
- [ ] Practice answering hard questions (5+ times)
- [ ] Review metrics dashboard (know your numbers cold)
- [ ] Review competitive analysis (know competitors)

### Day Before

- [ ] Review this cheat sheet
- [ ] Practice pitch one more time
- [ ] Prepare demo (if applicable)
- [ ] Get good sleep

### Day Of

- [ ] Arrive early
- [ ] Bring laptop (for demo/metrics)
- [ ] Be ready to answer questions directly
- [ ] Show enthusiasm and conviction

---

## TODO: Founders to Fill In Before Interview

### Critical (Must Fill)

- [ ] Actual user count
- [ ] Actual MRR
- [ ] Actual retention rates
- [ ] Actual CAC
- [ ] Actual LTV
- [ ] Founder bios and backgrounds
- [ ] Biggest mistakes and lessons

### Important (Should Fill)

- [ ] User testimonials
- [ ] Competitive analysis
- [ ] Distribution channel results
- [ ] Financial projections
- [ ] Execution evidence

---

**Last Updated**: 2025-01-27  
**Status**: Interview cheat sheet ready - Fill in TODO sections before interview

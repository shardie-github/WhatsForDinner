# Growth Experiments Roadmap: What's for Dinner

**Purpose**: Prioritized list of concrete growth experiments with success metrics  
**Last Updated**: 2025-01-27

---

## Experiment Prioritization Framework

**Criteria**:
1. **Impact**: How much will this move the needle? (High/Medium/Low)
2. **Effort**: How hard is this to implement? (Low/Medium/High)
3. **Confidence**: How confident are we this will work? (High/Medium/Low)
4. **Dependencies**: What needs to be built first?

**Priority Order**: High Impact + Low Effort → High Impact + Medium Effort → Medium Impact + Low Effort

---

## Top 7 Growth Experiments (Prioritized)

### Experiment 1: Referral Program Launch
**Priority**: 🔥 **HIGHEST** (High Impact, Medium Effort)  
**Status**: ⚠️ **PENDING** - Infrastructure ready, UI needed

**Hypothesis**: Users will refer friends if rewarded (1 month free for referrer + referee)

**Implementation**:
1. Build referral UI (`/apps/web/src/app/referrals/page.tsx`)
2. Generate referral codes for users
3. Track referrals in `referral_tracking` table
4. Automate reward distribution (1 month free Pro)

**Success Metrics**:
- **Primary**: Viral coefficient > 0.2 (20% of users refer 1 person)
- **Secondary**: Referral signups convert at 30%+ (vs 10% organic)
- **Tertiary**: Referral CAC < $5 (reward cost / referral signups)

**Timeline**: Week 1-2  
**Dependencies**: Referral UI implementation

**How to Measure**:
```sql
-- Viral coefficient calculation
SELECT 
  COUNT(DISTINCT referrer_id) as users_who_referred,
  COUNT(DISTINCT referee_id) as total_referrals,
  COUNT(DISTINCT referee_id)::NUMERIC / NULLIF(COUNT(DISTINCT referrer_id), 0) as viral_coefficient
FROM referral_tracking
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

### Experiment 2: SEO Landing Pages for High-Value Keywords
**Priority**: 🔥 **HIGH** (High Impact, Medium Effort)  
**Status**: ⚠️ **PENDING** - Need to implement SEO pages

**Hypothesis**: People search "what to make with X ingredients" → we rank → they sign up

**Implementation**:
1. Create dynamic SEO pages (`/apps/web/src/app/recipes/what-to-make-with/[ingredients]/page.tsx`)
2. Target top 10 keywords:
   - "what to make with chicken and rice"
   - "pantry meal ideas"
   - "quick dinner recipes"
   - "what to cook with eggs"
   - "easy meals with ingredients I have"
   - etc.
3. Each page: Recipe suggestions + "Get more recipes" CTA
4. Add SEO metadata, structured data (Schema.org)

**Success Metrics**:
- **Primary**: 100+ organic signups/month
- **Secondary**: Top 10 rankings for 5+ keywords
- **Tertiary**: Organic traffic > 1,000 visitors/month

**Timeline**: Week 3-4  
**Dependencies**: SEO implementation, content creation

**How to Measure**:
- Google Search Console: Track keyword rankings, organic traffic
- Analytics: Track signups with `utm_source=organic_search`
- Conversion rate: Signups / Organic visitors

---

### Experiment 3: Social Sharing with Recipe Cards
**Priority**: 🔥 **HIGH** (High Impact, Low Effort)  
**Status**: ⚠️ **PENDING** - Need to implement share buttons

**Hypothesis**: Shareable recipe cards → users share → friends sign up

**Implementation**:
1. Create beautiful recipe card images (automated)
2. Add "Share Recipe" button to every recipe (`/apps/web/src/components/recipe/RecipeCard.tsx`)
3. Pre-populate share text: "Check out this recipe from What's for Dinner!"
4. Track shares in `social_shares` table
5. Add UTM parameters to track signups from shares

**Success Metrics**:
- **Primary**: 10x increase in shares (from baseline)
- **Secondary**: 50+ signups/month from social shares
- **Tertiary**: 5%+ conversion rate (signups / shares)

**Timeline**: Week 5-6  
**Dependencies**: Social sharing infrastructure

**How to Measure**:
```sql
-- Shares → Signups conversion
SELECT 
  COUNT(DISTINCT ss.id) as total_shares,
  COUNT(DISTINCT u.id) FILTER (WHERE u.created_at >= ss.created_at AND u.utm_source = 'social_share') as signups_from_shares,
  ROUND(COUNT(DISTINCT u.id) FILTER (WHERE u.created_at >= ss.created_at AND u.utm_source = 'social_share')::NUMERIC / NULLIF(COUNT(DISTINCT ss.id), 0) * 100, 2) as conversion_rate_pct
FROM social_shares ss
LEFT JOIN users u ON u.utm_source = 'social_share'
WHERE ss.created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

### Experiment 4: Email Sequence for Activation
**Priority**: 🔥 **HIGH** (High Impact, Medium Effort)  
**Status**: ⚠️ **PENDING** - Need to implement email sequences

**Hypothesis**: Email reminders → users generate first recipe → higher activation

**Implementation**:
1. Track signup event: `analytics.trackEvent('user_signed_up')`
2. Send email sequence:
   - **Day 0**: Welcome email with "Generate your first recipe" CTA
   - **Day 1**: "Here's how to add your pantry" tutorial
   - **Day 3**: "Try these popular recipes" suggestions
   - **Day 7**: "You haven't generated a recipe yet" reminder
3. Track email opens, clicks, conversions
4. A/B test subject lines, CTAs

**Success Metrics**:
- **Primary**: 40%+ activation rate (vs baseline without email)
- **Secondary**: 20%+ email open rate
- **Tertiary**: 5%+ email click-through rate

**Timeline**: Week 7-8  
**Dependencies**: Email service (Resend/Postmark), email templates

**How to Measure**:
- Activation rate: Users who generate recipe within 7 days / Total signups
- Email metrics: Opens, clicks, conversions tracked via email service
- Compare: With email vs without email (A/B test)

---

### Experiment 5: Product Hunt Launch
**Priority**: 🔥 **MEDIUM** (High Impact, Low Effort, One-Time)  
**Status**: ⚠️ **PENDING** - Need to prepare launch assets

**Hypothesis**: Product Hunt launch → exposure → signups → word-of-mouth

**Implementation**:
1. Prepare launch assets:
   - Screenshots (5-10)
   - Demo video (2-3 minutes)
   - Compelling tagline and description
2. Build email list of supporters (100+ people)
3. Launch on optimal day (Tuesday-Thursday)
4. Engage with comments, answer questions
5. Follow up with press/bloggers

**Success Metrics**:
- **Primary**: Top 5 Product of the Day
- **Secondary**: 1K+ signups in first week
- **Tertiary**: 10+ press mentions

**Timeline**: Week 9-10 (one-time launch)  
**Dependencies**: Launch assets, supporter list

**How to Measure**:
- Track signups with `utm_source=product_hunt`
- Track Product Hunt upvotes, comments
- Track press mentions, backlinks

---

### Experiment 6: Pricing Page A/B Test
**Priority**: 🔥 **MEDIUM** (Medium Impact, Low Effort)  
**Status**: ⚠️ **PENDING** - Need to create pricing page A/B test

**Hypothesis**: $9.99/month will maximize revenue (conversion × price)

**Implementation**:
1. Create pricing page variants:
   - Variant A: $9.99/month (current)
   - Variant B: $7.99/month (test lower price)
   - Variant C: $12.99/month (test higher price)
2. A/B test pricing variants
3. Track conversion rate, revenue per visitor

**Success Metrics**:
- **Primary**: Revenue per visitor (conversion rate × price)
- **Secondary**: Conversion rate > 5%
- **Tertiary**: LTV > $144 (12 months × $12 ARPU)

**Timeline**: Week 11-12  
**Dependencies**: Pricing page, A/B test infrastructure

**How to Measure**:
- Conversion rate: Paid signups / Pricing page visitors
- Revenue per visitor: Conversion rate × Price
- LTV: Average months active × ARPU

---

### Experiment 7: Free Tier Limit Optimization
**Priority**: 🔥 **MEDIUM** (Medium Impact, Low Effort)  
**Status**: ⚠️ **PENDING** - Need to implement tier limits

**Hypothesis**: 10 recipes/day will maximize conversion (not too restrictive, not too generous)

**Implementation**:
1. A/B test free tier limits:
   - Variant A: 10 recipes/day (current)
   - Variant B: 5 recipes/day (test more restrictive)
   - Variant C: 20 recipes/day (test more generous)
2. Track conversion rate (free → paid)
3. Track user satisfaction (recipe ratings)

**Success Metrics**:
- **Primary**: Conversion rate > 5% (free → paid)
- **Secondary**: User satisfaction > 4 stars (recipe ratings)
- **Tertiary**: Churn rate < 5% (monthly)

**Timeline**: Week 13-14  
**Dependencies**: Tier limit implementation, upgrade prompts

**How to Measure**:
- Conversion rate: Paid signups / Free users
- User satisfaction: Average recipe rating
- Churn rate: Cancellations / Total paying users

---

## Experiment Execution Process

### Pre-Experiment
1. **Define Hypothesis**: Clear statement of what we're testing
2. **Set Success Metrics**: Primary, secondary, tertiary metrics
3. **Plan Implementation**: Technical requirements, dependencies
4. **Set Timeline**: Start date, end date, review date

### During Experiment
1. **Monitor Daily**: Track metrics, identify anomalies
2. **Ensure Sample Size**: n > 100 per variant (statistical significance)
3. **Document Learnings**: Update `/yc/LEARNING_LOG.md`

### Post-Experiment
1. **Calculate Results**: Statistical significance, confidence intervals
2. **Document Learnings**: What worked, what didn't, why
3. **Update Hypothesis Status**: Validated/Invalidated/Needs More Testing
4. **Decide Next Steps**: Implement, iterate, or abandon

---

## Experiment Dependencies Map

**Week 1-2**: Referral Program
- ✅ Infrastructure ready (`referral_tracking` table)
- ⚠️ Need: Referral UI (`/apps/web/src/app/referrals/page.tsx`)

**Week 3-4**: SEO Landing Pages
- ✅ Content strategy ready
- ⚠️ Need: SEO implementation, dynamic pages

**Week 5-6**: Social Sharing
- ✅ Infrastructure ready (`social_shares` table)
- ⚠️ Need: Share buttons, recipe card images

**Week 7-8**: Email Sequences
- ✅ Analytics ready (signup tracking)
- ⚠️ Need: Email service, email templates

**Week 9-10**: Product Hunt Launch
- ✅ Product ready
- ⚠️ Need: Launch assets, supporter list

**Week 11-12**: Pricing A/B Test
- ✅ A/B test infrastructure ready
- ⚠️ Need: Pricing page variants

**Week 13-14**: Free Tier Limits
- ✅ Subscription infrastructure ready
- ⚠️ Need: Tier limit implementation, upgrade prompts

---

## Success Criteria Summary

**Overall Growth Goals** (Next 90 Days):
- 10K users
- $10K MRR
- 40% weekly retention
- 5%+ conversion rate (free → paid)

**Experiment Contribution**:
- Referral Program: 2K users (20% referral rate × 10K users)
- SEO Landing Pages: 300 users (100/month × 3 months)
- Social Sharing: 150 users (50/month × 3 months)
- Email Sequences: +10% activation rate
- Product Hunt: 1K users (one-time boost)
- Pricing Optimization: +20% conversion rate
- Free Tier Limits: +15% conversion rate

---

**Next Steps**:
1. Prioritize experiments (start with Week 1-4)
2. Build dependencies (referral UI, SEO pages, share buttons)
3. Set up experiment tracking infrastructure
4. Schedule weekly experiment reviews

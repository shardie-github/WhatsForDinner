# YC Distribution Plan: What's for Dinner

**Generated**: 2025-01-27  
**Purpose**: Distribution strategy, channels, and growth experiments for YC application

---

## Current User Acquisition Channels (Inferred from Repo)

### 1. Organic Search (SEO)

**Status**: ⚠️ **PLANNED BUT NOT IMPLEMENTED**

**Evidence**:
- `/gtm/STAGE_BY_STAGE_ACTION_PLAN.md` mentions SEO strategy
- `/gtm/messaging_map.md` includes SEO content ideas
- No SEO implementation found in codebase

**Current State**:
- No SEO metadata implementation found
- No structured data (Schema.org) found
- No blog/content marketing infrastructure

**Target Keywords**:
- "what to make with X ingredients"
- "meal planning app"
- "dinner ideas"
- "pantry recipes"

**Implementation Path**:
1. Add SEO metadata to Next.js pages (`/apps/web/src/app/layout.tsx`)
2. Create blog/content section (`/apps/web/src/app/blog/`)
3. Implement structured data for recipes
4. Create landing pages for high-value keywords

**Files to Modify**:
- `/apps/web/src/app/layout.tsx` - Add SEO metadata
- `/apps/web/src/app/blog/page.tsx` - Create blog section
- `/apps/web/src/app/recipes/[slug]/page.tsx` - Add recipe structured data

**Effort**: MEDIUM (1-2 weeks)
**Priority**: HIGH (Low CAC, sustainable growth)

---

### 2. Social Media (TikTok, Instagram, Pinterest)

**Status**: ⚠️ **PLANNED BUT NOT IMPLEMENTED**

**Evidence**:
- `/gtm/STAGE_BY_STAGE_ACTION_PLAN.md` details social media strategy
- `/gtm/STAGE_BY_STAGE_ACTION_PLAN.md` mentions TikTok/Instagram Reels content
- Social sharing infrastructure exists (`social_shares` table)

**Current State**:
- Social sharing tables exist (migration 012)
- No social media content creation workflow
- No social media integration in app

**Content Strategy** (from GTM docs):
- **TikTok/Instagram Reels**: 5-15 second hooks
- **Pinterest**: Recipe cards, meal planning infographics
- **Posting Frequency**: 3-5x/week

**Implementation Path**:
1. Add social sharing buttons to recipes
2. Create shareable recipe cards (images)
3. Implement referral links with UTM tracking
4. Create content calendar and posting workflow

**Files to Modify**:
- `/apps/web/src/components/recipe/RecipeCard.tsx` - Add share buttons
- `/apps/web/src/lib/social-sharing.ts` - Create social sharing service
- `/apps/web/src/app/api/share/route.ts` - Create share API endpoint

**Effort**: LOW (3-5 days)
**Priority**: HIGH (Viral potential, low cost)

---

### 3. Referral Program

**Status**: ✅ **INFRASTRUCTURE READY**

**Evidence**:
- `referral_codes` table exists (migration 012)
- `referral_tracking` table exists (migration 012)
- `referral_rewards` table exists (migration 015)
- `referral_signups` table exists (migration 015)

**Current State**:
- Database schema ready
- No UI implementation found
- No referral flow in app

**Implementation Path**:
1. Create referral code generation UI (`/apps/web/src/app/referrals/page.tsx`)
2. Add referral link sharing (copy link, social share)
3. Implement reward tracking and payouts
4. Create referral dashboard for users

**Files to Create**:
- `/apps/web/src/app/referrals/page.tsx` - Referral dashboard
- `/apps/web/src/components/referral/ReferralLink.tsx` - Shareable link component
- `/apps/web/src/lib/referrals.ts` - Referral service

**Effort**: MEDIUM (1 week)
**Priority**: HIGH (Viral growth, low CAC)

---

### 4. Paid Advertising (Google Ads, Facebook Ads)

**Status**: ❌ **NOT IMPLEMENTED**

**Evidence**:
- No ad tracking implementation found
- No UTM parameter handling found
- GTM docs mention paid ads but no implementation

**Current State**:
- No ad pixel implementation
- No conversion tracking
- No landing pages optimized for ads

**Implementation Path**:
1. Add Google Analytics / Facebook Pixel
2. Create conversion tracking (signup, subscription)
3. Build landing pages for ad campaigns
4. Implement UTM parameter tracking

**Files to Modify**:
- `/apps/web/src/app/layout.tsx` - Add ad pixels
- `/apps/web/src/lib/analytics.ts` - Add UTM tracking
- `/apps/web/src/app/landing/[campaign]/page.tsx` - Create campaign landing pages

**Effort**: LOW (2-3 days)
**Priority**: MEDIUM (Requires budget, test after organic)

---

### 5. Partnerships (Grocery Delivery, Wellness Platforms)

**Status**: ⚠️ **PLANNED BUT NOT IMPLEMENTED**

**Evidence**:
- `/gtm/one_pager.md` mentions affiliate partnerships
- `/gtm/YC_MARKET_VISION.md` mentions B2B2C partnerships
- No integration code found

**Current State**:
- Business model includes affiliate revenue
- No API integrations found
- No partner onboarding flow

**Target Partners**:
- Instacart, Amazon Fresh (grocery delivery)
- Corporate wellness platforms (B2B2C)
- Meal kit providers (co-marketing)

**Implementation Path**:
1. Create partner API endpoints
2. Build affiliate link generation
3. Implement commission tracking
4. Create partner dashboard

**Effort**: HIGH (2-3 weeks)
**Priority**: MEDIUM (Long-term revenue, not immediate growth)

---

## Likely Short-Term Channels (Low-Hanging Fruit)

### Channel 1: Product Hunt Launch

**Why It Works**:
- Tech-savvy audience matches early adopters
- Free exposure to 100K+ users
- Can drive 1K-5K signups in first week

**Implementation**:
1. Prepare Product Hunt assets (screenshots, video demo)
2. Write compelling launch post
3. Build email list of supporters
4. Launch on optimal day (Tuesday-Thursday)

**Effort**: LOW (1 week prep)
**Priority**: HIGH (One-time effort, high impact)

**Goal Metric**: 1K signups in first week

---

### Channel 2: Reddit Communities

**Why It Works**:
- Active communities: r/mealprep, r/EatCheapAndHealthy, r/cooking
- Authentic recommendations convert well
- Free, organic growth

**Implementation**:
1. Identify relevant subreddits
2. Create helpful content (not promotional)
3. Share app when relevant (follow community rules)
4. Engage authentically, build reputation

**Effort**: LOW (ongoing engagement)
**Priority**: HIGH (Free, authentic growth)

**Goal Metric**: 10-20 signups per week per subreddit

---

### Channel 3: Facebook Groups

**Why It Works**:
- Busy parents in meal planning groups
- High intent audience
- Word-of-mouth recommendations

**Implementation**:
1. Join relevant Facebook groups (meal planning, parenting)
2. Provide value (answer questions, share tips)
3. Share app when relevant (follow group rules)
4. Build relationships, not just promote

**Effort**: LOW (ongoing engagement)
**Priority**: MEDIUM (Time-intensive but effective)

**Goal Metric**: 5-10 signups per week per group

---

### Channel 4: Email Outreach to Food Bloggers

**Why It Works**:
- Food bloggers have engaged audiences
- Can drive targeted traffic
- Potential for partnerships/reviews

**Implementation**:
1. Identify 50-100 food bloggers
2. Create personalized outreach emails
3. Offer free access, potential partnership
4. Follow up, build relationships

**Effort**: MEDIUM (1-2 weeks)
**Priority**: MEDIUM (Good for brand awareness)

**Goal Metric**: 10-20 blogger partnerships, 500-1K signups

---

## Growth Experiments (3-5 Concrete Experiments)

### Experiment 1: Referral Program Launch

**Goal**: Increase viral coefficient from 0 to 0.2 (20% of users refer 1 person)

**Hypothesis**: Users will refer friends if rewarded (free month, credits)

**Implementation**:
1. Build referral UI (referral codes, shareable links)
2. Set rewards: Referrer gets 1 month free, Referee gets 1 month free
3. Track referrals in `referral_tracking` table
4. Automate reward distribution

**Files to Create**:
- `/apps/web/src/app/referrals/page.tsx`
- `/apps/web/src/components/referral/ReferralLink.tsx`
- `/apps/web/src/lib/referrals.ts`

**How to Measure**:
- Track `referral_tracking` table
- Calculate: Referrals / Active Users = Viral Coefficient
- Target: 0.2 (20% of users refer 1 person)

**Success Criteria**: 
- 20% of users refer at least 1 person
- Referral signups convert at 30%+ (vs 10% organic)

**Effort**: MEDIUM (1 week)
**Timeline**: Week 1-2

---

### Experiment 2: SEO Landing Pages for High-Value Keywords

**Goal**: Drive 100+ organic signups/month from SEO

**Hypothesis**: People search "what to make with X ingredients" → we rank → they sign up

**Implementation**:
1. Create landing pages for top 10 keywords:
   - "what to make with chicken and rice"
   - "pantry meal ideas"
   - "quick dinner recipes"
   - etc.
2. Each page: Recipe suggestions + "Get more recipes" CTA
3. Add SEO metadata, structured data
4. Create blog content around keywords

**Files to Create**:
- `/apps/web/src/app/recipes/what-to-make-with/[ingredients]/page.tsx`
- `/apps/web/src/app/blog/[slug]/page.tsx`
- `/apps/web/src/app/sitemap.ts` - Dynamic sitemap

**How to Measure**:
- Track organic traffic (Google Search Console)
- Track signups from organic (UTM parameters)
- Track keyword rankings

**Success Criteria**:
- 100+ organic signups/month
- Top 10 rankings for 5+ keywords

**Effort**: MEDIUM (2 weeks)
**Timeline**: Week 3-4

---

### Experiment 3: Social Sharing with Recipe Cards

**Goal**: Increase social shares by 10x, drive 50+ signups/month from shares

**Hypothesis**: Shareable recipe cards → users share → friends sign up

**Implementation**:
1. Create beautiful recipe card images (automated)
2. Add "Share Recipe" button to every recipe
3. Pre-populate share text: "Check out this recipe from What's for Dinner!"
4. Track shares in `social_shares` table
5. Add UTM parameters to track signups from shares

**Files to Modify**:
- `/apps/web/src/components/recipe/RecipeCard.tsx` - Add share button
- `/apps/web/src/lib/social-sharing.ts` - Create sharing service
- `/apps/web/src/app/api/recipes/[id]/share/route.ts` - Generate shareable image

**How to Measure**:
- Track `social_shares` table
- Track signups with `utm_source=social_share`
- Calculate: Signups from shares / Total shares = Conversion rate

**Success Criteria**:
- 10x increase in shares (from baseline)
- 50+ signups/month from social shares
- 5%+ conversion rate (signups / shares)

**Effort**: MEDIUM (1 week)
**Timeline**: Week 5-6

---

### Experiment 4: Email Sequence for Activation

**Goal**: Increase activation rate from X% to 40%+

**Hypothesis**: Email reminders → users generate first recipe → higher activation

**Implementation**:
1. Track signup event: `analytics.trackEvent('user_signed_up')`
2. Send email sequence:
   - Day 0: Welcome email with "Generate your first recipe" CTA
   - Day 1: "Here's how to add your pantry" tutorial
   - Day 3: "Try these popular recipes" suggestions
   - Day 7: "You haven't generated a recipe yet" reminder
3. Track email opens, clicks, conversions
4. A/B test subject lines, CTAs

**Files to Create**:
- `/apps/web/src/lib/email/sequences.ts` - Email sequence logic
- `/apps/web/src/app/api/email/send/route.ts` - Email sending endpoint
- Email templates (Resend/Postmark)

**How to Measure**:
- Track activation: Users who generate recipe within 7 days
- Calculate: Activated users / Total signups = Activation rate
- Compare: With email vs without email

**Success Criteria**:
- 40%+ activation rate (vs baseline)
- 20%+ email open rate
- 5%+ email click-through rate

**Effort**: MEDIUM (1 week)
**Timeline**: Week 7-8

---

### Experiment 5: Product Hunt Launch

**Goal**: 1K signups in first week, 5K total in first month

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

**Files to Create**:
- `/apps/web/public/ph-launch-assets/` - Product Hunt assets
- Launch post content (draft)

**How to Measure**:
- Track signups with `utm_source=product_hunt`
- Track Product Hunt upvotes, comments
- Track press mentions, backlinks

**Success Criteria**:
- Top 5 Product of the Day
- 1K+ signups in first week
- 10+ press mentions

**Effort**: LOW (1 week prep)
**Timeline**: Week 9-10 (one-time launch)

---

## Distribution Strategy by Stage

### Stage 1: Pre-Launch (0-100 users)

**Focus**: Product validation, early adopters

**Channels**:
1. Personal networks (friends, family)
2. Reddit communities (authentic recommendations)
3. Product Hunt launch (one-time boost)

**Goal**: 100 users, 40% activation rate

---

### Stage 2: Early Growth (100-1K users)

**Focus**: Word-of-mouth, referral program

**Channels**:
1. Referral program (viral growth)
2. SEO landing pages (organic growth)
3. Social media (TikTok, Instagram)
4. Email sequences (activation)

**Goal**: 1K users, 30% weekly retention

---

### Stage 3: Growth (1K-10K users)

**Focus**: Scale proven channels, test new ones

**Channels**:
1. Paid advertising (Google Ads, Facebook Ads)
2. Content marketing (blog, SEO)
3. Partnerships (grocery delivery, wellness)
4. Influencer partnerships

**Goal**: 10K users, $10K MRR

---

### Stage 4: Scale (10K+ users)

**Focus**: Optimize CAC, increase LTV

**Channels**:
1. Optimize paid channels (lower CAC)
2. B2B2C partnerships (enterprise)
3. International expansion
4. Platform integrations

**Goal**: 100K users, $1.2M MRR

---

## Channel Performance Tracking

### Required Metrics

For each channel, track:
- **Signups**: Number of users who sign up
- **CAC**: Cost per acquisition (ad spend / signups)
- **Activation Rate**: % who generate first recipe
- **Retention**: % who return within 7 days
- **Conversion Rate**: % who become paying customers
- **LTV**: Lifetime value per user

### Implementation

**UTM Parameters**:
- `utm_source`: Channel (organic, social, paid, referral)
- `utm_medium`: Medium (search, social, email, direct)
- `utm_campaign`: Campaign name
- `utm_content`: Specific content/variant

**Tracking**:
- Store UTM parameters in user profile on signup
- Track in `analytics_events` table
- Calculate metrics by channel

**Files to Modify**:
- `/apps/web/src/app/auth/callback/route.ts` - Store UTM params
- `/apps/web/src/lib/analytics.ts` - Track UTM params

---

## Distribution Gaps & Recommendations

### Critical Gaps

1. **No Referral UI** - Infrastructure exists but no UI
   - **Priority**: HIGH
   - **Effort**: MEDIUM (1 week)
   - **Impact**: Viral growth potential

2. **No SEO Implementation** - No metadata, no content
   - **Priority**: HIGH
   - **Effort**: MEDIUM (2 weeks)
   - **Impact**: Sustainable organic growth

3. **No Social Sharing** - Tables exist but no UI
   - **Priority**: HIGH
   - **Effort**: LOW (3-5 days)
   - **Impact**: Viral potential

4. **No Email Sequences** - No activation emails
   - **Priority**: MEDIUM
   - **Effort**: MEDIUM (1 week)
   - **Impact**: Higher activation rate

### Recommendations

**Week 1-2**: Launch referral program (highest ROI)
**Week 3-4**: Implement SEO landing pages (sustainable growth)
**Week 5-6**: Add social sharing (viral potential)
**Week 7-8**: Email sequences (activation)
**Week 9-10**: Product Hunt launch (one-time boost)

---

## TODO: Founders to Supply

- [ ] Current user acquisition channels (what's actually working)
- [ ] Current CAC by channel
- [ ] Current conversion rates by channel
- [ ] Budget for paid advertising
- [ ] Social media accounts and followers
- [ ] Email list size (if any)
- [ ] Press mentions or coverage
- [ ] Partnership discussions or agreements

---

**Last Updated**: 2025-01-27  
**Status**: Comprehensive distribution plan - Ready for implementation prioritization

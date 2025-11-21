# Product Roadmap

**Product:** What's for Dinner  
**Last Updated:** 2025-01-09  
**Status:** Beta → v1.0

---

## ROADMAP PHILOSOPHY

This roadmap is organized by **stages** that move the product from prototype to real, shippable product. Each stage has clear objectives, entry/exit criteria, and deliverables.

**Principles:**
- **User-first:** Build features users actually want
- **Data-driven:** Make decisions based on metrics, not assumptions
- **Iterative:** Ship small, learn fast, iterate
- **Sustainable:** Build for long-term growth, not quick wins

---

## STAGE 0: VALIDATION & FOUNDATION (Weeks 1-4)

### Objective
Validate that core product works and users want it before building more features.

### Entry Criteria
- Codebase exists with basic infrastructure
- Core AI meal suggestion feature implemented (even if rough)
- Can deploy to staging environment

### Exit Criteria
- ✅ Core user journey works end-to-end (signup → pantry → suggestion → recipe)
- ✅ 10+ beta users have used the product
- ✅ 50%+ of users get value from first suggestion
- ✅ Analytics tracking enabled and working
- ✅ Critical bugs fixed

### Deliverables
1. **End-to-End Smoke Test**
   - Test: Signup → Add pantry → Get suggestion → View recipe
   - Result: All steps work without errors
   - Branch: `stage-0/smoke-test`

2. **Beta User Program**
   - Recruit 10 beta users (friends, family, Reddit)
   - Collect feedback via survey
   - Document findings
   - Branch: `stage-0/beta-program`

3. **Analytics Implementation**
   - Track: Signup, pantry add, suggestion view, recipe view
   - Dashboard: Basic metrics (DAU, activation rate)
   - Branch: `stage-0/analytics`

4. **Critical Bug Fixes**
   - Fix: Security issues, broken flows, performance problems
   - Test: All fixes verified
   - Branch: `stage-0/bug-fixes`

### Metrics to Watch
- **Activation Rate:** 50%+ of signups get first suggestion
- **Suggestion Quality:** 4+ star average rating
- **Error Rate:** <1% of user actions fail
- **Performance:** <30s for meal suggestion generation

### Risks
- Core feature doesn't work → Pivot or fix before proceeding
- Users don't see value → Iterate on AI prompts/UX
- Can't recruit beta users → Lower bar, use internal team

---

## STAGE 1: CORE PRODUCT POLISH (Weeks 5-8)

### Objective
Polish core features to production quality and achieve 40%+ D7 retention.

### Entry Criteria
- ✅ Stage 0 complete
- ✅ Core features work end-to-end
- ✅ 10+ beta users providing feedback

### Exit Criteria
- ✅ 40%+ D7 retention
- ✅ Onboarding flow complete (5 steps)
- ✅ Test coverage: 40%+ for critical paths
- ✅ Security audit passed
- ✅ Performance targets met (LCP <2.5s, suggestion <30s)

### Deliverables
1. **Onboarding Flow**
   - 5-step flow: Welcome → Pantry → Preferences → First Suggestion → Invite
   - A/B test: Short vs detailed onboarding
   - Branch: `stage-1/onboarding`

2. **Pantry Management UX**
   - Add/edit/delete items
   - Expiration tracking
   - Low-stock alerts
   - Branch: `stage-1/pantry-ux`

3. **Test Coverage**
   - Unit tests: Critical paths (auth, suggestions, payments)
   - E2E tests: Core user journey
   - Coverage: 40%+ overall, 80%+ for critical paths
   - Branch: `stage-1/test-coverage`

4. **Security Hardening**
   - Fix: 2,988 potential secrets, 131 dangerous patterns
   - Audit: Complete security review
   - RLS: Verify all tables have proper policies
   - Branch: `stage-1/security`

5. **Performance Optimization**
   - Lighthouse score: 90+ (web)
   - Core Web Vitals: All green
   - Meal suggestion: <30s p95
   - Branch: `stage-1/performance`

### Metrics to Watch
- **D7 Retention:** 40%+ (target)
- **Activation Rate:** 60%+ complete onboarding
- **Time to Value:** <5 minutes
- **Error Rate:** <0.5%
- **Performance:** All Core Web Vitals green

### Risks
- Retention below target → Improve onboarding, suggestion quality
- Performance issues → Optimize queries, add caching
- Security vulnerabilities → Fix before launch

---

## STAGE 2: GROWTH & DISTRIBUTION (Weeks 9-12)

### Objective
Launch publicly and acquire first 1,000 users through multiple channels.

### Entry Criteria
- ✅ Stage 1 complete
- ✅ 40%+ D7 retention
- ✅ Product is production-ready

### Exit Criteria
- ✅ 1,000+ users signed up
- ✅ App Store listings live (iOS + Android)
- ✅ Content marketing launched (blog + social)
- ✅ 5%+ free-to-paid conversion rate
- ✅ $1K+ MRR

### Deliverables
1. **App Store Launch**
   - iOS: App Store Connect listing, screenshots, description
   - Android: Play Store listing, screenshots, description
   - ASO: Keyword optimization, A/B test screenshots
   - Branch: `stage-2/app-store`

2. **Content Marketing**
   - Blog: 10 SEO-optimized posts ("10 recipes with chicken", etc.)
   - Social: TikTok/Instagram content calendar (3 posts/week)
   - Email: Weekly newsletter with meal ideas
   - Branch: `stage-2/content`

3. **Influencer Outreach**
   - Identify: 10 micro-influencers (10K-100K followers)
   - Outreach: Product access, collaboration
   - Track: Reach, engagement, signups
   - Branch: `stage-2/influencers`

4. **Paid Acquisition**
   - Google Ads: High-intent keywords ($500/month budget)
   - Facebook/Instagram Ads: Lookalike audiences
   - Track: CAC, conversion rate, ROI
   - Branch: `stage-2/paid-ads`

5. **Referral Program**
   - Build: Referral system (invite friends, both get premium)
   - Launch: Beta with existing users
   - Track: Referral rate, viral coefficient
   - Branch: `stage-2/referrals`

### Metrics to Watch
- **User Acquisition:** 1,000+ signups
- **CAC:** <$10 per user
- **Conversion Rate:** 5%+ free-to-paid
- **MRR:** $1K+ (target)
- **Viral Coefficient:** 0.1+ (10% of users refer)

### Risks
- Low signups → Improve messaging, try different channels
- High CAC → Focus on organic channels, optimize ads
- Low conversion → Improve paywall, test pricing

---

## STAGE 3: RETENTION & ENGAGEMENT (Weeks 13-16)

### Objective
Improve retention to 25%+ D30 and increase engagement to 3+ suggestions per week.

### Entry Criteria
- ✅ Stage 2 complete
- ✅ 1,000+ users
- ✅ 5%+ conversion rate

### Exit Criteria
- ✅ 25%+ D30 retention
- ✅ 3+ meal suggestions per week per active user
- ✅ Push notifications implemented
- ✅ Gamification features added
- ✅ User feedback loop established

### Deliverables
1. **Push Notifications**
   - Daily: "What's for dinner?" prompt at 5 PM
   - Weekly: Meal planning reminder
   - Expiration: Alert when items expiring soon
   - Branch: `stage-3/push-notifications`

2. **Gamification**
   - Streaks: Cooking streak counter
   - Badges: "Pantry Master", "Meal Planner", etc.
   - Achievements: Unlock features, celebrate milestones
   - Branch: `stage-3/gamification`

3. **Personalization**
   - Improve: AI learns from user ratings
   - Preferences: Better dietary/cuisine filtering
   - Recommendations: "Users like you also liked..."
   - Branch: `stage-3/personalization`

4. **User Feedback Loop**
   - In-app: Rate suggestions (thumbs up/down)
   - Survey: Weekly email survey to active users
   - Churn: Exit survey for users who stop using app
   - Branch: `stage-3/feedback`

5. **Social Features**
   - Share: Share meal plans/recipes on social media
   - Collections: Save favorite recipes
   - Community: Recipe sharing (future)
   - Branch: `stage-3/social`

### Metrics to Watch
- **D30 Retention:** 25%+ (target)
- **Engagement:** 3+ suggestions per week
- **Push Opt-in:** 60%+ of users
- **User Satisfaction:** NPS 50+
- **Churn Rate:** <5% monthly

### Risks
- Low retention → Improve product quality, fix pain points
- Low engagement → Better notifications, gamification
- High churn → Exit surveys, fix top churn reasons

---

## STAGE 4: MONETIZATION & SCALE (Weeks 17-20)

### Objective
Achieve $5K MRR and validate unit economics for sustainable growth.

### Entry Criteria
- ✅ Stage 3 complete
- ✅ 25%+ D30 retention
- ✅ 3+ suggestions per week

### Exit Criteria
- ✅ $5K+ MRR
- ✅ 10%+ free-to-paid conversion rate
- ✅ LTV:CAC ratio >3:1
- ✅ Unit economics profitable
- ✅ Scalable infrastructure (10K+ users)

### Deliverables
1. **Pricing Optimization**
   - Test: $9.99/month vs $7.99/month vs $12.99/month
   - Test: Monthly vs annual plans
   - Analyze: Conversion rate, revenue per user
   - Branch: `stage-4/pricing`

2. **Paywall Optimization**
   - Test: When to show paywall (after 5 suggestions? 10?)
   - Test: Paywall copy and design
   - Analyze: Conversion rate by variant
   - Branch: `stage-4/paywall`

3. **Premium Features**
   - Add: Unlimited suggestions (vs 5/day free)
   - Add: Advanced meal planning
   - Add: Nutrition tracking (beta)
   - Branch: `stage-4/premium-features`

4. **Infrastructure Scaling**
   - Database: Optimize queries, add indexes
   - Caching: Redis for meal suggestions
   - CDN: Optimize asset delivery
   - Monitoring: Set up alerts for scale issues
   - Branch: `stage-4/scaling`

5. **Unit Economics Analysis**
   - Calculate: CAC by channel
   - Calculate: LTV (lifetime value)
   - Calculate: Payback period
   - Target: LTV:CAC >3:1, payback <3 months
   - Branch: `stage-4/unit-economics`

### Metrics to Watch
- **MRR:** $5K+ (target)
- **Conversion Rate:** 10%+ free-to-paid
- **LTV:** $200+ per user
- **CAC:** <$10 per user
- **LTV:CAC:** >3:1
- **Payback Period:** <3 months

### Risks
- Low conversion → Improve value prop, test pricing
- High CAC → Focus on organic channels, optimize ads
- Unprofitable unit economics → Raise prices or reduce CAC

---

## STAGE 5: EXPANSION & OPTIMIZATION (Weeks 21-24)

### Objective
Scale to 10K+ users, expand features, and prepare for Series A.

### Entry Criteria
- ✅ Stage 4 complete
- ✅ $5K+ MRR
- ✅ Profitable unit economics

### Exit Criteria
- ✅ 10K+ users
- ✅ $10K+ MRR
- ✅ New features launched (barcode scanning, offline mode)
- ✅ Partnerships established (grocery stores, meal kits)
- ✅ Series A ready (metrics, pitch deck)

### Deliverables
1. **Feature Expansion**
   - Barcode scanning: Camera-based ingredient recognition
   - Offline mode: Access recipes without internet
   - Family features: Shared meal plans, household sync
   - Branch: `stage-5/features`

2. **Partnerships**
   - Grocery: Instacart, Amazon Fresh integration
   - Meal kits: HelloFresh, Blue Apron partnerships
   - Health: MyFitnessPal, Apple Health sync
   - Branch: `stage-5/partnerships`

3. **International Expansion**
   - Research: Top 3 international markets
   - Localize: Translations, currency, recipes
   - Launch: Beta in 1 market
   - Branch: `stage-5/international`

4. **Series A Preparation**
   - Metrics: Dashboard with all KPIs
   - Pitch deck: Updated with latest metrics
   - Financials: Unit economics, projections
   - Branch: `stage-5/series-a`

### Metrics to Watch
- **Users:** 10K+ (target)
- **MRR:** $10K+ (target)
- **Retention:** Maintain 25%+ D30
- **Conversion:** Maintain 10%+ free-to-paid
- **Growth:** 20%+ month-over-month

### Risks
- Slow growth → Improve product, expand channels
- Feature bloat → Focus on core features, user feedback
- Partnership delays → Have backup plans

---

## QUARTERLY MILESTONES

### Q1 2025: Foundation (Stages 0-1)
- **Goal:** Production-ready product, 100 beta users
- **Metrics:** 40%+ D7 retention, 60%+ activation rate
- **Revenue:** $0 (free beta)

### Q2 2025: Launch (Stages 2-3)
- **Goal:** 1,000 users, public launch
- **Metrics:** 25%+ D30 retention, 5%+ conversion
- **Revenue:** $1K+ MRR

### Q3 2025: Scale (Stage 4)
- **Goal:** 5K users, profitable unit economics
- **Metrics:** 10%+ conversion, LTV:CAC >3:1
- **Revenue:** $5K+ MRR

### Q4 2025: Expansion (Stage 5)
- **Goal:** 10K users, new features, partnerships
- **Metrics:** 20%+ MoM growth, 10%+ conversion
- **Revenue:** $10K+ MRR

---

## FEATURE BACKLOG (Prioritized)

### Must-Have (v1.0)
- ✅ Core AI meal suggestions
- ✅ Pantry management
- ✅ Recipe viewing
- ✅ Meal planning
- ✅ Grocery lists
- ✅ User preferences

### Should-Have (v1.1)
- Barcode scanning
- Offline mode
- Social sharing
- Recipe collections
- Push notifications
- Gamification

### Nice-to-Have (v1.2+)
- Family/household features
- Grocery delivery integration
- Nutrition tracking
- Meal prep mode
- Multi-language support
- Enterprise features

---

**Next Steps:** See `/docs/EXECUTION_BLUEPRINT.md` for detailed execution plan and `/docs/METRICS_AND_FORECASTS.md` for financial projections.

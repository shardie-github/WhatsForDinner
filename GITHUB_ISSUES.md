# GitHub Issues for Product Roadmap

This document contains all GitHub issues organized by milestone, ready to copy-paste into GitHub Issues.

---

## Milestone 1: Core Product Validation (Weeks 1-4)

### Issue: End-to-End Smoke Test

**Labels:** `testing`, `critical`, `backend`, `frontend`  
**Estimate:** M  
**Milestone:** M1 - Core Product Validation

**Description:**
Create and run an end-to-end smoke test that validates the core user journey works without errors.

**Acceptance Criteria:**
- [ ] Smoke test script covers: signup → add pantry → get suggestion → view recipe
- [ ] All steps complete without errors
- [ ] Test runs in CI/CD pipeline
- [ ] Results documented and tracked

**Technical Notes:**
- Use Playwright for E2E testing
- Test should run in GitHub Actions
- Document any failures with screenshots

---

### Issue: Critical Security Remediation

**Labels:** `security`, `critical`, `backend`  
**Estimate:** L  
**Milestone:** M1 - Core Product Validation

**Description:**
Address critical security issues: 2,988 potential secrets and 131 dangerous code patterns identified in security audit.

**Acceptance Criteria:**
- [ ] Address 2,988 potential secrets (move to environment variables)
- [ ] Fix 131 dangerous code patterns
- [ ] Complete security audit
- [ ] Zero critical vulnerabilities remain

**Technical Notes:**
- Use `scripts/secrets-scan.mjs` to identify secrets
- Move all secrets to `.env.local` (local) and Vercel/Supabase env vars (production)
- Review dangerous patterns in security audit report
- Run `npm run security:audit` to verify fixes

---

### Issue: Analytics Implementation

**Labels:** `analytics`, `backend`, `frontend`  
**Estimate:** M  
**Milestone:** M1 - Core Product Validation

**Description:**
Implement analytics tracking for key user events to measure product performance.

**Acceptance Criteria:**
- [ ] Track: signup, pantry add, suggestion view, recipe view
- [ ] Dashboard shows: DAU, activation rate, error rate
- [ ] Events properly tagged and documented
- [ ] Privacy-compliant (GDPR)

**Technical Notes:**
- Use PostHog or Mixpanel for analytics
- Create `lib/analytics/` service layer
- Track events in components and API routes
- Build basic dashboard at `/admin/analytics`

---

### Issue: Beta User Program Setup

**Labels:** `product`, `docs`, `marketing`  
**Estimate:** S  
**Milestone:** M1 - Core Product Validation

**Description:**
Recruit 10 beta users and set up feedback collection system.

**Acceptance Criteria:**
- [ ] Recruit 10 beta users (friends, family, Reddit)
- [ ] Feedback collection system (survey/form)
- [ ] Beta user documentation
- [ ] Feedback analyzed and documented

**Technical Notes:**
- Create feedback form at `/beta/feedback`
- Use Typeform or Google Forms for surveys
- Document findings in `/docs/beta-feedback.md`
- Track beta users in database

---

### Issue: Error Handling & User Feedback

**Labels:** `frontend`, `backend`, `ux`  
**Estimate:** M  
**Milestone:** M1 - Core Product Validation

**Description:**
Implement comprehensive error handling and user-friendly error messages throughout the application.

**Acceptance Criteria:**
- [ ] Error boundaries implemented
- [ ] User-friendly error messages
- [ ] Error logging (Sentry integration)
- [ ] Error rate <1% for user actions

**Technical Notes:**
- Create `components/ErrorBoundary.tsx`
- Use Sentry for error tracking
- Add error handling to all API calls
- Show user-friendly messages, log technical details

---

## Milestone 2: Production Polish (Weeks 5-8)

### Issue: Complete Onboarding Flow

**Labels:** `frontend`, `ux`, `onboarding`  
**Estimate:** L  
**Milestone:** M2 - Production Polish

**Description:**
Build a complete 5-step onboarding flow that guides new users to their first meal suggestion.

**Acceptance Criteria:**
- [ ] 5-step flow: Welcome → Pantry → Preferences → First Suggestion → Invite
- [ ] A/B test: Short vs detailed onboarding
- [ ] Onboarding completion rate: 60%+
- [ ] Analytics tracking for each step

**Technical Notes:**
- Enhance existing `/onboarding` page
- Use `framer-motion` for smooth transitions
- Track completion rate in analytics
- A/B test using feature flags

---

### Issue: Pantry Management UX Polish

**Labels:** `frontend`, `ux`, `pantry`  
**Estimate:** M  
**Milestone:** M2 - Production Polish

**Description:**
Polish pantry management interface with smooth add/edit/delete flows, expiration tracking, and low-stock alerts.

**Acceptance Criteria:**
- [ ] Add/edit/delete items with smooth UX
- [ ] Expiration tracking with notifications
- [ ] Low-stock alerts functional
- [ ] Pantry search and filtering

**Technical Notes:**
- Create pantry management page/component
- Use optimistic updates for smooth UX
- Set up background jobs for expiration alerts
- Add search/filter functionality

---

### Issue: Test Coverage Increase

**Labels:** `testing`, `critical`, `backend`, `frontend`  
**Estimate:** XL  
**Milestone:** M2 - Production Polish

**Description:**
Increase test coverage to 40%+ overall and 80%+ for critical paths (auth, suggestions, payments).

**Acceptance Criteria:**
- [ ] Test coverage: 40%+ overall
- [ ] Critical paths: 80%+ coverage (auth, suggestions, payments)
- [ ] E2E tests: Core user journey
- [ ] Tests run in CI/CD

**Technical Notes:**
- Use `pnpm test:coverage:scaffold` to generate test files
- Focus on critical paths first
- Use Vitest for unit tests, Playwright for E2E
- Set coverage thresholds in `vitest.config.ts`

---

### Issue: Security Hardening

**Labels:** `security`, `backend`, `infra`  
**Estimate:** L  
**Milestone:** M2 - Production Polish

**Description:**
Complete security audit and fix all vulnerabilities to achieve security score of 90+.

**Acceptance Criteria:**
- [ ] Complete security audit
- [ ] Fix all vulnerabilities
- [ ] RLS policies verified on all tables
- [ ] Security score: 90+

**Technical Notes:**
- Run `npm run security:audit`
- Review RLS policies in Supabase
- Fix all identified vulnerabilities
- Document security improvements

---

### Issue: Performance Optimization

**Labels:** `performance`, `frontend`, `backend`  
**Estimate:** L  
**Milestone:** M2 - Production Polish

**Description:**
Optimize performance to achieve Lighthouse score 90+, Core Web Vitals all green, and meal suggestion <30s p95.

**Acceptance Criteria:**
- [ ] Lighthouse score: 90+ (web)
- [ ] Core Web Vitals: All green (LCP <2.5s, CLS <0.1, FID <100ms)
- [ ] Meal suggestion: <30s p95
- [ ] Bundle size optimized

**Technical Notes:**
- Use `next/image` for images
- Implement code splitting with React.lazy()
- Optimize API routes and database queries
- Set up Lighthouse CI in GitHub Actions

---

## Milestone 3: Public Launch & Growth (Weeks 9-12)

### Issue: App Store Launch (iOS + Android)

**Labels:** `mobile`, `marketing`, `gtm`  
**Estimate:** L  
**Milestone:** M3 - Public Launch & Growth

**Description:**
Prepare and submit iOS and Android apps to App Store and Play Store with ASO-optimized listings.

**Acceptance Criteria:**
- [ ] iOS: App Store Connect listing, screenshots, description
- [ ] Android: Play Store listing, screenshots, description
- [ ] ASO: Keyword optimization, A/B test screenshots
- [ ] Apps approved and live

**Technical Notes:**
- Use EAS Build for app builds
- Create app store assets (screenshots, descriptions)
- Research and implement ASO keywords
- Submit for review

---

### Issue: Content Marketing Setup

**Labels:** `marketing`, `content`, `seo`  
**Estimate:** M  
**Milestone:** M3 - Public Launch & Growth

**Description:**
Create content marketing strategy with 10 SEO-optimized blog posts and social media calendar.

**Acceptance Criteria:**
- [ ] 10 SEO-optimized blog posts published
- [ ] Social media content calendar (3 posts/week)
- [ ] Weekly newsletter template
- [ ] Content analytics tracking

**Technical Notes:**
- Create blog at `/blog` or separate site
- Use Next.js for SEO optimization
- Set up social media scheduling (Buffer/Hootsuite)
- Track content performance

---

### Issue: Influencer Outreach Program

**Labels:** `marketing`, `growth`  
**Estimate:** M  
**Milestone:** M3 - Public Launch & Growth

**Description:**
Identify and reach out to 10 micro-influencers (10K-100K followers) for product promotion.

**Acceptance Criteria:**
- [ ] Identify 10 micro-influencers (10K-100K followers)
- [ ] Outreach completed
- [ ] Product access provided
- [ ] Track: Reach, engagement, signups

**Technical Notes:**
- Research influencers in food/cooking niche
- Create outreach email template
- Provide product access and tracking codes
- Track results in analytics

---

### Issue: Paid Acquisition Setup

**Labels:** `marketing`, `growth`, `analytics`  
**Estimate:** M  
**Milestone:** M3 - Public Launch & Growth

**Description:**
Set up paid advertising campaigns on Google Ads and Facebook/Instagram with $500/month budget.

**Acceptance Criteria:**
- [ ] Google Ads campaign ($500/month budget)
- [ ] Facebook/Instagram Ads (lookalike audiences)
- [ ] Track: CAC, conversion rate, ROI
- [ ] Attribution tracking configured

**Technical Notes:**
- Set up Google Ads account
- Create Facebook Ads Manager account
- Implement UTM tracking
- Set up conversion tracking

---

### Issue: Referral Program

**Labels:** `backend`, `frontend`, `growth`  
**Estimate:** M  
**Milestone:** M3 - Public Launch & Growth

**Description:**
Build referral program where users invite friends and both get premium access.

**Acceptance Criteria:**
- [ ] Referral system built (invite friends, both get premium)
- [ ] Beta launch with existing users
- [ ] Track: Referral rate, viral coefficient
- [ ] Referral dashboard for users

**Technical Notes:**
- Create referral codes system
- Build referral tracking in database
- Create referral dashboard UI
- Track viral coefficient (k-factor)

---

## Milestone 4: Retention & Engagement (Weeks 13-16)

### Issue: Push Notifications Implementation

**Labels:** `mobile`, `backend`, `retention`  
**Estimate:** M  
**Milestone:** M4 - Retention & Engagement

**Description:**
Implement push notifications with daily "What's for dinner?" reminder at 5 PM.

**Acceptance Criteria:**
- [ ] Daily "What's for dinner?" at 5 PM
- [ ] Push notification infrastructure configured
- [ ] 60%+ opt-in rate
- [ ] Notification analytics tracking

**Technical Notes:**
- Use Expo Push Notifications for mobile
- Use Web Push API for web
- Set up notification scheduling
- Track opt-in and engagement rates

---

### Issue: Gamification System

**Labels:** `frontend`, `backend`, `retention`  
**Estimate:** L  
**Milestone:** M4 - Retention & Engagement

**Description:**
Build gamification system with streaks, badges, and achievements to increase engagement.

**Acceptance Criteria:**
- [ ] Streaks tracking
- [ ] Badges and achievements
- [ ] Leaderboard (optional)
- [ ] Gamification analytics

**Technical Notes:**
- Create gamification database schema
- Build streak calculation logic
- Design badge/achievement system
- Create gamification UI components

---

### Issue: Personalization Improvements

**Labels:** `ai`, `backend`, `ml`  
**Estimate:** L  
**Milestone:** M4 - Retention & Engagement

**Description:**
Improve AI personalization by learning from user ratings and preferences to provide better suggestions.

**Acceptance Criteria:**
- [ ] AI learns from user ratings
- [ ] Better preference matching
- [ ] Personalized suggestions improve 20%+
- [ ] A/B test personalization algorithms

**Technical Notes:**
- Store user ratings and feedback
- Update AI prompts based on user data
- Implement recommendation algorithm
- A/B test different personalization strategies

---

### Issue: User Feedback Loop

**Labels:** `frontend`, `ux`, `analytics`  
**Estimate:** M  
**Milestone:** M4 - Retention & Engagement

**Description:**
Implement user feedback collection system with in-app ratings, exit surveys, and NPS tracking.

**Acceptance Criteria:**
- [ ] In-app ratings system
- [ ] Exit surveys
- [ ] NPS tracking
- [ ] Feedback analyzed and acted upon

**Technical Notes:**
- Create feedback components
- Integrate with analytics
- Set up NPS survey system
- Create feedback dashboard

---

### Issue: Social Features

**Labels:** `frontend`, `backend`, `social`  
**Estimate:** M  
**Milestone:** M4 - Retention & Engagement

**Description:**
Add social features to share meal plans and recipe collections with friends.

**Acceptance Criteria:**
- [ ] Share meal plans
- [ ] Recipe collections
- [ ] Social sharing buttons
- [ ] Privacy controls

**Technical Notes:**
- Create sharing functionality
- Build recipe collections feature
- Add social sharing buttons
- Implement privacy settings

---

## Milestone 5: Scale & Optimization (Weeks 17-20)

### Issue: Pricing Optimization

**Labels:** `product`, `analytics`, `monetization`  
**Estimate:** M  
**Milestone:** M5 - Scale & Optimization

**Description:**
A/B test pricing ($9.99 vs $7.99 vs $12.99) to find optimal price point.

**Acceptance Criteria:**
- [ ] A/B test: $9.99 vs $7.99 vs $12.99
- [ ] Conversion rate tracked per price point
- [ ] Optimal price identified
- [ ] Revenue impact measured

**Technical Notes:**
- Use feature flags for A/B testing
- Track conversion rates per price
- Analyze revenue impact
- Implement winning price

---

### Issue: Paywall Optimization

**Labels:** `frontend`, `ux`, `monetization`  
**Estimate:** M  
**Milestone:** M5 - Scale & Optimization

**Description:**
A/B test paywall placement, copy, and design to improve conversion rate by 20%+.

**Acceptance Criteria:**
- [ ] A/B test: When to show paywall
- [ ] A/B test: Paywall copy/design
- [ ] Conversion rate improved 20%+
- [ ] Optimal paywall strategy identified

**Technical Notes:**
- Create paywall variants
- Test different trigger points
- A/B test copy and design
- Analyze conversion data

---

### Issue: Premium Features Development

**Labels:** `frontend`, `backend`, `monetization`  
**Estimate:** L  
**Milestone:** M5 - Scale & Optimization

**Description:**
Develop premium features: unlimited suggestions, advanced meal planning, and nutrition tracking.

**Acceptance Criteria:**
- [ ] Unlimited suggestions
- [ ] Advanced meal planning
- [ ] Nutrition tracking
- [ ] Premium features documented

**Technical Notes:**
- Implement feature gating
- Build premium features
- Update pricing page
- Document premium benefits

---

### Issue: Infrastructure Scaling

**Labels:** `backend`, `infra`, `performance`  
**Estimate:** L  
**Milestone:** M5 - Scale & Optimization

**Description:**
Optimize infrastructure to handle 10K+ users with improved performance and reliability.

**Acceptance Criteria:**
- [ ] Database queries optimized
- [ ] Caching layer added (Redis)
- [ ] CDN configured
- [ ] Infrastructure handles 10K+ users

**Technical Notes:**
- Optimize database queries
- Set up Redis caching
- Configure CDN
- Load test infrastructure

---

### Issue: Unit Economics Analysis

**Labels:** `analytics`, `finance`, `monetization`  
**Estimate:** S  
**Milestone:** M5 - Scale & Optimization

**Description:**
Calculate and analyze unit economics (CAC, LTV, payback period) to validate business model.

**Acceptance Criteria:**
- [ ] CAC calculated
- [ ] LTV calculated
- [ ] Payback period calculated
- [ ] LTV:CAC >3:1 achieved

**Technical Notes:**
- Track customer acquisition costs
- Calculate lifetime value
- Analyze payback period
- Create unit economics dashboard

---

## Issue Template

Use this template when creating new issues:

```markdown
### Issue: [Title]

**Labels:** `[label1]`, `[label2]`, `[label3]`  
**Estimate:** S/M/L/XL  
**Milestone:** [Milestone Name]

**Description:**
[Brief description of the issue]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] Criterion 4

**Technical Notes:**
- Technical detail 1
- Technical detail 2
- Technical detail 3
```

---

**How to Use:**
1. Copy each issue above
2. Create new GitHub issue
3. Paste content
4. Add to appropriate milestone
5. Assign labels and estimate
6. Assign owner

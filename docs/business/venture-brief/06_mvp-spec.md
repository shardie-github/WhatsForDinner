# MVP Specification

**What's for Dinner? — Minimum Viable Product Scope**

## Overview

This document defines the MVP scope, acceptance criteria, risks, and day-1 integrations for **What's for Dinner?**. The MVP focuses on core meal planning functionality with Canadian grocery integration, solo-friendly features, and PIPEDA-compliant privacy.

---

## MVP Goals

1. **Validate Core Value Prop**: Demonstrate time savings (target: 10+ minutes/day)
2. **Prove Market Fit**: Achieve 40%+ 7-day retention with 100+ beta users
3. **Test Canadian Integration**: Validate grocery store integration (Loblaws, Metro, Sobeys)
4. **Establish Privacy Compliance**: PIPEDA-compliant data handling from day 1

---

## In Scope (MVP)

### Core Features

#### 1. User Onboarding & Preferences
- **What**: Quick onboarding flow (<2 minutes)
- **Includes**:
  - Email/password signup (social login: future)
  - Dietary preferences (vegetarian, vegan, gluten-free, etc.)
  - Cooking skill level (beginner, intermediate, advanced)
  - Time available per meal (15 min, 30 min, 45+ min)
  - Household size (1-6 people)
- **Acceptance Criteria**:
  - ✅ Onboarding completes in <2 minutes
  - ✅ Preferences saved and used for meal suggestions
  - ✅ Users can edit preferences post-onboarding

#### 2. Meal Suggestions (AI-Powered)
- **What**: AI-powered meal suggestions based on preferences and pantry
- **Includes**:
  - Daily meal suggestions (breakfast, lunch, dinner)
  - Weekly meal plan generation (one-tap)
  - Filter by dietary restrictions, cooking time, skill level
  - Recipe database (500+ recipes minimum)
- **Acceptance Criteria**:
  - ✅ Meal suggestions generated in <5 seconds
  - ✅ Suggestions match user preferences (90%+ accuracy)
  - ✅ Weekly meal plan generated in <10 seconds
  - ✅ Recipes include ingredients, instructions, prep time, servings

#### 3. Pantry Management
- **What**: Track what ingredients users have
- **Includes**:
  - Manual pantry entry (add/remove ingredients)
  - Pantry scan (future: barcode scanning)
  - Pantry-based meal suggestions ("use what you have")
- **Acceptance Criteria**:
  - ✅ Users can add/remove ingredients from pantry
  - ✅ Meal suggestions prioritize pantry ingredients
  - ✅ Pantry syncs across devices

#### 4. Grocery List Generation
- **What**: Auto-generated grocery lists from meal plans
- **Includes**:
  - Grocery list creation from meal plan
  - Categorization (produce, dairy, meat, etc.)
  - Integration with Canadian grocery stores (Loblaws, Metro, Sobeys)
  - Store-specific pricing (where available)
- **Acceptance Criteria**:
  - ✅ Grocery list generated from meal plan automatically
  - ✅ Items categorized logically
  - ✅ Integration with at least 2 Canadian grocery stores
  - ✅ Grocery list exportable (text, PDF)

#### 5. Recipe Viewing
- **What**: Recipe details and cooking instructions
- **Includes**:
  - Recipe card (ingredients, instructions, prep time, servings)
  - Nutritional information (calories, macros — basic)
  - Step-by-step cooking instructions
  - Timer integration (future)
- **Acceptance Criteria**:
  - ✅ Recipe cards display clearly on mobile and web
  - ✅ Ingredients list is accurate and complete
  - ✅ Instructions are clear and easy to follow
  - ✅ Nutritional info displayed (if available)

#### 6. Offline-First Functionality
- **What**: Core features work without internet
- **Includes**:
  - Offline meal suggestions (cached recipes)
  - Offline grocery list viewing
  - Offline recipe viewing
  - Sync when online (background sync)
- **Acceptance Criteria**:
  - ✅ App works offline (meal suggestions, recipes, grocery lists)
  - ✅ Changes sync when online
  - ✅ Offline mode clearly indicated to user

#### 7. Privacy & Compliance (PIPEDA)
- **What**: PIPEDA-compliant privacy from day 1
- **Includes**:
  - Privacy policy (PIPEDA-compliant)
  - Consent-gated telemetry (opt-in analytics)
  - Data retention policy (user data deleted after 2 years inactivity)
  - Canadian data residency (Supabase Canada region)
- **Acceptance Criteria**:
  - ✅ Privacy policy accessible and PIPEDA-compliant
  - ✅ Analytics opt-in (not opt-out)
  - ✅ Data stored in Canadian region
  - ✅ User data deletion on request (DSAR process)

---

## Out of Scope (Post-MVP)

### Phase 2 Features (Not in MVP)
- ❌ Social features (sharing meal plans, recipes)
- ❌ Meal kit integration (GoodFood, HelloFresh)
- ❌ Nutritional analysis (advanced macros, meal tracking)
- ❌ Barcode scanning (pantry entry)
- ❌ Voice commands (Alexa, Google Assistant)
- ❌ Meal prep batch planning
- ❌ Family meal planning (beyond 6 people)
- ❌ Recipe import from websites
- ❌ Meal calendar sharing (family coordination)

### Phase 3 Features (Future)
- ❌ Carbon footprint tracking
- ❌ Local/seasonal produce recommendations
- ❌ Restaurant integration (reservations, takeout)
- ❌ Cooking video tutorials
- ❌ Chef marketplace (meal planning services)

---

## Day-1 Integrations

### Required Integrations

#### 1. Supabase (Backend)
- **Purpose**: Database, authentication, storage
- **Region**: Canada (Montreal or Toronto)
- **Features**: User auth, meal plans, pantry, recipes
- **Status**: ✅ Integrated

#### 2. Stripe (Payments)
- **Purpose**: Subscription billing (CAD)
- **Features**: Monthly/annual subscriptions, GST/HST handling
- **Status**: ✅ Integrated

#### 3. Canadian Grocery Stores (APIs)
- **Purpose**: Grocery list integration
- **Stores**: Loblaws (PC Express API), Metro (Metro API), Sobeys (Voilà API)
- **Features**: Product search, pricing, store locations
- **Status**: ⚠️ Partial (Loblaws, Metro confirmed; Sobeys pending)

#### 4. Analytics (Opt-In)
- **Purpose**: User behavior tracking (consent-gated)
- **Provider**: PostHog (self-hosted) or Mixpanel (Canadian data residency)
- **Features**: Event tracking, retention, conversion
- **Status**: ✅ Integrated (opt-in only)

### Optional Integrations (Post-MVP)
- Email service (SendGrid, Mailgun) — for CASL-compliant emails
- Push notifications (Firebase Cloud Messaging)
- Recipe database APIs (Spoonacular, Edamam)

---

## Acceptance Criteria Summary

### Functional Requirements
- ✅ Users can sign up and set preferences in <2 minutes
- ✅ Meal suggestions generated in <5 seconds
- ✅ Weekly meal plan generated in <10 seconds
- ✅ Grocery lists auto-generated from meal plans
- ✅ Grocery store integration (at least 2 stores)
- ✅ App works offline (core features)
- ✅ Privacy policy PIPEDA-compliant

### Performance Requirements
- ✅ App loads in <3 seconds (first load)
- ✅ Meal suggestions generated in <5 seconds
- ✅ Offline mode functional (no internet required)
- ✅ Sync completes in <30 seconds (background)

### Compliance Requirements
- ✅ PIPEDA-compliant privacy policy
- ✅ Analytics opt-in (not opt-out)
- ✅ Data stored in Canadian region
- ✅ DSAR process documented

### User Experience Requirements
- ✅ Onboarding flow <2 minutes
- ✅ Core features accessible in <3 taps
- ✅ Mobile-first design (responsive web, native mobile)
- ✅ Accessibility (WCAG 2.2 Level AA minimum)

---

## Risks & Mitigations

### Risk 1: Grocery Store API Limitations
- **Risk**: Grocery store APIs may have rate limits or require approval
- **Impact**: High (core feature)
- **Mitigation**: 
  - Start with public APIs (Loblaws PC Express)
  - Build fallback (manual grocery lists)
  - Partner with stores early (apply for API access)

### Risk 2: Recipe Database Size
- **Risk**: 500 recipes may not be enough for variety
- **Impact**: Medium (user retention)
- **Mitigation**:
  - Focus on popular recipes (80/20 rule)
  - Partner with Canadian food bloggers
  - Expand library post-MVP

### Risk 3: Offline Functionality Complexity
- **Risk**: Offline sync may be complex to implement
- **Impact**: Medium (user experience)
- **Mitigation**:
  - Use Supabase offline capabilities
  - Cache essential data (recipes, meal plans)
  - Test offline scenarios thoroughly

### Risk 4: Privacy Compliance Complexity
- **Risk**: PIPEDA compliance may require legal review
- **Impact**: High (regulatory)
- **Mitigation**:
  - Use PIPEDA-compliant privacy policy template
  - Consult legal counsel (if budget allows)
  - Implement data retention policies from day 1

### Risk 5: User Acquisition Cost
- **Risk**: CAC may be too high for sustainable growth
- **Impact**: High (business viability)
- **Mitigation**:
  - Focus on organic growth (content, SEO)
  - Referral program (post-MVP)
  - Test paid channels carefully (measure CAC/LTV)

---

## MVP Success Metrics

### Primary Metrics
- **7-Day Retention**: Target 40%+ (current: 45%)
- **Time Saved**: Target 10+ minutes/day (current: 12 minutes/day)
- **Weekly Active Users**: Target 100+ beta users (current: 450)
- **Payment Conversion**: Target 5%+ free-to-paid (current: 3.8%)

### Secondary Metrics
- **NPS**: Target 50+ (current: 52)
- **App Store Rating**: Target 4.5+ stars (current: 4.8)
- **Grocery Integration Usage**: Target 60%+ of users (current: 65%)
- **Offline Usage**: Target 30%+ of sessions (current: 28%)

---

## MVP Timeline

### Phase 1: Core Features (Weeks 1-4)
- ✅ User onboarding & preferences
- ✅ Meal suggestions (basic)
- ✅ Recipe viewing
- ✅ Grocery list generation (manual)

### Phase 2: Integrations (Weeks 5-6)
- ✅ Grocery store integration (Loblaws, Metro)
- ✅ Stripe payments (CAD)
- ✅ Analytics (opt-in)

### Phase 3: Polish & Compliance (Weeks 7-8)
- ✅ Offline functionality
- ✅ Privacy policy (PIPEDA)
- ✅ Performance optimization
- ✅ Beta testing

### Launch: Week 9
- ✅ App Store submission (iOS, Android)
- ✅ Web app launch
- ✅ Beta user onboarding

---

## Conclusion

**MVP Scope**: Focused on core meal planning with Canadian grocery integration, solo-friendly features, and PIPEDA compliance.

**Success Criteria**: 40%+ 7-day retention, 10+ minutes/day time savings, 100+ beta users.

**Risk Level**: Medium (grocery API access, recipe database size)

**Next Steps**: Launch MVP, gather feedback, iterate based on user data.

---

*Last Updated: [Auto-generated via CI]*

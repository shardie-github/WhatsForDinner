# Product Requirements Document (PRD)

**Product:** What's for Dinner  
**Version:** 1.0  
**Last Updated:** 2025-01-09  
**Status:** Beta Release

---

## 1. PRODUCT OVERVIEW

### Vision Statement
Become the #1 AI-powered meal planning platform, helping 1 million families eliminate decision fatigue and reduce food waste by 2026.

### Mission
Turn meal planning from a daily chore into a delightful experience by using AI to suggest personalized meals based on what users already have.

### Core Value Proposition
**"Never stare at your pantry confused again. Get personalized recipes from ingredients you already have in under 30 seconds."**

---

## 2. PROBLEM STATEMENT

### The Problem
Every day, millions of people face the same question: "What's for dinner?" This leads to:
- **Decision fatigue** - Too many choices, no clear answer
- **Food waste** - Ingredients expire because users forget what they have
- **Time waste** - Hours spent meal planning or multiple grocery trips
- **Stress** - Daily pressure to feed themselves/family

### Why Existing Solutions Fail
- **Recipe-first apps** (AllRecipes, Food Network) - Require shopping for specific ingredients
- **Meal kit services** (HelloFresh, Blue Apron) - Expensive, require planning ahead
- **Generic meal planners** - Don't account for what users already have
- **Pantry apps** - Track inventory but don't suggest meals

### Our Solution
Pantry-first AI meal suggestions that:
1. Start with what users have (not what they need)
2. Generate personalized recipes in 30 seconds
3. Reduce food waste by prioritizing expiring ingredients
4. Work offline and across all devices

---

## 3. TARGET AUDIENCE

### Primary Persona: "Busy Parent" (Sarah)
- **Demographics:** Age 32, married, 2 kids, suburban, $75K household income
- **Pain Points:** 
  - Stares at fridge at 6 PM, no idea what to make
  - Buys ingredients but forgets what she has
  - Wastes food because it expires
  - Kids are picky eaters
- **Goals:**
  - Quick, easy meals the family will eat
  - Use what she already has
  - Reduce food waste and grocery trips
- **Tech Savviness:** Medium (uses iPhone, Instagram, Amazon)

### Secondary Persona: "Meal Prep Enthusiast" (Mike)
- **Demographics:** Age 28, single, urban, $55K income
- **Pain Points:**
  - Wants to meal prep but doesn't know where to start
  - Gets bored with same recipes
  - Wastes ingredients buying too much
- **Goals:**
  - Discover new recipes
  - Optimize grocery shopping
  - Meal prep efficiently
- **Tech Savviness:** High (early adopter, uses multiple apps)

---

## 4. PRODUCT GOALS & SUCCESS METRICS

### North Star Metric
**Weekly Active Users (WAU)** - Users who get at least one meal suggestion per week

### Key Results (90 Days)
- **Activation:** 50%+ of signups create first meal plan
- **Retention:** 40%+ D7 retention, 25%+ D30 retention
- **Engagement:** 3+ meal suggestions per week per active user
- **Conversion:** 5%+ free-to-paid conversion rate
- **Revenue:** $5K MRR

### Leading Indicators
- Time to first meal suggestion: <5 minutes
- Pantry items added: 10+ per user
- Meal suggestions viewed: 5+ per week
- Recipes saved: 3+ per user

---

## 5. CORE FEATURES

### 5.1 Pantry Management
**Goal:** Help users track what they have

**Requirements:**
- Add items manually (name, quantity, expiration date)
- Scan barcodes (future: camera-based recognition)
- Import from grocery receipts (future)
- Low-stock alerts
- Expiration tracking with notifications
- Pantry search and filtering

**Success Criteria:**
- Users add 10+ items within first week
- 80%+ accuracy on expiration tracking
- <30 seconds to add new item

### 5.2 AI Meal Suggestions
**Goal:** Generate personalized meal suggestions from pantry

**Requirements:**
- AI analyzes pantry items and suggests recipes
- Considers dietary preferences (vegetarian, gluten-free, etc.)
- Prioritizes expiring ingredients
- Suggests meals based on cooking time available
- Shows recipe difficulty level
- Generates suggestions in <30 seconds

**Success Criteria:**
- 70%+ of suggestions use 3+ pantry items
- Users rate suggestions 4+ stars on average
- <30 second generation time
- 50%+ of suggestions are accepted

### 5.3 Recipe Viewing
**Goal:** Show users how to cook suggested meals

**Requirements:**
- Recipe details (ingredients, instructions, time, difficulty)
- Step-by-step cooking instructions
- Ingredient checklist (what they have vs need)
- Missing ingredients highlighted
- Recipe saving/favoriting
- Nutritional information (calories, macros)

**Success Criteria:**
- 60%+ of viewed recipes are saved
- Users complete 40%+ of viewed recipes
- Average recipe view time: 2+ minutes

### 5.4 Meal Planning
**Goal:** Help users plan meals for the week

**Requirements:**
- Weekly calendar view
- Drag-and-drop meal assignment
- Meal plan templates
- Shopping list generation
- Meal plan sharing (future: with family)

**Success Criteria:**
- 30%+ of users create weekly meal plans
- Average meal plan: 5+ meals
- 50%+ of planned meals are cooked

### 5.5 Grocery Lists
**Goal:** Generate shopping lists from meal plans

**Requirements:**
- Auto-generate from meal plan
- Group by category (produce, dairy, etc.)
- Check off items as you shop
- Share with family members (future)
- Integrate with grocery delivery (future: Instacart, etc.)

**Success Criteria:**
- 40%+ of meal plans generate grocery lists
- Average list: 10+ items
- 60%+ of lists are used for shopping

### 5.6 User Preferences
**Goal:** Personalize suggestions to user tastes

**Requirements:**
- Dietary restrictions (vegetarian, vegan, keto, etc.)
- Allergies (nuts, dairy, etc.)
- Cuisine preferences (Italian, Mexican, Asian, etc.)
- Cooking skill level (beginner, intermediate, advanced)
- Time constraints (quick meals <30min, etc.)
- Disliked ingredients

**Success Criteria:**
- 80%+ of users set preferences during onboarding
- Suggestions respect preferences 90%+ of time
- User satisfaction increases 20%+ with preferences set

---

## 6. USER FLOWS

### 6.1 New User Onboarding
1. **Welcome Screen** (30s)
   - Value prop: "Never wonder what's for dinner again"
   - Quick demo video
   
2. **Pantry Setup** (2min)
   - Add 5 common ingredients (guided)
   - Option to scan barcode or skip
   
3. **Preferences** (1min)
   - Dietary restrictions
   - Cuisine preferences
   - Cooking skill level
   - Time constraints
   
4. **First Meal Suggestion** (30s)
   - AI generates suggestion from pantry
   - Show how it works
   - Celebrate success
   
5. **Invite & Share** (30s)
   - Invite household members (optional)
   - Set up notifications
   - Share first meal (optional)

**Success Metric:** 50%+ complete onboarding, 40%+ reach first suggestion

### 6.2 Daily Meal Discovery
1. User opens app (or receives push notification)
2. App shows "What's for dinner?" prompt
3. User taps "Suggest Meal"
4. AI generates 3 suggestions based on pantry
5. User browses suggestions
6. User selects one and views recipe
7. User adds missing ingredients to grocery list (if needed)
8. User cooks meal and rates it

**Success Metric:** 3+ suggestions viewed per week, 50%+ acceptance rate

### 6.3 Weekly Meal Planning
1. User opens meal planner
2. User selects week
3. User taps "Suggest Meals" for each day
4. User drags suggestions to calendar
5. User reviews meal plan
6. User generates grocery list
7. User shops and cooks throughout week

**Success Metric:** 30%+ of users create weekly plans, 5+ meals per plan

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- Page load time: <2 seconds
- Meal suggestion generation: <30 seconds
- Offline recipe access: 100% of saved recipes
- App size: <50MB (mobile)

### Reliability
- Uptime: 99.9%
- Error rate: <0.1%
- Data sync: Real-time across devices

### Security
- End-to-end encryption for sensitive data
- Row-level security (RLS) on all database tables
- GDPR compliant (data export, deletion)
- No hardcoded secrets

### Scalability
- Support 10K concurrent users
- Handle 100K meal suggestions per day
- Database queries: <100ms p95

### Accessibility
- WCAG 2.1 AA compliant
- Screen reader support
- Keyboard navigation
- High contrast mode

---

## 8. TECHNICAL REQUIREMENTS

### Platform Support
- **Web:** Next.js 15 PWA (Chrome, Safari, Firefox, Edge)
- **iOS:** Expo SDK 52 (iOS 13+)
- **Android:** Expo SDK 52 (Android 8+)

### Backend
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (recipe images)
- **Realtime:** Supabase Realtime (sync across devices)

### AI/ML
- **Meal Generation:** OpenAI GPT-4
- **Ingredient Recognition:** Future: Custom vision model
- **Personalization:** Future: ML model trained on user preferences

### Third-Party Integrations
- **Payments:** Stripe (subscriptions)
- **Analytics:** PostHog (product analytics)
- **Error Monitoring:** Sentry
- **Email:** Resend (transactional emails)

---

## 9. LAUNCH CRITERIA

### Must-Have (Beta Launch)
- ✅ Core AI meal suggestion works end-to-end
- ✅ Pantry management (add, edit, delete items)
- ✅ Recipe viewing with step-by-step instructions
- ✅ User preferences (dietary, cuisine, skill level)
- ✅ Basic meal planning (weekly calendar)
- ✅ Grocery list generation
- ✅ User authentication (signup, login)
- ✅ Test coverage: 40%+ for critical paths
- ✅ Security audit passed
- ✅ Analytics tracking enabled

### Nice-to-Have (v1.0)
- Barcode scanning
- Offline mode
- Social sharing
- Family/household features
- Grocery delivery integration
- Recipe collections
- Nutrition tracking

---

## 10. SUCCESS METRICS & KPIs

### Activation Metrics
- **Signup → First Pantry Item:** 70%+
- **First Pantry Item → First Suggestion:** 80%+
- **First Suggestion → Recipe View:** 60%+
- **Recipe View → Meal Plan:** 30%+

### Engagement Metrics
- **Daily Active Users (DAU):** 20%+ of MAU
- **Weekly Active Users (WAU):** 60%+ of MAU
- **Meal Suggestions per Week:** 3+ per active user
- **Recipes Saved:** 5+ per user

### Retention Metrics
- **D1 Retention:** 60%+
- **D7 Retention:** 40%+
- **D30 Retention:** 25%+
- **Monthly Active Users (MAU):** 70%+ of signups

### Conversion Metrics
- **Free → Premium:** 5%+ conversion rate
- **Premium → Annual:** 30%+ of premium users
- **MRR Growth:** 20%+ month-over-month

### Quality Metrics
- **Meal Suggestion Rating:** 4+ stars average
- **Recipe Completion Rate:** 40%+
- **User Satisfaction (NPS):** 50+

---

## 11. OUT OF SCOPE (v1.0)

- Nutrition tracking (calories, macros)
- Social features (recipe sharing, comments)
- Meal kit integration
- Restaurant recommendations
- Cooking video tutorials
- Meal prep guides
- Cost optimization
- Multi-language support
- Enterprise features

---

## 12. FUTURE ROADMAP

### v1.1 (Q2 2025)
- Barcode scanning
- Offline mode
- Social sharing
- Recipe collections

### v1.2 (Q3 2025)
- Family/household features
- Grocery delivery integration (Instacart)
- Nutrition tracking
- Meal prep mode

### v2.0 (Q4 2025)
- Multi-language support
- Enterprise features
- API for partners
- Marketplace (chef recipes)

---

**Next Steps:** See `/docs/USER_PERSONAS.md` for detailed user personas and `/docs/ROADMAP.md` for implementation timeline.

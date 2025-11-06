# Stage-by-Stage Engagement & Growth Action Plan
## What's for Dinner: Full Lifecycle Optimization

**Implementation Period:** 12 Months  
**Tools:** Supabase, Zapier, Firebase Functions, Low-Code Automation  
**Target:** Sustainable growth with ethical engagement

---

## 🔄 STAGE 1: Awareness — "Who are we and why should you care?"

### 1.1 Brand Story & Archetype Audit

**Objective:** Establish emotional anchor and consistent identity

**Actions:**
1. **Brand Archetype Definition**
   - ✅ Primary: Caregiver (warmth, trust, support)
   - ✅ Secondary: Joyful Simplifier (efficiency with delight)
   - Document in brand guidelines

2. **Visual Identity Refinement**
   - Color palette: Warm Orange (#FF6B35), Forest Green (#2D5016), Cream (#FFF8F0)
   - Typography: Inter (headings), Inter Regular (body)
   - Icon style: Rounded, friendly, approachable
   - **Tool:** Figma design system → Export to codebase

3. **Verbal Identity (Tone of Voice)**
   - Warm but competent
   - Conversational, not corporate
   - Empowering, not condescending
   - **Document:** Voice & tone guide (examples + anti-examples)

4. **Core "Why Now?" Narrative**
   - Post-pandemic meal fatigue
   - Economic pressure (food inflation)
   - Wellness movement (eat well without overwhelm)
   - Family connection priority
   - **Deliverable:** Landing page copy, app store descriptions

**Timeline:** Weeks 1-2  
**Tools:** Figma, Notion (brand guidelines), Content creation workflow

---

### 1.2 Top-of-Funnel Growth

**Objective:** Reach target audiences where they discover inspiration

**Channels & Strategy:**

#### **TikTok/Instagram Reels (Primary)**
- **Content Format:** 5-15 second hooks
- **Hooks by Persona:**
  - Busy Parents: "Dinner plans that plan themselves" (show AI generating meal plan)
  - Solo Professionals: "Fuel your goals, not your stress" (show quick meal selection)
  - Health-Conscious: "Smart meals. Happier days." (show dietary filter + recipe match)
- **Posting Frequency:** 3-5x/week
- **Tool:** CapCut (editing), Canva (templates), Later (scheduling)

#### **Pinterest**
- **Content:** Recipe cards, meal planning infographics, "Week of Dinners" boards
- **SEO:** "weekly meal plan," "dinner ideas," "meal prep"
- **Tool:** Pinterest Business, Tailwind (scheduling)

#### **Wellness Podcasts**
- **Target:** 10-15 podcasts (food, wellness, productivity)
- **Pitch:** "How AI meal planning reduces decision fatigue"
- **Tool:** Podcast outreach via email (template in CRM)

#### **Partner Newsletters**
- **Target:** Meal kit providers, grocery delivery services, parenting blogs
- **Offer:** Co-branded content, affiliate partnerships
- **Tool:** Outreach via LinkedIn, email

**Micro-Content Plan:**
- **5-second hooks:** Problem → Solution (e.g., "Stressed about dinner? → AI plans it")
- **Lifestyle reels:** "A day in the life" (meal planning made easy)
- **Influencer co-creation:** Send app preview to 5-10 micro-influencers (food, parenting, wellness)

**Timeline:** Weeks 3-12 (ongoing)  
**Metrics:** Impressions, click-through rate, app store visits

---

### 1.3 Trust & Social Proof

**Objective:** Build credibility before user commitment

**Actions:**

1. **Testimonial Collection**
   - Reach out to beta users for quotes
   - Format: "This app gave me my evenings back." — Sarah, Mom of 2
   - Display on landing page, app store screenshots
   - **Tool:** Typeform (testimonial collection), Supabase (storage)

2. **User Stories (Long-Form)**
   - "How I saved 5 hours/week with meal planning" (blog post)
   - Case studies: "From takeout to home-cooked in 2 weeks"
   - **Tool:** Blog (Next.js MDX), shareable on social

3. **Initial Brand Collaborations**
   - **Meal Kit Providers:** Co-marketing (e.g., "Plan with What's for Dinner, cook with [Partner]")
   - **Local Grocers:** "Shop smarter with What's for Dinner" (in-store signage)
   - **Creators:** Recipe development partnerships
   - **Tool:** Outreach via email/LinkedIn, partnership agreements

**Timeline:** Weeks 4-12  
**Metrics:** Testimonial views, collaboration reach, trust signals (app store ratings)

---

## ⚙️ STAGE 2: Acquisition — "Make the first impression irresistible."

### 2.1 App Store & Landing Page Optimization

**Objective:** Convert interest into installs

**App Store Optimization (ASO):**

**Icon A/B Test Variants:**
- Variant A: Warm orange circle with fork/knife icon
- Variant B: Green circle with dinner plate icon
- Variant C: Cream background with orange/green gradient icon
- **Tool:** App Store Connect (split testing), analytics

**Screenshots Strategy:**
- **Screen 1:** Value prop ("Dinner plans that plan themselves")
- **Screen 2:** Before/After (stress → peace)
- **Screen 3:** AI meal suggestions (visual)
- **Screen 4:** Grocery list automation
- **Screen 5:** Social proof (testimonials, stats)

**Taglines (A/B Test):**
- "Smart Meals. Happier Days." (emotional)
- "Your Dinner, Done Smarter." (functional)
- "Dinner plans that plan themselves." (benefit-focused)
- **Tool:** A/B testing via App Store Connect, Firebase Remote Config

**Landing Page Optimization:**

**Behavioural Copywriting (Cialdini Principles):**
- **Reciprocity:** "Unlock your free Smart Pantry setup" (value first)
- **Social Proof:** "Join 12,847 happy planners" (numbers + emotion)
- **Authority:** "Powered by AI trained on 50,000+ recipes" (credibility)
- **Scarcity (Ethical):** "Limited: Free onboarding this month" (time-bound, not fake)
- **Tool:** Next.js landing page, Supabase analytics (track conversions)

**Timeline:** Weeks 1-4 (setup), ongoing optimization  
**Metrics:** Install rate, conversion rate (visitor → install), A/B test results

---

### 2.2 Onboarding Psychology

**Objective:** Reduce friction, maximize value perception

**Endowed Progress Effect Implementation:**

1. **Start at "30% Complete"**
   - Pre-fill demo data: "You've already planned 3 meals this week!"
   - Creates endowment effect → higher completion rates
   - **Tool:** Supabase (demo data seeding), React state management

2. **Two Entry Paths:**

   **Path A: Quick Start (80% of users)**
   - 3 questions: Family size, dietary preferences, cooking frequency
   - Immediate AI meal suggestions (no login required)
   - **Aha moment:** First personalized meal match
   - **Tool:** Firebase Auth (delayed until after value), Supabase (preferences)

   **Path B: Personalized Setup (20% of users)**
   - Full AI profile builder (15 questions, 3 minutes)
   - Deeper personalization (allergies, cuisines, skill level)
   - **Tool:** Supabase (user profiles), AI recommendation engine

3. **Single "Aha Moment" Checkpoint**
   - Before requesting login: Show personalized meal suggestion
   - **Trigger:** "Want to save this plan? Sign up (30 seconds)"
   - **Tool:** Conditional rendering (React), Supabase Auth

**Timeline:** Weeks 2-6 (development + testing)  
**Metrics:** Onboarding completion rate, time to first value, login conversion rate

---

### 2.3 Incentives

**Objective:** Provide immediate value, not generic rewards

**Low-Friction Incentive:**

**"Unlock your free Smart Pantry setup"**
- AI analyzes common pantry items → suggests recipes
- Creates immediate utility (not just a discount)
- **Tool:** Supabase (pantry data), AI matching algorithm

**Alternative Incentives (A/B Test):**
- "Free 7-day meal plan" (value: $7)
- "Unlock premium recipes (first 3 free)" (value: $9)
- "Personalized grocery list automation" (value: time saved)

**Timeline:** Weeks 3-8  
**Metrics:** Sign-up conversion rate, incentive redemption rate, value perception

---

## 💡 STAGE 3: Activation — "This is actually useful."

### 3.1 First-Use Journey

**Objective:** Guide users to immediate value

**Progressive Disclosure:**
- **Day 1:** Core features (meal planning, grocery list)
- **Day 3:** Unlock "What's in my fridge?" feature (email)
- **Day 7:** Introduce "Shared Tables" (collaborative planning)
- **Tool:** Feature flags (Firebase Remote Config), email automation (Zapier)

**Immediate Value Triggers:**

1. **AI Meal Suggestions (Within 60 seconds)**
   - Show 5 personalized meal options
   - User selects 3 → "Your week is planned!"
   - **Tool:** Supabase (recipes), AI matching (OpenAI API or local model)

2. **Grocery List Automation (Within 2 minutes)**
   - Auto-generate shopping list from selected meals
   - "Ready to shop? Here's your list."
   - **Tool:** Supabase (ingredients DB), list generation logic

3. **Visible Feedback (Micro-Rewards)**
   - Confetti on meal plan completion
   - Subtle animations (smooth transitions)
   - Progress indicators ("3/5 dinners planned!")
   - **Tool:** React animations (Framer Motion), progress tracking

**Timeline:** Weeks 4-10  
**Metrics:** Time to first meal plan, time to first grocery list, Day-1 activation rate

---

### 3.2 Personalization Layer

**Objective:** Make the app feel intelligent and adaptive

**Soft Data Inputs:**

1. **Recent Recipes Viewed**
   - Track recipe clicks → train preference model
   - "Based on your browsing, here are 3 similar recipes"
   - **Tool:** Supabase (analytics events), recommendation engine

2. **Mood/Context Inputs**
   - "Quick & easy" vs. "Something special"
   - "Using leftovers" vs. "Fresh ingredients"
   - **Tool:** Simple UI toggle, Supabase (user preferences)

3. **Family Size Adaptation**
   - Adjust servings automatically
   - "Cooking for 2? Here's the scaled recipe"
   - **Tool:** Serving calculator, Supabase (household data)

4. **"What's in my fridge?" Feature**
   - High utility → emotional satisfaction
   - Input ingredients → AI suggests recipes
   - **Tool:** Supabase (ingredient matching), AI suggestions

**Timeline:** Weeks 6-12  
**Metrics:** Personalization accuracy, recipe match satisfaction, feature usage rate

---

### 3.3 Micro-Conversion Design

**Objective:** Create dopamine hits and progress visibility

**Micro-Actions:**

1. **"Save to Plan" Button**
   - One-tap save → "Added to your week!"
   - Visual confirmation (checkmark, animation)
   - **Tool:** Supabase (meal plans), React state

2. **"Share Recipe" Button**
   - Share via message, email, social
   - "Share what you're cooking" (social proof)
   - **Tool:** Native sharing API, Supabase (share tracking)

3. **"Remind Me" Button**
   - Set cooking reminders
   - "I'll remind you at 5 PM"
   - **Tool:** Push notifications (Firebase Cloud Messaging), Supabase (reminders)

4. **Progress Highlighting**
   - "You've planned 3/5 dinners this week!"
   - Weekly summary: "7 meals planned, 2 hours saved"
   - **Tool:** Progress calculations, Supabase (analytics), UI components

**Timeline:** Weeks 8-14  
**Metrics:** Micro-action completion rate, share rate, reminder engagement

---

## 🔁 STAGE 4: Retention — "Make them stay because they want to."

### 4.1 Habit Formation Framework

**Objective:** Build automatic usage patterns

**Hook Model Implementation:**

**Trigger (External → Internal):**
- **External:** Push notification ("Want help planning tonight's dinner?")
- **Internal:** "I always plan meals on Sunday" (routine)

**Action:**
- Low-friction: "Tap to see 3 meal suggestions"
- Progressive: "Add to plan" → "Generate grocery list"

**Reward:**
- **Variable:** Different recipe themes weekly
- **Social:** "Friends using What's for Dinner this week" (with permission)
- **Progress:** Streaks, badges, achievements

**Investment:**
- **Data:** Personalized preferences deepen over time
- **Social:** Shared meal plans, collaborative boards
- **Content:** Saved recipes, custom meal plans

**Habit Mechanics:**

1. **Meal Streaks**
   - "7-day planning streak!" (badge)
   - "You're on fire! 14 days in a row"
   - **Tool:** Supabase (streak tracking), badge system

2. **Badges**
   - "Weekend Warrior" (plan 5 weekend meals)
   - "Health Hero" (10 healthy meals planned)
   - "Family Planner" (plan meals for 4+ people)
   - **Tool:** Supabase (achievements table), UI badges

3. **"Weekly Chef Goals"**
   - Set weekly target (e.g., "Plan 5 dinners")
   - Progress bar: "4/5 complete"
   - **Tool:** Goal setting UI, Supabase (goals table)

4. **Social Reinforcement**
   - "Friends using What's for Dinner this week" (opt-in, anonymous)
   - "Join 3,847 planners this week" (aggregate)
   - **Tool:** Privacy-preserving social proof, Supabase (aggregate stats)

**Timeline:** Weeks 10-16  
**Metrics:** Streak completion rate, badge earning rate, weekly goal achievement

---

### 4.2 Push & Notification Strategy

**Objective:** Re-engage at the right moments with the right tone

**Micro-Moment Timing:**

**Morning (7-9 AM):**
- "Want help planning tonight's dinner?" (proactive)
- "Quick reminder: Plan your week in 2 minutes" (habit reinforcement)

**Sunday (10 AM - 2 PM):**
- "Prep once, relax all week. Plan your meals now."
- "Your weekly meal plan is ready (tap to customize)"

**Dinner Time (4-6 PM):**
- "Tonight's dinner suggestion: [Recipe] (tap to see full plan)"
- "Don't forget: You planned [Recipe] for tonight"

**End of Week (Friday 5 PM):**
- "Weekend cooking mode: Here are 3 easy recipes"
- "You planned 5 meals this week. Great job!"

**Gamification (Surprise Elements):**

1. **Surprise Discounts**
   - "You've planned 10 meals! Unlock 20% off premium recipes"
   - **Tool:** Supabase (milestone tracking), discount codes

2. **Unlockable Themes**
   - "Summer Grill Mode" (seasonal)
   - "Comfort Food Week" (mood-based)
   - **Tool:** Feature flags, Supabase (unlocks)

3. **Badges for Consistency**
   - "Monthly Planner" (30-day streak)
   - "Quarterly Chef" (90-day streak)
   - **Tool:** Badge system, Supabase (achievements)

**Notification Tone:**
- Warm, helpful, not pushy
- "Here to help" vs. "You forgot again"
- **Examples:**
  - ✅ "Want help planning tonight's dinner?"
  - ✅ "Your meal plan is ready. Want to customize?"
  - ❌ "You haven't planned meals in 3 days!"
  - ❌ "Don't forget to use the app!"

**Timeline:** Weeks 12-20  
**Tools:** Firebase Cloud Messaging, Zapier (automation), Supabase (notification preferences)  
**Metrics:** Notification open rate, re-engagement rate, opt-out rate

---

### 4.3 Email & Re-engagement

**Objective:** Deliver value through inbox, not just app

**Email Strategy:**

**1. Data-Informed Content:**

**"3 meals people like you loved this week"**
- Personalized based on user preferences
- Social proof: "Similar to your taste"
- **Tool:** Email automation (Zapier + SendGrid/Mailchimp), Supabase (user data)

**"New recipes in your 'Comfort Food' category"**
- Category-based recommendations
- "You saved 5 comfort food recipes. Here are 3 new ones"
- **Tool:** Email automation, Supabase (recipe categories)

**2. Variable Rewards (Weekly Themes):**
- Week 1: "Quick & Easy Week" (5 recipes)
- Week 2: "Healthy Habits Week" (nutrition-focused)
- Week 3: "Global Flavors Week" (international cuisines)
- Week 4: "Budget-Friendly Week" (cost-conscious)
- **Tool:** Email templates, content calendar, Supabase (theme tracking)

**3. Re-engagement Campaigns:**

**Dormant Users (7 days inactive):**
- "We miss you! Here's a quick meal plan for this week"
- Low-pressure: "No pressure, just here to help"

**Dormant Users (30 days inactive):**
- "What's for Dinner has some new features. Want to see?"
- "Your meal planning assistant is still here when you need it"

**Timeline:** Weeks 14-24  
**Tools:** Zapier (automation), Email service (SendGrid/Mailchimp), Supabase (user segments)  
**Metrics:** Email open rate, click-through rate, re-engagement rate

---

## 🫶 STAGE 5: Community — "Belong to something delicious."

### 5.1 Social Layer

**Objective:** Create connection and collaboration

**Features:**

**1. "Shared Tables" (Collaborative Meal Boards)**
- Families or roommates plan meals together
- Real-time updates: "Sarah added 'Pasta Night' to Thursday"
- **Tool:** Supabase (real-time subscriptions), collaborative UI

**2. Comment Threads & Reactions**
- Comment on recipes: "This was amazing! Added extra garlic."
- Emoji reactions: 👍 ❤️ 🔥
- **Tool:** Supabase (comments table), UI components

**3. Private Notes on Recipes**
- "Add extra salt" (personal note)
- "Kids loved this!" (family note)
- **Tool:** Supabase (notes table), UI

**4. Monthly "Cook Together" Live Challenges**
- Theme: "Mediterranean Week" (all users cook same cuisine)
- Badges: "Mediterranean Master"
- Video uploads: "Share your creation" (optional)
- **Tool:** Supabase (challenges table), video upload (Supabase Storage)

**Timeline:** Weeks 20-28  
**Tools:** Supabase (real-time, storage), React (collaborative UI)  
**Metrics:** Shared Tables usage, comment/reaction rate, challenge participation

---

### 5.2 User-Generated Content (UGC)

**Objective:** Turn users into creators

**Incentives:**

1. **Recipe Submissions**
   - "Submit your favorite recipe" → community votes
   - Top recipes featured in app
   - **Tool:** Recipe submission form, Supabase (recipes table), voting system

2. **Cooking Videos**
   - "Share your cooking video" (30-60 seconds)
   - Featured in app: "Community Spotlight"
   - **Tool:** Video upload (Supabase Storage), video player

3. **Story Sharing**
   - "How What's for Dinner changed my week" (blog post)
   - User stories featured on landing page
   - **Tool:** Blog submission form, Supabase (stories table)

**Community Leaderboard (Opt-In):**
- "Most-liked recipe" (this week)
- "Most-saved dish" (this month)
- "Top contributor" (all-time)
- **Tool:** Supabase (leaderboard queries), UI leaderboard

**Timeline:** Weeks 24-32  
**Metrics:** UGC submission rate, engagement rate (likes, saves), leaderboard views

---

### 5.3 Ambassador Program

**Objective:** Recognize and reward advocates

**"Dinner Hero" Recognition:**

**Tiers:**
- **Bronze:** Refer 3 friends → Unlock premium recipes (first 3 free)
- **Silver:** Refer 5 friends → Unlock premium recipes (10 free)
- **Gold:** Refer 10 friends → Lifetime premium access + special badge

**Rewards:**
- Premium recipes (unlockable content)
- Special badges ("Dinner Hero" badge on profile)
- Early access to features
- Recognition in app: "Meet our Dinner Heroes"

**Timeline:** Weeks 28-36  
**Tools:** Referral tracking (Supabase), badge system, reward automation (Zapier)  
**Metrics:** Referral rate, ambassador tier distribution, reward redemption

---

## 🚀 STAGE 6: Advocacy — "Turn loyalty into momentum."

### 6.1 Referral & Virality Engine

**Objective:** Convert users into growth drivers

**2-Sided Referral Program:**

**"You and your friend get 3 premium recipes free!"**
- Both parties benefit (reciprocity)
- Low friction: Share link, friend signs up, both unlock
- **Tool:** Referral link generation (Supabase), reward automation (Zapier)

**Shareable Visual Stories:**

**"This week's dinner wins"**
- Auto-generate visual card: "I planned 7 dinners this week!"
- Shareable on Instagram, Twitter, Facebook
- **Tool:** Image generation (Canvas API or serverless function), share API

**"Community Spotlight"**
- Highlight users in-app and on social
- "Meet our Top Home Chef: [Name]"
- **Tool:** User feature system, social media integration

**Timeline:** Weeks 32-40  
**Metrics:** Referral conversion rate, share rate, viral coefficient

---

### 6.2 Brand Collaboration Layer

**Objective:** Expand reach through partnerships

**Partnership Types:**

1. **Grocery Brands**
   - Co-branded challenges: "Plan with What's for Dinner, shop at [Grocery]"
   - In-store promotions: "Scan QR code for meal plan"
   - **Tool:** Partnership outreach, co-branded content

2. **Local Farms**
   - "Farm-to-Table Week" (seasonal produce)
   - Recipe partnerships: "Using [Farm] ingredients"
   - **Tool:** Local partnership outreach, content collaboration

3. **Nutrition Influencers**
   - Co-branded challenges: "7-Day Healthy Meal Plan"
   - Recipe development: "Created with [Influencer]"
   - **Tool:** Influencer outreach, content collaboration

**Limited-Time Seasonal Events:**

- **Holiday Cook-Offs:** "Thanksgiving Planning Challenge"
- **Summer Grill Mode:** "Grill recipes for summer"
- **Back-to-School:** "Easy school night dinners"
- **Tool:** Event calendar, promotional content, feature flags

**Timeline:** Weeks 36-48  
**Metrics:** Partnership reach, event participation, co-branded content engagement

---

### 6.3 Metrics to Monitor

**Engaged Retention Rate (ERR):**
- Users who perform key actions 3+ times/week
- **Formula:** (DAU with 3+ key actions) / (Total DAU)
- **Target:** 35%+ by Month 6

**UGC Ratio:**
- Posts per 1,000 users
- **Formula:** (Total UGC posts) / (Total users / 1,000)
- **Target:** 10%+ participation rate

**Referral-Origin New Users:**
- New users from referrals per month
- **Formula:** (Referral sign-ups) / (Total sign-ups)
- **Target:** 15%+ by Month 6, 20%+ by Month 12

**Timeline:** Ongoing  
**Tools:** Supabase Analytics, custom dashboards, retention tracking

---

## 📊 STAGE 7: Data & Feedback Loop — "Listen, learn, and evolve."

### 7.1 Telemetry & Analytics

**Objective:** Capture user behavior for continuous improvement

**Event Clusters:**

**Recipe Engagement:**
- Recipe view, recipe save, recipe share
- Recipe rating ("Was this meal fun to cook?")

**Planning Actions:**
- Meal plan creation, meal plan completion
- Grocery list generation, grocery list sharing

**Streak Continuation:**
- Daily login, meal plan update, streak milestone

**Sentiment Feedback:**
- Emoji polls: "Was this meal fun to cook?" (😊 😐 😞)
- One-tap polls: "Helpful?" (Yes/No)
- **Tool:** Supabase (analytics events), sentiment tracking

**Timeline:** Ongoing (setup Weeks 1-4, monitoring ongoing)  
**Tools:** Supabase Analytics, custom event tracking, sentiment analysis

---

### 7.2 Behavioural Cohorts

**Objective:** Tailor experiences by user goals

**Cohort Segmentation:**

1. **Convenience Seekers**
   - Goal: Save time, reduce decision fatigue
   - Features: Quick meal selection, grocery automation
   - Push: "Quick meal suggestions for tonight"

2. **Health Focused**
   - Goal: Nutrition, dietary compliance
   - Features: Nutrition tracking, dietary filters
   - Push: "New healthy recipes in your category"

3. **Family Planners**
   - Goal: Family meals, budget management
   - Features: Family size scaling, budget tracking
   - Push: "Family-friendly meal ideas for this week"

4. **Discovery Enthusiasts**
   - Goal: Try new recipes, explore cuisines
   - Features: Recipe discovery, global cuisines
   - Push: "New recipes from around the world"

**Cohort-Based Campaigns:**
- Feature releases: "New feature for [Cohort]"
- Push campaigns: Tailored messaging
- Email content: Cohort-specific recommendations

**Timeline:** Weeks 8-16 (setup), ongoing optimization  
**Tools:** Supabase (user segmentation), cohort analysis, campaign automation (Zapier)

---

### 7.3 Continuous Growth Engine

**Objective:** Test, learn, iterate

**Monthly A/B Tests:**

**Examples:**
- Onboarding flow variants
- Push notification copy variants
- Feature flag rollouts (10% → 50% → 100%)
- **Tool:** Firebase Remote Config, Supabase (A/B test tracking)

**Engagement Calendar:**

**Monthly Themes:**
- January: "New Year, New Recipes"
- February: "Love & Comfort Food"
- March: "Spring Fresh Start"
- (Continue seasonally)

**Planned Nudges:**
- Weekly meal planning reminders
- Monthly challenge announcements
- Seasonal recipe drops

**Content Drops:**
- New recipe collections (weekly)
- Feature announcements (monthly)
- User spotlights (bi-weekly)

**Feature Trials:**
- Beta features for power users
- Feedback loops: "Try this feature, tell us what you think"
- **Tool:** Feature flags, feedback collection, Supabase (trials tracking)

**Timeline:** Ongoing  
**Tools:** A/B testing framework, engagement calendar (Notion/Google Calendar), feature flags

---

## 🛠️ Implementation Tools & Stack

### Low-Code Tools (Solo Founder Friendly)

**Backend:**
- **Supabase:** Database, auth, real-time, storage, analytics
- **Firebase Functions:** Serverless functions (if needed)
- **Zapier:** Automation (email, notifications, integrations)

**Frontend:**
- **Next.js/React:** Web app
- **React Native/Expo:** Mobile app (if building native)

**Analytics:**
- **Supabase Analytics:** Event tracking
- **Custom Dashboards:** Supabase + React (retention metrics)

**Email/Notifications:**
- **SendGrid/Mailchimp:** Email automation
- **Firebase Cloud Messaging:** Push notifications
- **Zapier:** Email trigger automation

**Content/Creative:**
- **Canva:** Social media graphics
- **CapCut:** Video editing
- **Figma:** Design system

---

## 📈 Success Metrics Dashboard

See **Retention Dashboard Schema** document for detailed metrics and formulas.

**Key Metrics:**
- Activation: 60% complete first meal plan within 24 hours
- Retention: 40% Day-7, 25% Day-30
- Engagement: 35% ERR (Engaged Retention Rate)
- Advocacy: 15%+ referral-origin users
- Community: 10% UGC participation rate

---

## 🎯 Implementation Timeline Summary

**Months 1-3 (Foundation):**
- Brand identity, onboarding optimization, core retention mechanics

**Months 4-6 (Growth):**
- Social proof, community layer, referral engine

**Months 7-12 (Advocacy):**
- UGC scaling, ambassador network, brand partnerships

---

**Next Steps:** See accompanying documents for copy/creative ideas, retention dashboard schema, and 30-day content calendar.

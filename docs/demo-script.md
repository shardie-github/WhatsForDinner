# Demo Script

**Last Updated:** 2025-01-28  
**Purpose:** Guide for demonstrating the application to stakeholders

---

## Demo Overview

**Application:** What's for Dinner  
**Purpose:** AI-powered meal planning application  
**Target Audience:** End users, investors, stakeholders

---

## Demo Environments

### Preview Environment (PR-based)
- **URL:** `https://pr-<number>-whats-for-dinner.vercel.app`
- **Purpose:** Review features before merging
- **Data:** Uses production database (read-only recommended)

### Production Environment
- **URL:** `https://whatsfordinner.app` (or configured domain)
- **Purpose:** Live production demo
- **Data:** Production data

---

## Demo User Persona

**Primary Persona:** "Busy Parent" (Sarah)
- Has 3 kids
- Full-time job
- 30 minutes to get dinner on the table
- Wants quick, easy meal suggestions

**Secondary Persona:** "Health-Conscious Professional" (Marcus)
- Vegetarian, high protein
- Tracks macros
- Wants healthy meal plans

---

## Demo Flow

### 1. Landing Page (2 minutes)

**What to Show:**
- Clean, modern UI
- Value proposition: "Stop wondering. Start cooking."
- Key features overview:
  - AI-powered meal suggestions
  - Pantry tracking
  - Grocery list integration
  - Family meal planning

**Talking Points:**
- "Every day at 6 PM, millions of people ask: What's for dinner?"
- "We solve this daily dilemma with AI-powered meal suggestions"
- "Based on what you have, your preferences, and how much time you have"

---

### 2. Sign Up / Login (1 minute)

**What to Show:**
- Quick sign-up flow
- Email/password or OAuth (GitHub, Google)
- Onboarding (if applicable)

**Talking Points:**
- "Sign up takes less than 60 seconds"
- "We support email/password and social login"

---

### 3. Pantry Management (3 minutes)

**What to Show:**
- Add items to pantry
- Barcode scanning (if available)
- Expiration alerts
- Pantry view

**Talking Points:**
- "Track what you have in your pantry"
- "Get alerts when items are expiring"
- "Discover recipes you can make right now"

**Demo Actions:**
1. Add 5-10 items to pantry (e.g., chicken, rice, vegetables, spices)
2. Show expiration alerts
3. Show pantry view

---

### 4. AI Meal Generation (5 minutes)

**What to Show:**
- Generate meal suggestions based on pantry
- Filter by dietary preferences
- Filter by cooking time
- Filter by skill level
- View recipe details

**Talking Points:**
- "Our AI learns what you keep in stock"
- "Understands your preferences and adapts to your cooking style"
- "The more you use it, the smarter it gets"

**Demo Actions:**
1. Click "Generate Meal Suggestions"
2. Select dietary preferences (e.g., vegetarian, high protein)
3. Select cooking time (e.g., 30 minutes)
4. Show 3 meal suggestions
5. Click on one meal to show recipe details:
   - Ingredients
   - Steps
   - Macros/nutrition
   - Estimated time

---

### 5. Meal Planning (3 minutes)

**What to Show:**
- Weekly meal plan view
- Add meals to plan
- Drag and drop (if available)
- Calendar view

**Talking Points:**
- "Plan your week in advance"
- "See what's for dinner at a glance"
- "Share with your household"

**Demo Actions:**
1. Add meals to this week's plan
2. Show weekly view
3. Show calendar view (if available)

---

### 6. Grocery Lists (2 minutes)

**What to Show:**
- Auto-generate grocery list from meal plan
- Add items manually
- Check off items
- Share with household

**Talking Points:**
- "Automatically generate shopping lists from meal plans"
- "Never forget an ingredient again"
- "Share with your household"

**Demo Actions:**
1. Generate grocery list from meal plan
2. Add a few items manually
3. Check off items
4. Show shared list (if household feature available)

---

### 7. Family Features (2 minutes)

**What to Show:**
- Create household
- Add family members
- Share meal plans
- Household grocery lists

**Talking Points:**
- "Share meal plans with your household"
- "Everyone can contribute ideas"
- "See what's for dinner together"

**Demo Actions:**
1. Create household (if not already created)
2. Add family member (if applicable)
3. Show shared meal plan
4. Show shared grocery list

---

### 8. Nutrition Tracking (2 minutes)

**What to Show:**
- Macros for each meal
- Daily/weekly nutrition summary
- Health goals tracking

**Talking Points:**
- "See macros and nutrition for every meal"
- "Track your health goals over time"
- "Make informed decisions"

**Demo Actions:**
1. Show macros for a meal
2. Show daily nutrition summary
3. Show weekly summary (if available)

---

## Key Differentiators to Highlight

### 1. AI That Actually Understands Your Kitchen
- "Our AI doesn't just suggest random recipes"
- "It learns what you keep in stock"
- "Understands your preferences and adapts"

### 2. Pantry Intelligence
- "Track what you have"
- "Get alerts when items are expiring"
- "Discover recipes you can make right now"

### 3. Seamless Grocery Integration
- "Add missing ingredients with one tap"
- "Order directly from your favorite stores"
- "Never forget an ingredient again"

### 4. Works Everywhere
- "Syncs across iOS, Android, and Web"
- "Start planning on your phone, finish cooking with your tablet"
- "Works offline"

---

## Common Questions & Answers

### Q: How does the AI work?
**A:** "We use OpenAI GPT-4 to generate personalized meal suggestions based on your pantry, dietary preferences, cooking time, and skill level. The AI learns from your usage patterns and gets smarter over time."

### Q: What if I don't have the ingredients?
**A:** "You can add missing ingredients to your grocery list with one tap. We also integrate with grocery stores so you can order directly."

### Q: Can I share meal plans with my family?
**A:** "Yes! You can create a household and share meal plans, grocery lists, and recipes with your family members."

### Q: Does it work offline?
**A:** "Yes! You can access your saved meal plans and recipes even when you're offline. Perfect for cooking in areas with spotty connectivity."

### Q: How much does it cost?
**A:** "We have a free tier with core features. Premium plans unlock advanced features like unlimited meal plans, priority AI suggestions, and more."

---

## Demo Checklist

### Before Demo
- [ ] Verify preview/production environment is accessible
- [ ] Test all key features
- [ ] Prepare demo data (pantry items, meal plans)
- [ ] Check internet connection
- [ ] Have backup plan (screenshots/video if live demo fails)

### During Demo
- [ ] Start with landing page
- [ ] Show sign-up/login flow
- [ ] Demonstrate pantry management
- [ ] Generate AI meal suggestions
- [ ] Show meal planning
- [ ] Demonstrate grocery lists
- [ ] Show family features
- [ ] Highlight nutrition tracking

### After Demo
- [ ] Answer questions
- [ ] Collect feedback
- [ ] Follow up with stakeholders

---

## Demo Data Setup

### Seed Data Script

**Location:** `scripts/seed-demo.ts` (to be created)

**Purpose:** Create demo data for presentations

**Data to Seed:**
- Demo user account
- Sample pantry items (10-15 items)
- Sample meal plans (1 week)
- Sample recipes (5-10 recipes)
- Sample grocery lists (2-3 lists)

**Usage:**
```bash
# Seed demo data
pnpm tsx scripts/seed-demo.ts

# Or via CI (if configured)
# GitHub Actions workflow: seed-demo.yml
```

---

## Troubleshooting

### Demo Environment Not Accessible
- Check Vercel deployment status
- Verify environment variables are set
- Check GitHub Actions workflow status

### Features Not Working
- Check browser console for errors
- Verify Supabase connection
- Check API endpoints are responding

### Slow Performance
- Check network connection
- Verify CDN is working
- Check database performance

---

## Conclusion

**Demo Duration:** 20-25 minutes  
**Key Takeaway:** "Stop wondering. Start cooking."

**Next Steps:**
- Collect feedback
- Address questions
- Follow up with stakeholders
- Iterate based on feedback

---

## Appendix: Quick Reference

### Demo URLs
- **Preview:** `https://pr-<number>-whats-for-dinner.vercel.app`
- **Production:** `https://whatsfordinner.app`

### Key Features to Highlight
1. AI-powered meal suggestions
2. Pantry tracking
3. Meal planning
4. Grocery lists
5. Family sharing
6. Nutrition tracking
7. Offline support

### Technical Stack (for technical demos)
- Frontend: Next.js 16, React 19
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime)
- AI: OpenAI GPT-4
- Hosting: Vercel
- CI/CD: GitHub Actions

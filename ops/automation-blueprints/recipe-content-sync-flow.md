# Recipe Content Fetch & Meal Plan Sync Automation — What's for Dinner?

**Goal:** Automatically fetch recipe content from APIs and sync meal plans across platforms

---

## 🎯 Overview

This automation flow fetches recipe content from external APIs (Edamam, Spoonacular, or custom sources) and syncs meal plans to Google Sheets, Airtable, or Supabase for easy access and sharing.

**APP_ID:** whatsfordinner  
**Time Investment:** 2 hours setup  
**Monthly Cost:** $0-50 CAD (depending on API usage)

---

## 📋 API Options

### Option 1: Edamam Recipe API (Recommended)

**Pricing:** Free tier (5,000 calls/month), Paid ($49/month for 50K calls)  
**Features:** Recipe search, nutrition data, dietary filters  
**Website:** https://www.edamam.com/

**Setup:**
1. Sign up for Edamam account
2. Get API key and App ID
3. Add to `.env`:
   ```
   NEXT_PUBLIC_EDAMAM_APP_ID=your_app_id
   NEXT_PUBLIC_EDAMAM_APP_KEY=your_app_key
   ```

---

### Option 2: Spoonacular API

**Pricing:** Free tier (150 calls/day), Paid ($9.99/month for 1,500 calls/day)  
**Features:** Recipe search, meal planning, grocery lists  
**Website:** https://spoonacular.com/food-api

**Setup:**
1. Sign up for Spoonacular account
2. Get API key
3. Add to `.env`:
   ```
   NEXT_PUBLIC_SPOONACULAR_API_KEY=your_api_key
   ```

---

### Option 3: Custom Recipe Database (Supabase)

**Pricing:** Free (Supabase free tier)  
**Features:** Full control, custom fields  
**Setup:** Build custom recipe database in Supabase

---

## 🚀 Automation Flow

### Step 1: Fetch Recipes (Zapier/Make)

**Zapier Integration:**

1. **Trigger:** Schedule → Daily at 6 AM
2. **Action:** Code → Fetch Recipes from API
   ```javascript
   const axios = require('axios');
   
   const response = await axios.get('https://api.edamam.com/search', {
     params: {
       q: 'chicken dinner',
       app_id: process.env.EDAMAM_APP_ID,
       app_key: process.env.EDAMAM_APP_KEY,
       diet: 'balanced',
       from: 0,
       to: 10
     }
   });
   
   return response.data.hits.map(hit => ({
     title: hit.recipe.label,
     url: hit.recipe.url,
     image: hit.recipe.image,
     calories: hit.recipe.calories,
     ingredients: hit.recipe.ingredientLines
   }));
   ```
3. **Action:** Supabase → Insert Rows (recipes table)
4. **Action:** Google Sheets → Add Rows (recipe database)

---

### Step 2: Sync Meal Plans (Supabase → Google Sheets)

**Zapier Integration:**

1. **Trigger:** Supabase → New Row (meal_plans table)
2. **Action:** Google Sheets → Add Row
   - Spreadsheet: "Meal Plans"
   - Columns: Date, User Email, Recipes, Grocery List

**Manual Sync (If Needed):**
```bash
# Export meal plans from Supabase
supabase db dump --data-only --table meal_plans > meal_plans.csv

# Import to Google Sheets manually
```

---

### Step 3: Generate Grocery Lists

**Zapier Integration:**

1. **Trigger:** Supabase → New Row (meal_plans table)
2. **Action:** Code → Generate Grocery List
   ```javascript
   // Aggregate ingredients from recipes
   const ingredients = mealPlan.recipes.flatMap(r => r.ingredients);
   const groceryList = [...new Set(ingredients)]; // Remove duplicates
   return groceryList;
   ```
3. **Action:** Google Sheets → Add Row (grocery_lists table)
4. **Action:** Gmail → Send Email (if user requested)

---

### Step 4: Weekly Meal Plan Email

**Zapier Integration:**

1. **Trigger:** Schedule → Every Sunday at 8 AM
2. **Action:** Supabase → Find Users (preference: weekly_email = true)
3. **Action:** Code → Generate Weekly Meal Plan
   ```javascript
   // Fetch 7 recipes based on user preferences
   const recipes = await fetchRecipes({
     diet: user.dietary_preferences,
     maxCalories: user.calorie_target,
     cuisine: user.preferred_cuisine
   });
   ```
4. **Action:** Gmail → Send Email
   - Subject: "Your Weekly Meal Plan"
   - Body: HTML email with recipes, grocery list, prep tips

---

## 📊 Recipe Database Schema (Supabase)

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  source_url TEXT,
  calories INTEGER,
  servings INTEGER,
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  ingredients JSONB, -- array of ingredients
  instructions JSONB, -- array of steps
  dietary_tags TEXT[], -- ['vegetarian', 'gluten-free', etc.]
  cuisine_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  recipes JSONB, -- array of recipe IDs
  grocery_list JSONB, -- aggregated ingredients
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX meal_plans_user_id_idx ON meal_plans(user_id);
CREATE INDEX meal_plans_dates_idx ON meal_plans(start_date, end_date);
```

---

## 🔄 Recipe Content Sync Workflow

### Daily Sync (Automated)

1. **6 AM:** Fetch trending recipes from API
2. **7 AM:** Sync to Supabase recipes table
3. **8 AM:** Update Google Sheets recipe database
4. **9 AM:** Generate weekly meal plans for users (if Sunday)

### Weekly Sync (Automated)

1. **Sunday 8 AM:** Generate weekly meal plans
2. **Sunday 9 AM:** Send meal plan emails
3. **Sunday 10 AM:** Generate grocery lists
4. **Sunday 11 AM:** Sync to Google Sheets

---

## 📈 Analytics & Tracking

**Track These Metrics:**
- Recipes fetched per day
- Meal plans generated per week
- Grocery lists created
- Email open rates (weekly meal plan emails)
- User engagement (recipes saved, meal plans used)

**Dashboard:** Google Sheets "Recipe Analytics"

**Columns:**
- Date
- Recipes Fetched
- Meal Plans Generated
- Grocery Lists Created
- Email Opens
- User Engagement

---

## ✅ Checklist

**Setup:**
- [ ] Edamam/Spoonacular API account created
- [ ] API keys added to `.env`
- [ ] Supabase recipes table created
- [ ] Google Sheets recipe database created
- [ ] Zapier automation configured

**Automation:**
- [ ] Daily recipe fetch configured
- [ ] Meal plan sync configured
- [ ] Grocery list generation configured
- [ ] Weekly email automation configured

**Testing:**
- [ ] Recipe fetch tested
- [ ] Meal plan sync tested
- [ ] Grocery list generation tested
- [ ] Email delivery tested

---

## 📚 Resources

- [Edamam Recipe API](https://developer.edamam.com/edamam-recipe-api)
- [Spoonacular API](https://spoonacular.com/food-api/docs)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)

---

**Last Updated:** 2025-01-XX  
**Next Review:** Monthly (optimize API usage and costs)

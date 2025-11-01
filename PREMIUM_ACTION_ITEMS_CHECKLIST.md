# Premium Product Action Items Checklist

**Status Tracking**: ? Complete | ?? In Progress | ?? Blocked | ?? Pending  
**Priority**: P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)

---

## Phase 1: Foundation (Weeks 1-4)

### 1.1 Nutrition Data Integration (P0)

#### USDA FoodData Central API
- [ ] **1.1.1** Apply for USDA API key
  - **Owner**: Backend Lead
  - **Effort**: 1h
  - **Status**: ?? Pending
  - **Dependencies**: None

- [ ] **1.1.2** Create nutrition service layer (`lib/nutrition-service.ts`)
  - **Owner**: Backend Dev
  - **Effort**: 1d
  - **Status**: ?? Pending
  - **Dependencies**: 1.1.1
  - **Requirements**:
    - [ ] USDA API client wrapper
    - [ ] Nutrition data caching (Redis or Supabase cache)
    - [ ] Error handling and fallbacks
    - [ ] Rate limiting (USDA allows 1000 requests/hour)

- [ ] **1.1.3** Replace mock nutrition data in `/api/partners/v1/nutrition/route.ts`
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 1.1.2
  - **Requirements**:
    - [ ] Call USDA API for ingredient nutrition
    - [ ] Aggregate nutrition for recipe ingredients
    - [ ] Handle missing data gracefully
    - [ ] Return comprehensive nutrition (macros + micros)

- [ ] **1.1.4** Add nutrition accuracy badges in UI
  - **Owner**: Frontend Dev
  - **Effort**: 1d
  - **Status**: ?? Pending
  - **Dependencies**: 1.1.3
  - **Requirements**:
    - [ ] "USDA Verified" badge on recipes
    - [ ] Nutrition completeness indicator
    - [ ] Show missing nutrition warnings

- [ ] **1.1.5** Build nutrition caching layer
  - **Owner**: Backend Dev
  - **Effort**: 1d
  - **Status**: ?? Pending
  - **Dependencies**: 1.1.2
  - **Requirements**:
    - [ ] Cache nutrition data in Supabase (nutrition_cache table)
    - [ ] Cache TTL: 7 days (ingredients don't change)
    - [ ] Cache invalidation strategy

- [ ] **1.1.6** Create premium nutrition dashboard
  - **Owner**: Frontend Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Dependencies**: 1.1.3
  - **Requirements**:
    - [ ] Weekly/monthly macro tracking charts
    - [ ] Micronutrient tracking (vitamins, minerals)
    - [ ] Nutrition goals vs. actual
    - [ ] Trends over time
    - [ ] Deficiency alerts
    - [ ] Export to CSV/PDF

#### Edamam API (Optional - P1)
- [ ] **1.1.7** Apply for Edamam API key (free tier)
  - **Owner**: Backend Lead
  - **Effort**: 1h
  - **Status**: ?? Pending

- [ ] **1.1.8** Integrate Edamam for food image recognition (future)
  - **Owner**: Backend Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Priority**: P2 (defer to Phase 3)

---

### 1.2 Weekly Meal Plan Generator (P0)

- [ ] **1.2.1** Design meal plan algorithm
  - **Owner**: Product/Backend
  - **Effort**: 1d
  - **Status**: ?? Pending
  - **Requirements**:
    - [ ] Input: Dietary preferences, pantry items, budget constraints
    - [ ] Output: 7-day meal plan with recipes
    - [ ] Consider: Variety, nutrition balance, prep time distribution

- [ ] **1.2.2** Build meal plan generation service (`lib/meal-plan-generator.ts`)
  - **Owner**: Backend Dev
  - **Effort**: 5d
  - **Status**: ?? Pending
  - **Dependencies**: 1.2.1, Recipe generation API
  - **Requirements**:
    - [ ] Generate recipes for each day/meal
    - [ ] Ensure nutritional balance across week
    - [ ] Variety in cuisines and difficulty
    - [ ] Consider pantry items first
    - [ ] Generate shopping list for missing items

- [ ] **1.2.3** Create meal plan UI component
  - **Owner**: Frontend Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Dependencies**: 1.2.2
  - **Requirements**:
    - [ ] Weekly calendar view
    - [ ] Drag-and-drop meal swapping
    - [ ] Regenerate individual meals
    - [ ] Print/export meal plan

- [ ] **1.2.4** Add meal plan preferences/settings
  - **Owner**: Frontend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 1.2.3
  - **Requirements**:
    - [ ] Dietary restrictions selection
    - [ ] Cuisine preferences
    - [ ] Meal prep day selection
    - [ ] Family size (servings)

- [ ] **1.2.5** Build shopping list aggregator
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 1.2.2
  - **Requirements**:
    - [ ] Aggregate ingredients from all meals
    - [ ] Group by category (produce, dairy, etc.)
    - [ ] Quantities calculation
    - [ ] Deduplication (same ingredient across meals)

---

### 1.3 Cost Calculator Service (P0)

- [ ] **1.3.1** Research USDA price database format
  - **Owner**: Backend Lead
  - **Effort**: 0.5d
  - **Status**: ?? Pending

- [ ] **1.3.2** Build cost calculator service (`lib/cost-calculator.ts`)
  - **Owner**: Backend Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Requirements**:
    - [ ] Calculate cost per recipe (ingredient-level)
    - [ ] Calculate cost per serving
    - [ ] Regional price variations (optional)
    - [ ] Cost estimation (if exact price unavailable)

- [ ] **1.3.3** Create price database schema
  - **Owner**: Backend Dev
  - **Effort**: 1d
  - **Status**: ?? Pending
  - **Requirements**:
    - [ ] `ingredient_prices` table (ingredient_id, price, unit, region, date)
    - [ ] Seed with USDA data
    - [ ] Update mechanism (weekly/monthly)

- [ ] **1.3.4** Add "Cost per Serving" to recipe cards
  - **Owner**: Frontend Dev
  - **Effort**: 1d
  - **Status**: ?? Pending
  - **Dependencies**: 1.3.2

- [ ] **1.3.5** Build budget meal planner feature
  - **Owner**: Full-stack Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Dependencies**: 1.3.2, 1.2.2
  - **Requirements**:
    - [ ] Set weekly/monthly budget
    - [ ] Filter recipes by cost
    - [ ] Generate budget-friendly meal plans
    - [ ] Track spending vs. budget

---

### 1.4 Pantry Intelligence (P0)

- [ ] **1.4.1** Add expiration date field to pantry items
  - **Owner**: Backend Dev
  - **Effort**: 0.5d
  - **Status**: ?? Pending
  - **Requirements**:
    - [ ] Migration: Add `expiration_date` to `pantry_items`
    - [ ] Update API to accept expiration dates
    - [ ] Optional field (backward compatible)

- [ ] **1.4.2** Build expiration alert system
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 1.4.1
  - **Requirements**:
    - [ ] Daily job to check expiring items
    - [ ] Alert at 3 days before expiration
    - [ ] Alert at 1 day before expiration
    - [ ] Send notifications (email, in-app, push)

- [ ] **1.4.3** Create "Use Soon" pantry section UI
  - **Owner**: Frontend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 1.4.2
  - **Requirements**:
    - [ ] Filter pantry by expiration date
    - [ ] Visual indicator (red/yellow badges)
    - [ ] Quick recipe suggestions for expiring items

- [ ] **1.4.4** Build pantry waste reduction dashboard
  - **Owner**: Frontend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 1.4.2
  - **Requirements**:
    - [ ] Items used before expiration (count)
    - [ ] Items expired (count)
    - [ ] Waste reduction percentage
    - [ ] Monthly waste trends

---

## Phase 2: Grocery Integration (Weeks 5-8)

### 2.1 Instacart Connect Integration (P0)

- [ ] **2.1.1** Apply for Instacart Connect partner program
  - **Owner**: Business Dev / Founder
  - **Effort**: 1w (approval time)
  - **Status**: ?? Pending
  - **Requirements**:
    - [ ] Business verification
    - [ ] Integration proposal
    - [ ] Technical review

- [ ] **2.1.2** Build grocery service abstraction layer (`lib/grocery-service.ts`)
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Requirements**:
    - [ ] Interface for multiple providers (Instacart, Amazon, etc.)
    - [ ] Provider-specific implementations
    - [ ] Error handling and fallbacks

- [ ] **2.1.3** Implement Instacart API client
  - **Owner**: Backend Dev
  - **Effort**: 5d
  - **Status**: ?? Pending
  - **Dependencies**: 2.1.1, 2.1.2
  - **Requirements**:
    - [ ] Authentication (OAuth)
    - [ ] Product search
    - [ ] Cart creation
    - [ ] Store selection
    - [ ] Order tracking

- [ ] **2.1.4** Build shopping cart builder from recipes
  - **Owner**: Backend Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Dependencies**: 2.1.3
  - **Requirements**:
    - [ ] Extract ingredients from recipe
    - [ ] Match ingredients to Instacart products
    - [ ] Add to cart via API
    - [ ] Handle unmatched items (manual add)

- [ ] **2.1.5** Create "Add to Cart" UI components
  - **Owner**: Frontend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 2.1.4
  - **Requirements**:
    - [ ] Button on recipe pages
    - [ ] Cart preview modal
    - [ ] Redirect to Instacart checkout
    - [ ] Loading states

- [ ] **2.1.6** Implement affiliate revenue tracking
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 2.1.3
  - **Requirements**:
    - [ ] Track cart creation events
    - [ ] Track order completion (webhook)
    - [ ] Store revenue in `affiliate_revenue` table
    - [ ] Dashboard for revenue tracking

---

### 2.2 Amazon Associates Integration (P1)

- [ ] **2.2.1** Apply for Amazon Associates program
  - **Owner**: Business Dev
  - **Effort**: 1w (approval)
  - **Status**: ?? Pending

- [ ] **2.2.2** Integrate Product Advertising API
  - **Owner**: Backend Dev
  - **Effort**: 4d
  - **Status**: ?? Pending
  - **Dependencies**: 2.2.1, 2.1.2
  - **Requirements**:
    - [ ] Product search
    - [ ] Price retrieval
    - [ ] Affiliate link generation

- [ ] **2.2.3** Add Amazon product links to shopping lists
  - **Owner**: Frontend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 2.2.2

---

### 2.3 Price Comparison (P1)

- [ ] **2.3.1** Build price comparison service
  - **Owner**: Backend Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Dependencies**: 2.1.3, 2.2.2
  - **Requirements**:
    - [ ] Query multiple providers for same product
    - [ ] Aggregate prices
    - [ ] Return best price + provider

- [ ] **2.3.2** Create price comparison UI
  - **Owner**: Frontend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 2.3.1
  - **Requirements**:
    - [ ] Show prices side-by-side
    - [ ] Highlight cheapest option
    - [ ] Link to each provider

---

## Phase 3: Advanced Features (Weeks 9-12)

### 3.1 Barcode Scanner (P1)

- [ ] **3.1.1** Integrate Open Food Facts API
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Requirements**:
    - [ ] Barcode lookup endpoint
    - [ ] Product information retrieval
    - [ ] Nutrition data extraction

- [ ] **3.1.2** Build mobile barcode scanner component
  - **Owner**: Mobile Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Dependencies**: 3.1.1
  - **Requirements**:
    - [ ] Camera access
    - [ ] Barcode scanning (react-native-camera or expo-barcode-scanner)
    - [ ] Auto-populate pantry item from scan
    - [ ] Handle unsupported barcodes

- [ ] **3.1.3** Add barcode field to pantry items
  - **Owner**: Backend Dev
  - **Effort**: 0.5d
  - **Status**: ?? Pending

---

### 3.2 Calendar Integration (P1)

- [ ] **3.2.1** Set up Google Calendar OAuth
  - **Owner**: Backend Dev
  - **Effort**: 1d
  - **Status**: ?? Pending
  - **Requirements**:
    - [ ] Google Cloud project setup
    - [ ] OAuth credentials
    - [ ] Calendar API enabled

- [ ] **3.2.2** Build calendar sync service (`lib/calendar-sync.ts`)
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 3.2.1
  - **Requirements**:
    - [ ] Create calendar events from meal plans
    - [ ] Update events on meal plan changes
    - [ ] Delete events on meal plan deletion
    - [ ] Handle OAuth refresh tokens

- [ ] **3.2.3** Create calendar UI components
  - **Owner**: Frontend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 3.2.2
  - **Requirements**:
    - [ ] "Sync to Calendar" button
    - [ ] Calendar connection status
    - [ ] Disconnect option

---

### 3.3 Preference Learning (P1)

- [ ] **3.3.1** Design preference learning algorithm
  - **Owner**: Data/Backend
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Requirements**:
    - [ ] Track user interactions (recipe views, favorites, ratings)
    - [ ] Extract preferences (cuisine, difficulty, ingredients)
    - [ ] Build preference profile
    - [ ] Use for recipe ranking

- [ ] **3.3.2** Build preference tracking system
  - **Owner**: Backend Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Dependencies**: 3.3.1
  - **Requirements**:
    - [ ] `user_preferences` table
    - [ ] Event tracking (recipe_viewed, recipe_favorited, etc.)
    - [ ] Preference extraction logic
    - [ ] Preference update mechanism

- [ ] **3.3.3** Integrate preferences into recipe generation
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 3.3.2
  - **Requirements**:
    - [ ] Rank recipes by preference score
    - [ ] Boost preferred cuisines/ingredients
    - [ ] Learn from negative feedback

---

### 3.4 Recipe Sharing & Collections (P1)

- [ ] **3.4.1** Build recipe sharing system
  - **Owner**: Backend Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Requirements**:
    - [ ] Share recipes via link
    - [ ] Public/private recipe settings
    - [ ] Recipe collections/bookmarks
    - [ ] Share with specific users

- [ ] **3.4.2** Create recipe sharing UI
  - **Owner**: Frontend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 3.4.1

---

### 3.5 Cost Savings Dashboard (P1)

- [ ] **3.5.1** Build cost savings calculation engine
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 1.3.2
  - **Requirements**:
    - [ ] Compare home-cooked vs. eating out costs
    - [ ] Calculate savings per meal
    - [ ] Aggregate monthly savings

- [ ] **3.5.2** Create cost savings dashboard UI
  - **Owner**: Frontend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 3.5.1
  - **Requirements**:
    - [ ] Monthly savings chart
    - [ ] Savings breakdown (by meal type)
    - [ ] Projected annual savings

---

## Phase 4: Premium Content (Weeks 13-16)

### 4.1 Video Recipe Integration (P2)

- [ ] **4.1.1** Choose video hosting (YouTube/Vimeo)
  - **Owner**: Product
  - **Effort**: 1d
  - **Status**: ?? Pending

- [ ] **4.1.2** Integrate video API
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 4.1.1

- [ ] **4.1.3** Add video player to recipe pages
  - **Owner**: Frontend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending
  - **Dependencies**: 4.1.2

---

### 4.2 Recipe Browse (Spoonacular) (P2)

- [ ] **4.2.1** Integrate Spoonacular recipe search
  - **Owner**: Backend Dev
  - **Effort**: 2d
  - **Status**: ?? Pending

- [ ] **4.2.2** Build recipe browse/discover UI
  - **Owner**: Frontend Dev
  - **Effort**: 3d
  - **Status**: ?? Pending
  - **Dependencies**: 4.2.1

---

## Testing & Quality Assurance

### Unit Tests
- [ ] Write tests for nutrition service
- [ ] Write tests for meal plan generator
- [ ] Write tests for cost calculator
- [ ] Write tests for grocery service

### Integration Tests
- [ ] Test USDA API integration
- [ ] Test Instacart API integration
- [ ] Test meal plan generation end-to-end
- [ ] Test calendar sync flow

### E2E Tests
- [ ] Test premium onboarding flow
- [ ] Test meal plan ? shopping cart flow
- [ ] Test nutrition dashboard
- [ ] Test cost savings dashboard

---

## Documentation

- [ ] Update API documentation with new endpoints
- [ ] Create premium features guide
- [ ] Document grocery integration setup
- [ ] Create developer guide for new integrations

---

## Monitoring & Analytics

- [ ] Set up tracking for premium feature usage
- [ ] Monitor API usage (rate limits, costs)
- [ ] Track affiliate revenue metrics
- [ ] Set up alerts for API failures

---

## Deployment

- [ ] Set up staging environment for integrations
- [ ] Deploy Phase 1 features to staging
- [ ] User acceptance testing (UAT)
- [ ] Production deployment plan
- [ ] Rollback procedures

---

**Last Updated**: 2025-01-21  
**Total Estimated Effort**: ~800-1000 engineering hours  
**Timeline**: 16 weeks (4 phases)

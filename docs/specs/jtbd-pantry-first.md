# JTBD Spec: Pantry-First Recipe Generation

**Status**: 🎯 Gap to Close  
**Priority**: P0 (Core JTBD)  
**Owner**: Product + Eng  
**ETA**: 5 days

---

## Job-To-Be-Done

**Primary Job:**
> "When I'm standing in my kitchen wondering what to cook, I want to quickly find recipes I can make RIGHT NOW with ingredients I already have, so I don't waste food or make another grocery trip."

**Context:**
- User has ingredients in pantry
- Need dinner in 30-60 minutes
- Want to avoid decision fatigue
- Don't want to buy new ingredients

---

## Current State Analysis

**What Works:**
- ✅ `/api/dinner` endpoint generates recipes from ingredients
- ✅ Pantry items stored in database
- ✅ Recipe cards display recipes

**What's Missing:**
- ❌ No quick "Use My Pantry" button (must type ingredients)
- ❌ No visual pantry import/scan flow
- ❌ No "quick add common ingredients" shortcuts
- ❌ No empty-state guidance ("Add ingredients to get started")
- ❌ No pantry suggestions ("You commonly use: chicken, rice...")

---

## Target State

**User Flow:**
1. User lands on homepage
2. Sees pantry items auto-populated (if exists) OR empty state with CTA
3. Clicks "Use My Pantry" → instantly generates recipes
4. OR: Adds ingredients via quick-select chips (common items)
5. Gets recipes in < 10 seconds

**Success Metrics:**
- Time-to-first-recipe: < 30 seconds (target)
- % users who use pantry vs. manual entry: 60%+ (target)
- Recipe generation success rate: 85%+ useful recipes

---

## Acceptance Criteria

### AC1: Pantry Auto-Population
- [ ] If user has pantry items, show "Use My Pantry" button prominently
- [ ] Button pre-populates ingredients field
- [ ] User can edit before generating

### AC2: Quick-Add Common Ingredients
- [ ] Show chips for common ingredients (chicken, rice, pasta, tomatoes, etc.)
- [ ] User can click chips to add to ingredient list
- [ ] Chips persist across sessions (user's common items)

### AC3: Empty-State UX
- [ ] If no pantry items, show "Get Started" flow
- [ ] Option 1: "Add Ingredients" → pantry manager
- [ ] Option 2: "Quick Start" → quick-select common items
- [ ] Option 3: "Import from Grocery App" → placeholder for future integration

### AC4: Pantry Suggestions
- [ ] If user has saved recipes, suggest commonly used ingredients
- [ ] Show "You often use: X, Y, Z" on homepage
- [ ] Click suggestion → auto-adds to ingredient list

### AC5: Visual Feedback
- [ ] Show loading state: "Finding recipes for [ingredient list]..."
- [ ] Display ingredient count badge
- [ ] Show pantry sync status if applicable

---

## Technical Implementation

### API Changes
**None** - `/api/dinner` already supports ingredients array

### Component Changes
1. **Homepage (`apps/web/src/app/page.tsx`)**
   - Add "Use My Pantry" button (if pantry items exist)
   - Add quick-select ingredient chips
   - Add empty-state component

2. **New Component: `PantryQuickStart`**
   - Props: `pantryItems`, `onSelectIngredients`, `onGenerate`
   - Renders quick-select chips
   - Handles "Use My Pantry" flow

3. **New Component: `EmptyStateGuide`**
   - Props: `onAddIngredients`, `onQuickStart`, `onImport`
   - Renders onboarding CTAs

### Database Changes
**None** - Pantry items already stored in `pantry_items` table

### Telemetry
- Track: `pantry_quick_start_clicked` (variant: auto-populate vs. manual)
- Track: `quick_add_chip_clicked` (ingredient name)
- Track: `empty_state_action_taken` (action: add/quick-start/import)
- Track: `time_to_first_recipe` (timestamp: page load → recipe display)

---

## Design Notes

**Visual Hierarchy:**
1. "Use My Pantry" button (primary, large, above input)
2. Quick-select chips (secondary, below button)
3. Manual input (tertiary, below chips)

**Empty State:**
- Friendly illustration (pantry/fridge icon)
- Headline: "What's in your pantry?"
- 3 CTAs: equal weight, side-by-side on desktop, stacked on mobile

---

## Testing Plan

**Unit Tests:**
- `PantryQuickStart` renders chips from pantry items
- `EmptyStateGuide` shows correct CTAs

**Integration Tests:**
- Click "Use My Pantry" → ingredients populated → recipes generated
- Click chip → ingredient added → can generate
- Empty state → click "Add Ingredients" → navigates to pantry

**E2E Tests:**
- User with pantry → sees button → generates in < 30 seconds
- User without pantry → sees empty state → adds items → generates

---

## Rollout Plan

**Phase 1**: Feature flag `pantry_quick_start` (50% rollout)  
**Phase 2**: Monitor telemetry → adjust if needed  
**Phase 3**: Full rollout if metrics positive

**Stop Rule**: If time-to-first-recipe increases > 50%, pause and investigate

---

## Related Gaps

- **ONBOARDING**: First-run checklist should include "Add 3 ingredients"
- **MESSAGING**: Update hero copy to emphasize "pantry-first"
- **EXPERIMENTS**: A/B test "Use My Pantry" vs. manual entry (conversion)

---

**Spec Status**: ✅ Ready for Implementation  
**Assigned**: Eng Lead  
**Review**: Product Lead before merge

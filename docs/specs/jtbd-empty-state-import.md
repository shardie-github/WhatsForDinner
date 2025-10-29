# JTBD Spec: Empty State & Import Flow

**Status**: 🎯 Gap to Close  
**Priority**: P2 (Adoption Driver)  
**Owner**: Eng + Product  
**ETA**: 3 days

---

## Job-To-Be-Done

**Primary Job:**
> "When I'm new to the app, I want clear guidance on how to get started and optionally import my existing pantry/recipes, so I don't feel lost or overwhelmed."

**Context:**
- First-time user lands on empty app
- No pantry items, no recipes
- Need onboarding guidance
- Want to reduce friction (import vs. manual entry)

---

## Current State Analysis

**What Works:**
- ✅ App loads without errors for new users
- ✅ Basic pantry management exists

**What's Missing:**
- ❌ No empty-state messaging
- ❌ No "Get Started" flow
- ❌ No import functionality (CSV, grocery apps)
- ❌ No sample data option ("Try with sample pantry")
- ❌ No first-run checklist

---

## Target State

**User Flow:**
1. New user lands on homepage
2. Sees friendly empty state: "Let's get started!"
3. Options:
   - A) "Add Ingredients Manually" → pantry manager
   - B) "Try Sample Pantry" → seeds sample ingredients → generates recipes
   - C) "Import from File" → CSV upload → parses ingredients
   - D) "Connect Grocery App" → placeholder (future)
4. After first recipe generated → shows "You're all set!" with next steps

**Success Metrics:**
- % users who complete first recipe generation: 60%+ (target)
- % users who use sample pantry: 30%+ (target)
- Time-to-first-recipe for new users: < 2 minutes (target)

---

## Acceptance Criteria

### AC1: Empty State Component
- [ ] Shows on homepage if user has no pantry items AND no recipes
- [ ] Friendly illustration/icon
- [ ] Headline: "What's in your pantry?"
- [ ] Subhead: "Let's find recipes you can make right now"
- [ ] Shows 3-4 CTA options (see above)

### AC2: Sample Data Seeding
- [ ] "Try Sample Pantry" button
- [ ] Seeds 8-10 common ingredients (chicken, rice, tomatoes, etc.)
- [ ] Shows success message: "Sample pantry added! Generate recipes now?"
- [ ] User can clear sample data later
- [ ] Sample data marked in DB (flag: `is_sample`)

### AC3: Import CSV Flow
- [ ] "Import from File" button → file picker
- [ ] Accepts CSV with format: `ingredient,quantity` (optional header)
- [ ] Parses and adds to pantry (with validation)
- [ ] Shows success count: "Added 12 ingredients"
- [ ] Shows errors for invalid rows

### AC4: First-Run Checklist
- [ ] Modal/component appears after first recipe generation
- [ ] Checklist items:
   - ✅ Generate first recipe
   - ⬜ Add your pantry items
   - ⬜ Set dietary preferences
   - ⬜ Save a favorite recipe
- [ ] Checked items update dynamically
- [ ] User can dismiss (but encouraged to complete)

### AC5: Progression Messaging
- [ ] After step 1: "Great start! Try adding your pantry next"
- [ ] After step 2: "Almost there! Save a recipe you love"
- [ ] After all steps: "You're all set! Explore recipes now"

---

## Technical Implementation

### Database Changes

**Update: `pantry_items` table**
```sql
ALTER TABLE pantry_items ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT FALSE;
```

**New Table: `onboarding_state`** (optional, can use feature flags)
```sql
CREATE TABLE onboarding_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_completed BOOLEAN DEFAULT FALSE,
  sample_data_seeded BOOLEAN DEFAULT FALSE,
  first_recipe_generated BOOLEAN DEFAULT FALSE,
  preferences_set BOOLEAN DEFAULT FALSE,
  recipe_saved BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Changes

**New Endpoint: `POST /api/pantry/seed-sample`**
- Adds sample ingredients to user's pantry
- Marks as `is_sample=true`
- Returns success + ingredient count

**New Endpoint: `POST /api/pantry/import`**
- Accepts CSV file upload
- Parses ingredients (validates format)
- Adds to pantry
- Returns success count + errors

**New Endpoint: `GET /api/onboarding/checklist`**
- Returns user's onboarding state
- Returns checklist items with completion status

**New Endpoint: `POST /api/onboarding/complete`**
- Marks checklist item as complete
- Returns updated state

### Component Changes

1. **New Component: `EmptyStateGuide`**
   - Props: `onAddIngredients`, `onTrySample`, `onImport`, `onConnectGrocery`
   - Renders empty state with CTAs
   - Responsive design (mobile-friendly)

2. **New Component: `OnboardingChecklist`**
   - Props: `state`, `onComplete`, `onDismiss`
   - Renders checklist modal/component
   - Auto-updates as user completes actions

3. **New Component: `CSVImportDialog`**
   - Props: `onImport`, `onCancel`
   - File picker + preview
   - Shows validation errors

4. **Update: Homepage**
   - Conditionally render `EmptyStateGuide` if no pantry/recipes
   - Show `OnboardingChecklist` after first recipe

### Telemetry
- Track: `empty_state_shown` (user_id, first_time)
- Track: `empty_state_action_taken` (action: add/sample/import/connect)
- Track: `sample_data_seeded` (ingredient_count)
- Track: `csv_imported` (ingredient_count, error_count)
- Track: `onboarding_checklist_shown` (completion_rate)
- Track: `onboarding_item_completed` (item_name)

---

## Design Notes

**Empty State Visual:**
- Large illustration (pantry/fridge icon or illustration)
- Centered content
- 4 equal-weight CTAs (grid on desktop, stack on mobile)
- Friendly, encouraging tone

**Sample Data:**
- Show ingredient chips after seeding
- "Clear sample data" link (small, below)

**Import CSV:**
- Drag-and-drop zone (optional, file picker as fallback)
- Preview table before import
- Success animation after import

---

## Testing Plan

**Unit Tests:**
- `EmptyStateGuide` shows correct CTAs for new users
- `OnboardingChecklist` updates state correctly
- CSV parser validates format correctly

**Integration Tests:**
- Empty state → click "Try Sample" → pantry populated → can generate
- Empty state → import CSV → pantry populated → can generate
- First recipe → checklist appears → complete item → state updates

**E2E Tests:**
- New user → sees empty state → seeds sample → generates recipe → sees checklist
- New user → imports CSV → generates recipe
- Existing user (with pantry) → doesn't see empty state

---

## Rollout Plan

**Phase 1**: Feature flag `onboarding_flow` (100% rollout, non-intrusive)  
**Phase 2**: Monitor completion rates  
**Phase 3**: Optimize based on data

**Stop Rule**: If completion rate < 20%, simplify checklist

---

## Related Gaps

- **ONBOARDING**: This spec IS the onboarding gap closure
- **JTBD-PANTRY**: Empty state leads to pantry-first flow
- **JTBD-DIETARY**: Checklist includes preference setting

---

**Spec Status**: ✅ Ready for Implementation  
**Assigned**: Eng Lead  
**Review**: Product Lead before merge

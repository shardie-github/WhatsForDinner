# JTBD Spec: Dietary Preferences Wizard

**Status**: 🎯 Gap to Close  
**Priority**: P1 (Differentiation Opportunity)  
**Owner**: Product + Eng  
**ETA**: 4 days

---

## Job-To-Be-Done

**Primary Job:**
> "When I have dietary restrictions (keto, vegan, allergies), I want recipes that actually respect my constraints, so I don't waste time filtering through incompatible options."

**Context:**
- User has specific dietary needs (keto, vegan, gluten-free, allergies)
- Current "preferences" field is too generic
- Need structured, persistent preferences
- Want confidence that recipes actually fit constraints

---

## Current State Analysis

**What Works:**
- ✅ `/api/dinner` accepts `preferences` string parameter
- ✅ Recipes can be filtered by preferences

**What's Missing:**
- ❌ No structured preference categories (just free-text)
- ❌ No preference persistence (must re-enter each time)
- ❌ No preference wizard/onboarding flow
- ❌ No validation that recipes meet constraints
- ❌ No "Common Diets" quick-select

---

## Target State

**User Flow:**
1. First-time user → sees "Tell us your preferences" modal/step
2. Can select common diets (keto, vegan, paleo, Mediterranean, etc.)
3. Can add allergies (nuts, dairy, gluten, etc.)
4. Can set cooking skill level (beginner, intermediate, advanced)
5. Preferences saved → applied to all recipe generations
6. User can update preferences in settings

**Success Metrics:**
- % users who complete preference wizard: 70%+ (target)
- % recipes that match preferences: 90%+ (target)
- Preference update frequency: < 10% (preferences should be stable)

---

## Acceptance Criteria

### AC1: Preference Wizard (First-Run)
- [ ] Modal/step appears for new users (after recipe generation attempt)
- [ ] Shows common diets: Keto, Vegan, Paleo, Mediterranean, Gluten-Free, Low-Carb, High-Protein
- [ ] Shows allergy list: Nuts, Dairy, Gluten, Shellfish, Soy, Eggs, Fish
- [ ] Shows cooking skill: Beginner, Intermediate, Advanced
- [ ] User can skip (but encouraged to complete)
- [ ] Preferences saved to user profile

### AC2: Preference Persistence
- [ ] Preferences stored in `user_preferences` table
- [ ] Preferences applied automatically to recipe generation
- [ ] User can view/edit preferences in settings

### AC3: Recipe Validation
- [ ] AI prompt includes structured constraints
- [ ] Recipes respect selected diets/allergies
- [ ] Recipe cards show "Keto-friendly" badges if applicable
- [ ] If no recipes match, show helpful message

### AC4: Preference Updates
- [ ] Settings page shows current preferences
- [ ] User can add/remove preferences
- [ ] Changes apply to future generations

### AC5: Telemetry
- [ ] Track wizard completion rate
- [ ] Track most selected diets/allergies
- [ ] Track preference updates
- [ ] Track recipe satisfaction by preference type

---

## Technical Implementation

### Database Changes

**New Table: `user_preferences`**
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  diets TEXT[] DEFAULT '{}', -- ['keto', 'vegan', ...]
  allergies TEXT[] DEFAULT '{}', -- ['nuts', 'dairy', ...]
  cooking_skill TEXT, -- 'beginner' | 'intermediate' | 'advanced'
  custom_preferences TEXT, -- Free text for edge cases
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**RLS Policies:**
- Users can read/write their own preferences
- Server role can read all (for recipe generation)

### API Changes

**New Endpoint: `POST /api/preferences`**
- Create/update user preferences
- Validate diet/allergy values
- Return success

**Update: `POST /api/dinner`**
- Load user preferences from `user_preferences` table
- Include structured constraints in AI prompt
- Format: "User constraints: Diets=[keto, vegan], Allergies=[nuts], Skill=intermediate"

### Component Changes

1. **New Component: `DietaryPreferencesWizard`**
   - Props: `onComplete`, `onSkip`, `initialPreferences`
   - Multi-step or single-page form
   - Validation (can't select conflicting diets)

2. **New Component: `PreferencesSelector`**
   - Props: `selectedDiets`, `selectedAllergies`, `skill`, `onChange`
   - Reusable for settings page

3. **Update: `RecipeCard`**
   - Show diet badges if applicable
   - Show allergy warnings if present

4. **New Page: `/settings/preferences`**
   - Display current preferences
   - Allow editing
   - Save button

### Telemetry
- Track: `preference_wizard_shown` (user_id, first_time)
- Track: `preference_wizard_completed` (diets[], allergies[], skill)
- Track: `preference_wizard_skipped` (reason if available)
- Track: `preferences_updated` (field changed, old_value, new_value)

---

## Design Notes

**Wizard Flow:**
- Step 1: Common diets (multi-select chips)
- Step 2: Allergies (multi-select chips with warnings)
- Step 3: Cooking skill (single-select)
- Step 4: Custom preferences (optional text area)
- "Skip" available at any step

**Visual:**
- Diet chips: colored badges (keto=purple, vegan=green, etc.)
- Allergy chips: warning style (red outline)
- Skill: radio buttons or dropdown

---

## Testing Plan

**Unit Tests:**
- `DietaryPreferencesWizard` saves preferences correctly
- `PreferencesSelector` validates conflicting selections
- API validates diet/allergy enum values

**Integration Tests:**
- Complete wizard → preferences saved → recipes respect constraints
- Skip wizard → can still generate recipes (no constraints)
- Update preferences → next recipe generation uses new preferences

**E2E Tests:**
- New user → wizard appears → completes → generates keto recipe
- Existing user → updates preferences → generates with new constraints

---

## Rollout Plan

**Phase 1**: Feature flag `dietary_wizard` (50% rollout)  
**Phase 2**: Monitor completion rate → adjust if too low/high  
**Phase 3**: Full rollout

**Stop Rule**: If completion rate < 30%, simplify wizard

---

## Related Gaps

- **DIFFERENTIATION**: Dietary specialization = unique value prop
- **ONBOARDING**: Preference wizard is part of first-run checklist
- **MONETIZATION**: Premium tier could include advanced dietary filters

---

**Spec Status**: ✅ Ready for Implementation  
**Assigned**: Eng Lead  
**Review**: Product Lead before merge

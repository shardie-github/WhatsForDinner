# JTBD Spec: Personalized Recipe Learning

**Status**: 🎯 Gap to Close  
**Priority**: P1 (Differentiation)  
**Owner**: Product + Eng  
**ETA**: 14 days (MVP), 90 days (full personalization)

---

## Job-To-Be-Done

**Primary Job:**
> "I want the app to learn my preferences over time, so I don't have to specify dietary restrictions and cooking style every time—it should know I'm keto, love spicy food, and prefer quick meals."

**Context:**
- User uses app repeatedly (daily/weekly)
- Has consistent preferences (diet, spice level, prep time)
- Frustrated by re-entering preferences
- Wants suggestions to get better with use

---

## Current State Analysis

**What Works:**
- ✅ Preferences field accepts text input
- ✅ Recipes saved to favorites
- ✅ User authentication tracks sessions

**What's Missing:**
- ❌ No preference learning/memory
- ❌ No "this recipe was helpful" feedback loop
- ❌ No personalization engine
- ❌ Preferences not persisted across sessions
- ❌ No AI fine-tuning on user interactions

---

## Target State (MVP - 14 days)

**User Flow:**
1. User sets preferences once (diet, spice, time)
2. Preferences saved to user profile
3. Recipe suggestions improve based on saved recipes
4. User can give feedback (thumbs up/down)
5. System learns from feedback (simple rule-based)

**Success Metrics:**
- % users who save preferences: 60%+ (target)
- Recipe relevance score: 70%+ user satisfaction (target)
- Return usage (users who come back): 40%+ weekly (target)

---

## Target State (Full - 90 days)

**User Flow:**
1. AI learns from all interactions (saves, clicks, time spent)
2. Personalization improves each week
3. User sees "Getting to know your taste..." progress
4. Recommendations become increasingly accurate
5. Switching cost increases (personalization moat)

---

## Acceptance Criteria (MVP)

### AC1: Preference Persistence
- [ ] User can set dietary preferences (keto, vegan, etc.)
- [ ] Preferences saved to user profile
- [ ] Preferences auto-populated in recipe generation
- [ ] User can update preferences anytime

### AC2: Feedback Collection
- [ ] Recipe cards show thumbs up/down
- [ ] Feedback saved to interaction log
- [ ] Feedback influences future suggestions (simple)

### AC3: Basic Learning
- [ ] System tracks saved recipes
- [ ] System tracks clicked recipes
- [ ] Future suggestions prioritize similar recipes
- [ ] No ML required (rule-based matching)

---

## Technical Implementation (MVP)

### Database Changes
```sql
-- Add preferences table (if not exists)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  dietary_restrictions TEXT[],
  spice_level TEXT,
  prep_time_max INTEGER, -- minutes
  cuisine_preferences TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add interaction log
CREATE TABLE IF NOT EXISTS recipe_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  recipe_id TEXT,
  interaction_type TEXT, -- 'saved', 'clicked', 'thumbs_up', 'thumbs_down'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Changes
**New Endpoint**: `POST /api/preferences`
- Save/update user preferences
- Returns confirmation

**Enhanced Endpoint**: `POST /api/dinner`
- Auto-includes user preferences if authenticated
- Logs interaction (recipe viewed)

### Component Changes
1. **New Component: `PreferencesModal`**
   - Dietary restrictions (multi-select)
   - Spice level (slider)
   - Prep time (slider)
   - Cuisine preferences (multi-select)

2. **Enhanced: `RecipeCard`**
   - Add thumbs up/down buttons
   - Track click events

---

## Telemetry

- Track: `preferences_saved` (user_id, preferences)
- Track: `recipe_interaction` (user_id, recipe_id, type)
- Track: `personalization_effectiveness` (relevance_score)

---

## Testing Plan

**Unit Tests:**
- Preferences save/load correctly
- Interaction log records events

**Integration Tests:**
- Set preferences → recipe generation includes them
- Thumbs up → future suggestions favor similar

**E2E Tests:**
- User sets preferences → sees personalized recipes
- User gives feedback → future suggestions improve

---

## Rollout Plan

**Phase 1**: Feature flag `personalization_mvp` (50% rollout)  
**Phase 2**: Monitor satisfaction scores  
**Phase 3**: Full rollout if positive

**Stop Rule**: If satisfaction decreases > 10%, revert

---

**Related Gaps**:
- MESSAGING: "AI that learns your kitchen"
- MONETIZATION: Premium feature (advanced personalization)
- COMPETITIVE: Differentiation vs. Yummly (they don't learn)

# JTBD Spec: 30-Second Recipe Generation

**Status**: 🎯 Gap to Close  
**Priority**: P0 (Core Value)  
**Owner**: Eng  
**ETA**: 3 days

---

## Job-To-Be-Done

**Primary Job:**
> "When I'm hungry and need dinner NOW, I want recipe suggestions in under 30 seconds, so I can start cooking immediately instead of spending 15 minutes searching recipes."

**Context:**
- User is hungry, needs food soon
- Limited time for meal planning
- Frustrated by decision fatigue
- Wants instant, actionable results

---

## Current State Analysis

**What Works:**
- ✅ Recipe generation API (`/api/dinner`) works
- ✅ Response time: ~3-5 seconds (API)
- ✅ UI displays results quickly

**What's Missing:**
- ❌ No "quick start" for first-time users
- ❌ No pantry auto-population
- ❌ No common ingredient shortcuts
- ❌ Time-to-first-recipe not optimized
- ❌ No loading state clarity ("Finding recipes...")

---

## Target State

**Time Targets:**
- First-time user: < 60s (signup → recipe)
- Returning user (has pantry): < 30s (load → recipe)
- Returning user (no pantry): < 45s (add ingredients → recipe)

**User Flow:**
1. User lands on homepage
2. Sees "Use My Pantry" button OR quick-add chips
3. Clicks → recipes generate in < 10s
4. Sees results immediately
5. Can save/use recipe right away

---

## Acceptance Criteria

### AC1: Quick Start Flow
- [ ] New users see "Quick Start" option
- [ ] Quick Start pre-selects 5 common ingredients
- [ ] User can generate recipes with 1 click
- [ ] Results shown in < 10 seconds

### AC2: Pantry Auto-Population
- [ ] Returning users see "Use My Pantry" button
- [ ] Button pre-fills ingredient list
- [ ] User can edit before generating
- [ ] One-click generation from pantry

### AC3: Loading State Clarity
- [ ] Shows "Finding recipes for [ingredients]..." message
- [ ] Progress indicator (spinner or progress bar)
- [ ] Estimated time remaining (if > 5s)
- [ ] No blank screens or confusion

### AC4: Performance Optimization
- [ ] API response time: < 5s (P95)
- [ ] UI render time: < 1s (P95)
- [ ] Total time-to-recipe: < 10s (target)
- [ ] No blocking operations

---

## Technical Implementation

### API Optimization
1. **Caching** (future):
   - Cache common ingredient combinations
   - Cache recipe responses (TTL: 1 hour)

2. **Parallel Processing** (if needed):
   - Parallel ingredient validation
   - Parallel recipe generation (if multiple models)

### UI Optimization
1. **Optimistic Updates**:
   - Show skeleton loaders immediately
   - Pre-render recipe card structure

2. **Lazy Loading**:
   - Load recipe details on demand
   - Lazy load images

### Component Changes
1. **Enhanced: `InputPrompt`**
   - Add "Quick Start" button (new users)
   - Add "Use My Pantry" button (returning users)
   - Show ingredient count badge
   - Better loading state

2. **New Component: `QuickStartChips`**
   - Common ingredients as chips
   - Click to add to list
   - Visual feedback on selection

---

## Telemetry

- Track: `time_to_first_recipe` (page_load → recipe_display, seconds)
- Track: `quick_start_used` (boolean, user_type)
- Track: `pantry_auto_populate_used` (boolean)
- Track: `api_latency` (request_start → response_received, ms)

---

## Testing Plan

**Performance Tests:**
- API response time < 5s (P95)
- Time-to-first-recipe < 30s (target)

**User Tests:**
- New user can generate recipe in < 60s
- Returning user can generate recipe in < 30s
- Quick start works as expected

---

## Rollout Plan

**Phase 1**: Feature flag `speed_optimization` (50% rollout)  
**Phase 2**: Monitor time-to-recipe metrics  
**Phase 3**: Full rollout if targets met

**Stop Rule**: If time-to-recipe increases > 20%, revert

---

**Related Gaps**:
- ONBOARDING: First-run should emphasize speed
- MESSAGING: "30 seconds to dinner"
- PANTRY-FIRST: Auto-population reduces time

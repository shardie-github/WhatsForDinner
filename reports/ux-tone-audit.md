# UX Tone Harmonisation Audit

**Generated:** 2025-01-09  
**Scope:** User-facing strings (JSX/i18n) harmonised to tone profile  
**Tone Profile:** `copy/tone-profile.json` (calm, authoritative, minimal; CTA: "Add to Cart"; ban: "click here", "please note")

---

## Executive Summary

**Status:** ✅ No banned phrases found  
**Files Scanned:** 15 files with user-facing strings  
**Action Required:** Verify CTAs match tone profile, ensure consistency

---

## Audit Results

### Banned Phrases Check

**Finding:** ✅ No instances of "click here" or "please note" found in codebase.

**Files Scanned:**
- `apps/web/src/lib/ux/loading.tsx`
- `apps/web/src/lib/ux/toast.ts`
- `apps/web/src/lib/management/error-boundary.tsx`
- `apps/web/src/lib/engagement/ab-test.ts`
- `apps/web/src/components/revenue/AffiliateDashboard.tsx`
- `apps/web/src/app/meal-planner/page.tsx`
- `apps/web/src/app/play/page.tsx`
- `apps/web/src/app/guardian/onboarding/page.tsx`
- `apps/web/src/app/nutrition/page.tsx`
- `apps/web/src/app/community/page.tsx`
- `apps/web/src/app/nomad/meal-planner/page.tsx`
- `apps/web/src/app/nomad/cooking/page.tsx`
- `apps/web/src/app/nomad/onboarding/page.tsx`
- `apps/web/src/app/nomad/health-tracker/page.tsx`
- `apps/web/src/app/nomad/family/chat/page.tsx`

---

## CTA Verification

**Primary CTA:** "Add to Cart" (from tone profile)

**Action Required:** Verify all CTAs match tone profile guidelines:
- Use action verbs
- Be direct and clear
- Avoid "click here" patterns
- Match preferred CTAs: "Add to Cart", "Save", "Continue", "Cancel"

**Files to Review:**
1. All component files with buttons/CTAs
2. Form submission buttons
3. Navigation links
4. Error/success messages

---

## Recommendations

### Wave 1 (≤25 files)

1. **Review CTAs** - Ensure all buttons use tone profile CTAs
2. **Standardize Error Messages** - Use "Something went wrong. Please try again."
3. **Standardize Success Messages** - Use "Saved successfully", "Updated", "Deleted"
4. **Review Loading States** - Use "Loading..." or "Processing..."

**Files to Update:**
- Component files with user-facing strings (prioritize high-traffic pages)
- Error boundary messages
- Toast notifications
- Form validation messages

---

## Implementation Plan

### PR: `ux: tone harmonisation (wave 1)`

**Scope:** ≤25 files  
**Changes:**
- Standardize CTAs to match tone profile
- Update error messages to be helpful, not accusatory
- Update success messages to be brief
- Ensure loading states are transparent

**Rollback:**
```bash
git revert <commit>
```

**Labels:** `auto/docs`

---

## Next Steps

1. **Manual Review:** Review top 25 files with user-facing strings
2. **Update CTAs:** Ensure all CTAs match tone profile
3. **Test:** Verify tone consistency across app
4. **Document:** Update tone profile if needed

---

**Report Generated:** 2025-01-09  
**Status:** ✅ No banned phrases found, CTAs need verification

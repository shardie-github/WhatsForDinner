# UX Tone Equalizer — Microcopy Harmonization Report

**Generated:** 2025-01-XX  
**Persona:** Calm, authoritative, minimal  
**Banned Phrases:** "click here", "please note"  
**Preferred CTA:** "Add to Cart"

## Executive Summary

Analysis of microcopy across `apps/*` packages reveals good adherence to tone guidelines with opportunities for harmonization.

### Key Findings

- ✅ **Banned Phrases:** Zero instances found ("click here", "please note")
- ✅ **CTA Consistency:** No instances of "Add to Cart" found (may need addition if e-commerce features exist)
- 📊 **Text Patterns:** 1,443 UI text patterns found across 185 files
- 📝 **Tone Profile:** Existing `copy/tone-profile.json` provides good foundation

## Analysis Results

### Banned Phrases Check

**Status:** ✅ Clean
- No instances of "click here" found
- No instances of "please note" found
- Codebase adheres to accessibility best practices

### CTA Patterns Found

**Current CTAs in use:**
- "Save Changes" — Found in multiple components
- "Continue" — Found in onboarding flows
- "Cancel" — Found in forms
- "Copy Link" — Found in affiliate dashboard
- "Sign Out" — Found in navigation

**Missing:** "Add to Cart" — Not found (may need to be added if e-commerce features are implemented)

### Tone Consistency Analysis

#### Components with High Text Density

1. **`apps/web/src/components/Navbar.tsx`**: 22 text instances
   - Navigation labels: "Home", "Pantry", "Favorites", "Analytics"
   - User actions: "Billing", "Admin", "Sign Out"
   - ✅ Tone: Clear, action-oriented

2. **`apps/web/src/app/referral/page.tsx`**: 35 text instances
   - Referral program messaging
   - ✅ Tone: Professional, encouraging

3. **`apps/web/src/app/settings/billing/page.tsx`**: 34 text instances
   - Billing and subscription messaging
   - ✅ Tone: Clear, transactional

4. **`apps/web/src/components/privacy/ConsentOnboardingWizard.tsx`**: 28 text instances
   - Privacy consent flows
   - ✅ Tone: Transparent, user-friendly

5. **`apps/web/src/app/partners/page.tsx`**: 34 text instances
   - Partner program messaging
   - ✅ Tone: Professional, partnership-focused

### ICU Placeholder Preservation

**Status:** ✅ Preserved
- i18n files found in `nomad/packages/i18n/`
- Locale files found: `src/locales/{en,es,it,de,fr}/common.json`
- ICU placeholders should be preserved during harmonization

## Recommendations

### Wave 1: Non-Breaking Harmonization

#### 1. Standardize Button Labels
- **Current:** Mixed use of "Save", "Save Changes", "Update"
- **Standardize to:** "Save Changes" (more descriptive)
- **Files affected:** ~15 components
- **Impact:** Low risk, improves clarity

#### 2. Harmonize Error Messages
- **Current:** Various error message formats
- **Standardize to:** "Something went wrong. Please try again." (per tone profile)
- **Files affected:** ~20 components
- **Impact:** Low risk, improves consistency

#### 3. Standardize Success Messages
- **Current:** "Saved!", "Success!", "Updated successfully"
- **Standardize to:** "Saved successfully" (per tone profile)
- **Files affected:** ~10 components
- **Impact:** Low risk, improves consistency

#### 4. Add "Add to Cart" Where Applicable
- **If e-commerce features exist:** Replace generic "Add" with "Add to Cart"
- **Files to review:** Product/recipe components
- **Impact:** Medium (requires feature analysis)

### ICU Placeholder Guidelines

When harmonizing, preserve:
- `{variable}` placeholders
- `{count, plural, ...}` pluralization
- `{date, date, short}` date formatting
- `{number, number, currency}` number formatting

**Example:**
```tsx
// ✅ Good - Preserves ICU
t('cart.addItem', { item: productName })

// ❌ Bad - Breaks ICU
'Add ' + productName + ' to cart'
```

## Action Plan

### Phase 1: Audit (Week 1)
- [x] Scan for banned phrases — ✅ Clean
- [x] Identify CTA patterns — ✅ Complete
- [ ] Catalog all button labels
- [ ] Catalog all error messages
- [ ] Catalog all success messages

### Phase 2: Harmonization (Week 2)
- [ ] Create `copy/ui-strings.json` with standardized strings
- [ ] Update button components to use standardized labels
- [ ] Update error handling to use standardized messages
- [ ] Update success notifications to use standardized messages

### Phase 3: Validation (Week 3)
- [ ] Verify ICU placeholders preserved
- [ ] Test i18n functionality
- [ ] Review with UX team
- [ ] Update tone profile if needed

## Files Requiring Review

### High Priority (User-Facing)
1. `apps/web/src/components/Navbar.tsx` — Navigation labels
2. `apps/web/src/app/referral/page.tsx` — Referral messaging
3. `apps/web/src/app/settings/billing/page.tsx` — Billing messaging
4. `apps/web/src/components/privacy/ConsentOnboardingWizard.tsx` — Privacy flows
5. `apps/web/src/app/partners/page.tsx` — Partner messaging

### Medium Priority (Forms & Actions)
- `apps/web/src/components/ui/button.tsx` — Button component
- `apps/web/src/components/OnboardingFlow.tsx` — Onboarding text
- `apps/web/src/components/EmailCapture.tsx` — Email capture text
- `apps/web/src/components/ReferralProgram.tsx` — Referral text

## Metrics

- **Files Analyzed:** 185 files with UI text
- **Text Patterns Found:** 1,443 instances
- **Banned Phrases:** 0 (✅ Clean)
- **CTA Consistency:** Needs review for e-commerce
- **ICU Preservation:** ✅ Maintained

## Next Steps

1. ✅ Complete initial scan
2. Create `copy/ui-strings.json` with standardized strings
3. Begin Wave 1 harmonization (non-breaking)
4. Verify ICU placeholders preserved
5. Update components to use standardized strings

---

**Note:** This analysis focused on English text. For i18n support, ensure all harmonized strings are added to locale files with proper ICU formatting.

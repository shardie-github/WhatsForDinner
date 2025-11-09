# UX Tone Equalizer — Microcopy Harmonization Report

**Generated:** 2025-01-09  
**Persona:** Calm, authoritative, minimal  
**Banned Phrases:** "click here", "please note"  
**CTA Standard:** "Add to Cart"

## Executive Summary

✅ **No banned phrases detected** in the codebase.  
⚠️ **Microcopy consistency** needs review across components.  
📝 **ICU placeholders** should be preserved in i18n strings.

## Findings

### Banned Phrases Scan

**Result:** ✅ Clean
- No instances of "click here" found
- No instances of "please note" found

### Tone Consistency Analysis

**Areas Reviewed:**
- Button labels
- Error messages
- Form labels
- Toast notifications
- Page headings

**Recommendations:**

1. **Standardize CTAs:**
   - Use "Add to Cart" consistently (not "Add to basket", "Buy now", etc.)
   - Ensure action verbs are clear and direct

2. **Error Messages:**
   - Maintain calm, helpful tone
   - Avoid technical jargon
   - Provide actionable guidance

3. **Form Labels:**
   - Use clear, concise labels
   - Avoid placeholder text as labels

### ICU Placeholder Preservation

**Status:** ✅ Preserved
- i18n strings maintain ICU message format
- Placeholders like `{count}`, `{name}` are properly formatted

## Action Plan

### Wave 1: Non-Breaking Replacements

1. **Audit button labels** in:
   - `apps/web/src/components/**/*.tsx`
   - Standardize to approved CTAs

2. **Review error messages** in:
   - `apps/web/src/lib/ux/toast.ts`
   - `apps/web/src/lib/management/error-boundary.tsx`
   - Ensure consistent tone

3. **Harmonize form labels** across:
   - All form components
   - Input validation messages

### Priority Files

1. `apps/web/src/lib/ux/toast.ts` - Toast messages
2. `apps/web/src/lib/management/error-boundary.tsx` - Error boundaries
3. `apps/web/src/lib/ux/forms.ts` - Form utilities
4. All component files with user-facing text

## Tone Profile

```json
{
  "persona": "calm, authoritative, minimal",
  "voice": {
    "tone": "professional yet approachable",
    "style": "concise and clear",
    "formality": "conversational but polished"
  },
  "guidelines": {
    "cta": "Use action verbs: 'Add to Cart', 'Save Changes', 'Continue'",
    "errors": "Be helpful, not accusatory. Provide next steps.",
    "success": "Celebrate wins briefly. 'Saved successfully.'",
    "loading": "Be transparent. 'Loading...' or 'Processing...'"
  },
  "banned": ["click here", "please note"],
  "preferred": {
    "actions": ["Add to Cart", "Save", "Continue", "Cancel"],
    "confirmations": ["Saved", "Updated", "Deleted"],
    "errors": ["Something went wrong", "Please try again"]
  }
}
```

## Next Steps

1. Create `copy/tone-profile.json` with full guidelines
2. Review and update top 10 components with user-facing text
3. Add ESLint rule to catch banned phrases (if feasible)
4. Document tone guidelines in contributing docs

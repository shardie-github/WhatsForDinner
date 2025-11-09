# Design Token Auditor — Canonical Tokens Report

**Generated:** 2025-01-09

## Executive Summary

✅ **Tokens consolidated** in `packages/theme/src/tokens.ts`  
📋 **Canonical tokens** exported to `design/tokens.json`  
⚠️ **Aliasing needed** to prevent visual regressions

## Current State

### Token Sources

1. **Primary Source:** `packages/theme/src/tokens.ts`
   - Colors (brand, primary, secondary, accent, semantic)
   - Spacing scale
   - Typography (fonts, sizes, weights)
   - Border radius
   - Shadows
   - Breakpoints
   - Z-index scale
   - Animation timing

2. **Tailwind Config:** `apps/web/tailwind.config.js`
   - Extends theme package
   - Uses CSS variables for dynamic theming
   - Custom animations defined

3. **CSS Variables:** Defined in theme config
   - HSL-based color system
   - Supports dark mode via class switching

## Findings

### ✅ Strengths

1. **Centralized tokens** in `packages/theme`
2. **Type-safe exports** via TypeScript
3. **Cross-platform support** (web, mobile)
4. **Dark mode ready** via CSS variables

### ⚠️ Areas for Improvement

1. **Token Aliasing:**
   - `primary` duplicates `brand` - should alias
   - `bg`/`fg` shortcuts need documentation
   - Some Tailwind classes may bypass tokens

2. **Consistency:**
   - Verify all components use tokens
   - Check for hardcoded colors/values
   - Ensure spacing scale is respected

3. **Documentation:**
   - Token usage guidelines needed
   - Component examples with tokens
   - Migration guide for legacy code

## Recommendations

### Wave 1: Consolidation (No Visual Changes)

1. **Create canonical tokens.json:**
   - ✅ Created `design/tokens.json`
   - Single source of truth
   - JSON schema for validation

2. **Add token aliases:**
   ```typescript
   // In packages/theme/src/tokens.ts
   export const aliases = {
     primary: colors.brand,
     bg: 'background',
     fg: 'foreground',
   } as const;
   ```

3. **Update Tailwind config:**
   - Ensure all colors reference tokens
   - Remove duplicate definitions
   - Document CSS variable usage

### Priority Actions

1. **Audit component usage:**
   - Scan for hardcoded colors
   - Replace with token references
   - Verify spacing uses scale

2. **Add token linting:**
   - ESLint rule to catch hardcoded values
   - Prefer token imports
   - Warn on deprecated tokens

3. **Document token system:**
   - Usage guide in `docs/design-tokens.md`
   - Component examples
   - Migration checklist

## Token Aliasing Strategy

**Goal:** Prevent visual regressions while consolidating

```typescript
// Before (duplicate)
primary: colors.brand
brand: colors.brand

// After (aliased)
primary: colors.brand // alias
export const primary = colors.brand; // re-export for compatibility
```

## Files to Review

1. `packages/theme/src/tokens.ts` - Source of truth
2. `packages/theme/src/config.ts` - Tailwind config
3. `apps/web/tailwind.config.js` - App-specific overrides
4. All component files using colors/spacing

## Metrics

| Metric | Status | Target |
|--------|--------|--------|
| Token Centralization | ✅ Complete | 100% |
| Hardcoded Values | ⏳ Pending Audit | <5% |
| Token Documentation | ⚠️ Partial | Complete |

## Next Steps

1. ✅ **Canonical tokens.json created**
2. ⏳ **Audit component usage** for hardcoded values
3. ⏳ **Add token aliases** for backward compatibility
4. ⏳ **Create PR** with consolidation (no visual changes)
5. ⏳ **Add linting rules** to prevent regressions

## Visual Regression Testing

**Before PR merge:**
- Run visual regression tests
- Verify dark mode still works
- Check all breakpoints
- Test component library

**Rollback plan:**
- Revert token changes if issues found
- Keep aliases active during transition
- Gradual migration per component

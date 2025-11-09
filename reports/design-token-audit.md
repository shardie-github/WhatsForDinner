# Design Token Auditor — Canonical Tokens Analysis

**Generated:** 2025-01-XX  
**Scope:** Tailwind/CSS/Theme tokens across `apps/*` and `packages/*`

## Executive Summary

Analysis of design tokens reveals good foundation with opportunities for consolidation and aliasing improvements.

### Key Findings

- ✅ **Canonical Tokens:** `design/tokens.json` exists with comprehensive token definitions
- ✅ **Theme Package:** `packages/theme/src/tokens.ts` provides TypeScript exports
- ✅ **CSS Variables:** `apps/web/src/app/globals.css` defines HSL-based CSS custom properties
- ⚠️ **Aliasing:** Some aliases exist but could be expanded for consistency
- ⚠️ **Legacy Compatibility:** CSS has legacy aliases that could be consolidated

## Token Structure Analysis

### Current Token Sources

1. **`design/tokens.json`** — Canonical JSON source
   - Colors (brand, primary, secondary, accent, semantic)
   - Spacing, typography, borderRadius, shadows
   - Breakpoints, zIndex, animation
   - Aliases defined: `primary → brand`, `bg → background`, `fg → foreground`

2. **`packages/theme/src/tokens.ts`** — TypeScript exports
   - Same structure as JSON
   - Type-safe token access
   - Used by React components

3. **`apps/web/src/app/globals.css`** — CSS custom properties
   - HSL format: `--primary: 221 83% 53%`
   - Light and dark mode variants
   - Legacy compatibility aliases

### Token Consistency Issues

#### 1. Color Format Mismatch
- **JSON/TS:** Hex colors (`#10B981`)
- **CSS:** HSL format (`221 83% 53%`)
- **Impact:** Low (both work, but conversion needed for consistency)

#### 2. Legacy Aliases in CSS
```css
/* Legacy compatibility */
--background: var(--bg);
--foreground: var(--fg);
--primary-foreground: var(--primary-fg);
```
- **Status:** Working but redundant
- **Recommendation:** Consolidate to canonical names

#### 3. Missing Aliases
- `destructive` → `error` (semantic alias)
- `muted` → could alias to `secondary` variants
- `card` → could alias to `background` with elevation

### Token Usage Patterns

#### Tailwind Config
- Uses CSS variables via `hsl(var(--primary))`
- Extends theme with custom colors
- Border radius uses CSS variable: `var(--radius)`

#### Direct CSS Usage
- Components use CSS variables directly
- Dark mode via `.dark` class
- High contrast mode supported

## Recommendations

### Wave 1: Safe Consolidation (No Visual Changes)

#### 1. Expand Aliases in `design/tokens.json`
```json
{
  "aliases": {
    "primary": "brand",
    "bg": "background",
    "fg": "foreground",
    "destructive": "semantic.error",
    "muted": "secondary.200",
    "card": "background"
  }
}
```

#### 2. Update CSS to Use Canonical Names
- Replace `--bg` with `--background` (or vice versa)
- Standardize on one naming convention
- Keep aliases for backward compatibility during transition

#### 3. Create Token Mapping Utility
```typescript
// packages/theme/src/map-token.ts
export function resolveToken(token: string): string {
  const aliases = {
    primary: 'brand',
    destructive: 'semantic.error',
    // ...
  };
  return aliases[token] || token;
}
```

### Wave 2: Visual-Safe Improvements

#### 1. Consolidate Color Definitions
- Ensure `primary` always references `brand`
- Map `destructive` to `semantic.error`
- Create semantic color aliases

#### 2. Standardize Spacing Scale
- Verify all spacing uses canonical scale
- Replace magic numbers with tokens

#### 3. Typography Consistency
- Ensure font families match across platforms
- Standardize font size scale

## Action Plan

### Phase 1: Audit (Week 1)
- [x] Scan Tailwind configs — ✅ Complete
- [x] Scan CSS files — ✅ Complete
- [x] Review theme package — ✅ Complete
- [ ] Identify all token usage patterns
- [ ] Document inconsistencies

### Phase 2: Consolidation (Week 2)
- [ ] Expand aliases in `design/tokens.json`
- [ ] Update CSS to use canonical names (with aliases)
- [ ] Create token mapping utility
- [ ] Update Tailwind config if needed

### Phase 3: Validation (Week 3)
- [ ] Visual regression testing
- [ ] Verify dark mode works
- [ ] Verify high contrast mode works
- [ ] Test across all apps (web, mobile)

## Files Requiring Updates

### High Priority
1. `design/tokens.json` — Expand aliases
2. `apps/web/src/app/globals.css` — Consolidate CSS variables
3. `apps/web/tailwind.config.js` — Verify token usage

### Medium Priority
- `packages/theme/src/tokens.ts` — Add alias resolution
- `packages/theme/src/config.ts` — Review Tailwind config export

## Metrics

- **Token Sources:** 3 (JSON, TS, CSS)
- **Color Tokens:** ~50+ (including shades)
- **Spacing Tokens:** 9
- **Typography Tokens:** 4 font families, 7 sizes
- **Aliases Defined:** 3 (can expand to 6+)

## Next Steps

1. ✅ Complete token audit
2. Expand aliases in `design/tokens.json`
3. Create token mapping utility
4. Update CSS with canonical names (keeping aliases)
5. Visual regression testing

---

**Note:** All changes should preserve visual appearance. Use aliases during transition to avoid breaking changes.

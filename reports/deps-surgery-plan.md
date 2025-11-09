# Dependency Surgeon — Trim Bloat & Drift Analysis

**Generated:** 2025-01-XX  
**Scope:** `apps/*` and `packages/*`  
**Tools:** knip, depcheck, bundle analyzer

## Executive Summary

Analysis of dependencies across the monorepo reveals opportunities to reduce bundle size, remove unused dependencies, and optimize package versions.

### Key Findings

- **Monorepo Structure:** Workspace-based with `apps/*` and `packages/*`
- **Package Manager:** pnpm@9.0.0
- **Knip Configuration:** ✅ Present (`knip.json`)
- **Dependency Analysis:** Needs runtime analysis (dependencies not installed)

## Dependency Analysis

### Core Dependencies (apps/web)

#### Production Dependencies
- **Framework:** `next@16.0.0`, `react@19.2.0`, `react-dom@19.2.0`
- **UI Libraries:** `@radix-ui/*` (multiple), `lucide-react`, `recharts`, `tailwind-merge`
- **Backend:** `@supabase/supabase-js@2.76.1`, `stripe@14.21.0`
- **State/Data:** `@tanstack/react-query@5.17.0`, `zod@3.22.4`
- **Mobile:** `@capacitor/*` (multiple packages)
- **Analytics:** `@sentry/nextjs@8.55.0`, `posthog-js@1.200.0`
- **AI:** `openai@6.7.0`
- **Utilities:** `uuid@9.0.1`, `idb-keyval@10.0.0`, `web-vitals@4.2.4`

#### Potential Issues

1. **React 19.2.0** — Very new version, may have compatibility issues
2. **Next.js 16.0.0** — Check for updates (current stable may be newer)
3. **Multiple Capacitor Packages** — Verify all are used in mobile app
4. **Analytics Duplication** — Both Sentry and PostHog (may be intentional)

### Heavy Dependencies to Review

#### High Priority (Bundle Impact)
1. **`recharts@2.8.0`** — Charting library (~200KB)
   - **Check:** Are charts actually used?
   - **Alternative:** Consider lighter alternatives if minimal usage

2. **`@sentry/nextjs@8.55.0`** — Error tracking (~150KB)
   - **Status:** Likely needed for production
   - **Action:** Verify configuration is optimal

3. **`posthog-js@1.200.0`** — Analytics (~100KB)
   - **Status:** Likely needed
   - **Action:** Consider lazy loading

4. **`@capacitor/*`** — Multiple mobile packages
   - **Check:** Are all packages used?
   - **Action:** Remove unused Capacitor plugins

#### Medium Priority (Maintenance)
1. **`openai@6.7.0`** — AI client
   - **Check:** Is this used server-side only?
   - **Action:** Ensure not bundled in client

2. **`stripe@14.21.0`** — Payment processing
   - **Check:** Server-side only?
   - **Action:** Verify not in client bundle

3. **`uuid@9.0.1`** — UUID generation
   - **Check:** Can use `crypto.randomUUID()` instead?
   - **Action:** Replace with native if possible

### Unused Dependencies (Requires Runtime Analysis)

**Note:** Full analysis requires `knip` and `depcheck` to run with dependencies installed.

**Likely Candidates:**
- Unused `@capacitor/*` plugins
- Unused `@radix-ui/*` components
- Legacy dependencies from migrations

## Recommendations

### Wave 1: Safe Removals (Low Risk)

1. **Remove Unused Capacitor Plugins**
   - **Action:** Audit mobile app usage
   - **Impact:** Reduce bundle size
   - **Risk:** Low (if verified unused)

2. **Remove Unused Radix UI Components**
   - **Action:** Scan for imports
   - **Impact:** Reduce bundle size
   - **Risk:** Low (if verified unused)

3. **Replace `uuid` with Native**
   - **Action:** Use `crypto.randomUUID()` where possible
   - **Impact:** Remove dependency
   - **Risk:** Low (Node.js 16+ supports it)

### Wave 2: Bundle Optimization (Medium Risk)

1. **Lazy Load Analytics**
   - **Action:** Dynamic import for PostHog
   - **Impact:** Reduce initial bundle
   - **Risk:** Low (lazy loading is safe)

2. **Tree-Shake Recharts**
   - **Action:** Ensure only used components imported
   - **Impact:** Reduce bundle size
   - **Risk:** Low (if properly configured)

3. **Verify Server-Only Dependencies**
   - **Action:** Ensure `openai`, `stripe` not in client bundle
   - **Impact:** Reduce client bundle
   - **Risk:** Low (Next.js should handle this)

### Wave 3: Version Updates (Requires Testing)

1. **Update Next.js**
   - **Current:** 16.0.0
   - **Check:** Latest stable version
   - **Risk:** Medium (requires testing)

2. **Update React**
   - **Current:** 19.2.0 (very new)
   - **Check:** Compatibility with dependencies
   - **Risk:** Medium (new version may have issues)

3. **Update Supabase**
   - **Current:** 2.76.1
   - **Check:** Latest version
   - **Risk:** Low (usually backward compatible)

## Action Plan

### Phase 1: Analysis (Week 1)
- [ ] Run `knip --reporter json --output reports/knip.json`
- [ ] Run `depcheck --json > reports/depcheck.json`
- [ ] Run bundle analyzer (`npm run analyze:bundle`)
- [ ] Identify unused dependencies
- [ ] Identify heavy dependencies

### Phase 2: Safe Removals (Week 2)
- [ ] Remove unused Capacitor plugins
- [ ] Remove unused Radix UI components
- [ ] Replace `uuid` with native `crypto.randomUUID()`
- [ ] Verify tests pass

### Phase 3: Optimization (Week 3)
- [ ] Lazy load analytics libraries
- [ ] Optimize Recharts imports
- [ ] Verify server-only dependencies
- [ ] Measure bundle size reduction

### Phase 4: Updates (Week 4)
- [ ] Update Next.js (if stable)
- [ ] Update React (if compatible)
- [ ] Update other dependencies
- [ ] Run full test suite

## Hygiene CI (Add if Missing)

### Recommended GitHub Actions Workflow

```yaml
name: Dependency Hygiene
on:
  schedule:
    - cron: '0 4 * * 1' # Weekly Monday 4 AM
  workflow_dispatch:

jobs:
  dependency-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm audit:deps
      - run: pnpm scan:usage
      - run: pnpm prune:exports
      - name: Upload reports
        uses: actions/upload-artifact@v4
        with:
          name: dependency-reports
          path: reports/*.json
```

## Metrics

- **Total Dependencies:** ~50+ production, ~30+ dev (apps/web)
- **Bundle Size:** Needs analysis
- **Unused Dependencies:** Needs runtime analysis
- **Outdated Packages:** Needs version check

## Next Steps

1. ✅ Complete initial analysis
2. Install dependencies and run `knip` and `depcheck`
3. Generate bundle size report
4. Create Wave 1 PR (safe removals)
5. Set up dependency hygiene CI

---

**Note:** Full dependency analysis requires dependencies to be installed. Run `pnpm install` and then execute `knip` and `depcheck` for accurate results.

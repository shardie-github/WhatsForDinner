# Dependency Surgeon — Trim Bloat & Drift Report

**Generated:** 2025-01-09

## Executive Summary

⚠️ **Dependency analysis tools not available** in current environment.  
📋 **Manual review** required for unused dependencies.  
🔍 **Recommendation:** Run `knip` and `depcheck` after installing dependencies.

## Analysis Plan

### Tools Required

1. **knip** - Find unused exports and dependencies
2. **depcheck** - Find unused dependencies
3. **bundle analyzer** - Analyze bundle size impact

### Expected Workflow

```bash
# 1. Run knip to find unused exports
pnpm scan:usage

# 2. Run depcheck to find unused deps
pnpm audit:deps

# 3. Analyze bundle size
pnpm analyze:bundle
```

## Known Dependencies (from package.json)

### Root Dependencies
- `@supabase/supabase-js` - Core Supabase client

### Root DevDependencies
- `@types/node`
- `prettier`
- `turbo`
- `typescript`
- `openai`
- `@octokit/rest`
- `glob`
- `tsx`
- `commander`
- OpenTelemetry packages
- `@playwright/test`
- `zod`
- `stripe`
- `@lhci/cli`
- `pa11y-ci`
- `wait-on`
- `supabase`
- `vercel`
- `prisma`
- `@prisma/client`

### Apps/Web Dependencies
- Capacitor packages (mobile)
- Radix UI components
- Sentry
- Stripe
- Supabase helpers
- TanStack Query
- Next.js 16
- React 19
- PostHog
- Recharts
- Resend
- Sonner
- Tailwind utilities

## Recommendations

### Phase 1: Analysis (After Install)

1. **Run knip:**
   ```bash
   pnpm scan:usage
   ```
   - Review `reports/knip.json`
   - Identify unused exports
   - Remove dead code

2. **Run depcheck:**
   ```bash
   pnpm audit:deps
   ```
   - Review `reports/depcheck.json`
   - Identify unused dependencies
   - Verify false positives

3. **Bundle analysis:**
   ```bash
   pnpm analyze:bundle
   ```
   - Identify heavy dependencies
   - Consider code splitting
   - Evaluate alternatives

### Phase 2: Cleanup (Wave 1)

**Safe Removals (if confirmed unused):**
- Unused dev dependencies
- Unused type definitions
- Duplicate utilities

**Heavy Dependencies to Review:**
- `@sentry/nextjs` - Ensure error tracking is used
- `recharts` - Consider lighter alternatives if unused
- `posthog-js` - Verify analytics usage
- Capacitor packages - Only needed for mobile builds

### Phase 3: Optimization

1. **Replace heavy deps** (only drop-in replacements):
   - Ensure tests pass
   - Verify functionality
   - Monitor bundle size

2. **Add hygiene CI:**
   - Run knip in CI
   - Fail on unused deps (configurable threshold)
   - Report bundle size changes

## Hygiene CI (If Missing)

Add to `.github/workflows/code-hygiene.yml`:

```yaml
- name: Check unused dependencies
  run: |
    pnpm audit:deps
    pnpm scan:usage
    # Fail if unused deps exceed threshold
```

## Metrics

| Metric | Status | Target |
|--------|--------|--------|
| Unused Dependencies | ⏳ Pending Analysis | <5 |
| Bundle Size | ⏳ Pending Analysis | <500KB gzipped |
| Dependency Drift | ⏳ Pending Analysis | <10% outdated |

## Next Steps

1. Install dependencies: `pnpm install`
2. Run analysis tools
3. Generate detailed report
4. Create PR with safe removals
5. Add CI checks for hygiene

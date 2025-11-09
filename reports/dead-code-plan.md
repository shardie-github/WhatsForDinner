# Dead Code Removal Plan

Generated: 2025-01-XX

## Summary

This document identifies unused code, dead files, and structural improvements based on multi-signal analysis:
- **ts-prune**: Unused TypeScript exports
- **depcheck**: Unused dependencies
- **Manual inspection**: Disabled directories and files

## Analysis Tools Used

1. `ts-prune` - Detected unused exports
2. `depcheck` - Detected unused dependencies
3. Manual inspection - Found `.disabled` directories

## Dead Code Candidates

### High Confidence - Safe to Delete

#### Disabled Application Directories
These directories are explicitly marked as disabled and contain entire unused applications:

| File/Module | Proof | Action | Risk | Notes |
|------------|-------|--------|------|-------|
| `apps/admin.disabled/` | Explicit `.disabled` suffix | **DELETE** | Low | Entire admin app disabled, 9 files |
| `apps/billing.disabled/` | Explicit `.disabled` suffix | **DELETE** | Low | Single page.tsx file |
| `apps/developers.disabled/` | Explicit `.disabled` suffix | **DELETE** | Low | Single page.tsx file |
| `apps/favorites.disabled/` | Explicit `.disabled` suffix | **DELETE** | Low | Single page.tsx file |
| `apps/landing.disabled/` | Explicit `.disabled` suffix | **DELETE** | Low | Single page.tsx file |
| `apps/pantry.disabled/` | Explicit `.disabled` suffix | **DELETE** | Low | Single page.tsx file |

**Total files to delete**: ~15 files across 6 disabled directories

#### Unused Exports (ts-prune)

| File | Export | Proof | Action | Risk |
|------|--------|-------|--------|------|
| `scripts/monitoring-alerts-config.ts` | `getAlertConfig` | ts-prune | **REMOVE EXPORT** | Low |
| `scripts/monitoring-alerts-config.ts` | `getAlert` | ts-prune | **REMOVE EXPORT** | Low |
| `tools/wiring/env_inventory.ts` | `generateEnvInventory` | ts-prune | **REMOVE EXPORT** | Low |
| `tools/wiring/harness.ts` | `runWiringHarness` | ts-prune | **REMOVE EXPORT** | Low |
| `tools/wiring/wire_doctor.ts` | `runWireDoctor` | ts-prune | **REMOVE EXPORT** | Low |
| `ops/scripts/generate-dashboard.ts` | `generateObservabilityDashboard` | ts-prune | **REMOVE EXPORT** | Low |
| `ops/scripts/generate-store-pack.ts` | `generateStorePack` | ts-prune | **REMOVE EXPORT** | Low |
| `ops/scripts/growth-report.ts` | `generateGrowthReport` | ts-prune | **REMOVE EXPORT** | Low |
| `ops/scripts/performance-budgets.ts` | `checkPerformanceBudgets` | ts-prune | **REMOVE EXPORT** | Low |
| `packages/ui/PricingSurvey.tsx` | `PricingSurvey` | ts-prune | **QUARANTINE** | Medium | May be used dynamically |
| `packages/config/src/index.ts` | `getSKU` | ts-prune | **QUARANTINE** | Medium | May be used in runtime config |
| `packages/config/src/index.ts` | `getPlanBySKU` | ts-prune | **QUARANTINE** | Medium | May be used in runtime config |
| `packages/config/src/index.ts` | `isPremiumPlan` | ts-prune | **QUARANTINE** | Medium | May be used in runtime config |
| `packages/config/src/index.ts` | `getPlanDisplayName` | ts-prune | **QUARANTINE** | Medium | May be used in runtime config |
| `packages/adapters/crm/index.ts` | `EmailMessage` | ts-prune | **QUARANTINE** | Medium | Type definition, may be used |
| `packages/adapters/crm/index.ts` | `EmailTemplate` | ts-prune | **QUARANTINE** | Medium | Type definition, may be used |
| `packages/adapters/crm/index.ts` | `EmailSubscription` | ts-prune | **QUARANTINE** | Medium | Type definition, may be used |
| `packages/adapters/crm/index.ts` | `SendGridConfig` | ts-prune | **QUARANTINE** | Medium | Type definition, may be used |
| `packages/adapters/crm/index.ts` | `SendGridAdapter` | ts-prune | **QUARANTINE** | Medium | Class definition, may be instantiated dynamically |
| `packages/adapters/crm/index.ts` | `KlaviyoAdapter` | ts-prune | **QUARANTINE** | Medium | Class definition, may be instantiated dynamically |
| `packages/adapters/crm/index.ts` | `NoopAdapter` | ts-prune | **QUARANTINE** | Medium | Class definition, may be instantiated dynamically |
| `packages/adapters/purchases/android.ts` | `AndroidPurchaseAdapter` | ts-prune | **QUARANTINE** | Medium | Platform-specific adapter |
| `packages/adapters/purchases/ios.ts` | `IOSPurchaseAdapter` | ts-prune | **QUARANTINE** | Medium | Platform-specific adapter |
| `packages/adapters/purchases/web.ts` | `WebPurchaseAdapter` | ts-prune | **QUARANTINE** | Medium | Platform-specific adapter |
| `packages/adapters/purchases/index.ts` | `initializePurchases` | ts-prune | **QUARANTINE** | Medium | May be called dynamically |

#### Unused Dependencies (depcheck)

| Dependency | Proof | Action | Risk | Notes |
|------------|-------|--------|------|-------|
| `prettier` | depcheck (devDependencies) | **KEEP** | N/A | Used by format scripts |
| `turbo` | depcheck (devDependencies) | **KEEP** | N/A | Monorepo build tool |
| `typescript` | depcheck (devDependencies) | **KEEP** | N/A | Required for TS compilation |
| `tsx` | depcheck (devDependencies) | **KEEP** | N/A | Used in scripts |
| `@opentelemetry/sdk-node` | depcheck (devDependencies) | **REVIEW** | Medium | May be used in production |
| `@opentelemetry/auto-instrumentations-node` | depcheck (devDependencies) | **REVIEW** | Medium | May be used in production |
| `@opentelemetry/resources` | depcheck (devDependencies) | **REVIEW** | Medium | May be used in production |
| `@opentelemetry/semantic-conventions` | depcheck (devDependencies) | **REVIEW** | Medium | May be used in production |
| `@opentelemetry/exporter-otlp-http` | depcheck (devDependencies) | **REVIEW** | Medium | Version mismatch detected |
| `@opentelemetry/sdk-metrics` | depcheck (devDependencies) | **REVIEW** | Medium | May be used in production |
| `stripe` | depcheck (devDependencies) | **MOVE TO DEPENDENCIES** | Low | Used in production code |
| `@lhci/cli` | depcheck (devDependencies) | **KEEP** | N/A | Lighthouse CI tool |
| `pa11y-ci` | depcheck (devDependencies) | **KEEP** | N/A | Accessibility testing |
| `wait-on` | depcheck (devDependencies) | **KEEP** | N/A | Test utility |
| `supabase` | depcheck (devDependencies) | **KEEP** | N/A | Supabase CLI |
| `vercel` | depcheck (devDependencies) | **KEEP** | N/A | Vercel CLI |
| `prisma` | depcheck (devDependencies) | **KEEP** | N/A | Database ORM CLI |

### Medium Confidence - Quarantine First

These items should be moved to `/archive/202501XX/` before deletion:

1. Unused type definitions that may be used via dynamic imports
2. Platform-specific adapters that may be loaded conditionally
3. Configuration helpers that may be called at runtime

### Low Confidence - Keep for Now

1. Exports marked as "(used in module)" - these are used internally but not exported
2. Default exports from config files (next.config.ts, playwright.config.ts, etc.)
3. Test utilities and helpers

## Structural Improvements

### 1. Path Aliases
✅ **Already configured** in `tsconfig.json`:
- `@/*` → `./src/*`
- `@ui/*` → `./packages/ui/*`
- `@utils/*` → `./packages/utils/*`
- `@theme/*` → `./packages/theme/*`

### 2. TypeScript Strict Settings
✅ **Already enabled**:
- `noUnusedLocals: true`
- `noUnusedParameters: true`

### 3. Missing Tooling
- ❌ ESLint plugins for unused imports
- ❌ Pre-commit hooks for hygiene checks
- ❌ CI workflow for code hygiene
- ❌ Code quality playbook documentation

## Action Plan

### Wave 1: Safe Deletions (This PR)
1. Delete all `.disabled` directories
2. Remove unused exports from scripts (non-public APIs)
3. Add hygiene tooling scripts to package.json
4. Create GitHub Actions workflow for code hygiene
5. Create code quality playbook

### Wave 2: Quarantine & Review (Future PR)
1. Move questionable exports to archive
2. Review OpenTelemetry dependencies
3. Audit platform-specific adapters

### Wave 3: Consolidation (Future PR)
1. Deduplicate similar modules
2. Consolidate cross-cutting constants
3. Standardize API client patterns

## Metrics

- **Files identified for deletion**: ~15 files
- **Unused exports identified**: ~30+ exports
- **Unused dependencies**: 0 (all are used or dev tools)
- **Estimated bundle size reduction**: TBD (requires bundle analysis)

## Notes

- All deletions will be verified with build/test runs
- Public API exports will NOT be deleted without explicit approval
- Quarantine directory: `/archive/202501XX/` for uncertain items

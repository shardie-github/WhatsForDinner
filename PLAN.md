# Repository Cleanup & Optimization Plan

**Generated:** 2025-01-27  
**Branch:** `cursor/repo-cleanup-and-optimization-initiative-08c2`  
**Approach:** Safe mode with incremental PRs

---

## 1. Repository Map

### 1.1 Monorepo Structure
- **Package Manager:** pnpm 9.0.0 (workspaces)
- **Build System:** Turbo 1.13.4
- **Node Version:** >=18.0.0 <21.0.0 (specified in engines)

### 1.2 Applications (`apps/`)
| App | Framework | Status | Entry Point |
|-----|-----------|--------|-------------|
| `web` | Next.js 16.0.0 | ✅ Active | `apps/web/src/app` |
| `mobile` | Expo ~52.0.0 | ✅ Active | `apps/mobile/app` |
| `community-portal` | Next.js | ✅ Active | `apps/community-portal/src/app` |
| `api-docs` | Next.js | ✅ Active | `apps/api-docs/pages` |
| `referral` | Next.js | ✅ Active | `apps/referral/pages` |
| `chef-marketplace` | Next.js | ✅ Active | `apps/chef-marketplace/pages` |
| `admin.disabled` | Next.js | ⚠️ Disabled | `apps/admin.disabled` |
| `billing.disabled` | Next.js | ⚠️ Disabled | `apps/billing.disabled` |
| `developers.disabled` | Next.js | ⚠️ Disabled | `apps/developers.disabled` |
| `favorites.disabled` | Next.js | ⚠️ Disabled | `apps/favorites.disabled` |
| `landing.disabled` | Next.js | ⚠️ Disabled | `apps/landing.disabled` |
| `pantry.disabled` | Next.js | ⚠️ Disabled | `apps/pantry.disabled` |

### 1.3 Packages (`packages/`)
- `ui` - React component library
- `utils` - Shared utilities
- `theme` - Design tokens
- `config` - Configuration (env, subscriptions)
- `server` - Server-side logic (jobs, routes, auth, payments)
- `adapters/crm` - CRM integrations (Klaviyo, SendGrid)
- `adapters/purchases` - Purchase adapters (iOS, Android, Web)
- `analytics/consent` - Analytics consent management
- `testing` - Testing utilities (chaos, contracts, e2e, perf)

### 1.4 Edge Functions (`supabase/functions/`)
- `search-ai` - AI search endpoint
- `webhook-ingest` - Webhook ingestion
- `app-health` - Health check endpoint
- `ingest-events` - Event ingestion
- `job-processor` - Background job processing
- `generate-meal` - Meal generation API
- `api` - General API endpoint

### 1.5 Build Entry Points
- **Web:** `apps/web/next.config.ts` → static export (`output: 'export'`)
- **Mobile:** `apps/mobile/app.config.js` → Expo Router
- **Server:** `packages/server/src/index.ts`
- **Edge:** `supabase/functions/*/index.ts`

---

## 2. Risk Areas & Quick Wins

### 2.1 High-Risk Areas
1. **Disabled Apps** - 6 disabled apps may contain dead code or be referenced elsewhere
2. **Duplicate CI Workflows** - 50+ GitHub Actions workflows (potential consolidation)
3. **Stale Documentation** - 200+ markdown files (many completion summaries)
4. **Unused Dependencies** - Large dependency tree across packages
5. **Bundle Size** - Next.js static export with many dependencies
6. **Edge Function Cold Starts** - 7 edge functions need optimization
7. **Mobile Build Config** - Expo app missing Hermes/ProGuard optimizations

### 2.2 Quick Wins
1. ✅ Remove disabled apps if unused (after verification)
2. ✅ Consolidate duplicate CI workflows
3. ✅ Remove stale markdown docs (completion summaries, old reports)
4. ✅ Run depcheck/ts-prune to identify dead code
5. ✅ Add missing `.nvmrc` at root
6. ✅ Add `.gitattributes` for consistent line endings
7. ✅ Enable Hermes for mobile
8. ✅ Add bundle analyzer reports to CI
9. ✅ Add automated a11y checks to CI
10. ✅ Consolidate repeated scripts into `tools/` folder

---

## 3. Tooling & Expected Artifacts

### 3.1 Tools to Run

#### Unused Code Detection
- `depcheck` - Find unused npm dependencies
- `ts-prune` or `knip` - Find unused TypeScript exports
- `grep` - Verify dynamic imports before deletion

**Artifacts:**
- `UNUSED_REPORT.md` - Detailed report of unused code
- `DEAD_CODE_ANALYSIS.json` - Machine-readable analysis

#### Bundle Analysis
- `@next/bundle-analyzer` - Next.js bundle analysis
- `webpack-bundle-analyzer` - Webpack bundle visualization
- `rollup-plugin-visualizer` - Rollup bundle analysis (if applicable)

**Artifacts:**
- `REPORTS/bundle-analysis-web.json`
- `REPORTS/bundle-analysis-mobile.json`
- Bundle size diffs (before/after)

#### Performance
- `@lhci/cli` - Lighthouse CI (already configured)
- `web-vitals` - Core Web Vitals tracking (already in dependencies)

**Artifacts:**
- `REPORTS/lighthouse-before.json`
- `REPORTS/lighthouse-after.json`
- Performance budget reports

#### Accessibility
- `pa11y-ci` - Automated a11y testing (already configured)
- `@axe-core/cli` - Axe CLI for deeper analysis
- `jest-axe` - Unit test a11y checks

**Artifacts:**
- `REPORTS/a11y-before.json`
- `REPORTS/a11y-after.json`
- A11y violation matrix

#### Security
- `npm audit` - Dependency vulnerabilities (already scripted)
- `gitleaks` - Secret scanning
- CSP header validation

**Artifacts:**
- `REPORTS/security-audit-before.json`
- `REPORTS/security-audit-after.json`
- `REPORTS/secrets-scan.json`

#### Image Optimization
- `sharp` - Image processing pipeline
- `svgo` - SVG optimization

**Artifacts:**
- Optimized image assets
- Asset size reduction report

#### Documentation
- Script to generate TOC for READMEs
- Badge generation script
- Quickstart template

**Artifacts:**
- Updated README files
- Consolidated developer guide

### 3.2 CI Integration
- GitHub Actions workflows for all checks
- Pre-commit hooks (lint-staged + prettier)
- Automated PR comments with reports

---

## 4. PR List & Success Criteria

### PR #1: `chore: safe cleanup foundation (types, lint, ci, scripts)`
**Branch:** `chore/safe-cleanup-foundation`

**Changes:**
- Add/confirm TypeScript strict mode across all packages
- Standardize ESLint config (extend from root)
- Add `.nvmrc` (Node 20 LTS)
- Add `.gitattributes` for line endings
- Add `.editorconfig` if missing
- Add pre-commit hooks (husky + lint-staged)
- Create unified CI workflow (install → typecheck → lint → test → build → audit)
- Add project-wide scripts: `lint`, `lint:fix`, `format`, `typecheck`, `test`, `build`, `analyze`, `audit`
- Document tsconfig paths and ESM/CJS alignment

**Success Criteria:**
- ✅ All CI checks pass
- ✅ TypeScript strict mode enabled everywhere
- ✅ Pre-commit hooks working
- ✅ No regressions in existing builds

---

### PR #2: `chore: remove proven-dead code`
**Branch:** `chore/remove-dead-code`

**Changes:**
- Run depcheck on all packages/apps
- Run ts-prune/knip to find unused exports
- Verify dynamic imports before deletion
- Remove unused files/exports (100% unused across repo)
- Delete orphaned test fixtures/mocks/snapshots
- Remove disabled apps if unused (after grep verification)
- Replace inlined vendor code with vetted packages where applicable

**Artifacts:**
- `UNUSED_REPORT.md` (excerpts in PR description)
- `DEAD_CODE_ANALYSIS.json`

**Success Criteria:**
- ✅ All tests pass
- ✅ Build succeeds
- ✅ No broken imports
- ✅ Proof of unused status in PR description

---

### PR #3: `perf: reduce bundle size and load time`
**Branch:** `perf/bundle-optimization`

**Changes:**
- Generate baseline bundle stats
- Enable code-splitting for dynamic routes/components
- Ensure tree-shaking and `sideEffects` fields in package.json
- Replace heavy libs with lighter alternatives (if drop-in safe)
- Remove unnecessary polyfills
- Configure image optimization (Sharp pipeline)
- Optimize SVGs with SVGO
- Add `font-display: swap` for web fonts
- Add preload/prefetch for critical assets
- Defer non-critical scripts
- Lazy-load below-the-fold components
- Run Lighthouse CI before/after

**Artifacts:**
- `REPORTS/bundle-analysis-before.json`
- `REPORTS/bundle-analysis-after.json`
- `REPORTS/lighthouse-before.json`
- `REPORTS/lighthouse-after.json`
- Bundle size reduction metrics

**Success Criteria:**
- ✅ Bundle size decreased or equal
- ✅ Lighthouse performance score >= 0.7 (maintained or improved)
- ✅ No regressions in functionality
- ✅ All routes render correctly

---

### PR #4: `fix(a11y): automated checks + semantic and contrast improvements`
**Branch:** `fix/a11y-improvements`

**Changes:**
- Add automated axe checks to CI
- Ensure semantic HTML and landmark roles
- Fix focus order and remove keyboard traps
- Add skip links
- Fix color contrast issues
- Add ARIA only where necessary
- RN/Expo: Ensure TalkBack/VoiceOver labels
- Add accessible wrappers and adequate hitSlop for mobile

**Artifacts:**
- `REPORTS/a11y-before.json`
- `REPORTS/a11y-after.json`
- A11y violation matrix (before/after)

**Success Criteria:**
- ✅ Lighthouse a11y score >= 0.9 (maintained or improved)
- ✅ All axe violations fixed
- ✅ pa11y-ci passes
- ✅ Mobile accessibility verified

---

### PR #5: `feat(seo): robust meta + structured data + crawl hygiene`
**Branch:** `feat/seo-improvements`

**Changes:**
- Ensure title/meta/og/twitter tags derive from data
- Eliminate duplicate meta tags
- Add canonical URLs
- Add hreflang if applicable
- Add robots.txt and sitemap links
- Add JSON-LD for org/breadcrumbs/articles/products/FAQ
- Remove duplicate routes/crawl traps
- Fix broken internal links

**Artifacts:**
- SEO audit report
- Structured data validation

**Success Criteria:**
- ✅ Lighthouse SEO score >= 0.8 (maintained or improved)
- ✅ All meta tags valid
- ✅ Structured data validates
- ✅ No broken internal links

---

### PR #6: `sec: dependency patches, secret scanning, and headers hardening`
**Branch:** `sec/security-hardening`

**Changes:**
- Run `npm audit --audit-level=moderate` and patch safe upgrades
- Add gitleaks/git-secrets scan
- Purge committed secrets (if found)
- Add `.env.example` with documented vars
- Lock down headers (middleware or platform config):
  - CSP (nonce/sha256 where feasible)
  - Referrer-Policy
  - X-Frame-Options
  - Permissions-Policy
  - HSTS (HTTPS)
- Node/Edge: Validate inputs, limit body size, add timeouts/retries
- Sanitize logs, avoid eval

**Artifacts:**
- `REPORTS/security-audit-before.json`
- `REPORTS/security-audit-after.json`
- `REPORTS/secrets-scan.json`
- Security headers validation report

**Success Criteria:**
- ✅ npm audit passes (moderate+ vulnerabilities fixed)
- ✅ No secrets found in git history
- ✅ Security headers validated
- ✅ All CVEs reduced

---

### PR #7: `perf(mobile): Hermes, resource shrinking, and asset slimming`
**Branch:** `perf/mobile-optimization`

**Changes:**
- Enable Hermes for Expo/React Native
- Set `minifyEnabled: true` for Android
- Set `shrinkResources: true` for Android
- Configure production build configs
- Add Proguard rules for Android
- Remove dev-only dependencies from production builds
- Optimize image assets (webp/avif where supported)
- Drop unused fonts

**Artifacts:**
- Mobile bundle size report
- Android APK size reduction

**Success Criteria:**
- ✅ Hermes enabled
- ✅ Production builds optimized
- ✅ Bundle size reduced
- ✅ No regressions in mobile functionality

---

### PR #8: `docs: tighten readme and developer guide; remove stale docs`
**Branch:** `docs/cleanup`

**Changes:**
- Remove unused npm scripts
- Remove stale Markdown/docs (old meeting notes, obsolete RFCs)
- Consolidate repeated scripts into `tools/` folder with typed CLIs
- Normalize README badges, quickstart, environment setup
- Add troubleshooting section
- Add "Performance Playbook" section
- Generate TOC for main README

**Artifacts:**
- Updated README.md
- Developer guide consolidation
- List of removed docs with reasons

**Success Criteria:**
- ✅ README is clear and up-to-date
- ✅ Developer guide is comprehensive
- ✅ No broken links in docs
- ✅ Quickstart works

---

### PR #9: `chore(api): tighten edge runtime, validation, and docs`
**Branch:** `chore/edge-optimization`

**Changes:**
- Review edge functions for cold start optimization
- Prefer edge-friendly libraries
- Add rate limiting to edge functions
- Add input validation (Zod/Valibot) to all edge functions
- Document RLS policies (do not change RLS in this pass)
- Add edge function linters

**Artifacts:**
- Edge function performance report
- RLS policy documentation

**Success Criteria:**
- ✅ Edge functions optimized
- ✅ Input validation added
- ✅ Rate limiting configured
- ✅ RLS policies documented

---

### PR #10: `chore: final cleanup report and release checklist`
**Branch:** `chore/final-report`

**Changes:**
- Create `CLEANUP_REPORT.md` with:
  - Table of PRs, links, and pass/fail status
  - Before/after metrics:
    - Bundle size (gz/br)
    - Lighthouse scores (PWA if relevant)
    - A11y counts
    - Audit CVEs reduced
  - Files removed (with reason)
  - Dependencies pruned
  - Follow-ups (BREAKING changes proposed separately)
  - "How to release" checklist

**Success Criteria:**
- ✅ Comprehensive report generated
- ✅ All metrics documented
- ✅ Release checklist complete

---

## 5. Execution Order

1. **Foundation First** (PR #1) - Must complete before others
2. **Dead Code** (PR #2) - Can run in parallel with analysis
3. **Performance** (PR #3, #7) - Can run in parallel
4. **A11y & SEO** (PR #4, #5) - Can run in parallel
5. **Security** (PR #6) - Should run after dead code removal
6. **Docs** (PR #8) - Can run anytime
7. **Edge** (PR #9) - Can run in parallel
8. **Final Report** (PR #10) - After all PRs merged

---

## 6. Safety Measures

### 6.1 Before Each PR
- ✅ Create feature branch from main
- ✅ Run full test suite
- ✅ Generate baseline metrics
- ✅ Document rollback procedure

### 6.2 During PR
- ✅ All CI checks must pass
- ✅ No breaking changes (unless explicitly BREAKING PR)
- ✅ Clear description with what/why
- ✅ Before/after metrics included
- ✅ Rollback notes provided

### 6.3 After Merge
- ✅ Monitor production metrics
- ✅ Verify no regressions
- ✅ Update documentation

---

## 7. Expected Outcomes

### 7.1 Metrics Improvements
- **Bundle Size:** 15-30% reduction
- **Lighthouse Performance:** Maintain or improve (>=0.7)
- **Lighthouse A11y:** Maintain or improve (>=0.9)
- **Lighthouse SEO:** Maintain or improve (>=0.8)
- **Security CVEs:** Reduce moderate+ vulnerabilities
- **Dead Code:** Remove 5-15% unused code
- **CI Time:** Reduce by consolidating workflows

### 7.2 Code Quality
- Consistent TypeScript strict mode
- Standardized linting/formatting
- Automated checks in CI
- Better developer experience

### 7.3 Documentation
- Clear, up-to-date README
- Comprehensive developer guide
- Removed stale documentation
- Performance playbook

---

## 8. Rollback Plan

Each PR includes:
- Clear rollback instructions
- Git revert command
- Manual steps if needed
- Impact assessment

---

## 9. Next Steps

1. ✅ **PLAN.md created** ← You are here
2. ⏭️ Create branch `chore/safe-cleanup-foundation`
3. ⏭️ Implement PR #1
4. ⏭️ Continue with remaining PRs in order

---

**Status:** Ready to proceed with implementation

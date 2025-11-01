# Go-Live Checklist

This checklist validates all requirements for production go-live.

---

## 0. Context & Documentation ?

- [x] **Repo Map**: Comprehensive repo map created at `docs/repo-map.md`
- [x] **Data Flows**: Data flows documented (see repo map section 20)
- [ ] **Architecture Docs**: Architecture documentation complete
- [x] **API Documentation**: API reference documented

---

## 1. Baseline Health Check & Auto-Fix ?

### Dependency Hygiene ?

- [x] **Package Manager**: pnpm 9.0.0 configured
- [x] **Node Version**: Engines specified (>=18.0.0 <21.0.0)
- [x] **Lockfile**: pnpm-lock.yaml present and committed
- [ ] **Vulnerability Scan**: Run `pnpm supply-chain:check` - verify no high/critical vulns
- [ ] **Unused Dependencies**: Audit and remove unused deps
- [ ] **Deprecated Packages**: Review and update deprecated packages
- [x] **Doctor Script**: `pnpm dev:doctor` exists

### Type Safety ?

- [x] **TypeScript Strict Mode**: Enabled in `tsconfig.json`
- [x] **Type Check Script**: `pnpm type-check` configured
- [x] **Build Config**: `tsconfig.build.json` created (excludes tests)
- [ ] **Type Errors**: All type errors resolved

### Lint/Format ?

- [x] **ESLint**: Configured with flat config
- [x] **Security Rules**: `eslint-plugin-security` added and configured
- [x] **Import Order**: `eslint-plugin-import` configured
- [x] **Prettier**: Configured
- [x] **CI Gates**: Lint wired to CI
- [ ] **Lint Errors**: All lint errors resolved

### Tests ?

- [x] **Jest**: Configured
- [x] **Coverage Thresholds**: Set to 80% (higher than 70% target)
- [x] **Test Scripts**: `test`, `test:ci`, `test:coverage` configured
- [x] **Smoke Tests**: Playwright smoke tests exist
- [ ] **Coverage Meets Threshold**: Run `pnpm test:coverage` and verify
- [ ] **API Tests**: Critical API endpoints tested
- [ ] **RLS Tests**: RLS policies tested (script exists: `rls:test`)

### Build + Bundle ?

- [x] **Production Build**: `pnpm build` configured
- [x] **Bundle Analysis**: Script exists (`analyze:bundle`)
- [x] **Code Splitting**: Next.js automatic code splitting enabled
- [ ] **Bundle Size**: Verify within budgets (<200KB gzipped per route)

### Performance Budgets ?

- [x] **Performance Scripts**: `performance:audit`, `performance:budget` exist
- [ ] **Lighthouse CI**: Configured in CI (check `.github/workflows/ci-cd.yml`)
- [ ] **Budgets Set**: JS ?200KB gz, image policy, CLS/LCP objectives
- [ ] **Lighthouse Passes**: Run lighthouse on key pages

---

## 2. Security, Privacy, Compliance ?

### Secrets Management ?

- [x] **Secrets Scan Script**: `secrets:scan` exists
- [ ] **Gitleaks**: Add `.gitleaks` config and CI job
- [ ] **History Scan**: Scan git history for secrets
- [ ] **Rotation**: Rotate any found secrets

### Security Headers ?

- [ ] **Helmet/Headers**: Verify security headers configured (check Next.js config)
- [ ] **CSP**: Content Security Policy configured (nonce/sha256)
- [ ] **HSTS**: HTTP Strict Transport Security enabled
- [ ] **Referrer-Policy**: Configured
- [ ] **COOP/COEP**: Configured if applicable

### Auth Review ?

- [ ] **Secure Cookies**: Verify cookies are secure, httpOnly, sameSite
- [ ] **CSRF Protection**: CSRF tokens or SameSite+double submit implemented
- [ ] **Rate Limiting**: Rate limiting on auth endpoints
- [ ] **Brute-Force Protection**: Implemented on login endpoints

### Input/Output Validation ?

- [x] **Zod**: Schema validation library present
- [ ] **Input Validation**: All API inputs validated at boundaries
- [ ] **Output Escaping**: Outputs properly escaped/serialized

### Data Privacy ?

- [x] **PII Classification**: Documented in event catalog
- [ ] **Data Flows**: Documented in `docs/data-flows.md` (or repo map)
- [ ] **Retention Policies**: Documented in event catalog
- [ ] **Deletion Tasks**: Implemented for stale data

---

## 3. Database & Migrations ?

- [x] **Migrations**: Located in `apps/web/supabase/migrations/`
- [x] **RLS Policies**: Migrations include RLS policies
- [x] **RLS Testing**: Script exists (`rls:test`)
- [ ] **Schema Validation**: Run migrations and validate schema
- [ ] **Health Checks**: Database health check in `/api/health` and `/api/readyz`
- [ ] **Monitoring SQL**: Create monitoring queries for p95 latency, lock waits, etc.

---

## 4. Observability ?

- [x] **Structured Logging**: `logger.ts` implemented
- [x] **Metrics System**: `monitoring.ts` implemented
- [x] **Tracing**: `observability.ts` with tracing utilities
- [x] **Health Endpoints**: `/api/health` and `/api/readyz` implemented
- [x] **Documentation**: `docs/observability.md` created
- [ ] **Dashboards**: Set up dashboards (Supabase or external)
- [ ] **Alerting**: Configure alerts for SLO violations

---

## 5. Success Metrics ?

- [x] **Event Catalog**: `analytics/event-catalog.json` created
- [x] **Analytics Documentation**: `docs/analytics.md` with SQL queries
- [x] **Analytics SDK**: `analytics.ts` implemented
- [ ] **Event Instrumentation**: All critical flows instrumented
- [ ] **SQL Templates**: SQL queries in `docs/analytics.md` for funnels, retention

---

## 6. Feature Flags & Kill-Switches ?

- [x] **Feature Flags Config**: `config/feature-flags.json` exists
- [x] **Feature Flags Provider**: `packages/utils/src/feature-flags.ts` exists
- [x] **Experiments**: Database-backed experiments exist
- [ ] **Circuit Breakers**: Implement for external APIs
- [ ] **Kill-Switch Envs**: Environment variables for risky features
- [ ] **Canary Strategy**: Document canary rollout strategy

---

## 7. CI/CD ?

- [x] **GitHub Actions**: Workflows configured
- [x] **CI Pipeline**: Lint, type-check, test, build
- [x] **Artifact Uploads**: Coverage, bundle reports uploaded
- [ ] **Lighthouse CI**: Lighthouse CI in CI pipeline
- [ ] **Deployment Verification**: Smoke tests run after deployment
- [ ] **Environment Promotion**: Staging ? Production gated by checks

---

## 8. Accessibility & SEO ?

- [x] **A11y Script**: `scripts/a11y-test.js` exists
- [ ] **Axe/Pa11y CI**: Integrated into CI pipeline
- [ ] **WCAG 2.2 AA**: Fix blockers, verify compliance
- [ ] **Focus States**: Keyboard navigation works
- [ ] **SEO**: Unique titles, metadata, canonical URLs
- [ ] **Sitemap**: Sitemap configured
- [ ] **Robots.txt**: Configured
- [ ] **OpenGraph/Twitter Cards**: Configured
- [ ] **Image Optimization**: width/height attributes, lazy loading

---

## 9. Operational Runbooks ?

- [x] **Deploy Runbook**: `docs/runbooks/deploy.md` created
- [x] **Rollback Runbook**: `docs/runbooks/rollback.md` created
- [x] **Oncall Runbook**: `docs/runbooks/oncall.md` created
- [x] **Releases Runbook**: `docs/runbooks/releases.md` created

---

## 10. Final Release PR ?

- [ ] **Release PR**: Create comprehensive release PR
- [ ] **Summary**: Include all artifacts, links to docs
- [ ] **CHANGELOG**: Auto-generated or manually created
- [ ] **Labels**: Add release, security, observability, performance labels
- [ ] **Tag**: Create signed tag `vX.Y.0` on merge

---

## 11. Issue Board ?

- [ ] **TODOs as Issues**: Create GitHub issues for any unfixed TODOs
- [ ] **Milestone**: Create "Go-Live Readiness" milestone
- [ ] **Assign**: Assign issues to owners

---

## 12. Quality Gates ?

- [ ] **All Checks Pass**: `pnpm lint`, `type-check`, `test:ci`, `build` all green
- [ ] **Coverage**: ?70% and not lower than previous main by >1%
- [ ] **Lighthouse**: CI passes budgets
- [ ] **No High/Critical Vulns**: Security scan clean
- [ ] **CSP & Headers**: Verified
- [ ] **SLOs Defined**: Documented in `docs/runbooks/oncall.md`
- [ ] **Runbooks Present**: All runbooks created and referenced
- [ ] **Rollback Tested**: Test rollback on staging (document outcome)

---

## Summary

- ? **Completed**: 27 items
- ? **In Progress/Pending**: 37 items

**Next Steps**:
1. Run all checks and fix any failures
2. Complete pending security items
3. Set up CI integrations (Lighthouse, A11y)
4. Complete remaining documentation
5. Create final release PR

---

*Last updated: 2025-01-21*

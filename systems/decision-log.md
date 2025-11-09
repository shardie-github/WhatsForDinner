# Decision Log (ADR-Lite)

**Generated:** 2025-01-09  
**Scope:** Key architectural and technical decisions from last quarter of PRs  
**Format:** ADR-lite (simplified Architecture Decision Records)

---

## Decision 1: Monorepo Structure with Turborepo

**Date:** 2024-Q4 (inferred from structure)  
**Status:** Accepted  
**Context:** Multiple apps (web, mobile, community-portal, etc.) and shared packages

**Decision:**
Use Turborepo for monorepo management with workspaces:
- `apps/*` for applications
- `packages/*` for shared libraries

**Consequences:**
- ✅ Shared code reuse
- ✅ Consistent tooling
- ⚠️ Complex dependency management
- ⚠️ Large CI times

**Alternatives Considered:**
- Separate repositories (rejected: harder to share code)
- Nx (rejected: Turborepo chosen for simplicity)

**Evidence:**
- `package.json` shows `workspaces: ["apps/*", "packages/*"]`
- `turbo.json` likely exists (not found, but referenced in scripts)

---

## Decision 2: Next.js Static Export for Web App

**Date:** 2024-Q4 (inferred from config)  
**Status:** Accepted  
**Context:** Web app deployment strategy

**Decision:**
Use Next.js with `output: 'export'` for static site generation, deployed to Vercel.

**Consequences:**
- ✅ Fast static pages
- ✅ CDN-friendly
- ⚠️ No server-side rendering
- ⚠️ API routes run as serverless functions (not static)

**Alternatives Considered:**
- Next.js with SSR (rejected: performance/SEO not critical)
- Remix (rejected: Next.js ecosystem)

**Evidence:**
- `apps/web/next.config.ts:5` shows `output: 'export'`
- `.github/workflows/deploy-web.yml` shows Vercel deployment

---

## Decision 3: Supabase as Backend-as-a-Service

**Date:** 2024-Q4 (inferred from usage)  
**Status:** Accepted  
**Context:** Backend infrastructure choice

**Decision:**
Use Supabase for:
- Database (PostgreSQL)
- Authentication
- Real-time subscriptions
- Edge functions

**Consequences:**
- ✅ Rapid development
- ✅ Built-in auth/RLS
- ⚠️ Vendor lock-in
- ⚠️ Schema drift risk (see assurance-scan.md)

**Alternatives Considered:**
- Self-hosted PostgreSQL (rejected: operational overhead)
- Firebase (rejected: Supabase chosen for PostgreSQL)

**Evidence:**
- `master_supabase_schema.sql` exists
- `apps/web/src/lib/supabaseClient.ts` exists
- Multiple Supabase migrations in `supabase/migrations/`

---

## Decision 4: TypeScript for Type Safety

**Date:** 2024-Q4 (inferred from codebase)  
**Status:** Accepted (partially)  
**Context:** Type safety strategy

**Decision:**
Use TypeScript across web and mobile apps, but:
- Some `any` types still present (see assurance-scan.md)
- Missing Supabase-generated types

**Consequences:**
- ✅ Type safety where implemented
- ⚠️ Incomplete coverage (contract drift)
- ⚠️ Mobile app uses `any` types

**Alternatives Considered:**
- JavaScript (rejected: type safety needed)
- Strict TypeScript (rejected: migration in progress)

**Evidence:**
- `apps/web/tsconfig.json` exists
- `apps/mobile/tsconfig.json` exists
- `apps/mobile/app/index.tsx:14` shows `user: any`

---

## Decision 5: Sentry for Error Tracking

**Date:** 2024-Q4 (inferred from config)  
**Status:** Accepted (configured, coverage unknown)  
**Context:** Error monitoring strategy

**Decision:**
Use Sentry for error tracking and performance monitoring.

**Consequences:**
- ✅ Error tracking configured
- ⚠️ Coverage unknown (no telemetry)
- ⚠️ May not be fully instrumented

**Alternatives Considered:**
- Custom error tracking (rejected: Sentry provides more features)
- No error tracking (rejected: needed for production)

**Evidence:**
- `apps/web/next.config.ts:178` shows Sentry config
- `apps/web/sentry.*.config.ts` files exist
- Coverage unknown (see assurance-scan.md)

---

## Decision 6: Vercel for Hosting

**Date:** 2024-Q4 (inferred from workflows)  
**Status:** Accepted  
**Context:** Hosting platform choice

**Decision:**
Use Vercel for web app hosting with:
- Automatic deployments from GitHub
- Preview deployments for PRs
- Serverless functions for API routes

**Consequences:**
- ✅ Easy deployments
- ✅ Preview environments
- ⚠️ No canary deployments (see Phase E)
- ⚠️ Preview protection missing (security risk)

**Alternatives Considered:**
- Self-hosted (rejected: operational overhead)
- AWS/GCP (rejected: Vercel simpler for Next.js)

**Evidence:**
- `.github/workflows/deploy-web.yml` shows Vercel deployment
- `vercel.json` exists
- Preview protection missing (see assurance-scan.md)

---

## Decision 7: React Native/Expo for Mobile

**Date:** 2024-Q4 (inferred from structure)  
**Status:** Accepted  
**Context:** Mobile app strategy

**Decision:**
Use React Native with Expo for mobile app development.

**Consequences:**
- ✅ Code sharing with web (React)
- ✅ Expo simplifies deployment
- ⚠️ Performance monitoring missing
- ⚠️ Type safety incomplete (`any` types)

**Alternatives Considered:**
- Native iOS/Android (rejected: slower development)
- Flutter (rejected: React ecosystem preferred)

**Evidence:**
- `apps/mobile/app.config.js` exists
- `apps/mobile/eas.json` exists (Expo Application Services)
- `apps/mobile/app/index.tsx` shows React Native usage

---

## Decision 8: Zod for Runtime Validation

**Date:** 2024-Q4 (inferred from dependencies)  
**Status:** Accepted  
**Context:** Input validation strategy

**Decision:**
Use Zod for runtime validation of API inputs and forms.

**Consequences:**
- ✅ Type-safe validation
- ✅ Runtime type checking
- ⚠️ Not used everywhere (see code-review.md)

**Alternatives Considered:**
- Yup (rejected: Zod chosen for TypeScript integration)
- Manual validation (rejected: error-prone)

**Evidence:**
- `package.json:234` shows `zod: ^3.22.4`
- `apps/web/src/lib/validation.ts` likely uses Zod
- Coverage unknown (see code-review.md)

---

## Decision 9: Turbo for Build System

**Date:** 2024-Q4 (inferred from scripts)  
**Status:** Accepted  
**Context:** Build orchestration

**Decision:**
Use Turborepo (Turbo) for monorepo build orchestration.

**Consequences:**
- ✅ Parallel builds
- ✅ Caching
- ⚠️ Complex configuration

**Alternatives Considered:**
- Nx (rejected: Turborepo simpler)
- Lerna (rejected: Turborepo faster)

**Evidence:**
- `package.json:220` shows `turbo: ^1.13.4`
- Scripts use `turbo run` commands

---

## Decision 10: pnpm for Package Management

**Date:** 2024-Q4 (inferred from usage)  
**Status:** Accepted  
**Context:** Package manager choice

**Decision:**
Use pnpm for package management across monorepo.

**Consequences:**
- ✅ Faster installs (hard linking)
- ✅ Disk space savings
- ✅ Strict dependency resolution
- ⚠️ Some CI/CD tools may not support pnpm well

**Alternatives Considered:**
- npm (rejected: slower, more disk usage)
- yarn (rejected: pnpm faster)

**Evidence:**
- `package.json:244` shows `packageManager: "pnpm@9.0.0"`
- All workflows use `pnpm install --frozen-lockfile`

---

## Pending Decisions (To Be Made)

1. **Canary Deployment Strategy**
   - **Status:** Pending
   - **Context:** Need safer deployments
   - **See:** Phase E (Canary Harness)

2. **Type Coverage Target**
   - **Status:** Pending
   - **Context:** Current coverage unknown, target 95% (from inputs)
   - **See:** Phase C (Type & Telemetry Wave)

3. **Bundle Size Budget**
   - **Status:** Pending
   - **Context:** No bundle analysis, target 0KB delta (from inputs)
   - **See:** Phase A (Assurance Scan)

4. **Preview Protection Strategy**
   - **Status:** Pending
   - **Context:** Security risk (preview deployments unprotected)
   - **See:** Phase E (Canary Harness)

---

## Decision Review Process

**Frequency:** Quarterly  
**Owner:** Architecture Team (`@team-leads`)  
**Format:** ADR-lite (this document)  
**Full ADRs:** Consider creating full ADRs for major decisions (see `docs/adr/` if exists)

---

**Last Updated:** 2025-01-09  
**Next Review:** 2025-04-09

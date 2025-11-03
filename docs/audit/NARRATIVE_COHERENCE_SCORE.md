# Narrative Coherence & Human Legibility Score

**Generated:** 2025-01-27  
**Score: 6.5/10** (Moderate - Good foundation, needs improvement)

## Scoring Breakdown

| Category | Score | Weight | Weighted Score | Rationale |
|----------|-------|--------|---------------|-----------|
| **Discoverability** | 7/10 | 25% | 1.75 | Good README, but unclear entry points |
| **Boot Path Clarity** | 6/10 | 20% | 1.20 | Multiple setup paths, unclear |
| **Data Flow Documentation** | 5/10 | 20% | 1.00 | No architecture diagrams, implicit contracts |
| **Command Discoverability** | 8/10 | 15% | 1.20 | Extensive package.json scripts, well-organized |
| **Critical Logic Documentation** | 6/10 | 20% | 1.30 | Some docs, but missing key explanations |
| **Total** | - | 100% | **6.45** | Rounded to **6.5/10** |

## Discoverability Assessment

### ✅ Strengths
1. **README.md** (`README.md`)
   - Clear project overview
   - Getting started instructions
   - Tech stack documentation
   - Development workflow

2. **Package.json Scripts** (`package.json`)
   - 120+ scripts with clear naming
   - Organized by category (dev, build, test, security)
   - Self-documenting command names

3. **Architecture Documents**
   - `ARCHITECTURE_SUMMARY.md` - Good overview
   - `ARCHITECTURE_TARGET.md` - Phases roadmap
   - `docs/nomad/ARCHITECTURE.md` - Nomad-specific details

### ❌ Weaknesses
1. **No Clear Entry Point for New Developers**
   - Which app to start? (`apps/web` vs `apps/mobile`)
   - What's the primary app? (Web vs Mobile vs Nomad)
   - No onboarding guide for new contributors

2. **Multiple Architecture Documents**
   - Conflicting information (Nomad vs "What's for Dinner")
   - No single source of truth
   - Unclear which doc is canonical

3. **Missing Architecture Diagrams**
   - No module dependency graph
   - No data flow diagrams
   - No system architecture overview
   - No deployment architecture

4. **Unclear Project Identity**
   - "What's for Dinner" vs "Nomad" branding
   - Mixed references in code/config/docs
   - No clear product vision document

## Boot Path Clarity

### Current State
```bash
# From README.md
1. Clone repository
2. pnpm install
3. pnpm build:packages
4. pnpm dev          # Start all apps
   OR
   pnpm dev:web      # Web only
   pnpm dev:mobile   # Mobile only
```

### Issues
1. **No Environment Setup Guide**
   - `.env.example` has 300+ variables
   - No step-by-step setup instructions
   - No validation of required vs optional vars
   - No setup script or wizard

2. **No Database Setup Instructions**
   - Multiple migration directories (which to use?)
   - No clear migration path
   - No seed data instructions
   - No local development DB setup

3. **No Supabase Setup Guide**
   - References Supabase but no setup instructions
   - No local Supabase setup
   - No project initialization steps

4. **No Clear Development Workflow**
   - Which app to develop first?
   - How to test changes?
   - How to run migrations?
   - How to debug issues?

### Recommended Fixes
1. **Create `ONBOARDING.md`** (NEW)
   - Step-by-step setup (env vars, DB, Supabase)
   - Development workflow
   - Common troubleshooting
   - Link to architecture docs

2. **Add Setup Script**
   - `scripts/setup-dev.sh` (NEW)
   - Validates environment
   - Sets up local DB (if needed)
   - Checks dependencies

3. **Environment Variable Guide**
   - Document required vs optional
   - Group by feature (auth, payments, etc.)
   - Provide safe defaults where possible

## Data Flow Documentation

### Current State
- **No explicit data flow documentation**
- Implicit contracts between frontend/backend
- No API documentation (OpenAPI/GraphQL schema)
- No database schema documentation (beyond SQL files)

### Missing Documentation
1. **API Route Documentation**
   - Location: `apps/web/src/app/api/**`
   - No OpenAPI spec found
   - No request/response examples
   - No authentication requirements documented

2. **Database Schema Documentation**
   - Location: Multiple migration files
   - No ER diagrams
   - No table relationship documentation
   - No RLS policy documentation

3. **Component Data Flow**
   - How data flows from API → UI
   - State management patterns
   - Caching strategies
   - Real-time updates (Supabase Realtime)

4. **Background Job Flow**
   - Location: `packages/server/src/jobs/**`
   - No job flow documentation
   - No job dependencies documented
   - No job failure handling documented

### Recommended Fixes
1. **Generate OpenAPI Spec**
   - `scripts/generate-openapi.mjs` (NEW)
   - Auto-generate from route handlers
   - Include in `/api/swagger` endpoint

2. **Create Data Flow Diagrams**
   - User authentication flow
   - Payment processing flow
   - AI meal generation flow
   - Queue job processing flow

3. **Database Schema Documentation**
   - ER diagram (using `dbdiagram.io` or similar)
   - Table relationship documentation
   - RLS policy documentation

4. **Component Data Flow Guide**
   - `docs/DATA_FLOW.md` (NEW)
   - API → React Query → UI components
   - State management patterns
   - Caching strategies

## Command Discoverability

### ✅ Strengths
1. **Extensive Scripts** (`package.json`)
   - 120+ scripts organized by category
   - Clear naming conventions
   - Self-documenting

2. **Turborepo Pipeline**
   - `turbo.json` clearly defines pipeline
   - Dependent tasks clearly marked
   - Cache configuration documented

### ❌ Weaknesses
1. **No Command Reference Guide**
   - No `docs/COMMANDS.md`
   - Must read package.json to discover commands
   - No grouping by workflow (dev, build, deploy)

2. **No Common Workflows Documented**
   - "How do I add a new feature?"
   - "How do I run tests?"
   - "How do I deploy?"
   - "How do I debug?"

### Recommended Fixes
1. **Create `docs/COMMANDS.md`** (NEW)
   - Group by workflow (development, testing, deployment)
   - Common use cases
   - Troubleshooting commands

2. **Add Command Help**
   - `pnpm run help` (NEW)
   - Lists all available commands
   - Groups by category

## Critical Logic Documentation

### Current Documentation
1. **Architecture Documents**
   - ✅ `ARCHITECTURE_SUMMARY.md` - Good overview
   - ✅ `ARCHITECTURE_TARGET.md` - Phases roadmap
   - ✅ `docs/nomad/ARCHITECTURE.md` - Nomad-specific

2. **Security Documentation**
   - ✅ `SECURITY_CHECKLIST.md` - Comprehensive
   - ✅ `.env.example` - Well-documented (300+ vars)

3. **Implementation Summaries**
   - ✅ Multiple `*_SUMMARY.md` files
   - ⚠️ Some are outdated/duplicated

### Missing Documentation
1. **Queue System**
   - Location: `packages/server/src/queue/index.ts`
   - No documentation on job types
   - No job flow documentation
   - No failure handling documentation

2. **Authentication Flow**
   - Location: `packages/server/src/auth/**`
   - No auth flow diagrams
   - No session management documentation
   - No token refresh documentation

3. **Payment Processing**
   - Location: `apps/web/src/app/api/stripe/**`
   - No payment flow documentation
   - No webhook handling documentation
   - No error handling documentation

4. **Database Queries**
   - Location: `packages/server/src/db/**`
   - No query patterns documented
   - No RLS policy documentation
   - No performance optimization guide

5. **AI Integration**
   - Location: `apps/web/src/app/api/mealplan/ai-generate/route.ts`
   - No AI prompt engineering documentation
   - No rate limiting documentation
   - No fallback strategies documented

### Recommended Fixs
1. **Create `docs/CRITICAL_PATHS.md`** (NEW)
   - User authentication flow
   - Payment processing flow
   - AI meal generation flow
   - Queue job processing flow

2. **Add Code Comments**
   - Complex logic in queue system
   - Authentication token refresh
   - Payment webhook validation
   - Database query patterns

3. **Create Runbooks**
   - `docs/RUNBOOKS/` (NEW)
   - Common troubleshooting
   - Deployment procedures
   - Incident response

## Priority Documentation Patches (+2 Score Target)

### To Reach 8.5/10

1. **Create `ONBOARDING.md`** (HIGH PRIORITY)
   - **File:** `docs/ONBOARDING.md` (NEW)
   - **Content:**
     - Step-by-step setup guide
     - Environment variable setup
     - Database migration guide
     - Development workflow
     - Common troubleshooting
   - **Impact:** +0.5 points (Discoverability)

2. **Generate OpenAPI Spec** (HIGH PRIORITY)
   - **File:** `openapi.yaml` (NEW)
   - **Content:**
     - All API routes documented
     - Request/response schemas
     - Authentication requirements
   - **Impact:** +0.5 points (Data Flow Documentation)

3. **Create Architecture Diagrams** (MEDIUM PRIORITY)
   - **File:** `docs/ARCHITECTURE_DIAGRAMS.md` (NEW)
   - **Content:**
     - Module dependency graph
     - Data flow diagrams
     - System architecture overview
     - Deployment architecture
   - **Impact:** +0.3 points (Data Flow Documentation)

4. **Environment Variable Guide** (MEDIUM PRIORITY)
   - **File:** `docs/ENV_SETUP.md` (NEW)
   - **Content:**
     - Required vs optional vars
     - Grouped by feature
     - Safe defaults
     - Validation requirements
   - **Impact:** +0.3 points (Boot Path Clarity)

5. **Create Command Reference** (LOW PRIORITY)
   - **File:** `docs/COMMANDS.md` (NEW)
   - **Content:**
     - Grouped by workflow
     - Common use cases
     - Troubleshooting commands
   - **Impact:** +0.2 points (Command Discoverability)

6. **Database Schema Documentation** (MEDIUM PRIORITY)
   - **File:** `docs/DATABASE_SCHEMA.md` (NEW)
   - **Content:**
     - ER diagram
     - Table relationships
     - RLS policies
     - Migration guide
   - **Impact:** +0.2 points (Data Flow Documentation)

**Total Potential Score Increase:** +2.0 points → **8.5/10**

## Specific File-Level Findings

### Files Needing Documentation/Comments

| File | Location | Missing Documentation | Priority |
|------|----------|----------------------|----------|
| Queue System | `packages/server/src/queue/index.ts` | Job types, failure handling, retry logic | HIGH |
| Auth System | `packages/server/src/auth/**` | Token refresh, session management | HIGH |
| Payment Webhook | `apps/web/src/app/api/stripe/webhook/route.ts` | Webhook validation, error handling | HIGH |
| AI Generation | `apps/web/src/app/api/mealplan/ai-generate/route.ts` | Rate limiting, fallback, prompts | MEDIUM |
| Database Queries | `packages/server/src/db/**` | Query patterns, RLS policies | MEDIUM |
| Job Processors | `packages/server/src/jobs/**` | Job flow, dependencies, failures | MEDIUM |
| API Routes | `apps/web/src/app/api/**` | Request/response schemas, auth requirements | LOW |

## Recommendations Summary

### Immediate Actions (≤1 day)
1. Create `docs/ONBOARDING.md` with step-by-step setup
2. Add environment variable validation guide
3. Create `docs/COMMANDS.md` with common workflows

### Short-term (≤1 week)
1. Generate OpenAPI spec from route handlers
2. Create architecture diagrams (module graph, data flow)
3. Document critical paths (auth, payments, queue)

### Medium-term (≤3 weeks)
1. Create database schema documentation (ER diagram)
2. Add code comments to critical logic
3. Create runbooks for common operations

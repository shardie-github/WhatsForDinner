# RACI Matrix: Ownership for Deploys, Rollback, Mobile Builds

**Generated:** 2025-01-09  
**Scope:** Key operational responsibilities inferred from CODEOWNERS and PR history  
**Format:** RACI (Responsible, Accountable, Consulted, Informed)

---

## Legend

- **R (Responsible):** Does the work
- **A (Accountable):** Owns the outcome (single person)
- **C (Consulted):** Provides input
- **I (Informed):** Kept in the loop

---

## Deployment Operations

### Web App Deployment (Vercel)

| Activity | R | A | C | I |
|----------|---|---|---|---|
| **Deploy to Production** | `@devops-team` | `@team-leads` | `@frontend-team` | `@platform-team` |
| **Deploy Preview (PR)** | `@devops-team` | `@devops-team` | `@frontend-team` | PR author |
| **Rollback Production** | `@devops-team` | `@team-leads` | `@frontend-team` | `@platform-team` |
| **Health Check** | `@devops-team` | `@devops-team` | - | `@team-leads` |
| **Preview Protection Config** | `@devops-team` | `@security-team` | `@team-leads` | `@platform-team` |

**Evidence:**
- `.github/workflows/deploy-web.yml` shows DevOps ownership
- `CODEOWNERS:38` shows `.github/ @devops-team @team-leads`
- `CODEOWNERS:8` shows `/apps/web/ @frontend-team @team-leads`

**Gaps:**
- No explicit rollback procedure documented
- Preview protection not configured (see Phase E)

---

### Mobile App Deployment (Expo)

| Activity | R | A | C | I |
|----------|---|---|---|---|
| **Build iOS** | `@mobile-team` | `@mobile-team` | `@devops-team` | `@team-leads` |
| **Build Android** | `@mobile-team` | `@mobile-team` | `@devops-team` | `@team-leads` |
| **Deploy to App Store** | `@mobile-team` | `@team-leads` | `@devops-team` | `@platform-team` |
| **Deploy to Play Store** | `@mobile-team` | `@team-leads` | `@devops-team` | `@platform-team` |
| **Rollback Mobile** | `@mobile-team` | `@team-leads` | `@devops-team` | `@platform-team` |
| **EAS Channel Management** | `@mobile-team` | `@mobile-team` | `@devops-team` | `@team-leads` |

**Evidence:**
- `CODEOWNERS:9` shows `/apps/mobile/ @mobile-team @team-leads`
- `apps/mobile/eas.json` exists (Expo Application Services)
- `.github/workflows/mobile-release.yml` exists

**Gaps:**
- No rollback procedure documented
- EAS channel gates not configured (see Phase E)

---

### Database Migrations (Supabase)

| Activity | R | A | C | I |
|----------|---|---|---|---|
| **Create Migration** | `@backend-team` | `@database-team` | `@backend-team` | `@team-leads` |
| **Review Migration** | `@database-team` | `@database-team` | `@backend-team` | `@team-leads` |
| **Deploy Migration (Prod)** | `@database-team` | `@database-team` | `@backend-team` | `@team-leads` |
| **Rollback Migration** | `@database-team` | `@database-team` | `@backend-team` | `@team-leads` |
| **Backup Before Migration** | `@database-team` | `@database-team` | - | `@team-leads` |

**Evidence:**
- `CODEOWNERS:31` shows `/supabase/ @backend-team @database-team`
- `supabase/migrations/` contains many migration files
- `package.json:51-53` shows backup scripts

**Gaps:**
- No rollback migrations found
- Backup before migration not automated

---

## CI/CD Pipeline

### CI Workflow Execution

| Activity | R | A | C | I |
|----------|---|---|---|---|
| **Run CI Jobs** | GitHub Actions | `@devops-team` | PR author | `@team-leads` |
| **Fix CI Failures** | PR author | PR author | `@devops-team` | `@team-leads` |
| **Maintain CI Config** | `@devops-team` | `@devops-team` | `@platform-team` | `@team-leads` |
| **Add CI Checks** | `@devops-team` | `@devops-team` | `@platform-team` | `@team-leads` |

**Evidence:**
- `.github/workflows/ci.yml` exists
- `CODEOWNERS:38` shows `.github/ @devops-team @team-leads`

---

### Code Review & Merge

| Activity | R | A | C | I |
|----------|---|---|---|---|
| **Create PR** | PR author | PR author | - | `@team-leads` |
| **Review PR** | `@team-leads` (per CODEOWNERS) | `@team-leads` | PR author | `@platform-team` |
| **Approve PR** | `@team-leads` | `@team-leads` | PR author | `@platform-team` |
| **Merge PR** | PR author or `@team-leads` | `@team-leads` | - | `@platform-team` |
| **Enforce PR Size Limits** | `@team-leads` | `@team-leads` | - | PR authors |

**Evidence:**
- `CODEOWNERS:5` shows `* @team-leads @senior-developers`
- `.github/workflows/pre-merge-validation.yml` exists
- `.github/workflows/code-review-sla.yml` exists

**Gaps:**
- No PR size limits enforced
- Auto-assignment not configured (relies on CODEOWNERS)

---

## Monitoring & Observability

### Error Tracking (Sentry)

| Activity | R | A | C | I |
|----------|---|---|---|---|
| **Configure Sentry** | `@platform-team` | `@platform-team` | `@devops-team` | `@team-leads` |
| **Monitor Errors** | `@platform-team` | `@platform-team` | `@frontend-team` | `@team-leads` |
| **Fix Critical Errors** | `@frontend-team` | `@frontend-team` | `@platform-team` | `@team-leads` |
| **Sentry Alerts** | `@platform-team` | `@platform-team` | `@devops-team` | `@team-leads` |

**Evidence:**
- `apps/web/sentry.*.config.ts` files exist
- `apps/web/next.config.ts:178` shows Sentry config
- Coverage unknown (see assurance-scan.md)

---

### Performance Monitoring

| Activity | R | A | C | I |
|----------|---|---|---|---|
| **Configure RUM** | `@platform-team` | `@platform-team` | `@devops-team` | `@team-leads` |
| **Monitor API p95** | `@platform-team` | `@platform-team` | `@backend-team` | `@team-leads` |
| **Track Core Web Vitals** | `@platform-team` | `@platform-team` | `@frontend-team` | `@team-leads` |
| **Optimize Slow Endpoints** | `@backend-team` | `@backend-team` | `@platform-team` | `@team-leads` |

**Evidence:**
- No RUM configured (see assurance-scan.md)
- No API telemetry (see Phase C)

---

## Security Operations

### Secrets Management

| Activity | R | A | C | I |
|----------|---|---|---|---|
| **Rotate Secrets** | `@security-team` | `@security-team` | `@devops-team` | `@team-leads` |
| **Manage Vercel Secrets** | `@devops-team` | `@devops-team` | `@security-team` | `@team-leads` |
| **Manage Supabase Secrets** | `@backend-team` | `@database-team` | `@security-team` | `@team-leads` |
| **Audit Secret Usage** | `@security-team` | `@security-team` | `@devops-team` | `@team-leads` |

**Evidence:**
- `package.json:151` shows `ops:rotate-secrets` script
- `CODEOWNERS:26` shows security files owned by `@security-team`

**Gaps:**
- Secret rotation not automated
- Secret audit not scheduled

---

### Preview Protection

| Activity | R | A | C | I |
|----------|---|---|---|---|
| **Configure Preview Auth** | `@devops-team` | `@security-team` | `@team-leads` | `@platform-team` |
| **Enforce Preview Protection** | `@devops-team` | `@security-team` | `@team-leads` | `@platform-team` |
| **Monitor Preview Access** | `@security-team` | `@security-team` | `@devops-team` | `@team-leads` |

**Evidence:**
- Preview protection missing (see assurance-scan.md)
- `.github/workflows/preview-pr.yml` exists but may not enforce auth

---

## Backup & Recovery

### Database Backups

| Activity | R | A | C | I |
|----------|---|---|---|---|
| **Run Backups** | `@database-team` | `@database-team` | - | `@team-leads` |
| **Verify Backups** | `@database-team` | `@database-team` | - | `@team-leads` |
| **Restore from Backup** | `@database-team` | `@team-leads` | `@backend-team` | `@platform-team` |
| **DR Drill** | `@database-team` | `@team-leads` | `@devops-team` | `@platform-team` |

**Evidence:**
- `package.json:51-53` shows backup scripts
- `.github/workflows/dr-drill.yml` exists
- Backup metadata missing (see assurance-scan.md)

**Gaps:**
- Backup automation not verified
- DR drill evidence missing

---

## Key Gaps & Recommendations

1. **Rollback Procedures:** Not documented for any deployment path
   - **Action:** Create `ops/rollback-procedures.md` (see Phase A)

2. **Preview Protection:** Not configured
   - **Action:** Add preview protection (see Phase E)

3. **Mobile Rollback:** No procedure documented
   - **Action:** Document EAS rollback procedure

4. **Backup Verification:** No evidence of backups/restores
   - **Action:** Run backup and document (see Phase A)

5. **PR Size Limits:** Not enforced
   - **Action:** Add quality gates (see Phase F)

---

**Last Updated:** 2025-01-09  
**Next Review:** After implementing canary deployments and rollback procedures

# Trust Layer Action Plan

**Generated:** 2025-01-XX  
**Purpose:** Sequenced implementation plan with owners & ETAs

## Execution Order

1. **Audit & Reports** (✅ Complete)
2. **Feature Flags** (In Progress)
3. **Trust Documentation** (Pending)
4. **Database Migration** (Pending)
5. **UI Pages** (Pending)
6. **API Endpoints** (Pending)
7. **Layout/Footer Patches** (Pending)
8. **CI/CD Updates** (Pending)

---

## Phase 1: Foundation (Day 1)

### 1.1 Feature Flags Configuration
**Owner:** Engineering  
**ETA:** 15 minutes  
**Files:**
- `config/flags.trust.json`

**Status:** 🔄 In Progress

---

### 1.2 Trust Documentation Suite
**Owner:** Product/Compliance  
**ETA:** 2-3 hours  
**Files:**
- `docs/trust/TRUST.md`
- `docs/trust/PRIVACY_POLICY_DRAFT.md`
- `docs/trust/SECURITY.md`
- `docs/trust/STATUS.md`
- `docs/trust/A11Y_REPORT_TEMPLATE.md`
- `docs/trust/I18N_READINESS.md`
- `docs/trust/SLO_SLA.md`

**Status:** ⏳ Pending

---

### 1.3 Database Migration
**Owner:** Backend  
**ETA:** 30 minutes  
**Files:**
- `apps/web/supabase/migrations/2025-11-05_trust_audit.sql`

**Status:** ⏳ Pending

**Notes:**
- Online-safe migration (no CONCURRENTLY in transaction)
- RLS enabled from start
- Owner-only access policy

---

## Phase 2: User-Facing Pages (Day 1-2)

### 2.1 Trust Center Hub
**Owner:** Frontend  
**ETA:** 1 hour  
**Files:**
- `apps/web/src/app/trust/page.tsx`

**Status:** ⏳ Pending

**Dependencies:**
- Feature flags (trust_center flag)

---

### 2.2 Privacy Center
**Owner:** Frontend  
**ETA:** 30 minutes  
**Files:**
- `apps/web/src/app/privacy/page.tsx`

**Status:** ⏳ Pending

**Dependencies:**
- Privacy policy markdown content

---

### 2.3 Help Center
**Owner:** Frontend  
**ETA:** 30 minutes  
**Files:**
- `apps/web/src/app/help/page.tsx`

**Status:** ⏳ Pending

---

### 2.4 Audit Log Viewer
**Owner:** Frontend  
**ETA:** 1 hour  
**Files:**
- `apps/web/src/app/account/audit-log/page.tsx`

**Status:** ⏳ Pending

**Dependencies:**
- Database migration
- API endpoint

---

### 2.5 Data Export Page
**Owner:** Frontend  
**ETA:** 1 hour  
**Files:**
- `apps/web/src/app/account/export/page.tsx`

**Status:** ⏳ Pending

**Dependencies:**
- API endpoint (future)

---

## Phase 3: API Endpoints (Day 2)

### 3.1 Audit Log API
**Owner:** Backend  
**ETA:** 1 hour  
**Files:**
- `apps/web/src/app/api/audit/me/route.ts`

**Status:** ⏳ Pending

**Notes:**
- Edge runtime
- RLS-enforced (user-only access)
- Returns last 100 entries

---

### 3.2 Feedback API
**Owner:** Backend  
**ETA:** 30 minutes  
**Files:**
- `apps/web/src/app/api/feedback/route.ts`

**Status:** ⏳ Pending

**Notes:**
- Edge runtime
- Stores in audit_log table
- Supports anonymous feedback

---

## Phase 4: Layout & Footer Enhancements (Day 2)

### 4.1 Layout Accessibility Patches
**Owner:** Frontend  
**ETA:** 30 minutes  
**Files:**
- `apps/web/src/app/layout.tsx`

**Patches:**
- Add prefers-reduced-motion logic
- Add i18n language/direction attributes

**Status:** ⏳ Pending

---

### 4.2 Footer Trust Links
**Owner:** Frontend  
**ETA:** 15 minutes  
**Files:**
- `apps/web/src/app/layout.tsx` (footer section)

**Patches:**
- Add Trust Center link (gated by flag)
- Add Help Center link (gated by flag)
- Add Export Data link (gated by flag)
- Add Audit Log link (gated by flag, auth-required)

**Status:** ⏳ Pending

---

## Phase 5: CI/CD Integration (Day 2)

### 5.1 Trust Smoke Checks
**Owner:** DevOps  
**ETA:** 15 minutes  
**Files:**
- `.github/workflows/deploy-main.yml`

**Patches:**
- Add Trust Smoke step after Agent Smoke Check
- Verify trust artifacts exist
- Verify trust pages exist

**Status:** ⏳ Pending

---

## Phase 6: Testing & Validation (Day 2-3)

### 6.1 Manual Testing Checklist
- [ ] Trust center page loads when flag enabled
- [ ] Privacy/Status/Help pages render correctly
- [ ] Audit log API returns user's own entries only
- [ ] Feedback API accepts POST requests
- [ ] Footer links appear when flags enabled
- [ ] Layout accessibility features work
- [ ] CI Trust Smoke step passes

---

### 6.2 Rollback Plan
**If issues arise:**
1. Disable all flags in `config/flags.trust.json`
2. Revert migration (if needed): `DROP TABLE IF EXISTS public.audit_log CASCADE;`
3. Remove Trust Smoke step from CI (if causing failures)

**Rollback commands:**
```bash
# Disable flags
echo '{"privacy_center": false, "status_page": false, ...}' > config/flags.trust.json

# Revert migration (if needed)
psql $DATABASE_URL -c "DROP TABLE IF EXISTS public.audit_log CASCADE;"
```

---

## Risk Assessment

### Low Risk
- ✅ Documentation files (additive only)
- ✅ UI pages (gated by flags)
- ✅ Layout patches (marker-based, non-destructive)

### Medium Risk
- ⚠️ Database migration (tested, but requires careful deployment)
- ⚠️ API endpoints (new routes, need auth testing)

### High Risk
- ❌ None (all changes are additive and gated)

---

## Success Criteria

### Must Have
- ✅ All trust docs created and linked
- ✅ Trust center page accessible when flag enabled
- ✅ Audit log table exists with RLS
- ✅ Audit log API returns user's own entries
- ✅ Footer links appear when flags enabled
- ✅ CI Trust Smoke step passes

### Nice to Have
- ⚠️ Privacy policy markdown rendering
- ⚠️ Help center content populated
- ⚠️ Feedback widget UI (future)

---

## Timeline Estimate

- **Day 1:** Foundation + Documentation (4-5 hours)
- **Day 2:** Pages + APIs + Patches + CI (4-5 hours)
- **Day 3:** Testing + Refinement (2-3 hours)

**Total:** ~10-13 hours of focused work

---

## Owners & Responsibilities

| Component | Owner | Review Required |
|-----------|-------|----------------|
| Feature Flags | Engineering | No |
| Trust Docs | Product/Compliance | Yes |
| Database Migration | Backend | Yes |
| UI Pages | Frontend | Yes |
| API Endpoints | Backend | Yes |
| Layout Patches | Frontend | Yes |
| CI/CD Updates | DevOps | Yes |

---

## Next Actions

1. ✅ Complete audit reports (Done)
2. 🔄 Create feature flags config
3. ⏳ Create trust documentation
4. ⏳ Create database migration
5. ⏳ Create UI pages
6. ⏳ Create API endpoints
7. ⏳ Patch layout/footer
8. ⏳ Update CI/CD

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

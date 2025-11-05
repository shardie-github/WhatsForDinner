# Trust Layer Gap Matrix

**Generated:** 2025-01-XX  
**Purpose:** Stakeholder perspective × gap × fix mapping

## Scoring Legend

- **0**: No coverage
- **1**: Minimal coverage (placeholder/docs only)
- **2**: Partial coverage (basic implementation)
- **3**: Full coverage (production-ready)

---

## Gap Matrix Table

| Stakeholder | Current Coverage | Gap Description | Priority | Fix Location | Status |
|------------|------------------|-----------------|----------|--------------|--------|
| **End Users** | 1 | No trust center, no data export, no audit log visibility | High | `/trust`, `/account/export`, `/account/audit-log` | 🔴 |
| **Customer Support** | 2 | Help center exists but basic; no diagnostics tools | Medium | `/help`, enhanced support tools | 🟡 |
| **Security & Compliance** | 2 | SOC2 docs exist but missing public-facing security doc | High | `docs/trust/SECURITY.md` | 🟡 |
| **Legal & Privacy** | 2 | Privacy policy exists but missing plain-language version | High | `docs/trust/PRIVACY_POLICY_DRAFT.md` | 🟡 |
| **Accessibility** | 2 | Basic a11y exists, missing reduced-motion, i18n attributes | Medium | Layout patches, `docs/trust/A11Y_REPORT_TEMPLATE.md` | 🟡 |
| **Reliability & SRE** | 1 | Status page exists but missing SLO/SLA docs | Medium | `docs/trust/SLO_SLA.md`, `docs/trust/STATUS.md` | 🟡 |
| **Product/UX Research** | 0 | No feedback collection mechanism | Medium | `/api/feedback` | 🔴 |
| **Partnerships/Integrators** | 1 | API docs exist but missing API portal | Low | Future: API portal | 🟢 |
| **Finance/Billing** | 1 | Missing rate limit disclosures, fair-use guardrails | Low | Future: billing docs | 🟢 |
| **Admins** | 3 | Admin console exists (Nomad platform) | N/A | N/A | ✅ |
| **Localization** | 0 | No i18n infrastructure, hardcoded "en" | Medium | `docs/trust/I18N_READINESS.md`, layout patches | 🟡 |
| **Governance** | 1 | Missing changelog automation, deprecation policy | Low | Future: governance docs | 🟢 |

---

## Detailed Gap Analysis

### 1. End Users (Coverage: 1/3)

**Gaps:**
- No centralized trust center hub
- No self-service data export
- No personal audit log visibility
- No clear product promises

**Fixes:**
- ✅ Create `/trust` page (trust center hub)
- ✅ Create `/account/export` page (data export)
- ✅ Create `/account/audit-log` page (audit log viewer)
- ✅ Create `docs/trust/TRUST.md` (product promises & data map)
- ✅ Add audit_log table migration

**Priority:** High (affects user trust directly)

---

### 2. Customer Support & Success (Coverage: 2/3)

**Gaps:**
- Help center exists but minimal content
- No diagnostic tools for triage
- No recovery flow documentation

**Fixes:**
- ✅ Create `/help` page (enhanced help center)
- ⚠️ Future: Add diagnostic tools (out of scope)

**Priority:** Medium (existing support page can be enhanced)

---

### 3. Security & Compliance (Coverage: 2/3)

**Gaps:**
- Missing public-facing security document
- No data map disclosure
- SOC2 prep docs exist but not user-facing

**Fixes:**
- ✅ Create `docs/trust/SECURITY.md` (security posture)
- ✅ Create `docs/trust/TRUST.md` (includes data map)

**Priority:** High (required for enterprise customers)

---

### 4. Legal & Privacy (Coverage: 2/3)

**Gaps:**
- Privacy policy exists but technical
- Missing plain-language summary
- No consent model documentation

**Fixes:**
- ✅ Create `docs/trust/PRIVACY_POLICY_DRAFT.md` (plain-language)
- ✅ Update `docs/trust/TRUST.md` (consent model)

**Priority:** High (compliance requirement)

---

### 5. Accessibility & Inclusive Design (Coverage: 2/3)

**Gaps:**
- Missing prefers-reduced-motion handling
- Language attribute hardcoded to "en"
- No RTL support
- No comprehensive A11Y audit report

**Fixes:**
- ✅ Patch layout.tsx with reduced-motion logic
- ✅ Patch layout.tsx with i18n attributes
- ✅ Create `docs/trust/A11Y_REPORT_TEMPLATE.md`

**Priority:** Medium (WCAG compliance)

---

### 6. Reliability & SRE (Coverage: 1/3)

**Gaps:**
- Status page exists but missing SLO/SLA docs
- No incident communication policy
- No error budget disclosure

**Fixes:**
- ✅ Create `docs/trust/SLO_SLA.md` (SLO/SLA overview)
- ✅ Create `docs/trust/STATUS.md` (incident comms policy)

**Priority:** Medium (transparency requirement)

---

### 7. Product/UX Research (Coverage: 0/3)

**Gaps:**
- No feedback collection mechanism
- No NPS/CSAT infrastructure
- No in-app feedback widget

**Fixes:**
- ✅ Create `/api/feedback` endpoint
- ⚠️ Future: Add feedback widget (out of scope)

**Priority:** Medium (growth optimization)

---

### 8. Partnerships/Integrators (Coverage: 1/3)

**Gaps:**
- API docs exist but no portal
- Versioning strategy unclear
- Webhook documentation incomplete

**Fixes:**
- ⚠️ Future: API portal (out of scope)

**Priority:** Low (not blocking)

---

### 9. Finance/Billing (Coverage: 1/3)

**Gaps:**
- Rate limit disclosures missing
- Fair-use guardrails not documented
- Pricing clarity could be improved

**Fixes:**
- ⚠️ Future: Billing docs (out of scope)

**Priority:** Low (not blocking)

---

### 10. Admins (Coverage: 3/3)

**Status:** ✅ Complete (Nomad platform admin console exists)

---

### 11. Localization (Coverage: 0/3)

**Gaps:**
- No i18n infrastructure
- Language hardcoded to "en"
- No RTL support
- No date/number formatting hooks

**Fixes:**
- ✅ Create `docs/trust/I18N_READINESS.md` (i18n strategy)
- ✅ Patch layout.tsx with i18n attributes

**Priority:** Medium (international expansion readiness)

---

### 12. Governance (Coverage: 1/3)

**Gaps:**
- Changelog automation missing
- Deprecation policy unclear
- Model cards for AI features missing

**Fixes:**
- ⚠️ Future: Governance docs (out of scope)

**Priority:** Low (not blocking)

---

## Priority Summary

### High Priority (Must Fix)
1. ✅ End Users - Trust center, data export, audit log
2. ✅ Security & Compliance - Public security doc
3. ✅ Legal & Privacy - Plain-language privacy policy

### Medium Priority (Should Fix)
4. ✅ Accessibility - Reduced motion, i18n attributes
5. ✅ Reliability & SRE - SLO/SLA docs
6. ✅ Product/UX Research - Feedback endpoint
7. ✅ Localization - i18n readiness doc

### Low Priority (Nice to Have)
8. ⚠️ Partnerships - API portal (future)
9. ⚠️ Finance - Billing docs (future)
10. ⚠️ Governance - Changelog automation (future)

---

## Implementation Status

- 🔴 **Critical Gap** - Must address
- 🟡 **Medium Gap** - Should address
- 🟢 **Low Gap** - Nice to have
- ✅ **Complete** - Already covered

---

## Next Steps

See `02_action_plan.md` for sequenced implementation plan.

# Trust Layer Inventory Report

**Generated:** 2025-01-XX  
**Scope:** Stakeholder perspective coverage audit  
**Purpose:** Baseline inventory of existing trust-related artifacts

## Executive Summary

This inventory documents existing trust-related files, routes, workflows, and CI/CD integrations across the codebase. The audit identifies what exists and what gaps remain for comprehensive stakeholder coverage.

---

## 1. Documentation Files

### Existing Trust/Privacy Docs
- ✅ `docs/TRUST_CENTER.md` - Nomad Platform Trust Center (admin-focused)
- ✅ `docs/privacy-policy.md` - Privacy policy content
- ✅ `docs/cookie-policy.md` - Cookie policy
- ✅ `docs/gdpr-compliance.md` - GDPR compliance documentation
- ✅ `docs/terms-of-service.md` - Terms of service
- ✅ `docs/privacy/threat-model.md` - Privacy threat modeling
- ✅ `docs/privacy/monitoring-policy.md` - Privacy monitoring policy
- ✅ `docs/privacy/self-audit-checklist.md` - Privacy self-audit checklist

### Existing Security Docs
- ✅ `docs/security-audit-checklist.md` - Security audit checklist
- ✅ `docs/secret-scanning-ci-cd.md` - Secret scanning procedures
- ✅ `docs/mfa-setup-guide.md` - MFA setup guide

### Existing Compliance Docs
- ✅ `docs/SOC2_ISO_EVIDENCE.md` - SOC2/ISO evidence mapping
- ✅ `docs/STORE_COMPLIANCE_CHECKLIST.md` - Store compliance checklist
- ✅ `docs/APPSTORE_PRIVACY_PACK.md` - App store privacy pack

### Missing Trust Docs
- ❌ `docs/trust/TRUST.md` - Product promises & data map
- ❌ `docs/trust/PRIVACY_POLICY_DRAFT.md` - Plain-language privacy policy
- ❌ `docs/trust/SECURITY.md` - Security posture document
- ❌ `docs/trust/STATUS.md` - Incident communication policy
- ❌ `docs/trust/A11Y_REPORT_TEMPLATE.md` - Accessibility report template
- ❌ `docs/trust/I18N_READINESS.md` - Internationalization readiness
- ❌ `docs/trust/SLO_SLA.md` - SLO/SLA documentation

---

## 2. UI Routes & Pages

### Existing Routes
- ✅ `/status` - System status page (functional)
- ✅ `/privacy-policy` - Privacy policy (redirects to static HTML)
- ✅ `/terms-of-service` - Terms of service page
- ✅ `/support` - Support page
- ✅ `/settings/account/profile` - User profile settings
- ✅ `/settings/account/delete` - Account deletion

### Missing Routes
- ❌ `/trust` - Trust center hub page
- ❌ `/privacy` - Privacy center (distinct from policy)
- ❌ `/help` - Help center
- ❌ `/account/export` - Data export page
- ❌ `/account/audit-log` - Personal audit log viewer

---

## 3. API Endpoints

### Existing API Routes
- ✅ `/api/auth/*` - Authentication endpoints
- ✅ `/api/admin/*` - Admin endpoints (for Nomad platform)
- ✅ Various feature-specific APIs

### Missing API Routes
- ❌ `/api/audit/me` - Personal audit log retrieval
- ❌ `/api/feedback` - User feedback collection
- ❌ `/api/export` - Data export endpoint

---

## 4. Database Schema

### Existing Tables
- ✅ `audit_logs` - Admin audit logs (Nomad platform)
- ✅ Various application tables

### Missing Tables
- ❌ `public.audit_log` - User-facing audit log (personal actions)

---

## 5. Feature Flags

### Existing Flag Files
- ✅ `config/feature-flags.json` - General feature flags
- ✅ `config/flags.gamify.json` - Gamification flags
- ✅ `config/flags.agent.json` - Agent flags

### Missing Flag File
- ❌ `config/flags.trust.json` - Trust feature flags

---

## 6. Accessibility Features

### Existing Accessibility
- ✅ `SkipToMainContent` component in layout
- ✅ `LiveRegion` component for announcements
- ✅ `@/lib/accessibility` module

### Missing Accessibility
- ❌ Prefers-reduced-motion handling
- ❌ Language/direction attributes (i18n)
- ❌ Comprehensive A11Y audit report

---

## 7. CI/CD Workflows

### Existing Workflows
- ✅ `.github/workflows/deploy-main.yml` - Main deployment
- ✅ `.github/workflows/security.yml` - Security checks
- ✅ `.github/workflows/compliance.yml` - Compliance checks
- ✅ `.github/workflows/trust.yml` - Trust workflow (exists but unclear content)

### Missing CI Checks
- ❌ Trust Smoke checks in deploy-main.yml
- ❌ Trust artifact presence verification

---

## 8. Footer/Header Links

### Existing Footer Links (layout.tsx)
- ✅ Support
- ✅ Status
- ✅ Terms
- ✅ Privacy

### Missing Footer Links
- ❌ Trust Center
- ❌ Help Center
- ❌ Export Data (gated)
- ❌ Audit Log (gated)

---

## 9. Component Structure

### Existing Components
- ✅ `@/components/GDPRConsent` - GDPR consent banner
- ✅ `@/components/privacy/PrivacyHUD` - Privacy HUD
- ✅ `@/components/ThemeProvider` - Theme management
- ✅ `@/components/ErrorBoundary` - Error handling

### Missing Components
- ❌ TrustCenter component/page
- ❌ DataExport component
- ❌ AuditLogViewer component
- ❌ FeedbackWidget component

---

## 10. Migration Files

### Existing Migrations
- ✅ `001_create_tables.sql`
- ✅ `002_analytics_logging_tables.sql`
- ✅ `003_multi_tenant_saas_schema.sql`
- ✅ `004_growth_engine_schema.sql`
- ✅ `005_federated_ecosystem_schema.sql`
- ✅ `006_gap_closure_features.sql`
- ✅ `007_gamify.sql`
- ✅ `008_gamify_enhanced.sql`
- ✅ `009_gamify_seed_data.sql`
- ✅ `010_cooking_live.sql`

### Missing Migrations
- ❌ `2025-11-05_trust_audit.sql` - Audit log table for users

---

## 11. Internationalization

### Existing i18n Support
- ⚠️ Limited i18n infrastructure detected
- ⚠️ Language attribute set to "en" hardcoded

### Missing i18n Features
- ❌ i18n key extraction strategy
- ❌ RTL support
- ❌ Date/number formatting hooks
- ❌ Translation fallback system

---

## Summary Statistics

- **Existing Docs:** 11 trust/privacy/security documents
- **Missing Docs:** 7 trust-specific documents
- **Existing Routes:** 5 trust-related routes
- **Missing Routes:** 5 trust-related routes
- **Existing APIs:** Admin APIs only
- **Missing APIs:** 3 user-facing trust APIs
- **Existing Tables:** Admin audit logs
- **Missing Tables:** 1 user audit log table
- **Existing Flags:** 3 flag files
- **Missing Flags:** 1 trust flag file

---

## Next Steps

1. Generate gap matrix (01_gap_matrix.md)
2. Create action plan (02_action_plan.md)
3. Implement missing artifacts systematically

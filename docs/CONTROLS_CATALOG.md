# Controls Catalog

## Access Control

### AC-1: Branch Protection Enabled
- **Framework**: SOC 2
- **Frequency**: Continuous
- **Test Method**: Check GitHub API for branch protection rules
- **Evidence**: `github-branch-protection.json`
- **Owner**: DevOps
- **Evidence Path**: `/docs/evidence/AC-1-*.json`

### AC-2: Code Owners Enforced
- **Framework**: SOC 2
- **Frequency**: Continuous
- **Test Method**: Verify CODEOWNERS file exists and is required
- **Evidence**: `codeowners-check.json`
- **Owner**: DevOps

### AC-3: 2FA Organization Requirement
- **Framework**: ISO 27001
- **Frequency**: Daily
- **Test Method**: Check GitHub org 2FA enforcement
- **Evidence**: `github-2fa-check.json`
- **Owner**: Security

## Logging & Monitoring

### LM-1: Audit Logs Available
- **Framework**: SOC 2
- **Frequency**: Continuous
- **Test Method**: Verify audit logs table exists and is being written
- **Evidence**: `audit-logs-check.json`
- **Owner**: Security

### LM-2: Application Monitoring Active
- **Framework**: ISO 27001
- **Frequency**: Continuous
- **Test Method**: Verify monitoring service is active
- **Evidence**: `monitoring-check.json`
- **Owner**: DevOps

## Change Management

### CM-1: CI Checks Required on Main
- **Framework**: SOC 2
- **Frequency**: Continuous
- **Test Method**: Check CI configuration for required checks
- **Evidence**: `ci-checks-config.json`
- **Owner**: DevOps

### CM-2: Secret Scanning Enabled
- **Framework**: SOC 2
- **Frequency**: Daily
- **Test Method**: Verify secret scanning runs in CI
- **Evidence**: `secret-scan-report.json`
- **Owner**: Security

## Incident Response

### IR-1: Incident Tracking System
- **Framework**: SOC 2
- **Frequency**: Continuous
- **Test Method**: Verify incidents table and tracking workflow
- **Evidence**: `incident-tracking-check.json`
- **Owner**: Security

## Vendor Management

### VM-1: Vendor DPA Tracking
- **Framework**: SOC 2
- **Frequency**: Monthly
- **Test Method**: Check vendor_catalog for PII vendors with DPAs
- **Evidence**: `vendor-dpa-check.json`
- **Owner**: Legal

## Backups & DR

### BD-1: Database Backups Configured
- **Framework**: SOC 2
- **Frequency**: Daily
- **Test Method**: Verify backup job runs and files exist
- **Evidence**: `backup-config-check.json`
- **Owner**: DevOps

### BD-2: DR Plan Documented
- **Framework**: ISO 27001
- **Frequency**: Quarterly
- **Test Method**: Check DR plan document exists and updated
- **Evidence**: `dr-plan-check.json`
- **Owner**: DevOps

## Secure SDLC

### SDLC-1: Dependency Scanning
- **Framework**: SOC 2
- **Frequency**: Daily
- **Test Method**: Verify dependency scans run in CI
- **Evidence**: `dependency-scan-report.json`
- **Owner**: Security

## Key Management

### KM-1: Secrets Encryption
- **Framework**: ISO 27001
- **Frequency**: Continuous
- **Test Method**: Verify env vars encrypted at rest/in transit
- **Evidence**: `secrets-encryption-check.json`
- **Owner**: Security

## Vulnerability Management

### VM-2: Vulnerability Scanning
- **Framework**: ISO 27001
- **Frequency**: Weekly
- **Test Method**: Check vulnerability scan results
- **Evidence**: `vuln-scan-report.json`
- **Owner**: Security

## Cloud Security

### CS-1: SSO Enforced (Mock)
- **Framework**: SOC 2
- **Frequency**: Daily
- **Test Method**: Verify SSO configuration
- **Evidence**: `sso-config-check.json`
- **Owner**: Security

### CS-2: RLS Enabled for Sensitive Tables
- **Framework**: ISO 27001
- **Frequency**: Continuous
- **Test Method**: Verify RLS policies exist on PII tables
- **Evidence**: `rls-check.json`
- **Owner**: Security

## Consent & Privacy

### CP-1: Consent Gating Enabled
- **Framework**: GDPR
- **Frequency**: Continuous
- **Test Method**: Verify analytics/ads blocked without consent
- **Evidence**: `consent-gating-check.json`
- **Owner**: Privacy

## Control Status Values

- **passing**: Control test passed, evidence recorded
- **failing**: Control test failed, remediation required
- **waived**: Control waived with documented reason

## Evidence Collection

Evidence files are stored in immutable storage:
- Path: `/docs/evidence/` (or `EVIDENCE_IMMUTABLE_BUCKET_URL`)
- Format: JSON with metadata and test results
- Checksum: SHA-256 stored in database
- Retention: 7 years minimum

## Control Checks

Controls run automatically based on frequency:
- **Continuous**: Every hour
- **Daily**: Once per day
- **Weekly**: Once per week
- **Monthly**: Once per month
- **Quarterly**: Once per quarter

Manual checks can be triggered via admin dashboard.

## Alerting

When a control regresses (passing ? failing), alerts are sent to:
- Webhook: `CCM_ALERT_WEBHOOK` env var
- Includes: Control key, name, previous status, evidence link

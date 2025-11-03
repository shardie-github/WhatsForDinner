# SOC 2 & ISO 27001 Evidence Mapping

This document maps compliance controls to evidence locations for SOC 2 Type II and ISO 27001 audits.

## SOC 2 Common Criteria (CC) Controls

### CC1 - Control Environment

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| CC1.1 - Control Environment | `docs/ARCHITECTURE_SUMMARY.md` | Documentation |
| CC1.2 - Commitment to Integrity | `SECURITY_CHECKLIST.md` | Policy |
| CC1.3 - Board Oversight | Code of Conduct (if exists) | Policy |

### CC2 - Communication and Information

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| CC2.1 - Internal Communication | `docs/INCIDENT_RUNBOOK.md` | Procedure |
| CC2.2 - External Communication | `docs/DR_BCP.md` | Procedure |
| CC2.3 - System Communication | `packages/server/src/observability/` | Code/Logs |

### CC6 - Logical and Physical Access Controls

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| CC6.1 - Logical Access | `packages/server/src/auth/` | Code |
| CC6.2 - Access Credentials | `.env.example` (template) | Configuration |
| CC6.3 - Access Removal | `packages/server/src/audit/index.ts` | Audit Logs |
| CC6.4 - Network Security | `SECURITY_CHECKLIST.md` | Documentation |
| CC6.5 - Encryption | `tools/scripts/backup-run.ts` | Implementation |
| CC6.6 - Physical Access | Vendor documentation (Supabase/Vercel) | Vendor Evidence |

### CC7 - System Operations

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| CC7.1 - System Monitoring | `packages/server/src/observability/` | Code/Metrics |
| CC7.2 - Incident Response | `docs/INCIDENT_RUNBOOK.md` | Procedure |
| CC7.3 - Change Management | `docs/CHANGE_MANAGEMENT.md` | Procedure |
| CC7.4 - Backup & Recovery | `docs/DR_BCP.md`, `tools/scripts/backup-run.ts` | Procedure/Code |
| CC7.5 - Capacity Management | `apps/web/app/admin/(console)/costs/page.tsx` | Monitoring |

### CC8 - Change Management

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| CC8.1 - Change Management Process | `docs/CHANGE_MANAGEMENT.md` | Procedure |
| CC8.2 - Code Reviews | GitHub Pull Requests | Evidence |
| CC8.3 - Testing | `packages/testing/` | Test Code |
| CC8.4 - Deployment Controls | `.github/workflows/deploy.yml` | CI/CD |

## ISO 27001 Controls

### A.5 - Information Security Policies

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| A.5.1.1 - Policies for ISMS | `SECURITY_CHECKLIST.md` | Policy |
| A.5.1.2 - Review of Policies | Policy review records | Documentation |

### A.6 - Organization of Information Security

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| A.6.1.1 - Information Security Roles | `CODEOWNERS` | Documentation |
| A.6.1.2 - Segregation of Duties | `packages/server/src/auth/admin.ts` | Implementation |
| A.6.2.1 - Contact with Authorities | `docs/INCIDENT_RUNBOOK.md` | Procedure |

### A.7 - Human Resource Security

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| A.7.2.1 - Terms of Employment | HR documentation (external) | Policy |
| A.7.2.2 - Information Security Awareness | Security training records | Documentation |
| A.7.3.1 - Termination Responsibilities | `packages/server/src/audit/index.ts` | Audit Logs |

### A.8 - Asset Management

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| A.8.1.1 - Inventory of Assets | `ARCHITECTURE_SUMMARY.md` | Documentation |
| A.8.2.1 - Classification of Information | `docs/DR_BCP.md` | Policy |
| A.8.3.1 - Media Handling | `tools/scripts/backup-run.ts` | Procedure |

### A.9 - Access Control

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| A.9.1.1 - Access Control Policy | `packages/server/src/auth/` | Code |
| A.9.2.1 - User Registration | `packages/server/src/auth/index.ts` | Code |
| A.9.2.2 - User Access Provisioning | Database schema (users table) | Implementation |
| A.9.2.3 - Management of Privileged Access | `packages/server/src/auth/admin.ts` | Code |
| A.9.4.1 - Access Control to Program Source | GitHub repository permissions | Evidence |

### A.10 - Cryptography

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| A.10.1.1 - Cryptographic Controls | `.env.example` (encryption keys) | Configuration |
| A.10.1.2 - Key Management | `tools/scripts/backup-run.ts` | Implementation |

### A.12 - Operations Security

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| A.12.1.1 - Documented Operating Procedures | `docs/RUNBOOKS.md` | Procedure |
| A.12.2.1 - Controls Against Malware | `.github/workflows/security.yml` | CI/CD |
| A.12.4.1 - Event Logging | `packages/server/src/observability/` | Implementation |
| A.12.4.2 - Protection of Log Information | `packages/server/src/audit/index.ts` | Implementation |
| A.12.4.3 - Administrator and Operator Logs | Audit logs | Evidence |
| A.12.6.1 - Management of Technical Vulnerabilities | `.github/workflows/security.yml` | CI/CD |

### A.14 - Business Continuity

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| A.14.1.1 - Information Security Continuity | `docs/DR_BCP.md` | Procedure |
| A.14.1.2 - Redundancies | `docs/DR_BCP.md` (multi-region) | Documentation |
| A.14.2.1 - Availability of Information Processing Facilities | `packages/server/src/observability/health.ts` | Implementation |

### A.17 - Information Security Aspects of Business Continuity

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| A.17.1.1 - Planning Information Security Continuity | `docs/DR_BCP.md` | Procedure |
| A.17.2.1 - Availability of Information Processing Facilities | `tools/scripts/backup-run.ts` | Implementation |

### A.18 - Compliance

| Control | Evidence Location | Evidence Type |
|---------|-------------------|----------------|
| A.18.1.1 - Identification of Applicable Legislation | `docs/APPSTORE_PRIVACY_PACK.md` | Documentation |
| A.18.1.2 - Intellectual Property Rights | `LICENSE` | Legal Document |
| A.18.2.1 - Independent Review | This document | Evidence Mapping |
| A.18.2.2 - Compliance with Security Policies | `SECURITY_CHECKLIST.md` | Checklist |

## Evidence Collection

### Automated Evidence Bundle

Generate complete evidence bundle:

```bash
pnpm evidence:bundle
```

This creates a ZIP file containing:
- All documentation
- Security scan reports
- Compliance attestations
- Audit logs (anonymized)
- Manifest file

### Manual Evidence Collection

1. **Documentation:** Located in `docs/` directory
2. **Code Evidence:** Source code in repository
3. **Configuration:** `.env.example` and deployment configs
4. **Logs:** Queryable via observability stack (Prometheus/Loki)
5. **Audit Logs:** Stored in database (`audit_logs` table)

## Audit Preparation Checklist

- [ ] Generate evidence bundle (`pnpm evidence:bundle`)
- [ ] Verify all documentation is up-to-date
- [ ] Confirm backup verification records are current
- [ ] Review incident logs for past 12 months
- [ ] Verify security scan results are available
- [ ] Confirm access control logs are accessible
- [ ] Review change management records
- [ ] Verify disaster recovery plan has been tested (quarterly)

## Evidence URLs (For Auditors)

- **Documentation Repository:** `https://github.com/org/nomad/tree/main/docs`
- **Security Reports:** `https://github.com/org/nomad/actions/workflows/security.yml`
- **Deployment History:** `https://github.com/org/nomad/deployments`
- **Incident Logs:** Internal incident management system
- **Monitoring Dashboards:** Grafana (access provided separately)

## Revision History

- **v1.0** (2024-01-XX): Initial evidence mapping document
# SOC 2 & ISO 27001 Evidence Mapping

## Overview

This document maps compliance controls to evidence artifacts, providing auditors with clear references to supporting documentation.

## SOC 2 Type II Controls

### CC1 - Control Environment

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| CC1.1 | Management establishes oversight | `docs/CHANGE_MANAGEMENT.md` | Continuous |
| CC1.2 | Board of directors oversight | Board meeting minutes | Quarterly |
| CC1.3 | Organizational structure | `CODEOWNERS`, org chart | As needed |

### CC2 - Communication and Information

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| CC2.1 | Internal communication | Slack channels, incident logs | Continuous |
| CC2.2 | External communication | Status page, customer notifications | As needed |
| CC2.3 | System documentation | `docs/`, `ARCHITECTURE_SUMMARY.md` | Continuous |

### CC6 - Logical and Physical Access Controls

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| CC6.1 | Logical access controls | `packages/server/src/auth/`, RLS policies | Continuous |
| CC6.2 | User access reviews | Admin console audit logs | Quarterly |
| CC6.3 | Access removal | Audit logs | As needed |
| CC6.4 | Password policies | Supabase Auth config | Continuous |
| CC6.5 | Multi-factor authentication | MFA enforcement logs | Continuous |

### CC7 - System Operations

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| CC7.1 | System monitoring | Grafana dashboards, Prometheus metrics | Continuous |
| CC7.2 | Incident response | `docs/INCIDENT_RUNBOOK.md`, incident logs | Continuous |
| CC7.3 | Backup and recovery | `docs/DR_BCP.md`, backup logs | Daily |
| CC7.4 | Change management | `docs/CHANGE_MANAGEMENT.md`, GitHub PR logs | Continuous |

### CC8 - Change Management

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| CC8.1 | Change approval process | `docs/CHANGE_MANAGEMENT.md` | Continuous |
| CC8.2 | Code review | GitHub PR reviews | Continuous |
| CC8.3 | Testing procedures | Test coverage reports | Continuous |
| CC8.4 | Deployment controls | `.github/workflows/deploy.yml` | Continuous |

## ISO 27001 Controls

### A.5 - Information Security Policies

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| A.5.1.1 | Information security policies | `SECURITY_CHECKLIST.md` | Annually |
| A.5.1.2 | Policy review | Policy review logs | Annually |

### A.9 - Access Control

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| A.9.2.1 | User registration | Admin console audit logs | Continuous |
| A.9.2.3 | Access provisioning | Audit logs | As needed |
| A.9.2.5 | Access review | Quarterly access reviews | Quarterly |
| A.9.4.2 | Secure log-on procedures | Auth implementation | Continuous |

### A.12 - Operations Security

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| A.12.4.1 | Event logging | Loki logs, audit logs | Continuous |
| A.12.4.2 | Log protection | Log encryption, access controls | Continuous |
| A.12.4.3 | Clock synchronization | NTP configuration | Continuous |

### A.14 - System Acquisition, Development, and Maintenance

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| A.14.2.1 | Secure development policy | Security guidelines | Continuous |
| A.14.2.5 | System security testing | Security scan reports | Continuous |
| A.14.2.8 | System security testing | `.github/workflows/security.yml` | Continuous |

### A.17 - Information Security Aspects of Business Continuity Management

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| A.17.1.1 | Business continuity planning | `docs/DR_BCP.md` | Quarterly |
| A.17.1.2 | Disaster recovery testing | DR drill reports | Quarterly |
| A.17.2.1 | Redundancy | Multi-region setup docs | Continuous |

### A.18 - Compliance

| Control ID | Control Description | Evidence Location | Frequency |
|-----------|-------------------|-------------------|-----------|
| A.18.1.1 | Legal requirements | Privacy policy, GDPR compliance | Continuous |
| A.18.1.3 | Protection of records | Data retention policies | Continuous |
| A.18.1.4 | Privacy and PII protection | `README_SQL_PARTS.md`, RLS policies | Continuous |

## Evidence Artifacts

### Code Repository
- **Location**: GitHub repository
- **Evidence**: Source code, commit history, PR reviews
- **Retention**: Permanent

### Audit Logs
- **Location**: Supabase audit tables, Loki
- **Retention**: 1 year
- **Access**: Admin console only

### Incident Logs
- **Location**: Admin console incidents, post-mortems
- **Retention**: 2 years
- **Access**: Engineering team

### Backup Records
- **Location**: Backup bucket, backup logs
- **Retention**: 30 days (7 years for evidence)
- **Access**: DevOps team

### Security Scan Reports
- **Location**: GitHub Security tab, Snyk dashboard
- **Retention**: 1 year
- **Access**: Security team

### Monitoring Dashboards
- **Location**: Grafana (metrics), Loki (logs), Tempo (traces)
- **Retention**: 90 days (metrics), 30 days (logs)
- **Access**: Engineering team

### Change Management Records
- **Location**: GitHub PRs, deployment logs
- **Retention**: Permanent
- **Access**: Engineering team

## Evidence Export

Run the evidence bundle script to generate a complete evidence package:

```bash
pnpm evidence:bundle
```

This generates a ZIP file containing:
- All documentation
- Recent audit logs (anonymized)
- Security scan reports
- Incident logs
- Backup verification records
- Compliance attestations

## Compliance Attestations

### SOC 2 Type II
- **Auditor**: [Auditor Name]
- **Period**: [Audit Period]
- **Report Date**: [Report Date]
- **Status**: In Progress

### ISO 27001
- **Certification Body**: [CB Name]
- **Certification Date**: [Cert Date]
- **Status**: In Progress
- **Next Audit**: [Next Audit Date]

## Control Testing Schedule

| Control Category | Testing Frequency | Last Test | Next Test |
|----------------|------------------|-----------|-----------|
| Access Controls | Quarterly | [Date] | [Date] |
| Backup & Recovery | Monthly | [Date] | [Date] |
| Change Management | Continuous | N/A | N/A |
| Incident Response | Quarterly | [Date] | [Date] |
| Security Scanning | Continuous | N/A | N/A |
| Disaster Recovery | Quarterly | [Date] | [Date] |

## Contact Information

- **Compliance Officer**: [Contact]
- **Security Team**: [Contact]
- **Auditor Contact**: [Contact]

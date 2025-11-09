# RACI Matrix — Roles & Responsibilities

**Generated:** 2025-01-XX  
**Framework:** RACI (Responsible, Accountable, Consulted, Informed)

## Legend

- **R (Responsible):** Does the work
- **A (Accountable):** Owns the outcome (only one per activity)
- **C (Consulted):** Provides input before/during
- **I (Informed):** Notified after completion

## Deployment Activities

| Activity | Platform Team | DevOps Team | Frontend Team | Backend Team | Security Team | QA Team |
|----------|---------------|-------------|--------------|-------------|---------------|---------|
| **Code Deployment** | R | A | R | R | C | I |
| **Database Migration** | C | A | I | R | C | C |
| **Infrastructure Changes** | C | A | I | I | C | I |
| **Feature Flag Toggle** | R | I | R | R | I | I |
| **Rollback** | C | A | R | R | C | I |

## Incident Response

| Activity | Platform Team | DevOps Team | Frontend Team | Backend Team | Security Team | On-Call |
|----------|---------------|-------------|--------------|-------------|---------------|---------|
| **Incident Detection** | I | I | I | I | I | A |
| **Incident Triage** | C | C | C | C | C | A |
| **Incident Resolution** | R | R | R | R | R | A |
| **Post-Mortem** | C | A | C | C | C | R |
| **Follow-Up Actions** | R | A | R | R | C | I |

## Schema Changes

| Activity | Platform Team | Backend Team | Database Team | Security Team | QA Team |
|----------|---------------|--------------|--------------|---------------|---------|
| **Schema Design** | C | R | A | C | C |
| **Migration Creation** | I | R | A | C | C |
| **Migration Review** | C | C | A | C | R |
| **Migration Execution** | I | R | A | I | I |
| **Rollback Plan** | C | R | A | C | C |

## Code Review

| Activity | Author | Reviewer | Tech Lead | QA Team |
|----------|--------|----------|-----------|---------|
| **PR Creation** | A | I | I | I |
| **Code Review** | R | A | C | C |
| **Addressing Feedback** | A | C | I | I |
| **Merge Approval** | R | A | C | I |
| **Deployment** | I | I | A | I |

## Security & Compliance

| Activity | Security Team | Platform Team | DevOps Team | All Teams |
|----------|---------------|---------------|-------------|-----------|
| **Security Audit** | A | C | C | I |
| **Vulnerability Remediation** | A | R | R | I |
| **Compliance Review** | A | C | C | I |
| **Secret Rotation** | A | R | R | I |
| **Access Management** | A | C | C | I |

## Notes

- **Accountable (A):** Only one person/team per activity
- **Responsible (R):** Can be multiple people/teams
- **Roles inferred from:** CODEOWNERS file, PR history, team structure
- **TBD:** Marked where role is unclear — needs team discussion

## Team Definitions (Inferred)

- **Platform Team:** Owns shared packages, tooling, infrastructure
- **DevOps Team:** Owns CI/CD, deployments, infrastructure
- **Frontend Team:** Owns `apps/web`, UI components
- **Backend Team:** Owns API routes, server logic, database
- **Security Team:** Owns security audits, compliance
- **QA Team:** Owns testing, quality assurance
- **On-Call:** Rotating responsibility for incidents

## Updates Required

This RACI matrix should be reviewed and updated:
- Quarterly or when team structure changes
- When new activities are added
- When responsibilities shift

---

**Note:** Roles are inferred from CODEOWNERS and repository structure. Actual teams should review and confirm.

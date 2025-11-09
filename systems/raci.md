# RACI Matrix — Roles & Responsibilities

**Generated:** 2025-01-09

## Legend

- **R** = Responsible (does the work)
- **A** = Accountable (owns the outcome)
- **C** = Consulted (provides input)
- **I** = Informed (kept in loop)

## Deployments

| Activity | Frontend Team | Backend Team | DevOps Team | Team Leads | Security Team |
|----------|---------------|--------------|-------------|------------|---------------|
| **Deploy to Staging** | R | C | R | A | I |
| **Deploy to Production** | R | C | R | A | C |
| **Rollback** | R | C | R | A | I |
| **Deploy Approval** | I | I | I | A | C |

**Notes:**
- Team Leads are accountable for production deploys
- Security Team consulted for production (not staging)
- DevOps handles infrastructure, teams handle code

## Incidents

| Activity | On-Call Engineer | Team Leads | DevOps Team | Security Team | Product Team |
|----------|------------------|------------|-------------|---------------|--------------|
| **Incident Detection** | R | I | I | I | I |
| **Initial Response** | R | A | C | I | I |
| **Root Cause Analysis** | R | A | C | C | I |
| **Fix Implementation** | R | A | C | I | I |
| **Post-Mortem** | C | A | C | C | I |

**Notes:**
- On-Call Engineer is first responder
- Team Leads accountable for resolution
- Security consulted for security-related incidents

## Schema Changes

| Activity | Backend Team | Database Team | DevOps Team | Team Leads | Frontend Team |
|----------|--------------|---------------|-------------|------------|---------------|
| **Schema Design** | R | C | I | A | C |
| **Migration Creation** | R | R | I | A | I |
| **Migration Review** | C | A | C | A | I |
| **Migration Execution** | R | R | R | A | I |
| **Rollback Plan** | R | R | R | A | I |

**Notes:**
- Database Team accountable for migration safety
- Frontend Team consulted for breaking changes
- Rollback plan required for all migrations

## Code Reviews

| Activity | Author | Reviewer | Team Leads | QA Team |
|----------|--------|----------|------------|---------|
| **PR Creation** | R | I | I | I |
| **Code Review** | I | R | C | I |
| **Approval** | I | R | A | I |
| **Merge** | R | I | A | I |

**Notes:**
- Reviewer responsible for quality
- Team Leads accountable for approval
- QA informed but not blocking (unless required)

## Security

| Activity | Security Team | Developers | Team Leads | DevOps |
|----------|---------------|------------|------------|--------|
| **Security Audit** | R | C | A | C |
| **Vulnerability Fix** | C | R | A | I |
| **Secret Rotation** | R | I | A | R |
| **Access Management** | R | I | A | C |

**Notes:**
- Security Team owns security processes
- Developers implement fixes
- DevOps handles secret rotation infrastructure

## TBD (To Be Determined)

The following roles are inferred from CODEOWNERS but need confirmation:

- **Platform Team** - Owns packages/* (needs clarification)
- **Mobile Team** - Owns apps/mobile (needs clarification)
- **Docs Team** - Owns documentation (needs clarification)

**Action:** Review CODEOWNERS and confirm with team leads.

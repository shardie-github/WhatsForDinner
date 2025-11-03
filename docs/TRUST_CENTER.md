# Nomad Platform Trust Center

## Compliance & Security Controls Matrix

This document outlines the security, privacy, availability, and integrity controls implemented in the Nomad Admin Ops & Trust Center.

---

## Table of Contents

1. [Security Controls](#security-controls)
2. [Privacy Controls](#privacy-controls)
3. [Availability Controls](#availability-controls)
4. [Integrity Controls](#integrity-controls)
5. [SOC 2 Mapping](#soc-2-mapping)
6. [ISO 27001 Mapping](#iso-27001-mapping)
7. [Evidence Collection](#evidence-collection)

---

## Security Controls

### Authentication & Authorization

| Control ID | Control Name | Implementation |
|-----------|--------------|---------------|
| AUTH-001 | Multi-factor authentication (2FA) | TOTP/Email OTP enforced for admin users |
| AUTH-002 | Role-based access control (RBAC) | Four roles: superadmin, finance, reviewer, support |
| AUTH-003 | Least privilege principle | Permission-based action checks (`canPerformAction`) |
| AUTH-004 | Session management | JWT tokens with configurable expiry (default 8h) |
| AUTH-005 | Admin token rotation | Token minting with unique secrets per environment |

**Evidence:**
- `packages/server/src/auth/admin.ts` - Admin authentication implementation
- Admin user table with `status`, `role`, `last_login_at` fields
- JWT issuer/audience validation

### Network Security

| Control ID | Control Name | Implementation |
|-----------|--------------|---------------|
| NET-001 | mTLS/VPN requirement | Admin routes require VPN allowlist (env: `VPN_ALLOWLIST_IPS`) |
| NET-002 | Content Security Policy | Strict CSP headers via `packages/server/src/security/helmet.ts` |
| NET-003 | IP allowlisting | Middleware checks request IP against allowlist |

### Data Protection

| Control ID | Control Name | Implementation |
|-----------|--------------|---------------|
| DATA-001 | PII masking in UI | Default hash display, unmask requires permission |
| DATA-002 | Encryption at rest | Database encryption (managed by Supabase/PostgreSQL) |
| DATA-003 | Encryption in transit | TLS 1.3 for all API communications |
| DATA-004 | Data access logging | All admin actions logged to `data_access_logs` table |

---

## Privacy Controls

### Data Classification

| Category | Retention Days | Auto Purge | Example Tables |
|----------|---------------|------------|----------------|
| `clicks` | 365 | Yes | `clicks` |
| `conversions` | 730 | Yes | `conversions` |
| `events` | 180 | Yes | `events` |
| `audit_logs` | 1825 (5 years) | No | `audit_logs` |

**Implementation:** `packages/server/src/jobs/retentionRunner.ts`

### GDPR Compliance

- **Right to Access**: Admin can export user data via `/api/admin/audit?entity=user&entity_id=<id>`
- **Right to Erasure**: Soft-delete via retention policies, manual purge via governance UI
- **Data Portability**: CSV/JSON export from audit logs API

### Data Minimization

- Retention policies automatically purge expired records
- Admin actions filtered by date range in audit queries
- PII only displayed when necessary (masked by default)

---

## Availability Controls

### High Availability

| Control ID | Control Name | Implementation |
|-----------|--------------|---------------|
| AVAIL-001 | Database replication | Managed by Supabase (PostgreSQL HA) |
| AVAIL-002 | Health checks | `/api/admin/healthz` endpoint |
| AVAIL-003 | Incident response SLA | Severity-based reminders (critical: 1h, major: 4h, low: 24h) |

### Monitoring & Alerting

- SIEM event emission (env: `SIEM_ENDPOINT`)
- Audit log tamper detection runs daily
- Weekly incident digest emails to admins

---

## Integrity Controls

### Audit Trail

| Control ID | Control Name | Implementation |
|-----------|--------------|---------------|
| INT-001 | Immutable audit logs | Append-only `audit_logs` table with RLS |
| INT-002 | Cryptographic signatures | SHA-256 HMAC on every audit entry |
| INT-003 | Tamper detection | Daily background job verifies all signatures |
| INT-004 | Dual approval | Admin overrides require two reviewers |

**Signature Algorithm:**
```
signature = HMAC-SHA256(
  secret: AUDIT_SECRET + AUDIT_SALT,
  payload: JSON.stringify({actor_id, entity_kind, action, before, after, ts})
)
```

### Change Management

- All mutations require `reason` field in audit log
- Campaign/creative approvals require reviewer role
- Payout approvals require finance role

---

## SOC 2 Mapping

### CC1: Control Environment

| Trust Criteria | Implementation |
|----------------|----------------|
| Management commitment | Admin roles with `superadmin` oversight |
| Code of conduct | RBAC enforces separation of duties |
| Ethics | Audit logs capture all actions with reasons |

**Evidence:** Admin user management, role hierarchy, audit logs

### CC2: Communication & Information

| Trust Criteria | Implementation |
|----------------|----------------|
| External communication | SIEM events sent to external endpoint |
| Incident reporting | Incident management system with timeline |
| Policy communication | Trust Center documentation (this document) |

**Evidence:** SIEM integration, incidents table, docs

### CC3: Risk Assessment

| Trust Criteria | Implementation |
|----------------|----------------|
| Risk identification | Fraud signals table, moderation queue |
| Risk monitoring | Dashboard metrics, fraud alerts |
| Risk response | Incident severity levels, SLA tracking |

**Evidence:** `fraud_signals`, `moderation_queue`, dashboard API

### CC4: Monitoring Activities

| Trust Criteria | Implementation |
|----------------|----------------|
| Ongoing monitoring | Audit log verification, retention policy runs |
| Separate evaluations | Weekly digest, incident reviews |
| Management review | Admin dashboard metrics |

**Evidence:** Retention runner, incident digest, dashboard

### CC5: Control Activities

| Trust Criteria | Implementation |
|----------------|----------------|
| Preventative controls | RBAC, 2FA, VPN allowlist |
| Detective controls | Audit logs, fraud signals |
| Corrective controls | Incident response, moderation takedowns |

**Evidence:** Auth middleware, audit system, incidents service

### CC6: Logical Access

| Trust Criteria | Implementation |
|----------------|----------------|
| Access provisioning | Admin user creation with role assignment |
| Access reviews | Admin status tracking, last_login_at |
| Access termination | Admin status: suspended, audit log retention |

**Evidence:** `admin_users` table, auth middleware

### CC7: System Operations

| Trust Criteria | Implementation |
|----------------|----------------|
| Change management | Audit logs for all mutations |
| Backup & recovery | Database backups (Supabase managed) |
| Problem management | Incident management system |

**Evidence:** Audit logs, incidents table

---

## ISO 27001 Mapping

### A.9 Access Control

- **A.9.1.1**: Access control policy ? RBAC roles defined
- **A.9.2.1**: User registration ? Admin user creation with audit log
- **A.9.2.3**: Management of privileged access ? Superadmin role
- **A.9.4.2**: Secure log-on ? JWT tokens, 2FA

### A.12 Operations Security

- **A.12.4.1**: Event logging ? Audit logs with signatures
- **A.12.4.3**: Administrator and operator logs ? Admin-specific audit logs
- **A.12.6.1**: Management of technical vulnerabilities ? Incident tracking

### A.17 Information Security Aspects of Business Continuity Management

- **A.17.1.2**: Implementing information security continuity ? Incident response with SLA

### A.18 Compliance

- **A.18.1.1**: Identification of applicable legislation ? GDPR retention policies
- **A.18.1.2**: Intellectual property rights ? Data classification registry
- **A.18.2.1**: Independent review of information security ? Weekly incident digest

---

## Evidence Collection

### Automated Evidence

1. **Audit Log Signatures**: Daily verification job logs results
2. **Retention Policy Runs**: Execution logs stored in `retention_policies.last_run_at`
3. **Incident Timelines**: All incident actions stored in JSON timeline
4. **Data Access Logs**: Every admin read/export logged to `data_access_logs`

### Manual Evidence

1. **Admin User List**: Export from `admin_users` table
2. **Role Assignments**: Audit logs filtered by `action: 'role_assigned'`
3. **Payout Approvals**: Audit logs filtered by `entity_kind: 'payout', action: 'approve'`

### Export Commands

```bash
# Export audit logs (CSV)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://admin.nomad.app/api/admin/audit?from=2024-01-01&to=2024-12-31&format=csv" \
  > audit_logs_2024.csv

# Export incidents
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "https://admin.nomad.app/api/admin/incidents" \
  > incidents.json

# Verify audit signatures
npm run verify-audit-signatures
```

---

## CLI Commands

### Audit Verification

```bash
# Verify all audit log signatures
npm run verify-audit

# Expected output:
# Total: 15234
# Valid: 15234
# Invalid: 0
```

### Retention Policy Preview

```bash
# Dry-run retention policies
npm run retention:preview

# Run retention policies (with confirmation)
npm run retention:run -- --confirm
```

### Seed Default Admin

```bash
# Create default superadmin account
npm run seed:admin -- --email admin@nomad.app --role superadmin

# Default credentials:
# Email: admin@nomad.app
# Password: [generated, check console]
# 2FA: [setup required on first login]
```

---

## Contact

For security concerns or compliance inquiries:
- Security: security@nomad.app
- Compliance: compliance@nomad.app
- Trust Center: https://admin.nomad.app/trust-center

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0  
**Classification:** Internal

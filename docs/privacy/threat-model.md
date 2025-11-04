/**
 * Threat Model for Privacy-First Usage Monitoring
 */

# Privacy Monitoring Threat Model

## Overview

This document outlines the threat model for the privacy-first usage monitoring system, including identified risks, controls, and residual risk.

## Assets

### Primary Assets
- User telemetry data (encrypted at rest)
- Privacy preferences and consent records
- Transparency logs (immutable audit trail)
- MFA session tokens

### Secondary Assets
- System health metrics (aggregate only, no PII)
- API endpoints
- Database access credentials

## Threat Actors

1. **External Attackers**: Attempting to access user telemetry
2. **Insiders**: Staff/admin attempting to access user data
3. **Users**: Attempting to access other users' data
4. **Malicious Apps**: Attempting to inject PII into telemetry

## Threat Scenarios

### T1: Token Theft and Replay
**Description**: Attacker steals authentication token and uses it to access user telemetry.

**Likelihood**: Medium  
**Impact**: High  
**Risk**: High

**Controls**:
- JWT tokens with short expiration
- HTTPS-only communication
- Rate limiting on API endpoints
- MFA for sensitive actions
- RLS policies prevent cross-user access

**Residual Risk**: Low (MFA required for sensitive actions)

### T2: MFA Bypass
**Description**: Attacker bypasses MFA requirement to access sensitive telemetry.

**Likelihood**: Low  
**Impact**: High  
**Risk**: Medium

**Controls**:
- TOTP + backup codes
- Time-boxed elevated sessions (15 minutes)
- Session tokens stored securely
- MFA verification required for each sensitive action

**Residual Risk**: Low (multiple layers of MFA enforcement)

### T3: Link Sharing/Export URL Reuse
**Description**: Attacker gains access to export URL after expiry or shares it.

**Likelihood**: Medium  
**Impact**: Medium  
**Risk**: Medium

**Controls**:
- Signed URLs with expiration (24 hours)
- Single-use tokens for exports
- Rate limiting on export endpoints
- Audit logging of all exports

**Residual Risk**: Low (time-boxed URLs, single-use tokens)

### T4: Insider Access (Staff/Admin)
**Description**: Staff or admin attempts to access user telemetry for debugging or support.

**Likelihood**: Low  
**Impact**: High  
**Risk**: Medium

**Controls**:
- Zero-trust RLS policies (no admin bypass)
- Guardian role can only access aggregate metrics
- No service-wide superuser reads
- Audit logging of all access attempts
- Negative tests prove admin cannot access user data

**Residual Risk**: Low (RLS enforced at database level)

### T5: Inference Attacks
**Description**: Attacker uses metadata patterns to infer sensitive information.

**Likelihood**: Low  
**Impact**: Low  
**Risk**: Low

**Controls**:
- Local-first redaction removes sensitive fields
- Sampling rates reduce data volume
- User controls what signals are collected
- Metadata-only collection by default

**Residual Risk**: Low (minimal data collection, user-controlled)

### T6: PII Injection into Logs
**Description**: Malicious code or user attempts to inject PII into telemetry events.

**Likelihood**: Medium  
**Impact**: Medium  
**Risk**: Medium

**Controls**:
- Client-side redaction strips sensitive fields
- Server-side validation rejects PII patterns
- CI/CD gates scan for disallowed fields
- Encryption at rest for sensitive payloads

**Residual Risk**: Low (multiple layers of redaction and validation)

### T7: Database Compromise
**Description**: Attacker gains direct database access and attempts to read encrypted telemetry.

**Likelihood**: Low  
**Impact**: High  
**Risk**: Medium

**Controls**:
- Encryption at rest (pgcrypto)
- RLS policies prevent unauthorized reads
- Encrypted payloads require decryption key
- Database access credentials stored securely
- Network isolation for database

**Residual Risk**: Low (encryption + RLS + access controls)

### T8: Kill Switch Bypass
**Description**: Attacker or misconfiguration bypasses privacy kill-switch.

**Likelihood**: Low  
**Impact**: High  
**Risk**: Low

**Controls**:
- Environment-level kill switch (`PRIVACY_KILL_SWITCH=true`)
- Runtime check in all collection paths
- CI/CD tests verify kill switch behavior
- Monitoring alerts if kill switch disabled

**Residual Risk**: Low (environment-level enforcement)

## Controls Summary

### Technical Controls
1. Row-Level Security (RLS) with zero-trust policies
2. Encryption at rest (pgcrypto)
3. HTTPS-only communication
4. MFA enforcement for sensitive actions
5. Time-boxed elevated sessions
6. Local-first redaction
7. Rate limiting
8. Signed URLs with expiration
9. Audit logging (immutable transparency log)

### Administrative Controls
1. Privacy kill-switch (environment-level)
2. Guardian role (aggregate metrics only)
3. Negative tests (prove admin cannot access user data)
4. CI/CD gates (privacy compliance checks)
5. Regular security audits

### Operational Controls
1. Monitoring and alerting
2. Incident response procedures
3. Regular threat model reviews
4. Privacy policy updates
5. User education and transparency

## Residual Risk

Overall residual risk: **Low**

All identified threats have multiple layers of controls, and residual risk is low for all scenarios. The zero-trust architecture ensures that even if one control fails, others provide defense in depth.

## Testing & Validation

### Red Team Tests
1. Attempt to access another user's telemetry → Must fail
2. Retrieve telemetry without MFA → Must fail
3. Reuse export link after expiry → Must fail
4. Inject PII into logs → Must be blocked
5. Admin attempt to read user telemetry → Must fail
6. Bypass kill switch → Must fail

### Compliance Tests
1. RLS enabled on all privacy tables → Must pass
2. MFA enforced for sensitive routes → Must pass
3. Privacy lints detect disallowed fields → Must pass
4. Policy file present → Must pass
5. Consent UI functional → Must pass

## Review Schedule

- Threat model review: Quarterly
- Controls effectiveness review: Quarterly
- Red team exercises: Annually
- Security audit: Annually

---

**Last Updated**: ${new Date().toISOString().split('T')[0]}  
**Next Review**: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}

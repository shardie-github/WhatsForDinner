# Security Posture

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

## Overview

This document outlines our security practices, controls, and measures to protect your data and ensure service reliability.

---

## Access Control

### Authentication

- **Multi-Factor Authentication (MFA):** Available for all accounts (optional but recommended)
  - TOTP (Time-based One-Time Password) support
  - Email-based OTP fallback
  - Recovery codes provided

- **Password Requirements:**
  - Minimum 8 characters
  - Complexity recommended (mix of letters, numbers, symbols)
  - Secure hashing (bcrypt with salt)
  - Password reset via email with rate limiting

- **Session Management:**
  - Secure JWT tokens
  - Configurable session expiry (default: 8 hours)
  - Token rotation on password change
  - Invalidate sessions on logout

### Authorization

- **Row-Level Security (RLS):** Database-level access control ensures users can only access their own data
  - Policies enforced at PostgreSQL level
  - Prevents unauthorized data access even if application logic fails

- **Least Privilege:** Applications use minimal database permissions
  - Separate roles for read/write operations
  - No direct database access for user-facing applications

- **API Authentication:** All API endpoints require authentication
  - Bearer token authentication
  - Rate limiting per user/IP
  - CORS policies restrict cross-origin access

### SSO/MFA Options

- **Single Sign-On (SSO):** Available for enterprise customers
- **Social Login:** Google, Apple (OAuth 2.0)
- **MFA Toggles:** Available in account settings
- **Admin Controls:** Organization admins can enforce MFA for members

---

## Data Protection

### Encryption

- **In Transit:** TLS 1.3 for all API communications
  - HTTPS enforced for all connections
  - HSTS headers prevent downgrade attacks
  - Certificate transparency monitoring

- **At Rest:** Database encryption managed by Supabase (PostgreSQL)
  - Full disk encryption
  - Encrypted backups
  - Key management via cloud provider

- **Secrets Management:**
  - Application secrets stored in environment variables
  - Never committed to version control
  - Rotation policy for sensitive credentials
  - Secrets scanning in CI/CD

### Data Classification

| Classification | Examples | Protection Level |
|---------------|----------|------------------|
| **Public** | Marketing pages, public recipes | No encryption required |
| **Internal** | Usage analytics, logs | Standard encryption |
| **Confidential** | Account data, pantry data | Enhanced encryption, RLS |
| **Restricted** | Payment data, passwords | Maximum encryption, strict access |

### PII Handling

- **Masking:** PII masked in logs and admin interfaces by default
- **Minimization:** Only collect data necessary for service operation
- **Retention:** Automatic deletion per retention policies
- **Access Logging:** All access to sensitive data logged

---

## Infrastructure Security

### Hosting & CDN

- **Application Hosting:** Vercel (edge network)
  - Global edge locations for low latency
  - Automatic DDoS protection
  - SSL/TLS termination at edge

- **Database Hosting:** Supabase (managed PostgreSQL)
  - Automated backups (daily)
  - Point-in-time recovery available
  - High availability configuration

- **CDN:** Global edge network for static assets
  - Cache invalidation on updates
  - DDoS protection
  - Geographic distribution

### Network Security

- **Firewall Rules:** Restrictive firewall policies
- **DDoS Protection:** Managed by hosting providers
- **WAF:** Web Application Firewall protects against common attacks
- **Rate Limiting:** API rate limits prevent abuse

### Monitoring & Alerting

- **24/7 Monitoring:** Continuous monitoring of services
- **Alerting:** Automated alerts for security incidents
- **Logging:** Comprehensive logging of security events
- **SIEM Integration:** Security events sent to SIEM (if configured)

---

## Dependency Security

### Dependency Scanning

- **Automated Scanning:** Dependabot/Renovate scans for vulnerabilities
- **Update Policy:** Security patches applied within 7 days
- **SBOM:** Software Bill of Materials maintained
- **License Compliance:** License scanning ensures compliance

### Supply Chain Security

- **Package Verification:** Verify package integrity before installation
- **Lock Files:** Lock files ensure reproducible builds
- **Source Verification:** Prefer official sources for dependencies

---

## Vulnerability Management

### Reporting

- **Security Email:** security@whatsfordinner.com
- **Response Time:** Critical issues within 24 hours
- **Disclosure Policy:** Responsible disclosure preferred
- **Bug Bounty:** Not currently available (future consideration)

### Remediation

- **Patch Management:** Security patches applied promptly
- **CVE Tracking:** Track and remediate known CVEs
- **Penetration Testing:** Periodic security assessments
- **Code Reviews:** Security-focused code reviews

---

## Incident Response

### Detection

- **Automated Detection:** Monitoring detects anomalies
- **Alerting:** Alerts trigger incident response
- **Logging:** Comprehensive logs aid investigation

### Response

- **Incident Response Plan:** Documented procedures
- **Communication:** Status page updates during incidents
- **Escalation:** Clear escalation paths for critical issues
- **Post-Mortem:** Post-incident reviews and improvements

### Recovery

- **Backup Strategy:** Daily backups with point-in-time recovery
- **DR Plan:** Disaster recovery procedures documented
- **Testing:** Regular DR drills ensure readiness

---

## Compliance

### Standards & Certifications

- **SOC 2:** Working toward SOC 2 Type II certification
- **GDPR:** Compliant with GDPR requirements
- **PIPEDA:** Compliant with Canadian privacy law
- **CCPA:** Compliant with California privacy law

### Audit Logging

- **Comprehensive Logs:** All admin actions logged
- **Tamper Detection:** Cryptographic signatures on audit logs
- **Retention:** Audit logs retained for 5 years
- **Access:** Audit logs accessible to authorized users only

---

## Security Controls Summary

| Control Area | Implementation |
|-------------|----------------|
| **Authentication** | MFA, secure passwords, JWT tokens |
| **Authorization** | RLS, least privilege, API auth |
| **Encryption** | TLS 1.3, encryption at rest |
| **Monitoring** | 24/7 monitoring, alerting |
| **Dependency Security** | Automated scanning, updates |
| **Incident Response** | Documented procedures, DR plan |
| **Compliance** | GDPR, PIPEDA, CCPA compliant |

---

## Security Best Practices for Users

1. **Enable MFA:** Multi-factor authentication adds an extra layer of security
2. **Use Strong Passwords:** Use unique, complex passwords
3. **Keep Software Updated:** Keep your browser and OS updated
4. **Be Wary of Phishing:** Verify emails and links before clicking
5. **Review Permissions:** Regularly review app permissions and connected accounts

---

## Contact

### Security Issues
- **Email:** security@whatsfordinner.com
- **Response Time:** Critical issues within 24 hours

### General Inquiries
- **Email:** support@whatsfordinner.com
- **Help Center:** [/help](/help)

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

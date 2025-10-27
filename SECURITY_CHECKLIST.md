# Security Checklist

This checklist covers comprehensive security controls, vulnerability scanning, and security hardening for What's For Dinner.

## Overview

Security controls ensure the application is protected against common threats through:
- **Secret Scanning**: Detect and prevent secret leaks
- **Dependency Scanning**: Identify vulnerable dependencies
- **Security Headers**: Implement security headers and policies
- **Authentication**: Secure authentication and authorization
- **Data Protection**: Encrypt sensitive data and protect privacy

## Quick Start

### 1. Run Security Scans

```bash
# Run all security scans
pnpm run security:audit

# Scan dependencies for vulnerabilities
pnpm run security:deps

# Scan for secrets
pnpm run security:secrets

# Check security headers
pnpm run security:headers
```

### 2. Security Hardening

```bash
# Apply security hardening
pnpm run security:harden

# Update security policies
pnpm run security:policies

# Generate security report
pnpm run security:report
```

## Security Controls

### 1. Secret Scanning

#### Secrets to Scan
- **API Keys**: OpenAI, Stripe, Supabase, etc.
- **Database Credentials**: Connection strings, passwords
- **JWT Secrets**: Signing keys and tokens
- **OAuth Credentials**: Client secrets and tokens
- **Encryption Keys**: AES, RSA keys
- **Environment Variables**: Sensitive configuration

#### Secret Detection Patterns
```regex
# API Keys
/api[_-]?key[_-]?[a-zA-Z0-9]{20,}/i
/sk_[a-zA-Z0-9]{24,}/
/pk_[a-zA-Z0-9]{24,}/

# Database URLs
/postgres:\/\/[^:]+:[^@]+@[^\/]+\/[^\/]+/
/mysql:\/\/[^:]+:[^@]+@[^\/]+\/[^\/]+/

# JWT Secrets
/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/

# OAuth
/client_secret[_-]?[a-zA-Z0-9]{20,}/i
/oauth[_-]?token[_-]?[a-zA-Z0-9]{20,}/i
```

#### Prevention Measures
- Use environment variables for secrets
- Implement secret rotation
- Use secret management services
- Regular secret scanning in CI/CD
- Code review for secret handling

### 2. Dependency Vulnerability Scanning

#### Vulnerability Types
- **Known CVEs**: Common Vulnerabilities and Exposures
- **Outdated Dependencies**: Packages with security updates
- **Malicious Packages**: Packages with malicious code
- **License Violations**: Incompatible licenses
- **Supply Chain Attacks**: Compromised dependencies

#### Scanning Tools
- **npm audit**: Built-in vulnerability scanning
- **Snyk**: Advanced vulnerability detection
- **OWASP Dependency Check**: Comprehensive scanning
- **GitHub Security Advisories**: GitHub's vulnerability database

#### Vulnerability Severity
- **Critical**: Immediate action required
- **High**: Fix within 24 hours
- **Medium**: Fix within 7 days
- **Low**: Fix within 30 days

### 3. Security Headers

#### Required Headers
```http
# Content Security Policy
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'

# X-Frame-Options
X-Frame-Options: DENY

# X-Content-Type-Options
X-Content-Type-Options: nosniff

# Referrer Policy
Referrer-Policy: strict-origin-when-cross-origin

# Permissions Policy
Permissions-Policy: camera=(), microphone=(), geolocation=()

# Strict Transport Security
Strict-Transport-Security: max-age=31536000; includeSubDomains

# X-XSS-Protection
X-XSS-Protection: 1; mode=block
```

#### Header Implementation
```typescript
// Next.js middleware
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CSP
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  
  return response;
}
```

### 4. Authentication Security

#### Password Security
- **Minimum Length**: 12 characters
- **Complexity**: Mix of uppercase, lowercase, numbers, symbols
- **Hashing**: Use bcrypt with salt rounds ≥ 12
- **Rate Limiting**: Limit login attempts
- **Password History**: Prevent password reuse

#### Session Security
- **Secure Cookies**: HttpOnly, Secure, SameSite
- **Session Timeout**: 30 minutes of inactivity
- **Session Rotation**: Rotate on privilege change
- **Concurrent Sessions**: Limit active sessions

#### Multi-Factor Authentication
- **TOTP**: Time-based one-time passwords
- **SMS**: SMS-based verification
- **Hardware Tokens**: FIDO2/WebAuthn support
- **Backup Codes**: Recovery codes for account recovery

### 5. Data Protection

#### Encryption at Rest
- **Database**: Encrypt sensitive columns
- **Files**: Encrypt uploaded files
- **Backups**: Encrypt backup data
- **Logs**: Encrypt log files

#### Encryption in Transit
- **HTTPS**: TLS 1.3 for all communications
- **API**: Encrypt API communications
- **Database**: Encrypt database connections
- **Internal**: Encrypt internal service communication

#### Data Classification
- **Public**: No protection required
- **Internal**: Basic protection
- **Confidential**: Strong protection
- **Restricted**: Maximum protection

### 6. Input Validation

#### SQL Injection Prevention
```typescript
// Use parameterized queries
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// Validate input types
const userId = parseInt(req.params.id);
if (isNaN(userId)) {
  throw new Error('Invalid user ID');
}
```

#### XSS Prevention
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(userInput);

// Use CSP headers
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'";
```

#### CSRF Protection
```typescript
// CSRF tokens
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// SameSite cookies
app.use(session({
  cookie: {
    sameSite: 'strict',
    secure: true,
    httpOnly: true
  }
}));
```

## Security Monitoring

### 1. Logging and Monitoring

#### Security Events
- **Authentication**: Login attempts, failures, successes
- **Authorization**: Permission checks, access denials
- **Data Access**: Sensitive data access, modifications
- **System Events**: Configuration changes, errors
- **Network Events**: Suspicious network activity

#### Log Format
```json
{
  "timestamp": "2024-12-19T10:00:00Z",
  "level": "WARN",
  "event": "security",
  "type": "failed_login",
  "user_id": "123",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "details": {
    "reason": "invalid_password",
    "attempts": 3
  }
}
```

### 2. Alerting

#### Critical Alerts
- **Multiple Failed Logins**: > 5 attempts in 5 minutes
- **Suspicious Activity**: Unusual access patterns
- **Data Breach**: Unauthorized data access
- **System Compromise**: Unauthorized system access

#### Warning Alerts
- **High Error Rate**: > 10% error rate
- **Resource Usage**: High CPU/memory usage
- **Network Anomalies**: Unusual network traffic
- **Configuration Changes**: Security-related changes

### 3. Incident Response

#### Response Plan
1. **Detection**: Identify security incident
2. **Assessment**: Evaluate severity and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threat and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Improve security posture

#### Communication
- **Internal**: Notify security team and management
- **External**: Notify customers if data affected
- **Regulatory**: Comply with reporting requirements
- **Public**: Prepare public statements if needed

## Security Testing

### 1. Automated Testing

#### Static Analysis
- **Code Scanning**: SAST tools for code vulnerabilities
- **Dependency Scanning**: Automated dependency checks
- **Secret Scanning**: Automated secret detection
- **Configuration Scanning**: Security configuration checks

#### Dynamic Analysis
- **Penetration Testing**: Automated vulnerability scanning
- **DAST Tools**: Dynamic application security testing
- **API Testing**: API security testing
- **Infrastructure Testing**: Infrastructure security scanning

### 2. Manual Testing

#### Security Review
- **Code Review**: Security-focused code review
- **Architecture Review**: Security architecture assessment
- **Threat Modeling**: Identify potential threats
- **Risk Assessment**: Evaluate security risks

#### Penetration Testing
- **External Testing**: Test from outside the network
- **Internal Testing**: Test from inside the network
- **Social Engineering**: Test human vulnerabilities
- **Physical Security**: Test physical access controls

## Compliance

### 1. Regulatory Compliance

#### GDPR (EU)
- **Data Protection**: Protect personal data
- **Consent Management**: Obtain explicit consent
- **Right to Erasure**: Allow data deletion
- **Data Portability**: Allow data export
- **Privacy by Design**: Build privacy into systems

#### CCPA (California)
- **Data Transparency**: Disclose data collection
- **Consumer Rights**: Allow data access and deletion
- **Opt-out**: Allow data sale opt-out
- **Non-discrimination**: Don't discriminate for exercising rights

#### HIPAA (Healthcare)
- **Administrative Safeguards**: Security policies and procedures
- **Physical Safeguards**: Physical access controls
- **Technical Safeguards**: Technical security measures
- **Breach Notification**: Notify of data breaches

### 2. Security Standards

#### OWASP Top 10
- **A01: Broken Access Control**
- **A02: Cryptographic Failures**
- **A03: Injection**
- **A04: Insecure Design**
- **A05: Security Misconfiguration**
- **A06: Vulnerable Components**
- **A07: Authentication Failures**
- **A08: Software and Data Integrity**
- **A09: Security Logging Failures**
- **A10: Server-Side Request Forgery**

#### NIST Cybersecurity Framework
- **Identify**: Asset management, risk assessment
- **Protect**: Access control, data security
- **Detect**: Monitoring, detection processes
- **Respond**: Response planning, communications
- **Recover**: Recovery planning, improvements

## Security Tools

### 1. Scanning Tools

#### Secret Scanning
- **GitGuardian**: Secret detection and monitoring
- **TruffleHog**: Secret scanning for Git repos
- **GitLeaks**: Secret scanning tool
- **Detect-secrets**: Pre-commit hook for secrets

#### Dependency Scanning
- **Snyk**: Vulnerability scanning and monitoring
- **OWASP Dependency Check**: Open source scanning
- **GitHub Security Advisories**: GitHub's vulnerability database
- **npm audit**: Built-in npm vulnerability scanning

#### Security Headers
- **Security Headers**: Online security header testing
- **Mozilla Observatory**: Security configuration testing
- **SSL Labs**: SSL/TLS configuration testing
- **HackerTarget**: Security testing tools

### 2. Monitoring Tools

#### SIEM (Security Information and Event Management)
- **Splunk**: Enterprise SIEM platform
- **ELK Stack**: Open source log analysis
- **Wazuh**: Open source SIEM
- **Azure Sentinel**: Cloud-native SIEM

#### Vulnerability Management
- **Nessus**: Vulnerability scanning
- **OpenVAS**: Open source vulnerability scanner
- **Qualys**: Cloud-based vulnerability management
- **Rapid7**: Vulnerability management platform

## Best Practices

### 1. Development

- **Secure Coding**: Follow secure coding practices
- **Code Review**: Security-focused code review
- **Testing**: Include security testing in CI/CD
- **Documentation**: Document security requirements

### 2. Operations

- **Monitoring**: Continuous security monitoring
- **Updates**: Regular security updates
- **Backups**: Secure backup procedures
- **Incident Response**: Prepared incident response

### 3. Management

- **Policies**: Clear security policies
- **Training**: Security awareness training
- **Risk Management**: Regular risk assessments
- **Compliance**: Maintain regulatory compliance

## Success Metrics

### 1. Security Metrics

- **Vulnerability Count**: < 5 high/critical vulnerabilities
- **Mean Time to Detection**: < 1 hour
- **Mean Time to Response**: < 4 hours
- **Security Test Coverage**: > 90%

### 2. Compliance Metrics

- **Policy Compliance**: 100% compliance
- **Audit Findings**: 0 critical findings
- **Training Completion**: 100% completion
- **Incident Response**: < 1 hour response time

This checklist provides a comprehensive foundation for implementing and maintaining security controls.
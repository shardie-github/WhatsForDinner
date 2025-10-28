# Security Documentation

This document outlines the security measures, policies, and procedures for the "What's for Dinner" application.

## Security Architecture

### Client-Server Boundary
- **Client-side**: Only public keys and anon keys exposed
- **Server-side**: Service role keys and sensitive secrets
- **Edge Functions**: Isolated execution environment

### Authentication & Authorization
- Supabase Auth for user management
- JWT tokens for session management
- Row Level Security (RLS) for data access control
- Role-based access control (RBAC)

## Environment Security

### Secret Management

#### Client-Side Environment Variables (NEXT_PUBLIC_*)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ghqyxhbyyirveptgwoqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # Safe to expose
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Safe to expose
```

#### Server-Side Environment Variables
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ... # NEVER expose to client
SUPABASE_ACCESS_TOKEN=... # Server-only
DATABASE_URL=postgresql://... # Server-only
OPENAI_API_KEY=sk-... # Server-only
STRIPE_SECRET_KEY=sk_... # Server-only
JWT_SECRET=... # Server-only
ENCRYPTION_KEY=... # Server-only
```

### Secret Rotation
- Service role keys: Every 30 days
- API keys: Every 60-90 days
- JWT secrets: Every 30 days
- Encryption keys: Every 90 days

## Database Security

### Row Level Security (RLS)

#### Policy Examples
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only access their own pantry items
CREATE POLICY "Users can view own pantry items" ON pantry_items
  FOR SELECT USING (auth.uid() = user_id);

-- Anonymous users are blocked
CREATE POLICY "Anonymous access blocked" ON pantry_items
  FOR ALL USING (auth.role() = 'authenticated');
```

#### RLS Testing
```bash
# Test RLS policies
node scripts/supabase-policy-smoke/index.js

# Verify anonymous access is blocked
curl -X GET "https://ghqyxhbyyirveptgwoqm.supabase.co/rest/v1/pantry_items" \
  -H "apikey: YOUR_ANON_KEY"
```

### Database Access Control

#### Roles and Permissions
- **anon**: No database access
- **authenticated**: User-level access only
- **service_role**: Full database access (server-only)
- **app_admin**: Admin-level access
- **app_super_admin**: Full system access

#### Connection Security
- SSL/TLS encryption required
- Connection pooling for performance
- IP allowlisting (if applicable)
- Regular security audits

## Application Security

### Input Validation
- All user inputs validated with Zod schemas
- SQL injection prevention via parameterized queries
- XSS prevention via React's built-in escaping
- CSRF protection via SameSite cookies

### Authentication Security
- JWT tokens with short expiration
- Refresh token rotation
- Secure cookie settings
- Multi-factor authentication (future)

### API Security
- Rate limiting on all endpoints
- Request validation
- Error handling without information leakage
- CORS configuration

## Infrastructure Security

### Vercel Security
- HTTPS enforced
- Security headers configured
- DDoS protection
- Edge caching with security

### Supabase Security
- Database encryption at rest
- Network encryption in transit
- Regular security updates
- Compliance certifications

### GitHub Security
- Branch protection rules
- Required status checks
- Secret scanning
- Dependency scanning

## Security Monitoring

### Logging
- All security events logged
- Failed authentication attempts
- Unauthorized access attempts
- Admin actions

### Monitoring
- Real-time security alerts
- Performance monitoring
- Error tracking
- Uptime monitoring

### Incident Response
1. **Detection**: Automated monitoring alerts
2. **Assessment**: Determine severity and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threat
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update security measures

## Security Testing

### Automated Testing
```bash
# Security audit
pnpm run security:audit

# Dependency vulnerability scan
pnpm run security:deps

# Secret scanning
pnpm run security:secrets

# RLS policy testing
node scripts/supabase-policy-smoke/index.js
```

### Manual Testing
- Penetration testing (quarterly)
- Code security reviews
- Infrastructure security audits
- Social engineering tests

## Compliance

### Data Protection
- GDPR compliance
- Data minimization
- Right to be forgotten
- Data portability

### Security Standards
- OWASP Top 10 compliance
- Security best practices
- Regular security updates
- Vulnerability management

## Security Checklist

### Pre-Deployment
- [ ] All secrets properly configured
- [ ] RLS policies tested
- [ ] Security scans passed
- [ ] Environment variables validated
- [ ] Health checks passing

### Post-Deployment
- [ ] Monitoring alerts configured
- [ ] Security logs active
- [ ] Backup procedures tested
- [ ] Incident response plan ready

### Regular Maintenance
- [ ] Security updates applied
- [ ] Secrets rotated
- [ ] Access reviews conducted
- [ ] Security training completed

## Security Contacts

### Internal
- Security Team: security@whatsfordinner.com
- Development Team: dev@whatsfordinner.com
- Operations Team: ops@whatsfordinner.com

### External
- Security Vendor: [Contact Information]
- Incident Response: [Contact Information]
- Legal: [Contact Information]

## Security Policies

### Password Policy
- Minimum 12 characters
- Mix of letters, numbers, symbols
- No common passwords
- Regular rotation required

### Access Control
- Principle of least privilege
- Regular access reviews
- Multi-factor authentication
- Session management

### Data Handling
- Encrypt sensitive data
- Secure data transmission
- Regular backups
- Secure data disposal

## Incident Response Plan

### Severity Levels
- **Critical**: System compromise, data breach
- **High**: Service disruption, security vulnerability
- **Medium**: Performance issues, minor vulnerabilities
- **Low**: Cosmetic issues, minor bugs

### Response Times
- **Critical**: Immediate response (< 1 hour)
- **High**: Within 4 hours
- **Medium**: Within 24 hours
- **Low**: Within 72 hours

### Communication
- Internal notifications
- External communications
- Status page updates
- Post-incident reports

## Security Training

### Required Training
- Security awareness
- Incident response
- Secure coding practices
- Data protection

### Regular Updates
- Quarterly security briefings
- Annual security training
- Security policy updates
- Threat intelligence sharing

## Security Metrics

### Key Performance Indicators
- Mean Time to Detection (MTTD)
- Mean Time to Response (MTTR)
- Security incident count
- Vulnerability remediation time

### Reporting
- Monthly security reports
- Quarterly security reviews
- Annual security assessments
- Continuous improvement

## Changelog

- **v1.0.0**: Initial security framework
- **v1.1.0**: Added RLS policy testing
- **v1.2.0**: Implemented secret rotation
- **v1.3.0**: Enhanced monitoring and alerting
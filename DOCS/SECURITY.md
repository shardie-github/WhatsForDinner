# Security Documentation

## Overview

This document outlines the security measures, access controls, and compliance procedures for the What's for Dinner application.

## Access Control

### Supabase Roles

The application uses a least-privilege access model with three distinct roles:

#### 1. Anonymous (`anon`)
- **Purpose**: Public access to read-only features
- **Permissions**: 
  - Read access to public recipes
  - Read access to enabled feature flags
  - No write access to any tables
- **Usage**: Client-side applications for unauthenticated users

#### 2. Authenticated (`authenticated`)
- **Purpose**: Logged-in user access
- **Permissions**:
  - Full CRUD access to user's own data (profiles, pantry items, recipes, favorites)
  - Read access to all feature flags
  - Read access to audit logs
- **Usage**: Client-side applications for authenticated users

#### 3. Service Role (`service_role`)
- **Purpose**: Server-side operations and administrative tasks
- **Permissions**:
  - Full access to all tables
  - Can manage feature flags
  - Can write to audit logs
  - Can execute migrations
- **Usage**: Server-side code, CI/CD pipelines, administrative scripts

### Row Level Security (RLS)

All user data tables have RLS policies that ensure users can only access their own data:

```sql
-- Example RLS policy
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

## Secret Management

### Environment Variables

#### Client-Side (Safe for browser)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Server-Side (Never expose to client)
- `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_TOKEN`
- `GITHUB_TOKEN`
- `SLACK_WEBHOOK`

### Secret Rotation Process

1. **Generate new secrets** using the rotation script
2. **Update GitHub Secrets** with new values
3. **Update Vercel Environment Variables**
4. **Deploy with grace period** to allow old secrets to work temporarily
5. **Invalidate old secrets** after successful deployment

## Feature Flags Security

### Access Control
- Anonymous users can only read enabled flags
- Authenticated users can read all flags (for admin interfaces)
- Only service role can modify flags

### Audit Trail
All flag changes are logged in `flag_audit_log` table with:
- Who made the change
- When the change was made
- What changed (old vs new values)
- Reason for the change

## Database Security

### Encryption
- All data encrypted at rest in Supabase
- All connections use TLS 1.2+
- Sensitive data encrypted with application-level encryption where needed

### Backup Security
- Automated daily backups with 30-day retention
- Point-in-time recovery (PITR) enabled
- Backup encryption in transit and at rest
- Regular restore testing via DR drills

## API Security

### Rate Limiting
- Implemented at Supabase level
- Progressive backoff for retries
- Per-user rate limits

### Input Validation
- All inputs validated on both client and server
- SQL injection prevention via parameterized queries
- XSS prevention via proper escaping

### CORS Configuration
- Restricted to known domains
- Preflight request handling
- Credential handling configured securely

## Compliance

### Data Retention
- User data retained per GDPR requirements
- Audit logs retained for 90 days
- Backup data retained for 30 days
- Right to deletion implemented

### Privacy Controls
- User consent tracking
- Data minimization principles
- Transparent data usage policies

### Incident Response
1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Severity classification
3. **Containment**: Immediate response measures
4. **Investigation**: Root cause analysis
5. **Recovery**: Service restoration
6. **Lessons Learned**: Process improvement

## Security Monitoring

### Logging
- All authentication events logged
- All database operations logged
- All API requests logged
- Error tracking and alerting

### Monitoring
- Real-time security dashboards
- Automated threat detection
- Regular security audits
- Penetration testing

## Security Contacts

- **Primary**: security@whats-for-dinner.com
- **Secondary**: devops@whats-for-dinner.com
- **Emergency**: +1-XXX-XXX-XXXX

## Security Updates

This document is reviewed and updated quarterly or when significant changes are made to the security posture.

Last updated: $(date -u +%Y-%m-%d)

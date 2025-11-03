# Security & Privacy

## Threat Model

### Authentication & Authorization
- **Threat**: Unauthorized access to user data
- **Mitigation**: 
  - JWT tokens with short expiry
  - Refresh token rotation
  - Secure storage (SecureStore on mobile, httpOnly cookies on web)
  - RLS policies at database level

### XSS Prevention
- **Threat**: User-generated content containing scripts
- **Mitigation**:
  - Sanitization on all user input
  - React's built-in XSS protection
  - Content Security Policy headers
  - No `dangerouslySetInnerHTML` without sanitization

### SSRF Prevention
- **Threat**: Server-side request forgery
- **Mitigation**:
  - Whitelist of allowed URLs
  - No user-controlled URLs in server requests
  - Validation of all external requests

### Data Minimization
- Only collect necessary data
- Health data requires explicit consent
- Wearable data requires opt-in with clear scopes
- PII sanitization in analytics

## Privacy

### Consent Management
- Consent gates before analytics/ads initialization
- Granular consent (analytics, ads, functional)
- Revocable consent
- CMP integration for web

### Data Storage
- **Mobile**: SecureStore for tokens
- **Web**: httpOnly cookies for session
- **Local**: Encrypted storage for offline data
- **Backend**: Encrypted at rest

### Parental Controls
- Household owner approvals for minors
- Restricted messaging features for children
- Content filtering based on age

### Compliance
- GDPR compliant
- CCPA compliant
- No medical device claims
- Clear privacy policy
- Data export/deletion on request

## Best Practices

1. **Never log PII** in production
2. **Validate all inputs** with Zod schemas
3. **Use parameterized queries** to prevent SQL injection
4. **Rate limiting** on all API endpoints
5. **HTTPS only** in production
6. **Regular security audits** of dependencies

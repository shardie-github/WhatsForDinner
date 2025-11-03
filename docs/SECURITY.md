# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@hardonia.app with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Do not** open a public GitHub issue for security vulnerabilities.

## Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use different keys for development, staging, and production
- Rotate secrets regularly (recommended: every 90 days)
- Use secret management services (Vercel Secrets, AWS Secrets Manager)

### API Keys
- **Never** expose service role keys in client-side code
- Use `EXPO_PUBLIC_*` prefix only for safe, public values
- Service role keys should only be used in server-side Edge Functions

### Database Security
- All tables use Row Level Security (RLS)
- Policies are enforced at the database level
- Regular security audits of RLS policies
- No SECURITY DEFINER functions (migrated to RLS)

### Dependencies
- Regular dependency updates: `npm audit`
- Automated security scanning in CI/CD
- Pin dependency versions in production

### Authentication
- Supabase Auth handles all authentication
- Tokens are stored securely using `expo-secure-store`
- Implement proper session management

### Edge Functions
- JWT verification enabled by default
- Healthcheck endpoint has JWT disabled (public)
- Input validation on all endpoints
- Rate limiting recommended for production

## Security Checklist

- [x] RLS policies on all tables
- [x] Environment variables properly configured
- [x] Service role keys never exposed to client
- [x] HTTPS enforced in production
- [x] CORS properly configured
- [x] Input validation on Edge Functions
- [x] Regular dependency updates
- [x] Security headers in Vercel configuration

## Responsible Disclosure

We follow responsible disclosure principles:
1. Report privately to security@hardonia.app
2. Allow 90 days for resolution before public disclosure
3. Provide clear reproduction steps
4. Avoid destructive testing

Thank you for helping keep this project secure!

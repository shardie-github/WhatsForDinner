# Environment Variables & Secrets Management

**Last Updated:** 2025-01-28  
**Status:** ✅ Comprehensive Documentation

---

## Executive Summary

This application uses **200+ environment variables** across:
- **Public variables** (client-safe, prefixed with `NEXT_PUBLIC_`)
- **Private variables** (server-only, secrets)
- **Third-party integrations** (OpenAI, Stripe, etc.)

**Secrets Management:**
- **GitHub Secrets:** For CI/CD
- **Vercel Environment Variables:** For deployments
- **Supabase Secrets:** For database access

---

## Variable Categories

### 1. Core Supabase (Required)

**Public (Client-Safe):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

**Private (Server-Only):**
```bash
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_PROJECT_REF=<project-ref>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_JWT_SECRET=<jwt-secret>
```

**Usage:**
- Public: Client-side Supabase client initialization
- Private: Server-side operations, migrations, admin tasks

**Where to Set:**
- GitHub Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`
- Vercel: All Supabase variables (production/preview)
- Local: `.env.local` (copy from `.env.example`)

---

### 2. Database (Required)

```bash
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
PRISMA_CLIENT_ENGINE_TYPE=wasm
```

**Usage:**
- Prisma Client generation
- Direct database connections
- Migration operations

**Where to Set:**
- GitHub Secrets: `DATABASE_URL` (for CI)
- Vercel: `DATABASE_URL` (for API routes)
- Local: `.env.local`

**Note:** `PRISMA_CLIENT_ENGINE_TYPE=wasm` is required for Termux/Android compatibility

---

### 3. Application Configuration

**Public:**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

**Private:**
```bash
NODE_ENV=development
LOG_LEVEL=info
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
```

**Usage:**
- App URL for absolute links
- Environment detection
- Logging configuration
- Auth configuration

---

### 4. OAuth Providers (Optional)

```bash
GITHUB_CLIENT_ID=<client-id>
GITHUB_CLIENT_SECRET=<client-secret>
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>
```

**Usage:**
- OAuth authentication via Supabase Auth
- Social login options

**Where to Set:**
- Vercel: Production/preview environments
- Local: `.env.local`

---

### 5. OpenAI (Required for Meal Generation)

```bash
OPENAI_API_KEY=<api-key>
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7
```

**Usage:**
- AI-powered meal generation
- Recipe suggestions

**Where to Set:**
- Vercel: Production/preview environments
- Local: `.env.local`

**Cost:** Pay-per-use (monitor usage)

---

### 6. Stripe (Required for Payments)

**Public:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<publishable-key>
```

**Private:**
```bash
STRIPE_SECRET_KEY=<secret-key>
STRIPE_PUBLISHABLE_KEY=<publishable-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
```

**Usage:**
- Payment processing
- Subscription management

**Where to Set:**
- Vercel: Production/preview environments
- Local: `.env.local`

---

### 7. Email Configuration (Optional)

```bash
RESEND_API_KEY=<api-key>
SENDER_EMAIL=no-reply@whatsfordinner.app
SENDGRID_API_KEY=<api-key>
CRM_PROVIDER=sendgrid
```

**Usage:**
- Transactional emails
- Marketing emails
- Email notifications

**Where to Set:**
- Vercel: Production/preview environments
- Local: `.env.local`

---

### 8. Analytics & Monitoring (Optional)

**Public:**
```bash
NEXT_PUBLIC_GA_ID=<ga-id>
NEXT_PUBLIC_POSTHOG_KEY=<posthog-key>
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_CLARITY_ID=<clarity-id>
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=<domain>
```

**Private:**
```bash
SENTRY_DSN=<sentry-dsn>
NEXT_PUBLIC_SENTRY_DSN=<sentry-dsn>
SENTRY_AUTH_TOKEN=<token>
SENTRY_ORG=<org>
SENTRY_PROJECT=<project>
```

**Usage:**
- User analytics
- Error tracking
- Performance monitoring

**Where to Set:**
- Vercel: Production/preview environments
- Local: `.env.local` (optional)

---

### 9. Storage & Media (Optional)

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud-name>
NEXT_PUBLIC_CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<secret>
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=<key>
```

**Usage:**
- Image uploads
- Media management
- CDN for assets

**Where to Set:**
- Vercel: Production/preview environments
- Local: `.env.local` (optional)

---

### 10. Security & Bot Protection (Optional)

```bash
NEXT_PUBLIC_HCAPTCHA_SITEKEY=<sitekey>
HCAPTCHA_SECRET=<secret>
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<site-key>
RECAPTCHA_SECRET_KEY=<secret-key>
```

**Usage:**
- Bot protection
- Spam prevention
- Rate limiting

**Where to Set:**
- Vercel: Production/preview environments
- Local: `.env.local` (optional)

---

### 11. Monetization (Optional)

```bash
AFFILIATE_ENABLED=true
AFFILIATE_COMMISSION_RATE=10
AFFILIATE_MIN_PAYOUT=50
API_MONETIZATION_ENABLED=true
DATA_INSIGHTS_ENABLED=true
MARKETPLACE_ENABLED=true
MARKETPLACE_COMMISSION_RATE=10
AUTOMATED_UPSELLS_ENABLED=true
CRON_SECRET=<secret>
```

**Usage:**
- Affiliate system
- API monetization
- Marketplace features
- Revenue operations

**Where to Set:**
- Vercel: Production/preview environments
- Local: `.env.local` (optional)

---

### 12. Privacy & Compliance (Optional)

```bash
PRIVACY_OFFICER_EMAIL=privacy@whatsfordinner.app
DSAR_VERIFICATION_JWT_SECRET=<secret>
ARTIFACTS_BUCKET_URL=/tmp/artifacts
ARTIFACTS_BUCKET_SIGNING_KEY=<key>
EVIDENCE_IMMUTABLE_BUCKET_URL=/tmp/evidence
MAGIC_LINK_BASE_URL=http://localhost:3000/privacy/verify
CCM_ALERT_WEBHOOK=<webhook-url>
LEGAL_HOLD_DEFAULT=false
DSAR_DEADLINE_DAYS=30
ADMIN_JWT_SECRET=<secret>
ADMIN_JWT_EXPIRY=8h
```

**Usage:**
- GDPR compliance
- DSAR (Data Subject Access Requests)
- Privacy transparency
- Legal hold

**Where to Set:**
- Vercel: Production/preview environments
- Local: `.env.local` (optional)

---

### 13. Observability (Optional)

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=<endpoint>
OTEL_SERVICE_NAME=whats-for-dinner-backend
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3001
LOKI_URL=http://localhost:3100
TEMPO_URL=http://localhost:3200
PROMETHEUS_PORT=9464
ENABLE_PROMETHEUS=true
ENABLE_OTLP=true
```

**Usage:**
- Distributed tracing
- Metrics collection
- Log aggregation
- Performance monitoring

**Where to Set:**
- Vercel: Production/preview environments
- Local: `.env.local` (optional)

---

## Secrets Mapping

### GitHub Secrets (CI/CD)

**Required:**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `SUPABASE_ACCESS_TOKEN` - Supabase CLI token
- `SUPABASE_PROJECT_REF` - Supabase project reference
- `DATABASE_URL` - Database connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional:**
- `SUPABASE_DB_URL` - For schema drift detection
- `SUPABASE_SERVICE_ROLE_KEY` - For service role operations
- `PROD_URL` - For E2E tests
- `SENTRY_DSN` - For error tracking
- `OPENAI_API_KEY` - For AI features
- `STRIPE_SECRET_KEY` - For payments

**How to Set:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add name and value
4. Click "Add secret"

---

### Vercel Environment Variables

**Production Environment:**
- Set in Vercel Dashboard → Project → Settings → Environment Variables
- Select "Production" environment
- Add all required variables

**Preview Environment:**
- Set in Vercel Dashboard → Project → Settings → Environment Variables
- Select "Preview" environment
- Add all required variables (can inherit from Production)

**Development Environment:**
- Set in Vercel Dashboard → Project → Settings → Environment Variables
- Select "Development" environment
- Add all required variables (can inherit from Production)

**How to Set:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Click "Add New"
3. Add key and value
4. Select environment(s)
5. Click "Save"

**Note:** Vercel can sync environment variables from GitHub Secrets (if configured)

---

### Supabase Secrets

**Set in Supabase Dashboard:**
- Go to Supabase Dashboard → Project → Settings → API
- View/regenerate keys:
  - `anon` key (public)
  - `service_role` key (secret)
  - `JWT secret` (secret)

**For Edge Functions:**
- Go to Supabase Dashboard → Project → Settings → Edge Functions
- Set secrets via CLI: `supabase secrets set KEY=value`

---

## Local Development Setup

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Fill Required Variables

**Minimum Required:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_PROJECT_REF=<project-ref>
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
OPENAI_API_KEY=<api-key>
```

### 3. Optional Variables

Add other variables as needed for features you're testing:
- Stripe (for payments)
- Email (for notifications)
- Analytics (for tracking)
- etc.

### 4. Verify Setup

```bash
# Check required variables
pnpm env:check

# Validate environment
pnpm env:validate
```

---

## CI/CD Environment Variables

### GitHub Actions

**Automatic:**
- GitHub Actions automatically has access to repository secrets
- Use `${{ secrets.SECRET_NAME }}` in workflows

**Example:**
```yaml
env:
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Vercel Deployments

**Automatic:**
- Vercel pulls environment variables from Vercel Dashboard
- Use `vercel pull` to sync environment variables

**In CI:**
```bash
vercel pull --yes --environment=preview --token $VERCEL_TOKEN
```

---

## Security Best Practices

### ✅ Do

1. **Use Secrets:** Never hardcode secrets in code
2. **Rotate Regularly:** Rotate secrets every 90 days
3. **Use Different Keys:** Different keys for dev/staging/prod
4. **Limit Access:** Only grant access to necessary secrets
5. **Audit Usage:** Regularly audit secret usage
6. **Use Vaults:** Consider secret management services (1Password, AWS Secrets Manager)

### ❌ Don't

1. **Commit Secrets:** Never commit `.env.local` to git
2. **Share Secrets:** Don't share secrets in chat/email
3. **Use Production Keys Locally:** Use separate dev keys
4. **Expose in Logs:** Don't log secrets
5. **Hardcode:** Don't hardcode secrets in code

---

## Variable Validation

### Check Required Variables

```bash
# Check if all required variables are set
pnpm env:check
```

**Script:** `packages/config/src/env-loader.ts`

### Validate Environment

```bash
# Validate environment configuration
pnpm env:validate
```

**Script:** `packages/config/src/env-loader.ts`

---

## Troubleshooting

### Missing Variables

**Error:** `Missing required environment variables`

**Solution:**
1. Check `.env.local` exists
2. Verify all required variables are set
3. Run `pnpm env:check` to see missing variables

### Invalid Variables

**Error:** `Invalid environment variable format`

**Solution:**
1. Check variable format matches expected pattern
2. Verify URLs are valid
3. Check for typos in variable names

### Secrets Not Working in CI

**Error:** `Secret not found in GitHub Actions`

**Solution:**
1. Verify secret exists in GitHub Secrets
2. Check secret name matches workflow
3. Ensure secret is not expired

---

## Complete Variable List

See `.env.example` for the complete list of 200+ environment variables with descriptions.

**Categories:**
- Core Supabase (6 variables)
- Database (2 variables)
- Application Configuration (5 variables)
- OAuth Providers (4 variables)
- OpenAI (4 variables)
- Stripe (4 variables)
- Email Configuration (4 variables)
- Analytics & Monitoring (10 variables)
- Storage & Media (4 variables)
- Security & Bot Protection (4 variables)
- Monetization (8 variables)
- Privacy & Compliance (12 variables)
- Observability (8 variables)
- And 100+ more...

---

## Conclusion

**Current State:** ✅ Environment variables are **well-documented** in `.env.example`

**Recommendations:**
1. ✅ Use `.env.example` as the source of truth
2. ✅ Regularly audit actual usage vs documented variables
3. ✅ Remove unused variables
4. ✅ Document new variables as they're added
5. ✅ Use secret management services for production

**Status:** Production-ready with comprehensive documentation.

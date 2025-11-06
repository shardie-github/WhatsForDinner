# Missing or Outdated Credentials Audit

Generated: ${new Date().toISOString()}

## Quick Summary

This document lists all credentials that should be configured in:
- **GitHub Secrets** (for CI/CD workflows)
- **Vercel Environment Variables** (for runtime)
- **Supabase Secrets** (for database operations)

---

## 🔐 GitHub Secrets (Required for CI/CD)

These secrets are used in GitHub Actions workflows and should be configured in:
**Settings → Secrets and variables → Actions → New repository secret**

### Required GitHub Secrets

1. **SUPABASE_ACCESS_TOKEN**
   - Description: Supabase access token for CLI authentication
   - Used in: `deploy-main.yml`, `preview-pr.yml`
   - Get from: Supabase Dashboard → Account Settings → Access Tokens

2. **SUPABASE_PROJECT_REF**
   - Description: Your Supabase project reference ID
   - Used in: Multiple workflows
   - Get from: Supabase Dashboard → Project Settings → General

3. **SUPABASE_DB_PASSWORD**
   - Description: Database password for Supabase
   - Used in: `deploy-main.yml`, `preview-pr.yml`
   - Get from: Supabase Dashboard → Project Settings → Database

4. **VERCEL_TOKEN**
   - Description: Vercel API token for deployments
   - Used in: All deployment workflows
   - Get from: Vercel Dashboard → Settings → Tokens

5. **VERCEL_ORG_ID**
   - Description: Vercel organization ID
   - Used in: Deployment workflows
   - Get from: Vercel Dashboard → Team Settings

6. **VERCEL_PROJECT_ID**
   - Description: Vercel project ID
   - Used in: Deployment workflows
   - Get from: Vercel Dashboard → Project Settings

7. **NEXT_PUBLIC_SUPABASE_URL**
   - Description: Supabase project URL
   - Used in: CI/CD tests, health checks
   - Get from: Supabase Dashboard → Project Settings → API

8. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Description: Supabase anonymous key (safe for client-side)
   - Used in: CI/CD tests
   - Get from: Supabase Dashboard → Project Settings → API

9. **SUPABASE_SERVICE_ROLE_KEY**
   - Description: Supabase service role key (server-side only)
   - Used in: CI/CD tests, database operations
   - Get from: Supabase Dashboard → Project Settings → API
   - ⚠️ **NEVER expose this in client-side code**

10. **SUPABASE_DB_URL**
    - Description: PostgreSQL connection string
    - Format: `postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
    - Used in: Database migrations, schema checks
    - Get from: Supabase Dashboard → Project Settings → Database

### Optional GitHub Secrets (for specific features)

11. **SLACK_WEBHOOK_URL** or **SLACK_ALERT_WEBHOOK**
    - Description: Slack webhook for deployment notifications
    - Used in: Notification workflows
    - Get from: Slack → Apps → Incoming Webhooks

12. **DISCORD_WEBHOOK_URL**
    - Description: Discord webhook for notifications
    - Used in: Some monitoring workflows
    - Get from: Discord → Server Settings → Integrations → Webhooks

13. **OPENAI_API_KEY**
    - Description: OpenAI API key for AI features
    - Used in: AI-related workflows (if any)
    - Get from: https://platform.openai.com/api-keys

14. **PROD_URL**
    - Description: Production URL for smoke tests
    - Used in: Testing workflows
    - Value: Your production deployment URL

---

## 🌐 Vercel Environment Variables (Required for Runtime)

These variables should be configured in:
**Vercel Dashboard → Project → Settings → Environment Variables**

### Critical Required Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Description: Supabase project URL
   - Example: `https://your-project-ref.supabase.co`
   - Required: ✅ Yes
   - Get from: Supabase Dashboard → Project Settings → API

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Description: Supabase anonymous key (client-side safe)
   - Required: ✅ Yes
   - Get from: Supabase Dashboard → Project Settings → API

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Description: Supabase service role key (server-side only)
   - Required: ✅ Yes
   - ⚠️ **NEVER expose to client**
   - Get from: Supabase Dashboard → Project Settings → API

4. **DATABASE_URL** or **SUPABASE_DB_URL**
   - Description: PostgreSQL connection string
   - Format: `postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
   - Required: ✅ Yes
   - Get from: Supabase Dashboard → Project Settings → Database

5. **NODE_ENV**
   - Description: Environment mode
   - Value: `production` (or `development`, `staging`)
   - Required: ✅ Yes

6. **NEXT_PUBLIC_APP_URL** or **NEXT_PUBLIC_SITE_URL**
   - Description: Application base URL
   - Example: `https://whats-for-dinner.vercel.app`
   - Required: ✅ Yes

### Payments & Stripe

7. **STRIPE_SECRET_KEY**
   - Description: Stripe secret API key
   - Required: ✅ Yes (if using payments)
   - Get from: https://dashboard.stripe.com/apikeys
   - ⚠️ **KEEP SECRET**

8. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Description: Stripe publishable key (client-side safe)
   - Required: ✅ Yes (if using payments)
   - Get from: https://dashboard.stripe.com/apikeys

9. **STRIPE_WEBHOOK_SECRET**
   - Description: Stripe webhook signing secret
   - Required: ✅ Yes (if using webhooks)
   - Get from: https://dashboard.stripe.com/webhooks
   - Format: `whsec_...`
   - ⚠️ **KEEP SECRET**

### AI/ML Services

10. **OPENAI_API_KEY**
    - Description: OpenAI API key
    - Required: ⚠️ Optional (if using AI features)
    - Get from: https://platform.openai.com/api-keys
    - ⚠️ **KEEP SECRET**

11. **OPENAI_MODEL**
    - Description: OpenAI model to use
    - Default: `gpt-4-turbo-preview`
    - Required: ⚠️ Optional

12. **NEXT_PUBLIC_OPENAI_MODEL**
    - Description: OpenAI model (client-side)
    - Default: `gpt-4-turbo-preview`
    - Required: ⚠️ Optional

### Email Services

13. **SENDGRID_API_KEY**
    - Description: SendGrid API key for emails
    - Required: ⚠️ Optional (if using SendGrid)
    - Get from: SendGrid Dashboard → Settings → API Keys
    - Format: `SG....`

14. **SENDER_EMAIL** or **SENDGRID_FROM**
    - Description: Default sender email
    - Example: `no-reply@nomad.app`
    - Required: ⚠️ Optional

15. **RESEND_API_KEY**
    - Description: Resend API key (alternative to SendGrid)
    - Required: ⚠️ Optional
    - Get from: https://resend.com/api-keys
    - Format: `re_...`

### Caching & Queues

16. **REDIS_URL**
    - Description: Redis connection URL
    - Required: ✅ Yes (if using caching/queues)
    - Format: `redis://localhost:6379` or `redis://default:<password>@<host>:<port>`
    - Get from: Your Redis provider (Upstash, Redis Cloud, etc.)

### Analytics & Monitoring

17. **NEXT_PUBLIC_POSTHOG_KEY**
    - Description: PostHog analytics key
    - Required: ⚠️ Optional
    - Get from: PostHog Dashboard → Project Settings

18. **NEXT_PUBLIC_POSTHOG_HOST**
    - Description: PostHog host URL
    - Default: `https://app.posthog.com`
    - Required: ⚠️ Optional

19. **SENTRY_DSN** or **NEXT_PUBLIC_SENTRY_DSN**
    - Description: Sentry error tracking DSN
    - Required: ⚠️ Optional
    - Get from: Sentry Dashboard → Project Settings → Client Keys

20. **SENTRY_AUTH_TOKEN**
    - Description: Sentry auth token for releases
    - Required: ⚠️ Optional
    - Get from: Sentry Dashboard → Settings → Auth Tokens

21. **SENTRY_ORG**
    - Description: Sentry organization slug
    - Required: ⚠️ Optional

22. **SENTRY_PROJECT**
    - Description: Sentry project slug
    - Required: ⚠️ Optional

### Observability

23. **OTEL_EXPORTER_OTLP_ENDPOINT**
    - Description: OpenTelemetry OTLP endpoint
    - Required: ⚠️ Optional
    - Example: `https://your-otel-collector-endpoint`

24. **OTEL_SERVICE_NAME**
    - Description: Service name for OpenTelemetry
    - Default: `nomad-backend`
    - Required: ⚠️ Optional

### Security & Compliance

25. **DSAR_VERIFICATION_JWT_SECRET**
    - Description: JWT secret for DSAR verification
    - Required: ⚠️ Optional (if using privacy features)
    - Generate: Random 32+ character string
    - ⚠️ **KEEP SECRET**

26. **ADMIN_JWT_SECRET**
    - Description: JWT secret for admin panel
    - Required: ⚠️ Optional (if using admin features)
    - Generate: Random 32+ character string
    - ⚠️ **KEEP SECRET**

27. **ARTIFACTS_BUCKET_URL**
    - Description: Storage bucket for DSAR artifacts
    - Required: ⚠️ Optional
    - Example: `s3://nomad-artifacts` or `/tmp/artifacts`

28. **ARTIFACTS_BUCKET_SIGNING_KEY**
    - Description: Key for signing artifact URLs
    - Required: ⚠️ Optional
    - Generate: Random 32+ character string

### Partner & Revenue Network

29. **LINK_SIGNING_SECRET**
    - Description: Secret for signing referral links
    - Required: ⚠️ Optional (if using referral system)
    - Generate: Random 32+ character string
    - ⚠️ **KEEP SECRET**

30. **PARTNER_CONVERSION_HMAC_SECRET**
    - Description: HMAC secret for partner conversion webhooks
    - Required: ⚠️ Optional (if using partner network)
    - Generate: Random 32+ character string
    - ⚠️ **KEEP SECRET**

### Optional Features (Many are NEXT_PUBLIC_*)

These are optional and only needed if you're using specific features:

- **NEXT_PUBLIC_ALGOLIA_APP_ID** - If using Algolia search
- **NEXT_PUBLIC_ALGOLIA_SEARCH_KEY** - If using Algolia search
- **ALGOLIA_ADMIN_KEY** - If using Algolia search (server-side)
- **NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME** - If using Cloudinary
- **NEXT_PUBLIC_CLOUDINARY_API_KEY** - If using Cloudinary
- **CLOUDINARY_API_SECRET** - If using Cloudinary (server-side)
- **NEXT_PUBLIC_PUSHER_KEY** - If using Pusher for realtime
- **NEXT_PUBLIC_PUSHER_CLUSTER** - If using Pusher
- **NEXT_PUBLIC_ABLY_KEY** - If using Ably for realtime
- **NEXT_PUBLIC_GA_ID** or **NEXT_PUBLIC_GA4_MEASUREMENT_ID** - If using Google Analytics
- **NEXT_PUBLIC_CLARITY_ID** - If using Microsoft Clarity
- **NEXT_PUBLIC_PLAUSIBLE_DOMAIN** - If using Plausible Analytics
- **NEXT_PUBLIC_HCAPTCHA_SITEKEY** - If using hCaptcha
- **HCAPTCHA_SECRET** - If using hCaptcha (server-side)
- **NEXT_PUBLIC_RECAPTCHA_SITE_KEY** - If using reCAPTCHA
- **RECAPTCHA_SECRET_KEY** - If using reCAPTCHA (server-side)
- **NEXT_PUBLIC_TIDIO_KEY** - If using Tidio chat
- **NEXT_PUBLIC_CRISP_ID** - If using Crisp chat

---

## 🗄️ Supabase Secrets

These should be configured in:
**Supabase Dashboard → Project → Settings → Secrets** (or use Supabase CLI)

1. **SUPABASE_JWT_SECRET**
   - Description: JWT secret for token verification
   - Should match Supabase JWT secret
   - Get from: Supabase Dashboard → Project Settings → API → JWT Secret

2. **SUPABASE_DB_URL**
   - Description: Direct database connection URL
   - Format: `postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
   - Get from: Supabase Dashboard → Project Settings → Database → Connection String

---

## 📝 How to Add Credentials

### GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Enter the name and value
5. Click **Add secret**

### Vercel Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Navigate to **Settings → Environment Variables**
4. Click **Add New**
5. Enter the variable name and value
6. Select environments (Production, Preview, Development)
7. Click **Save**

### Supabase Secrets

1. Go to Supabase Dashboard
2. Select your project
3. Navigate to **Settings → Secrets** (or use Supabase CLI)
4. Add secrets using the Supabase CLI:
   ```bash
   supabase secrets set SECRET_NAME=secret_value
   ```

---

## ⚠️ Important Notes

1. **Never commit secrets to git** - Use environment variables or secret management
2. **Rotate secrets regularly** - Especially for production
3. **Use different keys for different environments** - dev, staging, production
4. **Mark client-safe variables with NEXT_PUBLIC_** - These are exposed to the browser
5. **Keep service role keys secure** - Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
6. **Use Vercel's environment variable UI** - For runtime variables
7. **Use GitHub Secrets** - For CI/CD only
8. **Test after adding** - Verify deployments work after adding secrets

---

## 🔍 Verification Checklist

After adding credentials, verify:

- [ ] GitHub Actions workflows run successfully
- [ ] Vercel deployments complete without errors
- [ ] Application connects to Supabase
- [ ] Database migrations run successfully
- [ ] API routes work (if using Stripe, OpenAI, etc.)
- [ ] No console errors about missing environment variables
- [ ] Production builds succeed

---

## 📚 Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase Environment Variables](https://supabase.com/docs/guides/cli/managing-env-variables)
- [Supabase Secrets Management](https://supabase.com/docs/guides/cli/secrets-api)

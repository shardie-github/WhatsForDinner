# Environment Variables Documentation

This document provides a comprehensive guide to all environment variables used across the What's For Dinner stack.

## Quick Reference

### Required for Production
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only, never expose to client)
- `DATABASE_URL` - PostgreSQL connection string

### Required for Development
- `NODE_ENV` - Environment (development, staging, production)
- `NEXT_PUBLIC_APP_URL` - Application base URL

---

## Core Supabase Configuration

### `NEXT_PUBLIC_SUPABASE_URL`
- **Type:** Public (exposed to client)
- **Required:** Yes
- **Format:** `https://<project-ref>.supabase.co`
- **Usage:** Client-side Supabase client initialization
- **Location:** `apps/web/src/lib/supabaseClient.ts`
- **Vercel:** Set in project settings → Environment Variables
- **GitHub Secrets:** Not needed (public variable)

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Type:** Public (exposed to client)
- **Required:** Yes
- **Format:** JWT token string
- **Usage:** Client-side Supabase client initialization
- **Location:** `apps/web/src/lib/supabaseClient.ts`
- **Security:** Protected by RLS policies in Supabase
- **Vercel:** Set in project settings → Environment Variables

### `SUPABASE_SERVICE_ROLE_KEY`
- **Type:** Secret (server-only)
- **Required:** Yes
- **Format:** JWT token string
- **Usage:** Server-side operations bypassing RLS
- **Location:** API routes, server actions, cron jobs
- **Security:** ⚠️ NEVER expose to client. Bypasses all RLS policies.
- **Vercel:** Set in project settings → Environment Variables
- **GitHub Secrets:** Set for CI/CD workflows

### `SUPABASE_URL`
- **Type:** Server-only (optional)
- **Required:** No (use NEXT_PUBLIC_SUPABASE_URL instead)
- **Note:** Legacy variable. Prefer `NEXT_PUBLIC_SUPABASE_URL` for consistency.

### `SUPABASE_JWT_SECRET`
- **Type:** Secret (server-only)
- **Required:** Optional (for custom JWT verification)
- **Usage:** Custom JWT token verification
- **Location:** Custom auth middleware

### `SUPABASE_PROJECT_REF`
- **Type:** Public (optional)
- **Required:** No (auto-extracted from NEXT_PUBLIC_SUPABASE_URL)
- **Usage:** Project reference identifier

---

## Database Configuration

### `DATABASE_URL`
- **Type:** Secret (server-only)
- **Required:** Yes
- **Format:** `postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
- **Usage:** Direct PostgreSQL connections (Prisma, migrations)
- **Location:** `prisma/schema.prisma`, migration scripts
- **Vercel:** Set in project settings → Environment Variables
- **GitHub Secrets:** Set for CI/CD database operations

### `PRISMA_CLIENT_ENGINE_TYPE`
- **Type:** Public
- **Required:** No (defaults to binary)
- **Values:** `wasm` (for Termux/Android compatibility) or `binary`
- **Usage:** Prisma Client engine selection

---

## Application Configuration

### `NODE_ENV`
- **Type:** Public
- **Required:** Yes
- **Values:** `development`, `staging`, `production`
- **Usage:** Environment detection across the stack

### `NEXT_PUBLIC_APP_URL`
- **Type:** Public
- **Required:** Yes
- **Format:** `https://your-domain.com` or `http://localhost:3000`
- **Usage:** Absolute URL generation for emails, webhooks, redirects
- **Location:** Email templates, webhook callbacks

### `LOG_LEVEL`
- **Type:** Public
- **Required:** No (defaults to `info`)
- **Values:** `debug`, `info`, `warn`, `error`
- **Usage:** Application logging verbosity

---

## Authentication & OAuth

### `NEXTAUTH_URL`
- **Type:** Public
- **Required:** If using NextAuth.js
- **Format:** `https://your-domain.com` or `http://localhost:3000`
- **Usage:** NextAuth.js callback URL

### `NEXTAUTH_SECRET`
- **Type:** Secret (server-only)
- **Required:** If using NextAuth.js
- **Format:** Random 32+ character string
- **Usage:** NextAuth.js session encryption
- **Generate:** `openssl rand -base64 32`

### `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- **Type:** Secret (server-only)
- **Required:** If using GitHub OAuth
- **Usage:** GitHub OAuth authentication

### `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- **Type:** Secret (server-only)
- **Required:** If using Google OAuth
- **Usage:** Google OAuth authentication

---

## Payments & Stripe

### `STRIPE_SECRET_KEY`
- **Type:** Secret (server-only)
- **Required:** If using Stripe payments
- **Format:** `sk_test_...` or `sk_live_...`
- **Usage:** Server-side Stripe API calls
- **Location:** API routes (`/api/billing/*`, `/api/checkout/*`)

### `STRIPE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Type:** Public
- **Required:** If using Stripe payments
- **Format:** `pk_test_...` or `pk_live_...`
- **Usage:** Client-side Stripe.js initialization
- **Note:** Use `NEXT_PUBLIC_` prefix for client-side access

### `STRIPE_WEBHOOK_SECRET`
- **Type:** Secret (server-only)
- **Required:** If using Stripe webhooks
- **Format:** `whsec_...`
- **Usage:** Webhook signature verification
- **Location:** `/api/stripe/webhook/route.ts`

---

## AI & OpenAI

### `OPENAI_API_KEY`
- **Type:** Secret (server-only)
- **Required:** If using AI meal generation
- **Format:** `sk-...`
- **Usage:** OpenAI API calls for recipe generation
- **Location:** API routes (`/api/recipes/*`, `/api/dinner/route.ts`)

### `OPENAI_MODEL`
- **Type:** Public
- **Required:** No (defaults to `gpt-4-turbo-preview`)
- **Usage:** OpenAI model selection

### `OPENAI_MAX_TOKENS`
- **Type:** Public
- **Required:** No (defaults to `2000`)
- **Usage:** Maximum tokens per API call

### `OPENAI_TEMPERATURE`
- **Type:** Public
- **Required:** No (defaults to `0.7`)
- **Usage:** Response creativity/randomness

---

## Email & CRM

### `SENDGRID_API_KEY`
- **Type:** Secret (server-only)
- **Required:** If using SendGrid for emails
- **Format:** `SG....`
- **Usage:** SendGrid API calls for transactional emails

### `SENDER_EMAIL` / `SENDGRID_FROM`
- **Type:** Public
- **Required:** If using SendGrid
- **Format:** `no-reply@your-domain.com`
- **Usage:** Email sender address

### `CRM_PROVIDER`
- **Type:** Public
- **Required:** No (defaults to `sendgrid`)
- **Values:** `sendgrid`, `klaviyo`, `noop`
- **Usage:** CRM provider selection

### `KLAVIYO_API_KEY` / `KLAVIYO_LIST_ID`
- **Type:** Secret (server-only)
- **Required:** If using Klaviyo
- **Usage:** Klaviyo API integration

---

## Redis & Queues

### `REDIS_URL`
- **Type:** Secret (server-only)
- **Required:** If using Redis caching/queues
- **Format:** `redis://localhost:6379` or `redis://default:<password>@<host>:<port>`
- **Usage:** Redis connection for caching and job queues

### `QUEUE_CONCURRENCY`
- **Type:** Public
- **Required:** No (defaults to `5`)
- **Usage:** Number of concurrent queue workers

### `QUEUE_NAME`
- **Type:** Public
- **Required:** No (defaults to `default`)
- **Usage:** BullMQ queue name

---

## Webhooks & Integrations

### `WEBHOOK_SECRET_PARTNER`
- **Type:** Secret (server-only)
- **Required:** If using partner webhooks
- **Usage:** HMAC verification for partner webhooks

### `WEBHOOK_SECRET_PAYMENTS`
- **Type:** Secret (server-only)
- **Required:** If using payment webhooks
- **Usage:** HMAC verification for payment webhooks

### `ZAPIER_SECRET`
- **Type:** Secret (server-only)
- **Required:** If using Zapier automations
- **Usage:** Zapier webhook authentication
- **Location:** Referenced in `automations/zapier_spec.json`

---

## Monetization

### `AFFILIATE_ENABLED`
- **Type:** Public
- **Required:** No (defaults to `false`)
- **Values:** `true`, `false`
- **Usage:** Enable affiliate revenue system

### `AFFILIATE_COMMISSION_RATE`
- **Type:** Public
- **Required:** No (defaults to `10`)
- **Usage:** Affiliate commission percentage

### `API_MONETIZATION_ENABLED`
- **Type:** Public
- **Required:** No (defaults to `false`)
- **Usage:** Enable API monetization

### `MARKETPLACE_ENABLED`
- **Type:** Public
- **Required:** No (defaults to `false`)
- **Usage:** Enable marketplace features

### `CONNECT_PLATFORM_FEE_PCT`
- **Type:** Public
- **Required:** No (defaults to `0.10`)
- **Usage:** Stripe Connect platform fee percentage

### `LINK_SIGNING_SECRET`
- **Type:** Secret (server-only)
- **Required:** If using link signing
- **Usage:** HMAC signing for affiliate/referral links

---

## Observability & Monitoring

### `OTEL_EXPORTER_OTLP_ENDPOINT`
- **Type:** Public
- **Required:** If using OpenTelemetry
- **Usage:** OpenTelemetry collector endpoint

### `OTEL_SERVICE_NAME`
- **Type:** Public
- **Required:** No (defaults to `nomad-backend`)
- **Usage:** Service name for tracing

### `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`
- **Type:** Public
- **Required:** If using Sentry
- **Usage:** Sentry error tracking
- **Note:** Use `NEXT_PUBLIC_` prefix for client-side

### `SENTRY_AUTH_TOKEN`
- **Type:** Secret (server-only)
- **Required:** If using Sentry releases
- **Usage:** Sentry release upload authentication

### `PROMETHEUS_URL`
- **Type:** Public
- **Required:** If using Prometheus
- **Usage:** Prometheus metrics endpoint

---

## Cron Jobs & Scheduled Tasks

### `CRON_SECRET`
- **Type:** Secret (server-only)
- **Required:** If using cron jobs
- **Format:** Random 32+ character string
- **Usage:** Authentication for cron endpoints
- **Location:** `/api/cron/*` routes
- **Vercel:** Set in project settings → Environment Variables

---

## Privacy & RegTech

### `PRIVACY_OFFICER_EMAIL`
- **Type:** Public
- **Required:** If using DSAR features
- **Usage:** Privacy officer contact for DSAR notifications

### `DSAR_VERIFICATION_JWT_SECRET`
- **Type:** Secret (server-only)
- **Required:** If using DSAR features
- **Usage:** JWT signing for DSAR verification links

### `ARTIFACTS_BUCKET_URL`
- **Type:** Public
- **Required:** If using DSAR features
- **Usage:** Storage location for DSAR artifacts

### `ARTIFACTS_BUCKET_SIGNING_KEY`
- **Type:** Secret (server-only)
- **Required:** If using signed artifact URLs
- **Usage:** HMAC signing for artifact URLs

---

## Runtime Configuration

### `BACKEND_MODE`
- **Type:** Public
- **Required:** No (defaults to `next`)
- **Values:** `next`, `fastify`
- **Usage:** Backend framework selection

### `CORS_ORIGINS`
- **Type:** Public
- **Required:** No
- **Format:** Comma-separated URLs
- **Usage:** CORS allowed origins

---

## Framework-Specific Notes

### Next.js App Router
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Server-only variables (without `NEXT_PUBLIC_`) are only available in:
  - API routes (`/app/api/**/route.ts`)
  - Server Components
  - Server Actions
  - Middleware

### Edge Runtime
- Some API routes use `export const runtime = 'edge'`
- Edge runtime has limited Node.js API access
- Use environment variables that don't require Node.js APIs

### Expo/React Native
- Use `process.env.EXPO_PUBLIC_*` prefix for client-side variables
- Server-only variables are not accessible in mobile apps

---

## Environment Setup Checklist

### Local Development
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` and keys
- [ ] Set `DATABASE_URL` for Prisma
- [ ] Set `OPENAI_API_KEY` if using AI features
- [ ] Set `STRIPE_SECRET_KEY` if using payments
- [ ] Set `SENDGRID_API_KEY` if using emails

### Vercel Production
- [ ] Set all `NEXT_PUBLIC_*` variables in Vercel dashboard
- [ ] Set all server-only secrets in Vercel dashboard
- [ ] Verify `NEXT_PUBLIC_APP_URL` matches production domain
- [ ] Set `CRON_SECRET` for cron job authentication
- [ ] Configure webhook secrets for Stripe, partners

### GitHub Actions CI/CD
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in GitHub Secrets
- [ ] Set `DATABASE_URL` for migration runs
- [ ] Set `VERCEL_TOKEN` for deployments
- [ ] Set `SUPABASE_ACCESS_TOKEN` for Supabase CLI

---

## Security Best Practices

1. **Never commit `.env.local` or `.env` files**
2. **Use different keys for development, staging, production**
3. **Rotate secrets regularly** (especially service role keys)
4. **Use Vercel Secrets Manager** for production secrets
5. **Audit environment variable usage** regularly
6. **Use `NEXT_PUBLIC_` prefix only for truly public variables**
7. **Validate environment variables at startup** (see `scripts/healthcheck.js`)

---

## Troubleshooting

### "Missing environment variable" errors
1. Check `.env.local` exists and has the variable
2. Verify variable name matches exactly (case-sensitive)
3. Restart dev server after adding variables
4. Check Vercel dashboard for production variables

### Supabase connection issues
1. Verify `NEXT_PUBLIC_SUPABASE_URL` format is correct
2. Check `SUPABASE_SERVICE_ROLE_KEY` is set (server-side)
3. Verify RLS policies allow access
4. Check Supabase project is active

### API route errors
1. Verify server-only variables are NOT prefixed with `NEXT_PUBLIC_`
2. Check Edge runtime compatibility (some Node.js APIs unavailable)
3. Verify environment variables are set in Vercel dashboard

---

## Related Documentation

- [Supabase Setup Guide](./docs/SUPABASE_SETUP.md)
- [Vercel Deployment Guide](./docs/VERCEL_DEPLOYMENT.md)
- [API Documentation](./docs/API.md)
- [Architecture Overview](./ARCHITECTURE.md)

---

**Last Updated:** ${new Date().toISOString()}
**Maintained by:** Full-Stack Guardian Agent

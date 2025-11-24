# Vercel Environment Variables Setup Guide

**Last Updated:** 2025-01-28  
**Purpose:** Complete guide for setting up Vercel environment variables

---

## Overview

Vercel environment variables are used by your Next.js application at build time and runtime. This guide covers setting up all required and optional variables in Vercel.

---

## Required Environment Variables

### Core Supabase Variables

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - **Value:** `https://<project-ref>.supabase.co`
   - **Environment:** Production, Preview, Development
   - **Required:** ✅ Yes

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - **Value:** Supabase anonymous key
   - **Environment:** Production, Preview, Development
   - **Required:** ✅ Yes

3. **`SUPABASE_SERVICE_ROLE_KEY`**
   - **Value:** Supabase service role key
   - **Environment:** Production, Preview, Development
   - **Required:** ✅ Yes
   - **Note:** Server-only, not exposed to client

4. **`SUPABASE_PROJECT_REF`**
   - **Value:** Supabase project reference ID
   - **Environment:** Production, Preview, Development
   - **Required:** ✅ Yes

5. **`DATABASE_URL`**
   - **Value:** PostgreSQL connection string
   - **Format:** `postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
   - **Environment:** Production, Preview, Development
   - **Required:** ✅ Yes (for API routes, Prisma)

### Application Configuration

6. **`NEXT_PUBLIC_APP_URL`**
   - **Value:** `https://your-domain.com` (production) or `http://localhost:3000` (development)
   - **Environment:** Production, Preview, Development
   - **Required:** ✅ Yes

7. **`NODE_ENV`**
   - **Value:** `production` (production), `preview` (preview), `development` (development)
   - **Environment:** Production, Preview, Development
   - **Required:** ✅ Yes (usually set automatically by Vercel)

---

## Optional Environment Variables

### OpenAI (for AI features)

8. **`OPENAI_API_KEY`**
    - **Value:** OpenAI API key
    - **Environment:** Production, Preview (optional)
    - **Required:** ⚠️ Optional (only if using AI features)

9. **`OPENAI_MODEL`**
    - **Value:** `gpt-4-turbo-preview` (default)
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional

### Stripe (for payments)

10. **`STRIPE_SECRET_KEY`**
    - **Value:** Stripe secret key
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional (only if using payments)

11. **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**
    - **Value:** Stripe publishable key
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional (only if using payments)

12. **`STRIPE_WEBHOOK_SECRET`**
    - **Value:** Stripe webhook secret
    - **Environment:** Production
    - **Required:** ⚠️ Optional (only if using webhooks)

### Email

13. **`RESEND_API_KEY`**
    - **Value:** Resend API key
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional (only if using Resend)

14. **`SENDER_EMAIL`**
    - **Value:** `no-reply@whatsfordinner.app`
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional

### Analytics & Monitoring

15. **`NEXT_PUBLIC_POSTHOG_KEY`**
    - **Value:** PostHog project API key
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional

16. **`NEXT_PUBLIC_POSTHOG_HOST`**
    - **Value:** `https://app.posthog.com`
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional

17. **`SENTRY_DSN`**
    - **Value:** Sentry DSN
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional

18. **`NEXT_PUBLIC_SENTRY_DSN`**
    - **Value:** Sentry DSN (public)
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional

### Storage & Media

19. **`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`**
    - **Value:** Cloudinary cloud name
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional

20. **`CLOUDINARY_API_SECRET`**
    - **Value:** Cloudinary API secret
    - **Environment:** Production, Preview
    - **Required:** ⚠️ Optional

---

## How to Set Environment Variables

### Via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Navigate to [vercel.com](https://vercel.com)
   - Select your project

2. **Open Project Settings**
   - Click on your project
   - Go to **Settings** → **Environment Variables**

3. **Add Environment Variable**
   - Click **Add New**
   - Enter **Key** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter **Value**
   - Select **Environment(s)**:
     - ✅ Production
     - ✅ Preview
     - ✅ Development (optional)
   - Click **Save**

4. **Repeat for All Variables**
   - Add all required variables
   - Add optional variables as needed

### Via Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Or add from .env file
vercel env pull .env.local
# Edit .env.local
vercel env push .env.local
```

### Via Vercel API

```bash
# Set environment variable via API
curl -X POST "https://api.vercel.com/v10/projects/{project-id}/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "NEXT_PUBLIC_SUPABASE_URL",
    "value": "https://your-project.supabase.co",
    "type": "encrypted",
    "target": ["production", "preview"]
  }'
```

---

## Environment-Specific Configuration

### Production Environment

**Set these for Production:**
- All required variables
- Production API keys
- Production URLs
- Production database connections

**Example:**
```
NEXT_PUBLIC_APP_URL=https://whatsfordinner.app
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
DATABASE_URL=postgresql://postgres:prod-password@db.prod-project.supabase.co:5432/postgres
```

### Preview Environment

**Set these for Preview:**
- All required variables
- Preview/staging API keys (if separate)
- Preview URLs
- Preview database connections (if separate)

**Example:**
```
NEXT_PUBLIC_APP_URL=https://preview-whatsfordinner.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://preview-project.supabase.co
DATABASE_URL=postgresql://postgres:preview-password@db.preview-project.supabase.co:5432/postgres
```

### Development Environment

**Set these for Development:**
- All required variables
- Development API keys (if separate)
- Local URLs
- Development database connections

**Example:**
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
DATABASE_URL=postgresql://postgres:dev-password@db.dev-project.supabase.co:5432/postgres
```

---

## Verification

### Check Variables Are Set

1. **Via Dashboard:**
   - Go to Project → Settings → Environment Variables
   - Verify all required variables are present

2. **Via CLI:**
   ```bash
   vercel env ls
   ```

3. **Via API:**
   ```bash
   curl "https://api.vercel.com/v10/projects/{project-id}/env" \
     -H "Authorization: Bearer $VERCEL_TOKEN"
   ```

### Test Variables in Build

1. **Trigger a Build:**
   - Push to `main` (production)
   - Create a PR (preview)

2. **Check Build Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on deployment
   - Check "Build Logs"
   - Verify no "undefined" or missing variable errors

3. **Test in Runtime:**
   - Visit deployed URL
   - Check browser console for errors
   - Verify API calls work

---

## Best Practices

### ✅ Do

1. **Use Different Keys:** Use different keys for production/preview/development
2. **Keep Secrets Secret:** Never commit `.env.local` to git
3. **Use Preview Environment:** Test changes in preview before production
4. **Rotate Regularly:** Rotate secrets every 90 days
5. **Document Variables:** Keep `.env.example` updated

### ❌ Don't

1. **Commit Secrets:** Never commit secrets to git
2. **Share Secrets:** Don't share secrets in chat/email
3. **Use Production Keys Locally:** Use separate dev keys
4. **Expose in Logs:** Don't log secrets (Vercel hides them automatically)
5. **Hardcode:** Don't hardcode secrets in code

---

## Troubleshooting

### Variable Not Available

**Error:** `process.env.NEXT_PUBLIC_SUPABASE_URL is undefined`

**Solution:**
1. Verify variable is set in Vercel Dashboard
2. Check environment is selected (Production/Preview/Development)
3. Redeploy after adding variable
4. Verify variable name matches exactly (case-sensitive)

### Variable Not Updating

**Error:** Variable updated but old value still used

**Solution:**
1. Redeploy after updating variable
2. Clear Vercel build cache
3. Verify variable is set for correct environment

### Build Fails Due to Missing Variable

**Error:** Build fails with "Missing environment variable"

**Solution:**
1. Add missing variable to Vercel
2. Select correct environment(s)
3. Redeploy

---

## Complete Checklist

### Required Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_PROJECT_REF`
- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NODE_ENV` (usually automatic)

### Optional Variables (Add as Needed)
- [ ] `OPENAI_API_KEY` (for AI features)
- [ ] `STRIPE_SECRET_KEY` (for payments)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (for payments)
- [ ] `RESEND_API_KEY` (for email)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` (for analytics)
- [ ] `SENTRY_DSN` (for error tracking)
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (for media)

---

## Next Steps

1. ✅ Set all required variables in Vercel
2. ✅ Test builds to verify variables work
3. ✅ Add optional variables as features are enabled
4. ✅ Document any custom variables you add
5. ✅ Set up variable rotation schedule

---

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel API Documentation](https://vercel.com/docs/rest-api)

---

**Status:** ✅ Complete setup guide ready for use

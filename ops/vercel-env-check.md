# Vercel Environment Variables Matrix

**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")  
**Purpose:** Track required vs present environment variables for Vercel deployment

## Environment Variable Naming Conventions

### Browser-Safe Variables (NEXT_PUBLIC_* / VITE_*)
These variables are exposed to the browser and should never contain secrets.

| Variable Name | Required | Present | Notes |
|--------------|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ⚠️ | Required for Supabase client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ⚠️ | Required for Supabase client |
| `NEXT_PUBLIC_APP_URL` | ✅ | ⚠️ | Application base URL |
| `NEXT_PUBLIC_IMAGE_DOMAINS` | ⚠️ | ⚠️ | Comma-separated image domains (default: images.unsplash.com,cdn.shopify.com) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ⚠️ | ⚠️ | If using Stripe |
| `NEXT_PUBLIC_POSTHOG_KEY` | ❌ | ⚠️ | Optional analytics |
| `NEXT_PUBLIC_SENTRY_DSN` | ❌ | ⚠️ | Optional error tracking |

### Server-Only Variables (Never Exposed)
These variables are only available server-side and should contain secrets.

| Variable Name | Required | Present | Notes |
|--------------|----------|---------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ⚠️ | **SECRET** - Server-only Supabase access |
| `SUPABASE_JWT_SECRET` | ✅ | ⚠️ | **SECRET** - JWT signing |
| `DATABASE_URL` | ✅ | ⚠️ | **SECRET** - Database connection string |
| `STRIPE_SECRET_KEY` | ⚠️ | ⚠️ | **SECRET** - If using Stripe |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | ⚠️ | **SECRET** - If using Stripe webhooks |
| `OPENAI_API_KEY` | ⚠️ | ⚠️ | **SECRET** - If using OpenAI |
| `ADMIN_BASIC_AUTH` | ⚠️ | ⚠️ | **SECRET** - Format: "user:pass" (for preview admin protection) |
| `CSP_MODE` | ❌ | ⚠️ | CSP mode: strict|balanced|loose (default: balanced) |
| `PREVIEW_REQUIRE_AUTH` | ❌ | ⚠️ | Enable preview auth (default: true) |

## Vercel-Specific Variables

| Variable Name | Required | Present | Notes |
|--------------|----------|---------|-------|
| `VERCEL_ENV` | ✅ | ✅ | Auto-set by Vercel (production|preview|development) |
| `VERCEL_URL` | ✅ | ✅ | Auto-set by Vercel (deployment URL) |
| `VERCEL_GIT_COMMIT_SHA` | ✅ | ✅ | Auto-set by Vercel |

## Security Checklist

- [ ] All `NEXT_PUBLIC_*` variables contain no secrets
- [ ] All server-only variables are marked as "Secret" in Vercel dashboard
- [ ] `ADMIN_BASIC_AUTH` is set if preview protection is enabled
- [ ] `CSP_MODE` is configured appropriately (balanced recommended)
- [ ] `NEXT_PUBLIC_IMAGE_DOMAINS` includes all required image sources

## Verification Commands

```bash
# Pull environment variables (do not commit)
vercel env pull .env.vercel.local

# List environment variables (names only)
vercel env ls

# Verify browser-safe variables
grep -E "^NEXT_PUBLIC_|^VITE_" .env.vercel.local | grep -i "secret\|key\|password\|token" && echo "⚠️ WARNING: Potential secret in browser-safe variable!"

# Verify server-only variables are not exposed
grep -E "^NEXT_PUBLIC_" .env.vercel.local | grep -E "SERVICE_ROLE|SECRET|PASSWORD" && echo "⚠️ WARNING: Secret in browser-safe variable!"
```

## Notes

- ⚠️ = Needs verification in Vercel dashboard
- ✅ = Required
- ❌ = Optional
- **Never commit `.env.vercel.local` to version control**
- Use Vercel dashboard or CLI to manage environment variables
- For monorepos, ensure Root Directory is set correctly (e.g., `apps/web`)

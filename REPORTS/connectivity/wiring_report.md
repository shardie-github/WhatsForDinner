# Nomad Monorepo Connectivity Report

Generated: 2026-09-03T01:36:38.374Z  
Version: 1.0.0  
Environment: development

## Summary

- **Total Checks**: 32
- **? Pass**: 9
- **? Fail**: 1
- **?? Degraded**: 20
- **?? Skip**: 2

## Connectivity Matrix

| Category | Subsystem | Status | Latency | Error |
|----------|-----------|--------|---------|-------|
| Environment | Supabase URL | ?? DEGRADED | -ms | Missing: NEXT_PUBLIC_SUPABASE_URL |
| Environment | Supabase Anon Key | ?? DEGRADED | -ms | Missing: NEXT_PUBLIC_SUPABASE_ANON_KEY |
| Environment | Supabase Service Role Key | ?? DEGRADED | -ms | Missing: SUPABASE_SERVICE_ROLE_KEY |
| Environment | Redis URL | ?? DEGRADED | -ms | Missing: REDIS_URL |
| Environment | Stripe Secret Key | ?? DEGRADED | -ms | Missing: STRIPE_SECRET_KEY |
| Environment | Stripe Webhook Secret | ?? DEGRADED | -ms | Missing: STRIPE_WEBHOOK_SECRET |
| Environment | OpenAI API Key | ?? DEGRADED | -ms | Missing: OPENAI_API_KEY |
| Environment | SendGrid API Key | ?? DEGRADED | -ms | Missing: SENDGRID_API_KEY |
| Environment | PostHog Key | ?? DEGRADED | -ms | Missing: NEXT_PUBLIC_POSTHOG_KEY |
| Environment | Partner HMAC Secret | ?? DEGRADED | -ms | Missing: PARTNER_CONVERSION_HMAC_SECRET |
| Environment | Link Signing Secret | ?? DEGRADED | -ms | Missing: LINK_SIGNING_SECRET |
| Environment | DSAR Verification JWT | ?? DEGRADED | -ms | Missing: DSAR_VERIFICATION_JWT_SECRET |
| Environment | Artifacts Bucket URL | ?? DEGRADED | -ms | Missing: ARTIFACTS_BUCKET_URL |
| Environment | OTel Endpoint | ?? DEGRADED | -ms | Missing: OTEL_EXPORTER_OTLP_ENDPOINT |
| Health | Web /api/healthz | ? PASS | 53ms | - |
| Health | Database | ? FAIL | -ms | DATABASE_URL or SUPABASE_DB_URL must be set before executing database queries |
| Health | Redis | ?? SKIP | -ms | - |
| Auth/RLS | Supabase JWT Verification | ?? SKIP | -ms | - |
| Consent/Ads/Analytics | Analytics Provider | ?? DEGRADED | -ms | - |
| Consent/Ads/Analytics | Ads Network Fallback | ? PASS | -ms | - |
| Core Product | Meal Plan API | ? PASS | 178ms | - |
| Core Product | Grocery List API | ? PASS | 86ms | - |
| Core Product | AI Meal Generation | ?? DEGRADED | -ms | - |
| Payments | Stripe Configuration | ?? DEGRADED | -ms | - |
| Payments | Stripe Webhook Endpoint | ? PASS | -ms | - |
| Partner Network | HMAC Configuration | ?? DEGRADED | -ms | - |
| Partner Network | Referral Route /r/:token | ? PASS | -ms | - |
| Growth | Experiments API | ? PASS | -ms | - |
| Growth | Pricing API | ? PASS | -ms | - |
| Compliance | DSAR Configuration | ?? DEGRADED | -ms | - |
| Compliance | GDPR API | ? PASS | -ms | - |
| Jobs | Queue Worker | ?? DEGRADED | -ms | REDIS_URL must be set |

## Details

### Environment - Supabase URL
- Status: degraded
- Error: Missing: NEXT_PUBLIC_SUPABASE_URL
- Next Action: Set NEXT_PUBLIC_SUPABASE_URL or configure adapter fallback
- Evidence: N/A

### Environment - Supabase Anon Key
- Status: degraded
- Error: Missing: NEXT_PUBLIC_SUPABASE_ANON_KEY
- Next Action: Set NEXT_PUBLIC_SUPABASE_ANON_KEY or configure adapter fallback
- Evidence: N/A

### Environment - Supabase Service Role Key
- Status: degraded
- Error: Missing: SUPABASE_SERVICE_ROLE_KEY
- Next Action: Set SUPABASE_SERVICE_ROLE_KEY or configure adapter fallback
- Evidence: N/A

### Environment - Redis URL
- Status: degraded
- Error: Missing: REDIS_URL
- Next Action: Set REDIS_URL or configure adapter fallback
- Evidence: N/A

### Environment - Stripe Secret Key
- Status: degraded
- Error: Missing: STRIPE_SECRET_KEY
- Next Action: Set STRIPE_SECRET_KEY or configure adapter fallback
- Evidence: N/A

### Environment - Stripe Webhook Secret
- Status: degraded
- Error: Missing: STRIPE_WEBHOOK_SECRET
- Next Action: Set STRIPE_WEBHOOK_SECRET or configure adapter fallback
- Evidence: N/A

### Environment - OpenAI API Key
- Status: degraded
- Error: Missing: OPENAI_API_KEY
- Next Action: Set OPENAI_API_KEY or configure adapter fallback
- Evidence: N/A

### Environment - SendGrid API Key
- Status: degraded
- Error: Missing: SENDGRID_API_KEY
- Next Action: Set SENDGRID_API_KEY or configure adapter fallback
- Evidence: N/A

### Environment - PostHog Key
- Status: degraded
- Error: Missing: NEXT_PUBLIC_POSTHOG_KEY
- Next Action: Set NEXT_PUBLIC_POSTHOG_KEY or configure adapter fallback
- Evidence: N/A

### Environment - Partner HMAC Secret
- Status: degraded
- Error: Missing: PARTNER_CONVERSION_HMAC_SECRET
- Next Action: Set PARTNER_CONVERSION_HMAC_SECRET or configure adapter fallback
- Evidence: N/A

### Environment - Link Signing Secret
- Status: degraded
- Error: Missing: LINK_SIGNING_SECRET
- Next Action: Set LINK_SIGNING_SECRET or configure adapter fallback
- Evidence: N/A

### Environment - DSAR Verification JWT
- Status: degraded
- Error: Missing: DSAR_VERIFICATION_JWT_SECRET
- Next Action: Set DSAR_VERIFICATION_JWT_SECRET or configure adapter fallback
- Evidence: N/A

### Environment - Artifacts Bucket URL
- Status: degraded
- Error: Missing: ARTIFACTS_BUCKET_URL
- Next Action: Set ARTIFACTS_BUCKET_URL or configure adapter fallback
- Evidence: N/A

### Environment - OTel Endpoint
- Status: degraded
- Error: Missing: OTEL_EXPORTER_OTLP_ENDPOINT
- Next Action: Set OTEL_EXPORTER_OTLP_ENDPOINT or configure adapter fallback
- Evidence: N/A

### Health - Database
- Status: fail
- Error: DATABASE_URL or SUPABASE_DB_URL must be set before executing database queries
- Next Action: Check DATABASE_URL or SUPABASE_DB_URL
- Evidence: N/A

### Consent/Ads/Analytics - Analytics Provider
- Status: degraded
- Error: N/A
- Next Action: Configure PostHog or use noop fallback
- Evidence: Using: noop

### Core Product - AI Meal Generation
- Status: degraded
- Error: N/A
- Next Action: Configure OPENAI_API_KEY or use fallback
- Evidence: OpenAI API key missing

### Payments - Stripe Configuration
- Status: degraded
- Error: N/A
- Next Action: Configure STRIPE_SECRET_KEY or use stripe-mock
- Evidence: Stripe Key: missing, Webhook Secret: missing

### Partner Network - HMAC Configuration
- Status: degraded
- Error: N/A
- Next Action: N/A
- Evidence: HMAC Secret: missing, Link Signing: missing

### Compliance - DSAR Configuration
- Status: degraded
- Error: N/A
- Next Action: N/A
- Evidence: DSAR JWT: missing, Artifacts Bucket: missing

### Jobs - Queue Worker
- Status: degraded
- Error: REDIS_URL must be set
- Next Action: Start queue worker or configure REDIS_URL
- Evidence: N/A


## Evidence

See `evidence/` directory for detailed logs.

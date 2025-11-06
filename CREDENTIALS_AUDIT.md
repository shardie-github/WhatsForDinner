# Credentials Audit Report

Generated: 2025-11-06T03:52:58.419Z

## Summary

- **Total Credentials**: 163
- **Required**: 38
- **Missing Required**: 23
- **GitHub Secrets Needed**: 23
- **Vercel Env Vars Needed**: 161
- **Supabase Secrets Needed**: 2

## Missing Required Credentials

### ❌ NEXT_PUBLIC_ABLY_KEY
- **Category**: Realtime
- **Description**: Ably Realtime (Alternative realtime service)
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_ALGOLIA_APP_ID
- **Category**: Search
- **Description**: Algolia (Search and recommendations)
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
- **Category**: Search
- **Description**: Search configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_API_URL
- **Category**: Other
- **Description**: Other configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_APP_ENV
- **Category**: Other
- **Description**: Other configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_APP_SCHEME
- **Category**: Other
- **Description**: Other configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_CLOUDINARY_API_KEY
- **Category**: Storage
- **Description**: Storage configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_CRISP_ID
- **Category**: Other
- **Description**: Crisp (Alternative chat and support)
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_GA4_MEASUREMENT_ID
- **Category**: Other
- **Description**: Other configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_LEMONSQUEEZY_STORE
- **Category**: Other
- **Description**: LemonSqueezy (Hosted checkout and payments)
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_MEILI_HOST
- **Category**: Search
- **Description**: Meilisearch (Self-hosted search alternative)
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_MEILI_KEY
- **Category**: Search
- **Description**: Search configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_OPENAI_MODEL
- **Category**: AI/ML
- **Description**: AI/ML configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_PLAUSIBLE_DOMAIN
- **Category**: Other
- **Description**: Plausible Analytics (Alternative privacy-focused analytics)
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_PUSHER_CLUSTER
- **Category**: Realtime
- **Description**: Realtime configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_PUSHER_KEY
- **Category**: Realtime
- **Description**: Pusher Channels (Realtime messaging and FOMO features)
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_RECAPTCHA_SITE_KEY
- **Category**: Other
- **Description**: Google reCAPTCHA v3 (Alternative bot protection)
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_SITE_URL
- **Category**: Other
- **Description**: Other configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **Category**: Payments
- **Description**: Payments configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_TIDIO_KEY
- **Category**: Other
- **Description**: Tidio (Live chat and support)
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_TRUSTPILOT_BUSINESS_ID
- **Category**: Other
- **Description**: Trustpilot (Reviews and trust badges)
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_UNIVERSAL_LINK_DOMAIN
- **Category**: Other
- **Description**: Other configuration
- **Platforms Needed**:
  - Vercel Environment Variables

### ❌ NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY
- **Category**: Storage
- **Description**: Uploadcare (Alternative upload service)
- **Platforms Needed**:
  - Vercel Environment Variables


## GitHub Secrets

### ✅ ANDROID_KEYSTORE_PASSWORD
- **Description**: Other configuration
- **Required**: No
- **Used in Workflows**: Yes

### ✅ ANDROID_KEY_ALIAS
- **Description**: Other configuration
- **Required**: No
- **Used in Workflows**: Yes

### ✅ ANDROID_KEY_PASSWORD
- **Description**: Other configuration
- **Required**: No
- **Used in Workflows**: Yes

### ✅ APP_STORE_CONNECT_ISSUER_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Workflows**: Yes

### ✅ APP_STORE_CONNECT_KEY_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Workflows**: Yes

### ✅ COSIGN_PRIVATE_KEY
- **Description**: Cosign private key for container image signing (base64 encoded)
- **Required**: No
- **Used in Workflows**: Yes

### ✅ DATABASE_URL
- **Description**: Other configuration
- **Required**: Yes
- **Used in Workflows**: Yes

### ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Description**: Supabase configuration
- **Required**: Yes
- **Used in Workflows**: Yes

### ✅ NEXT_PUBLIC_SUPABASE_URL
- **Description**: Get these from your Supabase project settings > API
- **Required**: Yes
- **Used in Workflows**: Yes

### ✅ OPENAI_API_KEY
- **Description**: Get from https://platform.openai.com/api-keys
- **Required**: No
- **Used in Workflows**: Yes

### ✅ PROMETHEUS_URL
- **Description**: Prometheus metrics endpoint URL
- **Required**: No
- **Used in Workflows**: Yes

### ✅ REDIS_URL
- **Description**: =============================================================================
- **Required**: No
- **Used in Workflows**: Yes

### ✅ SLACK_ALERT_WEBHOOK
- **Description**: Slack webhook URL for alerts
- **Required**: No
- **Used in Workflows**: Yes

### ✅ SUPABASE_ACCESS_TOKEN
- **Description**: Supabase configuration
- **Required**: No
- **Used in Workflows**: Yes

### ✅ SUPABASE_ANON_KEY
- **Description**: Supabase configuration
- **Required**: No
- **Used in Workflows**: Yes

### ✅ SUPABASE_DB_PASSWORD
- **Description**: Supabase configuration
- **Required**: No
- **Used in Workflows**: Yes

### ✅ SUPABASE_DB_URL
- **Description**: Format: postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
- **Required**: No
- **Used in Workflows**: Yes

### ✅ SUPABASE_PROJECT_REF
- **Description**: Project reference (used by Supabase CLI)
- **Required**: No
- **Used in Workflows**: Yes

### ✅ SUPABASE_SERVICE_ROLE_KEY
- **Description**: Only used for admin operations and server-side API routes
- **Required**: Yes
- **Used in Workflows**: Yes

### ✅ SUPABASE_URL
- **Description**: Get these from your Supabase project settings > API
- **Required**: No
- **Used in Workflows**: Yes

### ✅ VERCEL_ORG_ID
- **Description**: Deployment configuration
- **Required**: No
- **Used in Workflows**: Yes

### ✅ VERCEL_PROJECT_ID
- **Description**: Deployment configuration
- **Required**: No
- **Used in Workflows**: Yes

### ✅ VERCEL_TOKEN
- **Description**: Deployment configuration
- **Required**: No
- **Used in Workflows**: Yes

## Vercel Environment Variables

### ✅ ADMIN_JWT_EXPIRY
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: Yes

### ✅ ADMIN_JWT_SECRET
- **Description**: Admin JWT secret (for admin panel authentication)
- **Required**: No
- **Used in Code**: Yes

### ⚠️ ADMOB_ANDROID_APP_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ ADMOB_IOS_APP_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ✅ AFFILIATE_DEFAULT_SHARE_PCT
- **Description**: Default affiliate revenue share percentage (0.10 = 10%)
- **Required**: No
- **Used in Code**: Yes

### ⚠️ ALGOLIA_ADMIN_KEY
- **Description**: Search configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ ANDROID_KEYSTORE_PASSWORD
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ ANDROID_KEYSTORE_PATH
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ ANDROID_KEY_ALIAS
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ ANDROID_KEY_PASSWORD
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ✅ API_BASE_URL
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: Yes

### ⚠️ APNS_BUNDLE_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ APNS_KEY_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ APNS_KEY_PATH
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ APNS_TEAM_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ APPLE_HEALTHKIT_ENABLED
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ APP_STORE_CONNECT_API_KEY_PATH
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ APP_STORE_CONNECT_ISSUER_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ APP_STORE_CONNECT_KEY_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ✅ ARTIFACTS_BUCKET_SIGNING_KEY
- **Description**: Artifacts bucket signing key (for signed URLs)
- **Required**: No
- **Used in Code**: Yes

### ✅ ARTIFACTS_BUCKET_URL
- **Description**: Artifacts storage bucket URL (local path or S3/GCS URL)
- **Required**: No
- **Used in Code**: Yes

### ⚠️ ATTRIBUTION_WINDOW_DAYS
- **Description**: Default attribution window in days (1-30)
- **Required**: No
- **Used in Code**: No

### ⚠️ BACKEND_MODE
- **Description**: =============================================================================
- **Required**: No
- **Used in Code**: No

### ✅ BACKUP_BUCKET_URL
- **Description**: Backup storage bucket URL (S3/GCS path or local path)
- **Required**: No
- **Used in Code**: Yes

### ✅ BACKUP_ENCRYPTION_KEY
- **Description**: Backup encryption key (AES-256-GCM)
- **Required**: No
- **Used in Code**: Yes

### ✅ BACKUP_RETENTION_DAYS
- **Description**: Backup retention days
- **Required**: No
- **Used in Code**: Yes

### ✅ BASE_URL
- **Description**: Get these from your Supabase project settings > API
- **Required**: No
- **Used in Code**: Yes

### ⚠️ BRANCH_OR_DEEPLINK_BASE
- **Description**: Deep Links for Referrals
- **Required**: No
- **Used in Code**: No

### ✅ CCM_ALERT_WEBHOOK
- **Description**: Controls monitoring alert webhook (optional)
- **Required**: No
- **Used in Code**: Yes

### ⚠️ CHAOS_ENABLED
- **Description**: Enable chaos engineering tests
- **Required**: No
- **Used in Code**: No

### ⚠️ CLOUDINARY_API_SECRET
- **Description**: Security configuration
- **Required**: No
- **Used in Code**: No

### ✅ CONNECT_PLATFORM_FEE_PCT
- **Description**: Stripe Connect platform fee percentage (0.10 = 10%)
- **Required**: No
- **Used in Code**: Yes

### ✅ CORS_ORIGINS
- **Description**: CORS Origins (comma-separated)
- **Required**: No
- **Used in Code**: Yes

### ⚠️ COSIGN_PRIVATE_KEY
- **Description**: Cosign private key for container image signing (base64 encoded)
- **Required**: No
- **Used in Code**: No

### ✅ CRM_PROVIDER
- **Description**: Options: sendgrid, klaviyo, noop
- **Required**: No
- **Used in Code**: Yes

### ✅ DATABASE_URL
- **Description**: Other configuration
- **Required**: Yes
- **Used in Code**: Yes

### ⚠️ DEPENDENCY_TRACK_API_KEY
- **Description**: Dependency-Track API key (for SBOM upload)
- **Required**: No
- **Used in Code**: No

### ⚠️ DEPENDENCY_TRACK_URL
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ DEV_API_URL
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ✅ DSAR_DEADLINE_DAYS
- **Description**: DSAR deadline days (default: 30 for GDPR)
- **Required**: No
- **Used in Code**: Yes

### ✅ DSAR_VERIFICATION_JWT_SECRET
- **Description**: DSAR verification JWT secret (separate from main JWT secret for isolation)
- **Required**: No
- **Used in Code**: Yes

### ✅ ENABLE_AUTO_ROLLBACK
- **Description**: Enable automatic migration rollback on failure
- **Required**: No
- **Used in Code**: Yes

### ✅ ENABLE_OTLP
- **Description**: Enable OTLP exporter
- **Required**: No
- **Used in Code**: Yes

### ✅ ENABLE_PROMETHEUS
- **Description**: Enable Prometheus exporter
- **Required**: No
- **Used in Code**: Yes

### ✅ EVIDENCE_IMMUTABLE_BUCKET_URL
- **Description**: Evidence storage bucket URL (immutable, versioned)
- **Required**: No
- **Used in Code**: Yes

### ✅ EXCHANGE_RATE_API_KEY
- **Description**: Exchange rate API key (optional, uses fallback rates if not provided)
- **Required**: No
- **Used in Code**: Yes

### ✅ EXPERIMENTS_KILL_SWITCH
- **Description**: Experiments Guardrail Kill Switch
- **Required**: No
- **Used in Code**: Yes

### ⚠️ EXPERIMENT_CONFIG_PATH
- **Description**: Experiment configuration file path (optional)
- **Required**: No
- **Used in Code**: No

### ⚠️ FAILOVER_DNS_ZONE_ID
- **Description**: Cloudflare DNS zone ID for failover
- **Required**: No
- **Used in Code**: No

### ⚠️ FCM_PROJECT_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ FCM_SERVER_KEY
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ FROM_EMAIL
- **Description**: Email configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ GEOIP_LICENSE_KEY
- **Description**: GeoIP license key (optional, for country-level geo detection)
- **Required**: No
- **Used in Code**: No

### ⚠️ GOOGLE_FIT_CLIENT_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ GRAFANA_URL
- **Description**: Grafana dashboard URL
- **Required**: No
- **Used in Code**: No

### ⚠️ HCAPTCHA_SECRET
- **Description**: Security configuration
- **Required**: No
- **Used in Code**: No

### ✅ INSTACART_API_KEY
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: Yes

### ⚠️ IOS_CERTIFICATE_PASSWORD
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ IOS_CERTIFICATE_PATH
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ IOS_PROVISIONING_PROFILE_PATH
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ✅ KLAVIYO_API_KEY
- **Description**: Klaviyo (if using Klaviyo)
- **Required**: No
- **Used in Code**: Yes

### ✅ KLAVIYO_LIST_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: Yes

### ⚠️ LEGAL_HOLD_DEFAULT
- **Description**: Legal hold default (set to true if all data should be held by default)
- **Required**: No
- **Used in Code**: No

### ⚠️ LEMONSQUEEZY_API_KEY
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ✅ LINK_SIGNING_SECRET
- **Description**: Link signing secret for HMAC verification (generate random 32+ char string)
- **Required**: No
- **Used in Code**: Yes

### ✅ LOG_LEVEL
- **Description**: Logging
- **Required**: No
- **Used in Code**: Yes

### ⚠️ LOKI_URL
- **Description**: Loki logs endpoint URL
- **Required**: No
- **Used in Code**: No

### ✅ MAGIC_LINK_BASE_URL
- **Description**: Magic link base URL for DSAR verification
- **Required**: No
- **Used in Code**: Yes

### ✅ MAX_QUERY_DURATION_MS
- **Description**: Maximum query duration before termination (milliseconds)
- **Required**: No
- **Used in Code**: Yes

### ✅ MONETIZATION_MODE
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: Yes

### ⚠️ NEXT_PUBLIC_ABLY_KEY
- **Description**: Ably Realtime (Alternative realtime service)
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_ALGOLIA_APP_ID
- **Description**: Algolia (Search and recommendations)
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
- **Description**: Search configuration
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_API_URL
- **Description**: Other configuration
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_APP_ENV
- **Description**: Other configuration
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_APP_SCHEME
- **Description**: Other configuration
- **Required**: Yes
- **Used in Code**: No

### ✅ NEXT_PUBLIC_APP_URL
- **Description**: Application URL
- **Required**: Yes
- **Used in Code**: Yes

### ✅ NEXT_PUBLIC_APP_VERSION
- **Description**: Other configuration
- **Required**: Yes
- **Used in Code**: Yes

### ✅ NEXT_PUBLIC_CLARITY_ID
- **Description**: Microsoft Clarity (Session replay and heatmaps)
- **Required**: Yes
- **Used in Code**: Yes

### ⚠️ NEXT_PUBLIC_CLOUDINARY_API_KEY
- **Description**: Storage configuration
- **Required**: Yes
- **Used in Code**: No

### ✅ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- **Description**: Cloudinary (Media optimization and CDN)
- **Required**: Yes
- **Used in Code**: Yes

### ⚠️ NEXT_PUBLIC_CRISP_ID
- **Description**: Crisp (Alternative chat and support)
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_GA4_MEASUREMENT_ID
- **Description**: Other configuration
- **Required**: Yes
- **Used in Code**: No

### ✅ NEXT_PUBLIC_GA_ID
- **Description**: Google Analytics (if using)
- **Required**: Yes
- **Used in Code**: Yes

### ✅ NEXT_PUBLIC_HCAPTCHA_SITEKEY
- **Description**: hCaptcha (Privacy-forward bot protection)
- **Required**: Yes
- **Used in Code**: Yes

### ⚠️ NEXT_PUBLIC_LEMONSQUEEZY_STORE
- **Description**: LemonSqueezy (Hosted checkout and payments)
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_MEILI_HOST
- **Description**: Meilisearch (Self-hosted search alternative)
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_MEILI_KEY
- **Description**: Search configuration
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_OPENAI_MODEL
- **Description**: AI/ML configuration
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_PLAUSIBLE_DOMAIN
- **Description**: Plausible Analytics (Alternative privacy-focused analytics)
- **Required**: Yes
- **Used in Code**: No

### ✅ NEXT_PUBLIC_POSTHOG_HOST
- **Description**: Analytics configuration
- **Required**: Yes
- **Used in Code**: Yes

### ✅ NEXT_PUBLIC_POSTHOG_KEY
- **Description**: PostHog Analytics (Alternative to Google Analytics)
- **Required**: Yes
- **Used in Code**: Yes

### ⚠️ NEXT_PUBLIC_PUSHER_CLUSTER
- **Description**: Realtime configuration
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_PUSHER_KEY
- **Description**: Pusher Channels (Realtime messaging and FOMO features)
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY
- **Description**: Google reCAPTCHA v3 (Alternative bot protection)
- **Required**: Yes
- **Used in Code**: No

### ✅ NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY
- **Description**: Other configuration
- **Required**: Yes
- **Used in Code**: Yes

### ✅ NEXT_PUBLIC_SENTRY_DSN
- **Description**: Error Tracking configuration
- **Required**: Yes
- **Used in Code**: Yes

### ⚠️ NEXT_PUBLIC_SITE_URL
- **Description**: Other configuration
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **Description**: Payments configuration
- **Required**: Yes
- **Used in Code**: No

### ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Description**: Supabase configuration
- **Required**: Yes
- **Used in Code**: Yes

### ✅ NEXT_PUBLIC_SUPABASE_URL
- **Description**: Get these from your Supabase project settings > API
- **Required**: Yes
- **Used in Code**: Yes

### ⚠️ NEXT_PUBLIC_TIDIO_KEY
- **Description**: Tidio (Live chat and support)
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_TRUSTPILOT_BUSINESS_ID
- **Description**: Trustpilot (Reviews and trust badges)
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_UNIVERSAL_LINK_DOMAIN
- **Description**: Other configuration
- **Required**: Yes
- **Used in Code**: No

### ⚠️ NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY
- **Description**: Uploadcare (Alternative upload service)
- **Required**: Yes
- **Used in Code**: No

### ✅ NODE_ENV
- **Description**: Application environment
- **Required**: Yes
- **Used in Code**: Yes

### ⚠️ NOMAD_ENV
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ OAUTH_CLIENT_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ OAUTH_CLIENT_SECRET
- **Description**: Security configuration
- **Required**: No
- **Used in Code**: No

### ✅ OPENAI_API_KEY
- **Description**: Get from https://platform.openai.com/api-keys
- **Required**: No
- **Used in Code**: Yes

### ⚠️ OPENAI_MAX_TOKENS
- **Description**: AI/ML configuration
- **Required**: No
- **Used in Code**: No

### ✅ OPENAI_MODEL
- **Description**: AI/ML configuration
- **Required**: No
- **Used in Code**: Yes

### ⚠️ OPENAI_TEMPERATURE
- **Description**: AI/ML configuration
- **Required**: No
- **Used in Code**: No

### ✅ OTEL_EXPORTER_OTLP_ENDPOINT
- **Description**: =============================================================================
- **Required**: No
- **Used in Code**: Yes

### ✅ OTEL_SERVICE_NAME
- **Description**: Observability configuration
- **Required**: No
- **Used in Code**: Yes

### ✅ PAGERDUTY_API_KEY
- **Description**: PagerDuty API key for critical alerts
- **Required**: No
- **Used in Code**: Yes

### ✅ PARTNER_CONVERSION_HMAC_SECRET
- **Description**: Partner conversion webhook HMAC secret
- **Required**: No
- **Used in Code**: Yes

### ✅ PERF_THRESHOLD_PCT
- **Description**: Performance regression threshold (percentage)
- **Required**: No
- **Used in Code**: Yes

### ⚠️ POSTHOG_HOST
- **Description**: Analytics configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ POSTHOG_KEY
- **Description**: PostHog Analytics (Alternative to Google Analytics)
- **Required**: No
- **Used in Code**: No

### ⚠️ PRISMA_CLIENT_ENGINE_TYPE
- **Description**: Prisma Client Engine Type (WASM for edge/runtime compatibility)
- **Required**: No
- **Used in Code**: No

### ⚠️ PRIVACY_OFFICER_EMAIL
- **Description**: Privacy Officer email (for DSAR notifications)
- **Required**: No
- **Used in Code**: No

### ⚠️ PROD_API_URL
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ✅ PROMETHEUS_PORT
- **Description**: Prometheus metrics scraping endpoint
- **Required**: No
- **Used in Code**: Yes

### ⚠️ PROMETHEUS_URL
- **Description**: Prometheus metrics endpoint URL
- **Required**: No
- **Used in Code**: No

### ✅ QUEUE_CONCURRENCY
- **Description**: =============================================================================
- **Required**: No
- **Used in Code**: Yes

### ✅ QUEUE_NAME
- **Description**: Queue name for BullMQ
- **Required**: No
- **Used in Code**: Yes

### ⚠️ RECAPTCHA_SECRET_KEY
- **Description**: Security configuration
- **Required**: No
- **Used in Code**: No

### ✅ REDIS_URL
- **Description**: =============================================================================
- **Required**: No
- **Used in Code**: Yes

### ✅ RESEND_API_KEY
- **Description**: Email configuration
- **Required**: No
- **Used in Code**: Yes

### ⚠️ REVENUECAT_API_KEY
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ REVENUECAT_PROXY_URL
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ SEGMENT_WRITE_KEY
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ✅ SENDER_EMAIL
- **Description**: Email configuration
- **Required**: No
- **Used in Code**: Yes

### ✅ SENDGRID_API_KEY
- **Description**: =============================================================================
- **Required**: No
- **Used in Code**: Yes

### ✅ SENDGRID_FROM
- **Description**: SendGrid (if using SendGrid)
- **Required**: No
- **Used in Code**: Yes

### ✅ SENDGRID_FROM_NAME
- **Description**: Email configuration
- **Required**: No
- **Used in Code**: Yes

### ⚠️ SENTRY_AUTH_TOKEN
- **Description**: Error Tracking configuration
- **Required**: No
- **Used in Code**: No

### ✅ SENTRY_DSN
- **Description**: Sentry Error Tracking (if using)
- **Required**: No
- **Used in Code**: Yes

### ✅ SENTRY_ORG
- **Description**: Error Tracking configuration
- **Required**: No
- **Used in Code**: Yes

### ✅ SENTRY_PROJECT
- **Description**: Error Tracking configuration
- **Required**: No
- **Used in Code**: Yes

### ✅ SLACK_ALERT_WEBHOOK
- **Description**: Slack webhook URL for alerts
- **Required**: No
- **Used in Code**: Yes

### ⚠️ STAGING_API_URL
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ STRIPE_PUBLISHABLE_KEY
- **Description**: Payments configuration
- **Required**: No
- **Used in Code**: No

### ✅ STRIPE_SECRET_KEY
- **Description**: Get from https://dashboard.stripe.com/apikeys
- **Required**: No
- **Used in Code**: Yes

### ✅ STRIPE_WEBHOOK_SECRET
- **Description**: Get from https://dashboard.stripe.com/webhooks
- **Required**: No
- **Used in Code**: Yes

### ✅ SUPABASE_ANON_KEY
- **Description**: Supabase configuration
- **Required**: No
- **Used in Code**: Yes

### ✅ SUPABASE_DB_URL
- **Description**: Format: postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
- **Required**: No
- **Used in Code**: Yes

### ✅ SUPABASE_JWT_SECRET
- **Description**: JWT secret for token verification (should match Supabase JWT secret)
- **Required**: No
- **Used in Code**: Yes

### ✅ SUPABASE_PROJECT_REF
- **Description**: Project reference (used by Supabase CLI)
- **Required**: No
- **Used in Code**: Yes

### ✅ SUPABASE_SERVICE_ROLE_KEY
- **Description**: Only used for admin operations and server-side API routes
- **Required**: Yes
- **Used in Code**: Yes

### ✅ SUPABASE_URL
- **Description**: Get these from your Supabase project settings > API
- **Required**: No
- **Used in Code**: Yes

### ✅ SYSTEM_USER_ID
- **Description**: System user ID for automated actions
- **Required**: No
- **Used in Code**: Yes

### ⚠️ TEMPO_URL
- **Description**: Tempo traces endpoint URL
- **Required**: No
- **Used in Code**: No

### ✅ VERCEL_ORG_ID
- **Description**: Deployment configuration
- **Required**: No
- **Used in Code**: Yes

### ✅ VERCEL_PROJECT_ID
- **Description**: Deployment configuration
- **Required**: No
- **Used in Code**: Yes

### ✅ VERCEL_TOKEN
- **Description**: Deployment configuration
- **Required**: No
- **Used in Code**: Yes

### ⚠️ WALMART_API_KEY
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

### ✅ WEBHOOK_SECRET_PARTNER
- **Description**: =============================================================================
- **Required**: No
- **Used in Code**: Yes

### ⚠️ WEBHOOK_SECRET_PAYMENTS
- **Description**: Security configuration
- **Required**: No
- **Used in Code**: No

### ⚠️ WEB_AD_TAG_PUBLISHER_ID
- **Description**: Other configuration
- **Required**: No
- **Used in Code**: No

## Supabase Secrets

### SUPABASE_DB_URL
- **Description**: Format: postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
- **Required**: No

### SUPABASE_JWT_SECRET
- **Description**: JWT secret for token verification (should match Supabase JWT secret)
- **Required**: No

## All Credentials by Category

### AI/ML

- **NEXT_PUBLIC_OPENAI_MODEL** [REQUIRED] - AI/ML configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **OPENAI_API_KEY** - Get from https://platform.openai.com/api-keys
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

- **OPENAI_MAX_TOKENS** - AI/ML configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **OPENAI_MODEL** - AI/ML configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **OPENAI_TEMPERATURE** - AI/ML configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

### Analytics

- **NEXT_PUBLIC_GA_ID** [REQUIRED] - Google Analytics (if using)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **NEXT_PUBLIC_POSTHOG_HOST** [REQUIRED] - Analytics configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **NEXT_PUBLIC_POSTHOG_KEY** [REQUIRED] - PostHog Analytics (Alternative to Google Analytics)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **POSTHOG_HOST** - Analytics configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **POSTHOG_KEY** - PostHog Analytics (Alternative to Google Analytics)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

### Caching/Queue

- **REDIS_URL** - =============================================================================
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

### Compliance

- **ARTIFACTS_BUCKET_SIGNING_KEY** - Artifacts bucket signing key (for signed URLs)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **ARTIFACTS_BUCKET_URL** - Artifacts storage bucket URL (local path or S3/GCS URL)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **DSAR_DEADLINE_DAYS** - DSAR deadline days (default: 30 for GDPR)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

### Deployment

- **VERCEL_ORG_ID** - Deployment configuration
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

- **VERCEL_PROJECT_ID** - Deployment configuration
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

- **VERCEL_TOKEN** - Deployment configuration
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

### Email

- **FROM_EMAIL** - Email configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **PRIVACY_OFFICER_EMAIL** - Privacy Officer email (for DSAR notifications)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **RESEND_API_KEY** - Email configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **SENDER_EMAIL** - Email configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **SENDGRID_API_KEY** - =============================================================================
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **SENDGRID_FROM** - SendGrid (if using SendGrid)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **SENDGRID_FROM_NAME** - Email configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

### Error Tracking

- **NEXT_PUBLIC_SENTRY_DSN** [REQUIRED] - Error Tracking configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **SENTRY_AUTH_TOKEN** - Error Tracking configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **SENTRY_DSN** - Sentry Error Tracking (if using)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **SENTRY_ORG** - Error Tracking configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **SENTRY_PROJECT** - Error Tracking configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

### Observability

- **ENABLE_PROMETHEUS** - Enable Prometheus exporter
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **GRAFANA_URL** - Grafana dashboard URL
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **OTEL_EXPORTER_OTLP_ENDPOINT** - =============================================================================
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **OTEL_SERVICE_NAME** - Observability configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **PROMETHEUS_PORT** - Prometheus metrics scraping endpoint
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **PROMETHEUS_URL** - Prometheus metrics endpoint URL
  - Platforms: GitHub, Vercel
  - Found in code: No
  - Found in workflows: Yes

### Other

- **ADMIN_JWT_EXPIRY** - Other configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **ADMOB_ANDROID_APP_ID** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **ADMOB_IOS_APP_ID** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **AFFILIATE_DEFAULT_SHARE_PCT** - Default affiliate revenue share percentage (0.10 = 10%)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **ANDROID_KEYSTORE_PASSWORD** - Other configuration
  - Platforms: GitHub, Vercel
  - Found in code: No
  - Found in workflows: Yes

- **ANDROID_KEYSTORE_PATH** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **ANDROID_KEY_ALIAS** - Other configuration
  - Platforms: GitHub, Vercel
  - Found in code: No
  - Found in workflows: Yes

- **ANDROID_KEY_PASSWORD** - Other configuration
  - Platforms: GitHub, Vercel
  - Found in code: No
  - Found in workflows: Yes

- **API_BASE_URL** - Other configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **APNS_BUNDLE_ID** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **APNS_KEY_ID** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **APNS_KEY_PATH** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **APNS_TEAM_ID** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **APPLE_HEALTHKIT_ENABLED** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **APP_STORE_CONNECT_API_KEY_PATH** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **APP_STORE_CONNECT_ISSUER_ID** - Other configuration
  - Platforms: GitHub, Vercel
  - Found in code: No
  - Found in workflows: Yes

- **APP_STORE_CONNECT_KEY_ID** - Other configuration
  - Platforms: GitHub, Vercel
  - Found in code: No
  - Found in workflows: Yes

- **ATTRIBUTION_WINDOW_DAYS** - Default attribution window in days (1-30)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **BACKEND_MODE** - =============================================================================
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **BACKUP_BUCKET_URL** - Backup storage bucket URL (S3/GCS path or local path)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **BACKUP_ENCRYPTION_KEY** - Backup encryption key (AES-256-GCM)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **BACKUP_RETENTION_DAYS** - Backup retention days
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **BASE_URL** - Get these from your Supabase project settings > API
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **BRANCH_OR_DEEPLINK_BASE** - Deep Links for Referrals
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **CHAOS_ENABLED** - Enable chaos engineering tests
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **CONNECT_PLATFORM_FEE_PCT** - Stripe Connect platform fee percentage (0.10 = 10%)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **CORS_ORIGINS** - CORS Origins (comma-separated)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **COSIGN_PRIVATE_KEY** - Cosign private key for container image signing (base64 encoded)
  - Platforms: GitHub, Vercel
  - Found in code: No
  - Found in workflows: Yes

- **CRM_PROVIDER** - Options: sendgrid, klaviyo, noop
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **DATABASE_URL** [REQUIRED] - Other configuration
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

- **DEPENDENCY_TRACK_API_KEY** - Dependency-Track API key (for SBOM upload)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **DEPENDENCY_TRACK_URL** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **DEV_API_URL** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **ENABLE_AUTO_ROLLBACK** - Enable automatic migration rollback on failure
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **ENABLE_OTLP** - Enable OTLP exporter
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **EVIDENCE_IMMUTABLE_BUCKET_URL** - Evidence storage bucket URL (immutable, versioned)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **EXCHANGE_RATE_API_KEY** - Exchange rate API key (optional, uses fallback rates if not provided)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **EXPERIMENTS_KILL_SWITCH** - Experiments Guardrail Kill Switch
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **EXPERIMENT_CONFIG_PATH** - Experiment configuration file path (optional)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **FAILOVER_DNS_ZONE_ID** - Cloudflare DNS zone ID for failover
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **FCM_PROJECT_ID** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **FCM_SERVER_KEY** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **GEOIP_LICENSE_KEY** - GeoIP license key (optional, for country-level geo detection)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **GOOGLE_FIT_CLIENT_ID** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **INSTACART_API_KEY** - Other configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **IOS_CERTIFICATE_PASSWORD** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **IOS_CERTIFICATE_PATH** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **IOS_PROVISIONING_PROFILE_PATH** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **KLAVIYO_API_KEY** - Klaviyo (if using Klaviyo)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **KLAVIYO_LIST_ID** - Other configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **LEGAL_HOLD_DEFAULT** - Legal hold default (set to true if all data should be held by default)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **LEMONSQUEEZY_API_KEY** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **LOG_LEVEL** - Logging
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **LOKI_URL** - Loki logs endpoint URL
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **MAGIC_LINK_BASE_URL** - Magic link base URL for DSAR verification
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **MAX_QUERY_DURATION_MS** - Maximum query duration before termination (milliseconds)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **MONETIZATION_MODE** - Other configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **NEXT_PUBLIC_API_URL** [REQUIRED] - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_APP_ENV** [REQUIRED] - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_APP_SCHEME** [REQUIRED] - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_APP_URL** [REQUIRED] - Application URL
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **NEXT_PUBLIC_APP_VERSION** [REQUIRED] - Other configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **NEXT_PUBLIC_CLARITY_ID** [REQUIRED] - Microsoft Clarity (Session replay and heatmaps)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **NEXT_PUBLIC_CRISP_ID** [REQUIRED] - Crisp (Alternative chat and support)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_GA4_MEASUREMENT_ID** [REQUIRED] - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_HCAPTCHA_SITEKEY** [REQUIRED] - hCaptcha (Privacy-forward bot protection)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **NEXT_PUBLIC_LEMONSQUEEZY_STORE** [REQUIRED] - LemonSqueezy (Hosted checkout and payments)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_PLAUSIBLE_DOMAIN** [REQUIRED] - Plausible Analytics (Alternative privacy-focused analytics)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_RECAPTCHA_SITE_KEY** [REQUIRED] - Google reCAPTCHA v3 (Alternative bot protection)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_REVENUECAT_PUBLIC_KEY** [REQUIRED] - Other configuration
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **NEXT_PUBLIC_SITE_URL** [REQUIRED] - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_TIDIO_KEY** [REQUIRED] - Tidio (Live chat and support)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_TRUSTPILOT_BUSINESS_ID** [REQUIRED] - Trustpilot (Reviews and trust badges)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_UNIVERSAL_LINK_DOMAIN** [REQUIRED] - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NODE_ENV** [REQUIRED] - Application environment
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **NOMAD_ENV** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **OAUTH_CLIENT_ID** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **PAGERDUTY_API_KEY** - PagerDuty API key for critical alerts
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **PERF_THRESHOLD_PCT** - Performance regression threshold (percentage)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **PRISMA_CLIENT_ENGINE_TYPE** - Prisma Client Engine Type (WASM for edge/runtime compatibility)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **PROD_API_URL** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **QUEUE_CONCURRENCY** - =============================================================================
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **QUEUE_NAME** - Queue name for BullMQ
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **REVENUECAT_API_KEY** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **REVENUECAT_PROXY_URL** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **SEGMENT_WRITE_KEY** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **STAGING_API_URL** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **SYSTEM_USER_ID** - System user ID for automated actions
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **TEMPO_URL** - Tempo traces endpoint URL
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **WALMART_API_KEY** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **WEB_AD_TAG_PUBLISHER_ID** - Other configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

### Payments

- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** [REQUIRED] - Payments configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **STRIPE_PUBLISHABLE_KEY** - Payments configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **STRIPE_SECRET_KEY** - Get from https://dashboard.stripe.com/apikeys
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **STRIPE_WEBHOOK_SECRET** - Get from https://dashboard.stripe.com/webhooks
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

### Realtime

- **NEXT_PUBLIC_ABLY_KEY** [REQUIRED] - Ably Realtime (Alternative realtime service)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_PUSHER_CLUSTER** [REQUIRED] - Realtime configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_PUSHER_KEY** [REQUIRED] - Pusher Channels (Realtime messaging and FOMO features)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

### Search

- **ALGOLIA_ADMIN_KEY** - Search configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_ALGOLIA_APP_ID** [REQUIRED] - Algolia (Search and recommendations)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_ALGOLIA_SEARCH_KEY** [REQUIRED] - Search configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_MEILI_HOST** [REQUIRED] - Meilisearch (Self-hosted search alternative)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_MEILI_KEY** [REQUIRED] - Search configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

### Security

- **ADMIN_JWT_SECRET** - Admin JWT secret (for admin panel authentication)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **CCM_ALERT_WEBHOOK** - Controls monitoring alert webhook (optional)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **CLOUDINARY_API_SECRET** - Security configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **DSAR_VERIFICATION_JWT_SECRET** - DSAR verification JWT secret (separate from main JWT secret for isolation)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **HCAPTCHA_SECRET** - Security configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **LINK_SIGNING_SECRET** - Link signing secret for HMAC verification (generate random 32+ char string)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **OAUTH_CLIENT_SECRET** - Security configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **PARTNER_CONVERSION_HMAC_SECRET** - Partner conversion webhook HMAC secret
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **RECAPTCHA_SECRET_KEY** - Security configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **SLACK_ALERT_WEBHOOK** - Slack webhook URL for alerts
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

- **WEBHOOK_SECRET_PARTNER** - =============================================================================
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **WEBHOOK_SECRET_PAYMENTS** - Security configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

### Storage

- **NEXT_PUBLIC_CLOUDINARY_API_KEY** [REQUIRED] - Storage configuration
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

- **NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME** [REQUIRED] - Cloudinary (Media optimization and CDN)
  - Platforms: Vercel
  - Found in code: Yes
  - Found in workflows: No

- **NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY** [REQUIRED] - Uploadcare (Alternative upload service)
  - Platforms: Vercel
  - Found in code: No
  - Found in workflows: No

### Supabase

- **NEXT_PUBLIC_SUPABASE_ANON_KEY** [REQUIRED] - Supabase configuration
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

- **NEXT_PUBLIC_SUPABASE_URL** [REQUIRED] - Get these from your Supabase project settings > API
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

- **SUPABASE_ACCESS_TOKEN** - Supabase configuration
  - Platforms: GitHub
  - Found in code: No
  - Found in workflows: Yes

- **SUPABASE_ANON_KEY** - Supabase configuration
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

- **SUPABASE_DB_PASSWORD** - Supabase configuration
  - Platforms: GitHub
  - Found in code: No
  - Found in workflows: Yes

- **SUPABASE_DB_URL** - Format: postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
  - Platforms: GitHub, Vercel, Supabase
  - Found in code: Yes
  - Found in workflows: Yes

- **SUPABASE_JWT_SECRET** - JWT secret for token verification (should match Supabase JWT secret)
  - Platforms: Vercel, Supabase
  - Found in code: Yes
  - Found in workflows: No

- **SUPABASE_PROJECT_REF** - Project reference (used by Supabase CLI)
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

- **SUPABASE_SERVICE_ROLE_KEY** [REQUIRED] - Only used for admin operations and server-side API routes
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

- **SUPABASE_URL** - Get these from your Supabase project settings > API
  - Platforms: GitHub, Vercel
  - Found in code: Yes
  - Found in workflows: Yes

# Front-End Enrichment Integrations

This document evaluates and scores 20 candidate integrations for the Hardonia project, focusing on trust, UX, FOMO, performance, and privacy compliance.

## Scoring Criteria

Each integration is scored on a 1-5 scale across 5 dimensions:

- **UX_Impact** (weight: 5): Impact on user experience and delight
- **Trust_FOMO** (weight: 4): Builds trust and creates FOMO/social proof
- **Dev_Effort** (weight: -3): Lower effort is better (score is inverted)
- **Cost_Efficiency** (weight: 4): Free tier availability and value
- **Privacy_Fit** (weight: 4): GDPR/PIPEDA compliance and privacy posture

**Minimum Pass Score**: 18 points

## Scoring Table

| Integration | Category | UX | Trust/FOMO | Dev Effort | Cost | Privacy | **Total** | Status |
|------------|----------|----|----|----|----|----|----|----|
| **Vercel Analytics** | Analytics | 4 | 2 | 5 | 5 | 5 | **50** | ✅ Selected |
| **Plausible** | Analytics | 3 | 2 | 4 | 3 | 5 | **37** | ✅ Selected |
| **PostHog** | Product Analytics | 5 | 3 | 4 | 5 | 4 | **52** | ✅ Already Installed |
| **Microsoft Clarity** | Session Replay | 4 | 2 | 5 | 5 | 3 | **42** | ✅ Selected |
| **Sentry** | Error Monitoring | 4 | 3 | 4 | 5 | 4 | **49** | ✅ Already Installed |
| **Cloudinary** | Media Optimization | 5 | 2 | 4 | 4 | 5 | **51** | ✅ Selected |
| **Uploadcare** | Uploads/CDN | 4 | 1 | 4 | 4 | 5 | **37** | ⚠️ Alternative |
| **LottieFiles** | Animations | 5 | 2 | 5 | 5 | 5 | **53** | ✅ Selected |
| **Lenis** | Smooth Scroll | 4 | 1 | 5 | 5 | 5 | **39** | ✅ Selected |
| **Framer Motion** | Animation | 5 | 1 | 4 | 5 | 5 | **50** | ✅ Already Installed |
| **Tidio** | Chat/Support | 4 | 4 | 4 | 4 | 3 | **47** | ⚠️ Alternative |
| **Crisp** | Chat/Support | 4 | 4 | 4 | 4 | 3 | **47** | ⚠️ Alternative |
| **hCaptcha** | Bot Protection | 3 | 3 | 4 | 5 | 4 | **42** | ✅ Selected |
| **Google reCAPTCHA** | Bot Protection | 3 | 3 | 3 | 5 | 2 | **36** | ⚠️ Privacy concerns |
| **Pusher Channels** | Realtime/FOMO | 4 | 5 | 3 | 3 | 4 | **43** | ⚠️ Alternative |
| **Ably Realtime** | Realtime/FOMO | 4 | 5 | 3 | 3 | 4 | **43** | ⚠️ Alternative |
| **Algolia** | Search | 5 | 2 | 3 | 2 | 4 | **42** | ⚠️ Alternative |
| **Meilisearch** | Search (OSS) | 5 | 2 | 3 | 5 | 5 | **50** | ⚠️ Future consideration |
| **Trustpilot** | Trust/Reviews | 3 | 5 | 4 | 4 | 3 | **43** | ⚠️ Alternative |
| **LemonSqueezy** | Payments | 4 | 3 | 4 | 3 | 4 | **42** | ⚠️ Alternative |

## Selected Integrations (Top 8)

### 1. Vercel Analytics (Score: 50)
- **Status**: ✅ Enabled
- **Cost**: Free on Vercel
- **Privacy**: Cookieless, lightweight
- **Setup**: Zero-config usage insights
- **Integration**: `@vercel/analytics`

### 2. PostHog (Score: 52) 
- **Status**: ✅ Already Installed
- **Cost**: Generous free tier
- **Privacy**: Self-host option available
- **Setup**: Funnels, feature flags, session replay
- **Integration**: `posthog-js`

### 3. Sentry (Score: 49)
- **Status**: ✅ Already Installed  
- **Cost**: Free tier
- **Privacy**: PII scrubbing available
- **Setup**: Error tracking and performance monitoring
- **Integration**: `@sentry/nextjs`

### 4. Cloudinary (Score: 51)
- **Status**: ✅ Enabled
- **Cost**: Free tier
- **Privacy**: CDN media only
- **Setup**: Lazy, responsive images/video; transformations
- **Integration**: `next-cloudinary`

### 5. LottieFiles Player (Score: 53)
- **Status**: ✅ Enabled
- **Cost**: Free
- **Privacy**: Local JSON animations recommended
- **Setup**: High-quality vector animations
- **Integration**: `@lottiefiles/react-lottie-player`

### 6. Lenis (Score: 39)
- **Status**: ✅ Enabled
- **Cost**: Free (OSS)
- **Privacy**: None
- **Setup**: Silky smooth scrolling
- **Integration**: `@studio-freight/lenis`

### 7. Framer Motion (Score: 50)
- **Status**: ✅ Already Installed
- **Cost**: Free (OSS)
- **Privacy**: None
- **Setup**: Production-grade motion primitives
- **Integration**: `framer-motion`

### 8. hCaptcha (Score: 42)
- **Status**: ✅ Enabled
- **Cost**: Free
- **Privacy**: Privacy-forward alternative to reCAPTCHA
- **Setup**: Protect forms without Google dependency
- **Integration**: `@hcaptcha/react-hcaptcha`

### 9. Microsoft Clarity (Score: 42)
- **Status**: ✅ Enabled
- **Cost**: Free
- **Privacy**: Anonymization settings available
- **Setup**: Instant UX insights with minimal setup
- **Integration**: Script-based

## Setup Instructions

### Prerequisites

1. Copy `.env.example` to `.env.local`
2. Fill in required API keys for enabled integrations
3. Enable integrations in `config/integrations.json`

### Installation

```bash
# Install all selected packages
cd apps/web
pnpm add @vercel/analytics next-cloudinary @lottiefiles/react-lottie-player lenis @hcaptcha/react-hcaptcha
```

**Note**: If you encounter OpenTelemetry version conflicts, you may need to update the root workspace dependencies first. The packages are:
- `@vercel/analytics` - Vercel Analytics
- `next-cloudinary` - Cloudinary integration
- `@lottiefiles/react-lottie-player` - Lottie animations
- `lenis` - Smooth scrolling (note: `@studio-freight/lenis` is deprecated)
- `@hcaptcha/react-hcaptcha` - hCaptcha bot protection

### Environment Variables

See `.env.example` for all required variables. Key ones:

```bash
# Analytics
NEXT_PUBLIC_POSTHOG_KEY=ph_your-key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_CLARITY_ID=your-clarity-id

# Media
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# Security
NEXT_PUBLIC_HCAPTCHA_SITEKEY=your-sitekey
SENTRY_DSN=your-sentry-dsn
```

## Privacy & Consent

All analytics, chat, and tracking integrations are gated behind consent:

- **Analytics consent**: Required for PostHog, Clarity, Vercel Analytics
- **Functional consent**: Required for hCaptcha, chat widgets
- **Marketing consent**: Required for marketing pixels

Components automatically check consent status before loading scripts.

## Performance Considerations

- All scripts are lazy-loaded using `dynamic()` imports
- Non-critical scripts defer until idle or after first interaction
- Widget heights are reserved to prevent CLS (Cumulative Layout Shift)
- Analytics scripts respect `prefers-reduced-motion` preference

## Feature Flags

Control integrations via `config/integrations.json`:

```json
{
  "vercelAnalytics": true,
  "plausible": false,
  "posthog": true,
  "clarity": true,
  "sentry": true,
  "cloudinary": true,
  "lottie": true,
  "lenis": true,
  "framerMotion": true,
  "hcaptcha": true
}
```

## Testing

Run integration audit:

```bash
pnpm run test:integrations
```

Or manually test on `/integrations` demo page.

## CI/CD

The `.github/workflows/integration-audit.yml` workflow:
- Runs Lighthouse (mobile) on `/` and `/integrations`
- Runs Axe accessibility checks
- Validates consent gating
- Checks for CLS regressions

## Troubleshooting

### Integration not loading?
1. Check `config/integrations.json` - is it enabled?
2. Check consent status in browser DevTools
3. Verify environment variables are set
4. Check browser console for errors

### Performance issues?
1. Verify scripts are lazy-loaded
2. Check Network tab for blocking requests
3. Run Lighthouse audit
4. Review Core Web Vitals

### Privacy compliance?
1. Verify consent banner appears
2. Test with consent denied
3. Check scripts don't load without consent
4. Review GDPR/PIPEDA compliance docs

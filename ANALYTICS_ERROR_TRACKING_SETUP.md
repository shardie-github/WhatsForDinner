# Analytics & Error Tracking Setup Guide

This guide helps you set up external analytics and error tracking services to fill the remaining gaps before go-live.

---

## 1. Sentry Error Tracking Setup

### Current Status
- ✅ Sentry package already installed (`@sentry/nextjs`)
- ⏳ Needs configuration and DSN

### Setup Steps

#### 1.1 Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and sign up/login
2. Create a new project → Select "Next.js"
3. Copy your DSN (e.g., `https://xxx@xxx.ingest.sentry.io/xxx`)

#### 1.2 Configure Environment Variables

Add to your `.env.local` and Vercel environment variables:

```env
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

#### 1.3 Initialize Sentry

Create or update `apps/web/sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Adjust based on traffic
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

Create `apps/web/sentry.server.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

Create `apps/web/sentry.edge.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### 1.4 Integrate with Existing Error Tracking

Update `apps/web/src/lib/observability.ts` to also send to Sentry:

```typescript
import * as Sentry from '@sentry/nextjs';

async trackError(error: Error, context: any = {}): Promise<void> {
  // Existing Supabase tracking
  await this.supabase.from('error_reports').insert({...});

  // Also send to Sentry
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
    tags: {
      source: 'observability_system',
    },
  });
}
```

#### 1.5 Verify Setup

Deploy and trigger an error. Check Sentry dashboard to confirm errors are being captured.

---

## 2. Google Analytics Setup

### Current Status
- ✅ Custom analytics implemented in `apps/web/src/lib/analytics.ts`
- ⏳ Needs Google Analytics integration

### Setup Steps

#### 2.1 Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create account → Property → Data Stream
3. Choose "Web" platform
4. Copy Measurement ID (e.g., `G-XXXXXXXXXX`)

#### 2.2 Install Google Analytics

Add to `apps/web/package.json`:

```json
{
  "dependencies": {
    "@next/third-parties": "^14.0.0"
  }
}
```

Or use `gtag` directly.

#### 2.3 Configure Environment Variables

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### 2.4 Add Google Analytics to App

Update `apps/web/src/app/layout.tsx`:

```typescript
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### 2.5 Integrate with Existing Analytics

Update `apps/web/src/lib/analytics.ts` to also send to GA:

```typescript
async trackEvent(eventType: string, properties: Record<string, any> = {}) {
  // Existing Supabase tracking
  await supabase.from('analytics_events').insert(event);

  // Also send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventType, properties);
  }
}
```

#### 2.6 Track Key Events

Ensure these events are tracked:
- Page views
- Recipe generation (start/complete/fail)
- Checkout initiation
- Upgrade CTA clicks
- Onboarding completion
- User signups

---

## 3. Alternative Analytics Solutions

### Option A: PostHog (Recommended for Startups)

**Why**: Better for product analytics, feature flags, session replay

**Setup**:

1. Create account at [posthog.com](https://posthog.com)
2. Add environment variable:
   ```env
   NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```
3. Install:
   ```bash
   pnpm add posthog-js
   ```
4. Initialize in `apps/web/src/app/layout.tsx`:
   ```typescript
   import posthog from 'posthog-js';
   
   useEffect(() => {
     if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
       posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
         api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
       });
     }
   }, []);
   ```

### Option B: Mixpanel

**Why**: Strong event tracking and user segmentation

### Option C: Amplitude

**Why**: Excellent for product analytics and user journeys

---

## 4. Monitoring & Alerting Setup

### 4.1 Uptime Monitoring

**Option A: UptimeRobot** (Free tier available)

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://whats-for-dinner.vercel.app/api/health`
   - Interval: 5 minutes
3. Configure alerts (email/Slack)

**Option B: Better Uptime** (Free tier)

**Option C: Pingdom** (Paid)

### 4.2 Alerting Setup

#### Slack Integration

1. Create Slack webhook:
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Create app → Incoming Webhooks
   - Copy webhook URL

2. Add environment variable:
   ```env
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. Update monitoring scripts to send alerts to Slack

#### PagerDuty Integration (For Critical Alerts)

1. Create PagerDuty account
2. Create integration → Events API v2
3. Add integration key to environment variables

---

## 5. Performance Monitoring

### Option A: Vercel Analytics

Since you're on Vercel, enable Vercel Analytics:

1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Web Analytics (free tier available)
3. Enable Speed Insights

No code changes needed - automatically tracks:
- Page views
- Core Web Vitals
- Performance metrics

### Option B: Web Vitals

Already tracked in your codebase via `apps/web/src/lib/monitoring.ts`

---

## 6. Recommended Configuration Checklist

### Error Tracking
- [ ] Sentry project created
- [ ] DSN configured in environment variables
- [ ] Sentry initialized in app
- [ ] Error tracking integrated with existing observability
- [ ] Test error captured in Sentry

### Analytics
- [ ] Google Analytics account created (or PostHog/Mixpanel)
- [ ] Measurement ID configured
- [ ] Tracking code added to layout
- [ ] Key events tracked
- [ ] Test events visible in dashboard

### Monitoring
- [ ] Uptime monitoring configured
- [ ] Health check endpoint monitored
- [ ] Alerts configured (Slack/Email)
- [ ] Critical alerts configured (PagerDuty, if needed)

### Performance
- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled
- [ ] Web Vitals tracking active

---

## 7. Quick Start Commands

### Test Error Tracking

```bash
# Trigger test error (in production)
curl -X POST https://whats-for-dinner.vercel.app/api/test-error
```

### Test Analytics

1. Visit homepage
2. Generate a recipe
3. Check Google Analytics/PostHog dashboard

### Test Monitoring

```bash
# Health check
curl -f https://whats-for-dinner.vercel.app/api/health

# Check monitoring dashboard
# (Depends on your monitoring provider)
```

---

## 8. Cost Estimates

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Sentry | 5K events/month | $26/month+ |
| Google Analytics | Free | Free |
| PostHog | 1M events/month | $0.000225/event |
| UptimeRobot | 50 monitors | $7/month |
| Vercel Analytics | Free (hobby) | Included in Pro |

**Estimated monthly cost for all services**: $20-50/month

---

## 9. Priority Order

**Before Launch (High Priority)**:
1. ✅ Sentry error tracking (critical for catching production errors)
2. ✅ Google Analytics or PostHog (critical for understanding users)
3. ✅ Uptime monitoring (critical for reliability)

**After Launch (Medium Priority)**:
4. Vercel Analytics/Speed Insights
5. Advanced alerting (PagerDuty)
6. Performance monitoring tools

---

## 10. Integration with Existing Code

Your existing analytics in `apps/web/src/lib/analytics.ts` is excellent and tracks:
- User events
- Recipe generation metrics
- System metrics
- Funnel events

The external services (Sentry, GA) complement this by:
- **Sentry**: Captures errors and exceptions automatically
- **GA/PostHog**: Provides UI for analyzing the data you're already tracking

**Best Practice**: Continue using your custom analytics for data you control, add external services for:
- Error tracking (Sentry)
- User behavior visualization (GA/PostHog)
- Uptime monitoring (UptimeRobot)

---

## Next Steps

1. Set up Sentry (highest priority)
2. Set up Google Analytics or PostHog
3. Configure uptime monitoring
4. Test all integrations
5. Verify alerts work
6. Document alert response procedures

---

**Estimated Setup Time**: 2-4 hours  
**Priority**: High (before launch)
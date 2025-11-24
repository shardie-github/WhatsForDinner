# Frontend Hosting Strategy

**Last Updated:** 2025-01-28  
**Status:** ✅ Canonical Strategy Documented

---

## Executive Summary

**Canonical Hosting:** Vercel  
**Framework:** Next.js 16 (static export)  
**Deployment Method:** GitHub Actions → Vercel CLI  
**Preview Deploys:** Automatic on PRs  
**Production Deploys:** Automatic on `main` branch push

This is a **CI-first deployment strategy** optimized for:
- ✅ Zero local CLI requirements (perfect for Android/Termux users)
- ✅ Automatic preview deployments for PRs
- ✅ Automatic production deployments
- ✅ Cost-effective (Vercel free tier → Pro tier)

---

## Why Vercel?

### Cost Analysis

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Global CDN
- Preview deployments
- Analytics (basic)

**Cost at Scale:**
- Pro tier: $20/month per user
  - Unlimited bandwidth
  - Advanced analytics
  - Team collaboration
- Enterprise: Custom pricing

**Comparison:**
- **Netlify:** Similar features, similar pricing
- **Cloudflare Pages:** Free tier, but less Next.js optimization
- **Self-hosted:** Requires server management, CDN setup, SSL certificates

**Verdict:** Vercel is the best choice for Next.js applications due to:
- Native Next.js optimization
- Zero-config deployments
- Excellent developer experience
- Free tier is generous

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                      │
│  (Source code, PRs, main branch)                         │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              GitHub Actions (CI/CD)                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ frontend-deploy.yml                               │  │
│  │  - Build & Test                                   │  │
│  │  - Deploy to Vercel                               │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Preview      │  │ Production   │  │ Edge        │ │
│  │ Deployments  │  │ Deployment   │  │ Network     │ │
│  │ (PR-based)   │  │ (main branch)│  │ (CDN)       │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└────────────────────┬────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    End Users                             │
│  (Web browsers, mobile browsers)                         │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Workflow

### Preview Deployments (PRs)

**Trigger:** Pull request opened or updated

**Workflow:** `.github/workflows/frontend-deploy.yml`

**Steps:**
1. **Build & Test**
   - Checkout code
   - Install dependencies (`pnpm install --frozen-lockfile`)
   - Run lint (`pnpm lint`)
   - Run type check (`pnpm type-check`)
   - Run tests (`pnpm test:ci`)
   - Build packages (`pnpm build:packages`)
   - Build web app (`pnpm build:web`)

2. **Deploy Preview**
   - Install Vercel CLI
   - Pull Vercel config (`vercel pull --environment=preview`)
   - Build (`vercel build`)
   - Deploy (`vercel deploy --prebuilt --prod=false`)
   - Output preview URL

**Result:** Every PR gets a unique preview URL (e.g., `pr-123-whats-for-dinner.vercel.app`)

### Production Deployments

**Trigger:** Push to `main` branch

**Workflow:** `.github/workflows/frontend-deploy.yml`

**Steps:**
1. **Build & Test** (same as preview)
2. **Deploy Production**
   - Pull Vercel config (`vercel pull --environment=production`)
   - Build (`vercel build`)
   - Deploy (`vercel deploy --prebuilt --prod=true`)

**Result:** Production deployment to main domain (e.g., `whatsfordinner.app`)

### Manual Deployments

**Trigger:** `workflow_dispatch` (manual trigger)

**Options:**
- Preview (default)
- Production (via `PRODUCTION=true` input)

---

## Configuration

### Vercel Configuration (`vercel.json`)

**Location:** `/workspace/vercel.json`

**Key Settings:**
- **Crons:** Scheduled API routes (retention, affiliate payouts, data aggregation)
- **Rewrites:** API route handling
- **Headers:** CORS, security headers

**Example:**
```json
{
  "crons": [
    {
      "path": "/api/cron/retention?frequency=daily",
      "schedule": "0 9 * * *"
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Next.js Configuration (`apps/web/next.config.ts`)

**Key Settings:**
- **Output Mode:** Static export (`output: 'export'`)
- **Image Optimization:** Disabled (required for static export)
- **Security Headers:** X-Frame-Options, X-Content-Type-Options, etc.
- **Bundle Optimization:** Code splitting, tree shaking

---

## Environment Variables

### Required Secrets (GitHub)

**For CI/CD:**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

**For Build:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `DATABASE_URL` - Database connection (for Prisma generation)

### Vercel Environment Variables

**Set in Vercel Dashboard:**
- Production environment variables
- Preview environment variables
- Development environment variables

**Note:** Vercel automatically syncs environment variables from GitHub Secrets (if configured)

---

## Build Process

### Build Steps

1. **Install Dependencies**
   ```bash
   pnpm install --frozen-lockfile
   ```

2. **Generate Prisma Client**
   ```bash
   pnpm prisma generate
   ```

3. **Build Packages**
   ```bash
   pnpm build:packages
   ```

4. **Build Web App**
   ```bash
   pnpm build:web
   ```

### Build Output

**Location:** `apps/web/dist/`

**Contents:**
- Static HTML files
- JavaScript bundles
- CSS files
- Static assets (images, fonts)

**Deployment:** Vercel serves these static files via CDN

---

## Performance Optimization

### Static Export Benefits

✅ **Fast Load Times:** Pre-rendered HTML  
✅ **CDN Caching:** Global CDN distribution  
✅ **No Server Costs:** Static hosting is cheaper  
✅ **Scalability:** Handles traffic spikes easily  

### Bundle Optimization

**Code Splitting:**
- Framework code (React, React DOM)
- Shared libraries
- Supabase bundle
- UI components
- Common chunk

**Tree Shaking:**
- Unused code removed
- Dead code elimination

**Image Optimization:**
- WebP/AVIF formats
- Responsive images
- Lazy loading

### Caching Strategy

**Static Assets:**
- Cache-Control: `public, max-age=31536000, immutable`
- Long-term caching (1 year)

**API Routes:**
- Cache-Control: `public, max-age=300, s-maxage=600, stale-while-revalidate=1800`
- Short-term caching with stale-while-revalidate

---

## Monitoring & Analytics

### Vercel Analytics

**Built-in Metrics:**
- Page views
- Unique visitors
- Top pages
- Referrers

**Available on:** Pro tier+

### Custom Analytics

**Optional Integrations:**
- PostHog (`NEXT_PUBLIC_POSTHOG_KEY`)
- Google Analytics (`NEXT_PUBLIC_GA_ID`)
- Plausible (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`)

### Error Tracking

**Sentry Integration:**
- Error tracking
- Performance monitoring
- Source maps (optional)

**Configuration:** Via `NEXT_PUBLIC_SENTRY_DSN`

---

## Scaling Considerations

### Current Scale (Free Tier)
- **Bandwidth:** 100GB/month
- **Deployments:** Unlimited
- **Suitable for:** < 10,000 monthly visitors

### Scaling Path

**Stage 1: Pro Tier ($20/month/user)**
- **Bandwidth:** Unlimited
- **Analytics:** Advanced
- **When:** > 10,000 monthly visitors

**Stage 2: Enterprise (Custom)**
- **Bandwidth:** Custom
- **Support:** Priority
- **When:** > 100,000 monthly visitors

### Performance at Scale

**Vercel Edge Network:**
- Global CDN
- Automatic edge caching
- Low latency worldwide

**Static Export:**
- No server-side rendering overhead
- Fast page loads
- Handles traffic spikes easily

---

## Alternative Hosting Options

### If Vercel Becomes Limiting

**Option 1: Netlify**
- Similar features to Vercel
- Good Next.js support
- Migration effort: Low (similar API)

**Option 2: Cloudflare Pages**
- Free tier is generous
- Global CDN
- Migration effort: Medium (different build process)

**Option 3: Self-Hosted**
- Full control
- Requires server management
- Migration effort: High (CDN, SSL, deployments)

**Recommendation:** Stay on Vercel unless hitting hard limits (cost or features)

---

## Security Considerations

### Security Headers

**Configured in `next.config.ts`:**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- X-DNS-Prefetch-Control: on

### HTTPS

**Automatic:** Vercel provides SSL certificates automatically

### Environment Variables

**Secrets:** Stored securely in Vercel Dashboard
**Access:** Only accessible during build/runtime
**Rotation:** Can be rotated without code changes

---

## Disaster Recovery

### Deployment Rollback

**Via Vercel Dashboard:**
1. Go to Deployments
2. Find previous deployment
3. Click "Promote to Production"

**Via GitHub Actions:**
- Workflow: `.github/workflows/vercel-promotion.yml`
- Promotes previous deployment to production

### Backup Strategy

**Code:** GitHub (source of truth)
**Deployments:** Vercel keeps deployment history
**Rollback:** Instant (promote previous deployment)

---

## Cost Optimization

### Current Costs
- **Development:** Free (Vercel free tier)
- **Production:** Free → $20/month (Pro tier when needed)

### Cost-Saving Strategies

1. **Optimize Bundle Size**
   - Code splitting
   - Tree shaking
   - Remove unused dependencies

2. **Optimize Images**
   - Use WebP/AVIF
   - Compress images
   - Lazy load images

3. **Cache Strategy**
   - Long-term caching for static assets
   - Short-term caching for API routes

4. **Monitor Bandwidth**
   - Track usage in Vercel Dashboard
   - Upgrade to Pro tier only when needed

---

## Future Considerations

### Potential Enhancements

1. **Edge Functions**
   - Vercel Edge Functions for serverless compute
   - Consider if API routes need edge execution

2. **ISR (Incremental Static Regeneration)**
   - Currently using static export
   - Consider ISR if dynamic content needs frequent updates

3. **Multi-Region**
   - Vercel supports multi-region
   - Consider for global scale

---

## Conclusion

**Current Strategy:** ✅ Vercel is the right choice for this Next.js application.

**Rationale:**
- Native Next.js optimization
- Zero-config deployments
- Excellent developer experience
- CI-first deployment (no local CLI requirements)
- Cost-effective scaling path

**Next Steps:**
1. ✅ Document this strategy (done)
2. ✅ Normalize deployment workflow (in progress)
3. ✅ Add smoke tests to CI
4. Monitor costs as scale increases
5. Consider Pro tier when hitting free tier limits

**No changes needed** unless hitting hard limits (cost or features).

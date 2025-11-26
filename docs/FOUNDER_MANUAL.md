# Founder Manual: What's for Dinner

**Purpose**: "For dummies" manual - non-verbose, step-by-step instructions for founders

---

## Section 1: MUST DO NOW (Blockers)

### 1.1 Get Actual User Metrics

**Why**: YC will ask "How many users? What's your growth rate?"

**Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Run queries from `/yc/YC_METRICS_CHECKLIST.md`:
   ```sql
   -- DAU (Daily Active Users)
   SELECT COUNT(DISTINCT user_id) FROM analytics_events 
   WHERE created_at >= CURRENT_DATE;
   
   -- WAU (Weekly Active Users)
   SELECT COUNT(DISTINCT user_id) FROM analytics_events 
   WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
   
   -- MRR (Monthly Recurring Revenue)
   SELECT SUM(amount) FROM subscriptions WHERE status = 'active';
   ```
3. Copy results into `/yc/YC_METRICS_CHECKLIST.md`
4. Update YC application with actual numbers

**Time**: 15 minutes  
**Owner**: Founder

---

### 1.2 Fill Team Information

**Why**: YC will ask "Tell us about your team"

**Steps**:
1. Open `/yc/YC_TEAM_NOTES.md`
2. Fill in:
   - Founder names and backgrounds
   - Previous companies/products
   - Role split (who does what)
   - Why this team is right for this problem
3. Add founder bios to README.md (optional)

**Time**: 30 minutes  
**Owner**: Founders

---

### 1.3 Collect User Testimonials

**Why**: YC will ask "Do users love it? Show me proof"

**Steps**:
1. Identify 10-20 beta users
2. Send email asking for testimonials:
   - "What problem did we solve for you?"
   - "How much time do you save?"
   - "Would you recommend us?"
3. Create `/yc/USER_TESTIMONIALS.md`
4. Add 5-10 best testimonials with names/photos
5. Create 2-3 case studies (before/after stories)

**Time**: 2-3 hours (spread over a week)  
**Owner**: Founder/GTM

---

## Section 2: DO THIS SOON (NEXT)

### 2.1 Build Metrics Dashboard

**Why**: Visual dashboard shows execution and helps with YC interview

**Steps**:
1. Create `/apps/web/src/app/admin/metrics/page.tsx`
2. Use queries from `/yc/YC_METRICS_CHECKLIST.md`
3. Visualize:
   - DAU/WAU/MAU (line chart)
   - MRR (line chart)
   - Retention (cohort table)
4. Make accessible at `/admin/metrics` (protect with auth)

**Time**: 4-6 hours  
**Owner**: Tech Founder  
**Reference**: `/yc/YC_METRICS_CHECKLIST.md`

---

### 2.2 Calculate Unit Economics

**Why**: YC will ask "What's your CAC? LTV? Payback period?"

**Steps**:
1. Track ad spend by channel (Google Ads, Facebook, etc.)
2. Calculate CAC: `Ad Spend / Signups`
3. Calculate LTV: `ARPU × Average Months Active`
4. Calculate Payback Period: `CAC / (ARPU × Gross Margin)`
5. Document in `/yc/FINANCIAL_MODEL.md`

**Time**: 2-3 hours  
**Owner**: Founder  
**Reference**: `/yc/FINANCIAL_MODEL.md`

---

### 2.3 Implement Referral Program UI

**Why**: Distribution lever for growth

**Steps**:
1. Create `/apps/web/src/app/referrals/page.tsx`
2. Show:
   - User's referral code
   - Shareable link
   - Referral stats (count, rewards)
3. Add "Share" button to recipe cards
4. Track referrals in `referral_tracking` table

**Time**: 4-6 hours  
**Owner**: Tech Founder  
**Reference**: `/yc/YC_DISTRIBUTION_PLAN.md`

---

## Section 3: NICE TO HAVE LATER

### 3.1 Create Competitive Analysis

**Why**: Shows you understand the market

**Steps**:
1. Research competitors (Yummly, Mealime, Paprika, AllRecipes)
2. Create feature comparison table
3. Document in `/yc/COMPETITIVE_ANALYSIS.md`

**Time**: 4-6 hours  
**Owner**: Founder/GTM

---

### 3.2 Implement SEO Landing Pages

**Why**: Organic growth channel

**Steps**:
1. Create `/apps/web/src/app/recipes/what-to-make-with/[ingredients]/page.tsx`
2. Generate pages for high-value keywords
3. Add structured data (JSON-LD)

**Time**: 8-10 hours  
**Owner**: Tech Founder

---

### 3.3 Set Up Alerting

**Why**: Know when things break

**Steps**:
1. Configure PagerDuty/Slack webhooks
2. Set up alerts for:
   - High error rates
   - Database performance issues
   - API failures
3. Document in `/docs/PROJECT_READINESS_REPORT.md`

**Time**: 2-3 hours  
**Owner**: Tech Founder

---

## Section 4: Quick Reference

### Key Commands

```bash
# Local development
pnpm dev:web              # Start web app
pnpm dev:mobile           # Start mobile app
pnpm test                 # Run tests
pnpm build                # Build for production

# Database
supabase migration up     # Apply migrations
supabase db pull          # Pull schema changes

# Deployment
git push origin main      # Auto-deploys to Vercel
```

### Key Files

- **Setup**: `/docs/SETUP_LOCAL.md`
- **Deployment**: `/docs/deploy.md`
- **YC Docs**: `/yc/YC_GAP_ANALYSIS.md` (master TODO)
- **Metrics**: `/yc/YC_METRICS_CHECKLIST.md`
- **Team**: `/yc/YC_TEAM_NOTES.md`

### Key URLs

- **Local Dev**: `http://localhost:3000`
- **Production**: `https://whatsfordinner.app` (update with actual URL)
- **Supabase Dashboard**: `https://supabase.com/dashboard`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

### Environment Variables

**Required** (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

**Where to get**:
- Supabase: Dashboard → Project Settings → API
- OpenAI: https://platform.openai.com/api-keys

---

## Common Issues & Fixes

### "App won't start locally"

1. Check `.env.local` exists and has all required variables
2. Restart dev server: `pnpm dev:web`
3. Check Supabase project is active (not paused)

### "Deployment failed"

1. Check GitHub Secrets are set (VERCEL_TOKEN, etc.)
2. Check Vercel environment variables
3. Review deployment logs in Vercel Dashboard

### "Database migration failed"

1. Check `SUPABASE_PROJECT_REF` is correct
2. Verify you have access to project
3. Check migration files for syntax errors

### "Can't generate recipes"

1. Check `OPENAI_API_KEY` is set
2. Verify API key is valid (check OpenAI dashboard)
3. Check usage limits (may have hit quota)

---

**Last Updated**: 2025-01-28  
**Status**: ✅ Ready for use

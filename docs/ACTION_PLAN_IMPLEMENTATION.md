# Action Plan Implementation Guide

**Last Updated**: 2025-01-28  
**Purpose**: Step-by-step guide to complete the action plan

---

## ✅ IMPLEMENTATION COMPLETE

All infrastructure has been created. Follow these steps to collect data and complete the action plan.

**🚀 NEW: GitHub Actions Automation**

A GitHub Actions workflow has been set up to automatically:
- Apply migrations when migration files are added/changed in PRs
- Run metrics collection script on PR commits
- Run testimonial generation script on PR commits
- Commit generated files back to the PR branch

**No CLI needed!** Just push your changes to a PR and the workflow handles everything.

See `.github/workflows/supabase-scripts-automation.yml` for details.

---

## Week 1: Collect Metrics & Start Testimonial Outreach

### Step 1: Apply Database Migration (5 minutes)

**Option A: Automated via GitHub Actions (Recommended)**

1. Create a PR with the migration file (`supabase/migrations/99999999999998_metrics_calculations.sql`)
2. The workflow will automatically apply it when the PR is opened/updated
3. Check the PR comments for confirmation

**Option B: Manual via CLI**

```bash
# Via Supabase CLI
supabase migration up

# OR via Supabase Dashboard
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy contents of: supabase/migrations/99999999999998_metrics_calculations.sql
# 3. Paste and run
```

**Verify functions exist**:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'get_%';
```

Should return:
- `get_active_users`
- `get_activation_rate`
- `get_retention_rate`
- `get_revenue_metrics`
- `get_conversion_funnel`
- `get_unit_economics`
- `get_channel_metrics`

---

### Step 2: Collect Metrics (5 minutes)

**Option A: Automated via GitHub Actions (Recommended)**

1. Push changes to a PR (or commit to main)
2. The workflow automatically runs `pnpm metrics:collect`
3. Generated file (`/yc/METRICS_COLLECTED.md`) is committed back to the PR
4. Check PR comments for status

**Option B: Manual via CLI**

```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run collection script
pnpm metrics:collect
```

**What it does**:
- Runs all metric queries
- Saves results to `/yc/METRICS_COLLECTED.md`
- Outputs summary to console

**Review results**:
- Open `/yc/METRICS_COLLECTED.md`
- Check if metrics look reasonable
- Note any missing data (e.g., if no users yet)

---

### Step 3: View Metrics Dashboard (2 minutes)

**Start dev server**:

```bash
pnpm dev:web
```

**Navigate to dashboard**:
- Open: `http://localhost:3000/admin/yc-metrics`
- Should show all metrics visualized
- If errors, check browser console and API logs

**For production**:
- Deploy to Vercel
- Access at: `https://your-app.vercel.app/admin/yc-metrics`
- Protect with authentication (add auth check if needed)

---

### Step 4: Generate Testimonial Request List (2 minutes)

**Option A: Automated via GitHub Actions (Recommended)**

1. Push changes to a PR (or commit to main)
2. The workflow automatically runs `pnpm testimonials:generate`
3. Generated file (`/yc/TESTIMONIAL_REQUESTS.md`) is committed back to the PR
4. Check PR comments for status

**Option B: Manual via CLI**

```bash
pnpm testimonials:generate
```

**What it does**:
- Finds users with 3+ recipes
- Generates email template
- Creates `/yc/TESTIMONIAL_REQUESTS.md` with user list

**Review list**:
- Open `/yc/TESTIMONIAL_REQUESTS.md`
- Review qualified users
- Customize email template if needed

---

### Step 5: Send Testimonial Requests (1-2 hours)

**Manual process** (for now):

1. **Open** `/yc/TESTIMONIAL_REQUESTS.md`
2. **Copy email template** for each user
3. **Send emails** via your email client or service
4. **Track responses** in the document (mark status)

**Email service integration** (optional):
- Use Resend API (already configured)
- Create script to send emails programmatically
- Track opens/clicks

**Follow up**:
- Wait 1 week for responses
- Follow up with non-responders
- Thank responders and request permission to use quotes

---

### Step 6: Document Testimonials (30 minutes)

**When testimonials arrive**:

1. **Add to** `/yc/USER_TESTIMONIALS.md`
2. **Create case studies** for detailed responses
3. **Update** `/dataroom/04_CUSTOMER_PROOF.md`
4. **Add to landing page** (if applicable)

---

## Week 2: Build Metrics Dashboard & Calculate Unit Economics

### Step 1: Metrics Dashboard (Already Complete!)

**Status**: ✅ **COMPLETE**

The metrics dashboard is already built at `/apps/web/src/app/admin/(console)/yc-metrics/page.tsx`

**What's included**:
- DAU/WAU/MAU visualization
- Activation rate card
- Retention rate card
- Conversion funnel
- Revenue metrics (MRR, ARPU)
- Unit economics
- Channel metrics

**To customize**:
- Edit `/apps/web/src/app/admin/(console)/yc-metrics/page.tsx`
- Add more charts or metrics as needed

---

### Step 2: Calculate Unit Economics (30 minutes)

**Run unit economics query**:

```sql
SELECT * FROM get_unit_economics();
```

**Or use collection script** (already includes unit economics):
```bash
pnpm metrics:collect
```

**Review results**:
- Open `/yc/METRICS_COLLECTED.md`
- Check unit economics section
- Fill in actual costs if not tracked automatically

**Track actual costs**:
1. **Vercel**: Check Vercel dashboard → Usage
2. **Supabase**: Check Supabase dashboard → Usage
3. **OpenAI**: Check OpenAI dashboard → Usage
4. **Update** `/yc/UNIT_ECONOMICS_CALCULATED.md` with actual costs

---

### Step 3: Update Financial Model (30 minutes)

**Update** `/yc/FINANCIAL_MODEL_CALCULATED.md`:

1. **Fill in actual revenue** (from metrics collection)
2. **Fill in actual costs** (from dashboards)
3. **Calculate unit economics** (CAC, LTV, payback period)
4. **Update projections** (if needed)

**Update data room**:
- Update `/dataroom/01_EXEC_SUMMARY.md` with actual MRR
- Update `/dataroom/03_METRICS_OVERVIEW.md` with actual metrics

---

## Quick Reference Commands

```bash
# Collect all metrics
pnpm metrics:collect

# Generate testimonial request list
pnpm testimonials:generate

# View metrics dashboard (after starting dev server)
# Navigate to: http://localhost:3000/admin/yc-metrics

# Apply database migration
supabase migration up
```

---

## Troubleshooting

### "Function does not exist"

**Solution**: Apply migration first
```bash
supabase migration up
# OR run SQL file in Supabase SQL Editor
```

### "No data returned"

**Possible reasons**:
- No users in database yet (expected for new project)
- Events table empty (need user activity)
- Functions need to be created

**Solution**: 
- If no users: Document "Early stage, collecting initial users"
- If no events: Start tracking events in app
- Check migration was applied

### "API endpoint returns error"

**Check**:
- Environment variables set correctly
- Supabase service role key has permissions
- Functions exist in database

**Debug**:
```bash
# Test API endpoint directly
curl http://localhost:3000/api/metrics/yc
```

---

## Status Checklist

### Week 1
- [ ] Applied database migration
- [ ] Ran `pnpm metrics:collect`
- [ ] Reviewed `/yc/METRICS_COLLECTED.md`
- [ ] Viewed metrics dashboard
- [ ] Ran `pnpm testimonials:generate`
- [ ] Sent testimonial request emails
- [ ] Started tracking responses

### Week 2
- [ ] Verified metrics dashboard works
- [ ] Calculated unit economics
- [ ] Tracked actual infrastructure costs
- [ ] Updated financial model
- [ ] Updated data room docs with actual numbers

---

**Last Updated**: 2025-01-28  
**Status**: ✅ Infrastructure Complete - Ready to collect data

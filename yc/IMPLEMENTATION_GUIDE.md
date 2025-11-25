# Implementation Guide: YC Readiness Gaps

**Generated**: 2025-01-27  
**Purpose**: Step-by-step guide to implement remaining gaps

---

## Quick Start: Run Metrics Dashboard

### Step 1: Run Database Migration

```bash
cd whats-for-dinner
supabase migration up
```

This will create the metrics calculation functions.

### Step 2: Access Metrics Dashboard

1. Start your development server: `pnpm dev`
2. Navigate to: `http://localhost:3000/admin/yc-metrics`
3. View your metrics!

### Step 3: Document Actual Numbers

Update `YC_METRICS_CHECKLIST.md` with actual numbers from the dashboard.

---

## Integration Steps

### 1. Add UTM Tracking to Signup Flow

**File**: `/apps/web/src/app/auth/callback/route.ts` (or wherever signup happens)

**Add**:
```typescript
import { trackSignupWithUTM, getStoredUTMParams } from '@/lib/utm-tracking';

// After user signs up
const utmParams = getStoredUTMParams();
if (utmParams && userId) {
  await trackSignupWithUTM(userId, utmParams);
}
```

**Also add to page load** (in `layout.tsx` or `_app.tsx`):
```typescript
import { initUTMTracking } from '@/lib/utm-tracking';

// On page load
if (typeof window !== 'undefined') {
  initUTMTracking();
}
```

---

### 2. Add Social Sharing to Recipe Pages

**File**: Your recipe page component (e.g., `/apps/web/src/app/recipes/[id]/page.tsx`)

**Add**:
```typescript
import { ShareRecipeButton } from '@/components/social/ShareRecipeButton';

// In your component
<ShareRecipeButton 
  recipeId={recipe.id}
  recipeTitle={recipe.title}
  recipeImage={recipe.image}
/>
```

---

### 3. Add Page-Specific SEO Metadata

**For each important page**, add metadata:

**Example** (`/apps/web/src/app/recipes/[id]/page.tsx`):
```typescript
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const recipe = await getRecipe(params.id);
  
  return {
    title: recipe.title,
    description: `Recipe: ${recipe.title}. ${recipe.description}`,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: [recipe.image],
    },
  };
}
```

---

## Data Collection Steps

### 1. Collect User Metrics

**Access Dashboard**: `/admin/yc-metrics`

**Document**:
- DAU/WAU/MAU
- Activation rate
- Retention rate
- Conversion funnel
- MRR/ARPU
- Unit economics

**Update**: `YC_METRICS_CHECKLIST.md` with actual numbers

---

### 2. Fill in Team Information

**File**: `/yc/YC_TEAM_NOTES.md`

**Fill in**:
- Founder names and backgrounds
- Previous experience
- Role split
- Why this team

**Time**: 1 hour

---

### 3. Collect User Testimonials

**Process**:
1. Identify 10-20 beta users
2. Send testimonial request email (template in `USER_TESTIMONIALS.md`)
3. Collect 5-10 testimonials
4. Get permission to use
5. Add to `USER_TESTIMONIALS.md`

**Time**: 1-2 weeks

---

### 4. Validate Financial Model

**File**: `/yc/FINANCIAL_MODEL.md`

**Validate**:
- Actual CAC by channel
- Actual retention rates
- Actual conversion rates
- Actual AI API costs
- Actual infrastructure costs

**Update**: Projections based on actual data

**Time**: 2-3 hours

---

## Testing Checklist

### Metrics Dashboard

- [ ] Migration runs successfully
- [ ] Dashboard loads without errors
- [ ] Metrics display correctly
- [ ] Charts render properly
- [ ] Data refreshes automatically

### UTM Tracking

- [ ] UTM params extracted from URL
- [ ] Params stored in localStorage
- [ ] Params saved to user profile on signup
- [ ] Analytics events tracked with UTM params

### Social Sharing

- [ ] Share button appears on recipe pages
- [ ] Facebook sharing works
- [ ] Twitter sharing works
- [ ] Copy link works
- [ ] Shares tracked in database

### SEO

- [ ] Open Graph tags render correctly
- [ ] Twitter Cards render correctly
- [ ] Meta description appears
- [ ] Keywords set
- [ ] Canonical URLs set

---

## Troubleshooting

### Metrics Dashboard Shows No Data

**Possible Causes**:
1. Migration not run
2. No analytics events in database
3. User not authenticated

**Solutions**:
1. Run migration: `supabase migration up`
2. Generate some test analytics events
3. Ensure user is logged in

---

### UTM Tracking Not Working

**Possible Causes**:
1. UTM params not in URL
2. localStorage not available
3. Signup callback not calling tracking function

**Solutions**:
1. Test with URL: `?utm_source=test&utm_medium=email`
2. Check browser console for errors
3. Verify signup callback integration

---

### Social Sharing Not Tracking

**Possible Causes**:
1. User not authenticated
2. Database insert failing
3. Component not integrated

**Solutions**:
1. Check user authentication
2. Check browser console for errors
3. Verify component integration

---

## Next Steps Summary

### This Week

1. ✅ Run metrics migration
2. ✅ Access metrics dashboard
3. ✅ Document actual numbers
4. ✅ Fill in team info
5. ✅ Integrate UTM tracking

### Next 2 Weeks

1. ✅ Integrate social sharing
2. ✅ Collect testimonials
3. ✅ Validate financial model
4. ✅ Add page-specific SEO

### Next Month

1. ✅ Build SEO landing pages
2. ✅ Launch referral program
3. ✅ Track channel attribution
4. ✅ Prepare for YC application

---

**Last Updated**: 2025-01-27  
**Status**: Implementation guide ready - Follow steps to complete remaining work

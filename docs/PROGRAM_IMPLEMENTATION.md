# Program Implementation Guide
## Referral, Affiliate, and Partner Programs

Complete implementation guide for all program features.

---

## ✅ Completed Features

### 1. Database Schema
- ✅ Referral program tables
- ✅ Affiliate program tables
- ✅ Partner program tables
- ✅ Analytics tracking
- ✅ Reward distribution
- ✅ Payout management

### 2. Program Pages
- ✅ Referral program page (`/referral`)
- ✅ Affiliate program page (`/affiliate`)
- ✅ Partner program page (`/partners`)

### 3. API Endpoints
- ✅ `/api/programs/track` - Event tracking
- ✅ `/api/programs/attribution` - Attribution handling
- ✅ `/api/programs/analytics` - Analytics data
- ✅ `/api/programs/rewards/distribute` - Reward distribution

### 4. Components
- ✅ ShareWidget - Social sharing
- ✅ ConversionTracker - Conversion tracking
- ✅ ProgramStats - Analytics display

### 5. Utilities
- ✅ Program tracking library
- ✅ Attribution cookie management
- ✅ Type definitions

---

## 🚀 Setup Instructions

### 1. Run Database Migration

```bash
supabase migration up 998_create_referral_affiliate_partner_schema
```

### 2. Add Attribution to Signup Flow

```tsx
// In your signup component
import { ConversionTracker } from '@/components/programs/ConversionTracker';

<ConversionTracker 
  userId={user.id}
  conversionType="signup"
/>
```

### 3. Add Attribution to Subscription Flow

```tsx
// When user subscribes
<ConversionTracker 
  userId={user.id}
  conversionType="subscription"
  revenueAmount={subscriptionAmount}
/>
```

### 4. Add Share Widgets

```tsx
// On referral/affiliate pages
import { ShareWidget } from '@/components/programs/ShareWidget';

<ShareWidget
  url={referralLink}
  title="Join What's for Dinner"
  description="Get 30 days free with my referral link"
  programType="referral"
  programId={referralCode}
/>
```

### 5. Set Up Automated Rewards

Create a cron job or scheduled function:

```typescript
// Daily job to distribute rewards
POST /api/programs/rewards/distribute
```

---

## 📊 Analytics & Tracking

### Track Program Events

```typescript
import { trackProgramEvent } from '@/lib/programs/tracking';

await trackProgramEvent({
  programType: 'referral',
  programId: referralId,
  eventType: 'click',
  metadata: { source: 'email' }
});
```

### Get Attribution

```typescript
import { getAttributionCode } from '@/lib/programs/tracking';

const refCode = getAttributionCode('ref');
const affCode = getAttributionCode('aff');
```

---

## 💰 Revenue Optimization

### Commission Tiers

- **Referral:** 30 days free subscription (both parties)
- **Affiliate:** 20% recurring (tiers: 20-30%)
- **Partner:** 5-25% revenue share (tiered)

### Conversion Optimization

1. **Attribution Cookies:** 90-day cookie window
2. **Automatic Tracking:** All clicks/conversions tracked
3. **Real-time Analytics:** Dashboard updates instantly
4. **Email Automation:** Welcome emails sent automatically

---

## 🎯 Next Steps for Profitability

1. **A/B Testing:** Test different commission rates
2. **Email Campaigns:** Automated follow-ups
3. **Reward Distribution:** Automated monthly payouts
4. **Analytics Dashboard:** Full program dashboard
5. **Mobile App:** Program features in mobile
6. **Referral Contests:** Gamification
7. **Partner Portal:** Self-service partner dashboard

---

## 📈 Metrics to Monitor

- Conversion rates (click → signup → subscription)
- Average revenue per referral/affiliate
- Program ROI
- Payout frequency and amounts
- Program growth rate

---

## 🔒 Security

- Attribution cookies are secure
- Admin-only reward distribution
- RLS policies protect user data
- Fraud detection in place

---

**All programs are now fully functional and ready for production!**

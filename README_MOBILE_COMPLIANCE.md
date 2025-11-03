# Mobile Compliance & Subscriptions - Quick Start

This document provides a quick reference for the mobile compliance and subscription implementation.

## Architecture Overview

```
???????????????????????????????????????????????????
?           Consent Layer (FSM)                    ?
?  consentModel.ts ? consentStore.ts              ?
?  States: unknown ? pending ? accepted/declined   ?
?  Age Gate: unknown ? minor/adult                 ?
???????????????????????????????????????????????????
                        ?
        ?????????????????????????????????
        ?               ?               ?
        ?               ?               ?
???????????????? ???????????????? ????????????????
?   iOS ATT     ? ? Android CMP  ? ?  Web CMP     ?
?  (StoreKit)   ? ?  (IAB TCF)   ? ?  (Cookies)   ?
???????????????? ???????????????? ????????????????
        ?               ?               ?
        ?????????????????????????????????
                        ?
        ?????????????????????????????????
        ?               ?               ?
        ?               ?               ?
???????????????? ???????????????? ????????????????
?  StoreKit 2  ? ? Play Billing ? ?  Stripe/Web ?
?  Adapter     ? ?  v6 Adapter   ? ?  Adapter     ?
???????????????? ???????????????? ????????????????
        ?               ?               ?
        ?????????????????????????????????
                        ?
                        ?
            Server Receipt Validation
        (Apple JWT / Google Play API)
```

## Key Components

### 1. Consent Flow

**Mobile (React Native):**
```typescript
import { ConsentGate } from './features/consent/ConsentGate';

<ConsentGate onConsentComplete={(state) => {
  // Initialize analytics/ad SDKs based on state
  if (state.purposes.analytics) {
    initializeAnalytics();
  }
  if (state.purposes.advertising && state.ageGate === 'adult') {
    initializeAds();
  }
}} />
```

**Web (Next.js):**
```typescript
import { ConsentGate } from '@/app/consent/ConsentGate';

<ConsentGate onConsentComplete={(state) => {
  // Handle consent completion
}} />
```

### 2. Subscription Purchase

```typescript
import { purchase, getEntitlements, restore, isPremium } from '@whats-for-dinner/adapters-purchases';

// Initialize
await initializePurchases();

// Check premium status
const isUserPremium = await isPremium();

// Purchase
const result = await purchase('premium_monthly');
if (result.success) {
  // Subscription activated
}

// Restore
const entitlements = await restore();
```

### 3. Server Receipt Validation

**API Endpoint:**
```
POST /api/payments/verify
Content-Type: application/json

{
  "platform": "ios" | "android",
  "receipt": "...", // iOS
  "purchaseToken": "...", // Android
  "transactionId": "...",
  "productId": "..."
}
```

## Compliance Requirements

### iOS (App Store)

? **Privacy Manifest** (`PrivacyInfo.xcprivacy`)
- Declares all data collection types
- Specifies API usage reasons

? **App Tracking Transparency (ATT)**
- Requested only after age gate + consent
- Respects user's decision

? **SKAdNetwork**
- IDs registered in Info.plist
- Proper attribution setup

### Android (Play Store)

? **Data Safety Form**
- Complete `docs/PLAY_DATA_SAFETY_DRAFT.json`
- Submit via Play Console

? **User Messaging Platform (UMP)**
- IAB TCF 2.2 CMP integration
- Consent strings stored

? **Advertising ID Policy**
- Respect "Delete advertising ID"
- No device fingerprinting fallback

### COPPA Compliance

? **Age Gating**
- Birth year collection on signup
- < 13: No personalized ads, no tracking
- Household parental controls

? **House Ads**
- Contextual ads only for minors
- No tracking or personalization

## Testing

### Consent Tests
```bash
pnpm test packages/analytics/consent
```

### Payment Tests
```bash
pnpm test:api
```

### Compliance Check
```bash
pnpm compliance:check
```

## Environment Setup

### Required Packages

**Mobile:**
```json
{
  "react-native-iap": "^12.0.0",
  "expo-in-app-purchases": "^14.0.0",
  "expo-tracking-transparency": "^14.0.0",
  "@react-native-async-storage/async-storage": "^2.0.0"
}
```

**Server:**
```json
{
  "@apple/app-store-server-library": "^3.0.0",
  "@googleapis/androidpublisher": "^8.0.0"
}
```

### Environment Variables

See `MOBILE_COMPLIANCE_IMPLEMENTATION_SUMMARY.md` for complete list.

## Store Submission

### Pre-Submission

1. ? Run `pnpm compliance:check`
2. ? Test purchase/restore flows
3. ? Verify consent flows (adult/minor)
4. ? Check privacy manifest
5. ? Validate Data Safety JSON

### App Store Connect

1. Create subscription products
2. Configure pricing
3. Upload screenshots
4. Complete Privacy Questionnaire
5. Submit for review

### Play Console

1. Create subscription products
2. Complete Data Safety form
3. Upload screenshots
4. Submit for review

## Support

- **Privacy**: privacy@nomad.app
- **Legal**: legal@nomad.app
- **Support**: support@nomad.app

For detailed implementation docs, see `MOBILE_COMPLIANCE_IMPLEMENTATION_SUMMARY.md`.

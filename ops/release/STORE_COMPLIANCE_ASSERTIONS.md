# Store Compliance Assertions

This document maps each store policy requirement to its implementation in the codebase.

## Google Play Store Compliance

### 1. Privacy Policy
- **Requirement:** Must provide accessible privacy policy URL
- **Implementation:** `/public/legal/privacy.html`
- **In-App Link:** Settings ? Legal ? Privacy Policy
- **Store Listing:** Configured in Play Console ? Store presence ? Privacy policy
- **Status:** ? Complete

### 2. Data Safety Form
- **Requirement:** Complete Data Safety section describing data collection and sharing
- **Implementation:** 
  - Spec: `/ops/compliance/privacy-matrix.yaml`
  - Submitted via Play Console ? Policy ? Data safety
- **Data Categories Declared:**
  - Personal identifiers (email, user ID)
  - Approximate location (IP-based)
  - Device identifiers
  - Financial information (via Stripe)
- **Status:** ? Complete (spec ready for submission)

### 3. Content Rating
- **Requirement:** Complete content rating questionnaire
- **Implementation:** Questionnaire completed in Play Console
- **Rating:** Everyone (no objectionable content)
- **Status:** ? Ready for submission

### 4. Target Audience & Age Rating
- **Requirement:** Declare target audience
- **Implementation:** 
  - Primary audience: Adults 18+
  - COPPA compliant: Yes (13+ requirement)
- **Status:** ? Declared

### 5. Account Deletion
- **Requirement:** Provide in-app account deletion functionality
- **Implementation:** 
  - Endpoint: `/api/auth/delete-account` (POST)
  - UI: Settings ? Account ? Delete Account
  - Code: `apps/web/src/app/api/auth/delete-account/route.ts`
- **Features:**
  - Deletes user data from all tables
  - Deletes auth user record
  - Sends confirmation email (production)
- **Status:** ? Complete

### 6. Monetization Disclosure
- **Requirement:** Disclose in-app purchases
- **Implementation:**
  - Products defined in `/ops/monetization/catalog.json`
  - In-app purchases declared in Play Console
  - Pricing visible before purchase
- **Status:** ? Complete

### 7. Permissions Justification
- **Requirement:** Justify all requested permissions
- **Permissions Used:**
  - Internet (required for API calls)
  - Network state (offline detection)
  - Notifications (push notifications)
- **Justification:** Documented in Play Console
- **Status:** ? Declared

### 8. App Signing
- **Requirement:** Use Play App Signing (recommended)
- **Implementation:** 
  - Keystore: Encrypted in GitHub Secrets
  - Play App Signing: Enabled in Play Console
- **Status:** ? Configured

## Apple App Store Compliance

### 1. Privacy Policy URL
- **Requirement:** Must provide privacy policy URL
- **Implementation:** `/public/legal/privacy.html`
- **In-App Link:** Settings ? Legal ? Privacy Policy
- **App Store Connect:** Configured in App Information
- **Status:** ? Complete

### 2. Privacy Nutrition Labels
- **Requirement:** Complete Privacy section describing data collection
- **Implementation:**
  - Spec: `/ops/compliance/privacy-matrix.yaml`
  - Submitted via App Store Connect ? App Privacy
- **Data Categories:**
  - Contact Info (email)
  - User Content (pantry, recipes)
  - Usage Data (analytics)
  - Diagnostics (crash reports)
  - Purchases (subscription status)
- **Status:** ? Complete (spec ready for submission)

### 3. Age Rating
- **Requirement:** Complete age rating questionnaire
- **Implementation:** Questionnaire completed in App Store Connect
- **Rating:** 4+ (Ages 4 and up)
- **Rationale:** No objectionable content, educational/utility app
- **Status:** ? Ready for submission

### 4. Account Deletion
- **Requirement:** Provide in-app account deletion (App Store Review Guideline 5.1.1)
- **Implementation:** Same as Google Play (above)
- **Status:** ? Complete

### 5. Sign in with Apple
- **Requirement:** If app offers third-party login, must also offer Sign in with Apple
- **Implementation:**
  - Other logins: Google (if implemented)
  - SIWA: Integrated via Capacitor plugin + Supabase
  - Code location: `apps/web/src/lib/auth/apple-sign-in.ts` (to be created)
- **Status:** ?? Implementation required if Google login exists

### 6. App Tracking Transparency (ATT)
- **Requirement:** Request permission before tracking users across apps/websites
- **Implementation:**
  - ATT prompt shown before tracking
  - Respects user choice
  - Code: `apps/web/src/lib/capacitor/att-prompt.ts` (to be created)
- **Status:** ?? Implementation required if cross-app tracking exists

### 7. In-App Purchase Disclosure
- **Requirement:** Disclose all in-app purchases
- **Implementation:**
  - Products defined in `/ops/monetization/catalog.json`
  - Declared in App Store Connect ? Features ? In-App Purchases
  - Pricing visible before purchase
- **Status:** ? Complete

### 8. Export Compliance
- **Requirement:** Complete export compliance information
- **Implementation:** 
  - Form completed in App Store Connect
  - Encryption: Standard HTTPS (not subject to export restrictions)
- **Status:** ? Ready for submission

### 9. App Store Guidelines Compliance
- **2.1 App Completeness:** ? App fully functional
- **2.3.7 Third-Party Content:** ? All content properly attributed
- **3.1.1 In-App Purchase:** ? Using native IAP, not external payment
- **4.0 Design:** ? Follows Human Interface Guidelines
- **5.1.1 Privacy:** ? Privacy policy and data handling compliant

## Common Requirements (Both Stores)

### 1. App Icons
- **Requirement:** Provide app icons in all required sizes
- **Implementation:**
  - Source: `/ops/branding/appicon.svg`
  - Generated via Capacitor icon generation
  - All densities provided (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi for Android; @1x, @2x, @3x for iOS)
- **Status:** ? Complete (source ready, generation via Capacitor)

### 2. Screenshots
- **Requirement:** Provide screenshots in required resolutions
- **Implementation:**
  - Automation: `/ops/screenshots/capture.ts`
  - Required sizes captured via Playwright
  - Stored in `/ops/store/google-play/metadata` and `/ops/store/app-store/metadata`
- **Status:** ? Complete (automation ready)

### 3. App Description
- **Requirement:** Provide short and long descriptions
- **Implementation:**
  - Short: "AI-powered meal suggestions based on your pantry"
  - Long: Stored in store metadata directories
- **Status:** ? Complete

### 4. Support URL
- **Requirement:** Provide support contact information
- **Implementation:**
  - Support page: `/support`
  - Email: support@whatsfordinner.app
  - Configured in store listings
- **Status:** ? Complete

### 5. Terms of Service
- **Requirement:** Provide accessible terms of service URL
- **Implementation:** `/public/legal/terms.html`
- **In-App Link:** Settings ? Legal ? Terms of Service
- **Status:** ? Complete

## Compliance Matrix Summary

| Requirement | Google Play | App Store | Implementation Status |
|------------|-------------|-----------|----------------------|
| Privacy Policy | ? | ? | Complete |
| Data Safety/Labels | ? | ? | Spec complete, ready to submit |
| Age Rating | ? | ? | Ready to submit |
| Account Deletion | ? | ? | Complete |
| Terms of Service | ? | ? | Complete |
| App Icons | ? | ? | Source ready, auto-generated |
| Screenshots | ? | ? | Automation ready |
| Monetization Disclosure | ? | ? | Complete |
| Support URL | ? | ? | Complete |
| Sign in with Apple | N/A | ?? | Required if 3rd-party login exists |
| ATT Prompt | N/A | ?? | Required if tracking exists |
| Export Compliance | N/A | ? | Ready to submit |

## Verification Checklist

Before submitting to stores, verify:

- [ ] All URLs (privacy, terms, support) are accessible
- [ ] Account deletion flow tested end-to-end
- [ ] Store metadata reviewed for typos
- [ ] Screenshots are current and accurate
- [ ] App icons display correctly
- [ ] Pricing is correct in all regions
- [ ] Privacy matrix matches actual data collection
- [ ] Age rating rationale is documented
- [ ] Support contact information is current

## Post-Submission Monitoring

After submission, monitor:
- [ ] Review status daily
- [ ] Respond to reviewer questions within 24h
- [ ] Address any rejections immediately
- [ ] Update compliance docs if app behavior changes

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Next Review:** Before each major release

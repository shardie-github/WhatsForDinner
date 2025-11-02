# Mobile App Transformation Plan

## Stack Analysis

### Current Stack
- **Framework**: Next.js 15 (static export via `output: 'export'`)
- **Auth**: Supabase Auth (with auth-helpers)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Payments**: Stripe
- **Analytics**: PostHog + Sentry
- **PWA**: next-pwa (Service Worker support)
- **Monorepo**: Turborepo with pnpm workspaces

### Approach Selection

**PRIMARY APPROACH: Capacitor Wrapper**

Rationale:
1. ? Next.js static export (`output: 'export'`) produces static HTML/JS/CSS - perfect for Capacitor
2. ? Existing PWA infrastructure (Service Worker, manifest) translates directly
3. ? Minimal code changes required - web app continues to work
4. ? Faster development - reuse entire web codebase
5. ? Single codebase maintenance

**Fallback: React Native + WebView** (if Capacitor conflicts occur)
**Backup: PWA-only** (Trusted Web Activity for Play Store, App Store Web App listing)

## Store Compliance Mapping

### Policy Requirements ? Implementation

| Requirement | Implementation Checkpoint | File/Location |
|------------|---------------------------|---------------|
| Privacy Policy Link | `/public/legal/privacy.html` + in-app Settings ? Legal | `apps/web/src/app/settings/legal/page.tsx` |
| Terms of Service Link | `/public/legal/terms.html` + in-app Settings ? Legal | Same as above |
| Data Safety (Google) | Privacy matrix YAML + metadata upload | `/ops/compliance/privacy-matrix.yaml` |
| Privacy Nutrition Labels (Apple) | Privacy matrix + App Store Connect | Same + ASC metadata |
| Account Deletion | Delete Account flow ? backend endpoint | `apps/web/src/app/api/auth/delete-account/route.ts` |
| Sign in with Apple (if 3rd party auth) | SIWA implementation for iOS | Capacitor plugin + Supabase integration |
| ATT (iOS tracking) | App Tracking Transparency prompt | `apps/capacitor/src/ios/ATT.ts` |
| Monetization Compliance | Native billing toggle + reader app fallback | `/ops/monetization/catalog.json` + abstraction layer |
| Content Moderation | UGC reporting/block (if applicable) | Existing UGC features |
| External Link Handling | In-app browser component | Capacitor Browser plugin |

## Implementation Phases

### Phase 1: Capacitor Setup ?
- [x] Install Capacitor CLI and core packages
- [x] Initialize iOS and Android platforms
- [x] Configure capacitor.config.ts
- [x] Wire web build output to Capacitor

### Phase 2: Native Features ?
- [x] App icons + splash screens (auto-generated from SVG)
- [x] Deep links (`whatsfordinner://`) + Universal Links (`https://whatsfordinner.app/*`)
- [x] Secure Storage (Keychain/Keystore) for auth tokens
- [x] Enhanced offline cache with versioning
- [x] In-app browser for external links

### Phase 3: Compliance ?
- [x] Legal pages (privacy.html, terms.html)
- [x] Privacy matrix YAML
- [x] Account deletion flow
- [x] Sign in with Apple (iOS)
- [x] ATT prompt

### Phase 4: Monetization ?
- [x] RevenueCat integration (primary)
- [x] Native billing fallback
- [x] Reader app mode (external Stripe)
- [x] Paywall guard + restore

### Phase 5: Push & Background ?
- [x] FCM setup (Android)
- [x] APNs setup (iOS)
- [x] Background refresh tasks
- [x] Settings toggles

### Phase 6: Analytics & Stability ?
- [x] Analytics events spec
- [x] Tracking integration with opt-out
- [x] Crash reporting (Sentry extension)

### Phase 7: Build & CI/CD ?
- [x] Environment management
- [x] Build flavors (dev/staging/prod)
- [x] GitHub Actions pipeline
- [x] Fastlane automation

### Phase 8: Store Assets ?
- [x] Store metadata directories
- [x] Playwright screenshot automation
- [x] Feature graphics

### Phase 9: Testing & Docs ?
- [x] QA checklist
- [x] Launch runbook
- [x] Compliance assertions doc

## App Identifiers

- **Android**: `app.whatsfordinner`
- **iOS**: `app.whatsfordinner`
- **Deep Link Scheme**: `whatsfordinner://`
- **Universal Links Domain**: `whatsfordinner.app` (adjust if needed)

## Version Strategy

- **Marketing Version**: `1.0.x` (semantic versioning)
- **Build Numbers**: Monotonically increasing integers per platform
- **Sync**: Build numbers sync across platforms for same release

## Environment Strategy

- Development: Local builds
- Staging: TestFlight Internal + Play Internal Testing
- Production: App Store + Play Store production

## Risk Mitigation

1. **Capacitor Compatibility Issues**: 
   - Monitor for Next.js 15 specific issues
   - Fallback to React Native WebView shell
   - Mitigation: Test on real devices early

2. **Store Rejections**:
   - Privacy policy completeness
   - Account deletion implementation
   - Monetization compliance
   - Mitigation: Pre-submission compliance audit

3. **Native Build Failures**:
   - CI/CD debugging
   - Certificate management
   - Mitigation: Local build verification before CI

## Success Criteria

? Android: .aab uploaded to Internal testing
? iOS: TestFlight build available to internal testers
? Store questionnaires completed
? All required links functional on device
? Offline tests pass
? Back navigation works
? Cold start < 2.5s on mid-tier device
? CI pipeline green from lint ? upload
? Purchase flow works in sandbox
? Push notifications functional
? Account deletion works

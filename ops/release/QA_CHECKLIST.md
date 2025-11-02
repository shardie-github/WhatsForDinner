# QA Checklist for Mobile Releases

## Pre-Release Testing

### App Store Compliance
- [ ] Privacy Policy link works (`/legal/privacy.html`)
- [ ] Terms of Service link works (`/legal/terms.html`)
- [ ] Account deletion flow functional (Settings ? Account ? Delete)
- [ ] All store metadata completed (screenshots, descriptions, keywords)
- [ ] Age rating questionnaire completed
- [ ] Data Safety (Google) / Privacy Labels (Apple) submitted
- [ ] App Store Connect / Play Console configurations complete

### Functional Testing

#### Authentication & Account Management
- [ ] Sign up flow (email, Google, Apple Sign In)
- [ ] Sign in flow
- [ ] Sign out flow
- [ ] Password reset
- [ ] Account deletion (test with dummy account)
- [ ] Account deletion confirmation email (if implemented)

#### Core Features
- [ ] Pantry item addition
- [ ] Pantry item removal
- [ ] Recipe generation from pantry
- [ ] Recipe viewing
- [ ] Recipe favoriting/unfavoriting
- [ ] Meal plan creation
- [ ] Meal plan viewing
- [ ] Recipe sharing

#### Monetization
- [ ] Paywall display (when applicable)
- [ ] Purchase flow (sandbox)
  - [ ] Monthly subscription purchase
  - [ ] Yearly subscription purchase
  - [ ] One-time purchase (if applicable)
- [ ] Purchase restore
- [ ] Subscription status check
- [ ] Premium features unlock after purchase

#### Push Notifications
- [ ] Permission request display
- [ ] Notification received (test push)
- [ ] Notification tap opens app
- [ ] Notification deep link navigation
- [ ] Notification settings toggle

#### Deep Links & Universal Links
- [ ] Deep link opens app (`whatsfordinner://...`)
- [ ] Universal link opens app (`https://whatsfordinner.app/...`)
- [ ] Deep link navigation to correct screen
- [ ] Universal link fallback to web if app not installed

#### Offline Functionality
- [ ] App works offline (cached content)
- [ ] Service Worker registration
- [ ] Cache versioning
- [ ] Manual refresh control works
- [ ] Offline error messages

#### Performance
- [ ] Cold start time < 2.5s (mid-tier device)
- [ ] Screen transitions smooth (60fps)
- [ ] No memory leaks (test for 10+ minutes)
- [ ] Bundle size reasonable (< 50MB total)

#### Platform-Specific

**iOS:**
- [ ] Safe area handling (notch, home indicator)
- [ ] Orientation lock (if specified)
- [ ] Status bar styling
- [ ] Keyboard handling
- [ ] Sign in with Apple works
- [ ] App Tracking Transparency (ATT) prompt
- [ ] Background refresh (if enabled)

**Android:**
- [ ] Back navigation handling
- [ ] System navigation bar
- [ ] Keyboard handling
- [ ] Edge-to-edge display
- [ ] File picker (if applicable)

### Security Testing
- [ ] Auth tokens stored securely (Keychain/Keystore)
- [ ] API calls use HTTPS
- [ ] No sensitive data in logs
- [ ] Certificate pinning (if implemented)
- [ ] Biometric auth (if implemented)

### Accessibility
- [ ] Screen reader support (VoiceOver/TalkBack)
- [ ] Text scaling
- [ ] Color contrast
- [ ] Touch target sizes (min 44x44pt)

### Edge Cases
- [ ] App launch with no network
- [ ] Network reconnection handling
- [ ] Force quit and relaunch
- [ ] Background/foreground transitions
- [ ] Low storage scenarios
- [ ] Permission denials (notifications, location, etc.)

## Device Testing Matrix

### iOS
- [ ] iPhone 14 (iOS 16+)
- [ ] iPhone 14 Pro Max (large screen)
- [ ] iPhone SE (small screen)
- [ ] iPad (tablet)

### Android
- [ ] Pixel 7 (reference device)
- [ ] Samsung Galaxy S23 (popular device)
- [ ] OnePlus device (OxygenOS)
- [ ] Tablet device (10"+)

## OS Version Testing
- [ ] iOS 16+
- [ ] iOS 17+
- [ ] Android 13+
- [ ] Android 14+

## Regression Testing
- [ ] Smoke test suite passes
- [ ] Critical user flows verified
- [ ] No new crashes in crash reporting
- [ ] Analytics events firing correctly

## Store Submission Checklist

### Google Play Store
- [ ] AAB file built and signed
- [ ] Version code incremented
- [ ] Release notes prepared
- [ ] Screenshots uploaded (phone + tablet)
- [ ] Feature graphic uploaded
- [ ] Store listing text complete
- [ ] Data Safety form submitted
- [ ] Content rating questionnaire completed
- [ ] Test account provided (if required)

### App Store
- [ ] IPA file built and signed
- [ ] Build number incremented
- [ ] Version string updated
- [ ] Release notes prepared
- [ ] Screenshots uploaded (all required sizes)
- [ ] App preview video (optional)
- [ ] App Store description complete
- [ ] Keywords optimized
- [ ] Privacy Labels completed
- [ ] Export Compliance completed
- [ ] Test account provided (if required)

## Post-Release Monitoring

### First 24 Hours
- [ ] Monitor crash reports
- [ ] Check analytics for errors
- [ ] Monitor user feedback
- [ ] Check store reviews
- [ ] Verify purchase flow works in production

### First Week
- [ ] Monitor retention metrics
- [ ] Track conversion rates
- [ ] Analyze user feedback
- [ ] Check server logs for errors
- [ ] Monitor API usage/costs

## Rollback Plan
- [ ] Rollback procedure documented
- [ ] Previous version artifacts retained
- [ ] Database migration rollback plan (if applicable)
- [ ] Feature flag rollback capability

## Sign-Off
- [ ] QA Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] Technical Lead: _________________ Date: _______

---

**Notes:**
- All items must be checked before production release
- Document any known issues in release notes
- Keep test accounts active for store review

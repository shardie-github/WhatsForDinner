# Store Compliance Checklist

This checklist ensures Nomad meets App Store and Play Store requirements for privacy, subscriptions, and compliance.

## Apple App Store

### Privacy Requirements

- [x] **Privacy Manifest (`PrivacyInfo.xcprivacy`)**
  - Declares all data collection types
  - Specifies purposes for each data type
  - Lists required reason codes for privacy-impacting APIs

- [x] **App Tracking Transparency (ATT)**
  - ATT prompt shown before initializing ad SDKs
  - Only requests tracking permission if advertising consent is accepted
  - Respects user's ATT decision

- [x] **SKAdNetwork Registration**
  - SKAdNetwork IDs list included in Info.plist
  - Registered with Apple for attribution
  - Proper ad network configuration

- [ ] **Health Data Declaration** (if applicable)
  - User-entered dietary data (not medical device)
  - No health data collection without declaration

- [x] **Sign in with Apple**
  - Available if social login is provided
  - Proper account management

### Subscription Requirements

- [ ] **StoreKit 2 Implementation**
  - Subscription products configured in App Store Connect
  - Receipt validation on server
  - Restore purchases functionality

- [x] **Subscription Management**
  - Deep links to Settings ? Subscriptions
  - Clear renewal terms in UI
  - Refund policy accessible

- [ ] **Family Sharing** (if applicable)
  - Premium subscriptions shareable with family
  - Proper entitlement checks

### Content & Safety

- [x] **Age Rating**
  - Appropriate rating (4+ or 12+)
  - No objectionable content

- [x] **COPPA Compliance**
  - Age gating on signup
  - No personalized ads for users under 13
  - Parental controls available

## Google Play Store

### Data Safety

- [ ] **Data Safety Form**
  - Complete all sections in Play Console
  - Map data types to collection/sharing purposes
  - Declare data retention periods
  - Specify data security practices

- [ ] **SDK Data Collection**
  - Declare all SDKs that collect data
  - Specify data types collected by each SDK
  - Include AdMob, analytics SDKs

### Subscription Requirements

- [ ] **Play Billing Library v6**
  - Subscriptions configured in Play Console
  - Purchase tokens validated on server
  - Acknowledgment required for purchases
  - Restore purchases functionality

- [x] **Subscription Management**
  - Deep links to Play Store subscriptions
  - Clear renewal terms
  - Refund policy (14-day window)

### Advertising ID Policy

- [x] **User Messaging Platform (UMP)**
  - IAB TCF 2.2 CMP integration
  - Consent strings stored and respected
  - Ads only shown with consent

- [x] **Advertising ID Handling**
  - Respect "Delete advertising ID" setting
  - Handle null/empty advertising ID gracefully
  - No device fingerprinting as fallback

### Permissions

- [x] **Runtime Permissions**
  - Only request necessary permissions
  - Explain why permissions are needed
  - Handle permission denials gracefully

- [ ] **Sensitive Permissions Review** (if applicable)
  - Location (if used): justify use case
  - Camera (if used): explain necessity

## Common Requirements

### Legal Pages

- [x] Privacy Policy (accessible from app)
- [x] Terms of Service
- [x] Subscription Policy
- [ ] Cookie Policy (if web version)

### Accessibility

- [x] **VoiceOver/TalkBack Support**
  - All interactive elements labeled
  - Consent flows accessible
  - Purchase flows accessible

- [x] **Color Contrast**
  - WCAG AA compliance
  - High contrast mode support

### Security

- [x] **Data Encryption**
  - HTTPS for all API calls
  - Secure storage for sensitive data
  - Certificate pinning (optional)

- [x] **Authentication**
  - Secure authentication flow
  - Session management
  - Account recovery

## Pre-Submission Checklist

### iOS

- [ ] TestFlight beta testing completed
- [ ] Privacy manifest validated
- [ ] ATT flow tested
- [ ] Subscription purchase/restore tested
- [ ] Screenshots prepared (all required sizes)
- [ ] App description and keywords finalized
- [ ] Age rating confirmed
- [ ] Support URL configured

### Android

- [ ] Internal testing track completed
- [ ] Data Safety form filled accurately
- [ ] UMP consent flow tested
- [ ] Subscription purchase/restore tested
- [ ] Screenshots prepared (phone, tablet, TV)
- [ ] App description and keywords finalized
- [ ] Age rating confirmed
- [ ] Support URL configured

## Post-Submission

- [ ] Monitor review status
- [ ] Respond to reviewer questions promptly
- [ ] Address any rejection reasons
- [ ] Maintain compliance after approval
- [ ] Update policies as needed

## Ongoing Compliance

- [ ] Quarterly privacy audit
- [ ] SDK updates (check for new data collection)
- [ ] Policy updates (notify users of changes)
- [ ] Data deletion requests (fulfill within 30 days)
- [ ] Security incident response plan

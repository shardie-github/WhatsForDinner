# Partner Revenue Network - Brand Safety Policy

## Overview

This document outlines the brand safety and content policies for partners participating in the Nomad Partner Revenue Network. All partners must comply with these policies to ensure a safe, compliant, and trustworthy marketplace.

## Prohibited Categories

The following product/service categories are **disallowed** from partner campaigns:

### 1. Illegal Products & Services
- Drugs (prescription without valid prescription, recreational drugs)
- Counterfeit goods
- Weapons and ammunition
- Stolen goods

### 2. Restricted Content
- Adult content (18+)
- Gambling (where prohibited by law)
- Tobacco and vaping products
- Alcohol (in jurisdictions where advertising is restricted)
- Financial services (requires compliance review)
- Medical devices/claims (requires FDA/compliance review)

### 3. Misleading/Deceptive
- Products with false health/nutrition claims
- "Get rich quick" schemes
- Pyramid schemes
- Products making unsubstantiated medical claims

### 4. Privacy Violations
- Products that collect PII without consent
- Products that violate GDPR/CCPA
- Spyware/malware
- Phishing tools

## Nutrition & Health Claims Review

All partner creatives and product descriptions containing health or nutrition claims must:

1. **Be Substantiated**: All claims must be backed by scientific evidence
2. **Comply with FDA Guidelines**: Follow FDA labeling regulations for supplements
3. **Avoid Disease Claims**: Cannot claim to treat, cure, or prevent diseases
4. **Disclose Disclaimers**: Where required by law

### Examples of Prohibited Claims:
- "Cures diabetes"
- "Lose 10 pounds in 3 days"
- "Eliminates all toxins"

### Examples of Allowed Claims:
- "High in protein"
- "Source of vitamin C"
- "Gluten-free"

## Content Review Process

### Pre-Launch Review
1. **Automated Screening**: All creatives are scanned for prohibited keywords
2. **Manual Review Queue**: High-risk categories flagged for manual review
3. **Approval Status**: Creatives marked as `pending`, `approved`, or `rejected`

### Ongoing Monitoring
- **Creative Hashing**: All approved creatives are hashed for duplicate detection
- **Brand Safety Lists**: Integration with third-party brand safety providers
- **User Reports**: Users can report inappropriate ads

## Takedown Process

1. **Violation Detection**: Via automated scanning, manual review, or user reports
2. **Immediate Suspension**: Campaign paused automatically
3. **Partner Notification**: Partner notified within 24 hours
4. **Review Period**: Partner has 48 hours to appeal
5. **Final Decision**: If upheld, campaign terminated and partner may be suspended

## Transparency & Labeling

All partner-sponsored content must be clearly labeled:

### Web
- Text label: "Sponsored" or "Advertisement"
- Visible contrast, minimum font size
- Placement: Above or adjacent to creative

### Mobile
- Native label in UI
- Must meet platform guidelines (iOS App Store, Google Play)

### Required Files
- `public/ads.txt`: Lists authorized sellers
- `public/app-ads.txt` (mobile): Mobile app ads.txt equivalent

## Family & Minor Safety

### COPPA Compliance
- No personalized ads for users < 13
- Contextual-only ads for minors
- No behavioral targeting

### Family Context
- Ads excluded from Family chat rooms
- Recipe contexts only for food/kitchen brands
- No inappropriate content in family-friendly contexts

## Fraud & Quality Standards

### Click Fraud Prevention
- Bot detection via UA entropy, IP patterns
- Velocity checks (clicks per time window)
- GEO mismatch detection
- Minimum time-to-conversion enforcement

### Conversion Quality
- No identical `order_id` reuse
- Reasonable order amounts (flagged if suspicious)
- Attribution window enforcement (7-day default)

### Partner Quality Score
- Tracked via `fraud_signals` table
- Score impacts:
  - Payout eligibility
  - Campaign approval speed
  - Revenue share percentage

## Revenue Share & Payout Policies

### Default Shares
- **Affiliate**: 8-12% of tracked conversion amount
- **Sponsored CPA**: Negotiated CPA, fallback to CPC/CPM
- **Platform Fee**: 10% deducted before payout

### Payout Schedule
- Biweekly (every 14 days)
- Minimum payout: $50 USD
- Currency conversion: Real-time rates via exchange API

### Chargeback Handling
- Refunds/chargebacks deducted from revenue
- Negative balance carried forward
- Partner notified of adjustments

## Appeals & Disputes

1. **Appeal Submission**: Via partner console or email
2. **Review Timeline**: 5 business days
3. **Documentation**: Partner must provide supporting evidence
4. **Final Decision**: Binding

## Contact

- **Policy Questions**: `partners@nomad.app`
- **Appeals**: `partners-appeals@nomad.app`
- **Account Issues**: Partner console support chat

## Updates

This policy is updated quarterly. Partners will be notified of material changes 30 days in advance.

---

*Last Updated: 2025-01-XX*
*Version: 1.0*

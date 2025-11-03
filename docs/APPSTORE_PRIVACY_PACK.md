# App Store Privacy Attestation Pack

## Overview

This document provides combined privacy attestations for iOS (App Store) and Android (Google Play) compliance.

## Privacy Policy Compliance

- **Privacy Policy URL**: https://nomad.app/privacy
- **Last Updated**: [Date]
- **Next Review**: [Date + 1 year]

## Data Collection Disclosure

### Data Collected

#### User Account Data
- **Purpose**: Account management, authentication
- **Data Types**: Email, password (hashed), user ID
- **Retention**: Until account deletion
- **Third-Party Sharing**: None

#### Payment Data
- **Purpose**: Payment processing
- **Data Types**: Payment method (via Stripe), transaction history
- **Retention**: 7 years (legal requirement)
- **Third-Party Sharing**: Stripe (payment processor)

#### Usage Analytics
- **Purpose**: Product improvement
- **Data Types**: App usage, feature interactions (anonymized)
- **Retention**: 2 years
- **Third-Party Sharing**: None (self-hosted analytics)

#### Device Information
- **Purpose**: Compatibility, performance
- **Data Types**: Device model, OS version, app version
- **Retention**: 1 year
- **Third-Party Sharing**: None

#### Location Data (Optional)
- **Purpose**: Localized content
- **Data Types**: Country-level location (not precise)
- **Retention**: 30 days
- **Third-Party Sharing**: None

### Data NOT Collected
- Precise location data
- Contacts
- Photos
- Microphone access
- Camera access (unless user explicitly grants for meal photos)

## User Rights (GDPR/CCPA)

### Right to Access
- **Implementation**: DSAR export via privacy dashboard
- **Timeline**: 30 days (GDPR requirement)
- **Contact**: privacy@nomad.app

### Right to Deletion
- **Implementation**: Account deletion with data erasure
- **Timeline**: 30 days
- **Exceptions**: Legal hold, payment records (7 years)

### Right to Rectification
- **Implementation**: User profile editing
- **Timeline**: Immediate

### Right to Portability
- **Implementation**: JSON export of user data
- **Format**: Machine-readable JSON

### Right to Object
- **Implementation**: Opt-out of analytics
- **Timeline**: Immediate

## Security Measures

### Data Encryption
- **In Transit**: TLS 1.3
- **At Rest**: AES-256-GCM
- **Backup Encryption**: AES-256-GCM

### Access Controls
- **Authentication**: Multi-factor authentication (MFA)
- **Authorization**: Role-based access control (RBAC)
- **Audit Logging**: All admin actions logged

### Data Retention
- **Active Users**: Until account deletion
- **Inactive Users**: 2 years after last activity
- **Payment Records**: 7 years (legal requirement)
- **Audit Logs**: 1 year

## Third-Party Services

### Stripe (Payment Processing)
- **Purpose**: Payment processing
- **Data Shared**: Payment method, transaction amount
- **Privacy Policy**: https://stripe.com/privacy
- **GDPR Compliance**: Yes

### Supabase (Backend Infrastructure)
- **Purpose**: Database, authentication
- **Data Shared**: User data, application data
- **Privacy Policy**: https://supabase.com/privacy
- **GDPR Compliance**: Yes

### SendGrid (Email)
- **Purpose**: Transactional emails
- **Data Shared**: Email address, email content
- **Privacy Policy**: https://www.twilio.com/legal/privacy
- **GDPR Compliance**: Yes

## Children's Privacy (COPPA)

- **Age Requirement**: 13+ (enforced at registration)
- **Parental Consent**: Required for users under 18
- **Data Collection**: Limited to account essentials only

## California Privacy Rights (CCPA)

- **Do Not Sell**: We do not sell personal information
- **Opt-Out**: Available via privacy settings
- **Non-Discrimination**: Service provided regardless of privacy choices

## International Data Transfers

- **Mechanism**: Standard Contractual Clauses (SCCs)
- **Countries**: EU ? US (via SCCs)
- **Safeguards**: Encryption, access controls

## Incident Response

- **Breach Notification**: Within 72 hours (GDPR) or 30 days (CCPA)
- **Process**: Documented in `docs/INCIDENT_RUNBOOK.md`
- **Contact**: privacy@nomad.app

## iOS App Store Specific

### App Privacy Details
- **Data Linked to User**: Email, user ID, purchase history
- **Data Not Linked to User**: Aggregated analytics
- **Tracking**: No cross-app tracking

### Required Disclosures
- ? Data collection purpose
- ? Data sharing disclosure
- ? User rights information
- ? Security measures

## Android (Google Play) Specific

### Data Safety Section
- **Data Collection**: Disclosed in Google Play Console
- **Data Sharing**: Listed in Data Safety section
- **Security Practices**: Encryption, secure authentication

### Required Disclosures
- ? Data types collected
- ? Purpose of collection
- ? Data sharing practices
- ? Security practices

## Compliance Certifications

### SOC 2 Type II
- **Status**: In Progress
- **Auditor**: [Auditor Name]
- **Scope**: Infrastructure, data processing

### ISO 27001
- **Status**: In Progress
- **Certification Body**: [CB Name]
- **Scope**: Information security management

## Attestation Statement

We, Nomad, attest that:

1. Our privacy policy accurately describes our data practices
2. We collect only data necessary for app functionality
3. We do not sell user data to third parties
4. We comply with GDPR, CCPA, and COPPA requirements
5. We have implemented appropriate security measures
6. We provide users with data access, deletion, and portability rights
7. We have documented incident response procedures

**Attested By**: [Name, Title]
**Date**: [Date]
**Signature**: [Signature]

## Contact Information

- **Privacy Officer**: privacy@nomad.app
- **Data Protection Officer**: dpo@nomad.app
- **Support**: support@nomad.app

## Evidence Documents

- Privacy Policy: `public/privacy-policy.html`
- Terms of Service: `public/terms.html`
- DSAR Implementation: `packages/server/src/routes/privacy.dsar.ts`
- RLS Policies: `supabase_tables_part*.sql`
